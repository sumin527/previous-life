import './Landing.css';

export default function Landing({ onStart }) {
  return (
    <div className="landing page">
      <div className="landing-body">

        <div className="landing-orb">
          <span className="landing-orb-emoji">🔮</span>
        </div>

        <div className="landing-headline">
          <h1 className="text-gold">별자리는<br />당신의 전생을<br />기억합니다</h1>
          <p className="landing-sub">
            생년월일 하나로 알아보는 나의 전생 캐릭터<br />
            친구한테 보내면 "나 완전 이거야" 소름 보장
          </p>
        </div>

        <button className="btn btn-gold landing-cta" onClick={onStart}>
          ✨ 내 전생 보기
        </button>

        <p className="landing-hint">
          60개의 전생 캐릭터 중 당신은 누구일까요?
        </p>
      </div>

      <footer className="landing-footer">
        <span>베딕 점성술 기반 · 태양 &amp; 달 별자리 분석</span>
      </footer>
    </div>
  );
}
