import { json, error, handleOptions } from "../../_lib/response.js";
import { requireAuth } from "../../_lib/auth.js";
import { getQueueById, updateQueue } from "../../_lib/db.js";
import { sendWhatsApp, buildQueueMessage } from "../../_lib/fonnte.js";

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const queue = await getQueueById(env.DB, params.id);
  if (!queue) return error("Antrean tidak ditemukan", 404);
  return json({ queue });
}

export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const prev = await getQueueById(env.DB, params.id);
    if (!prev) return error("Antrean tidak ditemukan", 404);

    const queue = await updateQueue(env.DB, params.id, {
      status: body.status,
      est: body.est,
      pit: body.pit,
    });

    if (body.status && body.status !== prev.status) {
      if (body.status === "Sedang Diproses") {
        const msg = buildQueueMessage("progress", queue, queue.bill);
        await sendWhatsApp(env, queue.hp, msg);
      } else if (body.status === "Selesai Pengerjaan") {
        const msg = buildQueueMessage("final", queue, queue.bill);
        await sendWhatsApp(env, queue.hp, msg);
      }
    }

    return json({ queue });
  } catch (e) {
    return error(e.message || "Gagal memperbarui antrean", 500);
  }
}
