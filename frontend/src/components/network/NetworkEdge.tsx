import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { gridToPixel, EDGE_CAPACITY } from '../../lib/graph';

interface Props {
  from: [number, number];
  to: [number, number];
  size: number;
  padding: number;
  flow?: number;
  isDisrupted?: boolean;
  isRoute?: boolean;
  routeType?: 'baseline' | 'optimized';
  showParticles?: boolean;
  onHover?: (edge: { from: [number, number]; to: [number, number] } | null) => void;
}

const NetworkEdge: React.FC<Props> = ({
  from, to, size, padding,
  flow = 0,
  isDisrupted = false,
  isRoute = false,
  routeType = 'optimized',
  showParticles = true,
  onHover,
}) => {
  const p1 = useMemo(() => gridToPixel(from[0], from[1], size, padding), [from, size, padding]);
  const p2 = useMemo(() => gridToPixel(to[0], to[1], size, padding), [to, size, padding]);

  const congestionRatio = flow / EDGE_CAPACITY;

  const getEdgeColor = () => {
    if (isDisrupted) return '#EF3340';
    if (isRoute && routeType === 'optimized') return '#1677FF';
    if (isRoute && routeType === 'baseline') return '#F59E0B';
    if (congestionRatio > 0.85) return '#F59E0B';
    if (congestionRatio > 0.4) return '#1677FF';
    if (flow > 0) return '#1677FF';
    return '#CBD5E1';
  };

  const getEdgeWidth = () => {
    if (isDisrupted) return 2;
    if (isRoute) return 3.5;
    if (flow > 0) return Math.max(2, Math.min(5, 1.5 + congestionRatio * 3.5));
    return 2;
  };

  const getEdgeOpacity = () => {
    if (isDisrupted) return 0.95;
    if (isRoute) return 1;
    if (flow > 0) return 0.85;
    return 0.7;
  };

  return (
    <g
      onMouseEnter={() => onHover?.({ from, to })}
      onMouseLeave={() => onHover?.(null)}
      data-cursor="edge"
      style={{ cursor: isDisrupted ? 'not-allowed' : 'pointer' }}
    >
      {/* Hit area */}
      <line
        x1={p1.px} y1={p1.py}
        x2={p2.px} y2={p2.py}
        stroke="transparent"
        strokeWidth={14}
      />

      {/* Disrupted soft glow halo */}
      {isDisrupted && (
        <circle
          cx={(p1.px + p2.px) / 2}
          cy={(p1.py + p2.py) / 2}
          r={26}
          fill="rgba(239, 51, 64, 0.16)"
        />
      )}

      {/* Main Edge line */}
      <motion.line
        x1={p1.px} y1={p1.py}
        x2={p2.px} y2={p2.py}
        stroke={getEdgeColor()}
        strokeWidth={getEdgeWidth()}
        strokeOpacity={getEdgeOpacity()}
        strokeLinecap="round"
        strokeDasharray={isDisrupted ? '5 5' : 'none'}
        initial={false}
        animate={{
          strokeWidth: getEdgeWidth(),
          strokeOpacity: getEdgeOpacity(),
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />

      {/* Disrupted X marker */}
      {isDisrupted && (
        <g>
          <line
            x1={(p1.px + p2.px) / 2 - 6}
            y1={(p1.py + p2.py) / 2 - 6}
            x2={(p1.px + p2.px) / 2 + 6}
            y2={(p1.py + p2.py) / 2 + 6}
            stroke="#EF3340"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <line
            x1={(p1.px + p2.px) / 2 + 6}
            y1={(p1.py + p2.py) / 2 - 6}
            x2={(p1.px + p2.px) / 2 - 6}
            y2={(p1.py + p2.py) / 2 + 6}
            stroke="#EF3340"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Traffic flow particle */}
      {showParticles && flow > 0 && !isDisrupted && (
        <motion.circle
          r={Math.max(2, Math.min(3.5, 1.5 + congestionRatio * 2))}
          fill="#1677FF"
          initial={{ cx: p1.px, cy: p1.py, opacity: 0 }}
          animate={{
            cx: [p1.px, p2.px],
            cy: [p1.py, p2.py],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: Math.max(1.2, 3 - congestionRatio * 1.5),
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </g>
  );
};

export default React.memo(NetworkEdge);
