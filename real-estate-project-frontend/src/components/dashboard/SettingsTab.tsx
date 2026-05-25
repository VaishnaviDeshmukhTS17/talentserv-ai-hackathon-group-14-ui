import React, { useEffect, useState } from 'react';
import { User, UserCheck, Layers, Terminal, Sparkles, CheckCircle2, AlertTriangle, Server } from 'lucide-react';
import { fetchBackendHealth, getApiBaseUrl } from '../../services/apiClient';

interface SettingsTabProps {
  editName: string;
  setEditName: (name: string) => void;
  editEmail: string;
  editPersona: string;
  setEditPersona: (persona: string) => void;
  isAuthSimulated: boolean;
  handleUpdateProfile: (e: React.FormEvent) => Promise<void>;
  handleToggleAuthMode: (simulated: boolean) => void;
  handleResetOnboarding: () => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export default function SettingsTab({
  editName,
  setEditName,
  editEmail,
  editPersona,
  setEditPersona,
  isAuthSimulated,
  handleUpdateProfile,
  handleToggleAuthMode,
  handleResetOnboarding,
  theme,
  setTheme
}: SettingsTabProps) {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [propertiesInDb, setPropertiesInDb] = useState(0);
  const [openaiActive, setOpenaiActive] = useState(false);

  useEffect(() => {
    fetchBackendHealth()
      .then((health) => {
        setBackendStatus(health.status === 'ok' ? 'ok' : 'error');
        setPropertiesInDb(health.properties_in_db || 0);
        setOpenaiActive(health.openai_active === true);
      })
      .catch(() => {
        setBackendStatus('error');
      });
  }, []);

  const isConnected = backendStatus === 'ok';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-theme-text-light tracking-tight">Workspace Settings</h2>
        <p className="text-sm text-theme-text-muted mt-0.5">Customize your profile preferences, design themes, and developer options</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xs:gap-5 md:grid-cols-12 md:gap-6 items-stretch">
        <form onSubmit={handleUpdateProfile} className="col-span-1 md:col-span-12 lg:col-span-7 aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2 border-b border-theme-border/50 pb-3">
              <User className="w-4 h-4 text-theme-accent" />
              <span>Profile Configuration</span>
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-3 bg-theme-input border border-theme-border rounded-xl text-sm font-semibold text-theme-text focus:outline-none focus:border-theme-accent transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase">Email Address</label>
              <input
                type="email"
                value={editEmail}
                disabled
                className="w-full p-3 bg-theme-input border border-theme-border rounded-xl text-sm font-semibold text-theme-text-muted opacity-60 focus:outline-none cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase">User Search Persona</label>
              <select
                value={editPersona}
                onChange={(e) => setEditPersona(e.target.value)}
                className="w-full p-3 bg-theme-input border border-theme-border rounded-xl text-sm font-semibold text-theme-text focus:outline-none focus:border-theme-accent cursor-pointer transition-all"
              >
                <option value="buyer">🏡 Home Buyer</option>
                <option value="investor">📈 Investor</option>
                <option value="agent">💼 Real Estate Professional</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3 bg-theme-accent hover:opacity-90 text-theme-bg text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-theme-shadow"
          >
            <UserCheck className="w-4 h-4" />
            <span>Save Profile Config</span>
          </button>
        </form>

        <div className="col-span-1 md:col-span-12 lg:col-span-5 space-y-4 xs:space-y-6">
          <div className="aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2 border-b border-theme-border/50 pb-3">
              <Layers className="w-4 h-4 text-theme-accent" />
              <span>Workspace Style</span>
            </h3>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              {[
                { id: 'charcoal-grey', label: 'Titanium Slate', color: '#a1a1aa' },
                { id: 'sapphire-dark', label: 'Sapphire Dark', color: '#38bdf8' },
                { id: 'emerald-forest', label: 'Emerald Forest', color: '#34d399' },
                { id: 'light-violet', label: 'Light Violet', color: '#7c3aed' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    theme === th.id
                      ? 'bg-theme-accent-muted border-theme-accent text-theme-text-light shadow-md'
                      : 'bg-theme-card border-theme-border text-theme-text-muted hover:border-theme-border-hover'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-bold uppercase truncate max-w-[80px]">{th.label}</span>
                    <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: th.color }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2 border-b border-theme-border/50 pb-3">
              <Terminal className="w-4 h-4 text-theme-accent" />
              <span>Developer Settings</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase">Authentication Provider Mode</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 border border-theme-border rounded-xl">
                <button
                  type="button"
                  onClick={() => handleToggleAuthMode(true)}
                  className={`py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                    isAuthSimulated
                      ? 'bg-theme-accent text-theme-bg shadow'
                      : 'text-theme-text-muted hover:text-theme-text'
                  }`}
                >
                  Sandbox Sim
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAuthMode(false)}
                  className={`py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                    !isAuthSimulated
                      ? 'bg-theme-accent text-theme-bg shadow'
                      : 'text-theme-text-muted hover:text-theme-text'
                  }`}
                >
                  Real Firebase
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetOnboarding}
                className="w-full py-2.5 border border-theme-border hover:border-theme-accent-border hover:bg-theme-btn-hover text-theme-text text-xs font-bold rounded-xl transition-all"
              >
                Reset Onboarding Wizard Modal
              </button>
            </div>
          </div>

          <div className="aceternity-card p-4 xs:p-5 md:p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-theme-text-light uppercase tracking-widest font-mono flex items-center gap-2 border-b border-theme-border/50 pb-3">
              <Sparkles className="w-4 h-4 text-theme-accent" />
              <span>PropIntel AI Engine</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-theme-text-muted uppercase">API Server</label>
                <div className="p-3 bg-theme-input border border-theme-border rounded-xl text-xs font-mono text-theme-text-muted flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-theme-accent" />
                  {getApiBaseUrl()}
                </div>
              </div>

              <div className="p-3 bg-black/20 border border-theme-border rounded-xl space-y-1.5">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                  )}
                  <span className="text-[10px] font-mono font-bold text-theme-text-light uppercase tracking-wider">
                    {backendStatus === 'checking'
                      ? 'Checking connection...'
                      : isConnected
                        ? `Connected • ${propertiesInDb} listings indexed${openaiActive ? ' • AI engine online' : ' • Smart search active'}`
                        : 'Service unavailable'}
                  </span>
                </div>
                <p className="text-[10px] text-theme-text-muted leading-relaxed font-mono">
                  {isConnected
                    ? openaiActive
                      ? 'Natural-language search, recommendations, and sentiment analysis are powered by PropIntel AI on the server.'
                      : 'Natural-language search uses PropIntel Smart Search to parse your requirements and match listings from the database.'
                    : 'Unable to reach the PropIntel API. Ensure the backend server is running locally.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
