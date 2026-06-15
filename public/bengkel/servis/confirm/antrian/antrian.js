const SERVICE_MAP = {
  A: { name: "Servis Berkala & Perawatan" },
  B: { name: "Perbaikan & Perawatan Teknis" },
  C: { name: "Servis Besar / Overhaul" },
  D: { name: "Layanan Khusus — Fast Track" },
  E: { name: "Pengecekan / Diagnosa" },
};

/* ── TAHUN FOOTER ── */
document.getElementById("year").textContent = new Date().getFullYear();

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

/* ── ISI DATA DARI SESSIONSTORAGE ── */
function loadData() {
  const biodata = JSON.parse(sessionStorage.getItem("biodata") || "{}");
  const services = JSON.parse(sessionStorage.getItem("services") || "[]");
  const queueNum = sessionStorage.getItem("queueNum") || "—";

  document.getElementById("q-number").textContent = queueNum;
  document.getElementById("q-nama").textContent = biodata.nama || "—";
  document.getElementById("q-plat").textContent = biodata.plat || "—";

  const list = document.getElementById("q-svc-list");
  list.innerHTML = "";
  services.forEach((id) => {
    const svc = SERVICE_MAP[id];
    if (!svc) return;
    list.innerHTML += `<div class="svc-confirm-item"><div class="dot"></div><span>${svc.name}</span></div>`;
  });
}

loadData();

/* ── DAFTAR BARU ── */
function daftarBaru() {
  sessionStorage.clear();
  window.location.href = "../../../bio.html";
}