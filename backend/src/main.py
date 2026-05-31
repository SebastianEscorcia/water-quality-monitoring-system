"""
Punto de entrada principal de la API FastAPI.
Sistema de Monitoreo de Calidad del Agua — Universidad Popular del Cesar
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.api.routers import prediction, monitor, metrics

app = FastAPI(
    title=settings.app_name,
    description=(
        "API REST para el sistema de monitoreo inteligente de calidad del agua. "
        "Integra modelos de Random Forest y Redes Neuronales Artificiales para "
        "clasificar el estado del agua (Óptima / Alerta / Contaminada) a partir "
        "de lecturas de pH, turbidez y temperatura provenientes del hardware IoT."
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Permitir conexiones desde el hardware ESP32 y el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(monitor.router)
app.include_router(prediction.router)
app.include_router(metrics.router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "proyecto": settings.app_name,
        "version":  settings.app_version,
        "docs":     "/docs",
        "estado":   "online",
    }
