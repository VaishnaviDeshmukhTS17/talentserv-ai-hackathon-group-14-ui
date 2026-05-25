import { useEffect, useRef, useState } from 'react';
import { Train, GraduationCap, ShoppingBag, HeartPulse, Compass, MapPin } from 'lucide-react';
import { CleanedProperty } from '../../assets/mockData';
import { getNearestPOIs, NearestPOIResult } from '../../utils/geoUtils';

interface POIProximityListProps {
  property: CleanedProperty;
  theme?: string;
}

export default function POIProximityList({ property }: POIProximityListProps) {
  const [leafletStatus, setLeafletStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasCoordinates = property.latitude !== undefined && property.longitude !== undefined;
  const lat = property.latitude || 18.5204;
  const lon = property.longitude || 73.8567;
  const locality = property.locality || 'Hinjewadi';

  const pois = getNearestPOIs(lat, lon, locality);

  // 1. Dynamic Script Loader for Leaflet
  useEffect(() => {
    if (!hasCoordinates) {
      setLeafletStatus('error');
      return;
    }

    if ((window as any).L) {
      setLeafletStatus('loaded');
      return;
    }

    // Check if scripts/styles are already present
    let link = document.getElementById('leaflet-css-cdn') as HTMLLinkElement;
    let script = document.getElementById('leaflet-js-cdn') as HTMLScriptElement;

    if (!link) {
      link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!script) {
      script = document.createElement('script');
      script.id = 'leaflet-js-cdn';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => {
      setLeafletStatus('loaded');
    };

    const handleError = () => {
      setLeafletStatus('error');
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    // Timeout fallback (if script takes too long/offline)
    const timeout = setTimeout(() => {
      if (!(window as any).L) {
        setLeafletStatus('error');
      }
    }, 2500);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      clearTimeout(timeout);
    };
  }, [hasCoordinates]);

  // 2. Leaflet Map Initialization
  useEffect(() => {
    if (leafletStatus !== 'loaded' || !hasCoordinates || !containerRef.current) {
      return;
    }

    const L = (window as any).L;
    if (!L) {
      setLeafletStatus('error');
      return;
    }

    // Clean up existing map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      const map = L.map(containerRef.current).setView([lat, lon], 14);
      mapRef.current = map;

      // Dark Mode Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Property Custom Pulse Marker
      const propertyIcon = L.divIcon({
        className: 'custom-property-marker',
        html: `<div style="background-color: var(--theme-accent, #3b82f6); border: 2.5px solid white; border-radius: 50%; width: 16px; height: 16px; box-shadow: 0 0 12px var(--theme-accent, #3b82f6); transform: translate(-1px, -1px);" class="animate-pulse"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker([lat, lon], { icon: propertyIcon })
        .addTo(map)
        .bindPopup(`<b>${property.title}</b><br/>${locality}`)
        .openPopup();

      // Add category POIs and lines
      Object.entries(pois).forEach(([category, data]) => {
        if (!data) return;
        const { poi, distance_km, direction } = data;

        const color = getPoiColor(category);
        const iconHtml = `<div style="background-color: ${color}; border: 1.5px solid white; border-radius: 50%; width: 12px; height: 12px; box-shadow: 0 0 6px ${color};"></div>`;
        const poiIcon = L.divIcon({
          className: `custom-poi-${category}-marker`,
          html: iconHtml,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        // Add Marker
        L.marker([poi.latitude, poi.longitude], { icon: poiIcon })
          .addTo(map)
          .bindPopup(`<b>${poi.name}</b><br/>${category.toUpperCase()} • ${distance_km} km ${direction}`);

        // Add Polyline link to center
        L.polyline([[lat, lon], [poi.latitude, poi.longitude]], {
          color: color,
          weight: 1.5,
          dashArray: '3, 4',
          opacity: 0.85
        }).addTo(map);
      });
    } catch (err) {
      console.error("Leaflet initialization failed", err);
      setLeafletStatus('error');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletStatus, property, lat, lon, locality]);

  const getPoiColor = (category: string) => {
    switch (category) {
      case 'commute': return '#10b981'; // Emerald/Green
      case 'school': return '#a78bfa'; // Purple/Lavender
      case 'lifestyle': return '#f59e0b'; // Amber/Orange
      case 'infrastructure': return '#38bdf8'; // Sky Blue
      default: return '#94a3b8';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'commute': return <Train className="w-4 h-4" />;
      case 'school': return <GraduationCap className="w-4 h-4" />;
      case 'lifestyle': return <ShoppingBag className="w-4 h-4" />;
      case 'infrastructure': return <HeartPulse className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

  // 3. SVG Radar fallbacks coordinates compilation
  const renderSVGRadar = () => {
    const scale = 22; // 22 pixels per kilometer (max scale ~ 6km)
    const center = 140; // 140px center in 280x280 viewBox
    const radarPois = Object.entries(pois)
      .filter(([_, data]) => data !== null)
      .map(([category, data]) => {
        const { poi, distance_km, direction } = data as NearestPOIResult;
        
        // Calculate relative bearings in radians
        const latDiff = poi.latitude - lat;
        const lonDiff = poi.longitude - lon;
        
        // Math.atan2(dLat, dLon) -> Angle relative to E (positive CCW)
        const angle = Math.atan2(latDiff, lonDiff);

        // Cap visual distance representation so it stays in the radar display bounds
        const displayDist = Math.min(5.5, distance_km);
        const radius = displayDist * scale;
        
        // Map to SVG coordinates (note: Y grows downwards in SVG)
        const x = center + radius * Math.cos(angle);
        const y = center - radius * Math.sin(angle);

        return {
          category,
          name: poi.name,
          distance_km,
          direction,
          x,
          y
        };
      });

    return (
      <div className="relative flex flex-col items-center justify-center p-3 bg-black/50 border border-theme-border/30 rounded-xl overflow-hidden min-h-[300px]">
        {/* Sonar sweep effect overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <div className="w-[260px] h-[260px] rounded-full border border-theme-accent animate-ping"></div>
        </div>

        <svg viewBox="0 0 280 280" className="w-full max-w-64 h-auto aspect-square relative z-10 select-none mx-auto">
          {/* Radar Circles */}
          <circle cx={center} cy={center} r={125} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          <circle cx={center} cy={center} r={75} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          <circle cx={center} cy={center} r={25} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

          {/* Compass grid lines */}
          <line x1={center} y1={10} x2={center} y2={270} stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
          <line x1={10} y1={center} x2={270} y2={center} stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
          
          {/* Diagonal grid lines */}
          <line x1={50} y1={50} x2={230} y2={230} stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.5" strokeDasharray="2, 4" />
          <line x1={50} y1={230} x2={230} y2={50} stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.5" strokeDasharray="2, 4" />

          {/* Compass labels */}
          <text x={center} y={20} fill="rgba(255, 255, 255, 0.4)" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">N</text>
          <text x={center} y={268} fill="rgba(255, 255, 255, 0.4)" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">S</text>
          <text x={268} y={center + 3} fill="rgba(255, 255, 255, 0.4)" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">E</text>
          <text x={12} y={center + 3} fill="rgba(255, 255, 255, 0.4)" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">W</text>

          {/* Scale Labels */}
          <text x={center + 28} y={center - 3} fill="rgba(255, 255, 255, 0.15)" fontSize="7" fontFamily="monospace">1km</text>
          <text x={center + 78} y={center - 3} fill="rgba(255, 255, 255, 0.15)" fontSize="7" fontFamily="monospace">3km</text>
          <text x={center + 128} y={center - 3} fill="rgba(255, 255, 255, 0.15)" fontSize="7" fontFamily="monospace">5km</text>

          {/* Rotating Sonar Radar Sweep Line */}
          <line x1={center} y1={center} x2={center} y2={15} stroke="var(--theme-accent, #3b82f6)" strokeWidth="1.2" opacity="0.35">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${center} ${center}`}
              to={`360 ${center} ${center}`}
              dur="4.5s"
              repeatCount="indefinite"
            />
          </line>

          {/* Center Property Pulsing Node */}
          <circle cx={center} cy={center} r={8} fill="none" stroke="var(--theme-accent, #3b82f6)" strokeWidth="1" className="opacity-75">
            <animate attributeName="r" values="4;9;4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={center} cy={center} r={4.5} fill="var(--theme-accent, #3b82f6)" stroke="white" strokeWidth="1" />

          {/* Plot POI points onto SVG */}
          {radarPois.map((p, idx) => {
            const isHovered = hoveredCategory === p.category;
            const color = getPoiColor(p.category);
            return (
              <g key={idx} className="cursor-pointer">
                {/* Proximity line */}
                <line 
                  x1={center} 
                  y1={center} 
                  x2={p.x} 
                  y2={p.y} 
                  stroke={color} 
                  strokeWidth={isHovered ? 1.5 : 0.8} 
                  strokeDasharray="2, 3"
                  opacity={isHovered ? 0.9 : 0.45} 
                />
                
                {/* Glowing ring for hovered POI */}
                {isHovered && (
                  <circle cx={p.x} cy={p.y} r={7.5} fill="none" stroke={color} strokeWidth="1" opacity="0.7">
                    <animate attributeName="r" values="4;9;4" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Main point */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isHovered ? 5 : 4} 
                  fill={color} 
                  stroke="white" 
                  strokeWidth="1"
                  className="transition-all duration-300"
                  onMouseEnter={() => setHoveredCategory(p.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
                
                {/* Visual Tooltip label on hover */}
                {isHovered && (
                  <g>
                    <rect 
                      x={Math.max(5, Math.min(160, p.x - 55))} 
                      y={p.y < 40 ? p.y + 12 : p.y - 26} 
                      width="110" 
                      height="18" 
                      rx="3" 
                      fill="rgba(0, 0, 0, 0.9)" 
                      stroke="var(--theme-border)" 
                      strokeWidth="0.5" 
                    />
                    <text 
                      x={Math.max(60, Math.min(215, p.x))} 
                      y={p.y < 40 ? p.y + 24 : p.y - 14} 
                      fill="white" 
                      fontSize="7.5" 
                      fontWeight="bold" 
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {p.name.substring(0, 15)}.. ({p.distance_km}km)
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Small fallback notice */}
        <div className="mt-2 text-[9px] text-theme-text-muted font-mono flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />
          <span>Active offline radar tracking model</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
      {/* MAP PANE */}
      <div className="flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold font-mono text-theme-text-muted uppercase tracking-wider">Geo Proximity Map</span>
          {leafletStatus === 'loaded' ? (
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
              Interactive Leaflet Map
            </span>
          ) : (
            <span className="text-[10px] text-theme-accent font-mono bg-theme-accent-muted border border-theme-accent-border px-2 py-0.5 rounded">
              Radar Fallback Mode
            </span>
          )}
        </div>

        {leafletStatus === 'loaded' ? (
          <div 
            ref={containerRef} 
            className="w-full h-[300px] rounded-xl border border-theme-border overflow-hidden relative z-10 shadow-inner"
            style={{ minHeight: '300px' }}
          />
        ) : (
          renderSVGRadar()
        )}
      </div>

      {/* LIST PANE */}
      <div className="flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold font-mono text-theme-text-muted uppercase tracking-wider block mb-3">
            Amenities Matrix & Commutes
          </span>

          <div className="space-y-2.5">
            {Object.entries(pois).map(([category, data]) => {
              if (!data) return null;
              const { poi, distance_km, direction } = data;
              const color = getPoiColor(category);
              const isHovered = hoveredCategory === category;

              return (
                <div 
                  key={category}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isHovered 
                      ? 'bg-theme-card-hover border-theme-border-hover shadow-sm' 
                      : 'bg-theme-card border-theme-border hover:border-theme-border/50'
                  }`}
                  style={{
                    borderLeftWidth: '3.5px',
                    borderLeftColor: color
                  }}
                >
                  <div className="flex gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15`, color }}>
                      {getCategoryIcon(category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-theme-text-light capitalize tracking-wide">{category}</div>
                      <div className="text-[11px] text-theme-text-muted truncate mt-0.5 max-w-[180px] font-medium" title={poi.name}>
                        {poi.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 font-mono">
                    <div className="text-xs font-bold text-theme-text-light">{distance_km} km</div>
                    <div className="text-[9px] text-theme-text-muted mt-0.5 font-bold uppercase">{direction} Direction</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 p-3 bg-black/20 border border-theme-border/30 rounded-xl text-[10px] text-theme-text-muted leading-relaxed font-mono font-medium">
          Note: Distances calculated dynamically using the great-circle Haversine formula based on geocoded points of interest relative to the listing coordinates.
        </div>
      </div>
    </div>
  );
}
