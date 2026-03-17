import { ReactNode } from 'react';

interface ErrorBannerProps {
  error: Error | null;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

/**
 * Inline error banner component for displaying errors on pages
 * Used when data fetching fails
 */
export function ErrorBanner({ error, message, onRetry, action }: ErrorBannerProps) {
  if (!error) {
    return null;
  }

  const errorMessage = message || error?.message || 'Failed to load data';

  return (
    <div
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 20,
        color: '#f87171',
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <span style={{ fontSize: 16 }}>⚠</span>
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>Error</p>
          <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: 12 }}>
            {errorMessage}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#f87171',
              padding: '6px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
            }}
          >
            Retry
          </button>
        )}
        {action}
      </div>
    </div>
  );
}

/**
 * Simple inline error message component
 */
export function ErrorMessage({ message, icon = '⚠' }: { message: string; icon?: string }) {
  return (
    <div
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 20,
        color: '#f87171',
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}
