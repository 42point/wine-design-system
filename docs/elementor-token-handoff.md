# Перенос UI-kit в WordPress + Elementor

Документ описывает безопасный перенос дизайн-системы и всех макетов DP Trade UI-kit на WordPress с Elementor. Цель: внедрить дизайн-систему поэтапно, не ломая существующие страницы, Header, Footer и WooCommerce, если он используется.

Документ построен в три слоя:

1. **Аудит исходников** — какие страницы, компоненты и паттерны есть в макете и что из этого дорого/опасно переносить на Elementor.
2. **Декомпозиция работ** — список Elementor-элементов (Global Styles, CSS-слой, глобальные шаблоны, страницы) с оценкой сложности и зависимостями.
3. **Пошаговый план** — 6 этапов с QA и планом отката.

> Основной источник дизайна: `index.html`, `catalog.html`, `product.html`, `bottle-cards.html`, `about.html`, `contacts.html`, `contacts-auth.html`, `news-villa-raiano.html`, `news-villa-raiano-v2.html`, `article-guidelines.html`, `ui-kit.html` плюс `css/tokens.css`, `css/site.css`, `css/ui-kit.css`.

---

## 1. Базовый принцип

Не заменяйте существующие настройки Elementor сразу. Сначала добавляйте новые токены рядом со старыми, собирайте тестовую страницу, проверяйте визуально, и только потом переводите реальные шаблоны и страницы на новые значения.

Рекомендуемый порядок:

1. Backup сайта и базы данных.
2. Работа на staging-копии или на новой странице.
3. Новые Global Colors с префиксом `DP`.
4. Новые Global Fonts с префиксом `DP`.
5. Тонкий базовый CSS-слой с переменными `--dp-*` и утилитарными классами `dp-*`.
6. Базовые компоненты: кнопки, поля, карточки, теги, хедер/футер (draft-копии).
7. Страница `UI Kit Preview` как живая витрина.
8. Проверка desktop / tablet / mobile.
9. Поэтапная замена Header, Footer, catalog, product, news, about, contacts.

---

## 2. Аудит: что в макете и чего в нём нет

### 2.1 Карта страниц

| Страница | Что демонстрирует | Шаблон Elementor |
|---|---|---|
| `index.html` | Hero, mega-menu, блок «Производители», блок «Новости», блок «Рекомендации» | Home Template (Single Page) |
| `catalog.html` | Toolbar, sort select, list-карточки, sidebar-фильтры | Archive Template (WooCommerce или CPT `product`) |
| `product.html` | Галерея + карточка товара, meta-list (4 пары label/value), CTA | Single Product Template |
| `bottle-cards.html` | Все варианты карточки бутылки (grid, mix, compact, horizontal, по регионам) | Showcase внутри UI Kit Preview |
| `about.html` | Page hero, 2-col layout (article + feature grid), карточки с номерами | Page Template «About» |
| `contacts.html` | Page hero, контактная форма, info-panel | Page Template «Contacts» |
| `contacts-auth.html` | То же с авторизацией/аккаунтом | Page Template «Account» или `My Account` endpoint |
| `news-villa-raiano.html`, `news-villa-raiano-v2.html` | Editorial hero, тело статьи, две редакционные верстки | Single Post Template (2 варианта) |
| `article-guidelines.html` | Редакционные правила, структурный контент | Single Post / CPT `guideline` |
| `ui-kit.html` | Живая витрина с sidebar-навигацией и превью компонентов | Не копировать в production, это витрина для дизайнеров и QA |

### 2.2 Карта компонентов

Сложность указана относительно «чистого» Elementor без hand-coded HTML виджетов.

| Компонент | Ключевые селекторы | Где встречается | Сложность |
|---|---|---|---|
| Primary / Secondary / Small button | `.button`, `.button--primary`, `.button--secondary`, `.button--sm` | везде | Лёгко |
| Input, search bar, catalog sort | `.input`, `.search-bar`, `.catalog-sort` | header, catalog | Средне |
| Tag / Chip / Status | `.tag`, `.tag--filled`, `.tag--outline`, gold-вариант | каталог, карточки | Лёгко |
| Primary hero (home) | `.hero`, `.hero-copy`, `.hero-actions` | `index.html` | Сложно |
| Page hero (about / contacts / guidelines / news) | `.page-hero`, `.page-hero--about`, `.page-hero--contacts`, `.page-hero--guidelines`, `.page-hero__inner`, `.page-hero__meta` | 5 страниц | Средне |
| Mega menu | `.mega-menu`, `.menu-grid`, `.menu-column`, `.visual-column`, `.appellations`, `.appellation-group`, `.country-link` | header | **Сложно** |
| Header sticky + blur | `.site-header`, `position: sticky`, `backdrop-filter: blur(18px)` | все страницы | Средне |
| Producer card | `.producer-card` | home | Лёгко |
| News card (3 варианта фоновых изображений) | `.news-card`, `.news-card__image` | home | Лёгко |
| Product card grid | `.product-card`, `.product-media`, `.product-photo`, `.product-footer` | home, catalog, product | Средне |
| Product card list | `.product-card--list` (3 колонки: image / info / actions) | catalog | Сложно |
| Product card compact list | `.product-card--list-compact` | ui-kit | Средне |
| Product card B2B | `.product-card--list-b2b`, `.product-params` | ui-kit | Сложно |
| Bottle card + 5 вариантов | `.bottle-card`, `.bottle-card--tuscany/--mosel/--clean/--compact/--horizontal`, `.bottle-card__media`, `.bottle-card__photo` | bottle-cards | Средне |
| CSS-бутылка (два `::before`/`::after`) | `.bottle`, `.bottle::before` (пробка), `.bottle::after` (этикетка) | ui-kit, catalog showcase | **Сложно** (требует HTML-виджет) |
| Section heading (split) | `.section-heading`, `.section-heading--split` | все секции | Лёгко |
| Feature card с номером | `.feature-card` + `<span>01..04</span>` | about | Лёгко |
| Info card / contact panel / contact form | `.info-card`, `.contact-panel`, `.contact-form` | about, contacts | Лёгко |
| Meta list (4 пары label/value) | `.meta-list`, `.meta-list div`, `.meta-list span` | product | Лёгко |
| Article body (editorial) | `.article-body`, `.article-body .lead`, `.article-body h2/h3/p/ul` | news, guidelines | Средне |
| Footer | `.site-footer`, `.footer-container`, `.footer-main`, `.footer-brand-block`, `.nav-group`, `.contacts-card`, `.social-links` | все страницы | Лёгко |
| Breadcrumbs | отсутствуют в макете | — | нужно добавить отдельно |
| Pagination | отсутствует в макете | — | нужно добавить отдельно |

