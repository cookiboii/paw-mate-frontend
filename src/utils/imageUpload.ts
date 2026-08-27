import { upload } from '@vercel/blob/client';

/**
 * Vercel Blob에 이미지를 직접 업로드하고 CDN URL을 반환합니다.
 * @param file 업로드할 이미지 File 객체
 * @returns 업로드된 이미지의 Vercel Blob CDN URL
 */
export async function uploadImageToBlob(file: File): Promise<string> {
  const token = (import.meta.env.VITE_BLOB_READ_WRITE_TOKEN as string) || '';
  const ext = file.name.split('.').pop() || 'jpg';
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFileName = `uploads/${Date.now()}-${cleanName}`;

  try {
    // 1. VITE_BLOB_READ_WRITE_TOKEN이 설정되어 있으면 브라우저에서 직접 초고속 업로드
    if (token) {
      const blob = await upload(uniqueFileName, file, {
        access: 'public',
        token: token,
      });
      return blob.url;
    }

    // 2. 토큰이 없는 경우 Vercel Serverless Function(/api/upload)으로 업로드
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `업로드 실패 (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.warn('Vercel Blob 업로드 실패, Base64로 안전하게 폴백합니다:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
