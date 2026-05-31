import { useEffect, useState } from 'react';
import { getMetricsResults } from '../api/client';
import type { MetricsResult } from '../types';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';
import { BarChart2 } from 'lucide-react';

const METRIC_LABELS: Record<string, string> = {
  accuracy: 'Accuracy',
  f1_score: 'F1-Score',
  precision: 'Precisión',
  recall: 'Recall',
  auc_roc: 'AUC-ROC',
};

const MODEL_COLORS = ['#22d3ee', '#a78bfa'];

export default function ModelResults() {
  const [data, setData] = useState<MetricsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMetricsResults()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Cargando métricas…
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
        {error} — ¿Ejecutaste el notebook 06?
      </div>
    );

  if (!data) return null;

  // Build bar chart data: one row per metric
  const barData = Object.keys(METRIC_LABELS).map((key) => ({
    name: METRIC_LABELS[key],
    ...Object.fromEntries(data.modelos.map((m) => [m.modelo, m[key as keyof typeof m]])),
  }));

  // Build radar data
  const radarData = Object.keys(METRIC_LABELS).map((key) => ({
    metric: METRIC_LABELS[key],
    ...Object.fromEntries(
      data.modelos.map((m) => [m.modelo, +(m[key as keyof typeof m] as number * 100).toFixed(2)])
    ),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="text-violet-400" size={24} />
          Resultados de Evaluación
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Comparativa de métricas entre Random Forest y Red Neuronal Artificial
        </p>
      </div>

      {/* Metrics table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80">
              <th className="text-left px-5 py-3 text-slate-400 font-medium">Modelo</th>
              {Object.values(METRIC_LABELS).map((l) => (
                <th key={l} className="px-4 py-3 text-right text-slate-400 font-medium">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.modelos.map((m, i) => (
              <tr key={m.modelo} className="border-t border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3 font-medium text-white flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: MODEL_COLORS[i] }}
                  />
                  {m.modelo}
                </td>
                {Object.keys(METRIC_LABELS).map((key) => {
                  const val = m[key as keyof typeof m] as number;
                  return (
                    <td key={key} className="px-4 py-3 text-right font-mono">
                      <span
                        className={
                          val >= 0.99 ? 'text-emerald-400' : val >= 0.95 ? 'text-cyan-400' : 'text-amber-400'
                        }
                      >
                        {(val * 100).toFixed(2)}%
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Comparativa por Métrica (%)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                domain={[96, 101]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(v) => `${(Number(v) * 100).toFixed(3)}%`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {data.modelos.map((m, i) => (
                <Bar key={m.modelo} dataKey={m.modelo} fill={MODEL_COLORS[i]} radius={[4, 4, 0, 0]}>
                  {barData.map((_, j) => (
                    <Cell key={j} fill={MODEL_COLORS[i]} fillOpacity={0.85} />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Perfil de Rendimiento (%)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              {data.modelos.map((m, i) => (
                <Radar
                  key={m.modelo}
                  name={m.modelo}
                  dataKey={m.modelo}
                  stroke={MODEL_COLORS[i]}
                  fill={MODEL_COLORS[i]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              formatter={(v) => `${Number(v).toFixed(2)}%`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best model highlight */}
      {data.modelos.length >= 2 && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Resumen Comparativo</h3>
          <div className="space-y-2">
            {Object.keys(METRIC_LABELS).map((key) => {
              const vals = data.modelos.map((m) => ({
                name: m.modelo,
                val: m[key as keyof typeof m] as number,
              }));
              const best = vals.reduce((a, b) => (a.val > b.val ? a : b));
              const diff = Math.abs(vals[0].val - vals[1].val) * 100;
              return (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0">
                  <span className="text-sm text-slate-400">{METRIC_LABELS[key]}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Δ {diff.toFixed(3)}%
                    </span>
                    <span className="text-xs font-medium text-emerald-400">
                      Mejor: {best.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
