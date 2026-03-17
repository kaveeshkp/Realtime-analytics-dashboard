import { memo } from 'react';
import { MiniSparkline } from '../../components/ui/MiniSparkline';
import { fmt, pctColor, pctBg } from '../../utils/dashFormat';
import type { CryptoAsset } from '../../types/dashboard.types';

interface CryptoRowProps {
  crypto: CryptoAsset;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * Memoized crypto row component to prevent re-renders
 * when other rows or parent state changes
 */
export const CryptoRow = memo(function CryptoRow({
  crypto: c,
  index: i,
  isSelected,
  onSelect,
}: CryptoRowProps) {
  const OptimizedImage = require('../ui/OptimizedImage').OptimizedImage;

  return (
    <div
      onClick={() => onSelect(c.id)}
      style={{
        display: 'grid',
        gridTemplateColumns: '50px 1fr 120px 100px 110px 80px',
        padding: '14px 20px',
        cursor: 'pointer',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: isSelected ? 'rgba(245,158,11,0.06)' : 'transparent',
        borderLeft: isSelected ? '2px solid #f59e0b' : '2px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontFamily: "'DM Mono', monospace", color: '#334155', fontSize: 13 }}>
        {i + 1}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {c.image && <OptimizedImage src={c.image} alt={c.name} width={20} height={20} fallbackSrc="◉" />}
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: '#f0f4ff', fontSize: 14 }}>
            {c.symbol}
          </div>
          <div style={{ fontSize: 11, color: '#475569' }}>{c.name}</div>
        </div>
      </div>
      <span style={{ fontFamily: "'DM Mono', monospace", color: '#f0f4ff', fontSize: 13, textAlign: 'right' as const }}>
        {c.price > 1 ? fmt(c.price) : `$${c.price.toFixed(4)}`}
      </span>
      <span style={{ textAlign: 'right' as const }}>
        <span style={{ background: pctBg(c.pct), color: pctColor(c.pct), borderRadius: 5, padding: '3px 8px', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
          {c.pct > 0 ? '+' : ''}
          {c.pct.toFixed(2)}%
        </span>
      </span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#475569', textAlign: 'right' as const }}>
        {fmt(c.marketCap)}
      </span>
      <div style={{ display: 'flex', justifyContent: 'flex-end' as const }}>
        <MiniSparkline data={c.sparkline} positive={c.pct >= 0} />
      </div>
    </div>
  );
});
