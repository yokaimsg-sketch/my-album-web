"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ALBUM5, ALBUM5_THEME } from "@/lib/album5Data";
import { Icon } from "../components/icons";
import PlayerDock from "../components/PlayerDock";
import BehindTab from "../components/BehindTab";
import AlbumNote from "../components/AlbumNote";
import EntryScreen from "./EntryScreen";
import "./album5.css";

// 5집 전용 페이지. /?id=5&token=... 요청이 proxy.js 를 통해 여기로 들어온다.
// 오디오 엔진(GainNode 페이드 · 팝노이즈 없는 seek · iOS 복귀 · MediaSession)은
// app/page.js 의 검증된 구현을 그대로 옮겨왔다. 1~4번 앨범과 파일이 분리돼 있어
// 여기를 어떻게 고쳐도 기존 앨범에는 영향이 없다.
export default function Album5Page() {
  // === 시스템 상태 ===
  const [viewState, setViewState] = useState("loading"); // loading | invalid | entry | main

  // === UI & 플레이어 상태 ===
  const [currentTab, setCurrentTab] = useState("메인"); // 메인 | 비하인드
  const [currentTrack, setCurrentTrack] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showNote, setShowNote] = useState(false); // 커버 ↔ 곡 소개

  // === 참조(Refs) ===
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const fadeAnimationRef = useRef(null);
  const activeFadeResolve = useRef(null);
  const isSeekingRef = useRef(false);
  const rootRef = useRef(null);

  // === 오디오 설정 ===
  const MAX_VOL = 0.4;
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceRef = useRef(null);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const track = ALBUM5.트랙리스트[currentTrack - 1];
  const trackCount = ALBUM5.트랙리스트.length;

  // 테마 토큰을 1회 주입 (매 틱 리렌더 inline style 회피 → iOS backdrop-blur 점멸 방지).
  // globals.css 는 :root 에 앨범1(크림색) 기본값을 두고 body 배경도 거기서 가져간다.
  // html 에 주입해야 .app-root 바깥(body·iOS 오버스크롤 영역)까지 심야 블루로 덮인다.
  useEffect(() => {
    const targets = [document.documentElement, rootRef.current];
    for (const el of targets) {
      if (!el) continue;
      Object.entries(ALBUM5_THEME.vars).forEach(([k, v]) => el.style.setProperty(k, v));
    }
  }, []);

  // 모바일 브라우저 상단 바 색을 활성 테마 배경(--bg-solid)으로 갱신.
  useEffect(() => {
    const c = ALBUM5_THEME.vars["--bg-solid"];
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "theme-color"); document.head.appendChild(m); }
    m.setAttribute("content", c);
  }, []);

  // 언마운트 시 메모리 누수 방지
  useEffect(() => {
    return () => { if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current); };
  }, []);

  // iOS 복귀 시 AudioContext 자동 복구
  useEffect(() => {
    const onVisibilityChange = async () => {
      if (document.hidden) return;
      if (!audioCtxRef.current) return;
      try {
        if (audioCtxRef.current.state !== "running") await audioCtxRef.current.resume();
        if (isPlayingRef.current && audioRef.current?.paused) {
          await audioRef.current.play().catch(() => setIsPlaying(false));
        }
      } catch (e) { console.error("Visibility resume error:", e); }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // --- [보안] 토큰 검증 — 5집은 PIN 단계 없이 토큰 유효성만 확인한다. ---
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setViewState("invalid"); return; }

    fetch("/api/album5", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => setViewState(data.success ? "entry" : "invalid"))
      .catch(() => setViewState("invalid"));
  }, []);

  // 디지털 믹서(GainNode) 초기화
  const ensureAudioContext = async () => {
    if (!audioCtxRef.current && audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      gainNodeRef.current = audioCtxRef.current.createGain();
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current?.state === "suspended") await audioCtxRef.current.resume();
  };

  // 오디오 볼륨(gain) 페이드 컨트롤
  const doFade = (targetVolume, durationMs = 150) => {
    return new Promise((resolve) => {
      if (!audioRef.current) return resolve();
      if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current);
      if (activeFadeResolve.current) activeFadeResolve.current();
      activeFadeResolve.current = resolve;

      const isUsingGain = !!gainNodeRef.current && !!audioCtxRef.current;
      if (isUsingGain) {
        try {
          const { currentTime } = audioCtxRef.current;
          gainNodeRef.current.gain.cancelScheduledValues(currentTime);
          gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, currentTime);
          gainNodeRef.current.gain.linearRampToValueAtTime(targetVolume, currentTime + durationMs / 1000);
          setTimeout(() => { activeFadeResolve.current = null; resolve(); }, durationMs);
        } catch (e) {
          console.error("Fade scheduling error:", e);
          gainNodeRef.current.gain.value = targetVolume;
          resolve();
        }
      } else {
        audioRef.current.volume = targetVolume;
        activeFadeResolve.current = null;
        resolve();
      }
    });
  };

  // 비하인드 미디어 재생 직전 메인 오디오 페이드아웃
  const pauseAudioWithFade = useCallback(async () => {
    if (!isPlayingRef.current) return;
    await doFade(0, 150);
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  // 비하인드 활성 미디어 즉시 정지 함수 보관
  const stopBehindMediaRef = useRef(null);
  const registerStopBehindMedia = useCallback((fn) => { stopBehindMediaRef.current = fn; }, []);

  // 메인 오디오 'play' 시 비하인드 미디어 즉시 정지 (동시 재생 방지)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handler = () => stopBehindMediaRef.current?.();
    audio.addEventListener("play", handler);
    return () => audio.removeEventListener("play", handler);
  }, [viewState]);

  // 진행바 드래그 시 팝 노이즈 차단 (Seamless Seek + 동기화)
  const executeSeek = async (newTime, forcePlay = false) => {
    if (!audioRef.current || isSeekingRef.current) return;
    if (audioRef.current.readyState === 0) return;

    isSeekingRef.current = true;
    const wasPlaying = isPlayingRef.current;
    const willPlay = wasPlaying || forcePlay;

    try {
      await ensureAudioContext();
      if (wasPlaying) {
        await doFade(0, 150);
      } else if (gainNodeRef.current && audioCtxRef.current) {
        const { currentTime: now } = audioCtxRef.current;
        gainNodeRef.current.gain.cancelScheduledValues(now);
        gainNodeRef.current.gain.setValueAtTime(0, now);
      }

      audioRef.current.pause();

      const seekPromise = new Promise((resolve) => {
        const onSeeked = () => { audioRef.current.removeEventListener("seeked", onSeeked); resolve(); };
        audioRef.current.addEventListener("seeked", onSeeked);
        setTimeout(() => { audioRef.current.removeEventListener("seeked", onSeeked); resolve(); }, 3000);
      });

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setIsDragging(false);
      await seekPromise;

      if (audioRef.current.readyState < 3) {
        await new Promise((resolve) => {
          const onCanPlay = () => { audioRef.current.removeEventListener("canplay", onCanPlay); resolve(); };
          audioRef.current.addEventListener("canplay", onCanPlay);
          setTimeout(() => { audioRef.current.removeEventListener("canplay", onCanPlay); resolve(); }, 2000);
        });
      }

      if (willPlay) {
        if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
        audioRef.current.muted = true;

        if (audioRef.current.paused) {
          const playPromise = new Promise((resolve) => {
            const onPlaying = () => { audioRef.current.removeEventListener("playing", onPlaying); resolve(); };
            audioRef.current.addEventListener("playing", onPlaying);
            setTimeout(() => { audioRef.current.removeEventListener("playing", onPlaying); resolve(); }, 3000);
          });
          await audioRef.current.play();
          setIsPlaying(true);
          await playPromise;
        }

        const silenceDuration = newTime < 65 ? 1500 : 550;
        await new Promise((resolve) => setTimeout(resolve, silenceDuration));
        audioRef.current.muted = false;
        await doFade(MAX_VOL, 400);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      console.error("Seek error:", e);
      setIsPlaying(false);
    } finally {
      if (audioRef.current) audioRef.current.muted = false;
      isSeekingRef.current = false;
    }
  };

  const togglePlay = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!audioRef.current || isSeekingRef.current) return;
    isSeekingRef.current = true;
    try {
      if (isPlaying) {
        await doFade(0, 150);
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await ensureAudioContext();
        if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
        else audioRef.current.volume = 0;
        audioRef.current.muted = true;

        const playPromise = new Promise((resolve) => {
          const onPlaying = () => { audioRef.current.removeEventListener("playing", onPlaying); resolve(); };
          audioRef.current.addEventListener("playing", onPlaying);
          setTimeout(() => { audioRef.current.removeEventListener("playing", onPlaying); resolve(); }, 3000);
        });

        await audioRef.current.play();
        setIsPlaying(true);
        await playPromise;

        const resumePos = audioRef.current.currentTime;
        const silenceDuration = resumePos < 65 ? 1500 : 550;
        await new Promise((resolve) => setTimeout(resolve, silenceDuration));
        audioRef.current.muted = false;
        await doFade(MAX_VOL, 400);
      }
    } catch (e) {
      console.error("Playback error:", e);
      if (audioRef.current) audioRef.current.muted = false;
      setIsPlaying(false);
    } finally {
      isSeekingRef.current = false;
    }
  };

  const changeTrack = async (direction) => {
    if (isSeekingRef.current) return;
    isSeekingRef.current = true;
    try {
      const wasPlaying = isPlayingRef.current;
      if (wasPlaying) { await doFade(0, 150); audioRef.current?.pause(); }
      if (direction === "next") setCurrentTrack((prev) => (prev < trackCount ? prev + 1 : 1));
      else setCurrentTrack((prev) => (prev > 1 ? prev - 1 : trackCount));
    } finally {
      isSeekingRef.current = false;
    }
  };

  // [Media Session]
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaSession) return;
    if (viewState !== "main" || !track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.제목,
        artist: ALBUM5.아티스트,
        album: ALBUM5.앨범명,
        artwork: [{ src: track.앨범아트, sizes: "512x512", type: "image/png" }],
      });
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
      navigator.mediaSession.setActionHandler("play", () => togglePlay());
      navigator.mediaSession.setActionHandler("pause", () => togglePlay());
      navigator.mediaSession.setActionHandler("previoustrack", () => changeTrack("prev"));
      navigator.mediaSession.setActionHandler("nexttrack", () => changeTrack("next"));
    } catch (e) { console.error("MediaSession error:", e); }
  }, [currentTrack, isPlaying, viewState]);

  // 트랙/뷰 변경 시 로드 + 오토플레이
  useEffect(() => {
    if (audioRef.current && viewState === "main") {
      audioRef.current.pause();
      audioRef.current.load();
      setCurrentTime(0);

      if (isPlayingRef.current) {
        (async () => {
          await ensureAudioContext();
          if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
          else audioRef.current.volume = 0;
          audioRef.current.muted = true;

          if (audioRef.current.readyState < 3) {
            await new Promise((resolve) => {
              const onCanPlay = () => { audioRef.current.removeEventListener("canplay", onCanPlay); resolve(); };
              audioRef.current.addEventListener("canplay", onCanPlay);
              setTimeout(() => { audioRef.current.removeEventListener("canplay", onCanPlay); resolve(); }, 3000);
            });
          }

          const playEventPromise = new Promise((resolve) => {
            const onPlaying = () => { audioRef.current.removeEventListener("playing", onPlaying); resolve(); };
            audioRef.current.addEventListener("playing", onPlaying);
            setTimeout(() => { audioRef.current.removeEventListener("playing", onPlaying); resolve(); }, 3000);
          });

          try {
            const playRequest = audioRef.current.play();
            if (playRequest !== undefined) {
              await playRequest;
              await playEventPromise;
              await new Promise((resolve) => setTimeout(resolve, 1500));
              audioRef.current.muted = false;
              await doFade(MAX_VOL, 400);
            }
          } catch (error) {
            console.error("오토플레이 방지됨:", error);
            audioRef.current.muted = false;
            setIsPlaying(false);
          }
        })();
      }
    }
  }, [currentTrack, viewState]);

  // --- [진행바 슬라이더] ---
  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(pos * duration);
  };
  const handleDrag = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(pos * duration);
  };
  const handlePointerUp = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    if (!duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    executeSeek(pos * duration, false);
  };

  // ─────────────────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────────────────
  return (
    <div
      ref={rootRef}
      className="app-root"
      data-mode={ALBUM5_THEME.mode}
      data-treatment={ALBUM5_THEME.treatment}
    >
      {/* 토큰 검증 전에는 음원을 붙이지 않는다 (미인증 상태 프리로드 방지) */}
      {(viewState === "entry" || viewState === "main") && (
        <audio
          ref={audioRef}
          src={track.음원}
          crossOrigin="anonymous"
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onTimeUpdate={() => !isDragging && !isSeekingRef.current && setCurrentTime(audioRef.current.currentTime)}
          onEnded={() => changeTrack("next")}
          preload="auto"
          playsInline
        />
      )}

      {viewState === "invalid" && (
        <div className="overlay fade-in">
          <div className="kicker" style={{ marginBottom: 14 }}>Invalid Access</div>
          <p className="kr" style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>
            비정상적인 접근입니다.<br />앨범 전용 링크를 통해 접속해 주세요.
          </p>
        </div>
      )}

      {viewState === "entry" && (
        <EntryScreen
          cover={ALBUM5.커버}
          titleLines={ALBUM5.제목줄}
          onEnter={() => setViewState("main")}
        />
      )}

      {viewState === "main" && (
        <>
          <nav className="tabs">
            <div className="tabs-inner">
              <button className={"tab" + (currentTab === "메인" ? " active" : "")} onClick={() => setCurrentTab("메인")}>Main</button>
              <button className={"tab" + (currentTab === "비하인드" ? " active" : "")} onClick={() => setCurrentTab("비하인드")}>Behind</button>
            </div>
          </nav>

          {currentTab === "메인" && (
            <div className="wrap">
              <header className="album-head fade-up">
                <div className="head-top">
                  <div className="kicker">{ALBUM5_THEME.kicker}</div>
                </div>
                <h1 className="a5-title">
                  {ALBUM5.제목줄.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h1>
                <div className="a5-sub">
                  <span className="a5-sub-name kr">{ALBUM5.아티스트}</span>
                  <span className="a5-sub-sep" />
                  <span className="label-mono">{ALBUM5.발매}</span>
                  <span className="a5-sub-sep a5-sub-sep2" />
                  <span className="label-mono a5-sub-tracks">{trackCount} Tracks</span>
                </div>
              </header>

              <div style={{ padding: "16px 24px 0" }} className="fade-up d1">
                <span className="chip"><span className="dot" />Private Listening</span>
              </div>

              <div className="hero fade-up d2">
                <div className={"hero-face" + (showNote ? " hide" : "")}>
                  <img className="hero-art" src={track.앨범아트} alt="cover" />
                </div>
                {showNote && (
                  <div className="hero-face lyrics-face a5-note-face">
                    <div className="a5-note-head">
                      <span className="kicker">Track {String(track.번호).padStart(2, "0")}</span>
                      <h3 className="a5-note-title">{track.제목}</h3>
                      <div className="a5-note-rule" />
                    </div>
                    <div className="a5-note-body">{track.곡소개}</div>
                  </div>
                )}
              </div>

              <div className="face-toggle fade-up d3">
                <button className={!showNote ? "active" : ""} onClick={() => setShowNote(false)}><Icon.image s={15} />Cover</button>
                <button className={showNote ? "active" : ""} onClick={() => setShowNote(true)}><Icon.lyrics s={15} />Note</button>
              </div>

              <div className="tracklist fade-up d3">
                {ALBUM5.트랙리스트.map((tr, i) => {
                  const active = i === currentTrack - 1;
                  return (
                    <button
                      key={tr.번호}
                      className={"track-row" + (active ? " active" : "")}
                      onClick={() => {
                        if (active) { togglePlay(); return; }
                        setCurrentTrack(tr.번호);
                        if (!isPlaying) setIsPlaying(true); // 트랙 변경 effect가 오토플레이 처리
                      }}
                    >
                      <span className="tr-no">{String(tr.번호).padStart(2, "0")}</span>
                      <span className="tr-title kr">{tr.제목}</span>
                      <span className="tr-state">
                        {active && isPlaying ? <Icon.pause s={16} /> : <Icon.play s={16} />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <AlbumNote text={ALBUM5.노트} />

              <section className="a5-credits fade-up d4">
                <div className="a5-credits-head">
                  <span className="kicker">Credits</span>
                  <span className="a5-credits-rule" />
                </div>
                <div className="a5-credits-list">
                  {ALBUM5.크레딧.map((c, i) => (
                    <div className="a5-credits-row" key={i}>
                      <span className="a5-credits-role">{c.역할}</span>
                      <span className="a5-credits-name">{c.이름}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {currentTab === "비하인드" && (
            <BehindTab
              data={ALBUM5.비하인드}
              logoSrc={ALBUM5.커버}
              albumTitle={ALBUM5.제목}
              logoH={90}
              pauseAudioWithFade={pauseAudioWithFade}
              registerStopBehindMedia={registerStopBehindMedia}
            />
          )}

          <PlayerDock
            title={track.제목}
            artist={ALBUM5.아티스트}
            art={track.앨범아트}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onToggle={togglePlay}
            onPrev={() => changeTrack("prev")}
            onNext={() => changeTrack("next")}
            showLyrics={showNote}
            onToggleLyrics={() => setShowNote(!showNote)}
            progressBarRef={progressBarRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handleDrag}
            onPointerUp={handlePointerUp}
            isDragging={isDragging}
          />
        </>
      )}
    </div>
  );
}
