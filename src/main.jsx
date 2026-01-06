import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

// Initialize Sentry for error tracking (skip in local dev)
if (!import.meta.env.DEV) {
  Sentry.init({
    dsn: "", // TODO: Add Sentry DSN
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1,
    ignoreErrors: [
      /browsing context is going away/,
      'AbortError',
    ],
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Sentry.ErrorBoundary fallback={<p>Something went wrong. Please refresh the page.</p>}>
        <App />
      </Sentry.ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
