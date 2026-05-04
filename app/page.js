"use client";

import { useState, useRef, useEffect } from 'react';

// 💡 파트너님이 직접 생성하신 완벽한 보안 장부입니다.
const BUYER_DATA = {
  "1": {
    token: "a7b2c9d1",
    hash: "9b6f1058ccfff726689e4121ff81cd5d7d3e8f4fd107a744f29ad324f0618585", 
    number: 1
  },
  "2": {
    token: "e4f8g2h1",
    hash: "22da12750f7ee23d75fd8f677fe454ae00cd30d0553d16975f75fd7377932e0c", 
    number: 2
  },
  "3": {
    token: "m5n9p2r4",
    hash: "b0fb5eccfaead16265444efb5abc00a25040df61dc3ab9d50f49fbc081d474ee", 
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
  const isMuted = false; 
  const [isListOpen, setIsListOpen] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false); 

  // === 참조(Refs) ===
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const lyricContainerRef = useRef(null); 
  const lyricRefs = useRef([]);
  const fadeAnimationRef = useRef(null);
  const activeFadeResolve = useRef(null); 
  // 💡 구버전의 핵심 방패: 재생/이동 중 연타 방지 락(Lock) 원복
  const isSeekingRef = useRef(false); 

  // === 오디오 리액티브 & 배경 참조 ===
  const bgRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);

  // --- 곡 정보 데이터 (신규 가사 적용 완료) ---
  const trackList = [
    { 
      번호: 1, 제목: "NONB - Fly again!", 
      앨범아트: "/cover1.jpg", 
      가사데이터: [
        { 시간: 28, 내용: "꿈속 만난 나의 모습" },
        { 시간: 34.5, 내용: "그 모습이 아른거려" },
        { 시간: 41, 내용: "끝이 없는 반복들이" },
        { 시간: 47.5, 내용: "나에게 또 소리쳐와" },
        { 시간: 54.5, 내용: "난 왜 흘러가는 시간 속에서" },
        { 시간: 61, 내용: "되돌아보는 날들만이\n늘어날까" },
        { 시간: 67.5, 내용: "아직 늦지 않았으니까\n걱정은 하지 마" },
        { 시간: 74.5, 내용: "끝까지 선명하게\n비춰주고 있으니까" },
        { 시간: 81, 내용: "눈 감으면 저 멀리\n펼쳐지는 하늘에" },
        { 시간: 87.5, 내용: "잠깐 동안의 우리 세상으로" },
        { 시간: 97, 내용: "Fly again!" },
        { 시간: 103.5, 내용: "Fly again!" },
        { 시간: 109, 내용: "꿈속 만난 나의 모습" },
        { 시간: 115.5, 내용: "뒤돌아선" },
        { 시간: 119, 내용: "모습에 소리쳐봐" },
        { 시간: 122, 내용: "난 왜 지나가는 시간 속에서" },
        { 시간: 129, 내용: "후회하는 날들만이\n늘어날까" },
        { 시간: 135, 내용: "아직 늦지 않았으니까\n걱정은 하지 마" },
        { 시간: 142, 내용: "끝까지 선명하게\n비춰주고 있으니까" },
        { 시간: 148.5, 내용: "눈 감으면 저 멀리\n펼쳐지는 하늘에" },
        { 시간: 155, 내용: "잠깐 동안의\n우리 세상으로" },
        { 시간: 161, 내용: "날아가 보는 거야" },
        { 시간: 164, 내용: "우리 어떤 모습이라도" },
        { 시간: 168.5, 내용: "결국 함께라면" },
        { 시간: 171.5, 내용: "끝은 나지 않을 거야" },
        { 시간: 177, 내용: "아무리 높은 벽이 있어도" },
        { 시간: 181.5, 내용: "우리 세상으로 날아가" },
        { 시간: 188.5, 내용: "아직 늦지 않았으니까\n걱정은 하지 마" },
        { 시간: 195, 내용: "이 길의 끝에서 우리\n함께 만날 거니까" },
        { 시간: 201.5, 내용: "눈을 뜨면 그 앞에\n펼쳐지는 하늘에" },
        { 시간: 208, 내용: "끝이 없는 우리 세상으로" },
        { 시간: 214, 내용: "날아가 보는 거야" },
        { 시간: 218, 내용: "Fly again!" },
        { 시간: 224, 내용: "Fly again!" },
        { 시간: 231, 내용: "Fly again!" },
        { 시간: 238, 내용: "Fly again!" },
      ],
      음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track1.wav" 
    },
    { 번호: 2, 제목: "수록곡 2", 앨범아트: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500", 가사데이터: [{ 시간: 0, 내용: "두 번째 트랙 가사입니다." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track2.wav" },
    { 번호: 3, 제목: "수록곡 3", 앨범아트: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track3.wav" },
    { 번호: 4, 제목: "수록곡 4", 앨범아트: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track4.wav" },
    { 번호: 5, 제목: "수록곡 5", 앨범아트: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track5.wav" },
    { 번호: 6, 제목: "수록곡 6", 앨범아트: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track6.wav" },
    { 번호: 7, 제목: "수록곡 7", 앨범아트: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500", 가사데이터: [{ 시간: 0, 내용: "준비 중..." }], 음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track7.wav" },
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

  // --- [오디오 리액티브 엔진 초기화] ---
  const ensureAudioContext = () => {
    if (!audioCtxRef.current && audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256; 
      analyserRef.current.smoothingTimeConstant = 0.2; 
      
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // --- 배경 리액티브 애니메이션 ---
  useEffect(() => {
    let animationId;
    let currentSize = 100;

    const renderLoop = () => {
      let targetSize = 100;

      if (isPlaying && analyserRef.current && bgRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < 3; i++) sum += dataArrayRef.current[i];
        const avg = sum / 3;
        
        const normalized = avg / 255;
        const intensity = Math.pow(normalized, 4); 
        
        targetSize = 100 + intensity * 200; 
      }

      if (targetSize > currentSize) {
        currentSize += (targetSize - currentSize) * 0.4;
      } else {
        currentSize += (targetSize - currentSize) * 0.08;
      }
      
      if (bgRef.current) {
        bgRef.current.style.setProperty('--pulse-size', `${currentSize}%`);
      }
      
      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  // 💡 [초기 안정화 버전 완전 롤백] 오디오 엔진 파트 시작
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
    // 가장 단단했던 오리지널 방어막: 연타 방지
    if (!audioRef.current || isSeekingRef.current) return;
    
    // 💡 단 하나의 추가 코드: 로딩 전 가사 클릭 시 앱 멈춤 방지
    if (audioRef.current.readyState === 0) return;

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
        ensureAudioContext();
        await new Promise(r => setTimeout(r, 80));
        audioRef.current.volume = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        await new Promise(r => setTimeout(r, 50));
        audioRef.current.muted = false;
        await doFade(1, 200);
        if (audioRef.current) audioRef.current.volume = 1; 
      } else {
        audioRef.current.muted = false;
      }
    } catch (e) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.muted = false;
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
        ensureAudioContext();
        audioRef.current.volume = 0;
        await audioRef.current.play();
        setIsPlaying(true);
        await doFade(1, 200);
        if (audioRef.current) audioRef.current.volume = 1; 
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

  // 곡 변경 시 자동 이어서 재생 엔진 (구버전 load() 포함 복원)
  useEffect(() => {
    if (audioRef.current && viewState === 'main') {
      audioRef.current.pause();
      audioRef.current.load();
      setCurrentTime(0);
      setActiveLyricIndex(0);
      audioRef.current.muted = false;

      if (isPlaying) {
        ensureAudioContext();
        audioRef.current.volume = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            doFade(1, 200).then(() => {
              if (audioRef.current) audioRef.current.volume = 1;
            }); 
          }).catch((error) => {
            console.error("오토플레이 방지됨:", error);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentTrack]); 
  // 💡 [초기 안정화 버전 완전 롤백] 오디오 엔진 파트 끝

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
    if (isAutoScroll && lyricRefs.current[activeLyricIndex] && !isDragging && viewState === 'main' && showLyrics) {
      lyricRefs.current[activeLyricIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLyricIndex, isAutoScroll, isDragging, viewState, showLyrics]);

  // --- 화면 렌더링 ---
  if (viewState === 'loading') return <div className="min-h-screen" style={{ background: 'radial-gradient(circle at center, #FFFFFF 0%, #DDE1E5 100%)' }} />;
  
  if (viewState === 'invalid') return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center text-gray-900 font-sans" style={{ background: 'radial-gradient(circle at center, #FFFFFF 0%, #DDE1E5 100%)' }}>
      <div className="animate-fade-in">
        <h1 className="text-[#E63946] font-bold mb-4 tracking-widest uppercase">Invalid Access</h1>
        <p className="text-gray-600 text-sm leading-relaxed">비정상적인 접근입니다.<br/>앨범 전용 링크를 통해 접속해 주세요.</p>
      </div>
    </div>
  );

  return (
    <div ref={bgRef} className="min-h-screen text-gray-900 font-sans overflow-x-hidden relative" style={{ background: 'radial-gradient(circle at center, #FFFFFF 0%, #DDE1E5 var(--pulse-size, 100%))' }}>
      
      {/* 💡 오리지널 오디오 태그 구버전 복원 */}
      <audio 
        ref={audioRef} 
        src={trackList[currentTrack - 1].음원} 
        crossOrigin="anonymous" 
        onLoadedMetadata={(e) => setDuration(e.target.duration)} 
        onTimeUpdate={() => !isDragging && setCurrentTime(audioRef.current.currentTime)} 
        onEnded={() => changeTrack('next')} 
        preload="auto" 
        playsInline 
      />

      {/* 1. 로그인 화면 */}
      {viewState === 'login' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 px-4">
          <div className="max-w-sm w-full space-y-10 text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-[0.1em] text-[#E63946] leading-tight drop-shadow-sm">
              Pro;logue :<br />
              The First
            </h1>
            <div className="space-y-2">
              <p className="text-gray-500 text-xs tracking-widest uppercase font-medium">Digital Experience</p>
              <p className="text-[#E63946]/60 text-[10px] tracking-widest font-mono uppercase">Buyer No. {buyerInfo?.number}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-8 pt-4">
              <input 
                type="password" 
                inputMode="numeric" 
                maxLength={6} 
                value={pinInput} 
                onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))} 
                placeholder="••••••" 
                className="w-full bg-transparent border-b-2 border-gray-400 text-gray-900 text-center px-4 py-4 focus:outline-none focus:border-[#E63946] transition-all tracking-[0.8em] text-3xl font-light placeholder-gray-300" 
              />
              {loginError && <p className="text-[#E63946] text-[10px] tracking-wider font-bold">{loginError}</p>}
              <button type="submit" className="w-full bg-[#E63946] text-white font-bold py-4 rounded-xl active:scale-95 transition-all text-sm tracking-widest shadow-lg shadow-[#E63946]/30 hover:bg-[#D62828]">
                ACCESS NOW
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. 인트로 연출 */}
      {viewState === 'intro' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 px-6 text-center transition-opacity duration-1000" style={{ opacity: introOpacity / 100 }}>
          <p className="text-gray-500 text-xs tracking-[0.4em] mb-6 uppercase font-medium">Welcome</p>
          <h1 className="text-2xl font-light leading-relaxed text-gray-800">
            당신은 <span className="text-[#E63946] font-bold underline underline-offset-8 decoration-1">{buyerInfo?.number}번째</span><br/>
            앨범 구매자이십니다.
          </h1>
        </div>
      )}

      {/* 3. 메인 플레이어 */}
      {viewState === 'main' && (
        <div className="animate-fade-in pb-56">
          
          <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/50 flex justify-center space-x-12 p-5 shadow-sm">
            <button onClick={() => setCurrentTab('메인')} className={`font-bold transition-colors ${currentTab === '메인' ? 'text-[#E63946] border-b-2 border-[#E63946] pb-1' : 'text-gray-500 hover:text-gray-800'}`}>Main</button>
            <button onClick={() => setCurrentTab('비하인드')} className={`font-bold transition-colors ${currentTab === '비하인드' ? 'text-[#E63946] border-b-2 border-[#E63946] pb-1' : 'text-gray-500 hover:text-gray-800'}`}>Behind</button>
          </div>

          {currentTab === '메인' && (
            <div className="p-4 max-w-xl mx-auto space-y-6 mt-4">
              
              <div className="bg-[#E63946]/10 border border-[#E63946]/20 text-[#E63946] text-xs font-bold text-center py-2.5 rounded-full tracking-widest shadow-sm">
                NO.{buyerInfo?.number} 구매자님을 위한 Pro;logue
              </div>

              <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 overflow-hidden shadow-lg">
                <div onClick={() => setIsListOpen(!isListOpen)} className="p-6 flex justify-between items-center cursor-pointer active:bg-white/50 transition-colors">
                  <span className="font-bold text-gray-800 text-sm tracking-widest uppercase">Tracklist</span>
                  <span className="text-gray-500 text-xs">{isListOpen ? '▲' : '▼'}</span>
                </div>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isListOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-5 pt-0 space-y-3">
                    {trackList.map((t) => (
                      <button key={t.번호} onClick={() => {setCurrentTrack(t.번호); setIsListOpen(false);}} className={`w-full text-left p-4 rounded-2xl transition-all font-medium ${currentTrack === t.번호 ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20' : 'bg-white/50 text-gray-700 hover:bg-white/80'}`}>
                        {String(t.번호).padStart(2, '0')}. {t.제목}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 앨범아트 ↔ 가사 크로스페이드 트랜지션 영역 */}
              <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 relative min-h-[480px] shadow-lg overflow-hidden">
                
                {/* --- 앨범아트 모드 --- */}
                <div className={`absolute inset-0 p-8 pb-16 flex items-center justify-center transition-all duration-700 ease-in-out ${showLyrics ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                   <div className="w-full max-w-[280px] aspect-square bg-gray-200 rounded-[2rem] shadow-2xl border-4 border-white/80 overflow-hidden relative flex items-center justify-center">
                      <img src={trackList[currentTrack - 1].앨범아트} alt="Album Art" className="w-full h-full object-cover" />
                   </div>
                </div>

                {/* --- 가사 모드 --- */}
                <div className={`absolute inset-0 p-8 flex flex-col pb-6 transition-all duration-700 ease-in-out ${showLyrics ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                  <div className="w-full flex justify-between items-center mb-6 shrink-0">
                    <h1 className="text-xl font-bold text-[#E63946] tracking-wider drop-shadow-sm truncate pr-4">
                      {trackList[currentTrack - 1].제목}
                    </h1>
                    <button onClick={() => setIsAutoScroll(!isAutoScroll)} className={`text-[8px] px-3 py-1.5 rounded-full border tracking-widest transition-all shrink-0 ${isAutoScroll ? 'bg-[#E63946] text-white border-[#E63946] font-bold shadow-sm' : 'text-gray-500 border-gray-300 bg-white/50'}`}>
                      AUTO
                    </button>
                  </div>
                  
                  <div ref={lyricContainerRef} className="w-full flex-grow overflow-y-auto overflow-x-hidden space-y-8 px-2 scrollbar-hide py-16">
                    {trackList[currentTrack - 1].가사데이터.map((lyric, index) => (
                      <div 
                        key={index} 
                        ref={el => lyricRefs.current[index] = el} 
                        onClick={() => seekTo(lyric.시간)} 
                        className={`transition-all duration-500 ease-out transform-gpu text-center py-2 cursor-pointer break-keep whitespace-pre-wrap leading-relaxed text-lg font-bold origin-center ${
                          !isAutoScroll 
                            ? (activeLyricIndex === index ? 'text-[#1A1A1A] opacity-100' : 'text-gray-500 opacity-100 hover:text-gray-800')
                            : (activeLyricIndex === index ? 'text-[#1A1A1A] scale-[1.25] opacity-100 drop-shadow-sm' : 'text-gray-400 opacity-40 scale-100')
                        }`}
                        style={{ willChange: 'transform, opacity, color' }}
                      >
                        {lyric.내용}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {currentTab === '비하인드' && (
            <div className="p-20 text-center animate-pulse">
              <p className="text-gray-500 text-xs tracking-[0.5em] uppercase font-bold">Loading Archive...</p>
            </div>
          )}

          {/* 하단 플레이어 (수직 스택 구조) */}
          <div className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-500 ${isMinimized ? 'translate-y-[calc(100%-60px)]' : 'translate-y-0'}`}>
            <div className="w-full max-w-md bg-white/70 border-t border-white/80 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.06)] backdrop-blur-2xl pointer-events-auto flex flex-col px-8 pb-10">
              
              <div onClick={() => setIsMinimized(!isMinimized)} className="w-full h-10 flex items-center justify-center cursor-pointer active:opacity-40">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </div>
              
              <div className="space-y-6">
                
                {/* 1층: 곡 제목 (중앙) */}
                <div className="text-center px-4">
                  <div className="text-[#E63946] font-bold text-sm tracking-widest uppercase drop-shadow-sm truncate">
                    {trackList[currentTrack - 1].제목}
                  </div>
                </div>

                {/* 2층: 진행 바 (페이더) */}
                <div className="flex flex-col space-y-3">
                  <div ref={progressBarRef} onPointerDown={(e) => { setIsDragging(true); handlePointerDown(e); }} onPointerMove={(e) => isDragging && handleDrag(e)} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className="h-6 flex items-center cursor-pointer relative touch-none group">
                    <div className="h-1.5 bg-gray-300 w-full rounded-full shadow-inner"><div className="h-full bg-[#E63946] rounded-full" style={{ width: (duration ? (currentTime / duration * 100) : 0) + '%' }} /></div>
                    <div className="absolute w-4 h-4 bg-white rounded-full shadow-md border border-gray-200 transition-transform group-active:scale-125" style={{ left: `calc(${(duration ? (currentTime / duration * 100) : 0)}% - 8px)` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 font-medium tracking-tighter px-1"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
                </div>
                
                {/* 3층: 컨트롤러 (이전/재생/다음 & 가사 토글) */}
                <div className="flex items-center justify-center relative pt-2">
                  <div className="flex items-center space-x-10">
                    <button onClick={() => changeTrack('prev')} className="text-gray-500 hover:text-gray-800 active:scale-75 transition-all">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    
                    <button onClick={togglePlay} className="text-[#E63946] active:scale-90 transition-transform drop-shadow-lg hover:text-[#D62828]">
                      {isPlaying ? (
                        <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      ) : (
                        <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      )}
                    </button>
                    
                    <button onClick={() => changeTrack('next')} className="text-gray-500 hover:text-gray-800 active:scale-75 transition-all">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-10.5 0l8.5 6-8.5 6z"/></svg>
                    </button>
                  </div>
                  
                  {/* 가사 토글 버튼 */}
                  <button 
                    onClick={() => setShowLyrics(!showLyrics)} 
                    className={`absolute right-0 p-2 transition-all active:scale-90 ${showLyrics ? 'text-[#E63946] drop-shadow-md' : 'text-gray-400 hover:text-gray-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9.5 13H8c0-1.5 1.5-3 1.5-3V8H7v5h1.5S8.5 14.5 7 14.5V16c2 0 2.5-3 2.5-3zm6 0H14c0-1.5 1.5-3 1.5-3V8h-2v5h1.5s0 1.5-1.5 1.5V16c2 0 2.5-3 2.5-3z"/>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}