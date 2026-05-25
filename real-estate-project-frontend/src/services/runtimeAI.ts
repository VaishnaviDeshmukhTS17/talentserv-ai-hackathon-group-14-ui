/** @deprecated Groq removed — AI runs on Python backend with OpenAI */
export { chatWithAgent, fetchBackendHealth, isBackendAiActive, getApiBaseUrl } from './apiClient';

export async function isOpenAiBackendActive(): Promise<boolean> {
  try {
    const { fetchBackendHealth } = await import('./apiClient');
    const health = await fetchBackendHealth();
    return health.status === 'ok';
  } catch {
    return false;
  }
}
