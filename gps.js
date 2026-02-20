// --- PALETA DE COLORES GTA SAN ANDREAS ---
const paleta = {
    agua: '#7088b0',
    tierra_general: '#38692d',
    tierra_natural: '#386c28',
    urbano: '#989898',
    parques: '#788c40',
    edificios: '#FFFFFF',
    calles_negras: '#000000',
    senderos_marron: '#A78C6A',
    texto_suave: '#E0E0E0'
};

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/bright', 
    center: [-70.6483, -33.4569], // Santiago inicial
    zoom: 17,
    pitch: 0,
    bearing: 0,
    attributionControl: false,
    interactive: false 
});

map.on('style.load', () => {
    // 1. CONFIGURACIÓN DE ETIQUETAS (Nombres de calles suaves)
    map.getStyle().layers.forEach(layer => {
        if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
            map.setPaintProperty(layer.id, 'text-color', paleta.texto_suave);
            map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(0,0,0,0.5)');
            map.setPaintProperty(layer.id, 'text-halo-width', 1);
        }
    });

    // 2. COLORES DE TERRENO Y EDIFICIOS
    map.setPaintProperty('background', 'background-color', paleta.tierra_general);
    if (map.getLayer('water')) map.setPaintProperty('water', 'fill-color', paleta.agua);
    if (map.getLayer('park')) map.setPaintProperty('park', 'fill-color', paleta.parques);
    
    if (map.getLayer('building')) {
        map.setPaintProperty('building', 'fill-color', paleta.edificios);
        map.setPaintProperty('building', 'fill-outline-color', '#000000');
    }

    // 3. CALLES NEGRAS Y SENDEROS
    map.getStyle().layers.forEach(layer => {
        const esVia = layer.id.includes('highway') || layer.id.includes('bridge') || layer.id.includes('tunnel');
        if (layer.type === 'line' && esVia) {
            const esSendero = layer.id.includes('path') || layer.id.includes('footway') || layer.id.includes('track');
            if (esSendero) {
                map.setPaintProperty(layer.id, 'line-color', paleta.senderos_marron);
                map.setPaintProperty(layer.id, 'line-width', 2);
            } else {
                map.setPaintProperty(layer.id, 'line-color', paleta.calles_negras);
                map.setPaintProperty(layer.id, 'line-opacity', 1);
                map.setPaintProperty(layer.id, 'line-width', [
                    'interpolate', ['linear'], ['zoom'],
                    12, 1.5,
                    16, 6
                ]);
            }
        }
    });
});

// --- LÓGICA DE ARRANQUE (BOTÓN INICIAR) ---
let smoothLat = null, smoothLng = null;
const smoothing = 0.2;

document.getElementById('start-btn').addEventListener('click', async function() {
    // Ocultar overlay e iniciar HUD
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('wrapper').style.visibility = 'visible';

    // Despertar Audio y Sensores
    document.getElementById('menu-sfx').play().catch(() => {});
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(()=>{});

    // ACTIVACIÓN GPS
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude } = pos.coords;
            if (smoothLat === null) { smoothLat = latitude; smoothLng = longitude; }
            else { 
                smoothLat = smoothLat * (1 - smoothing) + latitude * smoothing; 
                smoothLng = smoothLng * (1 - smoothing) + longitude * smoothing; 
            }
            map.easeTo({ center: [smoothLng, smoothLat], duration: 1000, essential: true });
        }, (err) => {
            console.error("GPS Error:", err.message);
        }, { enableHighAccuracy: true });
    }

    // BRÚJULA
    const handleOrient = (e) => {
        let heading = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : 0);
        map.setBearing(heading);
        const orbit = document.getElementById('north-orbit');
        if (orbit) orbit.style.transform = `rotate(${-heading}deg)`;
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const response = await DeviceOrientationEvent.requestPermission();
            if (response === 'granted') window.addEventListener('deviceorientation', handleOrient);
        } catch (e) { console.error(e); }
    } else {
        window.addEventListener('deviceorientation', handleOrient);
    }
});
