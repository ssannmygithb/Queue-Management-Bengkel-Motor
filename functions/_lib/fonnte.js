export function normalizePhone(hp) {
  let digits = String(hp).replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!digits.startsWith("62")) digits = "62" + digits;
  return digits;
}

export async function sendWhatsApp(env, target, message) {
  if (!env.FONNTE_TOKEN) {
    console.warn("FONNTE_TOKEN not set — skipping WhatsApp send");
    return { status: false, reason: "FONNTE_TOKEN not configured" };
  }

  const form = new FormData();
  form.append("target", normalizePhone(target));
  form.append("message", message);
  form.append("countryCode", "62");

  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: { Authorization: env.FONNTE_TOKEN },
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Fonnte error:", data);
    return { status: false, reason: data.reason || "Fonnte request failed" };
  }
  return data;
}

export function formatRp(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function buildQueueMessage(type, queue, billItems = []) {
  const total = billItems.reduce((sum, b) => sum + b.price, 0);

  switch (type) {
    case "queue":
      return (
        `Halo Kak ${queue.nama}! 👋\n\n` +
        `Antrean Anda telah terdaftar di *BengkelGweh*.\n\n` +
        `📋 *Nomor Antrean:* ${queue.id}\n` +
        `🛵 *Plat:* ${queue.plat}\n` +
        `🔧 *Layanan:* ${queue.service_name}\n\n` +
        `Mohon tunggu, Anda akan mendapat notifikasi saat motor mulai dikerjakan.`
      );

    case "progress":
      return (
        `Halo Kak ${queue.nama}! 🔧\n\n` +
        `Motor plat *${queue.plat}* (Antrean ${queue.id}) *mulai dikerjakan*.\n\n` +
        `Status saat ini: *${queue.status}*\n` +
        `Estimasi selesai: ${queue.est}`
      );

    case "additional":
      const lines = billItems
        .filter((b) => b.is_additional)
        .map((b) => `• ${b.item}: ${formatRp(b.price)}`)
        .join("\n");
      return (
        `Halo Kak ${queue.nama}! ⚠️\n\n` +
        `Mekanik menemukan kerusakan/tambahan pada motor plat *${queue.plat}*:\n\n` +
        `${lines}\n\n` +
        `*Total tambahan:* ${formatRp(
          billItems.filter((b) => b.is_additional).reduce((s, b) => s + b.price, 0)
        )}\n\n` +
        `Balas *YA* untuk menyetujui biaya tambahan ini.`
      );

    case "final":
      const allLines = billItems.map((b) => `• ${b.item}: ${formatRp(b.price)}`).join("\n");
      return (
        `Halo Kak ${queue.nama}! ✅\n\n` +
        `Pengerjaan motor plat *${queue.plat}* (Antrean ${queue.id}) telah *selesai*.\n\n` +
        `*Rincian Tagihan:*\n${allLines}\n\n` +
        `*Total:* ${formatRp(total)}\n\n` +
        `Silakan menuju kasir untuk melakukan pembayaran.`
      );

    case "lunas":
      return (
        `Terima kasih Kak ${queue.nama}! 🙏\n\n` +
        `Pembayaran motor plat *${queue.plat}* (Antrean ${queue.id}) telah *LUNAS*.\n` +
        `Kendaraan Anda sudah bisa diambil.\n\n` +
        `— BengkelGweh`
      );

    default:
      return `Update antrean ${queue.id}: ${queue.status}`;
  }
}
