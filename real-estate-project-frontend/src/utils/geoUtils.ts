import { pointsOfInterest, PointOfInterest } from '../assets/mockData';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula. Returns distance in kilometers.
 */
export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2)); // Round to 2 decimal places
}

/**
 * Calculates a cardinal/ordinal compass direction from point 1 to point 2.
 */
export function getCompassDirection(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  
  if (Math.abs(dLat) < 0.0005 && Math.abs(dLon) < 0.0005) {
    return "Immediate";
  }

  let direction = "";
  if (dLat > 0.0002) direction += "N";
  else if (dLat < -0.0002) direction += "S";
  
  if (dLon > 0.0002) direction += "E";
  else if (dLon < -0.0002) direction += "W";
  
  return direction || "Nearby";
}

export interface NearestPOIResult {
  poi: PointOfInterest;
  distance_km: number;
  direction: string;
}

/**
 * Finds the closest Point of Interest (POI) for a given category.
 */
export function findNearestPOI(
  lat: number,
  lon: number,
  category: 'commute' | 'school' | 'lifestyle' | 'infrastructure',
  locality?: string
): NearestPOIResult | null {
  // Filter POIs by category. If locality is provided, prioritize POIs in that locality
  let candidates = pointsOfInterest.filter(p => p.type === category);
  
  if (locality) {
    const localCandidates = candidates.filter(p => p.locality.toLowerCase() === locality.toLowerCase());
    if (localCandidates.length > 0) {
      candidates = localCandidates;
    }
  }

  if (candidates.length === 0) return null;

  let nearest: PointOfInterest = candidates[0];
  let minDistance = getHaversineDistance(lat, lon, nearest.latitude, nearest.longitude);

  for (let i = 1; i < candidates.length; i++) {
    const dist = getHaversineDistance(lat, lon, candidates[i].latitude, candidates[i].longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = candidates[i];
    }
  }

  return {
    poi: nearest,
    distance_km: minDistance,
    direction: getCompassDirection(lat, lon, nearest.latitude, nearest.longitude)
  };
}

/**
 * Compiles a list of nearest POIs (one for each category).
 */
export function getNearestPOIs(lat: number, lon: number, locality?: string): Record<string, NearestPOIResult | null> {
  return {
    commute: findNearestPOI(lat, lon, 'commute', locality),
    school: findNearestPOI(lat, lon, 'school', locality),
    lifestyle: findNearestPOI(lat, lon, 'lifestyle', locality),
    infrastructure: findNearestPOI(lat, lon, 'infrastructure', locality)
  };
}

/**
 * Dynamically computes a score out of 100 based on nearest POI distance.
 */
function scoreDecay(distanceKm: number): number {
  if (distanceKm <= 0.8) {
    return Math.round(95 + (1 - distanceKm / 0.8) * 5); // 95 - 100
  }
  if (distanceKm <= 2.0) {
    return Math.round(85 + (1 - (distanceKm - 0.8) / 1.2) * 10); // 85 - 95
  }
  if (distanceKm <= 4.0) {
    return Math.round(70 + (1 - (distanceKm - 2.0) / 2.0) * 15); // 70 - 85
  }
  if (distanceKm <= 6.0) {
    return Math.round(50 + (1 - (distanceKm - 4.0) / 2.0) * 20); // 50 - 70
  }
  return Math.max(40, Math.round(50 - (distanceKm - 6.0) * 5)); // Decays down to a minimum of 40
}

/**
 * Dynamically generates connectivity, schools, lifestyle, and infrastructure scores
 * based on actual distances to closest geocoded points of interest.
 */
export function calculateLocationScores(
  lat: number | undefined,
  lon: number | undefined,
  locality: string
): { connectivity: number; schools: number; lifestyle: number; infrastructure: number } {
  // If coordinates are missing, fallback to standard average estimates
  if (lat === undefined || lon === undefined) {
    const fallbacks: Record<string, { connectivity: number; schools: number; lifestyle: number; infrastructure: number }> = {
      "Hinjewadi": { connectivity: 90, schools: 75, lifestyle: 70, infrastructure: 55 },
      "Wakad": { connectivity: 85, schools: 88, lifestyle: 80, infrastructure: 75 },
      "Baner": { connectivity: 92, schools: 85, lifestyle: 95, infrastructure: 85 },
      "Hadapsar": { connectivity: 88, schools: 80, lifestyle: 88, infrastructure: 70 },
      "Kharadi": { connectivity: 88, schools: 80, lifestyle: 85, infrastructure: 75 },
      "Viman Nagar": { connectivity: 94, schools: 85, lifestyle: 92, infrastructure: 85 },
      "Kothrud": { connectivity: 85, schools: 92, lifestyle: 88, infrastructure: 90 },
      "Kalyani Nagar": { connectivity: 92, schools: 88, lifestyle: 95, infrastructure: 90 },
      "Whitefield": { connectivity: 88, schools: 85, lifestyle: 85, infrastructure: 60 },
      "Indiranagar": { connectivity: 95, schools: 85, lifestyle: 98, infrastructure: 80 },
      "Koramangala": { connectivity: 92, schools: 88, lifestyle: 96, infrastructure: 75 }
    };
    return fallbacks[locality] || { connectivity: 80, schools: 80, lifestyle: 80, infrastructure: 70 };
  }

  const pois = getNearestPOIs(lat, lon, locality);
  
  const connectivity = pois.commute ? scoreDecay(pois.commute.distance_km) : 80;
  const schools = pois.school ? scoreDecay(pois.school.distance_km) : 80;
  const lifestyle = pois.lifestyle ? scoreDecay(pois.lifestyle.distance_km) : 80;
  const infrastructure = pois.infrastructure ? scoreDecay(pois.infrastructure.distance_km) : 70;

  return {
    connectivity,
    schools,
    lifestyle,
    infrastructure
  };
}
