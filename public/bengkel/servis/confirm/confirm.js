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

  document.getElementById("c-nama").textContent = biodata.nama || "—";
  document.getElementById("c-hp").textContent = biodata.hp || "—";
  document.getElementById("c-plat").textContent = biodata.plat || "—";

  const list = document.getElementById("c-svc-list");
  list.innerHTML = "";
  services.forEach((id) => {
    const svc = SERVICE_MAP[id];
    if (!svc) return;
    list.innerHTML += `<div class="svc-confirm-item"><div class="dot"></div><span>${svc.name}</span></div>`;
  });
}

loadData();

/* ── SUBMIT ANTREAN ── */
let isSubmitting = false;

async function submitQueue() {
  if (isSubmitting) return;

  const biodata = JSON.parse(sessionStorage.getItem("biodata") || "{}");
  const services = JSON.parse(sessionStorage.getItem("services") || "[]");
  const serviceId = services[0];

  if (!biodata.nama || !biodata.hp || !biodata.plat || !serviceId) {
    alert("Data tidak lengkap. Silakan mulai dari awal.");
    window.location.href = "../../bio.html";
    return;
  }

  const btn = document.querySelector(".btn-primary");
  isSubmitting = true;
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Mendaftarkan...";
  }

  try {
    const { queue } = await API.createQueue({
      nama: biodata.nama,
      hp: biodata.hp,
      plat: biodata.plat,
      serviceId,
    });

    sessionStorage.setItem("queueNum", queue.id);
    window.location.href = "antrian/antrian.html";
  } catch (err) {
    alert(err.message || "Gagal mendaftarkan antrean. Coba lagi.");
    isSubmitting = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Ambil Antrean ✓";
    }
  }
}