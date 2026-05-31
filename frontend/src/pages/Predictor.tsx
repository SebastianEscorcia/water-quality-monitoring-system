import { useState } from 'react';
import { predict } from '../api/client';
import type { SensorReading, PredictionResponse, ModeloIA } from '../types';
import WaterStatusBadge from '../components/WaterStatusBadge';
import { Droplets, Thermometer, Wind, Send, RotateCcw, History } from 'lucide-react';

const PRESETS = [
  { label: 'Agua Óptima', ph: 7.2, turbidez: 1.5, temperatura: 18 },
  { label: 'En Alerta',   ph: 8.9, turbidez: 4.8, temperatura: 28 },
  { label: 'Contaminada', ph: 4.2, turbidez: 45,  temperatura: 35 },
];

interface HistoryItem {
  input: SensorReading;
  result: PredictionResponse;
  modelo: ModeloIA;
  ts: Date;
}

export default function Predictor() {
  const [form, setForm] = useState<SensorReading>({ ph: 7.0, turbidez: 2.0, temperatura: 20.0 });
  const [modelo, setModelo] = useState<ModeloIA>('random_forest');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleChange = (field: keyof SensorReading) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predict(form, modelo);
      setResult(res);
      setHistory((prev) => [{ input: form, result: res, modelo, ts: new Date() }, ...prev.slice(0, 9)]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (p: (typeof PRESETS)[0]) => {
    setForm({ ph: p.ph, turbidez: p.turbidez, temperatura: p.temperatura });
    setResult(null);
  };

  const probColors: Record<string, string> = {
    Optima: 'bg-emerald-500',
    Alerta: 'bg-amber-500',
    Contaminada: 'bg-red-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT — Form */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Predictor de Calidad</h1>
          <p className="text-slate-400 text-sm mt-1">
            Ingresa las lecturas del sensor y el modelo clasificará el estado del agua.
          </p>
        </div>

        {/* Presets */}
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-5">
          {/* Model selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              Modelo de IA
            </label>
            <div className="flex gap-3">
              {(['random_forest', 'rna'] as ModeloIA[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModelo(m)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    modelo === m
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {m === 'random_forest' ? '🌲 Random Forest' : '🧠 Red Neuronal'}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          {[
            { field: 'ph' as const, label: 'pH del Agua', icon: Droplets, unit: '0–14', min: 0, max: 14, step: 0.1 },
            { field: 'turbidez' as const, label: 'Turbidez', icon: Wind, unit: 'NTU', min: 0, max: 200, step: 0.1 },
            { field: 'temperatura' as const, label: 'Temperatura', icon: Thermometer, unit: '°C', min: 0, max: 50, step: 0.1 },
          ].map(({ field, label, icon: Icon, unit, min, max, step }) => (
            <div key={field}>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                <Icon size={13} />
                {label} <span className="text-slate-600 normal-case">({unit})</span>
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={form[field]}
                  onChange={handleChange(field)}
                  className="flex-1 accent-cyan-400 h-2"
                />
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={form[field]}
                  onChange={handleChange(field)}
                  className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white text-right focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          ))}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {loading ? 'Clasificando…' : 'Clasificar Agua'}
            </button>
            <button
              type="button"
              onClick={() => { setResult(null); setError(null); }}
              className="px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* RIGHT — Result + History */}
      <div className="space-y-6">
        {/* Result card */}
        {result ? (
          <div className="glass-card rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Clasificación</p>
                <WaterStatusBadge status={result.estado} size="lg" />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Confianza</p>
                <p className="text-3xl font-bold text-white">
                  {(result.confianza * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Probability bars */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Probabilidades</p>
              {Object.entries(result.probabilidades).map(([clase, prob]) => (
                <div key={clase}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{clase}</span>
                    <span className="text-slate-400">{(prob * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${probColors[clase] ?? 'bg-slate-500'}`}
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="rounded-lg bg-slate-800 p-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Recomendación</p>
              <p className="text-sm text-slate-300">{result.recomendacion}</p>
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Modelo: {result.modelo_usado}</span>
              {result.alerta_activa && (
                <span className="text-amber-400 font-medium">⚠ Alerta activa</span>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center h-64 text-center">
            <Droplets className="text-slate-600 mb-3" size={40} />
            <p className="text-slate-500 text-sm">
              Ajusta los parámetros y presiona<br />
              <strong className="text-slate-400">Clasificar Agua</strong> para ver el resultado
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
              <History size={13} /> Historial de sesión
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
                  <div className="text-xs text-slate-500">
                    pH {item.input.ph} · Turb {item.input.turbidez} · {item.input.temperatura}°C
                  </div>
                  <WaterStatusBadge status={item.result.estado} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
