"use client";

import { useState, useRef, useEffect } from 'react';

export default function AlbumPage() {
  const [currentTab, setCurrentTab] = useState('메인');
  const [currentTrack, setCurrentTrack] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const lyricContainerRef = useRef(null); 
  const lyricRefs = useRef([]);
  
  const fadeAnimationRef = useRef(null);
  const isSeekingRef = useRef(false); 

  // 💡 나중에 R2에 파일을 올리면 아래 음원 경로를 "https://r2-주소.../track1.wav" 로 바꾸기만 하면 됩니다!
  const trackList = [
    { 
      번호: 1, 제목: "타이틀곡 제목", 
      가사데이터: [
        { 시간: 0, 내용: "첫 번째 가사 줄입니다 (0초)" },
        { 시간: 3, 내용: "두 번째 가사 줄이 나옵니다 (3초)" },
        { 시간: 6, 내용: "세 번째 줄, 하이라이트 테스트 (6초)" },
        { 시간: 9, 내용: "네 번째 줄입니다 (9초)" },
        { 시간: 12, 내용: "다섯 번째 줄, 자동으로 올라가요 (12초)" },
        { 시간: 15, 내용: "여섯 번째 줄 (15초)" },
        { 시간: 18, 내용: "일곱 번째 줄 (18초)" },
        { 시간: 21, 내용: "마지막 테스트 문구입니다 (21초)" },
      ],
      음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track1.wav" 
    },
    { 번호: 2, 제목: "수록곡 2", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track2.wav" },
    { 번호: 3, 제목: "수록곡 3", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track3.wav" },
    { 번호: 4, 제목: "수록곡 4", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track4.wav" },
    { 번호: 5, 제목: "수록곡 5", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track5.wav" },
    { 번호: 6, 제목: "수록곡 6", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track6.wav" },
    { 번호: 7, 제목: "수록곡 7", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track7.wav" },
  ];

  const doFade = (targetVolume, durationMs = 150) => {
    return new Promise(resolve => {
      if (!audioRef.current) return resolve();
      if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current);

      const startVolume = audioRef.current.volume;
      const volumeDiff = targetVolume - startVolume;
      
      if (Math.abs(volumeDiff) < 0.01) {
        audioRef.current.volume = targetVolume;
        return resolve();
      }

      const startTime = performance.now();

      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        
        audioRef.current.volume = Math.max(0, Math.min(1, startVolume + (volumeDiff * progress)));

        if (progress < 1) {
          fadeAnimationRef.current = requestAnimationFrame(animate);
        } else {
          audioRef.current.volume = Math.max(0, Math.min(1, targetVolume));
          fadeAnimationRef.current = null;
          resolve();
        }
      };
      fadeAnimationRef.current = requestAnimationFrame(animate);
    });
  };

  const executeSeek = async (newTime, forcePlay = false) => {
    if (!audioRef.current || isSeekingRef.current) return;
    isSeekingRef.current = true;

    const wasPlaying = isPlaying;
    const willPlay = wasPlaying || forcePlay;

    try {
      if (wasPlaying) {
        await doFade(0, 150); 
      }

      audioRef.current.muted = true;

      if (wasPlaying) {
        audioRef.current.pause(); 
      }

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setIsDragging(false);

      if (willPlay) {
        await new Promise(r => setTimeout(r, 80)); 
        
        audioRef.current.volume = 0; 
        await audioRef.current.play();
        setIsPlaying(true);
        
        await new Promise(r => setTimeout(r, 50));
        
        audioRef.current.muted = isMuted; 
        
        if (!isMuted) {
          await doFade(1, 200); 
        }
      } else {
        audioRef.current.muted = isMuted;
      }
    } catch (e) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.muted = isMuted;
    } finally {
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
        audioRef.current.volume = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        if (!isMuted) await doFade(1, 200);
      }
    } catch (e) {
      setIsPlaying(false);
    } finally {
      isSeekingRef.current = false;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    
    executeSeek(newTime, false);
  };

  const seekTo = (time) => {
    executeSeek(time, true);
  };

  const changeTrack = async (direction) => {
    if (isSeekingRef.current) return;
    isSeekingRef.current = true;

    try {
      if (isPlaying) {
        await doFade(0, 150);
        audioRef.current.pause();
      }
      if (direction === 'next') {
        setCurrentTrack(prev => (prev < 7 ? prev + 1 : 1));
      } else {
        setCurrentTrack(prev => (prev > 1 ? prev - 1 : 7));
      }
    } finally {
      isSeekingRef.current = false;
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return min + ":" + (sec < 10 ? "0" + sec : sec);
  };

  useEffect(() => {
    if (!isDragging) {
      const lyrics = trackList[currentTrack - 1].가사데이터;
      const index = lyrics.findLastIndex(lyric => lyric.시간 <= currentTime);
      if (index !== -1 && index !== activeLyricIndex) setActiveLyricIndex(index);
    }
  }, [currentTime, currentTrack, isDragging]);

  useEffect(() => {
    if (isAutoScroll && lyricRefs.current[activeLyricIndex] && !isDragging) {
      lyricRefs.current[activeLyricIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLyricIndex, isAutoScroll, isDragging]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setCurrentTime(0);
      setActiveLyricIndex(0);
      audioRef.current.muted = isMuted;
      
      if (isPlaying) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          doFade(1, 200);
        }).catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]);

  return (
    <div className="min-h-screen bg-black text-white pb-48 font-sans overflow-x-hidden">
      {/* 💡 여기에 crossOrigin="anonymous" 속성이 추가되었습니다! */}
      <audio 
        ref={audioRef} 
        src={trackList[currentTrack - 1].음원}
        crossOrigin="anonymous" 
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={() => !isDragging && setCurrentTime(audioRef.current.currentTime)}
        onEnded={() => changeTrack('next')}
        preload="auto" playsInline
      />

      <div className="sticky top-0 z-40 bg-black/95 border-b border-gray-800 flex justify-center space-x-10 p-4 shadow-md">
        <button onClick={() => setCurrentTab('메인')} className={currentTab === '메인' ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1' : 'text-gray-400'}>메인 화면</button>
        <button onClick={() => setCurrentTab('비하인드')} className={currentTab === '비하인드' ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1' : 'text-gray-400'}>비하인드</button>
      </div>

      {currentTab === '메인' && (
        <div className="p-4 max-w-xl mx-auto space-y-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div onClick={() => setIsListOpen(!isListOpen)} className="p-5 flex justify-between items-center cursor-pointer active:bg-gray-800 transition-colors">
              <span className="font-bold text-gray-300">수록곡 목록</span>
              <span className="text-gray-500">{isListOpen ? '▲' : '▼'}</span>
            </div>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isListOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 pt-0 space-y-2">
                {trackList.map((t) => (
                  <button key={t.번호} onClick={() => {setCurrentTrack(t.번호); setIsListOpen(false);}} className={`w-full text-left p-4 rounded-xl transition-all ${currentTrack === t.번호 ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-800 hover:bg-gray-700'}`}>
                    {t.번호}. {t.제목}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col items-center relative min-h-[400px]">
            <div className="w-full flex justify-between items-center mb-6 px-2">
              <h1 className="text-xl font-bold text-yellow-400 flex-grow text-center">{trackList[currentTrack - 1].제목}</h1>
              <button onClick={() => setIsAutoScroll(!isAutoScroll)} className={`text-[9px] px-2 py-1 rounded border whitespace-nowrap transition-colors ${isAutoScroll ? 'bg-yellow-500 text-black border-yellow-500' : 'text-gray-500 border-gray-700'}`}>
                {isAutoScroll ? 'AUTO ON' : 'AUTO OFF'}
              </button>
            </div>

            <div ref={lyricContainerRef} className="w-full h-80 overflow-y-auto overflow-x-hidden space-y-6 px-2 scrollbar-hide py-32">
              {trackList[currentTrack - 1].가사데이터.map((lyric, index) => (
                <div 
                  key={index} ref={el => lyricRefs.current[index] = el}
                  onClick={() => seekTo(lyric.시간)}
                  className={`transition-all duration-500 text-center py-2 cursor-pointer break-words ${
                    !isAutoScroll ? 'text-white opacity-100 select-text' : 
                    activeLyricIndex === index ? 'text-white text-xl font-bold scale-110 opacity-100 select-none' : 'text-gray-600 opacity-30 scale-100 select-none'
                  }`}
                >
                  {lyric.내용}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentTab === '비하인드' && (
        <div className="p-10 text-center text-gray-500 font-light">작업 비하인드가 곧 업데이트됩니다.</div>
      )}

      <div className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-500 ease-in-out ${isMinimized ? 'translate-y-[calc(100%-48px)]' : 'translate-y-0'}`}>
        <div className="w-full max-w-md bg-gray-900/95 border border-gray-700 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl pointer-events-auto flex flex-col px-4 pb-8">
          
          <div 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="w-full h-12 flex items-center justify-center cursor-pointer active:opacity-50"
          >
            {isMinimized ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <button onClick={() => changeTrack('prev')} className="p-2 text-gray-400 active:scale-90 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              <div className="text-yellow-400 font-bold text-xs truncate px-4">{trackList[currentTrack - 1].제목}</div>
              <button onClick={() => changeTrack('next')} className="p-2 text-gray-400 active:scale-90 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-10.5 0l8.5 6-8.5 6z"/></svg>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button onClick={togglePlay} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0">
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>

              <div className="flex-grow flex flex-col space-y-2 group">
                <div 
                  ref={progressBarRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={(e) => isDragging && handleDrag(e)}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="h-6 flex items-center cursor-pointer relative -my-1 touch-none"
                >
                  <div className="h-1.5 bg-gray-700 w-full rounded-full pointer-events-none">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: (duration ? (currentTime / duration * 100) : 0) + '%' }}></div>
                  </div>
                  <div 
                    className="absolute w-4 h-4 bg-white rounded-full shadow-md border border-gray-300 pointer-events-none"
                    style={{ left: `calc(${(duration ? (currentTime / duration * 100) : 0)}% - 8px)` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-500 px-0.5 pointer-events-none">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="relative flex items-center pl-2">
                <button onClick={toggleMute} className="p-2 text-gray-400 active:text-white transition-colors">
                  {isMuted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}