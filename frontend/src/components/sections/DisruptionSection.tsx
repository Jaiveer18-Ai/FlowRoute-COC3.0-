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
      style={{ position: 'relative' }}
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
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <motion.span
              className="label"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-block',
                marginBottom: 'var(--space-4)',
                color: '#EF3340',
                fontWeight: 600,
              }}
            >
              02 — THE DISRUPTION
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'var(--text-h1)',
                fontWeight: 800,
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-tight)',
                color: '#0F172A',
                marginBottom: 'var(--space-6)',
              }}
            >
              One edge goes <span style={{ color: '#EF3340' }}>dark</span>.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '17px',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: 540,
                margin: '0 auto',
              }}
            >
              The critical link between nodes (2,2) and (3,2) is severed.
              Traffic that relied on this arterial segment must reroute — but every
              alternative carries cascading congestion.
            </motion.p>

            {/* Disrupted edge badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-6)',
                padding: '8px 20px',
                background: 'rgba(239, 51, 64, 0.08)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(239, 51, 64, 0.25)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-small)',
                fontWeight: 600,
                color: '#EF3340',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.35, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#EF3340',
                  display: 'inline-block',
                }}
              />
              EDGE (2,2) ↔ (3,2) — FAULT DETECTED
            </motion.div>
          </div>

          {/* Network with disruption visible in white card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 'min(90vw, 480px)',
                height: 'min(90vw, 480px)',
                position: 'relative',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
                padding: '16px',
              }}
            >
              <NetworkGraph
                width={440}
                height={440}
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
