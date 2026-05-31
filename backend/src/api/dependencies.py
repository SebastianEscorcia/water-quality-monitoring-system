"""
Dependencias compartidas de la API (inyección de dependencias FastAPI).
"""
from functools import lru_cache
from src.services.prediction_service import PredictionService
from src.core.config import settings


@lru_cache(maxsize=1)
def get_prediction_service() -> PredictionService:
    """Singleton del servicio de predicción (se carga una sola vez)."""
    return PredictionService(models_path=settings.models_path)
