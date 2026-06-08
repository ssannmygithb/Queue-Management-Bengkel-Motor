/* ── STATE APLIKASI ── */
const state = {
  nama: "",
  hp: "",
  plat: "",
};

/* ── TAHUN OTOMATIS FOOTER ── */
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* ── LOGIKA TEMA TERANG/GELAP ── */
let isLight = true;
document.getElementById("theme-btn").addEventListener("click", () => {
  isLight = !isLight;
  document.body.className = isLight ? "light" : "dark";
  document.getElementById("theme-btn").textContent = isLight ? "🌙" : "☀️";
});