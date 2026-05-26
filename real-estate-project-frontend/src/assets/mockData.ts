export interface VastuDetails {
  facing_direction: 'North' | 'East' | 'South' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  kitchen_direction: 'North-East' | 'North-West' | 'South-East' | 'South-West' | 'North' | 'East' | 'South' | 'West';
  bedroom_direction: 'North-East' | 'North-West' | 'South-East' | 'South-West' | 'North' | 'East' | 'South' | 'West';
  pooja_direction?: 'North-East' | 'North-West' | 'South-East' | 'South-West' | 'North' | 'East' | 'South' | 'West';
  layout_shape: 'Square' | 'Rectangular' | 'Irregular';
}

export interface RawProperty {
  property_id: string;
  title: string;
  source: string;
  source_url: string;
  city: string;
  locality: string;
  property_type: string;
  transaction_type: 'Buy' | 'Rent';
  bhk: string | number;
  price: string | number;
  area_sqft: string | number;
  status: string;
  builder_or_owner: string;
  project_name: string;
  latitude?: number;
  longitude?: number;
  vastu_facing?: string;
  vastu_details?: Partial<VastuDetails>;
}

export interface CleanedProperty extends Omit<RawProperty, 'price' | 'area_sqft' | 'bhk'> {
  price: number;
  area_sqft: number;
  bhk: number;
  price_per_sqft: number;
  is_incomplete: boolean;
  image_url?: string;
  duplicate_group_id?: string;
  match_score?: number;
  recommendation_explanation?: string;
  investment_score?: number;
  investment_grade?: string;
  location_scores?: {
    connectivity: number;
    schools: number;
    lifestyle: number;
    infrastructure: number;
  };
  vastu_score?: number;
  vastu_compliant_level?: 'High' | 'Moderate' | 'Remedy Recommended';
  vastu_details?: VastuDetails;
}

export interface PointOfInterest {
  poi_id: string;
  name: string;
  type: 'commute' | 'school' | 'lifestyle' | 'infrastructure';
  latitude: number;
  longitude: number;
  locality: string;
}

export const pointsOfInterest: PointOfInterest[] = [
  // Hinjewadi POIs
  { poi_id: "POI_HJ_001", name: "Hinjewadi Phase 1 Metro Station", type: "commute", latitude: 18.5932, longitude: 73.7420, locality: "Hinjewadi" },
  { poi_id: "POI_HJ_002", name: "Rajiv Gandhi Infotech Park Phase 1", type: "commute", latitude: 18.5910, longitude: 73.7380, locality: "Hinjewadi" },
  { poi_id: "POI_HJ_003", name: "Blue Ridge Public School", type: "school", latitude: 18.5862, longitude: 73.7348, locality: "Hinjewadi" },
  { poi_id: "POI_HJ_004", name: "Grand Highstreet Mall", type: "lifestyle", latitude: 18.5902, longitude: 73.7456, locality: "Hinjewadi" },
  { poi_id: "POI_HJ_005", name: "Ruby Hall Clinic Hinjewadi", type: "infrastructure", latitude: 18.5954, longitude: 73.7402, locality: "Hinjewadi" },

  // Wakad POIs
  { poi_id: "POI_WK_001", name: "Wakad Chowk Metro Station", type: "commute", latitude: 18.5991, longitude: 73.7712, locality: "Wakad" },
  { poi_id: "POI_WK_002", name: "EuroSchool Wakad", type: "school", latitude: 18.5942, longitude: 73.7650, locality: "Wakad" },
  { poi_id: "POI_WK_003", name: "Phoenix Marketcity Wakad", type: "lifestyle", latitude: 18.6002, longitude: 73.7788, locality: "Wakad" },
  { poi_id: "POI_WK_004", name: "Lifepoint Multispecialty Hospital", type: "infrastructure", latitude: 18.5972, longitude: 73.7690, locality: "Wakad" },

  // Baner POIs
  { poi_id: "POI_BN_001", name: "Balewadi High Street", type: "lifestyle", latitude: 18.5582, longitude: 73.7745, locality: "Baner" },
  { poi_id: "POI_BN_002", name: "The Orchid School Baner", type: "school", latitude: 18.5620, longitude: 73.7820, locality: "Baner" },
  { poi_id: "POI_BN_003", name: "Manipal Hospital Baner", type: "infrastructure", latitude: 18.5545, longitude: 73.7801, locality: "Baner" },

  // Kharadi POIs
  { poi_id: "POI_KH_001", name: "EON Free Zone IT Park", type: "commute", latitude: 18.5489, longitude: 73.9490, locality: "Kharadi" },
  { poi_id: "POI_KH_002", name: "World Trade Center Kharadi", type: "commute", latitude: 18.5460, longitude: 73.9430, locality: "Kharadi" },
  { poi_id: "POI_KH_003", name: "Radisson Blu Kharadi", type: "lifestyle", latitude: 18.5430, longitude: 73.9312, locality: "Kharadi" },
  { poi_id: "POI_KH_004", name: "Columbia Asia Hospital Kharadi", type: "infrastructure", latitude: 18.5501, longitude: 73.9388, locality: "Kharadi" },

  // Whitefield POIs
  { poi_id: "POI_WF_001", name: "ITPL Metro Station", type: "commute", latitude: 12.9840, longitude: 77.7345, locality: "Whitefield" },
  { poi_id: "POI_WF_002", name: "International Tech Park Bangalore (ITPL)", type: "commute", latitude: 12.9868, longitude: 77.7378, locality: "Whitefield" },
  { poi_id: "POI_WF_003", name: "Vydehi Institute of Medical Sciences", type: "infrastructure", latitude: 12.9754, longitude: 77.7290, locality: "Whitefield" },
  { poi_id: "POI_WF_004", name: "The Forum Value Mall", type: "lifestyle", latitude: 12.9592, longitude: 77.7470, locality: "Whitefield" },

  // Indiranagar POIs
  { poi_id: "POI_IN_001", name: "Indiranagar Metro Station", type: "commute", latitude: 12.9783, longitude: 77.6405, locality: "Indiranagar" },
  { poi_id: "POI_IN_002", name: "100 Feet Road Food & Brewery Hub", type: "lifestyle", latitude: 12.9720, longitude: 77.6415, locality: "Indiranagar" },
  { poi_id: "POI_IN_003", name: "Chinmaya Mission Hospital (CMH)", type: "infrastructure", latitude: 12.9802, longitude: 77.6380, locality: "Indiranagar" }
];

