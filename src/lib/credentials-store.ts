import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

declare module 'bcryptjs';

const CREDENTIALS_PATH = path.join(process.cwd(), 'data', 'crm-credentials.json');

export interface Creds {
  username: string;
  passwordHash: string;
}

function readFile(): Creds | null {
  try {
    const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    return JSON.parse(raw) as Creds;
  } catch (e) {
    return null;
  }
}

function writeFile(creds: Creds) {
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2), 'utf-8');
}

export async function ensureSeeded() {
  const existing = readFile();
  if (existing && typeof existing.username === 'string' && typeof existing.passwordHash === 'string') {
    // if passwordHash isn't bcrypt, re-hash it
    if (!existing.passwordHash.startsWith('$2')) {
      const legacy = existing.passwordHash;
      // assume legacy is sha256 hex
      // we can't recover original password; instead re-seed with default creds
      const hash = await bcrypt.hash('admin@123', 10);
      const seed = { username: 'admin', passwordHash: hash };
      writeFile(seed);
      return seed;
    }
    return existing;
  }

  const hash = await bcrypt.hash('admin@123', 10);
  const seed = { username: 'admin', passwordHash: hash };
  writeFile(seed);
  return seed;
}

export async function validateCredentials(username: string, password: string) {
  const creds = await ensureSeeded();
  if (username !== creds.username) return false;
  // bcrypt compare
  const ok = await bcrypt.compare(password, creds.passwordHash);
  return ok;
}

export async function updateCredentials(currentPassword: string, newUsername?: string, newPassword?: string) {
  const creds = await ensureSeeded();
  const ok = await bcrypt.compare(currentPassword, creds.passwordHash);
  if (!ok) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const updated: Creds = { ...creds };
  if (newUsername && newUsername.trim().length > 0) {
    updated.username = newUsername.trim();
  }
  if (newPassword && newPassword.length > 0) {
    updated.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  writeFile(updated);
  return { success: true };
}
