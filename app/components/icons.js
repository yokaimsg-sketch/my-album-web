// 공용 아이콘 & 시간 포맷 (프레젠테이션 전용 — 클라이언트 컴포넌트에서 import).

export function fmtTime(t) {
  if (!t || isNaN(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return m + ":" + (s < 10 ? "0" + s : s);
}

export const Icon = {
  play: ({ s = 24 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
  ),
  pause: ({ s = 24 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
  ),
  prev: ({ s = 22 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
  ),
  next: ({ s = 22 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-10.5 0l8.5 6-8.5 6z" /></svg>
  ),
  lyrics: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h11M4 12h16M4 18h9" /><circle cx="19" cy="17" r="2" fill="currentColor" stroke="none" /><path d="M21 17V9l-3 1" />
    </svg>
  ),
  image: ({ s = 20 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 16-5-5L5 21" />
    </svg>
  ),
  chevL: ({ s = 24 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
  ),
  chevR: ({ s = 24 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M10 6 8.6 7.4 13.2 12l-4.6 4.6L10 18l6-6z" /></svg>
  ),
  note: ({ s = 36 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.6c-.6-.4-1.3-.6-2-.6-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4V7h4V3h-6z" /></svg>
  ),
};
