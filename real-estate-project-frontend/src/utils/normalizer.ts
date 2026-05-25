import { RawProperty, CleanedProperty, VastuDetails } from '../assets/mockData';

/**
 * Standardizes a price string to an integer value.
 * Handles "Lakh", "L", "Lac", "Cr", "Crore", "k", "/ month", etc.
 */
export function normalizePrice(price: string | number): number {
  if (typeof price === 'number') return price;
  if (!price) return 0;

  const cleanStr = price.toString().toLowerCase().trim();
  
  // Remove currency symbols, commas, and slashes
  const cleanNumStr = cleanStr.replace(/[₹rs$,\s/month\mo]/g, '');

  // Handle Crores (Cr)
  if (cleanStr.includes('cr') || cleanStr.includes('crore')) {
    const val = parseFloat(cleanNumStr.replace(/(cr|crore)/g, ''));
    return Math.round(val * 10000000);
  }

  // Handle Lakhs (L, Lac, Lakh)
  if (cleanStr.includes('l') || cleanStr.includes('lac') || cleanStr.includes('lakh')) {
    const val = parseFloat(cleanNumStr.replace(/(l|lac|lakh)/g, ''));
    return Math.round(val * 100000);
  }

  // Handle Thousands (k)
  if (cleanStr.includes('k')) {
    const val = parseFloat(cleanNumStr.replace('k', ''));
    return Math.round(val * 1000);
  }

  // Pure digits (possibly with commas already stripped)
  const val = parseFloat(cleanNumStr);
  return isNaN(val) ? 0 : Math.round(val);
}

/**
 * Standardizes area strings like "850 sq.ft." to numbers.
 */
export function normalizeArea(area: string | number): number {
  if (typeof area === 'number') return area;
  if (!area) return 0;

  const cleanStr = area.toString().toLowerCase().replace(/[^0-9.]/g, '');
  const val = parseFloat(cleanStr);
  return isNaN(val) ? 0 : Math.round(val);
}

/**
 * Standardizes BHK values like "2 BHK Flat" or "3 BHK" to numbers.
 */
export function normalizeBhk(bhk: string | number): number {
  if (typeof bhk === 'number') return bhk;
  if (!bhk) return 0;

  // Extract first digit
  const match = bhk.toString().match(/\d+/);
  if (match) {
    return parseInt(match[0], 10);
  }
  return 0;
}

/**
 * Normalizes common spelling mistakes in localities.
 */
