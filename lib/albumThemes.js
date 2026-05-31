// 앨범별 테마 토큰. id를 키로 사용 (URL ?id=N).
// 컴포넌트는 CSS 변수만 참조 → 여기 토큰만 갈아끼우면 id 전체가 다른 옷을 입는다.
// ⚠ 매 틱(250ms) 리렌더되는 엘리먼트의 inline style로 주입하지 말 것.
//    applyThemeVars()를 effect에서 호출해 루트에 1회 주입한다(iOS backdrop-blur 점멸 회피).

export const ALBUM_THEMES = {
  // 1 · Fly again! — 빛바랜 필름 스냅. 라이트 / 아날로그
  "1": {
    treatment: "analog",
    mode: "light",
    hero: "lyrics",
    kicker: "Analog Memory",
    logoH: 15,
    vars: {
      "--bg": "radial-gradient(125% 100% at 50% 0%, #FBF7EC 0%, #EFE7D2 55%, #E2D7BA 100%)",
      "--bg-solid": "#EFE7D2",
      "--surface": "rgba(255,253,245,0.66)",
      "--surface-strong": "rgba(255,253,245,0.9)",
      "--surface-ink": "rgba(42,40,32,0.05)",
      "--border": "rgba(120,104,64,0.18)",
      "--border-strong": "rgba(120,104,64,0.34)",
      "--text": "#2C2920",
      "--muted": "#6E6750",
      "--faint": "#9A9178",
      "--accent": "#A87C2C",
      "--accent-2": "#C2603C",
      "--accent-soft": "rgba(168,124,44,0.14)",
      "--on-accent": "#FBF7EC",
      "--shadow": "0 18px 48px -20px rgba(90,72,30,0.45)",
      "--grain-opacity": "0.06",
      "--grain-blend": "multiply",
    },
  },

  // 2 · Salvia — 마젠타 + 진홍 잉크 플라워. 다크 / 녹턴
  "2": {
    treatment: "bloom",
    mode: "dark",
    hero: "gallery",
    kicker: "Nocturne Bloom",
    logoH: 78,
    vars: {
      "--bg": "radial-gradient(120% 95% at 50% 12%, #4A0E2A 0%, #2A0817 52%, #120309 100%)",
      "--bg-solid": "#1A0510",
      "--surface": "rgba(255,232,242,0.055)",
      "--surface-strong": "rgba(255,232,242,0.1)",
      "--surface-ink": "rgba(0,0,0,0.22)",
      "--border": "rgba(255,170,205,0.16)",
      "--border-strong": "rgba(255,170,205,0.32)",
      "--text": "#F7E7EE",
      "--muted": "#D29CB4",
      "--faint": "#9A6A82",
      "--accent": "#EE2168",
      "--accent-2": "#FF5E8A",
      "--accent-soft": "rgba(238,33,104,0.16)",
      "--on-accent": "#FFFFFF",
      "--shadow": "0 24px 60px -22px rgba(238,33,104,0.5)",
      "--grain-opacity": "0.05",
      "--grain-blend": "screen",
    },
  },

  // 3 · 파락호 — 흙빛 손그림, 골패 그런지. 다크 / 어슨
  "3": {
    treatment: "earthen",
    mode: "dark",
    hero: "archive",
    kicker: "Earthen Archive",
    logoH: 78,
    vars: {
      "--bg": "radial-gradient(125% 100% at 50% 0%, #34301E 0%, #25220F 58%, #16140B 100%)",
      "--bg-solid": "#22200F",
      "--surface": "rgba(228,214,170,0.06)",
      "--surface-strong": "rgba(228,214,170,0.11)",
      "--surface-ink": "rgba(0,0,0,0.26)",
      "--border": "rgba(196,176,120,0.18)",
      "--border-strong": "rgba(196,176,120,0.36)",
      "--text": "#ECE2C8",
      "--muted": "#AC9E78",
      "--faint": "#7E7350",
      "--accent": "#BE6238",
      "--accent-2": "#6E8B6E",
      "--accent-soft": "rgba(190,98,56,0.18)",
      "--on-accent": "#1B1709",
      "--shadow": "0 22px 56px -22px rgba(0,0,0,0.7)",
      "--grain-opacity": "0.09",
      "--grain-blend": "overlay",
    },
  },

  // 4 · Pro;logue : The First — 흑백 미니멀. mono / 라이트·다크 토글 / 다중 트랙
  "4": {
    treatment: "mono",
    hero: "tracklist",
    multiTrack: true,
    toggleable: true,        // 페이지에서 라이트/다크 전환 가능
    defaultMode: "dark",
    kicker: "The First",
    logoH: 30,
    // mono는 mode 두 가지를 토글 → variants로 보관, resolveTheme이 활성 변형을 펼친다.
    variants: {
      light: {
        mode: "light",
        vars: {
          "--bg": "radial-gradient(120% 100% at 50% 0%, #FFFFFF 0%, #F2F2EF 60%, #E8E8E4 100%)",
          "--bg-solid": "#F2F2EF",
          "--surface": "rgba(12,12,12,0.04)",
          "--surface-strong": "rgba(255,255,255,0.9)",
          "--surface-ink": "rgba(12,12,12,0.05)",
          "--border": "rgba(12,12,12,0.14)",
          "--border-strong": "rgba(12,12,12,0.32)",
          "--text": "#0B0B0B",
          "--muted": "#6A6A6A",
          "--faint": "#A8A8A8",
          "--accent": "#0B0B0B",
          "--accent-2": "#4A4A4A",
          "--accent-soft": "rgba(12,12,12,0.07)",
          "--on-accent": "#FFFFFF",
          "--shadow": "0 18px 48px -22px rgba(0,0,0,0.4)",
          "--grain-opacity": "0.04",
          "--grain-blend": "multiply",
        },
      },
      dark: {
        mode: "dark",
        vars: {
          "--bg": "radial-gradient(120% 100% at 50% 0%, #1C1C1C 0%, #0C0C0C 65%, #000000 100%)",
          "--bg-solid": "#0C0C0C",
          "--surface": "rgba(255,255,255,0.06)",
          "--surface-strong": "rgba(22,22,22,0.82)",
          "--surface-ink": "rgba(0,0,0,0.4)",
          "--border": "rgba(255,255,255,0.16)",
          "--border-strong": "rgba(255,255,255,0.34)",
          "--text": "#F4F4F1",
          "--muted": "#9A9A9A",
          "--faint": "#5E5E5E",
          "--accent": "#FFFFFF",
          "--accent-2": "#CFCFCF",
          "--accent-soft": "rgba(255,255,255,0.1)",
          "--on-accent": "#0B0B0B",
          "--shadow": "0 22px 56px -22px rgba(0,0,0,0.85)",
          "--grain-opacity": "0.05",
          "--grain-blend": "screen",
        },
      },
    },
  },
};

export const DEFAULT_THEME = ALBUM_THEMES["1"];

// 라이트/다크 토글이 있는 mono 대응 — 활성 테마를 펼쳐 반환.
export function resolveTheme(id, monoMode) {
  const t = ALBUM_THEMES[id] || DEFAULT_THEME;
  if (t.variants) {
    const v = t.variants[monoMode || t.defaultMode] || t.variants[t.defaultMode];
    return { ...t, mode: v.mode, vars: v.vars };
  }
  return t;
}

// 루트 엘리먼트에 CSS 변수 + data 속성 1회 주입.
// page.js에서 useEffect(() => applyThemeVars(rootRef.current, id, monoMode), [id, monoMode]) 형태로 호출.
export function applyThemeVars(el, id, monoMode) {
  const t = resolveTheme(id, monoMode);
  if (!el) return t;
  Object.entries(t.vars).forEach(([k, v]) => el.style.setProperty(k, v));
  el.setAttribute("data-mode", t.mode);
  el.setAttribute("data-treatment", t.treatment);
  return t;
}
