"""
Configuración central del proyecto.
Carga variables de entorno desde .env
"""
from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # Rutas
    dataset_path: str = str(BASE_DIR / "dataset" / "Data_Histórica_de_Calidad_de_Agua_20260528.csv")
    processed_path: str = str(BASE_DIR / "dataset" / "processed" / "dataset_procesado.csv")
    models_path: str = str(BASE_DIR / "models")

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    app_name: str = "Sistema de Monitoreo de Calidad del Agua"
    app_version: str = "1.0.0"

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"


settings = Settings()
