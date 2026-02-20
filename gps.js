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
    center: [-70.6483, -33.4569], 
    zoom: 17,
    attributionControl: false,
    interactive: false 
});

map.on('style.load', () => {
    // 1. ETIQUETAS DISCRETAS (Tu código exacto)
    map.getStyle().layers.forEach(layer => {
        if (layer.type === 'symbol') {
            map.setLayoutProperty(layer.id, 'visibility', 'visible');
            if (layer.layout && layer.layout['text-field']) {
                map.setLayoutProperty(layer.id, 'text-size', 11);
                map.setPaintProperty(layer.id, 'text-color', paleta.texto_suave);
                map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(0,0,0,0.5)');
                map.setPaintProperty(layer.id, 'text-halo-width', 1);
                map.setPaintProperty(layer.id, 'text-opacity', ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 0.8]);
            }
        }
    });

    // 2. COLORES DE FONDO
    map.setPaintProperty('background', 'background-color', paleta.tierra_general);
    if (map.getLayer('water')) map.setPaintProperty('water', 'fill-color', paleta.agua);
    if (map.getLayer('park')) map.setPaintProperty('park', 'fill-color', paleta.parques);
    if (map.getLayer('landcover_wood')) map.setPaintProperty('landcover_wood', 'fill-color', paleta.tierra_natural);

    if (map.getLayer('building')) {
        map.setPaintProperty('building', 'fill-color', paleta.edificios);
        map.setPaintProperty('building', 'fill-outline-color', '#000000');
    }

    // 3. CALLES NEGRAS (Tu lógica de filtrado por IDs)
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
                map.setPaintProperty(layer.id, 'line-width', ['interpolate', ['linear'], ['zoom'], 12, 1.2, 16, 5]);
            }
        }
    });
});

// --- LÓGICA DE ARRANQUE GPS ---
let smoothLat = null, smoothLng = null;
const smoothing = 0.2;

document.getElementById('start-btn').addEventListener('click', async function() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('wrapper').style.visibility = 'visible';
    
    document.getElementById('menu-sfx').play().catch(() => {});
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(()=>{});

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
