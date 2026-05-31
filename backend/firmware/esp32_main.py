# ============================================================
# Sistema de Monitoreo de Calidad del Agua — ESP32
# Universidad Popular del Cesar | Ingeniería de Sistemas 2026
#
# Sensores:
#   pH          → SEN0161  (GPIO34, ADC1)
#   Turbidez    → SEN0189  (GPIO35, ADC1)
#   Temperatura → DS18B20  (GPIO4,  OneWire)
#
# Instrucciones:
#   1. Instala MicroPython en el ESP32 (https://micropython.org/download/esp32/)
#   2. Abre Thonny IDE → Intérprete: MicroPython (ESP32)
#   3. Edita WIFI_SSID, WIFI_PASSWORD y API_HOST
#   4. Guarda este archivo como main.py en el dispositivo
# ============================================================

import network
import urequests
import ujson
import time
from machine import Pin, ADC
import onewire
import ds18x20

# ─── Configuración de red y API ──────────────────────────────
WIFI_SSID     = "TU_RED_WIFI"
WIFI_PASSWORD = "TU_CONTRASEÑA"
API_HOST      = "http://192.168.1.X:8000"   # IP del PC donde corre FastAPI
API_ENDPOINT  = API_HOST + "/predict/?modelo=random_forest"
INTERVALO_S   = 300                          # Leer cada 5 minutos

# ─── Pines ───────────────────────────────────────────────────
PH_PIN      = ADC(Pin(34))   # SEN0161 → GPIO34 (ADC1, no usar ADC2 con WiFi)
TURB_PIN    = ADC(Pin(35))   # SEN0189 → GPIO35 (ADC1)
TEMP_PIN    = Pin(4)          # DS18B20 → GPIO4  (OneWire, resistencia pull-up 4.7kΩ)
LED_OPTIMA  = Pin(25, Pin.OUT)   # Verde
LED_ALERTA  = Pin(26, Pin.OUT)   # Amarillo
LED_CONTAM  = Pin(27, Pin.OUT)   # Rojo

# ─── Calibración pH ──────────────────────────────────────────
# Calibrar con solución buffer pH 4.0 y pH 7.0
# Ajustar estos valores hasta que pH leído == pH real
PH_V_NEUTRAL = 2.50    # Voltaje a pH 7.0 (medir con multímetro)
PH_PENDIENTE = 3.5     # Pendiente de la curva (típico SEN0161: ±59.16 mV/pH)


# ─────────────────────────────────────────────────────────────
# FUNCIONES DE LECTURA DE SENSORES
# ─────────────────────────────────────────────────────────────

def leer_ph(n_muestras=10):
    """
    Lee el sensor de pH SEN0161 y devuelve el valor de pH (0–14).

    El SEN0161 usa un electrodo de vidrio cuya señal analógica varía
    linealmente con el pH. Se toman N muestras y se promedian para
    reducir el ruido del ADC.

    Args:
        n_muestras: número de lecturas a promediar (default 10)

    Returns:
        float: valor de pH calibrado, acotado a [0, 14]
    """
    PH_PIN.atten(ADC.ATTN_11DB)     # Rango 0–3.3V
    PH_PIN.width(ADC.WIDTH_12BIT)   # Resolución 12 bits (0–4095)

    lecturas = [PH_PIN.read() for _ in range(n_muestras)]
    raw_prom = sum(lecturas) / n_muestras
    voltaje  = raw_prom * 3.3 / 4095.0

    # Fórmula de conversión lineal voltaje → pH
    # pH = 7 + (V_neutral - V_medido) / pendiente
    ph = 7.0 + (PH_V_NEUTRAL - voltaje) / (PH_PENDIENTE / 14.0)

    return round(max(0.0, min(14.0, ph)), 2)


