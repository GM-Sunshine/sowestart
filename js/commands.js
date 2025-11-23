// Command Palette Manager for Sowestart

const commandPaletteManager = {
    isOpen: false,
    selectedIndex: 0,
    filteredCommands: [],
    allCommands: [],

    init() {
        this.buildCommands();
        this.attachEventListeners();
    },

    buildCommands() {
        this.allCommands = [
            // Quick Links
            ...this.getQuickLinkCommands(),

            // Settings
            {
                id: 'open-settings',
                title: 'Open Settings',
                description: 'Configure So We Start',
                icon: '⚙️',
                category: 'Settings',
                action: () => {
                    document.getElementById('settings-icon').click();
                }
            },
            {
                id: 'toggle-theme',
                title: 'Toggle Theme',
                description: 'Switch between light and dark mode',
                icon: '🌓',
                category: 'Settings',
                action: () => {
                    const currentTheme = storage.get('theme') || 'auto';
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    storage.set('theme', newTheme);
                    settingsManager.applyTheme(newTheme);
                }
            },

            // Timer Actions
            {
                id: 'start-timer',
                title: 'Start Focus Timer',
                description: 'Begin a focus session',
                icon: '▶️',
                category: 'Timer',
                action: () => {
                    if (focusTimerManager && !focusTimerManager.isRunning) {
                        focusTimerManager.start();
                    }
                }
            },
            {
                id: 'pause-timer',
                title: 'Pause Focus Timer',
                description: 'Pause the current timer',
                icon: '⏸️',
                category: 'Timer',
                action: () => {
                    if (focusTimerManager && focusTimerManager.isRunning) {
                        focusTimerManager.pause();
                    }
                }
            },
            {
                id: 'reset-timer',
                title: 'Reset Focus Timer',
                description: 'Reset timer to default duration',
                icon: '🔄',
                category: 'Timer',
                action: () => {
                    if (focusTimerManager) {
                        focusTimerManager.reset();
                    }
                }
            },

            // Widgets
            {
                id: 'toggle-notes',
                title: 'Toggle Quick Notes',
                description: 'Show/hide notes widget',
                icon: '📝',
                category: 'Widgets',
                action: () => {
                    const enabled = !storage.get('todoWidgetEnabled');
                    storage.set('todoWidgetEnabled', enabled);
                    if (todoManager) todoManager.updateVisibility();
                }
            },
            {
                id: 'toggle-timer',
                title: 'Toggle Focus Timer',
                description: 'Show/hide timer widget',
                icon: '⏱️',
                category: 'Widgets',
                action: () => {
                    const enabled = !storage.get('focusTimerEnabled');
                    storage.set('focusTimerEnabled', enabled);
                    if (focusTimerManager) focusTimerManager.updateVisibility();
                }
            },
            {
                id: 'toggle-quotes',
                title: 'Toggle Inspirational Quotes',
                description: 'Show/hide quote widget',
                icon: '💬',
                category: 'Widgets',
                action: () => {
                    const enabled = !storage.get('quotesEnabled');
                    storage.set('quotesEnabled', enabled);
                    if (quotesManager) quotesManager.updateVisibility();
                }
            },
            {
                id: 'toggle-rss',
                title: 'Toggle RSS Feed',
                description: 'Show/hide news feed widget',
                icon: '📰',
                category: 'Widgets',
                action: () => {
                    const enabled = !storage.get('rssEnabled');
                    storage.set('rssEnabled', enabled);
                    if (rssManager) rssManager.updateVisibility();
                }
            },
            {
                id: 'refresh-quote',
                title: 'New Quote',
                description: 'Load a new inspirational quote',
                icon: '🔄',
                category: 'Widgets',
                action: () => {
                    if (quotesManager) {
                        quotesManager.loadQuote(true);
                    }
                }
            },
            {
                id: 'refresh-rss',
                title: 'Refresh RSS Feeds',
                description: 'Reload all news feeds',
                icon: '🔄',
                category: 'Widgets',
                action: () => {
                    if (rssManager) {
                        rssManager.loadFeeds();
                    }
                }
            },

            // Quick Actions
            {
                id: 'add-link',
                title: 'Add Quick Link',
                description: 'Add a new website shortcut',
                icon: '➕',
                category: 'Quick Actions',
                action: () => {
                    document.getElementById('add-link-button').click();
                }
            },
            {
                id: 'export-data',
                title: 'Export Settings',
                description: 'Download settings backup',
                icon: '💾',
                category: 'Quick Actions',
                action: () => {
                    document.getElementById('export-settings').click();
                }
            },
            {
                id: 'import-data',
                title: 'Import Settings',
                description: 'Restore settings from backup',
                icon: '📥',
                category: 'Quick Actions',
                action: () => {
                    document.getElementById('import-settings').click();
                }
            }
        ];
    },

    getQuickLinkCommands() {
        const links = storage.get('quickLinks') || [];
        return links.map((link, index) => ({
            id: `link-${index}`,
            title: link.name,
            description: link.url,
            icon: '🔗',
            category: 'Quick Links',
            action: () => {
                window.location.href = link.url;
            }
        }));
    },

    attachEventListeners() {
        const palette = document.getElementById('command-palette');
        const input = document.getElementById('command-input');
        const overlay = palette.querySelector('.command-palette-overlay');
        const closeBtn = document.getElementById('close-command-palette');

        // Input change
        if (input) {
            input.addEventListener('input', (e) => {
                this.search(e.target.value);
            });

            // Keyboard navigation
            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.selectNext();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.selectPrevious();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executeSelected();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.close();
                }
            });
        }

        // Close on overlay click
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.close();
            });
        }

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }
    },

    open() {
        const palette = document.getElementById('command-palette');
        const input = document.getElementById('command-input');

        // Rebuild commands in case links changed
        this.buildCommands();

        palette.classList.remove('hidden');
        this.isOpen = true;

        // Focus input
        setTimeout(() => {
            if (input) {
                input.value = '';
                input.focus();
            }
        }, 100);

        // Show recent commands by default
        this.showRecentCommands();
    },

    close() {
        const palette = document.getElementById('command-palette');
        const input = document.getElementById('command-input');

        palette.classList.add('hidden');
        this.isOpen = false;
        this.selectedIndex = 0;
        this.filteredCommands = [];

        if (input) {
            input.value = '';
        }
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    search(query) {
        if (!query || query.trim() === '') {
            this.showRecentCommands();
            return;
        }

        // Fuzzy search
        const results = this.fuzzySearch(query.toLowerCase(), this.allCommands);
        this.filteredCommands = results;
        this.selectedIndex = 0;
        this.renderResults();
    },

    fuzzySearch(query, commands) {
        return commands
            .map(cmd => {
                const titleLower = cmd.title.toLowerCase();
                const descLower = cmd.description.toLowerCase();
                const categoryLower = cmd.category.toLowerCase();

                // Calculate score
                let score = 0;

                // Exact match bonus
                if (titleLower === query) score += 100;
                if (titleLower.includes(query)) score += 50;
                if (descLower.includes(query)) score += 25;
                if (categoryLower.includes(query)) score += 10;

                // Fuzzy match
                if (this.fuzzyMatch(query, titleLower)) score += 20;
                if (this.fuzzyMatch(query, descLower)) score += 10;

                return { ...cmd, score };
            })
            .filter(cmd => cmd.score > 0)
            .sort((a, b) => b.score - a.score);
    },

    fuzzyMatch(query, text) {
        let queryIndex = 0;
        for (let i = 0; i < text.length && queryIndex < query.length; i++) {
            if (text[i] === query[queryIndex]) {
                queryIndex++;
            }
        }
        return queryIndex === query.length;
    },

    showRecentCommands() {
        const recentIds = storage.get('recentCommands') || [];
        const recentCommands = recentIds
            .map(id => this.allCommands.find(cmd => cmd.id === id))
            .filter(cmd => cmd !== undefined)
            .slice(0, 5);

        if (recentCommands.length > 0) {
            this.filteredCommands = recentCommands.map(cmd => ({ ...cmd, recent: true }));
            this.selectedIndex = 0;
            this.renderResults();
        } else {
            // Show all commands grouped by category
            this.filteredCommands = this.allCommands;
            this.selectedIndex = 0;
            this.renderResults();
        }
    },

    renderResults() {
        const container = document.getElementById('command-results');

        if (this.filteredCommands.length === 0) {
            container.innerHTML = `
                <div class="command-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                        <line x1="11" y1="8" x2="11" y2="14"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                    <p>No commands found</p>
                </div>
            `;
            return;
        }

        // Group by category
        const grouped = this.groupByCategory(this.filteredCommands);
        let html = '';

        for (const [category, commands] of Object.entries(grouped)) {
            html += `<div class="command-group">`;
            html += `<div class="command-group-label">${category}</div>`;

            commands.forEach((cmd, index) => {
                const globalIndex = this.filteredCommands.indexOf(cmd);
                const isSelected = globalIndex === this.selectedIndex;
                const recentBadge = cmd.recent ? '<span class="command-recent-badge">Recent</span>' : '';

                html += `
                    <div class="command-item ${isSelected ? 'selected' : ''}" data-index="${globalIndex}">
                        <div class="command-icon">${cmd.icon}</div>
                        <div class="command-info">
                            <div class="command-title">${cmd.title}</div>
                            <div class="command-description">${cmd.description}</div>
                        </div>
                        ${recentBadge}
                    </div>
                `;
            });

            html += `</div>`;
        }

        container.innerHTML = html;

        // Add click listeners
        container.querySelectorAll('.command-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.selectedIndex = index;
                this.executeSelected();
            });
        });

        // Scroll selected into view
        this.scrollToSelected();
    },

    groupByCategory(commands) {
        const groups = {};
        commands.forEach(cmd => {
            if (!groups[cmd.category]) {
                groups[cmd.category] = [];
            }
            groups[cmd.category].push(cmd);
        });
        return groups;
    },

    selectNext() {
        if (this.filteredCommands.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
        this.updateSelection();
    },

    selectPrevious() {
        if (this.filteredCommands.length === 0) return;
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
        this.updateSelection();
    },

    updateSelection() {
        const container = document.getElementById('command-results');
        const items = container.querySelectorAll('.command-item');

        items.forEach((item, index) => {
            const itemIndex = parseInt(item.dataset.index);
            if (itemIndex === this.selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        this.scrollToSelected();
    },

    scrollToSelected() {
        const container = document.getElementById('command-results');
        const selected = container.querySelector('.command-item.selected');

        if (selected) {
            selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    },

    executeSelected() {
        if (this.filteredCommands.length === 0) return;

        const command = this.filteredCommands[this.selectedIndex];
        if (command && command.action) {
            // Track recent command
            this.trackRecentCommand(command.id);

            // Execute action
            command.action();

            // Close palette
            this.close();
        }
    },

    trackRecentCommand(commandId) {
        let recent = storage.get('recentCommands') || [];

        // Remove if already exists
        recent = recent.filter(id => id !== commandId);

        // Add to front
        recent.unshift(commandId);

        // Keep only last 10
        recent = recent.slice(0, 10);

        storage.set('recentCommands', recent);
    }
};
