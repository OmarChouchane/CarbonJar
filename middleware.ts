import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const WEBHOOK_PREFIX = '/api/webhooks';

async function limitApi(req: Request) {
  const url = new URL(req.url);
  if (!url.pathname.startsWith('/api') || url.pathname.startsWith(WEBHOOK_PREFIX)) return null;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const key = `ratelimit:${ip}:${url.pathname}`;

  const UP_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!UP_URL || !UP_TOKEN) return null; // skip if not configured

  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({ url: UP_URL, token: UP_TOKEN });
  const limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m') });
  const { success, reset, remaining } = await limiter.limit(key);
  if (!success) {
    const res = NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    res.headers.set('Retry-After', Math.ceil((reset * 1000 - Date.now()) / 1000).toString());
    res.headers.set('X-RateLimit-Remaining', String(remaining));
    return res;
  }
  return null;
}

function csrfOriginCheck(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.startsWith(WEBHOOK_PREFIX)) return null; // skip webhooks
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return null;

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = url.origin;

  const matches = (val?: string | null) => (val ? val.startsWith(host) : false);
  if (matches(origin) || matches(referer)) return null;
  return NextResponse.json(
    { error: 'CSRF protection: cross-site request blocked' },
    { status: 403 },
  );
}

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/about',
  '/expertise',
  '/trainings(.*)',
  '/api/trainings(.*)',
  '/api/contact',
  '/api/users(.*)',
  '/api/webhooks(.*)',
]);

const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(
  async (auth, req) => {
    const { userId } = await auth();

    // If user is signed in and trying to access auth pages, redirect to home
    if (userId && isAuthRoute(req)) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Protect private routes
    if (!isPublicRoute(req)) {
      await auth.protect();
    }

    // CSRF: block cross-site state-changing requests (except webhooks)
    const csrfDenied = csrfOriginCheck(req);
    if (csrfDenied) return csrfDenied;

    // API rate limiting (if Upstash configured)
    const limited = await limitApi(req);
    if (limited) return limited;
  },
  {
    // Enable Clerk automatic CSP handling in strict mode
    contentSecurityPolicy: {
      strict: true,
      // Extend directives to allow site images and broad HTTPS connects if needed
      directives: {
        'img-src': ['https:', 'data:'],
        'connect-src': ['https:'],
      },
    },
  },
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
