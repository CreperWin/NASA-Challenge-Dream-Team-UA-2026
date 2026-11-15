import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import MeasurePage from './pages/MeasurePage';
import BodyMapPage from './pages/BodyMapPage';
import { healthApi } from './api';
import { INDICATORS } from './core/indicators';
import { INDICATOR_IDS } from './core/types';
import type { EvaluationResult, IndicatorId, Scenario, Status } from './core/types';

const STATUS_ICON: Record<Status, string> = {
  normal: '✓',
  attention: '⚠',
  critical: '!',
};

function formatIndicatorValue(id: IndicatorId, evaluation: EvaluationResult) {
  const latest = evaluation.indicators[id].latest;
  if (latest.length === 0) return { value: '—', unit: 'no data' };
  if (id === 'blood_pressure') {
    const sys = latest.find((m) => m.type === 'bp_systolic')?.value;
    const dia = latest.find((m) => m.type === 'bp_diastolic')?.value;
    return {
      value: sys !== undefined && dia !== undefined ? `${sys}/${dia}` : '—',
      unit: 'mmHg',
    };
  }
  const m = latest[0];
  return { value: String(m.value), unit: m.unit };
}

function Dashboard() {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    let active = true;
    healthApi.getEvaluation().then((res) => {
      if (active) setEvaluation(res);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!evaluation) {
    return <div className="body-zone-status">Loading telemetry...</div>;
  }

  const alerts = INDICATOR_IDS.map((id) => evaluation.indicators[id]).filter(
    (res) => res.latest.length > 0 && res.status !== 'normal',
  );

  return (
    <div className="dashboard-layout">
      <div className="dashboard-top">
        <div className="dashboard-summary-card">
          <div className="summary-row">
            <span className="summary-label">Overall Crew Health</span>
            <span className={`status-pill status-${evaluation.overall}`}>
              {STATUS_ICON[evaluation.overall]} {evaluation.overall}
            </span>
          </div>

          <div className="alerts-block">
            <div className="alerts-title">Active Alerts ({alerts.length})</div>
            {alerts.length === 0 ? (
              <div className="alert-empty">✓ All telemetry indicators are within normal range.</div>
            ) : (
              alerts.map((a) => (
                <div key={a.indicator} className={`alert-item status-text-${a.status}`}>
                  {STATUS_ICON[a.status]} {a.reason}
                </div>
              ))
            )}
          </div>
        </div>

        <Link to="/body" className="mini-body-card" title="Open Interactive Body Map">
          <svg viewBox="390 25 244 525" className="mini-body-svg">
            <image
              href="/body-silhouette-male.svg"
              x="390"
              y="25"
              width="244"
              height="525"
            />
            {evaluation.regions.brain_mind !== 'normal' &&
              evaluation.regions.brain_mind !== 'no-data' && (
                <circle
                  cx="512"
                  cy="76"
                  r="24"
                  fill="rgba(245, 158, 11, 0.38)"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
              )}
          </svg>
          <span className="mini-body-label">Body Map →</span>
        </Link>
      </div>

      <main className="dashboard-grid">
        {INDICATOR_IDS.map((id) => {
          const def = INDICATORS[id];
          const res = evaluation.indicators[id];
          const { value, unit } = formatIndicatorValue(id, evaluation);
          const hasData = res.latest.length > 0;

          return (
            <div key={id} className={`metric-card metric-card-${hasData ? res.status : 'nodata'}`}>
              <div className="metric-card-header">
                <span className="metric-card-title">{def.label}</span>
                <span className={`status-pill status-${res.status}`}>
                  {STATUS_ICON[res.status]} {hasData ? res.status : 'no data'}
                </span>
              </div>
              <div className="metric-card-value">
                <span className="metric-number">{value}</span>
                <span className="metric-unit">{unit}</span>
              </div>
              <div className="metric-card-reason">{res.reason}</div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

function MissionPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overall, setOverall] = useState<Status | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([healthApi.getScenarios(), healthApi.getEvaluation()]).then(([list, evalRes]) => {
      if (!active) return;
      setScenarios(list);
      setOverall(evalRes.overall);
    });
    return () => {
      active = false;
    };
  }, []);

  const applyScenario = async (scenarioId: string) => {
    const res = await healthApi.loadScenario(scenarioId);
    setActiveId(scenarioId);
    setOverall(res.overall);
  };

  const resetStorage = async () => {
    const res = await healthApi.resetData();
    setActiveId(null);
    setOverall(res.overall);
  };

  return (
    <div className="dashboard-layout">
      <div className="summary-row">
        <span className="summary-label">
          Mission Scenario Player {overall ? `(${overall})` : ''}
        </span>
        <button type="button" className="close-btn" onClick={resetStorage}>
          Reset to Default
        </button>
      </div>
      <div className="dashboard-grid">
        {scenarios.map((s) => {
          const isCurrent = activeId === s.id;
          return (
            <div key={s.id} className="metric-card">
              <div className="metric-card-header">
                <span className="metric-card-title">{s.id}</span>
                <span className="status-pill status-normal">{s.days.length} days</span>
              </div>
              <div className="organ-title">{s.title}</div>
              <div className="metric-card-reason">{s.story}</div>
              <button
                type="button"
                className={`gender-btn ${isCurrent ? 'active' : ''}`}
                onClick={() => applyScenario(s.id)}
              >
                {isCurrent ? 'Active ✓' : 'Load Scenario'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-slate-100 p-6 font-sans selection:bg-emerald-500 selection:text-black">
        <div className="max-w-6xl mx-auto">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/body" element={<BodyMapPage />} />
            <Route path="/measure" element={<MeasurePage />} />
            <Route path="/mission" element={<MissionPage />} />
          </Routes>
          <footer className="mt-16 border-t border-neutral-900 pt-4 text-center text-xs text-neutral-600 font-mono">
            Dream Team UA // Orbital Telemetry Monitoring Interface
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}