### 2.3 Проблемные места для Elementor

Ниже — паттерны, которые **нельзя** просто перетащить в стандартные виджеты. Каждый пункт требует либо custom CSS-класса, либо HTML-виджета, либо отдельного Elementor-шаблона.

1. **Mega menu с 4-колоночным асимметричным гридом и мостом-ховером.**
   `css/site.css:242-369`. Grid `1.05fr 0.82fr 1.25fr 0.88fr`, вложенная секция `.appellations` на 2 колонки, позиционирование `position: absolute; transform: translateX(-50%); width: min(var(--container), calc(100vw - 40px))`, ховер-мост через `::after` высотой 34px, `backdrop-filter: blur(18px)`. Стандартный Elementor Nav Menu/Mega Menu такое не даёт. Решение: **custom HTML виджет** + CSS-классы `dp-megamenu-*` либо Crocoblock JetMenu.
2. **Sticky header с backdrop-filter blur.**
   `.site-header { position: sticky; top: 0; backdrop-filter: blur(18px); background: rgba(248, 250, 252, 0.94); }`. В Elementor Pro есть `Effects → Sticky`, но blur и alpha-фон задаются только CSS.
3. **CSS-бутылка на `::before`/`::after`.**
   `.bottle { width: 54px; height: 152px; ... }`, плюс псевдо-пробка и этикетка. Elementor виджет Image такого не даст — нужен HTML-виджет с фиксированной разметкой `<div class="dp-bottle"></div>`.
4. **Псевдоэлементы как структурная часть карточек.**
   `.type-card.is-selected::before` (бейдж), градиентные fond-блоки `.bottle-card__media` с разными заливками под `--tuscany/--mosel/--clean/--compact`. Решение: пять CSS-классов-модификаторов, в Elementor подключать через поле `CSS Classes`.
5. **CSS Grid с асимметричными колонками.**
   Примеры: `.page-hero__inner` (`0.72fr / 0.28fr`), `.article-layout` (`0.68fr / 0.32fr`), `.about-grid` (`0.58fr / 0.42fr`), `.product-card--list` (`210px / 1fr / 220px`), `.footer-main` (`210px / 1fr / 250px`), `.meta-list` (в product — de-facto 2 колонки). Elementor Container с `display: flex` справится только с простыми кейсами. Для сложных — либо Container c `CSS display: grid` через custom CSS, либо принять, что колонки останутся фиксированной ширины через `%`.
6. **Responsive через `clamp()`.**
   `h1 { font-size: clamp(40px, 5.6vw, 76px) }` и подобные. Elementor работает через три брейкпоинта. Решение: в Elementor задавайте отдельные desktop/tablet/mobile значения, либо пропишите `clamp()` в Custom CSS для `h1`/`h2` с префиксом `dp-`.
7. **Кастомный select (`.catalog-sort`).**
   Элементу `<select>` нельзя нормально стилизовать в Elementor. Решение: держать `.dp-select` в Custom CSS с учётом нативной стрелки через `background-image: url("data:image/svg+xml,...")`.
8. **Focus-ring на поля и search bar.**
   `box-shadow: 0 0 0 4px rgba(75, 15, 36, 0.08)` — задайте глобально через `.dp-form input:focus`, `.dp-search:focus-within`.
9. **`object-fit: contain` для продуктовых фото.**
   Elementor Image выставляет `object-fit: cover` по умолчанию. Нужен `.dp-product-photo { object-fit: contain }`.
10. **Gradient presets per-variant.**
    `.bottle-card--tuscany`, `.bottle-card--mosel`, `.bottle-card--clean`, `.bottle-card--compact`, `.product-image--wine`, `.product-image--gold`, `.product-image--green`. Задайте как набор CSS-классов, не как отдельные шаблоны.
11. **JS-поведение.**
    В репозитории ссылка на `js/inspector.js` есть в `CLAUDE.md`, но в рабочих HTML она не подключена; кастомного JS на страницах нет. Однако в production понадобятся: открытие/закрытие mega-menu на click/tap (mobile), закрытие по `Esc`, фокус-трап, поведение мобильного меню, sort select submit, фильтр каталога. Это **не входит в Elementor по умолчанию** — предусмотрите отдельную задачу по JS.

### 2.4 Что отсутствует в макете, но нужно на production

Эти блоки **не реализованы** в HTML-ките, но без них запуск не собрать. Добавьте их в бэклог:

- Breadcrumbs на catalog / single product / news / guidelines.
- Pagination и «показать ещё» в каталоге.
- Author/byline и дата публикации в новостях.
- 404 page.
- Cookie / privacy banner.
- WooCommerce cart/checkout/account (если магазин включён), минимальная стилизация.
- Сохранённое состояние поиска, пустое состояние каталога.
- Форма обратной связи с валидацией и success-экраном.
- Skeleton / loading state для каталога.
- Accessible labels на иконках хедера.

---

## 3. Источники токенов в проекте

| Файл | Что это |
|---|---|
| `css/tokens.css` | Единый источник значений: цвета, шрифты, spacing, radius, shadows, container |
| `css/site.css` | Все боевые стили: header, mega-menu, hero, page-hero, карточки, каталог, формы, футер |
| `css/ui-kit.css` | Стили витрины `ui-kit.html` (sidebar, swatches, demo), в production **не переносить** |

В Elementor переносите не CSS целиком, а токены + CSS-классы `dp-*`. `ui-kit.css` остаётся как reference.

---

## 4. Global Colors (Elementor → Site Settings → Global Colors)

Добавьте новые цвета. Старые `Primary/Secondary/Text/Accent` **не удаляйте**, пока не перевяжете все элементы.

