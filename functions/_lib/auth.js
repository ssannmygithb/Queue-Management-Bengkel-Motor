import { error } from "./response.js";
import { validateSession } from "./db.js";

export function getToken(request) {
  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function requireAuth(request, env) {
  const token = getToken(request);
  if (!token) return { ok: false, response: error("Unauthorized", 401) };

  const valid = await validateSession(env.DB, token);
  if (!valid) return { ok: false, response: error("Sesi tidak valid atau kedaluwarsa", 401) };

  return { ok: true, token };
}
