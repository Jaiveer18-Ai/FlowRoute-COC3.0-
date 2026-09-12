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

  // Radius tailored for light cartographic layout
  const baseRadius = Math.max(5, size / (GRID_SIZE * 9));

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
      {/* Blue aura halo for selected / active node */}
      {(isActive || isHighlighted) && (
        <motion.circle
          cx={pos.px}
          cy={pos.py}
          r={baseRadius * 2.8}
          fill="rgba(22, 119, 255, 0.22)"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main node circle: white with outline or solid blue when selected */}
      <motion.circle
        cx={pos.px}
        cy={pos.py}
        r={baseRadius * 1.6}
        fill={isActive || isHighlighted ? '#1677FF' : '#FFFFFF'}
        stroke={isActive || isHighlighted ? '#1677FF' : '#94A3B8'}
        strokeWidth={2}
        whileHover={{ scale: 1.25, stroke: '#1677FF' }}
        transition={{ duration: 0.15 }}
      />

      {/* Coordinate label directly above each node */}
      <text
        x={pos.px}
        y={pos.py - baseRadius * 2.3}
        textAnchor="middle"
        fill="#64748B"
        fontSize={Math.max(9, Math.round(size / 48))}
        fontFamily="var(--font-mono)"
        fontWeight="500"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {x},{y}
      </text>
    </g>
  );
};

export default React.memo(NetworkNode);
