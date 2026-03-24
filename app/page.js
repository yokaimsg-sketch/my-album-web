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
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeRef = useRef(null);

  const trackList = [
    { 번호: 1, 제목: "타이틀곡 제목", 가사: "가사 내용...", 음원: "/track1.wav" },
    { 번호: 2, 제목: "수록곡 2", 가사: "가사 내용...", 음원: "/track2.wav" },
    { 번호: 3, 제목: "수록곡 3", 가사: "가사 내용...", 음원: "/track3.wav" },
    { 번호: 4, 제목: "수록곡 4", 가사: "가사 내용...", 음원: "/track4.wav" },
    { 번호: 5, 제목: "수록곡 5", 가사: "가사 내용...", 음원: "/track5.wav" },
    { 번호: 6, 제목: "수록곡 6", 가사: "가사 내용...", 음원: "/track6.wav" },
    { 번호: 7, 제목: "수록곡 7", 가사: "가사 내용...", 음원: "/track7.wav" },
  ];

  const togglePlay = (e) => {
    // 터치 이벤트를 확실히 잡기 위해 추가
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setCurrentTime(0);
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return min + ":" + (sec < 10 ? "0" + sec : sec);
  };

  // 다음/이전 곡 넘기기
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
            {isListOpen && (
              <div className="p-4 pt-0 space-y-2">
                {trackList.map((t) => (
                  <button key={t.번호} onClick={() => {setCurrentTrack(t.번호); setIsListOpen(false);}} className={`w-full text-left p-4 rounded-xl ${currentTrack === t.번호 ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-800'}`}>
                    {t.번호}. {t.제목}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col items-center">
            <h1 className="text-2xl font-bold text-yellow-400 mb-6">{trackList[currentTrack - 1].제목}</h1>
            <div className="w-full max-h-80 overflow-y-auto text-gray-300 leading-relaxed text-center whitespace-pre-wrap px-2">
              {trackList[currentTrack - 1].가사}
            </div>
          </div>
        </div>
      )}

      {currentTab === '비하인드' && (
        <div className="p-10 text-center text-gray-500">준비 중인 공간입니다.</div>
      )}

      {/* 하단 재생기 - z-index 조절 및 클릭 방해 요소 제거 */}
      <div className="fixed bottom-10 left-0 right-0 z-50 px-4">
        <div className="max-w-md mx-auto bg-gray-900 border border-gray-700 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
          
          <div className="flex items-center justify-between mb-4 px-2">
            <button onClick={() => changeTrack('prev')} className="p-2 text-gray-400 active:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <div className="text-yellow-400 font-bold text-sm truncate px-4">{trackList[currentTrack - 1].제목}</div>
            <button onClick={() => changeTrack('next')} className="p-2 text-gray-400 active:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-10.5 0l8.5 6-8.5 6z"/></svg>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={togglePlay} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-90">
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <div className="flex-grow flex flex-col space-y-1">
              <div ref={progressBarRef} onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = pos * duration;
              }} className="h-2 bg-gray-700 rounded-full relative overflow-hidden cursor-pointer">
                <div className="h-full bg-yellow-400" style={{ width: (duration ? (currentTime / duration * 100) : 0) + '%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="relative">
              <button onClick={() => setShowVolume(!showVolume)} className="p-2 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              </button>
              {showVolume && (
                <div className="absolute bottom-14 right-0 bg-gray-800 p-4 rounded-2xl border border-gray-700 h-32 flex justify-center shadow-2xl z-50">
                  <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    audioRef.current.volume = v;
                  }} style={{ WebkitAppearance: 'slider-vertical', height: '100px' }} className="accent-yellow-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}