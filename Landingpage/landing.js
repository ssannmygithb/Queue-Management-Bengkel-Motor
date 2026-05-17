/* ── SET TAHUN FOOTER DINAMIS ── */
document.getElementById("year").textContent = new Date().getFullYear();

/* ── LOGIKA TEMA TERANG/GELAP ── */
// Diatur ke true karena tema dasar kita adalah Light Mode
let isLight = true;
const themeBtn = document.getElementById("theme-btn");

themeBtn.addEventListener("click", () => {
  isLight = !isLight;

  // Jika isLight true, set class ke 'light', jika false set ke 'dark'
  document.body.className = isLight ? "light" : "dark";

  // Ubah icon tombol
  themeBtn.textContent = isLight ? "🌙" : "☀️";
});
