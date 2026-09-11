/**
 * Grid coordinate generation for the 5×5 network.
 * Derives positions from CONTRACT.md §4 grid definition.
 */

export const GRID_SIZE = 5;
export const EDGE_CAPACITY = 8;
export const FREE_FLOW_TIME = 1;
export const DISRUPTED_EDGE: [[number, number], [number, number]] = [[2, 2], [3, 2]];
export const TOTAL_TRIPS = 120;

/** Generate all 25 node positions */
export function generateNodes(): { x: number; y: number }[] {
  const nodes: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      nodes.push({ x, y });
    }
  }
  return nodes;
}

/** Canonical edge ID — always sorted deterministically */
export function canonicalEdgeId(
  a: [number, number],
  b: [number, number]
): string {
  const [ax, ay] = a;
  const [bx, by] = b;
  if (ax < bx || (ax === bx && ay < by)) {
    return `${ax},${ay}-${bx},${by}`;
  }
  return `${bx},${by}-${ax},${ay}`;
}

/** Check if an edge is the disrupted edge */
export function isDisruptedEdge(
  from: [number, number],
  to: [number, number]
): boolean {
  const id = canonicalEdgeId(from, to);
  const disruptedId = canonicalEdgeId(DISRUPTED_EDGE[0], DISRUPTED_EDGE[1]);
  return id === disruptedId;
}

/** Generate all edges for a 5×5 grid */
export function generateEdges(): {
  from: [number, number];
  to: [number, number];
  disrupted: boolean;
}[] {
  const edges: {
    from: [number, number];
    to: [number, number];
    disrupted: boolean;
  }[] = [];
  const seen = new Set<string>();

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const neighbors: [number, number][] = [];
      if (x + 1 < GRID_SIZE) neighbors.push([x + 1, y]);
      if (y + 1 < GRID_SIZE) neighbors.push([x, y + 1]);

      for (const [nx, ny] of neighbors) {
        const from: [number, number] = [x, y];
        const to: [number, number] = [nx, ny];
        const id = canonicalEdgeId(from, to);
        if (!seen.has(id)) {
          seen.add(id);
          edges.push({
            from,
            to,
            disrupted: isDisruptedEdge(from, to),
          });
        }
      }
    }
  }

  return edges;
}

/** Convert grid coordinate to SVG pixel position */
export function gridToPixel(
  x: number,
  y: number,
  size: number,
  padding: number = 60
): { px: number; py: number } {
  const usable = size - padding * 2;
  const step = usable / (GRID_SIZE - 1);
  return {
    px: padding + x * step,
    py: padding + y * step,
  };
}

/** Get congestion level label */
export function getCongestionLevel(flow: number): 'low' | 'medium' | 'high' | 'over' {
  const ratio = flow / EDGE_CAPACITY;
  if (ratio <= 0.5) return 'low';
  if (ratio <= 0.85) return 'medium';
  if (ratio <= 1.0) return 'high';
  return 'over';
}

/** Calculate congestion-adjusted travel time per §9 */
export function congestionTravelTime(flow: number): number {
  return 1 + 0.15 * Math.pow(flow / EDGE_CAPACITY, 4);
}
