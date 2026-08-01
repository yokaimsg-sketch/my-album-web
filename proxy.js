import { NextResponse } from "next/server";

// /?id=5&token=... 요청만 골라 /album5 로 내부 리라이트한다.
// 그 외(id=1~4, id 없음)는 손대지 않고 그대로 기존 app/page.js 로 흘려보낸다.
// 리라이트는 서버 측이라 브라우저 주소창은 /?id=5&token=... 그대로 유지되고,
// app/album5/page.js 는 window.location.search 에서 token 을 읽는다.
export default function proxy(request) {
  if (request.nextUrl.searchParams.get("id") !== "5") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/album5"; // 쿼리스트링(id, token)은 그대로 유지된다
  return NextResponse.rewrite(url);
}

// 루트 경로에서만 실행. /api/*, 정적 파일, 다른 라우트는 아예 타지 않는다.
export const config = { matcher: ["/"] };
