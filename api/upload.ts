import { put } from '@vercel/blob';

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.UPLOAD_ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: '파일이 제공되지 않았습니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
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
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || '이미지 업로드에 실패했습니다.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}