export function normalizeLocality(locality: string): string {
  if (!locality) return '';
  const clean = locality.trim().toLowerCase();

  // Spell correcting Hinjawadi -> Hinjewadi
  if (clean.includes('hinja') || clean.includes('hinje')) {
    return 'Hinjewadi';
  }
  if (clean.includes('wakad')) {
    return 'Wakad';
  }
  if (clean.includes('baner')) {
    return 'Baner';
  }
  if (clean.includes('hadapsar') || clean.includes('hadaps')) {
    return 'Hadapsar';
  }
  if (clean.includes('kharadi') || clean.includes('khara') || clean.includes('kharra')) {
    return 'Kharadi';
  }
  if (clean.includes('viman')) {
    return 'Viman Nagar';
  }
  if (clean.includes('kothrud') || clean.includes('koth')) {
    return 'Kothrud';
  }
  if (clean.includes('kalyani')) {
    return 'Kalyani Nagar';
  }
  if (clean.includes('whitefield')) {
    return 'Whitefield';
  }
  if (clean.includes('indiranagar') || clean.includes('indira')) {
    return 'Indiranagar';
  }
  if (clean.includes('koramangala') || clean.includes('kora')) {
    return 'Koramangala';
  }

  // Fallback to title case
  return locality
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Computes the Vastu score and compliance metadata for a property.
 */
export function calculateVastuCompliance(prop: RawProperty): {
  vastu_score: number;
  vastu_compliant_level: 'High' | 'Moderate' | 'Remedy Recommended';
  vastu_details: VastuDetails;
} {
  // If explicit details are already provided, use them!
  let facing = prop.vastu_details?.facing_direction || prop.vastu_facing as any;
  let kitchen = prop.vastu_details?.kitchen_direction;
  let bedroom = prop.vastu_details?.bedroom_direction;
  let pooja = prop.vastu_details?.pooja_direction;
  let shape = prop.vastu_details?.layout_shape;

  // Standardize facing direction if string based
  if (typeof facing === 'string') {
    const cleanFacing = facing.toLowerCase().trim();
    if (cleanFacing.includes('north-east') || cleanFacing.includes('northeast') || cleanFacing === 'ne') {
      facing = 'North-East';
    } else if (cleanFacing.includes('north-west') || cleanFacing.includes('northwest') || cleanFacing === 'nw') {
      facing = 'North-West';
    } else if (cleanFacing.includes('south-east') || cleanFacing.includes('southeast') || cleanFacing === 'se') {
      facing = 'South-East';
    } else if (cleanFacing.includes('south-west') || cleanFacing.includes('southwest') || cleanFacing === 'sw') {
      facing = 'South-West';
    } else if (cleanFacing.includes('north') || cleanFacing === 'n') {
      facing = 'North';
    } else if (cleanFacing.includes('east') || cleanFacing === 'e') {
      facing = 'East';
    } else if (cleanFacing.includes('west') || cleanFacing === 'w') {
      facing = 'West';
    } else if (cleanFacing.includes('south') || cleanFacing === 's') {
      facing = 'South';
    } else {
      facing = undefined;
    }
  }

  // Seeding default values deterministically if missing
  if (!facing || !kitchen || !bedroom || !shape) {
    // Generate based on property_id hash or digit
    const numMatch = prop.property_id.match(/\d+/);
    const idNum = numMatch ? parseInt(numMatch[0], 10) : 1;

    if (idNum % 2 !== 0) {
      // Odd IDs get perfect East-facing
      facing = facing || 'East';
      kitchen = kitchen || 'South-East';
      bedroom = bedroom || 'South-West';
      pooja = pooja || 'North-East';
      shape = shape || 'Rectangular';
    } else {
      const remainder = idNum % 10;
      if (remainder === 2 || remainder === 6) {
        facing = facing || 'North';
        kitchen = kitchen || 'North-West';
        bedroom = bedroom || 'South-West';
        pooja = pooja || 'North-East';
        shape = shape || 'Square';
      } else if (remainder === 4 || remainder === 8) {
        facing = facing || 'West';
        kitchen = kitchen || 'South-East';
        bedroom = bedroom || 'North-East';
        pooja = pooja || 'West';
        shape = shape || 'Square';
      } else {
        // Remainder 0
        facing = facing || 'South';
        kitchen = kitchen || 'North-East';
        bedroom = bedroom || 'North-West';
        pooja = pooja || 'South-West';
        shape = shape || 'Irregular';
      }
    }
  }

  // Calculate score out of 100
  let score = 0;

  // 1. Entrance direction (40 pts)
  if (facing === 'East' || facing === 'North' || facing === 'North-East') {
    score += 40;
  } else if (facing === 'North-West' || facing === 'South-East') {
    score += 25;
  } else if (facing === 'West') {
    score += 20;
  } else {
    // South, South-West
    score += 10;
  }

  // 2. Kitchen direction (20 pts)
  if (kitchen === 'South-East' || kitchen === 'North-West') {
    score += 20;
  } else if (kitchen === 'East' || kitchen === 'West') {
    score += 12;
  } else {
    score += 5;
  }

  // 3. Master bedroom (20 pts)
  if (bedroom === 'South-West' || bedroom === 'South') {
    score += 20;
  } else if (bedroom === 'West' || bedroom === 'North-West') {
    score += 12;
  } else {
    score += 5;
  }

  // 4. Shape of layout (20 pts)
  if (shape === 'Square' || shape === 'Rectangular') {
    score += 20;
  } else {
    score += 10;
  }

  // Classify level
  let level: 'High' | 'Moderate' | 'Remedy Recommended' = 'Moderate';
  if (score >= 80) {
    level = 'High';
  } else if (score < 50) {
    level = 'Remedy Recommended';
  }

  return {
    vastu_score: score,
    vastu_compliant_level: level,
    vastu_details: {
      facing_direction: facing as any,
      kitchen_direction: kitchen as any,
      bedroom_direction: bedroom as any,
      pooja_direction: pooja as any,
      layout_shape: shape as any
    }
  };
}

/**
 * Process a single RawProperty into a CleanedProperty.
 */
export function processProperty(prop: RawProperty): CleanedProperty {
  const price = normalizePrice(prop.price);
  const area_sqft = normalizeArea(prop.area_sqft);
  const bhk = normalizeBhk(prop.bhk);
  const locality = normalizeLocality(prop.locality);

  const price_per_sqft = area_sqft > 0 ? Math.round(price / area_sqft) : 0;
  
  // Flag incomplete records
  const is_incomplete = !prop.title || price === 0 || area_sqft === 0 || bhk === 0 || !prop.locality;
  
  const vastu = calculateVastuCompliance(prop);

  return {
    ...prop,
    locality,
    price,
    area_sqft,
    bhk,
    price_per_sqft,
    is_incomplete,
    ...vastu
  };
}

/**
 * Clean a batch of RawProperties.
 */
export function cleanPropertiesList(props: RawProperty[]): CleanedProperty[] {
  return props.map(processProperty);
}

