import { localAdapter } from './localAdapter';
import { createRemoteAdapter } from './remoteAdapter';
import type { HealthApiAdapter } from './types';

const remoteUrl = import.meta.env.VITE_API_URL as string | undefined;

/**
 * Точка переключения: если задан VITE_API_URL — работаем с сервером,
 * иначе — с локальным TS-ядром (src/core/).
 */
export const healthApi: HealthApiAdapter = remoteUrl
  ? createRemoteAdapter(remoteUrl)
  : localAdapter;

export type { HealthApiAdapter } from './types';
