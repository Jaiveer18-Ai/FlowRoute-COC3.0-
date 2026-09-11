import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: 'FlowRoute' },
  { id: 'network', label: 'Network' },
  { id: 'disruption', label: 'Disruption' },
  { id: 'simulation', label: 'Simulate' },
  { id: 'results', label: 'Results' },
];

const FloatingNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const isClickScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track active section and scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);

      // Don't override active section while user-initiated smooth scroll is in progress
      if (isClickScrollingRef.current) return;

      // If at top of page
      if (window.scrollY < 150) {
        setActiveSection('hero');
        return;
      }

      // If near bottom of page, activate last item
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        setActiveSection('results');
        return;
      }

      // Check section positions relative to viewport focus line (35% from top)
      const focusPoint = window.scrollY + window.innerHeight * 0.35;
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          if (focusPoint >= top) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial section
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollTo = useCallback((id: string) => {
    // 1. Immediately update active state so the pill smoothly slides right away
    setActiveSection(id);

    // 2. Lock scroll listener temporarily so passing sections don't bounce the pill
    isClickScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 850);

    // 3. Smooth scroll with top offset compensation for the fixed floating navbar
    const el = document.getElementById(id);
    if (el) {
      if (id === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const navOffset = 60;
        const targetY = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Primary navigation"
      className="floating-nav-container"
      style={{
        position: 'fixed',
        top: 'var(--space-6)',
        zIndex: 'var(--z-nav)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 8px',
        background: isScrolled ? 'rgba(8, 12, 22, 0.9)' : 'rgba(10, 14, 26, 0.72)',
        backdropFilter: 'blur(24px) saturate(1.7)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.7)',
        border: '1px solid rgba(59, 130, 246, 0.28)',
        borderRadius: 'var(--radius-pill)',
        boxShadow: isScrolled
          ? '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 28px rgba(59, 130, 246, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.16)'
          : '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            aria-current={isActive ? 'true' : undefined}
            style={{
              position: 'relative',
              padding: '10px 22px',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: isActive ? 600 : 500,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: isActive ? '#ffffff' : 'rgba(203, 213, 225, 0.72)',
              textShadow: isActive ? '0 0 12px rgba(96, 165, 250, 0.5)' : 'none',
              background: 'none',
              border: 'none',
              transition: 'color 0.2s ease, text-shadow 0.2s ease',
              zIndex: 1,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'var(--radius-pill)',
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.88) 0%, rgba(59, 130, 246, 0.72) 100%)',
                  border: '1px solid rgba(147, 197, 253, 0.7)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                  zIndex: -1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 32,
                }}
              />
            )}
            {label}
          </button>
        );
      })}

      <style>{`
        .floating-nav-container {
          right: 36px;
          left: auto;
          transform: none;
        }
        @media (max-width: 860px) {
          .floating-nav-container {
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            width: calc(100% - 24px);
            justify-content: space-between;
            overflow-x: auto;
            padding: 4px 6px !important;
          }
          .floating-nav-container button {
            padding: 8px 14px !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </motion.nav>
  );
};

export default FloatingNav;
