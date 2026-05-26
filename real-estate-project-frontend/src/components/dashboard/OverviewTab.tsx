import React from 'react';
import ModalPortal from '../ModalPortal';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie
} from 'recharts';
import { 
  Home, Star, TrendingUp, Building2, 
  AlertTriangle, Sparkles, Compass, MapPin, Zap, X
} from 'lucide-react';
import { ParsedRequirement } from '../../services/mockApi';
import { CleanedProperty, localitySentimentData, localityTrendsData, BuilderReputation, LocalitySentiment, LocalityTrend } from '../../assets/mockData';
import POIProximityList from './POIProximityList';
import VastuCompassWidget from './VastuCompassWidget';

interface OverviewTabProps {
  query: string;
  setQuery: (q: string) => void;
  tempQuery: string;
  setTempQuery: (q: string) => void;
  isEditingQuery: boolean;
  setIsEditingQuery: (editing: boolean) => void;
  parsedRequirement: ParsedRequirement | null;
  matchingCount: number;
  avgPricePerSqft: number;
  avgBuilderScore: number;
  currentLocality: string;
  currentCity: string;
  properties: CleanedProperty[];
  selectedProperties: CleanedProperty[];
  toggleSelectProperty: (prop: CleanedProperty) => void;
  handleSearch: (searchQuery?: string, overrides?: any) => Promise<void>;
  handleApplyRefinement: (refinementType: string) => void;
  theme: string;
  isLoading: boolean;
  setActiveTab: (tab: string) => void;
  chatMessages: { role: 'user' | 'assistant'; content: string }[];
  onSendChatMessage: (text: string) => Promise<void>;
  aiMode?: 'openai' | 'fallback' | null;
  showSearchError?: boolean;
  overviewBuilders: BuilderReputation[];
  currentSentiment: LocalitySentiment | null;
  currentTrend: LocalityTrend | null;
  trendsMap: Record<string, LocalityTrend>;
}

