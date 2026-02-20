// --- PALETA DE COLORES ---
const paleta = {
    agua: '#7088b0',
    tierra_general: '#38692d',
    edificios: '#FFFFFF',
    calles_negras: '#000000', // El color que no se estaba aplicando
    senderos_marron: '#A78C6A',
    texto_suave: '#E0E0E0'
};

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/bright', 
    center: [-70.6483, -33.4569], 
    zoom: 17,
    attributionControl: false,
    interactive: false 
});

map.on('style.load', () => {
    // 1. Color de fondo (Tierra)
    map.setPaintProperty('background', 'background-color', paleta.tierra_general);

    // 2. Forzar colores en todas las capas
    const layers = map.getStyle().layers;
    
    layers.forEach(layer => {
        // PINTAR AGUA
        if (layer.id.includes('water')) {
            map.setPaintProperty(layer.id, 'fill-color', paleta.agua);
        }

        // PINTAR EDIFICIOS
        if (layer.id.includes('building')) {
            map.setPaintProperty(layer.id, 'fill-color', paleta.edificios);
            map.setPaintProperty(layer.id, 'fill-outline-color', '#000000');
        }

        // PINTAR CALLES (Aquí estaba el fallo)
        // Buscamos cualquier capa que sea una línea y que tenga relación con caminos
        if (layer.type === 'line') {
            const esCamino = layer['source-layer'] === 'transportation' || 
                             layer.id.includes('road') || 
                             layer.id.includes('highway') || 
                             layer.id.includes('track');

            if (esCamino) {
                const esSendero = layer.id.includes('path') || layer.id.includes('footway');
                
                map.setPaintProperty(layer.id, 'line-color', esSendero ? paleta.senderos_marron : paleta.calles_negras);
                map.setPaintProperty(layer.id, 'line-opacity', 1);
                
                // Grosor de calle estilo GTA
                map.setPaintProperty(layer.id, 'line-width', [
                    'interpolate', ['linear'], ['zoom'],
                    12, 2,
                    16, 8
                ]);
            }
        }

        // TEXTOS SUAVES
        if (layer.type === 'symbol') {
            map.setPaintProperty(layer.id, 'text-color', paleta.texto_suave);
        }
    });
});

// --- LÓGICA DE GPS (SE MANTIENE IGUAL PORQUE FUNCIONA) ---
let smoothLat = null, smoothLng = null;
const smoothing = 0.2;

document.getElementById('start-btn').addEventListener('click', async function() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('wrapper').style.visibility = 'visible';

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude } = pos.coords;
            if (smoothLat === null) { smoothLat = latitude; smoothLng = longitude; }
            else { 
                smoothLat = smoothLat * (1 - smoothing) + latitude * smoothing; 
                smoothLng = smoothLng * (1 - smoothing) + longitude * smoothing; 
            }
            map.easeTo({ center: [smoothLng, smoothLat], duration: 1000 });
        }, null, { enableHighAccuracy: true });
    }

    const handleOrient = (e) => {
        let heading = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : 0);
        map.setBearing(heading);
        document.getElementById('north-orbit').style.transform = `rotate(${-heading}deg)`;
    };
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(res => {
            if (res === 'granted') window.addEventListener('deviceorientation', handleOrient);
        });
    } else { window.addEventListener('deviceorientation', handleOrient); }
});
