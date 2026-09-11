import { useCallback, useReducer } from 'react';
import type {
  SimulationState,
  InstanceResponse,
  CompareResponse,
  Solution,
} from '../types/contract';
import * as api from '../services/api';

interface SimState {
  status: SimulationState;
  seed: number;
  instance: InstanceResponse | null;
  baseline: Solution | null;
  optimized: Solution | null;
  error: string | null;
}

type SimAction =
  | { type: 'SET_SEED'; seed: number }
  | { type: 'LOAD_INSTANCE' }
  | { type: 'INSTANCE_READY'; data: InstanceResponse }
  | { type: 'LOAD_COMPARE' }
  | { type: 'COMPARE_READY'; data: CompareResponse }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

const initialState: SimState = {
  status: 'idle',
  seed: 42,
  instance: null,
  baseline: null,
  optimized: null,
  error: null,
};

function reducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case 'SET_SEED':
      return { ...state, seed: action.seed };
    case 'LOAD_INSTANCE':
      return { ...state, status: 'loading-instance', error: null };
    case 'INSTANCE_READY':
      return { ...state, status: 'instance-ready', instance: action.data };
    case 'LOAD_COMPARE':
      return { ...state, status: 'loading-compare', error: null };
    case 'COMPARE_READY':
      return {
        ...state,
        status: 'compare-ready',
        baseline: action.data.baseline,
        optimized: action.data.optimized,
      };
    case 'ERROR':
      return { ...state, status: 'error', error: action.message };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useSimulation() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setSeed = useCallback((seed: number) => {
    dispatch({ type: 'SET_SEED', seed });
  }, []);

  const loadInstance = useCallback(async () => {
    dispatch({ type: 'LOAD_INSTANCE' });
    try {
      const data = await api.createInstance(state.seed);
      dispatch({ type: 'INSTANCE_READY', data });
    } catch (err) {
      const message = err instanceof api.ApiError
        ? err.detail
        : 'Unable to connect to simulation engine';
      dispatch({ type: 'ERROR', message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.seed]);

  const runSimulation = useCallback(async () => {
    dispatch({ type: 'LOAD_COMPARE' });
    try {
      // If no instance yet, load it implicitly
      if (!state.instance) {
        const inst = await api.createInstance(state.seed);
        dispatch({ type: 'INSTANCE_READY', data: inst });
      }
      const data = await api.runCompare(state.seed);
      dispatch({ type: 'COMPARE_READY', data });
    } catch (err) {
      const message = err instanceof api.ApiError
        ? err.detail
        : 'Unable to connect to simulation engine';
      dispatch({ type: 'ERROR', message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.seed, state.instance]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    setSeed,
    loadInstance,
    runSimulation,
    reset,
  };
}
