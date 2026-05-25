import { Search, Trash2 } from 'lucide-react';
import { ParsedRequirement } from '../../services/mockApi';

interface SavedSearchesTabProps {
  savedSearches: { id: string; query: string; timestamp: string }[];
  handleRemoveSavedSearch: (id: string) => void;
  handleSearch: (searchQuery: string, overrides?: any) => Promise<void>;
  setActiveTab: (tab: string) => void;
  setQuery: (q: string) => void;
  setManualOverrides: (overrides: Partial<ParsedRequirement>) => void;
}

export default function SavedSearchesTab({
  savedSearches,
  handleRemoveSavedSearch,
  handleSearch,
  setActiveTab,
  setQuery,
  setManualOverrides
}: SavedSearchesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-theme-text-light tracking-tight">Saved Searches</h2>
        <p className="text-sm text-theme-text-muted mt-0.5">Manage and re-run your saved search configurations</p>
      </div>

      <div className="space-y-4">
        {savedSearches.map((item) => (
          <div 
            key={item.id}
            className="aceternity-card p-5 rounded-xl flex items-center justify-between gap-6 hover:border-theme-accent-border transition-all"
          >
            <div 
              onClick={() => {
                setQuery(item.query);
                setManualOverrides({});
                handleSearch(item.query, {});
                setActiveTab('Dashboard');
              }}
              className="flex-1 cursor-pointer min-w-0"
            >
              <div className="text-sm font-semibold text-theme-text-light italic">
                "{item.query}"
              </div>
              <div className="text-xs text-theme-text-muted font-mono mt-1 font-medium">
                Saved on {item.timestamp}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setQuery(item.query);
                  setManualOverrides({});
                  handleSearch(item.query, {});
                  setActiveTab('Dashboard');
                }}
                className="px-3.5 py-2 bg-theme-btn hover:bg-theme-btn-hover text-theme-accent text-xs font-bold rounded-lg border border-theme-border flex items-center gap-1 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Run Search</span>
              </button>

              <button
                onClick={() => handleRemoveSavedSearch(item.id)}
                className="p-2 bg-red-950/15 border border-red-900/30 text-red-400 hover:bg-red-950/30 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {savedSearches.length === 0 && (
          <div className="text-center py-20 bg-theme-card border border-theme-border rounded-2xl font-mono text-xs text-theme-text-muted font-medium">
            No saved requirements matching current profile session.
          </div>
        )}
      </div>
    </div>
  );
}
