/* ── STATE APLIKASI ── */
const state = {
  nama: "",
  hp: "",
  plat: "",
  services: [],
  queueNum: null,
};

const SERVICE_MAP = {
  A: { name: "Servis Berkala & Perawatan", est: 60 },
  B: { name: "Perbaikan & Perawatan Teknis", est: 90 },
  C: { name: "Servis Besar / Overhaul", est: 240 },
  D: { name: "Layanan Khusus — Fast Track", est: 20 },
  E: { name: "Pengecekan / Diagnosa", est: 45 },
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

/* ── PREVIEW PLAT NOMOR ── */
document.getElementById("inp-plat").addEventListener("input", function () {
  const v = this.value.toUpperCase().trim();
  this.value = v;
  document.getElementById("plat-preview").textContent = v || "— — —";
});

/* ── INDIKATOR LANGKAH & NAVIGASI ── */
function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById("step-" + i);
    el.classList.remove("active", "done");
    if (i < n) el.classList.add("done");
    if (i === n) el.classList.add("active");
  }
}

function showPage(n) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("page-" + n).classList.add("active");
  setStep(n);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── VALIDASI HALAMAN 1 ── */
function validate1() {
  let ok = true;
  const inputs = [
    { id: "inp-nama", parent: "f-nama", valid: (v) => v.length > 0 },
    {
      id: "inp-hp",
      parent: "f-hp",
      valid: (v) => v.replace(/\D/g, "").length >= 10,
    },
    { id: "inp-plat", parent: "f-plat", valid: (v) => v.length > 0 },
  ];

  inputs.forEach((item) => {
    const val = document.getElementById(item.id).value.trim();
    const f = document.getElementById(item.parent);

    if (!item.valid(val)) {
      f.classList.add("has-error");
      document.getElementById(item.id).classList.add("error");
      ok = false;
    } else {
      f.classList.remove("has-error");
      document.getElementById(item.id).classList.remove("error");
    }
  });

  if (ok) {
    state.nama = document.getElementById("inp-nama").value.trim();
    state.hp = document.getElementById("inp-hp").value.trim();
    state.plat = document.getElementById("inp-plat").value.trim().toUpperCase();
  }
  return ok;
}

/* ── PILIH LAYANAN ── */
function toggleService(card) {
  const id = card.dataset.id;
  card.classList.toggle("selected");

  const idx = state.services.indexOf(id);
  if (idx === -1) state.services.push(id);
  else state.services.splice(idx, 1);

  document.getElementById("svc-error").style.display = "none";
}

function goToPage2() {
  if (validate1()) showPage(2);
}

function goToPage3() {
  if (state.services.length === 0) {
    document.getElementById("svc-error").style.display = "block";
    return;
  }
  buildConfirmation();
  showPage(3);
}

function goBack(n) {
  showPage(n);
}

/* ── KONFIRMASI ── */
function buildConfirmation() {
  document.getElementById("c-nama").textContent = state.nama;
  document.getElementById("c-hp").textContent = state.hp;
  document.getElementById("c-plat").textContent = state.plat;

  const list = document.getElementById("c-svc-list");
  list.innerHTML = "";
  let maxEst = 0;

  state.services.forEach((id) => {
    const svc = SERVICE_MAP[id];
    if (svc.est > maxEst) maxEst = svc.est;
    list.innerHTML += `<div class="svc-confirm-item"><div class="dot"></div><span>${svc.name}</span></div>`;
  });

  document.getElementById("c-est").textContent = formatEst(maxEst);
}

function formatEst(mins) {
  if (mins >= 60)
    return (
      Math.floor(mins / 60) +
      " Jam " +
      (mins % 60 > 0 ? (mins % 60) + " Menit" : "")
    );
  return mins + " Menit";
}

/* ── SUBMIT (BUAT ANTREAN TIRUAN) ── */
let queueCounter = Math.floor(Math.random() * 10) + 1;

function submitQueue() {
  queueCounter++;
  const qNum = "A" + String(queueCounter).padStart(3, "0");

  document.getElementById("q-number").textContent = qNum;
  document.getElementById("q-nama").textContent = state.nama;
  document.getElementById("q-plat").textContent = state.plat;
  document.getElementById("q-est").textContent =
    document.getElementById("c-est").textContent;

  const qList = document.getElementById("q-svc-list");
  qList.innerHTML = "";
  state.services.forEach((id) => {
    qList.innerHTML += `<div class="svc-confirm-item"><div class="dot"></div><span>${SERVICE_MAP[id].name}</span></div>`;
  });

  showPage(4);
}

/* ── RESET FORM ── */
function resetForm() {
  state.nama = "";
  state.hp = "";
  state.plat = "";
  state.services = [];

  document.getElementById("inp-nama").value = "";
  document.getElementById("inp-hp").value = "";
  document.getElementById("inp-plat").value = "";
  document.getElementById("plat-preview").textContent = "— — —";

  ["f-nama", "f-hp", "f-plat"].forEach((id) => {
    const f = document.getElementById(id);
    f.classList.remove("has-error");
    f.querySelector("input").classList.remove("error");
  });

  document
    .querySelectorAll(".service-card")
    .forEach((c) => c.classList.remove("selected"));
  document.getElementById("svc-error").style.display = "none";

  showPage(1);
}
