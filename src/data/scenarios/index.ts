import sample from './sample.json';
import nominal from './nominal.json';
import evaOverload from './eva-overload.json';
import hypoglycemiaFever from './hypoglycemia-fever.json';
import type { Scenario } from '../../core/types';

export const SCENARIOS: Scenario[] = [
  nominal as Scenario,
  sample as Scenario,
  evaOverload as Scenario,
  hypoglycemiaFever as Scenario,
];
