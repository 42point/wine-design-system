(function () {
  'use strict';

  // ── Конфиг ─────────────────────────────────────────────────────────────────

  const TOKEN_PREFIXES = ['--color-', '--font-', '--spacing-', '--radius-', '--shadow-', '--container'];

  // layout-свойства для секции «Стили» (типографика — отдельная секция)
  const LAYOUT_PROPS = [
    'display', 'position', 'flexDirection', 'flexWrap',
    'gridTemplateColumns', 'gridTemplateRows', 'gap', 'alignItems', 'justifyContent',
    'width', 'maxWidth', 'minHeight', 'height',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginBottom',
    'backgroundColor', 'borderRadius', 'boxShadow', 'opacity',
  ];

  const SKIP_VALUES = new Set([
    'none', 'normal', 'auto', '0px', 'rgba(0, 0, 0, 0)', 'transparent',
    'start', 'static', 'visible', 'nowrap', 'row', 'inline',
    '0px 0px 0px 0px rgba(0, 0, 0, 0)',
  ]);

  const TOKEN_PROP_MAP = {
    '--color-':    ['color', 'background-color', 'border-top-color',
                    'border-bottom-color', 'border-left-color', 'border-right-color'],
    '--font-':     ['font-family'],
    '--spacing-':  ['padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                    'row-gap', 'column-gap'],
    '--radius-':   ['border-top-left-radius'],
    '--shadow-':   ['box-shadow'],
    '--container': ['max-width'],
  };

  // ── Состояние ───────────────────────────────────────────────────────────────

  let enabled = false;
  let pinned  = null;

  // ── Утилиты: цвет ───────────────────────────────────────────────────────────

  function rgbToHex(rgb) {
    const m = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!m) return null;
    return '#' + [m[1], m[2], m[3]]
      .map(n => parseInt(n).toString(16).padStart(2, '0'))
      .join('').toUpperCase();
  }

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function normalizeColor(val) {
    val = val.trim().toLowerCase();
    if (/^#[0-9a-f]{3,8}$/.test(val)) return hexToRgb(val);
    return val.replace(/\s+/g, '');
  }

  function firstFont(val) {
    return val.split(',')[0].trim().replace(/["']/g, '').toLowerCase();
  }

  function formatColor(val) {
    if (/^#/.test(val.trim())) return val.trim().toUpperCase();
    if (/^rgba?\(/.test(val.trim())) return rgbToHex(val) || val;
    return val;
  }

  // ── Токены из :root ──────────────────────────────────────────────────────────

  let _rootTokens = null;
  function getRootTokens() {
    if (_rootTokens) return _rootTokens;
    _rootTokens = {};
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === ':root') {
            for (const prop of rule.style) {
              if (TOKEN_PREFIXES.some(p => prop.startsWith(p))) {
                _rootTokens[prop] = rule.style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch (_) {}
    }
    return _rootTokens;
  }

  // ── Обратный маппинг: значение → имя токена ─────────────────────────────────
  // Используется в секции Типографика, чтобы показать
  // «Inter → --font-body» и «#30343A → --color-neutral-gray-700».

  let _colorMap = null;
  let _fontMap  = null;

  function getColorTokenMap() {
    if (_colorMap) return _colorMap;
    _colorMap = {};
    for (const [name, val] of Object.entries(getRootTokens())) {
      if (!name.startsWith('--color-')) continue;
      try { _colorMap[normalizeColor(val)] = name; } catch (_) {}
    }
    return _colorMap;
  }

  function getFontTokenMap() {
    if (_fontMap) return _fontMap;
    _fontMap = {};
    for (const [name, val] of Object.entries(getRootTokens())) {
      if (!name.startsWith('--font-')) continue;
      const key = firstFont(val);
      // Приоритет: --font-heading > --font-heading-* > --font-body > etc.
      // Первый встреченный побеждает, поэтому не перезаписываем.
      if (!_fontMap[key]) _fontMap[key] = { name, fullValue: val };
    }
    return _fontMap;
  }

  // ── Токены, активные на элементе (для секции «Токены») ──────────────────────

  function getElementTokens(el) {
    const tokens = getRootTokens();
    const cs     = getComputedStyle(el);
    const found  = new Map();

    for (const [tokenName, tokenRaw] of Object.entries(tokens)) {
      const prefix = TOKEN_PREFIXES.find(p => tokenName.startsWith(p));
      if (!prefix) continue;
      const propsToCheck = TOKEN_PROP_MAP[prefix] || [];

      for (const cssProp of propsToCheck) {
        const computed = cs.getPropertyValue(cssProp).trim();
        if (!computed) continue;
        let match = false;

        if (prefix === '--color-') {
          try { match = normalizeColor(computed) === normalizeColor(tokenRaw); } catch (_) {}
        } else if (prefix === '--font-') {
          match = firstFont(computed) === firstFont(tokenRaw);
        } else if (prefix === '--spacing-' || prefix === '--radius-' || prefix === '--container') {
          match = computed === tokenRaw.trim();
        } else if (prefix === '--shadow-') {
          match = computed.includes(tokenRaw.split(' ').slice(0, 3).join(' '));
        }

        if (match) {
          if (!found.has(tokenName)) {
            found.set(tokenName, { raw: tokenRaw, usedIn: [] });
          }
          found.get(tokenName).usedIn.push(cssProp);
          break;
        }
      }
    }
    return found;
  }

  // ── Типографика элемента ─────────────────────────────────────────────────────

  function getTypography(el) {
    const cs        = getComputedStyle(el);
    const colorMap  = getColorTokenMap();
    const fontMap   = getFontTokenMap();

    const rawFont   = cs.fontFamily;
    const rawColor  = cs.color;
    const fontKey   = firstFont(rawFont);
    const fontEntry = fontMap[fontKey];

    // Название шрифта — первый, без кавычек
    const fontName  = fontKey.charAt(0).toUpperCase() + fontKey.slice(1);

    // Токен шрифта — ищем точное совпадение первого шрифта
    const fontToken = fontEntry ? fontEntry.name : null;

    // Цвет текста
    const colorHex   = formatColor(rawColor);
    const colorToken = colorMap[normalizeColor(rawColor)] || null;

    // Линейная высота — упрощаем до числа если возможно
    const lhRaw  = cs.lineHeight;
    const lhNum  = parseFloat(lhRaw);
    const fsNum  = parseFloat(cs.fontSize);
    const lh     = (fsNum && lhNum)
      ? (lhNum / fsNum).toFixed(2).replace(/\.?0+$/, '')
      : lhRaw;

    // Letter-spacing
    const ls     = cs.letterSpacing !== '0px' ? cs.letterSpacing : null;

    // Text-transform
    const tt     = cs.textTransform !== 'none' ? cs.textTransform : null;

    return {
      fontName,
      fontToken,
      fontFull: rawFont,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: lh,
      letterSpacing: ls,
      textTransform: tt,
      colorHex,
      colorToken,
    };
  }

  // ── Layout-стили (без типографики) ──────────────────────────────────────────

  function getLayoutStyles(el) {
    const cs = getComputedStyle(el);
    const result = [];
    for (const prop of LAYOUT_PROPS) {
      let val = cs[prop];
      if (!val || SKIP_VALUES.has(val)) continue;
      if (/^rgba?\(/.test(val)) val = formatColor(val);
      result.push({ prop: camelToKebab(prop), value: val });
    }
    return result;
  }

  function camelToKebab(s) {
    return s.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
  }

  function formatTokenValue(raw) {
    const t = raw.trim();
    if (/^#[0-9a-fA-F]{3,6}$/.test(t)) return t.toUpperCase();
    if (/^rgba?\(/.test(t)) return rgbToHex(t) || t;
    return t;
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────

  const panel = document.createElement('div');
  panel.id = 'dp-inspector-panel';
  panel.innerHTML = `
    <div class="dpi-header">
      <span class="dpi-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        Инспектор
      </span>
      <button class="dpi-close" aria-label="Закрыть">✕</button>
    </div>
    <div class="dpi-body">
      <p class="dpi-empty">Кликните на элемент</p>
    </div>
  `;
  document.body.appendChild(panel);

  const toggle = document.createElement('button');
  toggle.id    = 'dp-inspector-toggle';
  toggle.title = 'Инспектор элементов (Alt+I)';
  toggle.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>`;
  document.body.appendChild(toggle);

  const highlight = document.createElement('div');
  highlight.id = 'dp-inspector-highlight';
  document.body.appendChild(highlight);

  const tooltip = document.createElement('div');
  tooltip.id = 'dp-inspector-tooltip';
  document.body.appendChild(tooltip);

  // ── Стили ───────────────────────────────────────────────────────────────────

  const style = document.createElement('style');
  style.textContent = `
    #dp-inspector-toggle {
      position: fixed; bottom: 24px; right: 24px; z-index: 99998;
      width: 44px; height: 44px; border-radius: 50%; border: none;
      background: #4b0f24; color: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(75,15,36,.35);
      transition: background .15s, transform .15s;
    }
    #dp-inspector-toggle:hover { background: #6d1c36; transform: scale(1.08); }
    #dp-inspector-toggle.active { background: #b9965b; }

    #dp-inspector-panel {
      position: fixed; top: 0; right: -360px; width: 340px; height: 100vh;
      z-index: 99999; background: #fff;
      border-left: 1px solid rgba(102,96,95,.18);
      box-shadow: -12px 0 40px rgba(22,22,22,.10);
      display: flex; flex-direction: column;
      font-family: 'Inter', system-ui, sans-serif; font-size: 13px;
      transition: right .25s cubic-bezier(.4,0,.2,1); overflow: hidden;
    }
    #dp-inspector-panel.open { right: 0; }

    .dpi-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; background: #4b0f24; color: #fff; flex-shrink: 0;
    }
    .dpi-title {
      display: flex; align-items: center; gap: 7px;
      font-weight: 700; font-size: 13px;
      letter-spacing: .04em; text-transform: uppercase;
    }
    .dpi-close {
      background: none; border: none; color: rgba(255,255,255,.7);
      cursor: pointer; font-size: 15px; padding: 2px 4px; line-height: 1;
    }
    .dpi-close:hover { color: #fff; }

    .dpi-body { flex: 1; overflow-y: auto; padding: 0 0 80px; }
    .dpi-empty { color: #66605f; text-align: center; padding: 40px 16px; margin: 0; }

    .dpi-section { padding: 12px 16px; border-bottom: 1px solid rgba(102,96,95,.12); }
    .dpi-section:last-child { border-bottom: none; }

    .dpi-section-title {
      font-size: 10px; font-weight: 800; letter-spacing: .08em;
      text-transform: uppercase; color: #b9965b; margin: 0 0 8px;
    }

    /* Элемент */
    .dpi-element-tag {
      font-family: 'Menlo','Monaco',monospace; font-size: 12px;
      color: #4b0f24; font-weight: 600; margin: 0 0 6px; word-break: break-all;
    }
    .dpi-classes { display: flex; flex-wrap: wrap; gap: 5px; }
    .dpi-class {
      padding: 2px 8px; border-radius: 4px;
      background: rgba(75,15,36,.08); color: #4b0f24;
      font-family: 'Menlo','Monaco',monospace; font-size: 11px;
      font-weight: 600; cursor: pointer; user-select: all;
    }
    .dpi-class:hover { background: rgba(75,15,36,.16); }

    /* Типографика */
    .dpi-type-row {
      display: grid; grid-template-columns: 76px 1fr;
      align-items: baseline; gap: 6px;
      padding: 3px 0; border-bottom: 1px solid rgba(102,96,95,.07);
    }
    .dpi-type-row:last-child { border-bottom: none; }
    .dpi-type-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .06em; color: #66605f;
    }
    .dpi-type-val {
      font-family: 'Menlo','Monaco',monospace; font-size: 11px;
      color: #161616; font-weight: 600;
    }
    .dpi-type-token {
      font-family: 'Menlo','Monaco',monospace; font-size: 10px;
      color: #b9965b; margin-left: 6px; font-weight: 400;
    }
    .dpi-color-dot {
      display: inline-block; width: 10px; height: 10px;
      border-radius: 2px; border: 1px solid rgba(0,0,0,.12);
      margin-right: 5px; vertical-align: middle; flex-shrink: 0;
    }

    /* Токены */
    .dpi-token {
      display: grid; grid-template-columns: 16px 1fr auto;
      align-items: start; gap: 7px;
      padding: 5px 0; border-bottom: 1px solid rgba(102,96,95,.07);
    }
    .dpi-token:last-child { border-bottom: none; }
    .dpi-token-swatch {
      width: 14px; height: 14px; border-radius: 3px;
      border: 1px solid rgba(0,0,0,.12); margin-top: 1px;
    }
    .dpi-token-swatch.no-color {
      background: repeating-linear-gradient(45deg,#ddd 0 3px,#fff 3px 6px);
    }
    .dpi-token-info { min-width: 0; }
    .dpi-token-name {
      font-family: 'Menlo','Monaco',monospace; font-size: 11px;
      color: #30343a; display: block;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .dpi-token-uses {
      font-size: 10px; color: #b9965b; margin-top: 1px;
      display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .dpi-token-value {
      font-family: 'Menlo','Monaco',monospace; font-size: 11px;
      color: #4b0f24; font-weight: 600; white-space: nowrap; margin-top: 1px;
    }

    /* Стили */
    .dpi-style {
      display: flex; justify-content: space-between; gap: 8px;
      padding: 3px 0; border-bottom: 1px solid rgba(102,96,95,.07);
    }
    .dpi-style:last-child { border-bottom: none; }
    .dpi-style-prop {
      font-family: 'Menlo','Monaco',monospace; font-size: 11px;
      color: #30343a; flex-shrink: 0;
    }
    .dpi-style-val {
      font-family: 'Menlo','Monaco',monospace; font-size: 11px;
      color: #4b0f24; font-weight: 600;
      text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    /* Highlight */
    #dp-inspector-highlight {
      position: fixed; pointer-events: none; z-index: 99990;
      border: 2px solid #4b0f24; background: rgba(75,15,36,.06);
      border-radius: 3px; display: none;
      transition: top .05s, left .05s, width .05s, height .05s;
    }
    body.dp-inspect-mode #dp-inspector-highlight { display: block; }

    #dp-inspector-tooltip {
      position: fixed; pointer-events: none; z-index: 99995;
      background: #4b0f24; color: #fff;
      font-family: 'Menlo','Monaco',monospace; font-size: 11px;
      padding: 3px 8px; border-radius: 4px; white-space: nowrap;
      display: none; max-width: 300px;
      overflow: hidden; text-overflow: ellipsis;
    }
    body.dp-inspect-mode #dp-inspector-tooltip { display: block; }

    body.dp-inspect-mode * { cursor: crosshair !important; }
    body.dp-inspect-mode #dp-inspector-toggle,
    body.dp-inspect-mode #dp-inspector-panel,
    body.dp-inspect-mode #dp-inspector-panel * { cursor: default !important; }
  `;
  document.head.appendChild(style);

  // ── Рендер панели ───────────────────────────────────────────────────────────

  function buildPanel(el) {
    const tag     = el.tagName.toLowerCase();
    const id      = el.id ? `#${el.id}` : '';
    const classes = [...el.classList];
    const typo    = getTypography(el);
    const tokens  = getElementTokens(el);
    const layout  = getLayoutStyles(el);

    let html = '';

    // ── Элемент ──────────────────────────────────────────────────────────────
    html += `<div class="dpi-section">
      <p class="dpi-section-title">Элемент</p>
      <p class="dpi-element-tag">&lt;${tag}${id}&gt;</p>`;
    html += classes.length
      ? `<div class="dpi-classes">${classes.map(c => `<span class="dpi-class">.${c}</span>`).join('')}</div>`
      : `<p style="color:#66605f;margin:0;font-size:12px">Нет классов</p>`;
    html += `</div>`;

    // ── Типографика ──────────────────────────────────────────────────────────
    html += `<div class="dpi-section">
      <p class="dpi-section-title">Типографика</p>`;

    // Шрифт
    const fontToken = typo.fontToken
      ? `<span class="dpi-type-token">${typo.fontToken}</span>` : '';
    html += `<div class="dpi-type-row" title="${typo.fontFull}">
      <span class="dpi-type-label">Шрифт</span>
      <span class="dpi-type-val">${typo.fontName}${fontToken}</span>
    </div>`;

    // Размер
    html += `<div class="dpi-type-row">
      <span class="dpi-type-label">Размер</span>
      <span class="dpi-type-val">${typo.fontSize}</span>
    </div>`;

    // Насыщенность
    html += `<div class="dpi-type-row">
      <span class="dpi-type-label">Насыщ.</span>
      <span class="dpi-type-val">${typo.fontWeight}</span>
    </div>`;

    // Межстрочный
    html += `<div class="dpi-type-row">
      <span class="dpi-type-label">Line-height</span>
      <span class="dpi-type-val">${typo.lineHeight}</span>
    </div>`;

    // Letter-spacing
    if (typo.letterSpacing) {
      html += `<div class="dpi-type-row">
        <span class="dpi-type-label">Tracking</span>
        <span class="dpi-type-val">${typo.letterSpacing}</span>
      </div>`;
    }

    // Text-transform
    if (typo.textTransform) {
      html += `<div class="dpi-type-row">
        <span class="dpi-type-label">Transform</span>
        <span class="dpi-type-val">${typo.textTransform}</span>
      </div>`;
    }

    // Цвет текста
    const colorDot   = `<span class="dpi-color-dot" style="background:${typo.colorHex}"></span>`;
    const colorToken = typo.colorToken
      ? `<span class="dpi-type-token">${typo.colorToken}</span>` : '';
    html += `<div class="dpi-type-row">
      <span class="dpi-type-label">Цвет</span>
      <span class="dpi-type-val">${colorDot}${typo.colorHex}${colorToken}</span>
    </div>`;

    html += `</div>`;

    // ── Токены ───────────────────────────────────────────────────────────────
    html += `<div class="dpi-section">
      <p class="dpi-section-title">Токены${tokens.size ? ` (${tokens.size})` : ''}</p>`;

    if (tokens.size) {
      for (const [name, { raw, usedIn }] of tokens) {
        const display  = formatTokenValue(raw);
        const isColor  = name.startsWith('--color-');
        const swatch   = isColor
          ? `<span class="dpi-token-swatch" style="background:${raw}"></span>`
          : `<span class="dpi-token-swatch no-color"></span>`;
        html += `<div class="dpi-token">
          ${swatch}
          <span class="dpi-token-info">
            <span class="dpi-token-name" title="${name}">${name}</span>
            <span class="dpi-token-uses">${usedIn.join(', ')}</span>
          </span>
          <span class="dpi-token-value">${display}</span>
        </div>`;
      }
    } else {
      html += `<p style="color:#66605f;margin:0;font-size:12px">Нет прямых совпадений с tokens.css</p>`;
    }
    html += `</div>`;

    // ── Стили (layout) ───────────────────────────────────────────────────────
    if (layout.length) {
      html += `<div class="dpi-section">
        <p class="dpi-section-title">Стили</p>`;
      for (const { prop, value } of layout) {
        html += `<div class="dpi-style">
          <span class="dpi-style-prop">${prop}</span>
          <span class="dpi-style-val" title="${value}">${value}</span>
        </div>`;
      }
      html += `</div>`;
    }

    panel.querySelector('.dpi-body').innerHTML = html;
  }

  // ── Управление ──────────────────────────────────────────────────────────────

  function enable() {
    enabled = true;
    document.body.classList.add('dp-inspect-mode');
    toggle.classList.add('active');
    panel.classList.add('open');
    panel.querySelector('.dpi-body').innerHTML = '<p class="dpi-empty">Кликните на элемент</p>';
  }

  function disable() {
    enabled = false; pinned = null;
    document.body.classList.remove('dp-inspect-mode');
    toggle.classList.remove('active');
    panel.classList.remove('open');
    highlight.style.display = 'none';
    tooltip.style.display   = 'none';
  }

  function isInspectable(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (['dp-inspector-panel','dp-inspector-toggle',
         'dp-inspector-highlight','dp-inspector-tooltip'].includes(el.id)) return false;
    if (el.closest('#dp-inspector-panel, #dp-inspector-toggle')) return false;
    return true;
  }

  // ── События ─────────────────────────────────────────────────────────────────

  toggle.addEventListener('click', () => enabled ? disable() : enable());
  panel.querySelector('.dpi-close').addEventListener('click', disable);

  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'i') { e.preventDefault(); enabled ? disable() : enable(); }
    if (e.key === 'Escape' && enabled) disable();
  });

  document.addEventListener('mousemove', e => {
    if (!enabled) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!isInspectable(el) || el === pinned) return;

    const r = el.getBoundingClientRect();
    Object.assign(highlight.style, {
      display: 'block', top: r.top + 'px', left: r.left + 'px',
      width: r.width + 'px', height: r.height + 'px',
    });

    const cls = [...el.classList].map(c => '.' + c).join('');
    tooltip.textContent  = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls;
    tooltip.style.display = 'block';
    tooltip.style.left   = Math.min(e.clientX + 12, window.innerWidth - tooltip.offsetWidth - 8) + 'px';
    tooltip.style.top    = (e.clientY + 20) + 'px';
  });

  document.addEventListener('click', e => {
    if (!enabled) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!isInspectable(el)) return;
    e.preventDefault(); e.stopPropagation();
    pinned = el;
    buildPanel(el);
  }, true);

})();
