document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const startPauseBtn = document.getElementById('startPause');
    const resetBtn = document.getElementById('reset');
    const lapBtn = document.getElementById('lap');
    const lapsContainer = document.getElementById('laps');

    let time = 0;
    let isRunning = false;
    let interval;
    let laps = [];

    function formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
            .toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }

    function updateDisplay() {
        display.textContent = formatTime(time);
    }

    function startPause() {
        if (isRunning) {
            clearInterval(interval);
            startPauseBtn.innerHTML = '<i data-lucide="play"></i><span>Start</span>';
            startPauseBtn.classList.remove('running');
        } else {
            interval = setInterval(() => {
                time += 10;
                updateDisplay();
            }, 10);
            startPauseBtn.innerHTML = '<i data-lucide="pause"></i><span>Pause</span>';
            startPauseBtn.classList.add('running');
        }
        isRunning = !isRunning;
        lapBtn.disabled = !isRunning;
        lucide.createIcons();
    }

    function reset() {
        clearInterval(interval);
        time = 0;
        isRunning = false;
        laps = [];
        updateDisplay();
        startPauseBtn.innerHTML = '<i data-lucide="play"></i><span>Start</span>';
        startPauseBtn.classList.remove('running');
        lapBtn.disabled = true;
        updateLapsDisplay();
        lucide.createIcons();
    }

    function lap() {
        laps.push(time);
        updateLapsDisplay();
    }

    function updateLapsDisplay() {
        if (laps.length === 0) {
            lapsContainer.innerHTML = '<p class="no-laps">No laps recorded</p>';
        } else {
            lapsContainer.innerHTML = laps.map((lapTime, index) => 
                `<div class="lap-item">
                    <span>Lap ${index + 1}</span>
                    <span>${formatTime(lapTime)}</span>
                </div>`
            ).join('');
        }
    }

    startPauseBtn.addEventListener('click', startPause);
    resetBtn.addEventListener('click', reset);
    lapBtn.addEventListener('click', lap);

    lucide.createIcons();
});