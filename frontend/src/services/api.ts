/**
 * API service layer — typed fetch calls per CONTRACT.md §15–§20
 * Base URL: http://localhost:8000
 */

import type {
  InstanceResponse,
  BaselineResponse,
  OptimizeResponse,
  CompareResponse,
} from '../types/contract';

const BASE_URL = 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch {
      // use status text
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

/** §11 — GET /health */
export async function checkHealth(): Promise<{ status: string }> {
  return request('/health');
}

/** §16 — POST /api/instance */
export async function createInstance(seed: number = 42): Promise<InstanceResponse> {
  return request('/api/instance', {
    method: 'POST',
    body: JSON.stringify({ seed }),
  });
}

/** §17 — POST /api/baseline */
export async function runBaseline(seed: number = 42): Promise<BaselineResponse> {
  return request('/api/baseline', {
    method: 'POST',
    body: JSON.stringify({ seed }),
  });
}

/** §18 — POST /api/optimize */
export async function runOptimize(seed: number = 42): Promise<OptimizeResponse> {
  return request('/api/optimize', {
    method: 'POST',
    body: JSON.stringify({ seed }),
  });
}

/** §19 — POST /api/compare (primary endpoint) */
export async function runCompare(seed: number = 42): Promise<CompareResponse> {
  return request('/api/compare', {
    method: 'POST',
    body: JSON.stringify({ seed }),
  });
}

export { ApiError };
