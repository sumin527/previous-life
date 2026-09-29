import React from 'react';
import privacy from '../data/privacy.json';

function Block({ tag, text }) {
  if (tag === 'h2') return <h2 className="content-section-title">{text}</h2>;
  if (tag === 'h3') return <h3 className="faq-question" style={{ fontSize: '0.9rem' }}>{text}</h3>;
  return <p className="section-body" style={{ marginBottom: 10 }}>{text}</p>;
}

export default function Privacy() {
  return (
    <div className="content-page page">
      <h1 className="content-title">{privacy.title}</h1>
      <div className="card-glass content-block">
        <p className="section-body" style={{ marginBottom: 16 }}>{privacy.intro}</p>
        {privacy.blocks.map((b, i) => (
          <Block key={i} tag={b.tag} text={b.text} />
        ))}
      </div>
    </div>
  );
}
