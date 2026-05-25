/** Shared Jest mock for PropIntel FastAPI backend (`/api/*`). */

export const mockParsedRequirement = {
  city: 'Pune',
  locality: 'Hinjewadi',
  transaction_type: 'Buy' as const,
  bhk: 2,
  budget_max: 8000000,
  property_type: 'Apartment',
  status_preference: 'Ready to Move' as const,
  preference_notes: 'Near IT corridor',
};

export const mockSearchResult = {
  parsedRequirement: mockParsedRequirement,
  properties: [
    {
      property_id: 'PROP001',
      title: '2 BHK Flat in Hinjewadi',
      source: 'MagicBricks',
      source_url: 'url1',
      city: 'Pune',
      locality: 'Hinjewadi',
      property_type: 'Apartment',
      transaction_type: 'Buy' as const,
      bhk: 2,
      price: 7800000,
      area_sqft: 850,
      price_per_sqft: 9176,
      status: 'Ready to Move',
      builder_or_owner: 'ABC Developers',
      project_name: 'Green Heights',
      is_incomplete: false,
      match_score: 92,
      recommendation_explanation: 'Strong match for your Hinjewadi budget.',
    },
  ],
  builders: {},
  sentiments: {},
  trends: {},
  total_raw: 56,
  total_unique: 54,
  ai_mode: 'openai' as const,
};

export function installBackendFetchMock() {
  const originalFetch = globalThis.fetch;

  beforeAll(() => {
    globalThis.fetch = jest.fn().mockImplementation((url: string, init?: RequestInit) => {
      const path = url.replace(/^https?:\/\/[^/]+/, '');

      if (path === '/api/health' || path.endsWith('/api/health')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'ok',
              properties_in_db: 56,
              database: 'connected',
              openai_active: true,
              openai_model: 'gpt-4o-mini',
            }),
        });
      }

      if (path.includes('/api/parse') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ parsedRequirement: mockParsedRequirement }),
        });
      }

      if (path.includes('/api/search') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchResult),
        });
      }

      if (path.includes('/api/chat') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              reply: 'I have updated your criteria filters: 2 BHK in Hinjewadi under 80 Lakh.',
              parsedRequirement: mockParsedRequirement,
            }),
        });
      }

      if (path.includes('/api/properties/ingest') && init?.method === 'POST') {
        const body = JSON.parse(init.body as string);
        const count = Array.isArray(body.properties) ? body.properties.length : 0;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ inserted: count }),
        });
      }

      if (path.includes('/api/seed') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'seeded',
              counts: { properties: 56, builders: 20 },
            }),
        });
      }

      return Promise.reject(new Error(`Unhandled mock fetch: ${url}`));
    }) as typeof fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  return { originalFetch };
}
