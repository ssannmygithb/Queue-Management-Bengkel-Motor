/* ── STATE ── */
const selectedServices = [];
 
/* ── TAHUN FOOTER ── */
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
 
/* ── TEMA ── */
const savedTheme = localStorage.getItem("theme") || "light";
let isLight = savedTheme === "light";
document.body.className = savedTheme;
document.getElementById("theme-btn").textContent = isLight ? "🌙" : "☀️";
document.getElementById("theme-btn").addEventListener("click", () => {
  isLight = !isLight;
  document.body.className = isLight ? "light" : "dark";
  localStorage.setItem("theme", isLight ? "light" : "dark");
  document.getElementById("theme-btn").textContent = isLight ? "🌙" : "☀️";
});
 
/* ── PILIH LAYANAN (SINGLE SELECT) ── */
function toggleService(card) {
  // Deselect semua dulu
  document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
  selectedServices.length = 0;
 
  // Pilih yang diklik
  card.classList.add("selected");
  selectedServices.push(card.dataset.id);
 
  document.getElementById("svc-error").style.display = "none";
}
 
/* ── LANJUT KE KONFIRMASI ── */
function goToKonfirmasi() {
  if (selectedServices.length === 0) {
    document.getElementById("svc-error").style.display = "block";
    return;
  }
 
  // Ambil biodata dari bio.html
  const biodata = JSON.parse(sessionStorage.getItem("biodata") || "{}");
  sessionStorage.setItem("services", JSON.stringify(selectedServices));
 
  window.location.href = "confirm/confirm.html";
}