| Elementor name | CSS token | Value | Роль |
|---|---|---|---|
| DP Wine 100 | `--color-primary-wine-100` | `#4b0f24` | Основной бренд, primary кнопки, hover меню, линки |
| DP Wine 80 | `--color-primary-wine-80` | `#6d1c36` | Hover primary, вторичный вин |
| DP Black | `--color-neutral-black` | `#161616` | Основной текст |
| DP Gray 700 | `--color-neutral-gray-700` | `#30343a` | Навигация, плотный secondary text |
| DP Gray 600 | `--color-neutral-gray-600` | `#66605f` | Muted text, подписи, описания |
| DP Gray 300 | `--color-neutral-gray-300` | `#d9dee6` | Бордеры, разделители |
| DP Background | `--color-background-base` | `#f4f6f9` | Фон страниц |
| DP Surface | `--color-surface` | `#ffffff` | Карточки, формы, панели |
| DP Gold | `--color-accent-gold` | `#b9965b` | Eyebrow, статусы, премиум-акцент |
| DP Blue | `--color-accent-blue` | `#1f3476` | Logo `.brand-logo`, `.phone-link`, инфо-акценты |
| DP Error | `--color-error` | `#a33a2f` | Ошибки форм |

Также рекомендуются служебные **alpha-значения**, которые лучше держать в `--dp-*` переменных, а не как Global Colors (Elementor не умеет alpha-переменные как токены):

```css
--dp-border-soft: rgba(102, 96, 95, 0.12);
--dp-border-med: rgba(102, 96, 95, 0.16);
--dp-border-strong: rgba(102, 96, 95, 0.24);
--dp-wine-border: rgba(75, 15, 36, 0.24);
--dp-wine-hover: rgba(75, 15, 36, 0.06);
--dp-header-bg: rgba(248, 250, 252, 0.94);
--dp-focus-ring: 0 0 0 4px rgba(75, 15, 36, 0.08);
```

---

## 5. Global Fonts

Подключить в Elementor → Site Settings → Global Fonts. Google Fonts в `index.html` включают: `Inter`, `Montserrat`, `Playfair Display`, `Cormorant Garamond`, `Manrope`. В production для Elementor достаточно первых трёх; `Cormorant`/`Manrope` — только если будете использовать editorial/neo type cards.

| Elementor style | Font | Weight | Desktop | Line height | Transform |
|---|---|---|---|---|---|
| DP H1 | Montserrat | 800 | 56–72px | 1.0–1.1 | Uppercase |
| DP H2 | Montserrat | 800 | 36–44px | 1.1 | Uppercase |
| DP H3 | Montserrat | 800 | 22–28px | 1.15–1.25 | Uppercase |
| DP Body | Inter | 400 | 16px | 1.5 | None |
| DP Body Large | Inter | 400 | 18–19px | 1.5 | None |
| DP Lead | Inter | 500 | 22px | 1.48 | None |
| DP Caption | Inter | 700–800 | 12–13px | 1.2 | Uppercase |
| DP Button | Inter | 700 | 14–16px | 1.2 | None |
| DP Nav | Inter | 800 | 12px | 1.2 | Uppercase |
| DP Editorial H | Playfair Display | 700 | 36–56px | 1.1 | None |

Responsive:

| Style | Tablet | Mobile |
|---|---|---|
| DP H1 | 40–56px | 34–44px |
| DP H2 | 32–36px | 28–32px |
| DP H3 | 22–24px | 20–22px |
| DP Body | 16px | 16px |
| DP Button | 14–16px | 14px |

`clamp()` в Elementor Global Fonts не ставьте — используйте отдельные значения по брейкпоинтам. Для нескольких ключевых `h1/h2` можно вручную прописать `clamp()` в Custom CSS под классами `dp-hero h1`, `dp-page-hero h1`.

---

## 6. Spacing, container, radius, shadows

### Spacing

| Token | Value | Где использовать |
|---|---|---|
| `--dp-space-4` | 4px | Микро-зазоры |
| `--dp-space-8` | 8px | Gap внутри кнопок |
| `--dp-space-16` | 16px | Gap grids, карточки |
| `--dp-space-24` | 24px | Padding карточек, блоков |
| `--dp-space-32` | 32px | Gap колонок |
| `--dp-space-48` | 48px | Средние секции |
| `--dp-space-64` | 64px | Большие секции |
| `--dp-space-80` | 80px | Hero padding top/bottom desktop |

В макете фактические паддинги секций: **desktop 80px top/bottom**, mobile 48px. В старом документе был 72 — обновлено.

### Layout

| Token | Value | Elementor setting |
|---|---|---|
| `--dp-container` | 1240px | Site Settings → Layout → Content Width |
| Section desktop padding | `80px 40px` | Container padding |
| Section mobile padding | `48px 28px` | Container padding (mobile) |
| Section side gap | 40px desktop / 28px mobile | Container padding X |

### Radius

| Token | Value | Где |
|---|---|---|
| `--dp-radius-sm` | 8px | Кнопки, поля, карточки, теги |
| `--dp-radius-md` | 12px | Крупные панели, preview |
| `--dp-radius-lg` | 24px | Акцентные блоки (в текущем макете используется редко — оставляем про запас) |

### Shadows

| Token | Value | Где |
|---|---|---|
| `--dp-shadow-soft` | `0 12px 32px rgba(22, 22, 22, 0.08)` | Карточки, формы, footer panel |
| `--dp-shadow-lift` | `0 20px 52px rgba(75, 15, 36, 0.14)` | Hover карточек, mega menu, primary hover |
| `--dp-shadow-header` | `0 10px 28px rgba(22, 22, 22, 0.05)` | Sticky header |
| `--dp-focus-ring` | `0 0 0 4px rgba(75, 15, 36, 0.08)` | Input/search focus |

---

## 7. Безопасный CSS-слой (`dp-*`)

Добавляйте CSS **только через классы с префиксом `dp-`**, а не через глобальные `body`, `h1`, `button`, `input`, `a`. Это единственный способ не сломать тему и плагины.

Где класть CSS:

