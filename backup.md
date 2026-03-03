# Backup Design: Local + Server Encrypted Backup

## Goal

Provide two backup modes from one flow:

1. **Local backup**: export encrypted backup file to Downloads.
2. **Server backup**: upload encrypted backup to your REST API + Postgres for cross-device restore.

No full account system is required.

## Product Flow

### Export

User chooses:

- **Export to file**
- **Export to server**

If server export is chosen:

1. User enters encryption key/passphrase.
2. App builds backup payload from local data.
3. App encrypts payload locally.
4. App derives a lookup ID from the key (never store raw key as ID).
5. App uploads encrypted blob + metadata to API.

### Import

User chooses:

- **Import from file**
- **Import from server**

If server import is chosen:

1. User enters encryption key/passphrase.
2. App derives same lookup ID.
3. App requests encrypted blob from API.
4. App decrypts locally.
5. App imports with mode: **merge** or **replace**.

## Security Model

### Client-side encryption only

- Encrypt/decrypt in app, never on server.
- Server stores ciphertext only.

### Key handling

- Never send or store raw encryption key on server.
- Derive:
  - `data_key` for encryption (Argon2id)
  - `lookup_id` for record lookup (HMAC-SHA256 with server pepper, or deterministic hash design)

### Recommended crypto

- KDF: **Argon2id**
- AEAD: **XChaCha20-Poly1305** (or AES-256-GCM if preferred)
- Include per-backup `salt` + `nonce`.

## Backup Payload Scope (v1)

Include:

- connections (with profiles)
- groups
- port forwards
- snippets
- known hosts
- key metadata + private key material (if user opts in)

Exclude by default:

- OS keychain secrets (passwords/passphrases)
- logs/history (optional future flag)

## Data Format

### Encrypted envelope

```json
{
  "version": 1,
  "kdf": "argon2id",
  "cipher": "xchacha20poly1305",
  "salt": "...",
  "nonce": "...",
  "ciphertext": "...",
  "created_at": "...",
  "payload_hash": "..."
}
```

### Server record

```json
{
  "backup_id": "derived-lookup-id",
  "version": 1,
  "created_at": "...",
  "updated_at": "...",
  "blob": "{encrypted-envelope-json}",
  "size_bytes": 12345
}
```

## API Proposal

### `PUT /v1/backups/:backupId`

Upsert encrypted backup blob.

### `GET /v1/backups/:backupId`

Fetch encrypted backup blob.

### Optional: `DELETE /v1/backups/:backupId`

Delete backup.

## Postgres Schema (minimal)

```sql
create table backups (
  backup_id text primary key,
  version int not null,
  blob jsonb not null,
  size_bytes int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## UX Details

- Export success should show destination:
  - file path for local
  - server timestamp for remote
- Import should show preview counts before apply.
- Add explicit choice:
  - **Merge**
  - **Replace local data**

## Reliability Requirements

- Size limit and graceful errors.
- Retry upload/download with timeout.
- Schema version migration support.
- Strong validation before import apply.

## Rollout Plan

1. Implement encrypted local backup format.
2. Add server upload/download endpoints.
3. Add UI mode switch in Export/Import dialog.
4. Add import preview + merge/replace modes.
5. Add optional background auto-backup to server (later).

## Non-goals (for now)

- Real-time sync engine.
- Multi-user account system.
- Server-side decryption.

