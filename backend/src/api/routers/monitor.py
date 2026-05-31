"""
Router de monitoreo: endpoints para consultar el estado del sistema
y almacenar/consultar lecturas recientes del hardware ESP32.
"""
from fastapi import APIRouter
from collections import deque
from datetime import datetime
from src.api.dependencies import get_prediction_service
from src.schemas.prediction import ModelInfo

router = APIRouter(prefix="/monitor", tags=["Monitoreo"])

# Almacén en memoria de las últimas 100 lecturas del hardware real
_lecturas_hardware: deque = deque(maxlen=100)


@router.get(
    "/health",
    summary="Estado del sistema",
    description="Verifica que el servidor y los modelos estén operativos.",
)
async def health_check():
    service = get_prediction_service()
    return {
        "status": "online",
        "modelos": service.modelos_disponibles,
        "mensaje": "Sistema de monitoreo de calidad del agua operativo.",
    }


@router.get(
    "/models",
    response_model=list[ModelInfo],
    summary="Listar modelos disponibles",
)
async def listar_modelos():
    service = get_prediction_service()
    modelos = []
    if service.rf_model is not None:
        modelos.append(ModelInfo(
            nombre="random_forest",
            tipo="Random Forest (scikit-learn)",
            clases=list(service.label_encoder.classes_) if service.label_encoder else [],
            n_features=3,
            disponible=True,
        ))
    if service.rna_model is not None:
        modelos.append(ModelInfo(
            nombre="rna",
            tipo="Red Neuronal Artificial (TensorFlow/Keras)",
            clases=list(service.label_encoder.classes_) if service.label_encoder else [],
            n_features=3,
            disponible=True,
        ))
    if not modelos:
        modelos.append(ModelInfo(
            nombre="ninguno",
            tipo="Sin modelos entrenados",
            clases=[],
            n_features=0,
            disponible=False,
        ))
    return modelos


@router.post(
    "/reading",
    summary="Registrar lectura del hardware ESP32",
    description=(
        "El firmware del ESP32 publica aquí cada lectura junto con el resultado "
        "de la predicción. El frontend las consulta con GET /monitor/readings."
    ),
)
async def registrar_lectura(lectura: dict):
    """Recibe ph, turbidez, temperatura, estado, confianza, punto_monitoreo."""
    lectura["server_ts"] = datetime.utcnow().isoformat()
    _lecturas_hardware.appendleft(lectura)
    return {"ok": True, "total_almacenadas": len(_lecturas_hardware)}


@router.get(
    "/readings",
    summary="Obtener lecturas recientes del hardware",
    description="Devuelve las últimas N lecturas enviadas por el ESP32.",
)
async def obtener_lecturas(limit: int = 30):
    return {
        "lecturas": list(_lecturas_hardware)[:limit],
        "total": len(_lecturas_hardware),
    }
