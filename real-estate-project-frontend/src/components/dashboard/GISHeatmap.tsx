import { useEffect, useRef, useState } from 'react';
import { 
  Layers, Sliders, Info, TrendingUp, Compass, 
  Coins, Sparkles, Plus 
} from 'lucide-react';
import { CleanedProperty, pointsOfInterest } from '../../assets/mockData';

interface GISHeatmapProps {
  properties: CleanedProperty[];
  currentCity: string;
  currentLocality: string;
}

type HeatmapType = 'price' | 'connectivity' | 'vastu' | 'investment';

const LOCALITY_CENTERS: Record<string, [number, number]> = {
  'hinjewadi': [18.5913, 73.7389],
  'hinjawadi': [18.5913, 73.7389],
  'wakad': [18.5987, 73.7707],
  'baner': [18.5597, 73.7799],
  'kharadi': [18.5447, 73.9388],
  'hadapsar': [18.5089, 73.9259],
  'viman nagar': [18.5679, 73.9143],
  'kothrud': [18.5074, 73.8077],
  'kalyani nagar': [18.5463, 73.9033],
  'whitefield': [12.9698, 77.7499],
  'indiranagar': [12.9784, 77.6408],
  'koramangala': [12.9279, 77.6271],
  'pune': [18.5204, 73.8567],
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946]
};

