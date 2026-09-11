import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const Cursor: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Detect coarse pointer (touch devices)
    const mq = window.matchMedia('(pointer: coarse)');
    setIsCoarsePointer(mq.matches);
    if (mq.matches) return;

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    const onOverInteractive = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive =
        target.closest('button, a, [role="button"], input, select, textarea, [data-cursor="expand"]');
      setIsHoveringInteractive(!!interactive);
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseover', onOverInteractive);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseover', onOverInteractive);
    };
  }, [cursorX, cursorY, isVisible]);

  if (reducedMotion || isCoarsePointer) return null;

  return (
    <>
      {/* Hide default cursor globally */}
      <style>{`
        * { cursor: none !important; }
      `}</style>

      {/* Outer ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: smoothX,
          y: smoothY,
          width: isHoveringInteractive ? 48 : 28,
          height: isHoveringInteractive ? 48 : 28,
          borderRadius: '50%',
          border: `1.5px solid ${isHoveringInteractive ? 'var(--color-accent)' : 'rgba(240,238,232,0.3)'}`,
          pointerEvents: 'none',
          zIndex: 'var(--z-cursor)',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
          opacity: isVisible ? 1 : 0,
          transition: `width 0.25s var(--ease-spring), height 0.25s var(--ease-spring), border-color 0.2s ease, opacity 0.15s ease`,
        }}
      />

      {/* Center dot */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: cursorX,
          y: cursorY,
          width: isHoveringInteractive ? 6 : 4,
          height: isHoveringInteractive ? 6 : 4,
          borderRadius: '50%',
          backgroundColor: isHoveringInteractive ? 'var(--color-accent)' : 'var(--color-text-primary)',
          pointerEvents: 'none',
          zIndex: 'var(--z-cursor)',
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          transition: `width 0.15s ease, height 0.15s ease, background-color 0.15s ease, opacity 0.15s ease`,
        }}
      />
    </>
  );
};

export default Cursor;
