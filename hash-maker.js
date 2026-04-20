const crypto = require('crypto');

// 💡 여기에 발급할 토큰과 팬에게 알려줄 6자리 PIN을 입력하세요.
const buyers = [
  { number: 1, token: "a7b2c9d1", pin: "123456" },
  { number: 2, token: "e4f8g2h1", pin: "654321" },
  { number: 3, token: "m5n9p2r4", pin: "111111" }
];

console.log("=========================================");
console.log("🔐 Pro;logue 해시 장부 생성 결과");
console.log("=========================================\n");

buyers.forEach(buyer => {
  const saltedInput = `${buyer.token}_${buyer.pin}`;
  const hash = crypto.createHash('sha256').update(saltedInput).digest('hex');
  
  console.log(`"${buyer.number}": {`);
  console.log(`  token: "${buyer.token}",`);
  console.log(`  hash: "${hash}", // 원래 PIN: ${buyer.pin}`);
  console.log(`  number: ${buyer.number}`);
  console.log(`},`);
});