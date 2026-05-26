import { User, Home, TrendingUp, Briefcase, Layers, Search, Sparkles } from 'lucide-react';

interface OnboardingWizardProps {
  showOnboarding: boolean;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  userPersona: string;
  setUserPersona: (persona: string) => void;
  onboardingQuery: string;
  setOnboardingQuery: (query: string) => void;
  handleCompleteOnboarding: () => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export default function OnboardingWizard({
  showOnboarding,
  onboardingStep,
  setOnboardingStep,
  userPersona,
  setUserPersona,
  onboardingQuery,
  setOnboardingQuery,
  handleCompleteOnboarding,
  theme,
  setTheme
}: OnboardingWizardProps) {
  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-3 xs:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-theme-bg/60 border border-theme-border backdrop-blur-xl p-5 xs:p-6 sm:p-8 rounded-2xl shadow-2xl relative flex flex-col justify-between min-h-[min(520px,90vh)] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Step Content */}
        <div className="flex-1 flex flex-col justify-center">
          {onboardingStep === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-xl bg-theme-accent-muted border border-theme-accent-border mb-3">
                  <User className="w-6 h-6 text-theme-accent" />
                </div>
                <h3 className="text-lg font-bold text-theme-text-light tracking-tight">Who are you?</h3>
                <p className="text-xs text-theme-text-muted mt-0.5">Select your persona to tailor your property recommendations</p>
              </div>
              <div className="space-y-3 pt-3">
                <button 
                  onClick={() => setUserPersona('buyer')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${userPersona === 'buyer' ? 'bg-theme-accent-muted border-theme-accent text-theme-text-light shadow-lg' : 'bg-theme-card border-theme-border text-theme-text-muted hover:border-theme-border-hover'}`}
                >
                  <div className="p-2 bg-black/40 rounded-lg text-theme-accent mt-0.5">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-theme-text-light">Home Buyer</div>
                    <div className="text-xs text-theme-text-muted mt-0.5">Looking for a primary residential property to live in.</div>
                  </div>
                </button>
                <button 
                  onClick={() => setUserPersona('investor')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${userPersona === 'investor' ? 'bg-theme-accent-muted border-theme-accent text-theme-text-light shadow-lg' : 'bg-theme-card border-theme-border text-theme-text-muted hover:border-theme-border-hover'}`}
                >
                  <div className="p-2 bg-black/40 rounded-lg text-theme-accent mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-theme-text-light">Investor</div>
                    <div className="text-xs text-theme-text-muted mt-0.5">Interested in high ROI, rentals, and price appreciation trends.</div>
                  </div>
                </button>
                <button 
                  onClick={() => setUserPersona('agent')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${userPersona === 'agent' ? 'bg-theme-accent-muted border-theme-accent text-theme-text-light shadow-lg' : 'bg-theme-card border-theme-border text-theme-text-muted hover:border-theme-border-hover'}`}
                >
                  <div className="p-2 bg-black/40 rounded-lg text-theme-accent mt-0.5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-theme-text-light">Real Estate Professional</div>
                    <div className="text-xs text-theme-text-muted mt-0.5">Comparing developer scores and metrics for active client deals.</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-xl bg-theme-accent-muted border border-theme-accent-border mb-3">
                  <Layers className="w-6 h-6 text-theme-accent" />
                </div>
                <h3 className="text-lg font-bold text-theme-text-light tracking-tight">Select Workspace Style</h3>
                <p className="text-xs text-theme-text-muted mt-0.5">Choose your default layout color theme (can change anytime)</p>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 pt-3">
                <button 
                  onClick={() => setTheme('charcoal-grey')}
                  className={`p-3.5 rounded-xl border text-left space-y-2 transition-all cursor-pointer ${theme === 'charcoal-grey' ? 'bg-theme-accent-muted border-theme-accent text-theme-text-light shadow-lg' : 'bg-theme-card border-theme-border text-theme-text-muted hover:border-theme-border-hover'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-text-light font-mono uppercase tracking-wider">Charcoal Grey</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#a1a1aa] border border-white/20"></div>
                  </div>
                  <div className="text-[10px] text-theme-text-muted leading-relaxed">Refined titanium slate theme (Default).</div>
                </button>
                
                <button 
                  onClick={() => setTheme('sapphire-dark')}
                  className={`p-3.5 rounded-xl border text-left space-y-2 transition-all cursor-pointer ${theme === 'sapphire-dark' ? 'bg-theme-accent-muted border-theme-accent text-theme-text-light shadow-lg' : 'bg-theme-card border-theme-border text-theme-text-muted hover:border-theme-border-hover'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-text-light font-mono uppercase tracking-wider">Sapphire Dark</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#38bdf8] border border-white/20"></div>
                  </div>
                  <div className="text-[10px] text-theme-text-muted leading-relaxed">Futuristic dark theme with deep ocean tones.</div>
                </button>

                <button 
                  onClick={() => setTheme('emerald-forest')}
                  className={`p-3.5 rounded-xl border text-left space-y-2 transition-all cursor-pointer ${theme === 'emerald-forest' ? 'bg-theme-accent-muted border-theme-accent text-theme-text-light shadow-lg' : 'bg-theme-card border-theme-border text-theme-text-muted hover:border-theme-border-hover'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-text-light font-mono uppercase tracking-wider">Emerald Forest</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#34d399] border border-white/20"></div>
                  </div>
                  <div className="text-[10px] text-theme-text-muted leading-relaxed">Deep forest-green theme with rich gradients.</div>
                </button>

                <button 
                  onClick={() => setTheme('light-violet')}
                  className={`p-3.5 rounded-xl border text-left space-y-2 transition-all cursor-pointer ${theme === 'light-violet' ? 'bg-theme-accent-muted border-theme-accent text-theme-text-light shadow-lg' : 'bg-theme-card border-theme-border text-theme-text-muted hover:border-theme-border-hover'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-text-light font-mono uppercase tracking-wider">Light Violet</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#7c3aed] border border-white/20"></div>
                  </div>
                  <div className="text-[10px] text-theme-text-muted leading-relaxed">Clean frosted-glass light theme.</div>
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-xl bg-theme-accent-muted border border-theme-accent-border mb-3">
                  <Search className="w-6 h-6 text-theme-accent" />
                </div>
                <h3 className="text-lg font-bold text-theme-text-light tracking-tight">Launch Your First Search</h3>
                <p className="text-xs text-theme-text-muted mt-0.5">Select a template or write a custom requirement to feed our NLP engine</p>
              </div>
              
              <div className="space-y-2 pt-2">
                {[
                  "Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move near IT park",
                  "Need a rental apartment near Wakad, Pune, 2 BHK, budget under 25k per month",
                  "Compare projects in Baner and Wakad for investment under 1.5 crore"
                ].map((q, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setOnboardingQuery(q)}
                    className={`w-full p-2.5 rounded-xl border text-left text-[11px] font-mono leading-relaxed transition-all cursor-pointer ${onboardingQuery === q ? 'bg-theme-accent-muted border-theme-accent text-theme-text-light shadow-md' : 'bg-theme-card border-theme-border text-theme-text-muted hover:border-theme-border-hover'}`}
                  >
                    "{q}"
                  </button>
                ))}
              </div>

              <div className="pt-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-theme-text-muted mb-1 font-semibold">Or Type Custom Query</label>
                <textarea
                  value={onboardingQuery}
                  onChange={(e) => setOnboardingQuery(e.target.value)}
                  placeholder="Type your natural language requirement here..."
                  className="w-full p-3 text-xs bg-theme-input border border-theme-border rounded-xl text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-theme-accent-border resize-none leading-relaxed min-h-[60px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step Navigation Actions */}
        <div className="mt-8 pt-4 border-t border-theme-border flex justify-between items-center flex-shrink-0">
          <span className="text-xs font-mono font-bold text-theme-text-muted uppercase tracking-widest">
            Step {onboardingStep} / 3
          </span>
          
          <div className="flex gap-2">
            {onboardingStep > 1 && (
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="px-4 py-2 border border-theme-border text-theme-text hover:text-theme-text-light font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            {onboardingStep < 3 ? (
              <button
                onClick={() => setOnboardingStep(onboardingStep + 1)}
                className="px-5 py-2 bg-theme-accent text-theme-bg font-bold text-xs rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-theme-shadow"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleCompleteOnboarding}
                className="px-5 py-2 bg-theme-accent text-theme-bg font-bold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-lg shadow-theme-shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Portal</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