const propertyCoordinates: Record<string, { latitude: number; longitude: number }> = {
  // Hinjewadi Properties
  "PROP001": { latitude: 18.5913, longitude: 73.7389 },
  "PROP002": { latitude: 18.5910, longitude: 73.7382 },
  "PROP004": { latitude: 18.5878, longitude: 73.7360 },
  "PROP006": { latitude: 18.5925, longitude: 73.7410 },
  "PROP017": { latitude: 18.5935, longitude: 73.7435 },
  "PROP029": { latitude: 18.5890, longitude: 73.7350 },
  
  // Wakad Properties
  "PROP003": { latitude: 18.5987, longitude: 73.7707 },
  "PROP007": { latitude: 18.5960, longitude: 73.7655 },
  "PROP018": { latitude: 18.5975, longitude: 73.7699 },
  "PROP030": { latitude: 18.6010, longitude: 73.7740 },
  
  // Baner Properties
  "PROP005": { latitude: 18.5597, longitude: 73.7799 },
  "PROP019": { latitude: 18.5580, longitude: 73.7750 },
  "PROP031": { latitude: 18.5615, longitude: 73.7840 },
  "PROP032": { latitude: 18.5630, longitude: 73.7810 },

  // Kharadi Properties
  "PROP009": { latitude: 18.5447, longitude: 73.9388 },
  "PROP010": { latitude: 18.5470, longitude: 73.9450 },
  "PROP023": { latitude: 18.5435, longitude: 73.9320 },
  "PROP024": { latitude: 18.5452, longitude: 73.9395 },
  "PROP035": { latitude: 18.5495, longitude: 73.9465 },
  "PROP036": { latitude: 18.5482, longitude: 73.9480 },

  // Whitefield Properties
  "PROP101": { latitude: 12.9698, longitude: 77.7499 },
  "PROP102": { latitude: 12.9690, longitude: 77.7490 },
  "PROP104": { latitude: 12.9730, longitude: 77.7405 },
  "PROP105": { latitude: 12.9785, longitude: 77.7390 },
  "PROP106": { latitude: 12.9810, longitude: 77.7320 },

  // Indiranagar Properties
  "PROP103": { latitude: 12.9784, longitude: 77.6408 },

  // Koramangala Properties
  "PROP107": { latitude: 12.9279, longitude: 77.6271 },
  
  // Hadapsar
  "PROP008": { latitude: 18.5089, longitude: 73.9259 },
  "PROP021": { latitude: 18.5075, longitude: 73.9210 },
  "PROP022": { latitude: 18.5095, longitude: 73.9295 },
  "PROP033": { latitude: 18.5110, longitude: 73.9230 },
  "PROP034": { latitude: 18.5130, longitude: 73.9270 },

  // Viman Nagar
  "PROP011": { latitude: 18.5679, longitude: 73.9143 },
  "PROP012": { latitude: 18.5695, longitude: 73.9190 },
  "PROP025": { latitude: 18.5665, longitude: 73.9110 },
  "PROP026": { latitude: 18.5710, longitude: 73.9170 },
  "PROP037": { latitude: 18.5650, longitude: 73.9125 },
  "PROP038": { latitude: 18.5685, longitude: 73.9160 },

  // Kothrud
  "PROP013": { latitude: 18.5074, longitude: 73.8077 },
  "PROP014": { latitude: 18.5090, longitude: 73.8115 },
  "PROP027": { latitude: 18.5055, longitude: 73.8040 },
  "PROP028": { latitude: 18.5080, longitude: 73.8095 },
  "PROP039": { latitude: 18.5065, longitude: 73.8130 },

  // Kalyani Nagar
  "PROP015": { latitude: 18.5463, longitude: 73.9033 },
  "PROP016": { latitude: 18.5475, longitude: 73.9065 },
  "PROP020": { latitude: 18.5450, longitude: 73.9010 },

  // New Properties coordinates
  "PROP043": { latitude: 18.5490, longitude: 73.9055 },
  "PROP044": { latitude: 18.5905, longitude: 73.7375 },
  "PROP045": { latitude: 12.9745, longitude: 77.7420 },
  "PROP108": { latitude: 12.9805, longitude: 77.7360 },
  "PROP046": { latitude: 18.5465, longitude: 73.9405 },
  "PROP047": { latitude: 18.5605, longitude: 73.7808 },
  "PROP048": { latitude: 18.5690, longitude: 73.9150 }
};

export interface BuilderReputation {
  builder_name: string;
  reputation_score: number; // 0 to 5
  completion_track_record: string;
  review_summary: string;
  known_risks: string[];
}

export interface LocalitySentiment {
  locality_name: string;
  sentiment_score: number; // 0 to 1
  positive_themes: string[];
  negative_themes: string[];
  comment_count: number;
  sentiment_summary: string;
}

export interface LocalityTrend {
  locality_name: string;
  trend_score: number; // 0 to 100
  trend_direction: 'up' | 'down' | 'flat';
  trend_summary: string;
  quarterly_price_history: {
    quarter: string;
    avg_price_per_sqft: number;
  }[];
}