export default function OverviewTab(props: OverviewTabProps) {
  const {
    parsedRequirement,
    matchingCount,
    avgPricePerSqft,
    avgBuilderScore,
    currentLocality,
    currentCity,
    properties,
    selectedProperties,
    toggleSelectProperty,
    theme,
    isLoading,
    setActiveTab,
    chatMessages,
    onSendChatMessage,
    aiMode,
    showSearchError,
    overviewBuilders,
    currentSentiment,
    currentTrend,
    trendsMap,
  } = props;
  const [activeMapProperty, setActiveMapProperty] = React.useState<CleanedProperty | null>(null);
  const [activeVastuProperty, setActiveVastuProperty] = React.useState<CleanedProperty | null>(null);
  const [chatInput, setChatInput] = React.useState('');
  const openAiActive = aiMode === 'openai';
  const aiModelLabel = openAiActive ? 'PropIntel AI • Online' : 'Smart Search • Active';

  React.useEffect(() => {
    const el = document.getElementById('chat-messages-container');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  // Localities Bar Chart Data based on current City and active Theme
  const getLocalityTrendsData = () => {
    const palettes: Record<string, string[]> = {
      'charcoal-grey': ['#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'],
      'light-violet': ['#7c3aed', '#8b5cf6', '#a78bfa', '#c084fc', '#d8b4fe'],
      'sapphire-dark': ['#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985'],
      'emerald-forest': ['#34d399', '#10b981', '#059669', '#047857', '#065f46']
    };
    const palette = palettes[theme] || palettes['charcoal-grey'];

    const cityLocalities = currentCity.toLowerCase() === 'bangalore'
      ? ['Whitefield', 'Indiranagar', 'HSR Layout', 'Koramangala', 'Hebbal']
      : ['Hinjewadi', 'Wakad', 'Baner', 'Tathawade', 'Balewadi'];

    return cityLocalities.map((name, index) => {
      const trend = trendsMap[name] || localityTrendsData[name];
      const history = trend?.quarterly_price_history;
      const price = history?.[history.length - 1]?.avg_price_per_sqft ?? 8000;
      const isActive = name.toLowerCase() === currentLocality.toLowerCase();
      return {
        name: isActive ? `${name} ★` : name,
        price,
        color: isActive ? palette[0] : palette[index % palette.length],
      };
    });
  };

  const chartData = getLocalityTrendsData();

  // Locality sentiment from latest search (falls back to static mock)
  const sentimentInfo = currentSentiment || localitySentimentData[currentLocality] || {
    sentiment_score: 0.78,
    positive_themes: ["Connectivity", "Amenities", "Construction Quality"],
    negative_themes: ["Traffic", "Construction Delay", "High Price"],
    sentiment_summary: ""
  };
  const sentimentScore = sentimentInfo.sentiment_score;
  const sentimentChartData = [
    { name: 'Positive', value: Math.round(sentimentScore * 100) },
    { name: 'Negative', value: Math.round((1 - sentimentScore) * 60) },
    { name: 'Neutral', value: Math.round((1 - sentimentScore) * 40) }
  ];
  const SENTIMENT_COLORS = ['#10b981', '#ef4444', '#64748b']; // green, red, gray

  return (
    <>
      {showSearchError && (
        <div className="mb-4 p-4 rounded-xl border border-red-800/50 bg-red-950/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-200">Something went wrong. Please try again in a moment.</p>
        </div>
      )}
      {/* ROW 1: Search requirements card & stats summary cards */}
      <div className="grid grid-cols-1 gap-4 xs:gap-5 md:grid-cols-12 md:gap-6 items-stretch">
        
          {/* Card 1: Conversational Search Chat Card */}
          <div className="col-span-1 md:col-span-12 lg:col-span-8 aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl flex flex-col justify-between relative min-h-[280px] xs:min-h-[320px] md:min-h-[360px]">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4 border-b border-theme-border/30 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-theme-accent" />
                <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono">Conversational AI Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                {openAiActive ? (
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-950/30 rounded border border-emerald-800/50 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> {aiModelLabel}
                  </span>
                ) : aiMode === 'fallback' ? (
                  <span className="text-[10px] font-mono text-sky-400 px-2 py-0.5 bg-sky-950/30 rounded border border-sky-800/50 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> {aiModelLabel}
                  </span>
                ) : null}
                <span className="text-[10px] font-mono text-theme-text-muted px-2 py-0.5 bg-black/20 rounded border border-theme-border">
                  Multi-Turn
                </span>
              </div>
            </div>

            {aiMode === 'fallback' && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-theme-accent-muted/20 border border-theme-accent-border/25 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-theme-accent flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-theme-text-muted leading-relaxed">
                  Describe your ideal home in everyday language — PropIntel converts it into structured filters
                  (locality, BHK, budget, and move-in preference) and finds matching listings for you.
                </p>
              </div>
            )}

          {/* Messages Thread Box */}
          <div 
            id="chat-messages-container"
            className="flex-1 min-h-[150px] max-h-[180px] overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-theme-border scrollbar-track-transparent"
          >
            {chatMessages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div key={index} className={`flex items-start gap-2.5 ${!isAssistant ? 'justify-end' : ''}`}>
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-theme-accent-muted border border-theme-accent-border flex items-center justify-center text-theme-accent flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    isAssistant 
                      ? 'bg-theme-card border border-theme-border text-theme-text' 
                      : 'bg-theme-accent text-theme-bg font-semibold'
                  }`}>
                    {msg.content}
                  </div>
                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-theme-border flex items-center justify-center text-theme-text-muted flex-shrink-0 mt-0.5 font-mono font-bold text-[10px] border border-theme-border">
                      U
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-theme-accent-muted border border-theme-accent-border flex items-center justify-center text-theme-accent flex-shrink-0 mt-0.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-theme-card border border-theme-border rounded-2xl text-xs text-theme-text-muted font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
          </div>

            {/* Chat Input form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInput.trim()) {
                  onSendChatMessage(chatInput.trim());
                  setChatInput('');
                }
              }}
              className="flex gap-2 mb-4"
            >
              <input 
                id="chat-agent-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                autoComplete="off"
                disabled={isLoading}
                placeholder="e.g. '2 BHK in Hinjewadi under 80 Lakh' or just the locality name"
                className="flex-1 p-2.5 bg-theme-input border border-theme-border rounded-xl text-xs font-semibold text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-theme-accent-border transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !chatInput.trim()}
                className="px-4 bg-theme-accent hover:opacity-90 disabled:opacity-50 text-theme-bg text-xs font-bold rounded-xl flex items-center justify-center transition-all"
              >
                <span>Send</span>
              </button>
            </form>

          {/* Structured filters parsed from natural language */}
          <div className="border-t border-theme-border/20 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-[10px] font-bold text-theme-text-light uppercase tracking-widest font-mono">
                  Structured Filters
                </h4>
                <p className="text-[10px] text-theme-text-muted font-mono mt-0.5">
                  Parsed from natural-language requirement
                </p>
              </div>
              {isLoading && (
                <span className="text-[9px] font-mono text-theme-accent animate-pulse">Parsing…</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-accent-muted border border-theme-accent-border text-[10px] font-mono">
                <span className="text-theme-text-muted font-medium">CITY:</span>
                <span className="text-theme-text-light font-semibold">{parsedRequirement?.city || '—'}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-accent-muted border border-theme-accent-border text-[10px] font-mono">
                <span className="text-theme-text-muted font-medium">LOCALITY:</span>
                <span className="text-theme-text-light font-semibold">{parsedRequirement?.locality || '—'}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-accent-muted border border-theme-accent-border text-[10px] font-mono">
                <span className="text-theme-text-muted font-medium">BHK:</span>
                <span className="text-theme-text-light font-semibold">{parsedRequirement?.bhk ? `${parsedRequirement.bhk} BHK` : '—'}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-accent-muted border border-theme-accent-border text-[10px] font-mono">
                <span className="text-theme-text-muted font-medium">TYPE:</span>
                <span className="text-theme-text-light font-semibold">{parsedRequirement?.transaction_type || '—'}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-accent-muted border border-theme-accent-border text-[10px] font-mono">
                <span className="text-theme-text-muted font-medium">BUDGET:</span>
                <span className="text-theme-text-light font-semibold">
                  {parsedRequirement?.budget_max
                    ? parsedRequirement.transaction_type === 'Rent'
                      ? `₹${parsedRequirement.budget_max.toLocaleString()}/mo`
                      : `₹${(parsedRequirement.budget_max / 100000).toFixed(0)} Lakh`
                    : '—'}
                </span>
              </div>
              {parsedRequirement?.status_preference && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-accent-muted border border-theme-accent-border text-[10px] font-mono">
                  <span className="text-theme-text-muted font-medium">STATUS:</span>
                  <span className="text-theme-text-light font-semibold">{parsedRequirement.status_preference}</span>
                </div>
              )}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-accent-muted border border-theme-accent-border text-[10px] font-mono">
                <span className="text-theme-text-muted font-medium">PROPERTY:</span>
                <span className="text-theme-text-light font-semibold">{parsedRequirement?.property_type || '—'}</span>
              </div>
              {parsedRequirement?.preference_notes && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-theme-accent-muted border border-theme-accent-border text-[10px] font-mono max-w-full">
                  <span className="text-theme-text-muted font-medium shrink-0">NOTES:</span>
                  <span className="text-theme-text-light font-semibold truncate">{parsedRequirement.preference_notes}</span>
                </div>
              )}
              {parsedRequirement?.vastu_compliant_only && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/30 border border-amber-800/40 text-[10px] font-mono">
                  <span className="text-amber-400 font-semibold">Vastu compliant only</span>
                </div>
              )}
            </div>
            {!parsedRequirement && !isLoading && (
              <p className="text-[10px] text-theme-text-muted font-mono mt-2">
                Enter a requirement above — e.g. &quot;2 BHK in Wakad under 80 lakh, ready to move&quot;
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Quick Summary metrics card grid */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 grid grid-cols-2 gap-3 xs:gap-4">
          <div className="aceternity-card p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold text-theme-text-muted font-mono tracking-wider">Matches</span>
              <div className="p-1.5 bg-theme-accent-muted border border-theme-accent-border rounded-lg text-theme-accent">
                <Home className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-theme-text-light tracking-tight">{matchingCount}</div>
              <span className="text-xs text-theme-text-muted font-medium">Matching Properties</span>
            </div>
          </div>

          <div className="aceternity-card p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold text-theme-text-muted font-mono tracking-wider">Average Rate</span>
              <div className="p-1.5 bg-emerald-600/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                <span className="text-xs font-semibold">₹</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-theme-text-light tracking-tight font-mono">
                {avgPricePerSqft > 0 ? `₹${avgPricePerSqft.toLocaleString()}` : '—'}
              </div>
              <span className="text-xs text-theme-text-muted font-medium">Avg. Price / Sq.ft.</span>
            </div>
          </div>

          <div className="aceternity-card p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold text-theme-text-muted font-mono tracking-wider">Builder Score</span>
              <div className="p-1.5 bg-amber-600/10 border border-amber-500/20 rounded-lg text-amber-400">
                <Star className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-theme-text-light tracking-tight font-mono">
                {avgBuilderScore > 0 ? (
                  <>{avgBuilderScore} <span className="text-xs text-theme-text-muted/80 font-normal font-sans">/10</span></>
                ) : '—'}
              </div>
              <span className="text-xs text-theme-text-muted font-medium">Reputation Score</span>
            </div>
          </div>

          <div className="aceternity-card p-4 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold text-theme-text-muted font-mono tracking-wider">Trend Index</span>
              <div className="p-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-theme-text-light tracking-tight uppercase">
                {currentTrend?.trend_direction === 'up' ? 'Rising' : currentTrend?.trend_direction === 'down' ? 'Declining' : 'Stable'}
              </div>
              <span className="text-xs text-theme-text-muted font-medium">Locality price trend</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Matched Properties Table & price trend bar charts */}
      <div className="grid grid-cols-1 gap-4 xs:gap-5 md:grid-cols-12 md:gap-6 items-stretch">
        
        {/* MATCHING PROPERTIES LISTINGS TABLE */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8 aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl flex flex-col justify-between min-w-0">
          <div>
            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-theme-text-light tracking-tight">Top Matching Properties</h3>
                <p className="text-xs text-theme-text-muted mt-0.5 font-mono font-medium">Filtered & cleaned data records in database</p>
              </div>
              
              {/* Select to Compare Action Button */}
              <div className="flex gap-2">
                {selectedProperties.length > 0 ? (
                  <button
                    onClick={() => setActiveTab('Comparisons')}
                    className="px-4 py-2 bg-theme-accent hover:opacity-90 text-theme-bg text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-theme-shadow"
                  >
                    <span>Compare Selected ({selectedProperties.length})</span>
                  </button>
                ) : (
                  <span className="text-xs text-theme-text-muted font-mono bg-theme-accent-muted border border-theme-accent-border px-3 py-1.5 rounded-lg font-medium">
                    Select up to 3 for comparison
                  </span>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-7 h-7 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-theme-text-muted font-mono font-medium">Updating listings ledger...</span>
              </div>
            ) : properties.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
                <span className="text-sm text-theme-text-muted font-medium">No properties match your current criteria.</span>
                <span className="text-xs text-theme-text-muted font-mono">Try a different locality, BHK, or budget in the chat.</span>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[390px] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-theme-card backdrop-blur-md z-10">
                    <tr className="border-b border-theme-border text-xs uppercase text-theme-text-muted font-mono font-bold">
                      <th className="py-3 px-2 xs:px-3 w-[5%]"></th>
                      <th className="py-3 px-2 xs:px-3 min-w-[140px]">Property</th>
                      <th className="py-3 px-2 xs:px-3 hidden sm:table-cell">Locality</th>
                      <th className="py-3 px-2 xs:px-3 text-right">Price</th>
                      <th className="py-3 px-2 xs:px-3 text-right hidden md:table-cell">Area (sq.ft)</th>
                      <th className="py-3 px-2 xs:px-3 text-right hidden lg:table-cell">Price/Sq.ft</th>
                      <th className="py-3 px-2 xs:px-3 text-right hidden xs:table-cell">Status</th>
                      <th className="py-3 px-2 xs:px-3 text-center w-[8%] hidden sm:table-cell">Map</th>
                      <th className="py-3 px-2 xs:px-3 text-center w-[8%] hidden sm:table-cell">Vastu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => {
                      if (prop.is_incomplete) return null;
                      const isSelected = !!selectedProperties.find(p => p.property_id === prop.property_id);
                      const isMapActive = activeMapProperty?.property_id === prop.property_id;
                      const isVastuActive = activeVastuProperty?.property_id === prop.property_id;
                      
                      return (
                        <tr 
                          key={prop.property_id}
                          onClick={() => toggleSelectProperty(prop)}
                          className={`group cursor-pointer text-sm font-medium transition-colors hover:bg-theme-btn-hover ${
                            isSelected ? 'bg-theme-accent-muted' : ''
                          }`}
                        >
                          <td className="py-3.5 px-2 xs:px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectProperty(prop)}
                              className="rounded border-theme-border text-theme-accent focus:ring-0 focus:ring-offset-0 bg-black/40 w-3.5 h-3.5 cursor-pointer accent-theme-accent"
                              onClick={(e) => e.stopPropagation()} // keep row click from double toggling checkbox
                            />
                          </td>
                          <td className="py-3.5 px-2 xs:px-3 font-semibold text-theme-text-light">
                            <div className="flex items-center gap-2 xs:gap-3">
                              <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-theme-card border border-theme-border flex items-center justify-center text-theme-text-muted group-hover:border-theme-accent-border group-hover:text-theme-text-light transition-all overflow-hidden flex-shrink-0">
                                {prop.image_url ? (
                                  <img 
                                    src={prop.image_url} 
                                    alt={prop.title} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Building2 className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-theme-text group-hover:text-theme-text-light transition-colors" title={prop.title}>
                                  {prop.title}
                                </div>
                                <div className="text-xs text-theme-text-muted truncate font-mono mt-0.5 font-medium">{prop.builder_or_owner}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 xs:px-3 text-theme-text-muted font-mono hidden sm:table-cell">{prop.locality}</td>
                          <td className="py-3.5 px-2 xs:px-3 text-right font-semibold text-theme-text-light font-mono whitespace-nowrap">
                            {prop.transaction_type === 'Rent'
                              ? `₹${prop.price.toLocaleString()} / mo`
                              : `₹${(prop.price / 100000).toFixed(1)} L`
                            }
                          </td>
                          <td className="py-3.5 px-2 xs:px-3 text-right text-theme-text-muted font-mono hidden md:table-cell">{prop.area_sqft}</td>
                          <td className="py-3.5 px-2 xs:px-3 text-right text-theme-text-muted font-mono font-semibold hidden lg:table-cell">₹{prop.price_per_sqft.toLocaleString()}</td>
                          <td className="py-3 px-2 xs:px-3 text-right hidden xs:table-cell">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono ${
                              prop.status.includes('Ready')
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                                : 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                            }`}>
                              {prop.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 xs:px-3 text-center hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setActiveMapProperty(prop);
                              }}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isMapActive
                                  ? 'bg-theme-accent text-theme-bg border-theme-accent'
                                  : 'bg-theme-btn border-theme-border text-theme-text-muted hover:text-theme-accent hover:border-theme-accent-border'
                              }`}
                              title="View Map & Geo-Proximity"
                            >
                              <Compass className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="py-3 px-2 xs:px-3 text-center hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setActiveVastuProperty(prop);
                              }}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isVastuActive
                                  ? 'bg-theme-accent text-theme-bg border-theme-accent'
                                  : 'bg-theme-btn border-theme-border text-theme-text-muted hover:text-theme-accent hover:border-theme-accent-border'
                              }`}
                              title="View Vastu Compliance"
                            >
                              <Compass className="w-3.5 h-3.5 rotate-45" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RECHARTS PRICE TREND BAR CHART */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-sm md:text-base font-bold text-theme-text-light mb-1 tracking-tight">Price Trend</h3>
            <p className="text-xs text-theme-text-muted font-mono mb-4 md:mb-6 font-medium">Price per sq.ft. comparison across key localities</p>

            <div className="h-44 xs:h-52 md:h-56 w-full min-w-0 text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--theme-text-muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--theme-text-muted)" tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                    contentStyle={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', borderRadius: '8px', fontSize: '11px' }}
                    labelStyle={{ color: 'var(--theme-text)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-theme-border flex justify-between items-center text-xs text-theme-text-muted font-medium">
            <span className="font-mono">Reference data: Q1 2026</span>
            <span className="text-theme-accent font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Market appreciation active</span>
            </span>
          </div>
        </div>

      </div>

      {/* ROW 3: Builder Reputation, Sentiment donut, and Recommendations list */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 md:gap-6">
        
        {/* CARD 1: BUILDER REPUTATION COLUMN */}
        <div className="aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono">Builder Reputation</h3>
              <span onClick={() => setActiveTab('Builders')} className="text-xs text-theme-accent font-mono font-semibold hover:underline cursor-pointer">View all</span>
            </div>

            <div className="space-y-4">
              {overviewBuilders.map((builder) => (
                <div key={builder.builder_name} className="space-y-1.5 p-3 bg-theme-card border border-theme-border rounded-xl">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="font-semibold text-theme-text">{builder.builder_name}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                      <span>{(builder.reputation_score * 2).toFixed(1)}</span>
                      <span className="text-xs text-theme-text-muted">/ 10</span>
                    </div>
                  </div>
                  <div className="w-full bg-black/40 border border-theme-border/10 rounded-full h-1.5">
                    <div 
                       className="bg-theme-accent h-1.5 rounded-full" 
                       style={{ width: `${((builder.reputation_score * 2) / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-theme-text-muted font-mono truncate font-medium">{builder.completion_track_record}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: SENTIMENT ANALYSIS DONUT CHART */}
        <div className="aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono mb-4">Sentiment Summary</h3>

            <div className="flex items-center justify-between gap-2 p-2 bg-theme-card border border-theme-border rounded-xl">
              {/* Recharts PieChart */}
              <div className="w-24 h-24 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={38}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sentimentChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                  <span className="text-sm font-black text-theme-text-light">{(sentimentScore * 100).toFixed(0)}%</span>
                  <span className="text-[9px] text-theme-text-muted font-mono uppercase tracking-widest mt-1">Positive</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 pl-3 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-theme-text-muted flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> Positive
                  </span>
                  <span className="font-semibold text-theme-text-light font-mono">{(sentimentScore * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-theme-text-muted flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span> Negative
                  </span>
                  <span className="font-semibold text-theme-text-light font-mono">{Math.round((1 - sentimentScore) * 60)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-theme-text-muted flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#64748b]"></span> Neutral
                  </span>
                  <span className="font-semibold text-theme-text-light font-mono">{Math.round((1 - sentimentScore) * 40)}%</span>
                </div>
              </div>
            </div>

            {/* Theme Chips */}
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold font-mono text-theme-text-muted block mb-1.5">Top Positive Themes</span>
                <div className="flex flex-wrap gap-1.5">
                  {sentimentInfo.positive_themes.map((theme, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs font-mono font-medium">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold font-mono text-theme-text-muted block mb-1.5">Top Negative Themes</span>
                <div className="flex flex-wrap gap-1.5">
                  {sentimentInfo.negative_themes.map((theme, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-mono font-medium">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: TOP RECOMMENDATIONS LIST */}
        <div className="aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl flex flex-col justify-between min-w-0 xs:col-span-2 lg:col-span-1">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono">Top Recommendations</h3>
              <span onClick={() => setActiveTab('Properties')} className="text-xs text-theme-accent font-mono font-semibold hover:underline cursor-pointer">View all</span>
            </div>

            <div className="space-y-4">
              {properties.slice(0, 3).map((prop, i) => (
                <div 
                  key={prop.property_id}
                  onClick={() => toggleSelectProperty(prop)}
                  className="flex items-center gap-3 p-3 bg-theme-card border border-theme-border hover:border-theme-border-hover hover:bg-theme-card-hover rounded-xl transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-theme-accent-muted border border-theme-accent-border flex items-center justify-center text-theme-accent text-xs font-mono font-bold flex-shrink-0">
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-theme-text truncate">{prop.title}</h4>
                    <p className="text-xs text-theme-text-muted font-mono truncate mt-0.5 font-medium">{prop.locality}, {prop.city} • {prop.area_sqft} sq.ft.</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                      {prop.match_score || 90}% Match
                    </span>
                  </div>
                </div>
              ))}
              {properties.length === 0 && (
                <div className="text-center py-8 text-xs text-theme-text-muted font-mono font-medium">
                  No recommendation ranking generated.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER DISCLAIMER */}
      <footer className="pt-4 border-t border-theme-border flex items-center gap-2 text-xs text-theme-text-muted font-medium">
        <AlertTriangle className="w-3.5 h-3.5 text-theme-text-muted flex-shrink-0" />
        <span>Disclaimer: Data is aggregated from multiple sources and may not be 100% accurate. System uses simulated NLP parameters for comparative demonstrations.</span>
      </footer>

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
                <POIProximityList property={activeMapProperty} theme={theme} />
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
    </>
  );
}
