// 태양 별자리 경계 — 각 별자리가 시작되는 월/일 (영미권 표준)
const SUN_SIGN_BOUNDARIES = [
  [3, 21, 'aries'],
  [4, 20, 'taurus'],
  [5, 21, 'gemini'],
  [6, 21, 'cancer'],
  [7, 23, 'leo'],
  [8, 23, 'virgo'],
  [9, 23, 'libra'],
  [10, 23, 'scorpio'],
  [11, 22, 'sagittarius'],
  [12, 22, 'capricorn'],
  [1, 20, 'aquarius'],
  [2, 19, 'pisces'],
];

export function getSunSign(year, month, day) {
  for (const [m, d, sign] of SUN_SIGN_BOUNDARIES) {
    if (month === m && day >= d) return sign;
    if (month === m && day < d) {
      const prevIndex = SUN_SIGN_BOUNDARIES.findIndex(([pm]) => pm === m) - 1;
      return SUN_SIGN_BOUNDARIES[(prevIndex + 12) % 12][2];
    }
  }
  return 'capricorn';
}

// 달의 공전 주기 기반 근사 (29.53일 기준)
// J2000.0 에포크(2000-01-01) 기준 달의 위상 offset으로 달 위치를 12개 구간으로 나눔
const MOON_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

function daysSinceEpoch(year, month, day) {
  const epoch = new Date(Date.UTC(2000, 0, 1));
  const target = new Date(Date.UTC(year, month - 1, day));
  return (target - epoch) / 86400000;
}

export function getMoonSign(year, month, day, hour = null) {
  const h = hour !== null ? hour : 0;
  const days = daysSinceEpoch(year, month, day) + h / 24;
  // 달은 약 27.32일에 황도 12궁 1바퀴 (항성월)
  const cycleDay = ((days % 27.32) + 27.32) % 27.32;
  const index = Math.floor((cycleDay / 27.32) * 12);
  return MOON_SIGNS[index];
}

// 출생 정보 없을 때 의사난수로 달 별자리 결정 (동일 입력 → 동일 결과)
export function getMoonSignFallback(year, month, day) {
  const seed = year * 10000 + month * 100 + day;
  const hash = ((seed * 2654435761) >>> 0) % 12;
  return MOON_SIGNS[hash];
}

// 완성된 별자리 목록
const READY_SIGNS = new Set(['aries', 'taurus', 'gemini', 'cancer', 'leo']);

export function isSignReady(sign) {
  return READY_SIGNS.has(sign);
}
