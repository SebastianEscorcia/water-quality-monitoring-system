"""
Router de métricas: expone los resultados de evaluación de los modelos
y estadísticas del dataset para consumo desde el frontend.
"""
from fastapi import APIRouter, HTTPException
from pathlib import Path
import csv, json, os

router = APIRouter(prefix="/metrics", tags=["Métricas"])

BASE_DIR = Path(__file__).resolve().parents[3]
MODELS_DIR = BASE_DIR / "models"
DATASET_PROCESSED = BASE_DIR / "dataset" / "processed" / "dataset_procesado.csv"


@router.get(
    "/results",
    summary="Resultados de evaluación de los modelos",
    description="Devuelve las métricas (accuracy, F1, precisión, recall, AUC-ROC) de cada modelo entrenado.",
)
async def get_results():
    csv_path = MODELS_DIR / "resultados_evaluacion.csv"
    if not csv_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Archivo resultados_evaluacion.csv no encontrado. Ejecuta el notebook 06 primero.",
        )
    results = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            results.append({
                "modelo": row.get("Modelo", ""),
                "accuracy": float(row.get("Accuracy", 0)),
                "f1_score": float(row.get("F1-score", 0)),
                "precision": float(row.get("Precision", 0)),
                "recall": float(row.get("Recall", 0)),
                "auc_roc": float(row.get("AUC-ROC", 0)),
            })
    return {"modelos": results, "total": len(results)}


@router.get(
    "/dataset/stats",
    summary="Estadísticas descriptivas del dataset procesado",
    description="Devuelve estadísticas básicas (media, min, max, std) por variable y distribución de clases.",
)
async def get_dataset_stats():
    if not DATASET_PROCESSED.exists():
        return {
            "disponible": False,
            "mensaje": "Dataset procesado no encontrado. Ejecuta el notebook 02 primero.",
        }

    import statistics

    ph_vals, turb_vals, temp_vals = [], [], []
    clases: dict[str, int] = {}

    with open(DATASET_PROCESSED, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                ph_vals.append(float(row["pH"]))
                turb_vals.append(float(row["Turbidez"]))
                temp_vals.append(float(row["Temperatura"]))
            except (KeyError, ValueError):
                pass
            clase = row.get("ETIQUETA", row.get("Calidad", row.get("calidad", "")))
            if clase:
                clases[clase] = clases.get(clase, 0) + 1

    def _stats(vals: list[float]) -> dict:
        if not vals:
            return {}
        return {
            "media": round(statistics.mean(vals), 4),
            "desv_std": round(statistics.stdev(vals), 4) if len(vals) > 1 else 0,
            "min": round(min(vals), 4),
            "max": round(max(vals), 4),
            "mediana": round(statistics.median(vals), 4),
        }

    total = sum(clases.values())
    distribucion = [
        {"clase": k, "conteo": v, "porcentaje": round(v / total * 100, 2) if total else 0}
        for k, v in sorted(clases.items())
    ]

    return {
        "disponible": True,
        "total_registros": len(ph_vals),
        "variables": {
            "pH": _stats(ph_vals),
            "Turbidez": _stats(turb_vals),
            "Temperatura": _stats(temp_vals),
        },
        "distribucion_clases": distribucion,
    }
