/* ── State aplikasi ── */
const state = {
  nama: "",
  hp: "",
  plat: "",
  services: [],
  queueNum: null,
};

// Pastikan kode E (Pengecekan) ada di daftar ini
const SERVICE_MAP = {
  A: { name: "Servis Berkala & Perawatan", est: 60 },
  B: { name: "Perbaikan & Perawatan Teknis", est: 90 },
  C: { name: "Servis Besar / Overhaul", est: 240 },
  D: { name: "Layanan Khusus — Fast Track", est: 20 },
  E: { name: "Pengecekan / Diagnosa", est: 45 },
};

/* ── LOGIKA TEMA TERANG/GELAP ── */
// Diatur ke true karena tema dasar kita sekarang adalah Light Mode
let isLight = true;
document.getElementById("theme-btn").addEventListener("click", () => {
  isLight = !isLight;
  // Jika isLight true, set class ke 'light', jika false set ke 'dark'
  document.body.className = isLight ? "light" : "dark";
  document.getElementById("theme-btn").textContent = isLight ? "🌙" : "☀️";
});

/* ── Preview PLat Nomor ── */
document.getElementById("inp-plat").addEventListener("input", function () {
  const v = this.value.toUpperCase().trim();
  this.value = v;
  document.getElementById("plat-preview").textContent = v || "— — —";
});

/* ── INDIKATOR LANGKAH & GANTI HALAMAN ── */
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

/* ── VALIDASI FORM HALAMAN 1 ── */
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

    // Jika tidak valid
    if (!item.valid(val)) {
      f.classList.add("has-error");
      document.getElementById(item.id).classList.add("error");
      ok = false;
    } else {
      f.classList.remove("has-error");
      document.getElementById(item.id).classList.remove("error");
    }
  });

  // Jika semua valid, simpan ke state
  if (ok) {
    state.nama = document.getElementById("inp-nama").value.trim();
    state.hp = document.getElementById("inp-hp").value.trim();
    state.plat = document.getElementById("inp-plat").value.trim().toUpperCase();
  }
  return ok;
}

/* ── LOGIKA PILIH LAYANAN (HALAMAN 2) ── */
function toggleService(card) {
  const id = card.dataset.id;
  card.classList.toggle("selected");

  const idx = state.services.indexOf(id);
  // Tambah ke array jika belum ada, hapus jika sudah ada
  if (idx === -1) state.services.push(id);
  else state.services.splice(idx, 1);

  // Sembunyikan pesan error jika pengguna sudah memilih
  document.getElementById("svc-error").style.display = "none";
}

/* ── TOMBOL NAVIGASI ── */
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

/* ── REKAP KONFIRMASI (HALAMAN 3) ── */
function buildConfirmation() {
  document.getElementById("c-nama").textContent = state.nama;
  document.getElementById("c-hp").textContent = state.hp;
  document.getElementById("c-plat").textContent = state.plat;

  const list = document.getElementById("c-svc-list");
  list.innerHTML = "";

  let maxEst = 0;

  state.services.forEach((id) => {
    const svc = SERVICE_MAP[id];
    // Ambil estimasi waktu paling lama
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

/* ── SUBMIT / BUAT ANTREAN (HALAMAN 4) ── */
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

/* ── FUNGSI RESET FORM KESELURUHAN ── */
function resetForm() {
  // Kosongkan State
  state.nama = "";
  state.hp = "";
  state.plat = "";
  state.services = [];

  // Kosongkan Input
  document.getElementById("inp-nama").value = "";
  document.getElementById("inp-hp").value = "";
  document.getElementById("inp-plat").value = "";
  document.getElementById("plat-preview").textContent = "— — —";

  // Hapus peringatan error di input
  ["f-nama", "f-hp", "f-plat"].forEach((id) => {
    const f = document.getElementById(id);
    f.classList.remove("has-error");
    f.querySelector("input").classList.remove("error");
  });

  // Hapus seleksi layanan (uncheck)
  document
    .querySelectorAll(".service-card")
    .forEach((c) => c.classList.remove("selected"));
  document.getElementById("svc-error").style.display = "none";

  // Kembali ke halaman 1
  showPage(1);
}
