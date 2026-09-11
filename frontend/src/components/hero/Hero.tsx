import React from 'react';
import { motion } from 'framer-motion';
import NetworkGraph from '../network/NetworkGraph';
import MagneticButton from '../common/MagneticButton';

interface Props {
  onRunSimulation: () => void;
  isLoading: boolean;
}

const Hero: React.FC<Props> = ({ onRunSimulation, isLoading }) => {
  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: 'calc(var(--space-24) + 16px) var(--space-6) var(--space-16)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="container" style={{ width: '100%', position: 'relative', zIndex: 2 }}>
        <div className="hero-grid">
          {/* Left Column: Text & CTAs */}
          <div className="hero-left-col">
            {/* Technical metadata badge with live radar ping */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                marginBottom: 'var(--space-6)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderRadius: 'var(--radius-pill)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-bright)',
                  boxShadow: '0 0 10px var(--color-accent)',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  color: 'var(--color-accent-bright)',
                  textTransform: 'uppercase',
                }}
              >
                LIVE SIMULATION ENGINE // 5×5 TRANSIT GRID
              </span>
            </motion.div>

            {/* High-contrast Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="hero-title"
              style={{
                marginBottom: 'var(--space-6)',
                textWrap: 'balance',
              }}
            >
              <span>When the network</span>{' '}
              <span style={{ color: 'var(--color-danger)' }}>breaks</span>,
              <br />
              <span style={{ color: 'var(--color-accent-bright)' }}>flow</span>{' '}
              <span>adapts.</span>
            </motion.h1>

            {/* Balanced Body Description */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hero-subtitle"
              style={{
                marginBottom: 'var(--space-8)',
                color: 'var(--color-text-secondary)',
                fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)',
                lineHeight: 1.65,
              }}
            >
              Simulating congestion-aware rerouting across a disrupted transit grid.
              120 trips. One broken edge. System-wide optimization.
            </motion.p>

            {/* Physical Instrument CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="hero-ctas"
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <MagneticButton
                onClick={onRunSimulation}
                disabled={isLoading}
                className="btn-instrument btn-instrument-primary"
                style={{
                  padding: '0 var(--space-8)',
                  height: '48px',
                  borderRadius: 'var(--radius-pill)',
                  boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)',
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                    <span>OPTIMIZING FLOWS</span>
                  </span>
                ) : (
                  'RUN SIMULATION'
                )}
              </MagneticButton>

              <MagneticButton
                onClick={() => {
                  const el = document.getElementById('network');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-instrument"
                style={{
                  padding: '0 var(--space-8)',
                  height: '48px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                EXPLORE NETWORK
              </MagneticButton>
            </motion.div>

            {/* System Telemetry Specs strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{
                display: 'flex',
                gap: 'var(--space-6)',
                marginTop: 'var(--space-10)',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <span className="label" style={{ display: 'block', fontSize: '0.625rem' }}>GRID SIZE</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>5 × 5</span>
              </div>
              <div>
                <span className="label" style={{ display: 'block', fontSize: '0.625rem' }}>NODES / EDGES</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>25 / 40</span>
              </div>
              <div>
                <span className="label" style={{ display: 'block', fontSize: '0.625rem' }}>TOTAL TRIPS</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-accent-bright)' }}>120 DEMAND</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Animated Network Graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 'min(92vw, 480px)',
                height: 'min(92vw, 480px)',
              }}
            >
              {/* Pulsing Luminous Backglow */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '125%',
                  height: '125%',
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 72%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Floating Animated HUD Badge: Top-Right */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -8,
                  zIndex: 10,
                  background: 'rgba(10, 14, 26, 0.85)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  backdropFilter: 'blur(12px)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  letterSpacing: '0.08em',
                  color: 'var(--color-accent-bright)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                  pointerEvents: 'none',
                }}
              >
                ● 120 ACTIVE TRIPS
              </motion.div>

              {/* Floating Animated HUD Badge: Bottom-Left */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                style={{
                  position: 'absolute',
                  bottom: -12,
                  left: -8,
                  zIndex: 10,
                  background: 'rgba(26, 12, 14, 0.85)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  backdropFilter: 'blur(12px)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  letterSpacing: '0.08em',
                  color: '#f87171',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
                  pointerEvents: 'none',
                }}
              >
                ⚠ DISRUPTED: (2,2) ↔ (3,2)
              </motion.div>

              <NetworkGraph
                width={480}
                height={480}
                showParticles={true}
                showDisruption={true}
                interactive={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Subtle Hardware Scroll Cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'absolute',
          bottom: 'var(--space-6)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          zIndex: 2,
        }}
      >
        <span
          className="label"
          style={{ fontSize: '0.625rem', letterSpacing: '0.18em', opacity: 0.7 }}
        >
          SCROLL TO EXPLORE
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 20,
            background: 'linear-gradient(180deg, var(--color-accent-bright) 0%, transparent 100%)',
          }}
        />
      </motion.div>

      {/* Responsive Grid CSS */}
      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-10);
          align-items: center;
        }
        .hero-left-col {
          text-align: center;
          margin: 0 auto;
          max-width: 860px;
        }
        .hero-ctas {
          justify-content: center;
        }
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: minmax(0, 1.18fr) minmax(0, 1fr) !important;
            gap: var(--space-14) !important;
            text-align: left !important;
          }
          .hero-left-col {
            text-align: left !important;
            margin: 0 !important;
            max-width: 660px !important;
          }
          .hero-ctas {
            justify-content: flex-start !important;
          }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.8); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
