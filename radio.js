const stations = [
    { name: "Radio Off", logo: "img/RadioOff.png", file: "", duration: 0 },
    { name: "Bounce FM", logo: "img/BounceFM.png", file: "https://www.dropbox.com/scl/fi/ca7wu3m85r58rgbv9pd7g/Bounce-FM.ogg?rlkey=v7qw43n1h981dcomxfjpve96v&st=5gx1zfuf&raw=1", duration: 3902 },
    { name: "CSR 103.9", logo: "img/CSR1039.png", file: "https://www.dropbox.com/scl/fi/fpdmf6o39nbadvw137au1/CSR-103.9.ogg?rlkey=rx77lkc6nhbujzgna49ctl9q9&st=89cquejz&raw=1", duration: 2844 },
    { name: "K-DST", logo: "img/K-DST.png", file: "https://www.dropbox.com/scl/fi/oosqrvx814k1e3cc5tgup/K-DST.ogg?rlkey=fvf1umkp0y16c1it3n04v2ixx&st=37bzczhr&raw=1", duration: 4001 },
    { name: "K-JAH West", logo: "img/KJAHWest.png", file: "https://www.dropbox.com/scl/fi/bke95j1p5xoph0li70xm/K-JAH-West.ogg?rlkey=t0x395wzoo3s1slyvmtb364x3&st=p4861lcp&raw=1", duration: 3633 },
    { name: "K-Rose", logo: "img/K-Rose.png", file: "https://www.dropbox.com/scl/fi/9rqncuwg57ytnhxgogxhw/K-Rose.ogg?rlkey=stkyv5gbrzgg16g1o020j0r8u&st=g5hmzkx2&raw=1", duration: 2886 },
    { name: "Master Sounds 98.3", logo: "img/MasterSounds983.png", file: "https://www.dropbox.com/scl/fi/1vgwoli2ml2u7i24ft643/Master-Sounds-98.3.ogg?rlkey=bd1gph4a2wnqkc6nsq2p0x2sp&st=waoj51bo&raw=1", duration: 4061 },
    { name: "Playback FM", logo: "img/PlaybackFM.png", file: "https://www.dropbox.com/scl/fi/5c15ncg6pjxwfr8ls0dga/Playback-FM.ogg?rlkey=aygen0ilmxtmg3oppbnpb633f&st=lvhvgtw6&raw=1", duration: 2810 },
    { name: "Radio Los Santos", logo: "img/RadioLosSantos.png", file: "https://www.dropbox.com/scl/fi/sinj8ub6wcg6t6sly5upa/Radio-Los-Santos.ogg?rlkey=mil43l09kuhu1fjpj8pl8llfz&st=54uerjxk&raw=1", duration: 3863 },
    { name: "Radio X", logo: "img/RadioX.png", file: "https://www.dropbox.com/scl/fi/4rvm9go6hrz96wqdh3lpg/Radio-X.ogg?rlkey=c9sy9p84hng643ci46preq4pl&st=vv0zqu8r&raw=1", duration: 3469 },
    { name: "SF-UR", logo: "img/SFUR.png", file: "https://www.dropbox.com/scl/fi/plk0bquq892pau0h06xk5/SF-UR.ogg?rlkey=6hz4lfd7f4e6axvmtdh3hdsrp&st=vs46r7j9&raw=1", duration: 3973 },
    { name: "WCTR", logo: "img/WCTR.png", file: "https://www.dropbox.com/scl/fi/zl5jqlhy132qsunbd47o4/West-Coast-Talk-Radio.ogg?rlkey=4400rfyv0cpdvhtzp8o2bflep&st=jmf3rrvk&raw=1", duration: 6599 },
    { name: "Guardians of the Galaxy", logo: "img/Guardians of the Galaxy.png", file: "https://www.dropbox.com/scl/fi/g6uxuktvqu41sa8kv1k6r/Guardians-of-the-Galaxy.ogg?rlkey=wljmxuoa35ulnr62g66ccdvgg&st=ku9pq08h&raw=1", duration: 3217 }
];

let currentIdx = 0; 
let tempIdx = 0; 
let isHolding = false; 
let holdTimer; 
let clickCount = 0;
let clickTimer;
let hideTimeout;

