# 🗺️ GTA SA HUD - GPS Interactivo

Un visor de mapas interactivo basado en la interfaz de usuario (HUD) de **Grand Theft Auto: San Andreas**. Esta aplicación utiliza la ubicación en tiempo real (GPS) del usuario para centrar el mapa, con una estética visual fiel al juego original y un sistema de radio funcional.

## ✨ Características Principales

* **Estética GTA SA:** Interfaz diseñada con fuentes clásicas (`Beckett` y `BankGothic`) y el icónico borde circular del minimapa.
* **GPS en Tiempo Real:** Seguimiento de ubicación con suavizado de movimiento (*smoothing*) para una navegación fluida.
* **Brújula Dinámica:** El mapa y el marcador del Norte (N) rotan automáticamente según la orientación del dispositivo.
* **Sistema de Radio Radial:** Menú interactivo con 13 estaciones originales (Bounce FM, K-DST, Radio Los Santos, etc.) que se sincronizan con el tiempo real.
* **Wake Lock Integrado:** La pantalla del dispositivo se mantiene encendida automáticamente mientras la aplicación está en uso.
* **Estilo Visual Personalizado:** Mapa renderizado con colores personalizados para simular el terreno, agua y edificios del estilo GTA.

## 🛠️ Tecnologías

* **MapLibre GL JS:** Motor de renderizado de mapas.
* **OpenFreeMap:** Proveedor de estilos y tiles de mapa.
* **Screen Wake Lock API:** Para prevenir el modo suspensión del dispositivo.
* **Device Orientation API:** Para la rotación basada en el hardware del celular.

## 📦 Estructura del Proyecto

* `index.html`: Estructura base y carga de recursos.
* `gps.js`: Lógica del mapa, estilos de capas, GPS y gestión del Wake Lock.
* `radio.js`: Motor de audio y lógica del menú radial de estaciones.
* `style.css`: Definición visual del HUD, animaciones y fuentes.
* `manifest.json`: Configuración de PWA para instalación en móviles.

## 🚀 Instalación y Uso

1. Clona el repositorio o descarga los archivos.
2. Asegúrate de contar con una conexión a internet (para cargar los mapas de MapLibre).
3. **Nota Importante:** Debido a las políticas de seguridad de los navegadores, las funciones de GPS y Wake Lock requieren que el sitio se ejecute bajo **HTTPS** o en **localhost**.

## 🎮 Controles de Radio

* **Mantener Presionado:** Abre el menú radial para seleccionar una emisora.
* **Doble Toque:** Cambia a la siguiente estación.
* **Triple Toque:** Cambia a la estación anterior.

---

> **Créditos:** Inspirado en el diseño original de Rockstar Games. Las estaciones de radio y logos son propiedad de sus respectivos creadores.
