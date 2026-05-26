import React from 'react';
import ModalPortal from '../ModalPortal';
import { ExternalLink, Star, Upload, Trash2, CheckCircle2, AlertTriangle, FileText, ChevronDown, ChevronUp, Compass, X, MapPin, GripVertical } from 'lucide-react';
import { CleanedProperty, buildersData } from '../../assets/mockData';
import { ingestProperties, seedDatabase } from '../../services/apiClient';
import POIProximityList from './POIProximityList';
import VastuCompassWidget from './VastuCompassWidget';

interface PropertiesTabProps {
  properties: CleanedProperty[];
  propertyFilters: {
    source: string;
    status: string;
    sortBy: string;
    vastuMinScore: string;
  };
  setPropertyFilters: React.Dispatch<React.SetStateAction<{
    source: string;
    status: string;
    sortBy: string;
    vastuMinScore: string;
  }>>;
  selectedProperties: CleanedProperty[];
  toggleSelectProperty: (prop: CleanedProperty) => void;
  isLoading: boolean;
  setActiveTab: (tab: string) => void;
  onRefresh?: () => void;
}

export default function PropertiesTab({
  properties,
  propertyFilters,
  setPropertyFilters,
  selectedProperties,
  toggleSelectProperty,
  isLoading,
  setActiveTab,
  onRefresh
}: PropertiesTabProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isOpenIngest, setIsOpenIngest] = React.useState(false);
  const [activeMapProperty, setActiveMapProperty] = React.useState<CleanedProperty | null>(null);
  const [activeVastuProperty, setActiveVastuProperty] = React.useState<CleanedProperty | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        let parsedListings: any[] = [];
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          parsedListings = Array.isArray(json) ? json : [json];
        } else if (file.name.endsWith('.csv')) {
          parsedListings = parseCSV(text);
        } else {
          throw new Error("Unsupported file format. Please upload a .csv or .json file.");
        }

        if (parsedListings.length === 0) {
          throw new Error("No listings found in the uploaded file.");
        }

        // Map parsed fields to RawProperty schema
        const rawPropertiesList = parsedListings.map((item, idx) => {
          return {
            property_id: item.property_id || `UPLOAD_${Date.now()}_${idx}`,
            title: item.title || item.name || 'Custom Uploaded Listing',
            source: item.source || 'CSV/JSON Upload',
            source_url: item.source_url || '#',
            city: item.city || 'Pune',
            locality: item.locality || 'Hinjewadi',
            property_type: item.property_type || 'Apartment',
            transaction_type: ((item.transaction_type === 'Rent' || item.transaction_type === 'Rent/Buy') ? 'Rent' : 'Buy') as 'Buy' | 'Rent',
            bhk: item.bhk !== undefined ? item.bhk : 2,
            price: item.price !== undefined ? item.price : 0,
            area_sqft: item.area_sqft || item.area || 0,
            status: item.status || 'Ready to Move',
            builder_or_owner: item.builder_or_owner || item.builder || 'Unknown Builder',
            project_name: item.project_name || item.project || 'Unknown Project'
          };
        });

        await ingestProperties(rawPropertiesList);
        setUploadStatus({
          type: 'success',
          message: `Successfully ingested ${rawPropertiesList.length} properties into MongoDB via the Python API.`
        });
        
        if (onRefresh) {
          onRefresh();
        }
      } catch (err: any) {
        setUploadStatus({
          type: 'error',
          message: err?.message || "Failed to parse the file. Ensure it matches structural format templates."
        });
      }
    };
    reader.readAsText(file);
  };

  // Simple CSV parser
  const parseCSV = (text: string): any[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quotes in CSV values correctly
      const values: string[] = [];
      let currentVal = '';
      let inQuotes = false;
      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

      const obj: any = {};
      headers.forEach((header, idx) => {
        if (idx < values.length) {
          obj[header] = values[idx];
        }
      });
      result.push(obj);
    }
    return result;
  };

  const filteredProps = properties.filter(prop => {
    if (propertyFilters.source !== 'all') {
      const sourceVal = propertyFilters.source.toLowerCase();
      if (!prop.source.toLowerCase().includes(sourceVal)) return false;
    }
    if (propertyFilters.status !== 'all') {
      const isReadyProp = prop.status.toLowerCase().includes('ready');
      const wantsReady = propertyFilters.status === 'Ready to Move';
      if (isReadyProp !== wantsReady) return false;
    }
    if (propertyFilters.vastuMinScore && propertyFilters.vastuMinScore !== 'all') {
      const minScore = parseInt(propertyFilters.vastuMinScore, 10);
      if ((prop.vastu_score || 0) < minScore) return false;
    }
    return true;
  });

  const sortedProps = [...filteredProps].sort((a, b) => {
    if (propertyFilters.sortBy === 'price_asc') {
      return a.price - b.price;
    } else if (propertyFilters.sortBy === 'price_desc') {
      return b.price - a.price;
    } else {
      return (b.match_score || 0) - (a.match_score || 0);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-theme-text-light tracking-tight">Properties Ledger</h2>
          <p className="text-sm text-theme-text-muted mt-0.5">Explore comparative clean listings across primary sources</p>
        </div>

        <div className="flex items-center gap-3">
          {selectedProperties.length > 0 ? (
            <button
              onClick={() => setActiveTab('Comparisons')}
              className="px-4 py-2 bg-theme-accent hover:opacity-90 text-theme-bg text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-theme-shadow animate-pulse"
            >
              <span>Compare Selected ({selectedProperties.length})</span>
            </button>
          ) : (
            <span className="text-xs text-theme-text-muted font-mono bg-theme-accent-muted border border-theme-accent-border px-3 py-1.5 rounded-lg">
              Select up to 3 for comparison
            </span>
          )}
        </div>
      </div>

      {/* INGESTION PIPELINE PANEL */}
      <div className="aceternity-card p-5 rounded-2xl border border-theme-border/60 bg-theme-bg/20">
        <button 
          onClick={() => setIsOpenIngest(!isOpenIngest)}
          className="flex items-center justify-between w-full text-left focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-theme-accent" />
            <span className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono">Ingest Listings Spreadsheet</span>
          </div>
          {isOpenIngest ? <ChevronUp className="w-4 h-4 text-theme-text-muted" /> : <ChevronDown className="w-4 h-4 text-theme-text-muted" />}
        </button>

        {isOpenIngest && (
          <div className="mt-5 space-y-4 animate-fadeIn">
            <p className="text-xs text-theme-text-muted leading-relaxed font-mono">
              Upload raw spreadsheets containing new listing files. Supported fields: 
              <span className="text-theme-text-light font-bold"> property_id, title, price, area_sqft, bhk, locality, status, builder_or_owner, project_name</span>. 
              The pipeline will automatically apply normalizations and verify duplicate profiles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Drag and Drop Zone */}
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  dragActive 
                    ? 'border-theme-accent bg-theme-accent-muted' 
                    : 'border-theme-border bg-black/20 hover:border-theme-border-hover'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <input 
                  id="file-upload-input"
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <FileText className="w-8 h-8 text-theme-text-muted" />
                <div>
                  <span className="text-xs font-bold text-theme-text-light block">Drag & Drop listing file</span>
                  <span className="text-[10px] text-theme-text-muted font-mono block mt-1">Accepts .csv or .json</span>
                </div>
              </div>

              {/* Ingestion Templates & Actions */}
              <div className="p-4 bg-black/20 border border-theme-border rounded-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-theme-text-muted font-mono tracking-wider block">Templates & Options</span>
                  <div className="flex gap-2 flex-wrap">
                    <a 
                      href="data:text/csv;charset=utf-8,property_id,title,price,area_sqft,bhk,locality,status,builder_or_owner,project_name%0APROP901,Stunning%203BHK%20Hinjewadi%20Phase%202,Rs%2095%20L,1380%20sqft,3%20BHK,Hinjawadi,Ready,ABC%20Developers,Green%20Heights%0APROP902,Brand%20New%203BHK%20Wakad,1.15%20Cr,1400%20sq.ft.,3%20BHK,Wakad,Under%20Construction,XYZ%20Builders,Elanza%20Towers"
                      download="raw_listings_sample.csv"
                      className="px-2.5 py-1.5 rounded bg-theme-btn border border-theme-border hover:bg-theme-btn-hover text-[10px] text-theme-text font-bold font-mono transition-all block text-center"
                    >
                      Get Sample CSV
                    </a>
                    <a 
                      href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify([
                        {
                          property_id: "PROP903",
                          title: "Premium 2 BHK Apartment Hinjewadi",
                          price: "72 Lakh",
                          area_sqft: "920",
                          bhk: "2 BHK",
                          locality: "Hinjawadi",
                          status: "Ready to Move",
                          builder_or_owner: "Pride Group",
                          project_name: "Pride Purple"
                        }
                      ], null, 2))}`}
                      download="raw_listings_sample.json"
                      className="px-2.5 py-1.5 rounded bg-theme-btn border border-theme-border hover:bg-theme-btn-hover text-[10px] text-theme-text font-bold font-mono transition-all block text-center"
                    >
                      Get Sample JSON
                    </a>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      await seedDatabase(true);
                      setUploadStatus({ type: 'success', message: 'MongoDB re-seeded from default JSON via Python API.' });
                      if (onRefresh) onRefresh();
                    } catch (err) {
                      setUploadStatus({ type: 'error', message: (err as Error).message });
                    }
                  }}
                  className="w-full py-2 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 text-rose-400 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all font-mono"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset to default database</span>
                </button>
              </div>
            </div>

            {/* Upload status message feedback */}
            {uploadStatus.type && (
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-mono font-medium ${
                uploadStatus.type === 'success' 
                  ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                  : 'bg-rose-950/20 border-rose-900/30 text-rose-400'
              }`}>
                {uploadStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                <p className="leading-relaxed">{uploadStatus.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="aceternity-card p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-theme-text-muted uppercase">Source:</span>
            <select
              value={propertyFilters.source}
              onChange={(e) => setPropertyFilters(prev => ({ ...prev, source: e.target.value }))}
              className="pl-3 pr-8 py-1.5 bg-theme-btn border border-theme-border rounded-lg text-xs font-semibold text-theme-text focus:outline-none cursor-pointer transition-all"
            >
              <option value="all">All Platforms</option>
              <option value="MagicBricks">MagicBricks</option>
              <option value="Housing">Housing.com</option>
              <option value="NoBroker">NoBroker</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-theme-text-muted uppercase">Status:</span>
            <select
              value={propertyFilters.status}
              onChange={(e) => setPropertyFilters(prev => ({ ...prev, status: e.target.value }))}
              className="pl-3 pr-8 py-1.5 bg-theme-btn border border-theme-border rounded-lg text-xs font-semibold text-theme-text focus:outline-none cursor-pointer transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction">Under Construction</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-theme-text-muted uppercase">Vastu:</span>
            <select
              value={propertyFilters.vastuMinScore || 'all'}
              onChange={(e) => setPropertyFilters(prev => ({ ...prev, vastuMinScore: e.target.value }))}
              className="pl-3 pr-8 py-1.5 bg-theme-btn border border-theme-border rounded-lg text-xs font-semibold text-theme-text focus:outline-none cursor-pointer transition-all"
            >
              <option value="all">All Properties</option>
              <option value="80">High Compliant (80%+)</option>
              <option value="50">Moderate Compliant (50%+)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono text-theme-text-muted uppercase">Sort By:</span>
          <select
            value={propertyFilters.sortBy}
            onChange={(e) => setPropertyFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="pl-3 pr-8 py-1.5 bg-theme-btn border border-theme-border rounded-lg text-xs font-semibold text-theme-text focus:outline-none cursor-pointer transition-all"
          >
            <option value="match">Match Score: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-7 h-7 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-theme-text-muted font-mono font-medium">Re-calculating comparative parameters...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedProps.map((prop) => {
            if (prop.is_incomplete) return null;
            const isSelected = !!selectedProperties.find(p => p.property_id === prop.property_id);

            return (
              <PropertyCard
                key={prop.property_id}
                prop={prop}
                isSelected={isSelected}
                toggleSelectProperty={toggleSelectProperty}
                activeMapProperty={activeMapProperty}
                setActiveMapProperty={setActiveMapProperty}
                activeVastuProperty={activeVastuProperty}
                setActiveVastuProperty={setActiveVastuProperty}
                allProperties={properties}
              />
            );
          })}

          {sortedProps.length === 0 && (
            <div className="col-span-2 text-center py-20 bg-theme-card border border-theme-border rounded-2xl font-mono text-xs text-theme-text-muted font-medium">
              No comparative listings found matching active filter toolbar settings.
            </div>
          )}
        </div>
      )}

      {/* Map Proximity Modal Overlay */}
      {activeMapProperty && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveMapProperty(null)}>
            <div className="w-full max-w-4xl glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-theme-border animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-theme-border bg-theme-input/20">
                <div>
                  <h3 className="text-base font-bold text-theme-text-light flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-theme-accent animate-pulse" />
                    <span>Geo-Proximity Maps & Proximity Audit</span>
                  </h3>
                  <p className="text-xs text-theme-text-muted mt-0.5 font-mono">{activeMapProperty.title} • {activeMapProperty.locality}</p>
                </div>
                <button 
                  onClick={() => setActiveMapProperty(null)}
                  className="p-1.5 rounded-lg bg-theme-btn hover:bg-theme-btn-hover text-theme-text-muted hover:text-theme-text border border-theme-border transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Scrollable Content */}
              <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-theme-border scrollbar-track-transparent">
                <POIProximityList property={activeMapProperty} />
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Vastu Audit Report Modal Overlay */}
      {activeVastuProperty && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveVastuProperty(null)}>
            <div className="w-full max-w-4xl glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-theme-border animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-theme-border bg-theme-input/20">
                <div>
                  <h3 className="text-base font-bold text-theme-text-light flex items-center gap-2">
                    <Compass className="w-5 h-5 text-theme-accent animate-pulse rotate-45" />
                    <span>Vastu Compliance Audit & Spatial Review</span>
                  </h3>
                  <p className="text-xs text-theme-text-muted mt-0.5 font-mono">{activeVastuProperty.title} • {activeVastuProperty.locality}</p>
                </div>
                <button 
                  onClick={() => setActiveVastuProperty(null)}
                  className="p-1.5 rounded-lg bg-theme-btn hover:bg-theme-btn-hover text-theme-text-muted hover:text-theme-text border border-theme-border transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Scrollable Content */}
              <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-theme-border scrollbar-track-transparent">
                <VastuCompassWidget property={activeVastuProperty} />
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