const radioUi = document.getElementById('radio-ui');
const audio = document.getElementById('radio-audio');
const staticSfx = document.getElementById('static-sfx');
const menuSfx = document.getElementById('menu-sfx');

// Crear iconos radiales
stations.forEach((s, i) => {
    const angle = (i / stations.length) * Math.PI * 2 - Math.PI / 2;
    const x = 50 + Math.cos(angle) * 38;
    const y = 50 + Math.sin(angle) * 38;
    const icon = document.createElement('img');
    icon.src = s.logo; icon.className = 'station-icon-radial'; icon.id = `rad-${i}`;
    icon.style.left = `${x}%`; icon.style.top = `${y}%`;
    radioUi.appendChild(icon);
});

function playMenuSfx() {
    menuSfx.currentTime = 0;
    menuSfx.play().catch(() => {});
}

function applyStation(idx) {
    currentIdx = idx; 
    const s = stations[currentIdx];
    audio.pause();
    playMenuSfx(); // Sonido al confirmar estación

    if (s.file) {
        const ahora = Math.floor(Date.now() / 1000); 
        audio.src = s.file;
        audio.onloadedmetadata = () => { 
            audio.currentTime = ahora % s.duration; 
            audio.play().catch(()=>{}); 
        };
        audio.load();
    } else { 
        audio.src = ""; 
    }
}

function updateSelection(idx) {
    if (tempIdx !== idx) playMenuSfx(); // Sonido al pasar por encima de otra radio
    tempIdx = idx; 
    document.getElementById('station-logo').src = stations[idx].logo;
    document.getElementById('station-name').innerText = stations[idx].name;
    document.querySelectorAll('.station-icon-radial').forEach(el => el.classList.remove('highlight'));
    document.getElementById(`rad-${idx}`).classList.add('highlight');
    staticSfx.currentTime = 0; 
    staticSfx.play().catch(()=>{});
}

const handleStart = (e) => {
    if(e.target.id === 'start-btn') return;
    
    // Lógica para detectar clics vs mantener pulsado
    isHolding = false;
    clearTimeout(holdTimer);
    
    holdTimer = setTimeout(() => {
        isHolding = true;
        tempIdx = currentIdx;
        radioUi.classList.add('active');
        updateSelection(currentIdx);
    }, 400);
};

const handleMove = (e) => {
    if (!isHolding) return;
    const touch = e.touches ? e.touches[0] : e;
    const rect = radioUi.getBoundingClientRect();
    const angle = Math.atan2(touch.clientY - (rect.top + rect.height/2), touch.clientX - (rect.left + rect.width/2));
    let norm = angle + Math.PI / 2; if (norm < 0) norm += Math.PI * 2;
    const index = Math.round((norm / (Math.PI * 2)) * stations.length) % stations.length;
    if (index !== tempIdx) updateSelection(index);
};

const handleEnd = (e) => {
    clearTimeout(holdTimer);

    if (isHolding) {
        // Soltamos después de elegir en el menú radial
        applyStation(tempIdx);
        hideTimeout = setTimeout(() => radioUi.classList.remove('active'), 800);
        isHolding = false;
        clickCount = 0;
    } else {
        // Lógica de clics rápidos (Multi-tap)
        clickCount++;
        clearTimeout(clickTimer);

        clickTimer = setTimeout(() => {
            if (clickCount === 2) {
                // DOBLE CLIC: Siguiente estación
                let next = (currentIdx + 1) % stations.length;
                mostrarCambioRapido(next);
            } else if (clickCount === 3) {
                // TRIPLE CLIC: Estación anterior
                let prev = (currentIdx - 1 + stations.length) % stations.length;
                mostrarCambioRapido(prev);
            }
            clickCount = 0;
        }, 300); // Ventana de tiempo para los clics
    }
};

// Función para mostrar visualmente el cambio rápido sin el menú radial completo
function mostrarCambioRapido(idx) {
    radioUi.classList.add('active');
    updateSelection(idx);
    applyStation(idx);
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => radioUi.classList.remove('active'), 1200);
}

// Eventos
window.addEventListener('touchstart', handleStart, {passive: false});
window.addEventListener('touchmove', handleMove, {passive: false});
window.addEventListener('touchend', handleEnd);
window.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);
