import { useEffect } from 'react';
import { useErrorStore, AppError } from '../../store/useErrorStore';

const typeStyles: Record<
  string,
  { icon: string; color: string; bgColor: string; borderColor: string }
> = {
  error: {
    icon: '✕',
    color: '#f87171',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  warning: {
    icon: '⚠',
    color: '#fbbf24',
    bgColor: 'rgba(251,191,36,0.1)',
    borderColor: 'rgba(251,191,36,0.3)',
  },
  success: {
    icon: '✓',
    color: '#22d3a5',
    bgColor: 'rgba(34,211,165,0.1)',
    borderColor: 'rgba(34,211,165,0.3)',
  },
  info: {
    icon: 'ℹ',
    color: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.1)',
    borderColor: 'rgba(59,130,246,0.3)',
  },
};

interface ErrorToastProps {
  error: AppError;
  onDismiss: (id: string) => void;
}

function ErrorToastItem({ error, onDismiss }: ErrorToastProps) {
  const style = typeStyles[error.type] || typeStyles.error;

  useEffect(() => {
    if (error.duration && error.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(error.id);
      }, error.duration);
      return () => clearTimeout(timer);
    }
  }, [error.duration, error.id, onDismiss]);

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        background: style.bgColor,
        border: `1px solid ${style.borderColor}`,
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 10,
        animation: 'slideIn 0.3s ease-out',
        color: style.color,
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>
      <div style={{ minWidth: 20, fontSize: 16 }}>{style.icon}</div>
      <div style={{ flex: 1, wordBreak: 'break-word' }}>
        <p style={{ margin: 0, fontSize: 13 }}>{error.message}</p>
      </div>
      <button
        onClick={() => onDismiss(error.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: style.color,
          cursor: 'pointer',
          padding: 0,
          fontSize: 16,
          minWidth: 20,
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function ErrorToast() {
  const { errors, removeError } = useErrorStore();

  if (errors.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 400,
        pointerEvents: 'auto',
      }}
    >
      {errors.map((error: AppError) => (
        <ErrorToastItem
          key={error.id}
          error={error}
          onDismiss={removeError}
        />
      ))}
    </div>
  );
}
