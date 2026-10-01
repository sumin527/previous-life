import { useEffect, useState } from 'react';

// 카카오 JavaScript 키 — https://developers.kakao.com 에서 앱 생성 후 발급
// 앱 설정 > 플랫폼 > Web에 https://previous-life.pages.dev 등록 필요
export const KAKAO_JAVASCRIPT_KEY = '2553f5d0db629128b490cda22d79e011';

const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

let initPromise = null;

export function initKakao() {
  if (initPromise) return initPromise;
  initPromise = new Promise((resolve) => {
    if (!KAKAO_JAVASCRIPT_KEY) { resolve(false); return; }
    const boot = () => {
      try {
        if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JAVASCRIPT_KEY);
        resolve(window.Kakao.isInitialized());
      } catch {
        resolve(false);
      }
    };
    if (window.Kakao) { boot(); return; }
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onload = boot;
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return initPromise;
}

export function useKakaoReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    initKakao().then((ok) => { if (alive) setReady(!!ok); });
    return () => { alive = false; };
  }, []);
  return ready;
}

// 카카오톡 피드 공유. 성공하면 true, SDK 미준비면 false
export function shareKakaoFeed({ title, description, imageUrl, url, buttonTitle }) {
  try {
    if (!window.Kakao || !window.Kakao.isInitialized()) return false;
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        {
          title: buttonTitle || '보러 가기',
          link: { mobileWebUrl: url, webUrl: url },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

// 카톡 공유 시도 → 실패하면 fallback 실행. 카톡으로 공유됐으면 true
export async function shareViaKakao(params, fallback) {
  const ready = await initKakao();
  if (ready && shareKakaoFeed(params)) return true;
  if (fallback) await fallback();
  return false;
}
