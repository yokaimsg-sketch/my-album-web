"use client";

import { useState, useRef, useEffect } from 'react';

// 💡 파트너님이 직접 생성하신 완벽한 보안 장부입니다.
const BUYER_DATA = {
  "1": {
    token: "a7b2c9d1",
    hash: "9b6f1058ccfff726689e4121ff81cd5d7d3e8f4fd107a744f29ad324f0618585", // 원래 PIN: 123456
    number: 1
  },
  "2": {
    token: "e4f8g2h1",
    hash: "22da12750f7ee23d75fd8f677fe454ae00cd30d0553d16975f75fd7377932e0c", // 원래 PIN: 654321
    number: 2
  },
  "3": {
    token: "m5n9p2r4",
    hash: "b0fb5eccfaead16265444efb5abc00a25040df61dc3ab9d50f49fbc081d474ee", // 원래 PIN: 111111
    number: 3
  }
};

export default function AlbumPage() {
  // === 시스템 상태 ===
  const [viewState, setViewState] = useState('loading'); 
  const [urlParams, setUrlParams] = useState({ id: null, token: null });
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [introOpacity, setIntroOpacity] = useState(0);

  // === UI & 플레이어 상태 ===
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

  // === 참조(Refs) ===
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const lyricContainerRef = useRef(null); 
  const lyricRefs = useRef([]);
  const fadeAnimationRef = useRef(null);
  const activeFadeResolve = useRef(null); 
  const isSeekingRef = useRef(false); 

  // --- 곡 정보 데이터 ---
  const trackList = [
    { 
      번호: 1, 제목: "타이틀곡 제목", 
      가사데이터: [
        { 시간: 0, 내용: "Pro;logue : The First의 첫 페이지를 엽니다 (0초)" },
        { 시간: 3, 내용: "여기서부터 우리의 이야기가 시작돼 (3초)" },
        { 시간: 6, 내용: "오래 기다려준 너를 위한 노래 (6초)" },
        { 시간: 9, 내용: "조금씩 선명해지는 멜로디 (9초)" },
        { 시간: 12, 내용: "시간이 흘러도 변치 않을 (12초)" },
        { 시간: 15, 내용: "비밀스러운 이 공간 안에서 (15초)" },
        { 시간: 18, 내용: "오직 너에게만 들려줄게 (18초)" },
        { 시간: 21, 내용: "이건 너와 나만의 Pro;logue : The First (21초)" },
        { 시간: 24, 내용: "가사 트래킹이 완벽하게 작동합니다 (24초)" },
        { 시간: 27, 내용: "화면이 부드럽게 스크롤됩니다 (27초)" },
        { 시간: 30, 내용: "마지막 테스트 줄입니다 (30초)" },
      ],
      음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track1.wav" 
    },
    { 번호: 2, 제목: "수록곡 2", 가사데이터: [{ 시간: 0, 내용: "두 번째 트랙 가사입니다." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track2.wav" },
    { 번호: 3, 제목: "수록곡 3", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track3.wav" },
    { 번호: 4, 제목: "수록곡 4", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track4.wav" },
    { 번호: 5, 제목: "수록곡 5", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track5.wav" },
    { 번호: 6, 제목: "수록곡 6", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track6.wav" },
    { 번호: 7, 제목: "수록곡 7", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track7.wav" },
  ];

  // --- [보안] URL 검증 ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const token = params.get('token');

    if (id && token && BUYER_DATA[id] && BUYER_DATA[id].token === token) {
      setUrlParams({ id, token });
      setBuyerInfo(BUYER_DATA[id]);
      setViewState('login');
    } else {
      setViewState('invalid'); 
    }
  }, []);

  // --- [보안] SHA-256 해싱 엔진 ---
  const hashString = async (string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pinInput.length !== 6) return;
    
    const saltedInput = `${urlParams.token}_${pinInput}`;
    const hashedInput = await hashString(saltedInput);
    
    if (hashedInput === buyerInfo.hash) {
      setViewState('intro');
    } else {
      setLoginError('잘못된 시크릿 PIN 번호입니다.');
      setPinInput('');
    }
  };

  // --- [연출] 인트로 시퀀스 ---
  useEffect(() => {
    if (viewState === 'intro') {
      setTimeout(() => setIntroOpacity(100), 100);
      setTimeout(() => setIntroOpacity(0), 3500);
      setTimeout(() => setViewState('main'), 4500);
    }
  }, [viewState]);

  // --- [오디오 엔진] 페이드 제어 ---
  const doFade = (targetVolume, durationMs = 150) => {
    return new Promise(resolve => {
      if (!audioRef.current) return resolve();
      if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current);
      if (activeFadeResolve.current) activeFadeResolve.current(); 

      activeFadeResolve.current = resolve;
      const startVolume = audioRef.current.volume;
      const volumeDiff = targetVolume - startVolume;

      if (Math.abs(volumeDiff) < 0.01) {
        audioRef.current.volume = targetVolume;
        activeFadeResolve.current = null;
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
          activeFadeResolve.current = null;
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
      if (wasPlaying) await doFade(0, 150);
      audioRef.current.muted = true;
      if (wasPlaying) audioRef.current.pause();
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
          if (audioRef.current) audioRef.current.volume = 1; 
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
        if (!isMuted) {
          await doFade(1, 200);
          if (audioRef.current) audioRef.current.volume = 1; 
        }
      }
    } catch (e) {
      console.error("Playback error:", e);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.volume = 1; 
    } finally {
      isSeekingRef.current = false;
    }
  };

  const changeTrack = async (direction) => {
    if (isSeekingRef.current) return;
    isSeekingRef.current = true;
    try {
      if (isPlaying) {
        await doFade(0, 150);
        audioRef.current.pause();
      }
      if (direction === 'next') setCurrentTrack(prev => (prev < 7 ? prev + 1 : 1));
      else setCurrentTrack(prev => (prev > 1 ? prev - 1 : 7));
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

  // --- 곡 변경 시 자동 이어서 재생 엔진 ---
  useEffect(() => {
    if (audioRef.current && viewState === 'main') {
      audioRef.current.pause();
      audioRef.current.load();
      setCurrentTime(0);
      setActiveLyricIndex(0);
      audioRef.current.muted = isMuted;

      if (isPlaying) {
        audioRef.current.volume = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            doFade(1, 200).then(() => {
              if (audioRef.current && !isMuted) audioRef.current.volume = 1;
            }); 
          }).catch((error) => {
            console.error("오토플레이 방지됨:", error);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentTrack]); 

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
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    executeSeek(newTime, false);
  };

  const seekTo = (time) => {
    executeSeek(time, true);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return min + ":" + (sec < 10 ? "0" + sec : sec);
  };

  // --- [가사 트래킹 로직] ---
  useEffect(() => {
    if (!isDragging && viewState === 'main') {
      const lyrics = trackList[currentTrack - 1].가사데이터;
      const index = lyrics.findLastIndex(lyric => lyric.시간 <= currentTime);
      if (index !== -1 && index !== activeLyricIndex) setActiveLyricIndex(index);
    }
  }, [currentTime, currentTrack, isDragging, viewState]);

  useEffect(() => {
    if (isAutoScroll && lyricRefs.current[activeLyricIndex] && !isDragging && viewState === 'main') {
      lyricRefs.current[activeLyricIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLyricIndex, isAutoScroll, isDragging, viewState]);

  // --- 화면 렌더링 ---
  if (viewState === 'loading') return <div className="min-h-screen bg-black" />;
  
  if (viewState === 'invalid') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
      <div className="animate-fade-in">
        <h1 className="text-red-500 font-bold mb-4 tracking-widest uppercase">Invalid Access</h1>
        <p className="text-gray-500 text-sm leading-relaxed">비정상적인 접근입니다.<br/>앨범 전용 링크를 통해 접속해 주세요.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden relative">
      <audio ref={audioRef} src={trackList[currentTrack - 1].음원} crossOrigin="anonymous" onLoadedMetadata={(e) => setDuration(e.target.duration)} onTimeUpdate={() => !isDragging && setCurrentTime(audioRef.current.currentTime)} onEnded={() => changeTrack('next')} preload="auto" playsInline />

      {/* 1. 로그인 화면 */}
      {viewState === 'login' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 px-4">
          <div className="max-w-sm w-full space-y-10 text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-[0.1em] text-yellow-400 leading-tight">
              Pro;logue :<br />
              The First
            </h1>
            <div className="space-y-2">
              <p className="text-gray-500 text-xs tracking-widest uppercase">Digital Experience</p>
              <p className="text-yellow-400/40 text-[10px] tracking-widest font-mono uppercase">Buyer No. {buyerInfo?.number}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-8 pt-4">
              <input type="password" inputMode="numeric" maxLength={6} value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))} placeholder="••••••" className="w-full bg-transparent border-b-2 border-gray-800 text-white text-center px-4 py-4 focus:outline-none focus:border-yellow-400 transition-all tracking-[0.8em] text-3xl font-light" />
              {loginError && <p className="text-red-500 text-[10px] tracking-wider">{loginError}</p>}
              <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl active:scale-95 transition-all text-sm tracking-widest">ACCESS NOW</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. 인트로 연출 */}
      {viewState === 'intro' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 px-6 text-center transition-opacity duration-1000" style={{ opacity: introOpacity / 100 }}>
          <p className="text-gray-500 text-xs tracking-[0.4em] mb-6 uppercase">Welcome</p>
          <h1 className="text-2xl font-light leading-relaxed">
            당신은 <span className="text-yellow-400 font-bold underline underline-offset-8 decoration-1">{buyerInfo?.number}번째</span><br/>
            앨범 구매자이십니다.
          </h1>
        </div>
      )}

      {/* 3. 메인 플레이어 */}
      {viewState === 'main' && (
        <div className="animate-fade-in pb-48">
          <div className="sticky top-0 z-40 bg-black/95 border-b border-gray-900 flex justify-center space-x-12 p-5 shadow-2xl">
            <button onClick={() => setCurrentTab('메인')} className={currentTab === '메인' ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1' : 'text-gray-500'}>Main</button>
            <button onClick={() => setCurrentTab('비하인드')} className={currentTab === '비하인드' ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-1' : 'text-gray-500'}>Behind</button>
          </div>

          {currentTab === '메인' && (
            <div className="p-4 max-w-xl mx-auto space-y-8 mt-4">
              
              <div className="bg-yellow-500/5 border border-yellow-500/20 text-yellow-400/80 text-xs text-center py-2.5 rounded-full tracking-widest">
                NO.{buyerInfo?.number} 구매자님을 위한 Pro;logue
              </div>

              <div className="bg-gray-950/50 rounded-3xl border border-gray-900 overflow-hidden shadow-inner">
                <div onClick={() => setIsListOpen(!isListOpen)} className="p-6 flex justify-between items-center cursor-pointer active:bg-gray-900 transition-colors">
                  <span className="font-bold text-gray-400 text-sm tracking-widest uppercase">Tracklist</span>
                  <span className="text-gray-600 text-xs">{isListOpen ? '▲' : '▼'}</span>
                </div>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isListOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-5 pt-0 space-y-3">
                    {trackList.map((t) => (
                      <button key={t.번호} onClick={() => {setCurrentTrack(t.번호); setIsListOpen(false);}} className={`w-full text-left p-4 rounded-2xl transition-all ${currentTrack === t.번호 ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-900/50 text-gray-400 hover:bg-gray-900'}`}>
                        {String(t.번호).padStart(2, '0')}. {t.제목}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 p-8 rounded-3xl border border-gray-900 flex flex-col items-center relative min-h-[450px] shadow-2xl">
                <div className="w-full flex justify-between items-center mb-8">
                  <h1 className="text-xl font-bold text-yellow-400 tracking-wider">{trackList[currentTrack - 1].제목}</h1>
                  <button onClick={() => setIsAutoScroll(!isAutoScroll)} className={`text-[8px] px-3 py-1.5 rounded-full border tracking-widest transition-all ${isAutoScroll ? 'bg-yellow-500 text-black border-yellow-500 font-bold' : 'text-gray-600 border-gray-800'}`}>
                    AUTO
                  </button>
                </div>
                <div ref={lyricContainerRef} className="w-full h-80 overflow-y-auto overflow-x-hidden space-y-8 px-2 scrollbar-hide py-40">
                  {trackList[currentTrack - 1].가사데이터.map((lyric, index) => (
                    <div 
                      key={index} 
                      ref={el => lyricRefs.current[index] = el} 
                      onClick={() => seekTo(lyric.시간)} 
                      // 💡 변경점: AUTO OFF 일 때 전체 가사 선명하게 표시 + 활성 가사 노란색 강조
                      className={`transition-all duration-700 text-center py-2 cursor-pointer break-words leading-relaxed ${
                        !isAutoScroll 
                          ? (activeLyricIndex === index ? 'text-yellow-400 font-bold opacity-100' : 'text-gray-300 opacity-100 hover:text-white')
                          : (activeLyricIndex === index ? 'text-white text-xl font-bold scale-110 opacity-100' : 'text-gray-700 opacity-20 scale-100')
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
            <div className="p-20 text-center animate-pulse">
              <p className="text-gray-600 text-xs tracking-[0.5em] uppercase font-light">Loading Archive...</p>
            </div>
          )}

          <div className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-500 ${isMinimized ? 'translate-y-[calc(100%-60px)]' : 'translate-y-0'}`}>
            <div className="w-full max-w-md bg-gray-900/90 border-t border-gray-800 rounded-t-[2.5rem] shadow-2xl backdrop-blur-2xl pointer-events-auto flex flex-col px-6 pb-10">
              <div onClick={() => setIsMinimized(!isMinimized)} className="w-full h-14 flex items-center justify-center cursor-pointer active:opacity-40">
                <div className="w-10 h-1 bg-gray-800 rounded-full" />
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <button onClick={() => changeTrack('prev')} className="p-2 text-gray-500 active:scale-75 transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                  <div className="text-yellow-400 font-bold text-xs tracking-widest uppercase">{trackList[currentTrack - 1].제목}</div>
                  <button onClick={() => changeTrack('next')} className="p-2 text-gray-500 active:scale-75 transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-10.5 0l8.5 6-8.5 6z"/></svg></button>
                </div>
                <div className="flex items-center space-x-5">
                  <button onClick={togglePlay} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all shrink-0">
                    {isPlaying ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z"/></svg>}
                  </button>
                  <div className="flex-grow flex flex-col space-y-3">
                    <div ref={progressBarRef} onPointerDown={(e) => { setIsDragging(true); handlePointerDown(e); }} onPointerMove={(e) => isDragging && handleDrag(e)} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className="h-6 flex items-center cursor-pointer relative touch-none">
                      <div className="h-1 bg-gray-800 w-full rounded-full"><div className="h-full bg-yellow-400 rounded-full" style={{ width: (duration ? (currentTime / duration * 100) : 0) + '%' }} /></div>
                      <div className="absolute w-3 h-3 bg-white rounded-full shadow-lg" style={{ left: `calc(${(duration ? (currentTime / duration * 100) : 0)}% - 6px)` }} />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-gray-600 tracking-tighter"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
                  </div>
                  
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
      )}
      
      <style jsx global>{`
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}