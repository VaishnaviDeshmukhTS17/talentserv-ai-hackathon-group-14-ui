import type { RawProperty } from '../assets/mockData';
import { executeSearch as apiExecuteSearch, type SearchResult } from './apiClient';

export type { SearchResult };

export interface ParsedRequirement {
  city: string;
  locality: string;
  transaction_type: 'Buy' | 'Rent';
  bhk: number | null;
  budget_max: number | null;
  property_type: string;
  status_preference: 'Ready to Move' | 'Under Construction' | null;
  preference_notes: string;
  vastu_compliant_only?: boolean;
}

/** @deprecated Use apiClient.ingestProperties — kept for test compatibility */
export function addRawProperties(_newProps: RawProperty[]): void {
  console.warn('[mockApi] addRawProperties is deprecated. Use apiClient.ingestProperties.');
}

/** @deprecated Reset is handled server-side via re-seed */
export function resetRawProperties(): void {
  console.warn('[mockApi] resetRawProperties is deprecated on the frontend.');
}

export function getActiveRawProperties(): RawProperty[] {
  return [];
}

/**
 * Run property search via Python FastAPI backend (MongoDB + OpenAI).
 */
export async function executeSearch(
  query: string,
  overrides?: Partial<ParsedRequirement>,
): Promise<SearchResult> {
  return apiExecuteSearch(query, overrides);
}

/** Build a natural-language query string from parsed criteria (for chat → search sync). */
export function buildSearchQueryFromRequirement(
  req: Partial<ParsedRequirement>,
  fallbackText = '',
): string {
  const parts: string[] = [];
  if (req.bhk) parts.push(`${req.bhk} BHK`);
  if (req.property_type) parts.push(String(req.property_type));
  if (req.locality && req.city) parts.push(`in ${req.locality}, ${req.city}`);
  else if (req.locality) parts.push(`in ${req.locality}`);
  if (req.budget_max) {
    if (req.transaction_type === 'Rent') {
      parts.push(`under ₹${req.budget_max.toLocaleString()}/mo`);
    } else {
      parts.push(`under ${(req.budget_max / 100000).toFixed(0)} lakh`);
    }
  }
  if (req.status_preference) parts.push(String(req.status_preference));
  if (req.preference_notes) parts.push(String(req.preference_notes));
  return parts.length > 0 ? parts.join(', ') : fallbackText;
}

/** Normalize chat/API parsed fields before search (case, enums). */
export function normalizeParsedRequirement(req: Partial<ParsedRequirement>): Partial<ParsedRequirement> {
  const out = { ...req };
  const tx = String(out.transaction_type || 'Buy').toLowerCase();
  out.transaction_type = tx === 'rent' || tx === 'rental' || tx === 'lease' ? 'Rent' : 'Buy';

  // Normalize locality first
  let locality = out.locality ? String(out.locality).trim() : '';
  if (locality && (locality.toLowerCase() === 'none' || locality.toLowerCase() === 'null')) {
    out.locality = '';
  } else if (locality) {
    const locLower = locality.toLowerCase();
    let normalizedLoc = locality;
    if (locLower.includes('hinja') || locLower.includes('hinje')) normalizedLoc = 'Hinjewadi';
    else if (locLower.includes('wakad')) normalizedLoc = 'Wakad';
    else if (locLower.includes('baner')) normalizedLoc = 'Baner';
    else if (locLower.includes('hadapsar') || locLower.includes('hadaps')) normalizedLoc = 'Hadapsar';
    else if (locLower.includes('kharadi') || locLower.includes('khara') || locLower.includes('kharra')) normalizedLoc = 'Kharadi';
    else if (locLower.includes('viman')) normalizedLoc = 'Viman Nagar';
    else if (locLower.includes('kothrud') || locLower.includes('koth') || locLower === 'kthrud') normalizedLoc = 'Kothrud';
    else if (locLower.includes('kalyani')) normalizedLoc = 'Kalyani Nagar';
    else if (locLower.includes('whitefield')) normalizedLoc = 'Whitefield';
    else if (locLower.includes('indiranagar') || locLower.includes('indira')) normalizedLoc = 'Indiranagar';
    else if (locLower.includes('koramangala') || locLower.includes('kora')) normalizedLoc = 'Koramangala';
    
    out.locality = normalizedLoc;

    // Deduce correct city based on known localities
    const puneLocalities = ['hinjewadi', 'wakad', 'baner', 'hadapsar', 'kharadi', 'viman nagar', 'kothrud', 'kalyani nagar'];
    const bangaloreLocalities = ['whitefield', 'indiranagar', 'koramangala'];
    const finalLocLower = normalizedLoc.toLowerCase();
    if (puneLocalities.includes(finalLocLower)) {
      out.city = 'Pune';
    } else if (bangaloreLocalities.includes(finalLocLower)) {
      out.city = 'Bangalore';
    }
  }

  // Handle city default / normalization
  const cityRaw = out.city ? String(out.city).trim() : '';
  if (!cityRaw || cityRaw.toLowerCase() === 'none' || cityRaw.toLowerCase() === 'null') {
    out.city = 'Pune';
  } else {
    const city = cityRaw.toLowerCase();
    out.city = city === 'bangalore' || city === 'bengaluru' ? 'Bangalore' : (city === 'pune' ? 'Pune' : cityRaw);
  }

  if (out.status_preference) {
    const status = out.status_preference.toLowerCase();
    if (status.includes('ready') || status.includes('move')) {
      out.status_preference = 'Ready to Move';
    } else if (status.includes('construction')) {
      out.status_preference = 'Under Construction';
    } else if (status !== 'ready to move' && status !== 'under construction') {
      out.status_preference = null;
    }
  }

  if (out.bhk != null) out.bhk = Number(out.bhk) || null;
  if (out.budget_max != null) out.budget_max = Number(out.budget_max) || null;

  return out;
}

