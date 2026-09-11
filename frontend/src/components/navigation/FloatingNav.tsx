import React, { useState, useEffect, useCallback } from 'react';
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

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
        background: isScrolled ? 'rgba(10, 10, 12, 0.85)' : 'rgba(10, 10, 12, 0.5)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-pill)',
        transition: 'background 0.4s ease',
      }}
    >
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            data-cursor="expand"
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
                  zIndex: -1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 35,
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
