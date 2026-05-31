import axios from 'axios';
import type {
  SensorReading,
  ModeloIA,
  PredictionResponse,
  ModelInfo,
  HealthResponse,
  MetricsResult,
  DatasetStats,
  HardwareReading,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Monitor ─────────────────────────────────────────────────────────────────

export const getHealth = (): Promise<HealthResponse> =>
  api.get<HealthResponse>('/monitor/health').then((r) => r.data);

export const getModels = (): Promise<ModelInfo[]> =>
  api.get<ModelInfo[]>('/monitor/models').then((r) => r.data);

export const getHardwareReadings = (limit = 30): Promise<{ lecturas: HardwareReading[]; total: number }> =>
  api.get(`/monitor/readings?limit=${limit}`).then((r) => r.data);

// ── Predicción ───────────────────────────────────────────────────────────────

export const predict = (
  lectura: SensorReading,
  modelo: ModeloIA = 'random_forest',
): Promise<PredictionResponse> =>
  api
    .post<PredictionResponse>(`/predict/?modelo=${modelo}`, lectura)
    .then((r) => r.data);

export const predictBatch = (
  lecturas: SensorReading[],
  modelo: ModeloIA = 'random_forest',
): Promise<PredictionResponse[]> =>
  api
    .post<PredictionResponse[]>(`/predict/batch?modelo=${modelo}`, { lecturas })
    .then((r) => r.data);

// ── Métricas ─────────────────────────────────────────────────────────────────

export const getMetricsResults = (): Promise<MetricsResult> =>
  api.get<MetricsResult>('/metrics/results').then((r) => r.data);

export const getDatasetStats = (): Promise<DatasetStats> =>
  api.get<DatasetStats>('/metrics/dataset/stats').then((r) => r.data);

export default api;
