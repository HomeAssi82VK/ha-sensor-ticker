# Sensor Ticker Card for Home Assistant

A sleek **live ticker for your Home Assistant entity states**. Select temperatures, energy readings, humidity, doors and much more; Sensor Ticker uses their actual state and units from Home Assistant. **No RSS feeds, backend or separate integration required.**

**Current version:** `v1.0.0` · First public stable release · [Deutsche Anleitung](README.de.md) · [Changelog](CHANGELOG.md) · [Report issues](https://github.com/HomeAssi82VK/ha-sensor-ticker/issues)

![Sensor Ticker Card showing example sensor readings](docs/images/sensor-ticker-preview.png)

*Illustration with simulated sensor values; the final appearance depends on your Home Assistant theme.*

### Animation Preview

<img src="https://raw.githubusercontent.com/HomeAssi82VK/ha-sensor-ticker/main/docs/images/ani.gif" alt="Sensor Ticker Animationen" width="1000">

## Features

- Select, activate, reorder and rename up to **30 entities per card** in the visual editor
- Automatically display the actual HA **state and unit of measurement** (`°C`, `%`, `W`, `kWh`, etc.)
- MDI icon picker with previews; automatic HA icons or your own `mdi:` icon
- Three animation modes: continuous marquee, slide and fade
- Six appearance options: Default, Dark, Light, Blue, Purple and Custom (eight adjustable colors and optional transparency)
- Configurable height, fonts, speed, numerical decimals, labels and optional clock
- Click a value to open the entity's More Info dialog
- Live HA updates without restarting the scrolling animation
- No manual attribute selection or unit overrides, and no polling service

## Installation via HACS

**Sensor Ticker Card is included in the official HACS catalog.** No custom repository is needed for the normal installation.

1. Open **HACS** in Home Assistant.
2. Search for **Sensor Ticker Card** and open the result under **Dashboard**.
3. Select **Download** (or **Install**) and install the current release.
4. Reload your browser, edit a dashboard and add **Sensor Ticker Card** from the card picker.

HACS normally registers the JavaScript dashboard resource automatically. If your dashboard resources are managed manually in YAML, you may need to add:

```yaml
url: /hacsfiles/ha-sensor-ticker/sensor-ticker-card.js
type: module
```

### Fallback: HACS custom repository

If **Sensor Ticker Card** is not yet available in your HACS search results, open **HACS → Custom repositories**, add `https://github.com/HomeAssi82VK/ha-sensor-ticker` as **Dashboard** (also called **Plugin**) and install it from there.

Do not add a separate integration in **Devices & services**: this project is a frontend-only dashboard card. No Home Assistant Core restart is needed.

## Manual installation (without HACS)

1. Download a release/source ZIP and extract it.
2. Copy `dist/sensor-ticker-card.js` to `/config/www/sensor-ticker-card.js`.
3. Under **Settings → Dashboards → Resources**, add `/local/sensor-ticker-card.js?v=1.0.0` as a **JavaScript module**.
4. Reload the browser (hard refresh if necessary); add **Sensor Ticker Card** from the card picker.

**Migrating from manual to HACS:** Remove the old `/local/sensor-ticker-card.js` dashboard resource once the HACS resource is active. Loading both can leave you on a cached older version. Existing card configurations can remain.

## Configure

Use the visual editor to choose Home Assistant entities, set a display name/icon, order rows and select a design. The card reads `state` and `unit_of_measurement` from each selected entity, not arbitrary attributes. The number of decimals only affects formatting, not unit conversion.

An example is in [`examples/card.yaml`](examples/card.yaml). Missing and unavailable entities are indicated on screen.

## Compatibility and feedback

Tested in one Home Assistant setup; different browsers and dashboards still need community testing. Issues and suggestions: [GitHub Issues](https://github.com/HomeAssi82VK/ha-sensor-ticker/issues). This is an independent community project, not affiliated with Home Assistant. v1.0.0 is a stable-version label; the new themes still benefit from wider real-world testing.

## Release and updates

See [CHANGELOG.md](CHANGELOG.md). Every published release should use a matching tag such as `v1.0.0`. HACS checks this repository as a **Dashboard/Plugin**, not an **Integration**.

## Support ☕

If you enjoy Sensor Ticker, you can [buy me a coffee](https://buymeacoffee.com/homeassi82vk). Donations are optional; this project is free and open source.

[![Buy Me a Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/homeassi82vk)

## License

[MIT](LICENSE) · Copyright © 2026 HomeAssi82VK
