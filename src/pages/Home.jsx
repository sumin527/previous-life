import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ui from '../data/ui.json';
import characters from '../data/characters.json';
import { getSunSign, getMoonSign, signNameKo } from '../utils/astro';
import { generateProfile } from '../utils/profile';
import { encodeToken } from '../utils/match';
import { useKakaoReady, shareViaKakao } from '../utils/kakao';
import { MatchHome } from '../components/Match';

const LANDING = ui.landing;
const FORM = ui.form;
const RESULT = ui.result;

const SIGN_GLYPH = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

const VEDIC_URL = 'https://vedic-site.sumin527.workers.dev';

// 17시도 → vedic-site 10도시 매핑
const REGION_TO_CITY = {
  '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구',
  '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전',
  '울산광역시': '울산', '세종특별자치시': '세종', '제주특별자치도': '제주',
  '경기도': '수원', '강원특별자치도': '서울',
  '충청북도': '대전', '충청남도': '대전',
  '전북특별자치도': '광주', '전라남도': '광주',
  '경상북도': '대구', '경상남도': '부산',
};

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

/* ---------------- 랜딩 ---------------- */
function Landing({ onStart }) {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="landing-orb">{LANDING.orb_emoji}</div>
        <h1 className="landing-title">
          {LANDING.headline.map((line, i) => (
            <React.Fragment key={i}>{line}{i < LANDING.headline.length - 1 && <br />}</React.Fragment>
          ))}
        </h1>
        <p className="landing-sub">
          {LANDING.sub.map((line, i) => (
            <React.Fragment key={i}>{line}{i < LANDING.sub.length - 1 && <br />}</React.Fragment>
          ))}
        </p>
        <button className="btn btn-gold btn-large" onClick={onStart}>{LANDING.cta}</button>
        <p className="landing-hint">{LANDING.hint}</p>
        <p className="landing-disclaimer">
          {LANDING.disclaimer.map((line, i) => (
            <React.Fragment key={i}>{line}{i < LANDING.disclaimer.length - 1 && <br />}</React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}

/* ---------------- 입력폼 ---------------- */
function BirthForm({ onBack, onResult }) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [region, setRegion] = useState('');
  const [placeUnknown, setPlaceUnknown] = useState(false);
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');

  const maxDay = daysInMonth(parseInt(year) || 0, parseInt(month) || 0);
  const dayOptions = Array.from({ length: maxDay }, (_, i) => i + 1);

  const handleYearChange = (v) => {
    setYear(v);
    if (parseInt(day) > daysInMonth(parseInt(v) || 0, parseInt(month) || 0)) setDay('');
  };

  const submit = () => {
    setError('');
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (!year || !month || !day) { setError(FORM.errors.birthdate); return; }
    if (isNaN(y) || y < 1900 || y > 2026) { setError(FORM.errors.year); return; }
    const check = new Date(Date.UTC(y, m - 1, d));
    if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
      setError(FORM.errors.date); return;
    }
    if (!timeUnknown && hour === '') { setError(FORM.errors.time); return; }
    if (!timeUnknown && minute === '') { setError(FORM.errors.time); return; }
    if (!placeUnknown && region === '') { setError(FORM.errors.place); return; }
    if (!gender) { setError(FORM.errors.gender); return; }
    onResult({ year: y, month: m, day: d, hour: timeUnknown ? null : parseInt(hour), minute: timeUnknown ? null : parseInt(minute), region: placeUnknown ? '' : region, gender });
  };

  return (
    <div className="input-form page">
      <header className="form-header">
        <button className="btn-back" onClick={onBack}>{FORM.back}</button>
        <span className="form-step-badge">{FORM.badge}</span>
      </header>
      <div className="form-hero">
        <div className="form-orb">🌙</div>
        <p className="form-desc text-center">
          {FORM.title[0]}<span className="text-gold">{FORM.title[1]}</span>{FORM.title[2]}
        </p>
      </div>
      <div className="card-glass form-card">
        <div className="form-group">
          <label>생년월일</label>
          <div className="form-row-3">
            <div>
              <input
                className="form-input" type="number" placeholder={FORM.labels.year}
                value={year} min={1900} max={2026}
                onChange={(e) => handleYearChange(e.target.value)}
              />
              <span className="form-suffix">{FORM.year_suffix}</span>
            </div>
            <select className="form-input" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">{FORM.labels.month}</option>
              {FORM.months.map((ml, i) => <option key={i} value={i + 1}>{ml}</option>)}
            </select>
            <select className="form-input" value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">{FORM.labels.day}</option>
              {dayOptions.map((dd) => <option key={dd} value={dd}>{dd}일</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>{FORM.labels.birth_time}</label>
          <div className="form-row">
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
            <select
              className="form-input" value={minute}
              onChange={(e) => setMinute(e.target.value)}
              disabled={timeUnknown}
            >
              <option value="">{FORM.minute_placeholder}</option>
              {Array.from({ length: 60 }, (_, mi) => (
                <option key={mi} value={mi}>{mi}분</option>
              ))}
            </select>
          </div>
          <label className="form-check">
            <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} />
            <span>{FORM.time_unknown}</span>
          </label>
          <p className="form-hint">{FORM.time_unknown_hint}</p>
        </div>
        <div className="form-group">
          <label>{FORM.labels.birth_place}</label>
          <select
            className="form-input" value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={placeUnknown}
          >
            <option value="">{FORM.place_placeholder}</option>
            {FORM.regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <label className="form-check">
            <input type="checkbox" checked={placeUnknown} onChange={(e) => setPlaceUnknown(e.target.checked)} />
            <span>{FORM.place_unknown}</span>
          </label>
        </div>
        <div className="form-group">
          <label>{FORM.labels.gender}</label>
          <div className="form-radio-group">
            {FORM.gender_options.map((g) => (
              <label key={g} className="form-radio">
                <input type="radio" name="gender" value={g} checked={gender === g} onChange={(e) => setGender(e.target.value)} />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="form-error mt-16">{error}</p>}
        <button className="btn btn-gold w-full mt-24" onClick={submit}>{FORM.submit}</button>
        <p className="form-note text-center mt-16">{FORM.note}</p>
      </div>
    </div>
  );
}

/* ---------------- 로딩 ---------------- */
function Loading() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 900);
    return () => clearTimeout(t1);
  }, []);
  return (
    <div className="loading-page">
      <div className="loading-orb">🔮</div>
      <p className="loading-text">{step === 0 ? '별의 위치를 계산하는 중..' : FORM.loading}</p>
    </div>
  );
}

/* ---------------- 이번 생의 설계도 CTA ---------------- */
function VedicCta({ birth, character }) {
  const href = useMemo(() => {
    const params = new URLSearchParams({ src: 'pastlife' });
    const dob = `${birth.year}-${String(birth.month).padStart(2, '0')}-${String(birth.day).padStart(2, '0')}`;
    params.set('dob', dob);
    if (birth.hour !== null && birth.hour !== undefined) {
      const mm = birth.minute !== null && birth.minute !== undefined ? birth.minute : 0;
      params.set('tob', `${String(birth.hour).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    }
    const city = REGION_TO_CITY[birth.region];
    params.set('place', city || '서울');
    if (!city) params.set('place_est', '1'); // 출생지 모름 → 서울 임시 계산임을 베딕 사이트에 전달
    params.set('ch', character.title);
    return `${VEDIC_URL}/?${params.toString()}`;
  }, [birth, character]);

  return (
    <div className="card-glass vedic-cta-card">
      <h3 className="section-title">🔮 전생 캐릭터는 빙산의 일각</h3>
      <p className="vedic-cta-body">
        같은 달 별자리라도, 태어난 시간에 따라 베딕 차트는 완전히 달라져요.
        이번 생 나의 베딕 차트는 어떤 모습인지 무료로 확인해 보세요.
      </p>
      <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-gold w-full vedic-cta-btn">
        🪐 이번 생의 베딕 차트 보러가기 →
      </a>
      <p className="vedic-cta-note">입력하신 정보로 자동 계산됩니다 · 저장되지 않아요</p>
    </div>
  );
}

/* ---------------- 결과 ---------------- */
function Result({ birth, onRetry, onHome }) {
  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const { character, sunSign, moonSign, moonEstimated, profile } = useMemo(() => {
    const hasTime = birth.hour !== null && birth.hour !== undefined;
    const sun = getSunSign(birth.year, birth.month, birth.day, hasTime ? birth.hour : null, birth.minute);
    const { sign: moon, estimated } = getMoonSign(birth.year, birth.month, birth.day, hasTime ? birth.hour : null, birth.minute);
    const ch = characters.find((c) => c.id === `${sun}_${moon}`);
    return { character: ch, sunSign: sun, moonSign: moon, moonEstimated: estimated, profile: ch ? generateProfile(ch) : null };
  }, [birth]);

  // A안: 입력 정보 요약 + 출생지 한 줄
  const inputSummary = useMemo(() => {
    const date = `${birth.year}년 ${birth.month}월 ${birth.day}일`;
    const hasTime = birth.hour !== null && birth.hour !== undefined;
    const parts = [date];
    if (hasTime) parts.push(`${birth.hour}시 ${birth.minute ?? 0}분`);
    if (birth.region) parts.push(REGION_TO_CITY[birth.region] || birth.region);
    if (birth.gender && birth.gender !== '선택 안 함') parts.push(birth.gender);
    return (RESULT.input_summary_template || '📋 {parts} 기준으로 분석했어요').replace('{parts}', parts.join(' · '));
  }, [birth]);

  const regionKarmaLine = useMemo(() => {
    if (!birth.region || !character) return '';
    const lines = RESULT.region_karma_lines || [];
    if (!lines.length) return '';
    let u = 0;
    const s = birth.region + character.id;
    for (let i = 0; i < s.length; i++) { u = (u << 5) - u + s.charCodeAt(i); u |= 0; }
    const short = REGION_TO_CITY[birth.region] || birth.region;
    return lines[Math.abs(u) % lines.length].replace('{region}', short);
  }, [birth, character]);

  if (!character) {
    return (
      <div className="input-form page">
        <p className="loading-text">{RESULT.loading}</p>
        <p className="form-note text-center">{RESULT.loading_hint}</p>
        <button className="btn btn-outline w-full mt-24" onClick={onHome}>{RESULT.back_home}</button>
      </div>
    );
  }

  const kakaoReady = useKakaoReady();

  const share = async () => {
    const token = encodeToken({ sun: sunSign, moon: moonSign, name: '' });
    const url = `${window.location.origin}/share?d=${token}`;
    const text = RESULT.share_text_template
      .replace('{title}', character.title)
      .replace('{url}', url);
    const sent = await shareViaKakao(
      {
        title: RESULT.kakao_title.replace('{title}', character.title),
        description: RESULT.kakao_description,
        imageUrl: `${window.location.origin}/og-image.png`,
        url,
        buttonTitle: RESULT.kakao_button_title,
      },
      async () => {
        if (navigator.share) {
          navigator.share({ title: RESULT.share_title, text, url });
        } else {
          await navigator.clipboard?.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    );
    if (sent) return;
  };

  const goMatch = () => setShowInvite(true);

  if (showInvite) {
    return (
      <MatchHome
        sunSign={sunSign}
        moonSign={moonSign}
        onBack={() => setShowInvite(false)}
      />
    );
  }

  const charmStars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < character.charm ? 'star-filled' : 'star-empty'}>★</span>
  ));

  const profileItems = [
    { emoji: '👤', label: RESULT.profile_labels.gender, value: profile.gender },
    { emoji: '📏', label: RESULT.profile_labels.build, value: profile.build },
    { emoji: '✨', label: RESULT.profile_labels.appearance, value: profile.appearance },
    { emoji: '👑', label: RESULT.profile_labels.status, value: profile.status },
    { emoji: '💰', label: RESULT.profile_labels.wealth, value: profile.wealth },
    { emoji: '⏳', label: RESULT.profile_labels.lifespan, value: profile.lifespan },
  ];

  return (
    <div className="input-form page">
      <header className="form-header">
        <button className="btn-back" onClick={onHome}>{RESULT.back}</button>
        <span className="form-step-badge">{RESULT.badge}</span>
      </header>

      <p className="input-summary">{inputSummary}</p>

      <div className="result-hero">
        <div className="result-emoji">{character.emoji || '🔮'}</div>
        <h2 className="result-title text-gold">{character.title || RESULT.unknown_title}</h2>
        <div className="result-signs">
          <span className="sign-badge sign-sun">{SIGN_GLYPH[sunSign]} 태양 {signNameKo(sunSign)}</span>
          <span className="sign-badge sign-moon">{SIGN_GLYPH[moonSign]} 달 {signNameKo(moonSign)}{moonEstimated && <span className="moon-estimated">{RESULT.moon_estimated}</span>}</span>
        </div>
      </div>

      <div className="card-glass result-stats">
        <div className="stat-item">
          <span className="stat-label">{RESULT.stats.soul_age}</span>
          <span className="stat-value text-gold">{character.soul_age.toLocaleString()}{RESULT.stats.soul_age_unit}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">{RESULT.stats.reincarnation}</span>
          <span className="stat-value text-gold">{character.reincarnation_count}{RESULT.stats.reincarnation_unit}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">{RESULT.stats.charm}</span>
          <span className="charm-stars">{charmStars}</span>
        </div>
      </div>

      <div className="card-glass result-section">
        <h3 className="section-title">{RESULT.profile_title}</h3>
        <div className="profile-grid">
          {profileItems.map(({ emoji, label, value }) => (
            <div key={label} className="profile-item">
              <span className="profile-label">{emoji} {label}</span>
              <span className="profile-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass result-section">
        <h3 className="section-title">{RESULT.story_title}</h3>
        <p className="section-body">{character.story || RESULT.story_empty}</p>
      </div>

      <div className="card-glass result-section">
        <h3 className="section-title">{RESULT.karma_title}</h3>
        <p className="section-body">{character.karma || RESULT.karma_empty}</p>
        {regionKarmaLine && <p className="section-body region-karma-line">{regionKarmaLine}</p>}
      </div>

      <VedicCta birth={birth} character={character} />

      <div className="card-glass match-cta-card">
        <h3 className="section-title">{RESULT.buttons.match}</h3>
        <p className="match-cta-body">{RESULT.buttons.match_note}</p>
        <button className="btn btn-outline w-full" onClick={goMatch}>
          {RESULT.buttons.match_cta}
        </button>
      </div>

      <div className="result-actions">
        <div className="result-actions-row">
          <button className="btn btn-outline" onClick={share}>
            {copied ? RESULT.buttons.copied : (kakaoReady ? RESULT.buttons.kakao_share : RESULT.buttons.share)}
          </button>
          <button className="btn btn-outline" onClick={onRetry}>
            {RESULT.buttons.retry}
          </button>
        </div>
      </div>

      <p className="form-note text-center mt-24">{RESULT.footer_note}</p>
    </div>
  );
}

/* ---------------- Home (플로우) ---------------- */
export default function Home() {
  const [stage, setStage] = useState('landing');
  const [birth, setBirth] = useState(null);

  const handleResult = (b) => {
    setBirth(b);
    setStage('loading');
    setTimeout(() => setStage('result'), 1800);
  };

  return (
    <div className="page-container">
      {stage === 'landing' && <Landing onStart={() => setStage('form')} />}
      {stage === 'form' && (
        <BirthForm onBack={() => setStage('landing')} onResult={handleResult} />
      )}
      {stage === 'loading' && <Loading />}
      {stage === 'result' && birth && (
        <Result
          birth={birth}
          onRetry={() => setStage('form')}
          onHome={() => setStage('landing')}
        />
      )}
    </div>
  );
}
