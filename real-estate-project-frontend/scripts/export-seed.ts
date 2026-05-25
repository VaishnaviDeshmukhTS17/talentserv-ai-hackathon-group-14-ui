/**
 * Export mockData.ts into JSON files for MongoDB seeding.
 * Run: npx tsx scripts/export-seed.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  rawProperties,
  buildersData,
  localitySentimentData,
  localityTrendsData,
  pointsOfInterest,
} from "../src/assets/mockData";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedDir = join(__dirname, "../../real-estate-project-backend/seed");

mkdirSync(seedDir, { recursive: true });

writeFileSync(join(seedDir, "properties.json"), JSON.stringify(rawProperties, null, 2));
writeFileSync(
  join(seedDir, "builders.json"),
  JSON.stringify(Object.values(buildersData), null, 2),
);
writeFileSync(
  join(seedDir, "locality_sentiment.json"),
  JSON.stringify(Object.values(localitySentimentData), null, 2),
);
writeFileSync(
  join(seedDir, "locality_trends.json"),
  JSON.stringify(Object.values(localityTrendsData), null, 2),
);
writeFileSync(join(seedDir, "points_of_interest.json"), JSON.stringify(pointsOfInterest, null, 2));

console.log(`Exported seed JSON to ${seedDir}`);
console.log(`  properties: ${rawProperties.length}`);
console.log(`  builders: ${Object.keys(buildersData).length}`);
console.log(`  sentiment localities: ${Object.keys(localitySentimentData).length}`);
console.log(`  trend localities: ${Object.keys(localityTrendsData).length}`);
console.log(`  POIs: ${pointsOfInterest.length}`);
