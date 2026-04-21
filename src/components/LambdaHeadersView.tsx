import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';

interface LambdaHeadersResponse {
  allHeaders: Record<string, string>;
  highlighted: {
    'x-forwarded-for': string | null;
    'x-auth-user': string | null;
    'x-real-ip': string | null;
    'user-agent': string | null;
    host: string | null;
    origin: string | null;
    referer: string | null;
  };
  requestContext: {
    sourceIp: string | null;
    method: string | null;
    path: string | null;
  };
}

export default function LambdaHeadersView() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [headers, setHeaders] = useState<LambdaHeadersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [echoHeadersUrl, setEchoHeadersUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get the Lambda URL from Amplify outputs
    const config = Amplify.getConfig();
    const customConfig = (config as { custom?: { echoHeadersUrl?: string } }).custom;
    if (customConfig?.echoHeadersUrl) {
      setEchoHeadersUrl(customConfig.echoHeadersUrl);
    }
  }, []);

  const fetchHeaders = async () => {
    if (!echoHeadersUrl) {
      setError('Echo headers Lambda URL not configured. Deploy the backend first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(echoHeadersUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setHeaders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch headers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && !headers && !loading && echoHeadersUrl) {
      fetchHeaders();
    }
  }, [isExpanded, echoHeadersUrl]);

  return (
    <div className="debug-section">
      <button
        className="debug-section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="debug-section-title">
          {isExpanded ? '▼' : '▶'} Server-Side Headers (Lambda)
        </span>
      </button>

      {isExpanded && (
        <div className="debug-section-content">
          {!echoHeadersUrl && (
            <div className="debug-message warning">
              <p className="debug-note">
                <strong>Note:</strong> The echo-headers Lambda URL is not configured.
                Deploy the Amplify backend to enable this feature.
              </p>
            </div>
          )}

          {echoHeadersUrl && (
            <div className="debug-actions">
              <button
                onClick={fetchHeaders}
                className="debug-button"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh Headers'}
              </button>
              {headers && (
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(headers, null, 2))}
                  className="debug-button"
                >
                  Copy as JSON
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="debug-message error">
              <p className="debug-note">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {loading && <p>Loading server headers...</p>}

          {headers && (
            <>
              <div className="debug-subsection">
                <h4>Request Context</h4>
                <div className="debug-info-grid">
                  <div className="debug-info-item">
                    <span className="debug-label">Source IP:</span>
                    <span className="debug-value">{headers.requestContext.sourceIp || '(none)'}</span>
                  </div>
                  <div className="debug-info-item">
                    <span className="debug-label">Method:</span>
                    <span className="debug-value">{headers.requestContext.method || '(none)'}</span>
                  </div>
                  <div className="debug-info-item">
                    <span className="debug-label">Path:</span>
                    <span className="debug-value">{headers.requestContext.path || '(none)'}</span>
                  </div>
                </div>
              </div>

              <div className="debug-subsection">
                <h4>Highlighted Headers</h4>
                <div className="debug-info-grid">
                  {Object.entries(headers.highlighted).map(([key, value]) => (
                    <div key={key} className="debug-info-item">
                      <span className="debug-label">{key}:</span>
                      <span className="debug-value">{value || '(none)'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <details className="debug-details">
                <summary>All Headers (JSON)</summary>
                <pre className="debug-code json">
                  {JSON.stringify(headers.allHeaders, null, 2)}
                </pre>
              </details>

              <details className="debug-details">
                <summary>Full Response (JSON)</summary>
                <pre className="debug-code json">
                  {JSON.stringify(headers, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      )}
    </div>
  );
}