def leer_turbidez(n_muestras=10):
    """
    Lee el sensor de turbidez SEN0189 y devuelve el valor en NTU.

    El SEN0189 emite un haz infrarrojo a través del agua. A mayor
    turbidez, mayor dispersión de luz y menor voltaje de salida.
    La relación es no lineal (curva cuadrática).

    Args:
        n_muestras: número de lecturas a promediar (default 10)

    Returns:
        float: turbidez en NTU (≥ 0)
    """
    TURB_PIN.atten(ADC.ATTN_11DB)
    TURB_PIN.width(ADC.WIDTH_12BIT)

    lecturas = [TURB_PIN.read() for _ in range(n_muestras)]
    raw_prom = sum(lecturas) / n_muestras
    voltaje  = raw_prom * 3.3 / 4095.0

    # Curva de conversión del datasheet SEN0189
    # Válida para voltaje entre 2.5V y 4.2V
    if voltaje < 2.5:
        ntu = 3000.0   # Máximo del sensor (agua muy turbia)
    else:
        # Ecuación cuadrática ajustada al datasheet
        ntu = (-1120.4 * voltaje * voltaje) + (5742.3 * voltaje) - 4352.9

    return round(max(0.0, ntu), 1)


def leer_temperatura(n_intentos=3):
    """
    Lee la temperatura del agua con el sensor DS18B20 (protocolo OneWire).

    El DS18B20 es un sensor digital de alta precisión (±0.5°C).
    Requiere una resistencia pull-up de 4.7kΩ entre DQ y VCC (3.3V o 5V).
    La conversión tarda ~750ms en modo resolución 12 bits.

    Args:
        n_intentos: reintentos si el sensor no responde (default 3)

    Returns:
        float: temperatura en °C, o 25.0 si el sensor no responde
    """
    ow  = onewire.OneWire(TEMP_PIN)
    ds  = ds18x20.DS18X20(ow)

    for intento in range(n_intentos):
        try:
            dispositivos = ds.scan()
            if not dispositivos:
                time.sleep_ms(100)
                continue

            ds.convert_temp()           # Iniciar conversión (tarda 750ms)
            time.sleep_ms(800)          # Esperar un poco más del mínimo
            temp = ds.read_temp(dispositivos[0])

            # Validar rango razonable para agua natural (0–50°C)
            if 0.0 <= temp <= 50.0:
                return round(temp, 1)

        except Exception as e:
            print("Error DS18B20 (intento {}): {}".format(intento + 1, e))
            time.sleep_ms(200)

    # Valor de respaldo si el sensor falla
    print("DS18B20 no responde. Usando valor por defecto.")
    return 25.0


def leer_sensores_promedio(n_ciclos=3, pausa_ms=500):
    """
    Realiza N ciclos de lectura de los 3 sensores y devuelve el promedio.
    Útil para reducir lecturas erróneas puntuales.

    Returns:
        tuple: (ph, turbidez, temperatura)
    """
    lecturas_ph   = []
    lecturas_turb = []
    lecturas_temp = []

    for _ in range(n_ciclos):
        lecturas_ph.append(leer_ph())
        lecturas_turb.append(leer_turbidez())
        lecturas_temp.append(leer_temperatura())
        time.sleep_ms(pausa_ms)

    ph   = round(sum(lecturas_ph)   / n_ciclos, 2)
    turb = round(sum(lecturas_turb) / n_ciclos, 1)
    temp = round(sum(lecturas_temp) / n_ciclos, 1)
    return ph, turb, temp


# ─────────────────────────────────────────────────────────────
# FUNCIONES DE COMUNICACIÓN
# ─────────────────────────────────────────────────────────────

def conectar_wifi(timeout_s=20):
    """Conecta el ESP32 a la red WiFi configurada."""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if wlan.isconnected():
        return True

    print("Conectando a WiFi:", WIFI_SSID)
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    for _ in range(timeout_s):
        if wlan.isconnected():
            print("WiFi OK →", wlan.ifconfig()[0])
            return True
        time.sleep(1)

    print("Error: no se pudo conectar al WiFi.")
    return False


