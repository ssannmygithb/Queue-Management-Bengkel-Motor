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

/* ── PREVIEW PLAT NOMOR ── */
document.getElementById("inp-plat").addEventListener("input", function () {
  const v = this.value.toUpperCase().trim();
  this.value = v;
  document.getElementById("plat-preview").textContent = v || "— — —";
});

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

    // Simpan ke sessionStorage supaya bisa diakses di halaman servis
    sessionStorage.setItem("biodata", JSON.stringify(state));
  }
  return ok;
}

/* ── LANJUT KE HALAMAN SERVIS ── */
function goToPage2() {
  if (validate1()) {
    window.location.href = "servis/servis.html";
  }
}

/* ── RESET FORM ── */
function resetForm() {
  document.getElementById("inp-nama").value = "";
  document.getElementById("inp-hp").value = "";
  document.getElementById("inp-plat").value = "";
  document.getElementById("plat-preview").textContent = "— — —";

  ["f-nama", "f-hp", "f-plat"].forEach((id) => {
    const f = document.getElementById(id);
    f.classList.remove("has-error");
    f.querySelector("input").classList.remove("error");
  });
}
