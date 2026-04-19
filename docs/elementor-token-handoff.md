# Перенос UI-kit токенов и элементов в Elementor

Документ описывает безопасный перенос дизайн-токенов и базовых элементов DP Trade UI-kit в Elementor WordPress. Главная цель: внедрить новую дизайн-систему постепенно, не ломая текущие страницы и глобальные настройки сайта.

## 1. Базовый принцип переноса

Не заменяйте существующие настройки Elementor сразу. Сначала добавьте новые токены рядом со старыми, соберите тестовую страницу, проверьте визуально, затем постепенно переводите реальные шаблоны и страницы на новые значения.

Рекомендуемый порядок:

1. Сделать backup сайта и базы данных.
2. Работать на staging-копии или тестовой странице.
3. Добавить новые Global Colors.
4. Добавить новые Global Fonts.
5. Настроить базовые элементы: кнопки, поля, карточки, теги.
6. Создать страницу `UI Kit Preview` в WordPress.
7. Проверить desktop, tablet, mobile.
8. Только после проверки применять к Header, Footer, каталогу и страницам.

## 2. Источники токенов в проекте

Основные файлы:

- `css/tokens.css` — базовые дизайн-токены сайта.
- `css/site.css` — стили реальных страниц, header, footer, карточек, каталога, форм.
- `css/ui-kit.css` — витрина UI-kit, состояния и примеры компонентов.
- `ui-kit.html` — живая HTML-витрина дизайн-системы.

В Elementor переносите не весь CSS целиком, а роли и значения: цвета, шрифты, отступы, радиусы, тени и повторяемые компоненты.

## 3. Карта цветов для Elementor Global Colors

Перейдите в:

`Elementor -> Site Settings -> Global Colors`

Добавьте новые цвета. Старые цвета пока не удаляйте.

| Elementor name | CSS token | Value | Role |
|---|---:|---:|---|
| DP Wine 100 | `--color-primary-wine-100` | `#4b0f24` | Основной брендовый цвет, primary buttons, hover menu, акценты |
| DP Wine 80 | `--color-primary-wine-80` | `#6d1c36` | Hover для primary, вторичный винный оттенок |
| DP Black | `--color-neutral-black` | `#161616` | Основной текст |
| DP Gray 700 | `--color-neutral-gray-700` | `#30343a` | Навигация, плотный вторичный текст |
| DP Gray 600 | `--color-neutral-gray-600` | `#66605f` | Описания, muted text, подписи |
| DP Gray 300 | `--color-neutral-gray-300` | `#d9dee6` | Бордеры, разделители |
| DP Background | `--color-background-base` | `#f4f6f9` | Основной фон страниц |
| DP Surface | `--color-surface` | `#ffffff` | Карточки, поля, панели |
| DP Gold | `--color-accent-gold` | `#b9965b` | Eyebrow, статусы, премиальные акценты |
| DP Blue | `--color-accent-blue` | `#1f3476` | Логотип, телефон, информационные акценты |
| DP Error | `--color-error` | `#a33a2f` | Ошибки форм |

Важно: если в текущем Elementor уже есть цвета `Primary`, `Secondary`, `Text`, `Accent`, не заменяйте их сразу. Добавьте цвета с префиксом `DP`, затем перепривязывайте элементы вручную.

## 4. Карта шрифтов для Elementor Global Fonts

Перейдите в:

`Elementor -> Site Settings -> Global Fonts`

Подключение шрифтов:

- Headings: `Montserrat`
- Body: `Inter`
- Classic heading, если понадобится для редакционных блоков: `Playfair Display`

