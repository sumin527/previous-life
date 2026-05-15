import { useState } from 'react';
import { getSunSign, getMoonSign, getMoonSignFallback, isSignReady } from '../utils/astro';
import characters from '../data/characters.json';
import './InputForm.css';

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i === 0 ? '0시 (자정)' : i === 12 ? '12시 (정오)' : `${i}시`,
}));
const REGIONS = [
  '서울특별시','부산광역시','인천광역시','대구광역시','광주광역시',
  '대전광역시','울산광역시','세종특별자치시','경기도','강원특별자치도',
  '충청북도','충청남도','전북특별자치도','전라남도','경상북도','경상남도','제주특별자치도',
];

function getDaysInMonth(m, y) {
  if (!m) return 31;
  if (m === 2) {
    const yr = y || 2000;
    return (yr % 4 === 0 && (yr % 100 !== 0 || yr % 400 === 0)) ? 29 : 28;
  }
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

export default function InputForm({ onBack, onResult, onComingSoon }) {
  const [year, setYear]           = useState('');
  const [month, setMonth]         = useState('');
  const [day, setDay]             = useState('');
  const [hour, setHour]           = useState('');
  const [skipHour, setSkipHour]   = useState(false);   // "태어난 시간을 모릅니다"
  const [region, setRegion]       = useState('');
  const [skipRegion, setSkipRegion] = useState(false); // "태어난 장소를 모릅니다"
  const [gender, setGender]       = useState('');
  const [error, setError]         = useState('');

  const handleMonthChange = (e) => {
    const m = parseInt(e.target.value);
    setMonth(e.target.value);
    if (parseInt(day) > getDaysInMonth(m, parseInt(year))) setDay('');
  };

  const handleSubmit = () => {
    setError('');
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);

    if (!year || !month || !day) {
      setError('생년월일을 모두 선택해주세요.');
      return;
    }
    if (isNaN(y) || y < 1900 || y > 2025) {
      setError('올바른 연도를 입력해주세요. (1900–2025)');
      return;
    }
    const testDate = new Date(Date.UTC(y, m - 1, d));
    if (
      testDate.getUTCFullYear() !== y ||
      testDate.getUTCMonth() !== m - 1 ||
      testDate.getUTCDate() !== d
    ) {
      setError('올바른 날짜를 입력해주세요.');
      return;
    }
    if (!skipHour && hour === '') {
      setError('태어난 시간을 선택하거나, 모른다면 체크해주세요.');
      return;
    }
    if (!skipRegion && region === '') {
      setError('태어난 장소를 선택하거나, 모른다면 체크해주세요.');
      return;
    }
    if (!gender) {
      setError('성별을 선택해주세요.');
      return;
    }

    const sunSign  = getSunSign(y, m, d);
    const moonSign = !skipHour && hour !== ''
      ? getMoonSign(y, m, d, parseInt(hour))
      : getMoonSignFallback(y, m, d);

    if (!isSignReady(sunSign)) {
      onComingSoon({ sunSign, moonSign });
      return;
    }

    const character = characters.find(c => c.id === `${sunSign}_${moonSign}`);
    if (!character) {
      onComingSoon({ sunSign, moonSign });
      return;
    }

    onResult({ character, sunSign, moonSign, gender, region: skipRegion ? null : region });
  };

  const maxDays = getDaysInMonth(parseInt(month), parseInt(year));

  return (
    <div className="input-form page">
      <header className="form-header">
        <button className="btn-back" onClick={onBack}>← 뒤로</button>
        <span className="form-step-badge">정보 입력</span>
      </header>

      <div className="form-hero">
        <div className="form-orb">🌙</div>
        <p className="form-desc text-center">
          당신의 <span className="text-gold">출생 정보</span>를 알려주세요
        </p>
      </div>

      <div className="card-glass form-card">

        {/* 생년월일 — 3열 한 줄 */}
        <div className="form-row-3">
          <div className="form-group">
            <label>연도</label>
            <input
              className="form-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="1995"
              maxLength={4}
              value={year}
              onChange={e => setYear(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="form-group">
            <label>월</label>
            <select className="form-select" value={month} onChange={handleMonthChange}>
              <option value="">--</option>
              {MONTHS.map((lbl, i) => (
                <option key={i + 1} value={i + 1}>{lbl}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>일</label>
            <select className="form-select" value={day} onChange={e => setDay(e.target.value)}>
              <option value="">--</option>
              {Array.from({ length: maxDays }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}일</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divider mt-20" />

        {/* 출생 시간 */}
        <div className="form-group">
          <label>출생 시간</label>
          <select
            className="form-select"
            value={hour}
            disabled={skipHour}
            onChange={e => setHour(e.target.value)}
          >
            <option value="">-- 시 --</option>
            {HOURS.map(h => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>

        <label className="checkbox-row mt-10">
          <input
            type="checkbox"
            checked={skipHour}
            onChange={e => { setSkipHour(e.target.checked); setHour(''); }}
          />
          출생 시간을 몰라요
        </label>
        {skipHour && (
          <p className="field-hint mt-4">체크하면 대략적인 결과로 보여드려요</p>
        )}

        <div className="divider mt-20" />

        {/* 태어난 장소 */}
        <div className="form-group">
          <label>출생 장소</label>
          <select
            className="form-select"
            value={region}
            disabled={skipRegion}
            onChange={e => setRegion(e.target.value)}
          >
            <option value="">-- 시/도 --</option>
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <label className="checkbox-row mt-10">
          <input
            type="checkbox"
            checked={skipRegion}
            onChange={e => { setSkipRegion(e.target.checked); setRegion(''); }}
          />
          출생 장소를 몰라요
        </label>

        <div className="divider mt-20" />

        {/* 성별 */}
        <div className="form-group">
          <label>성별</label>
          <div className="radio-group">
            {['여성', '남성', '선택 안 함'].map(g => (
              <label key={g} className="radio-row">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="form-error mt-16">{error}</p>}

        <button className="btn btn-gold w-full mt-24" onClick={handleSubmit}>
          ✨ 전생 확인하기
        </button>
      </div>

      <p className="form-note text-center mt-16">
        입력하신 정보는 저장되지 않습니다
      </p>
    </div>
  );
}
