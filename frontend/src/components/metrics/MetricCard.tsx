import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface MetricCardProps {
  label: string;
  baselineValue?: number;
  optimizedValue?: number;
  unit: string;
  higherIsWorse?: boolean;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  baselineValue,
  optimizedValue,
  unit,
  higherIsWorse = true,
  delay = 0,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayBaseline, setDisplayBaseline] = useState(0);
  const [displayOptimized, setDisplayOptimized] = useState(0);

  // Count-up animation
  useEffect(() => {
    if (!isInView || baselineValue === undefined) return;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayBaseline(baselineValue * eased);
      if (optimizedValue !== undefined) {
        setDisplayOptimized(optimizedValue * eased);
      }
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), delay);
    return () => clearTimeout(timer);
  }, [isInView, baselineValue, optimizedValue, delay]);

  const improvement =
    baselineValue !== undefined && optimizedValue !== undefined && baselineValue > 0
      ? ((baselineValue - optimizedValue) / baselineValue) * 100
      : null;

  const improvementIsPositive = higherIsWorse
    ? (improvement ?? 0) > 0
    : (improvement ?? 0) < 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        padding: 'var(--space-8)',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: improvement !== null && improvementIsPositive
            ? 'var(--color-healthy)'
            : 'var(--color-accent)',
          opacity: 0.6,
        }}
      />

      {/* Animated Luminous Shimmer Light Beam */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: delay * 1.5 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      <div
        className="label"
        style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)' }}
      >
        {label}
      </div>

      {baselineValue === undefined ? (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-h3)',
          color: 'var(--color-text-muted)',
        }}>
          —
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: optimizedValue !== undefined ? '1fr auto 1fr' : '1fr',
          gap: 'var(--space-4)',
          alignItems: 'end',
        }}>
          {/* Baseline */}
          <div>
            <div className="label" style={{ marginBottom: 'var(--space-2)', fontSize: '10px' }}>
              Baseline
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              {displayBaseline.toFixed(2)}
            </div>
            <div
              className="label"
              style={{ marginTop: 'var(--space-1)', fontSize: '10px' }}
            >
              {unit}
            </div>
          </div>

          {optimizedValue !== undefined && (
            <>
              {/* Arrow */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-1)',
                paddingBottom: 'var(--space-4)',
              }}>
                <span style={{
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-h3)',
                }}>
                  →
                </span>
                {improvement !== null && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: improvementIsPositive ? 'var(--color-healthy)' : 'var(--color-danger)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {improvementIsPositive ? '↓' : '↑'}{Math.abs(improvement).toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Optimized */}
              <div style={{ textAlign: 'right' }}>
                <div className="label" style={{ marginBottom: 'var(--space-2)', fontSize: '10px' }}>
                  Optimized
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-h2)',
                    fontWeight: 700,
                    color: improvementIsPositive
                      ? 'var(--color-healthy)'
                      : 'var(--color-text-primary)',
                    lineHeight: 1,
                  }}
                >
                  {displayOptimized.toFixed(2)}
                </div>
                <div
                  className="label"
                  style={{ marginTop: 'var(--space-1)', fontSize: '10px' }}
                >
                  {unit}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