1. **Тестовая страница**: `Page Settings → Advanced → Custom CSS`.
2. **После проверки**: `Elementor → Site Settings → Custom CSS`.
3. **Финально (если есть child-тема)**: `wp-content/themes/<child>/style.css` или отдельный enqueued файл.

Базовый слой:

```css
:root {
  --dp-wine-100: #4b0f24;
  --dp-wine-80: #6d1c36;
  --dp-black: #161616;
  --dp-gray-700: #30343a;
  --dp-gray-600: #66605f;
  --dp-gray-300: #d9dee6;
  --dp-bg: #f4f6f9;
  --dp-surface: #ffffff;
  --dp-gold: #b9965b;
  --dp-blue: #1f3476;
  --dp-error: #a33a2f;

  --dp-border-soft: rgba(102, 96, 95, 0.12);
  --dp-border-med: rgba(102, 96, 95, 0.16);
  --dp-border-strong: rgba(102, 96, 95, 0.24);
  --dp-wine-border: rgba(75, 15, 36, 0.24);
  --dp-header-bg: rgba(248, 250, 252, 0.94);

  --dp-radius-sm: 8px;
  --dp-radius-md: 12px;
  --dp-radius-lg: 24px;

  --dp-shadow-soft: 0 12px 32px rgba(22, 22, 22, 0.08);
  --dp-shadow-lift: 0 20px 52px rgba(75, 15, 36, 0.14);
  --dp-shadow-header: 0 10px 28px rgba(22, 22, 22, 0.05);
  --dp-focus-ring: 0 0 0 4px rgba(75, 15, 36, 0.08);
}

.dp-section { padding: 80px 0; }
.dp-section--muted { background: #eef2f6; }

.dp-surface {
  background: var(--dp-surface);
  border: 1px solid var(--dp-border-med);
  border-radius: var(--dp-radius-sm);
  box-shadow: var(--dp-shadow-soft);
}

.dp-eyebrow {
  color: var(--dp-gold);
  font-family: Inter, Arial, sans-serif;
  font-size: 12px;
  line-height: 16px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.dp-section-heading {
  font-family: Montserrat, Inter, Arial, sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--dp-black);
}

@media (max-width: 1080px) {
  .dp-section { padding: 64px 0; }
}

@media (max-width: 720px) {
  .dp-section { padding: 48px 0; }
}
```

---

## 8. Кнопки

`Site Settings → Buttons`. Базовые параметры:

| Property | Value |
|---|---|
| Min height | 48px |
| Padding | 12px 22px |
| Border radius | 8px |
| Font | Inter, 700 |
| Transition | 0.2s |

Primary states:

| State | Text | Background | Shadow |
|---|---|---|---|
| Default | #ffffff | `#4b0f24` | `0 10px 22px rgba(75, 15, 36, 0.16)` |
| Hover | #ffffff | `#6d1c36` | `0 20px 52px rgba(75, 15, 36, 0.14)` |
| Active | #ffffff | `#6d1c36` | inset + `translateY(0)` |
| Disabled | `#ffffff` | `rgba(75, 15, 36, 0.4)` | none |

Secondary states:

| State | Text | Background | Border |
|---|---|---|---|
| Default | `#4b0f24` | `rgba(255,255,255,0.55)` | `rgba(75,15,36,0.24)` |
| Hover | `#4b0f24` | `rgba(75,15,36,0.06)` | `rgba(75,15,36,0.36)` |

```css
.dp-btn-primary .elementor-button,
.dp-btn-primary.elementor-button,
a.dp-btn-primary {
  min-height: 48px;
  padding: 12px 22px;
  border-radius: 8px;
  background: var(--dp-wine-100);
  color: #fff;
  font-family: Inter, Arial, sans-serif;
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(75, 15, 36, 0.16);
  transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
}
.dp-btn-primary:hover .elementor-button,
.dp-btn-primary.elementor-button:hover,
a.dp-btn-primary:hover {
  background: var(--dp-wine-80);
  box-shadow: var(--dp-shadow-lift);
  transform: translateY(-1px);
}

.dp-btn-secondary .elementor-button,
a.dp-btn-secondary {
  min-height: 48px;
  padding: 12px 22px;
  border: 1px solid var(--dp-wine-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.55);
  color: var(--dp-wine-100);
  font-weight: 700;
}

.dp-btn-sm .elementor-button,
a.dp-btn-sm { min-height: 38px; padding: 8px 14px; font-size: 14px; }
```

Классы вешать на виджет Button через `Advanced → CSS Classes`: `dp-btn-primary`, `dp-btn-secondary`, `dp-btn-sm` (комбинируются: `dp-btn-primary dp-btn-sm`).

---

## 9. Формы, поля, search

`Site Settings → Form Fields`:

| Property | Value |
|---|---|
| Background | `#ffffff` |
| Text | `#161616` |
| Placeholder | `#66605f` |
| Border | `1px solid rgba(102, 96, 95, 0.24)` |
| Border radius | 8px |
| Padding | 12–14px |
| Focus border | `#4b0f24` |
| Focus shadow | `0 0 0 4px rgba(75, 15, 36, 0.08)` |
| Error color | `#a33a2f` |

```css
.dp-form .elementor-field {
  border: 1px solid var(--dp-border-strong);
  border-radius: 8px;
  background: #fff;
  color: var(--dp-black);
  font-family: Inter, Arial, sans-serif;
  font-size: 14px;
  padding: 12px 14px;
}
.dp-form .elementor-field:focus {
  border-color: var(--dp-wine-100);
  box-shadow: var(--dp-focus-ring);
  outline: none;
}
.dp-form .elementor-field-label {
  color: var(--dp-gray-700);
  font-size: 13px;
  font-weight: 700;
}
.dp-form .elementor-message-danger { color: var(--dp-error); }

.dp-select {
  appearance: none;
  padding: 7px 36px 7px 12px;
  min-height: 40px;
  border: 1px solid var(--dp-border-strong);
  border-radius: 8px;
  background: #fff url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='none' stroke='%2330343a' stroke-width='1.5' d='M1 1l5 5 5-5'/></svg>") no-repeat right 14px center;
  font-family: Inter, Arial, sans-serif;
  font-weight: 600;
}

.dp-search {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  border: 1px solid var(--dp-border-strong);
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
}
.dp-search:focus-within {
  border-color: var(--dp-wine-100);
  box-shadow: var(--dp-focus-ring);
}
```

