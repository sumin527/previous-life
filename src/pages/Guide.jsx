import React from 'react';
import guide from '../data/guide.json';

export default function Guide() {
  return (
    <div className="content-page page">
      <h1 className="content-title">{guide.title}</h1>
      <div className="card-glass content-block">
        {guide.intro.map((p, i) => (
          <p key={i} className="section-body" style={{ marginBottom: i < guide.intro.length - 1 ? 14 : 0 }}>{p}</p>
        ))}
      </div>
      <h2 className="content-subtitle">자주 묻는 질문 (FAQ)</h2>
      {guide.faq.map((item, i) => (
        <div key={i} className="card-glass content-block">
          <h3 className="faq-question">{item.question}</h3>
          <p className="section-body">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
