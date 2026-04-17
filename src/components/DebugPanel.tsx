import { useState } from 'react';
import HeadersView from './HeadersView';
import CookieView from './CookieView';
import './DebugPanel.css';

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="debug-panel">
      <div className="debug-panel-header">
        <h2>Debug Information</h2>
        <button
          className="debug-toggle-button"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>

      {isVisible && (
        <div className="debug-panel-content">
          <HeadersView />
          <CookieView />
        </div>
      )}
    </div>
  );
}
