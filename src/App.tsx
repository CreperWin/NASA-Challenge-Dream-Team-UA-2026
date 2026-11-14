import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import MeasurePage, { VITALS_STORAGE_KEY, type StoredVitals } from './pages/MeasurePage';
import IndicatorPage from './pages/IndicatorPage';
import { useState } from 'react';

type ZoneStatus = 'normal' | 'attention' | 'critical';

function getStatus(val: number, normalMin: number, normalMax: number, critMin: number, critMax: number): ZoneStatus {
  if (val < critMin || val > critMax) return 'critical';
  if (val < normalMin || val > normalMax) return 'attention';
  return 'normal';
}

const STATUS_LABELS: Record<ZoneStatus, string> = {
  normal: 'Normal state',
  attention: 'Attention',
  critical: 'Critical state',
};

function Dashboard() {
  const [vitals] = useState<StoredVitals>(() => {
    const saved = localStorage.getItem(VITALS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback below
      }
    }
    return {
      heart_rate: 72,
      bp_systolic: 118,
      bp_diastolic: 76,
      body_temperature: 36.6,
      blood_glucose: 92,
      sleep_hours: 7.5,
      sleep_quality: 4,
      mood_score: 4,
      notes: '',
      updatedAt: 'Nominal',
    };
  });

  const hrStatus = getStatus(vitals.heart_rate, 50, 100, 40, 120);
  const tempStatus = getStatus(vitals.body_temperature, 36, 37.5, 35, 38.5);
  const sysStatus = getStatus(vitals.bp_systolic, 90, 130, 80, 160);
  const diaStatus = getStatus(vitals.bp_diastolic, 60, 85, 50, 100);
  const bpStatus: ZoneStatus =
    sysStatus === 'critical' || diaStatus === 'critical'
      ? 'critical'
      : sysStatus === 'attention' || diaStatus === 'attention'
      ? 'attention'
      : 'normal';
  const glucoseStatus = getStatus(vitals.blood_glucose, 70, 140, 54, 200);
  const sleepStatus = getStatus(vitals.sleep_hours, 6, 10, 4, 16);
  const moodStatus: ZoneStatus = vitals.mood_score < 2 ? 'critical' : vitals.mood_score < 3 ? 'attention' : 'normal';

  const alerts: { label: string; status: ZoneStatus; detail: string }[] = [];
  if (hrStatus !== 'normal') alerts.push({ label: 'Heart Rate', status: hrStatus, detail: `${vitals.heart_rate} bpm` });
  if (bpStatus !== 'normal') alerts.push({ label: 'Blood Pressure', status: bpStatus, detail: `${vitals.bp_systolic}/${vitals.bp_diastolic} mmHg` });
  if (tempStatus !== 'normal') alerts.push({ label: 'Body Temperature', status: tempStatus, detail: `${vitals.body_temperature} °C` });
  if (glucoseStatus !== 'normal') alerts.push({ label: 'Blood Glucose', status: glucoseStatus, detail: `${vitals.blood_glucose} mg/dL` });
  if (sleepStatus !== 'normal') alerts.push({ label: 'Sleep Duration', status: sleepStatus, detail: `${vitals.sleep_hours} hours` });
  if (moodStatus !== 'normal') alerts.push({ label: 'Mood Score', status: moodStatus, detail: `${vitals.mood_score} / 5` });

  return (
    <div className="dashboard-layout">
      {/* ЛІВА КОЛОНКА: 6 карток показників із кольоровими зонами */}
      <div className="vitals-grid-6">
        <Link to="/indicator/heart_rate" className="vital-card">
          <div className="vital-card-top">
            <h2 className="vital-card-title">Heart Rate</h2>
            <span className={`status-pill status-${hrStatus}`}>{STATUS_LABELS[hrStatus]}</span>
          </div>
          <div className="vital-value-row">
            <span className="vital-number">{vitals.heart_rate}</span>
            <span className="vital-unit">bpm</span>
          </div>
          <div className="vital-range-hint">Normal: 50–100 bpm</div>
        </Link>

        <Link to="/indicator/bp_systolic" className="vital-card">
          <div className="vital-card-top">
            <h2 className="vital-card-title">Blood Pressure</h2>
            <span className={`status-pill status-${bpStatus}`}>{STATUS_LABELS[bpStatus]}</span>
          </div>
          <div className="vital-value-row">
            <span className="vital-number">{vitals.bp_systolic}/{vitals.bp_diastolic}</span>
            <span className="vital-unit">mmHg</span>
          </div>
          <div className="vital-range-hint">Normal: 90–130 / 60–85 mmHg</div>
        </Link>

        <Link to="/indicator/body_temperature" className="vital-card">
          <div className="vital-card-top">
            <h2 className="vital-card-title">Body Temperature</h2>
            <span className={`status-pill status-${tempStatus}`}>{STATUS_LABELS[tempStatus]}</span>
          </div>
          <div className="vital-value-row">
            <span className="vital-number">{vitals.body_temperature}</span>
            <span className="vital-unit">°C</span>
          </div>
          <div className="vital-range-hint">Normal: 36.0–37.5 °C</div>
        </Link>

        <Link to="/indicator/blood_glucose" className="vital-card">
          <div className="vital-card-top">
            <h2 className="vital-card-title">Blood Glucose</h2>
            <span className={`status-pill status-${glucoseStatus}`}>{STATUS_LABELS[glucoseStatus]}</span>
          </div>
          <div className="vital-value-row">
            <span className="vital-number">{vitals.blood_glucose}</span>
            <span className="vital-unit">mg/dL</span>
          </div>
          <div className="vital-range-hint">Normal: 70–140 mg/dL</div>
        </Link>

        <Link to="/indicator/sleep_hours" className="vital-card">
          <div className="vital-card-top">
            <h2 className="vital-card-title">Sleep Duration</h2>
            <span className={`status-pill status-${sleepStatus}`}>{STATUS_LABELS[sleepStatus]}</span>
          </div>
          <div className="vital-value-row">
            <span className="vital-number">{vitals.sleep_hours}</span>
            <span className="vital-unit">hours</span>
          </div>
          <div className="vital-range-hint">Normal: 6–10 hours (Quality {vitals.sleep_quality}/5)</div>
        </Link>

        <Link to="/indicator/mood_score" className="vital-card">
          <div className="vital-card-top">
            <h2 className="vital-card-title">Mood &amp; Stress</h2>
            <span className={`status-pill status-${moodStatus}`}>{STATUS_LABELS[moodStatus]}</span>
          </div>
          <div className="vital-value-row">
            <span className="vital-number">{vitals.mood_score}</span>
            <span className="vital-unit">/ 5</span>
          </div>
          <div className="vital-range-hint">Normal: 3–5 score</div>
        </Link>
      </div>

      {/* ПРАВА КОЛОНКА: Зона Alert-ів + Контейнер під 2D-модель тіла */}
      <div className="dashboard-right-col">
        <div className="nasa-white-card">
          <span className="nasa-tag">SYSTEM ALERTS</span>
          <h3>Telemetry Status</h3>
          {alerts.length === 0 ? (
            <div className="alert-item status-normal">
              ✓ All 6 biomedical systems nominal (Last sync: {vitals.updatedAt})
            </div>
          ) : (
            alerts.map((a, idx) => (
              <div key={idx} className={`alert-item status-${a.status}`}>
                ⚠ {a.label}: {a.detail} — {STATUS_LABELS[a.status]}
              </div>
            ))
          )}
        </div>

        <div className="nasa-white-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="nasa-tag">BIOMETRIC MAP</span>
            <Link to="/body" className="unit-label" style={{ textDecoration: 'underline' }}>
              Full Body View →
            </Link>
          </div>
          <h3>Astronaut 2D Body Model</h3>
          {/* Контейнер для інтеграції 2D-фігури тіла іншим учасником */}
          <Link to="/body" id="body-map-widget-slot" className="body-placeholder-box">
            <strong>[ 2D Interactive Body Model Slot ]</strong>
            <span style={{ marginTop: '0.4rem' }}>
              Click to inspect organ systems &amp; localized telemetry
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function BodyMapPage() {
  return (
    <div className="nasa-white-card">
      <span className="nasa-tag">BODY SYSTEMS</span>
      <h2>Interactive Body Map</h2>
      <p>Full-scale 2D body visualization and system diagnostics module.</p>
    </div>
  );
}

function MissionPage() {
  return (
    <div className="nasa-white-card">
      <span className="nasa-tag">SIMULATION</span>
      <h2>Mission Scenario Player</h2>
      <p>Orbital mission timeline and telemetry scenario controls (/mission).</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-100 p-6 font-sans">
        <Navbar />
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/body" element={<BodyMapPage />} />
            <Route path="/measure" element={<MeasurePage />} />
            <Route path="/indicator/:id" element={<IndicatorPage />} />
            <Route path="/mission" element={<MissionPage />} />
          </Routes>
          <footer>
            Dream Team UA // HealthySpace Orbital Telemetry Monitoring Interface
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}