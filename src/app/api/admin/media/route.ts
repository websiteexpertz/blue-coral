import { NextResponse } from 'next/server';
import {
  createMediaDocument,
  deleteMediaDocument,
  getMediaDocuments,
  reorderGalleryMedia,
  updateMediaDocument,
} from '@/lib/media-store';

export async function GET() {
  const media = await getMediaDocuments();
  return NextResponse.json(media);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const items = Array.isArray(body) ? body : [body];

    const created = [];
    for (const item of items) {
      const media = await createMediaDocument(item);
      if (!media) {
        return NextResponse.json({ error: 'Unable to save media.' }, { status: 500 });
      }
      created.push(media);
    }

    return NextResponse.json(created.length === 1 ? created[0] : created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save media.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const media = await updateMediaDocument(body.id, body);
    if (!media) {
      return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save media.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id || '');
    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const deleted = await deleteMediaDocument(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete media.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
