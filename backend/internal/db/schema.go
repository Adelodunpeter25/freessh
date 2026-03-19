package db

// SchemaSQL mirrors the mobile SQLite schema defined in mobile/src/services/db/schema.ts.
// Keep this in sync with the mobile schema when changes are made.
const SchemaSQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  connection_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ssh_keys (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  bits INTEGER,
  publicKey TEXT,
  private_key TEXT,
  passphrase TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 22,
  username TEXT NOT NULL,
  auth_method TEXT NOT NULL,
  private_key TEXT,
  passphrase TEXT,
  key_id TEXT,
  password TEXT,
  'group' TEXT,
  profile TEXT,
  FOREIGN KEY (key_id) REFERENCES ssh_keys (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS snippets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  command TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY NOT NULL,
  command TEXT NOT NULL,
  connection_id TEXT
);

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY NOT NULL,
  filename TEXT NOT NULL,
  connection_name TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  size INTEGER DEFAULT 0,
  path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS port_forwards (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  connection_id TEXT NOT NULL,
  type TEXT NOT NULL,
  local_port INTEGER,
  remote_host TEXT,
  remote_port INTEGER,
  binding_address TEXT,
  auto_start INTEGER DEFAULT 0,
  FOREIGN KEY (connection_id) REFERENCES connections (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS known_hosts (
  id TEXT PRIMARY KEY NOT NULL,
  hostname TEXT NOT NULL,
  port INTEGER NOT NULL,
  fingerprint TEXT NOT NULL,
  publicKey TEXT NOT NULL
);
`

// MigrationSQL mirrors the lightweight migration in the mobile schema.
const MigrationSQL = `ALTER TABLE connections ADD COLUMN passphrase TEXT;`
