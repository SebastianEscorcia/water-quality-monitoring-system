"""
Schemas Pydantic para validación de datos de entrada y salida de la API.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SensorReading(BaseModel):
    """Lectura de los 3 sensores proveniente del hardware ESP32/Arduino."""

    ph: float = Field(
        ...,
        ge=0.0,
        le=14.0,
        description="Valor de pH del agua (0-14)",
        example=7.2,
    )
    turbidez: float = Field(
        ...,
        ge=0.0,
        description="Turbidez en NTU (mayor o igual a 0)",
        example=3.5,
    )
    temperatura: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Temperatura del agua en °C",
        example=22.0,
    )
    punto_monitoreo: Optional[str] = Field(
        default="Sensor-Hardware",
        description="Nombre o ID del punto de monitoreo",
    )
    timestamp: Optional[datetime] = Field(
        default_factory=datetime.utcnow,
        description="Fecha y hora de la medición (UTC)",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "ph": 7.2,
                "turbidez": 3.5,
                "temperatura": 22.0,
                "punto_monitoreo": "Rio-Guatapuri-Balneario",
                "timestamp": "2026-05-30T10:00:00",
            }
        }


class PredictionResponse(BaseModel):
    """Respuesta de predicción del modelo de IA."""

    estado: str = Field(..., description="Estado del agua: Optima | Alerta | Contaminada")
    confianza: float = Field(..., description="Confianza del modelo (0-1)")
    probabilidades: dict = Field(..., description="Probabilidades por clase")
    modelo_usado: str = Field(..., description="Nombre del modelo utilizado")
    alerta_activa: bool = Field(..., description="True si se debe activar la alerta")
    recomendacion: str = Field(..., description="Recomendación de acción")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "estado": "Optima",
                "confianza": 0.97,
                "probabilidades": {"Alerta": 0.02, "Contaminada": 0.01, "Optima": 0.97},
                "modelo_usado": "Random Forest",
                "alerta_activa": False,
                "recomendacion": "Agua dentro de parámetros normales. No se requiere acción.",
                "timestamp": "2026-05-30T10:00:00",
            }
        }


class BatchPredictionRequest(BaseModel):
    """Solicitud de predicción por lote (múltiples lecturas)."""
    lecturas: list[SensorReading]


class ModelInfo(BaseModel):
    """Información del modelo de IA cargado."""
    nombre: str
    tipo: str
    clases: list[str]
    n_features: int
    disponible: bool
