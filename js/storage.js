// Storage Management for Sowestart
// Supports both chrome.storage.sync (for cross-device sync) and localStorage (fallback)

const storage = {
    // Check if Chrome storage API is available
    get useChromeStorage() {
        return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;
    },

    // Storage key
    storageKey: 'sowestart-settings',

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

        // Todo widget
        todoWidgetEnabled: false,
        todoWidgetCollapsed: false,
        todos: [],

        // Focus timer
        focusTimerEnabled: false,
        focusTimerCollapsed: false,
        focusTimerSessions: 0,
        focusTimerDate: null,

        // Quotes
        quotesEnabled: false,
        quoteCategory: 'all',
        currentQuote: null,
        quoteDate: null,

        // RSS Feed
        rssEnabled: false,
        rssFeeds: null, // Will use getDefaultFeeds() from rssManager if null
        rssWidgetCollapsed: false,

        // Custom
        customCSS: ''
    },

    // Get all settings (async to support chrome.storage.sync)
    async getAllAsync() {
        if (this.useChromeStorage) {
            return new Promise((resolve) => {
                chrome.storage.sync.get([this.storageKey], (result) => {
                    if (chrome.runtime.lastError) {
                        console.warn('Chrome storage error, falling back to localStorage:', chrome.runtime.lastError);
                        resolve(this.getAllFromLocalStorage());
                    } else {
                        const stored = result[this.storageKey] || {};
                        resolve({ ...this.defaults, ...stored });
                    }
                });
            });
        }
        return this.getAllFromLocalStorage();
    },

    // Synchronous fallback (uses localStorage)
    getAll() {
        return this.getAllFromLocalStorage();
    },

    getAllFromLocalStorage() {
        const stored = localStorage.getItem(this.storageKey);
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

        // Save to localStorage first (synchronous, for immediate use)
        localStorage.setItem(this.storageKey, JSON.stringify(settings));

        // Also save to chrome.storage.sync if available (async, for cross-device sync)
        if (this.useChromeStorage) {
            const dataToSync = { [this.storageKey]: settings };
            chrome.storage.sync.set(dataToSync, () => {
                if (chrome.runtime.lastError) {
                    console.warn('Failed to sync to Chrome storage:', chrome.runtime.lastError);
                }
            });
        }

        return settings;
    },

    // Reset to defaults
    reset() {
        localStorage.removeItem(this.storageKey);

        // Also clear chrome.storage.sync if available
        if (this.useChromeStorage) {
            chrome.storage.sync.remove([this.storageKey], () => {
                if (chrome.runtime.lastError) {
                    console.warn('Failed to clear Chrome storage:', chrome.runtime.lastError);
                }
            });
        }

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

                    // Save to localStorage
                    localStorage.setItem(this.storageKey, JSON.stringify(settings));

                    // Also save to chrome.storage.sync if available
                    if (this.useChromeStorage) {
                        const dataToSync = { [this.storageKey]: settings };
                        chrome.storage.sync.set(dataToSync, () => {
                            if (chrome.runtime.lastError) {
                                console.warn('Failed to sync imported settings:', chrome.runtime.lastError);
                            }
                        });
                    }

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
