# Sistema de Monitoreo de Calidad del Agua con IA

> **Universidad Popular del Cesar — Facultad de Ingeniería y Tecnología**  
> Programa de Ingeniería de Sistemas | Asignatura: Inteligencia Artificial (SS702)  
> Docente: Tonny Enrique Jiménez Márquez | Grupo 03 | 2026

Sistema IoT + IA para la detección automática de contaminación en fuentes hídricas mediante sensores de pH, turbidez y temperatura, integrados con modelos de Random Forest y Redes Neuronales Artificiales.

---

## Resultados del modelo

| Modelo | Accuracy | F1-Score | AUC-ROC |
|---|---|---|---|
| **Random Forest** | 99.78% | 0.9978 | 1.000 |
| Red Neuronal (RNA) | 99.01% | 0.9902 | 1.000 |

Clasificación en 3 estados: **Óptima / Alerta / Contaminada** (Resolución 2115/2007 Colombia + OMS).

---

## Tabla de contenido

- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Ejecutar los notebooks (EDA + Entrenamiento)](#ejecutar-los-notebooks)
- [Ejecutar el backend FastAPI](#ejecutar-el-backend-fastapi)
- [Endpoints de la API](#endpoints-de-la-api)
- [Hardware (ESP32)](#hardware-esp32)
- [Dataset](#dataset)
- [Autores](#autores)

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────┐
│  HARDWARE (ESP32)                                       │
│  ├── Sensor pH       SEN0161 → GPIO34                   │
│  ├── Sensor Turbidez SEN0189 → GPIO35                   │
│  └── Sensor Temp.    DS18B20 → GPIO4 (OneWire)          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP POST /predict/ (JSON)
                       ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND (FastAPI + Python)                             │
│  ├── Scaler (StandardScaler)                            │
│  ├── Modelo Random Forest  → random_forest.pkl          │
│  └── Modelo RNA (Keras)    → rna_mejor.keras            │
└──────────────────────┬──────────────────────────────────┘
                       │ JSON Response
                       ▼
            { estado, confianza, alerta_activa,
              probabilidades, recomendacion }
```

---

## Requisitos

- **Python** 3.13+
- **Hardware** ESP32 o Arduino Mega (para producción)
- **OS** Windows 10/11, Linux o macOS

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sistema-monitoreo-calidad-agua.git
cd sistema-monitoreo-calidad-agua
```

### 2. Crear el entorno virtual

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

> La instalación de TensorFlow (~350 MB) puede tardar varios minutos.

### 4. Registrar el kernel de Jupyter

```bash
python -m ipykernel install --user --name "venv-calidad-agua" --display-name "Python 3 (.venv) - Calidad Agua"
```

### 5. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo y ajusta los valores
cp .env.example .env
```

Edita `.env`:
```
DATASET_PATH=dataset/Data_Histórica_de_Calidad_de_Agua_20260528.csv
MODELS_PATH=models/
API_HOST=0.0.0.0
API_PORT=8000
```

---

## Estructura del proyecto

```
sistema-monitoreo-calidad-agua/
│
├── dataset/
│   ├── Data_Histórica_de_Calidad_de_Agua_20260528.csv   ← Dataset IDEAM (134.261 registros)
│   └── processed/
│       ├── dataset_procesado.csv   ← Generado por notebook 02
│       ├── X_train.npy / y_train.npy
│       ├── X_val.npy   / y_val.npy
│       └── X_test.npy  / y_test.npy
│
├── notebooks/                      ← Ejecutar en orden
│   ├── 01_adquisicion_datos.ipynb            (Paso 2: EDA inicial)
│   ├── 02_preprocesamiento.ipynb             (Paso 3: Limpieza y pivoteo)
│   ├── 03_estadisticas_descriptivas.ipynb    (Paso 4: Estadísticas)
│   ├── 04_particionado.ipynb                 (Paso 5: Train/Val/Test)
│   ├── 05_entrenamiento_y_simulacion.ipynb   (Pasos 6-7: RF + RNA)
│   ├── 06_metricas_curvas_optimizacion.ipynb (Pasos 8-10: Métricas)
│   └── 07_integracion_hardware_api.ipynb     (Integración ESP32 ↔ API)
│
├── models/                         ← Generados al entrenar
│   ├── random_forest.pkl
│   ├── rna_mejor.keras
│   ├── scaler.pkl
│   ├── label_encoder.pkl
│   └── resultados_evaluacion.csv
│
├── src/
│   ├── main.py                     ← Punto de entrada FastAPI
│   ├── core/
│   │   └── config.py               ← Configuración (pydantic-settings)
│   ├── schemas/
│   │   └── prediction.py           ← Modelos Pydantic (request/response)
│   ├── services/
│   │   └── prediction_service.py   ← Lógica de carga y predicción de modelos
│   └── api/
│       ├── dependencies.py
│       └── routers/
│           ├── prediction.py       ← POST /predict/
│           └── monitor.py          ← GET /monitor/health
│
├── firmware/
│   ├── esp32_main.py               ← MicroPython para ESP32
│   └── arduino_main.ino            ← C++ para Arduino Mega
│
├── docs/
│   ├── proyecto.md                 ← Documento del proyecto académico
│   └── figures/                    ← Gráficas generadas por los notebooks
│
├── tests/
│   └── test_prediction.py          ← Tests de la API (pytest)
│
├── .env                            ← Variables de entorno (NO subir a git)
├── .gitignore
├── requirements.txt
└── setup_proyecto.py               ← Script de configuración inicial
```

---

## Ejecutar los notebooks

```bash
# Activar entorno virtual primero
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/macOS

# Abrir Jupyter
jupyter notebook
```

Abre cada notebook y selecciona el kernel **"Python 3 (.venv) - Calidad Agua"**.

**Orden obligatorio:**

| # | Notebook | Descripción | Tiempo aprox. |
|---|---|---|---|
| 1 | `01_adquisicion_datos` | Carga y exploración del dataset IDEAM | 2 min |
| 2 | `02_preprocesamiento` | Pivoteo, limpieza y etiquetado | 3 min |
| 3 | `03_estadisticas_descriptivas` | Histogramas, correlaciones, Q-Q plots | 2 min |
| 4 | `04_particionado` | Split 70/15/15, normalización, SMOTE | 1 min |
| 5 | `05_entrenamiento_y_simulacion` | Entrenar RF + RNA, guardar modelos | 5–15 min |
| 6 | `06_metricas_curvas_optimizacion` | Métricas finales y comparativa | 1 min |
| 7 | `07_integracion_hardware_api` | Pruebas de la API y simulación | Opcional |

> **Nota:** El notebook 5 requiere que el servidor FastAPI NO esté corriendo (usa los archivos directamente). El notebook 7 requiere que el servidor SÍ esté corriendo.

---

## Ejecutar el backend FastAPI

```bash
# Asegúrate de haber ejecutado los notebooks 1–5 primero (genera los modelos)
.venv\Scripts\uvicorn.exe src.main:app --reload --host 0.0.0.0 --port 8000
```

**Documentación interactiva:**
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc:       [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Endpoints de la API

### `POST /predict/` — Clasificar una lectura

**Query param:** `?modelo=random_forest` o `?modelo=rna`

**Request body:**
```json
{
  "ph": 7.2,
  "turbidez": 3.5,
  "temperatura": 22.0,
  "punto_monitoreo": "Rio-Guatapuri-Balneario"
}
```

| Campo | Tipo | Obligatorio | Rango | Sensor |
|---|---|---|---|---|
| `ph` | float | ✅ | 0.0 – 14.0 | SEN0161 |
| `turbidez` | float | ✅ | ≥ 0.0 (NTU) | SEN0189 |
| `temperatura` | float | ✅ | 0.0 – 100.0 (°C) | DS18B20 |
| `punto_monitoreo` | string | ❌ | — | — |
| `timestamp` | datetime ISO | ❌ | — | — |

**Response:**
```json
{
  "estado": "Optima",
  "confianza": 0.9978,
  "probabilidades": {
    "Alerta": 0.0012,
    "Contaminada": 0.001,
    "Optima": 0.9978
  },
  "modelo_usado": "Random Forest",
  "alerta_activa": false,
  "recomendacion": "Agua dentro de parámetros normales. No se requiere acción.",
  "timestamp": "2026-05-30T17:00:00"
}
```

### `POST /predict/batch` — Clasificar múltiples lecturas (máx. 500)

```json
{
  "lecturas": [
    {"ph": 7.1, "turbidez": 2.1, "temperatura": 23.0},
    {"ph": 5.8, "turbidez": 9.5, "temperatura": 25.8}
  ]
}
```

### `GET /monitor/health` — Estado del sistema

```json
{
  "status": "online",
  "modelos": {"random_forest": true, "rna": true}
}
```

### `GET /monitor/models` — Listar modelos disponibles

---

## Ejemplos rápidos

**curl:**
```bash
curl -X POST "http://localhost:8000/predict/?modelo=random_forest" \
     -H "Content-Type: application/json" \
     -d '{"ph": 7.2, "turbidez": 3.5, "temperatura": 22.0}'
```

**Python:**
```python
import requests

r = requests.post(
    "http://localhost:8000/predict/?modelo=random_forest",
    json={"ph": 7.2, "turbidez": 3.5, "temperatura": 22.0}
)
print(r.json())
```

---

## Hardware (ESP32)

### Conexiones

| Sensor | Modelo | Pin ESP32 | Notas |
|---|---|---|---|
| pH | SEN0161 | GPIO34 (ADC1) | No usar GPIO 36/39 con WiFi |
| Turbidez | SEN0189 | GPIO35 (ADC1) | Alimentar con 5V, señal a 3.3V |
| Temperatura | DS18B20 | GPIO4 (OneWire) | Resistencia pull-up 4.7kΩ a 3.3V |
| LED Verde (Óptima) | — | GPIO25 | Con resistencia 220Ω |
| LED Amarillo (Alerta) | — | GPIO26 | Con resistencia 220Ω |
| LED Rojo (Contaminada) | — | GPIO27 | Con resistencia 220Ω |

### Flashear el firmware

1. Instala [Thonny IDE](https://thonny.org/)
2. Conecta el ESP32 por USB
3. En Thonny: **Herramientas → Opciones → Intérprete → MicroPython (ESP32)**
4. Edita `firmware/esp32_main.py`:
   - `WIFI_SSID` → nombre de tu red
   - `WIFI_PASSWORD` → contraseña
   - `API_HOST` → IP del PC donde corre FastAPI (ej. `http://192.168.1.100:8000`)
5. **Archivo → Guardar como → Dispositivo MicroPython** → guarda como `main.py`

> El ESP32 ejecutará `main.py` automáticamente al encenderse.

### Funciones de medición implementadas

```python
leer_ph(n_muestras=10)           # → float  (pH 0–14)
leer_turbidez(n_muestras=10)     # → float  (NTU ≥ 0)
leer_temperatura(n_intentos=3)   # → float  (°C)
leer_sensores_promedio(n_ciclos=3) # → tuple (ph, turbidez, temperatura)
clasificar_offline(ph, turb, temp) # → str   (clasificación sin API)
```

---

## Dataset

- **Fuente:** Instituto de Hidrología, Meteorología y Estudios Ambientales — [IDEAM](http://www.ideam.gov.co/)
- **Nombre:** Data Histórica de Calidad de Agua — Colombia
- **Registros:** 134.261
- **Formato:** CSV — formato largo (una fila por medición por parámetro)
- **Parámetros usados:** pH, Turbidez (NTU), Temperatura (°C)
- **Cobertura:** múltiples departamentos y cuencas hidrográficas de Colombia

> El dataset NO se incluye en el repositorio por su tamaño. Descárgalo del IDEAM y colócalo en `dataset/`.

---

## Ejecutar tests

```bash
.venv\Scripts\pytest.exe tests/ -v
```

---

## Autores

| Nombre | Rol |
|---|---|
| Javier Oñate | Desarrollo |
| Héctor Arturo Guerra | Desarrollo |
| Sebastian David Escorcia | Desarrollo |
| Jorge Junior Romero | Desarrollo |
| Javier Eduardo Díaz | Desarrollo |

**Docente:** Tonny Enrique Jiménez Márquez  
**Institución:** Universidad Popular del Cesar — Valledupar, Colombia  
**Año:** 2026

---

## Licencia

Proyecto académico — Universidad Popular del Cesar. Uso educativo.
