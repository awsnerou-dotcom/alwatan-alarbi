import crypto from 'node:crypto';
import { env as cfEnv } from 'cloudflare:workers';

const vars = () => cfEnv as unknown as Record<string, string | undefined>;

// Cloudflare's free plan allows ~10 ms of CPU per request, so scrypt (used by the
// original Node server) is too slow here. Passwords use a peppered HMAC instead:
// the pepper (AUTH_SECRET) lives only in Cloudflare secrets, never in the database.
export function tokenSecret(): string {
  const v = vars().AUTH_SECRET?.trim();
  if (!v || v.length < 16) throw new Error('AUTH_SECRET secret is missing (min 16 chars)');
  return v;
}

export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', tokenSecret()).update(`${salt}:${password}`).digest('hex');
  return { hash, salt };
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, 'utf8');
  const y = Buffer.from(b, 'utf8');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Main admin email: the ADMIN_EMAIL secret, or the documented default.
export function adminEmail(): string {
  return (vars().ADMIN_EMAIL || '').trim().toLowerCase() || 'admin@alwatan.qa';
}

// Secrets pasted into the Cloudflare dashboard often pick up stray spaces/newlines.
export function adminPassword(): string {
  return (vars().ADMIN_PASSWORD || '').trim();
}

// Which required secrets are missing (names only, never values).
export function missingAuthSecrets(): string[] {
  const missing: string[] = [];
  const secret = vars().AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) missing.push('AUTH_SECRET');
  if (!adminPassword()) missing.push('ADMIN_PASSWORD');
  return missing;
}

export function verifyLogin(user: { email: string; passwordHash: string; salt: string }, password: string): boolean {
  const email = adminEmail();
  const adminPw = adminPassword();
  // The main admin always signs in with the ADMIN_PASSWORD secret (change it in Cloudflare to rotate it).
  if (adminPw && user.email.toLowerCase() === email) {
    return safeEqual(password.trim(), adminPw);
  }
  // Legacy scrypt hashes (128 hex chars) can't be checked cheaply on the free plan.
  if (user.passwordHash.length !== 64) return false;
  return safeEqual(hashPassword(password, user.salt).hash, user.passwordHash);
}
