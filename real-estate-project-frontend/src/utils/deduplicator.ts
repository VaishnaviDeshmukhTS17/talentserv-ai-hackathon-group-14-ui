import { CleanedProperty } from '../assets/mockData';

/**
 * Calculates string similarity using Levenshtein distance.
 */
function getStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
  
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return (maxLen - distance) / maxLen;
}

/**
 * Deduplicates property listings by finding similar listings.
 * Runs asynchronously to allow AI agent duplicate checks on candidate pairs.
 */
export async function deduplicateProperties(properties: CleanedProperty[]): Promise<CleanedProperty[]> {
  const cleaned = [...properties];
  let groupCounter = 1;
  const groupsMap: Record<string, string> = {}; // maps property_id to group_id

  for (let i = 0; i < cleaned.length; i++) {
    const propA = cleaned[i];
    if (propA.is_incomplete) continue;

    for (let j = i + 1; j < cleaned.length; j++) {
      const propB = cleaned[j];
      if (propB.is_incomplete) continue;

      // 1. Core filters: Must be in same city, locality, transaction type, and BHK
      if (
        propA.city.toLowerCase() !== propB.city.toLowerCase() ||
        propA.locality.toLowerCase() !== propB.locality.toLowerCase() ||
        propA.transaction_type !== propB.transaction_type ||
        propA.bhk !== propB.bhk
      ) {
        continue;
      }

      // 2. Metric boundaries: Price within 5% variance, Area within 8% variance
      const priceDiff = Math.abs(propA.price - propB.price) / Math.min(propA.price, propB.price);
      const areaDiff = Math.abs(propA.area_sqft - propB.area_sqft) / Math.min(propA.area_sqft, propB.area_sqft);

      if (priceDiff > 0.05 || areaDiff > 0.08) {
        continue;
      }

      // 3. String matcher: check if titles are similar or project name matches
      const titleSim = getStringSimilarity(propA.title, propB.title);
      const projectMatch = 
        propA.project_name.toLowerCase() === propB.project_name.toLowerCase() && 
        propA.project_name.length > 0;

      if (titleSim > 0.6 || projectMatch) {
        let groupId = groupsMap[propA.property_id] || groupsMap[propB.property_id];

        if (!groupId) {
          groupId = `DUP_${groupCounter.toString().padStart(3, '0')}`;
          groupCounter++;
        }

        groupsMap[propA.property_id] = groupId;
        groupsMap[propB.property_id] = groupId;
      }
    }
  }

  // Map the groups back to the cleaned property objects
  return cleaned.map(prop => {
    if (groupsMap[prop.property_id]) {
      return {
        ...prop,
        duplicate_group_id: groupsMap[prop.property_id]
      };
    }
    return prop;
  });
}

