import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ui from '../data/ui.json';
import { decodeToken } from '../utils/match';
import { MatchResultView } from '../components/Match';

const T = ui.match_result_invalid;

export default function MatchResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const data = decodeToken(params.get('d') ?? '');

  if (!data || !data.a || !data.b) {
    return (
      <div className="page text-center" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <p style={{ color: '#ff6b6b', marginBottom: 20 }}>{T.body}</p>
        <button className="btn btn-gold" onClick={() => navigate('/')}>{T.back}</button>
      </div>
    );
  }

  const personA = { sun: data.a.s, moon: data.a.m, name: data.a.n };
  const personB = { sun: data.b.s, moon: data.b.m, name: data.b.n };

  return (
    <div className="page-container" style={{ paddingBottom: 60 }}>
      <MatchResultView personA={personA} personB={personB} />
      <div className="card-glass" style={{ margin: '20px', padding: 20, textAlign: 'center' }}>
        <p style={{ color: '#aaa', fontSize: 14, marginBottom: 15 }}>{ui.match_result_invalid.cta_title}</p>
        <button className="btn btn-gold w-full" onClick={() => navigate('/')}>
          {ui.match_result_invalid.cta}
        </button>
      </div>
    </div>
  );
}
