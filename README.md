# Obsidian Cursor Trail

Adds a highly visible, customizable bold cursor trail to the Obsidian editor to improve focus and aesthetics. Inspired by the Kitty terminal's cursor behavior.

## Features
- **Bold Block Cursor:** Replaces the thin line cursor with a high-visibility block.
- **Movement Trail:** Smooth animation when the cursor moves between lines or characters.
- **Theme Aware:** Automatically adjusts colors for light and dark modes.
- **Customizable:** Change colors via the plugin settings tab.

## Installation

### From GitHub (Manual)
1. Download the latest release from the [Releases](https://github.com/andrekv/obsidian-cursor-trail/releases) page.
2. Extract the `zip` file into your vault's `.obsidian/plugins/obsidian-cursor-trail` folder.
3. Reload Obsidian and enable the plugin in Settings > Community Plugins.

### Using BRAT
1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat).
2. Go to BRAT settings and click "Add Beta plugin".
3. Paste this URL: `https://github.com/andrekv/obsidian-cursor-trail`.

## Development
This plugin is built using TypeScript and the Obsidian API.

```bash
# Install dependencies
npm install

# Build the plugin
npm run build
```

## License
AGPL-3.0
