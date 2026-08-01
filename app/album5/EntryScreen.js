"use client";

// 5집 입장 화면 — PIN 없이 "입장" 버튼 하나로 들어간다.
// 구매자 번호 자리에 감사 문구가 들어가며, 좁은 화면에서 어색하게 끊기지 않도록
// 자동 줄바꿈에 맡기지 않고 영문 2줄 + 한글 2줄로 명시 분할한다.
export default function EntryScreen({ cover, titleLines, onEnter }) {
  return (
    <div className="overlay fade-in">
      {cover && <img className="a5-entry-cover" src={cover} alt="" />}

      <div className="kicker" style={{ marginBottom: 18 }}>Private Access</div>

      <p className="a5-entry-title">
        {titleLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
      <p className="a5-entry-kr">
        <span>앨범을 구매해주셔서</span>
        <span>감사합니다!</span>
      </p>

      <button className="a5-enter" onClick={onEnter} aria-label="입장">입장</button>
    </div>
  );
}
