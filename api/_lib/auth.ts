// Simple HS256 JWT Authentication & Role-Based Authorization (RBAC) Library
// Uses Node built-in `crypto` (scryptSync + HMAC-SHA256 + timingSafeEqual) with zero extra dependencies.

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export type UserRole = 'citizen' | 'admin';

export interface JwtUserPayload {
  sub: string; // UUID user id
  email: string;
  display_name: string;
  role: UserRole;
  iat: number;
  exp: number;
}

const AUTH_COOKIE_NAME = 'claimsaathi_jwt';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): string {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set (min 16 chars) in production.');
  }
  return 'claimsaathi-local-dev-jwt-secret-change-me';
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(padLen), 'base64').toString('utf8');
}

export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plainPassword, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expectedHex] = parts;
  const actualBuf = scryptSync(plainPassword, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (actualBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(actualBuf, expectedBuf);
}

export function signJwt(user: {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
}): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadObj: JwtUserPayload = {
    sub: user.id,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
    iat: nowSec,
    exp: nowSec + TOKEN_TTL_SECONDS,
  };
  const payload = base64UrlEncode(JSON.stringify(payloadObj));
  const signature = base64UrlEncode(
    createHmac('sha256', getJwtSecret()).update(`${header}.${payload}`).digest()
  );
  return `${header}.${payload}.${signature}`;
}

export function verifyJwt(token: string): JwtUserPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = base64UrlEncode(
      createHmac('sha256', getJwtSecret()).update(`${header}.${payload}`).digest()
    );
    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const decoded = JSON.parse(base64UrlDecode(payload)) as JwtUserPayload;
    const nowSec = Math.floor(Date.now() / 1000);
    if (!decoded.sub || !decoded.email || typeof decoded.exp !== 'number' || decoded.exp <= nowSec) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function extractTokenFromRequest(req: ServerlessRequest): string | null {
  const headers = req.headers || {};
  const authHeader = headers.authorization || headers.Authorization;
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }

  const cookieHeader = headers.cookie || headers.Cookie;
  if (typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';');
    for (const pair of cookies) {
      const idx = pair.indexOf('=');
      if (idx === -1) continue;
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      if (key === AUTH_COOKIE_NAME && val) {
        return decodeURIComponent(val);
      }
    }
  }
  return null;
}

export function getAuthenticatedUser(req: ServerlessRequest): JwtUserPayload | null {
  const token = extractTokenFromRequest(req);
  if (!token) return null;
  return verifyJwt(token);
}

export function setAuthCookie(res: ServerlessResponse, token: string): void {
  const secureFlag = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${TOKEN_TTL_SECONDS}${secureFlag}`
  );
}

export function clearAuthCookie(res: ServerlessResponse): void {
  const secureFlag = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${AUTH_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureFlag}`
  );
}

export function requireAuth(req: ServerlessRequest, res: ServerlessResponse): JwtUserPayload | null {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({
      error: 'unauthorized',
      message: 'Please sign in to access this resource.',
    });
    return null;
  }
  return user;
}

export function requireAdmin(req: ServerlessRequest, res: ServerlessResponse): JwtUserPayload | null {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({
      error: 'forbidden',
      message: 'Administrator authorization is required for this action.',
    });
    return null;
  }
  return user;
}
