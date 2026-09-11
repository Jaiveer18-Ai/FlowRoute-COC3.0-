import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkNode from './NetworkNode';
import NetworkEdge from './NetworkEdge';
import { generateNodes, generateEdges, canonicalEdgeId, EDGE_CAPACITY } from '../../lib/graph';
import type { EdgeFlows, Route } from '../../types/contract';

interface Props {
  width?: number;
  height?: number;
  edgeFlows?: EdgeFlows;
  highlightedRoutes?: Route[];
  routeType?: 'baseline' | 'optimized';
  showParticles?: boolean;
  showDisruption?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSelectTrip?: (tripId: number) => void;
}

const NetworkGraph: React.FC<Props> = ({
  width = 500,
  height = 500,
  edgeFlows = {},
  highlightedRoutes = [],
  routeType = 'baseline',
  showParticles = true,
  showDisruption = true,
  interactive = true,
  className,
  style,
  onSelectTrip,
}) => {
  const [hoveredNode, setHoveredNode] = useState<[number, number] | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<{
    from: [number, number];
    to: [number, number];
  } | null>(null);

  const size = Math.min(width, height);
  const padding = size * 0.12;

  const nodes = useMemo(() => generateNodes(), []);
  const edges = useMemo(() => generateEdges(), []);

  // Build a set of edges that are part of highlighted routes
  const routeEdgeSet = useMemo(() => {
    const set = new Set<string>();
    for (const route of highlightedRoutes) {
      for (let i = 0; i < route.path.length - 1; i++) {
        const id = canonicalEdgeId(route.path[i], route.path[i + 1]);
        set.add(id);
      }
    }
    return set;
  }, [highlightedRoutes]);

  // Hovered node's connected edges
  const connectedEdges = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const set = new Set<string>();
    for (const e of edges) {
      if (
        (e.from[0] === hoveredNode[0] && e.from[1] === hoveredNode[1]) ||
        (e.to[0] === hoveredNode[0] && e.to[1] === hoveredNode[1])
      ) {
        set.add(canonicalEdgeId(e.from, e.to));
      }
    }
    return set;
  }, [hoveredNode, edges]);

  const handleNodeHover = useCallback((node: [number, number] | null) => {
    if (interactive) setHoveredNode(node);
  }, [interactive]);

  const handleEdgeHover = useCallback(
    (edge: { from: [number, number]; to: [number, number] } | null) => {
      if (interactive) setHoveredEdge(edge);
    },
    [interactive]
  );

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
        role="img"
        aria-label="5×5 transit network grid showing nodes, edges, traffic flows, and disruption"
      >
        {/* Background grid hints */}
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Edges */}
        {edges.map((e) => {
          const id = canonicalEdgeId(e.from, e.to);
          const flow = edgeFlows[id] || 0;
          const isInRoute = routeEdgeSet.has(id);

          return (
            <NetworkEdge
              key={id}
              from={e.from}
              to={e.to}
              size={size}
              padding={padding}
              flow={flow}
              disrupted={showDisruption ? e.disrupted : false}
              isRoute={isInRoute}
              routeType={routeType}
              showParticles={showParticles && flow > 0}
              onHover={handleEdgeHover}
            />
          );
        })}

        {/* Route overlays — draw highlighted routes on top */}
        {highlightedRoutes.map((route) => {
          const points = route.path.map((p) => {
            const { px, py } = (() => {
              const usable = size - padding * 2;
              const step = usable / 4;
              return { px: padding + p[0] * step, py: padding + p[1] * step };
            })();
            return `${px},${py}`;
          }).join(' ');

          return (
            <motion.polyline
              key={`route-${route.trip_id}`}
              points={points}
              fill="none"
              stroke={routeType === 'optimized' ? 'var(--color-accent-bright)' : 'var(--color-warning)'}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.7}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
              onClick={() => onSelectTrip?.(route.trip_id)}
            />
          );
        })}

        {/* Nodes — rendered on top */}
        {nodes.map(({ x, y }) => (
          <NetworkNode
            key={`${x}-${y}`}
            x={x}
            y={y}
            size={size}
            padding={padding}
            isHighlighted={
              hoveredNode !== null &&
              hoveredNode[0] === x &&
              hoveredNode[1] === y
            }
            isActive={
              connectedEdges.size > 0 &&
              edges.some(
                (e) =>
                  connectedEdges.has(canonicalEdgeId(e.from, e.to)) &&
                  ((e.from[0] === x && e.from[1] === y) ||
                    (e.to[0] === x && e.to[1] === y))
              )
            }
            onHover={handleNodeHover}
          />
        ))}
      </svg>

      {/* Tooltip for hovered edge */}
      <AnimatePresence>
        {hoveredEdge && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              gap: '12px',
            }}
          >
            <span>
              ({hoveredEdge.from[0]},{hoveredEdge.from[1]}) → ({hoveredEdge.to[0]},{hoveredEdge.to[1]})
            </span>
            {(() => {
              const id = canonicalEdgeId(hoveredEdge.from, hoveredEdge.to);
              const flow = edgeFlows[id] || 0;
              return (
                <>
                  <span>Flow: {flow}</span>
                  <span>Cap: {EDGE_CAPACITY}</span>
                  <span style={{
                    color: flow / EDGE_CAPACITY > 1 ? 'var(--color-danger)' :
                           flow / EDGE_CAPACITY > 0.85 ? 'var(--color-warning)' :
                           'var(--color-text-muted)'
                  }}>
                    {(flow / EDGE_CAPACITY).toFixed(2)}×
                  </span>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(NetworkGraph);
