// Search functionality for Sowestart

const searchManager = {
    engines: {
        google: 'https://www.google.com/search?q=%s',
        duckduckgo: 'https://duckduckgo.com/?q=%s',
        bing: 'https://www.bing.com/search?q=%s',
        yahoo: 'https://search.yahoo.com/search?p=%s',
        ecosia: 'https://www.ecosia.org/search?q=%s',
        brave: 'https://search.brave.com/search?q=%s',
        startpage: 'https://www.startpage.com/do/search?q=%s'
    },

    init() {
        const form = document.getElementById('search-form');
        const input = document.getElementById('search-input');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch(input.value.trim());
        });

        // Focus search on '/' key
        document.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                // Don't intercept if user is typing in any input/textarea
                const activeElement = document.activeElement;
                const isInputField = activeElement.tagName === 'INPUT' ||
                                   activeElement.tagName === 'TEXTAREA' ||
                                   activeElement.isContentEditable;

                // Only focus search bar if not in any input field
                if (!isInputField) {
                    e.preventDefault();
                    input.focus();
                }
            }
        });
    },

    performSearch(query) {
        if (!query) return;

        const engine = storage.get('searchEngine');
        let searchUrl;

        if (engine === 'custom') {
            searchUrl = storage.get('customSearchUrl');
            if (!searchUrl) {
                console.error('Custom search URL not set');
                return;
            }
        } else {
            searchUrl = this.engines[engine] || this.engines.google;
        }

        // Replace %s with the encoded query
        const url = searchUrl.replace('%s', encodeURIComponent(query));
        window.location.href = url;
    }
};
