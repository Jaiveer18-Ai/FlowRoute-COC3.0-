import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'data-cursor'?: string;
  'data-cursor-label'?: string;
  ariaLabel?: string;
}

const MagneticButton: React.FC<Props> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  style = {},
  'data-cursor': dataCursor = 'button',
  'data-cursor-label': dataCursorLabel,
  ariaLabel,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsCoarse(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsCoarse(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 18, stiffness: 220, mass: 0.1 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || reducedMotion || isCoarse || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Maximum displacement: 5px
    const maxDisplace = 5;
    const factor = 0.18;
    const dx = Math.max(-maxDisplace, Math.min(maxDisplace, (e.clientX - centerX) * factor));
    const dy = Math.max(-maxDisplace, Math.min(maxDisplace, (e.clientY - centerY) * factor));
    x.set(dx);
    y.set(dy);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-cursor={dataCursor}
      data-cursor-label={dataCursorLabel}
      aria-label={ariaLabel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        x: smoothX,
        y: smoothY,
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;
