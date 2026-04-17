import { useState, useEffect } from 'react';

interface BrowserMetadata {
  userAgent: string;
  platform: string;
  language: string;
  languages: readonly string[];
  referrer: string;
  origin: string;
  hostname: string;
  protocol: string;
  port: string;
  pathname: string;
  cookieEnabled: boolean;
  onLine: boolean;
  hardwareConcurrency: number;
}

export default function HeadersView() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metadata, setMetadata] = useState<BrowserMetadata | null>(null);

  useEffect(() => {
    setMetadata({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      referrer: document.referrer || '(none)',
      origin: window.location.origin,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port || '(default)',
      pathname: window.location.pathname,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency
    });
  }, []);

  const handleCopyJSON = () => {
    if (metadata) {
      navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
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
          {isExpanded ? '▼' : '▶'} Request Headers & Browser Metadata
        </span>
      </button>

      {isExpanded && metadata && (
        <div className="debug-section-content">
          <div className="debug-message info">
            <p className="debug-note">
              <strong>Note:</strong> Browser JavaScript cannot directly access incoming HTTP request headers
              due to security restrictions. The information below shows available browser metadata.
            </p>
            <p className="debug-note">
              To view actual HAProxy headers (X-Forwarded-For, X-Auth-User, etc.), you would need
              to add a backend endpoint that echoes the received headers.
            </p>
          </div>

          <div className="debug-actions">
            <button onClick={handleCopyJSON} className="debug-button">
              Copy as JSON
            </button>
          </div>

          <div className="debug-subsection">
            <h4>User Agent</h4>
            <pre className="debug-code">
              {metadata.userAgent}
            </pre>
          </div>

          <div className="debug-subsection">
            <h4>Browser Information</h4>
            <div className="debug-info-grid">
              <div className="debug-info-item">
                <span className="debug-label">Platform:</span>
                <span className="debug-value">{metadata.platform}</span>
              </div>
              <div className="debug-info-item">
                <span className="debug-label">Language:</span>
                <span className="debug-value">{metadata.language}</span>
              </div>
              <div className="debug-info-item">
                <span className="debug-label">Cookies Enabled:</span>
                <span className="debug-value">{metadata.cookieEnabled ? 'Yes' : 'No'}</span>
              </div>
              <div className="debug-info-item">
                <span className="debug-label">Online:</span>
                <span className="debug-value">{metadata.onLine ? 'Yes' : 'No'}</span>
              </div>
              <div className="debug-info-item">
                <span className="debug-label">CPU Cores:</span>
                <span className="debug-value">{metadata.hardwareConcurrency}</span>
              </div>
            </div>
          </div>

          <div className="debug-subsection">
            <h4>Request Information</h4>
            <div className="debug-info-grid">
              <div className="debug-info-item">
                <span className="debug-label">Origin:</span>
                <span className="debug-value">{metadata.origin}</span>
              </div>
              <div className="debug-info-item">
                <span className="debug-label">Hostname:</span>
                <span className="debug-value">{metadata.hostname}</span>
              </div>
              <div className="debug-info-item">
                <span className="debug-label">Protocol:</span>
                <span className="debug-value">{metadata.protocol}</span>
              </div>
              <div className="debug-info-item">
                <span className="debug-label">Port:</span>
                <span className="debug-value">{metadata.port}</span>
              </div>
              <div className="debug-info-item">
                <span className="debug-label">Pathname:</span>
                <span className="debug-value">{metadata.pathname}</span>
              </div>
              <div className="debug-info-item">
                <span className="debug-label">Referrer:</span>
                <span className="debug-value">{metadata.referrer}</span>
              </div>
            </div>
          </div>

          <div className="debug-subsection">
            <h4>Languages</h4>
            <pre className="debug-code json">
              {JSON.stringify(Array.from(metadata.languages), null, 2)}
            </pre>
          </div>

          <details className="debug-details">
            <summary>Full Metadata (JSON)</summary>
            <pre className="debug-code json">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
