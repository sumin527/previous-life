import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ui from '../data/ui.json';
import { decodeToken, encodeToken } from '../utils/match';
import { getSunSign, getMoonSignWithTime, getMoonSignHash, signNameKo } from '../utils/astro';
import { MatchResultView } from '../components/Match';

const T = ui.match_invite;
const INV = ui.match_invalid;
const FORM = ui.form;

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

// 수신자 정보 입력
function ReceiverForm({ personA, onResult }) {
  const [nickname, setNickname] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');

  const maxDay = daysInMonth(parseInt(year) || 0, parseInt(month) || 0);

  const submit = () => {
    setError('');
    if (!nickname.trim()) { setError(T.nickname_error); return; }
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
    <div className="input-form page">
      <header className="form-header">
        <span className="form-step-badge">궁합 정보 입력</span>
      </header>
      <div className="form-hero">
        <div className="form-orb">💫</div>
        <p className="form-desc text-center">
          <span className="text-gold">{personA.name}</span>님이 초대했어요<br />
          당신의 출생 정보를 입력해주세요
        </p>
      </div>
      <div className="card-glass" style={{ padding: '14px 20px', marginBottom: 16, textAlign: 'center' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          {personA.name}의 별자리
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="sign-badge sign-sun">☀️ {signNameKo(personA.sun)}</span>
          <span className="sign-badge sign-moon">🌙 {signNameKo(personA.moon)}</span>
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
                <input type="radio" name="rgender" value={g} checked={gender === g} onChange={(e) => setGender(e.target.value)} />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="form-error mt-16">{error}</p>}
        <button className="btn btn-gold w-full mt-24" onClick={submit}>💑 궁합 결과 보기</button>
        <p className="form-note text-center mt-16">{FORM.note}</p>
      </div>
    </div>
  );
}

function MatchLoading({ onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="loading-page">
      <div className="loading-orb">💫</div>
      <p className="loading-text">전생의 기록을 펼치는 중...</p>
    </div>
  );
}

export default function Match() {
  const [params] = useSearchParams();
  const [stage, setStage] = useState('input');
  const [personB, setPersonB] = useState(null);
  const personA = React.useMemo(() => decodeToken(params.get('d') ?? ''), [params]);

  // 수신자가 결과를 보면 주소를 결과 링크로 바꿔서 바로 전달할 수 있게
  React.useEffect(() => {
    if (stage === 'result' && personA && personB) {
      try {
        window.history.replaceState(null, '', `/match-result?d=${encodeToken(personA, personB)}`);
      } catch { /* ignore */ }
    }
  }, [stage, personA, personB]);

  if (!personA || !personA.sun || !personA.moon) {
    return (
      <div className="page text-center" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <h2 className="text-gold" style={{ marginBottom: 15 }}>{INV.title}</h2>
        <p style={{ color: '#aaa', fontSize: 14 }}>{INV.body}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {stage === 'input' && (
        <ReceiverForm
          personA={personA}
          onResult={(p) => { setPersonB(p); setStage('loading'); }}
        />
      )}
      {stage === 'loading' && <MatchLoading onDone={() => setStage('result')} />}
      {stage === 'result' && personB && (
        <MatchResultView personA={personA} personB={personB} shareBackTo={personA.name} />
      )}
    </div>
  );
}
