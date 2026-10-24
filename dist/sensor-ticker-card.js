/* Sensor Ticker Card v1.0.0 - independent Home Assistant dashboard card.
 * No external services, RSS feeds, backend, or dependencies.
 */
(() => {
  "use strict";
  const VERSION = "1.0.0";
  const MAX_ENTITIES = 30;
  // Five self-contained looks, inspired by the Sensor Ticker preview.
  // "Custom" inherits the Default palette and exposes every color in the editor.
  const THEMES = {
    default: { bg: "#081a24", fg: "#eefaff", accent: "#04bcd5", separator: "#48c4d7", secondary: "#92b8c8", border: "#245365", icon: "#00dbec", label_fg: "#ffffff" },
    dark:    { bg: "#080b11", fg: "#f4f8ff", accent: "#126ddb", separator: "#628ca8", secondary: "#b1c4d5", border: "#23384a", icon: "#2bb3ff", label_fg: "#ffffff" },
    light:   { bg: "#f0f6fc", fg: "#1a2b41", accent: "#137ce8", separator: "#4777a5", secondary: "#506d89", border: "#b8cfdf", icon: "#086fc9", label_fg: "#ffffff" },
    blue:    { bg: "#071637", fg: "#f0f7ff", accent: "#1551bd", separator: "#6699eb", secondary: "#a8c5f3", border: "#2150a2", icon: "#33c7ff", label_fg: "#ffffff" },
    purple:  { bg: "#1a0c2b", fg: "#fbf2ff", accent: "#8e27d2", separator: "#b77deb", secondary: "#d0b3e8", border: "#6b2d90", icon: "#d67cff", label_fg: "#ffffff" },
  };
  const THEME_OPTIONS = [
    ["default", "Default · Cyan"],
    ["dark", "Dark · Dunkelblau"],
    ["light", "Light · Hell"],
    ["blue", "Blue · Marineblau"],
    ["purple", "Purple · Violett"],
    ["custom", "Custom · Eigene Farben"],
  ];
  const DEFAULT = {
    type: "custom:sensor-ticker-card", title: "SENSORS", entities: [],
    theme: "default", mode: "continuous", speed: 62, interval: 6,
    height: 58, font_size: 15, show_clock: false, show_names: true,
    show_icons: true, show_units: true, pause_on_hover: true,
    transparent_bg: false,
    colors: { ...THEMES.default },
  };
  const blank = () => ({ entity: "", name: "", icon: "", decimals: "auto", enabled: true });
  const escapeHTML = (v) => String(v ?? "").replace(/[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const clamp = (v, min, max, fallback) => Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : fallback;
  const isHex = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
  const normalized = (raw = {}) => {
    const c = { ...DEFAULT, ...raw };
    c.entities = (Array.isArray(c.entities) ? c.entities : []).slice(0, MAX_ENTITIES).map((e) => ({
      // Keep only supported fields. Obsolete attribute/unit overrides from
      // earlier versions are ignored and removed on the next configuration save.
      entity: String(typeof e === "string" ? e : e?.entity || "").trim(),
      name: String(e?.name || "").trim().slice(0, 90),
      icon: String(e?.icon || "").trim().slice(0, 80),
      decimals: ["auto", "0", "1", "2", "3"].includes(String(e?.decimals ?? "auto")) ? String(e?.decimals ?? "auto") : "auto",
      enabled: e?.enabled !== false,
    }));
    c.title = String(c.title || "").slice(0, 32);
    // Existing cards from 0.x remain compatible. The discontinued TV-News
    // look becomes Blue; Transparent is represented by Custom transparency.
    const legacyTheme = { nightglow: "default", tv: "blue", minimal: "dark", transparent: "custom" };
    if (raw.theme === "transparent") c.transparent_bg = true;
    c.theme = legacyTheme[c.theme] || c.theme;
    c.theme = [...Object.keys(THEMES), "custom"].includes(c.theme) ? c.theme : DEFAULT.theme;
    c.transparent_bg = c.transparent_bg === true;
    c.colors = { ...DEFAULT.colors, ...(c.colors && typeof c.colors === "object" ? c.colors : {}) };
    // Legacy configs only had four color controls; new controls get readable defaults.
    for (const [key, fallback] of Object.entries(DEFAULT.colors)) {
      if (!isHex(c.colors[key])) c.colors[key] = fallback;
    }
    c.mode = ["continuous", "slide", "fade"].includes(c.mode) ? c.mode : DEFAULT.mode;
    c.speed = clamp(c.speed, 20, 200, DEFAULT.speed);
    c.interval = clamp(c.interval, 3, 30, DEFAULT.interval);
    c.height = clamp(c.height, 38, 120, DEFAULT.height);
    c.font_size = clamp(c.font_size, 11, 28, DEFAULT.font_size);
    for (const key of ["show_clock", "show_names", "show_icons", "show_units", "pause_on_hover"])
      c[key] = c[key] !== false;
    c.show_clock = raw.show_clock === true;
    return c;
  };
  const options = (entries, active) => entries.map(([key, label]) =>
    `<option value="${escapeHTML(key)}" ${String(key) === String(active) ? "selected" : ""}>${escapeHTML(label)}</option>`).join("");
  // Curated common Home Assistant MDI icons. Unlisted icons can be entered manually.
  const ICON_OPTIONS = [
    ["", "Automatisch (Home Assistant)"],
    ["mdi:thermometer", "Temperatur"],
    ["mdi:thermometer-water", "Wassertemperatur"],
    ["mdi:water-percent", "Luftfeuchtigkeit"],
    ["mdi:weather-sunny", "Sonne"],
    ["mdi:weather-cloudy", "Wolken"],
    ["mdi:weather-rainy", "Regen"],
    ["mdi:weather-windy", "Wind"],
    ["mdi:gauge", "Messwert / Sensor"],
    ["mdi:chart-line", "Messwerte / Verlauf"],
    ["mdi:flash", "Strom / Leistung"],
    ["mdi:lightning-bolt", "Elektrizität"],
    ["mdi:transmission-tower", "Stromnetz"],
    ["mdi:solar-power", "Photovoltaik"],
    ["mdi:solar-panel", "Solarmodul"],
    ["mdi:battery", "Batterie"],
    ["mdi:water", "Wasser"],
    ["mdi:fire", "Gas / Heizung"],
    ["mdi:radiator", "Heizkörper"],
    ["mdi:thermostat", "Thermostat"],
    ["mdi:door", "Tür"],
    ["mdi:door-open", "Tür offen"],
    ["mdi:window-open", "Fenster"],
    ["mdi:motion-sensor", "Bewegung"],
    ["mdi:shield-home", "Sicherheit"],
    ["mdi:alarm-light", "Alarm"],
    ["mdi:lightbulb-outline", "Licht"],
    ["mdi:toggle-switch-outline", "Schalter"],
    ["mdi:power-plug", "Steckdose"],
    ["mdi:washing-machine", "Waschmaschine"],
    ["mdi:dishwasher", "Spülmaschine"],
    ["mdi:robot-vacuum", "Saugroboter"],
    ["mdi:robot-mower", "Mähroboter"],
    ["mdi:cctv", "Kamera"],
    ["mdi:wifi", "WLAN"],
    ["mdi:server", "Server"],
    ["mdi:home", "Haus"],
    ["mdi:account", "Person"],
    ["mdi:car", "Auto"],
    ["mdi:music", "Musik"],
    ["mdi:clock-outline", "Zeit"],
    ["mdi:calendar", "Kalender"],
    ["mdi:information-outline", "Info"],
  ];
  const KNOWN_ICONS = new Set(ICON_OPTIONS.map(([icon]) => icon));
  const iconFor = (id) => ({
    sensor: "mdi:gauge", binary_sensor: "mdi:checkbox-marked-circle-outline",
    climate: "mdi:thermostat", weather: "mdi:weather-partly-cloudy",
    light: "mdi:lightbulb-outline", switch: "mdi:toggle-switch-outline",
    person: "mdi:account", device_tracker: "mdi:cellphone-marker",
    cover: "mdi:window-shutter", lock: "mdi:lock-outline",
    fan: "mdi:fan", media_player: "mdi:play-circle-outline",
    input_number: "mdi:numeric", number: "mdi:numeric",
    counter: "mdi:counter", input_boolean: "mdi:toggle-switch-outline",
    sun: "mdi:weather-sunny", timer: "mdi:timer-outline",
    automation: "mdi:robot-outline", script: "mdi:script-text-outline",
  })[String(id || "").split(".")[0]] || "mdi:information-outline";
  const localeIsGerman = (hass) => String(hass?.locale?.language || "de").toLowerCase().startsWith("de");
  const translatedState = (obj, hass) => {
    const raw = String(obj.state ?? "");
    const domain = obj.entity_id.split(".")[0];
    const de = localeIsGerman(hass);
    if (raw === "unavailable") return de ? "Nicht verfügbar" : "Unavailable";
    if (raw === "unknown") return de ? "Unbekannt" : "Unknown";
    if (domain === "binary_sensor") {
      const dc = obj.attributes?.device_class || "";
      const on = raw === "on";
      if (["door", "window", "garage_door", "opening"].includes(dc)) return de ? (on ? "Offen" : "Geschlossen") : (on ? "Open" : "Closed");
      if (["motion", "occupancy", "presence"].includes(dc)) return de ? (on ? "Bewegung" : "Ruhe") : (on ? "Detected" : "Clear");
      if (["moisture", "water"].includes(dc)) return de ? (on ? "Nass" : "Trocken") : (on ? "Wet" : "Dry");
      if (["problem", "smoke", "gas", "safety"].includes(dc)) return de ? (on ? "Alarm" : "OK") : (on ? "Alert" : "OK");
    }
    if (["binary_sensor", "light", "switch", "input_boolean", "fan", "automation"].includes(domain)) {
      if (raw === "on") return de ? "An" : "On";
      if (raw === "off") return de ? "Aus" : "Off";
    }
    if (["person", "device_tracker"].includes(domain)) {
      if (raw === "home") return de ? "Zuhause" : "Home";
      if (raw === "not_home") return de ? "Unterwegs" : "Away";
    }
    if (domain === "cover") {
      if (raw === "open") return de ? "Offen" : "Open";
      if (raw === "closed") return de ? "Geschlossen" : "Closed";
    }
    if (typeof hass?.formatEntityState === "function") {
      try {
        const formatted = hass.formatEntityState(obj);
        if (typeof formatted === "string" && formatted) return formatted;
      } catch (_) { /* HA version may not provide formatter for every domain */ }
    }
    return raw;
  };
  const displayFor = (entry, hass, showUnits) => {
    const obj = hass?.states?.[entry.entity];
    const de = localeIsGerman(hass);
    if (!obj) return { name: entry.name || entry.entity, value: de ? "Nicht gefunden" : "Not found", icon: entry.icon || iconFor(entry.entity), unavailable: true };
    // Only read the real entity state. Unit and its meaning are supplied by HA.
    const raw = obj.state;
    const unit = String(obj.attributes?.unit_of_measurement ?? "");
    const numeric = raw !== null && raw !== undefined && String(raw).trim() !== "" && Number.isFinite(Number(raw));
    let value;
    if (numeric) {
      const precision = entry.decimals === "auto" ? Math.min(2, (String(raw).split(".")[1] || "").length) : Number(entry.decimals);
      value = new Intl.NumberFormat(hass?.locale?.language || "de-DE", {
        minimumFractionDigits: precision, maximumFractionDigits: precision,
      }).format(Number(raw));
      if (showUnits && unit) value += ` ${unit}`;
    } else {
      value = raw == null ? "–" : translatedState(obj, hass);
    }
    return {
      name: entry.name || obj.attributes?.friendly_name || entry.entity,
      value,
      icon: entry.icon || obj.attributes?.icon || iconFor(entry.entity),
      unavailable: ["unknown", "unavailable"].includes(obj.state),
    };
  };

  class SensorTickerCard extends HTMLElement {
    static getConfigElement() { return document.createElement("sensor-ticker-card-editor"); }
    static getStubConfig() { const { type, ...rest } = DEFAULT; return JSON.parse(JSON.stringify(rest)); }
    constructor() {
      super(); this.attachShadow({ mode: "open" });
      this._config = normalized(); this._index = 0; this._hover = false;
      this._lastValues = new Map();
    }
    setConfig(config) {
      if (!config || typeof config !== "object") throw new Error("Sensor Ticker: ungültige Kartenkonfiguration");
      this._config = normalized(config);
      if (this.isConnected) this._render();
    }
    set hass(hass) {
      const previous = this._hass;
      this._hass = hass;
      // Skip changes to unrelated Home Assistant entities; never restart the animation.
      const changed = !previous || previous.locale?.language !== hass?.locale?.language ||
        this._config.entities.some(e => e.enabled && e.entity && previous.states?.[e.entity] !== hass?.states?.[e.entity]);
      if (changed) this._updateValues();
    }
    connectedCallback() { this._render(); }
    disconnectedCallback() { this._cleanup(); }
    getCardSize() { return Math.max(1, Math.ceil(this._config.height / 50)); }
    getGridOptions() { return { columns: 12, rows: 1, min_columns: 3, min_rows: 1 }; }
    _cleanup() {
      clearInterval(this._itemTimer); clearInterval(this._clockTimer);
      this._resizeObserver?.disconnect(); this._resizeObserver = null;
      if (this._frame) cancelAnimationFrame(this._frame);
      this._frame = 0;
    }
    _rows() { return this._config.entities.map((row, index) => ({ row, index })).filter(({ row }) => row.enabled && row.entity); }
    _colors() {
      if (this._config.theme !== "custom") return THEMES[this._config.theme];
      return { ...this._config.colors, bg: this._config.transparent_bg ? "transparent" : this._config.colors.bg };
    }
    _createUnit(row, index) {
      const unit = document.createElement("span");
      unit.className = "st-unit";
      unit.dataset.rowIndex = String(index);
      unit.setAttribute("role", "button");
      unit.setAttribute("tabindex", "0");
      unit.setAttribute("title", row.entity);
      if (this._config.show_icons) {
        const icon = document.createElement("ha-icon"); icon.className = "st-icon";
        unit.append(icon);
      }
      if (this._config.show_names) {
        const name = document.createElement("span"); name.className = "st-name"; unit.append(name);
      }
      const value = document.createElement("span"); value.className = "st-value"; unit.append(value);
      return unit;
    }
    _appendRows(parent) {
      for (const { row, index } of this._rows()) {
        parent.append(this._createUnit(row, index));
        const separator = document.createElement("span");
        separator.className = "st-separator";
        separator.textContent = "✦";
        separator.setAttribute("aria-hidden", "true");
        parent.append(separator);
      }
    }
    _showSingle() {
      const single = this.shadowRoot.querySelector(".st-single");
      const rows = this._rows();
      if (!single || !rows.length) return;
      const { row, index } = rows[this._index % rows.length];
      const wrap = document.createElement("span"); wrap.className = "st-single-inner";
      wrap.style.animationDuration = `${this._config.interval}s`;
      wrap.append(this._createUnit(row, index));
      single.replaceChildren(wrap);
      this._updateValues();
    }
    _clockUpdate() {
      const el = this.shadowRoot.querySelector(".st-clock");
      if (el) el.textContent = new Intl.DateTimeFormat(this._hass?.locale?.language || "de-DE", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    }
    _updateValues() {
      if (!this._hass || !this.isConnected || !this.shadowRoot.querySelector(".st-bar")) return;
      // Query all repeated units, including the second marquee copy.
      for (const el of this.shadowRoot.querySelectorAll(".st-unit[data-row-index]")) {
        const row = this._config.entities[Number(el.dataset.rowIndex)];
        if (!row) continue;
        const view = displayFor(row, this._hass, this._config.show_units);
        const name = el.querySelector(".st-name");
        const value = el.querySelector(".st-value");
        const icon = el.querySelector(".st-icon");
        if (name && name.textContent !== `${view.name}:`) name.textContent = `${view.name}:`;
        if (value && value.textContent !== view.value) value.textContent = view.value;
        if (icon && icon.getAttribute("icon") !== view.icon) icon.setAttribute("icon", view.icon);
        el.classList.toggle("st-unavailable", Boolean(view.unavailable));
      }
      this._queueLayout();
    }
    _queueLayout() {
      if (this._config.mode !== "continuous" || this._frame || !this.isConnected) return;
      this._frame = requestAnimationFrame(() => { this._frame = 0; this._layoutTrack(); });
    }
    _layoutTrack() {
      const viewport = this.shadowRoot.querySelector(".st-viewport");
      const group = this.shadowRoot.querySelector(".st-group:not(.st-copy)");
      const copy = this.shadowRoot.querySelector(".st-copy");
      const track = this.shadowRoot.querySelector(".st-track");
      if (!viewport || !group || !copy || !track || !this.isConnected) return;
      // Populate at least a viewport's width, so even a single value loops smoothly.
      if (!this._baseNodes) this._baseNodes = Array.from(group.childNodes, el => el.cloneNode(true));
      let repetitions = 0;
      while (group.scrollWidth < viewport.clientWidth && repetitions < 70) {
        for (const node of this._baseNodes) group.append(node.cloneNode(true));
        repetitions++;
      }
      // Rebuild mirrored copy to match exact current text and width.
      copy.replaceChildren(...Array.from(group.childNodes, node => node.cloneNode(true)));
      // The mirrored loop is hidden from screen readers and keyboard focus.
      copy.querySelectorAll(".st-unit").forEach(node => node.setAttribute("tabindex", "-1"));
      const width = group.getBoundingClientRect().width;
      const px = `${width}px`;
      if (track.style.getPropertyValue("--st-distance") !== px) track.style.setProperty("--st-distance", px);
      const duration = `${Math.max(3, width / this._config.speed).toFixed(2)}s`;
      if (track.style.getPropertyValue("--st-duration") !== duration) track.style.setProperty("--st-duration", duration);
    }
    _render() {
      this._cleanup(); this._baseNodes = null;
      const c = this._config, color = this._colors();
      const vars = `--st-bg:${color.bg};--st-fg:${color.fg};--st-accent:${color.accent};--st-separator:${color.separator};--st-secondary:${color.secondary};--st-border:${color.border};--st-icon:${color.icon};--st-label-fg:${color.label_fg};--st-height:${c.height}px;--st-font:${c.font_size}px;`;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box;contain:inline-size}
        ha-card{width:100%;max-width:100%;min-width:0;display:block;box-sizing:border-box;overflow:hidden;background:var(--st-bg)!important;color:var(--st-fg);border:1px solid var(--st-border);border-radius:14px;box-shadow:0 3px 12px #00000016}
        .st-bar{height:var(--st-height);box-sizing:border-box;display:flex;align-items:center;min-width:0;width:100%;overflow:hidden}
        .st-label{align-self:stretch;z-index:1;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(110deg,var(--st-accent),color-mix(in srgb,var(--st-accent) 82%,#05162b));color:var(--st-label-fg);padding:0 27px 0 15px;font-size:12px;font-weight:800;max-width:32%;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;clip-path:polygon(0 0,calc(100% - 13px) 0,100% 50%,calc(100% - 13px) 100%,0 100%)}
        .st-viewport{flex:1;min-width:0;width:100%;height:100%;position:relative;display:flex;align-items:center;overflow:hidden}
        .st-track{position:absolute;left:0;top:0;height:100%;display:flex;align-items:center;width:max-content;white-space:nowrap;will-change:transform;animation:st-marquee var(--st-duration,30s) linear infinite}
        .st-group{display:flex;flex-shrink:0;align-items:center;white-space:nowrap;box-sizing:border-box;padding-right:22px}
        .st-unit{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;cursor:pointer;max-width:100%;outline-offset:3px}
        .st-unit:hover .st-value{text-decoration:underline}
        .st-name{color:var(--st-secondary);font-size:calc(var(--st-font)*.86);font-weight:650}
        .st-value{color:var(--st-fg);font-size:var(--st-font);font-weight:650;line-height:1.4;font-variant-numeric:tabular-nums}
        .st-unavailable .st-value{opacity:.65}
        ha-icon.st-icon{--mdc-icon-size:calc(var(--st-font)*1.18);color:var(--st-icon);width:calc(var(--st-font)*1.18);height:calc(var(--st-font)*1.18)}
        .st-separator{color:var(--st-separator);font-size:calc(var(--st-font)*.9);padding:0 20px}
        .st-single{display:flex;align-items:center;overflow:hidden;width:100%;height:100%;padding:0 14px;box-sizing:border-box}
        .st-single-inner{display:inline-flex;align-items:center;max-width:100%;white-space:nowrap}
        .mode-slide .st-single-inner{animation:st-slide ease-in-out both}
        .mode-fade .st-single-inner{animation:st-fade ease-in-out both}
        .st-clock{align-self:stretch;display:flex;align-items:center;flex:0 0 auto;z-index:1;padding:0 10px;border-left:1px solid color-mix(in srgb,var(--st-fg) 15%,transparent);font-variant-numeric:tabular-nums;font-size:calc(var(--st-font)*.84);font-weight:700}
        .st-empty{padding:0 14px;opacity:.75;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        @keyframes st-marquee{from{transform:translateX(0)}to{transform:translateX(calc(-1*var(--st-distance,100px)))}}
        @keyframes st-slide{0%{transform:translateX(100%);opacity:0}15%,77%{transform:translateX(0);opacity:1}100%{transform:translateX(-35%);opacity:0}}
        @keyframes st-fade{0%,100%{opacity:0}12%,82%{opacity:1}}
        ${c.pause_on_hover ? ".st-bar:hover .st-track,.st-bar:hover .st-single-inner{animation-play-state:paused}" : ""}
        @media(prefers-reduced-motion:reduce){.st-track,.st-single-inner{animation:none!important}.st-copy{display:none}}
      </style><ha-card style="${escapeHTML(vars)}"><div class="st-bar mode-${escapeHTML(c.mode)}">
        ${c.title ? `<div class="st-label">${escapeHTML(c.title)}</div>` : ""}
        <div class="st-viewport" aria-label="Sensor Ticker"></div>
        ${c.show_clock ? `<div class="st-clock" aria-label="Clock"></div>` : ""}
      </div></ha-card>`;
      const viewport = this.shadowRoot.querySelector(".st-viewport");
      const rows = this._rows();
      if (!rows.length) {
        const empty = document.createElement("div"); empty.className = "st-empty";
        empty.textContent = "Entitäten im grafischen Karteneditor hinzufügen";
        viewport.append(empty);
      } else if (c.mode === "continuous") {
        const track = document.createElement("div"); track.className = "st-track";
        const group = document.createElement("div"); group.className = "st-group";
        const copy = document.createElement("div"); copy.className = "st-group st-copy";
        copy.setAttribute("aria-hidden", "true");
        this._appendRows(group); track.append(group, copy); viewport.append(track);
        this._updateValues(); this._queueLayout();
        if (typeof ResizeObserver !== "undefined") {
          this._resizeObserver = new ResizeObserver(() => this._queueLayout());
          this._resizeObserver.observe(viewport);
        }
      } else {
        const single = document.createElement("div"); single.className = "st-single";
        viewport.append(single); this._index %= rows.length; this._showSingle();
        if (rows.length > 1) this._itemTimer = setInterval(() => {
          if (this._config.pause_on_hover && this._hover) return;
          this._index = (this._index + 1) % this._rows().length;
          this._showSingle();
        }, c.interval * 1000);
      }
      if (c.show_clock) {
        this._clockUpdate(); this._clockTimer = setInterval(() => this._clockUpdate(), 15000);
      }
      const bar = this.shadowRoot.querySelector(".st-bar");
      bar.addEventListener("mouseenter", () => { this._hover = true; });
      bar.addEventListener("mouseleave", () => { this._hover = false; });
      // One delegated listener also works with duplicates in an animated track.
      viewport.addEventListener("click", (event) => this._openEntity(event));
      viewport.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this._openEntity(event); }
      });
    }
    _openEntity(event) {
      const unit = event.target?.closest?.(".st-unit");
      if (!unit) return;
      const entityId = this._config.entities[Number(unit.dataset.rowIndex)]?.entity;
      if (entityId) this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
    }
  }

  class SensorTickerCardEditor extends HTMLElement {
    constructor() {
      super(); this.attachShadow({ mode: "open" }); this._config = normalized();
      this._entityCount = -1; this._customIconRows = new Set();
    }
    setConfig(config) { this._config = normalized(config); this._render(); }
    set hass(hass) {
      this._hass = hass;
      // The editor only needs to rerender if entity options change, not for
      // each new sensor reading. No attribute lists are maintained anymore.
      const count = Object.keys(hass?.states || {}).length;
      if (count !== this._entityCount) {
        this._entityCount = count;
        if (this.isConnected) this._render();
      }
    }
    connectedCallback() { this._render(); }
    _change(patch) {
      this._config = normalized({ ...this._config, ...patch });
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: JSON.parse(JSON.stringify(this._config)) }, bubbles: true, composed: true,
      }));
      this._render();
    }
    _changeEntity(index, field, value) {
      const entities = this._config.entities.map(row => ({ ...row }));
      entities[index][field] = value;
      this._change({ entities });
    }
    _iconOptions(row, index) {
      const custom = this._customIconRows.has(index) || (Boolean(row.icon) && !KNOWN_ICONS.has(row.icon));
      const selected = custom ? "__custom__" : row.icon;
      return options([...ICON_OPTIONS, ["__custom__", "Eigenes MDI-Icon eingeben …"]], selected);
    }
    _entityRow(row, index) {
      const c = this._config;
      const customIcon = this._customIconRows.has(index) || (Boolean(row.icon) && !KNOWN_ICONS.has(row.icon));
      const selectedEntity = this._hass?.states?.[row.entity];
      const currentIcon = row.icon || selectedEntity?.attributes?.icon || iconFor(row.entity);
      return `<div class="st-entity-row" data-idx="${index}">
        <div class="st-head"><strong>Entität ${index + 1}</strong><div class="st-tools">
          <button data-move="up" title="Nach oben" ${index === 0 ? "disabled" : ""}>↑</button>
          <button data-move="down" title="Nach unten" ${index === c.entities.length - 1 ? "disabled" : ""}>↓</button>
          <button data-remove title="Entität entfernen">✕</button></div></div>
        <label>Home-Assistant-Entität<input data-entry="entity" list="st-entity-list" placeholder="sensor.temperatur_wohnzimmer" value="${escapeHTML(row.entity)}" autocomplete="off"></label>
        <div class="st-grid">
          <label>Anzeigename (optional)<input data-entry="name" placeholder="z. B. Wohnzimmer" value="${escapeHTML(row.name)}"></label>
          <label>Icon auswählen
            <span class="st-icon-select"><ha-icon class="st-icon-preview" icon="${escapeHTML(currentIcon)}"></ha-icon>
              <select data-icon-select>${this._iconOptions(row, index)}</select>
            </span>
          </label>
          ${customIcon ? `<label>Eigenes MDI-Icon<input data-entry="icon" placeholder="mdi:thermometer" value="${escapeHTML(row.icon)}"></label>` : ""}
          <label>Nachkommastellen<select data-entry="decimals">${options([["auto","Automatisch"],["0","0"],["1","1"],["2","2"],["3","3"]],row.decimals)}</select></label>
        </div>
        <label class="st-checkbox"><input type="checkbox" data-entry="enabled" ${row.enabled ? "checked" : ""}> Entität anzeigen</label>
      </div>`;
    }
    _themePreview() {
      const palette = this._config.theme === "custom" ? { ...this._config.colors, bg: this._config.transparent_bg ? "transparent" : this._config.colors.bg } : THEMES[this._config.theme];
      return `<div class="st-theme-preview" style="--p-bg:${palette.bg};--p-fg:${palette.fg};--p-accent:${palette.accent};--p-secondary:${palette.secondary};--p-icon:${palette.icon};--p-separator:${palette.separator};--p-border:${palette.border};--p-label-fg:${palette.label_fg}">
        <span class="st-preview-label">${escapeHTML(this._config.title || "SENSORS")}</span>
        <span class="st-preview-items"><ha-icon icon="mdi:thermometer"></ha-icon><span>Raum:</span><b>22,4 °C</b><i>✦</i><ha-icon icon="mdi:flash"></ha-icon><b>450 W</b></span>
      </div>`;
    }
    _render() {
      if (!this.isConnected || !this.shadowRoot) return;
      const c = this._config;
      const stateList = Object.values(this._hass?.states || {}).sort((a,b) => a.entity_id.localeCompare(b.entity_id));
      const datalist = stateList.map(s => `<option value="${escapeHTML(s.entity_id)}" label="${escapeHTML(s.attributes?.friendly_name || "")}"></option>`).join("");
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;color:var(--primary-text-color);font:inherit}
        .st-editor{display:grid;gap:12px;padding:6px 2px 18px}
        h3{margin:10px 0 0;padding-bottom:7px;border-bottom:1px solid var(--divider-color,#8885);font-size:15px}
        .st-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        @media(max-width:390px){.st-grid{grid-template-columns:1fr}}
        label{display:grid;gap:4px;font-size:12px;font-weight:600}
        input:not([type=checkbox]),select{font:inherit;font-size:14px;width:100%;min-width:0;box-sizing:border-box;padding:9px;border:1px solid var(--divider-color,#8887);border-radius:8px;color:var(--primary-text-color);background:var(--card-background-color,#20252b)}
        input[type=color]{min-height:40px;padding:3px}
        input[type=checkbox]{accent-color:var(--primary-color);width:17px;height:17px}
        .st-checkbox{display:flex;align-items:center;flex-direction:row;gap:8px;font-size:13px;font-weight:500}
        .st-icon-select{display:flex;align-items:center;gap:8px;min-width:0}
        .st-icon-select select{flex:1}
        ha-icon.st-icon-preview{flex-shrink:0;--mdc-icon-size:22px;color:var(--primary-color,#14bdcd)}
        .st-entity-row{display:grid;gap:9px;padding:12px;border:1px solid var(--divider-color,#8886);border-radius:10px}
        .st-head{display:flex;justify-content:space-between;align-items:center;gap:7px}
        .st-tools{display:flex;gap:4px}
        button{cursor:pointer;padding:7px 10px;border:1px solid var(--divider-color,#8886);border-radius:7px;background:var(--secondary-background-color,#5552);color:var(--primary-text-color)}
        button:disabled{opacity:.35;cursor:default}
        .st-add{padding:11px;border:1px dashed var(--primary-color,#0ac);font-weight:700}
        .st-hint{font-size:12px;line-height:1.5;color:var(--secondary-text-color,#888)}
        .st-theme-preview{display:flex;align-items:center;gap:0;background:var(--p-bg);color:var(--p-fg);min-width:0;min-height:46px;border-radius:12px;border:1px solid var(--p-border);overflow:hidden}
        .st-preview-label{align-self:stretch;display:flex;align-items:center;padding:0 25px 0 11px;flex-shrink:0;max-width:40%;box-sizing:border-box;clip-path:polygon(0 0,calc(100% - 11px) 0,100% 50%,calc(100% - 11px) 100%,0 100%);background:var(--p-accent);color:var(--p-label-fg);font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden}
        .st-preview-items{min-width:0;display:flex;align-items:center;gap:8px;white-space:nowrap;overflow:hidden;padding:0 12px;font-size:12px}
        .st-preview-items span{color:var(--p-secondary)}
        .st-preview-items b{font-size:13px;color:var(--p-fg)}
        .st-preview-items i{color:var(--p-separator);font-style:normal}
        .st-preview-items ha-icon{color:var(--p-icon);--mdc-icon-size:16px}

      </style><div class="st-editor">
        <h3>Home-Assistant-Entitäten</h3>
        <datalist id="st-entity-list">${datalist}</datalist>
        ${c.entities.map((row, idx) => this._entityRow(row,idx)).join("")}
        <button class="st-add" data-add ${c.entities.length >= MAX_ENTITIES ? "disabled" : ""}>+ Entität hinzufügen</button>
        <div class="st-hint">Bis zu ${MAX_ENTITIES} Entitäten pro Karte. Zustand und Maßeinheit werden automatisch von Home Assistant übernommen; es gibt keine eigenen Attribute oder Einheiten pro Eintrag. Ein Klick auf einen Wert öffnet die Entitätsdetails.</div>
        <h3>Design</h3>
        <label>Theme<select data-field="theme">${options(THEME_OPTIONS, c.theme)}</select></label>
        ${this._themePreview()}
        <label>Beschriftung links<input data-field="title" maxlength="32" placeholder="SENSORS" value="${escapeHTML(c.title)}"></label>
        ${c.theme === "custom" ? `<div class="st-grid">${[["bg","Hintergrund"],["fg","Werte / Haupttext"],["accent","Titel-Hintergrund"],["label_fg","Titel-Schrift"],["secondary","Sensornamen"],["separator","Trennsymbole"],["icon","Icons"],["border","Rahmen"]].map(([key,name]) => `<label>${name}<input type="color" data-color="${key}" value="${c.colors[key]}"></label>`).join("")}</div>
        <label class="st-checkbox"><input type="checkbox" data-bool="transparent_bg" ${c.transparent_bg ? "checked" : ""}> Transparenter Hintergrund</label>` : ""}
        <div class="st-grid">
          <label>Höhe (px)<input type="number" min="38" max="120" data-field="height" value="${c.height}"></label>
          <label>Schriftgröße (px)<input type="number" min="11" max="28" data-field="font_size" value="${c.font_size}"></label>
        </div>
        <h3>Animation</h3>
        <label>Bewegung<select data-field="mode">${options([["continuous","Endlos-Laufschrift"],["slide","Einzeln ein-/ausfahren"],["fade","Einzeln überblenden"]], c.mode)}</select></label>
        ${c.mode === "continuous" ? `<label>Geschwindigkeit (Pixel/Sekunde)<input type="number" min="20" max="200" step="5" data-field="speed" value="${c.speed}"></label>` : `<label>Anzeigedauer (Sekunden)<input type="number" min="3" max="30" data-field="interval" value="${c.interval}"></label>`}
        <label class="st-checkbox"><input type="checkbox" data-bool="pause_on_hover" ${c.pause_on_hover ? "checked" : ""}> Bei Mausberührung pausieren</label>
        <h3>Anzeige</h3>
        <label class="st-checkbox"><input type="checkbox" data-bool="show_names" ${c.show_names ? "checked" : ""}> Entitätsnamen anzeigen</label>
        <label class="st-checkbox"><input type="checkbox" data-bool="show_icons" ${c.show_icons ? "checked" : ""}> Icons anzeigen</label>
        <label class="st-checkbox"><input type="checkbox" data-bool="show_units" ${c.show_units ? "checked" : ""}> Einheiten anzeigen</label>
        <label class="st-checkbox"><input type="checkbox" data-bool="show_clock" ${c.show_clock ? "checked" : ""}> Uhrzeit rechts anzeigen</label>
        <div class="st-hint">Keine Integration und keine RSS-Verbindung nötig. Alle Werte werden direkt aus der Home-Assistant-Oberfläche gelesen.</div>
      </div>`;
      this.shadowRoot.querySelectorAll("[data-field]").forEach(el => el.addEventListener("change", () => this._change({ [el.dataset.field]: el.value })));
      this.shadowRoot.querySelectorAll("[data-bool]").forEach(el => el.addEventListener("change", () => this._change({ [el.dataset.bool]: el.checked })));
      this.shadowRoot.querySelectorAll("[data-color]").forEach(el => el.addEventListener("change", () => this._change({ colors: { ...this._config.colors, [el.dataset.color]: el.value } })));
      this.shadowRoot.querySelectorAll(".st-entity-row").forEach(container => {
        const idx = Number(container.dataset.idx);
        container.querySelectorAll("[data-entry]").forEach(el => el.addEventListener("change", () => this._changeEntity(idx, el.dataset.entry, el.type === "checkbox" ? el.checked : el.value)));
        container.querySelector("[data-icon-select]").addEventListener("change", (event) => {
          const icon = event.target.value;
          if (icon === "__custom__") {
            this._customIconRows.add(idx);
            this._render();
            this.shadowRoot.querySelector(`.st-entity-row[data-idx="${idx}"] [data-entry="icon"]`)?.focus();
          } else {
            this._customIconRows.delete(idx);
            this._changeEntity(idx, "icon", icon);
          }
        });
        container.querySelector("[data-remove]").addEventListener("click", () => this._change({ entities: this._config.entities.filter((_,i) => i !== idx) }));
        container.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", () => {
          const next = idx + (button.dataset.move === "up" ? -1 : 1);
          if (next < 0 || next >= this._config.entities.length) return;
          const entities = [...this._config.entities]; [entities[idx], entities[next]] = [entities[next], entities[idx]];
          this._change({ entities });
        }));
      });
      this.shadowRoot.querySelector("[data-add]").addEventListener("click", () => {
        if (this._config.entities.length < MAX_ENTITIES) this._change({ entities: [...this._config.entities, blank()] });
      });
    }
  }

  if (!customElements.get("sensor-ticker-card")) customElements.define("sensor-ticker-card", SensorTickerCard);
  if (!customElements.get("sensor-ticker-card-editor")) customElements.define("sensor-ticker-card-editor", SensorTickerCardEditor);
  // Do not replace the global array; that can break registration of other cards.
  if (!Array.isArray(window.customCards)) window.customCards = [];
  const metadata = {
    type: "sensor-ticker-card", name: "Sensor Ticker Card",
    description: "Live-Ticker für Home-Assistant-Entitäten mit grafischem Editor",
    preview: false,
  };
  const registered = window.customCards.find(entry => entry?.type === metadata.type);
  if (registered) Object.assign(registered, metadata);
  else window.customCards.push(metadata);
  console.info(`%c SENSOR TICKER CARD %c ${VERSION} `, "background:#14bdcd;color:#111;font-weight:700", "background:#18242e;color:#fff");
})();
