import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import NetworkGraph from '../network/NetworkGraph';
import NetworkLegend from '../network/NetworkLegend';
import SimulationControls from '../simulation/SimulationControls';
import RouteInspector from '../routes/RouteInspector';
import type { Solution, SimulationState } from '../../types/contract';

interface Props {
  status: SimulationState;
  seed: number;
  baseline: Solution | null;
  optimized: Solution | null;
  error: string | null;
  onSeedChange: (seed: number) => void;
  onLoadInstance: () => void;
  onRunSimulation: () => void;
  onReset: () => void;
}

const SimulationSection: React.FC<Props> = ({
  status,
  seed,
  baseline,
  optimized,
  error,
  onSeedChange,
  onLoadInstance,
  onRunSimulation,
  onReset,
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });

  const [viewMode, setViewMode] = useState<'baseline' | 'optimized'>('baseline');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  const activeSolution = viewMode === 'optimized' ? optimized : baseline;
  const activeEdgeFlows = activeSolution?.edge_flows || {};
  const activeRoutes = activeSolution?.routes || [];

  const selectedRoute = selectedTripId !== null
    ? activeRoutes.find(r => r.trip_id === selectedTripId) || null
    : null;

  const hasResults = status === 'compare-ready' && baseline && optimized;

  return (
    <section
      id="simulation"
      className="section"
      ref={ref}
      style={{ position: 'relative' }}
    >
      <div className="container">
        {/* Section header */}
        <div style={{ maxWidth: 600, marginBottom: 'var(--space-12)' }}>
          <motion.span
            className="label"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--color-accent)' }}
          >
            03 — Simulation
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'var(--text-h1)',
              fontWeight: 700,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Run the optimizer.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}
          >
            Generate 120 trips across the disrupted network. Compare baseline shortest-path
            routing against congestion-aware optimized routing.
          </motion.p>
        </div>

        {/* Main content area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'var(--space-10)',
        }}>
          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
          }}>
            <SimulationControls
              status={status}
              seed={seed}
              onSeedChange={onSeedChange}
              onLoadInstance={onLoadInstance}
              onRunSimulation={onRunSimulation}
              onReset={onReset}
              error={error}
            />
          </div>

          {/* Results: Network + Metrics */}
          {hasResults && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* View mode toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 'var(--space-8)',
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '4px',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid #E2E8F0',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  {(['baseline', 'optimized'] as const).map((mode) => {
                    const isActive = viewMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        data-cursor="button"
                        style={{
                          padding: '8px 26px',
                          borderRadius: 'var(--radius-pill)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-meta)',
                          fontWeight: 600,
                          letterSpacing: 'var(--tracking-wider)',
                          textTransform: 'uppercase',
                          color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                          background: isActive
                            ? (mode === 'optimized' ? 'var(--color-accent)' : '#0F172A')
                            : 'transparent',
                          boxShadow: isActive ? '0 2px 10px rgba(15, 23, 42, 0.15)' : 'none',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          position: 'relative',
                        }}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Network visualization */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 'var(--space-6)',
                position: 'relative',
              }}>
                <div style={{
                  width: 'min(85vw, 550px)',
                  height: 'min(85vw, 550px)',
                  position: 'relative',
                }}>
                  <NetworkGraph
                    width={550}
                    height={550}
                    edgeFlows={activeEdgeFlows}
                    highlightedRoutes={selectedRoute ? [selectedRoute] : []}
                    routeType={viewMode}
                    showParticles={true}
                    showDisruption={true}
                    interactive={true}
                    onSelectTrip={setSelectedTripId}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>

              {/* Legend */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 'var(--space-10)',
              }}>
                <NetworkLegend />
              </div>

              {/* Route Inspector */}
              {activeRoutes.length > 0 && (
                <div style={{ marginBottom: 'var(--space-10)' }}>
                  <RouteInspector
                    routes={activeRoutes}
                    routeType={viewMode}
                    selectedTripId={selectedTripId}
                    onSelectTrip={setSelectedTripId}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SimulationSection;
