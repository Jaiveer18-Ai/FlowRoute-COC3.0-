import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Route } from '../../types/contract';

interface Props {
  routes: Route[];
  routeType: 'baseline' | 'optimized';
  selectedTripId: number | null;
  onSelectTrip: (id: number | null) => void;
}

const RouteInspector: React.FC<Props> = ({
  routes,
  routeType,
  selectedTripId,
  onSelectTrip,
}) => {
  const [showAll, setShowAll] = useState(false);

  const sortedRoutes = useMemo(
    () => [...routes].sort((a, b) => a.trip_id - b.trip_id),
    [routes]
  );

  const visibleRoutes = showAll ? sortedRoutes : sortedRoutes.slice(0, 20);

  const selectedRoute = selectedTripId !== null
    ? routes.find(r => r.trip_id === selectedTripId)
    : null;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-4)',
      }}>
        <span className="label" style={{ color: 'var(--color-text-secondary)' }}>
          Route Inspector — {routes.length} trips
        </span>
        {selectedTripId !== null && (
          <button
            onClick={() => onSelectTrip(null)}
            data-cursor="button"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-meta)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              padding: '4px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              transition: 'all 0.2s ease',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Selected route detail */}
      <AnimatePresence>
        {selectedRoute && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginBottom: 'var(--space-4)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: 'var(--space-5)',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
              }}>
                <div>
                  <div className="label" style={{ fontSize: '10px', marginBottom: 'var(--space-1)' }}>Trip</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-body)',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                  }}>
                    #{String(selectedRoute.trip_id).padStart(3, '0')}
                  </div>
                </div>
                <div>
                  <div className="label" style={{ fontSize: '10px', marginBottom: 'var(--space-1)' }}>Origin</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-text-primary)',
                  }}>
                    ({selectedRoute.path[0][0]},{selectedRoute.path[0][1]})
                  </div>
                </div>
                <div>
                  <div className="label" style={{ fontSize: '10px', marginBottom: 'var(--space-1)' }}>Destination</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-text-primary)',
                  }}>
                    ({selectedRoute.path[selectedRoute.path.length - 1][0]},{selectedRoute.path[selectedRoute.path.length - 1][1]})
                  </div>
                </div>
                <div>
                  <div className="label" style={{ fontSize: '10px', marginBottom: 'var(--space-1)' }}>Travel Time</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-body)',
                    fontWeight: 700,
                    color: routeType === 'optimized' ? 'var(--color-accent)' : '#D97706',
                  }}>
                    {selectedRoute.travel_time.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="label" style={{ fontSize: '10px', marginBottom: 'var(--space-1)' }}>Hops</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-text-primary)',
                  }}>
                    {selectedRoute.path.length - 1}
                  </div>
                </div>
              </div>

              {/* Path visualization */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '6px',
              }}>
                {selectedRoute.path.map((node, i) => (
                  <React.Fragment key={i}>
                    <span style={{
                      padding: '3px 8px',
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                    }}>
                      {node[0]},{node[1]}
                    </span>
                    {i < selectedRoute.path.length - 1 && (
                      <span style={{ color: 'var(--color-accent)', fontSize: '11px' }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
        gap: '6px',
      }}>
        {visibleRoutes.map((route) => {
          const isSelected = route.trip_id === selectedTripId;
          return (
            <button
              key={route.trip_id}
              onClick={() => onSelectTrip(isSelected ? null : route.trip_id)}
              data-cursor="route"
              data-cursor-label="TRACE"
              style={{
                padding: '7px 4px',
                background: isSelected
                  ? (routeType === 'optimized' ? 'rgba(22, 119, 255, 0.12)' : 'rgba(245, 158, 11, 0.15)')
                  : '#FFFFFF',
                border: `1px solid ${
                  isSelected
                    ? (routeType === 'optimized' ? 'var(--color-accent)' : '#D97706')
                    : '#E2E8F0'
                }`,
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected
                  ? (routeType === 'optimized' ? 'var(--color-accent)' : '#D97706')
                  : 'var(--color-text-secondary)',
                boxShadow: isSelected ? '0 2px 8px rgba(22, 119, 255, 0.15)' : 'none',
                transition: 'all 0.15s ease',
                textAlign: 'center',
              }}
            >
              {String(route.trip_id).padStart(3, '0')}
            </button>
          );
        })}
      </div>

      {routes.length > 20 && (
        <button
          onClick={() => setShowAll(!showAll)}
          data-cursor="button"
          style={{
            marginTop: 'var(--space-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-meta)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            padding: '6px 16px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
          }}
        >
          {showAll ? 'Show Less' : `Show All ${routes.length}`}
        </button>
      )}
    </div>
  );
};

export default RouteInspector;
