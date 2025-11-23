// Settings Panel Management for Sowestart

const settingsManager = {
    init() {
        this.attachEventListeners();
        this.loadSettings();
    },

    attachEventListeners() {
        // Modal toggle
        const settingsIcon = document.getElementById('settings-icon');
        const closeButton = document.getElementById('close-settings');
        const modal = document.getElementById('settings-modal');
        const overlay = modal?.querySelector('.settings-modal-overlay');

        console.log('Settings Manager: Initializing...', { settingsIcon, modal, overlay });

        if (settingsIcon && modal) {
            settingsIcon.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Settings icon clicked');
                modal.classList.toggle('hidden');
            });
        }

        if (closeButton && modal) {
            closeButton.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }

        // Close on overlay click
        if (overlay && modal) {
            overlay.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });

        // Tab switching
        const tabs = document.querySelectorAll('.settings-tab');
        const tabContents = document.querySelectorAll('.settings-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active content
                tabContents.forEach(content => {
                    if (content.dataset.content === targetTab) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });

                // Initialize links tab features when links tab is opened
                if (targetTab === 'links' && typeof linksManager !== 'undefined') {
                    setTimeout(() => {
                        linksManager.initPopularSites();
                        linksManager.initCustomLink();
                        linksManager.initBookmarkImport();
                    }, 50);
                }
            });
        });

        // General settings
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                storage.set('language', e.target.value);
                i18n.setLanguage(e.target.value);
            });
        }

        const greetingNameInput = document.getElementById('greeting-name-input');
        if (greetingNameInput) {
            greetingNameInput.addEventListener('input', utils.debounce((e) => {
                storage.set('userName', e.target.value);
                const greetingName = document.getElementById('greeting-name');
                if (greetingName) {
                    greetingName.textContent = e.target.value || 'Friend';
                }
            }, 300));
        }

        // Appearance settings
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                storage.set('theme', e.target.value);
                this.applyTheme(e.target.value);
            });
        }

        const fontSelect = document.getElementById('font-select');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                storage.set('font', e.target.value);
                this.applyFont(e.target.value);
            });
        }

        const accentColorPicker = document.getElementById('accent-color');
        if (accentColorPicker) {
            accentColorPicker.addEventListener('change', (e) => {
                storage.set('accentColor', e.target.value);
                this.applyAccentColor(e.target.value);
            });
        }

        const resetAccentColor = document.getElementById('reset-accent-color');
        if (resetAccentColor) {
            resetAccentColor.addEventListener('click', () => {
                const defaultColor = '#667eea';
                storage.set('accentColor', defaultColor);
                document.getElementById('accent-color').value = defaultColor;
                this.applyAccentColor(defaultColor);
            });
        }

        const faviconToggle = document.getElementById('favicon-emoji-toggle');
        if (faviconToggle) {
            faviconToggle.addEventListener('change', (e) => {
                storage.set('useFaviconEmoji', e.target.checked);
                if (e.target.checked) {
                    const emoji = storage.get('faviconEmoji');
                    utils.setFavicon(emoji);
                } else {
                    // Reset to default favicon
                    utils.resetFavicon();
                }
            });
        }

        const emojiInput = document.getElementById('emoji-input');
        if (emojiInput) {
            emojiInput.addEventListener('input', utils.debounce((e) => {
                storage.set('faviconEmoji', e.target.value);
                if (storage.get('useFaviconEmoji')) {
                    utils.setFavicon(e.target.value);
                }
            }, 300));
        }

        // Background settings
        const bgTypeSelect = document.getElementById('background-type');
        if (bgTypeSelect) {
            bgTypeSelect.addEventListener('change', (e) => {
                storage.set('backgroundType', e.target.value);
                this.toggleBackgroundOptions(e.target.value);
                backgroundManager.init();
            });
        }

        const artSearch = document.getElementById('art-search');
        if (artSearch) {
            artSearch.addEventListener('input', utils.debounce((e) => {
                storage.set('artSearch', e.target.value);
                if (storage.get('backgroundType') === 'artinstitute') {
                    backgroundManager.init();
                }
            }, 1000));
        }

        const sourcesplashSearch = document.getElementById('sourcesplash-search');
        if (sourcesplashSearch) {
            sourcesplashSearch.addEventListener('input', utils.debounce((e) => {
                storage.set('sourcesplashSearch', e.target.value);
                if (storage.get('backgroundType') === 'sourcesplash') {
                    backgroundManager.init();
                }
            }, 1000));
        }

        const customBgUrl = document.getElementById('custom-bg-url');
        if (customBgUrl) {
            customBgUrl.addEventListener('input', utils.debounce((e) => {
                storage.set('customBackgroundUrl', e.target.value);
                if (storage.get('backgroundType') === 'custom') {
                    backgroundManager.init();
                }
            }, 1000));
        }

        const bgColor = document.getElementById('bg-color');
        if (bgColor) {
            bgColor.addEventListener('change', (e) => {
                storage.set('backgroundColor', e.target.value);
                if (storage.get('backgroundType') === 'color') {
                    backgroundManager.init();
                }
            });
        }

        // Clock settings
        const clockType = document.getElementById('clock-type');
        if (clockType) {
            clockType.addEventListener('change', (e) => {
                storage.set('clockType', e.target.value);
                clockManager.switchClock(e.target.value);
            });
        }

        const showSecondsToggle = document.getElementById('show-seconds-toggle');
        if (showSecondsToggle) {
            showSecondsToggle.addEventListener('change', (e) => {
                storage.set('showSeconds', e.target.checked);
            });
        }

        const hour24Toggle = document.getElementById('24hour-toggle');
        if (hour24Toggle) {
            hour24Toggle.addEventListener('change', (e) => {
                storage.set('use24Hour', e.target.checked);
            });
        }

        // Quotes widget settings
        const quotesToggle = document.getElementById('quotes-toggle');
        if (quotesToggle) {
            quotesToggle.addEventListener('change', (e) => {
                storage.set('quotesEnabled', e.target.checked);
                quotesManager.updateVisibility();
                this.toggleQuoteCategory(e.target.checked);
            });
        }

        const quoteCategory = document.getElementById('quote-category');
        if (quoteCategory) {
            quoteCategory.addEventListener('change', (e) => {
                storage.set('quoteCategory', e.target.value);
                quotesManager.loadQuote(true);
            });
        }

        // Focus timer settings
        const focusTimerToggle = document.getElementById('focus-timer-toggle');
        if (focusTimerToggle) {
            focusTimerToggle.addEventListener('change', (e) => {
                storage.set('focusTimerEnabled', e.target.checked);
                focusTimerManager.updateVisibility();
                this.toggleFocusTimerSettings(e.target.checked);
            });
        }

        const timerFocusDuration = document.getElementById('timer-focus-duration');
        const timerShortBreakDuration = document.getElementById('timer-short-break-duration');
        const timerLongBreakDuration = document.getElementById('timer-long-break-duration');

        if (timerFocusDuration) {
            timerFocusDuration.addEventListener('change', (e) => {
                const durations = storage.get('focusTimerCustomDurations') || {};
                durations.focus = parseInt(e.target.value) || 25;
                storage.set('focusTimerCustomDurations', durations);
                focusTimerManager.loadDurations();
            });
        }

        if (timerShortBreakDuration) {
            timerShortBreakDuration.addEventListener('change', (e) => {
                const durations = storage.get('focusTimerCustomDurations') || {};
                durations.shortBreak = parseInt(e.target.value) || 5;
                storage.set('focusTimerCustomDurations', durations);
                focusTimerManager.loadDurations();
            });
        }

        if (timerLongBreakDuration) {
            timerLongBreakDuration.addEventListener('change', (e) => {
                const durations = storage.get('focusTimerCustomDurations') || {};
                durations.longBreak = parseInt(e.target.value) || 15;
                storage.set('focusTimerCustomDurations', durations);
                focusTimerManager.loadDurations();
            });
        }

        const timerSound = document.getElementById('timer-sound');
        if (timerSound) {
            timerSound.addEventListener('change', (e) => {
                storage.set('focusTimerSound', e.target.value);
                // Play preview
                if (e.target.value !== 'none') {
                    focusTimerManager.playSound(e.target.value);
                }
            });
        }

        const timerAutoStart = document.getElementById('timer-auto-start');
        if (timerAutoStart) {
            timerAutoStart.addEventListener('change', (e) => {
                storage.set('focusTimerAutoStart', e.target.checked);
            });
        }

        const timerBreakActivities = document.getElementById('timer-break-activities');
        if (timerBreakActivities) {
            timerBreakActivities.addEventListener('change', (e) => {
                storage.set('focusTimerBreakActivities', e.target.checked);
            });
        }

        // Todo widget settings
        const todoWidgetToggle = document.getElementById('todo-widget-toggle');
        if (todoWidgetToggle) {
            todoWidgetToggle.addEventListener('change', (e) => {
                storage.set('todoWidgetEnabled', e.target.checked);
                todoManager.updateVisibility();
            });
        }

        // RSS widget settings
        const rssWidgetToggle = document.getElementById('rss-widget-toggle');
        if (rssWidgetToggle) {
            rssWidgetToggle.addEventListener('change', (e) => {
                storage.set('rssEnabled', e.target.checked);
                rssManager.updateVisibility();
            });
        }

        // Calendar widget settings
        const calendarWidgetToggle = document.getElementById('calendar-widget-toggle');
        if (calendarWidgetToggle) {
            calendarWidgetToggle.addEventListener('change', (e) => {
                const isEnabled = e.target.checked;
                storage.set('calendarEnabled', isEnabled);
                this.toggleCalendarSettings(isEnabled);
                if (typeof calendarManager !== 'undefined') {
                    calendarManager.updateVisibility();
                }
            });
        }

        // Calendar feed management
        const addCalendarFeedBtn = document.getElementById('add-calendar-feed');
        if (addCalendarFeedBtn) {
            addCalendarFeedBtn.addEventListener('click', () => {
                this.addCalendarFeed();
            });
        }

        // Weather settings
        const weatherToggle = document.getElementById('weather-toggle');
        if (weatherToggle) {
            weatherToggle.addEventListener('change', (e) => {
                storage.set('weatherEnabled', e.target.checked);
                weatherManager.init();
            });
        }

        const weatherLocation = document.getElementById('weather-location');
        if (weatherLocation) {
            weatherLocation.addEventListener('input', utils.debounce((e) => {
                storage.set('weatherLocation', e.target.value);
            }, 500));
        }

        const weatherUnits = document.getElementById('weather-units');
        if (weatherUnits) {
            weatherUnits.addEventListener('change', (e) => {
                storage.set('weatherUnits', e.target.value);
                weatherManager.update();
            });
        }

        // Search settings
        const searchEngine = document.getElementById('search-engine');
        if (searchEngine) {
            searchEngine.addEventListener('change', (e) => {
                storage.set('searchEngine', e.target.value);
                this.toggleCustomSearch(e.target.value);
            });
        }

        const customSearchUrl = document.getElementById('custom-search-url');
        if (customSearchUrl) {
            customSearchUrl.addEventListener('input', utils.debounce((e) => {
                storage.set('customSearchUrl', e.target.value);
            }, 500));
        }

        // Custom CSS
        const customCss = document.getElementById('custom-css');
        if (customCss) {
            customCss.addEventListener('input', utils.debounce((e) => {
                storage.set('customCSS', e.target.value);
                this.applyCustomCSS(e.target.value);
            }, 1000));
        }

        // Data management
        const exportSettings = document.getElementById('export-settings');
        if (exportSettings) {
            exportSettings.addEventListener('click', () => {
                storage.export();
            });
        }

        const importSettings = document.getElementById('import-settings');
        const importFileInput = document.getElementById('import-file-input');
        if (importSettings && importFileInput) {
            importSettings.addEventListener('click', () => {
                importFileInput.click();
            });

            importFileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        await storage.import(file);
                        utils.showToast('Settings imported successfully! Reloading...', 'success', 1500);
                        setTimeout(() => location.reload(), 1500);
                    } catch (error) {
                        utils.showToast('Failed to import settings: ' + error.message, 'error', 4000);
                    }
                }
            });
        }

        const resetSettings = document.getElementById('reset-settings');
        if (resetSettings) {
            resetSettings.addEventListener('click', () => {
                utils.showConfirm(
                    'Reset all settings to default? This cannot be undone.',
                    () => {
                        storage.reset();
                        utils.showToast('Settings reset! Reloading...', 'success', 1500);
                        setTimeout(() => location.reload(), 1500);
                    }
                );
            });
        }
    },

    loadSettings() {
        const settings = storage.getAll();

        // General
        document.getElementById('language-select').value = settings.language;
        document.getElementById('greeting-name-input').value = settings.userName;

        // Appearance
        document.getElementById('theme-select').value = settings.theme;
        document.getElementById('accent-color').value = settings.accentColor || '#667eea';
        document.getElementById('font-select').value = settings.font;
        document.getElementById('favicon-emoji-toggle').checked = settings.useFaviconEmoji;
        document.getElementById('emoji-input').value = settings.faviconEmoji;

        // Background
        document.getElementById('background-type').value = settings.backgroundType || 'picsum';
        const customBgUrl = document.getElementById('custom-bg-url');
        const bgColor = document.getElementById('bg-color');
        const sourcesplashSearch = document.getElementById('sourcesplash-search');
        if (customBgUrl) customBgUrl.value = settings.customBackgroundUrl || '';
        if (bgColor) bgColor.value = settings.backgroundColor || '#1a1a1a';
        if (sourcesplashSearch) sourcesplashSearch.value = settings.sourcesplashSearch || '';
        this.toggleBackgroundOptions(settings.backgroundType || 'picsum');

        // Clock
        document.getElementById('clock-type').value = settings.clockType || 'digital';
        document.getElementById('show-seconds-toggle').checked = settings.showSeconds || false;
        document.getElementById('24hour-toggle').checked = settings.use24Hour || false;

        // Quotes
        document.getElementById('quotes-toggle').checked = settings.quotesEnabled || false;
        document.getElementById('quote-category').value = settings.quoteCategory || 'all';
        this.toggleQuoteCategory(settings.quotesEnabled || false);

        // Focus timer
        document.getElementById('focus-timer-toggle').checked = settings.focusTimerEnabled || false;
        const customDurations = settings.focusTimerCustomDurations || { focus: 25, shortBreak: 5, longBreak: 15 };
        document.getElementById('timer-focus-duration').value = customDurations.focus || 25;
        document.getElementById('timer-short-break-duration').value = customDurations.shortBreak || 5;
        document.getElementById('timer-long-break-duration').value = customDurations.longBreak || 15;
        document.getElementById('timer-sound').value = settings.focusTimerSound || 'bell';
        document.getElementById('timer-auto-start').checked = settings.focusTimerAutoStart || false;
        document.getElementById('timer-break-activities').checked = settings.focusTimerBreakActivities !== false;
        this.toggleFocusTimerSettings(settings.focusTimerEnabled || false);

        // Todo widget
        document.getElementById('todo-widget-toggle').checked = settings.todoWidgetEnabled || false;

        // RSS widget
        document.getElementById('rss-widget-toggle').checked = settings.rssEnabled || false;

        // Calendar widget
        document.getElementById('calendar-widget-toggle').checked = settings.calendarEnabled || false;
        this.toggleCalendarSettings(settings.calendarEnabled || false);

        // Weather
        document.getElementById('weather-toggle').checked = settings.weatherEnabled || false;
        document.getElementById('weather-location').value = settings.weatherLocation || '';
        document.getElementById('weather-units').value = settings.weatherUnits || 'metric';

        // Search
        document.getElementById('search-engine').value = settings.searchEngine;
        document.getElementById('custom-search-url').value = settings.customSearchUrl;
        this.toggleCustomSearch(settings.searchEngine);

        // Custom CSS (removed from UI, but keep support for existing users)
        const customCss = document.getElementById('custom-css');
        if (customCss && settings.customCSS) {
            customCss.value = settings.customCSS;
        }

        // Apply settings
        this.applyTheme(settings.theme);
        this.applyAccentColor(settings.accentColor || '#667eea');
        this.applyFont(settings.font);
        if (settings.customCSS) {
            this.applyCustomCSS(settings.customCSS);
        }

        if (settings.useFaviconEmoji) {
            utils.setFavicon(settings.faviconEmoji);
        }
    },

    toggleBackgroundOptions(type) {
        const picsumItem = document.getElementById('picsum-item');
        const pexelsItem = document.getElementById('pexels-item');
        const sourcesplashItem = document.getElementById('sourcesplash-item');
        const artItem = document.getElementById('artinstitute-item');
        const customItem = document.getElementById('custom-bg-item');
        const colorItem = document.getElementById('bg-color-item');

        // Hide all
        picsumItem?.classList.add('hidden');
        pexelsItem?.classList.add('hidden');
        sourcesplashItem?.classList.add('hidden');
        artItem?.classList.add('hidden');
        customItem?.classList.add('hidden');
        colorItem?.classList.add('hidden');

        // Show relevant option
        if (type === 'picsum') {
            picsumItem?.classList.remove('hidden');
        } else if (type === 'pexels') {
            pexelsItem?.classList.remove('hidden');
        } else if (type === 'sourcesplash') {
            sourcesplashItem?.classList.remove('hidden');
        } else if (type === 'artinstitute') {
            artItem?.classList.remove('hidden');
        } else if (type === 'custom') {
            customItem?.classList.remove('hidden');
        } else if (type === 'color') {
            colorItem?.classList.remove('hidden');
        }
    },

    toggleCustomSearch(engine) {
        const customItem = document.getElementById('custom-search-item');
        if (engine === 'custom') {
            customItem.classList.remove('hidden');
        } else {
            customItem.classList.add('hidden');
        }
    },

    toggleQuoteCategory(enabled) {
        const categoryItem = document.getElementById('quote-category-item');
        if (enabled) {
            categoryItem.classList.remove('hidden');
        } else {
            categoryItem.classList.add('hidden');
        }
    },

    toggleFocusTimerSettings(enabled) {
        const settingsItem = document.getElementById('focus-timer-settings');
        if (enabled) {
            settingsItem.classList.remove('hidden');
        } else {
            settingsItem.classList.add('hidden');
        }
    },

    applyTheme(theme) {
        const html = document.documentElement;
        const body = document.body;

        if (theme === 'auto') {
            if (utils.prefersDarkMode()) {
                html.classList.remove('theme-light');
                html.classList.add('theme-dark');
                body.classList.remove('theme-light');
                body.classList.add('theme-dark');
            } else {
                html.classList.remove('theme-dark');
                html.classList.add('theme-light');
                body.classList.remove('theme-dark');
                body.classList.add('theme-light');
            }
        } else if (theme === 'dark') {
            html.classList.remove('theme-light');
            html.classList.add('theme-dark');
            body.classList.remove('theme-light');
            body.classList.add('theme-dark');
        } else {
            html.classList.remove('theme-dark');
            html.classList.add('theme-light');
            body.classList.remove('theme-dark');
            body.classList.add('theme-light');
        }
    },

    applyAccentColor(color) {
        document.documentElement.style.setProperty('--accent-color', color);

        // Calculate lighter version for hover
        const rgb = this.hexToRgb(color);
        if (rgb) {
            const lighter = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
            document.documentElement.style.setProperty('--accent-hover', lighter);
        }
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    applyFont(font) {
        if (font === 'system') {
            document.body.style.fontFamily = '';
        } else {
            utils.loadGoogleFont(font);
            document.body.style.fontFamily = `"${font}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        }
    },

    applyCustomCSS(css) {
        let styleElement = document.getElementById('custom-styles');

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'custom-styles';
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = css;
    },

    toggleCalendarSettings(enabled) {
        const settingsItem = document.getElementById('calendar-settings');
        if (enabled) {
            settingsItem.classList.remove('hidden');
            this.renderCalendarFeeds();
        } else {
            settingsItem.classList.add('hidden');
        }
    },

    renderCalendarFeeds() {
        const feedsList = document.getElementById('calendar-feeds-list');
        if (!feedsList) return;

        const feeds = storage.get('calendarFeeds') || [];

        if (feeds.length === 0) {
            feedsList.innerHTML = '<p style="color: var(--text-tertiary); font-size: 0.875rem; margin: 0.5rem 0;">No calendar feeds added yet</p>';
            return;
        }

        feedsList.innerHTML = feeds.map((feed, index) => `
            <div class="calendar-feed-item">
                <div class="calendar-feed-info">
                    <div class="calendar-feed-name">${this.escapeHtml(feed.name)}</div>
                    <div class="calendar-feed-url">${this.escapeHtml(feed.url)}</div>
                </div>
                <div class="calendar-feed-actions">
                    <button onclick="settingsManager.removeCalendarFeed(${index})" class="delete-feed" title="Remove feed">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    },

    addCalendarFeed() {
        const name = prompt('Enter calendar name (e.g., "Work Calendar", "Personal"):');
        if (!name || name.trim() === '') return;

        const url = prompt('Enter iCal/ICS feed URL:\n\nFor Google Calendar:\n1. Go to calendar settings\n2. Find "Integrate calendar"\n3. Copy the "Secret address in iCal format"\n\nFor Outlook:\n1. Right-click your calendar\n2. Select "Calendar permissions"\n3. Copy the ICS link');

        if (!url || url.trim() === '') return;

        // Validate URL format
        const urlTrimmed = url.trim();
        if (!urlTrimmed.startsWith('http://') && !urlTrimmed.startsWith('https://') && !urlTrimmed.startsWith('webcal://')) {
            alert('Please enter a valid URL starting with http://, https://, or webcal://');
            return;
        }

        // Check if URL looks like a calendar feed
        const isLikelyCalendarFeed = urlTrimmed.includes('.ics') ||
                                      urlTrimmed.includes('calendar') ||
                                      urlTrimmed.includes('ical') ||
                                      urlTrimmed.includes('webcal');

        if (!isLikelyCalendarFeed) {
            const proceed = confirm('This URL doesn\'t look like a calendar feed (should contain .ics or "calendar"). Add it anyway?');
            if (!proceed) return;
        }

        // Convert webcal:// to https://
        const normalizedUrl = urlTrimmed.replace(/^webcal:\/\//i, 'https://');

        // Check for duplicates
        const feeds = storage.get('calendarFeeds') || [];
        if (feeds.some(f => f.url === normalizedUrl)) {
            alert('This calendar feed is already added!');
            return;
        }

        feeds.push({
            name: name.trim(),
            url: normalizedUrl
        });

        storage.set('calendarFeeds', feeds);
        this.renderCalendarFeeds();

        // Refresh calendar
        if (typeof calendarManager !== 'undefined') {
            calendarManager.refreshFeeds();
        }

        if (typeof utils !== 'undefined' && utils.showToast) {
            utils.showToast('Calendar feed added successfully!', 'success');
        }
    },

    removeCalendarFeed(index) {
        if (!confirm('Remove this calendar feed?')) return;

        const feeds = storage.get('calendarFeeds') || [];
        feeds.splice(index, 1);
        storage.set('calendarFeeds', feeds);

        this.renderCalendarFeeds();

        // Refresh calendar
        if (typeof calendarManager !== 'undefined') {
            calendarManager.refreshFeeds();
        }

        if (typeof utils !== 'undefined' && utils.showToast) {
            utils.showToast('Calendar feed removed', 'info');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
