import { Sliders, RefreshCw, BookOpen, Search, Save } from 'lucide-react';
import { ParsedRequirement } from '../../services/mockApi';

interface RequirementsTabProps {
  parsedRequirement: ParsedRequirement | null;
  manualOverrides: Partial<ParsedRequirement>;
  handleApplyOverride: (key: keyof ParsedRequirement, value: any) => void;
  handleResetOverrides: () => void;
  handleSaveSearch: () => void;
  searchHistory: string[];
  handleSearch: (searchQuery: string, overrides?: any) => Promise<void>;
  setQuery: (q: string) => void;
  setManualOverrides: (overrides: Partial<ParsedRequirement>) => void;
}

export default function RequirementsTab({
  parsedRequirement,
  manualOverrides,
  handleApplyOverride,
  handleResetOverrides,
  handleSaveSearch,
  searchHistory,
  handleSearch,
  setQuery,
  setManualOverrides
}: RequirementsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-theme-text-light tracking-tight">Requirements Manager</h2>
        <p className="text-sm text-theme-text-muted mt-0.5">Inspect parsed search requirements and apply manual scoring overrides</p>
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* Overrides Form */}
        <div className="col-span-8 aceternity-card p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-theme-border/50 pb-3">
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-theme-accent" />
              <span>Parsed Criteria & Overrides</span>
            </h3>
            {Object.keys(manualOverrides).length > 0 && (
              <button
                onClick={handleResetOverrides}
                className="px-3 py-1.5 bg-red-950/15 border border-red-900/30 text-red-400 hover:bg-red-950/30 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Overrides</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* City Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase tracking-wider">City</label>
              <div className="relative">
                <select
                  value={manualOverrides.city || parsedRequirement?.city || 'Pune'}
                  onChange={(e) => handleApplyOverride('city', e.target.value)}
                  className="w-full p-3 bg-theme-input border border-theme-border rounded-xl text-sm font-semibold text-theme-text focus:outline-none focus:border-theme-accent-border cursor-pointer transition-all"
                >
                  <option value="Pune">Pune</option>
                  <option value="Bangalore">Bangalore</option>
                </select>
                {manualOverrides.city && (
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] bg-theme-accent text-theme-bg font-bold font-mono rounded">
                    Overridden
                  </span>
                )}
              </div>
            </div>

            {/* Locality Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase tracking-wider">Locality</label>
              <div className="relative">
                <select
                  value={manualOverrides.locality || parsedRequirement?.locality || 'Hinjewadi'}
                  onChange={(e) => handleApplyOverride('locality', e.target.value)}
                  className="w-full p-3 bg-theme-input border border-theme-border rounded-xl text-sm font-semibold text-theme-text focus:outline-none focus:border-theme-accent-border cursor-pointer transition-all"
                >
                  {(manualOverrides.city || parsedRequirement?.city || 'Pune') === 'Bangalore' ? (
                    <>
                      <option value="Whitefield">Whitefield</option>
                      <option value="Indiranagar">Indiranagar</option>
                      <option value="Koramangala">Koramangala</option>
                      {parsedRequirement?.locality && !['Whitefield', 'Indiranagar', 'Koramangala'].includes(parsedRequirement.locality) && (
                        <option value={parsedRequirement.locality}>{parsedRequirement.locality}</option>
                      )}
                    </>
                  ) : (
                    <>
                      <option value="Hinjewadi">Hinjewadi</option>
                      <option value="Wakad">Wakad</option>
                      <option value="Baner">Baner</option>
                      <option value="Hadapsar">Hadapsar</option>
                      <option value="Kharadi">Kharadi</option>
                      <option value="Viman Nagar">Viman Nagar</option>
                      <option value="Kothrud">Kothrud</option>
                      <option value="Kalyani Nagar">Kalyani Nagar</option>
                      {parsedRequirement?.locality && !['Hinjewadi', 'Wakad', 'Baner', 'Hadapsar', 'Kharadi', 'Viman Nagar', 'Kothrud', 'Kalyani Nagar'].includes(parsedRequirement.locality) && (
                        <option value={parsedRequirement.locality}>{parsedRequirement.locality}</option>
                      )}
                    </>
                  )}
                </select>
                {manualOverrides.locality && (
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] bg-theme-accent text-theme-bg font-bold font-mono rounded">
                    Overridden
                  </span>
                )}
              </div>
            </div>

            {/* BHK Configuration */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase tracking-wider">BHK Configuration</label>
              <div className="relative">
                <select
                  value={manualOverrides.bhk !== undefined ? manualOverrides.bhk || '' : parsedRequirement?.bhk || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleApplyOverride('bhk', val === '' ? null : parseInt(val));
                  }}
                  className="w-full p-3 bg-theme-input border border-theme-border rounded-xl text-sm font-semibold text-theme-text focus:outline-none focus:border-theme-accent-border cursor-pointer transition-all"
                >
                  <option value="">Any BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                </select>
                {manualOverrides.bhk !== undefined && (
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] bg-theme-accent text-theme-bg font-bold font-mono rounded">
                    Overridden
                  </span>
                )}
              </div>
            </div>

            {/* Budget Limit */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase tracking-wider">Max Budget (Lakhs)</label>
              <div className="relative">
                <input
                  type="number"
                  value={
                    manualOverrides.budget_max !== undefined
                      ? manualOverrides.budget_max
                        ? Math.round(manualOverrides.budget_max / 100000)
                        : ''
                      : parsedRequirement?.budget_max
                      ? Math.round(parsedRequirement.budget_max / 100000)
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    handleApplyOverride('budget_max', val === '' ? null : parseInt(val) * 100000);
                  }}
                  placeholder="Enter budget limit"
                  className="w-full p-3 bg-theme-input border border-theme-border rounded-xl text-sm font-semibold text-theme-text focus:outline-none focus:border-theme-accent-border transition-all"
                />
                {manualOverrides.budget_max !== undefined && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] bg-theme-accent text-theme-bg font-bold font-mono rounded">
                    Overridden
                  </span>
                )}
              </div>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase tracking-wider">Transaction Type</label>
              <div className="relative">
                <select
                  value={manualOverrides.transaction_type || parsedRequirement?.transaction_type || 'Buy'}
                  onChange={(e) => handleApplyOverride('transaction_type', e.target.value)}
                  className="w-full p-3 bg-theme-input border border-theme-border rounded-xl text-sm font-semibold text-theme-text focus:outline-none focus:border-theme-accent-border cursor-pointer transition-all"
                >
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </select>
                {manualOverrides.transaction_type && (
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] bg-theme-accent text-theme-bg font-bold font-mono rounded">
                    Overridden
                  </span>
                )}
              </div>
            </div>

            {/* Status Preference */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase tracking-wider">Status Preference</label>
              <div className="relative">
                <select
                  value={manualOverrides.status_preference !== undefined ? manualOverrides.status_preference || '' : parsedRequirement?.status_preference || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleApplyOverride('status_preference', val === '' ? null : val);
                  }}
                  className="w-full p-3 bg-theme-input border border-theme-border rounded-xl text-sm font-semibold text-theme-text focus:outline-none focus:border-theme-accent-border cursor-pointer transition-all"
                >
                  <option value="">Any Status</option>
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Under Construction">Under Construction</option>
                </select>
                {manualOverrides.status_preference !== undefined && (
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] bg-theme-accent text-theme-bg font-bold font-mono rounded">
                    Overridden
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Note prompt visualization */}
          <div className="pt-4 border-t border-theme-border/50 text-xs text-theme-text-muted space-y-2">
            <span className="font-semibold text-theme-text-light">Active Requirements Prompt Note:</span>
            <div className="p-3 bg-black/20 border border-theme-border/30 rounded-xl font-mono leading-relaxed">
              "{parsedRequirement?.preference_notes || 'No active prompt search notes detected.'}"
            </div>
          </div>
        </div>

        {/* Search History Panel */}
        <div className="col-span-4 aceternity-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex-1 space-y-4">
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2 border-b border-theme-border/50 pb-3">
              <BookOpen className="w-4 h-4 text-theme-accent" />
              <span>Recent Query History</span>
            </h3>
            
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {searchHistory.map((histQuery, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(histQuery);
                    setManualOverrides({});
                    handleSearch(histQuery, {});
                  }}
                  className="w-full p-3 bg-theme-card border border-theme-border hover:border-theme-accent-border rounded-xl text-left text-xs font-mono leading-relaxed transition-all hover:bg-theme-card-hover group relative pr-8"
                >
                  <span className="text-theme-text truncate block">{histQuery}</span>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
              {searchHistory.length === 0 && (
                <div className="text-center py-10 text-xs text-theme-text-muted font-mono font-medium">
                  No search logs registered in current portal session.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSaveSearch}
            className="w-full mt-4 py-3 bg-theme-accent hover:opacity-90 text-theme-bg text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-theme-shadow"
          >
            <Save className="w-4 h-4" />
            <span>Save Current Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
