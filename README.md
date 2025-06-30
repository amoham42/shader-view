# Shadertoy New Tab Chrome Extension

Transform your new tab into a mesmerizing showcase of random Shadertoy shaders! This Chrome extension replaces your default new tab page with beautiful, animated WebGL shaders fetched from Shadertoy.

## ✨ Features

- **Random Shader Display**: Shows a different random shader every time you open a new tab
- **Modern UI**: Clean, dark-themed interface with smooth animations
- **Shader Information**: Displays shader title, author, and link to original Shadertoy page
- **Manual Refresh**: Click "New Shader" to load a different random shader
- **Auto-Refresh**: Optional automatic shader rotation (configurable interval)
- **Settings Modal**: Easy configuration of API key and preferences
- **Responsive Design**: Works on all screen sizes

## 🚀 Setup Instructions

### 1. Get a Shadertoy API Key

1. Visit [Shadertoy API Apps](https://www.shadertoy.com/myapps)
2. Sign in to your Shadertoy account (create one if needed)
3. Create a new application to get your API key
4. Copy the API key for later use

### 2. Install the Extension

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your extensions list

### 3. Configure the Extension

1. Click on the extension icon in your toolbar (or open a new tab)
2. Click the "Settings" button
3. Paste your Shadertoy API key
4. Optionally set an auto-refresh interval
5. Click "Save Settings"

### 4. Enjoy!

Open a new tab and watch beautiful shaders come to life! Click "New Shader" anytime to load a different one.

## 📁 File Structure

```
extension/
├── manifest.json       # Extension configuration
├── newtab.html        # New tab page HTML
├── newtab.css         # Styling for the new tab page
├── newtab.js          # Main JavaScript functionality
├── popup.html         # Extension popup interface
├── README.md          # This file
└── icons/             # Extension icons (add your own)
    ├── icon16.png     # 16x16 icon
    ├── icon48.png     # 48x48 icon
    └── icon128.png    # 128x128 icon
```

## 🛠️ Technical Details

### Technologies Used
- **WebGL**: For rendering Shadertoy shaders
- **Chrome Extensions API**: For new tab override
- **Shadertoy API**: For fetching shader data
- **Modern CSS**: Gradients, backdrop filters, animations
- **ES6+ JavaScript**: Classes, async/await, modules

### How It Works
1. Extension overrides Chrome's new tab page
2. JavaScript fetches random shader list from Shadertoy API
3. Selects a random shader and fetches its code
4. Preprocesses Shadertoy shader code for WebGL compatibility
5. Compiles and renders the shader in real-time
6. Provides UI controls for user interaction

### Shader Preprocessing
The extension automatically converts Shadertoy shader code to be compatible with standard WebGL:
- Replaces `iResolution` with `u_resolution`
- Replaces `iTime` with `u_time`
- Replaces `mainImage()` function with `main()`
- Adds necessary uniform declarations
- Handles precision qualifiers

## 🎨 Adding Icons

To complete the extension, add icon files to the `icons/` directory:
- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extensions page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

You can create these icons using any image editor. Consider using shader-themed designs or geometric patterns.

## 🔧 Customization

### Styling
Edit `newtab.css` to customize the appearance:
- Colors and gradients
- Layout and spacing
- Animations and transitions
- Responsive breakpoints

### Functionality
Modify `newtab.js` to add features:
- Different shader filtering options
- Mouse interaction support
- Additional Shadertoy inputs
- Custom shader loading

## 🐛 Troubleshooting

### Common Issues

1. **"Please set your Shadertoy API key"**
   - Make sure you've entered your API key in settings
   - Verify the API key is correct

2. **"Failed to fetch shader list"**
   - Check your internet connection
   - Verify your API key is valid
   - Ensure Shadertoy.com is accessible

3. **"Shader compilation failed"**
   - Some complex shaders may not be compatible
   - Click "New Shader" to try a different one
   - This is normal - not all shaders can be automatically converted

4. **Black screen or no shader**
   - Check if WebGL is enabled in your browser
   - Try updating your graphics drivers
   - Some older hardware may not support complex shaders

### Browser Support
- Chrome 88+ (Manifest V3 support)
- WebGL-capable hardware
- Modern GPU recommended for best performance

## 📝 License

This project is open source. Feel free to modify and distribute according to your needs.

## 🙏 Credits

- **Shadertoy**: For providing the amazing shader platform and API
- **Chrome Extensions**: For the robust extension framework
- **WebGL**: For making real-time graphics possible in browsers

---

Enjoy your new shader-powered browsing experience! 🎆 