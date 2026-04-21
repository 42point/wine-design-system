(function () {
  var css = document.currentScript.getAttribute('data-css') || 'css/site.css';
  document.currentScript.insertAdjacentHTML('beforebegin',
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700' +
      '&family=Inter:wght@400;500;600;700;800' +
      '&family=Manrope:wght@400;500;600;700;800' +
      '&family=Montserrat:wght@500;600;700;800' +
      '&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">' +
    '<link rel="stylesheet" href="' + css + '">' +
    '<script async src="https://metrika.in20.ru/js/pa-LKQHOT3En5k9NYpn80cYX.js"><\/script>' +
    '<script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()<\/script>'
  );
})();
