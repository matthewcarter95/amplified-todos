import { useState, useEffect } from 'react';
import { parseCookies, decodeCookieValue, getCookieSize } from '../utils/cookieParser';
import type { DecodedCookie } from '../utils/cookieParser';

const BFF_COOKIE_NAME = 'bffcookie';

export default function CookieView() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cookieData, setCookieData] = useState<{
    found: boolean;
    raw?: string;
    decoded?: DecodedCookie;
    size?: number;
  }>({ found: false });

  useEffect(() => {
    const cookies = parseCookies();

    // Try to find BFF cookie - prioritize "bffcookie" then check common names
    const possibleNames = ['bffcookie', 'appSession', 'bff', 'session', 'auth'];
    let cookieName: string | null = null;
    let cookieValue: string | null = null;

    // First, try exact match
    for (const name of possibleNames) {
      if (cookies[name]) {
        cookieName = name;
        cookieValue = cookies[name];
        break;
      }
    }

    // If no exact match, try to find any cookie with these keywords
    if (!cookieValue) {
      for (const [name, value] of Object.entries(cookies)) {
        if (name.toLowerCase().includes('bffcookie') ||
            name.toLowerCase().includes('session') ||
            name.toLowerCase().includes('auth') ||
            name.toLowerCase().includes('bff')) {
          cookieName = name;
          cookieValue = value;
          break;
        }
      }
    }

    if (cookieValue && cookieName) {
      const decoded = decodeCookieValue(cookieValue);
      setCookieData({
        found: true,
        raw: cookieValue,
        decoded,
        size: getCookieSize(cookieValue)
      });
    } else {
      setCookieData({ found: false });
    }
  }, []);

  const handleCopy = () => {
    if (cookieData.raw) {
      navigator.clipboard.writeText(cookieData.raw);
    }
  };

  return (
    <div className="debug-section">
      <button
        className="debug-section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="debug-section-title">
          {isExpanded ? '▼' : '▶'} BFF Cookie
        </span>
        {!cookieData.found && (
          <span className="debug-badge warning">Not Found</span>
        )}
      </button>

      {isExpanded && (
        <div className="debug-section-content">
          {!cookieData.found ? (
            <div className="debug-message warning">
              <p>No BFF cookie found in document.cookie</p>
              <p className="debug-note">
                Note: Cookies with the HttpOnly flag cannot be accessed from JavaScript.
                If HAProxy sets an HttpOnly cookie, it will not appear here.
              </p>
              <details className="debug-details">
                <summary>Available cookies ({Object.keys(parseCookies()).length})</summary>
                <pre className="debug-code">
                  {JSON.stringify(parseCookies(), null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div>
              <div className="debug-actions">
                <button onClick={handleCopy} className="debug-button">
                  Copy Raw Value
                </button>
              </div>

              <div className="debug-info-grid">
                <div className="debug-info-item">
                  <span className="debug-label">Size:</span>
                  <span className="debug-value">{cookieData.size} bytes</span>
                </div>
                <div className="debug-info-item">
                  <span className="debug-label">Domain:</span>
                  <span className="debug-value">{window.location.hostname}</span>
                </div>
                <div className="debug-info-item">
                  <span className="debug-label">Path:</span>
                  <span className="debug-value">/</span>
                </div>
              </div>

              <div className="debug-subsection">
                <h4>Raw Value</h4>
                <pre className="debug-code">
                  {cookieData.raw}
                </pre>
              </div>

              {cookieData.decoded && cookieData.decoded.decoded !== cookieData.raw && (
                <div className="debug-subsection">
                  <h4>Decoded Value</h4>
                  <pre className="debug-code">
                    {cookieData.decoded.decoded}
                  </pre>
                </div>
              )}

              {cookieData.decoded?.json && (
                <div className="debug-subsection">
                  <h4>Parsed JSON</h4>
                  <pre className="debug-code json">
                    {JSON.stringify(cookieData.decoded.json, null, 2)}
                  </pre>
                </div>
              )}

              <div className="debug-message info">
                <p className="debug-note">
                  Cookie metadata like Expires, Secure, HttpOnly, and SameSite
                  cannot be read from JavaScript. These attributes are only visible
                  in Set-Cookie response headers.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
