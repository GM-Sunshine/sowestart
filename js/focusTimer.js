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
        this.loadDurations();
        this.attachEventListeners();
        this.updateVisibility();
        this.updateDisplay();
        this.updateModeLabel();
        this.renderWeeklyGraph();
    },

    loadDurations() {
        const customDurations = storage.get('focusTimerCustomDurations');
        if (customDurations) {
            this.durations = { ...this.durations, ...customDurations };
        }
        // Update time remaining if not running
        if (!this.isRunning) {
            this.timeRemaining = this.durations[this.currentMode] * 60;
            this.updateDisplay();
        }
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

            // Track history
            this.trackHistory();

            // Show break activity suggestion
            this.showBreakSuggestion();
        }

        // Switch mode
        this.switchMode();

        // Auto-start next session if enabled
        const autoStart = storage.get('focusTimerAutoStart');
        if (autoStart) {
            setTimeout(() => {
                this.start();
            }, 3000); // 3 second delay
        }
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

        // Update weekly total
        const history = storage.get('focusTimerHistory') || [];
        const weekTotal = history.reduce((sum, entry) => sum + entry.sessions, 0);
        const weekTotalEl = document.getElementById('timer-week-total');
        if (weekTotalEl) {
            weekTotalEl.textContent = weekTotal;
        }

        // Update graph
        this.renderWeeklyGraph();
    },

    renderWeeklyGraph() {
        const graphContainer = document.getElementById('timer-graph-bars');
        if (!graphContainer) return;

        const history = storage.get('focusTimerHistory') || [];
        const today = new Date();

        // Generate last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }

        // Find max sessions for scaling
        const maxSessions = Math.max(...days.map(day => {
            const dateString = day.toDateString();
            const entry = history.find(h => h.date === dateString);
            return entry ? entry.sessions : 0;
        }), 1);

        // Render bars
        graphContainer.innerHTML = days.map(day => {
            const dateString = day.toDateString();
            const entry = history.find(h => h.date === dateString);
            const sessions = entry ? entry.sessions : 0;
            const height = (sessions / maxSessions) * 100;

            const dayLabel = day.toLocaleDateString('en-US', { weekday: 'short' });

            return `
                <div class="graph-bar">
                    <div class="bar-container">
                        <div class="bar-fill" style="height: ${height}%;">
                            <span class="bar-value">${sessions} session${sessions !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div class="bar-label">${dayLabel}</div>
                </div>
            `;
        }).join('');
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

        // Play selected sound
        const soundType = storage.get('focusTimerSound') || 'bell';
        if (soundType !== 'none') {
            this.playSound(soundType);
        }
    },

    playSound(soundType) {
        const sounds = {
            bell: { freq: 800, type: 'sine', duration: 0.5 },
            chime: { freq: [523, 659, 784], type: 'sine', duration: 0.3 },
            gong: { freq: 200, type: 'triangle', duration: 1.5 },
            ping: { freq: 1000, type: 'square', duration: 0.15 }
        };

        const sound = sounds[soundType];
        if (!sound) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            if (Array.isArray(sound.freq)) {
                // Play multiple tones (chime)
                sound.freq.forEach((freq, index) => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.value = freq;
                    oscillator.type = sound.type;

                    const startTime = audioContext.currentTime + (index * 0.2);
                    gainNode.gain.setValueAtTime(0.2, startTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + sound.duration);

                    oscillator.start(startTime);
                    oscillator.stop(startTime + sound.duration);
                });
            } else {
                // Play single tone
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = sound.freq;
                oscillator.type = sound.type;

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + sound.duration);
            }
        } catch (e) {
            console.warn('Could not play notification sound:', e);
        }
    },

    trackHistory() {
        const history = storage.get('focusTimerHistory') || [];
        const today = new Date().toDateString();

        // Find today's entry
        let todayEntry = history.find(entry => entry.date === today);

        if (todayEntry) {
            todayEntry.sessions++;
            todayEntry.totalMinutes += this.durations.focus;
        } else {
            history.push({
                date: today,
                sessions: 1,
                totalMinutes: this.durations.focus
            });
        }

        // Keep only last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const filtered = history.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= sevenDaysAgo;
        });

        storage.set('focusTimerHistory', filtered);
    },

    showBreakSuggestion() {
        const showSuggestions = storage.get('focusTimerBreakActivities');
        if (!showSuggestions) return;

        const suggestions = [
            '🚶 Take a short walk',
            '💧 Drink some water',
            '👀 Look away from screen (20-20-20 rule)',
            '🧘 Do some stretches',
            '🌬️ Take deep breaths',
            '🪟 Step outside for fresh air',
            '☕ Make a cup of tea/coffee',
            '📱 Check your messages',
            '🎵 Listen to a song',
            '🧹 Tidy your workspace'
        ];

        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

        if (typeof utils !== 'undefined' && utils.showToast) {
            utils.showToast(`Break time! ${randomSuggestion}`, 'info', 5000);
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
