# Guía de Montaje y Ejecución del Firmware ESP32

**Sistema de Monitoreo de Calidad del Agua**  
Universidad Popular del Cesar — Ingeniería de Sistemas 2026

---

## Tabla de Contenidos

1. [Componentes necesarios](#1-componentes-necesarios)
2. [Diagrama de conexiones](#2-diagrama-de-conexiones)
3. [Instalar MicroPython en el ESP32](#3-instalar-micropython-en-el-esp32)
4. [Configurar y cargar el firmware con Thonny IDE](#4-configurar-y-cargar-el-firmware-con-thonny-ide)
5. [Calibración del sensor de pH](#5-calibración-del-sensor-de-ph-paso-crítico)
6. [Flujo de ejecución del programa](#6-flujo-de-ejecución-del-programa)
7. [Consola serie — qué verás en Thonny](#7-consola-serie--qué-verás-en-thonny)
8. [Checklist antes de probar con el prototipo real](#8-checklist-antes-de-probar-con-el-prototipo-real)
9. [Solución de problemas frecuentes](#9-solución-de-problemas-frecuentes)

---

## 1. Componentes necesarios

| Componente | Función | Cantidad |
|---|---|:---:|
| ESP32 (DevKit v1, WROOM-32 o similar) | Microcontrolador principal con WiFi integrado | 1 |
| Sensor pH — DFRobot SEN0161 | Mide el potencial de hidrógeno del agua (0–14) | 1 |
| Sensor turbidez — DFRobot SEN0189 | Mide partículas suspendidas en el agua (NTU) | 1 |
| Sensor temperatura — DS18B20 | Temperatura del agua con precisión ±0.5 °C | 1 |
| Resistencia 4.7 kΩ | Pull-up del bus OneWire del DS18B20 | 1 |
| LED verde (5 mm) | Indicador visual: agua **Óptima** | 1 |
| LED amarillo (5 mm) | Indicador visual: agua en **Alerta** | 1 |
| LED rojo (5 mm) | Indicador visual: agua **Contaminada** | 1 |
| Resistencias 220 Ω | Protección de corriente para cada LED | 3 |
| Fuente de alimentación 5 V / 1 A | Alimentación del sistema | 1 |
| Protoboard + cables jumper | Montaje y conexiones | — |
| Cable USB micro-B o USB-C | Comunicación PC ↔ ESP32 para programar | 1 |

> **Nota sobre los sensores SEN0161 y SEN0189:** Ambos son módulos de DFRobot que incluyen su propio circuito acondicionador de señal. Entregan una salida analógica de 0–5 V (SEN0189) o 0–3.3 V (SEN0161). El ESP32 acepta máximo **3.3 V** en sus pines ADC, por lo que el SEN0189 requiere un divisor de tensión resistivo si se alimenta a 5 V.

---

## 2. Diagrama de conexiones

```
                         ┌──────────────────────────┐
                         │          ESP32            │
                         │                           │
  SEN0161 (pH)           │                           │
    VCC (3.3 V) ────────►│ 3.3V                      │
    GND ────────────────►│ GND                       │
    OUT (señal) ────────►│ GPIO34   (ADC1 canal 6)   │
                         │                           │
  SEN0189 (Turbidez)     │                           │
    VCC (5 V)   ────────►│ VIN / 5V                  │
    GND ────────────────►│ GND                       │
    OUT* ───────────────►│ GPIO35   (ADC1 canal 7)   │
                         │                           │
  DS18B20 (Temperatura)  │                           │
    VCC (3.3 V) ────────►│ 3.3V                      │
    GND ────────────────►│ GND                       │
    DQ  ──────┬─────────►│ GPIO4    (OneWire)        │
              │          │                           │
             4.7 kΩ      │                           │
              │          │                           │
            3.3 V        │                           │
                         │                           │
  LED Verde  ──── 220 Ω ►│ GPIO25                    │
  LED Amarillo ── 220 Ω ►│ GPIO26                    │
  LED Rojo   ──── 220 Ω ►│ GPIO27                    │
                         └──────────────────────────┘
```

> **(*) SEN0189 a 5 V:** Si alimentas el sensor a 5 V, añade un divisor de tensión entre OUT y GPIO35:  
> `OUT → R1 (10 kΩ) → GPIO35 → R2 (20 kΩ) → GND`  
> Esto reduce los ~4.5 V de salida a ~3 V, dentro del rango seguro del ADC del ESP32.

### Regla crítica — ADC1 vs ADC2

El ESP32 tiene dos unidades ADC:

| ADC | Pines GPIO | Uso con WiFi |
|-----|-----------|:---:|
| **ADC1** | 32, 33, 34, 35, 36, 39 | ✅ Compatible |
| ADC2 | 0, 2, 4, 12–15, 25–27 | ❌ Bloqueado cuando WiFi está activo |

**Siempre usa ADC1 (GPIO32–GPIO39) para los sensores analógicos**, ya que el WiFi bloquea internamente el ADC2.

---

## 3. Instalar MicroPython en el ESP32

### Requisitos previos

- Python 3.x instalado en el PC
- Driver USB para el chip CP2102 o CH340 del ESP32 (depende del módulo):
  - CP2102: [Silicon Labs CP210x](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
  - CH340: [WCH CH340](https://www.wch-ic.com/downloads/CH341SER_EXE.html)

### Paso 1 — Descargar el firmware MicroPython

Ve a [https://micropython.org/download/esp32/](https://micropython.org/download/esp32/) y descarga la última versión estable:

```
ESP32_GENERIC-20240602-v1.23.0.bin  (o la versión más reciente)
```

### Paso 2 — Instalar esptool

```bash
pip install esptool
```

### Paso 3 — Identificar el puerto COM

Conecta el ESP32 al PC por USB, luego:

- **Windows:** Abre el Administrador de dispositivos → Puertos (COM y LPT) → busca "Silicon Labs CP210x" o "USB-SERIAL CH340". Anota el número de puerto, por ejemplo `COM5`.
- **Linux/Mac:** `ls /dev/tty*` → busca `/dev/ttyUSB0` o `/dev/ttyACM0`.

### Paso 4 — Borrar la flash del ESP32

```bash
esptool.py --chip esp32 --port COM5 erase_flash
```

*(Reemplaza `COM5` por tu puerto real)*

### Paso 5 — Escribir MicroPython

```bash
esptool.py --chip esp32 --port COM5 --baud 460800 write_flash -z 0x1000 ESP32_GENERIC-20240602-v1.23.0.bin
```

Si el comando falla, prueba a reducir la velocidad a `--baud 115200`.

---

## 4. Configurar y cargar el firmware con Thonny IDE

### Instalar Thonny

Descarga e instala Thonny desde [https://thonny.org](https://thonny.org). Es gratuito y multiplataforma.

### Configurar el intérprete

1. Abre Thonny
2. Ve a **Herramientas → Opciones → Intérprete**
3. Selecciona **MicroPython (ESP32)**
4. Elige el puerto COM del ESP32
5. Haz clic en **OK**

En la parte inferior de Thonny deberías ver el prompt de MicroPython:

```
MicroPython v1.23.0 on 2024-06-02; ESP32 module
>>>
```

### Editar las variables de configuración

Abre el archivo `firmware/esp32_main.py` en Thonny y edita las **3 líneas de configuración** (líneas 26–28):

```python
WIFI_SSID     = "NOMBRE_DE_TU_RED_WIFI"     # ← tu red WiFi
WIFI_PASSWORD = "TU_CONTRASEÑA_WIFI"         # ← tu contraseña
API_HOST      = "http://192.168.1.100:8000"  # ← IP local de tu PC
```

#### ¿Cómo obtener la IP local de tu PC?

En PowerShell (Windows):

```powershell
ipconfig
```

Busca la sección de tu adaptador WiFi y anota la **Dirección IPv4**, por ejemplo `192.168.1.100`.

> **Importante:** El PC y el ESP32 deben estar **en la misma red WiFi** para que el ESP32 pueda alcanzar el backend.

### Subir el firmware al ESP32

1. Con el archivo `esp32_main.py` abierto en Thonny
2. Ve a **Archivo → Guardar como...**
3. Aparece un diálogo — selecciona **Dispositivo MicroPython**
4. Escribe el nombre: **`main.py`** (exactamente así)
5. Haz clic en **OK**

> El nombre `main.py` es especial en MicroPython: el intérprete lo ejecuta automáticamente cada vez que el ESP32 se enciende o reinicia.

### Iniciar la ejecución

Presiona el botón **►** (Run) en Thonny o el botón **EN/RESET** en el ESP32 físico. El programa arrancará y verás la salida en la consola de Thonny.

---

## 5. Calibración del sensor de pH (paso crítico)

La calibración es necesaria para que las lecturas de voltaje del SEN0161 se conviertan correctamente a valores de pH. Sin calibración, las mediciones pueden tener errores de ±1–2 pH.

### Materiales

- Solución buffer pH 4.0 (sobre o frasco — se consigue en tiendas de acuarios o laboratorio)
- Solución buffer pH 7.0
- Multímetro (opcional, para verificar voltajes)

### Procedimiento

**1. Medir el voltaje a pH neutro (7.0):**

Sumerge el electrodo del SEN0161 en la solución buffer pH 7.0 y ejecuta esto en la consola de Thonny:

```python
from machine import Pin, ADC
import time

pin = ADC(Pin(34))
pin.atten(ADC.ATTN_11DB)     # Rango 0–3.3 V
pin.width(ADC.WIDTH_12BIT)   # Resolución 12 bits

# Leer 30 muestras y promediar
muestras = [pin.read() for _ in range(30)]
raw = sum(muestras) / len(muestras)
voltaje = raw * 3.3 / 4095.0
print("Voltaje pH 7.0: {:.4f} V".format(voltaje))
```

Anota el valor obtenido (típicamente entre 2.4 V y 2.6 V).

**2. Actualizar la constante en el firmware:**

```python
# En esp32_main.py, línea 43:
PH_V_NEUTRAL = 2.52  # ← reemplaza con el voltaje que mediste
```

**3. Verificar con pH 4.0 (opcional pero recomendado):**

Sumerge el electrodo en la solución buffer pH 4.0 y repite la lectura. El valor leído por el firmware debe aproximarse a 4.0 ± 0.2. Si hay desviación, ajusta ligeramente `PH_PENDIENTE` en el código.

### Fórmula de conversión

```
pH = 7.0 + (V_neutral - V_medido) / (Pendiente / 14.0)
```

| Parámetro | Descripción | Valor típico |
|-----------|------------|:---:|
| `PH_V_NEUTRAL` | Voltaje cuando el agua está a pH 7.0 | 2.50 V |
| `PH_PENDIENTE` | Sensibilidad del electrodo (mV/pH) | 3.5 |

---

## 6. Flujo de ejecución del programa

Una vez cargado y encendido, el ESP32 ejecuta el siguiente ciclo de forma continua:

```
╔═══════════════════════════════════════════════════════╗
║  Al encender el ESP32                                 ║
║  ─────────────────────────────────────────────────── ║
║  1. Imprime el banner del proyecto por consola serie  ║
║  2. Intenta conectarse al WiFi (timeout: 20 seg)      ║
╚═══════════════════════════════════════════════════════╝
                        │
                        ▼
╔═══════════════════════════════════════════════════════╗
║  Ciclo infinito — se repite cada INTERVALO_S (300 s)  ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  PASO 1 — Lectura de sensores (3 ciclos promediados)  ║
║    • pH        → GPIO34 (ADC1) — 10 muestras/ciclo   ║
║    • Turbidez  → GPIO35 (ADC1) — 10 muestras/ciclo   ║
║    • Temperat. → GPIO4  (OW)   — conversión 750 ms   ║
║                                                       ║
║  PASO 2 — Clasificación del agua                      ║
║    ¿WiFi conectado y API disponible?                  ║
║      SÍ → POST /predict/?modelo=random_forest         ║
║           Recibe: estado, confianza, recomendación    ║
║      NO → Clasificación offline (Res. 2115/2007)      ║
║           pH [6.5–8.5], NTU ≤ 5, Temp ≤ 25 °C       ║
║                                                       ║
║  PASO 3 — Activar indicadores LED                     ║
║    Óptima      → LED Verde  (GPIO25) encendido        ║
║    Alerta      → LED Amarillo (GPIO26) encendido      ║
║    Contaminada → LED Rojo   (GPIO27) encendido        ║
║                                                       ║
║  PASO 4 — Esperar INTERVALO_S segundos (default 5 min)║
╚═══════════════════════════════════════════════════════╝
```

### Parámetro de intervalo

El intervalo de medición se define en la línea 30 del firmware:

```python
INTERVALO_S = 300   # 300 segundos = 5 minutos
```

Puedes reducirlo durante las pruebas:

```python
INTERVALO_S = 10    # 10 segundos — modo de prueba
```

---

## 7. Consola serie — qué verás en Thonny

### Arranque exitoso con WiFi y API activa

```
==================================================
Sistema de Monitoreo de Calidad del Agua
Universidad Popular del Cesar — 2026
==================================================
Conectando a WiFi: MiRedWiFi
WiFi OK → 192.168.1.105

pH=7.21 | Turbidez=1.5 NTU | Temp=22.3°C
Estado: Optima (97%)
Accion: Agua dentro de parámetros normales. No se requiere acción.
Próxima lectura en 300 segundos.
```

### Sin respuesta de la API (modo offline)

```
pH=8.70 | Turbidez=3.1 NTU | Temp=24.8°C
Error de red: [Errno 104] ECONNRESET
Modo offline → Estado: Alerta
Próxima lectura en 300 segundos.
```

### Agua contaminada detectada

```
pH=4.10 | Turbidez=48.2 NTU | Temp=34.5°C
Estado: Contaminada (99%)
Accion: Agua no apta para consumo. Se requiere tratamiento inmediato.
Próxima lectura en 300 segundos.
```

### Error en el sensor DS18B20

```
Error DS18B20 (intento 1): [Errno 19] ENODEV
Error DS18B20 (intento 2): [Errno 19] ENODEV
Error DS18B20 (intento 3): [Errno 19] ENODEV
DS18B20 no responde. Usando valor por defecto.
```

> Si aparece este error, verifica la resistencia pull-up de 4.7 kΩ y las conexiones del sensor.

---

## 8. Checklist antes de probar con el prototipo real

### Hardware

- [ ] Resistencia de 4.7 kΩ conectada entre el pin DQ del DS18B20 y 3.3 V
- [ ] SEN0161 conectado a GPIO34 (ADC1), alimentado a 3.3 V
- [ ] SEN0189 conectado a GPIO35 (ADC1), con divisor de tensión si se alimenta a 5 V
- [ ] DS18B20 conectado a GPIO4 (OneWire)
- [ ] LEDs con sus resistencias de 220 Ω en GPIO25, GPIO26, GPIO27
- [ ] ESP32 con MicroPython instalado (verificar con `esptool` o Thonny)

### Software — ESP32

- [ ] `WIFI_SSID` y `WIFI_PASSWORD` editados con los datos de la red local
- [ ] `API_HOST` apunta a la IP correcta del PC (verificar con `ipconfig`)
- [ ] Sensor de pH calibrado con soluciones buffer (pH 4.0 y 7.0)
- [ ] Firmware guardado como `main.py` en el dispositivo MicroPython
- [ ] `INTERVALO_S = 10` durante las pruebas iniciales (acelera el ciclo)

### Software — PC (Backend FastAPI)

- [ ] Backend iniciado con `--host 0.0.0.0` para ser accesible desde la red:

```powershell
.venv\Scripts\uvicorn.exe src.main:app --host 0.0.0.0 --port 8000 --reload
```

> ⚠️ **Usar `--host 0.0.0.0` es obligatorio.** Si usas solo `--reload` sin `--host`, el servidor escucha únicamente en `localhost` y el ESP32 no puede alcanzarlo desde la red WiFi.

- [ ] Firewall de Windows permite conexiones entrantes al puerto 8000:
  - Busca "Firewall de Windows Defender" → "Reglas de entrada" → "Nueva regla" → Puerto TCP 8000

- [ ] Modelos entrenados disponibles en la carpeta `models/`:
  - `random_forest.pkl`
  - `rna_mejor.keras`
  - `scaler.pkl`
  - `label_encoder.pkl`

---

## 9. Solución de problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| `Error de red: [Errno -2] ENXIO` | API no alcanzable | Verificar IP en `API_HOST`, iniciar uvicorn con `--host 0.0.0.0` |
| pH siempre fuera de rango (>14 o <0) | Sin calibración | Calibrar con buffer pH 7.0 y ajustar `PH_V_NEUTRAL` |
| `DS18B20 no responde` | Falta resistencia pull-up | Conectar 4.7 kΩ entre DQ y 3.3 V |
| Turbidez = 3000 NTU siempre | Voltaje SEN0189 < 2.5 V | Revisar alimentación del sensor o divisor de tensión |
| WiFi no conecta (timeout) | Contraseña incorrecta o señal débil | Verificar `WIFI_SSID` / `WIFI_PASSWORD`, acercar el ESP32 al router |
| LED nunca cambia | GPIO ocupado / LED al revés | Verificar polaridad del LED (ánodo al GPIO, cátodo a GND con 220 Ω) |
| `OSError: [Errno 12] ENOMEM` | Memoria RAM insuficiente | Reducir `n_muestras` o `n_ciclos` en las funciones de lectura |

---

*Documento generado como parte del proyecto de aula — Inteligencia Artificial, octavo semestre.*  
*Universidad Popular del Cesar — 2026*
