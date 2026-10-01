// 태양/달 별자리 — 사이드리얼(라히리) 실제 천문 계산
// 베딕 차트 엔진(engine/ephemeris.py)과 같은 기준:
//   - 태양/달 황경은 Schlyter 절단식(JS 이식, 정적 사이트용)
//   - 아야남샤는 엔진의 라히리 2차 피팅 다항식을 그대로 사용
// 입력 시간은 한국(KST) 기준이며 UT로 환산 후 계산한다.

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const RAD = Math.PI / 180;
const rev = (x) => ((x % 360) + 360) % 360;

// KST 날짜·시간 → UT 율리우스일
function jdFromKst(year, month, day, hour, minute) {
  const ms = Date.UTC(year, month - 1, day, hour - 9, minute);
  return ms / 86400000 + 2440587.5;
}

// 라히리 아야남샤 — engine/ephemeris.py와 동일한 2차 피팅식
// (1800~2200년 기준 pyswisseph SIDM_LAHIRI 대비 최대 잔차 0.0001초)
function lahiriAyanamsa(jd) {
  const t = (jd - 2451545.0) / 36525;
  return 23.8570923560 + 1.3968879583 * t + 0.0003070835 * t * t;
}

function signFromTropical(tropicalLon, jd) {
  const sid = rev(tropicalLon - lahiriAyanamsa(jd));
  return SIGNS[Math.floor(sid / 30) % 12];
}

// 태양 평균 궤도 요소 (Schlyter)
function sunElements(d) {
  return {
    w: 282.9404 + 4.70935e-5 * d, // 근일점 황경
    e: 0.016709 - 1.151e-9 * d, // 이심률
    M: rev(356.0470 + 0.9856002585 * d), // 평균 근점이각
  };
}

// 케플러 방정식 풀이 (뉴턴 반복)
function solveKepler(M, e) {
  let E = M + (180 / Math.PI) * e * Math.sin(M * RAD) * (1 + e * Math.cos(M * RAD));
  for (let k = 0; k < 4; k++) {
    E -= (E - (180 / Math.PI) * e * Math.sin(E * RAD) - M) / (1 - e * Math.cos(E * RAD));
  }
  return E;
}

// 태양의 지구중심 황경 (트로피컬, 오차 약 0.01°)
function sunTropicalLon(d) {
  const { w, e, M } = sunElements(d);
  const E = solveKepler(M, e);
  const x = Math.cos(E * RAD) - e;
  const y = Math.sin(E * RAD) * Math.sqrt(1 - e * e);
  const v = Math.atan2(y, x) / RAD; // 진근점이각
  return rev(v + w);
}

// 달의 황경 (트로피컬, Schlyter 절단식 + 주요 섭동항, 오차 수 분각 수준)
function moonTropicalLon(d) {
  const N = rev(125.1228 - 0.0529538083 * d); // 승교점 황경
  const i = 5.1454; // 궤도 경사각
  const w = rev(318.0634 + 0.1643573223 * d); // 근지점 인수
  const M = rev(115.3654 + 13.0649929509 * d); // 평균 근점이각
  const E = solveKepler(M, 0.054900);
  const x = Math.cos(E * RAD) - 0.054900;
  const y = Math.sin(E * RAD) * Math.sqrt(1 - 0.054900 * 0.054900);
  const v = Math.atan2(y, x) / RAD;
  // 황도 좌표 (거리는 황경에 무관하므로 r=1)
  const cosN = Math.cos(N * RAD), sinN = Math.sin(N * RAD);
  const cosVW = Math.cos((v + w) * RAD), sinVW = Math.sin((v + w) * RAD);
  const cosI = Math.cos(i * RAD);
  const xh = cosN * cosVW - sinN * sinVW * cosI;
  const yh = sinN * cosVW + cosN * sinVW * cosI;
  let lon = Math.atan2(yh, xh) / RAD;

  // 주요 섭동항 (Evection, Variation, Yearly Equation 외)
  const se = sunElements(d);
  const Ms = se.M;
  const Lm = rev(N + w + M); // 달 평균 황경
  const D = rev(Lm - rev(Ms + se.w)); // 평균 이각
  lon += -1.274 * Math.sin((M - 2 * D) * RAD)
    + 0.658 * Math.sin(2 * D * RAD)
    - 0.186 * Math.sin(Ms * RAD)
    - 0.059 * Math.sin((2 * M - 2 * D) * RAD)
    - 0.057 * Math.sin((M - 2 * D + Ms) * RAD);
  return rev(lon);
}

// 태양 별자리 (사이드리얼). hour=null이면 정오 기준.
export function getSunSign(year, month, day, hour = null, minute = 0) {
  const h = hour === null || hour === undefined ? 12 : hour;
  const jd = jdFromKst(year, month, day, h, minute || 0);
  return signFromTropical(sunTropicalLon(jd - 2451543.5), jd);
}

// 달 별자리 (사이드리얼). hour=null이면 정오 기준으로 계산하고 estimated:true 반환.
// (시간을 모르면 달의 실제 별자리를 확정할 수 없으므로 '추정'으로 표시)
export function getMoonSign(year, month, day, hour = null, minute = 0) {
  const estimated = hour === null || hour === undefined;
  const h = estimated ? 12 : hour;
  const jd = jdFromKst(year, month, day, h, estimated ? 0 : minute || 0);
  return { sign: signFromTropical(moonTropicalLon(jd - 2451543.5), jd), estimated };
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
