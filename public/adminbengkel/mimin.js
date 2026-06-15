let queues = [];
let currentEditId = null;
let pollTimer = null;

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

function mapQueueFromApi(q) {
  return {
    id: q.id,
    name: q.nama,
    plat: q.plat,
    svc: q.service_name,
    pit: q.pit,
    status: q.status,
    est: q.est,
    approval_status: q.approval_status,
    pending_bill_approval: q.pending_bill_approval,
    bill: (q.bill || []).map((b) => ({
      id: b.id,
      item: b.item,
      price: b.price,
      is_additional: b.is_additional,
    })),
  };
}

async function loadQueues() {
  try {
    const data = await API.getQueues();
    queues = (data.queues || []).map(mapQueueFromApi);
    renderTables();
  } catch (err) {
    if (err.status === 401) {
      stopPolling();
      logout();
    }
  }
}

function startPolling() {
  stopPolling();
  loadQueues();
  pollTimer = setInterval(loadQueues, 5000);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function login() {
  const username = document.getElementById("login-user").value.trim();
  const password = document.getElementById("login-pass").value.trim();

  if (!username || !password) {
    return alert("Masukkan username dan password.");
  }

  try {
    const data = await API.login(username, password);
    document.getElementById("admin-name").textContent = `Halo, ${data.username}`;

    document.getElementById("login-page").classList.remove("active");
    document.getElementById("main-header").style.display = "flex";
    document.getElementById("main-nav").style.display = "flex";
    document.getElementById("main-content").style.display = "block";
    document.getElementById("admin-footer").style.display = "block";

    startPolling();
  } catch (err) {
    alert(err.message || "Login gagal.");
  }
}

function logout() {
  API.logout();
  stopPolling();
  queues = [];

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

function approvalBadge(q) {
  if (q.pending_bill_approval) {
    return '<span class="badge badge-wait" style="margin-left:0.3rem">⏳ Tunggu YA</span>';
  }
  if (q.approval_status === "approved") {
    return '<span class="badge badge-done" style="margin-left:0.3rem">✓ Disetujui</span>';
  }
  return "";
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
          <td><span class="badge ${badgeClass}">${q.status}</span>${approvalBadge(q)}</td>
          <td><button class="btn btn-secondary btn-action" onclick="openActionModal('${q.id}')">Update ✎</button></td>
        </tr>
      `;
    }

    if (q.status === "Selesai Pengerjaan") {
      const total = q.bill.reduce((sum, item) => sum + item.price, 0);
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

  q.bill.forEach((b) => {
    total += b.price;
    const tag = b.is_additional ? ' <em style="color:var(--cyan)">(tambahan)</em>' : "";
    list.innerHTML += `
      <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
        <span>- ${b.item}${tag}</span>
        <span>${formatRp(b.price)}</span>
      </div>
    `;
  });

  document.getElementById("m-total-price").textContent = formatRp(total);
}

async function addBillItem() {
  const name = document.getElementById("m-item-name").value.trim();
  const price = parseInt(document.getElementById("m-item-price").value, 10);

  if (!name || isNaN(price))
    return alert("Masukkan nama item dan harga yang valid!");

  try {
    const { queue } = await API.addBillItem(currentEditId, name, price, true);
    const idx = queues.findIndex((x) => x.id === currentEditId);
    if (idx >= 0) queues[idx] = mapQueueFromApi(queue);

    document.getElementById("m-item-name").value = "";
    document.getElementById("m-item-price").value = "";
    renderBillList(queues[idx]);
    renderTables();
  } catch (err) {
    alert(err.message || "Gagal menambah item.");
  }
}

async function saveUpdate() {
  const status = document.getElementById("m-status").value;

  try {
    const { queue } = await API.updateQueue(currentEditId, { status });
    const idx = queues.findIndex((x) => x.id === currentEditId);
    if (idx >= 0) queues[idx] = mapQueueFromApi(queue);

    closeModal("action-modal");
    renderTables();
  } catch (err) {
    alert(err.message || "Gagal menyimpan perubahan.");
  }
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

async function processPayment() {
  const method = document.getElementById("k-method").value;

  try {
    await API.processPayment(currentEditId, method);
    queues = queues.filter((q) => q.id !== currentEditId);
    alert(`Pembayaran berhasil via ${method}!`);
    closeModal("kasir-modal");
    renderTables();
  } catch (err) {
    alert(err.message || "Gagal memproses pembayaran.");
  }
}

async function sendWA(type) {
  try {
    await API.sendNotify(currentEditId, type);
    alert("Notifikasi WhatsApp terkirim.");
  } catch (err) {
    alert(err.message || "Gagal mengirim notifikasi WhatsApp.");
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
  currentEditId = null;
}

if (sessionStorage.getItem("adminToken")) {
  document.getElementById("login-page").classList.remove("active");
  document.getElementById("main-header").style.display = "flex";
  document.getElementById("main-nav").style.display = "flex";
  document.getElementById("main-content").style.display = "block";
  document.getElementById("admin-footer").style.display = "block";
  startPolling();
}
