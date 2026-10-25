const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const registry = new Map();
const eventLog = [];
const context = {
  HTMLElement: class {
    attachShadow() { this.shadowRoot = {}; }
    dispatchEvent(ev) { eventLog.push(ev); return true; }
  },
  CustomEvent: class { constructor(type, opts) { this.type = type; this.detail = opts.detail; } },
  customElements: { get: k => registry.get(k), define: (k,v) => registry.set(k,v) },
  window: { customCards: [{ type: 'another-card', name: 'Unrelated card' }] },
  console: { info() {} },
};
const source = fs.readFileSync('dist/sensor-ticker-card.js', 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.__sensorTickerTest = { normalizeRow, normalizeConfig, displayFor, THEMES, THEME_OPTIONS };\n})();');
assert.notEqual(instrumented, source, 'Test injection point is present');
vm.runInNewContext(instrumented, context);
const { normalizeRow, normalizeConfig, displayFor, THEMES, THEME_OPTIONS } = context.__sensorTickerTest;
const Card = registry.get('sensor-ticker-card');
const Editor = registry.get('sensor-ticker-card-editor');
assert(Card && Editor, 'Original card and editor tags remain available');
assert.equal(context.window.customCards.length, 2, 'No unrelated card registration lost');
assert(context.window.customCards.some(c => c.type === 'sensor-ticker-card' && c.name === 'Sensor Ticker Card'));
assert.equal(new Card().getCardSize(), 2);
assert.equal(new Card().getGridOptions().columns, 12);
assert.equal(Card.getStubConfig().rows.length, 1);
vm.runInNewContext(source, context);
assert.equal(context.window.customCards.filter(c => c.type === 'sensor-ticker-card').length, 1, 'Repeated registration is idempotent');

// v1.0.1 flat YAML MUST survive the upgrade without manual changes.
const oldCard = new Card();
oldCard.setConfig({
  type: 'custom:sensor-ticker-card', title: 'ALT', theme: 'purple', mode: 'slide',
  height: 30, show_clock: true, font_size: 20,
  entities: ['sensor.temp', {entity:'sensor.power', name:'Leistung', icon:'mdi:flash', unit:'kW', attribute:'device_class', decimals:'1'}],
});
assert.equal(oldCard.config.rows.length, 1);
const legacyRow = oldCard.config.rows[0];
assert.equal(legacyRow.title, 'ALT');
assert.equal(legacyRow.theme, 'purple');
assert.equal(legacyRow.mode, 'slide');
assert.equal(legacyRow.height, 38);
assert.equal(legacyRow.font_size, 20);
assert.equal(legacyRow.show_clock, true);
assert.equal(legacyRow.entities[0].entity, 'sensor.temp');
assert.equal(legacyRow.entities[1].entity, 'sensor.power');
assert.equal(legacyRow.entities[1].decimals, '1');
assert.equal(Object.hasOwn(legacyRow.entities[1], 'attribute'), false);
assert.equal(Object.hasOwn(legacyRow.entities[1], 'unit'), false);
assert.equal(normalizeRow({theme:'nightglow'}).theme, 'default');
assert.equal(normalizeRow({theme:'tv'}).theme, 'blue');
assert.equal(normalizeRow({theme:'minimal'}).theme, 'dark');
assert.equal(normalizeRow({theme:'transparent'}).transparent_bg, true);
assert.equal(normalizeRow({theme:'transparent'}).theme, 'custom');
console.log('Existing v1.0.1 cards, entity state, old themes and YAML: OK');

const hass = { locale: { language: 'de-DE' }, states: {
  'sensor.power': { entity_id: 'sensor.power', state: '1500', attributes: { friendly_name: 'Leistung', unit_of_measurement: 'W' } },
  'sensor.temp': { entity_id: 'sensor.temp', state: '23.42', attributes: { friendly_name: 'Raum', unit_of_measurement: '°C' } },
  'binary_sensor.door': { entity_id: 'binary_sensor.door', state: 'on', attributes: { device_class: 'door' } },
  'sensor.missing': { entity_id: 'sensor.missing', state: 'unavailable', attributes: { unit_of_measurement: 'kWh' } },
}};
assert.equal(displayFor(legacyRow.entities[1],hass,true).value, '1.500,0 W');
assert.equal(displayFor(legacyRow.entities[1],hass,false).value, '1.500,0');
assert.equal(displayFor({entity:'sensor.temp',name:'',icon:'',decimals:'auto'},hass,true).value, '23,42 °C');
assert.equal(displayFor({entity:'binary_sensor.door',name:'',icon:'',decimals:'auto'},hass,true).value,'Offen');
assert.equal(displayFor({entity:'sensor.missing',name:'',icon:'',decimals:'auto'},hass,true).value,'Nicht verfügbar');
console.log('Native Home Assistant entity state, units and localized values: OK');

// Every row is separately configured, including the TEST multi-row YAML.
const multi = normalizeConfig({type:'custom:sensor-ticker-multirow-test',row_gap:7,outer_border:false,align_titles:true,
  rows: [{title:'STROM',title_shape:'straight',title_width:155,border_mode:'frame',border_color:'#aabbcc',entities:['sensor.power']},
         {title:'KLIMA',title_shape:'rounded',title_width:220,transparent_bg:true,mode:'fade',entities:['sensor.temp']},
         {title:'INFO',title_shape:'pointed',title_width:null,border_mode:'line',entities:['binary_sensor.door']}],
});
assert.equal(multi.type,'custom:sensor-ticker-card');
assert.equal(multi.rows.length,3);
assert.equal(multi.row_gap,7);
assert.equal(multi.outer_border,false);
assert.equal(multi.align_titles,true);
assert.equal(multi.rows[0].title_width,155);
assert.equal(multi.rows[1].title_width,220);
assert.equal(multi.rows[2].title_width,null);
assert.equal(multi.rows[0].border_color,'#aabbcc');
assert.equal(multi.rows[1].transparent_bg,true);
assert.equal(normalizeRow({title_width:3600}).title_width,360);
assert.equal(normalizeRow({title_width:10}).title_width,55);
assert.equal(normalizeRow({title_shape:'bad',border_mode:'bad'}).title_shape,'pointed');
assert.equal(normalizeRow({title_shape:'bad',border_mode:'bad'}).border_mode,'none');
assert.equal(normalizeConfig({rows:Array.from({length:20},()=>({}))}).rows.length,12);
assert.equal(normalizeRow({entities:Array.from({length:40},()=> 'sensor.temp')}).entities.length,30);
const card = new Card();card.setConfig(multi);
assert.equal(card.getCardSize(),4);
const ed = new Editor(); ed.setConfig(multi);
ed.activeIndex=1; ed.changeRow({title_width:175, title_shape:'straight'});
assert.equal(ed.config.rows[1].title_width,175);
assert.equal(ed.config.rows[0].title_width,155);
assert.equal(ed.config.rows[2].title_width,null);
assert.equal(eventLog.at(-1).type,'config-changed');
assert.equal(eventLog.at(-1).detail.config.type,'custom:sensor-ticker-card');
assert.deepEqual(Array.from(THEME_OPTIONS, t=>t[0]), ['default','dark','light','blue','purple','custom']);
for (const palette of Object.values(THEMES)) for (const key of ['bg','fg','accent','separator','secondary','border','icon','label_fg']) assert.match(palette[key],/^#[a-f0-9]{6}$/i);
console.log('Multi-row config, slider boundaries, shapes, colors and editor save: OK');