/** Local fallback parser — used by unit tests only */
export function mockParseQuery(query: string): ParsedRequirement {
  const lowercase = query.toLowerCase();
  let city = 'Pune';
  let locality = '';
  let transaction_type: 'Buy' | 'Rent' = 'Buy';
  let bhk: number | null = null;
  let budget_max: number | null = null;
  let property_type = 'Apartment';
  let status_preference: 'Ready to Move' | 'Under Construction' | null = null;
  let preference_notes = 'Standard residential search.';

  if (lowercase.includes('hinje') || lowercase.includes('hinja')) {
    locality = 'Hinjewadi';
  } else if (lowercase.includes('wakad')) {
    locality = 'Wakad';
  } else if (lowercase.includes('baner')) {
    locality = 'Baner';
  } else if (lowercase.includes('hadapsar') || lowercase.includes('hadaps')) {
    locality = 'Hadapsar';
  } else if (lowercase.includes('kharadi') || lowercase.includes('khara')) {
    locality = 'Kharadi';
  } else if (lowercase.includes('viman')) {
    locality = 'Viman Nagar';
  } else if (lowercase.includes('kothrud') || lowercase.includes('koth') || lowercase.includes('kthrud')) {
    locality = 'Kothrud';
  } else if (lowercase.includes('kalyani')) {
    locality = 'Kalyani Nagar';
  } else if (lowercase.includes('whitefield')) {
    locality = 'Whitefield';
  } else if (lowercase.includes('indiranagar')) {
    locality = 'Indiranagar';
  } else if (lowercase.includes('koramangala') || lowercase.includes('kora')) {
    locality = 'Koramangala';
  }

  if (locality) {
    const puneLocalities = ['hinjewadi', 'wakad', 'baner', 'hadapsar', 'kharadi', 'viman nagar', 'kothrud', 'kalyani nagar'];
    const bangaloreLocalities = ['whitefield', 'indiranagar', 'koramangala'];
    const locLower = locality.toLowerCase();
    if (puneLocalities.includes(locLower)) {
      city = 'Pune';
    } else if (bangaloreLocalities.includes(locLower)) {
      city = 'Bangalore';
    }
  } else {
    if (lowercase.includes('bangalore') || lowercase.includes('bengaluru') || lowercase.includes('whitefield') || lowercase.includes('indiranagar') || lowercase.includes('koramangala')) {
      city = 'Bangalore';
    }
  }

  if (lowercase.includes('rent') || lowercase.includes('rental')) transaction_type = 'Rent';

  if (lowercase.includes('1 bhk') || lowercase.includes('1bhk')) bhk = 1;
  else if (lowercase.includes('2 bhk') || lowercase.includes('2bhk')) bhk = 2;
  else if (lowercase.includes('3 bhk') || lowercase.includes('3bhk')) bhk = 3;
  else if (lowercase.includes('4 bhk') || lowercase.includes('4bhk')) bhk = 4;

  if (lowercase.includes('ready') || lowercase.includes('move-in')) status_preference = 'Ready to Move';

  const lakhMatch = lowercase.match(/under\s+(\d+(?:\.\d+)?)\s*(?:lakh|l|lac)/);
  const kMatch = lowercase.match(/under\s+(\d+)\s*(?:k|thousand)/);
  if (lakhMatch) budget_max = Math.round(parseFloat(lakhMatch[1]) * 100_000);
  else if (kMatch) budget_max = parseInt(kMatch[1], 10) * 1000;

  return {
    city,
    locality,
    transaction_type,
    bhk,
    budget_max,
    property_type,
    status_preference,
    preference_notes,
  };
}
