import fs from 'fs';
import path from 'path';
import os from 'os';
import bcrypt from 'bcryptjs';

// Use /tmp in production (Vercel serverless) to prevent EROFS read-only crashes
const CREDENTIALS_PATH =
  process.env.NODE_ENV === 'production'
    ? path.join(os.tmpdir(), 'crm-credentials.json')
    : path.join(process.cwd(), 'data', 'crm-credentials.json');

// Default seed values from environment variables or secure fallback
const DEFAULT_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';

export interface Creds {
  username: string;
  passwordHash: string;
}

function readFile(): Creds | null {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      // In production, try reading bundled seed from process.cwd() if /tmp doesn't exist yet
      const bundledPath = path.join(process.cwd(), 'data', 'crm-credentials.json');
      if (fs.existsSync(bundledPath)) {
        const raw = fs.readFileSync(bundledPath, 'utf-8');
        return JSON.parse(raw) as Creds;
      }
      return null;
    }
    const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    return JSON.parse(raw) as Creds;
  } catch (e) {
    console.error('Failed to read credentials file:', e);
    return null;
  }
}

function writeFile(creds: Creds): boolean {
  try {
    const dir = path.dirname(CREDENTIALS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to write credentials file:', error);
    return false;
  }
}

export async function ensureSeeded(): Promise<Creds> {
  const existing = readFile();

  if (
    existing &&
    typeof existing.username === 'string' &&
    typeof existing.passwordHash === 'string'
  ) {
    // If passwordHash is not bcrypt format, re-hash and update
    if (!existing.passwordHash.startsWith('$2')) {
      const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      const seed: Creds = { username: existing.username || DEFAULT_USERNAME, passwordHash: hash };
      writeFile(seed);
      return seed;
    }
    return existing;
  }

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const seed: Creds = { username: DEFAULT_USERNAME, passwordHash: hash };
  writeFile(seed);
  return seed;
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  try {
    const creds = await ensureSeeded();
    if (username !== creds.username) {
      return false;
    }
    return await bcrypt.compare(password, creds.passwordHash);
  } catch (error) {
    console.error('Error validating credentials:', error);
    return false;
  }
}

export async function updateCredentials(
  currentPassword: string,
  newUsername?: string,
  newPassword?: string
): Promise<{ success: boolean; error?: string }> {
  try {
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

    const writeSuccess = writeFile(updated);
    if (!writeSuccess) {
      return { success: false, error: 'Failed to persist updated credentials.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating credentials:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}