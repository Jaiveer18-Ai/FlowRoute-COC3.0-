import React from 'react';
import { motion, useInView } from 'framer-motion';
import MetricsComparison from '../metrics/MetricsComparison';
import type { Solution } from '../../types/contract';

interface Props {
  baseline: Solution | null;
  optimized: Solution | null;
  isReady: boolean;
}

const ResultsSection: React.FC<Props> = ({ baseline, optimized, isReady }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });

  return (
    <section
      id="results"
      className="section"
      ref={ref}
    >
      <div className="container">
        <div style={{ maxWidth: 700, marginBottom: 'var(--space-12)' }}>
          <motion.span
            className="label"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            style={{ display: 'block', marginBottom: 'var(--space-4)', color: 'var(--color-healthy)' }}
          >
            04 — Results
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
            Measure the{' '}
            <span style={{ color: 'var(--color-healthy)' }}>difference</span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: 520,
            }}
          >
            Three metrics tell the story: mean travel time, 95th-percentile travel
            time, and maximum congestion ratio. All values come directly from the
            simulation engine.
          </motion.p>
        </div>

        {isReady && baseline && optimized ? (
          <MetricsComparison
            baselineMetrics={baseline.metrics}
            optimizedMetrics={optimized.metrics}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              padding: 'var(--space-16) var(--space-8)',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text-muted)',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-small)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
            }}>
              Awaiting simulation
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Run the simulation above to see real metrics
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ResultsSection;
