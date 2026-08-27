import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: '파일이 제공되지 않았습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 파일명 중복 방지를 위한 타임스탬프 기반 고유 파일명 생성
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `uploads/${Date.now()}-${cleanName}`;

    // Vercel Blob에 업로드
    const blob = await put(uniqueFileName, file, {
      access: 'public',
    });

    return new Response(JSON.stringify(blob), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Vercel Blob Upload Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || '이미지 업로드에 실패했습니다.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
