import { json, error } from "../../_lib/response.js";
import { approveByPhone } from "../../_lib/db.js";
import { sendWhatsApp } from "../../_lib/fonnte.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    }

    console.log("Webhook payload:", data);

    const message = String(data.message || data.text || "").trim().toUpperCase();
    const sender = data.sender || data.device || "";

    // Debug: include parsed webhook fields
    if (!message.includes("YA")) {
      return json({
        ok: true,
        action: "ignored",
        received: { message, sender, raw: data },
      });
    }

    const queue = await approveByPhone(env.DB, sender);
    if (!queue) {
      return json({ ok: true, action: "no_pending_approval" });
    }

    const reply =
      `Terima kasih Kak ${queue.nama}! ✅\n\n` +
      `Persetujuan biaya tambahan untuk motor plat *${queue.plat}* (Antrean ${queue.id}) telah kami terima.\n` +
      `Pengerjaan akan dilanjutkan.`;

    await sendWhatsApp(env, queue.hp, reply);

    return json({ ok: true, action: "approved", queueId: queue.id });
  } catch (e) {
    console.error("Webhook error:", e);
    return error(e.message || "Webhook processing failed", 500);
  }
}
