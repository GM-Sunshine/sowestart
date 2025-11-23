// Inspirational Quotes Manager for Sowestart

const quotesManager = {
    currentQuote: null,
    apiEndpoint: 'https://api.quotable.io',

    // Quote categories/tags
    categories: {
        all: '',
        motivational: 'inspirational',
        wisdom: 'wisdom',
        success: 'success',
        life: 'life',
        happiness: 'happiness',
        friendship: 'friendship',
        love: 'love'
    },

    init() {
        this.attachEventListeners();
        this.loadQuote();
        this.updateVisibility();
    },

    attachEventListeners() {
        const refreshBtn = document.getElementById('refresh-quote');
        const copyBtn = document.getElementById('copy-quote');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadQuote(true);
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyQuote();
            });
        }
    },

    async loadQuote(forceNew = false) {
        // Check for cached quote
        if (!forceNew) {
            const cached = storage.get('currentQuote');
            const today = new Date().toDateString();
            const lastDate = storage.get('quoteDate');

            if (cached && lastDate === today) {
                this.displayQuote(cached);
                return;
            }
        }

        // Fetch new quote
        try {
            const category = storage.get('quoteCategory') || 'all';
            const tag = this.categories[category];

            let url = `${this.apiEndpoint}/random`;
            if (tag) {
                url += `?tags=${tag}`;
            }

            // Add max length to avoid very long quotes
            url += tag ? '&maxLength=150' : '?maxLength=150';

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch quote');
            }

            const data = await response.json();

            const quote = {
                text: data.content,
                author: data.author,
                tags: data.tags || []
            };

            this.currentQuote = quote;
            this.displayQuote(quote);

            // Cache the quote
            const today = new Date().toDateString();
            storage.set('currentQuote', quote);
            storage.set('quoteDate', today);

        } catch (error) {
            console.error('Failed to load quote:', error);
            this.displayFallbackQuote();
        }
    },

    displayQuote(quote) {
        const textEl = document.getElementById('quote-text');
        const authorEl = document.getElementById('quote-author');

        if (textEl) {
            // Add fade-out animation
            textEl.style.opacity = '0';

            setTimeout(() => {
                textEl.textContent = quote.text;
                textEl.style.opacity = '1';
            }, 200);
        }

        if (authorEl) {
            setTimeout(() => {
                authorEl.textContent = `— ${quote.author}`;
                authorEl.style.opacity = '1';
            }, 300);
        }

        this.currentQuote = quote;
    },

    displayFallbackQuote() {
        const fallbackQuotes = [
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill"
            },
            {
                text: "Believe you can and you're halfway there.",
                author: "Theodore Roosevelt"
            },
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt"
            },
            {
                text: "It is during our darkest moments that we must focus to see the light.",
                author: "Aristotle"
            }
        ];

        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        this.displayQuote(randomQuote);
    },

    copyQuote() {
        if (!this.currentQuote) return;

        const text = `"${this.currentQuote.text}" — ${this.currentQuote.author}`;

        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showCopyFeedback();
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    },

    fallbackCopy(text) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            this.showCopyFeedback();
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }

        document.body.removeChild(textarea);
    },

    showCopyFeedback() {
        const copyBtn = document.getElementById('copy-quote');
        if (!copyBtn) return;

        const originalHTML = copyBtn.innerHTML;

        // Show checkmark
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        copyBtn.style.color = 'var(--accent-color)';

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.color = '';
        }, 2000);

        // Show toast notification if available
        if (typeof utils !== 'undefined' && utils.showToast) {
            utils.showToast('Quote copied to clipboard!', 'success', 2000);
        }
    },

    updateVisibility() {
        const widget = document.getElementById('quote-widget');
        const enabled = storage.get('quotesEnabled');

        if (enabled) {
            widget.classList.remove('hidden');
        } else {
            widget.classList.add('hidden');
        }
    }
};
