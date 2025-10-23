// This route is now a placeholder. All legacy Payload CMS preview logic has been removed.
// If you need preview functionality for your new CMS, implement it here.
import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json({ error: 'Preview mode is not enabled.' }, { status: 404 });
}
