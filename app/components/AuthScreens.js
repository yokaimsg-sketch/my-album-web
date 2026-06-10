"use client";

import { useState, useEffect } from "react";

// PIN 로그인 — 입력/키패드는 자체 관리, 검증은 부모(onVerify)가 /api/auth로 수행.
export function LoginScreen({ logoSrc, albumTitle, buyerNo, logoH = 40, toggleable, monoMode, setMonoMode, onVerify }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const [checking, setChecking] = useState(false);

  const press = (d) => {
    if (checking) return;
    setErr(false);
    if (d === "del") return setPin((p) => p.slice(0, -1));
    setPin((p) => (p + d).slice(0, 6));
  };

  useEffect(() => {
    if (pin.length !== 6) return;
    let cancelled = false;
    setChecking(true);
    (async () => {
      const ok = await onVerify(pin);
      if (cancelled) return;
      setChecking(false);
      if (!ok) { setErr(true); setPin(""); }
    })();
    return () => { cancelled = true; };
  }, [pin]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "blank", "0", "del"];

  return (
    <div className="overlay fade-in">
      {toggleable && (
        <button
          className="mono-toggle login-mode-toggle"
          onClick={() => setMonoMode(monoMode === "light" ? "dark" : "light")}
          aria-label="라이트/다크 전환"
        >
          <span className={"mt-opt" + (monoMode === "light" ? " on" : "")}>Light</span>
          <span className={"mt-opt" + (monoMode === "dark" ? " on" : "")}>Dark</span>
        </button>
      )}
      {logoSrc && <img className="login-logo" src={logoSrc} alt={albumTitle} style={{ height: Math.round(logoH * 1.5) }} />}
      <div className="kicker" style={{ marginBottom: 8 }}>Private Access</div>
      <p className="label-mono" style={{ marginBottom: 30 }}>Buyer No. {buyerNo}</p>

      <div className="pin-row">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={"pin-cell" + (i < pin.length ? " filled" : "") + (i === pin.length && !checking ? " cursor" : "")}>
            {i < pin.length && <span className="pin-dot" />}
          </div>
        ))}
      </div>
      <p className="kr" style={{ fontSize: 12, color: err ? "var(--accent-2)" : "var(--muted)", marginTop: 6, minHeight: 18, fontWeight: 600 }}>
        {checking ? "확인 중…" : err ? "잘못된 PIN입니다" : "6자리 시크릿 PIN을 입력하세요"}
      </p>

      <div className="keypad">
        {keys.map((k, i) =>
          k === "blank" ? <div key={i} className="key blank" /> : (
            <button key={i} className="key" onClick={() => press(k)}>{k === "del" ? "←" : k}</button>
          )
        )}
      </div>
    </div>
  );
}

// 인트로 — opacity는 부모(page.js)의 introOpacity로 제어 (원본 타이밍 보존).
export function IntroScreen({ albumName, buyerNo, opacity }) {
  return (
    <div className="overlay" style={{ opacity, transition: "opacity 1s ease" }}>
      <p className="kicker" style={{ marginBottom: 24 }}>Welcome</p>
      <h1 className="kr" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.6, color: "var(--text)" }}>
        {albumName}의 <span className="intro-num">{buyerNo}번째</span><br />
        구매자가 되어주셔서<br />
        감사합니다!
      </h1>
      <p className="label-mono" style={{ marginTop: 28 }}>Digital Experience</p>
    </div>
  );
}
