# Changelog

## [1.1.0] - 2026-10-25

- Added multi-row support: up to 12 separately configured ticker rows in a single card; up to 30 entities per row.
- Each row can independently customize its theme, colors, transparency, height, font size, icons, labels, clock, speed, and animation.
- Added optional per-row frames or separator lines, configurable border colors and spacing.
- Added title shapes (pointed, rounded, straight), a per-row title-width slider (55–360px), and optional automatic alignment.
- Preserved the existing `custom:sensor-ticker-card` Lovelace type and legacy v1.0.1 top-level single-row YAML.
- New `rows:` format is compatible with the locally tested Multi-Row prototype when its card type is switched to the official type.
- Kept native Home Assistant entity state/units, More Info actions, and the visual editor.


## [1.0.1] - 2026-10-25

- Added an animated preview of the three ticker modes to the English and German README files.
- Updated HACS installation instructions for the official catalog listing.
- Updated version labels and release documentation to v1.0.1.
- No changes to card features, settings or animation logic; existing dashboards remain compatible.

## [1.0.0] - 2026-10-24

- Removed the Beta label; first public stable-version release.
- Replaced the earlier Nightglow / TV News / Minimal / Transparent presets with five general-purpose themes: Default, Dark, Light, Blue and Purple.
- Added a sixth option, Custom, with eight independently configurable colors and an optional transparent background.
- Refreshed card styling: rounded border, chevron-style left label, clearer sensor names and icon colors.
- Added a live miniature theme preview in the visual editor.
- Retained existing entity configuration, live updates, animation modes and icon picker.
- Migrates previous theme settings automatically without editing existing dashboards.

**Historical note:** v1.0.0 was initially published before official HACS admission. Sensor Ticker Card is now included in the official HACS catalog.
