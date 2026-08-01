import { ALBUM5_BUYERS } from '@/lib/album5Buyers';
import { NextResponse } from 'next/server';

// 5집 전용 검증. PIN 단계가 없으므로 토큰 존재 여부만 확인한다.
// 1~4번 앨범은 기존 /api/auth 를 그대로 사용하며 이 라우트와 무관하다.
export async function POST(request) {
  let token;
  try {
    ({ token } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid access' }, { status: 401 });
  }

  if (!token || !ALBUM5_BUYERS[token]) {
    return NextResponse.json({ error: 'Invalid access' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