// RAW PROPERTIES WITH DIRTY METRICS FOR THE NORMALIZATION PIPELINE
export const rawProperties: RawProperty[] = [
  // Hinjewadi Pune Listings
  {
    property_id: "PROP001",
    title: "Stunning 2 BHK Apartment in Hinjewadi",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop001",
    city: "Pune",
    locality: "Hinjawadi", // intentionally misspelled to test normalizer
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK Flat",
    price: "Rs 78 L",
    area_sqft: "850 sq.ft.",
    status: "Ready",
    builder_or_owner: "ABC Developers",
    project_name: "Green Heights",
    vastu_facing: "East",
    vastu_details: {
      facing_direction: "East",
      kitchen_direction: "South-East",
      bedroom_direction: "South-West",
      pooja_direction: "North-East",
      layout_shape: "Rectangular"
    }
  },
  {
    property_id: "PROP002",
    title: "Brand New 2BHK Flat Hinjewadi Phase 1",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop002",
    city: "Pune",
    locality: "Hinjewadi",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK",
    price: "78 Lac",
    area_sqft: "855 sqft",
    status: "Ready to Move",
    builder_or_owner: "ABC Developers",
    project_name: "Green Heights", // DUPLICATE of PROP001 (same builder, project, location, price, slightly different name/area)
    vastu_facing: "East",
    vastu_details: {
      facing_direction: "East",
      kitchen_direction: "South-East",
      bedroom_direction: "South-West",
      pooja_direction: "North-East",
      layout_shape: "Rectangular"
    }
  },
  {
    property_id: "PROP003",
    title: "Premium 3 BHK in Wakad - Prime Location",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop003",
    city: "Pune",
    locality: "Wakad",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Flat",
    price: "1.15 Cr",
    area_sqft: "1400 sq.ft.",
    status: "Under Construction",
    builder_or_owner: "XYZ Builders",
    project_name: "Elanza Towers",
    vastu_facing: "North-East",
    vastu_details: {
      facing_direction: "North-East",
      kitchen_direction: "North-West",
      bedroom_direction: "South-West",
      pooja_direction: "North-East",
      layout_shape: "Square"
    }
  },
  {
    property_id: "PROP004",
    title: "Cozy 1 BHK for Rent in Hinjewadi",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop004",
    city: "Pune",
    locality: "Hinjawadi",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: 1,
    price: "22,000 / month",
    area_sqft: "550 sq ft",
    status: "Ready",
    builder_or_owner: "Rohan Builders",
    project_name: "Rohan Heights",
    vastu_facing: "South",
    vastu_details: {
      facing_direction: "South",
      kitchen_direction: "North-East",
      bedroom_direction: "North-West",
      pooja_direction: "West",
      layout_shape: "Irregular"
    }
  },
  {
    property_id: "PROP005",
    title: "Luxurious Villa in Baner",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop005",
    city: "Pune",
    locality: "Baner",
    property_type: "Villa",
    transaction_type: "Buy",
    bhk: "4 BHK Villa",
    price: "3.5 Crore",
    area_sqft: "3200 sq.ft.",
    status: "Ready to Move",
    builder_or_owner: "Goyal Properties",
    project_name: "Goyal Meadows",
    vastu_facing: "North",
    vastu_details: {
      facing_direction: "North",
      kitchen_direction: "South-East",
      bedroom_direction: "South-West",
      pooja_direction: "North-East",
      layout_shape: "Square"
    }
  },
  {
    property_id: "PROP006",
    title: "Spacious 3 BHK near IT Park Hinjewadi",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop006",
    city: "Pune",
    locality: "Hinjewadi",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Apartment",
    price: "95 Lac",
    area_sqft: "1150 sq.ft.",
    status: "Under Construction",
    builder_or_owner: "ABC Developers",
    project_name: "Green Heights"
  },
  {
    property_id: "PROP007",
    title: "Budget 2 BHK Apartment in Wakad",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop007",
    city: "Pune",
    locality: "Wakad",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK",
    price: "72 L",
    area_sqft: "920 sqft",
    status: "Ready",
    builder_or_owner: "Pride Group",
    project_name: "Pride Purple"
  },
  // Bangalore Listings
  {
    property_id: "PROP101",
    title: "Spacious 2 BHK near Whitefield Metro",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop101",
    city: "Bangalore",
    locality: "Whitefield",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2",
    price: "85 Lakh",
    area_sqft: "1050 sq ft",
    status: "Ready to Move",
    builder_or_owner: "Sobha Developers",
    project_name: "Sobha Dream Acres"
  },
  {
    property_id: "PROP102",
    title: "2 BHK Flat near Sobha Acres Whitefield",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop102",
    city: "Bangalore",
    locality: "Whitefield",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK",
    price: "86 L",
    area_sqft: "1060",
    status: "Ready",
    builder_or_owner: "Sobha Developers",
    project_name: "Sobha Dream Acres" // DUPLICATE of PROP101
  },
  {
    property_id: "PROP103",
    title: "Stunning 3 BHK Rent in Indiranagar",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop103",
    city: "Bangalore",
    locality: "Indiranagar",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "3 BHK Flat",
    price: "60k / mo",
    area_sqft: "1600 sq ft",
    status: "Ready",
    builder_or_owner: "Private Owner",
    project_name: "Standalone Building"
  },
  {
    property_id: "PROP104",
    title: "Affordable 2 BHK Flat for Rent in Whitefield",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop104",
    city: "Bangalore",
    locality: "Whitefield",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Apartment",
    price: "42,000",
    area_sqft: "980",
    status: "Ready to Move",
    builder_or_owner: "Prestige Group",
    project_name: "Prestige Shantiniketan"
  },
  {
    property_id: "PROP105",
    title: "3 BHK Highrise Apartment in Whitefield",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop105",
    city: "Bangalore",
    locality: "Whitefield",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK",
    price: "1.45 Cr",
    area_sqft: "1650 sq ft",
    status: "Under Construction",
    builder_or_owner: "Prestige Group",
    project_name: "Prestige Lakeside Habitat"
  },
  // Incomplete record (to test validator/cleaner flagging)
  {
    property_id: "PROP106",
    title: "Incomplete Listing - Missing Price & Area",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop106",
    city: "Bangalore",
    locality: "Whitefield",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK",
    price: "",
    area_sqft: "",
    status: "Under Construction",
    builder_or_owner: "Unknown Builder",
    project_name: "Mystery Residency"
  },
  {
    property_id: "PROP008",
    title: "Luxury 2 BHK Apartment in Hadapsar",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop008",
    city: "Pune",
    locality: "Hadapsar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK Flat",
    price: "Rs 82 L",
    area_sqft: "1050 sq.ft.",
    status: "Ready to Move",
    builder_or_owner: "XYZ Builders",
    project_name: "Amanora Park Town"
  },
  {
    property_id: "PROP107",
    title: "Premium 3 BHK Flat in Koramangala",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop107",
    city: "Bangalore",
    locality: "Koramangala",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK",
    price: "1.65 Cr",
    area_sqft: "1680 sqft",
    status: "Ready to Move",
    builder_or_owner: "Prestige Group",
    project_name: "Prestige Oasis"
  },
  {
    property_id: "PROP009",
    title: "Vibrant 2 BHK Apartment in Kharadi",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop009",
    city: "Pune",
    locality: "Kharadi",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK",
    price: "Rs 88 L",
    area_sqft: "1020 sq.ft.",
    status: "Ready",
    builder_or_owner: "Godrej Properties",
    project_name: "Godrej Woodlands"
  },
  {
    property_id: "PROP010",
    title: "Highrise 3 BHK Apartment in Kharadi",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop010",
    city: "Pune",
    locality: "Kharadi",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK",
    price: "1.15 Cr",
    area_sqft: "1380 sqft",
    status: "Under Construction",
    builder_or_owner: "VTP Realty",
    project_name: "VTP Cygnus"
  },
  {
    property_id: "PROP011",
    title: "Premium 2 BHK Flat for Rent in Viman Nagar",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop011",
    city: "Pune",
    locality: "Viman Nagar",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Apartment",
    price: "38k / mo",
    area_sqft: "1100 sq ft",
    status: "Ready",
    builder_or_owner: "Kolte Patil",
    project_name: "Life Republic - Elite"
  },
  {
    property_id: "PROP012",
    title: "Luxury 3 BHK Residence in Viman Nagar",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop012",
    city: "Pune",
    locality: "Viman Nagar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Apartment",
    price: "1.45 Crore",
    area_sqft: "1550 sqft",
    status: "Ready to Move",
    builder_or_owner: "Kumar Properties",
    project_name: "Kumar Primavera"
  },
  {
    property_id: "PROP013",
    title: "Elite 3 BHK Flat in Kothrud",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop013",
    city: "Pune",
    locality: "Kothrud",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Flat",
    price: "1.85 Cr",
    area_sqft: "1600 sq.ft.",
    status: "Ready to Move",
    builder_or_owner: "Godrej Properties",
    project_name: "Godrej Hillside"
  },
  {
    property_id: "PROP014",
    title: "Cozy 2 BHK Rent in Kothrud",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop014",
    city: "Pune",
    locality: "Kothrud",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: 2,
    price: "35,000 / month",
    area_sqft: "980 sq ft",
    status: "Ready",
    builder_or_owner: "Rohan Builders",
    project_name: "Rohan Madhuban"
  },
  {
    property_id: "PROP015",
    title: "Spacious 3 BHK in Kalyani Nagar",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop015",
    city: "Pune",
    locality: "Kalyani Nagar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Apartment",
    price: "2.10 Cr",
    area_sqft: "1850",
    status: "Ready to Move",
    builder_or_owner: "Kumar Properties",
    project_name: "Kumar Kruti"
  },
  {
    property_id: "PROP016",
    title: "Modern 2 BHK Rental in Kalyani Nagar",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop016",
    city: "Pune",
    locality: "Kalyani Nagar",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Flat",
    price: "42,000 / mo",
    area_sqft: "1050 sq ft",
    status: "Ready",
    builder_or_owner: "VTP Realty",
    project_name: "VTP Velvet"
  },
  {
    property_id: "PROP017",
    title: "Luxury 2 BHK Rent in Hinjewadi",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop017",
    city: "Pune",
    locality: "Hinjewadi",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Flat",
    price: "25,000 / mo",
    area_sqft: "900 sqft",
    status: "Ready",
    builder_or_owner: "Gera Developments",
    project_name: "Gera Joy"
  },
  {
    property_id: "PROP018",
    title: "Premium 3 BHK in Wakad Prime",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop018",
    city: "Pune",
    locality: "Wakad",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK",
    price: "1.10 Cr",
    area_sqft: "1350 sqft",
    status: "Ready to Move",
    builder_or_owner: "Gera Developments",
    project_name: "Gera Imperium"
  },
  {
    property_id: "PROP019",
    title: "Exclusive 3 BHK Villa in Baner",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop019",
    city: "Pune",
    locality: "Baner",
    property_type: "Villa",
    transaction_type: "Buy",
    bhk: "3 BHK Villa",
    price: "1.75 Crore",
    area_sqft: "1600 sqft",
    status: "Under Construction",
    builder_or_owner: "Kasturi Builders",
    project_name: "Kasturi Apostrophe"
  },
  {
    property_id: "PROP020",
    title: "Ultra Luxury 4 BHK in Kalyani Nagar",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop020",
    city: "Pune",
    locality: "Kalyani Nagar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "4 BHK Flat",
    price: "3.80 Cr",
    area_sqft: "2800 sq ft",
    status: "Ready to Move",
    builder_or_owner: "Kasturi Builders",
    project_name: "Kasturi Legacy"
  },
  {
    property_id: "PROP021",
    title: "Modern 2 BHK Apartment in Hadapsar",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop021",
    city: "Pune",
    locality: "Hadapsar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK",
    price: "86 Lakh",
    area_sqft: "1020 sq ft",
    status: "Ready to Move",
    builder_or_owner: "Shapoorji Pallonji",
    project_name: "SP Joyville"
  },
  {
    property_id: "PROP022",
    title: "Premium 3 BHK Highrise in Hadapsar",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop022",
    city: "Pune",
    locality: "Hadapsar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Flat",
    price: "1.22 Cr",
    area_sqft: "1320 sqft",
    status: "Under Construction",
    builder_or_owner: "Shapoorji Pallonji",
    project_name: "SP Joyville Phase 2"
  },
  {
    property_id: "PROP023",
    title: "Cozy 2 BHK for Rent in Kharadi",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop023",
    city: "Pune",
    locality: "Kharadi",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Flat",
    price: "28,000 / month",
    area_sqft: "1000 sq ft",
    status: "Ready",
    builder_or_owner: "Goyal Properties",
    project_name: "Goyal Myra"
  },
  {
    property_id: "PROP024",
    title: "Family 3 BHK Flat in Kharadi Prime",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop024",
    city: "Pune",
    locality: "Kharadi",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Apartment",
    price: "1.25 Crore",
    area_sqft: "1450 sqft",
    status: "Ready to Move",
    builder_or_owner: "Goyal Properties",
    project_name: "Goyal Myra"
  },
  {
    property_id: "PROP025",
    title: "Highrise 2 BHK Flat in Viman Nagar",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop025",
    city: "Pune",
    locality: "Viman Nagar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK",
    price: "1.15 Cr",
    area_sqft: "1120 sq ft",
    status: "Ready to Move",
    builder_or_owner: "L&T Realty",
    project_name: "L&T Emerald"
  },
  {
    property_id: "PROP026",
    title: "Spacious 3 BHK in Viman Nagar",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop026",
    city: "Pune",
    locality: "Viman Nagar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Flat",
    price: "1.85 Cr",
    area_sqft: "1650 sq ft",
    status: "Under Construction",
    builder_or_owner: "L&T Realty",
    project_name: "L&T Crescent"
  },
  {
    property_id: "PROP027",
    title: "Elite 2 BHK Rent in Kothrud",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop027",
    city: "Pune",
    locality: "Kothrud",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Apartment",
    price: "32,000 / mo",
    area_sqft: "950 sq ft",
    status: "Ready",
    builder_or_owner: "Kumar Properties",
    project_name: "Kumar Karisma"
  },
  {
    property_id: "PROP028",
    title: "Premium 3 BHK Flat in Kothrud Suburb",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop028",
    city: "Pune",
    locality: "Kothrud",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Flat",
    price: "1.65 Crore",
    area_sqft: "1420 sqft",
    status: "Ready to Move",
    builder_or_owner: "Kolte Patil",
    project_name: "Kolte Patil Heights"
  },
  {
    property_id: "PROP029",
    title: "Budget Friendly 2 BHK in Hinjewadi",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop029",
    city: "Pune",
    locality: "Hinjewadi",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK Flat",
    price: "68 Lac",
    area_sqft: "880 sqft",
    status: "Under Construction",
    builder_or_owner: "VTP Realty",
    project_name: "VTP Blue Waters"
  },
  {
    property_id: "PROP030",
    title: "Spacious 3 BHK Apartment in Wakad",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop030",
    city: "Pune",
    locality: "Wakad",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK",
    price: "95 Lakhs",
    area_sqft: "1250 sqft",
    status: "Ready to Move",
    builder_or_owner: "Pride Group",
    project_name: "Pride World City"
  },
  {
    property_id: "PROP031",
    title: "Lively 2 BHK Apartment Rent in Baner",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop031",
    city: "Pune",
    locality: "Baner",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Flat",
    price: "30,000 / month",
    area_sqft: "1100 sq ft",
    status: "Ready",
    builder_or_owner: "Rohan Builders",
    project_name: "Rohan Leher"
  },
  {
    property_id: "PROP032",
    title: "Luxury 3 BHK Flat in Baner Prime",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop032",
    city: "Pune",
    locality: "Baner",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Flat",
    price: "1.95 Cr",
    area_sqft: "1750 sqft",
    status: "Ready to Move",
    builder_or_owner: "Kolte Patil",
    project_name: "Kolte Patil 24K"
  },
  {
    property_id: "PROP033",
    title: "Affordable 2 BHK in Hadapsar area",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop033",
    city: "Pune",
    locality: "Hadapsar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK Flat",
    price: "75 Lac",
    area_sqft: "980 sqft",
    status: "Ready to Move",
    builder_or_owner: "Kumar Properties",
    project_name: "Kumar Piccadilly"
  },
  {
    property_id: "PROP034",
    title: "Spacious 3 BHK Rent in Hadapsar Town",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop034",
    city: "Pune",
    locality: "Hadapsar",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "3 BHK Apartment",
    price: "35,000 / mo",
    area_sqft: "1400 sqft",
    status: "Ready",
    builder_or_owner: "Godrej Properties",
    project_name: "Godrej Horizon"
  },
  {
    property_id: "PROP035",
    title: "Premium 2 BHK Flat in Kharadi Hub",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop035",
    city: "Pune",
    locality: "Kharadi",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK Flat",
    price: "80 Lakh",
    area_sqft: "950 sqft",
    status: "Under Construction",
    builder_or_owner: "Lodha Group",
    project_name: "Lodha Belmondo"
  },
  {
    property_id: "PROP036",
    title: "Elegant 3 BHK Apartment in Kharadi",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop036",
    city: "Pune",
    locality: "Kharadi",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK",
    price: "1.35 Cr",
    area_sqft: "1400 sqft",
    status: "Ready to Move",
    builder_or_owner: "Lodha Group",
    project_name: "Lodha Panache"
  },
  {
    property_id: "PROP037",
    title: "Modern 2 BHK Rent in Viman Nagar",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop037",
    city: "Pune",
    locality: "Viman Nagar",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Flat",
    price: "30k / month",
    area_sqft: "1000 sq ft",
    status: "Ready",
    builder_or_owner: "Pride Group",
    project_name: "Pride Aashiyana"
  },
  {
    property_id: "PROP038",
    title: "High-End 3 BHK in Viman Nagar",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop038",
    city: "Pune",
    locality: "Viman Nagar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Apartment",
    price: "1.90 Crore",
    area_sqft: "1580 sq ft",
    status: "Ready to Move",
    builder_or_owner: "Shapoorji Pallonji",
    project_name: "SP Residency"
  },
  {
    property_id: "PROP039",
    title: "Traditional 2 BHK Flat in Kothrud",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop039",
    city: "Pune",
    locality: "Kothrud",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "2 BHK Flat",
    price: "1.28 Cr",
    area_sqft: "1020 sq ft",
    status: "Ready to Move",
    builder_or_owner: "Kumar Properties",
    project_name: "Kumar Pinnacle"
  },
  {
    property_id: "PROP040",
    title: "Premium 3 BHK Rent in Kothrud",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop040",
    city: "Pune",
    locality: "Kothrud",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "3 BHK Apartment",
    price: "45,000 / mo",
    area_sqft: "1380 sq ft",
    status: "Ready",
    builder_or_owner: "Gera Developments",
    project_name: "Gera Riverwood"
  },
  {
    property_id: "PROP041",
    title: "Spacious 2 BHK Rent in Kalyani Nagar",
    source: "NoBroker",
    source_url: "https://www.nobroker.in/prop041",
    city: "Pune",
    locality: "Kalyani Nagar",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Flat",
    price: "40k / mo",
    area_sqft: "1150 sqft",
    status: "Ready",
    builder_or_owner: "Kumar Properties",
    project_name: "Kumar Kruti"
  },
  {
    property_id: "PROP042",
    title: "Prime 3 BHK Residence in Kalyani Nagar",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop042",
    city: "Pune",
    locality: "Kalyani Nagar",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Apartment",
    price: "2.30 Crore",
    area_sqft: "1700 sqft",
    status: "Ready to Move",
    builder_or_owner: "Godrej Properties",
    project_name: "Godrej Sherwood"
  },
  {
    property_id: "PROP043",
    title: "Super Posh 4 BHK Penthouse in Kalyani Nagar",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop043",
    city: "Pune",
    locality: "Kalyani Nagar",
    property_type: "Penthouse",
    transaction_type: "Buy",
    bhk: "4 BHK",
    price: "4.25 Crore",
    area_sqft: "3200 sqft",
    status: "Ready",
    builder_or_owner: "Tata Housing",
    project_name: "Tata Primanti"
  },
  {
    property_id: "PROP044",
    title: "Spacious 3 BHK Eco-Apartment Hinjewadi",
    source: "99acres",
    source_url: "https://www.99acres.com/prop044",
    city: "Pune",
    locality: "Hinjewadi",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Flat",
    price: "1.20 Crore",
    area_sqft: "1450 sqft",
    status: "Under Construction",
    builder_or_owner: "Mahindra Lifespaces",
    project_name: "Mahindra Antheia"
  },
  {
    property_id: "PROP045",
    title: "Luxury 3 BHK Techside Suite Whitefield",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop045",
    city: "Bangalore",
    locality: "Whitefield",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK",
    price: "1.65 Crore",
    area_sqft: "1600 sqft",
    status: "Ready to Move",
    builder_or_owner: "Puravankara Limited",
    project_name: "Purva Fountain Square"
  },
  {
    property_id: "PROP108",
    title: "Elite 4 BHK Villa at Brigade Parkside",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop108",
    city: "Bangalore",
    locality: "Whitefield",
    property_type: "Villa",
    transaction_type: "Buy",
    bhk: "4 BHK",
    price: "3.80 Crore",
    area_sqft: "3500 sqft",
    status: "Ready to Move",
    builder_or_owner: "Brigade Group",
    project_name: "Brigade Parkside"
  },
  {
    property_id: "PROP046",
    title: "Modern 2 BHK Cozy Suite in Kharadi",
    source: "99acres",
    source_url: "https://www.99acres.com/prop046",
    city: "Pune",
    locality: "Kharadi",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "2 BHK Flat",
    price: "35k / mo",
    area_sqft: "1050 sqft",
    status: "Ready",
    builder_or_owner: "VTP Realty",
    project_name: "VTP Cygnus"
  },
  {
    property_id: "PROP047",
    title: "Pristine 3 BHK Premium Heights in Baner",
    source: "Housing.com",
    source_url: "https://www.housing.com/prop047",
    city: "Pune",
    locality: "Baner",
    property_type: "Apartment",
    transaction_type: "Buy",
    bhk: "3 BHK Apartment",
    price: "2.10 Crore",
    area_sqft: "1850 sqft",
    status: "Ready to Move",
    builder_or_owner: "Kasturi Builders",
    project_name: "Kasturi Apostrophe"
  },
  {
    property_id: "PROP048",
    title: "Tata Plaza 3 BHK Executive Flat in Viman Nagar",
    source: "MagicBricks",
    source_url: "https://www.magicbricks.com/prop048",
    city: "Pune",
    locality: "Viman Nagar",
    property_type: "Apartment",
    transaction_type: "Rent",
    bhk: "3 BHK Flat",
    price: "55k / mo",
    area_sqft: "1550 sqft",
    status: "Ready to Move",
    builder_or_owner: "Tata Housing",
    project_name: "Tata Plaza Flats"
  }
];

