// 태양/달 별자리 계산 — 원본 사이트와 동일한 로직 (결과 호환성 유지)
const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

// 태양 별자리 (tropical, 월/일 경계 테이블)
const SUN_TABLE = [
  [3, 21, 'aries'], [4, 20, 'taurus'], [5, 21, 'gemini'],
  [6, 21, 'cancer'], [7, 23, 'leo'], [8, 23, 'virgo'],
  [9, 23, 'libra'], [10, 23, 'scorpio'], [11, 22, 'sagittarius'],
  [12, 22, 'capricorn'], [1, 20, 'aquarius'], [2, 19, 'pisces'],
];

export function getSunSign(year, month, day) {
  for (let i = 0; i < SUN_TABLE.length; i++) {
    const [m, boundary, sign] = SUN_TABLE[i];
    if (month === m && day >= boundary) return sign;
    if (month === m && day < boundary) return SUN_TABLE[(i + 11) % 12][2];
  }
  return 'capricorn';
}

function daysSince2000(year, month, day) {
  const base = new Date(Date.UTC(2000, 0, 1));
  return (new Date(Date.UTC(year, month - 1, day)) - base) / 864e5;
}

// 달 별자리 — 27.32일 주기 근사 (시간 입력 시)
export function getMoonSignWithTime(year, month, day, hour) {
  const d = hour !== null && hour !== undefined ? hour : 0;
  const y = (((daysSince2000(year, month, day) + d / 24) % 27.32) + 27.32) % 27.32;
  const k = Math.floor((y / 27.32) * 12);
  return SIGNS[k];
}

// 달 별자리 — 시간 모름 시 결정적 해시
export function getMoonSignHash(year, month, day) {
  const d = (((year * 1e4 + month * 100 + day) * 2654435761) >>> 0) % 12;
  return SIGNS[d];
}

export const SIGN_NAMES_KO = {
  aries: '양자리', taurus: '황소자리', gemini: '쌍둥이자리',
  cancer: '게자리', leo: '사자자리', virgo: '처녀자리',
  libra: '천칭자리', scorpio: '전갈자리', sagittarius: '사수자리',
  capricorn: '염소자리', aquarius: '물병자리', pisces: '물고기자리',
};

export function signNameKo(sign) {
  return SIGN_NAMES_KO[sign] || sign;
}
