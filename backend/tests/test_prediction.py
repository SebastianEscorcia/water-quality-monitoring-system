"""
Tests básicos del endpoint de predicción.
Ejecutar: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["estado"] == "online"


def test_health_check():
    response = client.get("/monitor/health")
    assert response.status_code == 200
    data = response.json()
    assert "modelos" in data
    assert "status" in data


def test_predecir_lectura_optima():
    payload = {
        "ph": 7.2,
        "turbidez": 2.5,
        "temperatura": 22.0,
        "punto_monitoreo": "Test-Sensor"
    }
    response = client.post("/predict/?modelo=random_forest", json=payload)
    # Si los modelos no están entrenados aún → 503 es esperado
    assert response.status_code in [200, 503]


def test_predecir_validacion_ph_invalido():
    payload = {
        "ph": 15.0,   # fuera del rango 0-14
        "turbidez": 2.0,
        "temperatura": 20.0
    }
    response = client.post("/predict/", json=payload)
    assert response.status_code == 422   # Pydantic validation error


def test_listar_modelos():
    response = client.get("/monitor/models")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
