import { getAdmin, unauthorizedResponse } from "@/lib/admin/session";
import { deployState } from "@/lib/admin/store";

/** Whether Vercel has finished deploying a saved commit. */
export async function GET(request: Request): Promise<Response> {
  if (!(await getAdmin())) return unauthorizedResponse();

  const sha = new URL(request.url).searchParams.get("sha") ?? "";
  return Response.json({ state: await deployState(sha) });
}
