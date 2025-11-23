// Keyboard Shortcuts Manager for Sowestart

const keyboardManager = {
    init() {
        this.attachKeyboardListeners();
    },

    attachKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            // Cmd+K or Ctrl+K: Focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }

            // Escape: Blur search or close settings
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('search-input');
                const settingsModal = document.getElementById('settings-modal');

                if (searchInput === document.activeElement) {
                    searchInput.blur();
                } else if (settingsModal && !settingsModal.classList.contains('hidden')) {
                    settingsModal.classList.add('hidden');
                }
            }

            // Cmd+/ or Ctrl+/: Quick access to settings
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                this.toggleSettings();
            }
        });
    },

    focusSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    },

    toggleSettings() {
        const settingsModal = document.getElementById('settings-modal');
        const settingsIcon = document.getElementById('settings-icon');

        if (settingsModal) {
            settingsModal.classList.toggle('hidden');
        }
    }
};
