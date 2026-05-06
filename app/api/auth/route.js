import { BUYER_DATA } from '@/lib/buyerData';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  const { action, id, token, pin } = await request.json();

  const buyer = BUYER_DATA[id];

  if (!buyer || buyer.token !== token) {
    return NextResponse.json({ error: 'Invalid access' }, { status: 401 });
  }

  // URL 검증만 수행하는 경우
  if (action === 'verify') {
    return NextResponse.json({ 
      success: true, 
      buyer: { number: buyer.number } 
    });
  }

  // PIN 로그인 수행
  if (action === 'login') {
    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    const saltedInput = `${token}_${pin}`;
    const hashedInput = crypto.createHash('sha256').update(saltedInput).digest('hex');

    if (hashedInput === buyer.hash) {
      // 실제 운영 환경에서는 여기서 세션 쿠키나 JWT를 발급해야 합니다.
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
