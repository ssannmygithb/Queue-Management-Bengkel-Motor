import { json, error, handleOptions } from "../../_lib/response.js";
import { requireAuth } from "../../_lib/auth.js";
import { getPartById, updatePart, deletePart } from "../../_lib/db.js";

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  const part = await getPartById(env.DB, params.id);
  if (!part) return error("Sparepart tidak ditemukan", 404);
  return json({ part });
}

export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const priceMin = body.priceMin !== undefined ? parseInt(body.priceMin, 10) : undefined;
    const priceMax = body.priceMax !== undefined ? parseInt(body.priceMax, 10) : undefined;

    if (priceMin !== undefined && isNaN(priceMin)) return error("Harga minimum tidak valid");
    if (priceMax !== undefined && isNaN(priceMax)) return error("Harga maximum tidak valid");

    const part = await updatePart(env.DB, params.id, {
      name: body.name?.trim(),
      category: body.category?.trim(),
      usageFor: body.usageFor?.trim(),
      priceMin,
      priceMax,
    });

    if (!part) return error("Sparepart tidak ditemukan", 404);
    return json({ part });
  } catch (e) {
    return error(e.message || "Gagal memperbarui sparepart", 500);
  }
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    await deletePart(env.DB, params.id);
    return json({ ok: true });
  } catch (e) {
    return error(e.message || "Gagal menghapus sparepart", 500);
  }
}
