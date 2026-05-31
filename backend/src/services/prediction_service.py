"""
Servicio de predicción: carga modelos y realiza inferencia.
"""
from __future__ import annotations

import os
import numpy as np
import joblib
from pathlib import Path
from typing import Optional

# TensorFlow se importa solo si el modelo RNA está disponible
try:
    from tensorflow import keras
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


RECOMENDACIONES = {
    "Optima": "Agua dentro de parámetros normales. No se requiere acción.",
    "Alerta": (
        "Uno o más parámetros se acercan al límite normativo. "
        "Revisar la fuente y realizar análisis de laboratorio."
    ),
    "Contaminada": (
        "ALERTA CRÍTICA: parámetros fuera de límites normales. "
        "Suspender el uso del agua y notificar a las autoridades ambientales."
    ),
}


class PredictionService:
    """Gestiona la carga y uso de los modelos RF y RNA."""

    def __init__(self, models_path: str):
        self.models_path = Path(models_path)
        self.scaler: Optional[object] = None
        self.label_encoder: Optional[object] = None
        self.rf_model: Optional[object] = None
        self.rna_model: Optional[object] = None
        self._load_models()

    def _load_models(self) -> None:
        """Carga scaler, label encoder y modelos desde disco."""
        scaler_path = self.models_path / "scaler.pkl"
        le_path     = self.models_path / "label_encoder.pkl"
        rf_path     = self.models_path / "random_forest.pkl"
        rna_path    = self.models_path / "rna_mejor.keras"

        if scaler_path.exists():
            self.scaler = joblib.load(scaler_path)
        if le_path.exists():
            self.label_encoder = joblib.load(le_path)
        if rf_path.exists():
            self.rf_model = joblib.load(rf_path)
        if rna_path.exists() and TF_AVAILABLE:
            self.rna_model = keras.models.load_model(str(rna_path))

    @property
    def modelos_disponibles(self) -> dict[str, bool]:
        return {
            "random_forest": self.rf_model is not None,
            "rna":           self.rna_model is not None,
        }

    def _preprocesar(self, ph: float, turbidez: float, temperatura: float) -> np.ndarray:
        """Normaliza los valores de entrada con el scaler entrenado."""
        X = np.array([[ph, turbidez, temperatura]], dtype=np.float32)
        if self.scaler is not None:
            X = self.scaler.transform(X)
        return X

    def predecir(
        self,
        ph: float,
        turbidez: float,
        temperatura: float,
        modelo: str = "random_forest",
    ) -> dict:
        """
        Realiza la predicción para una lectura de sensor.

        Args:
            ph: valor de pH.
            turbidez: valor de turbidez en NTU.
            temperatura: temperatura en °C.
            modelo: 'random_forest' o 'rna'.

        Returns:
            dict con estado, confianza, probabilidades y recomendación.
        """
        if self.label_encoder is None or self.scaler is None:
            raise RuntimeError(
                "Los modelos no están disponibles. "
                "Ejecuta primero los notebooks de entrenamiento."
            )

        X = self._preprocesar(ph, turbidez, temperatura)
        clases = list(self.label_encoder.classes_)

        if modelo == "random_forest" and self.rf_model is not None:
            probas      = self.rf_model.predict_proba(X)[0]
            idx_pred    = int(np.argmax(probas))
            modelo_nombre = "Random Forest"
        elif modelo == "rna" and self.rna_model is not None:
            probas      = self.rna_model.predict(X, verbose=0)[0]
            idx_pred    = int(np.argmax(probas))
            modelo_nombre = "Red Neuronal (RNA)"
        elif self.rf_model is not None:
            probas      = self.rf_model.predict_proba(X)[0]
            idx_pred    = int(np.argmax(probas))
            modelo_nombre = "Random Forest (fallback)"
        else:
            raise RuntimeError("No hay modelos entrenados disponibles.")

        estado     = clases[idx_pred]
        confianza  = float(probas[idx_pred])
        probs_dict = {cls: round(float(p), 4) for cls, p in zip(clases, probas)}

        return {
            "estado":        estado,
            "confianza":     round(confianza, 4),
            "probabilidades": probs_dict,
            "modelo_usado":  modelo_nombre,
            "alerta_activa": estado in ("Alerta", "Contaminada"),
            "recomendacion": RECOMENDACIONES.get(estado, ""),
        }

    def predecir_lote(
        self,
        lecturas: list[dict],
        modelo: str = "random_forest",
    ) -> list[dict]:
        """Predicción sobre múltiples lecturas."""
        return [
            self.predecir(
                ph=r["ph"],
                turbidez=r["turbidez"],
                temperatura=r["temperatura"],
                modelo=modelo,
            )
            for r in lecturas
        ]