interface PropertyCardProps {
  prop: CleanedProperty;
  isSelected: boolean;
  toggleSelectProperty: (prop: CleanedProperty) => void;
  activeMapProperty: CleanedProperty | null;
  setActiveMapProperty: (prop: CleanedProperty | null) => void;
  activeVastuProperty: CleanedProperty | null;
  setActiveVastuProperty: (prop: CleanedProperty | null) => void;
  allProperties: CleanedProperty[];
}

function PropertyCard({
  prop,
  isSelected,
  toggleSelectProperty,
  activeMapProperty,
  setActiveMapProperty,
  activeVastuProperty,
  setActiveVastuProperty,
  allProperties
}: PropertyCardProps) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = React.useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const isDraggingRef = React.useRef(false);
  const hasDraggedRef = React.useRef(false);
  const builder = buildersData[prop.builder_or_owner];

  const duplicates = prop.duplicate_group_id
    ? allProperties.filter(p => p.duplicate_group_id === prop.duplicate_group_id)
    : [];

  const cheapestProp = duplicates.length > 1
    ? [...duplicates].sort((a, b) => a.price - b.price)[0]
    : prop;

  const isCheapest = cheapestProp.property_id === prop.property_id;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 6; // Max 6 deg tilt
    const rotateY = ((x - centerX) / centerX) * 6; // Max 6 deg tilt

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const getShadowStyle = () => {
    if (isSelected) {
      return 'border-theme-accent shadow-lg shadow-theme-accent-muted';
    }

    if (prop.vastu_score !== undefined && prop.vastu_score >= 80) {
      return 'border-theme-border hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.18)] hover:border-emerald-500/40';
    }

    if (prop.investment_grade && prop.investment_grade.startsWith('A')) {
      return 'border-theme-border hover:shadow-[0_0_20px_-3px_rgba(167,139,250,0.18)] hover:border-purple-500/40';
    }

    return 'border-theme-border hover:shadow-[0_0_20px_-3px_var(--theme-accent-muted)] hover:border-theme-accent/30';
  };

  return (
    <div
      ref={cardRef}
      draggable={true}
      onDragStart={(e) => {
        isDraggingRef.current = true;
        hasDraggedRef.current = true;
        e.dataTransfer.setData('text/plain', prop.property_id);
        e.dataTransfer.effectAllowed = 'copyMove';
      }}
      onDragEnd={() => {
        isDraggingRef.current = false;
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        setTimeout(() => {
          hasDraggedRef.current = false;
        }, 100);
      }}
      onClick={(e) => {
        if (hasDraggedRef.current) return;
        toggleSelectProperty(prop);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease, border-color 0.3s ease'
      }}
      className={`aceternity-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer border ${getShadowStyle()}`}
    >
      <div className="space-y-4">
        {prop.image_url && (
          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-theme-border/30 bg-black/10">
            <img
              src={prop.image_url}
              alt={prop.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span title="Drag to Compare">
                  <GripVertical className="w-3.5 h-3.5 text-theme-text-muted/50 cursor-grab active:cursor-grabbing flex-shrink-0" />
                </span>
                <a
                  href={prop.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase flex items-center gap-1 transition-all ${
                    prop.source === 'MagicBricks'
                      ? 'bg-purple-950/40 text-purple-400 hover:bg-purple-900/50 border border-purple-900/30'
                      : prop.source === 'Housing.com'
                      ? 'bg-red-950/40 text-red-400 hover:bg-red-900/50 border border-red-900/30'
                      : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-900/30'
                  }`}
                >
                  <span>{prop.source}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <span className="text-[10px] text-theme-text-muted font-mono font-medium ml-auto">{prop.property_id}</span>
            </div>
            <h4 className="text-sm font-bold text-theme-text-light mt-1.5 line-clamp-1">
              {prop.title}
            </h4>

            {/* Price Arbitrage Deal Alert */}
            {duplicates.length > 1 && (
              <div className="mt-2 relative group/arbitrage inline-block">
                {isCheapest ? (
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>✓ Best Deal (Cheapest portal)</span>
                  </div>
                ) : (
                  <div className="px-2.5 py-1 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span>⚠️ Cheaper on {cheapestProp.source} (-₹{((prop.price - cheapestProp.price) / 100000).toFixed(1)}L)</span>
                  </div>
                )}
                
                {/* Popover showing all prices */}
                <div className="absolute top-full left-0 mt-1 z-30 hidden group-hover/arbitrage:block w-48 p-2 rounded-xl glass-panel border border-theme-border text-[9px] font-mono space-y-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="font-bold text-theme-text-light border-b border-theme-border/20 pb-1 mb-1 uppercase tracking-wider">Portal Price Index</div>
                  {duplicates.map(d => {
                    const isSelf = d.property_id === prop.property_id;
                    return (
                      <div key={d.property_id} className={`flex justify-between items-center ${isSelf ? 'text-theme-accent font-bold' : 'text-theme-text-muted'}`}>
                        <span>{d.source} {isSelf && '(This)'}</span>
                        <span>
                          {d.transaction_type === 'Rent'
                            ? `₹${d.price.toLocaleString()}/mo`
                            : `₹${(d.price / 100000).toFixed(1)}L`
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 rounded text-xs font-mono font-bold whitespace-nowrap">
              {prop.match_score || 90}% Match
            </span>
            {prop.investment_grade && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap ${
                prop.investment_grade.startsWith('A') 
                  ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                  : prop.investment_grade.startsWith('B')
                  ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                  : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
              }`} title={`Investment Score: ${prop.investment_score || 0}/100`}>
                Grade {prop.investment_grade}
              </span>
            )}
            {prop.vastu_score !== undefined && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap ${
                prop.vastu_score >= 80
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                  : prop.vastu_score >= 50
                  ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-950/40 text-rose-400 border border-rose-500/20'
              }`} title={`Vastu Score: ${prop.vastu_score}/100`}>
                Vastu: {prop.vastu_score}%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-theme-border/20 text-center font-mono">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-theme-text-muted block">Budget</span>
            <span className="text-xs font-bold text-theme-text-light">
              {prop.transaction_type === 'Rent'
                ? `₹${prop.price.toLocaleString()} / mo`
                : `₹${(prop.price / 100000).toFixed(1)} L`
              }
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-theme-text-muted block">Area</span>
            <span className="text-xs font-bold text-theme-text-light">{prop.area_sqft} sqft</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-theme-text-muted block">BHK</span>
            <span className="text-xs font-bold text-theme-text-light">{prop.bhk} BHK</span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-theme-text-muted italic line-clamp-2">
          "{prop.recommendation_explanation}"
        </p>

        {prop.location_scores && (
          <div className="pt-2.5 pb-1 border-t border-theme-border/10 space-y-2">
            <div className="text-[10px] uppercase font-bold text-theme-text-muted font-mono tracking-wider">Location Quality Matrix</div>
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="bg-black/20 p-1.5 rounded-lg border border-theme-border/20">
                <span className="text-[8px] text-theme-text-muted block">Commute</span>
                <span className="text-xs font-bold text-theme-text-light">{prop.location_scores.connectivity}%</span>
              </div>
              <div className="bg-black/20 p-1.5 rounded-lg border border-theme-border/20">
                <span className="text-[8px] text-theme-text-muted block">Schools</span>
                <span className="text-xs font-bold text-theme-text-light">{prop.location_scores.schools}%</span>
              </div>
              <div className="bg-black/20 p-1.5 rounded-lg border border-theme-border/20">
                <span className="text-[8px] text-theme-text-muted block">Lifestyle</span>
                <span className="text-xs font-bold text-theme-text-light">{prop.location_scores.lifestyle}%</span>
              </div>
              <div className="bg-black/20 p-1.5 rounded-lg border border-theme-border/20">
                <span className="text-[8px] text-theme-text-muted block">Infra</span>
                <span className="text-xs font-bold text-theme-text-light">{prop.location_scores.infrastructure}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-theme-border/20">
        <div className="min-w-0">
          <div className="text-xs font-bold text-theme-text truncate">{prop.builder_or_owner}</div>
          {builder && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] text-theme-text-muted font-bold font-mono">{(builder.reputation_score * 2).toFixed(1)} / 10</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMapProperty(prop);
            }}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
              activeMapProperty?.property_id === prop.property_id
                ? 'bg-theme-accent text-theme-bg border-theme-accent font-bold'
                : 'bg-theme-btn border-theme-border text-theme-text-muted hover:text-theme-accent hover:border-theme-accent-border font-bold'
            }`}
            title="View Proximity Map"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveVastuProperty(prop);
            }}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
              activeVastuProperty?.property_id === prop.property_id
                ? 'bg-theme-accent text-theme-bg border-theme-accent font-bold'
                : 'bg-theme-btn border-theme-border text-theme-text-muted hover:text-theme-accent hover:border-theme-accent-border font-bold'
            }`}
            title="View Vastu Compliance"
          >
            <Compass className="w-3.5 h-3.5 rotate-45" />
            <span>Vastu</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSelectProperty(prop);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              isSelected
                ? 'bg-theme-accent text-theme-bg border-theme-accent'
                : 'bg-theme-btn border-theme-border text-theme-text hover:bg-theme-btn-hover'
            }`}
          >
            {isSelected ? 'Selected' : 'Add to Compare'}
          </button>
        </div>
      </div>
    </div>
  );
}
