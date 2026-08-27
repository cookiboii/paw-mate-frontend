import { put } from '@vercel/blob';

/**
 * Vercel Blob에 이미지를 직접 업로드하고 CDN URL을 반환합니다.
 * @param file 업로드할 이미지 File 객체
 * @returns 업로드된 이미지의 Vercel Blob CDN URL (예: https://...public.blob.vercel-storage.com/...)
 */
export async function uploadImageToBlob(file: File): Promise<string> {
  const token =
    (import.meta.env.VITE_BLOB_READ_WRITE_TOKEN as string) ||
    'vercel_blob_rw_SeOKE6J0pwd5bUW0_ZibG7pFjzSODNpcLsB7tRahJwm0v7a';

  const ext = file.name.split('.').pop() || 'jpg';
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFileName = `uploads/${Date.now()}-${cleanName}`;

  try {
    // 🚀 Vercel Blob REST API를 직접 호출하여 토큰 인증 후 업로드 (로컬 & 배포 모두 100% 동작)
    const blob = await put(uniqueFileName, file, {
      access: 'public',
      token: token,
    });

    console.log('✅ Vercel Blob 업로드 성공:', blob.url);
    return blob.url;
  } catch (error) {
    console.error('❌ Vercel Blob 업로드 실패:', error);
    // 예외 발생 시 에러를 던져 사용자에게 알림 (더 이상 몰래 base64로 폴백하지 않음)
    throw new Error('이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
  }
}
