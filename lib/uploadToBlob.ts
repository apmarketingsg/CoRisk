import { put } from '@vercel/blob'

/**
 * Upload a file buffer to Vercel Blob and return its public URL.
 */
export async function uploadToBlob(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const { url } = await put(filename, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  })
  return url
}
