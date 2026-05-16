let queues = [
  {
    id: "A001",
    name: "Fuad",
    plat: "B 1234 ABC",
    svc: "Servis Berkala",
    pit: "Pit 1 (Ringan)",
    status: "Sedang Diproses",
    est: "11:30 WIB",
    bill: [
      { item: "Jasa Servis Ringan", price: 50000 },
      { item: "Oli Mesin Matic", price: 55000 },
    ],
  },
  {
    id: "A002",
    name: "King Nasir",
    plat: "D 5678 DEF",
    svc: "Servis Besar (Turun Mesin)",
    pit: "Pit 3 (Berat)",
    status: "Menunggu Sparepart",
    est: "15:00 WIB",
    bill: [{ item: "Jasa Turun Mesin", price: 350000 }],
  },
  {
    id: "A003",
    name: "Rusdi",
    plat: "AB 9012 GH",
    svc: "Pengecekan / Diagnosa",
    pit: "Pit 2 (Menengah)",
    status: "Pengecekan",
    est: "12:00 WIB",
    bill: [{ item: "Jasa Pengecekan", price: 20000 }],
  },
  {
    id: "A004",
    name: "Amba",
    plat: "N 3456 IJ",
    svc: "Layanan Khusus (Fast Track)",
    pit: "Pit 1 (Ringan)",
    status: "Selesai Pengerjaan",
    est: "Selesai",
    bill: [
      { item: "Ganti Kampas Rem", price: 45000 },
      { item: "Kampas Rem Depan", price: 85000 },
    ],
  },
];

let currentEditId = null;
document.getElementById("year").textContent = new Date().getFullYear();

const togglePassBtn = document.getElementById("toggle-pass");
const passInput = document.getElementById("login-pass");

if (togglePassBtn && passInput) {
  togglePassBtn.addEventListener("click", function () {
    const type =
      passInput.getAttribute("type") === "password" ? "text" : "password";
    passInput.setAttribute("type", type);
    this.textContent = type === "password" ? "👁️" : "🙈";
  });
}

let isLight = true;
document.getElementById("theme-btn").addEventListener("click", () => {
  isLight = !isLight;
  document.body.className = isLight ? "light" : "dark";
  document.getElementById("theme-btn").textContent = isLight ? "🌙" : "☀️";
});

function login() {
  document.getElementById("login-page").classList.remove("active");
  document.getElementById("main-header").style.display = "flex";
  document.getElementById("main-nav").style.display = "flex";
  document.getElementById("main-content").style.display = "block";
  document.getElementById("admin-footer").style.display = "block";
  renderTables();
}

function logout() {
  document.getElementById("login-page").classList.add("active");
  document.getElementById("main-header").style.display = "none";
  document.getElementById("main-nav").style.display = "none";
  document.getElementById("main-content").style.display = "none";
  document.getElementById("admin-footer").style.display = "none";

  if (passInput.getAttribute("type") === "text") {
    passInput.setAttribute("type", "password");
    togglePassBtn.textContent = "👁️";
  }
}

function switchTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((el) => el.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  event.currentTarget.classList.add("active");
  renderTables();
}

