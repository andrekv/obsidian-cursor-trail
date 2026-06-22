var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BoldCursorTrailPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");
var DEFAULT_SETTINGS = {
  lightColor: "#00ff00",
  darkColor: "#00ff00",
  cursorWidth: 3,
  cursorOpacity: 0.7
};
var BoldCursorTrailPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BoldCursorSettingTab(this.app, this));
    this.styleEl = document.createElement("style");
    this.styleEl.id = "bold-cursor-hide-native";
    document.head.appendChild(this.styleEl);
    this.updateStyles();
    this.registerEvent(this.app.workspace.on("css-change", () => {
      this.updateStyles();
    }));
    this.registerEditorExtension(this.createCursorExtension());
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.updateStyles();
  }
  updateStyles() {
    this.styleEl.innerHTML = `
            .markdown-source-view.mod-cm6 .cm-cursor {
                opacity: 0 !important;
            }
            .markdown-source-view.mod-cm6 .cm-content {
                caret-color: transparent !important;
            }
        `;
  }
  createCursorExtension() {
    const plugin = this;
    return import_view.ViewPlugin.fromClass(class {
      constructor(view) {
        this.view = view;
        this.lastCoords = null;
        this.cursorEl = document.createElement("div");
        this.cursorEl.className = "bold-cursor-main";
        this.cursorEl.style.position = "absolute";
        this.cursorEl.style.pointerEvents = "none";
        this.cursorEl.style.zIndex = "99999";
        this.cursorEl.style.borderRadius = "1px";
        this.cursorEl.style.display = "none";
        this.view.dom.appendChild(this.cursorEl);
        this.scheduleDraw(true);
      }
      update(update) {
        if (update.selectionSet || update.docChanged || update.geometryChanged || update.viewportChanged || update.focusChanged) {
          this.scheduleDraw(update.selectionSet);
        }
      }
      scheduleDraw(isSelectionChange) {
        this.view.requestMeasure({
          read: (view) => {
            if (!view.hasFocus || !view.state.selection.main.empty) return null;
            return view.coordsAtPos(view.state.selection.main.from);
          },
          write: (coords, view) => {
            if (!coords) {
              this.cursorEl.style.display = "none";
              this.lastCoords = null;
              return;
            }
            if (isSelectionChange && this.lastCoords && Math.abs(this.lastCoords.top - coords.top) < 5) {
              this.createSmear(this.lastCoords, coords);
            }
            this.lastCoords = coords;
            this.drawCursor(coords);
          }
        });
      }
      drawCursor(coords) {
        const isDark = document.body.classList.contains("theme-dark");
        const color = isDark ? plugin.settings.darkColor : plugin.settings.lightColor;
        this.cursorEl.style.display = "block";
        this.cursorEl.style.backgroundColor = color;
        this.cursorEl.style.width = plugin.settings.cursorWidth + "px";
        this.cursorEl.style.opacity = plugin.settings.cursorOpacity.toString();
        
        const rect = this.view.dom.getBoundingClientRect();
        this.cursorEl.style.left = (coords.left - rect.left) + "px";
        this.cursorEl.style.top = (coords.top - rect.top) + "px";
        this.cursorEl.style.height = (coords.bottom - coords.top) + "px";
      }
      createSmear(from, to) {
        const left = Math.min(from.left, to.left);
        const width = Math.abs(to.left - from.left) + plugin.settings.cursorWidth;
        if (width < 2) return;
        const rect = this.view.dom.getBoundingClientRect();
        const isDark = document.body.classList.contains("theme-dark");
        const color = isDark ? plugin.settings.darkColor : plugin.settings.lightColor;
        const smear = document.createElement("div");
        smear.className = "bold-cursor-trail";
        smear.style.position = "absolute";
        smear.style.left = (left - rect.left) + "px";
        smear.style.top = (to.top - rect.top) + "px";
        smear.style.height = (to.bottom - to.top) + "px";
        smear.style.width = width + "px";
        smear.style.backgroundColor = color;
        smear.style.pointerEvents = "none";
        smear.style.zIndex = "99998";
        smear.style.opacity = (plugin.settings.cursorOpacity * 0.6).toString();
        this.view.dom.appendChild(smear);
        requestAnimationFrame(() => {
          smear.style.opacity = "0";
          smear.style.transition = "opacity 0.2s ease-out";
          setTimeout(() => smear.remove(), 200);
        });
      }
      destroy() {
        if (this.cursorEl) this.cursorEl.remove();
      }
    });
  }
  onunload() {
    if (this.styleEl) this.styleEl.remove();
    const cursorEl = document.getElementById("bold-cursor-main");
    if (cursorEl) cursorEl.remove();
  }
};
var BoldCursorSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Bold Cursor & Trail Settings" });
    new import_obsidian.Setting(containerEl).setName("Cursor Width").setDesc("Set the width of the cursor (px).").addSlider((slider) => slider.setLimits(1, 15, 1).setValue(this.plugin.settings.cursorWidth).setDynamicTooltip().onChange(async (value) => {
      this.plugin.settings.cursorWidth = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Cursor Opacity").setDesc("Set the transparency level (0.1 to 1.0)").addSlider((slider) => slider.setLimits(0.1, 1, 0.1).setValue(this.plugin.settings.cursorOpacity).setDynamicTooltip().onChange(async (value) => {
      this.plugin.settings.cursorOpacity = value;
      await this.plugin.saveSettings();
    }));
  }
};
