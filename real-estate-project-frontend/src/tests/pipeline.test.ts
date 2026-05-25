import { normalizePrice, normalizeArea, normalizeBhk, normalizeLocality, calculateVastuCompliance } from '../utils/normalizer';
import { deduplicateProperties } from '../utils/deduplicator';
import { mockParseQuery } from '../services/mockApi';
import { executeSearch, ingestProperties } from '../services/apiClient';
import { CleanedProperty } from '../assets/mockData';
import { getHaversineDistance, getCompassDirection, calculateLocationScores, getNearestPOIs } from '../utils/geoUtils';
import { installBackendFetchMock } from './mockBackendFetch';

installBackendFetchMock();

describe('Data Normalization Utilities', () => {
  it('should parse various price strings into standard numbers', () => {
    expect(normalizePrice('Rs 80 L')).toBe(8000000);
    expect(normalizePrice('78 Lac')).toBe(7800000);
    expect(normalizePrice('1.15 Cr')).toBe(11500000);
    expect(normalizePrice('3.5 Crore')).toBe(35000000);
    expect(normalizePrice('22,000 / month')).toBe(22000);
    expect(normalizePrice('60k / mo')).toBe(60000);
    expect(normalizePrice(45000)).toBe(45000);
  });

  it('should extract numerical area values', () => {
    expect(normalizeArea('850 sq.ft.')).toBe(850);
    expect(normalizeArea('1200')).toBe(1200);
    expect(normalizeArea('855 sqft')).toBe(855);
  });

  it('should extract BHK count', () => {
    expect(normalizeBhk('2 BHK Flat')).toBe(2);
    expect(normalizeBhk('3 BHK')).toBe(3);
    expect(normalizeBhk('1 BHK Apartment')).toBe(1);
    expect(normalizeBhk(4)).toBe(4);
  });

  it('should standardize spelling of localities', () => {
    expect(normalizeLocality('Hinjawadi')).toBe('Hinjewadi');
    expect(normalizeLocality('hinje')).toBe('Hinjewadi');
    expect(normalizeLocality('wakad')).toBe('Wakad');
    expect(normalizeLocality('whitefield')).toBe('Whitefield');
  });
});

describe('Fuzzy Deduplication Pipeline', () => {
  it('should group duplicate properties together and assign matching group IDs', async () => {
    const mockListings: CleanedProperty[] = [
      {
        property_id: 'PROP001',
        title: '2 BHK Flat in Hinjewadi',
        source: 'MagicBricks',
        source_url: 'url1',
        city: 'Pune',
        locality: 'Hinjewadi',
        property_type: 'Apartment',
        transaction_type: 'Buy',
        bhk: 2,
        price: 7800000,
        area_sqft: 850,
        price_per_sqft: 9176,
        status: 'Ready to Move',
        builder_or_owner: 'ABC Developers',
        project_name: 'Green Heights',
        is_incomplete: false,
      },
      {
        property_id: 'PROP002',
        title: 'Brand New 2BHK Hinjewadi Phase 1',
        source: 'Housing.com',
        source_url: 'url2',
        city: 'Pune',
        locality: 'Hinjewadi',
        property_type: 'Apartment',
        transaction_type: 'Buy',
        bhk: 2,
        price: 7800000,
        area_sqft: 855,
        price_per_sqft: 9122,
        status: 'Ready to Move',
        builder_or_owner: 'ABC Developers',
        project_name: 'Green Heights',
        is_incomplete: false,
      },
      {
        property_id: 'PROP003',
        title: 'Premium 3 BHK in Wakad',
        source: 'NoBroker',
        source_url: 'url3',
        city: 'Pune',
        locality: 'Wakad',
        property_type: 'Apartment',
        transaction_type: 'Buy',
        bhk: 3,
        price: 11500000,
        area_sqft: 1400,
        price_per_sqft: 8214,
        status: 'Under Construction',
        builder_or_owner: 'XYZ Builders',
        project_name: 'Elanza Towers',
        is_incomplete: false,
      },
    ];

    const deduplicated = await deduplicateProperties(mockListings);

    expect(deduplicated[0].duplicate_group_id).toBeDefined();
    expect(deduplicated[1].duplicate_group_id).toBe(deduplicated[0].duplicate_group_id);
    expect(deduplicated[2].duplicate_group_id).toBeUndefined();
  });
});

