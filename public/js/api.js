const API = {
  base: "/api",

  async request(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...options.headers };
    const token = sessionStorage.getItem("adminToken");
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(this.base + path, { ...options, headers });
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      if (!res.ok) {
        const err = new Error(`Server error (${res.status}). API tidak merespons JSON — cek binding D1 di Cloudflare Pages.`);
        err.status = res.status;
        throw err;
      }
    }

    if (!res.ok) {
      const err = new Error(data.error || `Permintaan gagal (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  },

  async createQueue({ nama, hp, plat, serviceId }) {
    return this.request("/queues", {
      method: "POST",
      body: JSON.stringify({ nama, hp, plat, serviceId }),
    });
  },

  async login(username, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    sessionStorage.setItem("adminToken", data.token);
    return data;
  },

  async getQueues() {
    return this.request("/queues");
  },

  async updateQueue(id, payload) {
    return this.request(`/queues/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async addBillItem(id, payload) {
    return this.request(`/queues/${id}/bill-items`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async removeBillItem(queueId, billId) {
    return this.request(`/queues/${queueId}/bill-items/${billId}`, {
      method: "DELETE",
    });
  },

  async cancelQueue(id) {
    return this.request(`/queues/${id}/cancel`, { method: "POST" });
  },

  async processPayment(id, method) {
    return this.request(`/queues/${id}/payment`, {
      method: "POST",
      body: JSON.stringify({ method }),
    });
  },

  async sendNotify(id, type) {
    return this.request(`/queues/${id}/notify`, {
      method: "POST",
      body: JSON.stringify({ type }),
    });
  },

  async getParts(params = {}) {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.category) qs.set("category", params.category);
    const q = qs.toString();
    return this.request("/parts" + (q ? "?" + q : ""));
  },

  async createPart(payload) {
    return this.request("/parts", { method: "POST", body: JSON.stringify(payload) });
  },

  async updatePart(id, payload) {
    return this.request(`/parts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deletePart(id) {
    return this.request(`/parts/${id}`, { method: "DELETE" });
  },

  logout() {
    sessionStorage.removeItem("adminToken");
  },
};
