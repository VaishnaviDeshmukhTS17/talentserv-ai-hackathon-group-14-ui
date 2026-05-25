import { useState } from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  user: { name?: string; email?: string } | null;
  theme: string;
  setTheme: (theme: string) => void;
  logout: () => void;
  setActiveTab: (tab: string) => void;
  editPersona: string;
}

export default function Header({
  user,
  theme,
  setTheme,
  logout,
  setActiveTab,
  editPersona
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  return (
    <header className="px-8 py-5 border-b border-theme-border bg-theme-bg/25 backdrop-blur-md flex justify-between items-center z-20">
      <div>
        <h2 className="text-xl font-bold text-theme-text-light tracking-tight">Welcome back, {user?.name || 'Rohan'}! 👋</h2>
        <p className="text-sm text-theme-text-muted mt-0.5">Here's an overview of your property search intelligence</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Selector Dropdown */}
        <div className="relative">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-theme-btn hover:bg-theme-btn-hover border border-theme-border rounded-xl text-sm font-semibold text-theme-text focus:outline-none cursor-pointer transition-all"
          >
            <option value="charcoal-grey">⚙️ Charcoal Grey</option>
            <option value="light-violet">🔮 Light Violet</option>
            <option value="sapphire-dark">🌌 Sapphire Dark</option>
            <option value="emerald-forest">🌲 Emerald Forest</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-theme-text-muted">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Notifications Dropdown Button */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
              setHasNewNotifications(false);
            }}
            className="p-2.5 rounded-xl bg-theme-btn hover:bg-theme-btn-hover border border-theme-border relative text-theme-text-muted hover:text-theme-text transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {hasNewNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-theme-accent rounded-full animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 glass-panel rounded-xl shadow-2xl p-4 z-50 border border-theme-border animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex justify-between items-center border-b border-theme-border/20 pb-2 mb-3">
                <span className="text-xs uppercase font-bold tracking-wider text-theme-text-muted font-mono">Notifications</span>
                <button 
                  onClick={() => setHasNewNotifications(true)}
                  className="text-[10px] text-theme-accent hover:underline font-mono"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-3.5 max-h-[250px] overflow-y-auto">
                {[
                  { id: 1, text: "📈 Hadapsar average price appreciated by 4.2% in Q1 2026.", time: "1 hour ago" },
                  { id: 2, text: "⚠️ Pre-handover alert: XYZ Builders reported delays in Wakad project.", time: "4 hours ago" },
                  { id: 3, text: "🔔 New listings added for Kharadi and Kalyani Nagar.", time: "1 day ago" }
                ].map(n => (
                  <div key={n.id} className="text-xs space-y-1 pb-2 border-b border-theme-border/10 last:border-0 last:pb-0">
                    <p className="text-theme-text-light font-medium leading-relaxed">{n.text}</p>
                    <span className="text-[10px] text-theme-text-muted font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown Button */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className="w-9 h-9 rounded-full bg-theme-card hover:bg-theme-btn-hover border border-theme-border flex items-center justify-center text-sm font-bold text-theme-text shadow-inner transition-all hover:border-theme-accent-border cursor-pointer focus:outline-none"
          >
            {user?.name?.substring(0, 2).toUpperCase() || 'RM'}
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2.5 w-64 glass-panel rounded-xl shadow-2xl p-4 z-50 border border-theme-border animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="border-b border-theme-border/20 pb-3 mb-3">
                <div className="text-sm font-bold text-theme-text-light truncate">{user?.name || 'Rohan Mallick'}</div>
                <div className="text-xs text-theme-text-muted truncate font-mono mt-0.5">{user?.email || 'rohan.mallick@propintel.com'}</div>
                <div className="inline-block mt-2 px-2.5 py-0.5 bg-theme-accent-muted border border-theme-accent-border rounded-full text-[10px] font-mono text-theme-accent font-bold uppercase">
                  Persona: {editPersona}
                </div>
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => {
                    setActiveTab('Settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-theme-text hover:bg-theme-btn-hover hover:text-theme-text-light rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-theme-text-muted" />
                  <span>Account Settings</span>
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/15 rounded-lg flex items-center gap-2 transition-all mt-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
