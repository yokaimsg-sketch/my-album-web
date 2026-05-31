"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ALBUM_DATA } from "@/lib/albumData";
import { ALBUM_THEMES, DEFAULT_THEME, applyThemeVars, resolveTheme } from "@/lib/albumThemes";
import { Icon } from "./components/icons";
import { LoginScreen, IntroScreen } from "./components/AuthScreens";
import PlayerDock from "./components/PlayerDock";
import BehindTab from "./components/BehindTab";

export default function AlbumPage() {
  // === 시스템 상태 ===
  const [viewState, setViewState] = useState("loading"); // loading | invalid | login | intro | main
  const [urlParams, setUrlParams] = useState({ id: null, token: null });
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [introOpacity, setIntroOpacity] = useState(0);
  const [album, setAlbum] = useState(null);

  // === UI & 플레이어 상태 ===
  const [currentTab, setCurrentTab] = useState("메인"); // 메인 | 비하인드
  const [currentTrack, setCurrentTrack] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [monoMode, setMonoMode] = useState("light"); // id=4 라이트/다크 토글

  // === 참조(Refs) ===
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const lyricContainerRef = useRef(null);
  const lyricRefs = useRef([]);
  const fadeAnimationRef = useRef(null);
  const activeFadeResolve = useRef(null);
  const isSeekingRef = useRef(false);
  const rootRef = useRef(null);
  const pendingLyricTargetRef = useRef(null);

  // === 오디오 설정 ===
  const MAX_VOL = 0.4;
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceRef = useRef(null);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // 테마 토큰을 루트에 1회 주입 (매 틱 리렌더 inline style 회피 → iOS backdrop-blur 점멸 방지)
  // mono(id=4)는 라이트/다크 토글을 지원하므로 monoMode까지 반영.
  const theme = album ? resolveTheme(album.식별자, monoMode) : DEFAULT_THEME;
  useEffect(() => {
    if (rootRef.current && album) applyThemeVars(rootRef.current, album.식별자, monoMode);
  }, [album, monoMode]);

  // 모바일 브라우저 상단 바 색을 활성 테마 배경(--bg-solid)으로 동적 갱신.
  useEffect(() => {
    const c = theme?.vars?.["--bg-solid"];
    if (!c) return;
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "theme-color"); document.head.appendChild(m); }
    m.setAttribute("content", c);
  }, [album, monoMode]);

  // 앨범 진입 시 mono 기본 모드 설정
  useEffect(() => {
    if (!album) return;
    const t = ALBUM_THEMES[album.식별자];
    if (t && t.defaultMode) setMonoMode(t.defaultMode);
  }, [album]);

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

  // --- [보안] URL 검증 ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const token = params.get("token");

    if (id && token) {
      fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", id, token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const albumData = ALBUM_DATA[id];
            if (!albumData) { setViewState("invalid"); return; }
            setAlbum(albumData);
            setUrlParams({ id, token });
            setBuyerInfo(data.buyer);
            setViewState("login");
          } else {
            setViewState("invalid");
          }
        })
        .catch(() => setViewState("invalid"));
    } else {
      setViewState("invalid");
    }
  }, []);

  // PIN 검증 — 원본 /api/auth login 로직 보존. LoginScreen이 호출.
  const handleVerify = useCallback(async (pin) => {
    if (!/^\d{6}$/.test(pin)) return false;
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", id: urlParams.id, token: urlParams.token, pin }),
      });
      const data = await res.json();
      if (data.success) { setViewState("intro"); return true; }
      return false;
    } catch { return false; }
  }, [urlParams]);

  // --- [연출] 인트로 시퀀스 ---
  useEffect(() => {
    if (viewState === "intro") {
      const t1 = setTimeout(() => setIntroOpacity(100), 100);
      const t2 = setTimeout(() => setIntroOpacity(0), 3500);
      const t3 = setTimeout(() => setViewState("main"), 4500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [viewState]);

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
  }, [viewState, album]);

  // 가사 클릭 시 팝 노이즈 차단 (Seamless Seek + 동기화)
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
    if (isSeekingRef.current || !album) return;
    const trackCount = album.트랙리스트.length;

    if (trackCount <= 1) {
      if (direction === "next" && audioRef.current?.ended && isPlayingRef.current) {
        await doFade(0, 150);
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    isSeekingRef.current = true;
    try {
      const wasPlaying = isPlayingRef.current;
      if (wasPlaying) { await doFade(0, 150); audioRef.current.pause(); }
      if (direction === "next") setCurrentTrack((prev) => (prev < trackCount ? prev + 1 : 1));
      else setCurrentTrack((prev) => (prev > 1 ? prev - 1 : trackCount));
    } finally {
      isSeekingRef.current = false;
    }
  };

  // [Media Session]
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaSession) return;
    if (viewState !== "main" || !album) return;
    const track = album.트랙리스트[currentTrack - 1];
    if (!track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.제목,
        artist: album.아티스트,
        album: album.앨범명,
        artwork: [{ src: track.앨범아트, sizes: "512x512", type: "image/jpeg" }],
      });
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
      navigator.mediaSession.setActionHandler("play", () => togglePlay());
      navigator.mediaSession.setActionHandler("pause", () => togglePlay());
      navigator.mediaSession.setActionHandler("previoustrack", () => changeTrack("prev"));
      navigator.mediaSession.setActionHandler("nexttrack", () => changeTrack("next"));
    } catch (e) { console.error("MediaSession error:", e); }
  }, [currentTrack, isPlaying, viewState, album]);

  // 트랙/뷰 변경 시 로드 + 오토플레이
  useEffect(() => {
    if (audioRef.current && viewState === "main") {
      audioRef.current.pause();
      audioRef.current.load();
      setCurrentTime(0);
      setActiveLyricIndex(0);
      pendingLyricTargetRef.current = null;
      lyricRefs.current = [];

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

  // --- [컨트롤 슬라이더 로직] ---
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

  const seekTo = (time) => {
    if (isSeekingRef.current) return;
    const adjusted = time < 65 ? Math.max(0, time - 2) : time;
    if (time !== adjusted) {
      const lyrics = album.트랙리스트[currentTrack - 1].가사데이터;
      const targetIndex = lyrics.findIndex((l) => l.시간 === time);
      if (targetIndex !== -1) {
        pendingLyricTargetRef.current = { index: targetIndex, time };
        setActiveLyricIndex(targetIndex);
        setCurrentTime(adjusted);
      }
    } else {
      pendingLyricTargetRef.current = null;
    }
    executeSeek(adjusted, true);
  };

  // --- [가사 트래킹 로직] ---
  useEffect(() => {
    if (!isDragging && viewState === "main") {
      const pending = pendingLyricTargetRef.current;
      if (pending !== null) {
        if (currentTime < pending.time) {
          if (activeLyricIndex !== pending.index) setActiveLyricIndex(pending.index);
          return;
        }
        pendingLyricTargetRef.current = null;
      }

      const lyrics = album?.트랙리스트[currentTrack - 1]?.가사데이터 || [];
      let index = -1;
      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (lyrics[i].시간 <= currentTime) { index = i; break; }
      }
      if (index !== -1 && index !== activeLyricIndex) setActiveLyricIndex(index);
    }
  }, [currentTime, currentTrack, isDragging, viewState, activeLyricIndex, album]);

  // 가사 자동 스크롤 — 컨테이너 scrollTo (페이지 전체 점프 방지)
  useEffect(() => {
    if (isAutoScroll && !isDragging && viewState === "main" && showLyrics) {
      const c = lyricContainerRef.current;
      const el = lyricRefs.current[activeLyricIndex];
      if (c && el) c.scrollTo({ top: el.offsetTop - c.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" });
    }
  }, [activeLyricIndex, isAutoScroll, isDragging, viewState, showLyrics]);

  // 브라우저 탭 제목
  useEffect(() => { if (album) document.title = album.제목; }, [album]);

  // ─────────────────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────────────────
  if (viewState === "loading") return <div ref={rootRef} className="app-root" />;

  if (viewState === "invalid") {
    return (
      <div ref={rootRef} className="app-root">
        <div className="overlay fade-in">
          <div className="kicker" style={{ marginBottom: 14 }}>Invalid Access</div>
          <p className="kr" style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>
            비정상적인 접근입니다.<br />앨범 전용 링크를 통해 접속해 주세요.
          </p>
        </div>
      </div>
    );
  }

  const track = album?.트랙리스트[currentTrack - 1];
  const lyrics = track?.가사데이터 || [];
  const hasRealLyrics = lyrics.length > 1 || (lyrics[0] && lyrics[0].내용 !== "준비 중...");

  // 플레이어 제목에서 "아티스트 - " 접두사 제거 (아래에 아티스트명이 별도로 표시되므로).
  const displayTitle = track
    ? track.제목.replace(new RegExp("^\\s*" + album.아티스트.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*[-–—]\\s*"), "")
    : "";

  return (
    <div ref={rootRef} className="app-root" data-mode={theme.mode} data-treatment={theme.treatment}>
      <audio
        ref={audioRef}
        src={track?.음원}
        crossOrigin="anonymous"
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={() => !isDragging && !isSeekingRef.current && setCurrentTime(audioRef.current.currentTime)}
        onEnded={() => changeTrack("next")}
        preload="auto"
        playsInline
      />

      {viewState === "login" && album && (
        <LoginScreen logoSrc={album.로고} albumTitle={album.제목} buyerNo={buyerInfo?.number} logoH={theme.logoH} toggleable={theme.toggleable} monoMode={monoMode} setMonoMode={setMonoMode} onVerify={handleVerify} />
      )}

      {viewState === "intro" && (
        <IntroScreen buyerNo={buyerInfo?.number} opacity={introOpacity / 100} />
      )}

      {viewState === "main" && album && (
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
                  <div className="kicker">{theme.kicker}</div>
                  {theme.toggleable && (
                    <button
                      className="mono-toggle"
                      onClick={() => setMonoMode(monoMode === "light" ? "dark" : "light")}
                      aria-label="라이트/다크 전환"
                    >
                      <span className={"mt-opt" + (monoMode === "light" ? " on" : "")}>Light</span>
                      <span className={"mt-opt" + (monoMode === "dark" ? " on" : "")}>Dark</span>
                    </button>
                  )}
                </div>
                <h1 className={"album-title kr" + (album.제목.length > 12 ? " long" : "")}>{album.제목}</h1>
                <div className="album-sub">
                  <span className="name">{album.아티스트}</span>
                  <span className="sep" />
                  <span className="label-mono">{album.발매}</span>
                  {album.트랙리스트.length > 1 && (<><span className="sep" /><span className="label-mono">{album.트랙리스트.length} Tracks</span></>)}
                </div>
              </header>

              <div style={{ padding: "16px 24px 0" }} className="fade-up d1">
                <span className="chip"><span className="dot" />No.{buyerInfo?.number} Exclusive</span>
              </div>

              <div className="hero fade-up d2">
                {theme.treatment === "earthen" && (<><span className="corner tl" /><span className="corner br" /></>)}
                {theme.treatment === "mono" && (<><span className="dotmark left" /><span className="dotmark right" /></>)}
                <div className={"hero-face" + (showLyrics ? " hide" : "")}>
                  <img className="hero-art" src={track.앨범아트} alt="cover" />
                  {theme.treatment === "analog" && <span className="filmstamp">&apos;25 8 12</span>}
                </div>
                {showLyrics && (
                  hasRealLyrics ? (
                    <div className="hero-face lyrics-face">
                      <div className="lyrics-head">
                        <h3 className="label-mono" style={{ color: "var(--accent)" }}>Lyrics</h3>
                        <button className={"autoscroll-btn" + (isAutoScroll ? " on" : "")} onClick={() => setIsAutoScroll(!isAutoScroll)}>AUTO</button>
                      </div>
                      <div className="lyric-scroll" ref={lyricContainerRef}>
                        {lyrics.map((l, i) => (
                          <div
                            key={i}
                            ref={(el) => (lyricRefs.current[i] = el)}
                            className={"lyric kr" + (i === activeLyricIndex ? " active" : i < activeLyricIndex ? " passed" : "")}
                            onClick={() => seekTo(l.시간)}
                          >
                            {l.내용}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="hero-face lyrics-face">
                      <div className="lyrics-empty">
                        <span className="kicker">Coming Soon</span>
                        <p className="kr" style={{ color: "var(--muted)", fontSize: 15, fontWeight: 600 }}>가사 준비 중입니다</p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="face-toggle fade-up d3">
                <button className={!showLyrics ? "active" : ""} onClick={() => setShowLyrics(false)}><Icon.image s={15} />Cover</button>
                <button className={showLyrics ? "active" : ""} onClick={() => setShowLyrics(true)}><Icon.lyrics s={15} />Lyrics</button>
              </div>

              {album.트랙리스트.length > 1 && (
                <div className="tracklist fade-up d3">
                  {album.트랙리스트.map((tr, i) => {
                    const active = i === currentTrack - 1;
                    return (
                      <button
                        key={i}
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
              )}

              {album.노트 && <p className="album-note fade-up d4">{album.노트}</p>}
            </div>
          )}

          {currentTab === "비하인드" && (
            album.비하인드 ? (
              <BehindTab
                data={album.비하인드}
                logoSrc={album.로고}
                albumTitle={album.제목}
                logoH={theme.logoH}
                pauseAudioWithFade={pauseAudioWithFade}
                registerStopBehindMedia={registerStopBehindMedia}
              />
            ) : (
              <div className="behind" style={{ textAlign: "center", paddingTop: 60 }}>
                <span className="kicker">Loading Archive…</span>
              </div>
            )
          )}

          <PlayerDock
            title={displayTitle}
            artist={album.아티스트}
            art={track.앨범아트}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onToggle={togglePlay}
            onPrev={() => changeTrack("prev")}
            onNext={() => changeTrack("next")}
            showLyrics={showLyrics}
            onToggleLyrics={() => setShowLyrics(!showLyrics)}
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