| Elementor style | Font family | Weight | Size desktop | Line height | Transform |
|---|---|---:|---:|---:|---|
| DP H1 | `Montserrat` | `800` | `48-72px` | `1.1` | Uppercase |
| DP H2 | `Montserrat` | `800` | `36-40px` | `1.1-1.22` | Uppercase |
| DP H3 | `Montserrat` | `800` | `24-28px` | `1.15-1.25` | Uppercase |
| DP Body | `Inter` | `400` | `16px` | `1.5` | None |
| DP Body Large | `Inter` | `400` | `18px` | `28px` | None |
| DP Caption | `Inter` | `600-700` | `12-13px` | `16px` | Optional uppercase |
| DP Button | `Inter` | `700` | `14-16px` | `1.2` | None |
| DP Nav | `Inter` | `800` | `12px` | `1.2` | Uppercase |

Рекомендация по responsive:

| Style | Tablet | Mobile |
|---|---:|---:|
| DP H1 | `40-48px` | `34-40px` |
| DP H2 | `32-36px` | `28-32px` |
| DP H3 | `22-24px` | `20-22px` |
| DP Body | `16px` | `16px` |
| DP Button | `14-16px` | `14px` |

Не используйте viewport-based font size в Elementor. Лучше задавать отдельные значения для desktop, tablet и mobile.

## 5. Spacing, radius, shadows

В Elementor нет полноценной системы design tokens для spacing, поэтому переносите значения как правила для секций, контейнеров и классов.

### Spacing scale

| Token | Value | Где использовать |
|---|---:|---|
| `--spacing-4` | `4px` | Мелкие зазоры, иконки |
| `--spacing-8` | `8px` | Gap внутри кнопок, compact controls |
| `--spacing-16` | `16px` | Карточки, поля, grid gap |
| `--spacing-24` | `24px` | Padding карточек, блоки форм |
| `--spacing-32` | `32px` | Gap между колонками |
| `--spacing-48` | `48px` | Крупные отступы секций |
| `--spacing-64` | `64px` | Hero, большие секции |

### Layout

| Token | Value | Elementor setting |
|---|---:|---|
| `--container` | `1240px` | Site Settings -> Layout -> Content Width |
| Section desktop padding | `72px 24-72px` | Section/container padding |
| Section mobile padding | `48px 20px` | Responsive padding |
| Container side gap | `20px` each side | Container width: `min(100% - 40px, 1240px)` в CSS |

### Radius

| Token | Value | Где использовать |
|---|---:|---|
| `--radius-sm` | `8px` | Кнопки, поля, карточки, теги |
| `--radius-md` | `12px` | Крупные панели, preview blocks |
| `--radius-lg` | `24px` | Редкие крупные акцентные блоки |

### Shadows

Elementor поддерживает box-shadow в Advanced/Style, но удобнее завести CSS-классы.

| Token | Value | Где использовать |
|---|---|---|
| `--shadow-soft` | `0 12px 32px rgba(22, 22, 22, 0.08)` | Обычные карточки, формы, footer panel |
| `--shadow-lift` | `0 20px 52px rgba(75, 15, 36, 0.14)` | Hover карточек, mega menu, primary hover |
| Header shadow | `0 10px 28px rgba(22, 22, 22, 0.05)` | Sticky header |
| Focus shadow | `0 0 0 4px rgba(75, 15, 36, 0.08)` | Search/input focus |

## 6. Безопасный CSS-слой для Elementor

Добавляйте CSS не через глобальные теги `body`, `h1`, `button`, `input`, а через классы с префиксом `dp-`.

Где добавлять:

1. Сначала на тестовой странице: `Page Settings -> Advanced -> Custom CSS`.
2. После проверки: `Elementor -> Site Settings -> Custom CSS`.
3. Если есть child theme, финальную версию можно перенести в `style.css`.

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
  --dp-radius-sm: 8px;
  --dp-shadow-soft: 0 12px 32px rgba(22, 22, 22, 0.08);
  --dp-shadow-lift: 0 20px 52px rgba(75, 15, 36, 0.14);
}

.dp-section {
  padding-top: 72px;
  padding-bottom: 72px;
}

.dp-surface {
  background: var(--dp-surface);
  border: 1px solid rgba(102, 96, 95, 0.16);
  border-radius: var(--dp-radius-sm);
  box-shadow: var(--dp-shadow-soft);
}

