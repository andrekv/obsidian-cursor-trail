"use strict";
var obsidian = require("obsidian");

const DEFAULT_SETTINGS = {
    lightColor: '#00ff00',
    darkColor: '#00ff00'
}

class BoldCursorTrailPlugin extends obsidian.Plugin {
    async onload() {
        console.log("BOLD CURSOR PLUGIN: Loading with Color Accuracy...");
        await this.loadSettings();
        
        this.addSettingTab(new BoldCursorSettingTab(this.app, this));
        
        this.styleTag = document.createElement('style');
        this.styleTag.id = 'bold-cursor-plugin-styles';
        document.head.appendChild(this.styleTag);
        this.updateStyles();

        this.cursorEl = document.createElement('div');
        this.cursorEl.id = 'bold-cursor-main';
        this.cursorEl.className = 'bold-cursor-element bold-cursor-main';
        document.body.appendChild(this.cursorEl);

        this.registerEvent(this.app.workspace.on('editor-change', (editor) => {
            this.handleUpdate(editor);
        }));

        this.registerDomEvent(document, 'selectionchange', () => {
            this.updateActiveEditor();
        });

        this.scrollHandler = () => {
            this.updateActiveEditor();
        };
        window.addEventListener('scroll', this.scrollHandler, true);
        
        // Update colors when theme changes
        this.registerEvent(this.app.workspace.on('css-change', () => {
            this.updateStyles();
        }));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.updateStyles();
    }

    updateActiveEditor() {
        const activeView = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (activeView && activeView.editor) {
            this.handleUpdate(activeView.editor);
        }
    }

    updateStyles() {
        const isDark = document.body.classList.contains('theme-dark');
        const color = isDark ? this.settings.darkColor : this.settings.lightColor;
        
        this.styleTag.innerHTML = `
            .bold-cursor-element {
                position: fixed !important;
                background-color: ${color} !important;
                pointer-events: none !important;
                z-index: 99999 !important;
                border-radius: 1px;
                display: none;
            }
            .bold-cursor-main {
                width: 8px !important;
                opacity: 0.7 !important; /* Transparency to see text */
            }
            .bold-cursor-trail {
                opacity: 0.4;
            }
            .markdown-source-view.mod-cm6 .cm-cursor {
                opacity: 0 !important;
            }
            .markdown-source-view.mod-cm6 .cm-content {
                caret-color: transparent !important;
            }
        `;
    }

    handleUpdate(editor) {
        const cm = editor.cm;
        if (!cm) return;

        const sel = cm.state.selection.main;
        if (!sel.empty) {
            this.cursorEl.style.display = 'none';
            return;
        }

        const coords = cm.coordsAtPos(sel.from);
        if (coords) {
            this.createSmear(this._lastCoords, coords);
            this._lastCoords = coords;
            this.drawCursor(coords);
        } else {
            this.cursorEl.style.display = 'none';
        }
    }

    drawCursor(coords) {
        this.cursorEl.style.display = 'block';
        this.cursorEl.style.left = coords.left + 'px';
        this.cursorEl.style.top = coords.top + 'px';
        this.cursorEl.style.height = (coords.bottom - coords.top) + 'px';
    }

    createSmear(from, to) {
        if (!from) return;
        if (Math.abs(from.top - to.top) > 4) return;

        const left = Math.min(from.left, to.left);
        const width = Math.abs(to.left - from.left);
        if (width < 2) return;

        const smear = document.createElement('div');
        smear.className = 'bold-cursor-element bold-cursor-trail';
        smear.style.display = 'block';
        smear.style.left = left + 'px';
        smear.style.top = to.top + 'px';
        smear.style.height = (to.bottom - to.top) + 'px';
        smear.style.width = width + 'px';
        document.body.appendChild(smear);

        requestAnimationFrame(() => {
            smear.style.opacity = "0";
            smear.style.transition = "opacity 0.2s ease-out";
            setTimeout(() => smear.remove(), 200);
        });
    }

    onunload() {
        if (this.styleTag) this.styleTag.remove();
        if (this.cursorEl) this.cursorEl.remove();
        document.querySelectorAll('.bold-cursor-trail').forEach(el => el.remove());
        window.removeEventListener('scroll', this.scrollHandler, true);
    }
}

class BoldCursorSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Bold Cursor & Trail Settings' });

        new obsidian.Setting(containerEl)
            .setName('Light Mode Color')
            .setDesc('Pick the cursor color for Light Mode')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.lightColor)
                .onChange(async (value) => {
                    this.plugin.settings.lightColor = value;
                    await this.plugin.saveSettings();
                }));

        new obsidian.Setting(containerEl)
            .setName('Dark Mode Color')
            .setDesc('Pick the cursor color for Dark Mode')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.darkColor)
                .onChange(async (value) => {
                    this.plugin.settings.darkColor = value;
                    await this.plugin.saveSettings();
                }));
    }
}

module.exports = BoldCursorTrailPlugin;
