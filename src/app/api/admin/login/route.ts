import { NextResponse } from 'next/server';
import { validateCredentials } from '@/lib/credentials-store';
import { createSessionCookieValue, getSessionCookieName, getSessionCookieOptions } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
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
  } catch (err: any) {
    // Return a JSON error so the client can surface a message instead of hanging
    const message = err?.message || 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