export const buildersData: Record<string, BuilderReputation> = {
  "ABC Developers": {
    builder_name: "ABC Developers",
    reputation_score: 4.4,
    completion_track_record: "94% on-time delivery across 12 projects",
    review_summary: "Widely praised for solid layout designs and robust RCC frame structures. Minor complaints regarding delayed club-house handovers.",
    known_risks: ["Strict maintenance collection policy", "Slight delays in amenity certifications"]
  },
  "XYZ Builders": {
    builder_name: "XYZ Builders",
    reputation_score: 3.8,
    completion_track_record: "80% projects delivered on time; past delays in 2 massive projects",
    review_summary: "Highly cost-effective luxury properties. However, customer service experiences can be inconsistent during final registry.",
    known_risks: ["High occupancy certificate delays in Pune projects", "Stiff parking charges"]
  },
  "Sobha Developers": {
    builder_name: "Sobha Developers",
    reputation_score: 4.8,
    completion_track_record: "98% on-time delivery across India",
    review_summary: "Widely considered the gold standard for internal construction quality, tiling, and premium paint finishes.",
    known_risks: ["Command a 15-20% price premium over local market rates"]
  },
  "Prestige Group": {
    builder_name: "Prestige Group",
    reputation_score: 4.7,
    completion_track_record: "96% on-time delivery on large townships",
    review_summary: "Exceptional landscaping, wide open spaces, and premium clubhouse amenities. High security standards.",
    known_risks: ["Very large societies can feel crowded", "High monthly maintenance fees"]
  },
  "Rohan Builders": {
    builder_name: "Rohan Builders",
    reputation_score: 4.2,
    completion_track_record: "91% on-time delivery",
    review_summary: "Highly acclaimed for 'PLUS' homes (Perfect ventilation, Lively light, Utmost privacy, Smart space design). Excellent customer service.",
    known_risks: ["Higher loading factors on built-up area"]
  },
  "Pride Group": {
    builder_name: "Pride Group",
    reputation_score: 4.0,
    completion_track_record: "88% on-time delivery",
    review_summary: "Affordable housing options in emerging markets. Adequate basic amenities.",
    known_risks: ["Moderate quality of internal paint/fittings"]
  },
  "Godrej Properties": {
    builder_name: "Godrej Properties",
    reputation_score: 4.6,
    completion_track_record: "95% projects delivered on time globally",
    review_summary: "Excellent green landscaping, corporate management standards, highly professional service, and high resale premiums.",
    known_risks: ["Strict terms on modification delays", "High price per sqft compared to local developers"]
  },
  "Kolte Patil": {
    builder_name: "Kolte Patil",
    reputation_score: 4.1,
    completion_track_record: "92% projects delivered on time in Pune",
    review_summary: "One of Pune's most trusted brands. Known for massive integrated townships (Life Republic). Sound structures, good design layouts.",
    known_risks: ["Higher density of units in towers", "High club membership fees"]
  },
  "VTP Realty": {
    builder_name: "VTP Realty",
    reputation_score: 3.9,
    completion_track_record: "87% project completion rates",
    review_summary: "Aggressive construction speeds, large-scale projects, and modern modular designs. Popular in Eastern and Western Pune gates.",
    known_risks: ["Minor trim/fit finishing issues on delivery", "Heavy sales traffic may lead to delay in support responses"]
  },
  "Kumar Properties": {
    builder_name: "Kumar Properties",
    reputation_score: 4.3,
    completion_track_record: "93% project delivery over 40+ years",
    review_summary: "Excellent construction reliability and prime location acquisitions inside main Pune city limits. High brand loyalty.",
    known_risks: ["Minimal customizations allowed in layouts", "High registry fees"]
  },
  "Goyal Properties": {
    builder_name: "Goyal Properties",
    reputation_score: 4.2,
    completion_track_record: "90% on-time delivery across Baner and Wakad",
    review_summary: "Solid local Pune brand known for spacious apartments and good design spacing. Highly responsive support team.",
    known_risks: ["Higher society maintenance deposits during handover"]
  },
  "Gera Developments": {
    builder_name: "Gera Developments",
    reputation_score: 4.5,
    completion_track_record: "96% project completion; introduces Gera 7-year warranty",
    review_summary: "Widely praised for child-centric home concepts, smart home integrations, and excellent design aesthetics.",
    known_risks: ["Limited options in mid-budget ranges"]
  },
  "Shapoorji Pallonji": {
    builder_name: "Shapoorji Pallonji",
    reputation_score: 4.8,
    completion_track_record: "98% on-time completion on massive township projects",
    review_summary: "Industry leader in structural integrity, premium amenities, high-speed elevators, and excellent green coverage.",
    known_risks: ["Registry and documentation delays due to complex corporate processes"]
  },
  "Kasturi Builders": {
    builder_name: "Kasturi Builders",
    reputation_score: 4.7,
    completion_track_record: "97% on-time execution of ultra-luxury segment",
    review_summary: "Acclaimed for bespoke architectural facades, international interior fittings, and high privacy spacing.",
    known_risks: ["High entry-level price barrier", "Extremely high maintenance charges"]
  },
  "Lodha Group": {
    builder_name: "Lodha Group",
    reputation_score: 4.3,
    completion_track_record: "92% projects delivered in large residential townships",
    review_summary: "Famous for luxury amenities, world-class clubhouses, grand entry lobbies, and great open areas.",
    known_risks: ["Slightly high loading percentages on built-up area"]
  },
  "L&T Realty": {
    builder_name: "L&T Realty",
    reputation_score: 4.6,
    completion_track_record: "95% on-time project completion",
    review_summary: "Corporate style execution, excellent structural engineering, transparent pricing, and robust fire security systems.",
    known_risks: ["Pre-handover booking cancellations are subject to heavy penalties"]
  },
  "Tata Housing": {
    builder_name: "Tata Housing",
    reputation_score: 4.5,
    completion_track_record: "93% on-time delivery across major Indian cities",
    review_summary: "Excellent brand trust, premium structural engineering, high-quality finishes, and very spacious layout designs.",
    known_risks: ["Premium pricing over local developers", "Rigid payment schedule structures"]
  },
  "Mahindra Lifespaces": {
    builder_name: "Mahindra Lifespaces",
    reputation_score: 4.4,
    completion_track_record: "91% on-time completion record in residential projects",
    review_summary: "Industry leaders in eco-friendly construction techniques and IGBC-certified green developments. Highly transparent and process-oriented.",
    known_risks: ["Limited options in lower budget categories", "Separate high maintenance deposits"]
  },
  "Puravankara Limited": {
    builder_name: "Puravankara Limited",
    reputation_score: 4.2,
    completion_track_record: "90% project delivery rate across South and West India",
    review_summary: "Highly acclaimed for signature themed residential communities. Solid build quality, durable bathroom and electrical fittings.",
    known_risks: ["High premium markup on themed spaces", "Higher monthly security fee assessments"]
  },
  "Brigade Group": {
    builder_name: "Brigade Group",
    reputation_score: 4.7,
    completion_track_record: "96% on-time township completion rate",
    review_summary: "Aesthetic master planning, premium materials, elite modular clubhouse structures, and excellent customer relationship management.",
    known_risks: ["Premium pricing matching Tier-1 standard rates", "Relatively high society club loading factors"]
  }
};

