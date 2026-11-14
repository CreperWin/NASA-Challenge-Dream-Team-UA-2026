/*import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
*/
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useState, useEffect } from 'react';

// Тимчасові сторінки 
function Dashboard() {
  const [heartRate, setHeartRate] = useState(72);
  const [temp, setTemp] = useState(36.6);
  const [pressure, setPressure] = useState(101.3);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => Math.floor(70 + Math.random() * 8));
      setTemp(prev => Number((36.5 + Math.random() * 0.4).toFixed(1)));
      setPressure(prev => Number((101.0 + Math.random() * 0.5).toFixed(1)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Heart Rate</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{heartRate}</span>
          <span className="text-sm font-mono text-neutral-500">BPM</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Normal Range (60-100)</div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Body Temperature</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{temp}</span>
          <span className="text-sm font-mono text-neutral-500">°C</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Stable Core Temp</div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-lg backdrop-blur">
        <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">Cabin Pressure</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">{pressure}</span>
          <span className="text-sm font-mono text-neutral-500">kPa</span>
        </div>
        <div className="mt-4 text-xs text-emerald-400 font-mono">Optimal Atmosphere</div>
      </div>
    </main>
  );
}

function BodyMapPage() {
  return <div className="text-neutral-300 font-mono">Interactive Body Map</div>;
}

function MeasurePage() {
  return <div className="text-neutral-300 font-mono">Manual Measurement Form (/measure)</div>;
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