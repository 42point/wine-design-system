# DP Trade — Site UI Kit

Единый HTML/CSS проект для сайта и дизайн-системы DP Trade.

## Структура

- `index.html` — главная страница с меню, hero, карточками и футером.
- `catalog.html` — пример страницы каталога.
- `product.html` — пример страницы продукта.
- `ui-kit.html` — живая витрина дизайн-системы.
- `css/tokens.css` — дизайн-токены: цвета, шрифты, отступы, радиусы, тени.
- `css/site.css` — общие стили сайта: header, menu, footer, cards, layouts.
- `css/ui-kit.css` — стили страницы UI-kit.
- `components/menu.html` — HTML-фрагмент меню.
- `components/footer.html` — HTML-фрагмент футера.
- `assets/images` и `assets/icons` — место для локальных изображений и иконок.

## Правило организации

В проекте должен быть один Git-репозиторий на уровне этой папки. Отдельные компоненты сайта живут внутри `components/`, а не как самостоятельные соседние проекты.

## Naming

Для дизайн-системы используется формат:

```txt
[Category] / [Type] / [Variant] / [State]
```

Примеры:

```txt
Button / Primary / Default
Card / Product / Hover
Nav / Header / Desktop
```

## Как смотреть

Открой `index.html` или `ui-kit.html` напрямую в браузере. Сервер для текущей версии не нужен.
