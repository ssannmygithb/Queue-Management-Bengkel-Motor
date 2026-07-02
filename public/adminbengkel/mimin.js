let queues = [];
let partsCatalog = [];
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
    bill: (q.bill || []).map((b) => ({
      id: b.id,
      item: b.item,
      price: b.price,
      is_additional: b.is_additional,
    })),
  };
}

function mapPartFromApi(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    usageFor: p.usage_for,
    priceMin: p.price_min,
    priceMax: p.price_max,
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

async function loadPartsCatalog() {
  try {
    const data = await API.getParts();
    partsCatalog = (data.parts || []).map(mapPartFromApi);
    populateCategoryFilters();
    renderPartsTable();
    populateCatalogSelect();
  } catch (err) {
    if (err.status === 401) logout();
  }
}

function startPolling() {
  stopPolling();
  loadQueues();
  loadPartsCatalog();
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
  partsCatalog = [];

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

  if (tabId === "tab-parts") loadPartsCatalog();
  else renderTables();
}

function formatRp(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

function formatPriceRange(min, max) {
  if (min === max) return formatRp(min);
  return `${formatRp(min)} – ${formatRp(max)}`;
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

function populateCategoryFilters() {
  const cats = [...new Set(partsCatalog.map((p) => p.category))].sort();
  const sel = document.getElementById("parts-filter-cat");
  const current = sel.value;
  sel.innerHTML = '<option value="">Semua Kategori</option>';
  cats.forEach((c) => {
    sel.innerHTML += `<option value="${c}">${c}</option>`;
  });
  sel.value = current;
}

function getFilteredParts() {
  const search = document.getElementById("parts-search")?.value.trim().toLowerCase() || "";
  const cat = document.getElementById("parts-filter-cat")?.value || "";
  return partsCatalog.filter((p) => {
    if (cat && p.category !== cat) return false;
    if (search && !p.name.toLowerCase().includes(search)) return false;
    return true;
  });
}

function renderPartsTable() {
  const tbody = document.getElementById("parts-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  getFilteredParts().forEach((p) => {
    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td>${p.usageFor}</td>
        <td>${formatRp(p.priceMin)}</td>
        <td>${formatRp(p.priceMax)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openPartForm(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deletePart(${p.id})">Hapus</button>
        </td>
      </tr>
    `;
  });
}

function filterPartsTable() {
  renderPartsTable();
}

function populateCatalogSelect() {
  const sel = document.getElementById("m-catalog-select");
  if (!sel) return;
  sel.innerHTML = '<option value="">— Pilih sparepart —</option>';
  partsCatalog.forEach((p) => {
    const mid = Math.round((p.priceMin + p.priceMax) / 2);
    sel.innerHTML += `<option value="${p.id}" data-price="${mid}">${p.name} (${formatPriceRange(p.priceMin, p.priceMax)})</option>`;
  });
  sel.onchange = () => {
    const opt = sel.options[sel.selectedIndex];
    const priceInput = document.getElementById("m-catalog-price");
    if (opt?.dataset.price) priceInput.value = opt.dataset.price;
  };
}

function openActionModal(id) {
  currentEditId = id;
  const q = queues.find((x) => x.id === id);

  document.getElementById("m-qnum").textContent = q.id;
  document.getElementById("m-plat").textContent = q.plat + " (" + q.name + ")";
  document.getElementById("m-svc").textContent = q.svc;
  document.getElementById("m-status").value = q.status;

  populateCatalogSelect();
  document.getElementById("m-catalog-select").value = "";
  document.getElementById("m-catalog-price").value = "";

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
      <div class="bill-row">
        <span>- ${b.item}${tag}</span>
        <span class="bill-row-actions">
          <span>${formatRp(b.price)}</span>
          <button class="btn btn-danger btn-sm" onclick="removeBillItem(${b.id})" title="Hapus item">✕</button>
        </span>
      </div>
    `;
  });

  document.getElementById("m-total-price").textContent = formatRp(total);
}

async function addFromCatalog() {
  const partId = parseInt(document.getElementById("m-catalog-select").value, 10);
  const price = parseInt(document.getElementById("m-catalog-price").value, 10);

  if (!partId) return alert("Pilih sparepart dari database.");

  try {
    const payload = { catalogPartId: partId, isAdditional: true };
    if (!isNaN(price) && price >= 0) payload.price = price;

    const { queue } = await API.addBillItem(currentEditId, payload);
    const idx = queues.findIndex((x) => x.id === currentEditId);
    if (idx >= 0) queues[idx] = mapQueueFromApi(queue);

    document.getElementById("m-catalog-select").value = "";
    document.getElementById("m-catalog-price").value = "";
    renderBillList(queues[idx]);
    renderTables();
  } catch (err) {
    alert(err.message || "Gagal menambah dari database.");
  }
}

async function addBillItem() {
  const name = document.getElementById("m-item-name").value.trim();
  const price = parseInt(document.getElementById("m-item-price").value, 10);

  if (!name || isNaN(price))
    return alert("Masukkan nama item dan harga yang valid!");

  try {
    const { queue } = await API.addBillItem(currentEditId, {
      item: name,
      price,
      isAdditional: true,
    });
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

async function removeBillItem(billId) {
  if (!confirm("Hapus item ini dari tagihan pelanggan?")) return;

  try {
    const { queue } = await API.removeBillItem(currentEditId, billId);
    const idx = queues.findIndex((x) => x.id === currentEditId);
    if (idx >= 0) queues[idx] = mapQueueFromApi(queue);
    renderBillList(queues[idx]);
    renderTables();
  } catch (err) {
    alert(err.message || "Gagal menghapus item.");
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

async function cancelTicket() {
  const q = queues.find((x) => x.id === currentEditId);
  if (!q) return;

  if (
    !confirm(
      `Batalkan antrean ${q.id} (${q.plat} — ${q.name})?\n\nPelanggan akan diberi notifikasi WhatsApp.`
    )
  )
    return;

  try {
    await API.cancelQueue(currentEditId);
    queues = queues.filter((q) => q.id !== currentEditId);
    alert("Antrean berhasil dibatalkan.");
    closeModal("action-modal");
    renderTables();
  } catch (err) {
    alert(err.message || "Gagal membatalkan antrean.");
  }
}

function openPartForm(id) {
  document.getElementById("part-edit-id").value = id || "";
  document.getElementById("part-form-title").textContent = id
    ? "Edit Sparepart"
    : "Tambah Sparepart";

  if (id) {
    const p = partsCatalog.find((x) => x.id === id);
    document.getElementById("part-name").value = p.name;
    document.getElementById("part-category").value = p.category;
    document.getElementById("part-usage").value = p.usageFor;
    document.getElementById("part-price-min").value = p.priceMin;
    document.getElementById("part-price-max").value = p.priceMax;
  } else {
    document.getElementById("part-name").value = "";
    document.getElementById("part-category").value = "";
    document.getElementById("part-usage").value = "Semua";
    document.getElementById("part-price-min").value = "";
    document.getElementById("part-price-max").value = "";
  }

  document.getElementById("part-form-modal").classList.add("active");
}

async function savePartForm() {
  const id = document.getElementById("part-edit-id").value;
  const payload = {
    name: document.getElementById("part-name").value.trim(),
    category: document.getElementById("part-category").value.trim(),
    usageFor: document.getElementById("part-usage").value.trim() || "Semua",
    priceMin: parseInt(document.getElementById("part-price-min").value, 10),
    priceMax: parseInt(document.getElementById("part-price-max").value, 10),
  };

  if (!payload.name || !payload.category || isNaN(payload.priceMin) || isNaN(payload.priceMax)) {
    return alert("Lengkapi semua field dengan benar.");
  }

  try {
    if (id) await API.updatePart(id, payload);
    else await API.createPart(payload);

    await loadPartsCatalog();
    closeModal("part-form-modal");
  } catch (err) {
    alert(err.message || "Gagal menyimpan sparepart.");
  }
}

async function deletePart(id) {
  const p = partsCatalog.find((x) => x.id === id);
  if (!confirm(`Hapus "${p.name}" dari database?`)) return;

  try {
    await API.deletePart(id);
    await loadPartsCatalog();
  } catch (err) {
    alert(err.message || "Gagal menghapus sparepart.");
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
  if (modalId === "action-modal" || modalId === "kasir-modal") currentEditId = null;
}

if (sessionStorage.getItem("adminToken")) {
  document.getElementById("login-page").classList.remove("active");
  document.getElementById("main-header").style.display = "flex";
  document.getElementById("main-nav").style.display = "flex";
  document.getElementById("main-content").style.display = "block";
  document.getElementById("admin-footer").style.display = "block";
  startPolling();
}
