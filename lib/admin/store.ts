import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Where the admin tool saves its changes.
 *
 * The live site is built from the GitHub repo, and Vercel's filesystem is read
 * only, so in production a save is a commit to the repo, which Vercel then
 * redeploys. In local development, without a token, saves write straight to the
 * working copy instead, so the tool can be tried without touching the real site.
 */

export type FileChange =
  | { path: string; text: string }
  | { path: string; blob: string }
  | { path: string; remove: true };

export type SaveResult = { sha: string };

export interface ContentStore {
  kind: "github" | "local";
  /** Current text of a repo file, plus the version it was read at. */
  readText(filePath: string): Promise<{ text: string; version: string }>;
  /** Repo paths of the files directly inside a directory, at a version. Empty if it does not exist. */
  listDir(dirPath: string, version: string): Promise<string[]>;
  /** Stage a binary file ahead of a commit and return a reference to it. */
  putBlob(data: Buffer): Promise<string>;
  /** Apply every change as one commit on top of `baseVersion`. Throws `SaveConflict` if that is no longer the latest. */
  commit(options: { message: string; baseVersion: string; changes: FileChange[] }): Promise<SaveResult>;
}

/** Someone else saved between our read and our write. Re-read and try again. */
export class SaveConflict extends Error {}

export class StoreError extends Error {}

/* ------------------------------------------------------------------ GitHub */

type GitHubConfig = { token: string; repo: string; branch: string };

class GitHubStore implements ContentStore {
  kind = "github" as const;

  constructor(private config: GitHubConfig) {}

  private async api<T>(route: string, init: RequestInit & { accept?: string } = {}): Promise<T> {
    const response = await fetch(`https://api.github.com/repos/${this.config.repo}${route}`, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: init.accept ?? "application/vnd.github+json",
        Authorization: `Bearer ${this.config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const error = new StoreError(`GitHub ${init.method ?? "GET"} ${route} failed with ${response.status}: ${detail.slice(0, 300)}`);
      (error as StoreError & { status?: number }).status = response.status;
      throw error;
    }
    return (init.accept?.includes("raw") ? response.text() : response.json()) as Promise<T>;
  }

  private async head(): Promise<string> {
    const ref = await this.api<{ object: { sha: string } }>(`/git/ref/heads/${this.config.branch}`);
    return ref.object.sha;
  }

  async readText(filePath: string) {
    const version = await this.head();
    const text = await this.api<string>(`/contents/${encodePath(filePath)}?ref=${version}`, {
      accept: "application/vnd.github.raw+json",
    });
    return { text, version };
  }

  async listDir(dirPath: string, version: string) {
    try {
      const entries = await this.api<{ path: string; type: string }[]>(
        `/contents/${encodePath(dirPath)}?ref=${version}`,
      );
      return Array.isArray(entries) ? entries.filter((entry) => entry.type === "file").map((entry) => entry.path) : [];
    } catch (error) {
      if ((error as { status?: number }).status === 404) return [];
      throw error;
    }
  }

  async putBlob(data: Buffer) {
    const blob = await this.api<{ sha: string }>("/git/blobs", {
      method: "POST",
      body: JSON.stringify({ content: data.toString("base64"), encoding: "base64" }),
    });
    return blob.sha;
  }

  async commit({ message, baseVersion, changes }: { message: string; baseVersion: string; changes: FileChange[] }) {
    const base = await this.api<{ tree: { sha: string } }>(`/git/commits/${baseVersion}`);

    const tree = await this.api<{ sha: string }>("/git/trees", {
      method: "POST",
      body: JSON.stringify({
        base_tree: base.tree.sha,
        tree: changes.map((change) => ({
          path: change.path,
          mode: "100644",
          type: "blob",
          ...("text" in change ? { content: change.text } : "blob" in change ? { sha: change.blob } : { sha: null }),
        })),
      }),
    });

    const commit = await this.api<{ sha: string }>("/git/commits", {
      method: "POST",
      body: JSON.stringify({ message, tree: tree.sha, parents: [baseVersion] }),
    });

    try {
      // Not forced: if the branch moved since we read it, GitHub refuses, and we retry on top.
      await this.api(`/git/refs/heads/${this.config.branch}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
    } catch (error) {
      if ((error as { status?: number }).status !== 422) throw error;
      // 422 means either someone saved first, or branch protection refused the token.
      if ((await this.head()) !== baseVersion) throw new SaveConflict("The branch moved during the save.");
      throw new StoreError(
        `GitHub refused to update ${this.config.branch}. If the branch is protected, allow the admin token to bypass it. ${(error as Error).message}`,
      );
    }

    return { sha: commit.sha };
  }
}

