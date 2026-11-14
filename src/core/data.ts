import thresholdsJson from '../content/thresholds.json';
import contentJson from '../content/content.json';
import type { ContentFile, ThresholdsFile } from './types';

export const thresholds = thresholdsJson as unknown as ThresholdsFile;
export const content = contentJson as unknown as ContentFile;