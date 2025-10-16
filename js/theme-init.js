// Apply theme immediately to prevent flash
(function() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    let themeClass = 'theme-light';

    if (savedTheme === 'auto') {
        themeClass = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light';
    } else if (savedTheme === 'dark') {
        themeClass = 'theme-dark';
    }

    document.documentElement.classList.add(themeClass);
})();
