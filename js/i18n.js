// Internationalization for Sowestart

const i18n = {
    translations: {
        en: {
            good_morning: 'Good morning',
            good_afternoon: 'Good afternoon',
            good_evening: 'Good evening',
            good_night: 'Good night',
            enter_name: 'Enter your name',
            search_placeholder: 'Search the web...',
            settings: 'Settings',
            general: 'General',
            appearance: 'Appearance',
            background: 'Background',
            clock: 'Clock',
            weather: 'Weather',
            search: 'Search',
            quick_links: 'Quick Links',
            data: 'Data',
            language: 'Language',
            your_name: 'Your Name',
            theme: 'Theme',
            auto: 'Auto',
            light: 'Light',
            dark: 'Dark',
            font: 'Font',
            system_default: 'System Default',
            emoji_favicon: 'Use Emoji as Favicon',
            emoji: 'Emoji',
            background_type: 'Background Type',
            dynamic: 'Dynamic (Unsplash)',
            custom_image: 'Custom Image',
            solid_color: 'Solid Color',
            unsplash_collection: 'Unsplash Collection ID',
            custom_image_url: 'Custom Image URL',
            background_color: 'Background Color',
            clock_type: 'Clock Type',
            digital: 'Digital',
            analog: 'Analog',
            none: 'None',
            show_seconds: 'Show Seconds',
            hour_format: '24-hour Format',
            enable_weather: 'Enable Weather',
            weather_api_key: 'OpenWeather API Key',
            get_api_key: 'Get free API key',
            location: 'Location',
            auto_detect: 'Auto-detect',
            units: 'Units',
            celsius: 'Celsius',
            fahrenheit: 'Fahrenheit',
            search_engine: 'Search Engine',
            custom: 'Custom',
            custom_search_url: 'Custom Search URL',
            query_placeholder: 'Use %s as query placeholder',
            custom_styles: 'Custom Styles',
            custom_css: 'Custom CSS',
            css_placeholder: '/* Your custom CSS here */',
            export_settings: 'Export Settings',
            import_settings: 'Import Settings',
            reset_default: 'Reset to Default',
            add_link: 'Add Quick Link',
            edit_link: 'Edit Quick Link',
            link_name: 'Name',
            link_url: 'URL',
            link_icon: 'Icon (emoji or URL)',
            cancel: 'Cancel',
            save: 'Save',
            delete_confirm: 'Delete this link?',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
            sunday: 'Sunday'
        },
        // Add more languages as needed
        fr: {
            good_morning: 'Bonjour',
            good_afternoon: 'Bon après-midi',
            good_evening: 'Bonsoir',
            good_night: 'Bonne nuit',
            enter_name: 'Entrez votre nom',
            search_placeholder: 'Rechercher sur le web...',
            settings: 'Paramètres'
            // ... more translations
        },
        es: {
            good_morning: 'Buenos días',
            good_afternoon: 'Buenas tardes',
            good_evening: 'Buenas tardes',
            good_night: 'Buenas noches',
            enter_name: 'Ingresa tu nombre',
            search_placeholder: 'Buscar en la web...',
            settings: 'Configuración'
            // ... more translations
        }
    },

    currentLang: 'en',

    init() {
        this.currentLang = storage.get('language') || 'en';
    },

    t(key) {
        const lang = this.translations[this.currentLang];
        return lang?.[key] || this.translations.en[key] || key;
    },

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            storage.set('language', lang);
            this.updateUI();
        }
    },

    updateUI() {
        // Update greeting
        const timeOfDay = utils.getTimeOfDay();
        const greetingText = document.getElementById('greeting-text');
        if (greetingText) {
            greetingText.textContent = utils.getGreeting(timeOfDay, this.currentLang);
        }

        // Update placeholders and labels
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = this.t('search_placeholder');
        }

        // Update other UI elements as needed
        // This would be expanded for full i18n support
    }
};
