# Sensor Ticker Card – Deutsche Anleitung

**Sensor Ticker v1.0.0** ist eine eigenständige Dashboard-Karte, die Home-Assistant-Entitäten als animierte Laufschrift darstellt. **Keine RSS-Feeds, kein Backend, keine weitere HA-Integration.**

![Sensor Ticker mit Beispielwerten](docs/images/sensor-ticker-preview.png)

*Illustration mit fiktiven Sensorwerten; tatsächliche Optik kann je nach Home-Assistant-Theme leicht abweichen.*

## Funktionen

- Bis zu 30 Entitäten auswählen, aktivieren, sortieren und umbenennen
- Werte und Einheiten **direkt aus Home Assistant** (`state`, `unit_of_measurement`)
- Icons über Dropdown mit Vorschau, eigene `mdi:`-Icons weiterhin möglich
- Drei Animationen: Endloslauf, Ein-/Ausfahren, Überblenden
- Sechs Designoptionen: Default, Dark, Light, Blue, Purple und Custom (acht frei einstellbare Farben sowie optionale Transparenz)
- Höhe, Schrift, Geschwindigkeit, Nachkommastellen und Uhr einstellbar
- Klick auf einen Eintrag öffnet die Entitätsdetails
- Werte ändern sich live, ohne die Animation neu zu starten
- Keine unnötige Attributauswahl oder manuelle Einheitenüberschreibung

## Installation über HACS

**Noch nicht im offiziellen HACS-Katalog gelistet.** Bis zur Aufnahme funktioniert die Installation über ein benutzerdefiniertes Repository:

1. In HACS → **Benutzerdefinierte Repositories** öffnen.
2. `https://github.com/HomeAssi82VK/ha-sensor-ticker` als Typ **Dashboard** (teils **Plugin** genannt) hinzufügen.
3. **Sensor Ticker Card** in Version `v1.0.0` installieren.
4. HACS trägt die JavaScript-Ressource normalerweise selbst ein. Browser aktualisieren und die **Sensor Ticker Card** im Dashboard hinzufügen.

Bei manuell verwalteten Ressourcen im YAML-Modus gegebenenfalls selbst eintragen:

```yaml
url: /hacsfiles/ha-sensor-ticker/sensor-ticker-card.js
type: module
```

**Kein HA-Neustart, keine Integration unter Geräte & Dienste.**

## Manuell installieren (ohne HACS)

1. ZIP entpacken, `dist/sensor-ticker-card.js` nach `/config/www/sensor-ticker-card.js` kopieren.
2. Unter **Einstellungen → Dashboards → Ressourcen** als JavaScript-Modul hinzufügen:

   `/local/sensor-ticker-card.js?v=1.0.0`

3. Browser mit **Strg + F5** aktualisieren, Dashboard bearbeiten, Sensor Ticker Card auswählen.

**Wechsel zur HACS-Installation:** Alten `/local/…`-Ressourceneintrag erst entfernen, wenn HACS die neue Ressource eingerichtet hat. Nicht beide Versionen gleichzeitig laden.

## Anzeige

Die Karte zeigt den echten Zustand jeder Entität und übernimmt Maßeinheiten automatisch aus Home Assistant. Nachkommastellen formatieren nur Zahlen; sie rechnen keine Einheiten um. Für Thermostat-Temperaturen einen separaten Temperatursensor auswählen, falls der normale Zustand eines `climate.*`-Objekts kein Temperaturwert ist.

Beispiel: [`examples/card.yaml`](examples/card.yaml). Fehler und Vorschläge: [GitHub Issues](https://github.com/HomeAssi82VK/ha-sensor-ticker/issues).

## Projekt unterstützen ☕

[![Buy Me a Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/homeassi82vk)

[MIT-Lizenz](LICENSE) · HomeAssi82VK · Community-Projekt, nicht offiziell von Home Assistant

## Wechsel von Version 0.x

Bestehende Kartenkonfigurationen bleiben erhalten. Die früheren Themes werden automatisch zugeordnet: `nightglow` → Default, `minimal` → Dark, `tv` → Blue, `transparent` → Custom mit transparentem Hintergrund. Die alten Attribute- und Einheiteneinstellungen werden weiterhin ignoriert.

