import { NextResponse } from 'next/server';
import { getIcalSettings, saveIcalSettings } from '@/lib/ical-settings-store';

export async function GET() {
  return NextResponse.json(await getIcalSettings());
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = typeof body.url === 'string' ? body.url.trim() : '';

    if (url) {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return NextResponse.json({ error: 'Calendar URL must use HTTP or HTTPS.' }, { status: 400 });
      }
    }

    const settings = await saveIcalSettings({ url, refreshMinutes: body.refreshMinutes });
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save calendar settings.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}