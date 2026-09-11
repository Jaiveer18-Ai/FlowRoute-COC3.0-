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
      style={{
        position: 'fixed',
        top: 'var(--space-6)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-nav)',
        display: 'flex',
        gap: '2px',
        padding: '4px',
        background: isScrolled ? 'rgba(10, 10, 12, 0.88)' : 'rgba(10, 10, 12, 0.55)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-pill)',
        boxShadow: isScrolled
          ? '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
          : '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        maxWidth: 'calc(100vw - 32px)',
        overflowX: 'auto',
      }}
    >
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            data-cursor="nav"
            aria-current={isActive ? 'true' : undefined}
            style={{
              position: 'relative',
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-meta)',
              fontWeight: 500,
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              transition: 'color 0.2s ease',
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
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
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
    </motion.nav>
  );
};

export default FloatingNav;