describe('Requirement Parser (local fallback)', () => {
  it('should parse city, locality, configuration, and budget limits', () => {
    const query1 = 'Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move.';
    const parsed1 = mockParseQuery(query1);

    expect(parsed1.city).toBe('Pune');
    expect(parsed1.locality).toBe('Hinjewadi');
    expect(parsed1.bhk).toBe(2);
    expect(parsed1.budget_max).toBe(8000000);
    expect(parsed1.transaction_type).toBe('Buy');
    expect(parsed1.status_preference).toBe('Ready to Move');

    const query2 = 'Need a rental apartment near Whitefield Bangalore, 3 BHK, budget under 45k.';
    const parsed2 = mockParseQuery(query2);

    expect(parsed2.city).toBe('Bangalore');
    expect(parsed2.locality).toBe('Whitefield');
    expect(parsed2.bhk).toBe(3);
    expect(parsed2.budget_max).toBe(45000);
    expect(parsed2.transaction_type).toBe('Rent');
  });
});

describe('Backend Search Pipeline (API Client)', () => {
  it('should call POST /api/search and return parsed requirement + properties', async () => {
    const result = await executeSearch('2 BHK in Hinjewadi under 80 lakh');
    expect(result.parsedRequirement.locality).toBe('Hinjewadi');
    expect(result.properties[0].property_id).toBe('PROP001');
    expect(result.total_raw).toBe(56);
  });
});

