import { json, error, handleOptions } from "../../../../_lib/response.js";
import { requireAuth } from "../../../../_lib/auth.js";
import { removeBillItem } from "../../../../_lib/db.js";

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const queue = await removeBillItem(env.DB, params.id, params.billId);
    return json({ queue });
  } catch (e) {
    return error(e.message || "Gagal menghapus item", 500);
  }
}
