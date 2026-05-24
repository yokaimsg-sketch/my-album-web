// 앨범별 콘텐츠 정의. id (URL ?id=N)를 키로 사용.
// 클라이언트/서버 양쪽에서 import 가능 (server-only 정보 없음).

const 기본배경그라데이션 = "radial-gradient(circle at center, #FFFFFF 0%, #DDE1E5 100%)";

const R2 = "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev";

export const ALBUM_DATA = {
  "1": {
    식별자: "1",
    제목: "Fly again!",
    아티스트: "NONB",
    앨범명: "Fly again!",
    배지텍스트: "Fly again!",
    레이아웃: "default",
    테마: {
      primary: "#E63946",
      primaryHover: "#D62828",
      배경그라데이션: 기본배경그라데이션,
    },
    트랙리스트: [
      {
        번호: 1,
        제목: "NONB - Fly again!",
        앨범아트: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/cover1.jpg",
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
        음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track1.wav",
      },
    ],
    로고: `${R2}/logo1.png`,
    비하인드: {
      아이템: [
        { 종류: "오디오", src: `${R2}/behind1/demo1.wav`, 제목: "Demo" },
      ],
    },
    크레딧: null,
  },

  "2": {
    식별자: "2",
    제목: "Salvia",
    아티스트: "MIJI",
    앨범명: "Salvia",
    배지텍스트: "Salvia",
    레이아웃: "default",
    테마: {
      primary: "#E63946",
      primaryHover: "#D62828",
      배경그라데이션: 기본배경그라데이션,
    },
    트랙리스트: [
      {
        번호: 1,
        제목: "MIJI - Salvia",
        앨범아트: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/cover2.png",
        가사데이터: [{ 시간: 0, 내용: "준비 중..." }],
        음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track2.wav",
      },
    ],
    로고: `${R2}/logo2.png`,
    비하인드: {
      아이템: [
        { 종류: "이미지", src: `${R2}/behind2/1.jpeg` },
        { 종류: "이미지", src: `${R2}/behind2/2.jpeg` },
        { 종류: "이미지", src: `${R2}/behind2/3.jpeg` },
        { 종류: "이미지", src: `${R2}/behind2/4.jpeg` },
        { 종류: "이미지", src: `${R2}/behind2/5.jpeg` },
        { 종류: "이미지", src: `${R2}/behind2/6.jpeg` },
        { 종류: "이미지", src: `${R2}/behind2/7.jpeg` },
        { 종류: "이미지", src: `${R2}/behind2/8.jpeg` },
        { 종류: "이미지", src: `${R2}/behind2/9.jpeg` },
        { 종류: "hls", src: `${R2}/behind2/video1/video1.m3u8`, thumb: `${R2}/behind2/video1/thumb.png` },
      ],
    },
    크레딧: null,
  },

  "3": {
    식별자: "3",
    제목: "파락호",
    아티스트: "Libero",
    앨범명: "파락호",
    배지텍스트: "파락호",
    레이아웃: "default",
    테마: {
      primary: "#E63946",
      primaryHover: "#D62828",
      배경그라데이션: 기본배경그라데이션,
    },
    트랙리스트: [
      {
        번호: 1,
        제목: "Libero - 파락호",
        앨범아트: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/cover3.jpeg",
        가사데이터: [{ 시간: 0, 내용: "준비 중..." }],
        음원: "https://pub-eb7063c1256b42148f33d95d25411e8c.r2.dev/track3.wav",
      },
    ],
    로고: `${R2}/logo3.jpeg`,
    비하인드: {
      아이템: [
        { 종류: "이미지", src: `${R2}/behind3/1.jpeg` },
        { 종류: "이미지", src: `${R2}/behind3/2.gif` },
        { 종류: "mp4", src: `${R2}/behind3/video1/video1.mp4`, thumb: `${R2}/behind3/video1/thumb.png` },
        { 종류: "mp4", src: `${R2}/behind3/video2/video2.mp4`, thumb: `${R2}/behind3/video2/thumb.png` },
        { 종류: "hls", src: `${R2}/behind3/video3/video3.m3u8`, thumb: `${R2}/behind3/video3/thumb.png` },
        { 종류: "hls", src: `${R2}/behind3/video4/video4.m3u8`, thumb: `${R2}/behind3/video4/thumb.png` },
        { 종류: "hls", src: `${R2}/behind3/video5/video5.m3u8`, thumb: `${R2}/behind3/video5/thumb.png` },
        { 종류: "mp4", src: `${R2}/behind3/video6/video6.mp4`, thumb: `${R2}/behind3/video6/thumb.png` },
        { 종류: "mp4", src: `${R2}/behind3/video7/video7.mp4`, thumb: `${R2}/behind3/video7/thumb.png` },
      ],
    },
    크레딧: null,
  },
};
