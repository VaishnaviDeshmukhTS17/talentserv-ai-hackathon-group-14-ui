import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { auth, updateProfile } from '../utils/firebase';
import { executeSearch, SearchResult, ParsedRequirement, buildSearchQueryFromRequirement, normalizeParsedRequirement } from '../services/mockApi';
import { CleanedProperty, buildersData, localitySentimentData, localityTrendsData, BuilderReputation, LocalitySentiment, LocalityTrend } from '../assets/mockData';
import CompareModal from './CompareModal';
import DeveloperConsole from './DeveloperConsole';
import { chatWithAgent, parseRequirement, fetchBackendHealth } from '../services/apiClient';

// Modular Sub-components
import Sidebar from './dashboard/Sidebar';
import Header from './dashboard/Header';
import OnboardingWizard from './dashboard/OnboardingWizard';
import OverviewTab from './dashboard/OverviewTab';
import RequirementsTab from './dashboard/RequirementsTab';
import PropertiesTab from './dashboard/PropertiesTab';
import ComparisonsTab from './dashboard/ComparisonsTab';
import BuildersTab from './dashboard/BuildersTab';
import TrendsTab from './dashboard/TrendsTab';
import SavedSearchesTab from './dashboard/SavedSearchesTab';
import SettingsTab from './dashboard/SettingsTab';
import DataComplianceTab from './dashboard/DataComplianceTab';
import { useToast } from './Toast';
import {
  markOnboardingComplete,
  isOnboardingComplete,
  onboardingCompleteKey,
  getSessionEmail,
  readSavedDashboardTab,
  saveDashboardTab,
} from '../utils/userSession';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const searchSeqRef = useRef(0);
  const onboardingCheckedRef = useRef(false);
  const [query, setQuery] = useState(() => {
    try {
      const savedUser = localStorage.getItem('real_estate_user');
      if (savedUser) {
        const email = JSON.parse(savedUser)?.email;
        if (email) {
          const lastQuery = localStorage.getItem(`last_query_${email}`);
          if (lastQuery) return lastQuery;
        }
      }
    } catch (e) {}
    return 'Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move near IT park';
  });
  const [tempQuery, setTempQuery] = useState('');
  const [isEditingQuery, setIsEditingQuery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [structuredFilters, setStructuredFilters] = useState<ParsedRequirement | null>(null);
  const [backendAiMode, setBackendAiMode] = useState<'openai' | 'fallback' | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<CleanedProperty[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => readSavedDashboardTab() || 'Dashboard');

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    saveDashboardTab(tab, user?.email || getSessionEmail());
  };
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'charcoal-grey');

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Hi! I am your PropIntel Conversational Search Agent. Tell me what kind of property you're looking for (e.g. 'Looking for a flat in Wakad, Pune')." }
  ]);

  const handleSendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg = { role: 'user' as const, content: text };
    const updatedHistory = [...chatMessages, newUserMsg];
    setChatMessages(updatedHistory);
    setIsLoading(true);

    const conversationQuery = updatedHistory
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('. ');

    try {
      // Step 1: Parse NL → structured filters (shown immediately in UI)
      const parseResult = await parseRequirement(conversationQuery || text);
      const parsed = normalizeParsedRequirement(parseResult.parsedRequirement);
      setStructuredFilters(parsed as ParsedRequirement);
      setManualOverrides(parsed);

      // Step 2: Conversational reply
      const response = await chatWithAgent(updatedHistory);
      setChatMessages([...updatedHistory, { role: 'assistant', content: response.reply }]);

      // Step 3: Search listings using structured filters
      const newQueryText = buildSearchQueryFromRequirement(parsed, conversationQuery || text);
      await handleSearch(newQueryText, parsed, { skipLoadingToggle: true });
    } catch (e) {
      console.error(e);
      setChatMessages([...updatedHistory, { role: 'assistant', content: "I encountered an error processing that message. Please try again." }]);
      setIsLoading(false);
    }
  };

  // Functional tab states
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('search_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedSearches, setSavedSearches] = useState<{ id: string; query: string; timestamp: string }[]>(() => {
    try {
      const saved = localStorage.getItem('saved_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [manualOverrides, setManualOverrides] = useState<Partial<ParsedRequirement>>({});

  const [propertyFilters, setPropertyFilters] = useState({
    source: 'all',
    status: 'all',
    sortBy: 'match',
    vastuMinScore: 'all'
  });

  const [builderSearch, setBuilderSearch] = useState('');
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPersona, setEditPersona] = useState(() => localStorage.getItem('user_persona') || 'buyer');
  const [isAuthSimulated, setIsAuthSimulated] = useState(() => localStorage.getItem('auth_simulated_mode') === 'true');

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [userPersona, setUserPersona] = useState('buyer');
  const [onboardingQuery, setOnboardingQuery] = useState('Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move near IT park');

  // Onboarding: only immediately after registration navigation (route state). Never on refresh.
  useEffect(() => {
    if (!user?.email || onboardingCheckedRef.current) return;
    onboardingCheckedRef.current = true;

    const fromNewSignup = (location.state as { isNewUser?: boolean } | null)?.isNewUser === true;

    if (fromNewSignup && !isOnboardingComplete(user.email)) {
      setShowOnboarding(true);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      markOnboardingComplete(user.email);
      setShowOnboarding(false);
    }
  }, [user?.email, location.state]);

  // Restore tab once auth email is known (handles Firebase users on first paint)
  useEffect(() => {
    if (!user?.email) return;
    const savedTab = readSavedDashboardTab(user.email);
    if (savedTab) setActiveTab(savedTab);
  }, [user?.email]);

  const handleCompleteOnboarding = async () => {
    // Get email — user object or localStorage fallback (simulated mode)
    const email = user?.email || (() => {
      try {
        const saved = localStorage.getItem('real_estate_user');
        return saved ? JSON.parse(saved)?.email : null;
      } catch { return null; }
    })();
    if (!email) return;
    markOnboardingComplete(email);
    localStorage.setItem('user_persona', userPersona);
    setShowOnboarding(false);
    await handleSendChatMessage(onboardingQuery);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchBackendHealth()
      .then((health) => {
        if (health.status === 'ok') {
          setBackendAiMode(health.openai_active ? 'openai' : 'fallback');
        }
      })
      .catch(() => setBackendAiMode(null));
  }, []);

  // Trigger search on load only if onboarding is already completed
  useEffect(() => {
    if (user?.email) {
      const lastQuery = localStorage.getItem(`last_query_${user.email}`);
      if (lastQuery) {
        setQuery(lastQuery);
      }
      const completed = isOnboardingComplete(user.email);
      if (completed) {
        handleSearch(lastQuery || query);
      }
    }
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (
    searchQuery: string = query,
    overrides: Partial<ParsedRequirement> = manualOverrides,
    options?: { skipLoadingToggle?: boolean },
  ) => {
    const seq = ++searchSeqRef.current;
    const normalizedOverrides = normalizeParsedRequirement(overrides);
    if (!options?.skipLoadingToggle) {
      setIsLoading(true);
    }
    setIsEditingQuery(false);
    setQuery(searchQuery);
    if (user?.email) {
      localStorage.setItem(`last_query_${user.email}`, searchQuery);
    }
    try {
      const result = await executeSearch(searchQuery, normalizedOverrides);
      if (seq !== searchSeqRef.current) return;

      setSearchResult(result);
      if (result.parsedRequirement) {
        setStructuredFilters(result.parsedRequirement);
      }
      setSelectedProperties([]);

      setSearchHistory(prev => {
        const next = [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 10);
        localStorage.setItem('search_history', JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error(e);
    } finally {
      if (seq === searchSeqRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleApplyOverride = (key: keyof ParsedRequirement, value: any) => {
    const nextOverrides = { ...manualOverrides, [key]: value };
    setManualOverrides(nextOverrides);
    handleSearch(query, nextOverrides);
  };

  const handleResetOverrides = () => {
    setManualOverrides({});
    handleSearch(query, {});
  };

  const handleSaveSearch = () => {
    if (!query) return;
    const newSave = {
      id: 'save-' + Date.now(),
      query,
      timestamp: new Date().toLocaleDateString()
    };
    setSavedSearches(prev => {
      const next = [newSave, ...prev.filter(s => s.query !== query)];
      localStorage.setItem('saved_searches', JSON.stringify(next));
      return next;
    });
    showToast('Search requirement saved successfully!');
  };

  const handleRemoveSavedSearch = (id: string) => {
    setSavedSearches(prev => {
      const next = prev.filter(s => s.id !== id);
      localStorage.setItem('saved_searches', JSON.stringify(next));
      return next;
    });
  };

  const handleApplyRefinement = (refinementType: string) => {
    let newQuery = query;
    if (refinementType === 'budget') {
      if (newQuery.match(/under\s+\d+(?:\.\d+)?\s*(?:lakh|l|lac|cr|crore|k|thousand)/i)) {
        newQuery = newQuery.replace(/under\s+\d+(?:\.\d+)?\s*(?:lakh|l|lac|cr|crore|k|thousand)/i, 'under 60 Lakh');
      } else {
        newQuery += ', under 60 Lakh';
      }
    } else if (refinementType === 'bhk') {
      if (newQuery.match(/\d\s*bhk/i)) {
        newQuery = newQuery.replace(/\d\s*bhk/i, '3 BHK');
      } else {
        newQuery += ', 3 BHK';
      }
    } else if (refinementType === 'ready') {
      if (!newQuery.toLowerCase().includes('ready to move')) {
        newQuery = newQuery.replace(/under construction/i, '');
        newQuery += ', ready to move';
      }
    } else if (refinementType === 'metro') {
      if (!newQuery.toLowerCase().includes('metro')) {
        newQuery += ', near metro station';
      }
    } else if (refinementType === 'godrej') {
      if (!newQuery.toLowerCase().includes('godrej')) {
        newQuery += ', by Godrej Properties';
      }
    }
    newQuery = newQuery.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
    setQuery(newQuery);
    handleSearch(newQuery);
  };

  const handleExportCSV = () => {
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Metric', ...selectedProperties.map(p => p.title)];
    
    const rows = [
      ['Property ID', ...selectedProperties.map(p => p.property_id)],
      ['Source', ...selectedProperties.map(p => p.source)],
      ['Price', ...selectedProperties.map(p => p.price)],
      ['Area (sqft)', ...selectedProperties.map(p => p.area_sqft)],
      ['Price per sqft', ...selectedProperties.map(p => p.price_per_sqft)],
      ['BHK Configuration', ...selectedProperties.map(p => p.bhk)],
      ['Locality', ...selectedProperties.map(p => p.locality)],
      ['Status', ...selectedProperties.map(p => p.status)],
      ['Builder/Developer', ...selectedProperties.map(p => p.builder_or_owner)],
      ['Investment Score', ...selectedProperties.map(p => p.investment_score || '')],
      ['Investment Grade', ...selectedProperties.map(p => p.investment_grade || '')],
      ['Connectivity Score', ...selectedProperties.map(p => p.location_scores?.connectivity || '')],
      ['Schools Score', ...selectedProperties.map(p => p.location_scores?.schools || '')],
      ['Lifestyle Score', ...selectedProperties.map(p => p.location_scores?.lifestyle || '')],
      ['Infrastructure Score', ...selectedProperties.map(p => p.location_scores?.infrastructure || '')],
      ['AI Explanation', ...selectedProperties.map(p => p.recommendation_explanation || '')]
    ];

    const csvContent = [headers, ...rows]
      .map(row => row.map(escapeCSV).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PropIntel_Comparison_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMarkdown = () => {
    let md = `# PropIntel Property Comparison Report\n`;
    md += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    md += `| Metric | ${selectedProperties.map(p => p.title).join(' | ')} |\n`;
    md += `| --- | ${selectedProperties.map(() => '---').join(' | ')} |\n`;
    
    const addRow = (metric: string, extractor: (p: CleanedProperty) => any) => {
      md += `| **${metric}** | ${selectedProperties.map(p => extractor(p)).join(' | ')} |\n`;
    };

    addRow('Property ID', p => p.property_id);
    addRow('Source', p => p.source);
    addRow('Price', p => p.transaction_type === 'Rent' ? `₹${p.price.toLocaleString()} / mo` : `₹${(p.price / 100000).toFixed(1)} Lakh`);
    addRow('Area (sqft)', p => `${p.area_sqft} sq.ft.`);
    addRow('Price per sqft', p => `₹${p.price_per_sqft.toLocaleString()}`);
    addRow('BHK', p => `${p.bhk} BHK`);
    addRow('Locality', p => p.locality);
    addRow('Status', p => p.status);
    addRow('Builder/Developer', p => p.builder_or_owner);
    addRow('Investment Score', p => p.investment_score || 'N/A');
    addRow('Investment Grade', p => p.investment_grade || 'N/A');
    addRow('Connectivity Score', p => p.location_scores ? `${p.location_scores.connectivity}%` : 'N/A');
    addRow('Schools Score', p => p.location_scores ? `${p.location_scores.schools}%` : 'N/A');
    addRow('Lifestyle Score', p => p.location_scores ? `${p.location_scores.lifestyle}%` : 'N/A');
    addRow('Infrastructure Score', p => p.location_scores ? `${p.location_scores.infrastructure}%` : 'N/A');
    addRow('AI Explanation', p => p.recommendation_explanation || 'N/A');

    navigator.clipboard.writeText(md)
      .then(() => {
        showToast('Markdown Comparison Report copied to clipboard successfully!');
      })
      .catch(err => {
        console.error('Could not copy markdown table: ', err);
        showToast('Failed to copy markdown report. Check console logs.', 'error');
      });
  };

  const toggleSelectProperty = (prop: CleanedProperty) => {
    if (selectedProperties.find(p => p.property_id === prop.property_id)) {
      setSelectedProperties(selectedProperties.filter(p => p.property_id !== prop.property_id));
    } else {
      if (selectedProperties.length >= 3) {
        showToast('You can select a maximum of 3 properties for comparison.', 'info');
        return;
      }
      setSelectedProperties([...selectedProperties, prop]);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    try {
      await updateProfile(auth.currentUser, { displayName: editName });
      localStorage.setItem('user_persona', editPersona);
      showToast('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile.', 'error');
    }
  };

  const handleToggleAuthMode = (simulated: boolean) => {
    localStorage.setItem('auth_simulated_mode', simulated ? 'true' : 'false');
    setIsAuthSimulated(simulated);
    showToast('Developer Authentication Mode updated. Reloading portal to apply changes.', 'info');
    window.location.reload();
  };

  const handleResetOnboarding = () => {
    if (user?.email) {
      localStorage.removeItem(onboardingCompleteKey(user.email));
    } else {
      localStorage.removeItem('has_completed_onboarding_demo.user@propintel.com');
    }
    setShowOnboarding(true);
    setOnboardingStep(1);
  };

  // Shared variables derived from active state
  const properties = searchResult?.properties || [];
  const parsedRequirement = structuredFilters || searchResult?.parsedRequirement || null;
  const effectiveAiMode = searchResult?.ai_mode ?? backendAiMode ?? undefined;
  const currentLocality = parsedRequirement?.locality || 'Hinjewadi';
  const currentCity = parsedRequirement?.city || 'Pune';

  const searchBuilders = (searchResult?.builders || {}) as Record<string, BuilderReputation>;
  const searchSentiments = (searchResult?.sentiments || {}) as Record<string, LocalitySentiment>;
  const searchTrends = (searchResult?.trends || {}) as Record<string, LocalityTrend>;
  const currentSentiment = searchSentiments[currentLocality] || localitySentimentData[currentLocality] || null;
  const currentTrend = searchTrends[currentLocality] || localityTrendsData[currentLocality] || null;
  const mergedTrends = { ...localityTrendsData, ...searchTrends };

  // Calculate overview statistics
  const matchingCount = properties.filter(p => !p.is_incomplete).length;

  const avgPricePerSqft = properties.length > 0
    ? Math.round(properties.reduce((acc, p) => acc + p.price_per_sqft, 0) / properties.length)
    : 0;

  const avgBuilderScore = properties.length > 0
    ? Number(
        (properties.reduce((acc, p) => {
          const builder = searchBuilders[p.builder_or_owner] || buildersData[p.builder_or_owner];
          return acc + (builder ? builder.reputation_score : 4.0);
        }, 0) / properties.length * 2).toFixed(1)
      )
    : 0;

  const overviewBuilders = (() => {
    const names = [...new Set(properties.map((p) => p.builder_or_owner).filter(Boolean))];
    const fromMatches = names
      .map((name) => searchBuilders[name] || buildersData[name])
      .filter(Boolean) as BuilderReputation[];
    if (fromMatches.length > 0) return fromMatches.slice(0, 4);
    return Object.values({ ...buildersData, ...searchBuilders }).slice(0, 4);
  })();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <OverviewTab
            query={query}
            setQuery={setQuery}
            tempQuery={tempQuery}
            setTempQuery={setTempQuery}
            isEditingQuery={isEditingQuery}
            setIsEditingQuery={setIsEditingQuery}
            parsedRequirement={parsedRequirement}
            matchingCount={matchingCount}
            avgPricePerSqft={avgPricePerSqft}
            avgBuilderScore={avgBuilderScore}
            currentLocality={currentLocality}
            currentCity={currentCity}
            properties={properties}
            selectedProperties={selectedProperties}
            toggleSelectProperty={toggleSelectProperty}
            handleSearch={handleSearch}
            handleApplyRefinement={handleApplyRefinement}
            theme={theme}
            isLoading={isLoading}
            setActiveTab={selectTab}
            chatMessages={chatMessages}
            onSendChatMessage={handleSendChatMessage}
            aiMode={effectiveAiMode}
            overviewBuilders={overviewBuilders}
            currentSentiment={currentSentiment}
            currentTrend={currentTrend}
            trendsMap={mergedTrends}
          />
        );
      case 'Requirements':
        return (
          <RequirementsTab
            parsedRequirement={parsedRequirement}
            manualOverrides={manualOverrides}
            handleApplyOverride={handleApplyOverride}
            handleResetOverrides={handleResetOverrides}
            handleSaveSearch={handleSaveSearch}
            searchHistory={searchHistory}
            handleSearch={handleSearch}
            setQuery={setQuery}
            setManualOverrides={setManualOverrides}
          />
        );
      case 'Properties':
        return (
          <PropertiesTab
            properties={properties}
            propertyFilters={propertyFilters}
            setPropertyFilters={setPropertyFilters}
            selectedProperties={selectedProperties}
            toggleSelectProperty={toggleSelectProperty}
            isLoading={isLoading}
            setActiveTab={selectTab}
            onRefresh={() => handleSearch(query)}
          />
        );
      case 'Comparisons':
        return (
          <ComparisonsTab
            selectedProperties={selectedProperties}
            toggleSelectProperty={toggleSelectProperty}
            setSelectedProperties={setSelectedProperties}
            setActiveTab={selectTab}
            handleExportCSV={handleExportCSV}
            handleExportMarkdown={handleExportMarkdown}
          />
        );
      case 'Builders':
        return (
          <BuildersTab
            builderSearch={builderSearch}
            setBuilderSearch={setBuilderSearch}
          />
        );
      case 'Trends':
        return (
          <TrendsTab
            currentLocality={currentLocality}
          />
        );
      case 'Saved Searches':
        return (
          <SavedSearchesTab
            savedSearches={savedSearches}
            handleRemoveSavedSearch={handleRemoveSavedSearch}
            handleSearch={handleSearch}
            setActiveTab={selectTab}
            setQuery={setQuery}
            setManualOverrides={setManualOverrides}
          />
        );
      case 'Data & Compliance':
        return <DataComplianceTab />;
      case 'Settings':
        return (
          <SettingsTab
            editName={editName}
            setEditName={setEditName}
            editEmail={editEmail}
            editPersona={editPersona}
            setEditPersona={setEditPersona}
            isAuthSimulated={isAuthSimulated}
            handleUpdateProfile={handleUpdateProfile}
            handleToggleAuthMode={handleToggleAuthMode}
            handleResetOnboarding={handleResetOnboarding}
            theme={theme}
            setTheme={setTheme}
          />
        );
      default:
        return (
          <OverviewTab
            query={query}
            setQuery={setQuery}
            tempQuery={tempQuery}
            setTempQuery={setTempQuery}
            isEditingQuery={isEditingQuery}
            setIsEditingQuery={setIsEditingQuery}
            parsedRequirement={parsedRequirement}
            matchingCount={matchingCount}
            avgPricePerSqft={avgPricePerSqft}
            avgBuilderScore={avgBuilderScore}
            currentLocality={currentLocality}
            currentCity={currentCity}
            properties={properties}
            selectedProperties={selectedProperties}
            toggleSelectProperty={toggleSelectProperty}
            handleSearch={handleSearch}
            handleApplyRefinement={handleApplyRefinement}
            theme={theme}
            isLoading={isLoading}
            setActiveTab={selectTab}
            chatMessages={chatMessages}
            onSendChatMessage={handleSendChatMessage}
            aiMode={effectiveAiMode}
            overviewBuilders={overviewBuilders}
            currentSentiment={currentSentiment}
            currentTrend={currentTrend}
            trendsMap={mergedTrends}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-theme-bg text-theme-text font-sans overflow-hidden select-none relative">
      {/* Aceternity UI Dot Grid Background */}
      <div className="absolute inset-0 aceternity-dots aceternity-mask pointer-events-none z-0"></div>
      
      {/* LEFT SIDEBAR SECTION */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={selectTab}
        selectedPropertiesCount={selectedProperties.length}
        logout={logout}
        user={user}
        setIsConsoleOpen={setIsConsoleOpen}
      />

      {/* MAIN CONTAINER WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Ambient glows behind modules */}
        <div className="absolute top-10 right-20 w-96 h-96 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* TOP HEADER SECTION */}
        <Header
          user={user}
          theme={theme}
          setTheme={setTheme}
          logout={logout}
          setActiveTab={selectTab}
          editPersona={editPersona}
        />

        {/* SCROLLABLE MAIN CONTENT GRID */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6 z-10">
          {renderTabContent()}
        </main>
      </div>

      {/* Compare Modal */}
      {isCompareOpen && (
        <CompareModal 
          properties={selectedProperties} 
          onClose={() => setIsCompareOpen(false)} 
        />
      )}

      {/* Developer Log Console Drawer */}
      <DeveloperConsole 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
        rawQuery={query}
        parsedRequirement={parsedRequirement}
        properties={properties}
        aiMode={effectiveAiMode}
      />

      {/* Onboarding Welcome Wizard Overlay */}
      <OnboardingWizard
        showOnboarding={showOnboarding}
        onboardingStep={onboardingStep}
        setOnboardingStep={setOnboardingStep}
        userPersona={userPersona}
        setUserPersona={setUserPersona}
        onboardingQuery={onboardingQuery}
        setOnboardingQuery={setOnboardingQuery}
        handleCompleteOnboarding={handleCompleteOnboarding}
        theme={theme}
        setTheme={setTheme}
      />

    </div>
  );
}
