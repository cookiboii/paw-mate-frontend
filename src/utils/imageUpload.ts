/**
 * Vercel Serverless Function(/api/upload)을 통해 이미지를 Vercel Blob에 업로드하고 CDN URL을 반환합니다.
 * @param file 업로드할 이미지 File 객체
 * @returns 업로드된 이미지의 Vercel Blob CDN URL
 */
export async function uploadImageToBlob(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `업로드 실패 (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('응답에 이미지 URL이 포함되어 있지 않습니다.');
    }

    return data.url;
  } catch (error) {
    console.warn('Vercel Blob 업로드 실패, Base64로 안전하게 폴백합니다:', error);
    // Vercel 배포 전 로컬 Vite 단독 개발 환경을 위한 Base64 자동 폴백
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