function formatRp(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

function renderTables() {
  const qBody = document.getElementById("queue-tbody");
  const kBody = document.getElementById("kasir-tbody");
  qBody.innerHTML = "";
  kBody.innerHTML = "";

  let countWait = 0,
    countProc = 0,
    countDone = 0;

  queues.forEach((q) => {
    let badgeClass = "badge-wait";
    if (q.status.includes("Diproses") || q.status.includes("Pengecekan"))
      badgeClass = "badge-process";
    if (q.status === "Selesai Pengerjaan") badgeClass = "badge-done";
    if (q.status === "Lunas") badgeClass = "badge-lunas";

    if (q.status === "Menunggu") countWait++;
    if (
      q.status.includes("Diproses") ||
      q.status.includes("Pengecekan") ||
      q.status.includes("Sparepart")
    )
      countProc++;
    if (q.status === "Selesai Pengerjaan") countDone++;

    if (q.status !== "Selesai Pengerjaan" && q.status !== "Lunas") {
      qBody.innerHTML += `
        <tr>
          <td style="font-family:'Oswald', sans-serif; font-size:1.1rem; color:var(--cyan);">${q.id}</td>
          <td><strong>${q.plat}</strong><br><span style="font-size:0.8rem; color:var(--muted);">${q.name}</span></td>
          <td>${q.pit}</td>
          <td>${q.svc}</td>
          <td>${q.est}</td>
          <td><span class="badge ${badgeClass}">${q.status}</span></td>
          <td><button class="btn btn-secondary btn-action" onclick="openActionModal('${q.id}')">Update ✎</button></td>
        </tr>
      `;
    }

    if (q.status === "Selesai Pengerjaan") {
      let total = q.bill.reduce((sum, item) => sum + item.price, 0);
      kBody.innerHTML += `
        <tr>
          <td style="font-family:'Oswald', sans-serif; font-size:1.1rem; color:var(--cyan);">${q.id}</td>
          <td><strong>${q.plat}</strong><br><span style="font-size:0.8rem; color:var(--muted);">${q.name}</span></td>
          <td style="font-weight:600;">${formatRp(total)}</td>
          <td><span class="badge ${badgeClass}">Menunggu Bayar</span></td>
          <td><button class="btn btn-primary btn-action" onclick="openKasirModal('${q.id}')">Bayar ✓</button></td>
        </tr>
      `;
    }
  });

  document.getElementById("sum-wait").textContent = countWait;
  document.getElementById("sum-process").textContent = countProc;
  document.getElementById("sum-done").textContent = countDone;
}

function openActionModal(id) {
  currentEditId = id;
  const q = queues.find((x) => x.id === id);

  document.getElementById("m-qnum").textContent = q.id;
  document.getElementById("m-plat").textContent = q.plat + " (" + q.name + ")";
  document.getElementById("m-svc").textContent = q.svc;
  document.getElementById("m-status").value = q.status;

  renderBillList(q);
  document.getElementById("action-modal").classList.add("active");
}

function renderBillList(q) {
  const list = document.getElementById("m-bill-list");
  list.innerHTML = "";
  let total = 0;

  q.bill.forEach((b, index) => {
    total += b.price;
    list.innerHTML += `
      <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
        <span>- ${b.item}</span>
        <span>${formatRp(b.price)}</span>
      </div>
    `;
  });

  document.getElementById("m-total-price").textContent = formatRp(total);
}

function addBillItem() {
  const name = document.getElementById("m-item-name").value.trim();
  const price = parseInt(document.getElementById("m-item-price").value);

  if (!name || isNaN(price))
    return alert("Masukkan nama item dan harga yang valid!");

  const q = queues.find((x) => x.id === currentEditId);
  q.bill.push({ item: name, price: price });

  document.getElementById("m-item-name").value = "";
  document.getElementById("m-item-price").value = "";
  renderBillList(q);
}

function saveUpdate() {
  const q = queues.find((x) => x.id === currentEditId);
  q.status = document.getElementById("m-status").value;

  closeModal("action-modal");
  renderTables();
}

function openKasirModal(id) {
  currentEditId = id;
  const q = queues.find((x) => x.id === id);
  const total = q.bill.reduce((sum, item) => sum + item.price, 0);

  document.getElementById("k-total").textContent = formatRp(total);
  document.getElementById("k-info").textContent =
    `Plat: ${q.plat} | a.n ${q.name}`;

  document.getElementById("kasir-modal").classList.add("active");
}

function processPayment() {
  const method = document.getElementById("k-method").value;
  const q = queues.find((x) => x.id === currentEditId);

  q.status = "Lunas";
  alert(`Pembayaran berhasil via ${method}! Struk sedang dicetak...`);
  sendWA("lunas");

  closeModal("kasir-modal");
  renderTables();
}

function sendWA(type) {
  const q = queues.find((x) => x.id === currentEditId);
  let msg = "";
  if (type === "progress") {
    msg = `[SIMULASI WA] Halo Kak ${q.name}, motor Plat ${q.plat} statusnya saat ini: *${document.getElementById("m-status").value}*.`;
  } else if (type === "lunas") {
    msg = `[SIMULASI WA] Terima kasih Kak ${q.name}. Pembayaran untuk motor ${q.plat} telah LUNAS. Kendaraan sudah bisa diambil. Hati-hati di jalan!`;
  }
  alert(msg);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
  currentEditId = null;
}
