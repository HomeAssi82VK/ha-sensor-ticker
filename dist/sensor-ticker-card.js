/*
 * Sensor Ticker Card v1.1.0 (Multi-Row) by HomeAssi82VK.
 * Backward compatible with single-row configurations from v1.0.1.
 * No network requests, no backend, no external dependencies.
 */
(() => {
  "use strict";

  const VERSION = "1.1.0";
  const CARD_TAG = "sensor-ticker-card";
  const EDITOR_TAG = "sensor-ticker-card-editor";
  const MAX_ROWS = 12;
  const MAX_ENTITIES = 30;
  const THEMES = {
    default: { bg: "#081a24", fg: "#eefaff", accent: "#04bcd5", separator: "#48c4d7", secondary: "#92b8c8", border: "#245365", icon: "#00dbec", label_fg: "#ffffff" },
    dark:    { bg: "#080b11", fg: "#f4f8ff", accent: "#126ddb", separator: "#628ca8", secondary: "#b1c4d5", border: "#23384a", icon: "#2bb3ff", label_fg: "#ffffff" },
    light:   { bg: "#f0f6fc", fg: "#1a2b41", accent: "#137ce8", separator: "#4777a5", secondary: "#506d89", border: "#b8cfdf", icon: "#086fc9", label_fg: "#ffffff" },
    blue:    { bg: "#071637", fg: "#f0f7ff", accent: "#1551bd", separator: "#6699eb", secondary: "#a8c5f3", border: "#2150a2", icon: "#33c7ff", label_fg: "#ffffff" },
    purple:  { bg: "#1a0c2b", fg: "#fbf2ff", accent: "#8e27d2", separator: "#b77deb", secondary: "#d0b3e8", border: "#6b2d90", icon: "#d67cff", label_fg: "#ffffff" },
  };
  const THEME_OPTIONS = [
    ["default", "Default · Cyan"], ["dark", "Dark · Dunkelblau"],
    ["light", "Light · Hell"], ["blue", "Blue · Marineblau"],
    ["purple", "Purple · Violett"], ["custom", "Custom · Eigene Farben"],
  ];
  const DEFAULT_ROW = {
    title: "SENSORS", entities: [], theme: "default", mode: "continuous",
    speed: 62, interval: 6, height: 58, font_size: 15,
    show_clock: false, show_names: true, show_icons: true,
    show_units: true, pause_on_hover: true, transparent_bg: false,
    title_shape: "pointed", title_width: null, border_mode: "none", border_color: "",
    colors: { ...THEMES.default },
  };
  const blankEntity = () => ({ entity: "", name: "", icon: "", decimals: "auto", enabled: true });
  const html = (v) => String(v ?? "").replace(/[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const clamp = (v, min, max, fallback) => {
    if (v === "" || v === null || v === undefined || !Number.isFinite(Number(v))) return fallback;
    return Math.min(max, Math.max(min, Number(v)));
  };
  const isHex = (v) => typeof v === "string" && /^#[a-f0-9]{6}$/i.test(v);
  const copy = (data) => JSON.parse(JSON.stringify(data));
  const optionTags = (list, selected) => list.map(([id, title]) =>
    `<option value="${html(id)}" ${String(id) === String(selected) ? "selected" : ""}>${html(title)}</option>`).join("");

  const ICON_OPTIONS = [
    ["", "Automatisch (Home Assistant)"], ["mdi:thermometer", "Temperatur"],
    ["mdi:thermometer-water", "Wassertemperatur"], ["mdi:water-percent", "Luftfeuchtigkeit"],
    ["mdi:weather-sunny", "Sonne"], ["mdi:weather-cloudy", "Wolken"],
    ["mdi:weather-rainy", "Regen"], ["mdi:weather-windy", "Wind"],
    ["mdi:gauge", "Messwert / Sensor"], ["mdi:chart-line", "Verlauf"],
    ["mdi:flash", "Strom / Leistung"], ["mdi:lightning-bolt", "Elektrizität"],
    ["mdi:transmission-tower", "Stromnetz"], ["mdi:solar-power", "Photovoltaik"],
    ["mdi:solar-panel", "Solarmodul"], ["mdi:battery", "Batterie"],
    ["mdi:water", "Wasser"], ["mdi:fire", "Gas / Heizung"],
    ["mdi:radiator", "Heizkörper"], ["mdi:thermostat", "Thermostat"],
    ["mdi:door", "Tür"], ["mdi:door-open", "Tür offen"],
    ["mdi:window-open", "Fenster"], ["mdi:motion-sensor", "Bewegung"],
    ["mdi:shield-home", "Sicherheit"], ["mdi:alarm-light", "Alarm"],
    ["mdi:lightbulb-outline", "Licht"], ["mdi:toggle-switch-outline", "Schalter"],
    ["mdi:power-plug", "Steckdose"], ["mdi:washing-machine", "Waschmaschine"],
    ["mdi:dishwasher", "Spülmaschine"], ["mdi:robot-vacuum", "Saugroboter"],
    ["mdi:robot-mower", "Mähroboter"], ["mdi:cctv", "Kamera"],
    ["mdi:wifi", "WLAN"], ["mdi:server", "Server"], ["mdi:home", "Haus"],
    ["mdi:account", "Person"], ["mdi:car", "Auto"], ["mdi:music", "Musik"],
    ["mdi:clock-outline", "Zeit"], ["mdi:calendar", "Kalender"],
    ["mdi:information-outline", "Info"],
  ];
  const KNOWN_ICONS = new Set(ICON_OPTIONS.map(([v]) => v));
  const iconFor = (id) => ({
    sensor: "mdi:gauge", binary_sensor: "mdi:checkbox-marked-circle-outline",
    climate: "mdi:thermostat", weather: "mdi:weather-partly-cloudy",
    light: "mdi:lightbulb-outline", switch: "mdi:toggle-switch-outline",
    person: "mdi:account", device_tracker: "mdi:cellphone-marker",
    cover: "mdi:window-shutter", lock: "mdi:lock-outline", fan: "mdi:fan",
    media_player: "mdi:play-circle-outline", input_number: "mdi:numeric",
    number: "mdi:numeric", counter: "mdi:counter",
    input_boolean: "mdi:toggle-switch-outline", sun: "mdi:weather-sunny",
    timer: "mdi:timer-outline", automation: "mdi:robot-outline",
    script: "mdi:script-text-outline",
  })[String(id || "").split(".")[0]] || "mdi:information-outline";

  function normalizeRow(raw = {}) {
    const c = { ...DEFAULT_ROW, ...(raw && typeof raw === "object" ? raw : {}) };
    c.entities = (Array.isArray(c.entities) ? c.entities : []).slice(0, MAX_ENTITIES).map((e) => ({
      entity: String(typeof e === "string" ? e : e?.entity || "").trim(),
      name: String(e && typeof e === "object" ? e.name || "" : "").trim().slice(0, 90),
      icon: String(e && typeof e === "object" ? e.icon || "" : "").trim().slice(0, 80),
      decimals: ["auto", "0", "1", "2", "3"].includes(String(e?.decimals ?? "auto")) ? String(e.decimals ?? "auto") : "auto",
      enabled: e?.enabled !== false,
    }));
    c.title = String(c.title ?? "").slice(0, 32);
    const legacyTheme = { nightglow: "default", tv: "blue", minimal: "dark", transparent: "custom" };
    c.theme = legacyTheme[c.theme] || c.theme;
    if (raw.theme === "transparent") c.transparent_bg = true;
    if (![...Object.keys(THEMES), "custom"].includes(c.theme)) c.theme = "default";
    c.colors = { ...THEMES.default, ...(c.colors && typeof c.colors === "object" ? c.colors : {}) };
    for (const key of Object.keys(THEMES.default)) if (!isHex(c.colors[key])) c.colors[key] = THEMES.default[key];
    c.transparent_bg = c.transparent_bg === true;
    c.title_shape = ["pointed", "rounded", "straight"].includes(c.title_shape) ? c.title_shape : "pointed";
    // null = automatic: natural width or shared width when global alignment is on.
    // A numeric value is an explicit pixel width for THIS ticker row only.
    c.title_width = c.title_width === null || c.title_width === undefined || c.title_width === ""
      ? null : Math.round(clamp(c.title_width, 55, 360, 140));
    c.border_mode = ["none", "line", "frame"].includes(c.border_mode) ? c.border_mode : "none";
    c.border_color = isHex(c.border_color) ? c.border_color : "";
    if (!["continuous", "slide", "fade"].includes(c.mode)) c.mode = "continuous";
    c.speed = clamp(c.speed, 20, 200, 62);
    c.interval = clamp(c.interval, 3, 30, 6);
    c.height = clamp(c.height, 38, 120, 58);
    c.font_size = clamp(c.font_size, 11, 28, 15);
    for (const key of ["show_names", "show_icons", "show_units", "pause_on_hover"])
      c[key] = c[key] !== false;
    c.show_clock = c.show_clock === true;
    return c;
  }

  function normalizeConfig(raw = {}) {
    if (!raw || typeof raw !== "object") raw = {};
    // Existing v1.0.1 single-row YAML works unchanged (same card type).
    const legacyRow = { ...raw };
    for (const key of ["rows", "type", "row_gap", "outer_border", "align_titles"]) delete legacyRow[key];
    const givenRows = Array.isArray(raw.rows) ? raw.rows.slice(0, MAX_ROWS) : [legacyRow];
    const rows = (givenRows.length ? givenRows : [DEFAULT_ROW]).map(normalizeRow);
    return {
      type: `custom:${CARD_TAG}`,
      row_gap: clamp(raw.row_gap, 0, 24, 0),
      outer_border: raw.outer_border !== false,
      // Opt-in, so existing v1.0.1 dashboards retain their natural title widths.
      align_titles: raw.align_titles === true,
      rows,
    };
  }

  const deLocale = (hass) => String(hass?.locale?.language || "de").toLowerCase().startsWith("de");
  function translatedState(obj, hass) {
    const raw = String(obj.state ?? "");
    const domain = String(obj.entity_id || "").split(".")[0];
    const de = deLocale(hass);
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
      try { const x = hass.formatEntityState(obj); if (typeof x === "string" && x) return x; } catch (_) { /* HA formatters vary */ }
    }
    return raw;
  }
  function displayFor(entity, hass, units) {
    const obj = hass?.states?.[entity.entity];
    if (!obj) return {
      name: entity.name || entity.entity, value: deLocale(hass) ? "Nicht gefunden" : "Not found",
      icon: entity.icon || iconFor(entity.entity), unavailable: true,
    };
    const raw = obj.state;
    const unit = String(obj.attributes?.unit_of_measurement ?? "");
    const numeric = raw != null && String(raw).trim() !== "" && Number.isFinite(Number(raw));
    let value;
    if (numeric) {
      const precision = entity.decimals === "auto" ? Math.min(2, (String(raw).split(".")[1] || "").length) : Number(entity.decimals);
      try {
        value = new Intl.NumberFormat(hass?.locale?.language || "de-DE", {
          minimumFractionDigits: precision, maximumFractionDigits: precision,
        }).format(Number(raw));
      } catch (_) { value = String(raw); }
      if (units && unit) value += ` ${unit}`;
    } else value = raw == null ? "–" : translatedState(obj, hass);
    return {
      name: entity.name || obj.attributes?.friendly_name || entity.entity,
      value, icon: entity.icon || obj.attributes?.icon || iconFor(entity.entity),
      unavailable: ["unknown", "unavailable"].includes(obj.state),
    };
  }

  function rowPalette(row) {
    const p = row.theme === "custom" ? row.colors : THEMES[row.theme];
    return {
      ...p,
      // Transparency applies to *every* theme and must show the dashboard,
      // rather than an opaque outer ha-card background.
      bg: row.transparent_bg ? "transparent" : p.bg,
      border: row.border_color || p.border,
    };
  }
  const CSS = `
    :host{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box;contain:inline-size}
    ha-card{display:grid;gap:var(--st-row-gap,0px);width:100%;max-width:100%;min-width:0;box-sizing:border-box;overflow:hidden;background:transparent!important;background-color:transparent!important;color:var(--primary-text-color);border:var(--st-outer-border-width,1px) solid var(--st-outer-border);border-radius:14px;box-shadow:var(--st-outer-shadow,0 3px 12px #00000016)}
    .st-bar{height:var(--st-height);box-sizing:border-box;display:flex;align-items:center;min-width:0;width:100%;overflow:hidden;background:var(--st-bg);color:var(--st-fg);border:0 solid transparent}
    /* Draw optional borders inward: real CSS borders shift a framed row's
       content by one pixel, so even identical title widths cannot align. */
    .st-bar.st-border-frame{box-shadow:inset 0 0 0 1px var(--st-border)}
    .st-bar.st-border-line:not(:first-child){box-shadow:inset 0 1px 0 var(--st-border)}
    .st-label{align-self:stretch;z-index:1;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(110deg,var(--st-accent),color-mix(in srgb,var(--st-accent) 82%,#05162b));color:var(--st-label-fg);padding:0 27px 0 15px;font-size:12px;font-weight:800;max-width:32%;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap}
    .st-label.shape-pointed{clip-path:polygon(0 0,calc(100% - 13px) 0,100% 50%,calc(100% - 13px) 100%,0 100%)}
    .st-label.shape-rounded{border-radius:0 99px 99px 0;padding-right:18px}
    .st-label.shape-straight{padding-right:15px}
    /* Both modes use a real, fixed first grid track: automatic shared
       width or an explicit width belonging to the individual row.
       The manual setting wins over the optional global alignment. */
    .st-aligned-titles .st-bar.st-has-title,
    .st-bar.st-manual-title.st-has-title{
      display:grid;
      grid-template-columns:minmax(0,min(var(--st-effective-title-width,0px),70%)) minmax(0,1fr) auto;
      align-items:center;
    }
    .st-aligned-titles .st-bar.st-has-title .st-label:not(.st-label-measure),
    .st-bar.st-manual-title.st-has-title .st-label:not(.st-label-measure){
      grid-column:1;
      width:100%;
      min-width:0;
      max-width:none;
      height:100%;
      box-sizing:border-box;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .st-aligned-titles .st-bar.st-has-title .st-viewport,
    .st-bar.st-manual-title.st-has-title .st-viewport{grid-column:2}
    .st-aligned-titles .st-bar.st-has-title .st-clock,
    .st-bar.st-manual-title.st-has-title .st-clock{grid-column:3}

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
    .st-bar.st-pause:hover .st-track,.st-bar.st-pause:hover .st-single-inner{animation-play-state:paused}
    @media(prefers-reduced-motion:reduce){.st-track,.st-single-inner{animation:none!important}.st-copy{display:none}}
  `;

  // One controller per visible ticker row: individual animation state and timers.
  class TickerRow {
    constructor(card, element, config) {
      this.card = card;
      this.bar = element;
      this.config = config;
      this.viewport = element.querySelector(".st-viewport");
      this.index = 0;
      this.hover = false;
      this.frame = 0;
      this.baseNodes = null;
      this.lastHass = null;
      this.itemTimer = null;
      this.clockTimer = null;
      this.resizeObserver = null;
      this.bar.addEventListener("mouseenter", () => { this.hover = true; });
      this.bar.addEventListener("mouseleave", () => { this.hover = false; });
      this.viewport.addEventListener("click", (e) => this.openEntity(e));
      this.viewport.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (!e.target?.closest?.(".st-unit")) return;
          e.preventDefault(); this.openEntity(e);
        }
      });
      this.build();
    }
    activeEntries() {
      return this.config.entities.map((entity, index) => ({ entity, index }))
        .filter(({ entity }) => entity.enabled && entity.entity);
    }
    makeUnit(entity, index) {
      const unit = document.createElement("span");
      unit.className = "st-unit";
      unit.dataset.entityIndex = String(index);
      unit.setAttribute("role", "button");
      unit.setAttribute("tabindex", "0");
      unit.setAttribute("title", entity.entity);
      if (this.config.show_icons) {
        const icon = document.createElement("ha-icon"); icon.className = "st-icon"; unit.append(icon);
      }
      if (this.config.show_names) {
        const name = document.createElement("span"); name.className = "st-name"; unit.append(name);
      }
      const value = document.createElement("span"); value.className = "st-value"; unit.append(value);
      return unit;
    }
    appendUnits(parent) {
      for (const { entity, index } of this.activeEntries()) {
        parent.append(this.makeUnit(entity, index));
        const sep = document.createElement("span"); sep.className = "st-separator";
        sep.textContent = "✦"; sep.setAttribute("aria-hidden", "true"); parent.append(sep);
      }
    }
    build() {
      const entries = this.activeEntries();
      if (!entries.length) {
        const empty = document.createElement("div"); empty.className = "st-empty";
        empty.textContent = "Entitäten im grafischen Karteneditor hinzufügen";
        this.viewport.append(empty);
      } else if (this.config.mode === "continuous") {
        this.track = document.createElement("div"); this.track.className = "st-track";
        this.group = document.createElement("div"); this.group.className = "st-group";
        this.mirror = document.createElement("div"); this.mirror.className = "st-group st-copy";
        this.mirror.setAttribute("aria-hidden", "true");
        this.appendUnits(this.group);
        this.track.append(this.group, this.mirror);
        this.viewport.append(this.track);
        if (typeof ResizeObserver !== "undefined") {
          this.resizeObserver = new ResizeObserver(() => this.queueLayout());
          this.resizeObserver.observe(this.viewport);
        }
        this.queueLayout();
      } else {
        this.single = document.createElement("div"); this.single.className = "st-single";
        this.viewport.append(this.single);
        this.showSingle();
        if (entries.length > 1) {
          this.itemTimer = setInterval(() => {
            if (this.config.pause_on_hover && this.hover) return;
            this.index = (this.index + 1) % entries.length;
            this.showSingle();
          }, this.config.interval * 1000);
        }
      }
      if (this.config.show_clock) {
        this.updateClock();
        this.clockTimer = setInterval(() => this.updateClock(), 15000);
      }
    }
    showSingle() {
      if (!this.single) return;
      const entries = this.activeEntries();
      if (!entries.length) return;
      const { entity, index } = entries[this.index % entries.length];
      const wrap = document.createElement("span"); wrap.className = "st-single-inner";
      wrap.style.animationDuration = `${this.config.interval}s`;
      wrap.append(this.makeUnit(entity, index));
      this.single.replaceChildren(wrap);
      this.updateValues(true);
    }
    updateClock() {
      const el = this.bar.querySelector(".st-clock");
      if (el) el.textContent = new Intl.DateTimeFormat(this.card.hassObject?.locale?.language || "de-DE", {
        hour: "2-digit", minute: "2-digit",
      }).format(new Date());
    }
    setHass(hass) {
      const previous = this.lastHass;
      this.lastHass = hass;
      const changed = !previous || previous.locale?.language !== hass?.locale?.language ||
        this.activeEntries().some(({ entity }) => previous.states?.[entity.entity] !== hass?.states?.[entity.entity]);
      if (changed) this.updateValues();
    }
    updateValues(force = false) {
      const hass = this.card.hassObject;
      if (!hass || !this.card.isConnected) return;
      for (const node of this.viewport.querySelectorAll(".st-unit[data-entity-index]")) {
        const row = this.config.entities[Number(node.dataset.entityIndex)];
        if (!row) continue;
        const view = displayFor(row, hass, this.config.show_units);
        const name = node.querySelector(".st-name");
        const value = node.querySelector(".st-value");
        const icon = node.querySelector(".st-icon");
        if (name && (force || name.textContent !== `${view.name}:`)) name.textContent = `${view.name}:`;
        if (value && (force || value.textContent !== view.value)) value.textContent = view.value;
        if (icon && icon.getAttribute("icon") !== view.icon) icon.setAttribute("icon", view.icon);
        node.classList.toggle("st-unavailable", Boolean(view.unavailable));
      }
      this.queueLayout();
    }
    queueLayout() {
      if (this.config.mode !== "continuous" || this.frame || !this.card.isConnected) return;
      this.frame = requestAnimationFrame(() => { this.frame = 0; this.layoutTrack(); });
    }
    layoutTrack() {
      if (!this.card.isConnected || !this.track || !this.group || !this.mirror) return;
      const visible = this.viewport.clientWidth;
      if (visible < 1 || this.group.scrollWidth < 1) return;
      if (!this.baseNodes) this.baseNodes = Array.from(this.group.childNodes, el => el.cloneNode(true));
      let iterations = 0;
      while (this.group.scrollWidth < visible && iterations++ < 70) {
        for (const node of this.baseNodes) this.group.append(node.cloneNode(true));
      }
      this.mirror.replaceChildren(...Array.from(this.group.childNodes, n => n.cloneNode(true)));
      // Mirrored marquee is decorative, not keyboard-focusable.
      this.mirror.querySelectorAll(".st-unit").forEach(node => node.setAttribute("tabindex", "-1"));
      const width = this.group.getBoundingClientRect().width;
      const distance = `${width}px`;
      const duration = `${Math.max(3, width / this.config.speed).toFixed(2)}s`;
      if (this.track.style.getPropertyValue("--st-distance") !== distance)
        this.track.style.setProperty("--st-distance", distance);
      if (this.track.style.getPropertyValue("--st-duration") !== duration)
        this.track.style.setProperty("--st-duration", duration);
      this.updateValuesNoLayout();
    }
    // Populate text in newly repeated nodes without recursively relaying out the track.
    updateValuesNoLayout() {
      const hass = this.card.hassObject;
      if (!hass) return;
      for (const node of this.viewport.querySelectorAll(".st-unit[data-entity-index]")) {
        const entity = this.config.entities[Number(node.dataset.entityIndex)];
        if (!entity) continue;
        const view = displayFor(entity, hass, this.config.show_units);
        const name = node.querySelector(".st-name");
        const value = node.querySelector(".st-value");
        const icon = node.querySelector(".st-icon");
        if (name) name.textContent = `${view.name}:`;
        if (value) value.textContent = view.value;
        if (icon) icon.setAttribute("icon", view.icon);
        node.classList.toggle("st-unavailable", Boolean(view.unavailable));
      }
    }
    openEntity(event) {
      const unit = event.target?.closest?.(".st-unit");
      if (!unit || !this.viewport.contains(unit)) return;
      const entityId = this.config.entities[Number(unit.dataset.entityIndex)]?.entity;
      if (entityId) this.card.dispatchEvent(new CustomEvent("hass-more-info", {
        bubbles: true, composed: true, detail: { entityId },
      }));
    }
    destroy() {
      if (this.frame) cancelAnimationFrame(this.frame);
      if (this.itemTimer) clearInterval(this.itemTimer);
      if (this.clockTimer) clearInterval(this.clockTimer);
      this.resizeObserver?.disconnect();
      this.itemTimer = null; this.clockTimer = null; this.frame = 0;
    }
  }

  class SensorTickerCard extends HTMLElement {
    static getConfigElement() { return document.createElement(EDITOR_TAG); }
    static getStubConfig() {
      const cfg = normalizeConfig();
      delete cfg.type;
      return cfg;
    }
    constructor() {
      super(); this.attachShadow({ mode: "open" });
      this.config = normalizeConfig();
      this.controllers = [];
      this.hassObject = null;
      this._titleResizeObserver = null;
    }
    setConfig(raw) {
      if (!raw || typeof raw !== "object") throw new Error("Sensor Ticker: ungültige Konfiguration");
      this.config = normalizeConfig(raw);
      if (this.isConnected) this.render();
    }
    set hass(hass) {
      this.hassObject = hass;
      for (const row of this.controllers) row.setHass(hass);
    }
    connectedCallback() { this.render(); }
    disconnectedCallback() { this.cleanup(); }
    cleanup() {
      this._titleResizeObserver?.disconnect();
      this._titleResizeObserver = null;
      for (const c of this.controllers) c.destroy();
      this.controllers = [];
    }
    getCardSize() {
      const total = this.config.rows.reduce((sum, r) => sum + r.height, 0) +
        Math.max(0, this.config.rows.length - 1) * this.config.row_gap;
      return Math.max(1, Math.ceil(total / 50));
    }
    getGridOptions() {
      const total = this.config.rows.reduce((sum, r) => sum + r.height, 0) +
        Math.max(0, this.config.rows.length - 1) * this.config.row_gap;
      return { columns: 12, rows: Math.max(1, Math.ceil(total / 56)), min_columns: 3, min_rows: 1 };
    }
    // Find the widest *natural* label (all title shapes and padding included),
    // then apply a single fixed pixel width across the card. In particular,
    // flexbox must not use each title's intrinsic min-content width as in test3.
    syncTitleWidths() {
      if (!this.config.align_titles) return;
      const container = this.shadowRoot.querySelector("ha-card");
      if (!container) return;
      let maximum = 0;
      let availableWidth = Infinity;
      for (const bar of container.querySelectorAll(".st-bar")) {
        const barWidth = bar.getBoundingClientRect().width;
        if (barWidth > 0) availableWidth = Math.min(availableWidth, barWidth);
        const label = bar.querySelector(".st-label");
        if (!label) continue;
        const measure = label.cloneNode(true);
        measure.classList.add("st-label-measure");
        measure.setAttribute("aria-hidden", "true");
        measure.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;max-width:none;width:max-content;min-width:0;white-space:nowrap;display:flex;flex:none;grid-column:auto;";
        bar.append(measure);
        maximum = Math.max(maximum, Math.ceil(measure.getBoundingClientRect().width));
        measure.remove();
      }
      // Preserve the original 32% label limit but calculate it *once*, not
      // relative to each row's possibly different inner width/border.
      const limit = Number.isFinite(availableWidth)
        ? Math.max(0, Math.floor(availableWidth * 0.32))
        : maximum;
      const shared = Math.min(maximum, limit);
      container.style.setProperty("--st-shared-title-width", `${shared}px`);
    }
    render() {
      if (!this.isConnected) return;
      this.cleanup();
      const outer = rowPalette(this.config.rows[0]);
      const anyTransparent = this.config.rows.some(r => r.transparent_bg);
      this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card style="--st-row-gap:${this.config.row_gap}px;--st-outer-border:${outer.border};--st-outer-border-width:${this.config.outer_border ? '1px' : '0px'};--st-outer-shadow:${anyTransparent ? 'none' : '0 3px 12px #00000016'}"></ha-card>`;
      const haCard = this.shadowRoot.querySelector("ha-card");
      haCard.classList.toggle("st-aligned-titles", this.config.align_titles);
      this.config.rows.forEach((row, i) => {
        const p = rowPalette(row);
        const rowTitleWidth = row.title_width !== null ? `${row.title_width}px` : "var(--st-shared-title-width,0px)";
        const vars = `--st-bg:${p.bg};--st-fg:${p.fg};--st-accent:${p.accent};--st-separator:${p.separator};--st-secondary:${p.secondary};--st-border:${p.border};--st-icon:${p.icon};--st-label-fg:${p.label_fg};--st-height:${row.height}px;--st-font:${row.font_size}px;--st-effective-title-width:${rowTitleWidth};`;
        const element = document.createElement("div");
        element.className = `st-bar mode-${row.mode} st-border-${row.border_mode}${row.title ? " st-has-title" : ""}${row.title_width !== null ? " st-manual-title" : ""}${row.pause_on_hover ? " st-pause" : ""}`;
        element.dataset.tickerRow = String(i);
        element.setAttribute("style", vars);
        element.innerHTML = `${row.title ? `<div class="st-label shape-${row.title_shape}">${html(row.title)}</div>` : ""}
          <div class="st-viewport" aria-label="Sensor Ticker Zeile ${i + 1}"></div>
          ${row.show_clock ? '<div class="st-clock" aria-label="Uhrzeit"></div>' : ""}`;
        haCard.append(element);
        this.controllers.push(new TickerRow(this, element, row));
      });
      this.syncTitleWidths();
      // Home Assistant can resize cards after render (Sections, edit mode,
      // responsive columns). Recalculate after any width change.
      if (this.config.align_titles && typeof ResizeObserver !== "undefined") {
        this._titleResizeObserver = new ResizeObserver(() => this.syncTitleWidths());
        this._titleResizeObserver.observe(haCard);
      }
      if (this.hassObject) for (const row of this.controllers) row.setHass(this.hassObject);
    }
  }

  class SensorTickerCardEditor extends HTMLElement {
    constructor() {
      super(); this.attachShadow({ mode: "open" });
      this.config = normalizeConfig(); this.activeIndex = 0;
      this.hassObject = null; this.entityCount = -1;
      this.customIcons = new Set();
    }
    setConfig(raw) {
      this.config = normalizeConfig(raw);
      this.activeIndex = Math.min(this.activeIndex, this.config.rows.length - 1);
      this.render();
    }
    set hass(hass) {
      this.hassObject = hass;
      const count = Object.keys(hass?.states || {}).length;
      if (count !== this.entityCount) {
        this.entityCount = count;
        if (this.isConnected) this.render();
      }
    }
    connectedCallback() { this.render(); }
    change(patch) {
      this.config = normalizeConfig({ ...this.config, ...patch });
      this.activeIndex = Math.min(this.activeIndex, this.config.rows.length - 1);
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: copy(this.config) }, bubbles: true, composed: true,
      }));
      this.render();
    }
    changeRow(patch) {
      const rows = this.config.rows.map(r => ({ ...r, entities: r.entities.map(e => ({ ...e })), colors: { ...r.colors } }));
      rows[this.activeIndex] = { ...rows[this.activeIndex], ...patch };
      this.change({ rows });
    }
    changeEntity(index, field, value) {
      const entities = this.config.rows[this.activeIndex].entities.map(e => ({ ...e }));
      entities[index][field] = value;
      this.changeRow({ entities });
    }
    themePreview(r) {
      const p = rowPalette(r);
      return `<div class="st-theme-preview mode-${r.border_mode}" style="--p-bg:${p.bg};--p-fg:${p.fg};--p-accent:${p.accent};--p-secondary:${p.secondary};--p-icon:${p.icon};--p-separator:${p.separator};--p-border:${p.border};--p-label-fg:${p.label_fg}">
        ${r.title ? `<span class="st-preview-label shape-${r.title_shape}">${html(r.title)}</span>` : ""}
        <span class="st-preview-items"><ha-icon icon="mdi:thermometer"></ha-icon><span>Raum:</span><b>22,4 °C</b><i>✦</i><ha-icon icon="mdi:flash"></ha-icon><b>450 W</b></span>
      </div>`;
    }
    entityMarkup(e, idx) {
      const index = this.activeIndex;
      const custom = this.customIcons.has(`${index}:${idx}`) || (Boolean(e.icon) && !KNOWN_ICONS.has(e.icon));
      const selected = this.hassObject?.states?.[e.entity];
      const icon = e.icon || selected?.attributes?.icon || iconFor(e.entity);
      return `<div class="st-entity-row" data-idx="${idx}">
        <div class="st-head"><strong>Entität ${idx + 1}</strong><span class="st-tools">
          <button type="button" data-move="up" title="Nach oben" ${idx === 0 ? "disabled" : ""}>↑</button>
          <button type="button" data-move="down" title="Nach unten" ${idx === this.config.rows[index].entities.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" data-remove title="Entfernen">✕</button>
        </span></div>
        <label>Home-Assistant-Entität<input data-entry="entity" list="st-entity-list" placeholder="sensor.wohnzimmer_temperatur" value="${html(e.entity)}" autocomplete="off"></label>
        <div class="st-grid">
          <label>Anzeigename (optional)<input data-entry="name" placeholder="z. B. Wohnzimmer" value="${html(e.name)}"></label>
          <label>Icon auswählen<span class="st-icon-select"><ha-icon class="st-icon-preview" icon="${html(icon)}"></ha-icon>
            <select data-icon-select>${optionTags([...ICON_OPTIONS, ["__custom__", "Eigenes MDI-Icon eingeben …"]], custom ? "__custom__" : e.icon)}</select>
          </span></label>
          ${custom ? `<label>Eigenes MDI-Icon<input data-entry="icon" placeholder="mdi:thermometer" value="${html(e.icon)}"></label>` : ""}
          <label>Nachkommastellen<select data-entry="decimals">${optionTags([['auto','Automatisch'],['0','0'],['1','1'],['2','2'],['3','3']], e.decimals)}</select></label>
        </div>
        <label class="st-checkbox"><input type="checkbox" data-entry="enabled" ${e.enabled ? "checked" : ""}> Entität anzeigen</label>
      </div>`;
    }
    render() {
      if (!this.isConnected) return;
      const cfg = this.config, row = cfg.rows[this.activeIndex];
      const datalist = Object.values(this.hassObject?.states || {})
        .sort((a, b) => a.entity_id.localeCompare(b.entity_id))
        .map(s => `<option value="${html(s.entity_id)}" label="${html(s.attributes?.friendly_name || "")}"></option>`).join("");
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;color:var(--primary-text-color);font:inherit}
        .st-editor{display:grid;gap:12px;padding:6px 2px 18px}
        h3{margin:10px 0 0;padding-bottom:7px;border-bottom:1px solid var(--divider-color,#8885);font-size:15px}
        h4{margin:4px 0;font-size:13px}
        .st-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        @media(max-width:390px){.st-grid{grid-template-columns:1fr}}
        label{display:grid;gap:4px;font-size:12px;font-weight:600}
        input:not([type=checkbox]),select{font:inherit;font-size:14px;width:100%;min-width:0;box-sizing:border-box;padding:9px;border:1px solid var(--divider-color,#8887);border-radius:8px;color:var(--primary-text-color);background:var(--card-background-color,#20252b)}
        input[type=color]{min-height:40px;padding:3px}
        input[type=range]{accent-color:var(--primary-color,#04bcd5);height:24px;padding:0;border:none;background:transparent;cursor:pointer}
        .st-width-control{display:grid;gap:8px;padding:10px;border:1px solid var(--divider-color,#8886);border-radius:9px}
        .st-width-control > label{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .st-width-control > label strong{font-size:12px;font-variant-numeric:tabular-nums}
        .st-width-controls{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end}
        .st-width-controls button{min-height:38px}
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
        .st-row-picker{display:grid;gap:7px}
        .st-row-choose{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:5px;padding:6px;border:1px solid var(--divider-color,#8886);border-radius:9px}
        .st-row-choose.active{border-color:var(--primary-color,#04bcd5);background:color-mix(in srgb,var(--primary-color,#04bcd5) 10%,transparent)}
        .st-row-choose .st-select-row{border:0;text-align:left;font-weight:650;background:transparent;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .st-row-choose .st-tools button{padding:6px 8px}
        .st-theme-preview{display:flex;align-items:center;gap:0;background:var(--p-bg);color:var(--p-fg);min-width:0;min-height:46px;border-radius:12px;overflow:hidden}
        .st-theme-preview.mode-frame{box-shadow:inset 0 0 0 1px var(--p-border)}
        .st-theme-preview.mode-line{border-bottom:1px solid var(--p-border)}
        .st-preview-label{align-self:stretch;display:flex;align-items:center;padding:0 25px 0 11px;flex-shrink:0;max-width:40%;box-sizing:border-box;background:var(--p-accent);color:var(--p-label-fg);font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden}
        .st-preview-label.shape-pointed{clip-path:polygon(0 0,calc(100% - 11px) 0,100% 50%,calc(100% - 11px) 100%,0 100%)}
        .st-preview-label.shape-rounded{border-radius:0 99px 99px 0;padding-right:16px}
        .st-preview-label.shape-straight{padding-right:11px}
        .st-preview-items{min-width:0;display:flex;align-items:center;gap:8px;white-space:nowrap;overflow:hidden;padding:0 12px;font-size:12px}
        .st-preview-items span{color:var(--p-secondary)}
        .st-preview-items b{font-size:13px;color:var(--p-fg)}
        .st-preview-items i{color:var(--p-separator);font-style:normal}
        .st-preview-items ha-icon{color:var(--p-icon);--mdc-icon-size:16px}
      </style><div class="st-editor">
        <h3>Tickerzeilen <small>(${cfg.rows.length}/${MAX_ROWS})</small></h3>
        <div class="st-row-picker">
          ${cfg.rows.map((r, idx) => `<div class="st-row-choose ${idx === this.activeIndex ? "active" : ""}" data-ridx="${idx}">
            <button type="button" class="st-select-row">Zeile ${idx + 1} · ${html(r.title || "Ohne Beschriftung")} (${r.entities.filter(e => e.enabled && e.entity).length} Sensoren)</button>
            <span class="st-tools">
              <button type="button" data-rowmove="up" title="Zeile nach oben" ${idx === 0 ? "disabled" : ""}>↑</button>
              <button type="button" data-rowmove="down" title="Zeile nach unten" ${idx === cfg.rows.length - 1 ? "disabled" : ""}>↓</button>
              <button type="button" data-duplicate title="Zeile duplizieren" ${cfg.rows.length >= MAX_ROWS ? "disabled" : ""}>⧉</button>
              <button type="button" data-rowremove title="Zeile löschen" ${cfg.rows.length === 1 ? "disabled" : ""}>✕</button>
            </span></div>`).join("")}
        </div>
        <button type="button" class="st-add" data-add-row ${cfg.rows.length >= MAX_ROWS ? "disabled" : ""}>+ Tickerzeile hinzufügen</button>
        <label>Abstand zwischen den Zeilen (px)<input type="number" min="0" max="24" data-global="row_gap" value="${cfg.row_gap}"></label>
        <label class="st-checkbox"><input type="checkbox" data-global-bool="outer_border" ${cfg.outer_border ? "checked" : ""}> Außenrahmen um die gesamte Karte anzeigen</label>
        <label class="st-checkbox"><input type="checkbox" data-global-bool="align_titles" ${cfg.align_titles ? "checked" : ""}> Nicht manuell eingestellte Titel automatisch angleichen</label>
        <div class="st-hint">Automatische Angleichung betrifft nur Zeilen ohne eigene Titelbreite. Im Design jeder Zeile kannst du die Breite mit einem Schieberegler individuell einstellen. Gleiche Pixelwerte fluchten exakt.</div>
        <div class="st-hint">Alle Zeilen gehören zu einer einzigen Karte. Jede Zeile hat eigene Sensoren, Optik und Animation. Ohne Abstand liegen sie direkt untereinander.</div>
        <h3>Einstellungen für Zeile ${this.activeIndex + 1}</h3>
        <h4>Home-Assistant-Entitäten</h4>
        <datalist id="st-entity-list">${datalist}</datalist>
        ${row.entities.map((e, idx) => this.entityMarkup(e, idx)).join("")}
        <button type="button" class="st-add" data-add-entity ${row.entities.length >= MAX_ENTITIES ? "disabled" : ""}>+ Entität hinzufügen</button>
        <div class="st-hint">Maximal ${MAX_ENTITIES} Entitäten je Zeile. Die Werte und Maßeinheiten kommen direkt von Home Assistant. Tippe auf einen Wert, um dessen Details zu öffnen.</div>
        <h3>Design · Zeile ${this.activeIndex + 1}</h3>
        <label>Theme<select data-field="theme">${optionTags(THEME_OPTIONS, row.theme)}</select></label>
        ${this.themePreview(row)}
        <label>Beschriftung links (optional)<input data-field="title" maxlength="32" placeholder="SENSORS" value="${html(row.title)}"></label>
        <label>Form der linken Beschriftung<select data-field="title_shape">${optionTags([["pointed", "Spitz"], ["rounded", "Rechts abgerundet"], ["straight", "Gerade / rechteckig"]], row.title_shape)}</select></label>
        <div class="st-width-control">
          <label for="st-title-slider">Titelbreite dieser Zeile <strong data-title-width-value>${row.title_width === null ? "Automatisch" : `${row.title_width} px`}</strong></label>
          <input id="st-title-slider" type="range" min="55" max="360" step="1" data-title-width value="${row.title_width ?? 140}" aria-label="Titelbreite Zeile ${this.activeIndex + 1} in Pixel">
          <div class="st-width-controls">
            <label>Breite genau (px)<input type="number" min="55" max="360" data-title-width-number value="${row.title_width ?? ""}" placeholder="Automatisch"></label>
            <button type="button" data-title-width-reset ${row.title_width === null ? "disabled" : ""}>Automatisch</button>
          </div>
          <div class="st-hint">Regler bewegen = feste Breite nur für diese Zeile. Gleiche Werte sorgen für bündige gerade Titelfelder.</div>
        </div>
        ${row.theme === "custom" ? `<div class="st-grid">${[["bg", "Hintergrund"], ["fg", "Werte / Haupttext"], ["accent", "Titel-Hintergrund"], ["label_fg", "Titel-Schrift"], ["secondary", "Sensornamen"], ["separator", "Trennsymbole"], ["icon", "Icons"]].map(([key, name]) => `<label>${name}<input type="color" data-color="${key}" value="${row.colors[key]}"></label>`).join("")}</div>
          ` : ""}
        <label class="st-checkbox"><input type="checkbox" data-bool="transparent_bg" ${row.transparent_bg ? "checked" : ""}> Transparenter Hintergrund dieser Zeile</label>
        <label>Zeilenumrandung / Trennung<select data-field="border_mode">${optionTags([["none", "Keine"], ["line", "Trennlinie"], ["frame", "Rahmen um diese Zeile"]], row.border_mode)}</select></label>
        <label>Rahmen- und Trennlinienfarbe<input type="color" data-row-border-color value="${row.border_color || rowPalette(row).border}"></label>
        <div class="st-hint">Die Rahmenfarbe wirkt auf den aktivierten Zeilenrahmen bzw. die Trennlinie. Der optionale Außenrahmen übernimmt die Rahmenfarbe der ersten Zeile.</div>
        <div class="st-grid">
          <label>Höhe (px)<input type="number" min="38" max="120" data-field="height" value="${row.height}"></label>
          <label>Schriftgröße (px)<input type="number" min="11" max="28" data-field="font_size" value="${row.font_size}"></label>
        </div>
        <h3>Animation · Zeile ${this.activeIndex + 1}</h3>
        <label>Bewegung<select data-field="mode">${optionTags([["continuous", "Endlos-Laufschrift"], ["slide", "Einzeln ein-/ausfahren"], ["fade", "Einzeln überblenden"]], row.mode)}</select></label>
        ${row.mode === "continuous" ? `<label>Geschwindigkeit (Pixel/Sekunde)<input type="number" min="20" max="200" step="5" data-field="speed" value="${row.speed}"></label>` : `<label>Anzeigedauer (Sekunden)<input type="number" min="3" max="30" data-field="interval" value="${row.interval}"></label>`}
        <label class="st-checkbox"><input type="checkbox" data-bool="pause_on_hover" ${row.pause_on_hover ? "checked" : ""}> Bei Mausberührung pausieren</label>
        <h3>Anzeige · Zeile ${this.activeIndex + 1}</h3>
        <label class="st-checkbox"><input type="checkbox" data-bool="show_names" ${row.show_names ? "checked" : ""}> Entitätsnamen anzeigen</label>
        <label class="st-checkbox"><input type="checkbox" data-bool="show_icons" ${row.show_icons ? "checked" : ""}> Icons anzeigen</label>
        <label class="st-checkbox"><input type="checkbox" data-bool="show_units" ${row.show_units ? "checked" : ""}> Einheiten anzeigen</label>
        <label class="st-checkbox"><input type="checkbox" data-bool="show_clock" ${row.show_clock ? "checked" : ""}> Uhrzeit rechts anzeigen</label>
        <div class="st-hint">Sensor Ticker Card ${VERSION}. Bis zu ${MAX_ROWS} individuell konfigurierbare Zeilen in einer Karte; ältere Single-Row-Konfigurationen bleiben nutzbar.</div>
      </div>`;

      this.shadowRoot.querySelectorAll("[data-global]").forEach(el => el.addEventListener("change", () => this.change({ [el.dataset.global]: el.value })));
      this.shadowRoot.querySelectorAll("[data-global-bool]").forEach(el => el.addEventListener("change", () => this.change({ [el.dataset.globalBool]: el.checked })));
      this.shadowRoot.querySelector("[data-row-border-color]")?.addEventListener("change", e => this.changeRow({ border_color: e.target.value }));
      // Per-row width slider. Preview number immediately; save configuration
      // only on release so HA does not restart animations on each mouse move.
      const titleSlider = this.shadowRoot.querySelector("[data-title-width]");
      titleSlider?.addEventListener("input", () => {
        this.shadowRoot.querySelector("[data-title-width-value]").textContent = `${titleSlider.value} px`;
        this.shadowRoot.querySelector("[data-title-width-number]").value = titleSlider.value;
      });
      titleSlider?.addEventListener("change", () => this.changeRow({ title_width: titleSlider.value }));
      this.shadowRoot.querySelector("[data-title-width-number]")?.addEventListener("change", e =>
        this.changeRow({ title_width: e.target.value === "" ? null : e.target.value }));
      this.shadowRoot.querySelector("[data-title-width-reset]")?.addEventListener("click", () =>
        this.changeRow({ title_width: null }));
      this.shadowRoot.querySelectorAll("[data-field]").forEach(el => el.addEventListener("change", () => this.changeRow({ [el.dataset.field]: el.value })));
      this.shadowRoot.querySelectorAll("[data-bool]").forEach(el => el.addEventListener("change", () => this.changeRow({ [el.dataset.bool]: el.checked })));
      this.shadowRoot.querySelectorAll("[data-color]").forEach(el => el.addEventListener("change", () => this.changeRow({ colors: { ...this.config.rows[this.activeIndex].colors, [el.dataset.color]: el.value } })));
      this.shadowRoot.querySelectorAll(".st-row-choose").forEach(box => {
        const index = Number(box.dataset.ridx);
        box.querySelector(".st-select-row").addEventListener("click", () => { this.activeIndex = index; this.render(); });
        box.querySelectorAll("[data-rowmove]").forEach(button => button.addEventListener("click", () => {
          const next = index + (button.dataset.rowmove === "up" ? -1 : 1);
          if (next < 0 || next >= this.config.rows.length) return;
          const rows = [...this.config.rows]; [rows[index], rows[next]] = [rows[next], rows[index]];
          if (this.activeIndex === index) this.activeIndex = next;
          else if (this.activeIndex === next) this.activeIndex = index;
          this.change({ rows });
        }));
        box.querySelector("[data-duplicate]").addEventListener("click", () => {
          if (this.config.rows.length >= MAX_ROWS) return;
          const rows = [...this.config.rows]; rows.splice(index + 1, 0, copy(rows[index]));
          this.activeIndex = index + 1; this.change({ rows });
        });
        box.querySelector("[data-rowremove]").addEventListener("click", () => {
          if (this.config.rows.length <= 1) return;
          const rows = this.config.rows.filter((_, idx) => idx !== index);
          if (this.activeIndex > index) this.activeIndex--;
          else if (this.activeIndex === index) this.activeIndex = Math.min(index, rows.length - 1);
          this.change({ rows });
        });
      });
      this.shadowRoot.querySelector("[data-add-row]").addEventListener("click", () => {
        if (this.config.rows.length >= MAX_ROWS) return;
        this.activeIndex = this.config.rows.length;
        this.change({ rows: [...this.config.rows, normalizeRow({ title: `TICKER ${this.activeIndex + 1}` })] });
      });
      this.shadowRoot.querySelectorAll(".st-entity-row").forEach(box => {
        const index = Number(box.dataset.idx);
        box.querySelectorAll("[data-entry]").forEach(el => el.addEventListener("change", () => this.changeEntity(index, el.dataset.entry, el.type === "checkbox" ? el.checked : el.value)));
        box.querySelector("[data-icon-select]").addEventListener("change", e => {
          if (e.target.value === "__custom__") {
            this.customIcons.add(`${this.activeIndex}:${index}`); this.render();
            this.shadowRoot.querySelector(`.st-entity-row[data-idx="${index}"] [data-entry="icon"]`)?.focus();
          } else {
            this.customIcons.delete(`${this.activeIndex}:${index}`);
            this.changeEntity(index, "icon", e.target.value);
          }
        });
        box.querySelector("[data-remove]").addEventListener("click", () => this.changeRow({
          entities: this.config.rows[this.activeIndex].entities.filter((_, idx) => idx !== index),
        }));
        box.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", () => {
          const next = index + (button.dataset.move === "up" ? -1 : 1);
          const entities = [...this.config.rows[this.activeIndex].entities];
          if (next < 0 || next >= entities.length) return;
          [entities[index], entities[next]] = [entities[next], entities[index]];
          this.changeRow({ entities });
        }));
      });
      this.shadowRoot.querySelector("[data-add-entity]").addEventListener("click", () => {
        const entities = this.config.rows[this.activeIndex].entities;
        if (entities.length < MAX_ENTITIES) this.changeRow({ entities: [...entities, blankEntity()] });
      });
    }
  }

  if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, SensorTickerCard);
  if (!customElements.get(EDITOR_TAG)) customElements.define(EDITOR_TAG, SensorTickerCardEditor);
  if (!Array.isArray(window.customCards)) window.customCards = [];
  const metadata = {
    type: CARD_TAG,
    name: "Sensor Ticker Card",
    description: "Bis zu 12 unabhängig konfigurierbare Sensor-Ticker-Zeilen in einer Karte",
    preview: false,
  };
  const existing = window.customCards.find(c => c?.type === CARD_TAG);
  if (existing) Object.assign(existing, metadata);
  else window.customCards.push(metadata);
  console.info(`%c SENSOR TICKER CARD %c ${VERSION} `, "background:#14bdcd;color:#111;font-weight:700", "background:#18242e;color:#fff");
})();
