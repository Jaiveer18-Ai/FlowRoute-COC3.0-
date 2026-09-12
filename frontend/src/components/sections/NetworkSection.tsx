import React from 'react';
import { motion, useInView } from 'framer-motion';
import NetworkGraph from '../network/NetworkGraph';
import NetworkLegend from '../network/NetworkLegend';

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
        <div className="network-section-grid">
          {/* Section text header */}
          <div style={{ maxWidth: 540 }}>
            <motion.span
              className="label"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-block',
                marginBottom: 'var(--space-4)',
                color: '#1677FF',
                fontWeight: 600,
              }}
            >
              01 — THE NETWORK
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
              A 5×5 bidirectional transit grid
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '17px',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--space-8)',
              }}
            >
              25 nodes. 40 bidirectional edges. Each edge has a nominal capacity of 8
              and a free-flow travel time of 1.0. This baseline topology serves as
              the foundation for all system rerouting computations.
            </motion.p>

            {/* Technical Specs Strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                display: 'flex',
                gap: 'var(--space-6)',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid #E2E8F0',
                marginBottom: 'var(--space-8)',
              }}
            >
              {[
                { value: '25', label: 'NODES' },
                { value: '40', label: 'EDGES' },
                { value: '8.0', label: 'EDGE CAPACITY' },
              ].map(({ value, label }, idx) => (
                <div key={label} style={{ paddingRight: idx < 2 ? 'var(--space-6)' : 0, borderRight: idx < 2 ? '1px solid #E2E8F0' : 'none' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '24px',
                      fontWeight: 800,
                      color: '#0F172A',
                    }}
                  >
                    {value}
                  </div>
                  <div
                    className="label"
                    style={{ marginTop: 'var(--space-1)', fontSize: '10px' }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>

            <NetworkLegend />
          </div>

          {/* Large network visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
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
                showDisruption={false}
                interactive={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .network-section-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-12);
          align-items: center;
        }
        @media (min-width: 960px) {
          .network-section-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-16);
          }
        }
      `}</style>
    </section>
  );
};

export default NetworkSection;