def enviar_a_api(ph, turbidez, temperatura):
    """
    Envía una lectura de sensores a la API FastAPI y retorna el resultado.
    También registra la lectura + predicción en /monitor/reading para
    que el frontend pueda mostrarla en tiempo real sin simulación.

    Returns:
        dict con 'estado', 'confianza', 'alerta_activa', 'recomendacion'
        o None si la llamada falla.
    """
    payload = ujson.dumps({
        "ph":              ph,
        "turbidez":        turbidez,
        "temperatura":     temperatura,
        "punto_monitoreo": "Guatapuri-ESP32"
    })

    try:
        resp = urequests.post(
            API_ENDPOINT,
            data=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if resp.status_code == 200:
            resultado = resp.json()
            resp.close()

            # Reportar lectura + resultado al dashboard del frontend
            registro = ujson.dumps({
                "ph":              ph,
                "turbidez":        turbidez,
                "temperatura":     temperatura,
                "estado":          resultado.get("estado", ""),
                "confianza":       resultado.get("confianza", 0),
                "alerta_activa":   resultado.get("alerta_activa", False),
                "recomendacion":   resultado.get("recomendacion", ""),
                "punto_monitoreo": "Guatapuri-ESP32",
            })
            try:
                r2 = urequests.post(
                    API_HOST + "/monitor/reading",
                    data=registro,
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
                r2.close()
            except Exception:
                pass  # No interrumpir el flujo principal si falla el reporte

            return resultado
        print("Error API:", resp.status_code)
        resp.close()
    except Exception as e:
        print("Error de red:", e)

    return None


# ─────────────────────────────────────────────────────────────
# CONTROL DE ALERTAS (LEDs / Buzzer)
# ─────────────────────────────────────────────────────────────

def activar_leds(estado):
    """Enciende el LED correspondiente al estado del agua."""
    LED_OPTIMA.value(1 if estado == "Optima"      else 0)
    LED_ALERTA.value(1 if estado == "Alerta"      else 0)
    LED_CONTAM.value(1 if estado == "Contaminada" else 0)


def clasificar_offline(ph, turbidez, temperatura):
    """
    Clasificación de respaldo (sin conexión a la API).
    Usa los umbrales de la Resolución 2115/2007 directamente.
    """
    if ph < 6.0 or ph > 9.0 or turbidez > 10.0 or temperatura > 30.0:
        return "Contaminada"
    if ph < 6.5 or ph > 8.5 or turbidez > 5.0 or temperatura > 25.0:
        return "Alerta"
    return "Optima"


# ─────────────────────────────────────────────────────────────
# LOOP PRINCIPAL
# ─────────────────────────────────────────────────────────────

def main():
    print("=" * 50)
    print("Sistema de Monitoreo de Calidad del Agua")
    print("Universidad Popular del Cesar — 2026")
    print("=" * 50)

    wifi_ok = conectar_wifi()

    while True:
        # 1. Leer los 3 sensores (promedio de 3 ciclos)
        ph, turbidez, temperatura = leer_sensores_promedio(n_ciclos=3)
        print("pH={} | Turbidez={} NTU | Temp={}°C".format(ph, turbidez, temperatura))

        # 2. Clasificar (con API o modo offline)
        if wifi_ok:
            resultado = enviar_a_api(ph, turbidez, temperatura)
            if resultado:
                estado    = resultado.get("estado", "Error")
                confianza = resultado.get("confianza", 0.0)
                print("Estado: {} ({:.0f}%)".format(estado, confianza * 100))
                print("Accion:", resultado.get("recomendacion", ""))
            else:
                # Sin respuesta de la API → modo offline
                estado = clasificar_offline(ph, turbidez, temperatura)
                print("Modo offline → Estado:", estado)
        else:
            estado = clasificar_offline(ph, turbidez, temperatura)
            print("Sin WiFi → Clasificación local:", estado)

        # 3. Activar LEDs según el estado
        activar_leds(estado)

        # 4. Esperar hasta la siguiente lectura
        print("Próxima lectura en {} segundos.\n".format(INTERVALO_S))
        time.sleep(INTERVALO_S)


main()
