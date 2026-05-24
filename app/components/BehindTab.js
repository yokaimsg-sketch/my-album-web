'use client';

import { useState, useRef, useEffect } from 'react';

export default function BehindTab({ data, logoSrc, albumTitle, pauseAudioWithFade, registerStopBehindMedia }) {
  const items = data?.아이템 || [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbRefs = useRef([]);

  const safeIndex = items.length ? Math.min(selectedIndex, items.length - 1) : 0;

  // 선택된 썸네일이 항상 화면 안에 보이도록 자동 스크롤
  useEffect(() => {
    const target = thumbRefs.current[safeIndex];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [safeIndex]);

  // 키보드 좌우 화살표로 이전/다음 아이템 전환
  useEffect(() => {
    if (items.length <= 1) return;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'VIDEO' || tag === 'AUDIO' || tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((i) => Math.min(items.length - 1, i + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="p-20 text-center">
        <p className="text-gray-500 text-xs tracking-[0.5em] uppercase font-bold">No Content</p>
      </div>
    );
  }

  const current = items[safeIndex];
  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < items.length - 1;

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6 mt-4 animate-fade-in">

      <div className="flex flex-col items-center space-y-3 pt-2">
        {logoSrc && (
          <img
            src={logoSrc}
            alt={albumTitle}
            className="w-20 h-20 object-contain drop-shadow-sm"
          />
        )}
        <p className="text-[10px] tracking-[0.5em] uppercase text-gray-500 font-bold">
          Behind The Scenes
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setSelectedIndex(safeIndex - 1)}
          disabled={!hasPrev}
          aria-label="이전 아이템"
          className="shrink-0 text-primary disabled:invisible active:scale-90 transition-transform hover:opacity-70"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ overflow: 'visible' }}>
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <div className="flex-1 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 aspect-square overflow-hidden shadow-lg relative">
          <BehindViewer
            key={safeIndex}
            item={current}
            pauseAudioWithFade={pauseAudioWithFade}
            registerStopBehindMedia={registerStopBehindMedia}
          />
        </div>

        <button
          onClick={() => setSelectedIndex(safeIndex + 1)}
          disabled={!hasNext}
          aria-label="다음 아이템"
          className="shrink-0 text-primary disabled:invisible active:scale-90 transition-transform hover:opacity-70"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ overflow: 'visible' }}>
            <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>

      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((it, i) => (
          <button
            key={i}
            ref={(el) => { thumbRefs.current[i] = el; }}
            onClick={() => setSelectedIndex(i)}
            className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-gray-200 ${
              i === safeIndex
                ? 'border-primary shadow-md scale-105'
                : 'border-white/60 opacity-70 hover:opacity-100'
            }`}
            aria-label={`아이템 ${i + 1}`}
          >
            <Thumbnail item={it} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Thumbnail({ item }) {
  if (item.종류 === '이미지') {
    return <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />;
  }
  if (item.종류 === '오디오') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </div>
    );
  }
  if (item.thumb) {
    return (
      <div className="relative w-full h-full">
        <img src={item.thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

function BehindViewer({ item, pauseAudioWithFade, registerStopBehindMedia }) {
  if (item.종류 === '이미지') {
    return (
      <img
        src={item.src}
        alt=""
        className="w-full h-full object-cover"
      />
    );
  }
  if (item.종류 === '오디오') {
    return (
      <AudioCard
        src={item.src}
        title={item.제목}
        pauseAudioWithFade={pauseAudioWithFade}
        registerStopBehindMedia={registerStopBehindMedia}
      />
    );
  }
  if (item.종류 === 'mp4' || item.종류 === 'hls') {
    return (
      <VideoPlayer
        src={item.src}
        isHls={item.종류 === 'hls'}
        poster={item.thumb}
        pauseAudioWithFade={pauseAudioWithFade}
        registerStopBehindMedia={registerStopBehindMedia}
      />
    );
  }
  return null;
}

function AudioCard({ src, title, pauseAudioWithFade, registerStopBehindMedia }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // 메인 오디오가 재생을 시작할 때 즉시 정지되도록 stop 함수를 등록.
  useEffect(() => {
    if (!registerStopBehindMedia) return;
    registerStopBehindMedia(() => {
      const a = audioRef.current;
      if (a && !a.paused) a.pause();
    });
    return () => registerStopBehindMedia(null);
  }, [registerStopBehindMedia]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      await pauseAudioWithFade();
      try {
        await a.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  const seekFromPointer = (e) => {
    const bar = progressRef.current;
    const a = audioRef.current;
    if (!bar || !a || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const newTime = (x / rect.width) * duration;
    a.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (s) => {
    if (!isFinite(s) || s < 0) return '0:00';
    const mm = Math.floor(s / 60);
    const ss = String(Math.floor(s % 60)).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const percent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-6 p-8 text-center">
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
      <p className="text-gray-500 text-[10px] tracking-[0.5em] uppercase font-bold">Demo Track</p>
      <p className="text-2xl font-bold text-primary tracking-wider">{title || 'Demo'}</p>
      <button
        onClick={toggle}
        className="text-primary active:scale-90 transition-transform hover:opacity-80"
        aria-label={isPlaying ? '일시정지' : '재생'}
      >
        {isPlaying ? (
          <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor" style={{ overflow: 'visible' }}>
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor" style={{ overflow: 'visible' }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-xs flex flex-col space-y-2">
        <div
          ref={progressRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setIsDragging(true);
            seekFromPointer(e);
          }}
          onPointerMove={(e) => {
            if (isDragging) seekFromPointer(e);
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId);
            setIsDragging(false);
          }}
          onPointerCancel={() => setIsDragging(false)}
          className="h-6 flex items-center cursor-pointer relative touch-none group"
        >
          <div className="h-1.5 bg-gray-300 w-full rounded-full shadow-inner">
            <div className="h-full bg-primary rounded-full" style={{ width: percent + '%' }} />
          </div>
          <div
            className="absolute w-4 h-4 bg-white rounded-full shadow-md border border-gray-200 transition-transform group-active:scale-125"
            style={{ left: `clamp(0px, calc(${percent}% - 8px), calc(100% - 16px))` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-500 font-medium tracking-tighter px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ src, isHls, poster, pauseAudioWithFade, registerStopBehindMedia }) {
  const videoRef = useRef(null);
  const skipNextFadeRef = useRef(false);

  // 메인 오디오가 재생을 시작할 때 즉시 정지되도록 stop 함수를 등록.
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

    let hls;
    let cancelled = false;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      import('hls.js').then(({ default: Hls }) => {
        if (cancelled) return;
        if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      });
    }

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
    };
  }, [src, isHls]);

  // 오디오 페이드아웃이 완료되기 전에는 비디오가 재생되지 않도록 가드.
  // 첫 onPlay에서 즉시 pause → await fade → play 순서로 강제.
  const handlePlay = async (e) => {
    if (skipNextFadeRef.current) {
      skipNextFadeRef.current = false;
      return;
    }
    const v = e.currentTarget;
    v.pause();
    await pauseAudioWithFade();
    skipNextFadeRef.current = true;
    try {
      await v.play();
    } catch {
      skipNextFadeRef.current = false;
    }
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
      className="w-full h-full object-contain bg-black"
    />
  );
}
