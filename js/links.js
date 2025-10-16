// Quick Links Management for Sowestart

const linksManager = {
    currentEditingIndex: null,

    init() {
        this.render();
        this.attachEventListeners();
    },

    attachEventListeners() {
        const addButton = document.getElementById('add-link-button');
        const modal = document.getElementById('link-modal');
        const form = document.getElementById('link-form');
        const cancelButton = document.getElementById('cancel-link');

        addButton.addEventListener('click', () => {
            // Open settings modal on Links tab
            const settingsModal = document.getElementById('settings-modal');
            const linksTab = document.querySelector('[data-tab="links"]');

            if (settingsModal && linksTab) {
                settingsModal.classList.remove('hidden');
                linksTab.click();
                setTimeout(() => {
                    this.initPopularSites();
                    this.initCustomLink();
                }, 100);
            }
        });

        cancelButton.addEventListener('click', () => {
            this.closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLink();
        });
    },

    render() {
        const container = document.getElementById('quick-links');
        const links = storage.get('quickLinks') || [];

        container.innerHTML = '';

        links.forEach((link, index) => {
            const linkElement = this.createLinkElement(link, index);
            container.appendChild(linkElement);
        });
    },

    createLinkElement(link, index) {
        const a = document.createElement('a');
        a.href = link.url;
        a.className = 'quick-link glass-container fade-in';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        // Create glass layers
        const glassFilter = document.createElement('div');
        glassFilter.className = 'glass-filter';

        const glassOverlay = document.createElement('div');
        glassOverlay.className = 'glass-overlay';

        const glassSpecular = document.createElement('div');
        glassSpecular.className = 'glass-specular';

        const glassContent = document.createElement('div');
        glassContent.className = 'glass-content';

        const icon = document.createElement('div');
        icon.className = 'link-icon';

        // Check if icon is emoji or URL
        if (this.isEmoji(link.icon)) {
            icon.textContent = link.icon;
        } else if (link.icon) {
            const img = document.createElement('img');
            img.src = link.icon;
            img.alt = link.name;
            img.onerror = () => {
                // Fallback to favicon
                img.src = `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`;
            };
            icon.appendChild(img);
        } else {
            // Use domain favicon as fallback
            const img = document.createElement('img');
            img.src = `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`;
            img.alt = link.name;
            icon.appendChild(img);
        }

        const name = document.createElement('span');
        name.className = 'link-name';
        name.textContent = link.name;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'link-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.deleteLink(index);
        });

        // Edit on right-click
        a.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.editLink(index);
        });

        // Assemble the structure
        glassContent.appendChild(icon);
        glassContent.appendChild(name);

        a.appendChild(glassFilter);
        a.appendChild(glassOverlay);
        a.appendChild(glassSpecular);
        a.appendChild(glassContent);
        a.appendChild(deleteBtn);

        return a;
    },

    isEmoji(str) {
        const emojiRegex = /^[\p{Emoji}\p{Emoji_Component}]+$/u;
        return emojiRegex.test(str);
    },

    openModal(editIndex = null) {
        const modal = document.getElementById('link-modal');
        const form = document.getElementById('link-form');
        const title = document.getElementById('link-modal-title');
        const nameInput = document.getElementById('link-name');
        const urlInput = document.getElementById('link-url');

        this.currentEditingIndex = editIndex;

        if (editIndex !== null) {
            const links = storage.get('quickLinks');
            const link = links[editIndex];

            title.textContent = 'Edit Quick Link';
            nameInput.value = link.name;
            urlInput.value = link.url;
        } else {
            title.textContent = 'Add Quick Link';
            form.reset();
        }

        modal.classList.remove('hidden');
        nameInput.focus();
    },

    closeModal() {
        const modal = document.getElementById('link-modal');
        modal.classList.add('hidden');
        this.currentEditingIndex = null;
    },

    saveLink() {
        const nameInput = document.getElementById('link-name');
        const urlInput = document.getElementById('link-url');

        const link = {
            name: nameInput.value.trim(),
            url: urlInput.value.trim(),
            icon: null  // Will use favicon automatically
        };

        // Validate URL
        try {
            new URL(link.url);
        } catch (e) {
            utils.showToast('Please enter a valid URL', 'error', 3000);
            return;
        }

        const links = storage.get('quickLinks') || [];

        if (this.currentEditingIndex !== null) {
            // Edit existing link
            links[this.currentEditingIndex] = link;
        } else {
            // Add new link
            links.push(link);
        }

        storage.set('quickLinks', links);
        this.render();
        this.closeModal();
    },

    editLink(index) {
        this.openModal(index);
    },

    deleteLink(index) {
        const links = storage.get('quickLinks') || [];
        const linkName = links[index]?.name || 'this link';

        utils.showConfirm(
            `Delete "${linkName}"?`,
            () => {
                links.splice(index, 1);
                storage.set('quickLinks', links);
                this.render();
                utils.showToast(`${linkName} removed`, 'success', 2500);
            }
        );
    },

    // Import browser bookmarks (Chrome API if available, else file upload)
    async importBookmarks() {
        // Check if Chrome Bookmarks API is available
        if (typeof chrome !== 'undefined' && chrome.bookmarks) {
            try {
                const bookmarkTree = await chrome.bookmarks.getTree();
                const flatBookmarks = this.flattenBookmarks(bookmarkTree);

                if (flatBookmarks.length === 0) {
                    utils.showToast('No bookmarks found', 'info', 3000);
                    return;
                }

                // Convert Chrome bookmarks to our format
                const existingLinks = storage.get('quickLinks') || [];
                let addedCount = 0;

                flatBookmarks.forEach(bookmark => {
                    if (bookmark.url && bookmark.title) {
                        // Check if bookmark already exists
                        const exists = existingLinks.some(link => link.url === bookmark.url);
                        if (!exists) {
                            existingLinks.push({
                                name: bookmark.title,
                                url: bookmark.url,
                                icon: null
                            });
                            addedCount++;
                        }
                    }
                });

                if (addedCount > 0) {
                    storage.set('quickLinks', existingLinks);
                    this.render();
                    utils.showToast(`Added ${addedCount} bookmark${addedCount > 1 ? 's' : ''} from Chrome!`, 'success', 3000);
                } else {
                    utils.showToast('All bookmarks already exist in quick links', 'info', 3000);
                }
            } catch (error) {
                console.error('Failed to import Chrome bookmarks:', error);
                utils.showToast('Failed to access Chrome bookmarks. Please check extension permissions.', 'error', 4000);
            }
        } else {
            // Fallback: File upload not available in this context
            utils.showToast('Chrome Bookmarks API not available. Use file import instead.', 'info', 3000);
        }
    },

    flattenBookmarks(bookmarkNodes, result = []) {
        for (const node of bookmarkNodes) {
            if (node.url) {
                result.push(node);
            }
            if (node.children) {
                this.flattenBookmarks(node.children, result);
            }
        }
        return result;
    },

    // Parse bookmarks from HTML file (exported from Chrome, Firefox, etc.)
    parseBookmarksHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bookmarks = [];

        // Find all bookmark links (Chrome/Firefox/Edge export format)
        const links = doc.querySelectorAll('a[href]');

        links.forEach(link => {
            const url = link.getAttribute('href');
            const name = link.textContent.trim();

            // Filter out invalid URLs and duplicates
            if (url && name && url.startsWith('http')) {
                bookmarks.push({
                    name: name,
                    url: url,
                    icon: null  // Will use favicon
                });
            }
        });

        return bookmarks;
    }
};

