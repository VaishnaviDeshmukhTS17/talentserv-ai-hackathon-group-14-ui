import { useState } from 'react';
import { CleanedProperty } from '../../assets/mockData';
import { Compass, Flame, Bed, Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface VastuCompassWidgetProps {
  property: CleanedProperty;
}

export default function VastuCompassWidget({ property }: VastuCompassWidgetProps) {
  const [hoveredItem, setHoveredItem] = useState<'entrance' | 'kitchen' | 'bedroom' | 'pooja' | null>(null);

  const vastu_score = property.vastu_score !== undefined ? property.vastu_score : 0;
  const vastu_compliant_level = property.vastu_compliant_level || 'Moderate';
  const vastu_details = property.vastu_details || {
    facing_direction: 'East',
    kitchen_direction: 'South-East',
    bedroom_direction: 'South-West',
    layout_shape: 'Rectangular'
  };
  const { facing_direction, kitchen_direction, bedroom_direction, pooja_direction, layout_shape } = vastu_details;

  // Directions mapping to angles (North is top = 270 deg)
  const getAngle = (dir: string): number => {
    switch (dir) {
      case 'North': return 270;
      case 'North-East': return 315;
      case 'East': return 0;
      case 'South-East': return 45;
      case 'South': return 90;
      case 'South-West': return 135;
      case 'West': return 180;
      case 'North-West': return 225;
      default: return 0;
    }
  };

  // Get Cartesian coordinates (centered at 100, 100 with radius r)
  const getCoordinates = (dir: string, radius: number) => {
    const angleRad = (getAngle(dir) * Math.PI) / 180;
    const cx = 100;
    const cy = 100;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad),
    };
  };

  // Determine compliance status and suggestions
  const getComplianceStatus = (element: 'entrance' | 'kitchen' | 'bedroom' | 'pooja' | 'shape', val: string) => {
    switch (element) {
      case 'entrance':
        if (['East', 'North', 'North-East'].includes(val)) {
          return { isOk: true, label: 'Compliant', remedy: '' };
        }
        if (['North-West', 'South-East', 'West'].includes(val)) {
          return { isOk: false, label: 'Suboptimal', remedy: 'Hang a silver Swastika or Vastu pyramid above the entrance frame.' };
        }
        return { isOk: false, label: 'Remedy Recommended', remedy: 'Fix a brass threshold strip at the entrance door to block energy leakage.' };
      case 'kitchen':
        if (['South-East', 'North-West'].includes(val)) {
          return { isOk: true, label: 'Compliant', remedy: '' };
        }
        return { isOk: false, label: 'Suboptimal', remedy: 'Place a small yellow marble slab under the stove or keep a copper sun symbol on the wall.' };
      case 'bedroom':
        if (['South-West', 'South'].includes(val)) {
          return { isOk: true, label: 'Compliant', remedy: '' };
        }
        return { isOk: false, label: 'Suboptimal', remedy: 'Position the bed so head points South, and avoid placing mirrors facing the bed.' };
      case 'pooja':
        if (val === 'North-East') {
          return { isOk: true, label: 'Compliant', remedy: '' };
        }
        return { isOk: false, label: 'Suboptimal', remedy: 'Ensure prayer altar is on the East or North wall, and keep this area clutter-free.' };
      case 'shape':
        if (['Square', 'Rectangular'].includes(val)) {
          return { isOk: true, label: 'Compliant', remedy: '' };
        }
        return { isOk: false, label: 'Remedy Recommended', remedy: 'Place mirrors or crystal globes in cut corners to virtually complete the shape.' };
      default:
        return { isOk: true, label: 'Compliant', remedy: '' };
    }
  };

  const entranceStatus = getComplianceStatus('entrance', facing_direction);
  const kitchenStatus = getComplianceStatus('kitchen', kitchen_direction);
  const bedroomStatus = getComplianceStatus('bedroom', bedroom_direction);
  const poojaStatus = pooja_direction ? getComplianceStatus('pooja', pooja_direction) : null;
  const shapeStatus = getComplianceStatus('shape', layout_shape);

  // SVG coordinates for plotting elements on the compass
  const entranceCoords = getCoordinates(facing_direction, 65);
  const kitchenCoords = getCoordinates(kitchen_direction, 65);
  const bedroomCoords = getCoordinates(bedroom_direction, 65);
  const poojaCoords = pooja_direction ? getCoordinates(pooja_direction, 65) : null;

  // Visual classes for Vastu Score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
    return 'text-red-400 border-red-500/30 bg-red-950/20';
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 shadow-emerald-500/30';
    if (score >= 50) return 'bg-amber-500 shadow-amber-500/30';
    return 'bg-red-500 shadow-red-500/30';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 xs:gap-5 md:gap-6 p-4 xs:p-5 glass-panel rounded-xl animate-in fade-in duration-300">
      
      {/* Col 1: Compass Display (lg: 5 cols) */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 border border-theme-border rounded-lg bg-theme-input/30 relative">
        <h4 className="text-xs font-mono uppercase tracking-wider text-theme-text-muted mb-4 flex items-center gap-1.5 font-semibold">
          <Compass className="w-4 h-4 text-theme-accent animate-pulse" /> Vastu Compass Orientation
        </h4>
        
        {/* SVG Compass */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 select-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Ambient glow backing for compass */}
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(167,139,250,0.05)" strokeWidth="10" className="blur-md" />
            
            {/* Outer Ring */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="var(--theme-border)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="76" fill="none" stroke="var(--theme-border)" strokeWidth="0.5" strokeDasharray="3,3" />
            
            {/* Concentric Inner Ring */}
            <circle cx="100" cy="100" r="50" fill="none" stroke="var(--theme-border)" strokeWidth="0.5" />
            
            {/* Cross Lines (N-S, E-W) */}
            <line x1="100" y1="20" x2="100" y2="180" stroke="var(--theme-border)" strokeWidth="0.5" strokeDasharray="2,4" />
            <line x1="20" y1="100" x2="180" y2="100" stroke="var(--theme-border)" strokeWidth="0.5" strokeDasharray="2,4" />

            {/* Direction Labels */}
            <text x="100" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444" className="font-mono">N</text>
            <text x="100" y="192" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--theme-text-muted)" className="font-mono">S</text>
            <text x="192" y="103" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--theme-text-muted)" className="font-mono">E</text>
            <text x="8" y="103" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--theme-text-muted)" className="font-mono">W</text>
            
            {/* Ordinals */}
            <text x="160" y="44" textAnchor="middle" fontSize="7" fill="var(--theme-text-muted)" opacity="0.6" className="font-mono">NE</text>
            <text x="160" y="162" textAnchor="middle" fontSize="7" fill="var(--theme-text-muted)" opacity="0.6" className="font-mono">SE</text>
            <text x="40" y="162" textAnchor="middle" fontSize="7" fill="var(--theme-text-muted)" opacity="0.6" className="font-mono">SW</text>
            <text x="40" y="44" textAnchor="middle" fontSize="7" fill="var(--theme-text-muted)" opacity="0.6" className="font-mono">NW</text>

            {/* Rotated Pointer Arrow towards property's Facing Direction */}
            <g transform={`rotate(${getAngle(facing_direction) - 90} 100 100)`}>
              {/* Compass Needle - facing side (accent color) */}
              <polygon points="100,32 106,100 100,90" fill="var(--theme-accent)" />
              {/* Compass Needle - tail side (muted) */}
              <polygon points="100,168 106,100 100,90" fill="rgba(255,255,255,0.15)" />
              <polygon points="100,32 94,100 100,90" fill="var(--theme-accent)" opacity="0.8" />
              <polygon points="100,168 94,100 100,90" fill="rgba(255,255,255,0.1)" />
              <circle cx="100" cy="100" r="4" fill="var(--theme-bg)" stroke="var(--theme-accent)" strokeWidth="1.5" />
            </g>

            {/* Interactive PLOTTED DOTS */}
            
            {/* 1. Entrance Dot (facing direction) */}
            <g 
              onMouseEnter={() => setHoveredItem('entrance')}
              onMouseLeave={() => setHoveredItem(null)}
              className="cursor-pointer transition-all duration-300"
            >
              {hoveredItem === 'entrance' && (
                <circle cx={entranceCoords.x} cy={entranceCoords.y} r="10" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="animate-ping" />
              )}
              <circle cx={entranceCoords.x} cy={entranceCoords.y} r="7" fill="#38bdf8" stroke="var(--theme-bg)" strokeWidth="1.5" />
              <text x={entranceCoords.x} y={entranceCoords.y + 2.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="black" className="font-mono pointer-events-none">E</text>
            </g>

            {/* 2. Kitchen Dot */}
            <g 
              onMouseEnter={() => setHoveredItem('kitchen')}
              onMouseLeave={() => setHoveredItem(null)}
              className="cursor-pointer transition-all duration-300"
            >
              {hoveredItem === 'kitchen' && (
                <circle cx={kitchenCoords.x} cy={kitchenCoords.y} r="10" fill="none" stroke="#f97316" strokeWidth="1.5" className="animate-ping" />
              )}
              <circle cx={kitchenCoords.x} cy={kitchenCoords.y} r="7" fill="#f97316" stroke="var(--theme-bg)" strokeWidth="1.5" />
              <text x={kitchenCoords.x} y={kitchenCoords.y + 2.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="black" className="font-mono pointer-events-none">K</text>
            </g>

            {/* 3. Bedroom Dot */}
            <g 
              onMouseEnter={() => setHoveredItem('bedroom')}
              onMouseLeave={() => setHoveredItem(null)}
              className="cursor-pointer transition-all duration-300"
            >
              {hoveredItem === 'bedroom' && (
                <circle cx={bedroomCoords.x} cy={bedroomCoords.y} r="10" fill="none" stroke="#a78bfa" strokeWidth="1.5" className="animate-ping" />
              )}
              <circle cx={bedroomCoords.x} cy={bedroomCoords.y} r="7" fill="#a78bfa" stroke="var(--theme-bg)" strokeWidth="1.5" />
              <text x={bedroomCoords.x} y={bedroomCoords.y + 2.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="black" className="font-mono pointer-events-none">B</text>
            </g>

            {/* 4. Pooja Dot */}
            {poojaCoords && pooja_direction && (
              <g 
                onMouseEnter={() => setHoveredItem('pooja')}
                onMouseLeave={() => setHoveredItem(null)}
                className="cursor-pointer transition-all duration-300"
              >
                {hoveredItem === 'pooja' && (
                  <circle cx={poojaCoords.x} cy={poojaCoords.y} r="10" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-ping" />
                )}
                <circle cx={poojaCoords.x} cy={poojaCoords.y} r="7" fill="#fbbf24" stroke="var(--theme-bg)" strokeWidth="1.5" />
                <text x={poojaCoords.x} y={poojaCoords.y + 2.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="black" className="font-mono pointer-events-none">P</text>
              </g>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-4 text-[10px] font-mono text-theme-text-muted">
          <span className="flex items-center gap-1"><circle cx="4" cy="4" r="4" fill="#38bdf8" /> Entrance (E)</span>
          <span className="flex items-center gap-1"><circle cx="4" cy="4" r="4" fill="#f97316" /> Kitchen (K)</span>
          <span className="flex items-center gap-1"><circle cx="4" cy="4" r="4" fill="#a78bfa" /> Bedroom (B)</span>
          {pooja_direction && (
            <span className="flex items-center gap-1"><circle cx="4" cy="4" r="4" fill="#fbbf24" /> Pooja (P)</span>
          )}
        </div>
      </div>

      {/* Col 2: Vastu Audit Checklist & Remedy (lg: 7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between">
        
        {/* Score Header */}
        <div className="flex items-center justify-between border-b border-theme-border pb-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Vastu Audit Report
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getScoreColor(vastu_score)} font-mono font-bold tracking-wide`}>
                {vastu_compliant_level}
              </span>
            </h3>
            <p className="text-xs text-theme-text-muted mt-1">Detailed directional compliance matching architectural shastras.</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-white">{vastu_score}%</span>
            <div className="text-[10px] text-theme-text-muted uppercase tracking-wider font-mono">Score</div>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full h-1.5 bg-theme-border rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${getScoreProgressColor(vastu_score)}`} 
            style={{ width: `${vastu_score}%` }} 
          />
        </div>

        {/* Compliance Checklist Grid */}
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {/* Entrance */}
          <div 
            onMouseEnter={() => setHoveredItem('entrance')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-start justify-between p-2 rounded-lg border transition-colors ${
              hoveredItem === 'entrance' ? 'bg-theme-card-hover border-theme-accent/30' : 'border-transparent hover:bg-theme-card/30'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Property Entrance</div>
                <div className="text-[11px] text-theme-text-muted">Facing: <span className="font-semibold text-white">{facing_direction}</span> (Ideal: East / North)</div>
              </div>
            </div>
            <div>
              {entranceStatus.isOk ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Compliant</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-500/20"><AlertTriangle className="w-3 h-3" /> Suboptimal</span>
              )}
            </div>
          </div>

          {/* Kitchen */}
          <div 
            onMouseEnter={() => setHoveredItem('kitchen')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-start justify-between p-2 rounded-lg border transition-colors ${
              hoveredItem === 'kitchen' ? 'bg-theme-card-hover border-theme-accent/30' : 'border-transparent hover:bg-theme-card/30'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Kitchen Placement</div>
                <div className="text-[11px] text-theme-text-muted">Zone: <span className="font-semibold text-white">{kitchen_direction}</span> (Ideal: South-East / North-West)</div>
              </div>
            </div>
            <div>
              {kitchenStatus.isOk ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Compliant</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-500/20"><AlertTriangle className="w-3 h-3" /> Suboptimal</span>
              )}
            </div>
          </div>

          {/* Master Bedroom */}
          <div 
            onMouseEnter={() => setHoveredItem('bedroom')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-start justify-between p-2 rounded-lg border transition-colors ${
              hoveredItem === 'bedroom' ? 'bg-theme-card-hover border-theme-accent/30' : 'border-transparent hover:bg-theme-card/30'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Bed className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Master Bedroom</div>
                <div className="text-[11px] text-theme-text-muted">Zone: <span className="font-semibold text-white">{bedroom_direction}</span> (Ideal: South-West / South)</div>
              </div>
            </div>
            <div>
              {bedroomStatus.isOk ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Compliant</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-500/20"><AlertTriangle className="w-3 h-3" /> Suboptimal</span>
              )}
            </div>
          </div>

          {/* Pooja Room */}
          {pooja_direction && poojaStatus && (
            <div 
              onMouseEnter={() => setHoveredItem('pooja')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex items-start justify-between p-2 rounded-lg border transition-colors ${
                hoveredItem === 'pooja' ? 'bg-theme-card-hover border-theme-accent/30' : 'border-transparent hover:bg-theme-card/30'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Pooja Room (prayer altar)</div>
                  <div className="text-[11px] text-theme-text-muted">Zone: <span className="font-semibold text-white">{pooja_direction}</span> (Ideal: North-East)</div>
                </div>
              </div>
              <div>
                {poojaStatus.isOk ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Compliant</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-500/20"><AlertTriangle className="w-3 h-3" /> Suboptimal</span>
                )}
              </div>
            </div>
          )}

          {/* Layout Shape */}
          <div className="flex items-start justify-between p-2 rounded-lg border border-transparent hover:bg-theme-card/30 transition-colors">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Layout Structure Shape</div>
                <div className="text-[11px] text-theme-text-muted">Shape: <span className="font-semibold text-white">{layout_shape}</span> (Ideal: Square / Rectangular)</div>
              </div>
            </div>
            <div>
              {shapeStatus.isOk ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Compliant</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-500/20"><AlertTriangle className="w-3 h-3" /> Remedy</span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Remedy Section */}
        {vastu_score < 100 && (
          <div className="mt-4 p-3 rounded-lg border border-amber-900/30 bg-amber-950/10 text-amber-400 text-xs">
            <div className="font-semibold uppercase tracking-wider text-[9px] font-mono mb-1.5 flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" /> Recommended Remedial Correction
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {!entranceStatus.isOk && <li><strong>Entrance facing {facing_direction}:</strong> {entranceStatus.remedy}</li>}
              {!kitchenStatus.isOk && <li><strong>Kitchen in {kitchen_direction}:</strong> {kitchenStatus.remedy}</li>}
              {!bedroomStatus.isOk && <li><strong>Master bedroom in {bedroom_direction}:</strong> {bedroomStatus.remedy}</li>}
              {poojaStatus && !poojaStatus.isOk && <li><strong>Pooja room in {pooja_direction}:</strong> {poojaStatus.remedy}</li>}
              {!shapeStatus.isOk && <li><strong>{layout_shape} layout structure:</strong> {shapeStatus.remedy}</li>}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}
