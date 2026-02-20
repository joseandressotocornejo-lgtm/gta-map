const paleta = { agua: '#7088b0', tierra: '#38692d', edificios: '#FFFFFF', calles: '#000000', senderos: '#A78C6A' };
const map = new maplibregl.Map({ 
    container: 'map', 
    style: 'https://tiles.openfreemap.org/styles/bright', 
    center: [-70.6483, -33.4569], 
    zoom: 18, 
    attributionControl: false, 
    interactive: false 
});

map.on('style.load', () => {
    map.setPaintProperty('background', 'background-color', paleta.tierra);
    if (map.getLayer('building')) { map.setPaintProperty('building', 'fill-color', paleta.edificios); map.setPaintProperty('building', 'fill-outline-color', '#000000'); }
    map.getStyle().layers.forEach(layer => {
        if (layer.id.includes('water')) map.setPaintProperty(layer.id, 'fill-color', paleta.agua);
        if (layer.id.includes('park') || layer.id.includes('landuse')) map.setPaintProperty(layer.id, 'fill-color', paleta.tierra);
        if (layer.type === 'line') {
            const isPath = layer.id.includes('path') || layer.id.includes('footway');
            map.setPaintProperty(layer.id, 'line-color', isPath ? paleta.senderos : paleta.calles);
            map.setPaintProperty(layer.id, 'line-width', isPath ? 3 : 8);
        }
    });
});

let smoothLat = null, smoothLng = null;
const smoothing = 0.2;

document.getElementById('start-btn').addEventListener('click', async function() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('wrapper').style.visibility = 'visible';

    // Despertar Audio de sistema
    document.getElementById('menu-sfx').play().catch(() => {});
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(()=>{});

    // ACTIVACIÓN GPS (Lógica del archivo que funciona)
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude } = pos.coords;
            if (smoothLat === null) { smoothLat = latitude; smoothLng = longitude; }
            else { smoothLat = smoothLat * (1-smoothing) + latitude * smoothing; smoothLng = smoothLng * (1-smoothing) + longitude * smoothing; }
            map.easeTo({ center: [smoothLng, smoothLat], duration: 1000 });
        }, (err) => {
            alert("Error GPS: Asegúrate de usar HTTPS y activar la ubicación.");
        }, { enableHighAccuracy: true });
    }

    // BRÚJULA
    const handleOrient = (e) => {
        let heading = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : 0);
        map.setBearing(heading);
        document.getElementById('north-orbit').style.transform = `rotate(${-heading}deg)`;
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
