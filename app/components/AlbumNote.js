"use client";

import { useState, useRef, useEffect } from "react";

// 앨범 소개(About) — 가변 길이 라이너 노트. 기본 접힘(클램프) + More/Less 토글.
// 짧아서 넘치지 않으면 토글을 자동으로 숨겨 전부 노출한다.
export default function AlbumNote({ text, label = "About" }) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollHeight - el.clientHeight > 2);
    measure();
    window.addEventListener("resize", measure);
    if (document.fonts?.ready) document.fonts.ready.then(measure); // 폰트 swap 후 재측정
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  if (!text) return null;

  return (
    <section className="liner fade-up d4">
      <div className="liner-head">
        <span className="kicker">{label}</span>
        <span className="liner-rule" />
      </div>
      <div ref={ref} className={"liner-body kr" + (expanded ? " open" : "")}>{text}</div>
      {(overflowing || expanded) && (
        <button className="liner-toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          {expanded ? "Less" : "More"}
          <span className="liner-sign">{expanded ? "–" : "+"}</span>
        </button>
      )}
    </section>
  );
}
