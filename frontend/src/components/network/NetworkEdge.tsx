import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { gridToPixel, EDGE_CAPACITY, isDisruptedEdge } from '../../lib/graph';

interface Props {
  from: [number, number];
  to: [number, number];
  size: number;
  padding: number;
  flow?: number;
  disrupted?: boolean;
  isRoute?: boolean;
  routeType?: 'baseline' | 'optimized';
  showParticles?: boolean;
  onHover?: (edge: { from: [number, number]; to: [number, number] } | null) => void;
}

const NetworkEdge: React.FC<Props> = ({
  from, to, size, padding,
  flow = 0,
  disrupted,
  isRoute = false,
  routeType,
  showParticles = false,
  onHover,
}) => {
  const isDisrupted = disrupted ?? isDisruptedEdge(from, to);

  const p1 = useMemo(() => gridToPixel(from[0], from[1], size, padding), [from, size, padding]);
  const p2 = useMemo(() => gridToPixel(to[0], to[1], size, padding), [to, size, padding]);

  const congestionRatio = flow / EDGE_CAPACITY;

  // Visual encoding
  const getEdgeColor = () => {
    if (isDisrupted) return 'var(--color-danger)';
    if (isRoute && routeType === 'optimized') return 'var(--color-accent-bright)';
    if (isRoute && routeType === 'baseline') return 'var(--color-warning)';
    if (congestionRatio > 1) return 'var(--color-danger)';
    if (congestionRatio > 0.85) return 'var(--color-warning)';
    if (congestionRatio > 0.5) return 'var(--color-accent)';
    if (flow > 0) return 'var(--color-text-secondary)';
    return 'var(--color-border)';
  };

  const getEdgeWidth = () => {
    if (isDisrupted) return 1.5;
    if (isRoute) return 3;
    if (flow === 0) return 1;
    return Math.max(1, Math.min(6, 1 + congestionRatio * 3));
  };

  const getEdgeOpacity = () => {
    if (isDisrupted) return 0.6;
    if (isRoute) return 1;
    if (flow > 0) return 0.5 + Math.min(0.5, congestionRatio * 0.3);
    return 0.25;
  };

  const dx = p2.px - p1.px;
  const dy = p2.py - p1.py;

  return (
    <g
      onMouseEnter={() => onHover?.({ from, to })}
      onMouseLeave={() => onHover?.(null)}
      style={{ cursor: isDisrupted ? 'not-allowed' : 'pointer' }}
    >
      {/* Hit area — wider invisible stroke for easier hover */}
      <line
        x1={p1.px} y1={p1.py}
        x2={p2.px} y2={p2.py}
        stroke="transparent"
        strokeWidth={12}
      />

      {/* Edge line */}
      <motion.line
        x1={p1.px} y1={p1.py}
        x2={p2.px} y2={p2.py}
        stroke={getEdgeColor()}
        strokeWidth={getEdgeWidth()}
        strokeOpacity={getEdgeOpacity()}
        strokeLinecap="round"
        strokeDasharray={isDisrupted ? '4 4' : 'none'}
        initial={false}
        animate={{
          strokeWidth: getEdgeWidth(),
          strokeOpacity: getEdgeOpacity(),
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Disrupted X marker */}
      {isDisrupted && (
        <g>
          <motion.line
            x1={(p1.px + p2.px) / 2 - 6}
            y1={(p1.py + p2.py) / 2 - 6}
            x2={(p1.px + p2.px) / 2 + 6}
            y2={(p1.py + p2.py) / 2 + 6}
            stroke="var(--color-danger)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
          <motion.line
            x1={(p1.px + p2.px) / 2 + 6}
            y1={(p1.py + p2.py) / 2 - 6}
            x2={(p1.px + p2.px) / 2 - 6}
            y2={(p1.py + p2.py) / 2 + 6}
            stroke="var(--color-danger)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          />
        </g>
      )}

      {/* Moving traffic particle */}
      {showParticles && flow > 0 && !isDisrupted && (
        <>
          <circle r={2.5} fill={getEdgeColor()} opacity={0.9}>
            <animateMotion
              dur={`${Math.max(1, 3 - congestionRatio)}s`}
              repeatCount="indefinite"
              path={`M${p1.px},${p1.py} L${p2.px},${p2.py}`}
            />
          </circle>
          {flow > 4 && (
            <circle r={2} fill={getEdgeColor()} opacity={0.6}>
              <animateMotion
                dur={`${Math.max(1, 3 - congestionRatio)}s`}
                repeatCount="indefinite"
                begin={`${Math.max(0.3, 1.5 - congestionRatio * 0.5)}s`}
                path={`M${p2.px},${p2.py} L${p1.px},${p1.py}`}
              />
            </circle>
          )}
        </>
      )}

      {/* Flow label when hovered or has significant flow */}
      {flow > 0 && !isDisrupted && (
        <text
          x={(p1.px + p2.px) / 2 + (dy === 0 ? 0 : 8)}
          y={(p1.py + p2.py) / 2 + (dx === 0 ? -8 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--color-text-muted)"
          fontSize={Math.max(7, size / 55)}
          fontFamily="var(--font-mono)"
          opacity={0.6}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {flow}
        </text>
      )}
    </g>
  );
};

export default React.memo(NetworkEdge);
