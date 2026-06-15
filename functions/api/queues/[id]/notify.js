import { json, error, handleOptions } from "../../../_lib/response.js";
import { requireAuth } from "../../../_lib/auth.js";
import { getQueueById } from "../../../_lib/db.js";
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
    const type = body.type || "progress";

    const queue = await getQueueById(env.DB, params.id);
    if (!queue) return error("Antrean tidak ditemukan", 404);

    const msg = buildQueueMessage(type, queue, queue.bill);
    const result = await sendWhatsApp(env, queue.hp, msg);

    return json({ sent: true, fonnte: result });
  } catch (e) {
    return error(e.message || "Gagal mengirim notifikasi", 500);
  }
}