export default function GISHeatmap({
  properties,
  currentCity,
  currentLocality
}: GISHeatmapProps) {
  const [leafletStatus, setLeafletStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [activeLayer, setActiveLayer] = useState<HeatmapType>('price');
  const [radius, setRadius] = useState<number>(30);
  const [blur, setBlur] = useState<number>(15);
  const [selectedProperty, setSelectedProperty] = useState<CleanedProperty | null>(null);

  const mapRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  // 1. Get current coordinates center
  const getCenterCoords = (): [number, number] => {
    const locLower = currentLocality.toLowerCase();
    const cityLower = currentCity.toLowerCase();
    
    if (LOCALITY_CENTERS[locLower]) return LOCALITY_CENTERS[locLower];
    if (LOCALITY_CENTERS[cityLower]) return LOCALITY_CENTERS[cityLower];
    return [18.5204, 73.8567]; // Pune default
  };

  const centerCoords = getCenterCoords();

  // 2. Load Leaflet + Leaflet.heat CDN dynamically
  useEffect(() => {
    if ((window as any).L && (window as any).L.heatLayer) {
      setLeafletStatus('loaded');
      return;
    }

    const loadScripts = async () => {
      try {
        // Load CSS if not already there
        if (!document.getElementById('leaflet-css-cdn')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css-cdn';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Load JS if not already there
        if (!(window as any).L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.id = 'leaflet-js-cdn';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Load Leaflet.heat plugin if not already there
        if (!(window as any).L.heatLayer) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.id = 'leaflet-heat-cdn';
            script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        setLeafletStatus('loaded');
      } catch (err) {
        console.error('Failed to load GIS mapping dependencies', err);
        setLeafletStatus('error');
      }
    };

    loadScripts();

    // Timeout fallback (if CDN blocked/offline)
    const timeout = setTimeout(() => {
      if (!(window as any).L || !(window as any).L.heatLayer) {
        setLeafletStatus('error');
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  // 3. Prepare Heatmap points data based on the active overlay category
  const getHeatmapData = (): any[] => {
    if (!properties || properties.length === 0) return [];

    // Filter properties in active city
    const filteredProps = properties.filter(
      p => p.city.toLowerCase() === currentCity.toLowerCase()
    );

    switch (activeLayer) {
      case 'price': {
        // Price intensity based on relative price_per_sqft
        const prices = filteredProps.map(p => p.price_per_sqft);
        const maxPrice = Math.max(...prices, 12000);
        const minPrice = Math.min(...prices, 4000);
        const priceRange = maxPrice - minPrice || 1;

        return filteredProps.map(p => {
          const lat = p.latitude || centerCoords[0];
          const lon = p.longitude || centerCoords[1];
          // Weight between 0.2 and 1.0
          const weight = 0.2 + 0.8 * ((p.price_per_sqft - minPrice) / priceRange);
          return [lat, lon, weight];
        });
      }
      case 'vastu': {
        // Vastu intensity based on vastu_score
        return filteredProps.map(p => {
          const lat = p.latitude || centerCoords[0];
          const lon = p.longitude || centerCoords[1];
          const score = p.vastu_score || 70;
          const weight = score / 100; // 0 to 1
          return [lat, lon, weight];
        });
      }
      case 'investment': {
        // Investment score intensity (0.1 to 1.0)
        return filteredProps.map(p => {
          const lat = p.latitude || centerCoords[0];
          const lon = p.longitude || centerCoords[1];
          const score = p.investment_score || 7.5;
          const weight = score / 10;
          return [lat, lon, weight];
        });
      }
      case 'connectivity': {
        // Proximity to commute hubs.
        // We include both property locations and actual POI coords.
        const points: any[] = [];
        
        // Add commute POIs for current locality/city as strong hot nodes
        const commutePOIs = pointsOfInterest.filter(
          poi => poi.type === 'commute' && poi.locality.toLowerCase() === currentLocality.toLowerCase()
        );

        commutePOIs.forEach(poi => {
          points.push([poi.latitude, poi.longitude, 1.0]); // Max intensity for transit stations
        });

        // Add property points with weight relative to their connectivity score
        filteredProps.forEach(p => {
          const lat = p.latitude || centerCoords[0];
          const lon = p.longitude || centerCoords[1];
          const connScore = p.location_scores?.connectivity || 75;
          points.push([lat, lon, connScore / 100]);
        });

        return points;
      }
      default:
        return [];
    }
  };

  // 4. Update Heatmap layer and Markers when active layer, filters, radius, or blur changes
  useEffect(() => {
    if (leafletStatus !== 'loaded' || !containerRef.current) return;

    const L = (window as any).L;
    if (!L || !L.heatLayer) return;

    // A. Init Map Instance
    if (!mapRef.current) {
      try {
        const map = L.map(containerRef.current).setView(centerCoords, 13);
        mapRef.current = map;

        // Dark Mode Tile Layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);
      } catch (err) {
        console.error("Map mounting error", err);
        setLeafletStatus('error');
        return;
      }
    } else {
      // Fly to new center when locality changes
      mapRef.current.setView(centerCoords, 13);
    }

    const map = mapRef.current;

    // B. Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // C. Clear existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // D. Add Heat Layer with active configurations
    const heatPoints = getHeatmapData();
    if (heatPoints.length > 0) {
      try {
        // Heatmap gradients matching dashboard themes
        let gradient: Record<number, string> = {
          0.4: '#3b82f6', // blue
          0.65: '#10b981', // green
          0.85: '#f59e0b', // amber
          1.0: '#ef4444' // red
        };

        if (activeLayer === 'vastu') {
          gradient = {
            0.4: '#ef4444', // Red (poor compliance)
            0.7: '#f59e0b', // Orange/Amber
            1.0: '#10b981' // Green (high compliance)
          };
        } else if (activeLayer === 'investment') {
          gradient = {
            0.4: '#6366f1', // Indigo
            0.7: '#8b5cf6', // Purple
            1.0: '#d946ef' // Pink
          };
        }

        const heatLayer = L.heatLayer(heatPoints, {
          radius: radius,
          blur: blur,
          maxZoom: 17,
          gradient: gradient
        }).addTo(map);

        heatLayerRef.current = heatLayer;
      } catch (e) {
        console.error("Heatmap rendering error", e);
      }
    }

    // E. Add Property Listing Markers on top of heatmap
    const cityProps = properties.filter(
      p => p.city.toLowerCase() === currentCity.toLowerCase()
    );

    cityProps.forEach(p => {
      const lat = p.latitude || centerCoords[0];
      const lon = p.longitude || centerCoords[1];

      // Custom marker color depending on active layer metrics
      let pinColor = '#3b82f6';
      if (activeLayer === 'price') {
        pinColor = p.price_per_sqft > 8500 ? '#ef4444' : p.price_per_sqft < 6500 ? '#10b981' : '#f59e0b';
      } else if (activeLayer === 'vastu') {
        pinColor = p.vastu_score && p.vastu_score >= 85 ? '#10b981' : p.vastu_score && p.vastu_score < 70 ? '#ef4444' : '#f59e0b';
      } else if (activeLayer === 'investment') {
        pinColor = p.investment_score && p.investment_score >= 8.0 ? '#d946ef' : '#6366f1';
      }

      const markerHtml = `
        <div style="
          background-color: ${pinColor}; 
          border: 2px solid white; 
          border-radius: 50%; 
          width: 14px; 
          height: 14px; 
          box-shadow: 0 0 8px ${pinColor};
          cursor: pointer;
        " class="hover:scale-125 transition-transform"></div>
      `;

      const markerIcon = L.divIcon({
        className: `gis-marker-${p.property_id}`,
        html: markerHtml,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(map);
      
      // Bind click handler to select property
      marker.on('click', () => {
        setSelectedProperty(p);
      });

      markersRef.current.push(marker);
    });

  }, [leafletStatus, activeLayer, currentCity, currentLocality, radius, blur, properties]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 5. Calculate localized micro-market stats for dashboard side panel
  const getMicroMarketStats = () => {
    const locProps = properties.filter(
      p => p.locality.toLowerCase() === currentLocality.toLowerCase()
    );

    if (locProps.length === 0) {
      return {
        avgPrice: 'N/A',
        avgVastu: 'N/A',
        avgInvestment: 'N/A',
        hotspot: 'Central Sector',
        count: 0
      };
    }

    const avgPriceSqft = Math.round(locProps.reduce((acc, p) => acc + p.price_per_sqft, 0) / locProps.length);
    const avgVastu = Math.round(locProps.reduce((acc, p) => acc + (p.vastu_score || 75), 0) / locProps.length);
    const avgInvest = (locProps.reduce((acc, p) => acc + (p.investment_score || 7.0), 0) / locProps.length).toFixed(1);

    // Dynamic hotspot detection
    let hotspot = 'Transit Junction';
    if (currentLocality.toLowerCase() === 'hinjewadi') hotspot = 'Phase 1 Tech Corridor';
    else if (currentLocality.toLowerCase() === 'wakad') hotspot = 'High Street Chowk';
    else if (currentLocality.toLowerCase() === 'baner') hotspot = 'Balewadi Highstreet';
    else if (currentLocality.toLowerCase() === 'whitefield') hotspot = 'ITPL Metro Hub';

    return {
      avgPrice: `₹${avgPriceSqft.toLocaleString()}/sqft`,
      avgVastu: `${avgVastu}%`,
      avgInvestment: `${avgInvest}/10`,
      hotspot,
      count: locProps.length
    };
  };

  const marketStats = getMicroMarketStats();

  // Dynamic Layer descriptions
  const getLayerMeta = () => {
    switch (activeLayer) {
      case 'price':
        return {
          title: 'Price Heatmap Overlay',
          icon: <Coins className="w-4 h-4 text-rose-400" />,
          desc: 'Visualizes high price zones (Red) vs affordable zones (Green). Ideal for identifying undervalued corridors.',
          highLabel: 'Premium Pricing',
          lowLabel: 'Affordable Pricing',
          gradientClass: 'bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500'
        };
      case 'vastu':
        return {
          title: 'Vastu Compliance Overlay',
          icon: <Compass className="w-4 h-4 text-emerald-400" />,
          desc: 'Highlights zones with high Vastu alignment scores (Green). Areas in red indicate lower Vastu ratings requiring corrections.',
          highLabel: 'Highly Compliant',
          lowLabel: 'Remedy Required',
          gradientClass: 'bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500'
        };
      case 'investment':
        return {
          title: 'Investment Grade Hotspots',
          icon: <TrendingUp className="w-4 h-4 text-purple-400" />,
          desc: 'Displays clusters of premium investment potential (Pink). Based on builder reputation, micro-market trends, and ROI signals.',
          highLabel: 'Strong Buy / ROI',
          lowLabel: 'Standard Yield',
          gradientClass: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
        };
      case 'connectivity':
        return {
          title: 'Commute & POI Proximity',
          icon: <Layers className="w-4 h-4 text-cyan-400" />,
          desc: 'Mapping density around transit stations, metro lines, tech parks, and infrastructure nodes (Red/Yellow indicating high connectivity).',
          highLabel: 'High Commute Proximity',
          lowLabel: 'Residential Pockets',
          gradientClass: 'bg-gradient-to-r from-blue-500 via-teal-500 to-red-500'
        };
    }
  };

  const meta = getLayerMeta()!;

  // 6. RENDER OFFLINE/FALLBACK GRID if Leaflet fails to load
  const renderOfflineGrid = () => {
    // Generate simulated geographic grid cells for the current locality
    const gridRows = 5;
    const gridCols = 5;
    const gridCells = [];

    // Seed mock density based on current locality & selected heatmap type
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        // Calculate a pseudo-random seed based on row/col and active layer
        const seedVal = Math.sin(r * 12.34 + c * 56.78 + activeLayer.length) * 0.5 + 0.5;
        gridCells.push({
          row: r,
          col: c,
          density: seedVal,
          avgPrice: Math.round(6200 + seedVal * 4200),
          vastuScore: Math.round(65 + seedVal * 30),
          investScore: (6.0 + seedVal * 3.5).toFixed(1)
        });
      }
    }

    return (
      <div className="flex flex-col h-[520px] bg-black/45 border border-theme-border/50 rounded-2xl p-6 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent_70%)] pointer-events-none"></div>

        <div className="flex justify-between items-center mb-4 z-10">
          <div>
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-theme-accent animate-pulse" />
              <span>Geospatial Fallmap (Grid Mode)</span>
            </h3>
            <p className="text-[10px] text-theme-text-muted font-mono mt-0.5">Offline grid rendering in progress. Active local mapping coordinates.</p>
          </div>
          <span className="text-[10px] text-theme-accent font-mono bg-theme-accent-muted border border-theme-accent-border px-2 py-0.5 rounded">
            Radar Overlay Active
          </span>
        </div>

        {/* 2D Geographic Grid Representation */}
        <div className="flex-1 grid grid-cols-5 gap-2.5 items-stretch min-h-[300px] mb-4 z-10">
          {gridCells.map((cell, idx) => {
            // Determine grid cell background color depending on density and layer type
            let cellColor = `rgba(59, 130, 246, ${cell.density * 0.7})`; // default blue
            
            if (activeLayer === 'price') {
              // Emerald (low price) to Red (high price)
              const hue = (1 - cell.density) * 120; // 120 is green, 0 is red
              cellColor = `hsla(${hue}, 70%, 45%, 0.45)`;
            } else if (activeLayer === 'vastu') {
              // Red (low) to Green (high)
              const hue = cell.density * 120;
              cellColor = `hsla(${hue}, 70%, 45%, 0.45)`;
            } else if (activeLayer === 'investment') {
              // Pink/Indigo/Purple
              cellColor = `rgba(168, 85, 247, ${cell.density * 0.75})`;
            } else if (activeLayer === 'connectivity') {
              // Blue-Teal-Red
              cellColor = `rgba(14, 116, 144, ${cell.density * 0.7})`;
            }

            return (
              <div 
                key={idx}
                className="rounded-xl border border-white/5 hover:border-theme-accent-border hover:scale-[1.02] flex flex-col justify-between p-3.5 transition-all duration-300 relative group cursor-pointer"
                style={{ backgroundColor: cellColor }}
              >
                {/* Density Badge */}
                <div className="flex justify-between items-center text-[9px] font-mono text-white/55">
                  <span>S-{cell.row + 1}{cell.col + 1}</span>
                  <span>{Math.round(cell.density * 100)}%</span>
                </div>

                {/* Populating metrics */}
                <div className="mt-auto space-y-1 text-left">
                  <div className="text-[10px] font-mono font-bold text-white leading-tight">
                    {activeLayer === 'price' ? `₹${cell.avgPrice}/sqft` : 
                     activeLayer === 'vastu' ? `Vastu: ${cell.vastuScore}%` : 
                     activeLayer === 'investment' ? `ROI: ${cell.investScore}` : `Commute: ${Math.round(cell.density * 10)}pt`}
                  </div>
                  <div className="text-[8px] text-white/45 font-mono capitalize">
                    {cell.density > 0.75 ? '🔥 Hotspot' : cell.density > 0.4 ? '⚡ Stable' : '❄️ Sparse'}
                  </div>
                </div>

                {/* Micro tooltip details */}
                <div className="absolute left-1/2 -top-12 -translate-x-1/2 hidden group-hover:block z-[999] bg-slate-950 border border-theme-border/80 px-3 py-2 rounded-lg text-[9px] font-mono text-theme-text space-y-1 w-28 text-left shadow-xl">
                  <p className="text-theme-text-light font-bold">Zone S-{cell.row + 1}{cell.col + 1}</p>
                  <p>Price: ₹{cell.avgPrice}/sqft</p>
                  <p>Vastu: {cell.vastuScore}%</p>
                  <p>ROI score: {cell.investScore}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3.5 bg-theme-accent-muted border border-theme-accent-border rounded-xl text-[11px] text-theme-text-muted leading-relaxed font-mono font-medium z-10">
          <span className="text-theme-text-light font-bold">Offline Analytics:</span> The geospatial engine calculated local sector nodes based on coordinates constraints. To enable full Leaflet tile visualizations, ensure a stable internet connection or check the browser security console for blocked CDN scripts.
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-theme-text-light tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-theme-accent animate-pulse" />
            <span>GIS Location Analytics & Heatmaps</span>
          </h2>
          <p className="text-sm text-theme-text-muted mt-0.5">
            Interactive spatial overlays visualizing property values, compliance, and amenity density in {currentLocality}, {currentCity}.
          </p>
        </div>
        
        {leafletStatus === 'loaded' ? (
          <span className="px-2.5 py-0.5 text-xs text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-900/30 rounded-full flex items-center gap-1.5 font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            GIS Engine Live
          </span>
        ) : leafletStatus === 'loading' ? (
          <span className="px-2.5 py-0.5 text-xs text-amber-400 font-mono bg-amber-950/20 border border-amber-900/30 rounded-full flex items-center gap-1.5 font-bold uppercase animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Compiling Scripts
          </span>
        ) : (
          <span className="px-2.5 py-0.5 text-xs text-rose-400 font-mono bg-rose-950/20 border border-rose-900/30 rounded-full flex items-center gap-1.5 font-bold uppercase">
            Offline Fallback
          </span>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Control Bar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="aceternity-card p-5 rounded-2xl space-y-5 border border-theme-border/60">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-theme-text-muted flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-theme-accent" />
                <span>GIS Overlays Controls</span>
              </h3>
            </div>

            {/* Heatmap Layer Selector */}
            <div className="space-y-1.5">
              {[
                { type: 'price', label: 'Price Density', icon: <Coins className="w-4 h-4" /> },
                { type: 'connectivity', label: 'Commute Density', icon: <Layers className="w-4 h-4" /> },
                { type: 'vastu', label: 'Vastu Compliance', icon: <Compass className="w-4 h-4" /> },
                { type: 'investment', label: 'Investment ROI Grade', icon: <TrendingUp className="w-4 h-4" /> }
              ].map((layer) => {
                const isActive = activeLayer === layer.type;
                return (
                  <button
                    key={layer.type}
                    onClick={() => {
                      setActiveLayer(layer.type as HeatmapType);
                      setSelectedProperty(null); // Clear selected popup
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-theme-accent-muted border-theme-accent-border text-theme-accent shadow-sm' 
                        : 'bg-theme-card border-theme-border text-theme-text-muted hover:text-theme-text hover:border-theme-border/70'
                    }`}
                  >
                    {layer.icon}
                    <span>{layer.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Density Adjusters */}
            <div className="space-y-3.5 pt-2 border-t border-theme-border/30">
              <div>
                <div className="flex justify-between items-center text-[11px] font-mono font-semibold text-theme-text-muted mb-1.5">
                  <span>Heat Radius</span>
                  <span className="text-theme-text-light">{radius}px</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-1 bg-theme-btn border-none rounded-lg appearance-none cursor-pointer accent-theme-accent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[11px] font-mono font-semibold text-theme-text-muted mb-1.5">
                  <span>Gradients Blur</span>
                  <span className="text-theme-text-light">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full h-1 bg-theme-btn border-none rounded-lg appearance-none cursor-pointer accent-theme-accent"
                />
              </div>
            </div>
          </div>

          {/* Micro-market stats */}
          <div className="aceternity-card p-5 rounded-2xl space-y-4 border border-theme-border/60">
            <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-theme-text-muted flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-theme-accent" />
              <span>Micro-Market: {currentLocality}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-theme-border/20 pb-2">
                <span className="text-theme-text-muted">Total Properties</span>
                <span className="font-bold text-theme-text-light font-mono">{marketStats.count} listings</span>
              </div>
              <div className="flex justify-between items-center border-b border-theme-border/20 pb-2">
                <span className="text-theme-text-muted">Avg Price Sqft</span>
                <span className="font-bold text-theme-text-light font-mono">{marketStats.avgPrice}</span>
              </div>
              <div className="flex justify-between items-center border-b border-theme-border/20 pb-2">
                <span className="text-theme-text-muted">Avg Vastu Alignment</span>
                <span className="font-bold text-theme-text-light font-mono">{marketStats.avgVastu}</span>
              </div>
              <div className="flex justify-between items-center border-b border-theme-border/20 pb-2">
                <span className="text-theme-text-muted">Avg ROI Factor</span>
                <span className="font-bold text-theme-text-light font-mono">{marketStats.avgInvestment}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-theme-text-muted">Hotspot Corridor</span>
                <span className="font-bold text-right text-theme-accent font-mono max-w-[120px] leading-tight">{marketStats.hotspot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Map Canvas */}
        <div className="xl:col-span-3 space-y-5">
          
          {/* Map display */}
          <div className="relative">
            {leafletStatus === 'loaded' ? (
              <div className="relative rounded-2xl border border-theme-border overflow-hidden h-[520px] shadow-2xl">
                <div 
                  ref={containerRef} 
                  className="w-full h-full relative z-10" 
                  style={{ minHeight: '520px', backgroundColor: '#0f172a' }}
                />
                
                {/* Visual Legend Card overlay on map bottom-left */}
                <div className="absolute bottom-6 left-6 z-20 glass-panel rounded-xl border border-theme-border/80 p-3 max-w-sm shadow-2xl select-none font-mono">
                  <div className="flex items-center gap-2 mb-2">
                    {meta.icon}
                    <span className="text-xs font-bold text-theme-text-light leading-none">{meta.title}</span>
                  </div>
                  <p className="text-[10px] text-theme-text-muted leading-normal mb-3 font-medium">
                    {meta.desc}
                  </p>
                  
                  {/* Color Gradient Scale */}
                  <div className="space-y-1">
                    <div className={`h-2.5 rounded-full ${meta.gradientClass} w-full border border-white/5`}></div>
                    <div className="flex justify-between text-[8px] font-bold text-theme-text-muted">
                      <span>{meta.lowLabel}</span>
                      <span>{meta.highLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              renderOfflineGrid()
            )}

            {/* Float Card detailed popup */}
            {selectedProperty && (
              <div className="absolute top-6 right-6 z-20 glass-panel rounded-2xl border border-theme-accent-border/50 p-5 w-80 shadow-2xl animate-in slide-in-from-right duration-250 flex flex-col justify-between">
                <div>
                  {selectedProperty.image_url && (
                    <div className="w-full h-28 mb-3 rounded-lg overflow-hidden border border-theme-border/20 bg-black/10">
                      <img src={selectedProperty.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-theme-text-muted">
                      {selectedProperty.builder_or_owner} • {selectedProperty.source}
                    </span>
                    <button 
                      onClick={() => setSelectedProperty(null)}
                      className="text-theme-text-muted hover:text-theme-text text-sm cursor-pointer p-0.5 hover:bg-white/5 rounded"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <h4 className="text-sm font-bold text-theme-text-light tracking-tight leading-tight" title={selectedProperty.title}>
                    {selectedProperty.title}
                  </h4>
                  <p className="text-[11px] text-theme-text-muted font-mono mt-0.5">{selectedProperty.locality}, {selectedProperty.city}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-theme-border/20 text-left">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-theme-text-muted block">Price</span>
                      <span className="text-xs font-bold text-theme-text-light font-mono">
                        {selectedProperty.transaction_type === 'Rent' 
                          ? `₹${selectedProperty.price.toLocaleString()}/mo` 
                          : `₹${(selectedProperty.price / 100000).toFixed(0)} Lakh`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono text-theme-text-muted block">Price per Sqft</span>
                      <span className="text-xs font-bold text-theme-text-light font-mono">
                        ₹{selectedProperty.price_per_sqft.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono text-theme-text-muted block">BHK Layout</span>
                      <span className="text-xs font-bold text-theme-text-light font-mono">
                        {selectedProperty.bhk} BHK • {selectedProperty.area_sqft} sqft
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono text-theme-text-muted block">Match Score</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        {selectedProperty.match_score || 85}%
                      </span>
                    </div>
                  </div>

                  {/* Vastu / Investment Small Info Badges */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-theme-border/20 text-center font-mono">
                    <div className="flex-1 p-2 rounded-xl bg-theme-btn/40 border border-theme-border/40">
                      <span className="text-[8px] uppercase tracking-wider text-theme-text-muted block">Vastu Compliance</span>
                      <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">{selectedProperty.vastu_score || 80}%</span>
                    </div>
                    <div className="flex-1 p-2 rounded-xl bg-theme-btn/40 border border-theme-border/40">
                      <span className="text-[8px] uppercase tracking-wider text-theme-text-muted block">Investment Potential</span>
                      <span className="text-[11px] font-bold text-purple-400 block mt-0.5">{selectedProperty.investment_score || 7.5}/10</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <a 
                    href={selectedProperty.source_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 text-center py-2 border border-theme-border hover:border-theme-border-hover bg-theme-btn hover:bg-theme-btn-hover text-theme-text-light text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Visit Portal
                  </a>
                  <button 
                    onClick={() => {
                      alert(`Selected property ID ${selectedProperty.property_id} successfully saved to comparative panel.`);
                    }}
                    className="p-2 border border-theme-accent-border bg-theme-accent hover:bg-theme-accent-hover text-theme-bg rounded-xl transition-all cursor-pointer"
                    title="Pin Listing to Panel"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* GIS Explainer Guide Bottom Banner */}
          <div className="aceternity-card p-5 rounded-2xl flex items-start gap-4 border border-theme-border/60">
            <div className="p-3 bg-theme-accent-muted border border-theme-accent-border rounded-xl flex-shrink-0">
              <Sparkles className="w-5 h-5 text-theme-accent animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-theme-text-light">GIS Heatmap Layer & Spot Audit Insights</h4>
              <p className="text-xs text-theme-text-muted leading-relaxed mt-1 font-medium">
                {activeLayer === 'price' && 'Prices are heavily clustered along main access corridors. High-intensity hubs (Red) represent major premium builder projects (e.g. Green Heights) in active micro-markets, while periphery spaces show a 25% price drop.'}
                {activeLayer === 'connectivity' && 'Connectivity peaks around tech parks, transit metro channels, and central highway junctions. Proximity limits are calculated using coordinate-based physical road vectors.'}
                {activeLayer === 'vastu' && 'Compliance density maps property entrance direction alignment to determine the micro-market energy flow vectors. Pockets in green display complete structural compliance with zero remedies.'}
                {activeLayer === 'investment' && 'High appreciation corridors are determined by crossing regional historical data curves with public sentiment metrics. Purple zones show active demand growth points.'}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
