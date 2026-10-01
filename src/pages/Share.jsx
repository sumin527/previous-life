import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ui from '../data/ui.json';
import characters from '../data/characters.json';
import { decodeToken } from '../utils/match';
import { signNameKo } from '../utils/astro';

const T = ui.share_page;
const R = ui.result;

const SIGN_GLYPH = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

export default function Share() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const data = decodeToken(params.get('d') ?? '');
  const character = data ? characters.find((c) => c.id === `${data.sun}_${data.moon}`) : null;
  const name = data?.name || '친구';

  if (!data || !character) {
    return (
      <div className="result-page page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <h2 className="text-gold" style={{ marginBottom: 15 }}>{T.invalid_title}</h2>
        <p style={{ color: '#aaa', fontSize: 14, marginBottom: 24 }}>{T.invalid_body}</p>
        <button className="btn btn-gold" onClick={() => navigate('/')}>{T.cta}</button>
      </div>
    );
  }

  const teaser = character.story;

  const charmStars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < character.charm ? 'star-filled' : 'star-empty'}>★</span>
  ));

  return (
    <div className="result-page page">
      <header className="result-header">
        <span className="form-step-badge">{T.badge}</span>
      </header>
      <div className="result-hero" style={{ paddingBottom: 8 }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          {name}{T.of_whose}
        </p>
        <div className="result-emoji">{character.emoji}</div>
        <h2 className="result-title text-gold">{character.title}</h2>
        <div className="result-signs">
          <span className="sign-badge sign-sun">{SIGN_GLYPH[data.sun]} 태양 {signNameKo(data.sun)}</span>
          <span className="sign-badge sign-moon">{SIGN_GLYPH[data.moon]} 달 {signNameKo(data.moon)}</span>
        </div>
      </div>
      <div className="card-glass result-stats">
        <div className="stat-item">
          <span className="stat-label">{R.stats.soul_age}</span>
          <span className="stat-value text-gold">{character.soul_age.toLocaleString()}{R.stats.soul_age_unit}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">{R.stats.reincarnation}</span>
          <span className="stat-value text-gold">{character.reincarnation_count}{R.stats.reincarnation_unit}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">{R.stats.charm}</span>
          <span className="charm-stars">{charmStars}</span>
        </div>
      </div>
      <div className="card-glass result-section">
        <h3 className="section-title">{T.story_partial}</h3>
        <p className="section-body" style={{ fontSize: '0.88rem' }}>{teaser}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--violet)', marginTop: 14 }}>{T.story_teaser}</p>
      </div>
      <div className="card-glass" style={{ padding: 20, textAlign: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>{T.cta_title}</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>{T.cta_sub}</p>
        <button className="btn btn-gold w-full" onClick={() => navigate('/')}>{T.cta}</button>
      </div>
      <p className="form-note text-center mt-8 mb-32">{T.footer_note}</p>
    </div>
  );
}
