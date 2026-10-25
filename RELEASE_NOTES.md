# Sensor Ticker Card v1.1.0

Multi-Row Ticker: the established Sensor Ticker Card can now show up to **12 independent animated ticker rows in one card**, without a stack card.

### New
- Add, duplicate, rearrange and remove ticker rows in the visual editor (up to 30 entities per row).
- Set theme, colors, opacity, animation, speed, font size, height, units, clock and title separately for every row.
- Choose each title's shape: pointed, rounded or straight.
- Adjust each title width precisely (55–360 px) with an individual slider or enable optional shared alignment.
- Select no border, a separator line, or a full frame for each ticker row and customize border color/spacing.

### Compatibility
- Existing cards with `type: custom:sensor-ticker-card` and original v1.0.1 top-level settings are still supported. No manual YAML migration is required.
- Existing local `custom:sensor-ticker-multirow-test` cards can be migrated by changing only their `type:` to `custom:sensor-ticker-card` **after** the official HACS update.
- Once migrated, remove the obsolete local test JS resource from Dashboard Resources.
- No Home Assistant Core restart required. Refresh the browser after installing via HACS.

### Installation
Use HACS → Sensor Ticker Card → Update → v1.1.0, or replace `dist/sensor-ticker-card.js` for manual installs and change the resource URL to `/local/sensor-ticker-card.js?v=1.1.0`.
