# Sistema de Monitoreo Inteligente de Calidad del Agua

> Proyecto de Aula — Inteligencia Artificial  
> Ingeniería de Sistemas · Universidad Popular del Cesar · 2026

Sistema que integra sensores IoT (ESP32), modelos de Machine Learning (Random Forest y RNA) y una aplicación web para clasificar la calidad del agua en tiempo real según la Resolución 2115/2007 del Ministerio de Salud de Colombia.

---

## Tabla de Contenidos

- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Requisitos previos](#requisitos-previos)
- [Configuración del Backend](#configuración-del-backend)
- [Configuración del Frontend](#configuración-del-frontend)
- [Ejecución del sistema completo](#ejecución-del-sistema-completo)
- [Flujo de trabajo de los notebooks](#flujo-de-trabajo-de-los-notebooks)
- [Endpoints de la API](#endpoints-de-la-api)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Equipo de desarrollo](#equipo-de-desarrollo)

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      HARDWARE IoT                           │
│   ESP32 + SEN0161 (pH) + SEN0189 (Turb.) + DS18B20 (Temp.) │
│              Firmware MicroPython (firmware/)               │
└──────────────────────┬──────────────────────────────────────┘
                       │ POST /predict/  (HTTP/WiFi)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (backend/)                        │
│              FastAPI + Uvicorn (Python 3.13)                │
│   ┌──────────────────────────────────────────────────────┐  │
│   │  ML Models (models/)                                 │  │
│   │    Random Forest (random_forest.pkl)                 │  │
│   │    Red Neuronal (rna_mejor.keras)                    │  │
│   │    Escalador (scaler.pkl) + Codificador (label_encoder.pkl) │  │
│   └──────────────────────────────────────────────────────┘  │
│   Rutas: /predict/ · /predict/batch · /monitor/ · /metrics/ │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP REST (axios)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (frontend/)                      │
│          React 19 + Vite + TypeScript + Tailwind CSS        │
│   Dashboard · Predictor · Resultados · Análisis · Hardware  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tecnologías utilizadas

### Backend / Machine Learning

| Tecnología | Versión | Propósito |
|---|---|---|
| **Python** | 3.13.x | Lenguaje principal del backend y pipeline ML |
| **FastAPI** | ≥ 0.111 | Framework REST API de alto rendimiento con documentación automática |
| **Uvicorn** | ≥ 0.30 | Servidor ASGI para correr FastAPI en producción y desarrollo |
| **Pydantic v2** | ≥ 2.7 | Validación y serialización de datos de entrada/salida de la API |
| **Pydantic Settings** | ≥ 2.3 | Gestión de variables de entorno con tipado seguro |
| **scikit-learn** | ≥ 1.5 | Modelo Random Forest + StandardScaler + LabelEncoder + SMOTE (imbalanced-learn) |
| **TensorFlow / Keras** | ≥ 2.16 / ≥ 3.0 | Modelo de Red Neuronal Artificial (RNA) para clasificación |
| **pandas** | ≥ 2.2 | Manipulación y transformación del dataset histórico del IDEAM |
| **NumPy** | ≥ 1.26 | Operaciones numéricas y manejo de arrays para los modelos |
| **matplotlib / seaborn** | ≥ 3.8 / ≥ 0.13 | Generación de gráficas y visualizaciones EDA en los notebooks |
| **scipy** | ≥ 1.13 | Tests de normalidad (Shapiro-Wilk, Kolmogorov-Smirnov) en el análisis |
| **imbalanced-learn** | ≥ 0.12 | SMOTE para sobremuestreo y balanceo de clases en el dataset |
| **joblib** | ≥ 1.4 | Serialización/deserialización de modelos scikit-learn (`.pkl`) |
| **PyArrow** | ≥ 14.0 | Motor de lectura/escritura de archivos Parquet en los notebooks |
| **Jupyter / ipykernel** | ≥ 1.0 | Entorno de notebooks interactivos para el pipeline EDA y ML |
| **python-dotenv** | ≥ 1.0 | Carga de variables de entorno desde el archivo `.env` |
| **httpx** | ≥ 0.27 | Cliente HTTP asíncrono para pruebas de integración con la API |
| **SQLAlchemy + aiosqlite** | ≥ 2.0 / ≥ 0.20 | ORM y driver SQLite asíncrono (preparado para persistir predicciones) |

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.x | Biblioteca de interfaz de usuario basada en componentes |
| **TypeScript** | ~6.0 | Tipado estático sobre JavaScript para mayor robustez del código |
| **Vite** | ≥ 8.0 | Build tool y servidor de desarrollo ultrarrápido |
| **Tailwind CSS** | ≥ 4.3 | Framework de estilos utilitarios para el diseño del dashboard |
| **React Router DOM** | ≥ 7.0 | Enrutamiento de páginas dentro de la SPA |
| **Recharts** | ≥ 3.8 | Gráficas interactivas (BarChart, RadarChart, LineChart, PieChart) |
| **Axios** | ≥ 1.16 | Cliente HTTP para consumir los endpoints de la API FastAPI |
| **Lucide React** | ≥ 1.17 | Librería de iconos SVG optimizados para React |

### Hardware / Firmware

| Componente | Propósito |
|---|---|
| **ESP32 (WROOM-32)** | Microcontrolador con WiFi para recolectar y enviar datos |
| **MicroPython** | Firmware Python ligero que corre en el ESP32 |
| **DFRobot SEN0161** | Sensor analógico de pH (0–14) |
| **DFRobot SEN0189** | Sensor analógico de turbidez (NTU) |
| **DS18B20 (OneWire)** | Sensor digital de temperatura (±0.5 °C) |
| **Thonny IDE** | IDE para programar y depurar el ESP32 con MicroPython |

---

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.11 o superior** → [python.org/downloads](https://www.python.org/downloads/)
- **Node.js 18 o superior** → [nodejs.org](https://nodejs.org/)
- **Git** → [git-scm.com](https://git-scm.com/)

Verifica las versiones:

```powershell
python --version   # Python 3.11+
node --version     # v18+
npm --version      # 9+
git --version
```

---

## Configuración del Backend

Todos los comandos se ejecutan desde la carpeta `backend/`.

### 1. Clonar el repositorio (si aún no lo tienes)

```powershell
git clone <URL_DEL_REPOSITORIO>
cd "sistema de monitoreo de calidad del agua"
```

### 2. Crear el entorno virtual

```powershell
cd backend
python -m venv .venv
```

### 3. Activar el entorno virtual

**Windows (PowerShell):**

```powershell
.venv\Scripts\Activate.ps1
```

Si PowerShell bloquea la ejecución de scripts, ejecuta primero:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Windows (CMD):**

```cmd
.venv\Scripts\activate.bat
```

**Linux / macOS:**

```bash
source .venv/bin/activate
```

Deberías ver `(.venv)` al inicio de tu terminal cuando el entorno esté activo.

### 4. Instalar las dependencias

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

> La instalación de TensorFlow puede tardar varios minutos dependiendo de la conexión. Ten paciencia.

### 5. Configurar las variables de entorno

Copia el archivo de ejemplo y edítalo:

```powershell
Copy-Item .env.example .env
```

Edita `.env` con tus rutas y configuración:

```env
DATASET_PATH=dataset/Data_Histórica_de_Calidad_de_Agua_20260528.csv
MODELS_PATH=models/
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

### 6. Iniciar el servidor de desarrollo

```powershell
.venv\Scripts\uvicorn.exe src.main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en:

- API: [http://localhost:8000](http://localhost:8000)
- Documentación interactiva (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Documentación alternativa (ReDoc): [http://localhost:8000/redoc](http://localhost:8000/redoc)

> **Importante:** Usa `--host 0.0.0.0` si quieres que el ESP32 físico pueda conectarse al servidor desde la misma red WiFi. Sin este flag, el servidor solo acepta conexiones locales.

---

## Configuración del Frontend

Todos los comandos se ejecutan desde la carpeta `frontend/`.

### 1. Instalar las dependencias de Node.js

```powershell
cd frontend
npm install
```

### 2. Configurar la URL del backend

Crea el archivo de variables de entorno:

```powershell
Copy-Item .env.example .env   # si existe
# o créalo manualmente:
```

Contenido del archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Si el backend corre en otra máquina o puerto, cambia la URL aquí.

### 3. Iniciar el servidor de desarrollo

**Windows (PowerShell):**

```powershell
.\node_modules\.bin\vite.cmd
```

**Linux / macOS:**

```bash
npm run dev
```

El frontend estará disponible en [http://localhost:5173](http://localhost:5173).

### 4. Compilar para producción (opcional)

```powershell
.\node_modules\.bin\vite.cmd build  # Windows
npm run build                        # Linux / macOS
```

Los archivos estáticos quedarán en `frontend/dist/`.

---

## Ejecución del sistema completo

Para tener todo funcionando simultáneamente necesitas **dos terminales abiertas**:

**Terminal 1 — Backend:**

```powershell
cd backend
.venv\Scripts\Activate.ps1
.venv\Scripts\uvicorn.exe src.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**

```powershell
cd frontend
.\node_modules\.bin\vite.cmd       # Windows
# o: npm run dev                    # Linux / macOS
```

Luego abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## Flujo de trabajo de los notebooks

Los notebooks deben ejecutarse **en orden**, ya que cada uno genera archivos que el siguiente consume. Todos se encuentran en `backend/notebooks/`.

Primero registra el kernel del entorno virtual en Jupyter:

```powershell
cd backend
.venv\Scripts\Activate.ps1
python -m ipykernel install --user --name=agua_quality --display-name "Python (AguaMonitor)"
.venv\Scripts\jupyter.exe notebook
```

| # | Notebook | Genera | Descripción |
|---|---|---|---|
| 01 | `01_adquisicion_datos.ipynb` | `dataset/processed/raw_cache.parquet` | Carga y exploración inicial del dataset IDEAM |
| 02 | `02_preprocesamiento.ipynb` | `dataset/processed/dataset_procesado.csv` | Limpieza, pivoteo largo→ancho, etiquetado de calidad |
| 03 | `03_estadisticas_descriptivas.ipynb` | `docs/figures/*.png` | Visualizaciones EDA: distribuciones, correlaciones, tendencias |
| 04 | `04_particionado.ipynb` | `models/X_train.npy` … `scaler.pkl` `label_encoder.pkl` | Split 70/15/15, normalización y SMOTE |
| 05 | `05_entrenamiento_y_simulacion.ipynb` | `models/random_forest.pkl` `models/rna_mejor.keras` | Entrenamiento RF (GridSearchCV) y RNA (Keras) |
| 06 | `06_metricas_curvas_optimizacion.ipynb` | `models/resultados_evaluacion.csv` | Evaluación: accuracy, F1, ROC, matriz de confusión |
| 07 | `07_integracion_hardware_api.ipynb` | — | Pruebas de integración con la API y referencia del firmware |

> **Nota:** Cada vez que reentrenes los modelos (notebooks 04–05), reinicia el servidor uvicorn para que cargue los nuevos archivos `.pkl` y `.keras`. Los notebooks 02 y 06 generan archivos que la API lee en cada petición, por lo que **no requieren reinicio**.

---

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Estado del sistema |
| `GET` | `/docs` | Documentación Swagger (interfaz interactiva) |
| `GET` | `/monitor/health` | Verifica que el servidor y los modelos estén cargados |
| `GET` | `/monitor/models` | Lista los modelos disponibles y sus clases |
| `GET` | `/monitor/readings` | Lecturas recientes enviadas por el ESP32 |
| `POST` | `/monitor/reading` | Registra una lectura del hardware (lo llama el firmware) |
| `POST` | `/predict/?modelo=random_forest` | Clasifica una lectura de sensor (RF o RNA) |
| `POST` | `/predict/batch` | Clasifica múltiples lecturas en lote |
| `GET` | `/metrics/results` | Métricas de evaluación de los modelos (desde CSV) |
| `GET` | `/metrics/dataset/stats` | Estadísticas descriptivas del dataset procesado |

**Ejemplo de petición de predicción:**

```json
POST http://localhost:8000/predict/?modelo=random_forest
Content-Type: application/json

{
  "ph": 7.2,
  "turbidez": 1.5,
  "temperatura": 22.0,
  "punto_monitoreo": "Rio-Guatapuri"
}
```

**Respuesta:**

```json
{
  "estado": "Optima",
  "confianza": 0.97,
  "probabilidades": { "Alerta": 0.02, "Contaminada": 0.01, "Optima": 0.97 },
  "modelo_usado": "Random Forest",
  "alerta_activa": false,
  "recomendacion": "Agua dentro de parámetros normales. No se requiere acción.",
  "timestamp": "2026-05-30T23:00:00"
}
```

---

## Estructura del proyecto

```
sistema de monitoreo de calidad del agua/
│
├── backend/                        ← Todo el código Python
│   ├── .venv/                      ← Entorno virtual (no se sube a Git)
│   ├── dataset/
│   │   ├── Data_Histórica_...csv   ← Dataset original IDEAM
│   │   └── processed/              ← Archivos generados por notebooks
│   ├── docs/
│   │   ├── proyecto.md             ← Documento del proyecto académico
│   │   ├── firmware_guia_montaje.md← Guía de montaje del hardware
│   │   └── figures/                ← Gráficas generadas por los notebooks
│   ├── firmware/
│   │   ├── esp32_main.py           ← Firmware MicroPython para el ESP32
│   │   └── arduino_main.ino        ← Firmware alternativo para Arduino Mega
│   ├── models/                     ← Modelos entrenados (no se suben a Git)
│   │   ├── random_forest.pkl
│   │   ├── rna_mejor.keras
│   │   ├── scaler.pkl
│   │   ├── label_encoder.pkl
│   │   └── resultados_evaluacion.csv
│   ├── notebooks/                  ← Pipeline EDA y ML (01 al 07)
│   ├── src/                        ← Código fuente del backend FastAPI
│   │   ├── main.py                 ← Punto de entrada de la aplicación
│   │   ├── core/config.py          ← Configuración y variables de entorno
│   │   ├── schemas/prediction.py   ← Modelos Pydantic (request/response)
│   │   ├── services/prediction_service.py ← Lógica de predicción e IA
│   │   └── api/
│   │       ├── dependencies.py
│   │       └── routers/
│   │           ├── prediction.py   ← Rutas /predict/
│   │           ├── monitor.py      ← Rutas /monitor/
│   │           └── metrics.py      ← Rutas /metrics/
│   ├── tests/
│   ├── .env                        ← Variables de entorno (no se sube a Git)
│   ├── .env.example                ← Plantilla de variables de entorno
│   ├── .gitignore
│   └── requirements.txt            ← Dependencias Python
│
├── frontend/                       ← Aplicación web React
│   ├── node_modules/               ← Dependencias npm (no se suben a Git)
│   ├── src/
│   │   ├── api/client.ts           ← Axios + llamadas a la API
│   │   ├── types/index.ts          ← Interfaces TypeScript
│   │   ├── components/             ← Navbar, MetricCard, WaterStatusBadge
│   │   └── pages/
│   │       ├── Dashboard.tsx       ← Vista general del sistema
│   │       ├── Predictor.tsx       ← Formulario de predicción manual
│   │       ├── ModelResults.tsx    ← Métricas y gráficas de los modelos
│   │       ├── Analysis.tsx        ← Análisis exploratorio de datos
│   │       └── Hardware.tsx        ← Monitor del ESP32 en tiempo real
│   ├── .env                        ← URL del backend (no se sube a Git)
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md                       ← Este archivo
```

---

## Equipo de desarrollo

| Nombre | Rol |
|---|---|
| **Sebastian Escorcia** | Líder de proyecto · Desarrollo backend · Pipeline ML · Firmware IoT |
| **Javier Diaz** | Lider Técnico | 
| *(Integrante 3)* | *(Rol)* |
| *(Integrante 4)* | *(Rol)* |

> **Docente:** *Tonny Jimenez*  
> **Asignatura:** Inteligencia Artificial  
> **Programa:** Ingeniería de Sistemas  
> **Institución:** Universidad Popular del Cesar  
> **Semestre:** VIII — 2026

---

## Licencia

Proyecto académico desarrollado para la asignatura de Inteligencia Artificial.  
Universidad Popular del Cesar, Colombia — 2026.
