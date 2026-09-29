import React, { useState } from 'react';
import ui from '../data/ui.json';
import characters from '../data/characters.json';
import { scoreMatch, verdictText, KOOT_NAMES, encodeToken } from '../utils/match';
import { fillNames } from '../utils/korean';
import { signNameKo } from '../utils/astro';
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

function PersonCard({ person }) {
  const ch = characters.find((c) => c.id === `${person.sun}_${person.moon}`);
  return (
    <div className="match-person">
      <div className="match-person-emoji">{ch?.emoji ?? '🔮'}</div>
      <div className="match-person-name">{person.name}</div>
      <div className="match-person-signs">
        <span className="sign-badge sign-sun">{SIGN_GLYPH[person.sun]} {signNameKo(person.sun)}</span>
        <span className="sign-badge sign-moon">{SIGN_GLYPH[person.moon]} {signNameKo(person.moon)}</span>
      </div>
      {ch && <div className="match-person-title">{ch.title}</div>}
    </div>
  );
}

// _d — 궁합 결과 본문 (공유 컴포넌트)
export function MatchResultView({ personA, personB }) {
  const [copied, setCopied] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const T = ui.match_result;

  const scores = scoreMatch(personA, personB);
  const verdict = verdictText(scores.total);

  const elKey = pairKey(ELEMENT[personA.sun], ELEMENT[personB.sun], ELEMENT_ORDER);
  const moonKey = pairKey(personA.moon, personB.moon, MOON_ORDER);
  const elText = matchElements.find((e) => e.id === elKey);
  const moonText = matchMoonPairs.find((e) => e.id === moonKey);
  const homework = moonText ? fillNames(moonText.homework, personA.name, personB.name) : null;

  const shareResult = async () => {
    const token = encodeToken(personA, personB);
    const url = `${window.location.origin}/match-result?d=${token}`;
    const text = T.share_text_template
      .replace('{nameA}', personA.name)
      .replace('{nameB}', personB.name)
      .replace('{total}', scores.total);
    if (navigator.share) {
      navigator.share({ title: T.share_title, text, url });
    } else {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

      <div className="match-persons">
        <PersonCard person={personA} />
        <div className="match-vs">×</div>
        <PersonCard person={personB} />
      </div>

      <div className="card-glass match-score-card">
        <div className="match-total-score">{scores.total}<span className="match-score-unit">/100</span></div>
        <div className="match-verdict text-gold">{verdict}</div>
      </div>

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
        <button className="btn btn-gold w-full" onClick={shareResult}>
          {copied ? T.copied : T.share}
        </button>
      </div>
      <p className="form-note text-center mt-24">{T.footer_note}</p>
    </div>
  );
}

// jh — 궁합 초대 생성 (결과 페이지 내 인라인)
export function MatchInvite({ sunSign, moonSign, onBack }) {
  const [nickname, setNickname] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
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

  const shareSns = () => {
    const text = T.share_text_template.replace('{name}', nickname.trim());
    if (navigator.share) {
      navigator.share({ title: T.share_title, text, url: link });
    } else {
      copyLink();
    }
  };

  return (
    <div className="input-form page">
      <header className="form-header">
        <button className="btn-back" onClick={onBack}>{T.back}</button>
        <span className="form-step-badge">{T.badge}</span>
      </header>
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
            <button className="btn btn-gold w-full" onClick={shareSns}>{T.share_sns}</button>
            <button className="btn btn-outline w-full mt-12" onClick={copyLink}>
              {copied ? T.copied : T.copy_link}
            </button>
          </div>
        )}
      </div>
      <p className="form-note text-center mt-16">{T.hint}</p>
    </div>
  );
}
