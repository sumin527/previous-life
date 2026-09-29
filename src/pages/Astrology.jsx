import React from 'react';
import { Link } from 'react-router-dom';
import astrology from '../data/astrology.json';

export default function Astrology() {
  return (
    <div className="content-page page">
      <h1 className="content-title">{astrology.title}</h1>
      <div className="card-glass content-block">
        {astrology.intro.map((p, i) => (
          <p key={i} className="section-body" style={{ marginBottom: i < astrology.intro.length - 1 ? 14 : 0 }}>{p}</p>
        ))}
      </div>
      {astrology.sections.map((sec, i) => (
        <div key={i} className="card-glass content-block">
          <h2 className="content-section-title">{sec.title}</h2>
          {sec.body.split('\n\n').map((p, j) => (
            <p key={j} className="section-body" style={{ marginBottom: 12 }}>{p}</p>
          ))}
        </div>
      ))}
      <div className="card-glass content-block" style={{ textAlign: 'center' }}>
        <p className="section-body" style={{ marginBottom: 14 }}>
          27개 낙샤트라(달의 저택)의 상세 해설도 준비되어 있어요.
        </p>
        <Link to="/nakshatra" className="btn btn-outline" style={{ textDecoration: 'none', display: 'inline-block' }}>
          낙샤트라 가이드 보기 →
        </Link>
      </div>
    </div>
  );
}
