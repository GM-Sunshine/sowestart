// Clock functionality for Sowestart

const clockManager = {
    interval: null,

    init() {
        const clockType = storage.get('clockType');
        this.updateDisplay();
        this.switchClock(clockType);
        this.startClock();
    },

    startClock() {
        // Clear any existing interval
        if (this.interval) clearInterval(this.interval);

        // Update every second
        this.interval = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    },

    updateDisplay() {
        const clockType = storage.get('clockType');
        const now = new Date();

        if (clockType === 'digital') {
            this.updateDigitalClock(now);
        } else if (clockType === 'analog') {
            this.updateAnalogClock(now);
        }
    },

    updateDigitalClock(date) {
        const timeDisplay = document.getElementById('time-display');
        const dateDisplay = document.getElementById('date-display');
        const use24Hour = storage.get('use24Hour');
        const showSeconds = storage.get('showSeconds');
        const language = storage.get('language');

        timeDisplay.textContent = utils.formatTime(date, use24Hour, showSeconds);
        dateDisplay.textContent = utils.formatDate(date, language);
    },

    updateAnalogClock(date) {
        const hours = date.getHours() % 12;
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // Calculate angles (0 degrees is at 12 o'clock)
        const secondAngle = (seconds * 6); // 360 / 60
        const minuteAngle = (minutes * 6) + (seconds * 0.1); // 360 / 60 + smooth transition
        const hourAngle = (hours * 30) + (minutes * 0.5); // 360 / 12 + smooth transition

        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        const secondHand = document.getElementById('second-hand');

        if (hourHand) hourHand.setAttribute('transform', `rotate(${hourAngle} 100 100)`);
        if (minuteHand) minuteHand.setAttribute('transform', `rotate(${minuteAngle} 100 100)`);
        if (secondHand) {
            const showSeconds = storage.get('showSeconds');
            secondHand.style.display = showSeconds ? 'block' : 'none';
            secondHand.setAttribute('transform', `rotate(${secondAngle} 100 100)`);
        }
    },

    switchClock(type) {
        const digitalClock = document.getElementById('digital-clock');
        const analogClock = document.getElementById('analog-clock');

        switch (type) {
            case 'digital':
                digitalClock.classList.remove('hidden');
                analogClock.classList.add('hidden');
                break;
            case 'analog':
                digitalClock.classList.add('hidden');
                analogClock.classList.remove('hidden');
                break;
            case 'none':
                digitalClock.classList.add('hidden');
                analogClock.classList.add('hidden');
                break;
        }
    },

    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
};
