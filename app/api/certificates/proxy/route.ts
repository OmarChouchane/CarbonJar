import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EDGE_STORE_HOSTS = new Set(['files.edgestore.dev']);

export const dynamic = 'force-dynamic';

const passthroughHeaders = ['content-type', 'content-length', 'last-modified', 'etag'];

function sanitizeUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    if (!EDGE_STORE_HOSTS.has(parsed.hostname)) {
      return null;
    }

    if (parsed.protocol !== 'https:') {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Invalid certificate proxy URL:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url parameter.' }, { status: 400 });
  }

  const targetUrl = sanitizeUrl(rawUrl);
  if (!targetUrl) {
    return NextResponse.json({ error: 'Invalid certificate URL.' }, { status: 400 });
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.8',
      },
    });
  } catch (error) {
    console.error('Error fetching certificate from EdgeStore:', error);
    return NextResponse.json({ error: 'Failed to retrieve certificate.' }, { status: 502 });
  }

  if (!upstreamResponse.ok) {
    return NextResponse.json(
      {
        error: 'EdgeStore returned an error.',
        status: upstreamResponse.status,
      },
      { status: upstreamResponse.status },
    );
  }

  const headers = new Headers();
  headers.set('Cache-Control', 'private, max-age=60');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Content-Security-Policy', "frame-ancestors 'self'");
  headers.set('Content-Disposition', 'inline');

  for (const headerName of passthroughHeaders) {
    const value = upstreamResponse.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/pdf');
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}