// Popular sites functionality
linksManager.popularSites = [
    { name: 'Google', url: 'https://google.com', icon: '🔍' },
    { name: 'YouTube', url: 'https://youtube.com', icon: '📺' },
    { name: 'Gmail', url: 'https://gmail.com', icon: '✉️' },
    { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
    { name: 'Facebook', url: 'https://facebook.com', icon: '👤' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
    { name: 'Reddit', url: 'https://reddit.com', icon: '🤖' },
    { name: 'Amazon', url: 'https://amazon.com', icon: '🛒' },
    { name: 'Netflix', url: 'https://netflix.com', icon: '🎬' },
    { name: 'Spotify', url: 'https://spotify.com', icon: '🎵' },
    { name: 'Instagram', url: 'https://instagram.com', icon: '📷' }
];

linksManager.initPopularSites = function() {
    const grid = document.getElementById('popular-sites-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.popularSites.forEach(site => {
        const button = document.createElement('button');
        button.className = 'popular-site-btn';
        button.innerHTML = `<span class="site-icon">${site.icon}</span><span class="site-name">${site.name}</span>`;
        button.onclick = () => this.addPopularSite(site);
        grid.appendChild(button);
    });
};

linksManager.addPopularSite = function(site) {
    const links = storage.get('quickLinks') || [];

    // Check if already exists
    if (links.some(link => link.url === site.url)) {
        utils.showToast(`${site.name} is already in your quick links`, 'info', 2500);
        return;
    }

    links.push({
        name: site.name,
        url: site.url,
        icon: site.icon
    });

    storage.set('quickLinks', links);
    this.render();
    utils.showToast(`${site.name} added to quick links!`, 'success', 2500);
};

// Initialize popular sites and bookmark import when settings open
document.addEventListener('DOMContentLoaded', () => {
    const settingsIcon = document.getElementById('settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            setTimeout(() => {
                linksManager.initPopularSites();
                linksManager.initBookmarkImport();
                linksManager.initCustomLink();
            }, 100);
        });
    }
});

