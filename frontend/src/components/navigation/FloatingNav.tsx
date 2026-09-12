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
  const [, setIsScrolled] = useState(false);
  const isClickScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track active section and scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

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
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollTo = useCallback((id: string) => {
    setActiveSection(id);
    isClickScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 850);

    const el = document.getElementById(id);
    if (el) {
      if (id === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const navOffset = 80;
        const targetY = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="top-nav-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-nav)',
        padding: '16px var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
      }}
    >
      {/* Top-Left Brand Anchor */}
      <div
        onClick={() => scrollTo('hero')}
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
        }}
      >
        {/* 3x3 Dot Grid Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 5px)',
            gap: '3px',
          }}
        >
          {[...Array(9)].map((_, i) => (
            <span
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: '#1677FF',
              }}
            />
          ))}
        </div>

        <div>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#0F172A',
              lineHeight: 1.1,
            }}
          >
            FLOWROUTE
          </span>
        </div>
      </div>

      {/* Top-Right Floating Pill Navigation */}
      <nav
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          padding: '4px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid #E2E8F0',
          borderRadius: '9999px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
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
                padding: '8px 20px',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isActive ? '#FFFFFF' : '#475569',
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
                    borderRadius: '9999px',
                    background: '#1677FF',
                    boxShadow: '0 4px 14px rgba(22, 119, 255, 0.35)',
                    zIndex: -1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 34,
                  }}
                />
              )}
              {label}
            </button>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 860px) {
          .top-nav-header {
            flex-direction: column;
            gap: 12px;
            padding: 12px 16px !important;
            background: rgba(247, 249, 252, 0.95);
            backdrop-filter: blur(16px);
          }
          .top-nav-header nav {
            overflow-x: auto;
            width: 100%;
            justify-content: space-between;
          }
          .top-nav-header nav button {
            padding: 6px 12px !important;
            font-size: 0.6875rem !important;
          }
        }
      `}</style>
    </motion.header>
  );
};

export default FloatingNav;
