import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MeasurePage from './pages/MeasurePage';
import { useState, useEffect } from 'react';

function Dashboard() {
  const [heartRate, setHeartRate] = useState(72);
  const [temp, setTemp] = useState(36.6);
  const [bpSystolic, setBpSystolic] = useState(118);
  const [bpDiastolic, setBpDiastolic] = useState(76);
  const [glucose, setGlucose] = useState(92);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [moodScore, setMoodScore] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      // Коливання в межах зони "normal" згідно з thresholds.json
      setHeartRate(() => Math.floor(68 + Math.random() * 9));
      setTemp(() => Number((36.4 + Math.random() * 0.4).toFixed(1)));
      setBpSystolic(() => Math.floor(114 + Math.random() * 9));
      setBpDiastolic(() => Math.floor(74 + Math.random() * 7));
      setGlucose(() => Math.floor(88 + Math.random() * 11));
      setSleepHours(() => Number((7.2 + Math.random() * 0.6).toFixed(1)));
      setMoodScore(() => (Math.random() > 0.3 ? 4 : 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Heart Rate</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{heartRate}</span>
          <span className="text-sm font-mono text-neutral-500">bpm</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Normal Range (50-100)</div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Body Temperature</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{temp}</span>
          <span className="text-sm font-mono text-neutral-500">°C</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Normal Range (36-37.5)</div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Systolic Pressure</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{bpSystolic}</span>
          <span className="text-sm font-mono text-neutral-500">mmHg</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Normal Range (90-130)</div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Diastolic Pressure</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{bpDiastolic}</span>
          <span className="text-sm font-mono text-neutral-500">mmHg</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Normal Range (60-85)</div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Blood Glucose</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{glucose}</span>
          <span className="text-sm font-mono text-neutral-500">mg/dL</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Normal Range (70-140)</div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Sleep Duration</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{sleepHours}</span>
          <span className="text-sm font-mono text-neutral-500">hours</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Normal Range (6-10)</div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Mood (1-5)</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{moodScore}</span>
          <span className="text-sm font-mono text-neutral-500">score</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Normal Range (3-5)</div>
      </div>
    </main>
  );
}

function BodyMapPage() {
  return <div className="text-neutral-300 font-mono">Interactive Body Map</div>;
}

function MissionPage() {
  return <div className="text-neutral-300 font-mono">Mission Simulation & Scenario Player (/mission)</div>;
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