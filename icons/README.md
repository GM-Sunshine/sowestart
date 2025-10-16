# Icons Directory

This directory should contain the extension icons in PNG format:

- `icon-16.png` - 16x16 pixels (toolbar icon)
- `icon-32.png` - 32x32 pixels (Windows computers)
- `icon-48.png` - 48x48 pixels (extension management page)
- `icon-128.png` - 128x128 pixels (Chrome Web Store & installation)

## Quick Setup - Using the Icon Generator

**EASIEST METHOD:**

1. Open `generate-icons.html` in your browser
2. Click "Generate All Icons"
3. Download each icon or click "Download All as ZIP"
4. Save the PNG files in this `icons/` folder
5. Done! The extension will now have proper icons

## Alternative Methods

### Method 1: Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `logo.svg` from the parent directory
3. Set width/height to 16, 32, 48, 128 (one at a time)
4. Download and rename to `icon-16.png`, etc.

### Method 2: ImageMagick (Command Line)
```bash
convert logo.svg -resize 16x16 icon-16.png
convert logo.svg -resize 32x32 icon-32.png
convert logo.svg -resize 48x48 icon-48.png
convert logo.svg -resize 128x128 icon-128.png
```

### Method 3: Design Tool
1. Open `logo.svg` in Figma, Photoshop, or Illustrator
2. Export as PNG at each size: 16x16, 32x32, 48x48, 128x128
3. Save with proper filenames

## Logo Design

The logo features:
- **Sunrise theme** 🌅 - Representing "So We Start"
- **Liquid glass aesthetic** - Gradient background with transparency
- **Cyan/orange gradient** - Brand colors
- **Clean, modern look** - Works at all sizes
