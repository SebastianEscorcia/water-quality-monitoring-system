"""
Router de predicción: endpoints para clasificar calidad del agua.
"""
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime

from src.schemas.prediction import (
    SensorReading,
    PredictionResponse,
    BatchPredictionRequest,
)
from src.api.dependencies import get_prediction_service

router = APIRouter(prefix="/predict", tags=["Predicción"])


@router.post(
    "/",
    response_model=PredictionResponse,
    summary="Clasificar una lectura de sensor",
    description=(
        "Recibe una lectura de pH, turbidez y temperatura del hardware "
        "y devuelve la clasificación del agua: Óptima, Alerta o Contaminada."
    ),
)
async def predecir_lectura(
    lectura: SensorReading,
    modelo: str = Query(
        default="random_forest",
        enum=["random_forest", "rna"],
        description="Modelo de IA a utilizar",
    ),
):
    service = get_prediction_service()
    try:
        resultado = service.predecir(
            ph=lectura.ph,
            turbidez=lectura.turbidez,
            temperatura=lectura.temperatura,
            modelo=modelo,
        )
        return PredictionResponse(**resultado, timestamp=datetime.utcnow())
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post(
    "/batch",
    response_model=list[PredictionResponse],
    summary="Clasificar múltiples lecturas (lote)",
    description="Útil para procesar historial o múltiples sensores a la vez.",
)
async def predecir_lote(
    solicitud: BatchPredictionRequest,
    modelo: str = Query(default="random_forest", enum=["random_forest", "rna"]),
):
    service = get_prediction_service()
    if len(solicitud.lecturas) > 500:
        raise HTTPException(status_code=400, detail="Máximo 500 lecturas por lote.")
    try:
        lecturas_dict = [
            {"ph": r.ph, "turbidez": r.turbidez, "temperatura": r.temperatura}
            for r in solicitud.lecturas
        ]
        resultados = service.predecir_lote(lecturas_dict, modelo=modelo)
        return [PredictionResponse(**r, timestamp=datetime.utcnow()) for r in resultados]
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
