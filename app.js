const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('play-btn');
const micBtn = document.getElementById('mic-btn');
const modeBtns = document.querySelectorAll('.mode-btn');

const seekBar = document.getElementById('seek-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');

let width, height;
let audioCtx, analyser;
let audioSource = null;
let micSource = null;
let micStream = null;

let freqData, timeData;
let isPlaying = false;
let isMicMode = false;
let currentMode = 'bars';

// 100% ishlaydigan rasmiy MDN test musiqasi
const audioUrl = 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3';
const audio = new Audio(audioUrl);
audio.crossOrigin = 'anonymous';
audio.volume = 0.5;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        freqData = new Uint8Array(analyser.frequencyBinCount);
        timeData = new Uint8Array(analyser.fftSize);
        analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function setupAudioElement() {
    initAudioContext();
    if (!audioSource) {
        audioSource = audioCtx.createMediaElementSource(audio);
    }
    audioSource.connect(analyser);
}

async function setupMic() {
    initAudioContext();
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micSource = audioCtx.createMediaStreamSource(micStream);
        micSource.connect(analyser);
    } catch (err) {
        console.error("Mic access denied", err);
        micBtn.textContent = "Mic Denied";
        isMicMode = false;
        isPlaying = false;
    }
}

function stopMic() {
    if (micSource) {
        micSource.disconnect();
        micSource = null;
    }
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
    }
}

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    seekBar.max = Math.floor(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    if (!isMicMode && !audio.paused) {
        seekBar.value = audio.currentTime;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('ended', () => {
    isPlaying = false;
    playBtn.textContent = '▶';
});

seekBar.addEventListener('input', () => {
    if (!isMicMode) audio.currentTime = seekBar.value;
});

volumeBar.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

playBtn.addEventListener('click', () => {
    if (isMicMode) return;
    
    if (isPlaying) {
        audio.pause();
        playBtn.textContent = '▶';
        isPlaying = false;
    } else {
        setupAudioElement();
        audio.play().then(() => {
            playBtn.textContent = '⏸';
            isPlaying = true;
        }).catch(err => {
            console.error("Audio error:", err);
            alert("Musiqa yuklanishida xatolik yuz berdi. Internet aloqasini tekshiring.");
        });
    }
});

micBtn.addEventListener('click', () => {
    isMicMode = !isMicMode;
    
    if (isMicMode) {
        audio.pause();
        playBtn.textContent = '▶';
        
        micBtn.classList.add('active');
        micBtn.textContent = "🎤 Mic ON";
        trackTitle.textContent = "LIVE MIC";
        trackArtist.textContent = "Say something!";
        
        if (audioSource) audioSource.disconnect();
        setupMic();
        isPlaying = true; 
    } else {
        micBtn.classList.remove('active');
        micBtn.textContent = "🎤 Use Mic";
        trackTitle.textContent = "MDN AUDIO";
        trackArtist.textContent = "Outfoxing";
        
        stopMic();
        setupAudioElement();
        isPlaying = false;
    }
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        modeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.dataset.mode;
    });
});

function drawBars() {
    const barWidth = width / analyser.frequencyBinCount;
    let x = 0;
    for (let i = 0; i < analyser.frequencyBinCount; i++) {
        const barHeight = (freqData[i] / 255) * height * 0.7;
        const hue = i / analyser.frequencyBinCount * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
    }
    ctx.shadowBlur = 0;
}

function drawWave() {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    ctx.beginPath();
    const sliceWidth = width / analyser.fftSize;
    let x = 0;
    for (let i = 0; i < analyser.fftSize; i++) {
        const v = timeData[i] / 128.0;
        const y = v * height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
    }
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawRadial() {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.2;
    const bars = analyser.frequencyBinCount;

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < bars; i++) {
        const value = freqData[i] / 255;
        const barHeight = value * 200;
        const angle = (i / bars) * Math.PI * 2;
        
        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle) * (radius + barHeight);
        const y2 = Math.sin(angle) * (radius + barHeight);

        const hue = (i / bars) * 360 + (Date.now() * 0.05);
        ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.restore();
    ctx.shadowBlur = 0;
}

function animate() {
    requestAnimationFrame(animate);
    
    ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
    ctx.fillRect(0, 0, width, height);

    if (!audioCtx || !isPlaying) return;

    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);

    if (currentMode === 'bars') drawBars();
    else if (currentMode === 'wave') drawWave();
    else if (currentMode === 'radial') drawRadial();
}

animate();