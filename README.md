# 📍 GTA-Map

Proyecto web para mostrar un *mapa interactivo estilo Grand Theft Auto* con GPS y sistema de radio inspirado en GTA.

Este proyecto utiliza **mapas vectoriales (MapLibre/tiles)**, integración de geolocalización del navegador y un menú de radio con emisoras clásicas de GTA.

---

## 🧩 Características

✅ Mapa interactivo al estilo GTA con colores personalizados
✅ Navegación GPS usando geolocalización del navegador
✅ Soporte de orientación (brújula) en dispositivos móviles
✅ Menú de radio con varias emisoras recreadas (con audio)
✅ Interfaz responsive para móviles y desktop

---

## 🚀 Demo

---

## 🗂️ Estructura del proyecto

```
/
├─ img/                  # Iconos y logos de radio
├─ gps.js                # Lógica de mapa y GPS
├─ radio.js              # Lógica del menú de radio
├─ index.html            # HTML base
├─ style.css             # Estilos de UI
├─ manifest.json         # Config para PWA (si aplica)
```

---

## 🗺️ Mapa

Se usa **MapLibre GL JS** con un estilo basado en OpenStreetMap u otro servicio tile compatible.

En `gps.js` se configura el mapa con:

* **Paleta de colores personalizada**
* Colores para calles, edificios y agua
* Zoom y centro inicial
* Adaptación de estilo basado en capas

El mapa no es específico de GTA (no incluye el mapa real de Los Santos), sino estilizado para dar una sensación de navegación con GPS real.

```js
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/bright',
  center: [-70.6483, -33.4569],
  zoom: 17,
  attributionControl: false,
  interactive: false
});
```

---

## 📍 Funcionalidad GPS

Al iniciar:

1. Se oculta el overlay de inicio.
2. Se muestra el mapa.
3. Se solicita geolocalización del usuario.
4. El mapa se centra y rota según orientación del dispositivo.

*(Esto hace que el mapa parezca un GPS real de GTA.)*

---

## 🎧 Menú de Radio

El archivo `radio.js` contiene un listado de estaciones con:

| Nombre    | Logo             | Archivo de audio |
| --------- | ---------------- | ---------------- |
| Radio Off | img/RadioOff.png | —                |
| Bounce FM | img/BounceFM.png | Bounce-FM.ogg    |
| CSR 103.9 | img/CSR1039.png  | CSR-1039.ogg     |
| …         | …                | …                |

La UI permite:

* Mantener presionado para abrir menú radial
* Tocar para cambiar emisora
* Doble toque para siguiente
* Triple toque para anterior

*(Funciona con eventos táctiles y de ratón.)*

---

## 🛠️ Instalación

1. Clona el repositorio

   ```bash
   git clone https://github.com/joseandressotocornejo-lgtm/gta-map.git
   ```
2. Abre `index.html` en tu navegador
3. Permite acceso a **geolocalización** si quieres usar GPS
4. Interactúa con el mapa y el menú de radio

*(No requiere backend, solo archivos estáticos.)*

---

## 📦 Tecnologías

| Tecnología          | Uso                         |
| ------------------- | --------------------------- |
| HTML                | Estructura principal        |
| CSS                 | Estilos UI                  |
| JavaScript          | Lógica de mapa y radio      |
| MapLibre GL         | Renderizado de mapas        |
| OpenStreetMap tiles | Capas de mapa base          |
| Geolocation API     | Posicionamiento del usuario |

---

## 📝 Ideas para mejorar

✨ Integrar mapas reales de Los Santos u otra ciudad inspirada en GTA
🔊 Añadir más emisoras con playlists completas
📍 Mostrar puntos de interés (POI) tipo GTA
📱 PWA para usar como app en móviles
🌐 Modo nocturno

---

