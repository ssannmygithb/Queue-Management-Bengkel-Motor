import { json, error, handleOptions } from "../_lib/response.js";
import { requireAuth } from "../_lib/auth.js";
import { getAllParts, createPart } from "../_lib/db.js";

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const parts = await getAllParts(env.DB, {
      search: url.searchParams.get("search") || undefined,
      category: url.searchParams.get("category") || undefined,
    });
    return json({ parts });
  } catch (e) {
    return error(e.message || "Gagal memuat database sparepart", 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const name = body.name?.trim();
    const category = body.category?.trim();
    const usageFor = body.usageFor?.trim() || "Semua";
    const priceMin = parseInt(body.priceMin, 10);
    const priceMax = parseInt(body.priceMax, 10);

    if (!name || !category || isNaN(priceMin) || isNaN(priceMax) || priceMin < 0 || priceMax < priceMin) {
      return error("Nama, kategori, dan rentang harga yang valid wajib diisi");
    }

    const part = await createPart(env.DB, { name, category, usageFor, priceMin, priceMax });
    return json({ part }, 201);
  } catch (e) {
    return error(e.message || "Gagal menambah sparepart", 500);
  }
}
