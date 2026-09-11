import React from 'react';
import { motion, useInView } from 'framer-motion';
import MetricCard from './MetricCard';
import type { Metrics } from '../../types/contract';

interface Props {
  baselineMetrics?: Metrics;
  optimizedMetrics?: Metrics;
}

const MetricsComparison: React.FC<Props> = ({
  baselineMetrics,
  optimizedMetrics,
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        <MetricCard
          label="Mean Travel Time"
          baselineValue={baselineMetrics?.mean_travel_time}
          optimizedValue={optimizedMetrics?.mean_travel_time}
          unit="time units"
          higherIsWorse={true}
          delay={0}
        />
        <MetricCard
          label="P95 Travel Time"
          baselineValue={baselineMetrics?.p95_travel_time}
          optimizedValue={optimizedMetrics?.p95_travel_time}
          unit="time units"
          higherIsWorse={true}
          delay={0.15}
        />
        <MetricCard
          label="Max Congestion Ratio"
          baselineValue={baselineMetrics?.max_congestion_ratio}
          optimizedValue={optimizedMetrics?.max_congestion_ratio}
          unit="× capacity"
          higherIsWorse={true}
          delay={0.3}
        />
      </motion.div>
    </div>
  );
};

export default MetricsComparison;
