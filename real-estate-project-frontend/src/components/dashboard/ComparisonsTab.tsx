import React from 'react';
import { Layers, FileText, ClipboardList, Trash2, X, ExternalLink } from 'lucide-react';
import { CleanedProperty, buildersData, localitySentimentData } from '../../assets/mockData';
import { getNearestPOIs } from '../../utils/geoUtils';

interface ComparisonsTabProps {
  selectedProperties: CleanedProperty[];
  toggleSelectProperty: (prop: CleanedProperty) => void;
  setSelectedProperties: React.Dispatch<React.SetStateAction<CleanedProperty[]>>;
  setActiveTab: (tab: string) => void;
  handleExportCSV: () => void;
  handleExportMarkdown: () => void;
}

export default function ComparisonsTab({
  selectedProperties,
  toggleSelectProperty,
  setSelectedProperties,
  setActiveTab,
  handleExportCSV,
  handleExportMarkdown
}: ComparisonsTabProps) {
  if (selectedProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="p-4 bg-theme-accent-muted border border-theme-accent-border rounded-full text-theme-accent">
          <Layers className="w-8 h-8" />
        </div>
        <div className="text-center space-y-1.5 max-w-sm">
          <h3 className="text-base font-bold text-theme-text-light">No properties selected for comparison</h3>
          <p className="text-xs text-theme-text-muted leading-relaxed font-medium">
            Browse matching records in the **Properties Ledger** or **Dashboard** and select up to 3 listings to compare them side-by-side.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('Properties')}
          className="px-4 py-2 bg-theme-accent hover:opacity-90 text-theme-bg text-xs font-bold rounded-lg transition-all shadow-lg"
        >
          Go to Properties Ledger
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-theme-text-light tracking-tight">Full Comparisons Workspace</h2>
          <p className="text-sm text-theme-text-muted mt-0.5">Detailed side-by-side parameters index metrics comparison</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-theme-btn hover:bg-theme-btn-hover border border-theme-border text-theme-accent text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 bg-theme-btn hover:bg-theme-btn-hover border border-theme-border text-theme-accent text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Copy MD Report</span>
          </button>
          <button
            onClick={() => setSelectedProperties([])}
            className="px-3 py-1.5 bg-red-950/15 border border-red-900/30 text-red-400 hover:bg-red-950/30 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Selection</span>
          </button>
        </div>
      </div>

      <div className="aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider w-1/4">Features</th>
              {selectedProperties.map((prop) => (
                <th key={prop.property_id} className="py-3 px-4 text-sm font-semibold text-theme-text-light w-1/3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="truncate max-w-[200px]" title={prop.title}>{prop.title}</div>
                    <button
                      onClick={() => toggleSelectProperty(prop)}
                      className="text-theme-text-muted hover:text-red-400 transition-colors p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] text-theme-text-muted font-normal flex items-center gap-1.5">
                    <a
                      href={prop.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-theme-accent transition-colors underline flex items-center gap-0.5 font-bold"
                    >
                      <span>{prop.source}</span>
                      <ExternalLink className="w-2.5 h-2.5 inline" />
                    </a>
                    <span>• {prop.property_id}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border/20 font-medium">
            <tr>
              <td className="py-3.5 px-4 text-sm font-semibold text-theme-text-muted">Price</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-sm font-bold text-theme-text-light font-mono">
                  {prop.transaction_type === 'Rent' 
                    ? `₹${prop.price.toLocaleString()} / mo`
                    : `₹${(prop.price / 100000).toFixed(1)} Lakh`
                  }
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">Area (sqft)</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text font-mono">
                  {prop.area_sqft} sq.ft.
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">Price per sqft</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text font-mono">
                  ₹{prop.price_per_sqft.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">BHK Configuration</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text font-mono">
                  {prop.bhk} BHK
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">Locality</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                  {prop.locality}, {prop.city}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">Construction Status</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    prop.status.includes('Ready') 
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                      : 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                  }`}>
                    {prop.status}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">Vastu Compliance</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text animate-fadeIn">
                  {prop.vastu_score !== undefined ? (
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-theme-text-light">
                        <span>{prop.vastu_score}% ({prop.vastu_compliant_level})</span>
                      </div>
                      <div className="text-[10px] text-theme-text-muted mt-0.5">
                        Facing: <span className="font-mono">{prop.vastu_details?.facing_direction}</span>
                      </div>
                      <div className="text-[10px] text-theme-text-muted">
                        Kitchen: <span className="font-mono">{prop.vastu_details?.kitchen_direction}</span> | Bed: <span className="font-mono">{prop.vastu_details?.bedroom_direction}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-theme-text-muted">Not Audited</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">Developer Profile</td>
              {selectedProperties.map((prop) => {
                const builder = buildersData[prop.builder_or_owner];
                return (
                  <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                    <div className="font-bold text-theme-text-light">{prop.builder_or_owner}</div>
                    {builder ? (
                      <div className="text-xs text-theme-text-muted mt-0.5 space-y-0.5">
                        <div>Rating: <span className="text-amber-500 font-bold">{(builder.reputation_score * 2).toFixed(1)} / 10★</span></div>
                        <div className="text-[10px] leading-relaxed truncate max-w-[200px]" title={builder.completion_track_record}>
                          {builder.completion_track_record}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-theme-text-muted">Individual owner / Unranked</span>
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">Locality Public Sentiment</td>
              {selectedProperties.map((prop) => {
                const sentiment = localitySentimentData[prop.locality];
                return (
                  <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                    {sentiment ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-theme-text-light">{(sentiment.sentiment_score * 100).toFixed(0)}% Positive</span>
                          <span className={`w-2 h-2 rounded-full ${
                            sentiment.sentiment_score >= 0.8 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}></span>
                        </div>
                        <div className="text-[10px] text-emerald-400 flex items-start gap-1 font-mono">
                          <span className="truncate max-w-[200px]" title={sentiment.positive_themes.join(', ')}>
                            Pro: {sentiment.positive_themes[0]}
                          </span>
                        </div>
                        <div className="text-[10px] text-red-400 flex items-start gap-1 font-mono">
                          <span className="truncate max-w-[200px]" title={sentiment.negative_themes.join(', ')}>
                            Con: {sentiment.negative_themes[0]}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-theme-text-muted">Sentiment unavailable</span>
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">Investment Grade</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-sm font-semibold">
                  {prop.investment_grade ? (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        prop.investment_grade.startsWith('A') 
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                          : prop.investment_grade.startsWith('B')
                          ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                          : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                      }`}>
                        Grade {prop.investment_grade}
                      </span>
                      <span className="text-xs text-theme-text-muted font-mono">({prop.investment_score || 0}/100)</span>
                    </div>
                  ) : (
                    <span className="text-xs text-theme-text-muted">N/A</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">Location Quality Matrix</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-sm">
                  {prop.location_scores ? (
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] max-w-[200px]">
                      <div className="bg-black/20 p-1.5 rounded border border-theme-border/20 flex justify-between">
                        <span className="text-theme-text-muted">Commute:</span>
                        <span className="font-bold text-theme-text-light">{prop.location_scores.connectivity}%</span>
                      </div>
                      <div className="bg-black/20 p-1.5 rounded border border-theme-border/20 flex justify-between">
                        <span className="text-theme-text-muted">Schools:</span>
                        <span className="font-bold text-theme-text-light">{prop.location_scores.schools}%</span>
                      </div>
                      <div className="bg-black/20 p-1.5 rounded border border-theme-border/20 flex justify-between">
                        <span className="text-theme-text-muted">Lifestyle:</span>
                        <span className="font-bold text-theme-text-light">{prop.location_scores.lifestyle}%</span>
                      </div>
                      <div className="bg-black/20 p-1.5 rounded border border-theme-border/20 flex justify-between">
                        <span className="text-theme-text-muted">Infra:</span>
                        <span className="font-bold text-theme-text-light">{prop.location_scores.infrastructure}%</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-theme-text-muted">N/A</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted font-semibold">Nearest Amenities (POI)</td>
              {selectedProperties.map((prop) => {
                const lat = prop.latitude || 18.5204;
                const lon = prop.longitude || 73.8567;
                const pois = getNearestPOIs(lat, lon, prop.locality);
                return (
                  <td key={prop.property_id} className="py-3.5 px-4 text-[11px] font-mono space-y-1 text-theme-text-light max-w-[240px]">
                    {pois.commute && (
                      <div className="flex justify-between gap-2 border-b border-theme-border/5 pb-1">
                        <span className="text-theme-text-muted truncate" title={pois.commute.poi.name}>🚇 Commute:</span>
                        <span className="font-bold text-emerald-400 flex-shrink-0">{pois.commute.distance_km} km ({pois.commute.direction})</span>
                      </div>
                    )}
                    {pois.school && (
                      <div className="flex justify-between gap-2 border-b border-theme-border/5 pb-1">
                        <span className="text-theme-text-muted truncate" title={pois.school.poi.name}>🎓 School:</span>
                        <span className="font-bold text-purple-400 flex-shrink-0">{pois.school.distance_km} km ({pois.school.direction})</span>
                      </div>
                    )}
                    {pois.lifestyle && (
                      <div className="flex justify-between gap-2 border-b border-theme-border/5 pb-1">
                        <span className="text-theme-text-muted truncate" title={pois.lifestyle.poi.name}>🛍️ Lifestyle:</span>
                        <span className="font-bold text-amber-500 flex-shrink-0">{pois.lifestyle.distance_km} km ({pois.lifestyle.direction})</span>
                      </div>
                    )}
                    {pois.infrastructure && (
                      <div className="flex justify-between gap-2">
                        <span className="text-theme-text-muted truncate" title={pois.infrastructure.poi.name}>🏥 Infra:</span>
                        <span className="font-bold text-sky-400 flex-shrink-0">{pois.infrastructure.distance_km} km ({pois.infrastructure.direction})</span>
                      </div>
                    )}
                    {!pois.commute && !pois.school && !pois.lifestyle && !pois.infrastructure && (
                      <span className="text-theme-text-muted">No POIs mapped</span>
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-sm text-theme-text-muted">AI Explanations</td>
              {selectedProperties.map((prop) => (
                <td key={prop.property_id} className="py-3.5 px-4 text-xs leading-relaxed text-theme-text-muted italic font-light">
                  "{prop.recommendation_explanation || 'No explanation generated.'}"
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