describe('Property Ingestion (API Client)', () => {
  it('should POST uploaded listings to /api/properties/ingest', async () => {
    const result = await ingestProperties([
      {
        property_id: 'UPLOAD_123',
        title: 'Unique Custom Mansion',
        source: 'CSV Ingest',
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
});

describe('Geo-Proximity Calculations & Location Intelligence', () => {
  it('should calculate great-circle distances using the Haversine formula', () => {
    const dist = getHaversineDistance(18.5932, 73.7420, 18.5942, 73.7650);
    expect(dist).toBe(2.43);
  });

  it('should resolve approximate compass direction headings', () => {
    expect(getCompassDirection(18.5, 73.5, 18.5, 73.6)).toBe('E');
    expect(getCompassDirection(18.5, 73.5, 18.6, 73.5)).toBe('N');
    expect(getCompassDirection(18.5, 73.5, 18.4, 73.4)).toBe('SW');
  });

  it('should resolve nearest POIs for each category', () => {
    const result = getNearestPOIs(18.5913, 73.7389, 'Hinjewadi');
    expect(result.commute).not.toBeNull();
    expect(result.commute!.poi.name).toBe('Rajiv Gandhi Infotech Park Phase 1');
    expect(result.commute!.distance_km).toBe(0.1);
  });

  it('should compute location quality matrix scores dynamically with decay functions', () => {
    const scores = calculateLocationScores(18.5913, 73.7389, 'Hinjewadi');
    expect(scores.connectivity).toBeGreaterThanOrEqual(95);
    expect(scores.schools).toBeDefined();
    expect(scores.lifestyle).toBeDefined();
    expect(scores.infrastructure).toBeDefined();
  });

  it('should fallback to locality presets if geocodes are missing', () => {
    const scores = calculateLocationScores(undefined, undefined, 'Wakad');
    expect(scores.connectivity).toBe(85);
    expect(scores.schools).toBe(88);
    expect(scores.lifestyle).toBe(80);
    expect(scores.infrastructure).toBe(75);
  });
});

describe('Vastu Compliance Calculation', () => {
  it('should calculate correct Vastu score and level for high compliance', () => {
    const prop = {
      property_id: 'PROP_TEST_VASTU_HIGH',
      title: 'Vastu Compliant Flat',
      source: 'Direct',
      source_url: '#',
      city: 'Pune',
      locality: 'Hinjewadi',
      property_type: 'Apartment',
      transaction_type: 'Buy' as const,
      bhk: 2,
      price: 7500000,
      area_sqft: 1000,
      status: 'Ready to Move',
      builder_or_owner: 'Test Owner',
      project_name: 'Test Project',
      vastu_details: {
        facing_direction: 'East' as const,
        kitchen_direction: 'South-East' as const,
        bedroom_direction: 'South-West' as const,
        layout_shape: 'Square' as const,
      },
    };
    const result = calculateVastuCompliance(prop);
    expect(result.vastu_score).toBe(100);
    expect(result.vastu_compliant_level).toBe('High');
  });

  it('should calculate correct Vastu score and level for moderate compliance', () => {
    const prop = {
      property_id: 'PROP_TEST_VASTU_MOD',
      title: 'Moderate Vastu Flat',
      source: 'Direct',
      source_url: '#',
      city: 'Pune',
      locality: 'Hinjewadi',
      property_type: 'Apartment',
      transaction_type: 'Buy' as const,
      bhk: 2,
      price: 7500000,
      area_sqft: 1000,
      status: 'Ready to Move',
      builder_or_owner: 'Test Owner',
      project_name: 'Test Project',
      vastu_details: {
        facing_direction: 'West' as const,
        kitchen_direction: 'South-East' as const,
        bedroom_direction: 'North-West' as const,
        layout_shape: 'Square' as const,
      },
    };
    const result = calculateVastuCompliance(prop);
    expect(result.vastu_score).toBe(72);
    expect(result.vastu_compliant_level).toBe('Moderate');
  });

  it('should fallback deterministically when Vastu details are missing', () => {
    const propOdd = {
      property_id: 'PROP001',
      title: 'Vastu Flat',
      source: 'Direct',
      source_url: '#',
      city: 'Pune',
      locality: 'Hinjewadi',
      property_type: 'Apartment',
      transaction_type: 'Buy' as const,
      bhk: 2,
      price: 7500000,
      area_sqft: 1000,
      status: 'Ready to Move',
      builder_or_owner: 'Test Owner',
      project_name: 'Test Project',
    };
    const resultOdd = calculateVastuCompliance(propOdd);
    expect(resultOdd.vastu_score).toBe(100);
    expect(resultOdd.vastu_details.facing_direction).toBe('East');

    const propEven = {
      property_id: 'PROP002',
      title: 'Vastu Flat',
      source: 'Direct',
      source_url: '#',
      city: 'Pune',
      locality: 'Hinjewadi',
      property_type: 'Apartment',
      transaction_type: 'Buy' as const,
      bhk: 2,
      price: 7500000,
      area_sqft: 1000,
      status: 'Ready to Move',
      builder_or_owner: 'Test Owner',
      project_name: 'Test Project',
    };
    const resultEven = calculateVastuCompliance(propEven);
    expect(resultEven.vastu_score).toBe(100);
    expect(resultEven.vastu_details.facing_direction).toBe('North');
  });

  it('should parse/standardize dirty facing directions', () => {
    const prop = {
      property_id: 'PROP_DIRTY_VASTU',
      title: 'Dirty Vastu Flat',
      source: 'Direct',
      source_url: '#',
      city: 'Pune',
      locality: 'Hinjewadi',
      property_type: 'Apartment',
      transaction_type: 'Buy' as const,
      bhk: 2,
      price: 7500000,
      area_sqft: 1000,
      status: 'Ready to Move',
      builder_or_owner: 'Test Owner',
      project_name: 'Test Project',
      vastu_facing: 'east-facing',
    };
    const result = calculateVastuCompliance(prop);
    expect(result.vastu_details.facing_direction).toBe('East');
  });
});
