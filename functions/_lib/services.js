export const SERVICE_MAP = {
  A: {
    name: "Servis Berkala & Perawatan",
    pit: "Pit 1 (Ringan)",
    defaultBill: [{ item: "Jasa Servis Berkala", price: 75000 }],
  },
  B: {
    name: "Perbaikan & Perawatan Teknis",
    pit: "Pit 2 (Menengah)",
    defaultBill: [{ item: "Jasa Perbaikan Teknis", price: 100000 }],
  },
  C: {
    name: "Servis Besar / Overhaul",
    pit: "Pit 3 (Berat)",
    defaultBill: [{ item: "Jasa Turun Mesin", price: 350000 }],
  },
  D: {
    name: "Layanan Khusus — Fast Track",
    pit: "Pit 1 (Ringan)",
    defaultBill: [{ item: "Jasa Fast Track", price: 150000 }],
  },
  E: {
    name: "Pengecekan / Diagnosa",
    pit: "Pit 2 (Menengah)",
    defaultBill: [{ item: "Jasa Pengecekan", price: 20000 }],
  },
};

export function getService(serviceId) {
  return SERVICE_MAP[serviceId] || null;
}
