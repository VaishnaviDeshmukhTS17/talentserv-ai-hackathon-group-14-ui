import React from 'react';
import { ExternalLink, Star, Upload, Trash2, CheckCircle2, AlertTriangle, FileText, ChevronDown, ChevronUp, Compass } from 'lucide-react';
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
  const [expandedPropId, setExpandedPropId] = React.useState<string | null>(null);
  const [expandedVastuPropId, setExpandedVastuPropId] = React.useState<string | null>(null);

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

            <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 gap-6">
          {sortedProps.map((prop) => {
            if (prop.is_incomplete) return null;
            const isSelected = !!selectedProperties.find(p => p.property_id === prop.property_id);
            const builder = buildersData[prop.builder_or_owner];

            return (
              <div
                key={prop.property_id}
                onClick={() => toggleSelectProperty(prop)}
                className={`aceternity-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer border ${
                  isSelected ? 'border-theme-accent shadow-md shadow-theme-accent-muted' : 'border-theme-border'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
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
                        <span className="text-[10px] text-theme-text-muted font-mono font-medium">{prop.property_id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-theme-text-light mt-1.5 line-clamp-1">
                        {prop.title}
                      </h4>
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
                        setExpandedPropId(expandedPropId === prop.property_id ? null : prop.property_id);
                        setExpandedVastuPropId(null);
                      }}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                        expandedPropId === prop.property_id
                          ? 'bg-theme-accent-muted text-theme-accent border-theme-accent-border font-bold'
                          : 'bg-theme-btn border-theme-border text-theme-text-muted hover:text-theme-accent hover:border-theme-accent-border font-bold'
                      }`}
                      title="View Proximity Map"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{expandedPropId === prop.property_id ? 'Hide' : 'Map'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedVastuPropId(expandedVastuPropId === prop.property_id ? null : prop.property_id);
                        setExpandedPropId(null);
                      }}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                        expandedVastuPropId === prop.property_id
                          ? 'bg-theme-accent-muted text-theme-accent border-theme-accent-border font-bold'
                          : 'bg-theme-btn border-theme-border text-theme-text-muted hover:text-theme-accent hover:border-theme-accent-border font-bold'
                      }`}
                      title="View Vastu Compliance"
                    >
                      <Compass className="w-3.5 h-3.5 rotate-45" />
                      <span>{expandedVastuPropId === prop.property_id ? 'Hide' : 'Vastu'}</span>
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

                {expandedPropId === prop.property_id && (
                  <div className="mt-4 pt-4 border-t border-theme-border/20 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                    <POIProximityList property={prop} />
                  </div>
                )}

                {expandedVastuPropId === prop.property_id && (
                  <div className="mt-4 pt-4 border-t border-theme-border/20 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                    <VastuCompassWidget property={prop} />
                  </div>
                )}
              </div>
            );
          })}
          {sortedProps.length === 0 && (
            <div className="col-span-2 text-center py-20 bg-theme-card border border-theme-border rounded-2xl font-mono text-xs text-theme-text-muted font-medium">
              No comparative listings found matching active filter toolbar settings.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
