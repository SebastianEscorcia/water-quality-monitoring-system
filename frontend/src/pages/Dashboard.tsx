import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Cpu, Database, Zap, ChevronRight, Droplets } from 'lucide-react';
import { getHealth, getModels, getMetricsResults } from '../api/client';
import type { HealthResponse, ModelInfo, MetricsResult } from '../types';
import MetricCard from '../components/MetricCard';

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [metrics, setMetrics] = useState<MetricsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getHealth(), getModels(), getMetricsResults()])
      .then(([h, m, met]) => {
        setHealth(h);
        setModels(m);
        setMetrics(met);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplets className="text-cyan-400" size={26} />
            Sistema de Monitoreo de Calidad del Agua
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Clasificación inteligente con Random Forest y Redes Neuronales (RNA)
          </p>
        </div>

        {/* API Status */}
        {!loading && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
              health
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${health ? 'bg-emerald-400 live-pulse' : 'bg-red-400'}`} />
            {health ? 'API Online' : 'API Offline'}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
          <strong>Error al conectar con el backend:</strong> {error}
          <br />
          <span className="text-red-300 text-xs">
            Asegúrate de que el servidor esté corriendo:{' '}
            <code className="font-mono">.venv\Scripts\uvicorn.exe src.main:app --reload</code>
          </span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-800" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Modelos Disponibles"
              value={models.filter((m) => m.disponible).length}
              sub="RF + RNA entrenados"
              color="cyan"
              icon={<Cpu size={18} />}
            />
            <MetricCard
              label="Accuracy — Random Forest"
              value={
                metrics?.modelos.find((m) => m.modelo.toLowerCase().includes('forest'))
                  ? `${(metrics.modelos.find((m) => m.modelo.toLowerCase().includes('forest'))!.accuracy * 100).toFixed(2)}%`
                  : 'N/A'
              }
              sub="Sobre conjunto de prueba"
              color="emerald"
              icon={<Activity size={18} />}
            />
            <MetricCard
              label="Accuracy — RNA"
              value={
                metrics?.modelos.find((m) => m.modelo.toLowerCase().includes('neuronal'))
                  ? `${(metrics.modelos.find((m) => m.modelo.toLowerCase().includes('neuronal'))!.accuracy * 100).toFixed(2)}%`
                  : 'N/A'
              }
              sub="TensorFlow / Keras"
              color="violet"
              icon={<Zap size={18} />}
            />
            <MetricCard
              label="AUC-ROC"
              value={
                metrics?.modelos[0]
                  ? metrics.modelos[0].auc_roc.toFixed(3)
                  : 'N/A'
              }
              sub="Ambos modelos"
              color="amber"
              icon={<Database size={18} />}
            />
          </div>

          {/* Model Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <div
                key={model.nombre}
                className="glass-card rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{model.tipo}</h3>
                    <p className="text-xs text-slate-500 font-mono">{model.nombre}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      model.disponible
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {model.disponible ? 'Cargado' : 'No disponible'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {model.clases.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  {model.n_features} features de entrada: pH · Turbidez · Temperatura
                </p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/predict',  label: 'Probar Predicción',    desc: 'Ingresa valores de sensor y clasifica el agua', color: 'cyan' },
              { to: '/results',  label: 'Ver Métricas',         desc: 'Curvas ROC, matrices de confusión y comparativas', color: 'violet' },
              { to: '/hardware', label: 'Estado Hardware',      desc: 'Prueba la conexión con el ESP32 IoT', color: 'amber' },
            ].map(({ to, label, desc, color }) => (
              <Link
                key={to}
                to={to}
                className={`glass-card rounded-xl p-4 flex items-start gap-3 hover:border-${color}-500/40 transition-colors group`}
              >
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-600 group-hover:text-slate-400 transition-colors mt-0.5"
                />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
