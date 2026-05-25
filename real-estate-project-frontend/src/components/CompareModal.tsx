import { CleanedProperty, buildersData, localitySentimentData } from '../assets/mockData';
import { X, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { getNearestPOIs } from '../utils/geoUtils';

interface CompareModalProps {
  properties: CleanedProperty[];
  onClose: () => void;
}

export default function CompareModal({ properties, onClose }: CompareModalProps) {
  if (properties.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-5xl glass-panel rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-theme-border">
          <div>
            <h2 className="text-lg font-semibold text-theme-text-light">Compare Properties</h2>
            <p className="text-xs text-theme-text-muted">Side-by-side specification evaluation</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-theme-btn hover:bg-theme-btn-hover text-theme-text-muted hover:text-theme-text border border-theme-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-x-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-border">
                <th className="py-3 px-4 text-xs font-semibold text-theme-text-muted uppercase tracking-wider w-1/4">Features</th>
                {properties.map((prop) => (
                  <th key={prop.property_id} className="py-3 px-4 text-sm font-semibold text-theme-text-light w-1/3">
                    <div className="truncate max-w-[220px]" title={prop.title}>{prop.title}</div>
                    <div className="text-[10px] text-theme-text-muted font-normal flex items-center gap-1">
                      <a
                        href={prop.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-theme-accent transition-colors underline flex items-center gap-0.5"
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
            <tbody className="divide-y divide-theme-border/20">
              <tr>
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Price</td>
                {properties.map((prop) => (
                  <td key={prop.property_id} className="py-3.5 px-4 text-sm font-semibold text-theme-text-light">
                    {prop.transaction_type === 'Rent' 
                      ? `₹${prop.price.toLocaleString()} / month`
                      : `₹${(prop.price / 100000).toFixed(1)} Lakh`
                    }
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Area (sqft)</td>
                {properties.map((prop) => (
                  <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                    {prop.area_sqft} sq.ft.
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Price per sqft</td>
                {properties.map((prop) => (
                  <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                    ₹{prop.price_per_sqft.toLocaleString()} / sqft
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">BHK Configuration</td>
                {properties.map((prop) => (
                  <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                    {prop.bhk} BHK
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Locality</td>
                {properties.map((prop) => (
                  <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                    {prop.locality}, {prop.city}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Construction Status</td>
                {properties.map((prop) => (
                  <td key={prop.property_id} className="py-3.5 px-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
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
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Vastu Compliance</td>
                {properties.map((prop) => (
                  <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                    {prop.vastu_score !== undefined ? (
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-theme-text-light">
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
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Developer Profile</td>
                {properties.map((prop) => {
                  const builder = buildersData[prop.builder_or_owner];
                  return (
                    <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                      <div className="font-semibold text-theme-text-light">{prop.builder_or_owner}</div>
                      {builder ? (
                        <div className="text-xs text-theme-text-muted mt-0.5">
                          Rating: <span className="text-yellow-500 font-semibold">{builder.reputation_score}★</span>
                          <div className="text-[10px] text-theme-text-muted mt-0.5 truncate max-w-[220px]" title={builder.completion_track_record}>
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
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Locality Public Sentiment</td>
                {properties.map((prop) => {
                  const sentiment = localitySentimentData[prop.locality];
                  return (
                    <td key={prop.property_id} className="py-3.5 px-4 text-sm text-theme-text">
                      {sentiment ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-theme-text-light">{(sentiment.sentiment_score * 100).toFixed(0)}% Positive</span>
                            <span className={`w-2 h-2 rounded-full ${
                              sentiment.sentiment_score >= 0.8 ? 'bg-emerald-500' : 'bg-yellow-500'
                            }`}></span>
                          </div>
                          <div className="text-[10px] text-emerald-400 mt-1 flex items-start gap-1">
                            <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="truncate max-w-[200px]" title={sentiment.positive_themes.join(', ')}>
                              {sentiment.positive_themes[0]}
                            </span>
                          </div>
                          <div className="text-[10px] text-red-400 mt-0.5 flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="truncate max-w-[200px]" title={sentiment.negative_themes.join(', ')}>
                              {sentiment.negative_themes[0]}
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
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Investment Grade</td>
                {properties.map((prop) => (
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
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">Location Quality Matrix</td>
                {properties.map((prop) => (
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
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted font-semibold">Nearest Amenities (POI)</td>
                {properties.map((prop) => {
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
                <td className="py-3.5 px-4 text-sm font-medium text-theme-text-muted">AI Explanations</td>
                {properties.map((prop) => (
                  <td key={prop.property_id} className="py-3.5 px-4 text-xs leading-relaxed text-theme-text-muted italic font-light">
                    "{prop.recommendation_explanation || 'No explanation generated.'}"
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-theme-btn hover:bg-theme-btn-hover text-sm font-semibold text-theme-text rounded-lg border border-theme-border transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
