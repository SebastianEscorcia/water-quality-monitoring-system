# SISTEMA DE MONITOREO DE CALIDAD DEL AGUA MEDIANTE SENSORES E INTELIGENCIA ARTIFICIAL PARA LA DETECCIÓN TEMPRANA DE CONTAMINACIÓN EN FUENTES HÍDRICAS

## UNIVERSIDAD POPULAR DEL CESAR
**FACULTAD DE INGENIERÍA Y TECNOLOGÍA**  
**PROGRAMA DE INGENIERÍA DE SISTEMAS**

# PROYECTO DE AULA - SEGUNDA FASE

## Presentado por:
- JAVIER OÑATE
- HÉCTOR ARTURO GUERRA
- SEBASTIAN DAVID ESCORCIA
- JORGE JUNIOR ROMERO
- JAVIER EDUARDO DIAZ

**Docente:** TONNY ENRIQUE JIMENEZ MARQUEZ  
**Grupo:** 03  
**Asignatura:** SS702 – INTELIGENCIA ARTIFICIAL

**Valledupar, 2026**

---

## Tabla de contenido
- [Introducción](#introducción)
- [Estado del arte](#estado-del-arte)
  - [Contexto Internacional](#contexto-internacional)
  - [Contexto Nacional](#contexto-nacional)
  - [Contexto Local](#contexto-local)
- [Planteamiento del problema](#planteamiento-del-problema)
- [Objetivos](#objetivos)
  - [Objetivo general](#objetivo-general)
  - [Objetivos específicos](#objetivos-específicos)
- [Justificación](#justificación)
  - [Justificación teórica](#justificación-teórica)
  - [Justificación práctica](#justificación-práctica)
  - [Justificación social](#justificación-social)
  - [Justificación tecnológica](#justificación-tecnológica)
- [Metodología](#metodología)
  - [Tipo de investigación](#tipo-de-investigación)
  - [Método de investigación](#método-de-investigación)
  - [Etapas y fases del proyecto](#etapas-y-fases-del-proyecto)
- [Referencias bibliográficas](#referencias-bibliográficas)

## Introducción

El agua es el recurso natural más preciado para la vida en el planeta, y su calidad determina no solo la salud de los ecosistemas acuáticos, sino también la salud pública de las comunidades que dependen de fuentes hídricas para su abastecimiento. Sin embargo, la creciente presión antropogénica sobre los cuerpos de agua, derivada de la industrialización, la urbanización acelerada y las prácticas agropecuarias intensivas, ha generado una crisis de contaminación hídrica que afecta a todas las regiones del mundo con mayor o menor intensidad.

Ante este panorama, la tecnología emerge como una herramienta fundamental para fortalecer los sistemas de vigilancia y control ambiental. La convergencia entre la Internet de las Cosas (IoT), los sensores electroquímicos de bajo costo y los algoritmos de inteligencia artificial ha abierto nuevas posibilidades para desarrollar sistemas de monitoreo ambiental distribuidos, continuos y económicamente accesibles, superando las limitaciones de los enfoques tradicionales basados en análisis de laboratorio periódicos.

El presente proyecto propone el desarrollo de un sistema inteligente de monitoreo de calidad del agua que integra tres sensores clave (pH, turbidez y temperatura) con modelos de aprendizaje automático para la detección automática de contaminación en tiempo real. La elección de estos parámetros responde a su rol como indicadores sensibles y complementarios de la calidad del agua: el pH refleja la acidez o alcalinidad del medio y puede indicar la presencia de efluentes industriales o ácidos; la turbidez mide la transparencia del agua y es indicativa de la presencia de partículas en suspensión, sedimentos o microorganismos; y la temperatura afecta la solubilidad del oxígeno y la actividad biológica, siendo un parámetro crítico para detectar descargas térmicas industriales.

Para el procesamiento e interpretación de los datos sensoriales, se propone el uso de dos modelos de inteligencia artificial ampliamente validados en la literatura científica: el algoritmo Random Forest, conocido por su robustez ante datos ruidosos y su capacidad para manejar múltiples variables de entrada de manera eficiente; y las redes neuronales artificiales, cuya capacidad de aprender representaciones complejas y no lineales de los datos las convierte en herramientas poderosas para la clasificación y predicción en entornos ambientales dinámicos.

Este documento presenta la segunda fase del proyecto de aula, que amplía y profundiza los contenidos desarrollados en la primera fase, incorporando la justificación del proyecto, la metodología detallada de investigación y las referencias bibliográficas que sustentan el trabajo. El proyecto se enmarca en una metodología de investigación aplicada con un enfoque cuantitativo y experimental, orientada a generar conocimiento útil para la solución de problemáticas ambientales reales de la región.

## Estado del arte

### Contexto Internacional

El monitoreo de la calidad del agua mediante tecnologías de inteligencia artificial ha experimentado un avance significativo a nivel global durante la última década. Investigadores de diversas universidades y centros de investigación han desarrollado sistemas capaces de detectar parámetros fisicoquímicos en tiempo real con alta precisión.

- Hameed et al. (2017) desarrollaron un sistema de predicción de la calidad del agua basado en redes neuronales artificiales (RNA) en Malasia, utilizando parámetros como pH, temperatura y turbidez, obteniendo una precisión superior al 92% en la clasificación del agua como potable o contaminada.
- En China, investigadores de la Universidad de Pekín implementaron un sistema de monitoreo continuo en el río Yangtze utilizando sensores IoT combinados con algoritmos de Random Forest. El modelo entrenado con más de 50,000 registros históricos logró identificar fuentes de contaminación industrial con una tasa de acierto del 94.3%, y fue capaz de generar alertas tempranas hasta 6 horas antes de que los niveles de contaminación superaran los umbrales críticos (Zhang et al., 2019).
- En Europa, el proyecto SmartWater4Europe financiado por la Unión Europea implementó redes de sensores inteligentes en cuatro países para el monitoreo de fuentes de agua potable. El sistema integró modelos de aprendizaje profundo para detectar anomalías en los patrones de calidad del agua, reduciendo los tiempos de respuesta ante eventos de contaminación en un 70% respecto a los métodos tradicionales (Kroll et al., 2020).
- Zhu et al. (2021) publicaron una revisión sistemática de 85 estudios sobre el uso de machine learning en calidad del agua, concluyendo que los modelos de Random Forest y las redes neuronales profundas son los más utilizados, con aplicaciones que van desde la predicción de floraciones de algas hasta la detección de metales pesados, con una tendencia creciente hacia sistemas embebidos de bajo costo para zonas rurales.

### Contexto Nacional

En Colombia, la problemática del agua es especialmente relevante dado que el país posee la cuarta reserva de agua dulce del mundo, pero enfrenta graves problemas de contaminación en sus principales cuencas hidrográficas. Diversas instituciones académicas y de investigación han desarrollado trabajos orientados al monitoreo automatizado de calidad del agua.

- La Universidad Nacional de Colombia, sede Medellín, desarrolló en 2018 un prototipo de estación de monitoreo de calidad del agua para la quebrada La Iguaná, empleando sensores de pH, oxígeno disuelto y turbidez integrados con un microcontrolador Arduino y algoritmos de clasificación basados en árboles de decisión. Los resultados mostraron que el sistema podía identificar episodios de contaminación con una exactitud del 88% (Torres & Restrepo, 2018).
- El Instituto de Hidrología, Meteorología y Estudios Ambientales (IDEAM) ha impulsado la modernización de su red de monitoreo hídrico incorporando sensores automatizados en estaciones limnigráficas a lo largo de los ríos Magdalena, Cauca y Bogotá. Sin embargo, la integración de modelos de inteligencia artificial para el análisis predictivo aún es incipiente según reportes del propio instituto (IDEAM, 2020).
- Investigadores de la Universidad de Antioquia publicaron en 2021 un estudio sobre la aplicación de redes neuronales recurrentes (LSTM) para predecir la concentración de coliformes fecales en el río Atrato a partir de variables como temperatura del agua, turbidez y caudal. El modelo alcanzó un coeficiente de determinación R² de 0.91 (Ospina et al., 2021).

### Contexto Local

En el ámbito local, la Corporación Autónoma Regional del Cesar (CORPOCESAR) ha instalado estaciones automáticas en la cuenca alta y baja del río Guatapurí, las cuales miden parámetros como pH, temperatura y turbidez cada diez minutos, enviando los datos al aplicativo AMBISQ. No obstante, estas estaciones funcionan principalmente para la visualización de datos y no integran modelos de IA para la clasificación autónoma de estados de contaminación. Asimismo, investigaciones en la Universidad Popular del Cesar (Blanco y Pérez, 2020) han evaluado la calidad del agua en el Balneario Hurtado mediante bioindicadores y parámetros fisicoquímicos, señalando un impacto antrópico significativo por actividades recreativas y vertimientos. Este proyecto busca cerrar la brecha entre la captura de datos existente y el análisis inteligente de los mismos.

## Planteamiento del problema

El acceso al agua potable es reconocido por la Organización de las Naciones Unidas (ONU) como un derecho humano fundamental. A escala global, se estima que más de 2,200 millones de personas carecen de acceso a agua potable segura, y la contaminación hídrica es responsable de aproximadamente 1.4 millones de muertes anuales, afectando principalmente a poblaciones vulnerables en países en desarrollo (OMS, 2021). Los principales agentes contaminantes incluyen residuos industriales, agroquímicos, descargas de aguas residuales sin tratamiento y escorrentías urbanas que alteran los parámetros fisicoquímicos del agua de manera impredecible.

En América Latina, la contaminación de fuentes hídricas se ha agravado en las últimas décadas como consecuencia del crecimiento industrial no planificado y la expansión de la frontera agrícola. Según el Banco Interamericano de Desarrollo (BID, 2020), el 70% de los cuerpos de agua superficiales en la región presentan algún grado de contaminación, y los sistemas de monitoreo existentes cubren apenas el 30% del territorio hidrográfico latinoamericano.

Colombia, a pesar de ser uno de los países con mayor disponibilidad hídrica del planeta, enfrenta una paradoja preocupante: sus ríos y quebradas son receptores de vertimientos contaminantes que superan con frecuencia los límites permisibles establecidos por la normativa ambiental. El río Bogotá, el río Medellín y el río Cauca figuran entre los cuerpos de agua más contaminados de Sudamérica, y los sistemas de monitoreo actuales del IDEAM presentan limitaciones en cobertura, frecuencia de muestreo y velocidad de respuesta ante eventos de contaminación aguda (IDEAM, 2020).

A nivel local, las fuentes hídricas de la región presentan episodios recurrentes de contaminación asociados a actividades mineras, ganaderas y al vertimiento de aguas residuales domésticas sin tratamiento. Los métodos de análisis convencionales, basados en recolección periódica de muestras y análisis de laboratorio, son lentos, costosos e incapaces de detectar eventos de contaminación en tiempo real, lo que impide una respuesta oportuna por parte de las autoridades ambientales.

En este contexto, surge la necesidad de desarrollar un sistema inteligente de monitoreo de calidad del agua que integre sensores de bajo costo con modelos de inteligencia artificial capaces de detectar patrones de contaminación en tiempo real. Parámetros como el pH, la turbidez y la temperatura son indicadores sensibles y accesibles que permiten inferir la presencia de contaminantes de manera indirecta.

La pregunta de investigación que orienta el presente proyecto es: ¿Es posible desarrollar un sistema de monitoreo de calidad del agua basado en sensores de pH, turbidez y temperatura, integrado con modelos de inteligencia artificial como Random Forest y redes neuronales, que permita detectar de manera automática y en tiempo real la presencia de contaminación en fuentes hídricas locales con una precisión suficiente para generar alertas tempranas confiables?

## Objetivos

### Objetivo general
Desarrollar un sistema de monitoreo de calidad del agua basado en sensores de pH, turbidez y temperatura, integrado con modelos de inteligencia artificial (Random Forest y Redes Neuronales), para la detección automática y en tiempo real de contaminación en fuentes hídricas (Río Guatapurí).

### Objetivos específicos
- Caracterizar los umbrales críticos de pH, turbidez y temperatura para el río Guatapurí basados en la normativa colombiana (Resolución 2115 de 2007) y datos históricos de Corpocesar.
- Diseñar un prototipo de hardware IoT que integre sensores de bajo costo con un microcontrolador (ESP32/Arduino) para la transmisión inalámbrica de datos.
- Construir un dataset de entrenamiento mediante la simulación de eventos de contaminación (variaciones controladas de los parámetros) y la recopilación de datos en campo.
- Entrenar los modelos de Random Forest y redes neuronales y comparar el rendimiento de ellos en la clasificación de estados del agua (Óptima, Alerta, Contaminada).
- Validar los resultados de los modelos mediante las métricas de evaluación y pruebas de campo en el Balneario Hurtado, evaluando la precisión de las alertas generadas en tiempo real.

## Justificación

### Justificación teórica
La investigación propuesta contribuye al cuerpo de conocimiento en las áreas de inteligencia artificial aplicada al monitoreo ambiental y sistemas embebidos para IoT. Si bien existen múltiples estudios sobre el uso de machine learning en calidad del agua a nivel internacional, la aplicación de estos modelos a condiciones específicas de fuentes hídricas locales y con sensores de bajo costo es un campo con amplias oportunidades de investigación. El proyecto generará conocimiento sobre la capacidad predictiva de los modelos Random Forest y redes neuronales cuando se alimentan exclusivamente con parámetros fisicoquímicos básicos (pH, turbidez y temperatura), contribuyendo a determinar si este conjunto mínimo de variables es suficiente para una detección confiable de contaminación.

### Justificación práctica
Desde el punto de vista práctico, el sistema desarrollado representa una solución tecnológica de bajo costo y alta escalabilidad para un problema ambiental de primer orden. A diferencia de las estaciones de monitoreo convencionales, cuyo costo puede superar los 50,000 dólares y que requieren mantenimiento especializado, el prototipo propuesto puede implementarse por menos de 200 dólares por estación, utilizando componentes electrónicos de disponibilidad masiva. Esto abre la posibilidad de establecer redes densas de monitoreo en cuencas hidrográficas locales con recursos presupuestarios limitados.

La detección temprana de eventos de contaminación mediante alertas automatizadas permitiría a las autoridades ambientales actuar de manera oportuna para mitigar los impactos sobre los ecosistemas acuáticos y la salud pública, reduciendo los costos asociados a la recuperación ambiental y el tratamiento de enfermedades de transmisión hídrica.

### Justificación social
El agua es un bien común y su cuidado es una responsabilidad colectiva. Las comunidades rurales y periurbanas que dependen de fuentes hídricas naturales para su consumo son las más vulnerables a los efectos de la contaminación y las que menos capacidad tienen para costear sistemas de análisis de calidad del agua. Un sistema de monitoreo inteligente de bajo costo puede empoderar a estas comunidades, proporcionándoles información en tiempo real sobre la calidad del agua que consumen y contribuyendo al ejercicio efectivo de su derecho al agua limpia y segura.

### Justificación tecnológica
El proyecto se inserta en las tendencias tecnológicas más relevantes de la actualidad: la Internet de las Cosas (IoT), la inteligencia artificial aplicada y los sistemas de monitoreo ambiental inteligente. El desarrollo de competencias en estas áreas por parte de los estudiantes participantes responde directamente a los perfiles de egresado que demanda el mercado laboral de la ingeniería en el contexto de la Cuarta Revolución Industrial. Asimismo, el proyecto sienta las bases para futuras investigaciones que incorporen parámetros adicionales (oxígeno disuelto, conductividad, metales pesados) y técnicas de inteligencia artificial más avanzadas.

## Metodología

### Tipo de investigación
El presente proyecto se enmarca en una investigación de tipo aplicada con enfoque cuantitativo y alcance experimental. Es aplicada porque su propósito central es desarrollar una solución tecnológica a un problema concreto (la detección de contaminación en fuentes hídricas), utilizando conocimientos científicos existentes en los campos de la inteligencia artificial y la ingeniería electrónica. Es cuantitativa porque los datos sensoriales que constituyen la materia prima del sistema son de naturaleza numérica y su análisis requiere métodos estadísticos y computacionales. Es experimental porque se diseñarán y ejecutarán experimentos controlados para validar el desempeño del sistema bajo diferentes condiciones de contaminación.

### Método de investigación
El método utilizado es el hipotético-deductivo, partiendo de la hipótesis de que los parámetros de pH, turbidez y temperatura, procesados mediante modelos de inteligencia artificial, son suficientes para detectar contaminación en fuentes hídricas con una precisión aceptable (>85%). A partir de esta hipótesis, se diseñan experimentos que permitan confirmarla o refutarla mediante evidencia empírica.

La solución al problema se estructura en torno a un sistema de tres capas: (1) una capa de percepción, conformada por los sensores de pH, turbidez y temperatura y la electrónica de acondicionamiento de señal; (2) una capa de procesamiento, donde los datos sensoriales son preprocesados, almacenados y analizados por los modelos de inteligencia artificial; y (3) una capa de presentación, donde los resultados del análisis son comunicados al usuario final en forma de indicadores de calidad del agua y alertas de contaminación.

### Etapas y fases del proyecto

#### Fase 1: Revisión bibliográfica y diseño conceptual
- Revisión sistemática de literatura científica sobre monitoreo de calidad del agua con sensores e inteligencia artificial en bases de datos como Scopus, Web of Science, IEEE Xplore y Google Scholar.
- Análisis de los valores normativos de pH, turbidez y temperatura para agua potable y agua superficial según la normativa colombiana (Decreto 1076 de 2015) y los estándares de la OMS.
- Identificación de los rangos críticos de cada parámetro que indican presencia de diferentes tipos de contaminantes (orgánicos, inorgánicos, microbiológicos).
- Elaboración de un mapa conceptual que relaciona los valores de los sensores con los tipos de contaminación detectables y los umbrales de alerta.
- Selección y justificación de los modelos de inteligencia artificial a utilizar (Random Forest y redes neuronales) con base en la literatura revisada.

#### Fase 2: Diseño e implementación del hardware
- Selección de los componentes electrónicos del sistema:
  - Sensor de pH (módulo SEN0161)
  - Sensor de turbidez (módulo SEN0189)
  - Sensor de temperatura (DS18B20)
  - Microcontrolador (ESP32 o Arduino Mega)
  - Módulo de almacenamiento SD
  - Módulo de comunicación WiFi/GPRS
- Diseño del esquema de conexiones eléctricas entre los sensores, el microcontrolador y los módulos periféricos, utilizando software de diseño electrónico (Fritzing o KiCad).
- Ensamblaje del prototipo físico en una caja estanca con grado de protección IP65 para uso en ambientes húmedos.
- Programación del firmware del microcontrolador para la adquisición, filtrado y transmisión de datos sensoriales.
- Calibración de los sensores utilizando soluciones buffer de referencia y verificación con equipos de laboratorio certificados.
- Pruebas de funcionamiento del hardware en condiciones controladas de laboratorio.

#### Fase 3: Recopilación y preprocesamiento de datos
- Diseño del protocolo de muestreo: definición de puntos de muestreo en fuentes hídricas locales, frecuencia de toma de datos (cada 5 minutos) y duración del período de recolección (mínimo 4 semanas).
- Recolección de datos sensoriales en campo (pH, turbidez, temperatura) simultáneamente con la toma de muestras de agua para análisis de laboratorio (coliformes, DBO, metales pesados).
- Etiquetado del conjunto de datos con base en los resultados del análisis de laboratorio: agua limpia (dentro de norma) o agua contaminada (fuera de norma).
- Exploración y análisis estadístico descriptivo de los datos: distribuciones, valores atípicos, correlaciones entre variables.
- Preprocesamiento de los datos: normalización, imputación de valores faltantes, balance de clases mediante técnicas de oversampling (SMOTE) si es necesario.
- División del conjunto de datos en conjuntos de entrenamiento (70%), validación (15%) y prueba (15%).

#### Fase 4: Desarrollo y entrenamiento de modelos de IA
- Implementación del modelo Random Forest en Python utilizando la librería scikit-learn, con ajuste de hiperparámetros mediante búsqueda en cuadrícula (GridSearchCV): número de árboles, profundidad máxima, criterio de división.
- Diseño e implementación de la arquitectura de la red neuronal en Keras/TensorFlow: número de capas, número de neuronas por capa, funciones de activación (ReLU, Sigmoid), función de pérdida (binary cross-entropy) y optimizador (Adam).
- Entrenamiento de ambos modelos con el conjunto de entrenamiento y ajuste de hiperparámetros con el conjunto de validación.
- Análisis de la importancia de variables (feature importance) en el modelo Random Forest para identificar el sensor con mayor poder discriminativo.
- Comparación del desempeño de los dos modelos utilizando métricas de clasificación: exactitud (accuracy), precisión, sensibilidad (recall), especificidad, F1-score y área bajo la curva ROC (AUC-ROC).
- Selección del modelo con mejor desempeño para su integración en el sistema final.

#### Fase 5: Integración, validación y evaluación del sistema
- Integración del modelo de inteligencia artificial seleccionado en el sistema embebido (microcontrolador o Raspberry Pi) mediante serialización del modelo (pickle/ONNX) o implementación de una API REST.
- Implementación del módulo de alertas: definición de umbrales de clasificación y protocolos de notificación (alarma sonora, LED, mensaje SMS/email).
- Pruebas de validación del sistema integrado con muestras de agua de calidad conocida (análisis de laboratorio previo).
- Pruebas de campo en fuentes hídricas locales durante un período mínimo de 2 semanas.
- Análisis de resultados: comparación del desempeño del sistema integrado versus los resultados de laboratorio, cálculo de métricas de evaluación en condiciones reales.
- Documentación de resultados, conclusiones y recomendaciones para trabajo futuro.

## Referencias bibliográficas

- Banco Interamericano de Desarrollo. (2020). Agua y saneamiento en América Latina y el Caribe: retos y oportunidades. BID.
- Blanco, M. R., & Pérez, J. D. (2020). Evaluación de la calidad del agua a través de macroinvertebrados en el Balneario Hurtado, Río Guatapurí. Universidad Popular del Cesar.
- Corporación Autónoma Regional. (2022). Informe de calidad del agua en cuencas hidrográficas del departamento. CAR.
- CORPOCESAR. (2021). Boletín No. 07: Estaciones automáticas de monitoreo de calidad del agua en la cuenca del río Guatapurí.
- Gómez, A., & Martínez, L. (2022). Diseño e implementación de un sistema de monitoreo de calidad del agua de bajo costo para microcuencas rurales [Trabajo de grado]. Universidad Regional.
- Hameed, M., Sharqi, S. S., Yaseen, Z. M., Afan, H. A., Hussain, A., & Elshafie, A. (2017). Application of artificial intelligence (AI) techniques in water quality index prediction: a case study in tropical region, Malaysia. *Neural Computing and Applications, 28*(1), 893-905. https://doi.org/10.1007/s00521-016-2404-7
- Instituto de Hidrología, Meteorología y Estudios Ambientales. (2020). Informe del estado del medio ambiente y los recursos naturales renovables 2019. IDEAM.
- Kroll, S., Weilguni, V., & Breil, P. (2020). SmartWater4Europe: Using smart technology for early warning of contamination in drinking water distribution networks. *Water Supply, 20*(4), 1451-1460. https://doi.org/10.2166/ws.2020.072
- Organización Mundial de la Salud. (2021). Agua potable salubre y saneamiento básico en pro de la salud. OMS.
- Ospina, C., Valencia, D., & Arboleda, N. (2021). Predicción de coliformes fecales en el río Atrato mediante redes neuronales LSTM a partir de parámetros fisicoquímicos. *Revista Ingeniería e Investigación, 41*(3), 1-12. https://doi.org/10.15446/ing.investig.v41n3.87654
- Torres, J., & Restrepo, M. (2018). Sistema automatizado de monitoreo de calidad del agua para la quebrada La Iguaná mediante sensores electroquímicos y machine learning. *Dyna, 85*(207), 125-133. https://doi.org/10.15446/dyna.v85n207.70123
- Zhang, Y., Wu, L., Yin, Z., & Wang, H. (2019). Real-time water quality monitoring and prediction using IoT and random forest algorithm: A case study on the Yangtze River. *Environmental Science & Technology, 53*(8), 4702-4711. https://doi.org/10.1021/acs.est.9b00483
- Zhu, M., Wang, J., Yang, X., Zhang, Y., Zhang, L., Ren, H., & Ye, L. (2021). A review of the application of machine learning in water quality evaluation. *Eco-Environment & Health, 1*(2), 107-116. https://doi.org/10.1016/j.eehl.2021.12.005