/**
 * Browser-side photo prep, before upload.
 *
 * iPhone HEIC photos are decoded here because the server's image library cannot
 * read them, and everything is shrunk to a size that fits in one upload request
 * (Vercel caps request bodies at 4.5 MB). The server does the final resize.
 */

export const MAX_RAW_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const PREP_EDGE = 2560;

export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

function isHeic(file: File): boolean {
  return /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export async function prepareImage(file: File): Promise<Blob> {
  if (file.size > MAX_RAW_BYTES) throw new Error("Photos must be under 25 MB.");
  if (!isHeic(file) && !/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error("Use a JPG, PNG, WebP or iPhone HEIC photo.");
  }

  let source: Blob = file;
  if (isHeic(file)) {
    // Loaded only when needed: the decoder is a couple of megabytes of WebAssembly.
    const { heicTo } = await import("heic-to");
    source = await heicTo({ blob: file, type: "image/jpeg", quality: 0.92 });
  }

  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  const scale = Math.min(1, PREP_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.9, 0.8, 0.7]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= MAX_UPLOAD_BYTES) return blob;
  }
  throw new Error("That photo is too large to upload, even after shrinking it.");
}
