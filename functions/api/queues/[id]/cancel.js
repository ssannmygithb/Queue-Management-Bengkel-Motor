import { json, error, handleOptions } from "../../../_lib/response.js";
import { requireAuth } from "../../../_lib/auth.js";
import { cancelQueue } from "../../../_lib/db.js";
import { sendWhatsApp } from "../../../_lib/fonnte.js";

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const queue = await cancelQueue(env.DB, params.id);

    const msg =
      `Halo Kak ${queue.nama}.\n\n` +
      `Antrean *${queue.id}* untuk motor plat *${queue.plat}* telah *DIBATALKAN* oleh bengkel.\n\n` +
      `Hubungi kasir jika ada pertanyaan.\n— RiderSantuy`;

    await sendWhatsApp(env, queue.hp, msg);

    return json({ queue });
  } catch (e) {
    return error(e.message || "Gagal membatalkan antrean", 500);
  }
}
