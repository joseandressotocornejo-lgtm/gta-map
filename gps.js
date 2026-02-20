// --- CONFIGURACIÓN DE MAPA (Estilo GTA SA) ---
const paleta = { 
    agua: '#7088b0', 
    tierra_general: '#38692d', 
    urbano: '#989898', 
    parques: '#788c40', 
    edificios: '#FFFFFF', 
    calles_negras: '#000000', 
    senderos_marron: '#A78C6A' 
};

const map = new maplibregl.Map({ 
    container: 'map', 
    style: 'https://tiles.openfreemap.org/styles/bright', 
    center: [-70.6483, -33.4569], 
    zoom: 18, 
    pitch: 0, 
    bearing: 0, 
    attributionControl: false, 
    interactive: false 
});

map.on('style.load', () => {
    map.setPaintProperty('background', 'background-color', paleta.tierra_general);
    if (map.getLayer('building')) { 
        map.setPaintProperty('building', 'fill-color', paleta.edificios); 
        map.setPaintProperty('building', 'fill-outline-color', '#000000'); 
    }
    map.getStyle().layers.forEach(layer => {
        if (map.getLayer('water')) map.setPaintProperty('water', 'fill-color', paleta.agua);
        if (map.getLayer('park')) map.setPaintProperty('park', 'fill-color', paleta.parques);
        const esVia = layer.id.includes('highway') || layer.id.includes('bridge') || layer.id.includes('tunnel');
        if (layer.type === 'line' && esVia) {
            const esSendero = layer.id.includes('path') || layer.id.includes('footway') || layer.id.includes('track');
            if (esSendero) { 
                map.setPaintProperty(layer.id, 'line-color', paleta.senderos_marron); 
                map.setPaintProperty(layer.id, 'line-width', 3); 
            } else { 
                map.setPaintProperty(layer.id, 'line-color', paleta.calles_negras); 
                map.setPaintProperty(layer.id, 'line-width', ['interpolate', ['linear'], ['zoom'], 14, 2, 18, 10]); 
            }
        }
    });
});

// --- LÓGICA DE PERMISOS Y SENSORES ---
function requestPermissions() {
    console.log("Solicitando permisos de ubicación y sensores...");

    // 1. Intentar obtener ubicación actual inmediatamente
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            console.log("Ubicación obtenida con éxito");
            const [lat, lng] = smoothGPS(pos.coords.latitude, pos.coords.longitude);
            map.jumpTo({ center: [lng, lat] });
            startTracking(); // Si funciona el fix inicial, activamos el seguimiento
        },
        (err) => {
            console.error("Error de Geolocalización:", err.code, err.message);
            alert("Error de GPS: " + err.message + "\n\nVerifica que estés usando HTTPS y tengas el GPS activo.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );

    // 2. Bloqueo de pantalla (WakeLock)
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {
            console.log("WakeLock no disponible");
        });
    }

    // 3. Permisos de Orientación (Especialmente para iOS/iPhone)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(res => { 
                if (res === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation); 
                } else {
                    alert("Permiso de brújula denegado.");
                }
            })
            .catch(console.error);
    } else { 
        window.addEventListener('deviceorientation', handleOrientation); 
    }
}

// Iniciar al primer click en el cuerpo del documento
document.body.addEventListener('click', requestPermissions, {once: true});

// --- GEOLOCALIZACIÓN SUAVIZADA ---
const geoOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
let smoothLat = null, smoothLng = null;
const smoothing = 0.18; 

function smoothGPS(lat, lng) { 
    if (smoothLat === null) { 
        smoothLat = lat; 
        smoothLng = lng; 
    } else { 
        smoothLat = smoothLat * (1 - smoothing) + lat * smoothing; 
        smoothLng = smoothLng * (1 - smoothing) + lng * smoothing; 
    } 
    return [smoothLat, smoothLng]; 
}

function startTracking() { 
    navigator.geolocation.watchPosition(pos => { 
        const [lat, lng] = smoothGPS(pos.coords.latitude, pos.coords.longitude); 
        map.easeTo({ 
            center: [lng, lat], 
            duration: 900,
            essential: true 
        }); 
    }, (err) => {
        console.warn("WatchPosition perdió la señal:", err.message);
    }, geoOptions); 
}

function handleOrientation(event) { 
    let rawHeading = event.webkitCompassHeading || (event.alpha ? 360 - event.alpha : 0); 
    if (rawHeading !== null) {
        map.setBearing(rawHeading); 
        const orbit = document.getElementById('north-orbit');
        if (orbit) orbit.style.transform = `rotate(${-rawHeading}deg)`; 
    }
}