export const localitySentimentData: Record<string, LocalitySentiment> = {
  "Hinjewadi": {
    locality_name: "Hinjewadi",
    sentiment_score: 0.76,
    positive_themes: ["Proximity to Major IT Hubs", "Upcoming Metro connectivity", "High rental demand"],
    negative_themes: ["Severe peak hour traffic congestion", "Water supply dependency on tankers", "High pollution levels"],
    comment_count: 520,
    sentiment_summary: "An exceptional location for professionals working in Rajiv Gandhi Infotech Park. Proximity to work is the main selling point, though buyers should expect severe traffic bottlenecks at Shivaji Chowk and water supply issues in smaller standalone societies."
  },
  "Wakad": {
    locality_name: "Wakad",
    sentiment_score: 0.84,
    positive_themes: ["Excellent road connectivity to Expressway", "Vibrant retail markets", "Top international schools"],
    negative_themes: ["High density construction", "Occasional drainage overflows in monsoon"],
    comment_count: 310,
    sentiment_summary: "Very balanced residential suburb. Perfect for families due to immediate access to schools, hospital corridors, and dining options. Connectivity to Hinjewadi IT Park and Mumbai-Pune highway is excellent."
  },
  "Baner": {
    locality_name: "Baner",
    sentiment_score: 0.90,
    positive_themes: ["Premium residential profile", "High street shopping & restaurants", "Proximity to Balewadi High Street"],
    negative_themes: ["Extremely high land prices", "High cost of living"],
    comment_count: 240,
    sentiment_summary: "One of Pune's most posh suburbs. Excellent lifestyle index with premium dining, cafes, and parks. Highly attractive for high-net-worth individuals and senior executives."
  },
  "Whitefield": {
    locality_name: "Whitefield",
    sentiment_score: 0.81,
    positive_themes: ["Strong metro network access", "Top IT parks like ITPL", "Premium gated community culture"],
    negative_themes: ["Water logging during heavy rains", "High dust levels due to constant metro expansions"],
    comment_count: 680,
    sentiment_summary: "The ultimate tech-corridor in East Bangalore. Features beautiful massive townships with top-tier amenities. Metro routes have drastically cut down travel times to central Bangalore, but water shortages and road dust remain notable challenges."
  },
  "Indiranagar": {
    locality_name: "Indiranagar",
    sentiment_score: 0.88,
    positive_themes: ["Elite high-street retail & nightlife", "Central leafy avenues", "Excellent connectivity"],
    negative_themes: ["Commercialization of residential blocks", "High noise levels on weekend nights", "Extremely expensive property rates"],
    comment_count: 190,
    sentiment_summary: "Indiranagar is highly sought after for its cosmopolitan lifestyle, mature tree-lined avenues, and central location. Finding new, affordable residential apartments is virtually impossible, pushing transactions towards premium resales and rentals."
  },
  "Hadapsar": {
    locality_name: "Hadapsar",
    sentiment_score: 0.82,
    positive_themes: ["Proximity to Magarpatta Cybercity", "SP Infocity", "Integrated Townships like Amanora"],
    negative_themes: ["Traffic bottlenecks at Hadapsar flyover", "Water supply constraints in unauthorized zones"],
    comment_count: 340,
    sentiment_summary: "Hadapsar is a major commercial and IT node in East Pune. Highly preferred by tech professionals working in Magarpatta. Amanora and Eastview townships provide world-class amenities, although traffic along Solapur Road is a daily pain point."
  },
  "Koramangala": {
    locality_name: "Koramangala",
    sentiment_score: 0.89,
    positive_themes: ["Startup hub culture", "Vibrant food scene", "Leafy residential blocks"],
    negative_themes: ["Prone to water logging in block 4", "High commercial traffic", "Extremely premium rents"],
    comment_count: 420,
    sentiment_summary: "Koramangala is one of Bangalore's most famous and mature residential-cum-commercial neighborhoods. Known for tree-lined avenues and upscale cafes, it has very strong appeal but comes with high rental costs and traffic bottlenecks."
  },
  "Kharadi": {
    locality_name: "Kharadi",
    sentiment_score: 0.85,
    positive_themes: ["Proximity to EON IT Park & World Trade Center", "Well-planned road grids", "Modern gated complexes"],
    negative_themes: ["Dust pollution from ongoing construction", "Peak-hour congestion at Kharadi bypass chowk"],
    comment_count: 460,
    sentiment_summary: "Kharadi is a massive IT corridor in East Pune. Highly favored by software engineers for its proximity to EON IT Park. Living indexes are premium with structured wide roads and plenty of new luxury highrises."
  },
  "Viman Nagar": {
    locality_name: "Viman Nagar",
    sentiment_score: 0.88,
    positive_themes: ["Premium lifestyle index", "Phoenix Marketcity Mall access", "Proximity to Pune Airport"],
    negative_themes: ["High residential rental pricing", "Flight landing decibel noise in select pockets"],
    comment_count: 380,
    sentiment_summary: "Viman Nagar is one of Pune's most active premium residential zones. Extremely vibrant due to Symbiosis colleges, high streets, and malls. Very popular for rental investments and executive homes."
  },
  "Kothrud": {
    locality_name: "Kothrud",
    sentiment_score: 0.91,
    positive_themes: ["Traditional residential environment", "Abundant tree cover & parks", "Excellent schools and healthcare"],
    negative_themes: ["Lack of new vacant land parcels", "Narrow inner roads in older sectors"],
    comment_count: 290,
    sentiment_summary: "Kothrud has a very high quality of life rating. Highly mature with multi-generation local families. Very safe, green, and highly desirable, though new residential inventory is very scarce."
  },
  "Kalyani Nagar": {
    locality_name: "Kalyani Nagar",
    sentiment_score: 0.89,
    positive_themes: ["Elite neighborhood profile", "Quiet tree-lined residential lanes", "Proximity to Koregaon Park & tech parks"],
    negative_themes: ["High entry price thresholds", "Strict zoning rules on new construction heights"],
    comment_count: 220,
    sentiment_summary: "One of Pune's most affluent zip codes. Known for beautiful low-density luxury structures and mature trees. Residents enjoy access to prime dining corridors and high street retail without the commercial noise of central Pune."
  }
};

