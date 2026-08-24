const USERNAME = process.env.CRM_AUTH_USERNAME;
const PASSWORD = process.env.CRM_AUTH_PASSWORD;
const SECRET = process.env.CRM_AUTH_SECRET;
const COOKIE_NAME = 'crm_session';

function ensureEnvConfigured() {
  if (!USERNAME || !PASSWORD || !SECRET) {
    throw new Error('CRM auth environment variables are not configured. Set CRM_AUTH_USERNAME, CRM_AUTH_PASSWORD, and CRM_AUTH_SECRET.');
  }
}

const COOKIE_MAX_AGE = 60 * 60; // 1 hour
const encoder = new TextEncoder();

async function createSignature(payload: string) {
  const keyData = encoder.encode(SECRET);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  return Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function createAuthCookie() {
  ensureEnvConfigured();
  const payload = `${USERNAME}:${Date.now()}`;
  const signature = await createSignature(payload);
  return `${payload}:${signature}`;
}

export async function verifyAuthCookie(cookie: string | undefined) {
  if (!cookie) {
    return false;
  }

  const parts = cookie.split(':');
  if (parts.length !== 3) {
    return false;
  }

  const [username, timestamp, signature] = parts;
  if (!USERNAME) return false;
  if (username !== USERNAME) {
    return false;
  }

  const expected = await createSignature(`${username}:${timestamp}`);
  return signature === expected;
}

export function validateCredentials(username: string, password: string) {
  if (!USERNAME || !PASSWORD) return false;
  return username === USERNAME && password === PASSWORD;
}

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export function getAuthCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: COOKIE_MAX_AGE,
  };
}
