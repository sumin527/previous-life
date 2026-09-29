import React, { useState } from 'react';
import nakshatra from '../data/nakshatra.json';

export default function Nakshatra() {
  const [open, setOpen] = useState(null);

  return (
    <div className="content-page page">
      <h1 className="content-title">{nakshatra.title}</h1>
      <div className="card-glass content-block">
        {nakshatra.intro_blocks.map((block, i) => (
          <div key={i} style={{ marginBottom: i < nakshatra.intro_blocks.length - 1 ? 16 : 0 }}>
            {block.title && <h3 className="content-section-title" style={{ fontSize: '0.95rem' }}>{block.title}</h3>}
            <p className="section-body">{block.body}</p>
          </div>
        ))}
      </div>
      <h2 className="content-subtitle">27 낙샤트라 상세</h2>
      <div className="nakshatra-list">
        {nakshatra.entries.map((e) => (
          <div key={e.num} className="card-glass nakshatra-item">
            <button
              className="nakshatra-header"
              onClick={() => setOpen(open === e.num ? null : e.num)}
            >
              <span className="nakshatra-num">{e.num}</span>
              <span className="nakshatra-name">{e.name_kr} <span className="nakshatra-en">({e.name_en})</span></span>
              <span className="nakshatra-arrow">{open === e.num ? '▲' : '▼'}</span>
            </button>
            {open === e.num && (
              <div className="nakshatra-body">
                <p className="nakshatra-meta"><strong>수호:</strong> {e.ruler}</p>
                <p className="nakshatra-meta"><strong>키워드:</strong> {e.keywords}</p>
                <p className="section-body" style={{ marginTop: 10 }}>{e.desc}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