// Initialize bookmark import button
linksManager.initBookmarkImport = function() {
    const importBtn = document.getElementById('import-bookmarks');
    const hintText = document.getElementById('import-bookmarks-hint');
    if (!importBtn) return;

    // Remove existing listener
    const newBtn = importBtn.cloneNode(true);
    importBtn.parentNode.replaceChild(newBtn, importBtn);

    // Detect if Chrome Bookmarks API is available
    const isChromeExtension = typeof chrome !== 'undefined' && chrome.bookmarks;

    if (isChromeExtension) {
        // Chrome Extension mode - use Bookmarks API
        newBtn.innerHTML = '<span>📚 Import from Chrome Bookmarks</span>';
        if (hintText) {
            hintText.textContent = 'Directly import all your Chrome bookmarks with one click';
        }

        newBtn.addEventListener('click', async () => {
            await this.importBookmarks();
        });
    } else {
        // Web mode - use file upload
        newBtn.innerHTML = '<span>📥 Import Bookmarks HTML File</span>';
        if (hintText) {
            hintText.textContent = 'Export bookmarks from your browser (Settings → Bookmarks → Export) and import them here';
        }

        // Create hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.html';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        newBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const bookmarks = this.parseBookmarksHTML(text);

                if (bookmarks.length === 0) {
                    utils.showToast('No bookmarks found in the file', 'error', 3000);
                    return;
                }

                // Add bookmarks to quick links
                const existingLinks = storage.get('quickLinks') || [];
                let addedCount = 0;

                bookmarks.forEach(bookmark => {
                    // Check if bookmark already exists
                    const exists = existingLinks.some(link => link.url === bookmark.url);
                    if (!exists) {
                        existingLinks.push(bookmark);
                        addedCount++;
                    }
                });

                if (addedCount > 0) {
                    storage.set('quickLinks', existingLinks);
                    this.render();
                    utils.showToast(`Added ${addedCount} bookmark${addedCount > 1 ? 's' : ''} to quick links!`, 'success', 3000);
                } else {
                    utils.showToast('All bookmarks already exist in quick links', 'info', 3000);
                }

                // Reset file input
                fileInput.value = '';
            } catch (error) {
                console.error('Failed to import bookmarks:', error);
                utils.showToast('Failed to import bookmarks. Please make sure it\'s a valid bookmark HTML file.', 'error', 4000);
            }
        });
    }
};

// Initialize add custom link button
linksManager.initCustomLink = function() {
    const addBtn = document.getElementById('add-custom-link');
    if (!addBtn) return;

    // Remove existing listener
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);

    newBtn.addEventListener('click', () => {
        // Close settings and open the link modal
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            settingsModal.classList.add('hidden');
        }
        linksManager.openModal();
    });
};