Обязательные состояния для QA: default, hover, focus, filled, disabled, error, required, textarea, submit loading, success screen, mobile keyboard.

---

## 10. Карточки

### 10.1 Базовая карточка

```css
.dp-card {
  min-width: 0;
  border: 1px solid var(--dp-border-med);
  border-radius: var(--dp-radius-sm);
  background: #fff;
  box-shadow: var(--dp-shadow-soft);
  overflow: hidden;
  transition: transform .2s ease, box-shadow .2s ease;
}
.dp-card:hover { transform: translateY(-3px); box-shadow: var(--dp-shadow-lift); }

.dp-card-title {
  color: var(--dp-black);
  font-family: Montserrat, Inter, Arial, sans-serif;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  text-transform: uppercase;
}
.dp-card-text { color: var(--dp-gray-600); font-size: 14px; line-height: 1.45; }
```

### 10.2 Product card (grid)

В Elementor построить как Container:

```
.dp-product-card (Container, display=flex vertical)
  .dp-product-media  → Image widget c .dp-product-photo
  .dp-product-footer → 2 колонки: title + price + small button
```

CSS:

```css
.dp-product-photo { object-fit: contain; object-position: center; max-height: 200px; }
.dp-product-price { color: var(--dp-wine-100); font-size: 18px; font-weight: 800; }
```

### 10.3 Product card (list, catalog)

3 колонки на desktop, 1 на mobile:

```css
.dp-product-list {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr) 220px;
  gap: 24px;
  align-items: center;
  padding: 20px;
}
@media (max-width: 1080px) { .dp-product-list { grid-template-columns: 160px 1fr; } .dp-product-list__actions { grid-column: 1 / -1; } }
@media (max-width: 720px)  { .dp-product-list { grid-template-columns: 1fr; } }
```

В Elementor собрать как Container с `display: grid` через Custom CSS, либо как Inner Section с фиксированными ширинами колонок (проще, но менее адаптивно).

### 10.4 Bottle card + варианты

```css
.dp-bottle-card { /* extends .dp-card */ }
.dp-bottle-card__media { padding: 32px 0; display: grid; place-items: center; }
.dp-bottle-card__photo { object-fit: contain; }

.dp-bottle-card--tuscany  .dp-bottle-card__media { background: linear-gradient(135deg, #b16d2c 0%, #c8ad94 52%, #dfe5eb 100%); }
.dp-bottle-card--mosel    .dp-bottle-card__media { background: linear-gradient(135deg, #214f3d 0%, #8aa38e 48%, #e8ebdc 100%); }
.dp-bottle-card--wine     .dp-bottle-card__media { background: linear-gradient(135deg, #6d1c36 0%, #9b5366 46%, #e6dce1 100%); }
.dp-bottle-card--gold     .dp-bottle-card__media { background: linear-gradient(135deg, #b9965b 0%, #d7c18b 48%, #eef2f6 100%); }
.dp-bottle-card--clean    .dp-bottle-card__media { background: linear-gradient(135deg, #edf1f5 0%, #d7dee7 100%); }
.dp-bottle-card--compact  { /* scale-down variant */ }
.dp-bottle-card--horizontal { display: grid; grid-template-columns: 180px 1fr; }
```

Варианты подключаются комбинацией классов: `dp-bottle-card dp-bottle-card--tuscany`.

### 10.5 Feature card с номером (about)

```html
<article class="dp-feature-card">
  <span class="dp-feature-card__num">01</span>
  <h3>Удобный каталог</h3>
  <p>Фильтры по типу, региону, производителю…</p>
</article>
```

```css
.dp-feature-card { padding: 22px; min-height: 210px; display: grid; align-content: space-between; }
.dp-feature-card__num { color: var(--dp-gold); font-size: 12px; font-weight: 800; text-transform: uppercase; }
.dp-feature-card h3 { margin: 18px 0 8px; font-family: Montserrat; font-weight: 800; font-size: 22px; text-transform: uppercase; }
```

### 10.6 Info card / contact panel / contact form

Все три на одном surface-шаблоне (`.dp-surface`) + padding 24px. В Elementor: один Container-пресет, меняется только внутренний контент.

### 10.7 Meta list (product detail)

```html
<dl class="dp-meta-list">
  <div><span>Regione</span><strong>Toscana</strong></div>
  <div><span>Annata</span><strong>2020</strong></div>
  …
</dl>
```

```css
.dp-meta-list { display: grid; gap: 12px; margin: 28px 0; }
.dp-meta-list div { display: flex; justify-content: space-between; gap: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--dp-border-med); }
.dp-meta-list span { color: var(--dp-gray-600); }
```

---

## 11. Теги / chips / статусы

```css
.dp-tag, .dp-chip {
  display: inline-flex; align-items: center;
  min-height: 30px; padding: 6px 10px;
  border-radius: 8px;
  font: 800 12px/1 Inter, sans-serif;
  text-transform: uppercase;
}
.dp-tag--filled, .dp-chip--active { background: var(--dp-wine-100); color: #fff; }
.dp-tag--outline { border: 1px solid var(--dp-wine-border); color: var(--dp-wine-100); background: transparent; }
.dp-tag--gold { background: rgba(185, 150, 91, 0.18); color: #7c5f26; }
```

В Elementor: Heading widget с HTML tag = `span`, Button widget без ссылки, либо Text Editor.

---

## 12. Hero, page hero, editorial hero

### 12.1 `.dp-hero` (home)

```css
.dp-hero {
  min-height: 100vh;
  padding: 80px 0;
  color: #f8fafc;
  background:
    linear-gradient(100deg, rgba(22, 20, 17, 0.84) 0%, rgba(22, 20, 17, 0.58) 38%, rgba(22, 20, 17, 0.12) 72%),
    url("/wp-content/uploads/hero.jpg") center / cover;
}
.dp-hero h1 { font-size: clamp(40px, 5.6vw, 76px); line-height: 1; text-transform: uppercase; font-weight: 800; }
@media (max-width: 720px) { .dp-hero { min-height: 620px; } }
```

