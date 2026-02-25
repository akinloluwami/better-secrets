import crypto from "node:crypto";
import { pool } from "./db";
import { encrypt, decrypt } from "./crypto";

export interface User {
  id: string;
  github_id: number;
  username: string;
  avatar_url: string;
  github_token: string; // encrypted in DB, decrypted when returned
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: Date;
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createUser(
  githubId: number,
  username: string,
  avatarUrl: string,
  accessToken: string
): Promise<User> {
  const id = crypto.randomUUID();
  const encryptedToken = encrypt(accessToken);

  const result = await pool.query(
    `INSERT INTO users (id, github_id, username, avatar_url, github_token)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (github_id) DO UPDATE
       SET username = $3, avatar_url = $4, github_token = $5
     RETURNING *`,
    [id, githubId, username, avatarUrl, encryptedToken]
  );

  const row = result.rows[0];
  return { ...row, github_token: accessToken };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return { ...row, github_token: decrypt(row.github_token) };
}

export async function createSession(userId: string): Promise<Session> {
  const id = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [id, userId, expiresAt]
  );

  return { id, user_id: userId, expires_at: expiresAt };
}

export async function validateSession(
  sessionId: string
): Promise<{ user: User; session: Session } | null> {
  const result = await pool.query(
    `SELECT s.id as session_id, s.user_id, s.expires_at,
            u.id, u.github_id, u.username, u.avatar_url, u.github_token, u.created_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = $1`,
    [sessionId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const session: Session = {
    id: row.session_id,
    user_id: row.user_id,
    expires_at: row.expires_at,
  };

  if (new Date() > session.expires_at) {
    await destroySession(sessionId);
    return null;
  }

  const user: User = {
    id: row.user_id,
    github_id: row.github_id,
    username: row.username,
    avatar_url: row.avatar_url,
    github_token: decrypt(row.github_token),
    created_at: row.created_at,
  };

  return { user, session };
}

export async function destroySession(sessionId: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE id = $1", [sessionId]);
}
