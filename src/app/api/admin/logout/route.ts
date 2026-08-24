import { NextResponse } from 'next/server';
import { getSessionCookieName } from '@/lib/admin-session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  // clear cookie
  response.cookies.set(getSessionCookieName(), '', { path: '/', maxAge: 0 });
  return response;
}