### 12.2 `.dp-page-hero` с модификаторами

Четыре варианта фонового изображения (`--about`, `--contacts`, `--guidelines`, `--news`). Задаются модификаторами через `CSS Classes` на Elementor секции + background image в Style панели, либо через CSS url-ы.

```css
.dp-page-hero { padding: 78px 0; color: #f8fafc; background-size: cover; background-position: center; }
.dp-page-hero__inner { display: grid; grid-template-columns: minmax(0, 0.72fr) minmax(280px, 0.28fr); gap: 36px; align-items: end; }
.dp-page-hero h1 { font-size: clamp(40px, 5.6vw, 76px); line-height: 0.98; text-transform: uppercase; font-weight: 800; }
.dp-page-hero__meta { padding: 22px; background: #fff; color: var(--dp-black); border-radius: var(--dp-radius-sm); box-shadow: var(--dp-shadow-soft); }
```

В `.dp-page-hero` накладывать `linear-gradient` поверх фонового изображения через background shorthand (Elementor → Style → Background overlay → Gradient).

---

## 13. Header

Исходник: `css/site.css:47–369`, `components/menu.html`.

Правила переноса:

1. **Не меняйте** текущий Header template сразу.
2. Дублируйте → `Header DP UI Kit Draft`.
3. Примените классы и стили на копии.
4. После проверки назначьте через `Theme Builder → Header → Display Conditions`.

Sticky + blur + border:

```css
.dp-header {
  position: sticky; top: 0; z-index: 40;
  background: var(--dp-header-bg);
  border-bottom: 1px solid rgba(102, 96, 95, 0.18);
  box-shadow: var(--dp-shadow-header);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.dp-nav a,
.dp-nav .elementor-item {
  color: var(--dp-gray-700);
  font: 800 12px/1.2 Inter, sans-serif;
  text-transform: uppercase;
}
.dp-nav a:hover,
.dp-nav .elementor-item:hover,
.dp-nav .elementor-item-active { color: var(--dp-wine-100); }
```

### Mega menu

Стандартный Elementor Nav Menu не даёт асимметричный 4-колоночный grid. Варианты:

- **Вариант A (рекомендуется):** кастомный HTML-виджет с готовой разметкой `components/menu.html` + CSS-классы `dp-mega-menu`, `dp-mega-menu__grid`. Открытие/закрытие — минимальный JS (50 строк) либо CSS-only через `:focus-within`.
- **Вариант B:** плагин JetMenu / Max Mega Menu. Даёт drag-and-drop контент в колонках, но потребует доработки CSS, чтобы колонки были `1.05fr 0.82fr 1.25fr 0.88fr`.
- **Вариант C:** простой dropdown Elementor Pro без 4-колонок (запасной путь).

CSS-контур:

```css
.dp-mega-menu {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: min(1240px, calc(100vw - 40px));
  padding: 28px;
  background: #fff;
  border-radius: var(--dp-radius-md);
  box-shadow: var(--dp-shadow-lift);
}
.dp-mega-menu__grid {
  display: grid;
  grid-template-columns: 1.05fr 0.82fr 1.25fr 0.88fr;
  gap: 24px;
}
.dp-mega-menu__appellations {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}
@media (max-width: 1080px) { .dp-mega-menu__grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 720px)  { .dp-mega-menu__grid { grid-template-columns: 1fr; } }
```

JS-требования: hover desktop с задержкой 150ms, click/tap mobile, `Esc` закрывает, focus-trap внутри открытого меню, `aria-expanded`, `role="menu"`.

### Header icons

Inline SVG с `stroke: currentColor; stroke-width: 1.45`. Задать через Icon widget (SVG upload) либо HTML-виджет. Класс `.dp-header-icon` + `.dp-header-icon--air` для варианта без бордера.

---

## 14. Footer

Исходник: `css/site.css:2042–…`, `components/footer.html`.

Структура (desktop): `210px / 1fr / 250px` — brand block, nav 3 группы, контакты + соцсети. Карточная панель на белом surface.

```css
.dp-footer { padding: 32px 0 40px; border-top: 1px solid rgba(102, 96, 95, 0.12); background: var(--dp-bg); }
.dp-footer__container {
  padding: 24px 28px 20px;
  border: 1px solid var(--dp-border-med);
  border-radius: var(--dp-radius-sm);
  background: #fff;
  box-shadow: var(--dp-shadow-soft);
}
.dp-footer__main {
  display: grid;
  grid-template-columns: minmax(170px, 210px) minmax(0, 1fr) minmax(210px, 250px);
  gap: 24px 32px;
  align-items: start;
}
@media (max-width: 1080px) { .dp-footer__main { grid-template-columns: 1fr 1fr; } }
@media (max-width: 720px)  { .dp-footer__main { grid-template-columns: 1fr; } }
```

Порядок: дублировать текущий Footer template → назвать `Footer DP UI Kit Draft` → применить классы → проверить → назначить.

---

## 15. Каталог и single product

### Catalog (archive)

Переносите поэтапно — не все блоки сразу:

1. Визуальный стиль карточки (`.dp-product-card`, `.dp-product-list`).
2. Toolbar + sort (`.dp-catalog-toolbar`, `.dp-select`).
3. Filters / chips (`.dp-chip` + `.dp-chip--active`).
4. List / compact / b2b варианты.
5. Hover lift + skeleton / empty state.
6. Breadcrumbs (новый компонент, в макете нет).
7. Pagination (новый компонент, в макете нет).

Минимальный набор классов:

```txt
dp-catalog
dp-catalog-toolbar
dp-select
dp-product-card
dp-product-list
dp-product-price
dp-card-title
dp-card-text
dp-tag dp-tag--filled dp-tag--outline
dp-btn-primary dp-btn-sm
dp-chip dp-chip--active
```

### Single product

- `.dp-product-hero` — 2 колонки (image + info).
- `.dp-product-photo` с `object-fit: contain`.
- `.dp-meta-list` — свойства 4 пары label/value.
- CTA — `.dp-btn-primary` + `.dp-btn-secondary` side-by-side.
- Breadcrumbs сверху.
- Блок «похожие товары» — переиспользуем `.dp-product-card`.

