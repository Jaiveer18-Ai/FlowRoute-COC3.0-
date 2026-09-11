/**
 * TypeScript types derived from CONTRACT.md
 * DO NOT modify these without updating the contract first.
 */

// §4 — Node
export interface Node {
  id: [number, number];
  x: number;
  y: number;
}

// §5 — Edge
export interface Edge {
  id: string; // canonical: "x1,y1-x2,y2"
  from: [number, number];
  to: [number, number];
  capacity: number;
  free_flow_time: number;
  flow: number;
  travel_time: number;
  disrupted: boolean;
}

// §6 — Trip
export interface Trip {
  id: number;
  origin: [number, number];
  destination: [number, number];
}

// §7 — Route
export interface Route {
  trip_id: number;
  path: [number, number][];
  travel_time: number;
}

// §8 — Edge Flows
export type EdgeFlows = Record<string, number>;

// §12 — Metrics
export interface Metrics {
  mean_travel_time: number;
  p95_travel_time: number;
  max_congestion_ratio: number;
}

// §16 — POST /api/instance response
export interface InstanceResponse {
  seed: number;
  nodes: Node[];
  edges: Edge[];
  trips: Trip[];
}

// §17/§18 — Solution (baseline or optimized)
export interface Solution {
  routes: Route[];
  edge_flows: EdgeFlows;
  metrics: Metrics;
}

// §17 — POST /api/baseline response
export interface BaselineResponse {
  baseline: Solution;
}

// §18 — POST /api/optimize response
export interface OptimizeResponse {
  optimized: Solution;
}

// §19 — POST /api/compare response
export interface CompareResponse {
  seed: number;
  baseline: Solution;
  optimized: Solution;
}

// §20 — Error response
export interface ErrorResponse {
  detail: string;
}

// Simulation states
export type SimulationState =
  | 'idle'
  | 'loading-instance'
  | 'instance-ready'
  | 'loading-baseline'
  | 'baseline-ready'
  | 'loading-optimized'
  | 'optimized-ready'
  | 'loading-compare'
  | 'compare-ready'
  | 'error';
