// Background Service Worker for Sowestart
// Chrome extension manifest v3

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Sowestart installed successfully!');

        // Set default settings on first install
        chrome.storage.local.get(null, (items) => {
            if (Object.keys(items).length === 0) {
                // No settings found, set defaults
                const defaults = {
                    language: 'en',
                    userName: 'Friend',
                    theme: 'auto',
                    font: 'system',
                    faviconEmoji: '🌅',
                    useFaviconEmoji: true,
                    backgroundType: 'dynamic',
                    clockType: 'digital',
                    weatherEnabled: false
                };

                chrome.storage.local.set({ 'sowestart-settings': JSON.stringify(defaults) });
            }
        });
    } else if (details.reason === 'update') {
        console.log('Sowestart updated to version', chrome.runtime.getManifest().version);
    }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.local.get('sowestart-settings', (result) => {
            sendResponse(result);
        });
        return true; // Indicates async response
    }

    if (request.action === 'saveSettings') {
        chrome.storage.local.set({ 'sowestart-settings': JSON.stringify(request.settings) }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

// refreshing weather data or background images
chrome.alarms.create('dailyRefresh', {
    delayInMinutes: 1,
    periodInMinutes: 1440 // Once per day
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyRefresh') {
        // Clear cached background for new day
        chrome.storage.local.get('sowestart-settings', (result) => {
            if (result['sowestart-settings']) {
                const settings = JSON.parse(result['sowestart-settings']);
                if (settings.currentBackground) {
                    delete settings.currentBackground;
                    chrome.storage.local.set({ 'sowestart-settings': JSON.stringify(settings) });
                }
            }
        });
    }
});
