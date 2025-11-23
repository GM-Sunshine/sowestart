// RSS Feed Manager for Sowestart

const rssManager = {
    feeds: [],
    articles: [],
    maxArticles: 10, // Max articles to display per feed
    cache: {},
    cacheExpiry: 15 * 60 * 1000, // 15 minutes

    // Use rss2json.com free tier or allorigins.win for CORS proxy
    corsProxy: 'https://api.allorigins.win/raw?url=',

    init() {
        this.loadFeeds();
        this.attachEventListeners();
        this.updateVisibility();
    },

    attachEventListeners() {
        const refreshBtn = document.getElementById('refresh-rss');
        const toggleBtn = document.getElementById('toggle-rss-widget');
        const addFeedBtn = document.getElementById('add-rss-feed-btn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshFeeds();
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleCollapse();
            });
        }

        if (addFeedBtn) {
            addFeedBtn.addEventListener('click', () => {
                this.showAddFeedPrompt();
            });
        }
    },

    loadFeeds() {
        this.feeds = storage.get('rssFeeds') || this.getDefaultFeeds();
        this.refreshFeedsWithCache();
    },

    getDefaultFeeds() {
        // Popular tech/news feeds as defaults
        return [
            { url: 'https://news.ycombinator.com/rss', name: 'Hacker News' },
            { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' }
        ];
    },

    async refreshFeedsWithCache() {
        // Check if we have cached articles
        const cached = this.getCachedArticles();
        if (cached) {
            this.articles = cached;
            this.renderArticles();
            return;
        }

        // Load fresh articles
        await this.refreshFeeds(false);
    },

    getCachedArticles() {
        const cacheKey = this.getCacheKey();
        const cached = this.cache[cacheKey];

        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.articles;
        }

        return null;
    },

    setCachedArticles(articles) {
        const cacheKey = this.getCacheKey();
        this.cache[cacheKey] = {
            articles: articles,
            timestamp: Date.now()
        };
    },

    getCacheKey() {
        // Create cache key from feed URLs
        return this.feeds.map(f => f.url).sort().join('|');
    },

    async refreshFeeds(force = true) {
        if (!this.feeds || this.feeds.length === 0) {
            this.showEmptyState();
            return;
        }

        this.articles = [];

        // Show loading state
        const container = document.getElementById('rss-feed-list');
        if (container) {
            container.innerHTML = '<div class="rss-loading">Loading feeds...</div>';
        }

        // Fetch all feeds
        const feedPromises = this.feeds.map(feed => this.fetchFeed(feed));
        const results = await Promise.allSettled(feedPromises);

        // Combine all articles
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                const feedArticles = result.value.map(article => ({
                    ...article,
                    feedName: this.feeds[index].name
                }));
                this.articles.push(...feedArticles);
            }
        });

        // Sort by date (newest first)
        this.articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Cache the articles
        if (this.articles.length > 0) {
            this.setCachedArticles([...this.articles]);
        }

        // Limit total articles
        this.articles = this.articles.slice(0, 20);

        this.renderArticles();
    },

    async fetchFeed(feed) {
        try {
            // Try direct fetch first
            const url = encodeURIComponent(feed.url);
            const response = await fetch(`${this.corsProxy}${url}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.ok}`);
            }

            const text = await response.text();
            return this.parseFeed(text);

        } catch (error) {
            console.error(`Failed to fetch feed ${feed.name}:`, error);
            return [];
        }
    },

    parseFeed(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            // Check for RSS
            let items = xmlDoc.querySelectorAll('item');

            // Check for Atom if no RSS items found
            if (items.length === 0) {
                items = xmlDoc.querySelectorAll('entry');
            }

            const articles = [];

            items.forEach((item, index) => {
                if (index >= this.maxArticles) return;

                const titleEl = item.querySelector('title');
                const linkEl = item.querySelector('link');
                const descEl = item.querySelector('description') || item.querySelector('summary');
                const pubDateEl = item.querySelector('pubDate') || item.querySelector('published') || item.querySelector('updated');

                if (titleEl && linkEl) {
                    articles.push({
                        title: titleEl.textContent,
                        link: linkEl.textContent || linkEl.getAttribute('href'),
                        description: descEl ? this.stripHtml(descEl.textContent) : '',
                        pubDate: pubDateEl ? pubDateEl.textContent : new Date().toISOString()
                    });
                }
            });

            return articles;

        } catch (error) {
            console.error('Failed to parse feed:', error);
            return [];
        }
    },

    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    },

    renderArticles() {
        const container = document.getElementById('rss-feed-list');
        const emptyState = document.getElementById('rss-empty');

        if (!container) return;

        if (this.articles.length === 0) {
            this.showEmptyState();
            return;
        }

        emptyState.classList.add('hidden');
        container.classList.remove('hidden');

        container.innerHTML = this.articles.map(article => `
            <article class="rss-article">
                <div class="rss-article-header">
                    <span class="rss-feed-name">${this.escapeHtml(article.feedName)}</span>
                    <span class="rss-article-date">${this.formatDate(article.pubDate)}</span>
                </div>
                <h4 class="rss-article-title">
                    <a href="${this.escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">
                        ${this.escapeHtml(article.title)}
                    </a>
                </h4>
                ${article.description ? `<p class="rss-article-desc">${this.truncate(this.escapeHtml(article.description), 120)}</p>` : ''}
            </article>
        `).join('');
    },

    showEmptyState() {
        const container = document.getElementById('rss-feed-list');
        const emptyState = document.getElementById('rss-empty');

        if (container) container.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    },

    truncate(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showAddFeedPrompt() {
        const feedUrl = prompt('Enter RSS feed URL:\n\nExample: https://news.ycombinator.com/rss');

        if (!feedUrl) return;

        const feedName = prompt('Enter a name for this feed:', 'News Feed');

        if (!feedName) return;

        this.addFeed(feedUrl, feedName);
    },

    addFeed(url, name) {
        if (!url || !name) return;

        this.feeds.push({ url, name });
        storage.set('rssFeeds', this.feeds);
        this.refreshFeeds();

        if (typeof utils !== 'undefined' && utils.showToast) {
            utils.showToast(`Added feed: ${name}`, 'success', 2000);
        }
    },

    toggleCollapse() {
        const container = document.getElementById('rss-container');
        const button = document.getElementById('toggle-rss-widget');
        const isCollapsed = container.classList.toggle('collapsed');

        if (isCollapsed) {
            button.style.transform = 'rotate(-90deg)';
            storage.set('rssWidgetCollapsed', true);
        } else {
            button.style.transform = 'rotate(0deg)';
            storage.set('rssWidgetCollapsed', false);
        }
    },

    updateVisibility() {
        const widget = document.getElementById('rss-widget');
        const enabled = storage.get('rssEnabled');

        if (enabled) {
            widget.classList.remove('hidden');
        } else {
            widget.classList.add('hidden');
        }

        // Check if collapsed
        const isCollapsed = storage.get('rssWidgetCollapsed');
        if (isCollapsed) {
            const container = document.getElementById('rss-container');
            const button = document.getElementById('toggle-rss-widget');
            if (container) container.classList.add('collapsed');
            if (button) button.style.transform = 'rotate(-90deg)';
        }
    }
};
