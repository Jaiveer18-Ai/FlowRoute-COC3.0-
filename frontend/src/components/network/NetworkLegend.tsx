import React from 'react';

export const NetworkLegendCard: React.FC<{ style?: React.CSSProperties; className?: string }> = ({ style, className }) => {
  return (
    <div
      className={`card-floating ${className || ''}`}
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#475569',
        minWidth: '170px',
        ...style,
      }}
    >
      {/* Node */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '2px solid #94A3B8',
          }}
        />
        <span style={{ fontWeight: 600 }}>Node</span>
      </div>

      {/* Edge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 18, height: 2, background: '#CBD5E1' }} />
        <span style={{ fontWeight: 600 }}>Edge</span>
      </div>

      {/* Disrupted */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: 22 }}>
          <div style={{ width: 22, height: 2, background: 'repeating-linear-gradient(90deg, #EF3340 0, #EF3340 3px, transparent 3px, transparent 6px)' }} />
          <span style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, -50%)', top: '50%', color: '#EF3340', fontSize: '10px', fontWeight: 900 }}>✕</span>
        </div>
        <span style={{ color: '#EF3340', fontWeight: 600 }}>Disrupted</span>
      </div>

      {/* Active Flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 18, height: 3, background: '#1677FF', borderRadius: 1 }} />
        <span style={{ color: '#1677FF', fontWeight: 600 }}>Active Flow</span>
      </div>

      {/* High Congestion */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 18, height: 3, background: '#F59E0B', borderRadius: 1 }} />
        <span style={{ color: '#D97706', fontWeight: 600 }}>High Congestion</span>
      </div>

      {/* Selected */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#1677FF',
            boxShadow: '0 0 8px rgba(22, 119, 255, 0.4)',
          }}
        />
        <span style={{ color: '#1677FF', fontWeight: 600 }}>Selected</span>
      </div>
    </div>
  );
};

const NetworkLegend: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#64748B',
        flexWrap: 'wrap',
        ...style,
      }}
    >
      <span style={{ fontWeight: 600, color: '#0F172A' }}>LEGEND</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFFFFF', border: '2px solid #94A3B8' }} />
        Node
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: 16, height: 2, background: '#CBD5E1' }} />
        Edge
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: 16, height: 2, background: 'repeating-linear-gradient(90deg, #EF3340 0, #EF3340 3px, transparent 3px, transparent 6px)' }} />
        <span style={{ color: '#EF3340', fontWeight: 600 }}>Disrupted</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: 16, height: 3, background: '#1677FF', borderRadius: 1 }} />
        <span style={{ color: '#1677FF', fontWeight: 600 }}>Active Flow</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: 16, height: 3, background: '#F59E0B', borderRadius: 1 }} />
        <span style={{ color: '#D97706', fontWeight: 600 }}>Congested</span>
      </span>
    </div>
  );
};

export default React.memo(NetworkLegend);
