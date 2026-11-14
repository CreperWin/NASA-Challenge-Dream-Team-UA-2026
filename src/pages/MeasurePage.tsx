import { useState } from 'react';
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
}