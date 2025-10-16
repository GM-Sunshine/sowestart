// Utility functions for Sowestart

const utils = {
    // Time formatting
    formatTime(date, format24h = false, showSeconds = false) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        let period = '';
        if (!format24h) {
            period = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12 || 12;
        }

        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');

        if (showSeconds) {
            return `${h}:${m}:${s}${period}`;
        }
        return `${h}:${m}${period}`;
    },

    // Date formatting
    formatDate(date, lang = 'en') {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString(lang, options);
    },

    // Get time of day for greeting
    getTimeOfDay() {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    },

    // Get greeting text based on time
    getGreeting(timeOfDay, lang = 'en') {
        const greetings = {
            en: {
                morning: 'Good morning',
                afternoon: 'Good afternoon',
                evening: 'Good evening',
                night: 'Good night'
            },
            fr: {
                morning: 'Bonjour',
                afternoon: 'Bon après-midi',
                evening: 'Bonsoir',
                night: 'Bonne nuit'
            },
            es: {
                morning: 'Buenos días',
                afternoon: 'Buenas tardes',
                evening: 'Buenas tardes',
                night: 'Buenas noches'
            },
            de: {
                morning: 'Guten Morgen',
                afternoon: 'Guten Tag',
                evening: 'Guten Abend',
                night: 'Gute Nacht'
            },
            it: {
                morning: 'Buongiorno',
                afternoon: 'Buon pomeriggio',
                evening: 'Buonasera',
                night: 'Buonanotte'
            },
            pt: {
                morning: 'Bom dia',
                afternoon: 'Boa tarde',
                evening: 'Boa tarde',
                night: 'Boa noite'
            }
        };

        return greetings[lang]?.[timeOfDay] || greetings.en[timeOfDay];
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Check if user prefers dark mode
    prefersDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    // Generate random number in range
    randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Fetch with timeout
    async fetchWithTimeout(url, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    },

    // Set favicon
    setFavicon(emoji) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.font = '24px serif';
        ctx.fillText(emoji, 4, 24);

        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = canvas.toDataURL();
        document.head.appendChild(link);
    },

    // Reset favicon to default
    resetFavicon() {
        const link = document.querySelector("link[rel*='icon']");
        if (link) {
            link.remove();
        }
        // Browser will use default favicon.ico
    },

    // Load Google Font
    loadGoogleFont(fontName) {
        if (fontName === 'system') return;

        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
};

// Toast notification system
utils.showToast = function(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">×</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const remove = () => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', remove);

    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(remove, duration);
    }
};

// Toast notification system
utils.showToast = function(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    const icon = icons[type] || icons.info;
    toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-message">' + message + '</span><button class="toast-close">×</button>';

    const closeBtn = toast.querySelector('.toast-close');
    const remove = () => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', remove);

    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(remove, duration);
    }
};


// Modern confirmation dialog
utils.showConfirm = function(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog glass-container';

    dialog.innerHTML = `
        <div class="glass-filter"></div>
        <div class="glass-overlay"></div>
        <div class="glass-specular"></div>
        <div class="glass-content">
            <div class="confirm-content">
                <div class="confirm-icon">⚠</div>
                <p class="confirm-message">${message}</p>
                <div class="confirm-actions">
                    <button class="confirm-cancel btn-secondary">Cancel</button>
                    <button class="confirm-ok btn-danger">Delete</button>
                </div>
            </div>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add('active'), 10);

    const remove = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };

    const cancelBtn = dialog.querySelector('.confirm-cancel');
    const okBtn = dialog.querySelector('.confirm-ok');

    cancelBtn.addEventListener('click', () => {
        remove();
        if (onCancel) onCancel();
    });

    okBtn.addEventListener('click', () => {
        remove();
        if (onConfirm) onConfirm();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            remove();
            if (onCancel) onCancel();
        }
    });
};