.dp-eyebrow {
  color: var(--dp-gold);
  font-family: Inter, Arial, sans-serif;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}
```

Mobile override:

```css
@media (max-width: 767px) {
  .dp-section {
    padding-top: 48px;
    padding-bottom: 48px;
  }
}
```

## 7. Перенос кнопок

В Elementor настройте:

`Site Settings -> Buttons`

Базовая кнопка:

| Property | Value |
|---|---:|
| Min height | `48px` |
| Padding | `12px 22px` |
| Border radius | `8px` |
| Font | `Inter`, `700` |
| Transition | `0.2s` |

Primary:

| State | Text | Background | Border | Shadow |
|---|---:|---:|---:|---|
| Default | `#ffffff` | `#4b0f24` | transparent | `0 10px 22px rgba(75, 15, 36, 0.16)` |
| Hover | `#ffffff` | `#6d1c36` | transparent | `0 20px 52px rgba(75, 15, 36, 0.14)` |

Secondary:

| State | Text | Background | Border |
|---|---:|---:|---:|
| Default | `#4b0f24` | `rgba(255,255,255,0.55)` | `rgba(75,15,36,0.24)` |
| Hover | `#4b0f24` | `rgba(75,15,36,0.06)` | `rgba(75,15,36,0.36)` |

CSS-классы:

```css
.dp-btn-primary .elementor-button {
  min-height: 48px;
  padding: 12px 22px;
  border-radius: 8px;
  background: var(--dp-wine-100);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(75, 15, 36, 0.16);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.dp-btn-primary .elementor-button:hover {
  background: var(--dp-wine-80);
  box-shadow: var(--dp-shadow-lift);
  transform: translateY(-1px);
}

.dp-btn-secondary .elementor-button {
  min-height: 48px;
  padding: 12px 22px;
  border: 1px solid rgba(75, 15, 36, 0.24);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.55);
  color: var(--dp-wine-100);
  font-weight: 700;
}

.dp-btn-sm .elementor-button {
  min-height: 38px;
  padding: 8px 14px;
  font-size: 14px;
}
```

В Elementor у виджета Button добавляйте классы:

- `dp-btn-primary`
- `dp-btn-secondary`
- `dp-btn-sm`

## 8. Перенос форм и input fields

Для Elementor Forms:

`Site Settings -> Form Fields`

| Property | Value |
|---|---:|
| Background | `#ffffff` |
| Text | `#161616` |
| Placeholder | `#66605f` |
| Border | `1px solid rgba(102, 96, 95, 0.24)` |
| Border radius | `8px` |
| Padding | `12-14px` |
| Focus border | `#4b0f24` |
| Focus shadow | `0 0 0 3-4px rgba(75, 15, 36, 0.08-0.10)` |
| Error color | `#a33a2f` |

CSS-класс для формы:

```css
.dp-form .elementor-field {
  border: 1px solid rgba(102, 96, 95, 0.24);
  border-radius: 8px;
  background: #ffffff;
  color: var(--dp-black);
  font-family: Inter, Arial, sans-serif;
  font-size: 14px;
}

.dp-form .elementor-field:focus {
  border-color: var(--dp-wine-100);
  box-shadow: 0 0 0 4px rgba(75, 15, 36, 0.08);
}

.dp-form .elementor-field-label {
  color: var(--dp-gray-700);
  font-size: 13px;
  font-weight: 700;
}

.dp-form .elementor-message-danger {
  color: var(--dp-error);
}
```

Проверить после переноса:

- default state;
- focus state;
- required fields;
- error message;
- textarea;
- disabled field;
- submit button;
- mobile keyboard behavior.

## 9. Карточки товаров и контентные карточки

Карточки UI-kit используют:

- белую поверхность;
- radius `8px`;
- border `rgba(102, 96, 95, 0.16)`;
- shadow soft;
- hover lift;
- внутренний padding `16-24px`;
- muted text `#66605f`;
- uppercase heading на `Montserrat 800`.

