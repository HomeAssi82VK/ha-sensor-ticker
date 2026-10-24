const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const registry = new Map();
const context = {
  HTMLElement: class { attachShadow() { this.shadowRoot = {}; } },
  customElements: { get: k => registry.get(k), define: (k,v) => registry.set(k,v) },
  window: { customCards: [{ type: 'another-card', name: 'Unrelated card' }] },
  console: { info() {} },
};
const source = fs.readFileSync('dist/sensor-ticker-card.js', 'utf8');
// Test access is injected into an in-memory copy; production JavaScript is unchanged.
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.__testSensorTicker = { normalized, displayFor, THEMES, THEME_OPTIONS };\n})();');
assert.notEqual(instrumented, source, 'Test injection location must exist');
vm.runInNewContext(instrumented, context);
const { normalized, displayFor, THEMES, THEME_OPTIONS } = context.__testSensorTicker;
const Card = registry.get('sensor-ticker-card');
const Editor = registry.get('sensor-ticker-card-editor');
assert(Card && Editor, 'Card and visual editor must register');
assert.equal(context.window.customCards.length, 2);
assert(context.window.customCards.some(c => c.type === 'sensor-ticker-card'));
assert(context.window.customCards.some(c => c.type === 'another-card'), 'Preserve other cards');
assert.equal(new Card().getCardSize(), 2);
const card = new Card();
card.setConfig({ height: 30, entities: ['sensor.test'], mode: 'bad' });
assert.equal(card._config.height, 38);
assert.equal(card._config.entities[0].entity, 'sensor.test');
assert.equal(card._config.mode, 'continuous');
vm.runInNewContext(source, context);
assert.equal(context.window.customCards.filter(c => c.type === 'sensor-ticker-card').length, 1);

// Any old per-entry attribute/unit configuration must be stripped and ignored.
const oldConfig = normalized({ entities: [{ entity: 'sensor.power', name: 'Power',
  attribute: 'device_class', unit: 'kW', decimals: '1', icon: 'mdi:flash', enabled: true }] });
assert.equal(Object.hasOwn(oldConfig.entities[0], 'attribute'), false);
assert.equal(Object.hasOwn(oldConfig.entities[0], 'unit'), false);
const hass = { locale: { language: 'de-DE' }, states: {
  'sensor.power': { entity_id: 'sensor.power', state: '1500', attributes: { friendly_name: 'Leistung', unit_of_measurement: 'W' } },
  'sensor.temp': { entity_id: 'sensor.temp', state: '23.42', attributes: { friendly_name: 'Raumtemperatur', unit_of_measurement: '°C' } },
  'binary_sensor.door': { entity_id: 'binary_sensor.door', state: 'on', attributes: { device_class: 'door' } },
  'sensor.missing': { entity_id: 'sensor.missing', state: 'unavailable', attributes: { unit_of_measurement: 'kWh' } },
} };
assert.equal(displayFor(oldConfig.entities[0], hass, true).value, '1.500,0 W');
assert.equal(displayFor(oldConfig.entities[0], hass, false).value, '1.500,0');
assert.equal(displayFor({entity:'sensor.temp', name:'',icon:'',decimals:'auto'},hass,true).value, '23,42 °C');
assert.equal(displayFor({entity:'binary_sensor.door',name:'',icon:'',decimals:'auto'},hass,true).value, 'Offen');
assert.equal(displayFor({entity:'sensor.missing',name:'',icon:'',decimals:'auto'},hass,true).value, 'Nicht verfügbar');

const editor = new Editor();
editor._hass = hass;
editor._config.entities = [oldConfig.entities[0]];
let markup = editor._entityRow(editor._config.entities[0], 0);
assert.doesNotMatch(markup, /data-entry="attribute"|data-entry="unit"/);
assert.match(markup, /data-icon-select/);
assert.match(markup, /value="mdi:flash" selected/);
assert.match(markup, /st-icon-preview/);
editor._config.entities[0].icon = 'mdi:custom-special-symbol';
markup = editor._entityRow(editor._config.entities[0], 0);
assert.match(markup, /value="__custom__" selected/);
assert.match(markup, /data-entry="icon"/);
let changedConfig = null;
editor._change = patch => { changedConfig = { ...editor._config, ...patch }; };
editor._changeEntity(0, 'entity', 'sensor.temp');
assert.equal(changedConfig.entities[0].entity, 'sensor.temp');
assert(!('attribute' in changedConfig.entities[0]));
console.log('Native HA entity state and units, legacy config migration: OK');
console.log('Icon dropdown, custom icons, registration and defaults: OK');

// Stable v1: five distinct built-in themes plus customizable colors.
assert.deepEqual(Array.from(THEME_OPTIONS, entry => entry[0]), ['default','dark','light','blue','purple','custom']);
assert.equal(Object.hasOwn(THEMES,'tv'), false);
assert.equal(normalized({theme:'tv'}).theme, 'blue');
assert.equal(normalized({theme:'nightglow'}).theme, 'default');
assert.equal(normalized({theme:'minimal'}).theme, 'dark');
assert.equal(normalized({theme:'transparent'}).theme, 'custom');
assert.equal(normalized({theme:'transparent'}).transparent_bg, true);
assert.equal(normalized({theme:'purple'}).theme, 'purple');
for (const palette of Object.values(THEMES)) for (const key of ['bg','fg','accent','separator','secondary','border','icon','label_fg']) assert.match(palette[key], /^#[a-f0-9]{6}$/i);
const custom = normalized({theme:'custom',colors:{bg:'#112233',icon:'#ff00aa',border:'#000000'}});
assert.equal(custom.colors.bg, '#112233');
assert.equal(custom.colors.icon, '#ff00aa');
assert.equal(custom.colors.border, '#000000');
assert.equal(normalized({theme:'custom',colors:{fg:'var(--bad)'}}).colors.fg, THEMES.default.fg);
assert.equal(normalized({theme:'custom',transparent_bg:true}).transparent_bg,true);
assert.doesNotMatch(source, /TV News Classic|v0\.1\.2-beta\.3/);
console.log('Stable version, all preset themes, custom colors, and legacy theme migration: OK');
