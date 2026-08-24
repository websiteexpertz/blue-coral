import { NextResponse } from 'next/server';
import { createAuthCookie, getAuthCookieName, validateCredentials, getAuthCookieOptions } from '@/lib/crm-auth';

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username || '');
  const password = String(body.password || '');

  if (!await validateCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const cookieValue = await createAuthCookie();
  const response = NextResponse.json({ success: true });
  response.cookies.set(getAuthCookieName(), cookieValue, getAuthCookieOptions());
  return response;
}