export const localityTrendsData: Record<string, LocalityTrend> = {
  "Hinjewadi": {
    locality_name: "Hinjewadi",
    trend_score: 82,
    trend_direction: "up",
    trend_summary: "Prices have surged 12% over the last year, fueled by the accelerating construction of the Hinjewadi-Shivajinagar Metro Line 3.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 6800 },
      { quarter: "Q3 2025", avg_price_per_sqft: 7100 },
      { quarter: "Q4 2025", avg_price_per_sqft: 7350 },
      { quarter: "Q1 2026", avg_price_per_sqft: 7600 }
    ]
  },
  "Wakad": {
    locality_name: "Wakad",
    trend_score: 78,
    trend_direction: "up",
    trend_summary: "Demand remains strong due to commercial saturated centers shifting from Pune city. Appreciating steadily at 6% annually.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 7800 },
      { quarter: "Q3 2025", avg_price_per_sqft: 7950 },
      { quarter: "Q4 2025", avg_price_per_sqft: 8100 },
      { quarter: "Q1 2026", avg_price_per_sqft: 8300 }
    ]
  },
  "Baner": {
    locality_name: "Baner",
    trend_score: 91,
    trend_direction: "up",
    trend_summary: "Highly resilient premium micro-market. Upward momentum driven by commercial setups on Baner road. Appreciation at 9% annually.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 10200 },
      { quarter: "Q3 2025", avg_price_per_sqft: 10400 },
      { quarter: "Q4 2025", avg_price_per_sqft: 10800 },
      { quarter: "Q1 2026", avg_price_per_sqft: 11200 }
    ]
  },
  "Whitefield": {
    locality_name: "Whitefield",
    trend_score: 85,
    trend_direction: "up",
    trend_summary: "Metro completion has sparked massive renewed interest from tenants and buyers. Prices increased 14% year-over-year.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 8100 },
      { quarter: "Q3 2025", avg_price_per_sqft: 8400 },
      { quarter: "Q4 2025", avg_price_per_sqft: 8900 },
      { quarter: "Q1 2026", avg_price_per_sqft: 9300 }
    ]
  },
  "Indiranagar": {
    locality_name: "Indiranagar",
    trend_score: 65,
    trend_direction: "flat",
    trend_summary: "Property rates are already saturated due to extremely high baseline values. Rental yields are increasing while capital gains are steady at 3%.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 15400 },
      { quarter: "Q3 2025", avg_price_per_sqft: 15600 },
      { quarter: "Q4 2025", avg_price_per_sqft: 15700 },
      { quarter: "Q1 2026", avg_price_per_sqft: 15850 }
    ]
  },
  "Hadapsar": {
    locality_name: "Hadapsar",
    trend_score: 84,
    trend_direction: "up",
    trend_summary: "Prices appreciated by 8.5% over the past year, driven by corporate expansions in Magarpatta and SP Infocity.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 7100 },
      { quarter: "Q3 2025", avg_price_per_sqft: 7300 },
      { quarter: "Q4 2025", avg_price_per_sqft: 7550 },
      { quarter: "Q1 2026", avg_price_per_sqft: 7800 }
    ]
  },
  "Koramangala": {
    locality_name: "Koramangala",
    trend_score: 72,
    trend_direction: "up",
    trend_summary: "Demand remains highly stable. Price changes are steady at 5% capital growth but rental rates continue to rise due to tech demand.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 11800 },
      { quarter: "Q3 2025", avg_price_per_sqft: 12000 },
      { quarter: "Q4 2025", avg_price_per_sqft: 12250 },
      { quarter: "Q1 2026", avg_price_per_sqft: 12500 }
    ]
  },
  "Kharadi": {
    locality_name: "Kharadi",
    trend_score: 87,
    trend_direction: "up",
    trend_summary: "Prices surged 11.5% due to high tech employment inflows in EON IT Park. Demand for mid-segment flats remains extremely high.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 7900 },
      { quarter: "Q3 2025", avg_price_per_sqft: 8150 },
      { quarter: "Q4 2025", avg_price_per_sqft: 8400 },
      { quarter: "Q1 2026", avg_price_per_sqft: 8800 }
    ]
  },
  "Viman Nagar": {
    locality_name: "Viman Nagar",
    trend_score: 80,
    trend_direction: "up",
    trend_summary: "Mature market with steady 7% capital appreciation. Rental demands outpaced sales supply, leading to high yield growth.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 9400 },
      { quarter: "Q3 2025", avg_price_per_sqft: 9600 },
      { quarter: "Q4 2025", avg_price_per_sqft: 9850 },
      { quarter: "Q1 2026", avg_price_per_sqft: 10100 }
    ]
  },
  "Kothrud": {
    locality_name: "Kothrud",
    trend_score: 75,
    trend_direction: "up",
    trend_summary: "Baseline prices are high, limiting double-digit gains. Appreciating steadily at 5.5% with premium resale listings leading the market.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 12800 },
      { quarter: "Q3 2025", avg_price_per_sqft: 13000 },
      { quarter: "Q4 2025", avg_price_per_sqft: 13300 },
      { quarter: "Q1 2026", avg_price_per_sqft: 13500 }
    ]
  },
  "Kalyani Nagar": {
    locality_name: "Kalyani Nagar",
    trend_score: 83,
    trend_direction: "up",
    trend_summary: "Elite locality experiencing premium supply crunch. Prices appreciated by 9% year-on-year, driven by ultra-luxury boutique setups.",
    quarterly_price_history: [
      { quarter: "Q2 2025", avg_price_per_sqft: 13600 },
      { quarter: "Q3 2025", avg_price_per_sqft: 13950 },
      { quarter: "Q4 2025", avg_price_per_sqft: 14200 },
      { quarter: "Q1 2026", avg_price_per_sqft: 14800 }
    ]
  }
};

// Map coordinates onto rawProperties
rawProperties.forEach(prop => {
  const coords = propertyCoordinates[prop.property_id];
  if (coords) {
    prop.latitude = coords.latitude;
    prop.longitude = coords.longitude;
  } else {
    // Default fallback coordinates based on city centroids
    if (prop.city.toLowerCase() === 'bangalore' || prop.city.toLowerCase() === 'bengaluru') {
      prop.latitude = 12.9716;
      prop.longitude = 77.5946;
    } else {
      prop.latitude = 18.5204;
      prop.longitude = 73.8567;
    }
  }
});
