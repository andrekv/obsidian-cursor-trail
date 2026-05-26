"use strict";
var obsidian = require("obsidian");

const DEFAULT_SETTINGS = {
    lightColor: '#00ff00',
    darkColor: '#00ff00',
    cursorWidth: 3,
    cursorOpacity: 0.7
}

class BoldCursorTrailPlugin extends obsidian.Plugin {
    async onload() {
        console.log("BOLD CURSOR PLUGIN: Loading with Precision Fix...");
        await this.loadSettings();
        
        this.addSettingTab(new BoldCursorSettingTab(this.app, this));
        
        this._lastCoords = null;
        this._debouncedUpdate = this.debounce(() => this.updateActiveEditor(), 16);

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
            const activeView = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
            if (activeView) {
                this._debouncedUpdate();
            } else {
                this.cursorEl.style.display = 'none';
            }
        });

        this.scrollHandler = () => {
            this._debouncedUpdate();
        };
        window.addEventListener('scroll', this.scrollHandler, true);
        
        this.registerEvent(this.app.workspace.on('css-change', () => {
            this.updateStyles();
        }));
    }

    onunload() {
        console.log("BOLD CURSOR PLUGIN: Unloading...");
        window.removeEventListener('scroll', this.scrollHandler, true);
        if (this.styleTag) this.styleTag.remove();
        if (this.cursorEl) this.cursorEl.remove();
        document.querySelectorAll('.bold-cursor-trail').forEach(el => el.remove());
    }

    debounce(fn, ms) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
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
                transition: opacity 0.2s ease-out;
            }
            .bold-cursor-main {
                width: ${this.settings.cursorWidth}px !important;
                opacity: ${this.settings.cursorOpacity} !important;
            }
            .bold-cursor-trail {
                opacity: ${this.settings.cursorOpacity * 0.6};
                pointer-events: none;
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
        if (!coords) return;

        this.cursorEl.style.display = 'block';
        this.cursorEl.style.left = coords.left + 'px';
        this.cursorEl.style.top = coords.top + 'px';
        this.cursorEl.style.height = (coords.bottom - coords.top) + 'px';

        if (this._lastCoords) {
            this.createSmear(this._lastCoords, coords);
        }
        this._lastCoords = coords;
    }

    createSmear(from, to) {
        if (!from || !to) return;
        if (Math.abs(from.top - to.top) > 8) return;
        if (from.left === to.left && from.top === to.top) return;
        
        if (document.querySelectorAll('.bold-cursor-trail').length > 15) return;

        const smear = document.createElement('div');
        smear.className = 'bold-cursor-element bold-cursor-trail';
        
        const left = Math.min(from.left, to.left);
        const width = Math.abs(from.left - to.left) + this.settings.cursorWidth;
        
        smear.style.display = 'block';
        smear.style.left = left + 'px';
        smear.style.top = from.top + 'px';
        smear.style.width = width + 'px';
        smear.style.height = (from.bottom - from.top) + 'px';

        document.body.appendChild(smear);
        
        setTimeout(() => {
            smear.style.opacity = '0';
            setTimeout(() => smear.remove(), 200);
        }, 50);
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
            .setName('Cursor Width')
            .setDesc('Set the width of the cursor (px). Use smaller values for more precision.')
            .addSlider(slider => slider
                .setLimits(1, 15, 1)
                .setValue(this.plugin.settings.cursorWidth)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.cursorWidth = value;
                    await this.plugin.saveSettings();
                }));

        new obsidian.Setting(containerEl)
            .setName('Cursor Opacity')
            .setDesc('Set the transparency level (0.1 to 1.0)')
            .addSlider(slider => slider
                .setLimits(0.1, 1, 0.1)
                .setValue(this.plugin.settings.cursorOpacity)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.cursorOpacity = value;
                    await this.plugin.saveSettings();
                }));

        new obsidian.Setting(containerEl)
            .setName('Light Mode Color')
            .setDesc('Color of the cursor in light theme')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.lightColor)
                .onChange(async (value) => {
                    this.plugin.settings.lightColor = value;
                    await this.plugin.saveSettings();
                }));

        new obsidian.Setting(containerEl)
            .setName('Dark Mode Color')
            .setDesc('Color of the cursor in dark theme')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.darkColor)
                .onChange(async (value) => {
                    this.plugin.settings.darkColor = value;
                    await this.plugin.saveSettings();
                }));
    }
}

module.exports = BoldCursorTrailPlugin;
