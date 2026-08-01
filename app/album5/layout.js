// /album5 라우트 전용 metadata.
// 루트 app/layout.js 의 metadata 는 제목이 "Pro;logue : The First" 로 하드코딩돼 있고,
// Next 가 그 <title> 을 하이드레이션 이후 DOM 에 삽입하기 때문에 page.js 에서
// document.title 을 바꿔봐야 다시 덮인다. 라우트 단위 metadata 로 정공법으로 덮어쓴다.
// 1~4번 앨범은 "/" 라우트라 루트 metadata 를 그대로 쓴다 → 영향 없음.
export const metadata = {
  title: "Messages from Gogh Loving Vincent",
  description: "김중회 쿼텟 정규 5집 · Digital Album Experience",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Messages from Gogh",
  },
};

export default function Album5Layout({ children }) {
  return children;
}
