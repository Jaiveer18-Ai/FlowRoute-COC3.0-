import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimulationState } from '../../types/contract';
import MagneticButton from '../common/MagneticButton';

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
      className="card-floating"
      style={{
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
          Simulation Parameters
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-meta)',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          color: getStatusColor(status),
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 10px',
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
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        paddingBottom: 'var(--space-6)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div>
          <div className="label" style={{ marginBottom: 'var(--space-2)', fontSize: '10px' }}>
            Random Seed
          </div>
          <input
            type="number"
            value={seed}
            onChange={(e) => onSeedChange(parseInt(e.target.value) || 42)}
            disabled={isLoading}
            style={{
              width: '100%',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
            onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
          />
        </div>
        <div>
          <div className="label" style={{ marginBottom: 'var(--space-2)', fontSize: '10px' }}>
            Total Trips
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-small)',
            fontWeight: 700,
            color: 'var(--color-accent)',
            padding: '6px 10px',
            background: 'rgba(22, 119, 255, 0.05)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(22, 119, 255, 0.15)',
            textAlign: 'center',
          }}>
            120
          </div>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 'var(--space-2)', fontSize: '10px' }}>
            Grid Layout
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-small)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            padding: '6px 10px',
            background: '#F8FAFC',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
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
        <MagneticButton
          onClick={onRunSimulation}
          disabled={isLoading}
          data-cursor="button"
          data-cursor-label={isLoading ? 'COMPUTING' : 'OPTIMIZE'}
          className="btn-primary-pill"
          style={{
            flex: 1,
            height: '46px',
            fontSize: 'var(--text-small)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            opacity: isLoading ? 0.8 : 1,
          }}
        >
          {isLoading && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 14,
                height: 14,
                border: '2px solid rgba(255,255,255,0.35)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: 6,
              }}
            />
          )}
          {isComplete ? 'Run Again' : isLoading ? 'Processing' : 'Run Simulation'}
        </MagneticButton>

        {(isComplete || status === 'error') && (
          <MagneticButton
            onClick={onReset}
            data-cursor="button"
            className="btn-secondary-pill"
            style={{
              padding: '0 20px',
              height: '46px',
            }}
          >
            Reset
          </MagneticButton>
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
              background: 'rgba(239, 51, 64, 0.06)',
              border: '1px solid rgba(239, 51, 64, 0.25)',
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
            <div style={{ opacity: 0.9 }}>
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SimulationControls;
