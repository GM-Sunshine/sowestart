// Background Management for Sowestart

const backgroundManager = {
    currentImageUrl: null,
    
    // Curated collection IDs for different moods/times
    collections: {
        morning: '3330445',   // Sunrise and morning scenes
        afternoon: '1065976', // Bright daylight
        evening: '2823814',   // Sunset and golden hour
        night: '1590691'      // Night sky and stars
    },

    async init() {
        const bgType = storage.get('backgroundType') || 'picsum';

        switch (bgType) {
            case 'picsum':
                await this.loadPicsumBackground();
                break;
            case 'artinstitute':
                await this.loadArtInstituteBackground();
                break;
            case 'pexels':
                await this.loadPexelsBackground();
                break;
            case 'custom':
                this.loadCustomBackground();
                break;
            case 'color':
                this.loadSolidColor();
                break;
            default:
                await this.loadPicsumBackground();
        }
    },

    async loadPicsumBackground() {
        const cached = storage.get('currentBackground');
        const today = new Date().toDateString();

        if (cached && cached.date === today && cached.url && cached.type === 'picsum') {
            this.setBackground(cached.url);
            return;
        }

        try {
            const width = Math.min(window.screen.width * window.devicePixelRatio, 2560);
            const height = Math.min(window.screen.height * window.devicePixelRatio, 1440);

            // Get random image from Picsum - use smaller page range (API has limited pages)
            const page = Math.floor(Math.random() * 30) + 1; // Pages 1-30
            const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=30`);

            if (!response.ok) {
                throw new Error('Picsum API request failed');
            }

            const data = await response.json();

            if (data && data.length > 0) {
                // Pick random image from the list
                const randomImage = data[Math.floor(Math.random() * data.length)];
                const imageUrl = `https://picsum.photos/id/${randomImage.id}/${width}/${height}`;
                this.setBackground(imageUrl);
                storage.set('currentBackground', { url: imageUrl, date: today, type: 'picsum' });
            } else {
                // Fallback to direct random image
                const randomId = Math.floor(Math.random() * 1000);
                const imageUrl = `https://picsum.photos/id/${randomId}/${width}/${height}`;
                this.setBackground(imageUrl);
                storage.set('currentBackground', { url: imageUrl, date: today, type: 'picsum' });
            }
        } catch (error) {
            console.error('Failed to load Picsum background:', error);
            this.loadFallbackBackground();
        }
    },

    async loadPexelsBackground() {
        // Pexels requires API key - fallback to alternative
        console.warn('Pexels requires API key, using alternative...');
        // Use Pixabay or another service instead
        await this.loadPixabayBackground();
    },

    async loadPixabayBackground() {
        const cached = storage.get('currentBackground');
        const today = new Date().toDateString();

        if (cached && cached.date === today && cached.url && cached.type === 'pixabay') {
            this.setBackground(cached.url);
            return;
        }

        try {
            // Use Lorem Picsum as fallback (no API key needed)
            const width = Math.min(window.screen.width * window.devicePixelRatio, 2560);
            const height = Math.min(window.screen.height * window.devicePixelRatio, 1440);

            // Use direct Picsum random with seed for daily consistency
            const seed = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;

            this.setBackground(imageUrl);
            storage.set('currentBackground', { url: imageUrl, date: today, type: 'pixabay' });
        } catch (error) {
            console.error('Failed to load background:', error);
            this.loadFallbackBackground();
        }
    },

    async loadArtInstituteBackground() {
        const cached = storage.get('currentBackground');
        const today = new Date().toDateString();

        if (cached && cached.date === today && cached.url && cached.type === 'artinstitute') {
            this.setBackground(cached.url);
            return;
        }

        try {
            const query = storage.get('artSearch') || 'landscape';
            const response = await fetch(`https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&query[term][is_public_domain]=true&fields=id,title,image_id&limit=100`);
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                // Pick random artwork with valid image_id
                const artworks = data.data.filter(art => art.image_id);
                if (artworks.length === 0) throw new Error('No artworks with images found');

                const artwork = artworks[Math.floor(Math.random() * artworks.length)];
                const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/1686,/0/default.jpg`;

                this.setBackground(imageUrl);
                storage.set('currentBackground', { url: imageUrl, date: today, type: 'artinstitute' });
            } else {
                throw new Error('No artworks found');
            }
        } catch (error) {
            console.error('Failed to load Art Institute background:', error);
            this.loadFallbackBackground();
        }
    },

    loadCustomBackground() {
        const url = storage.get('customBackgroundUrl');
        if (url) {
            this.setBackground(url);
        } else {
            this.loadFallbackBackground();
        }
    },

    loadSolidColor() {
        const color = storage.get('backgroundColor');
        const bgImage = document.getElementById('background-image');
        const overlay = document.getElementById('background-overlay');

        bgImage.style.display = 'none';
        overlay.style.background = color;
    },

    setBackground(url) {
        const bgImage = document.getElementById('background-image');
        const overlay = document.getElementById('background-overlay');

        // Preload image
        const img = new Image();
        img.onload = () => {
            bgImage.src = url;
            bgImage.style.display = 'block';
            bgImage.style.opacity = '1';
            overlay.style.background = 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%)';
        };
        img.src = url;
        this.currentImageUrl = url;
    },

    loadFallbackBackground() {
        // Beautiful gradient fallback
        const overlay = document.getElementById('background-overlay');
        const bgImage = document.getElementById('background-image');

        bgImage.style.display = 'none';

        const timeOfDay = utils.getTimeOfDay();
        const gradients = {
            morning: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            afternoon: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            evening: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            night: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
        };

        overlay.style.background = gradients[timeOfDay];
    }
};
