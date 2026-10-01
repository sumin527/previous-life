import React, { useState } from 'react';
import ui from '../data/ui.json';
import characters from '../data/characters.json';
import { scoreMatch, verdictText, KOOT_NAMES, encodeToken } from '../utils/match';
import { getPastLifeBond } from '../utils/pastlife';
import { fillNames } from '../utils/korean';
import { getSunSign, getMoonSignWithTime, getMoonSignHash, signNameKo } from '../utils/astro';
import { useKakaoReady, shareViaKakao } from '../utils/kakao';
import matchElements from '../data/match_elements.json';
import matchMoonPairs from '../data/match_moonpairs.json';

const SIGN_GLYPH = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

const ELEMENT = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};
const ELEMENT_ORDER = ['fire', 'earth', 'air', 'water'];
const MOON_ORDER = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];

function pairKey(a, b, order) {
  const [s, f] = [a, b].sort((x, y) => order.indexOf(x) - order.indexOf(y));
  return `${s}_${f}`;
}

// 출생 정보 입력폼 (초대 수신자용 + 직접 입력용 공용)
function daysInMonth(year, month) {
  if (!month) return 31;
  if (month === 2) {
    const y = year || 2000;
    return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28;
  }
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

function timeLabel(h) {
  if (h === 0) return '0시 (자정)';
  if (h === 12) return '12시 (정오)';
  return `${h}시`;
}

export function MatchBirthForm({ personA, onResult, intro, submitLabel, nicknameLabel, nicknamePlaceholder, nicknameError }) {
  const [nickname, setNickname] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const T = ui.match_invite;
  const FORM = ui.form;
  const labelNickname = nicknameLabel || T.nickname_label;
  const placeholderNickname = nicknamePlaceholder || T.nickname_placeholder;
  const errorNickname = nicknameError || T.nickname_error;

  const maxDay = daysInMonth(parseInt(year) || 0, parseInt(month) || 0);

  const submit = () => {
    setError('');
    if (!nickname.trim()) { setError(errorNickname); return; }
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (!year || !month || !day) { setError('생년월일을 모두 입력해주세요.'); return; }
    if (isNaN(y) || y < 1900 || y > 2025) { setError('올바른 연도를 입력해주세요. (1900–2025)'); return; }
    const check = new Date(Date.UTC(y, m - 1, d));
    if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
      setError(FORM.errors.date); return;
    }
    if (!timeUnknown && hour === '') { setError(FORM.errors.time); return; }
    const sun = getSunSign(y, m, d);
    const moon = !timeUnknown && hour !== ''
      ? getMoonSignWithTime(y, m, d, parseInt(hour))
      : getMoonSignHash(y, m, d);
    onResult({ name: nickname.trim(), sun, moon, gender: gender || '선택 안 함' });
  };

  return (
    <>
      <div className="form-hero">
        <div className="form-orb">💫</div>
        <p className="form-desc text-center">{intro}</p>
      </div>
      {personA && (
        <div className="card-glass" style={{ padding: '14px 20px', marginBottom: 16, textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            {personA.name}의 별자리
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="sign-badge sign-sun">☀️ {signNameKo(personA.sun)}</span>
            <span className="sign-badge sign-moon">🌙 {signNameKo(personA.moon)}</span>
          </div>
        </div>
      )}
      <div className="card-glass form-card">
        <div className="form-group">
          <label>{labelNickname}</label>
          <input
            className="form-input" type="text"
            placeholder={placeholderNickname}
            maxLength={T.nickname_maxlength}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>생년월일</label>
          <div className="form-row-3">
            <div>
              <input
                className="form-input" type="number" placeholder={FORM.labels.year}
                value={year} min={1900} max={2025}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
              />
              <span className="form-suffix">{FORM.year_suffix}</span>
            </div>
            <select className="form-input" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">{FORM.labels.month}</option>
              {FORM.months.map((ml, i) => <option key={i} value={i + 1}>{ml}</option>)}
            </select>
            <select className="form-input" value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">{FORM.labels.day}</option>
              {Array.from({ length: maxDay }, (_, i) => i + 1).map((dd) => (
                <option key={dd} value={dd}>{dd}일</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>{FORM.labels.birth_time}</label>
          <select
            className="form-input" value={hour}
            onChange={(e) => setHour(e.target.value)}
            disabled={timeUnknown}
          >
            <option value="">{FORM.time_placeholder}</option>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{timeLabel(h)}</option>
            ))}
          </select>
          <label className="form-check">
            <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
            <span>{FORM.time_unknown}</span>
          </label>
        </div>
        <div className="form-group">
          <label>{FORM.labels.gender}</label>
          <div className="form-radio-group">
            {FORM.gender_options.map((g) => (
              <label key={g} className="form-radio">
                <input type="radio" name="mbirth_gender" value={g} checked={gender === g} onChange={(e) => setGender(e.target.value)} />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="form-error mt-16">{error}</p>}
        <button className="btn btn-gold w-full mt-24" onClick={submit}>{submitLabel || '💫 인연 결과 보기'}</button>
        <p className="form-note text-center mt-16">{FORM.note}</p>
      </div>
    </>
  );
}

function PersonCard({ person }) {
  const ch = characters.find((c) => c.id === `${person.sun}_${person.moon}`);
  return (
    <div className="match-person">
      <div className="match-person-pastlife">🌀 전생의 모습</div>
      <div className="match-person-emoji">{ch?.emoji ?? '🔮'}</div>
      <div className="match-person-name">{person.name}</div>
      <div className="match-person-signs">
        <span className="sign-badge sign-sun">{SIGN_GLYPH[person.sun]} {signNameKo(person.sun)}</span>
        <span className="sign-badge sign-moon">{SIGN_GLYPH[person.moon]} {signNameKo(person.moon)}</span>
      </div>
      {ch && <div className="match-person-title">「{ch.title}」</div>}
    </div>
  );
}

// _d — 인연 결과 본문 (공유 컴포넌트)
export function MatchResultView({ personA, personB, shareBackTo }) {
  const [copied, setCopied] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const kakaoReady = useKakaoReady();
  const T = ui.match_result;

  const scores = scoreMatch(personA, personB);
  const verdict = verdictText(scores.total);

  const charA = characters.find((c) => c.id === `${personA.sun}_${personA.moon}`);
  const charB = characters.find((c) => c.id === `${personB.sun}_${personB.moon}`);
  const bond = getPastLifeBond(personA, personB, charA, charB, scores.total);

  const elKey = pairKey(ELEMENT[personA.sun], ELEMENT[personB.sun], ELEMENT_ORDER);
  // moonKey는 MOON_ORDER 정렬 순서이므로, A/B 이름도 같은 순서의 사람에 바인딩
  const [moonFirst, moonSecond] = [personA.moon, personB.moon].sort(
    (x, y) => MOON_ORDER.indexOf(x) - MOON_ORDER.indexOf(y)
  );
  const moonKey = `${moonFirst}_${moonSecond}`;
  const firstIsA = moonFirst === personA.moon;
  const nameForA = firstIsA ? personA.name : personB.name;
  const nameForB = firstIsA ? personB.name : personA.name;
  const elText = matchElements.find((e) => e.id === elKey);
  const moonText = matchMoonPairs.find((e) => e.id === moonKey);
  const homework = moonText ? fillNames(moonText.homework, nameForA, nameForB) : null;

  const resultUrl = `${window.location.origin}/match-result?d=${encodeToken(personA, personB)}`;
  const shareResult = async () => {
    const text = T.share_text_template
      .replace('{nameA}', personA.name)
      .replace('{nameB}', personB.name)
      .replace('{bond}', bond ? bond.title : '')
      .replace('{total}', scores.total);
    await shareViaKakao(
      {
        title: (T.kakao_title || T.share_title)
          .replace('{nameA}', personA.name)
          .replace('{nameB}', personB.name)
          .replace('{bond}', bond ? bond.title : ''),
        description: (T.kakao_description || '').replace('{total}', scores.total),
        imageUrl: `${window.location.origin}/og-image.png`,
        url: resultUrl,
        buttonTitle: T.kakao_button_title,
      },
      async () => {
        if (navigator.share) {
          navigator.share({ title: T.share_title, text, url: resultUrl });
        } else {
          await navigator.clipboard?.writeText(resultUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    );
  };

  const detailItems = T.items.map(({ key, label }) => ({
    key, label: KOOT_NAMES[key] || label, score: scores[key],
  }));

  return (
    <div className="match-result-view">
      <header className="form-header">
        <span className="form-step-badge">{T.badge}</span>
      </header>
      <h2 className="match-result-title">{T.title}</h2>
      <p className="match-result-subtitle">{T.subtitle}</p>

      <div className="match-persons">
        <PersonCard person={personA} />
        <div className="match-vs">×</div>
        <PersonCard person={personB} />
      </div>

      <div className="card-glass match-score-card">
        <div className="match-total-score">{scores.total}<span className="match-score-unit">/100</span></div>
        <div className="match-verdict text-gold">{verdict}</div>
      </div>

      {bond && (
        <div className="card-glass result-section bond-section">
          <h3 className="section-title">{T.bond_title}</h3>
          <div className="bond-name text-gold">{bond.title}</div>
          <p className="bond-tagline">{bond.tagline}</p>
          <p className="section-body">{bond.story}</p>
        </div>
      )}

      {elText && (
        <>
          <div className="card-glass result-section">
            <h3 className="section-title">{T.good}</h3>
            <p className="section-body">{elText.match}</p>
          </div>
          <div className="card-glass result-section">
            <h3 className="section-title">{T.clash}</h3>
            <p className="section-body">{elText.clash}</p>
          </div>
        </>
      )}
      {homework && (
        <div className="card-glass result-section">
          <h3 className="section-title">{T.homework}</h3>
          <p className="section-body">{homework}</p>
        </div>
      )}

      <div className="card-glass result-section">
        <button
          className="match-detail-toggle"
          onClick={() => setDetailOpen(!detailOpen)}
        >
          {detailOpen ? T.detail_close : T.detail_open}
        </button>
        {detailOpen && (
          <div className="match-detail-list">
            <h4 className="match-detail-title">{T.detail_title}</h4>
            {detailItems.map(({ key, label, score }) => (
              <div key={key} className="match-detail-item">
                <span className="match-detail-label">{label}</span>
                <div className="match-detail-bar">
                  <div className="match-detail-fill" style={{ width: `${score}%` }} />
                </div>
                <span className="match-detail-score">{score}</span>
              </div>
            ))}
            <p className="match-vedic-note">{T.vedic_note}</p>
            <p className="match-vedic-note-sub">{T.vedic_note_sub}</p>
          </div>
        )}
      </div>

      <div className="result-actions">
        {shareBackTo ? (
          <div className="card-glass share-back-card">
            <p className="share-back-title">💌 {shareBackTo}에게 결과 보내기</p>
            <p className="share-back-note">{(T.share_back_note || '').replace(/\{name\}/g, shareBackTo)}</p>
            <button className="btn btn-gold w-full" onClick={shareResult}>
              {copied ? T.copied : (kakaoReady ? (T.kakao_share_back || T.share_back || T.share) : (T.share_back || T.share)).replace('{name}', shareBackTo)}
            </button>
          </div>
        ) : (
          <button className="btn btn-gold w-full" onClick={shareResult}>
            {copied ? T.copied : (kakaoReady ? (T.kakao_share || T.share) : T.share)}
          </button>
        )}
      </div>
      <p className="form-note text-center mt-24">{T.footer_note}</p>
    </div>
  );
}

// jh — 인연 초대 생성 (결과 페이지 내 인라인)
export function MatchInvite({ sunSign, moonSign, onBack, bare }) {
  const [nickname, setNickname] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const kakaoReady = useKakaoReady();
  const T = ui.match_invite;

  const create = () => {
    if (!nickname.trim()) { setError(T.nickname_error); return; }
    setError('');
    const token = encodeToken({ sun: sunSign, moon: moonSign, name: nickname.trim() });
    setLink(`${window.location.origin}/match?d=${token}`);
  };

  const copyLink = async () => {
    await navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSns = async () => {
    const text = T.share_text_template.replace('{name}', nickname.trim());
    await shareViaKakao(
      {
        title: (T.kakao_title || T.share_title).replace('{name}', nickname.trim()),
        description: T.kakao_description || '',
        imageUrl: `${window.location.origin}/og-image.png`,
        url: link,
        buttonTitle: T.kakao_button_title,
      },
      async () => {
        if (navigator.share) {
          navigator.share({ title: T.share_title, text, url: link });
        } else {
          copyLink();
        }
      }
    );
  };

  const body = (
    <>
      <div className="form-hero">
        <div className="form-orb">💫</div>
        <p className="form-desc text-center">
          {T.hero[0]}<span className="text-gold">{T.hero[1]}</span>{T.hero[2]}
        </p>
      </div>
      <div className="card-glass" style={{ padding: '14px 20px', marginBottom: 16, textAlign: 'center' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>{T.my_signs}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="sign-badge sign-sun">☀️ {signNameKo(sunSign)}</span>
          <span className="sign-badge sign-moon">🌙 {signNameKo(moonSign)}</span>
        </div>
      </div>
      <div className="card-glass form-card">
        <div className="form-group">
          <label>{T.nickname_label}</label>
          <input
            className="form-input" type="text"
            placeholder={T.nickname_placeholder}
            maxLength={T.nickname_maxlength}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
          />
        </div>
        {error && <p className="form-error mt-16">{error}</p>}
        {!link && (
          <button className="btn btn-gold w-full mt-24" onClick={create}>{T.create}</button>
        )}
        {link && (
          <div style={{ marginTop: 20 }}>
            <div className="divider mb-16" />
            <p className="invite-flow-note">{T.flow_note}</p>
            <button className="btn btn-gold w-full" onClick={shareSns}>
              {kakaoReady ? (T.kakao_share || T.share_sns) : T.share_sns}
            </button>
            <button className="btn btn-outline w-full mt-12" onClick={copyLink}>
              {copied ? T.copied : T.copy_link}
            </button>
          </div>
        )}
      </div>
      <p className="form-note text-center mt-16">{T.hint}</p>
    </>
  );

  if (bare) return <>{body}</>;
  return (
    <div className="input-form page">
      <header className="form-header">
        <button className="btn-back" onClick={onBack}>{T.back}</button>
        <span className="form-step-badge">{T.badge}</span>
      </header>
      {body}
    </div>
  );
}

// 직접 입력 — 상대방 출생 정보를 바로 입력해서 인연 확인
export function DirectMatch({ sunSign, moonSign }) {
  const [stage, setStage] = useState('me');
  const [myName, setMyName] = useState('');
  const [personB, setPersonB] = useState(null);
  const [error, setError] = useState('');
  const T = ui.match_direct;
  const INV = ui.match_invite;

  if (stage === 'result' && personB) {
    return (
      <div>
        <button className="btn-back" onClick={() => setStage('partner')} style={{ marginBottom: 12 }}>
          {T.retry}
        </button>
        <MatchResultView
          personA={{ sun: sunSign, moon: moonSign, name: myName }}
          personB={personB}
        />
      </div>
    );
  }

  if (stage === 'partner') {
    return (
      <div>
        <button className="btn-back" onClick={() => setStage('me')} style={{ marginBottom: 12 }}>
          {T.back}
        </button>
        <MatchBirthForm
          onResult={(p) => { setPersonB(p); setStage('result'); }}
          intro={<>{T.partner_intro[0]}<br />{T.partner_intro[1]}</>}
          submitLabel={T.submit}
          nicknameLabel={T.partner_nickname_label}
          nicknamePlaceholder={T.partner_nickname_placeholder}
          nicknameError={T.nickname_error}
        />
      </div>
    );
  }

  const next = () => {
    if (!myName.trim()) { setError(T.nickname_error); return; }
    setError('');
    setStage('partner');
  };

  return (
    <div>
      <div className="form-hero">
        <div className="form-orb">✍️</div>
        <p className="form-desc text-center">
          {T.me_intro[0]}<br />{T.me_intro[1]}
        </p>
      </div>
      <div className="card-glass form-card">
        <div className="form-group">
          <label>{T.nickname_label}</label>
          <input
            className="form-input" type="text"
            placeholder={T.nickname_placeholder}
            maxLength={INV.nickname_maxlength}
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && next()}
          />
        </div>
        {error && <p className="form-error mt-16">{error}</p>}
        <button className="btn btn-gold w-full mt-24" onClick={next}>{T.next}</button>
      </div>
    </div>
  );
}

// 인연 탭 래퍼 — 링크 보내기 / 직접 입력하기
export function MatchHome({ sunSign, moonSign, onBack }) {
  const [tab, setTab] = useState('invite');
  const T = ui.match_home;
  return (
    <div className="input-form page">
      <header className="form-header">
        <button className="btn-back" onClick={onBack}>{T.back}</button>
        <span className="form-step-badge">{T.badge}</span>
      </header>
      <div className="match-tabs">
        <button
          className={`match-tab${tab === 'invite' ? ' active' : ''}`}
          onClick={() => setTab('invite')}
        >
          {T.tab_invite}
        </button>
        <button
          className={`match-tab${tab === 'direct' ? ' active' : ''}`}
          onClick={() => setTab('direct')}
        >
          {T.tab_direct}
        </button>
      </div>
      <div style={{ display: tab === 'invite' ? '' : 'none' }}>
        <MatchInvite sunSign={sunSign} moonSign={moonSign} bare />
      </div>
      <div style={{ display: tab === 'direct' ? '' : 'none' }}>
        <DirectMatch sunSign={sunSign} moonSign={moonSign} />
      </div>
    </div>
  );
}
