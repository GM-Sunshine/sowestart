// Local Storage Management for Sowestart

const storage = {
    // Default settings
    defaults: {
        // General
        language: 'en',
        userName: 'Friend',

        // Appearance
        theme: 'auto',
        font: 'system',
        faviconEmoji: '🌅',
        useFaviconEmoji: true,

        // Background
        backgroundType: 'dynamic',
        unsplashCollection: '',
        customBackgroundUrl: '',
        backgroundColor: '#1a1a1a',
        currentBackground: null,

        // Clock
        clockType: 'digital',
        showSeconds: false,
        use24Hour: false,

        // Weather
        weatherEnabled: false,
        weatherApiKey: '',
        weatherLocation: '',
        weatherUnits: 'metric',
        weatherData: null,
        weatherLastUpdate: null,

        // Search
        searchEngine: 'google',
        customSearchUrl: '',

        // Links
        quickLinks: [],

        // Custom
        customCSS: ''
    },

    // Get all settings
    getAll() {
        const stored = localStorage.getItem('sowestart-settings');
        if (stored) {
            try {
                return { ...this.defaults, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Failed to parse settings:', e);
                return { ...this.defaults };
            }
        }
        return { ...this.defaults };
    },

    // Get single setting
    get(key) {
        const settings = this.getAll();
        return settings[key] !== undefined ? settings[key] : this.defaults[key];
    },

    // Set single or multiple settings
    set(keyOrObject, value) {
        const settings = this.getAll();

        if (typeof keyOrObject === 'object') {
            Object.assign(settings, keyOrObject);
        } else {
            settings[keyOrObject] = value;
        }

        localStorage.setItem('sowestart-settings', JSON.stringify(settings));
        return settings;
    },

    // Reset to defaults
    reset() {
        localStorage.removeItem('sowestart-settings');
        return { ...this.defaults };
    },

    // Export settings as JSON
    export() {
        const settings = this.getAll();
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `sowestart-settings-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    },

    // Import settings from JSON
    async import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    localStorage.setItem('sowestart-settings', JSON.stringify(settings));
                    resolve(settings);
                } catch (error) {
                    reject(new Error('Invalid settings file'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
};
