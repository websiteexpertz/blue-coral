import { NextResponse } from 'next/server';
import { validateCredentials } from '@/lib/credentials-store';
import { createSessionCookieValue, getSessionCookieName, getSessionCookieOptions } from '@/lib/admin-session';

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username || '');
  const password = String(body.password || '');

  if (!await validateCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const cookieValue = await createSessionCookieValue(username);
  const response = NextResponse.json({ success: true });
  response.cookies.set(getSessionCookieName(), cookieValue, getSessionCookieOptions());
  return response;
}
