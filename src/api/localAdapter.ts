import { evaluate } from '../core/evaluate';
import { measurementsFromScenario } from '../core/measurements';
import { mockMeasurements, mockProfile } from '../core/mock';
import { clearMeasurements, loadMeasurements, saveMeasurements } from '../core/storage';
import { SCENARIOS } from '../data/scenarios';
import type { HealthApiAdapter } from './types';

function evaluateCurrent() {
  const stored = loadMeasurements();
  const measurements = stored.length > 0 ? stored : mockMeasurements;
  return evaluate(measurements, mockProfile);
}

/**
 * Локальный клиентский бэкенд поверх src/core/ и localStorage.
 */
export const localAdapter: HealthApiAdapter = {
  async getEvaluation() {
    return evaluateCurrent();
  },

  async getScenarios() {
    return SCENARIOS;
  },

  async loadScenario(scenarioId: string) {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario "${scenarioId}" not found`);
    }
    saveMeasurements(measurementsFromScenario(scenario));
    return evaluateCurrent();
  },

  async resetData() {
    clearMeasurements();
    return evaluateCurrent();
  },
};
