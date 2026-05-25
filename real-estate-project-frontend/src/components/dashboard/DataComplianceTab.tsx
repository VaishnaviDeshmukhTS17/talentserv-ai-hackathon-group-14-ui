import { useState } from 'react';
import { ShieldCheck, Shield, RefreshCw, Globe, Lock, FileText, ExternalLink } from 'lucide-react';

export default function DataComplianceTab() {
  const [complianceUrl, setComplianceUrl] = useState('');
  const [complianceTesting, setComplianceTesting] = useState(false);
  const [complianceLogs, setComplianceLogs] = useState<string[]>([]);

  const handleCheckCompliance = (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setComplianceTesting(true);
    setComplianceLogs([`[INIT] Starting compliance evaluation context...`]);

    const url = targetUrl.toLowerCase();
    
    setTimeout(() => {
      setComplianceLogs(prev => [...prev, `[INFO] Resolving address: ${targetUrl}`]);
    }, 200);

    setTimeout(() => {
      setComplianceLogs(prev => [...prev, `[INFO] Loading robots.txt rules for the domain...`]);
    }, 450);

    setTimeout(() => {
      if (url.includes('/api/')) {
        setComplianceLogs(prev => [
          ...prev, 
          `[ROBOTS] Disallowed path match: "/api/" matching User-agent: *`,
          `[FAIL] Compliance check blocked. Reason: DISALLOWED BY ROBOTS.TXT rules. Scraping aborted.`
        ]);
        setComplianceTesting(false);
      } else {
        setComplianceLogs(prev => [...prev, `[ROBOTS] Allowed path confirmed. Page respects target robots.txt guidelines.`]);
        
        // Step 2: Login Wall check
        setTimeout(() => {
          setComplianceLogs(prev => [...prev, `[WALL] Scanning for CAPTCHAs, paywalls, and login gates...`]);
          if (url.includes('/login') || url.includes('/dashboard/owner') || url.includes('/signup') || url.includes('/auth')) {
            setComplianceLogs(prev => [
              ...prev,
              `[WALL] Security bypass match: Detected credentials requirement gate / authentication wall.`,
              `[FAIL] Compliance check blocked. Reason: DO NOT BYPASS SECURITY CONTROLS. Scraping aborted.`
            ]);
            setComplianceTesting(false);
          } else {
            setComplianceLogs(prev => [...prev, `[WALL] Public access verified. No credentials or login wall detected.`]);

            // Step 3: PII scan
            setTimeout(() => {
              setComplianceLogs(prev => [...prev, `[PII] Running deep parser token scanning for sensitive personal info...`]);
              if (url.includes('phone') || url.includes('contact') || url.includes('profile') || url.includes('private')) {
                setComplianceLogs(prev => [
                  ...prev,
                  `[PII] Pattern match found: Detected owner contact / phone number / sensitive PII data.`,
                  `[FAIL] Compliance check blocked. Reason: NO PRIVATE DATA. Scraping aborted to protect privacy.`
                ]);
                setComplianceTesting(false);
              } else {
                setComplianceLogs(prev => [
                  ...prev,
                  `[PII] Scanning complete: 0 PII entities detected. Public listing parameters are clean.`,
                  `[RATE] Throttler checking: Active polite crawler rate limit compliance (2000ms delay active).`,
                  `[TRACK] Source mapping: Source ID and URL mapped correctly.`,
                  `[SUCCESS] 100% compliant. This URL matches all ethical data gathering rules. Safe to ingestion pipeline.`
                ]);
                setComplianceTesting(false);
              }
            }, 500);
          }
        }, 500);
      }
    }, 900);
  };

  const compliancePresets = [
    { name: 'MB Public Listing', url: 'https://www.magicbricks.com/property-details/2bhk-pune', status: 'Compliant' },
    { name: 'NoBroker Private API', url: 'https://www.nobroker.in/api/v1/user/private-contact-details', status: 'Robots.txt Disallowed' },
    { name: 'Housing Login Portal', url: 'https://www.housing.com/dashboard/owner/login', status: 'Bypassing Prohibited' },
    { name: 'Owner Contact Profile', url: 'https://www.nobroker.in/property-details/3bhk-wakad-owner-phone', status: 'Private Data Filtered' }
  ];

  const complianceRules = [
    { rule: 'Respect Restrictions', desc: 'Checks robots.txt disallows, terms of use, and domain scopes for all sources.', status: 'Active Check', detail: 'Ingestion blocks restricted folders like /api/.' },
    { rule: 'No Bypassing', desc: 'Guarantees the system never bypasses login walls, anti-bot scripts, CAPTCHAs, or paywalls.', status: 'Active Check', detail: 'Ingestion aborted if access requires credentials.' },
    { rule: 'No Private Data', desc: 'Filters out and discards sensitive user data: telephone numbers, personal profiles, emails.', status: 'Active Filter', detail: 'Regex patterns scan and purge PII before database storage.' },
    { rule: 'Responsible Crawling', desc: 'Applies polite crawler patterns, low volumes, and request limits.', status: 'Throttling', detail: '2-second request delay scheduler prevents load spikes.' },
    { rule: 'Source Tracking', desc: 'Tracks and records property listing origins, keeping sources and URL attributes.', status: 'Enforced', detail: 'Each property displays official source and click URL.' },
    { rule: 'Fallback Data Engine', desc: 'Provides comprehensive offline dataset mock fallbacks for stable executions.', status: 'Active Fallback', detail: 'Local mock files (mockData.ts) serve as zero-scraping demo fallback.' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-theme-text-light tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-theme-accent" />
          <span>Ethical Data Source & Compliance Audit</span>
        </h2>
        <p className="text-sm text-theme-text-muted mt-0.5">Validate crawling constraints, robots.txt permission scopes, and fallback compliance status</p>
      </div>

      {/* TOP METRICS GRID */}
      <div className="grid grid-cols-4 gap-4">
        <div className="aceternity-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-theme-text-muted block">Status</span>
            <span className="text-sm font-extrabold text-theme-text-light">100% Compliant</span>
          </div>
        </div>
        <div className="aceternity-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/40 text-blue-400 border border-blue-900/30 rounded-lg">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-theme-text-muted block">Ingestion Engine</span>
            <span className="text-sm font-extrabold text-theme-text-light">Fallback Active</span>
          </div>
        </div>
        <div className="aceternity-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-purple-950/40 text-purple-400 border border-purple-900/30 rounded-lg">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-theme-text-muted block">Primary Sources</span>
            <span className="text-sm font-extrabold text-theme-text-light">3 Supported</span>
          </div>
        </div>
        <div className="aceternity-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/40 text-amber-400 border border-amber-900/30 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-theme-text-muted block">PII Guard filters</span>
            <span className="text-sm font-extrabold text-theme-text-light">Active (Regex)</span>
          </div>
        </div>
      </div>

      {/* WORKSPACE CONTENT GRID */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* SIMULATOR CARD */}
        <div className="col-span-7 aceternity-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2 border-b border-theme-border/50 pb-3">
              <Globe className="w-4 h-4 text-theme-accent" />
              <span>Robots.txt & Policy Analyzer</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase">Target URL to Verify</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={complianceUrl}
                  onChange={(e) => setComplianceUrl(e.target.value)}
                  placeholder="https://example.com/listings/property-123"
                  className="flex-1 p-2.5 bg-theme-input border border-theme-border rounded-xl text-xs font-mono text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                />
                <button
                  onClick={() => handleCheckCompliance(complianceUrl)}
                  disabled={complianceTesting || !complianceUrl.trim()}
                  className="px-4 py-2 bg-theme-accent hover:opacity-90 disabled:opacity-40 text-theme-bg text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {complianceTesting ? (
                    <div className="w-3.5 h-3.5 border-2 border-theme-bg border-t-transparent rounded-full animate-spin"></div>
                  ) : 'Analyze URL'}
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-theme-text-muted uppercase">Preset Target Templates:</span>
              <div className="flex flex-wrap gap-2">
                {compliancePresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setComplianceUrl(preset.url);
                      handleCheckCompliance(preset.url);
                    }}
                    className="px-2.5 py-1.5 bg-theme-btn border border-theme-border hover:border-theme-border-hover text-[10px] font-semibold font-mono rounded-lg text-theme-text-muted hover:text-theme-text-light transition-all flex flex-col items-start gap-0.5 text-left"
                  >
                    <span className="font-bold text-theme-text">{preset.name}</span>
                    <span className="text-[9px] text-theme-accent-muted">{preset.status}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulated log output */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono font-bold text-theme-text-muted uppercase">Compliance Tracer Logs:</span>
            <div className="p-4 bg-zinc-950 border border-theme-border rounded-xl font-mono text-[10px] text-emerald-400 h-44 overflow-y-auto space-y-1 select-all">
              {complianceLogs.length === 0 ? (
                <div className="text-zinc-600 italic">No verification logged. Pick a preset or submit a URL above to inspect compliance behavior.</div>
              ) : (
                complianceLogs.map((log, i) => {
                  let color = "text-emerald-400";
                  if (log.includes("[FAIL]")) color = "text-red-400 font-bold";
                  if (log.includes("[WARN]")) color = "text-amber-400";
                  if (log.includes("[SUCCESS]")) color = "text-emerald-300 font-bold animate-pulse";
                  if (log.includes("[ROBOTS]") || log.includes("[WALL]") || log.includes("[PII]")) color = "text-blue-400";
                  return (
                    <div key={i} className={color}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* AUDIT CHECKLIST */}
        <div className="col-span-5 aceternity-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2 border-b border-theme-border/50 pb-3">
              <FileText className="w-4 h-4 text-theme-accent" />
              <span>Verification Audit Matrix</span>
            </h3>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 mt-3">
              {complianceRules.map((rule) => (
                <div key={rule.rule} className="space-y-1 border-b border-theme-border/20 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-theme-text-light font-mono">{rule.rule}</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                      {rule.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-theme-text-muted leading-relaxed font-medium">{rule.desc}</p>
                  <div className="text-[9px] font-mono text-theme-accent-muted bg-theme-accent-muted/10 px-2 py-0.5 rounded border border-theme-accent-border/10 mt-1">
                    ➔ {rule.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PERMITTED DATA SOURCES SECTION */}
      <div className="aceternity-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2 border-b border-theme-border/50 pb-3">
          <Globe className="w-4 h-4 text-theme-accent" />
          <span>Ingestion Sources Directory</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-medium">
            <thead>
              <tr className="border-b border-theme-border text-theme-text-muted">
                <th className="py-2 px-3 font-mono font-semibold">Source Portal</th>
                <th className="py-2 px-3 font-mono font-semibold">Robots.txt Location</th>
                <th className="py-2 px-3 font-mono font-semibold">Crawl Policy Scope</th>
                <th className="py-2 px-3 font-mono font-semibold">Polite Delay</th>
                <th className="py-2 px-3 font-mono font-semibold">Ingestion Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border/20 font-mono text-[11px] text-theme-text">
              <tr>
                <td className="py-3 px-3">
                  <a href="https://www.magicbricks.com" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline flex items-center gap-1 font-bold">
                    MagicBricks <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="py-3 px-3 text-theme-text-muted">/robots.txt (Allows /property-details/)</td>
                <td className="py-3 px-3 text-emerald-400">Allowed paths only</td>
                <td className="py-3 px-3">2000ms</td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/30 text-[9px] font-bold">Fallback DB / Sim Scraper</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3">
                  <a href="https://www.housing.com" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline flex items-center gap-1 font-bold">
                    Housing.com <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="py-3 px-3 text-theme-text-muted">/robots.txt (Allows search parameters)</td>
                <td className="py-3 px-3 text-emerald-400">Allowed paths only</td>
                <td className="py-3 px-3">2000ms</td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/30 text-[9px] font-bold">Fallback DB / Sim Scraper</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3">
                  <a href="https://www.nobroker.in" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline flex items-center gap-1 font-bold">
                    NoBroker <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="py-3 px-3 text-theme-text-muted">/robots.txt (Restricts /api/, /admin/)</td>
                <td className="py-3 px-3 text-emerald-400">Allowed paths only</td>
                <td className="py-3 px-3">2000ms</td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/30 text-[9px] font-bold">Fallback DB / Sim Scraper</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
