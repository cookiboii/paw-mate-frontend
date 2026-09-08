import { put } from '@vercel/blob';

/**
 * 브라우저 Canvas를 활용하여 고화질 이미지의 해상도와 품질을 웹 최적화 수준으로 압축합니다.
 * @param file 원본 이미지 파일
 * @param maxWidth 최대 너비 (기본 1600px)
 * @param maxHeight 최대 높이 (기본 1600px)
 * @param quality 압축 품질 (0.1 ~ 1.0, 기본 0.85)
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<File> {
  // GIF나 SVG 등 애니메이션/벡터 이미지는 원본 유지
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  // 1MB 이하의 작은 이미지는 이미 최적화되어 있으므로 그대로 반환
  if (file.size <= 1024 * 1024) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // WebP 지원 시 webp로, 아니면 jpeg로 내보내기
        const mimeType = 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file); // 압축 후가 더 크면 원본 유지
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}

/**
 * Vercel Blob(Public Store)에 이미지를 최적화 압축 후 직접 업로드하고 CDN URL을 반환합니다.
 * @param file 업로드할 이미지 File 객체
 * @returns 업로드된 이미지의 Vercel Blob CDN URL (예: https://...public.blob.vercel-storage.com/...)
 */
export async function uploadImageToBlob(file: File): Promise<string> {
  const token =
    (import.meta.env.VITE_BLOB_READ_WRITE_TOKEN as string) ||
    'vercel_blob_rw_jK3opZm80MuGYj9t_1ElO3TZsFbeysHZguA0QrM7qot3Z49';

  try {
    // ⚡ 고해상도 대용량 이미지를 브라우저단에서 사전 압축
    const optimizedFile = await compressImage(file);

    const cleanName = optimizedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `uploads/${Date.now()}-${cleanName}`;

    // 🚀 Public Vercel Blob 스토리지로 직접 업로드
    const blob = await put(uniqueFileName, optimizedFile, {
      access: 'public',
      token: token,
    });

    return blob.url;
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error('이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
  }
}

