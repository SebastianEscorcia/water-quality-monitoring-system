import { NavLink } from 'react-router-dom';
import { Droplets, BarChart2, FlaskConical, Cpu, Activity } from 'lucide-react';

const links = [
  { to: '/',         label: 'Dashboard',      icon: Activity },
  { to: '/predict',  label: 'Predictor',       icon: Droplets },
  { to: '/results',  label: 'Resultados',      icon: BarChart2 },
  { to: '/analysis', label: 'Análisis',        icon: FlaskConical },
  { to: '/hardware', label: 'Hardware',        icon: Cpu },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/95 border-b border-slate-700 backdrop-blur-md flex items-center px-6 gap-8">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <Droplets className="text-cyan-400" size={22} />
        <span className="font-semibold text-white text-sm leading-tight">
          AquaMonitor <span className="text-cyan-400 font-bold">AI</span>
        </span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Badge UPC */}
      <div className="ml-auto text-xs text-slate-500">
        Universidad Popular del Cesar · 2026
      </div>
    </nav>
  );
}
