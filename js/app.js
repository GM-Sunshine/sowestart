// Main Application for Sowestart

class SowestartApp {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Initialize all components
            await this.initializeComponents();

            // Set up greeting
            this.setupGreeting();

            // Listen for system theme changes
            this.listenForThemeChanges();

            // Mark as initialized
            this.initialized = true;

            console.log('Sowestart initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Sowestart:', error);
        }
    }

    async initializeComponents() {
        // Initialize i18n first
        i18n.init();

        // Initialize background (may take time to load)
        backgroundManager.init().catch(err => {
            console.warn('Background initialization failed:', err);
        });

        // Initialize clock
        clockManager.init();

        // Initialize weather (async)
        weatherManager.init().catch(err => {
            console.warn('Weather initialization failed:', err);
        });

        // Initialize search
        searchManager.init();

        // Initialize links
        linksManager.init();

        // Initialize todo widget
        todoManager.init();

        // Initialize keyboard shortcuts
        keyboardManager.init();

        // Initialize settings panel
        settingsManager.init();
    }

    setupGreeting() {
        const greetingText = document.getElementById('greeting-text');
        const greetingName = document.getElementById('greeting-name');

        // Set initial greeting
        const timeOfDay = utils.getTimeOfDay();
        const language = storage.get('language');
        const userName = storage.get('userName');

        greetingText.textContent = utils.getGreeting(timeOfDay, language);
        greetingName.textContent = userName;

        // Update greeting every minute
        setInterval(() => {
            const newTimeOfDay = utils.getTimeOfDay();
            if (newTimeOfDay !== timeOfDay) {
                greetingText.textContent = utils.getGreeting(newTimeOfDay, language);
            }
        }, 60000);

        // Handle name editing
        greetingName.addEventListener('blur', (e) => {
            const newName = e.target.textContent.trim();
            if (newName) {
                storage.set('userName', newName);
            } else {
                e.target.textContent = storage.get('userName');
            }
        });

        greetingName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                greetingName.blur();
            }
        });
    }

    listenForThemeChanges() {
        const theme = storage.get('theme');
        if (theme !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (storage.get('theme') === 'auto') {
                settingsManager.applyTheme('auto');
            }
        });
    }

    // Cleanup on unload
    destroy() {
        clockManager.destroy();
        weatherManager.destroy();
        this.initialized = false;
    }
}

// Initialize app when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new SowestartApp();
        app.init();
    });
} else {
    app = new SowestartApp();
    app.init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.destroy();
    }
});
