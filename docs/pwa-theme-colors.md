# Dynamic PWA Theme Colors

This implementation allows the PWA (Progressive Web App) colors to dynamically match the user's selected app theme.

## How It Works

### 1. Theme Provider Updates (`src/contexts/theme-context.tsx`)

- When a user changes their theme, the `ThemeProvider` automatically updates:
  - Browser theme-color meta tag
  - Microsoft tile color meta tag
  - PWA manifest link with theme parameter

### 2. Dynamic Manifest Endpoint (`saas-ecommerce-backend/app.js`)

- Serves a dynamic manifest at `/manifest?theme={color}`
- Accepts a `theme` query parameter with hex color value
- Returns manifest JSON with dynamic `theme_color` and `background_color`

### 3. HTML Updates (`index.html`)

- Manifest link points to dynamic endpoint instead of static file
- Theme-color meta tags are updated dynamically by JavaScript

## Supported Theme Colors

| Theme        | Hex Color |
| ------------ | --------- |
| default/blue | #142850   |
| black        | #000000   |
| teal         | #14b8a6   |
| purple       | #8b5cf6   |
| green        | #10b981   |
| orange       | #f59e0b   |
| red          | #ef4444   |

## Usage

1. User selects a theme in the app
2. Theme provider updates PWA colors automatically
3. PWA splash screen, browser UI, and install prompts use the selected theme color
4. No page refresh required - changes apply immediately

## Technical Details

- **Theme Storage**: Colors are persisted in localStorage as theme names
- **Color Mapping**: CSS custom properties map theme names to hex values
- **Dynamic Updates**: JavaScript manipulates DOM meta tags and manifest link
- **Caching**: Service worker handles manifest caching appropriately

## Testing

Test the dynamic manifest by visiting:

- `http://localhost:5050/manifest` (default blue theme)
- `http://localhost:5050/manifest?theme=%23ff0000` (red theme)
- `http://localhost:5050/manifest?theme=%2310b981` (green theme)

The PWA will now reflect the user's theme choice in:

- Browser address bar color (mobile)
- PWA splash screen
- App icon background (on some platforms)
- Task switcher (Android)
- App store listings (when applicable)</content>
  <parameter name="filePath">c:\Users\Dave\OneDrive\Documents\Projects\SAAS_E-COMMERCE\saas-ecommerce\docs\pwa-theme-colors.md
