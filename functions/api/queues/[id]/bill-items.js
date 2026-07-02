import { json, error, handleOptions } from "../../../_lib/response.js";
import { requireAuth } from "../../../_lib/auth.js";
import { addBillItem, addBillItemFromCatalog } from "../../../_lib/db.js";
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

    if (body.catalogPartId) {
      const priceOverride = body.price !== undefined ? parseInt(body.price, 10) : undefined;
      const isAdditional = body.isAdditional !== false;
      const queue = await addBillItemFromCatalog(env.DB, params.id, parseInt(body.catalogPartId, 10), {
        isAdditional,
        priceOverride: isNaN(priceOverride) ? undefined : priceOverride,
      });

      if (isAdditional) {
        const msg = buildQueueMessage("additional", queue, queue.bill);
        await sendWhatsApp(env, queue.hp, msg);
      }

      return json({ queue });
    }

    const item = body.item?.trim();
    const price = parseInt(body.price, 10);
    const isAdditional = body.isAdditional !== false;

    if (!item || isNaN(price) || price < 0) {
      return error("Nama item dan harga yang valid wajib diisi");
    }

    const queue = await addBillItem(env.DB, params.id, { item, price, isAdditional });

    if (isAdditional) {
      const msg = buildQueueMessage("additional", queue, queue.bill);
      await sendWhatsApp(env, queue.hp, msg);
    }

    return json({ queue });
  } catch (e) {
    return error(e.message || "Gagal menambah item", 500);
  }
}
