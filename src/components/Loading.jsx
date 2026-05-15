import { useState, useEffect } from 'react';
import './Loading.css';

const MESSAGES = [
  { text: '별의 위치를 계산하는 중..', gold: false },
  { text: '환생 중 한 장면을 보여드릴게요', gold: false },
  { text: '찾았다, 당신의 전생', gold: true },
];

export default function Loading({ onDone }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible]   = useState(true);

  useEffect(() => {
    const t = [
      setTimeout(() => setVisible(false),              700),
      setTimeout(() => { setMsgIndex(1); setVisible(true); }, 1000),
      setTimeout(() => setVisible(false),              1700),
      setTimeout(() => { setMsgIndex(2); setVisible(true); }, 2000),
      setTimeout(onDone,                               3200),
    ];
    return () => t.forEach(clearTimeout);
  }, [onDone]);

  const msg = MESSAGES[msgIndex];

  return (
    <div className="loading-page">
      <div className="loading-body">

        {/* 메인 비주얼 */}
        <div className="loading-visual">
          <div className="loading-orb" />
          <div className="loading-ring">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="loading-star" style={{ '--i': i }}>✦</span>
            ))}
          </div>
        </div>

        {/* 순차 메시지 */}
        <p className={[
          'loading-msg',
          msg.gold ? 'loading-msg-final' : '',
          visible ? 'msg-visible' : 'msg-hidden',
        ].join(' ')}>
          {msg.gold
            ? <span className="text-gold">{msg.text}</span>
            : msg.text}
        </p>

        {/* 점 세 개 인디케이터 */}
        <div className="loading-dots">
          <span /><span /><span />
        </div>

      </div>
    </div>
  );
}
