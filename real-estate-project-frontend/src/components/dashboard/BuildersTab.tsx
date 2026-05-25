import { Search, Building2, AlertTriangle } from 'lucide-react';
import { buildersData } from '../../assets/mockData';

interface BuildersTabProps {
  builderSearch: string;
  setBuilderSearch: (search: string) => void;
}

export default function BuildersTab({
  builderSearch,
  setBuilderSearch
}: BuildersTabProps) {
  const builderList = Object.values(buildersData);
  const filteredBuilders = builderList.filter(b => 
    b.builder_name.toLowerCase().includes(builderSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-theme-text-light tracking-tight">Builders Reputation Hub</h2>
          <p className="text-sm text-theme-text-muted mt-0.5">Dossier profiles and safety evaluation tracking lists</p>
        </div>

        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search builder profile..."
            value={builderSearch}
            onChange={(e) => setBuilderSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-theme-input border border-theme-border rounded-xl text-sm font-medium text-theme-text focus:outline-none focus:border-theme-accent transition-all"
          />
          <Search className="w-4 h-4 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {filteredBuilders.map((builder) => (
          <div key={builder.builder_name} className="aceternity-card p-6 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-theme-border/20 pb-3">
                <h3 className="text-base font-bold text-theme-text-light flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-theme-accent" />
                  <span>{builder.builder_name}</span>
                </h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-600/10 border border-amber-500/20 text-amber-500 rounded-lg text-xs font-mono font-bold">
                  <span>{(builder.reputation_score * 2).toFixed(1)}</span>
                  <span className="text-[10px] text-theme-text-muted">/ 10★</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-theme-text-muted font-mono font-medium">
                  <span>COMPLETION RATE & RECORD</span>
                  <span>{builder.completion_track_record}</span>
                </div>
                <div className="w-full bg-black/40 border border-theme-border/10 rounded-full h-2">
                  <div 
                     className="bg-theme-accent h-2 rounded-full" 
                     style={{ width: `${((builder.reputation_score * 2) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold font-mono text-theme-text-muted">Review Summary</span>
                <p className="text-xs leading-relaxed text-theme-text-muted">
                  {builder.review_summary}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold font-mono text-theme-text-muted block">Risk Assessment Warning List</span>
                <div className="space-y-1.5">
                  {builder.known_risks.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-red-400 font-semibold bg-red-950/10 border border-red-900/20 p-2 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-500 mt-0.5" />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredBuilders.length === 0 && (
          <div className="col-span-2 text-center py-20 bg-theme-card border border-theme-border rounded-2xl font-mono text-xs text-theme-text-muted font-medium">
            No developer records matched search string.
          </div>
        )}
      </div>
    </div>
  );
}
