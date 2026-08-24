import { NextResponse } from 'next/server';
import { getSiteContentData, saveSiteContentData } from '@/lib/site-content-store';

export async function GET() {
  const data = await getSiteContentData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const content = await saveSiteContentData(body);
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save website content.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const content = await saveSiteContentData(body);
    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save website content.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}
