const SESSION_EMAIL_KEY = 'propintel_session_email';

export function onboardingCompleteKey(email: string) {
  return `has_completed_onboarding_${email}`;
}

export function dashboardTabKey(email: string) {
  return `dashboard_active_tab_${email}`;
}

export function markOnboardingComplete(email: string | null | undefined) {
  if (!email) return;
  localStorage.setItem(onboardingCompleteKey(email), 'true');
}

export function isOnboardingComplete(email: string | null | undefined) {
  if (!email) return false;
  return localStorage.getItem(onboardingCompleteKey(email)) === 'true';
}

export function getStoredUserEmail(): string | null {
  try {
    const savedUser = localStorage.getItem('real_estate_user');
    if (savedUser) {
      return JSON.parse(savedUser)?.email ?? null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Email for this browser session — survives refresh (unlike React Router location.state). */
export function getSessionEmail(): string | null {
  return sessionStorage.getItem(SESSION_EMAIL_KEY) || getStoredUserEmail();
}

export function persistUserSession(email: string, name: string) {
  sessionStorage.setItem(SESSION_EMAIL_KEY, email);
  localStorage.setItem('real_estate_user', JSON.stringify({ email, name }));
}

export function readSavedDashboardTab(email?: string | null): string | null {
  const resolved = email || getSessionEmail();
  if (!resolved) return null;
  return localStorage.getItem(dashboardTabKey(resolved));
}

export function saveDashboardTab(tab: string, email?: string | null) {
  const resolved = email || getSessionEmail();
  if (!resolved) return;
  localStorage.setItem(dashboardTabKey(resolved), tab);
}
