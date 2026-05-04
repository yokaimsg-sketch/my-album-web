"use client";

import { useState, useRef, useEffect } from 'react';

const BUYER_DATA = {
  "1": { token: "a7b2c9d1", hash: "9b6f1058ccfff726689e4121ff81cd5d7d3e8f4fd107a744f29ad324f0618585", number: 1 },
  "2": { token: "e4f8g2h1", hash: "22da12750f7ee23d75fd8f677fe454ae00cd30d0553d16975f75fd7377932e0c", number: 2 },
  "3": { token: "m5n9p2r4", hash: "b0fb5eccfaead16265444efb5abc00a25040df61dc3ab9d50f49fbc081d474ee", number: 3 }
};

export default function AlbumPage() {
  const [viewState, setViewState] = useState('loading'); 
  const [urlParams, setUrlParams] = useState({ id: null, token: null });
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [introOpacity, setIntroOpacity] = useState(0);

  const [currentTrack, setCurrentTrack] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false); 

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const lyricContainerRef = useRef(null); 
  const lyricRefs = useRef([]);
  const fadeAnimationRef = useRef(null);
  const activeFadeResolve = useRef(null); 
  const isSeekingRef = useRef(false); 

  // 💡 디지털 믹서 엔진 참조
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceRef = useRef(null);

  const trackList = [
    { 
      번호: 1, 제목: "NONB - Fly again!", 앨범아트: "/cover1.jpg", 
      가사데이터: [
        { 시간: 28, 내용: "꿈속 만난 나의 모습" }, { 시간: 34.5, 내용: "그 모습이 아른거려" },
        { 시간: 41, 내용: "끝이 없는 반복들이" }, { 시간: 47.5, 내용: "나에게 또 소리쳐와" },
        { 시간: 54.5, 내용: "난 왜 흘러가는 시간 속에서" }, { 시간: 61, 내용: "되돌아보는 날들만이\n늘어날까" },
        { 시간: 67.5, 내용: "아직 늦지 않았으니까\n걱정은 하지 마" }, { 시간: 74.5, 내용: "끝까지 선명하게\n비춰주고 있으니까" },
        { 시간: 81, 내용: "눈 감으면 저 멀리\n펼쳐지는 하늘에" }, { 시간: 87.5, 내용: "잠깐 동안의 우리 세상으로" },
        { 시간: 97, 내용: "Fly again!" }, { 시간: 103.5, 내용: "Fly again!" },
        { 시간: 109, 내용: "꿈속 만난 나의 모습" }, { 시간: 115.5, 내용: "뒤돌아선" },
        { 시간: 119, 내용: "모습에 소리쳐봐" }, { 시간: 122, 내용: "난 왜 지나가는 시간 속에서" },
        { 시간: 129, 내용: "후회하는 날들만이\n늘어날까" }, { 시간: 135, 내용: "아직 늦지 않았으니까\n걱정은 하지 마" },
        { 시간: 142, 내용: "끝까지 선명하게\n비춰주고 있으니까" }, { 시간: 148.5, 내용: "눈 감으면 저 멀리\n펼쳐지는 하늘에" },
        { 시간: 155, 내용: "잠깐 동안의\n우리 세상으로" }, { 시간: 161, 내용: "날아가 보는 거야" },
        { 시간: 164, 내용: "우리 어떤 모습이라도" }, { 시간: 168.5, 내용: "결국 함께라면" },
        { 시간: 171.5, 내용: "끝은 나지 않을 거야" }, { 시간: 177, 내용: "아무리 높은 벽이 있어도" },
        { 시간: 181.5, 내용: "우리 세상으로 날아가" }, { 시간: 188.5, 내용: "아직 늦지 않았으니까\n걱정은 하지 마" },
        { 시간: 195, 내용: "이 길의 끝에서 우리\n함께 만날 거니까" }, { 시간: 201.5, 내용: "눈을 뜨면 그 앞에\n펼쳐지는 하늘에" },
        { 시간: 208, 내용: "끝이 없는 우리 세상으로" }, { 시간: 214, 내용: "날아가 보는 거야" },
        { 시간: 218, 내용: "Fly again!" }, { 시간: 224, 내용: "Fly again!" },
        { 시간: 231, 내용: "Fly again!" }, { 시간: 238, 내용: "Fly again!" }
      ],
      음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track1.wav" 
    }
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const token = params.get('token');
    if (id && token && BUYER_DATA[id]?.token === token) {
      setUrlParams({ id, token });
      setBuyerInfo(BUYER_DATA[id]);
      setViewState('login');
    } else { setViewState('invalid'); }
  }, []);

  const ensureAudioContext = () => {
    if (!audioCtxRef.current && audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      gainNodeRef.current = audioCtxRef.current.createGain();
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
  };

  const doFade = (targetVolume, durationMs = 150) => {
    return new Promise(resolve => {
      if (!gainNodeRef.current) return resolve();
      if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current);
      if (activeFadeResolve.current) activeFadeResolve.current(); 
      activeFadeResolve.current = resolve;
      
      const startVolume = gainNodeRef.current.gain.value;
      const volumeDiff = targetVolume - startVolume;
      const startTime = performance.now();

      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = startVolume + (volumeDiff * progress);
        }
        if (progress < 1) {
          fadeAnimationRef.current = requestAnimationFrame(animate);
        } else {
          if (gainNodeRef.current) gainNodeRef.current.gain.value = targetVolume;
          fadeAnimationRef.current = null;
          activeFadeResolve.current = null;
          resolve();
        }
      };
      fadeAnimationRef.current = requestAnimationFrame(animate);
    });
  };

  const executeSeek = async (newTime, forcePlay = false) => {
    if (!audioRef.current || isSeekingRef.current || audioRef.current.readyState === 0) return;
    isSeekingRef.current = true;
    const wasPlaying = isPlaying;
    const willPlay = wasPlaying || forcePlay;

    try {
      if (wasPlaying) {
          await doFade(0, 100); 
          audioRef.current.pause();
      }
      
      // 💡 찌꺼기 차단: 시간 이동 전 디지털 신호 완전 봉쇄
      if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setIsDragging(false);
      
      if (willPlay) {
        ensureAudioContext();
        
        // 💡 탐색 완료 신호 대기
        await new Promise(resolve => {
          const onSeeked = () => { audioRef.current.removeEventListener('seeked', onSeeked); resolve(); };
          audioRef.current.addEventListener('seeked', onSeeked);
          setTimeout(resolve, 200); 
        });

        await audioRef.current.play();
        setIsPlaying(true);
        
        // 💡 스피커 활성화 신호 대기
        await new Promise(resolve => {
          const onPlaying = () => { audioRef.current.removeEventListener('playing', onPlaying); resolve(); };
          audioRef.current.addEventListener('playing', onPlaying);
          setTimeout(resolve, 200);
        });

        await doFade(1, 400); 
      }
    } catch (e) { console.error(e); setIsPlaying(false); }
    finally { isSeekingRef.current = false; }
  };

  const togglePlay = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!audioRef.current || isSeekingRef.current) return;
    isSeekingRef.current = true;
    try {
      if (isPlaying) {
        setIsPlaying(false);
        await doFade(0, 150);
        audioRef.current.pause();
      } else {
        ensureAudioContext();
        if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        await new Promise(resolve => {
          const onPlaying = () => { audioRef.current.removeEventListener('playing', onPlaying); resolve(); };
          audioRef.current.addEventListener('playing', onPlaying);
          setTimeout(resolve, 200);
        });
        await doFade(1, 400); 
      }
    } catch (e) { console.error(e); setIsPlaying(false); }
    finally { isSeekingRef.current = false; }
  };

  useEffect(() => {
    if (audioRef.current && viewState === 'main') {
      audioRef.current.pause();
      audioRef.current.load();
      setCurrentTime(0);
      setActiveLyricIndex(0);
      if (isPlaying) {
        ensureAudioContext();
        if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
        audioRef.current.play().then(() => doFade(1, 400)).catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrack]); 

  const handlePointerDown = (e) => { e.currentTarget.setPointerCapture(e.pointerId); setIsDragging(true); };
  const handlePointerUp = (e) => { 
    e.currentTarget.releasePointerCapture(e.pointerId);
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    executeSeek(pos * duration, false);
  };
  const seekTo = (time) => executeSeek(time, true);
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60); const sec = Math.floor(time % 60);
    return min + ":" + (sec < 10 ? "0" + sec : sec);
  };

  useEffect(() => {
    if (!isDragging && viewState === 'main') {
      const lyrics = trackList[currentTrack - 1].가사데이터;
      const index = lyrics.findLastIndex(lyric => lyric.시간 <= currentTime);
      if (index !== -1 && index !== activeLyricIndex) setActiveLyricIndex(index);
    }
  }, [currentTime]);
  
  useEffect(() => {
    if (isAutoScroll && lyricRefs.current[activeLyricIndex] && !isDragging && viewState === 'main' && showLyrics) {
      lyricRefs.current[activeLyricIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLyricIndex, showLyrics]);

  if (viewState === 'loading') return <div className="min-h-screen" style={{ background: '#FFFFFF' }} />;
  if (viewState === 'invalid') return <div className="min-h-screen flex items-center justify-center text-center">비정상적인 접근입니다.</div>;

  return (
    <div className="min-h-screen text-gray-900 font-sans overflow-x-hidden relative" style={{ background: 'radial-gradient(circle at center, #FFFFFF 0%, #DDE1E5 100%)' }}>
      <audio ref={audioRef} src={trackList[currentTrack - 1].음원} crossOrigin="anonymous" onLoadedMetadata={(e) => setDuration(e.target.duration)} onTimeUpdate={() => !isDragging && setCurrentTime(audioRef.current.currentTime)} onEnded={() => executeSeek(0)} preload="auto" playsInline />

      {viewState === 'login' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 px-4">
          <h1 className="text-4xl font-bold tracking-[0.1em] text-[#E63946] mb-10">Pro;logue : The First</h1>
          <form onSubmit={(e) => {
            e.preventDefault();
            setViewState('intro');
          }} className="space-y-8 w-full max-w-sm">
            <input type="password" inputMode="numeric" maxLength={6} value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))} placeholder="••••••" className="w-full bg-transparent border-b-2 border-gray-400 text-center py-4 text-3xl tracking-[0.8em]" />
            <button type="submit" className="w-full bg-[#E63946] text-white font-bold py-4 rounded-xl">ACCESS NOW</button>
          </form>
        </div>
      )}

      {viewState === 'intro' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-center animate-fade-in" onAnimationEnd={() => setTimeout(() => setViewState('main'), 2000)}>
          <h1 className="text-2xl font-light">당신은 <span className="text-[#E63946] font-bold">1번째</span> 구매자이십니다.</h1>
        </div>
      )}

      {viewState === 'main' && (
        <div className="animate-fade-in pb-56">
          <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b flex justify-center space-x-12 p-5 shadow-sm">
            <button className="text-[#E63946] font-bold border-b-2 border-[#E63946]">Main</button>
            <button className="text-gray-500 font-bold">Behind</button>
          </div>
          <div className="p-4 max-w-xl mx-auto space-y-6 mt-4">
             <div className="bg-white/40 backdrop-blur-md rounded-3xl border relative min-h-[480px] shadow-lg overflow-hidden">
                <div className={`absolute inset-0 p-8 pb-16 flex items-center justify-center transition-all duration-700 ${showLyrics ? 'opacity-0 scale-95' : 'opacity-100'}`}>
                   <div className="w-full max-w-[280px] aspect-square bg-gray-200 rounded-[2rem] shadow-2xl overflow-hidden"><img src={trackList[currentTrack - 1].앨범아트} alt="Art" className="w-full h-full object-cover" /></div>
                </div>
                <div className={`absolute inset-0 p-8 flex flex-col transition-all duration-700 ${showLyrics ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-xl font-bold text-[#E63946] mb-6">{trackList[currentTrack - 1].제목}</h1>
                  <div ref={lyricContainerRef} className="flex-grow overflow-y-auto scrollbar-hide py-16">
                    {trackList[currentTrack - 1].가사데이터.map((lyric, index) => (
                      <div key={index} ref={el => lyricRefs.current[index] = el} onClick={() => seekTo(lyric.시간)} className={`transition-all duration-500 text-center py-2 text-lg font-bold ${activeLyricIndex === index ? 'text-[#1A1A1A] scale-[1.25]' : 'text-gray-400'}`} style={{ willChange: 'transform, opacity' }}>{lyric.내용}</div>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          <div className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center transition-transform duration-500 ${isMinimized ? 'translate-y-[calc(100%-60px)]' : ''}`}>
            <div className="w-full max-w-md bg-white/70 border-t rounded-t-[2.5rem] shadow-lg backdrop-blur-2xl px-8 pb-10">
              <div onClick={() => setIsMinimized(!isMinimized)} className="w-full h-10 flex items-center justify-center cursor-pointer"><div className="w-10 h-1.5 bg-gray-300 rounded-full" /></div>
              <div className="space-y-6">
                <div className="text-center font-bold text-[#E63946]">{trackList[currentTrack - 1].제목}</div>
                <div ref={progressBarRef} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} className="h-6 flex items-center cursor-pointer relative">
                    <div className="h-1.5 bg-gray-300 w-full rounded-full"><div className="h-full bg-[#E63946] rounded-full" style={{ width: (duration ? (currentTime / duration * 100) : 0) + '%' }} /></div>
                    <div className="absolute w-4 h-4 bg-white rounded-full shadow border" style={{ left: `calc(${(duration ? (currentTime / duration * 100) : 0)}% - 8px)` }} />
                </div>
                <div className="flex items-center justify-center space-x-10">
                  <button className="text-gray-500"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                  <button onClick={togglePlay} className="text-[#E63946]">{isPlaying ? <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}</button>
                  <button className="text-gray-500"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-10.5 0l8.5 6-8.5 6z"/></svg></button>
                  <button onClick={() => setShowLyrics(!showLyrics)} className={showLyrics ? 'text-[#E63946]' : 'text-gray-400'}><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9.5 13H8c0-1.5 1.5-3 1.5-3V8H7v5h1.5S8.5 14.5 7 14.5V16c2 0 2.5-3 2.5-3zm6 0H14c0-1.5 1.5-3 1.5-3V8h-2v5h1.5s0 1.5-1.5 1.5V16c2 0 2.5-3 2.5-3z"/></svg></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`.animate-fade-in { animation: fadeIn 0.8s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}