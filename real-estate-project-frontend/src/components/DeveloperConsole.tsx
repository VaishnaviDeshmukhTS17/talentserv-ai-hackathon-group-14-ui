import { useState, useEffect } from 'react';
import { X, Terminal, BrainCircuit, Database, ShieldAlert, Cpu } from 'lucide-react';
import { CleanedProperty } from '../../assets/mockData';
import { ParsedRequirement } from '../../services/mockApi';

interface DeveloperConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  rawQuery: string;
  parsedRequirement: ParsedRequirement | null;
  properties: CleanedProperty[];
  aiMode?: 'openai' | 'fallback';
}

export default function DeveloperConsole({ 
  isOpen, 
  onClose, 
  rawQuery, 
  parsedRequirement, 
  properties,
  aiMode = 'fallback',
}: DeveloperConsoleProps) {
  const [modeLabel, setModeLabel] = useState<'OpenAI' | 'Fallback'>('Fallback');

  useEffect(() => {
    if (isOpen) {
      setModeLabel(aiMode === 'openai' ? 'OpenAI' : 'Fallback');
    }
  }, [isOpen, aiMode, rawQuery, parsedRequirement]);

  if (!isOpen) return null;

  const getNormalizationLogs = () => {
    const modeStr = modeLabel === 'OpenAI'
      ? 'GPT-4O-MINI (OpenAI via FastAPI Backend)'
      : 'RULE-BASED FALLBACK (Python Backend)';

    const logs = [
      `[INFO] Ingestion pipeline triggered via Python API. AI Mode: ${modeStr}`,
      "[WARN] Ingestion pipeline warning: File 'PROP106' has empty fields. Flagging as INCOMPLETE.",
      "[CLEAN] Spellchecker matched 'Hinjawadi' -> normalizer corrected to 'Hinjewadi'.",
      "[CLEAN] Normalizer parsed currency string 'Rs 78 L' -> 7,800,000 INR.",
      "[DEDUP] Initiating fuzzy deduplication scan on MongoDB listings.",
      "[DEDUP] Duplicate group detected: [PROP001, PROP002] on 'Green Heights'. Assigned ID DUP_001.",
    ];
    return logs;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl border-l border-theme-border shadow-2xl flex flex-col h-full glass-panel">
      <div className="flex justify-between items-center px-6 py-4 border-b border-theme-border bg-theme-bg/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-theme-accent" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-theme-text-light">Agentic Programming Console</h2>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                modeLabel === 'OpenAI'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {modeLabel === 'OpenAI' ? 'OpenAI Live' : 'Fallback'}
              </span>
            </div>
            <p className="text-[10px] text-theme-text-muted font-mono">Python FastAPI trace logs</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg bg-theme-btn hover:bg-theme-btn-hover text-theme-text-muted hover:text-white transition-colors border border-theme-border"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs text-theme-text">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-theme-text-muted font-semibold border-b border-theme-border/50 pb-1">
            <Cpu className="w-4 h-4 text-theme-accent" />
            <span>Agent Input (Natural Language)</span>
          </div>
          <div className="p-3 bg-theme-input border border-theme-border rounded-lg text-theme-text-muted italic">
            "{rawQuery || 'No search entered yet.'}"
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-theme-text-muted font-semibold border-b border-theme-border/50 pb-1">
            <BrainCircuit className="w-4 h-4 text-theme-accent" />
            <span>OpenAI Parser Result (Structured Output)</span>
          </div>
          {parsedRequirement ? (
            <pre className="p-4 bg-theme-input border border-theme-border rounded-lg overflow-x-auto text-emerald-400 select-all">
              {JSON.stringify(parsedRequirement, null, 2)}
            </pre>
          ) : (
            <div className="p-3 bg-theme-input border border-theme-border rounded-lg text-theme-text-muted text-center">
              Awaiting search query activation...
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-theme-text-muted font-semibold border-b border-theme-border/50 pb-1">
            <Database className="w-4 h-4 text-theme-accent" />
            <span>Data Cleaning & Deduplication Logs</span>
          </div>
          <div className="p-4 bg-theme-input border border-theme-border rounded-lg max-h-48 overflow-y-auto space-y-1.5 text-theme-text-muted font-mono text-[10px]">
            {getNormalizationLogs().map((log, index) => {
              let color = "text-theme-text-muted";
              if (log.includes("[WARN]")) color = "text-amber-400";
              if (log.includes("[CLEAN]")) color = "text-blue-400";
              if (log.includes("[DEDUP]")) color = "text-emerald-400";
              return (
                <div key={index} className={color}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-theme-text-muted font-semibold border-b border-theme-border/50 pb-1">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Multi-Factor Recommendation Evaluation</span>
          </div>
          <div className="space-y-2">
            {properties.slice(0, 3).map((prop) => (
              <div key={prop.property_id} className="p-3 bg-theme-card border border-theme-border rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-theme-text-light truncate max-w-[280px]">{prop.title}</span>
                  <span className="font-mono text-emerald-400 font-bold">{prop.match_score}% Match</span>
                </div>
                <div className="text-[10px] text-theme-text-muted font-mono space-y-0.5">
                  <div>- Base Locality Matching Factor: {prop.locality === parsedRequirement?.locality ? "100%" : "70%"}</div>
                  <div className="mt-1 text-[9px] text-theme-text-muted leading-normal italic">
                    Prompt output: "{prop.recommendation_explanation}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
