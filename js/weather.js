// Weather functionality for Sowestart - Using Free APIs

const weatherManager = {
    updateInterval: null,
    updateFrequency: 30 * 60 * 1000, // 30 minutes

    async init() {
        const enabled = storage.get('weatherEnabled');
        if (!enabled) {
            this.hideWidget();
            return;
        }

        await this.update();
        this.startAutoUpdate();
    },

    async update() {
        const location = storage.get('weatherLocation');
        const units = storage.get('weatherUnits') || 'metric';

        try {
            let coords;
            let cityName;

            if (location && location.trim()) {
                // Use specified location - geocode it
                try {
                    coords = await this.geocodeCity(location);
                    cityName = location;
                } catch (error) {
                    console.error('Failed to geocode location:', error);
                    this.showError();
                    return;
                }
            } else {
                // Auto-detect location using IP
                const ipData = await this.getLocationByIP();

                // Check if we got real data or fallback
                if (!ipData || ipData.city === 'London') {
                    console.warn('IP geolocation failed or returned fallback');
                    this.hideWidget();
                    return;
                }

                coords = { latitude: ipData.lat, longitude: ipData.lon };
                cityName = ipData.city;
                storage.set('detectedCity', cityName);
            }

            // Fetch weather from Open-Meteo (free, no API key)
            const weatherData = await this.fetchWeather(coords.latitude, coords.longitude, units);
            weatherData.cityName = cityName;

            this.displayWeather(weatherData);
            storage.set('weatherData', weatherData);
            storage.set('weatherLastUpdate', Date.now());
        } catch (error) {
            console.error('Failed to fetch weather:', error);
            this.showError();
        }
    },

    async getLocationByIP() {
        try {
            // Try multiple free IP geolocation services
            // 1. Try ipwhois.app (no rate limits, free)
            try {
                const response = await fetch('https://ipwho.is/');
                const data = await response.json();

                if (data.success && data.city && data.latitude && data.longitude) {
                    return {
                        city: data.city,
                        lat: data.latitude,
                        lon: data.longitude,
                        timezone: data.timezone?.id
                    };
                }
            } catch (e) {
                console.warn('ipwho.is failed, trying fallback...');
            }

            // 2. Try freeipapi.com
            try {
                const response = await fetch('https://freeipapi.com/api/json');
                const data = await response.json();

                if (data.cityName && data.latitude && data.longitude) {
                    return {
                        city: data.cityName,
                        lat: data.latitude,
                        lon: data.longitude,
                        timezone: data.timeZone
                    };
                }
            } catch (e) {
                console.warn('freeipapi.com failed');
            }

            throw new Error('All IP geolocation services failed');
        } catch (error) {
            console.error('IP geolocation error:', error);
            // Fallback coordinates (London)
            return { city: 'London', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' };
        }
    },

    async geocodeCity(cityName) {
        try {
            // Using Open-Meteo geocoding API (free, no key)
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                return {
                    latitude: data.results[0].latitude,
                    longitude: data.results[0].longitude
                };
            }
            throw new Error('City not found');
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    },

    async fetchWeather(lat, lon, units) {
        try {
            // Using Open-Meteo API (free, no key required)
            const tempUnit = units === 'metric' ? 'celsius' : 'fahrenheit';
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=${tempUnit}&wind_speed_unit=kmh&forecast_days=1`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Weather API request failed');

            const data = await response.json();
            return {
                temp: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code,
                humidity: data.current.relative_humidity_2m,
                windSpeed: data.current.wind_speed_10m,
                units: units
            };
        } catch (error) {
            console.error('Weather fetch error:', error);
            throw error;
        }
    },

    displayWeather(data) {
        const widget = document.getElementById('weather-widget');
        const icon = document.getElementById('weather-icon');
        const temp = document.getElementById('weather-temp');
        const desc = document.getElementById('weather-desc');

        // WMO Weather codes to emojis
        const weatherIcons = {
            0: '☀️',    // Clear sky
            1: '🌤️',   // Mainly clear
            2: '⛅',   // Partly cloudy
            3: '☁️',   // Overcast
            45: '🌫️',  // Fog
            48: '🌫️',  // Depositing rime fog
            51: '🌦️',  // Light drizzle
            53: '🌦️',  // Moderate drizzle
            55: '🌧️',  // Dense drizzle
            61: '🌧️',  // Slight rain
            63: '🌧️',  // Moderate rain
            65: '🌧️',  // Heavy rain
            71: '🌨️',  // Slight snow
            73: '🌨️',  // Moderate snow
            75: '❄️',   // Heavy snow
            77: '🌨️',  // Snow grains
            80: '🌦️',  // Slight rain showers
            81: '🌧️',  // Moderate rain showers
            82: '🌧️',  // Violent rain showers
            85: '🌨️',  // Slight snow showers
            86: '❄️',   // Heavy snow showers
            95: '⛈️',   // Thunderstorm
            96: '⛈️',   // Thunderstorm with hail
            99: '⛈️'    // Thunderstorm with heavy hail
        };

        const tempUnit = data.units === 'metric' ? '°C' : '°F';

        icon.textContent = weatherIcons[data.weatherCode] || '🌡️';
        temp.textContent = `${data.temp}${tempUnit}`;
        desc.textContent = data.cityName || '';

        widget.classList.remove('hidden');
    },

    showError() {
        const widget = document.getElementById('weather-widget');
        const icon = document.getElementById('weather-icon');
        const temp = document.getElementById('weather-temp');
        const desc = document.getElementById('weather-desc');

        icon.textContent = '⚠️';
        temp.textContent = '';
        desc.textContent = 'Unable to load weather';

        widget.classList.remove('hidden');
    },

    hideWidget() {
        const widget = document.getElementById('weather-widget');
        widget.classList.add('hidden');
    },

    startAutoUpdate() {
        if (this.updateInterval) clearInterval(this.updateInterval);

        this.updateInterval = setInterval(() => {
            this.update();
        }, this.updateFrequency);
    },

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
};
