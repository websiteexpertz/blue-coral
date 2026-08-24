import { NextResponse } from 'next/server';
import { verifySessionCookie, getSessionCookieName } from '@/lib/admin-session';

function parseCookie(header: string | null | undefined, name: string) {
  if (!header) return undefined;
  const pairs = header.split(';').map((p) => p.trim());
  for (const p of pairs) {
    const [k, ...rest] = p.split('=');
    if (k === name) return rest.join('=');
  }
  return undefined;
}

export async function GET(request: Request) {
  const header = request.headers.get('cookie');
  const cookie = parseCookie(header, getSessionCookieName());
  const username = await verifySessionCookie(cookie);
  return NextResponse.json({ authenticated: Boolean(username), username: username || null });
}
