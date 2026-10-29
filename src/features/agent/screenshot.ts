import type { ImageAttachment } from '@/agent/protocol';

/** Longest edge after downscaling: enough to read an error code, small enough to resend each turn. */
const MAX_EDGE_PX = 1280;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const JPEG_QUALITY = 0.85;

/**
 * Turns a dropped, pasted or picked image into a downscaled JPEG for the live agent.
 * Throws an Error with a player-facing message when the file can't be used.
 */
export const prepareScreenshot = async (file: File): Promise<ImageAttachment> => {
  if (!file.type.startsWith('image/')) throw new Error('That file isn’t an image. Attach a PNG or JPEG screenshot.');
  if (file.size > MAX_FILE_BYTES) throw new Error('That image is over 10 MB. Try a smaller screenshot.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const drawing = canvas.getContext('2d');
  if (!drawing) throw new Error('This browser can’t prepare screenshots. Describe what it shows instead.');
  drawing.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  return { name: file.name || 'Screenshot', mediaType: 'image/jpeg', data: dataUrl.slice(dataUrl.indexOf(',') + 1) };
};