---

## 16. Новости, about, contacts, guidelines

### News single (2 верстки)

В репозитории две версии: `news-villa-raiano.html` и `-v2.html`. Решите, какая идёт в production, вторую оставьте как черновик.

- Editorial hero (`.dp-page-hero` + `--news`).
- `.dp-article-layout { grid-template-columns: 0.68fr 0.32fr }` — статья + sidebar с meta.
- `.dp-article-body` — типографика: `.lead` 22px/1.48, `h2/h3`, параграфы 18px/1.55.
- Author/byline / дата — **добавить новым компонентом** (в макете нет).

### About

- `.dp-page-hero dp-page-hero--about`.
- `.dp-about-grid { grid-template-columns: 0.58fr 0.42fr }`.
- 4 `.dp-feature-card` с числовым значком `<span>01</span>…`.

### Contacts / Contacts-auth

- `.dp-page-hero dp-page-hero--contacts`.
- `.dp-contacts-layout { grid-template-columns: 0.68fr 0.32fr }`.
- `.dp-contact-form` + `.dp-contact-panel`.
- `contacts-auth.html` — выяснить, это залогиненный стейт или отдельная страница «регистрации». От этого зависит, WooCommerce My Account endpoint или кастомная страница.

### Article guidelines

- Тот же `.dp-page-hero` + `--guidelines`.
- `.dp-article-body` с расширенным набором блоков (tables, ul, code).

---

## 17. Страница UI Kit Preview

Создайте страницу `/ui-kit-preview/`. Разместите:

1. Color swatches (DP Wine 100/80, Gray 700/600/300, Gold, Blue, Background, Surface, Error).
2. Типографика: H1, H2, H3, body, lead, caption, editorial H.
3. Кнопки: primary, secondary, small, disabled, hover, focus.
4. Формы: input default/focus/error/disabled, select, search bar, textarea.
5. Product card (grid + list + compact + b2b).
6. Bottle card — все 5 вариантов.
7. Feature card (01–04).
8. Info card / contact panel / contact form.
9. Meta list.
10. Tags, chips (filled/outline/gold).
11. Section heading, section heading split.
12. Eyebrow.
13. Page hero превью.
14. Header + mega-menu превью (или ссылка на staging).
15. Footer превью.
16. Breadcrumbs (новый компонент).
17. Pagination (новый компонент).

Эта страница — **контрольная витрина**. Любое изменение токенов проверяется на ней первым.

---

## 18. Декомпозиция работ

Формат: элемент → что делать в Elementor → оценка (S/M/L) → зависимости.

### A. Global settings (~1 день)

1. Global Colors DP palette — **S** — нет.
2. Global Fonts DP — **S** — нет.
3. Container width + default padding — **S** — нет.
4. Form Fields Site Settings — **S** — нет.
5. Buttons Site Settings — **S** — нет.

### B. Custom CSS layer (~1 день)

6. `:root` переменные `--dp-*` — **S** — A.
7. `.dp-*` утилиты (section, surface, eyebrow, heading) — **S** — 6.
8. Responsive overrides (1080/720px) — **S** — 7.

### C. Atom-компоненты (~2 дня)

9. `.dp-btn-*` (primary/secondary/sm + states) — **S**.
10. `.dp-form-*` (input/select/search/textarea + states) — **M**.
11. `.dp-tag/.dp-chip` все варианты — **S**.
12. `.dp-card`, `.dp-surface` — **S**.

### D. Molecule-компоненты (~3 дня)

13. `.dp-product-card` (grid) — **M**.
14. `.dp-product-list` (catalog list + compact + b2b) — **L** (требует grid в Container).
15. `.dp-bottle-card` + 5 модификаторов — **M**.
16. `.dp-feature-card` + номер — **S**.
17. `.dp-meta-list` — **S**.
18. `.dp-info-card`, `.dp-contact-panel`, `.dp-contact-form` — **M**.
19. `.dp-section-heading`, `.dp-section-heading--split` — **S**.

### E. Organisms (~3 дня)

20. `.dp-hero` (home) — **M**.
21. `.dp-page-hero` + 4 модификатора — **M**.
22. `.dp-article-body` editorial типографика — **M**.
23. `.dp-footer` (копия существующего) — **M**.
24. `.dp-header` sticky + blur (копия) — **M**.
25. Mega menu (кастомный HTML + CSS + минимальный JS) — **L** — критический путь.

### F. Page templates (~3 дня)

26. Home Template — **M** — B, C, D, E.
27. Single Product Template — **M** — D.
28. Catalog Archive Template — **L** (требует WooCommerce или CPT) — D.
29. Single News Post Template — **M** — D, E.
30. About Page Template — **S** — D, E.
31. Contacts Page Template — **S** — D, E.
32. Article Guidelines Template — **S** — D, E.
33. UI Kit Preview — **M** — C, D, E.

### G. Пробелы макета (~2 дня)

34. Breadcrumbs компонент — **S**.
35. Pagination компонент — **S**.
36. 404 page — **S**.
37. Cookie/privacy banner — **S**.
38. Author/byline на news — **S**.
39. Empty/loading states каталога — **M**.

### H. QA и публикация (~2 дня)

40. QA по чеклисту §19.
41. Rollback-план §20.
42. Regenerate CSS & Data, очистка кэшей.
43. Production выкатка.

Суммарно ориентировочно **15–17 рабочих дней** одним разработчиком при наличии готового Elementor Pro и chosen mega-menu strategy.

---

## 19. План по этапам (6 фаз)

**Фаза 1. Foundation (1–2 дня).**
Backup, staging, Global Colors/Fonts/Layout, Custom CSS layer (`:root` + `.dp-*` утилиты). QA: на тестовой странице видны цвета, шрифты, общие классы.

**Фаза 2. Atom + molecule (3–4 дня).**
Кнопки, формы, теги, `.dp-card`, `.dp-meta-list`, `.dp-feature-card`, `.dp-info-card`. QA: страница UI Kit Preview собрана на 70%.

