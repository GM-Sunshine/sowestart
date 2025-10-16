# So We Start - Chrome Extension

A beautiful new tab page with liquid glass design, quick links, weather, and customizable backgrounds.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🌅 **Liquid Glass Design** - Modern glassmorphism UI with smooth animations
- 🔗 **Quick Links** - Add your favorite sites with automatic favicons
- 🌤️ **Weather Widget** - Real-time weather with auto-location
- 🎨 **Custom Backgrounds** - Picsum Photos, Art Institute of Chicago, or your own images
- ⏰ **Clock** - Digital or analog with 12/24 hour format
- 🔍 **Quick Search** - Search with multiple engines (Google, DuckDuckGo, etc.)
- 📚 **Bookmark Import** - Import directly from Chrome or upload HTML file
- 🎭 **Themes** - Light, dark, or auto mode
- 💾 **Data Export/Import** - Backup and restore your settings

## Installation

### As Chrome Extension

1. **Clone or download** this repository
2. **Add icons** to the `icons/` folder (see icons/README.md)
3. Open Chrome and go to `chrome://extensions/`
4. Enable **Developer mode** (toggle in top-right)
5. Click **Load unpacked**
6. Select the `sowestart` folder
7. The extension will now be installed!

### As Web Page (Demo)

Simply open `index.html` in your browser to preview the demo version.

**Note:** Some features work differently in demo mode:
- Bookmark import uses file upload instead of Chrome API
- Settings stored in localStorage instead of chrome.storage

## Building

No build process required! This is a pure HTML/CSS/JS extension.

### File Structure

```
sowestart/
├── manifest.json          # Chrome extension manifest
├── index.html            # Main page
├── css/
│   └── style.css        # All styles
├── js/
│   ├── app.js           # Main app initialization
│   ├── background.js    # Background image management
│   ├── clock.js         # Clock functionality
│   ├── weather.js       # Weather widget
│   ├── search.js        # Search functionality
│   ├── links.js         # Quick links management
│   ├── settings.js      # Settings panel
│   ├── storage.js       # Storage management
│   ├── utils.js         # Utility functions
│   └── i18n.js          # Internationalization
└── icons/               # Extension icons (16, 32, 48, 128px)
```

## Configuration

### Manifest Permissions

The extension requests these permissions:
- `storage` - Save user settings and quick links
- `bookmarks` - Import bookmarks from Chrome

### Content Security Policy

The extension uses a strict CSP that allows:
- Self-hosted scripts and styles
- Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
- Inline styles (required for dynamic styling)

## Development

### Testing Locally

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the **Reload** button on the extension card
4. Open a new tab to see your changes

### Debug Mode

Open DevTools (F12) to see console logs and errors.

## APIs Used

### Free APIs (No API Key Required)
- **Picsum Photos** - Random photos
- **Art Institute of Chicago** - Artwork images
- **Open-Meteo** - Weather data
- **ipwho.is** - IP-based geolocation

### Browser APIs
- Chrome Storage API
- Chrome Bookmarks API (extension mode only)
- Geolocation API (with user permission)

## Customization

### Adding More Search Engines

Edit `js/search.js` and add to the `engines` object:

```javascript
engines: {
    google: 'https://www.google.com/search?q=%s',
    myengine: 'https://example.com/search?q=%s'
}
```

### Adding More Popular Sites

Edit `js/links.js` and add to the `popularSites` array:

```javascript
popularSites: [
    { name: 'MyApp', url: 'https://myapp.com', icon: '🚀' }
]
```

## Browser Compatibility

- ✅ Chrome (v88+)
- ✅ Edge (v88+)
- ✅ Brave
- ❌ Firefox (@todo: manifest v3 support required)
- ❌ Safari (@todo: extension format differs)

## Credits

Created with ❤️ by [GM Sunshine](https://gm-sunshine.com/)

## License

MIT License - Feel free to use and modify!

## Support

For issues or feature requests, please visit the GitHub repository.

---

**Version:** 1.0.0  
**Last Updated:** 2025
