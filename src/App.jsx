import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Match from './pages/Match';
import Share from './pages/Share';
import MatchResult from './pages/MatchResult';

function Header() {
  return (
    <header style={{ padding: '16px 20px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#e8c84a', fontWeight: 800, fontSize: '1.05rem' }}>
        🔮 전생 테스트
      </Link>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '24px 20px 32px', fontSize: '0.75rem', color: '#a09ab866', lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
      <div>베딕 점성술 기반 · 태양 &amp; 달 별자리 분석</div>
      <div style={{ marginTop: 4 }}>이 테스트는 재미로 즐기는 콘텐츠예요. 입력한 정보는 저장되지 않아요.</div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app-layout" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match" element={<Match />} />
          <Route path="/share" element={<Share />} />
          <Route path="/match-result" element={<MatchResult />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
