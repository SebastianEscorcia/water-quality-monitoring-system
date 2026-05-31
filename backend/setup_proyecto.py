#!/usr/bin/env python
"""
Script de inicio: registra el kernel de Jupyter para el entorno virtual
y muestra instrucciones para ejecutar la aplicación.
"""
import subprocess
import sys
import os

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
PYTHON     = os.path.join(BASE_DIR, ".venv", "Scripts", "python.exe")
UVICORN    = os.path.join(BASE_DIR, ".venv", "Scripts", "uvicorn.exe")


def registrar_kernel():
    print("Registrando kernel de Jupyter para el entorno virtual...")
    result = subprocess.run(
        [PYTHON, "-m", "ipykernel", "install", "--user",
         "--name", "venv-calidad-agua",
         "--display-name", "Python 3 (.venv) - Calidad Agua"],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print("  Kernel registrado correctamente.")
    else:
        print(f"  Error: {result.stderr}")


def mostrar_instrucciones():
    print("\n" + "=" * 60)
    print("  SISTEMA DE MONITOREO DE CALIDAD DEL AGUA")
    print("=" * 60)
    print("\n ESTRUCTURA DEL PROYECTO:")
    print("  notebooks/   → Análisis EDA (pasos 1-10)")
    print("  src/         → Backend FastAPI")
    print("  models/      → Modelos entrenados (.pkl, .keras)")
    print("  dataset/     → CSV original + datos procesados")
    print("\n ORDEN DE EJECUCIÓN:")
    print("  1.  notebooks/01_adquisicion_datos.ipynb")
    print("  2.  notebooks/02_preprocesamiento.ipynb")
    print("  3.  notebooks/03_estadisticas_descriptivas.ipynb")
    print("  4.  notebooks/04_particionado.ipynb")
    print("  5.  notebooks/05_entrenamiento_y_simulacion.ipynb")
    print("  6.  notebooks/06_metricas_curvas_optimizacion.ipynb")
    print("\n COMANDOS ÚTILES:")
    print(f"  Jupyter:  .venv\\Scripts\\jupyter.exe notebook")
    print(f"  FastAPI:  .venv\\Scripts\\uvicorn.exe src.main:app --reload")
    print(f"  Docs API: http://localhost:8000/docs")
    print("=" * 60)


if __name__ == "__main__":
    registrar_kernel()
    mostrar_instrucciones()
