(function () {
  var t;
  try { t = localStorage.getItem('theme'); } catch (_) {}
  document.documentElement.classList.add(t === 'light' ? 'light' : 'dark');
})();
