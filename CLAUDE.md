# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Перед началом работы над любой задачей сложнее одного шага
составь todo-список и показывай его прогресс по ходу выполнения.
Для задач с неочевидным подходом сначала предложи план и дождись подтверждения.

## Project

Static HTML/CSS UI-kit and page prototypes for **DP Trade** — a B2B wine wholesale catalog (wine-dp-trade.ru). The output of this project is handed off to **WordPress/Elementor** for production deployment. See `docs/elementor-token-handoff.md` for the full Elementor migration guide.

## Commands

```bash
# Dev server (11ty with live reload)
npm run dev       # http://localhost:8080

# Production build → _site/
npm run build
```

Dev server config is also saved in `.claude/launch.json` for use with `preview_start`.

## Architecture

### CSS layer (single dependency direction)

```
css/tokens.css   ← design tokens only (colors, fonts, spacing, radius, shadows)
      ↓
css/site.css     ← all page styles, imports tokens.css
css/ui-kit.css   ← design system showcase styles, standalone
```

Never put visual styles in `tokens.css`. Never import `site.css` into `ui-kit.css`.

### 11ty template structure (`src/`)

```
src/
  _includes/
    layouts/
      base.njk      ← HTML shell: <head>, fonts, CSS link, <body class="{{ bodyClass }}">
      default.njk   ← base + header partial + footer partial (used by all site pages)
      ui-kit.njk    ← base only, no header/footer (used by ui-kit page)
    partials/
      header.njk    ← full site header with mega-menu nav
      footer.njk    ← full site footer
  css/              ← passthrough copy → _site/css/
  assets/           ← passthrough copy → _site/assets/
  *.njk             ← one file per page
```

### Page front matter

Every page declares layout, title, optional bodyClass, and permalink:

```yaml
---
title: "DP Trade — Catalog"
layout: default # or "ui-kit" for the design system page
bodyClass: compact-type # omit if not needed
permalink: /catalog.html # keeps flat output, preserves relative CSS paths
---
```

Pages with `bodyClass: compact-type`: catalog, about, contacts, article-guidelines.
The `ui-kit` page uses `layout: ui-kit` and `css: ui-kit` (links `ui-kit.css` instead of `site.css`).

### CSS paths

All CSS paths in `base.njk` are **absolute** (`/css/site.css`), which requires the 11ty dev server — they will not work when opening `_site/` files directly in a browser via `file://`.

### Design tokens

Key CSS custom properties defined in `css/tokens.css`:

- Colors: `--color-primary-wine-100` (#4b0f24), `--color-accent-gold` (#b9965b), `--color-accent-blue` (#1f3476)
- Fonts: `--font-heading` (Montserrat 800), `--font-body` (Inter), `--font-heading-classic` (Playfair Display)
- Container: `--container: 1240px`

When adding new tokens, add to `tokens.css` and mirror to the Elementor CSS layer in `docs/elementor-token-handoff.md` (Section 6).

### Responsive breakpoints

Defined at the bottom of `css/site.css`:

- `@media (max-width: 1080px)` — tablet
- `@media (max-width: 720px)` — mobile

## Key files

| File                                | Purpose                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| `css/tokens.css`                    | Single source of truth for all design values                 |
| `docs/elementor-token-handoff.md`   | Guide for migrating tokens/components to WordPress Elementor |
| `.claude/launch.json`               | Dev server configurations                                    |
| `src/_includes/partials/header.njk` | Mega-menu navigation — edit here, propagates to all pages    |
| `src/_includes/partials/footer.njk` | Footer — edit here, propagates to all pages                  |
