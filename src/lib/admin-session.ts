const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour
const DEV_FALLBACK_SECRET = 'blue-coral-admin-dev-secret';

function now() {
  return Math.floor(Date.now());
}

function getDevFallbackSecret() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  return DEV_FALLBACK_SECRET;
}

async function createHmac(secret: string, data: string) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto is not available in this runtime.');
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSessionCookieValue(username: string) {
  let secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_AUTH_SECRET is not set');
    }
    secret = getDevFallbackSecret();
    // eslint-disable-next-line no-console
    console.warn('ADMIN_AUTH_SECRET not set — using stable local dev secret. Set ADMIN_AUTH_SECRET in .env to override.');
  }
  const payload = `${username}:${now()}`;
  const signature = await createHmac(secret, payload);
  return `${payload}:${signature}`;
}

export async function verifySessionCookie(cookie: string | undefined) {
  if (!cookie) return false;
  const parts = cookie.split(':');
  if (parts.length !== 3) return false;
  const [username, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) return false;
  let secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') return false;
    secret = getDevFallbackSecret();
    if (!secret) return false;
  }
  const expected = await createHmac(secret, `${username}:${timestamp}`);
  if (expected !== signature) return false;
  // expiry
  if (Date.now() - timestamp > COOKIE_MAX_AGE * 1000) return false;
  return username;
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function getSessionCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: COOKIE_MAX_AGE,
  };
}
