import React from 'react';
import FloatingNav from './components/navigation/FloatingNav';
import Hero from './components/hero/Hero';
import NetworkSection from './components/sections/NetworkSection';
import DisruptionSection from './components/sections/DisruptionSection';
import SimulationSection from './components/sections/SimulationSection';
import ResultsSection from './components/sections/ResultsSection';
import ClosingSection from './components/sections/ClosingSection';
import { useSimulation } from './hooks/useSimulation';

const App: React.FC = () => {
  const sim = useSimulation();

  return (
    <>
      <FloatingNav />

      <main>
        <Hero
          onRunSimulation={sim.runSimulation}
          isLoading={sim.status.startsWith('loading')}
        />

        <NetworkSection />

        <DisruptionSection />

        <SimulationSection
          status={sim.status}
          seed={sim.seed}
          baseline={sim.baseline}
          optimized={sim.optimized}
          error={sim.error}
          onSeedChange={sim.setSeed}
          onLoadInstance={sim.loadInstance}
          onRunSimulation={sim.runSimulation}
          onReset={sim.reset}
        />

        <ResultsSection
          baseline={sim.baseline}
          optimized={sim.optimized}
          isReady={sim.status === 'compare-ready'}
        />

        <ClosingSection />
      </main>
    </>
  );
};

export default App;
