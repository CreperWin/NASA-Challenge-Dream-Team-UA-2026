import { createScenarioPlayer, type PlayerState } from '../data/player';
import { getScenario, scenarios } from '../data/scenarios';
import { VITALS_STORAGE_KEY, type StoredVitals } from '../pages/MeasurePage';

export interface MissionStore {
  selectedId: string;
  playerState: PlayerState;
  vitals: StoredVitals;
}

const DEFAULT_VITALS: StoredVitals = {
  heart_rate: 72,
  bp_systolic: 118,
  bp_diastolic: 76,
  body_temperature: 36.6,
  blood_glucose: 92,
  sleep_hours: 7.5,
  sleep_quality: 4,
  mood_score: 4,
  notes: '',
  updatedAt: 'Nominal baseline',
};

function loadInitialVitals(): StoredVitals {
  try {
    const saved = localStorage.getItem(VITALS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return DEFAULT_VITALS;
}

let store: MissionStore = {
  selectedId: scenarios[0]?.id ?? 'normal',
  playerState: {
    running: false,
    scenarioId: null,
    speed: 1,
    index: 0,
    total: 0,
    day: null,
  },
  vitals: loadInitialVitals(),
};

type Listener = (snapshot: MissionStore) => void;
const listeners = new Set<Listener>();

function emit() {
  const snapshot: MissionStore = {
    selectedId: store.selectedId,
    playerState: { ...store.playerState },
    vitals: { ...store.vitals },
  };
  listeners.forEach((fn) => fn(snapshot));
}

const player = createScenarioPlayer({
  getScenario,
  onStateChange: (nextState) => {
    store = { ...store, playerState: { ...nextState } };
    emit();
  },
  onDay: (event) => {
    const dayNumber = event.day ?? event.index;
    const updated: StoredVitals = {
      ...store.vitals,
      updatedAt: `Mission Day ${dayNumber}`,
    };

    for (const m of event.measurements) {
      if (m.type in updated) {
        (updated as unknown as Record<string, number | string>)[m.type] = m.value;
      }
    }

    localStorage.setItem(VITALS_STORAGE_KEY, JSON.stringify(updated));
    store = { ...store, vitals: updated };
    emit();
  },
});

export function getMissionStore(): MissionStore {
  return store;
}

export function subscribeMission(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function selectScenario(id: string) {
  store = { ...store, selectedId: id };
  if (store.playerState.running) {
    player.start(id);
  } else {
    emit();
  }
}

export function startOrResumeMission() {
  const { selectedId, playerState } = store;
  if (
    playerState.scenarioId === selectedId &&
    !playerState.running &&
    playerState.index > 0 &&
    playerState.index < playerState.total
  ) {
    player.resume();
  } else {
    player.start(selectedId);
  }
}

export function pauseMission() {
  player.pause();
}

export function resetMission() {
  player.reset();
}

export function setMissionSpeed(speed: number) {
  player.setSpeed(speed);
}