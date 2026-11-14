/*import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MeasurePage() {
  const navigate = useNavigate();
  const [indicator, setIndicator] = useState('heart_rate');
  const [value, setValue] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    
    // Тут у майбутньому буде збереження в сховище (localStorage / IndexedDB)
    setSuccessMsg(true);
    setTimeout(() => {
      navigate('/'); // Повертаємо на Пульт після збереження
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto bg-neutral-900/80 border border-neutral-800 p-6 rounded-lg backdrop-blur">
      <div className="mb-6">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Manual Telemetry Input</span>
        <h2 className="text-xl font-bold text-white mt-1">Record Astronaut Vitals</h2>
        <p className="text-xs text-neutral-400 font-mono mt-1">
          Input real-time health metrics manually according to standard mission protocol.
        </p>
      </div>

      {successMsg ? (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 p-4 rounded text-center font-mono text-sm">
          ✓ Measurement successfully recorded. Returning to Dashboard...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-sm">
          <div>
            <label className="block text-xs text-neutral-400 uppercase mb-1">Select Indicator</label>
            <select 
              value={indicator} 
              onChange={(e) => setIndicator(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded p-2.5 text-white focus:border-emerald-500 outline-none"
            >
              <option value="heart_rate">Heart Rate (bpm)</option>
              <option value="blood_pressure">Blood Pressure (mmHg)</option>
              <option value="body_temperature">Body Temperature (°C)</option>
              <option value="blood_glucose">Blood Glucose (mg/dL)</option>
              <option value="sleep">Sleep (hours)</option>
              <option value="mood">Mood (1-5 scale)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 uppercase mb-1">Value</label>
            <input 
              type="number" 
              step="any"
              placeholder="e.g. 75" 
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded p-2.5 text-white focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded text-xs text-neutral-400">
            <span className="text-emerald-400 font-bold">Protocol Note:</span> Ensure sensor calibration before submitting. Out-of-range values will trigger automated advisory flags.
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-2.5 px-4 rounded transition-colors uppercase tracking-wider text-xs"
            >
              Save & Transmit
            </button>
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2.5 px-4 rounded transition-colors text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}*/
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MeasurePage() {
  const navigate = useNavigate();

  // Усі 7 показників із thresholds.json
  const [heartRate, setHeartRate] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [bodyTemp, setBodyTemp] = useState('');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(4);
  const [moodScore, setMoodScore] = useState(4);
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(true);
    setTimeout(() => {
      navigate('/');
    }, 1200);
  };

  return (
    <div className="measure-layout">
      {/* ЛІВА БІЛА КАРТКА: Форма введення */}
      <div className="nasa-white-card">
        <div className="card-header-block">
          <span className="nasa-tag">MANUAL TELEMETRY CHECK</span>
          <h2>Record Astronaut Vitals</h2>
          <p className="card-subtitle">
            Enter current biomedical readings according to mission flight protocol.
          </p>
        </div>

        {successMsg ? (
          <div className="nasa-success-box">
            ✓ Telemetry logged & transmitted to Orbital Core. Returning to Console...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="nasa-form">
            {/* Верхня сітка 2x2: Пульс, Тиск, Температура, Глюкоза */}
            <div className="vitals-grid-2x2">
              <div className="field-group">
                <label>Heart rate</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min={20}
                    max={250}
                    placeholder="72"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                  />
                  <span className="unit-label">bpm</span>
                </div>
              </div>

              <div className="field-group">
                <label>Blood Pressure</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min={60}
                    max={260}
                    placeholder="120"
                    className="input-compact"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                  />
                  <span className="slash-sep">/</span>
                  <input
                    type="number"
                    min={30}
                    max={160}
                    placeholder="80"
                    className="input-compact"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                  />
                  <span className="unit-label">mmHg</span>
                </div>
              </div>

              <div className="field-group">
                <label>Body temperature</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    step="0.1"
                    min={30}
                    max={43}
                    placeholder="36.6"
                    value={bodyTemp}
                    onChange={(e) => setBodyTemp(e.target.value)}
                  />
                  <span className="unit-label">°C</span>
                </div>
              </div>

              <div className="field-group">
                <label>Blood glucose</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min={20}
                    max={600}
                    placeholder="92"
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(e.target.value)}
                  />
                  <span className="unit-label">mg/dL</span>
                </div>
              </div>
            </div>

            {/* Червона лінія-розділювач NASA */}
            <hr className="nasa-red-divider" />

            {/* Нижня секція: Повзунки Sleep/Mood зліва + нотатки справа */}
            <div className="bottom-split-grid">
              <div className="sliders-column">
                <div className="slider-block">
                  <div className="slider-top-row">
                    <label>Sleep quality</label>
                    <span className="scale-badge"> {sleepQuality} / 5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(Number(e.target.value))}
                    className="nasa-slider"
                  />

                  <div className="hours-subinput">
                    <span></span>
                    <span className="tiny-hint">Hours</span>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={16}
                      placeholder="7.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                    />
                  </div>
                </div>

                <div className="slider-block">
                  <div className="slider-top-row">
                    <label>Mood quality</label>
                    <span className="scale-badge"> {moodScore} / 5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={moodScore}
                    onChange={(e) => setMoodScore(Number(e.target.value))}
                    className="nasa-slider"
                  />
                </div>
              </div>

              <div className="notes-column">
                <div className="field-group">
                  <label>Symptoms / Activity</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Post-EVA fatigue, normal hydration..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="submit-row">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn-cancel-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-nasa-circle"
                    title="Save & Transmit"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ПРАВА КОЛОНКА: Інструкція + темна напівпрозора плашка примітки */}
      <div className="measure-side-column">
        <div className="nasa-white-card">
          <span className="nasa-tag">MEASUREMENT GUIDE</span>
          <h3>Standard Protocol</h3>
          <div className="guide-placeholder">
            <p><strong>1. Rest 5 min</strong> before taking Heart Rate &amp; Blood Pressure.</p>
            <p><strong>2. Cuff placement:</strong> Keep arm at heart level in microgravity.</p>
            <p><strong>3. Fasted glucose:</strong> Log pre-meal values when possible.</p>
          </div>
        </div>

        <div className="nasa-glass-note">
          <span className="info-icon">i</span>
          <p>
            Ensure sensor calibration before submitting. Out-of-range values will automatically trigger an Attention or Critical alert on the Console.
          </p>
        </div>
      </div>
    </div>
  );
}