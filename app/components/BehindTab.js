"use client";

import { useState, useRef, useEffect } from "react";
import { Icon, fmtTime } from "./icons";

// 비하인드 탭 — 디자인은 새 시스템, 미디어 로직(메인오디오 페이드·상호 정지·HLS)은 원본 보존.
export default function BehindTab({ data, logoSrc, albumTitle, logoH = 30, pauseAudioWithFade, registerStopBehindMedia }) {
  const items = data?.아이템 || [];
  const [idx, setIdx] = useState(0);
  const thumbRefs = useRef([]);
  const safe = items.length ? Math.min(idx, items.length - 1) : 0;

  // 선택 썸네일을 스트립 안에서 가운데로 (페이지 전체 스크롤 유발 방지 위해 컨테이너 scrollTo 사용)
  useEffect(() => {
    const el = thumbRefs.current[safe];
    if (el && el.parentElement) {
      const p = el.parentElement;
      p.scrollTo({ left: el.offsetLeft - p.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
    }
  }, [safe]);

  // 키보드 좌우 이동
  useEffect(() => {
    if (items.length <= 1) return;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "VIDEO" || tag === "AUDIO" || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      else if (e.key === "ArrowRight") setIdx((i) => Math.min(items.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  if (!items.length) {
    return (
      <div className="behind" style={{ textAlign: "center", paddingTop: 90 }}>
        <span className="kicker">Behind the Scenes</span>
        <p className="kr" style={{ color: "var(--muted)", fontSize: 15, fontWeight: 600, marginTop: 16 }}>준비 중입니다</p>
        <p className="label-mono" style={{ marginTop: 10 }}>Coming Soon</p>
      </div>
    );
  }
  const cur = items[safe];

  return (
    <div className="behind fade-up">
      <div className="behind-head">
        {logoSrc && <img className="lg" src={logoSrc} alt={albumTitle} style={{ height: logoH }} />}
        <span className="kicker">Behind the Scenes</span>
      </div>

      <div className="behind-stage fade-up d1" style={{ aspectRatio: cur.종류 === "오디오" ? "1 / 1" : "auto" }}>
        <span className="behind-counter">{String(safe + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        <BehindViewer key={safe} item={cur} pauseAudioWithFade={pauseAudioWithFade} registerStopBehindMedia={registerStopBehindMedia} />
        <button className="behind-nav prev" disabled={safe === 0} onClick={() => setIdx(safe - 1)} aria-label="이전"><Icon.chevL s={22} /></button>
        <button className="behind-nav next" disabled={safe === items.length - 1} onClick={() => setIdx(safe + 1)} aria-label="다음"><Icon.chevR s={22} /></button>
      </div>

      <div className="thumbs fade-up d2">
        {items.map((it, i) => (
          <button key={i} ref={(el) => (thumbRefs.current[i] = el)} className={"thumb" + (i === safe ? " active" : "")} onClick={() => setIdx(i)} aria-label={`아이템 ${i + 1}`}>
            <Thumb item={it} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Thumb({ item }) {
  if (item.종류 === "이미지") return <img src={item.src} alt="" loading="lazy" />;
  if (item.종류 === "오디오") return <div className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}><Icon.note s={22} /></div>;
  return (
    <>
      {item.thumb ? <img src={item.thumb} alt="" loading="lazy" /> : <div style={{ width: "100%", height: "100%", background: "#000" }} />}
      <div className="badge"><Icon.play s={16} /></div>
      <span className="kind">{item.종류 === "hls" ? "HLS" : "MP4"}</span>
    </>
  );
}

function BehindViewer({ item, pauseAudioWithFade, registerStopBehindMedia }) {
  if (item.종류 === "이미지") return <img className="full" src={item.src} alt="" />;
  if (item.종류 === "오디오") return <AudioCard src={item.src} title={item.제목} pauseAudioWithFade={pauseAudioWithFade} registerStopBehindMedia={registerStopBehindMedia} />;
  if (item.종류 === "mp4" || item.종류 === "hls")
    return <VideoPlayer src={item.src} isHls={item.종류 === "hls"} poster={item.thumb} pauseAudioWithFade={pauseAudioWithFade} registerStopBehindMedia={registerStopBehindMedia} />;
  return null;
}

// 데모 오디오 카드 — 새 디자인(디스크+진행바), 미디어 로직은 원본 보존.
function AudioCard({ src, title, pauseAudioWithFade, registerStopBehindMedia }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // 메인 오디오가 재생 시작하면 즉시 정지되도록 stop 함수 등록 (원본 동작 유지).
  useEffect(() => {
    if (!registerStopBehindMedia) return;
    registerStopBehindMedia(() => {
      const a = audioRef.current;
      if (a && !a.paused) a.pause();
    });
    return () => registerStopBehindMedia(null);
  }, [registerStopBehindMedia]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      // 메인 오디오 페이드아웃은 await 하지 않고 병렬로 — play()를 클릭 제스처 직후
      // 동기로 호출해야 iOS/Safari의 사용자 활성화(user-activation) 요건을 만족한다.
      if (pauseAudioWithFade) pauseAudioWithFade();
      a.play().then(() => setIsPlaying(true)).catch((e) => { console.error("Demo play error:", e); setIsPlaying(false); });
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  const seekFromPointer = (e) => {
    const bar = progressRef.current, a = audioRef.current;
    if (!bar || !a || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    a.currentTime = (x / rect.width) * duration;
    setCurrentTime(a.currentTime);
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="demo-card">
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => !isDragging && setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        preload="metadata"
      />
      <span className="kicker">Demo Take</span>
      <div className="demo-disc">
        <button className="icon-btn" style={{ color: "var(--accent)" }} onClick={toggle} aria-label={isPlaying ? "일시정지" : "재생"}>
          {isPlaying ? <Icon.pause s={40} /> : <Icon.play s={40} />}
        </button>
      </div>
      <p className="kr" style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{title || "Demo"}</p>
      <div style={{ width: "100%", maxWidth: 240 }}>
        <div
          ref={progressRef}
          className="bar"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setIsDragging(true); seekFromPointer(e); }}
          onPointerMove={(e) => { if (isDragging) seekFromPointer(e); }}
          onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); setIsDragging(false); }}
          onPointerCancel={() => setIsDragging(false)}
        >
          <div className="bar-track"><div className="bar-fill" style={{ width: pct + "%" }} /></div>
          <div className="bar-knob" style={{ left: `clamp(0px, calc(${pct}% - 6px), calc(100% - 13px))` }} />
        </div>
        <div className="times"><span>{fmtTime(currentTime)}</span><span>{fmtTime(duration)}</span></div>
      </div>
    </div>
  );
}

// 비디오 (mp4 / HLS) — 원본 hls.js 동적 import + 메인오디오 페이드 가드 보존.
function VideoPlayer({ src, isHls, poster, pauseAudioWithFade, registerStopBehindMedia }) {
  const videoRef = useRef(null);
  const skipNextFadeRef = useRef(false);
  const [thumbAspect, setThumbAspect] = useState(null);

  useEffect(() => {
    if (!poster) { setThumbAspect(null); return; }
    const img = new window.Image();
    let cancelled = false;
    img.onload = () => { if (!cancelled && img.naturalWidth > 0) setThumbAspect({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.src = poster;
    return () => { cancelled = true; };
  }, [poster]);

  useEffect(() => {
    if (!registerStopBehindMedia) return;
    registerStopBehindMedia(() => {
      const v = videoRef.current;
      if (v && !v.paused) v.pause();
    });
    return () => registerStopBehindMedia(null);
  }, [registerStopBehindMedia]);

  useEffect(() => {
    if (!isHls) return;
    const video = videoRef.current;
    if (!video) return;
    let hls, cancelled = false;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (Hls.isSupported()) { hls = new Hls(); hls.loadSource(src); hls.attachMedia(video); }
        else { video.src = src; }
      });
    }
    return () => { cancelled = true; if (hls) hls.destroy(); };
  }, [src, isHls]);

  // 오디오 페이드아웃 완료 전 비디오 재생 방지 (원본 가드).
  const handlePlay = async (e) => {
    if (skipNextFadeRef.current) { skipNextFadeRef.current = false; return; }
    const v = e.currentTarget;
    v.pause();
    if (pauseAudioWithFade) await pauseAudioWithFade();
    skipNextFadeRef.current = true;
    try { await v.play(); } catch { skipNextFadeRef.current = false; }
  };

  return (
    <video
      ref={videoRef}
      src={isHls ? undefined : src}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      onPlay={handlePlay}
      style={{ width: "100%", aspectRatio: thumbAspect ? `${thumbAspect.w} / ${thumbAspect.h}` : "16 / 9", objectFit: "contain", background: "#000", display: "block" }}
    />
  );
}
