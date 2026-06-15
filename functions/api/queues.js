import { json, error, handleOptions } from "../_lib/response.js";
import { requireAuth } from "../_lib/auth.js";
import { getAllQueues, createQueue } from "../_lib/db.js";
import { sendWhatsApp, buildQueueMessage } from "../_lib/fonnte.js";

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const queues = await getAllQueues(env.DB);
    return json({ queues });
  } catch (e) {
    return error(e.message || "Gagal memuat antrean", 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { nama, hp, plat, serviceId } = body;

    if (!nama?.trim() || !hp?.trim() || !plat?.trim() || !serviceId) {
      return error("Data tidak lengkap: nama, hp, plat, dan serviceId wajib diisi");
    }

    const queue = await createQueue(env.DB, {
      nama: nama.trim(),
      hp: hp.trim(),
      plat: plat.trim().toUpperCase(),
      serviceId,
    });

    const msg = buildQueueMessage("queue", queue, queue.bill);
    await sendWhatsApp(env, queue.hp, msg);

    return json({ queue }, 201);
  } catch (e) {
    return error(e.message || "Gagal membuat antrean", 500);
  }
}
