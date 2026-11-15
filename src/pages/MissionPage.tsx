import { useEffect, useState } from 'react';
import { getScenario, scenarios } from '../data/scenarios';
import thresholdsData from '../content/thresholds.json';
import {
  getMissionStore,
  pauseMission,
  resetMission,
  selectScenario,
  setMissionSpeed,
  startOrResumeMission,
  subscribeMission,
} from '../core/missionControler';

type ZoneStatus = 'normal' | 'attention' | 'critical';

const STATUS_LABELS: Record<ZoneStatus, string> = {
  normal: 'Normal state',
  attention: 'Attention',
  critical: 'Critical state',
};

const SPEEDS = [0.5, 1, 2, 5, 10];

function getThresholdStatus(key: keyof typeof thresholdsData, value: number): ZoneStatus {
  const entry = thresholdsData[key] as {
    zones?: Array<{ status: string; min?: number; max?: number }>;
  };
  let matched: ZoneStatus = 'normal';
  for (const zone of entry?.zones ?? []) {
    const aboveMin = !('min' in zone) || zone.min === undefined || value >= zone.min;
    const belowMax = !('max' in zone) || zone.max === undefined || value <= zone.max;
    if (aboveMin && belowMax) {
      matched = zone.status as ZoneStatus;
    }
  }
  return matched;
}

export default function MissionPage() {
  const [mission, setMission] = useState(() => getMissionStore());

  useEffect(() => {
    return subscribeMission(setMission);
  }, []);

  const { selectedId, playerState, vitals } = mission;
  const selectedScenario = getScenario(selectedId);
  const currentDay = playerState.day ?? (playerState.index > 0 ? playerState.index : 187);
  const progressPercent =
    playerState.total > 0 ? Math.round((playerState.index / playerState.total) * 100) : 0;

  const hrStatus = getThresholdStatus('heart_rate', vitals.heart_rate);
  const tempStatus = getThresholdStatus('body_temperature', vitals.body_temperature);
  const sysStatus = getThresholdStatus('bp_systolic', vitals.bp_systolic);
  const diaStatus = getThresholdStatus('bp_diastolic', vitals.bp_diastolic);
  const bpStatus: ZoneStatus =
    sysStatus === 'critical' || diaStatus === 'critical'
      ? 'critical'
      : sysStatus === 'attention' || diaStatus === 'attention'
        ? 'attention'
        : 'normal';
  const glucoseStatus = getThresholdStatus('blood_glucose', vitals.blood_glucose);
  const sleepStatus = getThresholdStatus('sleep_hours', vitals.sleep_hours);
  const moodStatus = getThresholdStatus('mood_score', vitals.mood_score);

  const metricsSummary: Array<{ label: string; value: string; status: ZoneStatus }> = [
    { label: 'Heart Rate', value: `${vitals.heart_rate} bpm`, status: hrStatus },
    { label: 'Blood Pressure', value: `${vitals.bp_systolic}/${vitals.bp_diastolic} mmHg`, status: bpStatus },
    { label: 'Body Temperature', value: `${vitals.body_temperature} °C`, status: tempStatus },
    { label: 'Blood Glucose', value: `${vitals.blood_glucose} mg/dL`, status: glucoseStatus },
    { label: 'Sleep Duration', value: `${vitals.sleep_hours} hrs`, status: sleepStatus },
    { label: 'Mood & Stress', value: `${vitals.mood_score} / 5`, status: moodStatus },
  ];

  return (
    <div className="mission-page">
      <div className="nasa-white-card">
        <div className="mission-header-row">
          <div>
            <span className="nasa-tag">MISSION SIMULATION</span>
            <h2 className="mission-title">Orbital Telemetry Scenario Player</h2>
          </div>

          <div className="mission-day-badge">
            MISSION DAY: <strong>{currentDay}</strong>
            {playerState.total > 0 && (
              <span className="mission-steps">
                ({playerState.index}/{playerState.total} steps)
              </span>
            )}
          </div>
        </div>

        <div className="mission-section-label">1. Select Mission Scenario</div>
        <div className="mission-scenarios-grid">
          {scenarios.map((sc) => {
            const isSelected = sc.id === selectedId;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => selectScenario(sc.id)}
                className={`mission-scenario-card ${isSelected ? 'active' : ''}`}
              >
                <div className="mission-scenario-title">{sc.title ?? sc.id}</div>
                <div className="mission-scenario-meta">
                  Duration: {sc.days?.length ?? 0} mission days
                </div>
              </button>
            );
          })}
        </div>

        <div className="mission-controls-bar">
          <div className="mission-playback-btns">
            {!playerState.running ? (
              <button
                type="button"
                onClick={startOrResumeMission}
                className="mission-btn mission-btn-start"
              >
                ▶{' '}
                {playerState.scenarioId === selectedId &&
                playerState.index > 0 &&
                playerState.index < playerState.total
                  ? 'Resume'
                  : 'Start Simulation'}
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseMission}
                className="mission-btn mission-btn-pause"
              >
                ❚❚ Pause
              </button>
            )}

            <button
              type="button"
              onClick={resetMission}
              className="mission-btn mission-btn-reset"
            >
              ↺ Reset
            </button>
          </div>

          <div className="mission-speed-group">
            <span className="mission-speed-label">TIME SPEED:</span>
            {SPEEDS.map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setMissionSpeed(sp)}
                className={`mission-speed-btn ${playerState.speed === sp ? 'active' : ''}`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>

        <div className="mission-progress-wrap">
          <div className="mission-progress-info">
            <span>
              ACTIVE SCENARIO: <strong>{selectedScenario?.title ?? selectedId}</strong>
            </span>
            <span> {progressPercent}%</span>
          </div>
          <div className="mission-progress-track">
            <div
              className="mission-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="nasa-white-card">
        <div className="mission-header-row">
          <div>
            <span className="nasa-tag">LIVE TELEMETRY MONITOR</span>
            <h3 className="mission-title">Astronaut Status Overview</h3>
          </div>
          <span className="mission-steps">Sync: {vitals.updatedAt}</span>
        </div>

        <div className="mission-monitor-grid">
          {metricsSummary.map((item) => (
            <div key={item.label} className="mission-monitor-item">
              <div>
                <div className="mission-monitor-label">{item.label}</div>
                <div className="mission-monitor-value">{item.value}</div>
              </div>
              <span className={`status-pill status-${item.status}`}>
                {STATUS_LABELS[item.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}