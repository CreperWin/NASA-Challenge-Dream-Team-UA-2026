import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path 
    ? "text-emerald-400 border-b-2 border-emerald-400 pb-1 font-semibold" 
    : "text-neutral-400 hover:text-white transition-colors pb-1";

  return (
    <header className="border-b border-neutral-800 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-400">
            MISSION DAY(nominal): <strong className="text-white">187</strong>
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Orbital Vitals
        </h1>
        <p className="text-xs text-neutral-400 font-mono">
          NASA Space Apps Challenge — Dream Team UA
        </p>
      </div>

      {/* Навігаційні посилання */}
      <nav className="navigation">
        <Link to="/" className={isActive("/")}>Dashboard</Link>
        <Link to="/body" className={isActive("/body")}>Body Map</Link>
        <Link to="/measure" className={isActive("/measure")}>Manual Measure</Link>
        <Link to="/mission" className={isActive("/mission")}>Mission Sim</Link>
      </nav>
    </header>
  );
}