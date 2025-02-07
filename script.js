        let subdivision = 1;

        function adjustSubdivision(change) {
            subdivision += change;
            subdivision = Math.max(1, Math.min(16, subdivision)); // Limitar entre 1 y 16
            document.getElementById("subdivisionValue").textContent = subdivision;
        }

        function updateValue(id, value) {
            document.getElementById(`${id}Value`).textContent = value;
        }

        let isPlaying = false;
        let clickCounter = 0;
        let lastTime = 0;
        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let timeoutId = null;

        const bpmInput = document.getElementById('bpm');
        const bpmValue = document.getElementById('bpmValue');
        const volumeInput = document.getElementById('volume');
        const volumeValue = document.getElementById('volumeValue');
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

        // Reactivar el contexto de audio si ha sido suspendido
        function startMetronome() {
            if (audioContext.state === 'suspended') {
                audioContext.resume(); 
            }
            
            isPlaying = true;
            clickCounter = 0;
            lastTime = performance.now();
            startStopButton.textContent = 'Stop';
            metronomeLoop();
        }

        function stopMetronome() {
            isPlaying = false;
            startStopButton.textContent = 'Play';
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        }

        function metronomeLoop() {
            if (!isPlaying) return;

            const bpm = bpmInput.value;
            const interval = 60000 / bpm; // Intervalo en milisegundos
            
            // Obtener el valor de subdivisión del <span>
            const subdivision = parseInt(document.getElementById('subdivisionValue').textContent);

            const currentTime = performance.now();
            const elapsedTime = currentTime - lastTime;

            if (elapsedTime >= interval) {
                playClick(subdivision);
                lastTime = currentTime - (elapsedTime % interval);
            }

            timeoutId = setTimeout(metronomeLoop, interval - (elapsedTime % interval));
        }

        function playClick(subdivision) {
            if (audioContext.state === 'suspended') {
                audioContext.resume(); // Reactivar el contexto de audio si ha sido suspendido
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

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