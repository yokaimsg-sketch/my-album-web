const crypto = require('crypto');

// 💡 발급할 토큰과 팬에게 알려줄 6자리 PIN을 입력하세요.
// album: 접근 가능한 앨범 식별자, number: 해당 앨범 내 구매자 순번
const buyers = [
  { album: 1, number: 1, token: "a7b2c9d1", pin: "260313" },
  { album: 1, number: 2, token: "d8f9a9c7", pin: "260313" },
  { album: 1, number: 3, token: "u2j3i4g3", pin: "260313" },
  { album: 1, number: 4, token: "j3i4j5h1", pin: "260313" },
  { album: 2, number: 1, token: "e4f8g2h1", pin: "251201" },
  { album: 2, number: 2, token: "k4h5j1i7", pin: "251201" },
  { album: 2, number: 3, token: "p1j3g3n8", pin: "251201" },
  { album: 2, number: 4, token: "i2p3x1z9", pin: "251201" },
  { album: 3, number: 1, token: "m5n9p2r4", pin: "250110" },
  { album: 3, number: 2, token: "w3q4f8d1", pin: "250110" },
  { album: 3, number: 3, token: "g4c8h3e1", pin: "250110" },
  { album: 3, number: 4, token: "b3g4d9k1", pin: "250110" },
  { album: 3, number: 5, token: "x3d2n3u8", pin: "250110" },
  { album: 4, number: 1, token: "x1y7z4w8", pin: "202600" },
  { album: 4, number: 2, token: "x9y6k1g7", pin: "202600" },
  { album: 4, number: 3, token: "y7x8w9g4", pin: "202600" },
];

console.log("=========================================");
console.log("🔐 로그인 해시 장부 생성 결과");
console.log("=========================================\n");

buyers.forEach(buyer => {
  const saltedInput = `${buyer.token}_${buyer.pin}`;
  const hash = crypto.createHash('sha256').update(saltedInput).digest('hex');

  console.log(`"${buyer.token}": {`);
  console.log(`  hash: "${hash}", // 원래 PIN: ${buyer.pin}`);
  console.log(`  album: ${buyer.album},`);
  console.log(`  number: ${buyer.number}`);
  console.log(`},`);
});
