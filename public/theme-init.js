(function () {
  var t;
  try { t = localStorage.getItem('theme'); } catch {}
  document.documentElement.classList.add(t === 'light' ? 'light' : 'dark');
})();
