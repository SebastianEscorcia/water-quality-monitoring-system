# README técnico

## Proyecto
Sistema de monitoreo de calidad del agua mediante sensores e inteligencia artificial para la detección temprana de contaminación en fuentes hídricas.

## Objetivo
Construir un prototipo IoT capaz de leer parámetros físicos del agua, procesarlos con modelos de IA y emitir alertas tempranas sobre posibles eventos de contaminación.

## Componentes sugeridos

### Sensores
- pH: SEN0161.
- Turbidez: SEN0189.
- Temperatura: DS18B20.

### Control y comunicación
- ESP32 o Arduino Mega.
- WiFi o GPRS.
- Módulo SD para almacenamiento local.

### Otros
- Fuente de alimentación estable.
- Caja estanca IP65.
- Cables, protoboard o PCB.
- Resistencias pull-up para DS18B20.

## Variables de entrada
- pH.
- Turbidez.
- Temperatura.

## Salidas esperadas
- Clasificación del agua en:
  - Óptima.
  - Alerta.
  - Contaminada.
- Activación de alertas:
  - LED.
  - Buzzer.
  - Mensaje SMS o correo.

## Flujo del sistema
1. Lectura de sensores.
2. Filtrado y validación de datos.
3. Preprocesamiento.
4. Inferencia del modelo de IA.
5. Clasificación del estado del agua.
6. Generación de alerta.

## Modelos de IA propuestos
- Random Forest.
- Red neuronal artificial.

## Etapas de desarrollo
1. Revisión bibliográfica.
2. Diseño del hardware.
3. Captura de datos.
4. Entrenamiento de modelos.
5. Validación en campo.
6. Integración final.

## Estructura sugerida del proyecto
```text
proyecto/
├── docs/
│   ├── proyecto.md
│   └── README.md
├── data/
├── models/
├── firmware/
├── notebooks/
└── src/
```

## Lógica mínima del firmware
- Leer sensores cada cierto intervalo.
- Corregir ruido con promedio móvil.
- Enviar datos por serial o WiFi.
- Recibir respuesta del modelo o ejecutar modelo embebido.
- Encender alerta si el estado es contaminado.

## Recomendación de implementación
- Entrenar el modelo en Python.
- Exportarlo en formato serializable.
- Integrarlo en una API REST o en el microcontrolador según capacidad.
- Validar con datos reales de campo.

## Reglas de clasificación
Ejemplo conceptual:
- Óptima: parámetros dentro de rangos normales.
- Alerta: uno o más parámetros cercanos al límite.
- Contaminada: uno o más parámetros fuera de norma.

## Métricas de evaluación
- Accuracy.
- Precision.
- Recall.
- F1-score.
- Specificity.
- AUC-ROC.

## Nota para el agente de IA
Este proyecto debe interpretarse como una solución aplicada de ingeniería, no solo como un documento académico. El agente debe priorizar:
- estructura modular,
- trazabilidad entre objetivos, metodología y resultados,
- claridad en requisitos técnicos,
- y separación entre hardware, datos e IA.