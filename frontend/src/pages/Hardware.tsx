import { useState, useEffect, useRef } from 'react';
import { getHealth, predict, getHardwareReadings } from '../api/client';
import type { PredictionResponse, SensorReading, HardwareReading } from '../types';
import WaterStatusBadge from '../components/WaterStatusBadge';
import { Cpu, Wifi, WifiOff, Play, Square, RefreshCw, Radio } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface LiveReading {
  time: string;
  ph: number;
  turbidez: number;
  temperatura: number;
  estado?: string;
  fuente: 'simulador' | 'esp32';
}

function randomBetween(a: number, b: number) {
  return +(a + Math.random() * (b - a)).toFixed(2);
}

function simulateSensor(): SensorReading {
  const profile = Math.random();
  if (profile < 0.7)
    return { ph: randomBetween(6.5, 8.5), turbidez: randomBetween(0.5, 2.0), temperatura: randomBetween(15, 25) };
  if (profile < 0.9)
    return { ph: randomBetween(8.5, 9.5), turbidez: randomBetween(2, 8), temperatura: randomBetween(25, 32) };
  return { ph: randomBetween(3, 5.5), turbidez: randomBetween(10, 60), temperatura: randomBetween(32, 45) };
}

const STATUS_COLORS: Record<string, string> = {
  Optima: '#22c55e',
  Alerta: '#f59e0b',
  Contaminada: '#ef4444',
};

