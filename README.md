# Obsidian Cursor Trail

Adds a highly visible, customizable bold block cursor and movement trail to the Obsidian editor to improve focus and aesthetics. Inspired by the Kitty terminal's cursor behavior.

## Features
- **Bold Block Cursor:** Replaces the thin line cursor with a high-visibility block.
- **Movement Trail:** Smooth animation when the cursor moves between lines or characters.
- **Theme Aware:** Automatically adjusts colors for light and dark modes.
- **Customizable:** Change colors and trail behavior via the plugin settings tab.

## Installation

### Using BRAT (Recommended)
1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat).
2. Go to BRAT settings and click "Add Beta plugin".
3. Paste this URL: `https://github.com/andrekv/obsidian-cursor-trail`.

### From GitHub (Manual)
1. Download the latest `main.js`, `manifest.json`, and `styles.css` from the [Releases](https://github.com/andrekv/obsidian-cursor-trail/releases) page.
2. Create a folder `.obsidian/plugins/obsidian-cursor-trail` in your vault.
3. Move the files into that folder and enable the plugin in Settings.

## Development
Built with TypeScript and the Obsidian API.

```bash
# Install dependencies
npm install

# Build the plugin
npm run build
```

## License
AGPL-3.0
