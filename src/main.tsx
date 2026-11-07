import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

function dismissStartupDiagnostic() {
  const diag = document.getElementById('campusloop-startup-diag');
  if (diag) {
    diag.style.display = 'none';
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    // Dismiss diagnostic screen once React starts rendering
    dismissStartupDiagnostic();
  } catch (mountErr) {
    console.error('Fatal mount error:', mountErr);
    if (typeof (window as unknown as { __logCampusLoopError?: (msg: string) => void }).__logCampusLoopError === 'function') {
      (window as unknown as { __logCampusLoopError: (msg: string) => void }).__logCampusLoopError(
        'React Mount Error: ' + (mountErr instanceof Error ? mountErr.message : String(mountErr))
      );
    }
  }
} else {
  const errMsg = "CampusLoop mounting error: #root container element was not found in the DOM.";
  console.error(errMsg);
  if (typeof (window as unknown as { __logCampusLoopError?: (msg: string) => void }).__logCampusLoopError === 'function') {
    (window as unknown as { __logCampusLoopError: (msg: string) => void }).__logCampusLoopError(errMsg);
  }
}
