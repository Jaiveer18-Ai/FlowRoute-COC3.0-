import React from 'react';

const ITEMS = [
  { color: 'var(--color-border)', label: 'Idle' },
  { color: 'var(--color-text-secondary)', label: 'Low' },
  { color: 'var(--color-accent)', label: 'Medium' },
  { color: 'var(--color-warning)', label: 'High' },
  { color: 'var(--color-danger)', label: 'Over capacity' },
];

const NetworkLegend: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-meta)',
        letterSpacing: 'var(--tracking-wider)',
        textTransform: 'uppercase' as const,
        color: 'var(--color-text-muted)',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ color: 'var(--color-text-secondary)' }}>Edge Flow</span>
      {ITEMS.map(({ color, label }) => (
        <span
          key={label}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span
            style={{
              width: 16,
              height: 3,
              backgroundColor: color,
              borderRadius: 2,
              display: 'inline-block',
            }}
          />
          {label}
        </span>
      ))}
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            width: 16,
            height: 2,
            background: `repeating-linear-gradient(90deg, var(--color-danger) 0, var(--color-danger) 3px, transparent 3px, transparent 6px)`,
            display: 'inline-block',
          }}
        />
        Disrupted
      </span>
    </div>
  );
};

export default React.memo(NetworkLegend);
