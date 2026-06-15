const API = {
  base: "/api",

  async request(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...options.headers };
    const token = sessionStorage.getItem("adminToken");
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(this.base + path, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.error || "Permintaan gagal");
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

  async addBillItem(id, item, price, isAdditional = true) {
    return this.request(`/queues/${id}/bill-items`, {
      method: "POST",
      body: JSON.stringify({ item, price, isAdditional }),
    });
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

  logout() {
    sessionStorage.removeItem("adminToken");
  },
};
