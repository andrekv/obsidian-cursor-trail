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

## Releasing New Versions

When you make substantial changes to the codebase and want to publish a new version/update:

1. Update the `"version"` field in `manifest.json` (e.g. bump to `1.0.2`).
2. Commit the changes and the updated manifest:
   ```bash
   git add manifest.json main.js README.md
   git commit -m "chore: bump version to 1.0.2"
   ```
3. Tag the commit with the new version name:
   ```bash
   git tag v1.0.2
   ```
4. Push both the code and the new tag to GitHub:
   ```bash
   git push origin main --tags
   ```

*Note: If you are using BRAT, beta-testers will automatically download the new `main.js` from the `main` branch, but a tag-based release is recommended for clean versioning.*

## License
AGPL-3.0
