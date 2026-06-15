import { json, error, handleOptions } from "../../_lib/response.js";
import { createSession, cleanupSessions } from "../../_lib/db.js";

export async function onRequestOptions() {
  return handleOptions();
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const username = body.username?.trim();
    const password = body.password?.trim();

    const expectedUser = env.ADMIN_USERNAME || "admin";
    const expectedPass = env.ADMIN_PASSWORD;

    if (!expectedPass) {
      return error("Admin belum dikonfigurasi di server (ADMIN_PASSWORD)", 503);
    }

    if (username !== expectedUser || password !== expectedPass) {
      return error("Username atau password salah", 401);
    }

    await cleanupSessions(env.DB);
    const token = crypto.randomUUID();
    await createSession(env.DB, token);

    return json({ token, username });
  } catch (e) {
    return error(e.message || "Login gagal", 500);
  }
}
