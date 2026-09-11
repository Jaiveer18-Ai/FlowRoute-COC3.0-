import React from 'react';
import { motion } from 'framer-motion';
import NetworkGraph from '../network/NetworkGraph';

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
        padding: 'var(--space-24) var(--space-6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          pointerEvents: 'none',
        }}
      />

      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-12)',
          alignItems: 'center',
        }}
      >
        {/* Text content */}
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          {/* Technical label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="label"
            style={{
              marginBottom: 'var(--space-6)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                display: 'inline-block',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            AI-02 / System-Optimal Transit Rerouting
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'var(--text-display)',
              fontWeight: 800,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-8)',
            }}
          >
            When the network{' '}
            <span style={{ color: 'var(--color-danger)' }}>breaks</span>,
            <br />
            <span style={{ color: 'var(--color-accent-bright)' }}>flow</span> adapts.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-secondary)',
              maxWidth: 580,
              margin: '0 auto var(--space-10)',
            }}
          >
            Simulating congestion-aware rerouting across a disrupted
            transit grid. 120 trips. One broken edge. System-wide optimization.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={onRunSimulation}
              disabled={isLoading}
              data-cursor="expand"
              style={{
                padding: '14px 36px',
                background: isLoading ? 'var(--color-bg-hover)' : 'var(--color-accent)',
                color: isLoading ? 'var(--color-text-muted)' : '#fff',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-small)',
                fontWeight: 600,
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.25s var(--ease-out)',
                boxShadow: isLoading ? 'none' : 'var(--shadow-glow-accent)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid var(--color-text-muted)',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                    }}
                  />
                  Optimizing Flows
                </span>
              ) : (
                'Run Simulation'
              )}
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('network');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              data-cursor="expand"
              style={{
                padding: '14px 36px',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-small)',
                fontWeight: 500,
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--color-border)',
                transition: 'all 0.25s var(--ease-out)',
              }}
            >
              Explore Network
            </button>
          </motion.div>
        </div>

        {/* Network visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <div style={{
            position: 'relative',
            width: 'min(90vw, 420px)',
            height: 'min(90vw, 420px)',
          }}>
            {/* Subtle glow behind the network */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120%',
                height: '120%',
                background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)',
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

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{
          position: 'absolute',
          bottom: 'var(--space-10)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <span
          className="label"
          style={{ fontSize: 'var(--text-meta)' }}
        >
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 24,
            backgroundColor: 'var(--color-text-muted)',
            opacity: 0.5,
          }}
        />
      </motion.div>

      {/* pulse-dot keyframes */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
