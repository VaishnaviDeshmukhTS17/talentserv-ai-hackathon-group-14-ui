import {
  executeSearch,
  chatWithAgent,
  fetchBackendHealth,
  ingestProperties,
  seedDatabase,
  isBackendAiActive,
  getApiBaseUrl,
} from '../services/apiClient';
import { installBackendFetchMock, mockParsedRequirement } from './mockBackendFetch';

installBackendFetchMock();

describe('API Client — FastAPI Backend', () => {
  it('fetchBackendHealth returns connected status', async () => {
    const health = await fetchBackendHealth();
    expect(health.status).toBe('ok');
    expect(health.properties_in_db).toBe(56);
  });

  it('executeSearch posts query and returns ranked properties', async () => {
    const result = await executeSearch('2 BHK in Hinjewadi under 80 lakh');
    expect(result.parsedRequirement.locality).toBe('Hinjewadi');
    expect(result.properties.length).toBeGreaterThan(0);
    expect(result.ai_mode).toBe('openai');
    expect(result.properties[0].match_score).toBeDefined();
  });

  it('chatWithAgent returns reply and parsed requirement', async () => {
    const response = await chatWithAgent([
      { role: 'user', content: 'Looking for 2 BHK in Hinjewadi under 80 Lakh' },
    ]);
    expect(response.reply).toContain('updated your criteria');
    expect(response.parsedRequirement?.locality).toBe(mockParsedRequirement.locality);
    expect(response.parsedRequirement?.bhk).toBe(2);
  });

  it('ingestProperties sends listings to backend', async () => {
    const result = await ingestProperties([
      {
        property_id: 'UPLOAD_123',
        title: 'Custom Mansion',
        source: 'CSV Upload',
        source_url: '#',
        city: 'Pune',
        locality: 'Hinjewadi',
        property_type: 'Villa',
        transaction_type: 'Buy',
        bhk: 4,
        price: 15000000,
        area_sqft: 3500,
        status: 'Ready to Move',
        builder_or_owner: 'Owner',
        project_name: 'Self Built',
      },
    ]);
    expect(result.inserted).toBe(1);
  });

  it('seedDatabase triggers backend re-seed', async () => {
    const result = await seedDatabase(true);
    expect(result.status).toBe('seeded');
    expect(result.counts.properties).toBe(56);
  });

  it('isBackendAiActive is true when health check succeeds', async () => {
    const active = await isBackendAiActive();
    expect(active).toBe(true);
  });

  it('getApiBaseUrl documents proxy mode in dev', () => {
    expect(getApiBaseUrl()).toContain('localhost:8000');
  });
});

describe('API Client — backend offline', () => {
  const originalFetch = globalThis.fetch;

  beforeAll(() => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('isBackendAiActive returns false when backend is unreachable', async () => {
    const active = await isBackendAiActive();
    expect(active).toBe(false);
  });
});
