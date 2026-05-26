import { useState, useEffect } from 'react';
import { CleanedProperty } from '../../assets/mockData';
import { vastuExplain } from '../../services/apiClient';
import { 
  Compass, 
  Flame, 
  Bed, 
  Sparkles, 
  Home, 
  Tv, 
  Bath, 
  Sun, 
  Loader2, 
  Brain, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

interface FloorPlanExplainerProps {
  property: CleanedProperty;
  hoveredItem?: 'entrance' | 'kitchen' | 'bedroom' | 'pooja' | null;
  setHoveredItem?: (item: 'entrance' | 'kitchen' | 'bedroom' | 'pooja' | null) => void;
}

interface SectorInfo {
  id: 'NW' | 'N' | 'NE' | 'W' | 'Center' | 'E' | 'SW' | 'S' | 'SE';
  direction: string;
  roomType: 'entrance' | 'kitchen' | 'bedroom' | 'pooja' | 'living' | 'balcony' | 'bathroom' | 'dining' | 'kids_bed' | 'utility';
  displayName: string;
  isCompliant: boolean;
  remedy?: string;
}

export default function FloorPlanExplainer({ property, hoveredItem, setHoveredItem }: FloorPlanExplainerProps) {
  const [auraEnabled, setAuraEnabled] = useState<boolean>(true);

  const vastu_details = property.vastu_details || {
    facing_direction: 'East',
    kitchen_direction: 'South-East',
    bedroom_direction: 'South-West',
    layout_shape: 'Rectangular'
  };

  const { facing_direction, kitchen_direction, bedroom_direction, pooja_direction } = vastu_details;

  // Determine compliance status and suggestions
  const getComplianceInfo = (element: 'entrance' | 'kitchen' | 'bedroom' | 'pooja' | 'shape', val: string) => {
    switch (element) {
      case 'entrance':
        if (['East', 'North', 'North-East'].includes(val)) {
          return { isOk: true, remedy: '' };
        }
        if (['North-West', 'South-East', 'West'].includes(val)) {
          return { isOk: false, remedy: 'Hang a silver Swastika or Vastu pyramid above the entrance frame.' };
        }
        return { isOk: false, remedy: 'Fix a brass threshold strip at the entrance door to block energy leakage.' };
      case 'kitchen':
        if (['South-East', 'North-West'].includes(val)) {
          return { isOk: true, remedy: '' };
        }
        return { isOk: false, remedy: 'Place a small yellow marble slab under the stove or keep a copper sun symbol on the wall.' };
      case 'bedroom':
        if (['South-West', 'South'].includes(val)) {
          return { isOk: true, remedy: '' };
        }
        return { isOk: false, remedy: 'Position the bed so head points South, and avoid placing mirrors facing the bed.' };
      case 'pooja':
        if (val === 'North-East') {
          return { isOk: true, remedy: '' };
        }
        return { isOk: false, remedy: 'Ensure prayer altar is on the East or North wall, and keep this area clutter-free.' };
      case 'shape':
        if (['Square', 'Rectangular'].includes(val)) {
          return { isOk: true, remedy: '' };
        }
        return { isOk: false, remedy: 'Place mirrors or crystal globes in cut corners to virtually complete the shape.' };
      default:
        return { isOk: true, remedy: '' };
    }
  };

  const entranceStatus = getComplianceInfo('entrance', facing_direction);
  const kitchenStatus = getComplianceInfo('kitchen', kitchen_direction);
  const bedroomStatus = getComplianceInfo('bedroom', bedroom_direction);
  const poojaStatus = pooja_direction ? getComplianceInfo('pooja', pooja_direction) : null;

  // Build the dynamic 3x3 layout mapping
  const defaultSectors: Record<string, Omit<SectorInfo, 'id' | 'direction'>> = {
    'NW': { roomType: 'kids_bed', displayName: 'Kids Bedroom', isCompliant: true },
    'N': { roomType: 'balcony', displayName: 'Balcony', isCompliant: true },
    'NE': { roomType: 'dining', displayName: 'Dining Area', isCompliant: true },
    'W': { roomType: 'bathroom', displayName: 'Bathroom', isCompliant: true },
    'Center': { roomType: 'living', displayName: 'Living Room', isCompliant: true },
    'E': { roomType: 'balcony', displayName: 'Balcony', isCompliant: true },
    'SW': { roomType: 'utility', displayName: 'Utility Area', isCompliant: true },
    'S': { roomType: 'bathroom', displayName: 'Washroom', isCompliant: true },
    'SE': { roomType: 'dining', displayName: 'Dining Room', isCompliant: true }
  };

  const directionToIdMap: Record<string, 'NW' | 'N' | 'NE' | 'W' | 'Center' | 'E' | 'SW' | 'S' | 'SE'> = {
    'North-West': 'NW',
    'North': 'N',
    'North-East': 'NE',
    'West': 'W',
    'East': 'E',
    'South-West': 'SW',
    'South': 'S',
    'South-East': 'SE'
  };

  // Overlay core rooms
  const entranceId = directionToIdMap[facing_direction];
  if (entranceId) {
    defaultSectors[entranceId] = {
      roomType: 'entrance',
      displayName: 'Main Entrance',
      isCompliant: entranceStatus.isOk,
      remedy: entranceStatus.remedy
    };
  }

  const kitchenId = directionToIdMap[kitchen_direction];
  if (kitchenId) {
    defaultSectors[kitchenId] = {
      roomType: 'kitchen',
      displayName: 'Kitchen',
      isCompliant: kitchenStatus.isOk,
      remedy: kitchenStatus.remedy
    };
  }

  const bedroomId = directionToIdMap[bedroom_direction];
  if (bedroomId) {
    defaultSectors[bedroomId] = {
      roomType: 'bedroom',
      displayName: 'Master Bedroom',
      isCompliant: bedroomStatus.isOk,
      remedy: bedroomStatus.remedy
    };
  }

  if (pooja_direction && poojaStatus) {
    const poojaId = directionToIdMap[pooja_direction];
    if (poojaId) {
      defaultSectors[poojaId] = {
        roomType: 'pooja',
        displayName: 'Pooja Room',
        isCompliant: poojaStatus.isOk,
        remedy: poojaStatus.remedy
      };
    }
  } else {
    if (defaultSectors['NE'].roomType === 'dining') {
      defaultSectors['NE'] = {
        roomType: 'pooja',
        displayName: 'Pooja Altar',
        isCompliant: true
      };
    }
  }

  const sectors: SectorInfo[] = [
    { id: 'NW', direction: 'North-West', ...defaultSectors['NW'] },
    { id: 'N', direction: 'North', ...defaultSectors['N'] },
    { id: 'NE', direction: 'North-East', ...defaultSectors['NE'] },
    { id: 'W', direction: 'West', ...defaultSectors['W'] },
    { id: 'Center', direction: 'Brahmasthan', ...defaultSectors['Center'] },
    { id: 'E', direction: 'East', ...defaultSectors['E'] },
    { id: 'SW', direction: 'South-West', ...defaultSectors['SW'] },
    { id: 'S', direction: 'South', ...defaultSectors['S'] },
    { id: 'SE', direction: 'South-East', ...defaultSectors['SE'] }
  ];

  // Active room state selection
  const [selectedSector, setSelectedSector] = useState<SectorInfo>(
    sectors.find(s => s.roomType === 'bedroom') || sectors[4]
  );
  
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('');

  // Handle room selection click
  const handleSelectSector = (sector: SectorInfo) => {
    setSelectedSector(sector);
    setAiExplanation('');
    setTypedText('');
  };

  // Request AI explainer for the selected room
  const handleAskAI = async () => {
    setIsLoading(true);
    setAiExplanation('');
    setTypedText('');
    try {
      const res = await vastuExplain(
        property.title,
        selectedSector.displayName,
        selectedSector.direction,
        selectedSector.isCompliant,
        selectedSector.remedy
      );
      setAiExplanation(res.explanation);
    } catch (e) {
      console.error(e);
      setAiExplanation('Unable to contact the AI assistant at this time. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Typewriter effect for AI response
  useEffect(() => {
    if (!aiExplanation) return;
    
    let index = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + aiExplanation.charAt(index));
      index++;
      if (index >= aiExplanation.length) {
        clearInterval(interval);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [aiExplanation]);

  // Sector icon resolver
  const getSectorIcon = (type: string, isSelected: boolean) => {
    const sizeClass = "w-5 h-5 transition-transform duration-300 " + (isSelected ? "scale-110" : "");
    switch (type) {
      case 'entrance':
        return <Compass className={`${sizeClass} text-sky-400`} />;
      case 'kitchen':
        return <Flame className={`${sizeClass} text-orange-400`} />;
      case 'bedroom':
      case 'kids_bed':
        return <Bed className={`${sizeClass} text-purple-400`} />;
      case 'pooja':
        return <Sparkles className={`${sizeClass} text-amber-400`} />;
      case 'living':
        return <Tv className={`${sizeClass} text-teal-400`} />;
      case 'bathroom':
        return <Bath className={`${sizeClass} text-indigo-400`} />;
      case 'balcony':
        return <Sun className={`${sizeClass} text-yellow-400`} />;
      default:
        return <Home className={`${sizeClass} text-slate-400`} />;
    }
  };

  // Get rotation angle from Center (150, 150) to the center of target sector
  const getSectorAngle = (sectorId: string): number => {
    switch (sectorId) {
      case 'E': return 0;
      case 'SE': return 45;
      case 'S': return 90;
      case 'SW': return 135;
      case 'W': return 180;
      case 'NW': return 225;
      case 'N': return 270;
      case 'NE': return 315;
      default: return 0;
    }
  };

  // Sync hovered state up to the VastuCompass parent widget if callback exists
  const handleMouseEnterSector = (sector: SectorInfo) => {
    if (setHoveredItem) {
      if (['entrance', 'kitchen', 'bedroom', 'pooja'].includes(sector.roomType)) {
        setHoveredItem(sector.roomType as any);
      }
    }
  };

  const handleMouseLeaveSector = () => {
    if (setHoveredItem) {
      setHoveredItem(null);
    }
  };

  // Map sector details to Aura gradients
  const getAuraFill = (sector: SectorInfo) => {
    if (!auraEnabled) return 'none';
    if (['entrance', 'kitchen', 'bedroom', 'pooja'].includes(sector.roomType)) {
      return sector.isCompliant ? 'url(#aura-green)' : 'url(#aura-amber)';
    }
    if (sector.roomType === 'living') {
      return 'url(#aura-blue)';
    }
    return 'url(#aura-neutral)';
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Controls panel: Aura Heatmap Switch */}
      <div className="flex justify-between items-center w-full mb-4 px-1">
        <span className="text-[11px] font-mono text-theme-text-muted flex items-center gap-1.5 font-bold uppercase tracking-wider">
          {auraEnabled ? <Eye className="w-3.5 h-3.5 text-theme-accent" /> : <EyeOff className="w-3.5 h-3.5 text-theme-text-muted" />}
          Vastu Aura Analyzer
        </span>
        <button
          onClick={() => setAuraEnabled(!auraEnabled)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            auraEnabled ? 'bg-theme-accent' : 'bg-theme-card border-theme-border/50'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              auraEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* SVG 2D Floor Plan Canvas */}
      <div className="w-full max-w-[280px] sm:max-w-[310px] bg-theme-bg/60 p-4 rounded-2xl border border-theme-border relative overflow-hidden backdrop-blur-md shadow-inner">
        <svg viewBox="0 0 300 300" className="w-full h-full text-theme-text-muted">
          {/* Definitions for gradients and grid layout */}
          <defs>
            <radialGradient id="aura-green" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="aura-amber" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="aura-blue" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="aura-neutral" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.18" />
              <stop offset="80%" stopColor="#64748b" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
            </radialGradient>
            {/* Grid Pattern */}
            <pattern id="floor-blueprint-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="300" height="300" fill="url(#floor-blueprint-grid)" rx="8" />

          {/* Sectors loop (Interactive Areas & Aura overlays) */}
          {sectors.map((sector) => {
            const isSelected = selectedSector.id === sector.id;
            const isHovered = hoveredItem && (
              (sector.roomType === 'entrance' && hoveredItem === 'entrance') ||
              (sector.roomType === 'kitchen' && hoveredItem === 'kitchen') ||
              (sector.roomType === 'bedroom' && hoveredItem === 'bedroom') ||
              (sector.roomType === 'pooja' && hoveredItem === 'pooja')
            );

            // Compute center of sector
            let cx = 50, cy = 50;
            if (sector.id.includes('E')) cx = 250;
            else if (!sector.id.includes('W') && sector.id !== 'N' && sector.id !== 'S' && sector.id !== 'Center') cx = 150;
            if (sector.id === 'N') cx = 150;
            if (sector.id === 'S') cx = 150;
            if (sector.id === 'Center') cx = 150;

            if (sector.id.includes('S')) cy = 250;
            else if (!sector.id.includes('N') && sector.id !== 'W' && sector.id !== 'E' && sector.id !== 'Center') cy = 150;
            if (sector.id === 'W') cy = 150;
            if (sector.id === 'E') cy = 150;
            if (sector.id === 'Center') cy = 150;

            const rx = cx - 50;
            const ry = cy - 50;

            return (
              <g 
                key={sector.id} 
                onClick={() => handleSelectSector(sector)}
                onMouseEnter={() => handleMouseEnterSector(sector)}
                onMouseLeave={handleMouseLeaveSector}
                className="cursor-pointer group"
              >
                {/* Aura Energy Glow */}
                {auraEnabled && (
                  <circle cx={cx} cy={cy} r="48" fill={getAuraFill(sector)} />
                )}

                {/* Sector Container Area */}
                <rect 
                  x={rx + 2.5} 
                  y={ry + 2.5} 
                  width="95" 
                  height="95" 
                  rx="6" 
                  fill={isSelected ? "rgba(167,139,250,0.06)" : "transparent"} 
                  stroke={isSelected ? "var(--theme-accent)" : isHovered ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)"}
                  strokeWidth={isSelected ? "1.5" : "1"}
                  className="transition-all duration-300"
                />

                {/* Draw CAD symbols inside sectors */}
                
                {/* Master Bedroom Symbol (SW) */}
                {sector.roomType === 'bedroom' && (
                  <g transform={`translate(${rx + 25}, ${ry + 20})`} stroke="currentColor" strokeWidth="1" fill="none" className="text-purple-400/50 group-hover:text-purple-400 transition-colors">
                    {/* Queen Bed Frame */}
                    <rect x="0" y="5" width="45" height="48" rx="2" strokeWidth="1.5" />
                    {/* Headboard */}
                    <rect x="0" y="5" width="45" height="6" fill="currentColor" opacity="0.2" />
                    {/* Pillows */}
                    <rect x="5" y="14" width="14" height="9" rx="1" />
                    <rect x="26" y="14" width="14" height="9" rx="1" />
                    {/* Blanket folds */}
                    <path d="M 0,32 L 45,32 M 0,38 L 45,38" strokeDasharray="2,2" />
                  </g>
                )}

                {/* Kids Bed Symbol (NW) */}
                {sector.roomType === 'kids_bed' && (
                  <g transform={`translate(${rx + 25}, ${ry + 20})`} stroke="currentColor" strokeWidth="1" fill="none" className="text-purple-400/40">
                    {/* Single Bed */}
                    <rect x="5" y="5" width="28" height="48" rx="2" />
                    <rect x="9" y="9" width="20" height="8" rx="1" />
                    {/* Side Desk */}
                    <rect x="35" y="5" width="12" height="15" rx="1" />
                    <circle cx="41" cy="12" r="2" />
                  </g>
                )}

                {/* Kitchen Symbol (SE) */}
                {sector.roomType === 'kitchen' && (
                  <g transform={`translate(${rx + 20}, ${ry + 20})`} stroke="currentColor" strokeWidth="1" fill="none" className="text-orange-400/50 group-hover:text-orange-400 transition-colors">
                    {/* L-Counter top */}
                    <path d="M 0,0 L 55,0 L 55,55 M 0,12 L 43,12 L 43,55" strokeWidth="1.2" />
                    {/* Kitchen sink */}
                    <rect x="8" y="18" width="16" height="12" rx="1" />
                    <circle cx="16" cy="20" r="1.5" />
                    {/* Double stove burners */}
                    <circle cx="48" cy="22" r="6" strokeWidth="1.2" />
                    <circle cx="48" cy="38" r="6" strokeWidth="1.2" />
                    <circle cx="48" cy="22" r="2" fill="currentColor" />
                    <circle cx="48" cy="38" r="2" fill="currentColor" />
                  </g>
                )}

                {/* Pooja Temple Altar Symbol (NE) */}
                {sector.roomType === 'pooja' && (
                  <g transform={`translate(${rx + 30}, ${ry + 20})`} stroke="currentColor" strokeWidth="1" fill="none" className="text-amber-400/50 group-hover:text-amber-400 transition-colors">
                    {/* Temple Platform */}
                    <rect x="0" y="35" width="40" height="12" rx="2" strokeWidth="1.2" />
                    {/* Temple Spire Structure */}
                    <path d="M 5,35 L 20,5 L 35,35 Z" strokeWidth="1.2" />
                    <path d="M 20,5 L 20,0 M 20,0 L 26,3 Z" fill="currentColor" />
                    {/* Little oil lamp flame */}
                    <path d="M 17,28 C 17,25 20,20 20,20 C 20,20 23,25 23,28 C 23,30 20,32 20,32 C 20,32 17,30 17,28 Z" fill="currentColor" opacity="0.3" />
                  </g>
                )}

                {/* Bathroom Symbol (W, S) */}
                {sector.roomType === 'bathroom' && (
                  <g transform={`translate(${rx + 25}, ${ry + 20})`} stroke="currentColor" strokeWidth="1" fill="none" className="text-indigo-400/40">
                    {/* Toilet basin */}
                    <path d="M 5,20 C 5,10 18,10 18,20 C 18,28 14,35 14,40 L 5,40 Z" />
                    <rect x="3" y="40" width="16" height="8" rx="1" />
                    {/* Shower partition glass */}
                    <line x1="30" y1="5" x2="30" y2="48" strokeDasharray="2,2" />
                    <circle cx="40" cy="15" r="4" />
                  </g>
                )}

                {/* Dining table (NE fallback or general dining) */}
                {sector.roomType === 'dining' && (
                  <g transform={`translate(${rx + 20}, ${ry + 25})`} stroke="currentColor" strokeWidth="1" fill="none" className="text-slate-400/40">
                    {/* Oval Table */}
                    <rect x="10" y="10" width="40" height="28" rx="14" strokeWidth="1.2" />
                    {/* Chairs */}
                    <circle cx="30" cy="5" r="3.5" fill="currentColor" />
                    <circle cx="30" cy="43" r="3.5" fill="currentColor" />
                    <circle cx="5" cy="24" r="3.5" fill="currentColor" />
                    <circle cx="55" cy="24" r="3.5" fill="currentColor" />
                  </g>
                )}

                {/* Balcony Railings (N, E) */}
                {sector.roomType === 'balcony' && (
                  <g transform={`translate(${rx + 10}, ${ry + 10})`} stroke="currentColor" strokeWidth="1" fill="none" className="text-yellow-500/40">
                    {/* Railings */}
                    <rect x="0" y="5" width="80" height="8" strokeDasharray="3,3" />
                    <line x1="0" y1="9" x2="80" y2="9" strokeWidth="1.5" />
                    {/* Flower pots */}
                    <circle cx="20" cy="20" r="4" fill="currentColor" />
                    <circle cx="60" cy="20" r="4" fill="currentColor" />
                  </g>
                )}

                {/* Entrance Door swing details */}
                {sector.roomType === 'entrance' && (
                  <g transform={`translate(${cx}, ${cy})`} stroke="currentColor" strokeWidth="1.2" fill="none" className="text-sky-400/60 group-hover:text-sky-400 transition-colors">
                    {/* Entrance Door swing arc based on cardinal direction */}
                    {sector.direction === 'North' && (
                      <g transform="translate(0, -38)">
                        <line x1="-15" y1="0" x2="15" y2="0" strokeWidth="2" stroke="currentColor" />
                        <path d="M 0,0 A 15,15 0 0,1 15,15" strokeDasharray="2,2" />
                      </g>
                    )}
                    {sector.direction === 'East' && (
                      <g transform="translate(38, 0) rotate(90)">
                        <line x1="-15" y1="0" x2="15" y2="0" strokeWidth="2" stroke="currentColor" />
                        <path d="M 0,0 A 15,15 0 0,1 15,15" strokeDasharray="2,2" />
                      </g>
                    )}
                    {sector.direction === 'West' && (
                      <g transform="translate(-38, 0) rotate(-90)">
                        <line x1="-15" y1="0" x2="15" y2="0" strokeWidth="2" stroke="currentColor" />
                        <path d="M 0,0 A 15,15 0 0,1 15,15" strokeDasharray="2,2" />
                      </g>
                    )}
                    {sector.direction === 'South' && (
                      <g transform="translate(0, 38) rotate(180)">
                        <line x1="-15" y1="0" x2="15" y2="0" strokeWidth="2" stroke="currentColor" />
                        <path d="M 0,0 A 15,15 0 0,1 15,15" strokeDasharray="2,2" />
                      </g>
                    )}
                    {/* Default diagonal entry arrow */}
                    {['North-East', 'North-West', 'South-East', 'South-West'].includes(sector.direction) && (
                      <g transform="translate(-10, -10)">
                        <path d="M 0,0 L 12,12 M 12,12 L 4,12 M 12,12 L 12,4" strokeWidth="2" stroke="currentColor" />
                      </g>
                    )}
                  </g>
                )}

                {/* Brahmasthan Center Dial Pointer */}
                {sector.id === 'Center' && (
                  <g transform="translate(50, 50)" className="text-teal-400/50 select-none">
                    {/* Central Courtyard Sofa outline */}
                    <path d="M 12,12 L 12,38 L 38,38" strokeWidth="1.2" fill="none" />
                    <rect x="22" y="10" width="16" height="10" rx="1" strokeWidth="0.8" />
                  </g>
                )}

                {/* Labels */}
                <text 
                  x={cx} 
                  y={ry + 78} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fontWeight="extrabold" 
                  fill={isSelected ? "var(--theme-accent)" : "var(--theme-text-light)"}
                  className="pointer-events-none select-none transition-colors duration-300 font-sans"
                >
                  {sector.displayName}
                </text>
                <text 
                  x={cx} 
                  y={ry + 89} 
                  textAnchor="middle" 
                  fontSize="8" 
                  fontWeight="bold" 
                  fill="var(--theme-text-muted)"
                  opacity="0.9"
                  className="pointer-events-none select-none font-mono tracking-wider"
                >
                  {sector.id}
                </text>
              </g>
            );
          })}

          {/* Blueprint Walls Layout (Frost Lines overlay) */}
          {/* Horizontal lines */}
          <line x1="5" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <line x1="140" y1="100" x2="200" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <line x1="200" y1="100" x2="295" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />

          <line x1="5" y1="200" x2="200" y2="200" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <line x1="240" y1="200" x2="295" y2="200" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />

          {/* Vertical lines */}
          <line x1="100" y1="5" x2="100" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <line x1="100" y1="140" x2="100" y2="295" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />

          <line x1="200" y1="5" x2="200" y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <line x1="200" y1="200" x2="200" y2="295" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />

          {/* Center Brahmasthan Vastu Dial (Embedded) */}
          <g transform="translate(150, 150)" className="select-none">
            {/* Ambient Back Glow */}
            <circle cx="0" cy="0" r="23" fill="var(--theme-bg)" stroke="var(--theme-border)" strokeWidth="1.5" className="shadow-2xl" />
            <circle cx="0" cy="0" r="18" fill="none" stroke="var(--theme-border)" strokeWidth="0.5" strokeDasharray="2,2" />
            
            {/* Tiny Cardinal Labels */}
            <text x="0" y="-12" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#ef4444" className="font-mono">N</text>
            <text x="0" y="16" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="var(--theme-text-muted)" className="font-mono">S</text>
            <text x="14" y="2.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="var(--theme-text-muted)" className="font-mono">E</text>
            <text x="-14" y="2.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="var(--theme-text-muted)" className="font-mono">W</text>

            {/* Rotating Arrow Needle pointing to selected room */}
            <g transform={`rotate(${getSectorAngle(selectedSector.id) - 90} 0 0)`} className="transition-transform duration-500 ease-out">
              {/* Compass Needle - Pointer (Accent) */}
              <polygon points="0,-16 4,0 0,-2" fill="var(--theme-accent)" />
              {/* Compass Needle - Tail (Muted) */}
              <polygon points="0,16 4,0 0,-2" fill="rgba(255,255,255,0.15)" />
              <polygon points="0,-16 -4,0 0,-2" fill="var(--theme-accent)" opacity="0.85" />
              <polygon points="0,16 -4,0 0,-2" fill="rgba(255,255,255,0.1)" />
              <circle cx="0" cy="0" r="2.5" fill="var(--theme-bg)" stroke="var(--theme-accent)" strokeWidth="1" />
            </g>
          </g>
        </svg>
      </div>

      {/* Interactive Information & AI Panel */}
      <div className="w-full mt-5 p-4 rounded-xl border border-theme-border/70 bg-theme-input/20 backdrop-blur-md animate-fadeIn shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border/40 pb-2.5 mb-3">
          <div>
            <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
              {getSectorIcon(selectedSector.roomType, true)}
              <span>{selectedSector.displayName}</span>
              <span className="text-[9px] font-mono text-theme-text-muted px-1.5 py-0.5 rounded bg-theme-card/60 border border-theme-border/20">
                {selectedSector.direction} ({selectedSector.id})
              </span>
            </h5>
          </div>
          <div>
            {['entrance', 'kitchen', 'bedroom', 'pooja'].includes(selectedSector.roomType) ? (
              selectedSector.isCompliant ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Compliant
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" /> Suboptimal
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-400 bg-slate-900/20 px-2 py-0.5 rounded border border-slate-500/20">
                Neutral Zone
              </span>
            )}
          </div>
        </div>

        {/* Explainers Box */}
        <div className="space-y-3.5 min-h-[95px] flex flex-col justify-between">
          <div className="text-[11px] leading-relaxed text-theme-text-light font-medium">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-4 text-theme-text-muted font-mono animate-pulse">
                <Loader2 className="w-5 h-5 text-theme-accent animate-spin mb-1.5" />
                <span>AI Agent analyzing spatial layout...</span>
              </div>
            ) : typedText ? (
              <p className="animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-theme-accent font-bold">AI Review: </span>
                {typedText}
              </p>
            ) : (
              <p className="text-theme-text-muted italic">
                Click "Ask AI Explainer" to generate a detailed architectural and energetic Vastu audit of this room.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-theme-border/30">
            <span className="text-[9px] text-theme-text-muted max-w-[62%] leading-snug">
              {!selectedSector.isCompliant && selectedSector.remedy 
                ? `Remedy: ${selectedSector.remedy}` 
                : "Placement matches standard residential architectural zones."}
            </span>
            <button
              onClick={handleAskAI}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold font-mono transition-all disabled:opacity-50 cursor-pointer shadow shadow-theme-accent/20"
            >
              <Brain className="w-3.5 h-3.5" />
              {typedText ? "Refetch Analysis" : "Ask AI Explainer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
