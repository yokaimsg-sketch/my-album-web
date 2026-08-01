// 5집 전용 콘텐츠 + 테마. 라우트 /album5 (= /?id=5) 에서만 사용한다.
// 1~4번 앨범은 lib/albumData.js · lib/albumThemes.js 를 그대로 쓰며 이 파일과 무관하다.
// 연주곡 앨범이라 타임코드 가사가 없다 → 트랙마다 가사데이터 대신 곡소개(문자열)를 둔다.

const R2 = "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev";

export const ALBUM5 = {
  식별자: "5",
  제목: "Messages from Gogh Loving Vincent",
  제목줄: ["Messages from Gogh", "Loving Vincent"], // 커버 아트처럼 두 줄로 표시
  아티스트: "김중회 쿼텟",
  앨범명: "Messages from Gogh Loving Vincent",
  발매: "2024.12.26",
  커버: `${R2}/cover5.png`,

  노트: `재즈 기타리스트 김중회의 5번째 정규 앨범. 김중회 쿼텟의 <Messages from Gogh Loving Vincent>

네덜란드 유학시절 우연히 고흐 박물관을 견학할 기회가 있었다. 시대별로 진열된 그의 그림을 보면서 변화를 느낄 수 있었던 특별한 경험이었고 그 이후로 그의 그림을 좋아하게 됐다. 사실 난 그림에 대해서는 깊게 모른다 그럼에도 불구하고 고흐를 주제로 작업하게 된 동기는 '반 고흐, 영혼의 편지' 책을 보면서 깊은 감동을 받았고, 그 감동을 음악으로 표해보고 싶었다.

특히 그의 편지에서 본 그의 삶과 작품은 저에게 오랫동안 울림을 주고 있다. 고흐의 예술은 단순히 시각적인 아름다움을 넘어, 고독과 희망, 그리고 끊임없는 열망을 담고 있다고 개인적으로 생각하고 있다.

Messages from 김중회`,

  크레딧: [
    { 역할: "All Composition & Arrangement", 이름: "김중회 (Kim Choonghoy)" },
    { 역할: "Guitar", 이름: "김중회 (Kim Choonghoy)" },
    { 역할: "Piano", 이름: "비안 (Vian)" },
    { 역할: "Bass", 이름: "김성수 (Kim Sungsu)" },
    { 역할: "Drum", 이름: "김윤태 (Kim Yun Tae)" },
    { 역할: "녹음", 이름: "이정면 @이음 사운드 스튜디오 (EUNMSOUND)" },
    { 역할: "믹싱 & 마스터링", 이름: "김인섭 @문 스튜디오" },
    { 역할: "Album Artwork", 이름: "윤태원" },
  ],

  트랙리스트: [
    {
      번호: 1,
      제목: "Starry, Starry",
      앨범아트: `${R2}/cover5.png`,
      음원: `${R2}/track5-1.mp3`,
      곡소개: "빈센트 반 고흐 (Vincent Van Gogh)의 걸작 '별이 빛나는 밤' 작품을 모티브로 만들어본 곡이다. 밤하늘의 신비롭고 감동적인 아름다움을 음악으로 풀어내고자 했다.",
    },
    {
      번호: 2,
      제목: "Message from Van Gogh",
      앨범아트: `${R2}/cover5.png`,
      음원: `${R2}/track5-2.mp3`,
      곡소개: "'고흐, 영혼의 편지'를 읽으면서 많은 감동을 받았다. 그의 편지들은 단순한 글을 넘어 예술에 대한 열정과 깊은 내면의 고뇌, 그리고 삶과 자연에 대한 뜨거운 사랑이 담긴 특별한 기록이라고 생각한다. 삶에 대한 진심을 느낄 수 있었다.",
    },
    {
      번호: 3,
      제목: "Cafe Nocturne",
      앨범아트: `${R2}/cover5.png`,
      음원: `${R2}/track5-3.mp3`,
      곡소개: "고흐의 작품 '밤의 카페 테라스'에서 느껴지는 그 밤의 특별한 분위기와 낭만 그리고 외로움을 음악으로 표현하고자 했다.",
    },
    {
      번호: 4,
      제목: "Dancing with Joy",
      앨범아트: `${R2}/cover5.png`,
      음원: `${R2}/track5-4.mp3`,
      곡소개: "빈센트 반 고흐의 작품 '감자 먹는 사람들'을 보면서 고된 하루의 노동 후 가족과 함께 나누는 소박한 기쁨을 상상해봤다.",
    },
    {
      번호: 5,
      제목: "Dreamscape",
      앨범아트: `${R2}/cover5.png`,
      음원: `${R2}/track5-5.mp3`,
      곡소개: "삶에서 가장 소중하게 간직한 그의 꿈과 삶에 대한 진심을 표현 해봤다.",
    },
    {
      번호: 6,
      제목: "Chasing the Sun",
      앨범아트: `${R2}/cover5.png`,
      음원: `${R2}/track5-6.mp3`,
      곡소개: "해바라기처럼 끊임없이 빛을 갈망하는 우리의 열정을 표현 해봤다.",
    },
    {
      번호: 7,
      제목: "Rina",
      앨범아트: `${R2}/cover5.png`,
      음원: `${R2}/track5-7.mp3`,
      곡소개: "나의 사랑하는 작은딸을 위해 만든 곡이다.",
    },
    {
      번호: 8,
      제목: "Yvone",
      앨범아트: `${R2}/cover5.png`,
      음원: `${R2}/track5-8.mp3`,
      곡소개: "나의 사랑하는 큰딸의 영어이름. 큰딸을 위해 완성한 작품이다.",
    },
  ],

  // 비하인드 자료가 생기면 여기에 채운다 (형식은 lib/albumData.js 의 비하인드와 동일).
  // 비어 있는 동안에는 상단 탭 자체가 렌더되지 않는다.
  비하인드: { 아이템: [] },
};

// 커버(고흐 '별이 빛나는 밤')에서 뽑은 심야 블루 + 황금별 팔레트.
// globals.css 의 모든 컴포넌트가 이 CSS 변수만 참조하므로 루트에 주입하면 화면 전체가 이 옷을 입는다.
export const ALBUM5_THEME = {
  treatment: "starry",
  mode: "dark",
  kicker: "Starry Night Jazz",
  vars: {
    "--bg": "radial-gradient(125% 100% at 50% 0%, #1E4272 0%, #10254C 52%, #060E22 100%)",
    "--bg-solid": "#0D1E40",
    "--surface": "rgba(214,232,255,0.06)",
    "--surface-strong": "rgba(9,21,44,0.88)",
    "--surface-ink": "rgba(0,0,0,0.30)",
    "--border": "rgba(160,196,255,0.16)",
    "--border-strong": "rgba(160,196,255,0.32)",
    "--text": "#EDF3FF",
    "--muted": "#A3B8DA",
    "--faint": "#6C82A8",
    "--accent": "#F3C34B",
    "--accent-2": "#E9913C",
    "--accent-soft": "rgba(243,195,75,0.15)",
    "--on-accent": "#0B1A33",
    "--shadow": "0 24px 60px -22px rgba(0,0,0,0.75)",
    "--grain-opacity": "0.06",
    "--grain-blend": "soft-light",
  },
};
