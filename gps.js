// --- 1. LOS COLORES QUE TE GUSTAN ---
const paleta = {
    agua: '#7088b0',
    tierra_general: '#38692d',
    edificios: '#FFFFFF',
    calles_negras: '#000000',
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

// APLICAR PINTURA (Colores)
map.on('style.load', () => {
    map.setPaintProperty('background', 'background-color', paleta.tierra_general);
    if (map.getLayer('building')) {
        map.setPaintProperty('building', 'fill-color', paleta.edificios);
        map.setPaintProperty('building', 'fill-outline-color', '#000000');
    }
    map.getStyle().layers.forEach(layer => {
        if (layer.id.includes('water')) map.setPaintProperty(layer.id, 'fill-color', paleta.agua);
        if (layer.type === 'line') {
            const esSendero = layer.id.includes('path') || layer.id.includes('footway');
            map.setPaintProperty(layer.id, 'line-color', esSendero ? paleta.senderos_marron : paleta.calles_negras);
            map.setPaintProperty(layer.id, 'line-width', esSendero ? 3 : 7);
        }
        if (layer.type === 'symbol') {
            map.setPaintProperty(layer.id, 'text-color', paleta.texto_suave);
        }
    });
});

// --- 2. EL GPS QUE SÍ FUNCIONA (Tu lógica original) ---
let smoothLat = null, smoothLng = null;
const smoothing = 0.2;

document.getElementById('start-btn').addEventListener('click', async function() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('wrapper').style.visibility = 'visible';

    // Activar GPS Real
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

    // Activar Brújula
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
