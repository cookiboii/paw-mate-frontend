import { put } from '@vercel/blob';

/**
 * Vercel Blob(Public Store)에 이미지를 직접 업로드하고 CDN URL을 반환합니다.
 * @param file 업로드할 이미지 File 객체
 * @returns 업로드된 이미지의 Vercel Blob CDN URL (예: https://...public.blob.vercel-storage.com/...)
 */
export async function uploadImageToBlob(file: File): Promise<string> {
  const token =
    (import.meta.env.VITE_BLOB_READ_WRITE_TOKEN as string) ||
    'vercel_blob_rw_jK3opZm80MuGYj9t_1ElO3TZsFbeysHZguA0QrM7qot3Z49';

  const ext = file.name.split('.').pop() || 'jpg';
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFileName = `uploads/${Date.now()}-${cleanName}`;

  try {
    // 🚀 Public Vercel Blob 스토리지로 직접 업로드
    const blob = await put(uniqueFileName, file, {
      access: 'public',
      token: token,
    });

    return blob.url;
  } catch (error) {
    throw new Error('이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
  }
}
