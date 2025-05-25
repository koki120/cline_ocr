# PWA Deployment Guide for iPhone Compatibility

## 📱 PWA Features Added

This OCR app now supports Progressive Web App (PWA) functionality for iPhone compatibility:

### ✅ Implemented Features

1. **PWA Manifest** (`public/manifest.json`)
   - App name, icons, and display settings
   - Standalone mode for native app experience

2. **iOS PWA Support** (in `app/root.tsx`)
   - Apple-specific meta tags
   - Home screen icon support
   - Status bar styling

3. **iPhone Camera Support** (in `app/components/CameraCapture.tsx`)
   - File input with `capture="environment"` attribute
   - Direct camera access on iPhone Safari
   - Fallback for devices that don't support getUserMedia

4. **Service Worker** (`public/sw.js`)
   - Offline caching capability
   - App shell caching

## 🚀 Deployment Requirements

### HTTPS is Required
iPhone Safari requires HTTPS for camera access. Deploy to:

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Option 2: Render
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`

#### Option 3: Local HTTPS Testing
```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm run dev

# In another terminal, create HTTPS tunnel
ngrok http 3000
```

## 📲 iPhone Installation Instructions

1. **Open Safari** on iPhone
2. **Navigate** to your deployed HTTPS URL
3. **Tap Share button** (square with arrow)
4. **Select "Add to Home Screen"**
5. **Customize name** if desired
6. **Tap "Add"**

## 🎯 Usage on iPhone

### Camera Access
- Tap "📱 写真を撮影 (iPhone対応)" button
- iPhone will prompt for camera permission
- Camera app opens directly for photo capture
- Photo is automatically processed for OCR

### Offline Support
- App works offline after first visit
- Cached resources load instantly
- Service worker handles offline functionality

## 🔧 Testing PWA Features

### Chrome DevTools (Desktop)
1. Open DevTools → Application tab
2. Check "Manifest" section
3. Verify "Service Workers" registration
4. Test "Add to homescreen" simulation

### iPhone Safari
1. Check camera functionality works
2. Verify "Add to Home Screen" option appears
3. Test offline functionality
4. Confirm app opens in standalone mode

## 📝 Environment Variables

Make sure to set up your environment variables for OCR functionality:
```bash
# Copy example file
cp .env.example .env

# Add your API keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_VISION_API_KEY=your_google_vision_key
```

## 🎨 Customization

### Icons
Replace files in `public/icons/`:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

### App Name & Colors
Edit `public/manifest.json`:
```json
{
  "name": "Your App Name",
  "theme_color": "#your-color",
  "background_color": "#your-bg-color"
}
```

## 🐛 Troubleshooting

### Camera Not Working
- Ensure HTTPS deployment
- Check browser permissions
- Verify `capture="environment"` attribute

### PWA Not Installing
- Confirm manifest.json is accessible
- Check service worker registration
- Verify HTTPS requirement

### Offline Issues
- Clear browser cache
- Re-register service worker
- Check network tab in DevTools

## 📱 Browser Support

- ✅ iPhone Safari (iOS 11.3+)
- ✅ Chrome Mobile
- ✅ Firefox Mobile
- ✅ Samsung Internet
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
