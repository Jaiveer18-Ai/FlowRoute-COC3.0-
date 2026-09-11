import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type CursorVariant = 'default' | 'button' | 'nav' | 'node' | 'edge' | 'route' | 'interactive';

const Cursor: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>('default');
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  // High performance MotionValues - zero re-renders on mousemove
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Center point follows tightly
  const dotSpringConfig = { damping: 42, stiffness: 650, mass: 0.08 };
  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  // Outer ring follows with deliberate subtle lag for tactile instrument feel
  const ringSpringConfig = { damping: 26, stiffness: 240, mass: 0.22 };
  const ringX = useSpring(mouseX, ringSpringConfig);
  const ringY = useSpring(mouseY, ringSpringConfig);

  useEffect(() => {
    // Detect coarse pointer (touch devices)
    const mq = window.matchMedia('(pointer: coarse)');
    setIsCoarsePointer(mq.matches);
    if (mq.matches || reducedMotion) return;

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) {
        setIsVisible(true);
        document.body.classList.add('custom-cursor-active');
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      document.body.classList.remove('custom-cursor-active');
    };

    const onMouseEnter = () => {
      setIsVisible(true);
      document.body.classList.add('custom-cursor-active');
    };

    // Semantic target detection only triggers state update on boundary crossing
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | SVGElement | null;
      if (!target) return;

      const cursorAttrEl = target.closest('[data-cursor]') as HTMLElement | SVGElement | null;
      if (cursorAttrEl) {
        const type = cursorAttrEl.getAttribute('data-cursor') as CursorVariant;
        const label = cursorAttrEl.getAttribute('data-cursor-label');
        if (type) {
          setCursorVariant(type);
          setCursorLabel(label || null);
          return;
        }
      }

      // Check standard interactive elements
      if (target.closest('nav, [data-nav-item]')) {
        setCursorVariant('nav');
        setCursorLabel(null);
      } else if (target.closest('button, a, [role="button"]')) {
        setCursorVariant('button');
        setCursorLabel(null);
      } else if (target.closest('input, select, textarea')) {
        setCursorVariant('default');
        setCursorLabel(null);
      } else {
        setCursorVariant('default');
        setCursorLabel(null);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onMouseOver);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [mouseX, mouseY, isVisible, reducedMotion]);

  if (reducedMotion || isCoarsePointer) return null;

  // Geometry calculations per semantic variant
  const getRingStyles = () => {
    switch (cursorVariant) {
      case 'button':
        return {
          size: 38,
          borderColor: 'rgba(59, 130, 246, 0.45)',
          background: 'rgba(59, 130, 246, 0.04)',
          borderWidth: 1,
        };
      case 'nav':
        return {
          size: 20,
          borderColor: 'rgba(244, 243, 239, 0.45)',
          background: 'transparent',
          borderWidth: 1,
        };
      case 'node':
        return {
          size: 32,
          borderColor: 'rgba(96, 165, 250, 0.65)',
          background: 'rgba(59, 130, 246, 0.06)',
          borderWidth: 1,
        };
      case 'route':
        return {
          size: 34,
          borderColor: 'rgba(59, 130, 246, 0.55)',
          background: 'rgba(59, 130, 246, 0.05)',
          borderWidth: 1,
        };
      case 'edge':
        return {
          size: 26,
          borderColor: 'rgba(239, 68, 68, 0.5)',
          background: 'transparent',
          borderWidth: 1,
        };
      default:
        return {
          size: 24,
          borderColor: 'rgba(244, 243, 239, 0.22)',
          background: 'transparent',
          borderWidth: 1,
        };
    }
  };

  const getDotStyles = () => {
    switch (cursorVariant) {
      case 'button':
        return { size: 4, color: 'var(--color-accent-bright)' };
      case 'node':
        return { size: 3, color: 'var(--color-accent-bright)' };
      case 'edge':
        return { size: 3, color: 'var(--color-danger)' };
      case 'route':
        return { size: 4, color: 'var(--color-accent)' };
      default:
        return { size: 3.5, color: 'var(--color-text-primary)' };
    }
  };

  const ring = getRingStyles();
  const dot = getDotStyles();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 'var(--z-cursor)',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Outer tactile ring with spring lag */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          width: ring.size,
          height: ring.size,
          transform: 'translate(-50%, -50%)',
          borderRadius: cursorVariant === 'node' ? '2px' : '50%',
          border: `${ring.borderWidth}px solid ${ring.borderColor}`,
          backgroundColor: ring.background,
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.22s var(--ease-out), height 0.22s var(--ease-out), border-color 0.2s ease, background-color 0.2s ease, border-radius 0.2s ease, opacity 0.15s ease',
        }}
      >
        {/* Reticle targeting cross-ticks for 'node' variant */}
        {cursorVariant === 'node' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {/* Top tick */}
            <span style={{ position: 'absolute', top: -4, left: '50%', width: 1, height: 3, background: 'var(--color-accent-bright)', transform: 'translateX(-50%)' }} />
            {/* Bottom tick */}
            <span style={{ position: 'absolute', bottom: -4, left: '50%', width: 1, height: 3, background: 'var(--color-accent-bright)', transform: 'translateX(-50%)' }} />
            {/* Left tick */}
            <span style={{ position: 'absolute', left: -4, top: '50%', height: 1, width: 3, background: 'var(--color-accent-bright)', transform: 'translateY(-50%)' }} />
            {/* Right tick */}
            <span style={{ position: 'absolute', right: -4, top: '50%', height: 1, width: 3, background: 'var(--color-accent-bright)', transform: 'translateY(-50%)' }} />
          </div>
        )}
      </motion.div>

      {/* Center point follows tightly */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          width: dot.size,
          height: dot.size,
          borderRadius: '50%',
          backgroundColor: dot.color,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.15s ease, height 0.15s ease, background-color 0.18s ease, opacity 0.15s ease',
        }}
      />

      {/* Semantic micro-label (e.g. INSPECT, TRACE) */}
      <AnimatePresence>
        {cursorLabel && isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              x: dotX,
              y: dotY,
              transform: 'translate(14px, 12px)',
              pointerEvents: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-bright)',
              backgroundColor: 'rgba(9, 9, 11, 0.88)',
              padding: '2px 6px',
              borderRadius: '2px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
              whiteSpace: 'nowrap',
            }}
          >
            {cursorLabel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cursor;
