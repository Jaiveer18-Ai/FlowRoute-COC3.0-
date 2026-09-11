import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { gridToPixel, GRID_SIZE } from '../../lib/graph';

interface Props {
  x: number;
  y: number;
  size: number;
  padding: number;
  isActive?: boolean;
  isHighlighted?: boolean;
  onHover?: (node: [number, number] | null) => void;
  onClick?: (node: [number, number]) => void;
}

const NetworkNode: React.FC<Props> = ({
  x, y, size, padding,
  isActive = false,
  isHighlighted = false,
  onHover,
  onClick,
}) => {
  const pos = useMemo(() => gridToPixel(x, y, size, padding), [x, y, size, padding]);

  const baseRadius = Math.max(4, size / (GRID_SIZE * 8));

  return (
    <g
      onMouseEnter={() => onHover?.([x, y])}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.([x, y])}
      data-cursor="node"
      data-cursor-label="INSPECT"
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={`Node ${x},${y}`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.([x, y]); }}
    >
      {/* Pulse ring for active/highlighted nodes */}
      {(isActive || isHighlighted) && (
        <motion.circle
          cx={pos.px}
          cy={pos.py}
          r={baseRadius * 3}
          fill="none"
          stroke={isHighlighted ? 'var(--color-accent-bright)' : 'var(--color-text-muted)'}
          strokeWidth={1}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0.4, 0], scale: [0.8, 1.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Glow */}
      {isHighlighted && (
        <circle
          cx={pos.px}
          cy={pos.py}
          r={baseRadius * 2.5}
          fill="var(--color-accent-glow)"
          opacity={0.5}
        />
      )}

      {/* Outer ring */}
      <motion.circle
        cx={pos.px}
        cy={pos.py}
        r={baseRadius * 1.6}
        fill="none"
        stroke={isHighlighted ? 'var(--color-accent)' : 'var(--color-border)'}
        strokeWidth={1}
        whileHover={{ stroke: 'var(--color-accent)', strokeWidth: 1.5 }}
        transition={{ duration: 0.2 }}
      />

      {/* Core dot */}
      <motion.circle
        cx={pos.px}
        cy={pos.py}
        r={baseRadius}
        fill={isHighlighted ? 'var(--color-accent-bright)' : 'var(--color-text-primary)'}
        whileHover={{ scale: 1.3, fill: 'var(--color-accent-bright)' }}
        transition={{ duration: 0.15 }}
      />

      {/* Coordinate label */}
      <text
        x={pos.px}
        y={pos.py - baseRadius * 2.8}
        textAnchor="middle"
        fill="var(--color-text-muted)"
        fontSize={Math.max(8, size / 50)}
        fontFamily="var(--font-mono)"
        opacity={isHighlighted ? 1 : 0.5}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {x},{y}
      </text>
    </g>
  );
};

export default React.memo(NetworkNode);
