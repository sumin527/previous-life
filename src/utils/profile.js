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

const DEATH_WORDS = ['이른', '요절', '쓰러져', '눈밭에', '처형'];
// 제외됨: '젊은'(타인 지칭 오탐), '전사'(warrior 명사 오탐), '불꽃처럼'(비유 오탐)
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

// 스토리와 프로필이 충돌하는 캐릭터의 명시적 오버라이드 (2026-09-30 전수 감사 반영)
// 해시가 id 기반이라 story 내용을 모르므로, story에 성별/신분이 명시된 케이스는 직접 지정
const PROFILE_OVERRIDES = {
  // 성별: story 근거
  cancer_libra: { gender: '여성' },        // "여관 안주인… 남편이 술에 취해"
  cancer_sagittarius: { gender: '남성' },   // "겉으론 세상 자유로운 사내"
  leo_sagittarius: { gender: '여성', status: '평민' }, // "플라멩코 무희"
  sagittarius_capricorn: { gender: '남성' }, // "아내가 해변을 걷자… 손주가 무릎에"
  scorpio_cancer: { gender: '남성' },       // "아내가 병으로 누웠을 때조차"
  virgo_cancer: { gender: '남성' },         // "아내가 병으로 누웠을 때도"
  libra_cancer: { gender: '여성' },         // "당신을 마음에 둔 남자가 다가왔을 때도"
  // 신분: story의 직업 근거 (재력은 신분에서 자동 파생)
  leo_aries: { status: '평민' },            // 검술 사범
  leo_taurus: { status: '평민' },           // 황금 세공인
  leo_gemini: { status: '귀족' },           // 궁정 시인
  leo_cancer: { status: '귀족' },           // 황실 음악가
  leo_leo: { status: '평민' },              // 인기 배우
  leo_libra: { status: '평민' },            // 무대 감독
  leo_capricorn: { status: '평민' },        // 검술 사범
  leo_pisces: { status: '평민' },           // 배우
  capricorn_aries: { status: '평민' },      // 산악인
  capricorn_taurus: { status: '평민' },     // 석공 장인
  capricorn_gemini: { status: '평민' },     // 측량사
  capricorn_virgo: { status: '평민' },      // 시계 장인
  capricorn_libra: { status: '귀족' },      // 왕실 건축가
  capricorn_scorpio: { status: '평민' },    // 갱도 책임자
  capricorn_sagittarius: { status: '귀족' }, // 법학자
  capricorn_capricorn: { status: '귀족' },  // 재상
  capricorn_pisces: { status: '평민' },     // 관료
  capricorn_leo: { status: '평민' },        // 시장
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
    gender: PROFILE_OVERRIDES[character.id]?.gender ?? gender,
    build,
    appearance,
    status: PROFILE_OVERRIDES[character.id]?.status ?? finalStatus,
    wealth: PROFILE_OVERRIDES[character.id]?.status
      ? pick(WEALTH_BY_STATUS[PROFILE_OVERRIDES[character.id].status], u, 2)
      : wealth,
    lifespan: `${age}세`,
  };
}
