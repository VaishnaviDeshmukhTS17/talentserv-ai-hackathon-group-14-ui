import { useState } from 'react';
import { 
  Sparkles, Terminal, LogOut, X,
  LayoutDashboard, ClipboardList, Home, Layers, Building2, 
  BarChart3, Map, BookOpen, Shield, Settings 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPropertiesCount: number;
  logout: () => void;
  user: { name?: string; email?: string } | null;
  setIsConsoleOpen: (open: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedPropertiesCount,
  logout,
  user,
  setIsConsoleOpen,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Requirements', icon: ClipboardList },
    { name: 'Properties', icon: Home },
    { name: 'Comparisons', icon: Layers },
    { name: 'Builders', icon: Building2 },
    { name: 'Trends', icon: BarChart3 },
    { name: 'GIS Heatmaps', icon: Map },
    { name: 'Saved Searches', icon: BookOpen },
    { name: 'Data & Compliance', icon: Shield },
    { name: 'Settings', icon: Settings },
  ];

  const pickTab = (name: string) => {
    setActiveTab(name);
    onMobileClose?.();
  };

  return (
    <aside
      className={`
        glass-sidebar flex flex-col justify-between flex-shrink-0 z-40
        fixed inset-y-0 left-0 w-[min(100vw-3rem,16rem)] max-w-64 p-4 xs:p-5 sm:p-6
        transform transition-transform duration-300 ease-out
        lg:relative lg:translate-x-0 lg:w-64 lg:max-w-none
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="space-y-6 xs:space-y-8 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between gap-2 px-1 flex-shrink-0">
          <div className="flex items-center gap-2 xs:gap-3 min-w-0">
            <div className="p-2 xs:p-2.5 bg-theme-accent-muted border border-theme-accent-border rounded-xl shrink-0">
              <Sparkles className="w-4 h-4 xs:w-5 xs:h-5 text-theme-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg xs:text-xl font-bold text-theme-text-light tracking-tight text-shadow-subtle truncate">PropIntel</h1>
              <p className="text-[10px] xs:text-xs font-mono font-semibold text-theme-text-muted uppercase tracking-widest leading-none mt-1">Intelligence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg border border-theme-border text-theme-text-muted hover:text-theme-text-light"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1 xs:space-y-1.5 flex-1 overflow-y-auto pr-1 -mr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => pickTab(item.name)}
                className={`w-full flex items-center gap-3 px-3 xs:px-4 py-2.5 xs:py-3 text-xs xs:text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-theme-accent-muted border border-theme-accent-border text-theme-accent shadow-sm' 
                    : 'hover:bg-white/3 text-theme-text-muted hover:text-theme-text border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-theme-accent' : 'text-theme-text-muted'}`} />
                <span className="truncate text-left">{item.name}</span>
                {item.name === 'Comparisons' && selectedPropertiesCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 text-xs bg-theme-accent text-theme-bg rounded-full font-bold shrink-0">
                    {selectedPropertiesCount}
                  </span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => {
              setIsConsoleOpen(true);
              onMobileClose?.();
            }}
            className="w-full flex items-center gap-3 px-3 xs:px-4 py-2.5 xs:py-3 text-xs xs:text-sm font-mono font-semibold text-theme-text-muted hover:text-theme-text-light hover:bg-white/3 rounded-xl transition-all duration-200 border border-transparent"
          >
            <Terminal className="w-4 h-4 shrink-0 text-theme-text-muted" />
            <span>Developer Logs</span>
          </button>
        </nav>
      </div>

      <div className="space-y-3 xs:space-y-4 pt-4 xs:pt-6 border-t border-theme-border flex-shrink-0">
        <div 
          onClick={() => setIsProfileExpanded(!isProfileExpanded)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-theme-btn-hover transition-colors cursor-pointer relative"
        >
          <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-theme-accent flex items-center justify-center text-theme-bg text-xs font-bold shadow-md shadow-theme-shadow shrink-0">
            {user?.name?.substring(0, 2).toUpperCase() || 'RM'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs xs:text-sm font-bold text-theme-text truncate">{user?.name || 'Rohan Mehta'}</div>
            <div className="text-[10px] xs:text-xs font-mono text-theme-text-muted truncate mt-0.5">{user?.email || 'rohan@gmail.com'}</div>
          </div>
          <svg 
            className={`w-3.5 h-3.5 text-theme-text-muted ml-1 transition-transform duration-200 shrink-0 ${isProfileExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isProfileExpanded && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-theme-border hover:border-red-900/30 bg-theme-btn hover:bg-red-950/15 text-theme-text-muted hover:text-red-400 text-sm font-bold rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Portal</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
