import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ui from '../data/ui.json';
import { decodeToken, encodeToken } from '../utils/match';
import { MatchResultView, MatchBirthForm } from '../components/Match';

const INV = ui.match_invalid;

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
        <div className="input-form page">
          <header className="form-header">
            <span className="form-step-badge">궁합 정보 입력</span>
          </header>
          <MatchBirthForm
            personA={personA}
            onResult={(p) => { setPersonB(p); setStage('loading'); }}
            intro={<><span className="text-gold">{personA.name}</span>님이 초대했어요<br />당신의 출생 정보를 입력해주세요</>}
          />
        </div>
      )}
      {stage === 'loading' && <MatchLoading onDone={() => setStage('result')} />}
      {stage === 'result' && personB && (
        <MatchResultView personA={personA} personB={personB} shareBackTo={personA.name} />
      )}
    </div>
  );
}
