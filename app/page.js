"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

export default function AlbumPage() {
  const [currentTab, setCurrentTab] = useState('메인');
  const [currentTrack, setCurrentTrack] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeRef = useRef(null);
  const lyricContainerRef = useRef(null); 
  const lyricRefs = useRef([]);

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
      음원: "/track1.wav" 
    },
    { 번호: 2, 제목: "수록곡 2", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "/track2.wav" },
    { 번호: 3, 제목: "수록곡 3", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "/track3.wav" },
    { 번호: 4, 제목: "수록곡 4", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "/track4.wav" },
    { 번호: 5, 제목: "수록곡 5", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "/track5.wav" },
    { 번호: 6, 제목: "수록곡 6", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "/track6.wav" },
    { 번호: 7, 제목: "수록곡 7", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "/track7.wav" },
  ];

  const initAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const gainNode = ctx.createGain();
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(gainNode).connect(ctx.destination);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      audioCtxRef.current = ctx;
      gainNodeRef.current = gainNode;
    }
  }, [volume]);

  // 확실하게 기다려주는 스마트 페이드 함수 (0.2초)
  const doFade = async (targetGain, durationSec = 0.2) => {
    if (!gainNodeRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    
    const gain = gainNodeRef.current.gain;
    const now = ctx.currentTime;
    
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(Math.max(targetGain, 0.001), now + durationSec);
    
    // 페이드가 완전히 끝날 때까지 프로그램이 대기함
    return new Promise(resolve => setTimeout(resolve, durationSec * 1000));
  };

  const togglePlay = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    initAudioCtx();
    
    if (isPlaying) {
      await doFade(0.001); // 소리가 꺼질 때까지 기다림
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
      gainNodeRef.current.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
      await audioRef.current.play(); // 무음 상태로 재생 시작
      setIsPlaying(true);
      await doFade(volume); // 서서히 볼륨 업
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

  const handlePointerUp = async (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;

    initAudioCtx();

    if (isPlaying) {
      await doFade(0.001); // 페이드 아웃 완료 대기
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setIsDragging(false); // 이동 완료 후 드래그 해제
      await doFade(volume); // 다시 페이드 인
    } else {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setIsDragging(false);
    }
  };

  const seekTo = async (time) => {
    initAudioCtx();
    if (isPlaying) {
      await doFade(0.001);
      audioRef.current.currentTime = time;
      await doFade(volume);
    } else {
      audioRef.current.currentTime = time;
      if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
      gainNodeRef.current.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
      await audioRef.current.play();
      setIsPlaying(true);
      await doFade(volume);
    }
  };

  const changeTrack = async (direction) => {
    if (isPlaying) await doFade(0.001);
    if (direction === 'next') {
      setCurrentTrack(prev => (prev < 7 ? prev + 1 : 1));
    } else {
      setCurrentTrack(prev => (prev > 1 ? prev - 1 : 7));
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return min + ":" + (sec < 10 ? "0" + sec : sec);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1;
      if (gainNodeRef.current) doFade(volume, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    const lyrics = trackList[currentTrack - 1].가사데이터;
    const index = lyrics.findLastIndex(lyric => lyric.시간 <= currentTime);
    if (index !== -1 && index !== activeLyricIndex) setActiveLyricIndex(index);
  }, [currentTime, currentTrack]);

  useEffect(() => {
    if (isAutoScroll && lyricRefs.current[activeLyricIndex]) {
      lyricRefs.current[activeLyricIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLyricIndex, isAutoScroll]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        setShowVolume(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setCurrentTime(0);
      setActiveLyricIndex(0);
      if (isPlaying) {
        if (gainNodeRef.current) gainNodeRef.current.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
        audioRef.current.play().then(() => {
          doFade(volume, 0.2);
        }).catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]);

  return (
    <div className="min-h-screen bg-black text-white pb-48 font-sans overflow-x-hidden">
      <audio 
        ref={audioRef} 
        src={trackList[currentTrack - 1].음원}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={() => !isDragging && setCurrentTime(audioRef.current.currentTime)}
        onEnded={() => changeTrack('next')}
        preload="auto" playsInline
      />

      {/* 상단 탭 */}
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

            <div ref={lyricContainerRef} className="w-full h-80 overflow-y-auto space-y-6 px-2 scrollbar-hide py-32">
              {trackList[currentTrack - 1].가사데이터.map((lyric, index) => (
                <div 
                  key={index} ref={el => lyricRefs.current[index] = el}
                  onClick={() => seekTo(lyric.시간)}
                  className={`transition-all duration-500 text-center py-2 cursor-pointer touch-none ${
                    !isAutoScroll ? 'text-white opacity-100 select-text' : 
                    activeLyricIndex === index ? 'text-white text-xl font-bold scale-110 opacity-100' : 'text-gray-600 opacity-30 scale-100'
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

      {/* 완벽하게 분리된 하단 플레이어 래퍼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div 
          className={`w-full max-w-md px-4 transition-transform duration-500 ease-in-out pointer-events-auto flex flex-col items-center
            ${isMinimized ? 'translate-y-[calc(100%-40px)]' : 'translate-y-[-24px]'}`}
        >
          {/* 독립적인 상단 버튼 (높이 40px) */}
          <div 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="w-16 h-10 bg-gray-900 border border-gray-700 border-b-0 rounded-t-2xl flex items-center justify-center cursor-pointer shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-50"
          >
            {isMinimized ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 mt-1">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mt-1">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </div>

          {/* 플레이어 본체 */}
          <div className="w-full bg-gray-900/95 border border-gray-700 rounded-3xl p-5 shadow-2xl backdrop-blur-xl -mt-[1px]">
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
                {/* 터치 포인터 캡처가 적용된 드래그 영역 */}
                <div 
                  ref={progressBarRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={(e) => isDragging && handleDrag(e)}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="h-6 flex items-center cursor-pointer relative -my-1"
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

              <div className="relative flex items-center" ref={volumeRef}>
                <button onClick={() => setShowVolume(!showVolume)} className="p-3 text-gray-400 active:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                </button>
                {showVolume && (
                  <div className="absolute bottom-14 right-[-4px] bg-gray-800/95 p-4 rounded-full border border-gray-700 h-36 w-10 flex flex-col justify-center items-center shadow-2xl z-50 backdrop-blur-sm">
                    <input 
                      type="range" min="0" max="1" step="0.01" value={volume} 
                      onChange={(e) => setVolume(parseFloat(e.target.value))} 
                      style={{ WebkitAppearance: 'slider-vertical', height: '110px', width: '20px' }} 
                      className="accent-yellow-400 cursor-pointer opacity-80" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}