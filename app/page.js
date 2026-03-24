"use client";

import { useState, useRef, useEffect } from 'react';

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
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeRef = useRef(null);
  const lyricContainerRef = useRef(null);
  const lyricRefs = useRef([]);

  const trackList = [
    { 
      번호: 1, 
      제목: "타이틀곡 제목", 
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

  useEffect(() => {
    const lyrics = trackList[currentTrack - 1].가사데이터;
    const index = lyrics.findLastIndex(lyric => lyric.시간 <= currentTime);
    
    if (index !== -1 && index !== activeLyricIndex) {
      setActiveLyricIndex(index);
    }
  }, [currentTime, currentTrack]);

  useEffect(() => {
    if (isAutoScroll && lyricRefs.current[activeLyricIndex]) {
      lyricRefs.current[activeLyricIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex, isAutoScroll]);

  const togglePlay = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setCurrentTime(0);
      setActiveLyricIndex(0);
      audioRef.current.volume = volume;
      if (isPlaying) { audioRef.current.play().catch(() => setIsPlaying(false)); }
    }
  }, [currentTrack]);

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

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return min + ":" + (sec < 10 ? "0" + sec : sec);
  };

  const changeTrack = (direction) => {
    if (direction === 'next') {
      setCurrentTrack(currentTrack < 7 ? currentTrack + 1 : 1);
    } else {
      setCurrentTrack(currentTrack > 1 ? currentTrack - 1 : 7);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-48 font-sans overflow-x-hidden">
      <audio 
        ref={audioRef} 
        src={trackList[currentTrack - 1].음원}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onEnded={() => changeTrack('next')}
        preload="auto"
        playsInline
      />

      <div className="sticky top-0 z-40 bg-black/95 border-b border-gray-800 flex justify-center space-x-10 p-4">
        <button onClick={() => setCurrentTab('메인')} className={currentTab === '메인' ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1' : 'text-gray-400'}>메인 화면</button>
        <button onClick={() => setCurrentTab('비하인드')} className={currentTab === '비하인드' ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1' : 'text-gray-400'}>비하인드</button>
      </div>

      {currentTab === '메인' && (
        <div className="p-4 max-w-xl mx-auto space-y-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div onClick={() => setIsListOpen(!isListOpen)} className="p-5 flex justify-between items-center cursor-pointer active:bg-gray-800">
              <span className="font-bold text-gray-300">수록곡 목록</span>
              <span className="text-gray-500">{isListOpen ? '▲' : '▼'}</span>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isListOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 pt-0 space-y-2">
                {trackList.map((t) => (
                  <button key={t.번호} onClick={() => {setCurrentTrack(t.번호); setIsListOpen(false);}} className={`w-full text-left p-4 rounded-xl ${currentTrack === t.번호 ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-800'}`}>
                    {t.번호}. {t.제목}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col items-center relative">
            <div className="w-full flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-yellow-400 ml-auto mr-auto">{trackList[currentTrack - 1].제목}</h1>
              <button 
                onClick={() => setIsAutoScroll(!isAutoScroll)}
                className={`text-[10px] px-2 py-1 rounded border absolute right-6 transition-colors ${isAutoScroll ? 'bg-yellow-500 text-black border-yellow-500' : 'text-gray-500 border-gray-700'}`}
              >
                {isAutoScroll ? '자동 스크롤 ON' : '자동 스크롤 OFF'}
              </button>
            </div>

            <div 
              ref={lyricContainerRef}
              className="w-full h-80 overflow-y-auto space-y-4 px-2 scrollbar-hide py-20"
            >
              {trackList[currentTrack - 1].가사데이터.map((lyric, index) => (
                <div 
                  key={index}
                  ref={el => lyricRefs.current[index] = el}
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = lyric.시간;
                      if (!isPlaying) {
                        audioRef.current.play().then(() => setIsPlaying(true));
                      }
                    }
                  }}
                  className={`transition-all duration-500 text-center py-2 cursor-pointer ${
                    !isAutoScroll 
                    ? 'text-white opacity-100 select-text' 
                    : activeLyricIndex === index 
                    ? 'text-white text-xl font-bold scale-110 opacity-100 select-none' 
                    : 'text-gray-600 opacity-40 scale-100 select-none'
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

      <div className="fixed bottom-10 left-0 right-0 z-50 px-4">
        <div className="max-w-md mx-auto bg-gray-900/95 border border-gray-700 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4 px-2">
            <button onClick={() => changeTrack('prev')} className="p-2 text-gray-400 active:opacity-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <div className="text-yellow-400 font-bold text-xs md:text-sm truncate px-4">{trackList[currentTrack - 1].제목}</div>
            <button onClick={() => changeTrack('next')} className="p-2 text-gray-400 active:opacity-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-10.5 0l8.5 6-8.5 6z"/></svg>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={togglePlay} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <div className="flex-grow flex flex-col space-y-1">
              <div ref={progressBarRef} onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = pos / (1 / duration);
              }} className="h-1.5 bg-gray-700 rounded-full relative overflow-hidden cursor-pointer">
                <div className="h-full bg-yellow-400" style={{ width: (duration ? (currentTime / duration / 0.01) : 0) + '%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="relative flex items-center" ref={volumeRef}>
              <button onClick={() => setShowVolume(!showVolume)} className="p-2 text-gray-400 active:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              </button>
              {showVolume && (
                <div className="absolute bottom-14 right-[-4px] bg-gray-800/95 p-3 rounded-full border border-gray-700 h-32 w-8 flex flex-col justify-center items-center shadow-2xl z-50 backdrop-blur-sm">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      audioRef.current.volume = v;
                    }} 
                    style={{ WebkitAppearance: 'slider-vertical', height: '100px', width: '4px' }} 
                    className="accent-yellow-400 cursor-pointer" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}