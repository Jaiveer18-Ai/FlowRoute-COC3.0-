import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimulationState } from '../../types/contract';

interface Props {
  status: SimulationState;
  seed: number;
  onSeedChange: (seed: number) => void;
  onLoadInstance: () => void;
  onRunSimulation: () => void;
  onReset: () => void;
  error: string | null;
}

const STATUS_LABELS: Record<SimulationState, string> = {
  'idle': 'Ready',
  'loading-instance': 'Building Network',
  'instance-ready': 'Network Built',
  'loading-baseline': 'Calculating Baseline',
  'baseline-ready': 'Baseline Ready',
  'loading-optimized': 'Optimizing Flows',
  'optimized-ready': 'Optimized',
  'loading-compare': 'Running Simulation',
  'compare-ready': 'Complete',
  'error': 'Error',
};

const STATUS_COLORS: Record<string, string> = {
  'idle': 'var(--color-text-muted)',
  'loading': 'var(--color-accent)',
  'ready': 'var(--color-healthy)',
  'error': 'var(--color-danger)',
};

function getStatusColor(status: SimulationState) {
  if (status === 'error') return STATUS_COLORS['error'];
  if (status.startsWith('loading')) return STATUS_COLORS['loading'];
  if (status === 'compare-ready') return STATUS_COLORS['ready'];
  return STATUS_COLORS['idle'];
}

const SimulationControls: React.FC<Props> = ({
  status,
  seed,
  onSeedChange,
  onLoadInstance: _onLoadInstance,
  onRunSimulation,
  onReset,
  error,
}) => {
  const isLoading = status.startsWith('loading');
  const isComplete = status === 'compare-ready';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        maxWidth: 480,
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-6)',
      }}>
        <span
          className="label"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Simulation
        </span>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-meta)',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          color: getStatusColor(status),
        }}>
          <motion.span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: getStatusColor(status),
              display: 'inline-block',
            }}
            animate={isLoading ? { opacity: [1, 0.3, 1] } : {}}
            transition={isLoading ? { duration: 1, repeat: Infinity } : {}}
          />
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Parameters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        paddingBottom: 'var(--space-6)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div>
          <div className="label" style={{ marginBottom: 'var(--space-2)', fontSize: '10px' }}>
            Seed
          </div>
          <input
            type="number"
            value={seed}
            onChange={(e) => onSeedChange(parseInt(e.target.value) || 42)}
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <div className="label" style={{ marginBottom: 'var(--space-2)', fontSize: '10px' }}>
            Trips
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-primary)',
            padding: '6px 10px',
          }}>
            120
          </div>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 'var(--space-2)', fontSize: '10px' }}>
            Grid
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-primary)',
            padding: '6px 10px',
          }}>
            5 × 5
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={onRunSimulation}
          disabled={isLoading}
          data-cursor="expand"
          style={{
            flex: 1,
            padding: '12px 24px',
            background: isLoading ? 'var(--color-bg-hover)' : 'var(--color-accent)',
            color: isLoading ? 'var(--color-text-muted)' : '#fff',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-small)',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            transition: 'all 0.2s var(--ease-out)',
            boxShadow: isLoading ? 'none' : 'var(--shadow-glow-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
          }}
        >
          {isLoading && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 12,
                height: 12,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
              }}
            />
          )}
          {isComplete ? 'Run Again' : isLoading ? 'Processing' : 'Run Simulation'}
        </button>

        {(isComplete || status === 'error') && (
          <button
            onClick={onReset}
            data-cursor="expand"
            style={{
              padding: '12px 20px',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-secondary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-small)',
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              border: '1px solid var(--color-border)',
              transition: 'all 0.2s var(--ease-out)',
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-4)',
              background: 'var(--color-danger-glow)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-danger)',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>
              Flow Engine Offline
            </div>
            <div style={{ opacity: 0.8 }}>
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SimulationControls;
