import type { NextFunction, Request, Response } from 'express';
import { auth as firebaseAuth } from './firebase.js';
import { insertDoc, fetchDocById } from './firebaseHelpers.js';

export type UserRole = 'client' | 'partner' | 'company' | 'admin';

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const publicUser = (user: Partial<UserRecord>) => {
  const { ...safeUser } = user;
  return safeUser;
};

export const createUser = async (input: { fullName: string; email: string; phone?: string; password: string; role: UserRole }) => {
  if (!firebaseAuth) throw new Error('Firebase Auth not configured');
  const normalizedEmail = input.email.trim().toLowerCase();
  const created = await firebaseAuth.createUser({ email: normalizedEmail, password: input.password, displayName: input.fullName, phoneNumber: input.phone });
  const now = new Date().toISOString();
  const userDoc = {
    id: created.uid,
    fullName: input.fullName.trim(),
    email: normalizedEmail,
    phone: input.phone || '',
    role: input.role,
    isVerified: !!created.emailVerified,
    createdAt: now,
    updatedAt: now,
  };
  await insertDoc('users', userDoc);
  return publicUser(userDoc);
};

export const registerUser = async (input: { fullName: string; email: string; phone?: string; password: string; role?: UserRole }) => {
  if (!firebaseAuth) throw new Error('Firebase Auth not configured');
  const normalizedEmail = input.email.trim().toLowerCase();
  const created = await firebaseAuth.createUser({ email: normalizedEmail, password: input.password, displayName: input.fullName, phoneNumber: input.phone });
  const now = new Date().toISOString();
  const userDoc = {
    id: created.uid,
    fullName: input.fullName.trim(),
    email: normalizedEmail,
    phone: input.phone || '',
    role: input.role === 'partner' ? 'partner' : 'client',
    isVerified: !!created.emailVerified,
    createdAt: now,
    updatedAt: now,
  };
  await insertDoc('users', userDoc);
  return { user: publicUser(userDoc) };
};

export const loginUser = async (email: string, password: string) => {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) throw new Error('Server-side login requires FIREBASE_API_KEY; recommend client-side Firebase Auth');
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Authentication failed: ${text}`);
  }
  const data = await res.json();
  const userId = data.localId as string;
  const userDoc = await fetchDocById('users', userId);
  return { user: publicUser(userDoc), token: data.idToken, refreshToken: data.refreshToken };
};

export interface AuthRequest extends Request {
  user?: UserRecord;
}

export const requireAuth = async (request: AuthRequest, response: Response, next: NextFunction) => {
  const authorization = request.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) {
    response.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    return;
  }
  try {
    if (!firebaseAuth) throw new Error('Firebase Auth not configured');
    const decoded = await firebaseAuth.verifyIdToken(token);
    const uid = decoded.uid;
    let user = await fetchDocById('users', uid) as any;
    if (!user) {
      const now = new Date().toISOString();
      const mapped = {
        id: uid,
        fullName: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'User'),
        email: decoded.email || '',
        phone: decoded.phone_number || '',
        role: 'client' as UserRole,
        isVerified: !!decoded.email_verified,
        createdAt: now,
        updatedAt: now,
      };
      await insertDoc('users', mapped);
      user = mapped;
    }
    request.user = user as UserRecord;
    return next();
  } catch (err) {
    response.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
};

export const requireRoles = (...roles: UserRole[]) => (request: AuthRequest, response: Response, next: NextFunction) => {
  if (!request.user || !roles.includes(request.user.role)) {
    response.status(403).json({ code: 'FORBIDDEN', message: 'You do not have permission for this action' });
    return;
  }
  next();
};
