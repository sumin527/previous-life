// 궁합 토큰 인코딩/디코딩 + 아쉬타쿠트(Ashtakoot) 8항목 점수 — 원본과 동일 (기존 공유 링크 호환)

// ---- 토큰 ----
export function encodeToken(data, other = null) {
  const s = { a: { s: data.sun, m: data.moon, n: data.name } };
  if (other) s.b = { s: other.sun, m: other.moon, n: other.name };
  const f = encodeURIComponent(JSON.stringify(s));
  return btoa(f).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function decodeToken(token) {
  if (!token) return null;
  try {
    const u = token.replace(/-/g, '+').replace(/_/g, '/');
    const padded = u + '='.repeat((4 - (u.length % 4)) % 4);
    const f = atob(padded);
    let d;
    try { d = decodeURIComponent(f); }
    catch { try { d = decodeURIComponent(escape(f)); } catch { d = f; } }
    if (d.startsWith('%')) { try { d = decodeURIComponent(d); } catch {} }
    const m = JSON.parse(d);
    if (m.sun || m.moon || m.name) return m;
    if (m.a && !m.b) return { sun: m.a.s, moon: m.a.m, name: m.a.n };
    return m;
  } catch (e) {
    console.error('Match data decode error:', e);
    return null;
  }
}

// ---- 아쉬타쿠트 점수 ----
const ELEMENT = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

const MODALITY = {
  aries: 'cardinal', cancer: 'cardinal', libra: 'cardinal', capricorn: 'cardinal',
  taurus: 'fixed', leo: 'fixed', scorpio: 'fixed', aquarius: 'fixed',
  gemini: 'mutable', virgo: 'mutable', sagittarius: 'mutable', pisces: 'mutable',
};

function compareElement(a, b) {
  if (a === b) return 'same';
  const pair = `${a}_${b}`;
  return ['fire_air', 'air_fire', 'earth_water', 'water_earth'].includes(pair)
    ? 'compatible'
    : 'incompatible';
}

function compareModality(a, b) {
  if (a === b) return 'same';
  const pair = `${a}_${b}`;
  return ['cardinal_mutable', 'mutable_cardinal'].includes(pair)
    ? 'compatible'
    : 'challenging';
}

export function scoreMatch(a, b) {
  // a, b: {sun, moon, name}
  const elSunA = ELEMENT[a.sun], elSunB = ELEMENT[b.sun];
  const elMoonA = ELEMENT[a.moon], elMoonB = ELEMENT[b.moon];
  const moSunA = MODALITY[a.sun], moSunB = MODALITY[b.sun];
  const moMoonA = MODALITY[a.moon], moMoonB = MODALITY[b.moon];

  const cSun = compareElement(elSunA, elSunB);
  const cMoon = compareElement(elMoonA, elMoonB);
  const mSun = compareModality(moSunA, moSunB);
  const mMoon = compareModality(moMoonA, moMoonB);

  const varna = { same: 100, compatible: 70, incompatible: 30 }[cSun];
  const vashya = { same: 78, compatible: 100, challenging: 40 }[mSun];
  const tara = { same: 72, compatible: 100, incompatible: 38 }[cMoon];

  let yoni;
  if (a.moon === b.moon) yoni = 100;
  else if (cMoon === 'same') yoni = 78;
  else if (cMoon === 'compatible') yoni = 60;
  else yoni = 28;

  const grahaMaitri = [25, 60, 100][(cSun !== 'incompatible' ? 1 : 0) + (cMoon !== 'incompatible' ? 1 : 0)];
  const gana = { same: 100, compatible: 68, challenging: 32 }[mMoon];

  const le = { same: 1, compatible: 2, incompatible: 0 }[cSun];
  const ii = { same: 1, compatible: 2, incompatible: 0 }[cMoon];
  const bhakoot = { 4: 100, 3: 78, 2: 56, 1: 36, 0: 18 }[le + ii];

  const nadi = { compatible: 100, incompatible: 62, same: 42 }[cMoon];

  const total = Math.round((varna + vashya + tara + yoni + grahaMaitri + gana + bhakoot + nadi) / 8);

  return { varna, vashya, tara, yoni, grahaMaitri, gana, bhakoot, nadi, total };
}

export function verdictText(total) {
  if (total >= 85) return '운명적 동반자';
  if (total >= 70) return '조화로운 관계';
  if (total >= 50) return '노력하면 좋은 관계';
  if (total >= 35) return '신중히 가야 할 관계';
  return '쉽지 않은 인연';
}

export const KOOT_NAMES = {
  varna: '바르나 (영혼의 결)',
  vashya: '바샤 (끌림)',
  tara: '타라 (감정 호환)',
  yoni: '요니 (본능 궁합)',
  grahaMaitri: '그라하 마이트리 (정신적 우정)',
  gana: '가나 (기질 조화)',
  bhakoot: '바쿠트 (관계 안정도)',
  nadi: '나디 (깊은 인연)',
};