**Фаза 3. Organisms draft (3–4 дня).**
`Header DP UI Kit Draft`, `Footer DP UI Kit Draft`, mega menu (HTML-виджет), `.dp-hero`, `.dp-page-hero`. **Не назначать** на production до фазы 6. QA: превью всех хедеров/футеров на staging.

**Фаза 4. Pages (3–4 дня).**
Home, About, Contacts, Contacts-auth, Article Guidelines, News Single (2 варианта), UI Kit Preview. Catalog и Single Product — отдельно, после Woo-конфигурации. QA: кликабельный staging-сайт.

**Фаза 5. Catalog / Commerce (2–3 дня).**
Archive, Single Product, filters, pagination, breadcrumbs, empty state. Привязка к WooCommerce или кастомному CPT `product`. QA: добавление товара, фильтрация, отправка CTA.

**Фаза 6. Switchover (1 день).**
Назначение Header/Footer, выключение старых шаблонов, Regenerate CSS & Data, CDN cache purge, incognito-проверка, смоук-тест всех страниц.

---

## 20. Что делать нельзя

Не добавляйте глобально такие правила:

```css
* { margin: 0; padding: 0; }
button { all: unset; }
a { color: inherit; text-decoration: none; }
h1, h2, h3 { margin: 0; }
input, select, textarea { all: unset; }
```

Они ломают тему, плагины, WooCommerce, формы, меню и старые страницы.

Также не стоит:

- удалять старые Elementor Global Colors;
- массово заменять цвета по всему сайту;
- менять breakpoints без полного responsive QA;
- вставлять весь `site.css` в Elementor;
- переносить `ui-kit.css` и sidebar UI-kit витрины;
- менять Header/Footer на production без дубликата;
- переносить `ui-kit.html` как production-страницу;
- ставить `position: fixed` на header вместо `sticky` (ломает Elementor Pro Sticky effects).

---

## 21. QA checklist перед публикацией

Страницы:

- Home (hero, producers, news, recommendations).
- Catalog (toolbar, list, hover, sort, filters, breadcrumbs, pagination).
- Single Product (meta-list, CTA, related).
- About.
- Contacts + contacts-auth.
- News single (обе верстки).
- Article guidelines.
- 404.
- WooCommerce cart/checkout/account (если используется).
- UI Kit Preview.

Для каждого экрана:

- нет горизонтального скролла;
- текст не обрезается;
- кнопки не ломаются;
- hover/focus видны;
- карточки не прыгают по высоте;
- картинки не растягиваются;
- меню открывается/закрывается клавиатурой;
- mega menu закрывается по `Esc`;
- формы отправляются;
- ошибки форм читаемы;
- контраст AA ≥ 4.5;
- sticky header работает на iOS Safari;
- `backdrop-filter` имеет fallback (solid bg) для старых браузеров;
- lighthouse performance ≥ 80, accessibility ≥ 95.

Устройства:

- Chrome desktop.
- Safari desktop (macOS).
- Firefox desktop.
- iPhone Safari (iOS 17+).
- Android Chrome.
- Таблет 1024px.

---

## 22. Публикация

1. Свежий backup production.
2. Экспорт текущих Elementor templates и Site Settings.
3. Перенос Global Colors / Fonts.
4. Вставка проверенного CSS-слоя.
5. Импорт / обновление шаблонов.
6. Назначение Header / Footer draft → main.
7. `Elementor → Tools → Regenerate CSS & Data`.
8. Очистка кэша плагина оптимизации (WP Rocket / W3TC / LiteSpeed).
9. Очистка server/CDN кэша.
10. Проверка в incognito на desktop и mobile.
11. Смоук-тест: home, catalog, product, contacts form, 1 новость.

---

## 23. План отката

Перед публикацией должны быть готовы:

- backup production;
- экспорт старых Elementor templates;
- список изменённых Global Colors / Fonts;
- копия добавленного Custom CSS;
- скриншоты ключевых страниц до переноса;
- список условий отображения Header / Footer до изменения.

Если что-то сломалось:

1. Отключить новый Custom CSS в Site Settings.
2. Вернуть старый Header/Footer template (Theme Builder → Conditions).
3. `Regenerate CSS & Data`.
4. Очистить кэш.
5. Если проблема осталась — восстановить backup.

---

## 24. Минимальный скоуп первого релиза

Если нужно быстро показать «новое лицо» без полной миграции:

1. Global Colors DP.
2. Global Fonts DP H1/H2/H3/Body/Button.
3. `:root` + `.dp-*` CSS-слой.
4. `.dp-btn-primary`, `.dp-btn-secondary`, `.dp-btn-sm`.
5. `.dp-card`, `.dp-form`, `.dp-tag`, `.dp-eyebrow`.
6. `Header DP UI Kit Draft` на одной staging-странице.
7. `Footer DP UI Kit Draft` там же.
8. Страница `UI Kit Preview`.

Этого достаточно для валидации дизайн-системы. Catalog, single product, news — следующий релиз.

---

## Приложение A. Маппинг исходников → разделы документа

| Исходник | Линии | Раздел |
|---|---|---|
| `css/tokens.css` | 1–35 | §4, §5, §6 |
| `css/site.css` | 47–55 (header sticky) | §13 |
| `css/site.css` | 242–369 (mega menu) | §13 |
| `css/site.css` | 279–288 (eyebrow) | §7 |
| `css/site.css` | 428–461 (hero) | §12.1 |
| `css/site.css` | 870–897 (bottle pseudo) | §2.3 #3, §10.4 |
| `css/site.css` | 976–1001 (product list) | §10.3 |
| `css/site.css` | 1104–1253 (bottle cards + variants) | §10.4 |
| `css/site.css` | 1385–1477 (page hero) | §12.2 |
| `css/site.css` | 1580–1600 (feature card) | §10.5 |
| `css/site.css` | 2024–2040 (meta list) | §10.7 |
| `css/site.css` | 2042–2100 (footer) | §14 |
| `css/site.css` | 2227–2500 (media queries) | §7, все compo |
| `components/menu.html` | весь | §13 (mega menu HTML) |
| `components/footer.html` | весь | §14 |