function toTimeLabel(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

export default function Hardware() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [liveData, setLiveData] = useState<LiveReading[]>([]);
  const [lastResult, setLastResult] = useState<PredictionResponse | null>(null);
  const [hardwareReadings, setHardwareReadings] = useState<HardwareReading[]>([]);
  const [esp32Active, setEsp32Active] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnection = async () => {
    setChecking(true);
    try {
      await getHealth();
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setChecking(false);
    }
  };

  // Polling de lecturas reales del ESP32 cada 3 s
  const startEsp32Polling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const { lecturas } = await getHardwareReadings(30);
        if (lecturas.length > 0) {
          setEsp32Active(true);
          setHardwareReadings(lecturas);
          // Sincronizar con la gráfica
          const mapped: LiveReading[] = lecturas.slice(0, 30).reverse().map((r) => ({
            time: toTimeLabel(r.server_ts),
            ph: r.ph,
            turbidez: r.turbidez,
            temperatura: r.temperatura,
            estado: r.estado,
            fuente: 'esp32',
          }));
          setLiveData(mapped);
          setLastResult({
            estado: lecturas[0].estado as any,
            confianza: lecturas[0].confianza,
            probabilidades: {},
            modelo_usado: 'random_forest (ESP32)',
            alerta_activa: lecturas[0].alerta_activa,
            recomendacion: lecturas[0].recomendacion,
            timestamp: lecturas[0].server_ts,
          });
        } else {
          setEsp32Active(false);
        }
      } catch {
        setEsp32Active(false);
      }
    }, 3000);
  };

  useEffect(() => {
    checkConnection();
    startEsp32Polling();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startSimulation = () => {
    setSimRunning(true);
    intervalRef.current = setInterval(async () => {
      const reading = simulateSensor();
      try {
        const res = await predict(reading, 'random_forest');
        setLastResult(res);
        const ts = new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        setLiveData((prev) => {
          const next = [...prev, { time: ts, ...reading, estado: res.estado, fuente: 'simulador' as const }];
          return next.slice(-30);
        });
      } catch { /* backend offline */ }
    }, 2000);
  };

  const stopSimulation = () => {
    setSimRunning(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Cpu className="text-amber-400" size={24} />
          Conexión de Hardware
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitoreo en tiempo real desde el ESP32 físico o desde el simulador de prueba.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* API */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Backend FastAPI</h3>
            <button onClick={checkConnection} disabled={checking}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 transition-colors">
              <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {apiOnline === null ? <span className="text-slate-500 text-sm">Verificando…</span>
              : apiOnline ? (
                <><Wifi className="text-emerald-400 live-pulse" size={18} />
                  <span className="text-emerald-400 text-sm font-medium">Online</span></>
              ) : (
                <><WifiOff className="text-red-400" size={18} />
                  <span className="text-red-400 text-sm font-medium">Offline</span></>
              )}
          </div>
          <code className="text-xs text-slate-500 block">
            {import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}
          </code>
        </div>

        {/* ESP32 real */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Radio size={14} className={esp32Active ? 'text-emerald-400 live-pulse' : 'text-slate-500'} />
            ESP32 Físico
          </h3>
          <div className={`text-sm font-medium ${esp32Active ? 'text-emerald-400' : 'text-slate-500'}`}>
            {esp32Active
              ? `${hardwareReadings.length} lecturas recibidas`
              : 'Sin lecturas del dispositivo'}
          </div>
          <p className="text-xs text-slate-500">
            Se actualiza automáticamente cuando el ESP32 envía datos al backend.
          </p>
        </div>

        {/* Simulador */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-white text-sm">Simulador de Prueba</h3>
          <div className="flex gap-2">
            {!simRunning ? (
              <button onClick={startSimulation} disabled={!apiOnline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-colors disabled:opacity-40">
                <Play size={12} /> Iniciar
              </button>
            ) : (
              <button onClick={stopSimulation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-semibold transition-colors">
                <Square size={12} /> Detener
              </button>
            )}
            {simRunning && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full live-pulse" />
                Activo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Genera lecturas aleatorias para probar el pipeline sin hardware.
          </p>
        </div>
      </div>

      {/* Última lectura */}
      {lastResult && (
        <div className="glass-card rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Última clasificación</p>
            <WaterStatusBadge status={lastResult.estado} size="lg" />
            <p className="text-xs text-slate-500 mt-1">{lastResult.recomendacion}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-slate-400">Confianza</p>
            <p className="text-3xl font-bold text-white">{(lastResult.confianza * 100).toFixed(1)}%</p>
            <p className="text-xs text-slate-500">{lastResult.modelo_usado}</p>
          </div>
        </div>
      )}

      {/* Gráfica en tiempo real */}
      {liveData.length > 1 && (
        <div className="glass-card rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">
              Lecturas en Tiempo Real
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                liveData[liveData.length - 1]?.fuente === 'esp32'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-amber-500/15 text-amber-400'
              }`}>
                {liveData[liveData.length - 1]?.fuente === 'esp32' ? 'ESP32 Real' : 'Simulador'}
              </span>
            </h3>
            <span className="text-xs text-slate-500">{liveData.length} puntos</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={liveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="ph" stroke="#22d3ee" strokeWidth={2} dot={false} name="pH" />
              <Line type="monotone" dataKey="turbidez" stroke="#a78bfa" strokeWidth={2} dot={false} name="Turbidez" />
              <Line type="monotone" dataKey="temperatura" stroke="#f97316" strokeWidth={2} dot={false} name="Temp °C" />
            </LineChart>
          </ResponsiveContainer>

          {/* Timeline de estados */}
          <div className="flex gap-1 flex-wrap">
            {liveData.map((d, i) => (
              <div key={i} title={`${d.time} · ${d.estado}`}
                className="w-2 h-5 rounded-sm"
                style={{ backgroundColor: STATUS_COLORS[d.estado ?? ''] ?? '#475569' }} />
            ))}
          </div>
          <p className="text-xs text-slate-500">
            <span className="text-emerald-400">■</span> Óptima ·{' '}
            <span className="text-amber-400">■</span> Alerta ·{' '}
            <span className="text-red-400">■</span> Contaminada
          </p>
        </div>
      )}

      {/* Tabla de lecturas del ESP32 */}
      {hardwareReadings.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-slate-800/80 flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <Radio size={13} className="text-emerald-400" />
            Historial del ESP32 ({hardwareReadings.length} registros)
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-900">
                <tr>
                  {['Hora', 'pH', 'Turbidez', 'Temp °C', 'Estado', 'Confianza', 'Punto'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hardwareReadings.map((r, i) => (
                  <tr key={i} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                    <td className="px-4 py-2 text-slate-500 font-mono">{toTimeLabel(r.server_ts)}</td>
                    <td className="px-4 py-2 text-slate-300">{r.ph}</td>
                    <td className="px-4 py-2 text-slate-300">{r.turbidez}</td>
                    <td className="px-4 py-2 text-slate-300">{r.temperatura}</td>
                    <td className="px-4 py-2"><WaterStatusBadge status={r.estado} size="sm" /></td>
                    <td className="px-4 py-2 text-slate-300">{(r.confianza * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2 text-slate-500">{r.punto_monitoreo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referencia firmware */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-white text-sm">Cómo conectar el ESP32 real</h3>
        <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
          <li>Inicia el backend con <code className="text-cyan-400 font-mono">--host 0.0.0.0</code> para que sea accesible en la red local.</li>
          <li>Edita <code className="text-cyan-400 font-mono">firmware/esp32_main.py</code>: ajusta <code className="text-cyan-400 font-mono">API_HOST</code> con la IP de tu PC.</li>
          <li>Carga el firmware como <code className="text-cyan-400 font-mono">main.py</code> en el ESP32 usando Thonny.</li>
          <li>El ESP32 enviará cada lectura a <code className="text-cyan-400 font-mono">POST /predict/</code> y luego registrará el resultado en <code className="text-cyan-400 font-mono">POST /monitor/reading</code>.</li>
          <li>Esta página se actualizará automáticamente cada 3 segundos con los datos reales.</li>
        </ol>
        <pre className="rounded-lg bg-slate-900 p-3 text-xs font-mono text-slate-300 overflow-x-auto">
{`# Flujo del ESP32
leer_sensores() → POST /predict/ → obtener estado
                → POST /monitor/reading  ← esta página lo muestra`}
        </pre>
      </div>
    </div>
  );
}
