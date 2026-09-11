import React from 'react';
import { motion } from 'framer-motion';

const BackgroundEffects: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Dynamic Ambient Aurora Orb 1: Electric Sapphire */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.18, 0.26, 0.16, 0.18],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(37, 99, 235, 0.12) 45%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Dynamic Ambient Aurora Orb 2: Cyber Violet / Indigo */}
      <motion.div
        animate={{
          x: [0, -50, 35, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.12, 1],
          opacity: [0.12, 0.2, 0.1, 0.12],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '35%',
          left: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Dynamic Ambient Aurora Orb 3: Transit Disruption Signal Pulse */}
      <motion.div
        animate={{
          scale: [0.95, 1.1, 0.95],
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '65%',
          right: '15%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(245, 158, 11, 0.06) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Precision Geometric Transit Grid Lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          opacity: 0.8,
        }}
      />

      {/* Animated Scanning Beam sweeping down across grid */}
      <motion.div
        animate={{
          y: ['-100%', '200%'],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '240px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.04) 50%, rgba(96, 165, 250, 0.08) 100%)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
        }}
      />

      {/* Floating Micro-Telemetric Crosses */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.35,
        }}
      >
        {[
          { x: '15%', y: '22%' },
          { x: '82%', y: '18%' },
          { x: '30%', y: '58%' },
          { x: '72%', y: '68%' },
          { x: '45%', y: '85%' },
        ].map((pt, i) => (
          <g key={i} transform={`translate(${pt.x}, ${pt.y})`}>
            <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(96, 165, 250, 0.5)" strokeWidth="1" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(96, 165, 250, 0.5)" strokeWidth="1" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default BackgroundEffects;
