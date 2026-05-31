"use client";

import { useState } from "react";
import { Icon, fmtTime } from "./icons";

// 하단 도킹 플레이어 — 프레젠테이션 전용.
// 오디오 로직(togglePlay/changeTrack/seek/progress 핸들러)은 모두 page.js에서 주입.
// 접기/펼치기는 표시 전용이라 로컬 상태로 관리.
export default function PlayerDock({
  title, artist, art,
  isPlaying, currentTime, duration,
  onToggle, onPrev, onNext,
  showLyrics, onToggleLyrics,
  progressBarRef, onPointerDown, onPointerMove, onPointerUp, isDragging,
}) {
  const [collapsed, setCollapsed] = useState(true);
  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className={"player-dock" + (collapsed ? " collapsed" : "")}>
      <div className="player-card">
        <button
          className="dock-grip"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "플레이어 펼치기" : "플레이어 접기"}
        >
          <span className="grip-bar" />
        </button>

        <div className="player-row">
          {art && <img className="player-thumb" src={art} alt="" />}
          <div className="player-meta">
            <div className="t kr">{title}</div>
            <div className="a">{artist}</div>
          </div>
          <button className={"icon-btn" + (showLyrics ? " on" : "")} onClick={onToggleLyrics} aria-label="가사">
            <Icon.lyrics s={20} />
          </button>
          {collapsed && (
            <button className="play-btn play-btn-sm" onClick={onToggle} aria-label={isPlaying ? "일시정지" : "재생"}>
              {isPlaying ? <Icon.pause s={20} /> : <Icon.play s={20} />}
            </button>
          )}
        </div>

        <div className="player-body">
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

          <div className="transport">
            <button className="icon-btn" onClick={onPrev} aria-label="이전 트랙"><Icon.prev s={26} /></button>
            <button className="play-btn" onClick={onToggle} aria-label={isPlaying ? "일시정지" : "재생"}>
              {isPlaying ? <Icon.pause s={26} /> : <Icon.play s={26} />}
            </button>
            <button className="icon-btn" onClick={onNext} aria-label="다음 트랙"><Icon.next s={26} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
