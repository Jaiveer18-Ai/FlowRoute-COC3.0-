import React from 'react';
import { motion, useInView } from 'framer-motion';
import NetworkGraph from '../network/NetworkGraph';

const NetworkSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      id="network"
      className="section"
      ref={ref}
      style={{ position: 'relative' }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-16)',
            alignItems: 'center',
          }}
        >
          {/* Section header */}
          <div style={{ maxWidth: 600 }}>
            <motion.span
              className="label"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              style={{
                display: 'block',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-accent)',
              }}
            >
              01 — The Network
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
              A 5×5 bidirectional transit grid
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: 480,
              }}
            >
              25 nodes. 40 bidirectional edges. Each edge has a capacity of 8
              and a free-flow travel time of 1. This is the foundation of
              the simulation.
            </motion.p>

            {/* Specs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-6)',
                marginTop: 'var(--space-8)',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              {[
                { value: '25', label: 'Nodes' },
                { value: '40', label: 'Edges' },
                { value: '8', label: 'Edge capacity' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-h2)',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {value}
                  </div>
                  <div
                    className="label"
                    style={{ marginTop: 'var(--space-1)' }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Large network visualization */}
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
              width: 'min(80vw, 500px)',
              height: 'min(80vw, 500px)',
              position: 'relative',
            }}>
              <NetworkGraph
                width={500}
                height={500}
                showParticles={false}
                showDisruption={false}
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

export default NetworkSection;
