import { db } from "../db/schema";
import type { ConnectionConfig } from "@/types";

export const connectionService = {
  async getAll(): Promise<ConnectionConfig[]> {
    const results = await db.getAllAsync("SELECT * FROM connections");
    return results.map((row: any) => ({
      ...row,
      profile: row.profile ? JSON.parse(row.profile) : undefined,
    }));
  },

  async getById(id: string): Promise<ConnectionConfig | null> {
    const result = await db.getFirstAsync(
      "SELECT * FROM connections WHERE id = ?",
      [id],
    );
    if (!result) return null;
    const row = result as any;
    return {
      ...row,
      profile: row.profile ? JSON.parse(row.profile) : undefined,
    };
  },

  async create(connection: ConnectionConfig): Promise<void> {
    await db.runAsync(
      `INSERT INTO connections (id, name, host, port, username, auth_method, private_key, passphrase, key_id, password, "group", profile)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        connection.id,
        connection.name,
        connection.host,
        connection.port,
        connection.username,
        connection.auth_method,
        connection.private_key || null,
        connection.passphrase || null,
        connection.key_id || null,
        connection.password || null,
        connection.group || null,
        connection.profile ? JSON.stringify(connection.profile) : null,
      ],
    );
  },

  async update(connection: ConnectionConfig): Promise<void> {
    await db.runAsync(
      `UPDATE connections SET name = ?, host = ?, port = ?, username = ?, auth_method = ?, private_key = ?, passphrase = ?, key_id = ?, password = ?, "group" = ?, profile = ?
       WHERE id = ?`,
      [
        connection.name,
        connection.host,
        connection.port,
        connection.username,
        connection.auth_method,
        connection.private_key || null,
        connection.passphrase || null,
        connection.key_id || null,
        connection.password || null,
        connection.group || null,
        connection.profile ? JSON.stringify(connection.profile) : null,
        connection.id,
      ],
    );
  },

  async delete(id: string): Promise<void> {
    await db.runAsync("DELETE FROM connections WHERE id = ?", [id]);
  },

  async duplicate(connection: ConnectionConfig): Promise<ConnectionConfig> {
    const id = Date.now().toString();
    const name = `${connection.name} (copy)`;
    const copy: ConnectionConfig = {
      ...connection,
      id,
      name,
    };
    await this.create(copy);
    return copy;
  },

  async getByGroup(groupId: string): Promise<ConnectionConfig[]> {
    const results = await db.getAllAsync(
      'SELECT * FROM connections WHERE "group" = ?',
      [groupId],
    );
    return results.map((row: any) => ({
      ...row,
      profile: row.profile ? JSON.parse(row.profile) : undefined,
    }));
  },
};
