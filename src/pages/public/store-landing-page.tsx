/**
 * StoreLandingPage — Clean & Modern redesign
 * Light, simple, minimal — no overkill.
 *
 * On the consolidated domain this is served at brytelinks.com/store
 * Individual stores are at brytelinks.com/store/:businessName
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storefrontService } from '../../services/storefront.service';

const PLATFORM_NAME = import.meta.env.VITE_STORE_PLATFORM_NAME ?? 'DirectData';
const OG_DESCRIPTION =
  'Get instant mobile data bundles from verified agents across Ghana. MTN, Vodafone, AirtelTigo and more. Fast, reliable, no hassle.';

function setMetaTag(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function StoreLandingPage() {
  const navigate = useNavigate();
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  // Always /store on the consolidated domain.
  // VITE_STORE_ONLY is no longer used in production but kept as a fallback
  // for any legacy standalone-storefront deployments still in use.
  const storePathPrefix = import.meta.env.VITE_STORE_ONLY === 'true' ? '' : '/store';

  useEffect(() => {
    const title = `${PLATFORM_NAME} — Buy Data Bundles Instantly`;
    document.title = title;
    setMetaTag('og:title', title);
    setMetaTag('og:description', OG_DESCRIPTION);
    setMetaTag('og:image', '/android-chrome-512x512.png');
    setMetaTag('og:url', window.location.href);
    setMetaTag('og:type', 'website');
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', OG_DESCRIPTION);
    setMetaTag('twitter:image', '/android-chrome-512x512.png');
  }, []);

  const loadStores = useCallback(async () => {
    try {
      const data = await storefrontService.getRandomStorefronts(6);
      setStoreNames(data.map((s: { businessName: string }) => s.businessName));
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStores(); }, [loadStores]);

  const handleShopNow = () => {
    if (storeNames.length === 0) return;
    setRedirecting(true);
    const pick = storeNames[Math.floor(Math.random() * storeNames.length)];
    setTimeout(() => navigate(`${storePathPrefix}/${pick}`), 300);
  };

  const noStores = !loading && storeNames.length === 0;
  const btnDisabled = redirecting || loading || noStores;

  const btnLabel = redirecting
    ? 'Finding a store…'
    : loading
    ? 'Loading…'
    : noStores
    ? 'No stores available yet'
    : 'Shop now';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .dd-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #F7F6F2;
          height: 100svh;
          width: 100vw;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          text-align: center;
        }

        .dd-logo-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 100px;
          background: #fff;
          border: 1px solid #E5E4DF;
          font-size: 13px;
          font-weight: 600;
          color: #111;
          margin-bottom: 40px;
          animation: ddFadeUp .5s ease both;
        }

        .dd-logo-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #2563EB;
        }

        .dd-title {
          font-size: clamp(36px, 9vw, 60px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -1.5px;
          color: #111;
          margin-bottom: 16px;
          animation: ddFadeUp .5s ease .1s both;
        }

        .dd-title-accent {
          color: #2563EB;
          display: inline-block;
          animation: ddColorShift 4s ease-in-out infinite;
        }

        @keyframes ddColorShift {
          0%, 100% { color: #2563EB; }
          50%       { color: #0EA5E9; }
        }

        .dd-sub {
          font-size: clamp(14px, 3.5vw, 17px);
          color: #666;
          font-weight: 400;
          line-height: 1.6;
          max-width: 300px;
          margin: 0 auto 36px;
          animation: ddFadeUp .5s ease .2s both;
        }

        .dd-chips {
          display: flex;
          gap: 6px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 40px;
          animation: ddFadeUp .5s ease .3s both;
        }

        .dd-chip {
          padding: 4px 11px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
          background: #fff;
          border: 1px solid #E5E4DF;
          color: #444;
          letter-spacing: 0.3px;
        }

        .dd-btn-wrap {
          animation: ddFadeUp .5s ease .4s both;
        }

        .dd-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 100px;
          background: #111;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        }

        .dd-btn:hover:not(:disabled) {
          background: #2563EB;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.25);
        }

        .dd-btn:active:not(:disabled) { transform: scale(0.98); }
        .dd-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .dd-btn svg {
          transition: transform .2s;
          flex-shrink: 0;
        }
        .dd-btn:hover:not(:disabled) svg { transform: translateX(3px); }

        .dd-footnote {
          position: fixed;
          bottom: 24px; left: 0; right: 0;
          text-align: center;
          font-size: 11px;
          color: #aaa;
          letter-spacing: 0.5px;
          animation: ddFadeUp .5s ease .55s both;
        }

        @keyframes ddFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="dd-root">

        <div className="dd-logo-pill">
          <span className="dd-logo-dot" />
          {PLATFORM_NAME}
        </div>

        <h1 className="dd-title">
          Buy data bundles.<br />
          <span className="dd-title-accent">Instantly.</span>
        </h1>

        <p className="dd-sub">
          Verified agents across Ghana.<br />
          Fast, simple, no hassle.
        </p>

        <div className="dd-chips">
          <span className="dd-chip">MTN</span>
          <span className="dd-chip">Vodafone</span>
          <span className="dd-chip">AirtelTigo</span>
        </div>

        <div className="dd-btn-wrap">
          <button
            className="dd-btn"
            onClick={handleShopNow}
            disabled={btnDisabled}
          >
            {btnLabel}
            {!btnDisabled && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M10 5l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          {noStores && (
            <p style={{ marginTop: 12, fontSize: 13, color: '#aaa' }}>
              Check back soon — stores are coming!
            </p>
          )}
        </div>

        <p className="dd-footnote">Fast · Reliable · No hassle</p>

      </div>
    </>
  );
}