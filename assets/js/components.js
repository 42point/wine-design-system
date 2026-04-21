(function () {
  async function load(id, url) {
    var el = document.getElementById(id);
    if (!el) return;
    var r = await fetch(url);
    if (!r.ok) return;
    el.outerHTML = await r.text();
  }
  document.addEventListener('DOMContentLoaded', function () {
    load('site-header', 'components/menu.html');
    load('site-footer', 'components/footer.html');
  });
})();