CSS-класс:

```css
.dp-card {
  min-width: 0;
  border: 1px solid rgba(102, 96, 95, 0.16);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: var(--dp-shadow-soft);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dp-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--dp-shadow-lift);
}

.dp-card-title {
  color: var(--dp-black);
  font-family: Montserrat, Inter, Arial, sans-serif;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
  text-transform: uppercase;
}

.dp-card-text {
  color: var(--dp-gray-600);
  font-size: 14px;
  line-height: 1.45;
}
```

Для Elementor:

1. Создайте контейнер карточки.
2. В Advanced -> CSS Classes добавьте `dp-card`.
3. Заголовку добавьте `dp-card-title`.
4. Описанию добавьте `dp-card-text`.
5. Кнопке добавьте `dp-btn-primary` или `dp-btn-secondary`.

## 10. Теги, chips, статусы

Используются для стран, категорий, фильтров, статусов.

```css
.dp-tag,
.dp-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
}

.dp-tag-filled,
.dp-chip-active {
  background: var(--dp-wine-100);
  color: #ffffff;
}

.dp-tag-outline {
  border: 1px solid rgba(75, 15, 36, 0.24);
  color: var(--dp-wine-100);
  background: transparent;
}

.dp-tag-gold {
  background: rgba(185, 150, 91, 0.18);
  color: #7c5f26;
}
```

В Elementor это можно делать через:

- Heading widget с HTML tag `span`;
- Text Editor;
- Button widget без ссылки;
- Loop item meta fields, если это каталог.

## 11. Header и навигация

Header в UI-kit использует:

- sticky position;
- background `rgba(248, 250, 252, 0.94)`;
- border-bottom `rgba(102, 96, 95, 0.18)`;
- shadow `0 10px 28px rgba(22, 22, 22, 0.05)`;
- blur `backdrop-filter: blur(18px)`;
- nav font `Inter 800 12px uppercase`;
- active/hover color `#4b0f24`.

Рекомендация:

1. Не меняйте текущий Header template сразу.
2. Дублируйте шаблон Header в Elementor.
3. Назовите копию `Header DP UI Kit Draft`.
4. Примените новые стили на копии.
5. Проверьте меню, dropdown, search, phone, cart/favorites icons.
6. Только после проверки назначайте новый шаблон на сайт.

CSS-класс для контейнера:

```css
.dp-header {
  background: rgba(248, 250, 252, 0.94);
  border-bottom: 1px solid rgba(102, 96, 95, 0.18);
  box-shadow: 0 10px 28px rgba(22, 22, 22, 0.05);
  backdrop-filter: blur(18px);
}

.dp-nav a,
.dp-nav .elementor-item {
  color: var(--dp-gray-700);
  font-family: Inter, Arial, sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.dp-nav a:hover,
.dp-nav .elementor-item:hover,
.dp-nav .elementor-item-active {
  color: var(--dp-wine-100);
}
```

## 12. Footer

Footer использует карточную панель:

- surface `#ffffff`;
- radius `8px`;
- shadow soft;
- структурированную сетку ссылок;
- muted legal text;
- акцентные ссылки на hover.

Безопасный перенос:

1. Дублируйте текущий Footer template.
2. Добавьте классы `dp-footer`, `dp-surface`, `dp-nav`.
3. Проверьте desktop/mobile сетку.
4. Не удаляйте старый footer до полной проверки.

## 13. Каталог и product cards

Для каталога важны следующие элементы:

- toolbar;
- sort select;
- filters;
- grid/list cards;
- compact cards;
- price block;
- tags;
- CTA button;
- hover state.

Порядок переноса:

1. Сначала перенесите визуальный стиль карточки товара.
2. Потом фильтры и chips.
3. Потом toolbar/sort.
4. Потом list/compact variants.
5. Последним этапом подключайте hover и lift effects.

Минимальный набор CSS-классов:

