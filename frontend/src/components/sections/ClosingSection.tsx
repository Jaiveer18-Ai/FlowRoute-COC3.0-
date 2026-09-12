import React from 'react';
import { motion, useInView } from 'framer-motion';
import MagneticButton from '../common/MagneticButton';

const ClosingSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      className="section"
      ref={ref}
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div className="container" style={{ textAlign: 'center' }}>
        <motion.span
          className="label"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          style={{
            display: 'block',
            marginBottom: 'var(--space-6)',
            color: 'var(--color-accent)',
          }}
        >
          FlowRoute AI
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'var(--text-h1)',
            fontWeight: 700,
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            maxWidth: 600,
            margin: '0 auto var(--space-6)',
          }}
        >
          Better flow.
          <br />
          Same network.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: 460,
            margin: '0 auto var(--space-8)',
          }}
        >
          System-optimal transit rerouting proves that intelligent flow management
          can reduce congestion without adding infrastructure.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MagneticButton
            onClick={() => {
              const el = document.getElementById('simulation');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            data-cursor="button"
            data-cursor-label="SIMULATE"
            className="btn-primary-pill"
            style={{
              height: '48px',
              padding: '0 36px',
            }}
          >
            Run Simulation →
          </MagneticButton>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            marginTop: 'var(--space-20)',
            paddingTop: 'var(--space-8)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
          }}
        >
          <span
            className="label"
            style={{ fontSize: '10px' }}
          >
            Clash of Coders — AI-02
          </span>
          <span
            className="label"
            style={{ fontSize: '10px' }}
          >
            FlowRoute AI © 2026
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default ClosingSection;
