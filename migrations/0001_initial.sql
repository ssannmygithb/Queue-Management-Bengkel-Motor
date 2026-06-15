CREATE TABLE IF NOT EXISTS queue_counter (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  counter INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO queue_counter (id, counter) VALUES (1, 0);

CREATE TABLE IF NOT EXISTS queues (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  hp TEXT NOT NULL,
  plat TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  pit TEXT NOT NULL DEFAULT 'Belum Ditentukan',
  status TEXT NOT NULL DEFAULT 'Menunggu',
  est TEXT NOT NULL DEFAULT '—',
  approval_status TEXT NOT NULL DEFAULT 'none',
  pending_bill_approval INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bill_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue_id TEXT NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_additional INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_queues_status ON queues(status);
CREATE INDEX IF NOT EXISTS idx_queues_hp ON queues(hp);
CREATE INDEX IF NOT EXISTS idx_bill_items_queue ON bill_items(queue_id);
