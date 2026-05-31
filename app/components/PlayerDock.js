"use client";

import { Icon, fmtTime } from "./icons";

// 하단 도킹 플레이어 — 프레젠테이션 전용.
// 오디오 로직(togglePlay/changeTrack/seek/progress 핸들러)은 모두 page.js에서 주입.
export default function PlayerDock({
  title, artist, art,
  isPlaying, currentTime, duration,
  onToggle, onPrev, onNext,
  showLyrics, onToggleLyrics,
  progressBarRef, onPointerDown, onPointerMove, onPointerUp, isDragging,
}) {
  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="player-dock">
      <div className="player-card">
        <div className="player-row">
          {art && <img className="player-thumb" src={art} alt="" />}
          <div className="player-meta">
            <div className="t kr">{title}</div>
            <div className="a">{artist}</div>
          </div>
          <button className={"icon-btn" + (showLyrics ? " on" : "")} onClick={onToggleLyrics} aria-label="가사">
            <Icon.lyrics s={20} />
          </button>
          <div className="transport">
            <button className="icon-btn" onClick={onPrev} aria-label="이전"><Icon.prev s={22} /></button>
            <button className="play-btn" onClick={onToggle} aria-label={isPlaying ? "일시정지" : "재생"}>
              {isPlaying ? <Icon.pause s={24} /> : <Icon.play s={24} />}
            </button>
            <button className="icon-btn" onClick={onNext} aria-label="다음"><Icon.next s={22} /></button>
          </div>
        </div>

        <div className="progress">
          <div
            className="bar"
            ref={progressBarRef}
            onPointerDown={onPointerDown}
            onPointerMove={(e) => isDragging && onPointerMove(e)}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="bar-track"><div className="bar-fill" style={{ width: pct + "%" }} /></div>
            <div className="bar-knob" style={{ left: `clamp(0px, calc(${pct}% - 6px), calc(100% - 13px))` }} />
          </div>
          <div className="times"><span>{fmtTime(currentTime)}</span><span>{fmtTime(duration)}</span></div>
        </div>
      </div>
    </div>
  );
}
