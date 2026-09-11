import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavSection {
  id: string;
  index: string;
  label: string;
  shortLabel: string;
}

const SECTIONS: NavSection[] = [
  { id: 'hero', index: '00', label: 'Overview', shortLabel: 'Top' },
  { id: 'network', index: '01', label: 'Network', shortLabel: 'Grid' },
  { id: 'disruption', index: '02', label: 'Disruption', shortLabel: 'Fault' },
  { id: 'simulation', index: '03', label: 'Simulate', shortLabel: 'Sim' },
  { id: 'results', index: '04', label: 'Results', shortLabel: 'Data' },
];

const FloatingNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll spy with IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
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
        {
          threshold: 0.25,
          rootMargin: '-15% 0px -55% 0px',
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Background compression on scroll
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const currentSection = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: isScrolled ? '12px' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-nav)',
        width: 'calc(100% - 32px)',
        maxWidth: '1080px',
        transition: 'top 0.3s var(--ease-out)',
        pointerEvents: 'none',
      }}
      aria-label="Navigation System"
    >
      <nav
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isScrolled ? '6px 14px' : '8px 18px',
          background: isScrolled
            ? 'rgba(12, 12, 16, 0.88)'
            : 'rgba(14, 14, 18, 0.65)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          border: '1px solid',
          borderColor: isScrolled ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-md)',
          boxShadow: isScrolled
            ? '0 12px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            : '0 8px 28px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s var(--ease-out)',
        }}
      >
        {/* BRAND IDENTITY ANCHOR */}
        <div
          onClick={() => scrollTo('hero')}
          data-cursor="button"
          data-cursor-label="TOP"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          {/* Hardware geometric icon */}
          <div
            style={{
              width: '18px',
              height: '18px',
              border: '1px solid var(--color-accent)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2px',
              padding: '2px',
              borderRadius: '2px',
            }}
          >
            <div style={{ background: 'var(--color-accent)', borderRadius: '1px' }} />
            <div style={{ background: 'var(--color-accent-bright)', borderRadius: '1px', opacity: 0.6 }} />
            <div style={{ background: 'var(--color-accent-dim)', borderRadius: '1px', opacity: 0.4 }} />
            <div style={{ background: 'var(--color-danger)', borderRadius: '1px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-primary)',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                FlowRoute
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'var(--color-accent-bright)',
                  background: 'rgba(59, 130, 246, 0.12)',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  lineHeight: 1.2,
                }}
              >
                AI-02
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                letterSpacing: '0.12em',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
                lineHeight: 1,
              }}
            >
              SYS.01 // GRID-5X5
            </span>
          </div>
        </div>

        {/* PHYSICAL DIVIDER */}
        <div
          style={{
            height: '24px',
            width: '1px',
            background: 'rgba(255, 255, 255, 0.08)',
            margin: '0 8px',
            display: 'none',
          }}
          className="desktop-nav-divider"
        />

        {/* DESKTOP NAVIGATION ITEMS */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '2px',
          }}
          className="desktop-nav-group"
        >
          {SECTIONS.map(({ id, index, label }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                data-cursor="nav"
                data-nav-item
                aria-current={isActive ? 'true' : undefined}
                style={{
                  position: 'relative',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  background: 'transparent',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s ease, transform 0.15s ease',
                  zIndex: 1,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Active hardware plate indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-plate"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.4)',
                      zIndex: -1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 34,
                    }}
                  >
                    {/* Glowing bottom baseline accent */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        left: '15%',
                        right: '15%',
                        height: '2px',
                        background: 'var(--color-accent-bright)',
                        boxShadow: '0 0 8px var(--color-accent)',
                        borderRadius: '1px',
                      }}
                    />
                  </motion.div>
                )}

                {/* Section Index */}
                <span
                  style={{
                    fontSize: '0.625rem',
                    color: isActive ? 'var(--color-accent-bright)' : 'var(--color-text-muted)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {index}
                </span>

                {/* Section Name */}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* SYSTEM STATUS TELEMETRY CHIP (Desktop) */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 10px',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 'var(--radius-xs)',
          }}
          className="desktop-status-chip"
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: activeSection === 'disruption' ? 'var(--color-danger)' : 'var(--color-healthy)',
              boxShadow: activeSection === 'disruption' ? '0 0 6px var(--color-danger)' : '0 0 6px var(--color-healthy)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            {activeSection.toUpperCase()}
          </span>
        </div>

        {/* MOBILE CONTROLLER TOGGLE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className="mobile-nav-toggle"
        >
          {/* Current Section Badge on Mobile */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: 'var(--color-accent-bright)',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              textTransform: 'uppercase',
            }}
          >
            {currentSection.index}. {currentSection.shortLabel}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            data-cursor="button"
            style={{
              width: '34px',
              height: '34px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--color-text-primary)',
            }}
          >
            <motion.span
              animate={mobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              style={{ width: '16px', height: '1.5px', background: 'currentColor', transformOrigin: 'center' }}
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              style={{ width: '16px', height: '1.5px', background: 'currentColor' }}
            />
            <motion.span
              animate={mobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              style={{ width: '16px', height: '1.5px', background: 'currentColor', transformOrigin: 'center' }}
            />
          </button>
        </div>
      </nav>

      {/* MOBILE EXPANDABLE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              pointerEvents: 'auto',
              marginTop: '8px',
              background: 'rgba(12, 12, 16, 0.95)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-md)',
              padding: '10px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {SECTIONS.map(({ id, index, label }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-xs)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: isActive ? 'var(--color-accent-bright)' : 'var(--color-text-muted)', fontSize: '0.6875rem' }}>
                      {index}
                    </span>
                    <span>{label}</span>
                  </span>
                  {isActive && (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-accent-bright)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (min-width: 820px) {
          .desktop-nav-divider { display: block !important; }
          .desktop-nav-group { display: flex !important; }
          .desktop-status-chip { display: flex !important; }
          .mobile-nav-toggle { display: none !important; }
        }
      `}</style>
    </motion.header>
  );
};

export default FloatingNav;
