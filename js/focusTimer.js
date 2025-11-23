// Focus Timer (Pomodoro) Manager for Sowestart

const focusTimerManager = {
    // Timer state
    isRunning: false,
    isPaused: false,
    currentMode: 'focus', // 'focus', 'shortBreak', 'longBreak'
    timeRemaining: 25 * 60, // seconds
    interval: null,
    sessionsCompleted: 0,

    // Timer durations (in minutes)
    durations: {
        focus: 25,
        shortBreak: 5,
        longBreak: 15
    },

    init() {
        this.loadState();
        this.attachEventListeners();
        this.updateVisibility();
        this.updateDisplay();
    },

    attachEventListeners() {
        const startBtn = document.getElementById('timer-start');
        const pauseBtn = document.getElementById('timer-pause');
        const resetBtn = document.getElementById('timer-reset');
        const toggleBtn = document.getElementById('toggle-focus-widget');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.start();
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.pause();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.reset();
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleCollapse();
            });
        }
    },

    loadState() {
        const savedSessions = storage.get('focusTimerSessions') || 0;
        const today = new Date().toDateString();
        const lastDate = storage.get('focusTimerDate');

        // Reset sessions if new day
        if (lastDate !== today) {
            this.sessionsCompleted = 0;
            storage.set('focusTimerSessions', 0);
            storage.set('focusTimerDate', today);
        } else {
            this.sessionsCompleted = savedSessions;
        }

        this.updateSessionsDisplay();
    },

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;

        // Show pause button, hide start button
        document.getElementById('timer-start').classList.add('hidden');
        document.getElementById('timer-pause').classList.remove('hidden');

        // Start countdown
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
    },

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.isPaused = true;

        // Show start button, hide pause button
        document.getElementById('timer-start').classList.remove('hidden');
        document.getElementById('timer-pause').classList.add('hidden');

        clearInterval(this.interval);
    },

    reset() {
        this.isRunning = false;
        this.isPaused = false;

        // Show start button, hide pause button
        document.getElementById('timer-start').classList.remove('hidden');
        document.getElementById('timer-pause').classList.add('hidden');

        clearInterval(this.interval);

        // Reset to current mode's duration
        this.timeRemaining = this.durations[this.currentMode] * 60;
        this.updateDisplay();
    },

    tick() {
        this.timeRemaining--;

        if (this.timeRemaining <= 0) {
            this.complete();
        } else {
            this.updateDisplay();
        }
    },

    complete() {
        clearInterval(this.interval);
        this.isRunning = false;

        // Play notification sound (browser notification)
        this.notify();

        // Increment sessions if focus was completed
        if (this.currentMode === 'focus') {
            this.sessionsCompleted++;
            storage.set('focusTimerSessions', this.sessionsCompleted);
            this.updateSessionsDisplay();
        }

        // Switch mode
        this.switchMode();
    },

    switchMode() {
        if (this.currentMode === 'focus') {
            // After focus, decide short or long break
            if (this.sessionsCompleted % 4 === 0) {
                this.currentMode = 'longBreak';
            } else {
                this.currentMode = 'shortBreak';
            }
        } else {
            // After break, back to focus
            this.currentMode = 'focus';
        }

        this.timeRemaining = this.durations[this.currentMode] * 60;
        this.updateDisplay();
        this.updateModeLabel();

        // Reset buttons
        document.getElementById('timer-start').classList.remove('hidden');
        document.getElementById('timer-pause').classList.add('hidden');
    },

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;

        const minutesEl = document.getElementById('timer-minutes');
        const secondsEl = document.getElementById('timer-seconds');

        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    },

    updateModeLabel() {
        const label = document.getElementById('timer-mode-label');
        if (!label) return;

        const modeLabels = {
            focus: 'Focus Time',
            shortBreak: 'Short Break',
            longBreak: 'Long Break'
        };

        label.textContent = modeLabels[this.currentMode];
    },

    updateSessionsDisplay() {
        const sessionsEl = document.getElementById('timer-sessions');
        if (sessionsEl) {
            sessionsEl.textContent = this.sessionsCompleted;
        }
    },

    notify() {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const modeText = this.currentMode === 'focus' ? 'Focus session' : 'Break';
            new Notification('So We Start - Focus Timer', {
                body: `${modeText} complete! ${this.currentMode === 'focus' ? 'Time for a break.' : 'Back to focus!'}`,
                icon: 'icons/icon-128.png'
            });
        }

        // Play a subtle sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Could not play notification sound:', e);
        }
    },

    toggleCollapse() {
        const container = document.getElementById('focus-timer-container');
        const button = document.getElementById('toggle-focus-widget');
        const isCollapsed = container.classList.toggle('collapsed');

        if (isCollapsed) {
            button.style.transform = 'rotate(-90deg)';
            storage.set('focusTimerCollapsed', true);
        } else {
            button.style.transform = 'rotate(0deg)';
            storage.set('focusTimerCollapsed', false);
        }
    },

    updateVisibility() {
        const widget = document.getElementById('focus-timer-widget');
        const enabled = storage.get('focusTimerEnabled');

        if (enabled) {
            widget.classList.remove('hidden');
        } else {
            widget.classList.add('hidden');
        }

        // Check if collapsed
        const isCollapsed = storage.get('focusTimerCollapsed');
        if (isCollapsed) {
            const container = document.getElementById('focus-timer-container');
            const button = document.getElementById('toggle-focus-widget');
            container.classList.add('collapsed');
            button.style.transform = 'rotate(-90deg)';
        }
    },

    // Request notification permission
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
};
