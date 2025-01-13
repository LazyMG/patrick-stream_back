export function usernameGenerator() {
  const personality = [
    "춤추는",
    "노래하는",
    "밥 먹는",
    "잠자는",
    "인사하는",
    "요리하는",
    "여유로운",
    "심심한",
  ];

  const name = [
    "스폰지밥",
    "징징이",
    "다람이",
    "집게사장",
    "플랑크톤",
    "진주",
    "핑핑이",
    "인어맨",
    "조개소년",
  ];

  const randomPersonality =
    personality[Math.floor(Math.random() * personality.length)];
  const randomName = name[Math.floor(Math.random() * name.length)];
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4자리 숫자 생성

  return `${randomPersonality} ${randomName}${randomNumber}`;
}
