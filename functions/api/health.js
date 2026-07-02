import { json } from "../_lib/response.js";

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return json({ ok: false, error: "D1 binding 'DB' tidak terpasang di Pages" }, 503);
  }
  try {
    await env.DB.prepare("SELECT 1 as n").first();
    return json({ ok: true, db: "connected" });
  } catch (e) {
    return json({ ok: false, error: e.message }, 503);
  }
}
