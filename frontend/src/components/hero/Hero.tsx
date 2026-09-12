import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NetworkGraph from '../network/NetworkGraph';
import { NetworkLegendCard } from '../network/NetworkLegend';
import MagneticButton from '../common/MagneticButton';

interface Props {
  onRunSimulation: () => void;
  isLoading: boolean;
}

const Hero: React.FC<Props> = ({ onRunSimulation, isLoading }) => {
  // Select node (2,4) by default to match the reference design, or allow user interaction
  const [selectedNode, setSelectedNode] = useState<[number, number] | null>([2, 4]);

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: 'calc(var(--space-20) + 24px)',
        paddingBottom: 'var(--space-12)',
        overflow: 'hidden',
      }}
    >
      {/* RIGHT-SIDE CITY MAP: Organically blended into page grid with multi-directional feathering */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '62vw',
          maxWidth: '1050px',
          backgroundImage: 'url(/images/city_transit_map.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'right 30%',
          opacity: 0.52,
          mixBlendMode: 'multiply',
          maskImage:
            'radial-gradient(ellipse 75% 52% at 75% 36%, #000000 12%, rgba(0, 0, 0, 0.72) 34%, rgba(0, 0, 0, 0.22) 56%, rgba(0, 0, 0, 0.03) 72%, transparent 84%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 52% at 75% 36%, #000000 12%, rgba(0, 0, 0, 0.72) 34%, rgba(0, 0, 0, 0.22) 56%, rgba(0, 0, 0, 0.03) 72%, transparent 84%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div className="hero-editorial-layout">
          {/* ================= LEFT COLUMN: EDITORIAL ================= */}
          <div className="hero-left-content">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'rgba(22, 119, 255, 0.08)',
                border: '1px solid rgba(22, 119, 255, 0.22)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#1677FF',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: '#1677FF',
                  textTransform: 'uppercase',
                }}
              >
                LIVE SIMULATION ENGINE // 5×5 TRANSIT GRID
              </span>
            </motion.div>

            {/* Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hero-title"
              style={{
                marginBottom: 'var(--space-6)',
                textWrap: 'balance',
                color: '#0F172A',
              }}
            >
              When the
              <br />
              network <span style={{ color: '#EF3340' }}>breaks,</span>
              <br />
              <span style={{ color: '#1677FF' }}>flow</span> adapts.
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="hero-subtitle"
              style={{
                marginBottom: 'var(--space-8)',
              }}
            >
              Simulating congestion-aware rerouting across a disrupted transit grid.
              120 trips. One broken edge. System-wide optimization.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: 'var(--space-12)',
              }}
            >
              <MagneticButton
                onClick={onRunSimulation}
                disabled={isLoading}
                className="btn-primary-pill"
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 13,
                        height: 13,
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                    <span>OPTIMIZING</span>
                  </span>
                ) : (
                  <>
                    RUN SIMULATION <span style={{ marginLeft: 6, fontSize: '14px' }}>→</span>
                  </>
                )}
              </MagneticButton>

              <MagneticButton
                onClick={() => {
                  const el = document.getElementById('network');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary-pill"
              >
                EXPLORE NETWORK
              </MagneticButton>
            </motion.div>

            {/* Technical Metadata Strip with thin vertical rules */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="hero-metadata-strip"
            >
              <div className="meta-col">
                <span className="meta-label">GRID SIZE</span>
                <span className="meta-value">5 × 5</span>
              </div>
              <div className="meta-col">
                <span className="meta-label">NODES / EDGES</span>
                <span className="meta-value">25 / 40</span>
              </div>
              <div className="meta-col">
                <span className="meta-label">TOTAL TRIPS</span>
                <span className="meta-value" style={{ color: '#1677FF' }}>120</span>
              </div>
              <div className="meta-col meta-col-last">
                <span className="meta-label">DISRUPTION</span>
                <span className="meta-value" style={{ color: '#EF3340' }}>(2,2) ↔ (3,2)</span>
              </div>
            </motion.div>
          </div>

          {/* ================= RIGHT COLUMN: 5x5 NETWORK & CITY MAP ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hero-network-container"
          >
            {/* Floating Top Badge: 120 ACTIVE TRIPS */}
            <div
              style={{
                position: 'absolute',
                top: '-16px',
                left: '42%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '6px 14px',
                borderRadius: '9999px',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#1677FF',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#0F172A',
                }}
              >
                120 ACTIVE TRIPS
              </span>
            </div>

            {/* 5x5 Network SVG Graph */}
            <div className="network-svg-wrapper">
              <NetworkGraph
                width={460}
                height={460}
                showParticles={true}
                showDisruption={true}
                interactive={true}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Floating Legend Card (matches reference) */}
            <div className="hero-legend-wrapper">
              <NetworkLegendCard />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Embedded CSS for responsive Hero composition */}
      <style>{`
        .hero-editorial-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-12);
          align-items: center;
          margin-top: var(--space-4);
        }

        .hero-left-content {
          max-width: 580px;
        }

        .hero-metadata-strip {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-top: var(--space-6);
          border-top: 1px solid #E2E8F0;
          flex-wrap: wrap;
        }

        .meta-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-right: 20px;
          border-right: 1px solid #E2E8F0;
        }

        .meta-col-last {
          border-right: none !important;
          padding-right: 0 !important;
        }

        .meta-label {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: #64748B;
          text-transform: uppercase;
        }

        .meta-value {
          font-family: var(--font-sans);
          font-size: 19px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.1;
        }

        .hero-network-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }

        .network-svg-wrapper {
          position: relative;
          width: min(85vw, 460px);
          height: min(85vw, 460px);
        }

        .hero-legend-wrapper {
          position: static;
        }

        @media (min-width: 1024px) {
          .hero-editorial-layout {
            grid-template-columns: 1fr 1fr !important;
            gap: var(--space-8) !important;
          }
          .hero-network-container {
            justify-content: flex-start !important;
            padding-left: var(--space-4);
          }
        }

        @media (max-width: 768px) {
          .hero-network-container {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
