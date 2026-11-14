import sample from '../data/scenarios/sample.json';
import { measurementsFromScenario } from './measurements';
import type { Measurement, Profile, Scenario } from './types';

// A6: мок-дані, щоб UI можна було будувати, не чекаючи збереження й сценаріїв.
export const mockProfile: Profile = { name: 'Commander Test' };

/** 3 дні зі sample.json: сон падає з 7.2 до 5.4 год → sleep = attention. */
export const mockMeasurements: Measurement[] = measurementsFromScenario(sample as Scenario);
