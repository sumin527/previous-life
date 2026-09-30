// 전생 인연 판정 — 두 사람의 전생 캐릭터를 엮어 "전생에 어떤 관계였는지"를 판정
import bonds from '../data/pastlife_bonds.json';
import { generateProfile } from './profile';

const ELEMENT = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

const STATUS_TIER = { '왕족': 3, '귀족': 2, '평민': 1, '하층민': 0 };

const PLACES = {
  fire: ['사막의 대상 도시', '화산 기슭의 마을'],
  earth: ['풍요로운 평야의 왕국', '곡창 지대의 마을'],
  air: ['바람의 고원 도시', '구름 위의 산사'],
  water: ['강가의 항구 마을', '호숫가의 마을'],
};

function hash(s) {
  let u = 0;
  for (let i = 0; i < s.length; i++) { u = (u << 5) - u + s.charCodeAt(i); u |= 0; }
  return Math.abs(u);
}

// personA/B: {sun, moon, name}, charA/B: characters.json 항목, total: 궁합 총점
export function getPastLifeBond(personA, personB, charA, charB, total) {
  if (!charA || !charB) return null;
  const elA = ELEMENT[personA.sun];
  const elB = ELEMENT[personB.sun];
  const tierA = STATUS_TIER[generateProfile(charA).status] ?? 1;
  const tierB = STATUS_TIER[generateProfile(charB).status] ?? 1;
  const h = hash(`${charA.id}|${charB.id}`);

  let id;
  if (total >= 88) id = 'fated_reunion';
  else if (Math.abs(tierA - tierB) >= 2) id = 'beyond_status';
  else if (elA === 'fire' && elB === 'fire') id = total >= 65 ? 'passionate_lovers' : 'rivals';
  else if (elA === 'water' && elB === 'water') id = 'family';
  else if (elA === 'air' && elB === 'air') id = 'soul_friends';
  else if (elA === 'earth' && elB === 'earth') id = 'married';
  else if (total >= 75) id = 'past_lovers';
  else if (total >= 60) id = h % 2 === 0 ? 'old_friends' : 'teacher_student';
  else id = 'unfinished_promise';

  const bond = bonds.find((b) => b.id === id);
  if (!bond) return null;
  const story = bond.stories[h % bond.stories.length];

  const placeList = PLACES[elA] || PLACES.earth;
  const ctx = {
    nameA: personA.name,
    nameB: personB.name,
    titleA: charA.title,
    titleB: charB.title,
    place: placeList[h % placeList.length],
  };
  // 스승/제자: 영혼 나이가 많은 쪽이 스승
  const [tch, stu] = charA.soul_age >= charB.soul_age
    ? [{ p: personA, c: charA }, { p: personB, c: charB }]
    : [{ p: personB, c: charB }, { p: personA, c: charA }];
  ctx.teacher = tch.p.name; ctx.teacherTitle = tch.c.title;
  ctx.student = stu.p.name; ctx.studentTitle = stu.c.title;
  // 신분: 높은 쪽/낮은 쪽
  const [hi, lo] = tierA >= tierB
    ? [{ p: personA, c: charA }, { p: personB, c: charB }]
    : [{ p: personB, c: charB }, { p: personA, c: charA }];
  ctx.noble = hi.p.name; ctx.nobleTitle = hi.c.title;
  ctx.commoner = lo.p.name; ctx.commonerTitle = lo.c.title;

  return {
    id: bond.id,
    title: bond.title,
    tagline: bond.tagline,
    story: story.replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? ''),
  };
}
