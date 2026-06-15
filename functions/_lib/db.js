import { getService } from "./services.js";

export async function nextQueueId(db) {
  await db.prepare("UPDATE queue_counter SET counter = counter + 1 WHERE id = 1").run();
  const row = await db.prepare("SELECT counter FROM queue_counter WHERE id = 1").first();
  return "A" + String(row.counter).padStart(3, "0");
}

export async function getBillItems(db, queueId) {
  const { results } = await db
    .prepare("SELECT id, item, price, is_additional FROM bill_items WHERE queue_id = ? ORDER BY id")
    .bind(queueId)
    .all();
  return results || [];
}

export async function getQueueById(db, id) {
  const queue = await db.prepare("SELECT * FROM queues WHERE id = ?").bind(id).first();
  if (!queue) return null;
  const bill = await getBillItems(db, id);
  return { ...queue, bill };
}

export async function getAllQueues(db) {
  const { results } = await db
    .prepare("SELECT * FROM queues WHERE status != 'Lunas' ORDER BY created_at DESC")
    .all();

  const queues = [];
  for (const q of results || []) {
    const bill = await getBillItems(db, q.id);
    queues.push({ ...q, bill });
  }
  return queues;
}

export async function createQueue(db, { nama, hp, plat, serviceId }) {
  const service = getService(serviceId);
  if (!service) throw new Error("Layanan tidak valid");

  const id = await nextQueueId(db);

  await db
    .prepare(
      `INSERT INTO queues (id, nama, hp, plat, service_id, service_name, pit, status, est)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu', '—')`
    )
    .bind(id, nama, hp, plat, serviceId, service.name, service.pit)
    .run();

  for (const item of service.defaultBill) {
    await db
      .prepare("INSERT INTO bill_items (queue_id, item, price, is_additional) VALUES (?, ?, ?, 0)")
      .bind(id, item.item, item.price)
      .run();
  }

  return getQueueById(db, id);
}

export async function updateQueue(db, id, { status, est, pit }) {
  const fields = [];
  const values = [];

  if (status !== undefined) {
    fields.push("status = ?");
    values.push(status);
  }
  if (est !== undefined) {
    fields.push("est = ?");
    values.push(est);
  }
  if (pit !== undefined) {
    fields.push("pit = ?");
    values.push(pit);
  }

  if (fields.length === 0) return getQueueById(db, id);

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await db.prepare(`UPDATE queues SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  return getQueueById(db, id);
}

export async function addBillItem(db, queueId, { item, price, isAdditional }) {
  await db
    .prepare("INSERT INTO bill_items (queue_id, item, price, is_additional) VALUES (?, ?, ?, ?)")
    .bind(queueId, item, price, isAdditional ? 1 : 0)
    .run();

  if (isAdditional) {
    await db
      .prepare(
        "UPDATE queues SET pending_bill_approval = 1, approval_status = 'pending', updated_at = datetime('now') WHERE id = ?"
      )
      .bind(queueId)
      .run();
  }

  return getQueueById(db, queueId);
}

export async function processPayment(db, queueId, paymentMethod) {
  await db
    .prepare(
      `UPDATE queues SET status = 'Lunas', payment_method = ?, paid_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    )
    .bind(paymentMethod, queueId)
    .run();
  return getQueueById(db, queueId);
}

export async function approveByPhone(db, hp) {
  const normalized = hp.replace(/\D/g, "");
  const suffix = normalized.slice(-10);

  const { results } = await db
    .prepare(
      `SELECT * FROM queues
       WHERE pending_bill_approval = 1
       AND REPLACE(REPLACE(REPLACE(hp, ' ', ''), '-', ''), '+', '') LIKE ?
       ORDER BY updated_at DESC
       LIMIT 1`
    )
    .bind("%" + suffix)
    .all();

  const queue = results?.[0];
  if (!queue) return null;

  await db
    .prepare(
      "UPDATE queues SET pending_bill_approval = 0, approval_status = 'approved', updated_at = datetime('now') WHERE id = ?"
    )
    .bind(queue.id)
    .run();

  return getQueueById(db, queue.id);
}

export async function createSession(db, token, hours = 24) {
  await db
    .prepare("INSERT INTO admin_sessions (token, expires_at) VALUES (?, datetime('now', ?))")
    .bind(token, `+${hours} hours`)
    .run();
}

export async function validateSession(db, token) {
  const row = await db
    .prepare("SELECT token FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')")
    .bind(token)
    .first();
  return !!row;
}

export async function cleanupSessions(db) {
  await db.prepare("DELETE FROM admin_sessions WHERE expires_at <= datetime('now')").run();
}
