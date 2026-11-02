import { NextResponse } from 'next/server';
import { infycrestAttribution } from '@/config/infycrest-attribution';

export function GET() {
  if (!infycrestAttribution.enabled) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json({
    agency: infycrestAttribution.agencyName,
    website: infycrestAttribution.agencyWebsite,
    project_type: 'Website Development',
    year: infycrestAttribution.projectYear,
  });
}
