import React from 'react';
import { motion, useInView } from 'framer-motion';
import NetworkGraph from '../network/NetworkGraph';

const DisruptionSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      id="disruption"
      className="section"
      ref={ref}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, var(--color-bg) 0%, rgba(239,68,68,0.02) 50%, var(--color-bg) 100%)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-12)',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <motion.span
              className="label"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              style={{
                display: 'block',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-danger)',
              }}
            >
              02 — The Disruption
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
                marginBottom: 'var(--space-6)',
              }}
            >
              One edge goes{' '}
              <span style={{ color: 'var(--color-danger)' }}>dark</span>.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: 520,
                margin: '0 auto',
              }}
            >
              The connection between nodes (2,2) and (3,2) is severed.
              Traffic that relied on this path must reroute — but every
              alternative carries a cost.
            </motion.p>

            {/* Disrupted edge callout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-6)',
                padding: '10px 20px',
                background: 'var(--color-danger-glow)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(239,68,68,0.2)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-danger)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-danger)',
                  display: 'inline-block',
                }}
              />
              Edge (2,2) ↔ (3,2) — Disrupted
            </motion.div>
          </div>

          {/* Network with disruption visible */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div style={{
              width: 'min(80vw, 480px)',
              height: 'min(80vw, 480px)',
              position: 'relative',
            }}>
              {/* Danger glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, var(--color-danger-glow) 0%, transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
              <NetworkGraph
                width={480}
                height={480}
                showParticles={false}
                showDisruption={true}
                interactive={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DisruptionSection;