function encodePath(filePath: string): string {
  return filePath.split("/").map(encodeURIComponent).join("/");
}

/* ------------------------------------------------------------------- Local */

const STAGING_DIR = path.join(os.tmpdir(), "bmes-admin-staging");

class LocalStore implements ContentStore {
  kind = "local" as const;

  private resolve(repoPath: string): string {
    const root = process.cwd();
    // Dev only, so keep the bundler from tracing the whole repo into the server build.
    const full = path.resolve(/*turbopackIgnore: true*/ root, repoPath);
    if (!full.startsWith(root + path.sep)) throw new StoreError(`Refusing to touch ${repoPath}, it is outside the repo.`);
    return full;
  }

  async readText(filePath: string) {
    return { text: await fs.readFile(this.resolve(filePath), "utf8"), version: "local" };
  }

  async listDir(dirPath: string) {
    try {
      const entries = await fs.readdir(this.resolve(dirPath), { withFileTypes: true });
      return entries.filter((entry) => entry.isFile()).map((entry) => `${dirPath}/${entry.name}`);
    } catch {
      return [];
    }
  }

  async putBlob(data: Buffer) {
    const id = createHash("sha1").update(data).digest("hex");
    await fs.mkdir(STAGING_DIR, { recursive: true });
    await fs.writeFile(path.join(STAGING_DIR, id), data);
    return id;
  }

  async commit({ changes }: { message: string; baseVersion: string; changes: FileChange[] }) {
    for (const change of changes) {
      const target = this.resolve(change.path);
      if ("remove" in change) {
        await fs.rm(target, { force: true });
        await fs.rmdir(path.dirname(target)).catch(() => {}); // Only succeeds once the folder is empty.
        continue;
      }
      await fs.mkdir(path.dirname(target), { recursive: true });
      if ("text" in change) await fs.writeFile(target, change.text);
      else {
        if (!/^[0-9a-f]{40}$/.test(change.blob)) throw new StoreError("Unknown staged photo.");
        await fs.copyFile(path.join(STAGING_DIR, change.blob), target);
      }
    }
    return { sha: "local" };
  }
}

/* ------------------------------------------------------------------ Choice */

/**
 * The store to save through, or null when saving is not set up.
 *
 * Local file writes are only ever allowed under `next dev`. A production build
 * with no token refuses to save rather than writing somewhere that vanishes.
 */
export function getStore(): ContentStore | null {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    return new GitHubStore({
      token,
      repo: process.env.GITHUB_REPO || "Biomedical-Engineering-Society/BMES-Website",
      branch: process.env.GITHUB_BRANCH || "main",
    });
  }
  if (process.env.NODE_ENV === "development") return new LocalStore();
  return null;
}

/** Vercel's deploy state for a saved commit, for the "Publishing… / Live" banner. */
export async function deployState(sha: string): Promise<"pending" | "success" | "failure" | "unknown"> {
  const token = process.env.GITHUB_TOKEN;
  if (!token || !/^[0-9a-f]{40}$/.test(sha)) return "unknown";

  const repo = process.env.GITHUB_REPO || "Biomedical-Engineering-Society/BMES-Website";
  const response = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}/status`, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return "unknown";

  const body = (await response.json()) as { statuses: { context: string; state: string }[] };
  // Vercel reports on the commit under the "Vercel" context. Until it does, the build is queued.
  const vercel = body.statuses.find((status) => status.context.startsWith("Vercel"));
  if (!vercel) return "pending";
  if (vercel.state === "success") return "success";
  if (vercel.state === "failure" || vercel.state === "error") return "failure";
  return "pending";
}
