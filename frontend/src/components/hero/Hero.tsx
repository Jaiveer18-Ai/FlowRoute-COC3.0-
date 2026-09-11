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
        display: 'grid',
        gridTemplateColumns: '1fr',
        alignItems: 'center',
        padding: 'calc(var(--space-24) + 20px) var(--space-6) var(--space-16)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Precision grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          pointerEvents: 'none',
        }}
      />

      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-10)',
          alignItems: 'center',
        }}
      >
        {/* Text content */}
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          {/* Technical metadata badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              marginBottom: 'var(--space-6)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent-bright)',
                boxShadow: '0 0 8px var(--color-accent)',
                animation: 'pulse-dot 2.4s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-meta)',
                fontWeight: 600,
                letterSpacing: 'var(--tracking-wider)',
                color: 'var(--color-accent-bright)',
                textTransform: 'uppercase',
              }}
            >
              SYS.01 // SYSTEM-OPTIMAL TRANSIT REROUTING
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
              margin: '0 auto var(--space-8)',
            }}
          >
            Simulating congestion-aware rerouting across a disrupted transit grid.
            120 trips. One broken edge. System-wide optimization.
          </motion.p>

          {/* Physical Instrument CTAs with Magnetic Physics */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <MagneticButton
              onClick={onRunSimulation}
              disabled={isLoading}
              className="btn-instrument btn-instrument-primary"
              data-cursor="button"
              data-cursor-label={isLoading ? 'COMPUTING' : 'OPTIMIZE'}
              style={{
                padding: '0 var(--space-8)',
                height: '46px',
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 13,
                      height: 13,
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
              data-cursor="button"
              data-cursor-label="EXPLORE"
              style={{
                padding: '0 var(--space-8)',
                height: '46px',
              }}
            >
              EXPLORE NETWORK
            </MagneticButton>
          </motion.div>
        </div>

        {/* Network visualization with ambient glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
              width: 'min(90vw, 420px)',
              height: 'min(90vw, 420px)',
            }}
          >
            {/* Ambient accent light */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '110%',
                height: '110%',
                background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 68%)',
                pointerEvents: 'none',
              }}
            />
            <NetworkGraph
              width={420}
              height={420}
              showParticles={false}
              showDisruption={true}
              interactive={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Subtle Hardware Scroll Cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'absolute',
          bottom: 'var(--space-8)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <span
          className="label"
          style={{ fontSize: '0.625rem', letterSpacing: '0.16em', opacity: 0.7 }}
        >
          SCROLL TO EXPLORE
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 20,
            background: 'linear-gradient(180deg, var(--color-text-muted) 0%, transparent 100%)',
          }}
        />
      </motion.div>

      {/* Keyframes */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
