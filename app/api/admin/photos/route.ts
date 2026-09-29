import { getAdmin, unauthorizedResponse } from "@/lib/admin/session";
import { getStore } from "@/lib/admin/store";
import { PhotoRejected, processEventPhoto } from "@/lib/admin/processImage";
import { MAX_UPLOAD_BYTES } from "@/lib/admin/prepareImage";

/**
 * One photo per request: process it and stage it for the next event save.
 *
 * Photos go up one at a time because Vercel caps a request at 4.5 MB. Nothing
 * is published here; the photo only appears once the event it belongs to is saved.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await getAdmin())) return unauthorizedResponse();

  const store = getStore();
  if (!store) return Response.json({ error: "Saving is not set up on this deployment yet." }, { status: 503 });

  const form = await request.formData().catch(() => null);
  const photo = form?.get("photo");
  if (!(photo instanceof Blob)) return Response.json({ error: "No photo was attached." }, { status: 400 });
  if (photo.size > MAX_UPLOAD_BYTES) return Response.json({ error: "That photo is too large." }, { status: 413 });

  try {
    const { data, width, height, preview } = await processEventPhoto(Buffer.from(await photo.arrayBuffer()));
    const blob = await store.putBlob(data);
    return Response.json({ blob, width, height, bytes: data.length, preview });
  } catch (error) {
    if (error instanceof PhotoRejected) return Response.json({ error: error.message }, { status: 400 });
    console.error(error);
    return Response.json({ error: "The photo could not be processed. Try again." }, { status: 500 });
  }
}
