// Calendar Manager for Sowestart

const calendarManager = {
    feeds: [],
    events: [],
    isLoading: false,

    init() {
        this.loadFeeds();
        this.attachEventListeners();
        this.updateVisibility();
        this.loadEvents();
    },

    loadFeeds() {
        this.feeds = storage.get('calendarFeeds') || [];
    },

    attachEventListeners() {
        const refreshBtn = document.getElementById('refresh-calendar');
        const toggleBtn = document.getElementById('toggle-calendar-widget');
        const addFeedBtn = document.getElementById('add-calendar-feed-btn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadEvents();
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleCollapse();
            });
        }

        if (addFeedBtn) {
            addFeedBtn.addEventListener('click', () => {
                // Open settings and focus on calendar section
                const settingsModal = document.getElementById('settings-modal');
                if (settingsModal) {
                    settingsModal.classList.remove('hidden');
                    // Switch to Personal tab where calendar settings are
                    const personalTab = document.querySelector('[data-tab="personal"]');
                    if (personalTab) personalTab.click();
                }
            });
        }
    },

    async loadEvents() {
        if (this.feeds.length === 0) {
            this.showEmptyState();
            return;
        }

        this.showLoadingState();
        this.events = [];

        // Fetch all feeds in parallel
        const fetchPromises = this.feeds.map(feed => this.fetchFeed(feed));
        const results = await Promise.allSettled(fetchPromises);

        // Collect all events from successful fetches
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                this.events.push(...result.value);
            } else if (result.status === 'rejected') {
                console.error(`Failed to fetch feed ${this.feeds[index].name}:`, result.reason);
            }
        });

        // Sort events by date
        this.events.sort((a, b) => a.start - b.start);

        this.renderEvents();
    },

    async fetchFeed(feed) {
        try {
            // Use AllOrigins CORS proxy
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const icalData = await response.text();
            return this.parseICalendar(icalData, feed.name);
        } catch (error) {
            console.error(`Error fetching calendar feed ${feed.name}:`, error);
            return [];
        }
    },

    parseICalendar(icalData, feedName) {
        const events = [];
        const lines = icalData.split(/\r\n|\n|\r/);
        let currentEvent = null;
        let currentField = null;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            // Handle line folding (continuation lines start with space or tab)
            while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
                line += lines[++i].trim();
            }

            if (line === 'BEGIN:VEVENT') {
                currentEvent = { feedName };
            } else if (line === 'END:VEVENT' && currentEvent) {
                // Only include events that have at least a summary and start time
                if (currentEvent.summary && currentEvent.start) {
                    events.push(currentEvent);
                }
                currentEvent = null;
            } else if (currentEvent) {
                const colonIndex = line.indexOf(':');
                const semicolonIndex = line.indexOf(';');
                let fieldName, fieldValue, params = {};

                if (semicolonIndex !== -1 && semicolonIndex < colonIndex) {
                    // Field has parameters
                    fieldName = line.substring(0, semicolonIndex);
                    const paramsStr = line.substring(semicolonIndex + 1, colonIndex);
                    fieldValue = line.substring(colonIndex + 1);

                    // Parse parameters
                    paramsStr.split(';').forEach(param => {
                        const [key, value] = param.split('=');
                        if (key && value) {
                            params[key] = value;
                        }
                    });
                } else if (colonIndex !== -1) {
                    fieldName = line.substring(0, colonIndex);
                    fieldValue = line.substring(colonIndex + 1);
                }

                if (!fieldName) continue;

                switch (fieldName) {
                    case 'SUMMARY':
                        currentEvent.summary = this.unescapeText(fieldValue);
                        break;
                    case 'DESCRIPTION':
                        currentEvent.description = this.unescapeText(fieldValue);
                        break;
                    case 'LOCATION':
                        currentEvent.location = this.unescapeText(fieldValue);
                        break;
                    case 'DTSTART':
                        currentEvent.start = this.parseDateTime(fieldValue, params);
                        currentEvent.isAllDay = params.VALUE === 'DATE';
                        break;
                    case 'DTEND':
                        currentEvent.end = this.parseDateTime(fieldValue, params);
                        break;
                    case 'UID':
                        currentEvent.uid = fieldValue;
                        break;
                    case 'URL':
                        currentEvent.url = fieldValue;
                        break;
                }
            }
        }

        return events;
    },

    parseDateTime(dateTimeStr, params = {}) {
        // Remove timezone identifier if present
        const cleanStr = dateTimeStr.replace(/;TZID=.*?:/, '');

        // Check if it's a date-only value (all-day event)
        if (params.VALUE === 'DATE' || cleanStr.length === 8) {
            // Format: YYYYMMDD
            const year = parseInt(cleanStr.substring(0, 4));
            const month = parseInt(cleanStr.substring(4, 6)) - 1;
            const day = parseInt(cleanStr.substring(6, 8));
            return new Date(year, month, day);
        }

        // Format: YYYYMMDDTHHmmss or YYYYMMDDTHHmmssZ
        const year = parseInt(cleanStr.substring(0, 4));
        const month = parseInt(cleanStr.substring(4, 6)) - 1;
        const day = parseInt(cleanStr.substring(6, 8));
        const hour = parseInt(cleanStr.substring(9, 11));
        const minute = parseInt(cleanStr.substring(11, 13));
        const second = parseInt(cleanStr.substring(13, 15));

        if (cleanStr.endsWith('Z')) {
            // UTC time
            return new Date(Date.UTC(year, month, day, hour, minute, second));
        } else {
            // Local time
            return new Date(year, month, day, hour, minute, second);
        }
    },

    unescapeText(text) {
        if (!text) return '';
        return text
            .replace(/\\n/g, '\n')
            .replace(/\\,/g, ',')
            .replace(/\\;/g, ';')
            .replace(/\\\\/g, '\\');
    },

    renderEvents() {
        const todayContainer = document.getElementById('calendar-today');
        const todayEventsList = document.getElementById('calendar-today-events');
        const upcomingEventsList = document.getElementById('calendar-upcoming-events');
        const emptyState = document.getElementById('calendar-empty');

        if (this.events.length === 0) {
            this.showEmptyState();
            return;
        }

        // Hide empty state, show containers
        emptyState.classList.add('hidden');

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Filter events
        const todayEvents = this.events.filter(event => {
            return event.start >= today && event.start < tomorrow;
        });

        const upcomingEvents = this.events.filter(event => {
            return event.start >= tomorrow && event.start < nextWeek;
        }).slice(0, 10); // Limit to 10 upcoming events

        // Render today's events
        if (todayEvents.length > 0) {
            todayContainer.classList.remove('hidden');
            todayEventsList.innerHTML = todayEvents.map(event => this.renderEvent(event)).join('');
        } else {
            todayContainer.classList.add('hidden');
        }

        // Render upcoming events
        if (upcomingEvents.length > 0) {
            upcomingEventsList.innerHTML = upcomingEvents.map(event => this.renderEvent(event)).join('');
        } else {
            upcomingEventsList.innerHTML = '<p style="color: var(--text-tertiary); font-size: 0.875rem; margin: 1rem 0;">No upcoming events this week</p>';
        }
    },

    renderEvent(event) {
        const timeStr = this.formatEventTime(event);
        const locationStr = event.location ? `
            <div class="event-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${this.escapeHtml(event.location)}
            </div>
        ` : '';

        const descriptionStr = event.description ? `
            <div class="event-description">${this.escapeHtml(event.description)}</div>
        ` : '';

        const allDayBadge = event.isAllDay ? '<span class="event-all-day">All Day</span>' : '';

        return `
            <div class="calendar-event" ${event.url ? `onclick="window.open('${this.escapeHtml(event.url)}', '_blank')"` : ''}>
                <div class="event-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${timeStr}${allDayBadge}
                </div>
                <div class="event-title">${this.escapeHtml(event.summary)}</div>
                ${locationStr}
                ${descriptionStr}
            </div>
        `;
    },

    formatEventTime(event) {
        if (event.isAllDay) {
            return event.start.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }

        const startTime = event.start.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        if (event.end) {
            const endTime = event.end.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            return `${startTime} - ${endTime}`;
        }

        return startTime;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showLoadingState() {
        const container = document.getElementById('calendar-container');
        const emptyState = document.getElementById('calendar-empty');

        emptyState.classList.add('hidden');
        container.innerHTML = '<div class="calendar-loading">Loading events...</div>';
        this.isLoading = true;
    },

    showEmptyState() {
        const todayContainer = document.getElementById('calendar-today');
        const upcomingEventsList = document.getElementById('calendar-upcoming-events');
        const emptyState = document.getElementById('calendar-empty');

        todayContainer.classList.add('hidden');
        upcomingEventsList.innerHTML = '';
        emptyState.classList.remove('hidden');
        this.isLoading = false;
    },

    toggleCollapse() {
        const container = document.getElementById('calendar-container');
        const button = document.getElementById('toggle-calendar-widget');
        const isCollapsed = container.classList.toggle('collapsed');

        if (isCollapsed) {
            button.style.transform = 'rotate(-90deg)';
            storage.set('calendarCollapsed', true);
        } else {
            button.style.transform = 'rotate(0deg)';
            storage.set('calendarCollapsed', false);
        }
    },

    updateVisibility() {
        const widget = document.getElementById('calendar-widget');
        const enabled = storage.get('calendarEnabled');

        if (enabled) {
            widget.classList.remove('hidden');
        } else {
            widget.classList.add('hidden');
        }

        // Check if collapsed
        const isCollapsed = storage.get('calendarCollapsed');
        if (isCollapsed) {
            const container = document.getElementById('calendar-container');
            const button = document.getElementById('toggle-calendar-widget');
            container.classList.add('collapsed');
            button.style.transform = 'rotate(-90deg)';
        }
    },

    // Called from settings when feeds are updated
    refreshFeeds() {
        this.loadFeeds();
        this.loadEvents();
    }
};
