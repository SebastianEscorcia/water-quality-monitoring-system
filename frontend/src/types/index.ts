// ── Tipos base para la API ──────────────────────────────────────────────────

export interface SensorReading {
  ph: number;
  turbidez: number;
  temperatura: number;
  punto_monitoreo?: string;
  timestamp?: string;
}

export type ModeloIA = 'random_forest' | 'rna';
export type WaterStatus = 'Optima' | 'Alerta' | 'Contaminada';

export interface PredictionResponse {
  estado: WaterStatus;
  confianza: number;
  probabilidades: Record<string, number>;
  modelo_usado: string;
  alerta_activa: boolean;
  recomendacion: string;
  timestamp: string;
}

export interface ModelInfo {
  nombre: string;
  tipo: string;
  clases: string[];
  n_features: number;
  disponible: boolean;
}

export interface HealthResponse {
  status: string;
  modelos: Record<string, boolean>;
  mensaje: string;
}

// ── Tipos de métricas ───────────────────────────────────────────────────────

export interface ModelMetrics {
  modelo: string;
  accuracy: number;
  f1_score: number;
  precision: number;
  recall: number;
  auc_roc: number;
}

export interface MetricsResult {
  modelos: ModelMetrics[];
  total: number;
}

// ── Tipos de estadísticas del dataset ──────────────────────────────────────

export interface VariableStats {
  media: number;
  desv_std: number;
  min: number;
  max: number;
  mediana: number;
}

export interface ClaseDistribucion {
  clase: string;
  conteo: number;
  porcentaje: number;
}

export interface DatasetStats {
  disponible: boolean;
  total_registros: number;
  variables: {
    pH: VariableStats;
    Turbidez: VariableStats;
    Temperatura: VariableStats;
  };
  distribucion_clases: ClaseDistribucion[];
}

// ── Estado de sesión de predicción ─────────────────────────────────────────

export interface PredictionHistory {
  id: string;
  input: SensorReading;
  result: PredictionResponse;
  modelo: ModeloIA;
  timestamp: Date;
}

// ── Lectura del hardware real ───────────────────────────────────────────────

export interface HardwareReading {
  ph: number;
  turbidez: number;
  temperatura: number;
  estado: string;
  confianza: number;
  alerta_activa: boolean;
  recomendacion: string;
  punto_monitoreo: string;
  server_ts: string;
}
