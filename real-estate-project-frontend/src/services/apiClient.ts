import type { ParsedRequirement } from './mockApi';
import type { CleanedProperty, RawProperty } from '../assets/mockData';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export interface SearchResult {
  parsedRequirement: ParsedRequirement;
  properties: CleanedProperty[];
  builders: Record<string, unknown>;
  sentiments: Record<string, unknown>;
  trends: Record<string, unknown>;
  total_raw?: number;
  total_unique?: number;
  ai_mode?: 'openai' | 'fallback';
}

export interface ChatResponse {
  reply: string;
  parsedRequirement?: ParsedRequirement | null;
}

export interface BackendHealth {
  status: string;
  properties_in_db?: number;
  database?: string;
  detail?: string;
  openai_active?: boolean;
  openai_model?: string | null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  return response.json() as Promise<T>;
}

export async function executeSearch(
  query: string,
  overrides?: Partial<ParsedRequirement>,
): Promise<SearchResult> {
  return request<SearchResult>('/api/search', {
    method: 'POST',
    body: JSON.stringify({ query, overrides: overrides || null }),
  });
}

/** Parse natural-language text into structured search filters. */
export async function parseRequirement(
  query: string,
): Promise<{ parsedRequirement: ParsedRequirement }> {
  return request<{ parsedRequirement: ParsedRequirement }>('/api/parse', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

export async function chatWithAgent(
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<ChatResponse> {
  return request<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
}

export async function fetchBackendHealth(): Promise<BackendHealth> {
  return request<BackendHealth>('/api/health');
}

export async function ingestProperties(properties: RawProperty[]): Promise<{ inserted: number }> {
  return request<{ inserted: number }>('/api/properties/ingest', {
    method: 'POST',
    body: JSON.stringify({ properties }),
  });
}

export async function seedDatabase(force = false): Promise<{ status: string; counts: Record<string, number> }> {
  return request(`/api/seed?force=${force}`, { method: 'POST' });
}

export function getApiBaseUrl(): string {
  return API_BASE || '(vite proxy → localhost:8000)';
}

export async function isBackendAiActive(): Promise<boolean> {
  try {
    const health = await fetchBackendHealth();
    return health.status === 'ok' && health.openai_active === true;
  } catch {
    return false;
  }
}
