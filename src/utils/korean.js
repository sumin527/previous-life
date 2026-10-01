// 한국어 조사 붙이기 + 인연 텍스트의 A/B 이름 치환 — 원본과 동일

export function attachParticle(name, type) {
  const hasFinal = (name.charCodeAt(name.length - 1) - 44032) % 28 !== 0;
  const forms = { topic: ['은', '는'], subject: ['이', '가'], object: ['을', '를'] }[type];
  return name + forms[hasFinal ? 0 : 1];
}

export function fillNames(text, nameA, nameB) {
  return text
    .replace(/A는/g, attachParticle(nameA, 'topic'))
    .replace(/A가/g, attachParticle(nameA, 'subject'))
    .replace(/A를/g, attachParticle(nameA, 'object'))
    .replace(/A의/g, nameA + '의')
    .replace(/A([^가는를의])/g, nameA + '$1')
    .replace(/B는/g, attachParticle(nameB, 'topic'))
    .replace(/B가/g, attachParticle(nameB, 'subject'))
    .replace(/B를/g, attachParticle(nameB, 'object'))
    .replace(/B의/g, nameB + '의')
    .replace(/B([^가는를의])/g, nameB + '$1');
}
