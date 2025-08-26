import crypto from 'crypto';
import type { NextRequest } from 'next/server';

const CSRF_COOKIE = 'csrf-token';
const CSRF_HEADER = 'x-csrf-token';

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Note: CSRF cookie helpers intentionally removed from runtime to avoid lint and
// middleware-unsupported APIs; CSRF origin checks are handled in middleware.ts.

export function getClientIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim();
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
