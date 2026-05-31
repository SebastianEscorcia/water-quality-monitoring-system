import { useEffect, useState } from 'react';
import { getDatasetStats } from '../api/client';
import type { DatasetStats } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { FlaskConical } from 'lucide-react';

const CLASS_COLORS: Record<string, string> = {
  Optima: '#22c55e',
  Alerta: '#f59e0b',
  Contaminada: '#ef4444',
};

const VAR_CONFIG = [
  { key: 'pH',          unit: 'pH',  color: '#22d3ee', optimal: [6.5, 9.0] },
  { key: 'Turbidez',    unit: 'NTU', color: '#a78bfa', optimal: [0, 2] },
  { key: 'Temperatura', unit: '°C',  color: '#f97316', optimal: [10, 30] },
] as const;

type VarKey = 'pH' | 'Turbidez' | 'Temperatura';

export default function Analysis() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDatasetStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="flex items-center justify-center h-64 text-slate-500">Cargando estadísticas del dataset…</div>;

  if (error)
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
        {error}
      </div>
    );

  if (!stats?.disponible)
    return (
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-amber-400 text-sm">
        Dataset procesado no encontrado. Ejecuta el notebook <strong>02_preprocesamiento.ipynb</strong> primero.
      </div>
    );

  const classBarData = stats.distribucion_clases.map((c) => ({
    name: c.clase,
    Conteo: c.conteo,
    fill: CLASS_COLORS[c.clase] ?? '#94a3b8',
  }));

  const statsBarData = VAR_CONFIG.map(({ key, color }) => {
    const s = stats.variables[key as VarKey];
    return { name: key, Media: s.media, Min: s.min, Max: s.max, fill: color };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FlaskConical className="text-cyan-400" size={24} />
          Análisis Exploratorio de Datos
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Estadísticas descriptivas del dataset procesado · {stats.total_registros.toLocaleString()} muestras
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total_registros.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Total de Muestras</p>
        </div>
        {stats.distribucion_clases.map((c) => (
          <div key={c.clase} className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: CLASS_COLORS[c.clase] ?? '#94a3b8' }}>
              {c.porcentaje}%
            </p>
            <p className="text-xs text-slate-400 mt-1">{c.clase}</p>
            <p className="text-xs text-slate-600">{c.conteo.toLocaleString()} muestras</p>
          </div>
        ))}
      </div>

      {/* Variable stats table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/80 text-xs font-medium text-slate-400 uppercase tracking-wider">
          Estadísticas Descriptivas por Variable
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-5 py-3 text-slate-400">Variable</th>
              {['Media', 'Desv. Estándar', 'Mínimo', 'Mediana', 'Máximo'].map((h) => (
                <th key={h} className="px-4 py-3 text-right text-slate-400">{h}</th>
              ))}
              <th className="px-4 py-3 text-slate-400">Rango Óptimo (Res. 2115)</th>
            </tr>
          </thead>
          <tbody>
            {VAR_CONFIG.map(({ key, unit, color, optimal }) => {
              const s = stats.variables[key as VarKey];
              return (
                <tr key={key} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                  <td className="px-5 py-3 font-medium text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {key} <span className="text-slate-500 text-xs">({unit})</span>
                  </td>
                  {[s.media, s.desv_std, s.min, s.mediana, s.max].map((v, i) => (
                    <td key={i} className="px-4 py-3 text-right font-mono text-slate-300">
                      {v.toFixed(3)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {optimal[0]}–{optimal[1]} {unit}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class distribution pie */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Distribución de Clases</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stats.distribucion_clases}
                dataKey="conteo"
                nameKey="clase"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {stats.distribucion_clases.map((c) => (
                  <Cell key={c.clase} fill={CLASS_COLORS[c.clase] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Min/Max/Media bar chart */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Rango de Variables (Escala normalizada)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statsBarData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Min" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Media" radius={[4, 4, 0, 0]}>
                {statsBarData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
              <Bar dataKey="Max" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class distribution bar */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          Conteo de Muestras por Clase (balanceo con SMOTE)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={classBarData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={100} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            />
            <Bar dataKey="Conteo" radius={[0, 4, 4, 0]}>
              {classBarData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
