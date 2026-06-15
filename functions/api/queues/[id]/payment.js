import { json, error, handleOptions } from "../../../_lib/response.js";
import { requireAuth } from "../../../_lib/auth.js";
import { processPayment } from "../../../_lib/db.js";
import { sendWhatsApp, buildQueueMessage } from "../../../_lib/fonnte.js";

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const method = body.method?.trim();

    if (!method) return error("Metode pembayaran wajib diisi");

    const queue = await processPayment(env.DB, params.id, method);
    const msg = buildQueueMessage("lunas", queue, queue.bill);
    await sendWhatsApp(env, queue.hp, msg);

    return json({ queue });
  } catch (e) {
    return error(e.message || "Gagal memproses pembayaran", 500);
  }
}
