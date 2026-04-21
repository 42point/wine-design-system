(function () {
  'use strict';

  var KEY = 'dp-design-version';
  var root = document.documentElement;

  function getVersion() {
    try {
      return localStorage.getItem(KEY) || 'v1';
    } catch (e) {
      return 'v1';
    }
  }

  function setVersion(v) {
    try {
      localStorage.setItem(KEY, v);
    } catch (e) {}
  }

  function syncButtons(v) {
    var buttons = document.querySelectorAll('.design-toggle__btn');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var active = btn.dataset.version === v;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  // ── V2 DOM enhancements ────────────────────────────────────────────────
  // All insertions are idempotent and tagged data-v2-only so V1 CSS hides them.

  function ensureBreadcrumbs() {
    // Only on product page — detect by .product-detail.
    var detail = document.querySelector('.product-detail');
    if (!detail) return;
    var main = detail.closest('main');
    if (!main || main.querySelector('[data-v2-only="breadcrumbs"]')) return;
    var nav = document.createElement('nav');
    nav.className = 'breadcrumbs container';
    nav.setAttribute('data-v2-only', 'breadcrumbs');
    nav.setAttribute('aria-label', 'Хлебные крошки');
    nav.innerHTML =
      '<a href="index.html">Главная</a>' +
      '<span aria-hidden="true">/</span>' +
      '<a href="catalog.html">Каталог</a>' +
      '<span aria-hidden="true">/</span>' +
      '<a href="#">Bordeaux</a>' +
      '<span aria-hidden="true">/</span>' +
      '<span aria-current="page">Chateau Laroque Grand Cru</span>';
    main.insertBefore(nav, detail.parentElement === main ? detail : main.firstChild);
  }

  function ensureSplitContactFields() {
    var form = document.querySelector('.contact-form');
    if (!form || form.dataset.v2Enhanced === '1') return;
    var labels = form.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
      if (/Телефон или email/i.test(labels[i].textContent)) {
        var comboLabel = labels[i];
        comboLabel.setAttribute('data-v2-hide', '1');

        var phoneLabel = document.createElement('label');
        phoneLabel.setAttribute('data-v2-only', 'split');
        phoneLabel.innerHTML = 'Телефон<input class="input" type="tel" name="phone-v2" placeholder="+7 (___) ___-__-__" />';

        var emailLabel = document.createElement('label');
        emailLabel.setAttribute('data-v2-only', 'split');
        emailLabel.innerHTML = 'Email<input class="input" type="email" name="email-v2" placeholder="you@company.ru" />';

        comboLabel.parentNode.insertBefore(phoneLabel, comboLabel.nextSibling);
        comboLabel.parentNode.insertBefore(emailLabel, phoneLabel.nextSibling);
        break;
      }
    }
    form.dataset.v2Enhanced = '1';
    form.addEventListener('submit', function (e) {
      if (root.getAttribute('data-design-version') !== 'v2') return;
      e.preventDefault();
      if (form.querySelector('.form-success')) return;
      var success = document.createElement('div');
      success.className = 'form-success';
      success.setAttribute('data-v2-only', 'success');
      success.textContent = 'Заявка отправлена. Менеджер свяжется с вами в ближайшее время.';
      form.appendChild(success);
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Заявка отправлена';
      }
    });
  }

  function enhanceDomV2() {
    ensureBreadcrumbs();
    ensureSplitContactFields();
  }

  function apply(v) {
    root.setAttribute('data-design-version', v);
    syncButtons(v);
    if (v === 'v2') enhanceDomV2();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.design-toggle__btn');
    if (!btn) return;
    var v = btn.dataset.version;
    if (!v) return;
    setVersion(v);
    apply(v);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(getVersion()); });
  } else {
    apply(getVersion());
  }
})();
