let isPlaying = false;
let clickCounter = 0;
let lastTime = 0;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

const bpmInput = document.getElementById('bpm');
const bpmValue = document.getElementById('bpmValue');
const volumeInput = document.getElementById('volume');
const volumeValue = document.getElementById('volumeValue');
const subdivisionSelect = document.getElementById('subdivision');
const startStopButton = document.getElementById('startStop');

bpmInput.addEventListener('input', () => {
    bpmValue.textContent = bpmInput.value;
});

volumeInput.addEventListener('input', () => {
    volumeValue.textContent = volumeInput.value;
});

startStopButton.addEventListener('click', () => {
    if (isPlaying) {
        stopMetronome();
    } else {
        startMetronome();
    }
});

// Detecta cuando la pestaña o ventana pierde el foco o se vuelve inactiva
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopMetronome();
    } else if (isPlaying) {
        startMetronome();
    }
});

function startMetronome() {
    if (audioContext.state === 'suspended') {
        audioContext.resume(); // Reactivar el contexto de audio si ha sido suspendido
    }
    
    isPlaying = true;
    clickCounter = 0;
    lastTime = performance.now();
    startStopButton.textContent = 'Stop';
    requestAnimationFrame(metronomeLoop);
}

function stopMetronome() {
    isPlaying = false;
    startStopButton.textContent = 'Play';
}

function metronomeLoop(currentTime) {
    if (!isPlaying) return;

    const bpm = bpmInput.value;
    const interval = 60000 / bpm; // Intervalo en milisegundos
    const subdivision = parseInt(subdivisionSelect.value);
    const elapsedTime = currentTime - lastTime;

    if (elapsedTime >= interval) {
        playClick(subdivision);
        lastTime = currentTime - (elapsedTime % interval);
    }

    requestAnimationFrame(metronomeLoop);
}

function playClick(subdivision) {
    if (audioContext.state === 'suspended') {
        audioContext.resume(); // Reactivar el contexto de audio si ha sido suspendido
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Usar una onda cuadrada para un sonido más seco
    oscillator.type = 'square'; // Onda cuadrada
    
    // Frecuencia del tono
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // 880Hz - A5

    // Acentuar la primera nota de cada subdivisión
    if (clickCounter % subdivision === 0) {
        gainNode.gain.setValueAtTime(volumeInput.value / 100, audioContext.currentTime); // Volumen normal para acento
    } else {
        gainNode.gain.setValueAtTime((volumeInput.value / 100) * 0.6, audioContext.currentTime); // Volumen reducido para notas no acentuadas
    }

    // Crear un decaimiento rápido
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.05); // Decaimiento rápido en 50ms

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05); // Duración del tono reducida a 50ms para un sonido más seco

    clickCounter++;
}