```txt
dp-card
dp-product-card
dp-card-title
dp-card-text
dp-tag
dp-tag-filled
dp-btn-primary
dp-btn-sm
```

## 14. Страница UI Kit Preview в WordPress

Создайте отдельную страницу:

`UI Kit Preview`

Разместите на ней:

1. Цветовые swatches.
2. H1, H2, H3, body, caption.
3. Primary, secondary, small buttons.
4. Form fields: default, focus, error.
5. Product card.
6. Tags/chips.
7. Header preview.
8. Footer preview.
9. Catalog toolbar preview.
10. Mobile preview section.

Страница нужна как контрольная витрина. Любое изменение токенов сначала проверяйте на ней.

## 15. Что нельзя делать при переносе

Не добавляйте глобально такие правила без полной проверки:

```css
* {
  margin: 0;
  padding: 0;
}

button {
  all: unset;
}

a {
  color: inherit;
  text-decoration: none;
}

h1,
h2,
h3 {
  margin: 0;
}
```

Они могут сломать тему, плагины, WooCommerce, формы, меню и старые страницы.

Также не рекомендуется:

- удалять старые Elementor Global Colors;
- массово заменять цвета по всему сайту;
- менять breakpoints без полного responsive QA;
- вставлять весь `site.css` в Elementor;
- переносить demo-стили UI-kit sidebar;
- менять Header/Footer на production без дубликата и предпросмотра.

## 16. QA checklist перед публикацией

Проверьте:

- Главная страница.
- Каталог.
- Карточка товара.
- Страница контактов.
- Страница статьи/новости.
- Header desktop.
- Header mobile.
- Mega menu/dropdown.
- Footer desktop.
- Footer mobile.
- Все формы.
- Search.
- Cart/favorites/account icons, если есть.
- 404 page.
- WooCommerce cart/checkout/account, если сайт использует WooCommerce.

Для каждого экрана:

- нет горизонтального скролла;
- текст не обрезается;
- кнопки не ломаются;
- hover/focus состояния видны;
- карточки не прыгают по высоте;
- изображения не растягиваются;
- меню открывается и закрывается корректно;
- формы отправляются;
- ошибки форм читаемы;
- контраст текста достаточный.

## 17. Публикация на production

Финальный порядок:

1. Сделать свежий backup production.
2. Экспортировать Elementor templates.
3. Перенести Global Colors.
4. Перенести Global Fonts.
5. Добавить проверенный CSS-слой.
6. Импортировать или обновить шаблоны.
7. Назначить Header/Footer только после проверки preview.
8. Elementor -> Tools -> Regenerate CSS & Data.
9. Очистить кэш плагина оптимизации.
10. Очистить server/CDN cache, если есть.
11. Проверить сайт в incognito.

## 18. План отката

Перед публикацией должны быть готовы:

- backup production;
- экспорт старых Elementor templates;
- список измененных Global Colors/Fonts;
- копия добавленного Custom CSS;
- скриншоты ключевых страниц до переноса.

Если что-то сломалось:

1. Отключите новый Custom CSS.
2. Верните старый Header/Footer template.
3. Regenerate CSS & Data.
4. Очистите кэш.
5. Проверьте сайт.
6. Если проблема осталась, восстановите backup.

## 19. Минимальный набор для первого этапа

Для первого безопасного внедрения достаточно перенести:

1. Global Colors с префиксом `DP`.
2. Global Fonts `DP H1`, `DP H2`, `DP H3`, `DP Body`, `DP Button`.
3. CSS-переменные `--dp-*`.
4. Классы кнопок `dp-btn-primary`, `dp-btn-secondary`, `dp-btn-sm`.
5. Класс карточки `dp-card`.
6. Класс формы `dp-form`.
7. Классы тегов `dp-tag`, `dp-tag-filled`, `dp-tag-outline`.
8. Тестовую страницу `UI Kit Preview`.

После этого можно спокойно двигаться к Header, Footer, каталогу и product templates.
