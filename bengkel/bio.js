let isDark = false;

function toggleTheme() {
  isDark = !isDark;

  // Ganti class di <body>
  document.body.classList.toggle('dark');

  // Ganti ikon tombol
  const btn = document.getElementById('theme-but');
  btn.textContent = isDark ? '☀️' : '🌙';
}