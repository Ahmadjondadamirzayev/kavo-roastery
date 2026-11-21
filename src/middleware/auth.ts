import type { NextFunction, Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

const DEFAULT_ADMIN_EMAIL = 'ahmadjondadamirzayev6@gmail.com';

export function getConfiguredAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getConfiguredAdminEmails().includes(email.trim().toLowerCase());
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing bearer token' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Empty token' });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || !isAdminEmail(req.user.email)) {
    res.status(403).json({ error: 'Forbidden: Admin privileges required' });
    return;
  }
  next();
};
