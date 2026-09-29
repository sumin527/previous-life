// 전생 프로필 6항목 생성 — 원본 사이트와 동일한 결정적 로직
function hashStr(s) {
  let u = 0;
  for (let i = 0; i < s.length; i++) {
    u = (u << 5) - u + s.charCodeAt(i);
    u |= 0; // 32-bit overflow (JS semantics)
  }
  return Math.abs(u);
}

function pick(list, u, offset = 0) {
  return list[(u + offset) % list.length];
}

const DEATH_WORDS = ['젊은', '이른', '요절', '쓰러져', '눈밭에', '전사', '처형', '불꽃처럼'];
const REBIRTH_WORDS = ['새벽', '희망', '다시', '태어나', '피어났'];

const BUILD_MAP = {
  aries: '듬직한', leo: '듬직한',
  taurus: '단단한', capricorn: '단단한',
  gemini: '호리한', libra: '호리한', aquarius: '호리한',
  cancer: '중간', virgo: '중간', pisces: '중간',
  scorpio: '강건한', sagittarius: '강건한',
};

const APPEARANCE_MAP = {
  aries: '야성적인', sagittarius: '야성적인',
  taurus: '화려한', leo: '화려한',
  gemini: '부드러운', libra: '부드러운',
  cancer: '신비로운', pisces: '신비로운', scorpio: '신비로운', aquarius: '신비로운',
  virgo: '단정한', capricorn: '단정한',
};

const WEALTH_BY_STATUS = {
  '왕족': ['막대한', '부유함', '풍족'],
  '귀족': ['풍족', '여유로운', '안정'],
  '평민': ['안정', '평범', '검소'],
  '하층민': ['부족한', '가난함', '궁핍한'],
};

export function generateProfile(character) {
  const u = hashStr(character.id);
  const sun = character.sun_sign;
  const moon = character.moon_sign;

  const m = new Set(['aries', 'leo', 'sagittarius', 'gemini', 'libra', 'aquarius']).has(moon) ? 0 : 1;
  const gender = (u % 3 + m) % 3 === 0 ? '남성' : '여성';
  const build = BUILD_MAP[moon] ?? '중간';
  const appearance = APPEARANCE_MAP[moon] ?? '단정한';

  let status;
  if (['leo', 'capricorn'].includes(sun)) status = '왕족';
  else if (['aries', 'sagittarius', 'libra'].includes(sun)) status = '귀족';
  else if (['taurus', 'virgo', 'cancer', 'gemini'].includes(sun)) status = '평민';
  else status = u % 2 === 0 ? '하층민' : '평민';

  // 1/7 확률로 한 단계 강등
  const tiers = ['하층민', '평민', '귀족', '왕족'];
  let tierIdx = tiers.indexOf(status);
  if (u % 7 === 0 && tierIdx > 0) tierIdx -= 1;
  const finalStatus = tiers[tierIdx];
  const wealth = pick(WEALTH_BY_STATUS[finalStatus], u, 2);

  const story = character.story ?? '';
  const tragic = DEATH_WORDS.some((w) => story.includes(w));
  const hopeful = REBIRTH_WORDS.some((w) => story.includes(w));
  let age;
  if (tragic) age = 23 + (u % 23);
  else if (hopeful) age = 50 + (u % 26);
  else age = 60 + (u % 26);

  return {
    gender,
    build,
    appearance,
    status: finalStatus,
    wealth,
    lifespan: `${age}세`,
  };
}
