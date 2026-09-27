import sharp from "sharp";

/** Long edge of every published event photo. Plenty for a full-width gallery. */
const MAX_EDGE = 1920;

/** A corner this close to pure black or white is a border worth trimming. */
const BORDER_LUMA = { dark: 24, light: 240 };

export class PhotoRejected extends Error {}

/**
 * Turn an uploaded photo into what the site publishes.
 *
 * The same steps that were done by hand for the first batch of past events:
 * upright it, trim black or white bars off screenshots, fit it inside 1920px
 * and save a compact JPEG. Metadata, including phone GPS, is dropped.
 */
export async function processEventPhoto(
  input: Buffer,
): Promise<{ data: Buffer; width: number; height: number; preview: string }> {
  let upright: Buffer;
  try {
    const meta = await sharp(input).metadata();
    if (!meta.format || !["jpeg", "png", "webp"].includes(meta.format)) {
      throw new PhotoRejected("Upload a JPG, PNG or WebP photo.");
    }
    upright = await sharp(input, { limitInputPixels: 60_000_000 }).rotate().png().toBuffer();
  } catch (error) {
    if (error instanceof PhotoRejected) throw error;
    throw new PhotoRejected("That file could not be read as a photo.");
  }

  const trimmed = await trimBorders(upright);

  const { data, info } = await sharp(trimmed)
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  // A small copy of the finished photo, so the admin sees exactly what will be published.
  const thumb = await sharp(data).resize({ width: 480, height: 480, fit: "inside" }).jpeg({ quality: 70 }).toBuffer();

  return { data, width: info.width, height: info.height, preview: `data:image/jpeg;base64,${thumb.toString("base64")}` };
}

/** Trim solid black or white bars, like a phone screenshot of a portrait photo. */
async function trimBorders(image: Buffer): Promise<Buffer> {
  const corner = await sharp(image).extract({ left: 0, top: 0, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
  const luma = 0.299 * corner[0] + 0.587 * corner[1] + 0.114 * corner[2];
  if (luma > BORDER_LUMA.dark && luma < BORDER_LUMA.light) return image;

  try {
    const { data, info } = await sharp(image).trim({ threshold: 16 }).toBuffer({ resolveWithObject: true });
    const before = await sharp(image).metadata();
    const keptArea = (info.width * info.height) / ((before.width ?? 1) * (before.height ?? 1));
    // Losing most of the frame means the "border" was really the subject, like a night sky.
    return keptArea >= 0.2 ? data : image;
  } catch {
    return image; // A completely uniform image has nothing to trim.
  }
}
