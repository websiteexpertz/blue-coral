import { NextResponse } from 'next/server';
import { updateCredentials } from '@/lib/credentials-store';

export async function POST(request: Request) {
  const body = await request.json();
  const currentPassword = String(body.currentPassword || '');
  const newUsername = body.newUsername ? String(body.newUsername) : undefined;
  const newPassword = body.newPassword ? String(body.newPassword) : undefined;

  const result = await updateCredentials(currentPassword, newUsername, newPassword);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
