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

// Función maestra de pintura para asegurar que se aplique sí o sí
function aplicarColoresGTA() {
    const style = map.getStyle();
    if (!style) return;

    // 1. Fondo y capas base
    if (map.getLayer('background')) map.setPaintProperty('background', 'background-color', paleta.tierra_general);
    if (map.getLayer('water')) map.setPaintProperty('water', 'fill-color', paleta.agua);
    
    style.layers.forEach(layer => {
        // 2. ETIQUETAS
        if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
            map.setPaintProperty(layer.id, 'text-color', paleta.texto_suave);
            map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(0,0,0,0.5)');
            map.setPaintProperty(layer.id, 'text-halo-width', 1);
        }

        // 3. CALLES (Mejora de detección)
        const esVia = layer.id.includes('highway') || layer.id.includes('bridge') || layer.id.includes('tunnel') || layer.id.includes('road');

        if (layer.type === 'line' && esVia) {
            const esSendero = layer.id.includes('path') || layer.id.includes('footway') || layer.id.includes('track');

            if (esSendero) {
                map.setPaintProperty(layer.id, 'line-color', paleta.senderos_marron);
                map.setPaintProperty(layer.id, 'line-width', 2);
            } else {
                // FORZAR NEGRO
                map.setPaintProperty(layer.id, 'line-color', paleta.calles_negras);
                map.setPaintProperty(layer.id, 'line-opacity', 1);
                map.setPaintProperty(layer.id, 'line-width', [
                    'interpolate', ['linear'], ['zoom'],
                    12, 1.5,
                    16, 6
                ]);
            }
        }

        // 4. EDIFICIOS
        if (layer.id.includes('building')) {
            map.setPaintProperty(layer.id, 'fill-color', paleta.edificios);
            map.setPaintProperty(layer.id, 'fill-outline-color', '#000000');
        }
    });
}

// Escuchar cuando el estilo cargue
map.on('style.load', aplicarColoresGTA);

// --- LÓGICA DE PREVENCIÓN DE APAGADO (WAKE LOCK) ---
let wakeLock = null;

const requestWakeLock = async () => {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activo: La pantalla NO se apagará.');
        }
    } catch (err) {
        console.error(`Error al activar Wake Lock: ${err.message}`);
    }
};

// Re-activar si la pestaña vuelve a ser visible
document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
    }
});

// --- LÓGICA DE GPS ---
let smoothLat = null, smoothLng = null;
const smoothing = 0.2;

document.getElementById('start-btn').addEventListener('click', async function() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('wrapper').style.visibility = 'visible';
    
    // ACTIVAR EL BLOQUEO DE PANTALLA
    await requestWakeLock();

    // Re-aplicar colores por si acaso al iniciar
    aplicarColoresGTA();

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
