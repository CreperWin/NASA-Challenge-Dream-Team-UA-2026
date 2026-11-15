import type { EvaluationResult, Scenario } from '../core/types';
import type { HealthApiAdapter } from './types';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Удалённый HTTP-адаптер для подключения реального бэкенда.
 */
export function createRemoteAdapter(baseUrl: string): HealthApiAdapter {
  const api = baseUrl.replace(/\/$/, '');

  return {
    getEvaluation: () => requestJson<EvaluationResult>(`${api}/evaluation`),
    getScenarios: () => requestJson<Scenario[]>(`${api}/scenarios`),
    loadScenario: (scenarioId: string) =>
      requestJson<EvaluationResult>(`${api}/scenarios/${encodeURIComponent(scenarioId)}/load`, {
        method: 'POST',
      }),
    resetData: () => requestJson<EvaluationResult>(`${api}/evaluation/reset`, { method: 'POST' }),
  };
}
