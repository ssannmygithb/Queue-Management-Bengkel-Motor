const fs = require("fs");
const path = require("path");

function parseIdrRange(raw) {
  const parts = String(raw).split("-").map((p) => p.trim());
  const toNum = (v) => parseInt(v.replace(/\./g, ""), 10);
  if (parts.length >= 2) return { min: toNum(parts[0]), max: toNum(parts[1]) };
  const n = toNum(parts[0]);
  return { min: n, max: n };
}

function esc(s) {
  return String(s).replace(/'/g, "''");
}

const lines = fs
  .readFileSync(path.join(__dirname, "dbmotor.tsv"), "utf8")
  .trim()
  .split(/\r?\n/);

const values = lines.map((line) => {
  const m = line.match(/^(\d+),(.+),([^,]+),([^,]+),(.+)$/);
  if (!m) throw new Error("Bad line: " + line);
  const [, no, name, category, usageFor, priceRaw] = m;
  const { min, max } = parseIdrRange(priceRaw);
  return `(${no}, '${esc(name)}', '${esc(category)}', '${esc(usageFor)}', ${min}, ${max})`;
});

const sql = `CREATE TABLE IF NOT EXISTS parts_catalog (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  usage_for TEXT NOT NULL DEFAULT 'Semua',
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_parts_category ON parts_catalog(category);
CREATE INDEX IF NOT EXISTS idx_parts_name ON parts_catalog(name);

INSERT OR REPLACE INTO parts_catalog (id, name, category, usage_for, price_min, price_max) VALUES
${values.join(",\n")};
`;

fs.writeFileSync(path.join(__dirname, "..", "migrations", "0002_parts_catalog.sql"), sql);
console.log("Wrote", values.length, "parts");
