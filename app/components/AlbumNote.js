"use client";

import { useState, useRef, useEffect } from "react";

const COLLAPSED_LINES = 4;

// 앨범 소개(About) — 가변 길이 라이너 노트. 기본 4줄 접힘 + More/Less 토글.
// 펼침/접힘은 max-height 트랜지션으로 부드럽게. 짧아 넘치지 않으면 토글 숨김.
export default function AlbumNote({ text, label = "About" }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(true); // 접힘 가정 → 첫 페인트 플래시 방지
  const ref = useRef(null);
  const mounted = useRef(false);

  // 오버플로 측정 (폰트 swap / 리사이즈 반영)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollHeight - el.clientHeight > 2);
    measure();
    window.addEventListener("resize", measure);
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  // 펼침/접힘 애니메이션 — max-height를 명시적 px로 구동해 양방향 모두 부드럽게.
  useEffect(() => {
    const el = ref.current;
    if (!el || !overflowing) return;
    if (!mounted.current) { mounted.current = true; return; } // 첫 마운트는 애니메이션 스킵
    if (expanded) {
      el.style.maxHeight = el.scrollHeight + "px";
      const onEnd = () => { el.style.maxHeight = "none"; el.removeEventListener("transitionend", onEnd); };
      el.addEventListener("transitionend", onEnd);
      return () => el.removeEventListener("transitionend", onEnd);
    } else {
      el.style.maxHeight = el.scrollHeight + "px"; // 현재 전체 높이를 px로 고정
      void el.offsetHeight;                         // 리플로 강제 → 트랜지션 시작점 확정
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 25;
      el.style.maxHeight = lh * COLLAPSED_LINES + "px"; // 목표 높이(px)로 펼침과 동일하게 트랜지션
    }
  }, [expanded, overflowing]);

  if (!text) return null;
  const cls = !overflowing ? " full" : (expanded ? "" : " clamped");

  return (
    <section className="liner fade-up d4">
      <div className="liner-head">
        <span className="kicker">{label}</span>
        <span className="liner-rule" />
      </div>
      <div ref={ref} className={"liner-body kr" + cls}>{text}</div>
      {overflowing && (
        <button className="liner-toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          {expanded ? "Less" : "More"}
          <span className="liner-sign">{expanded ? "–" : "+"}</span>
        </button>
      )}
    </section>
  );
}
