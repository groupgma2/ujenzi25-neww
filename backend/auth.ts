import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { findUserByEmail, users, type UserRecord, type UserRole } from './store.js';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET is required in production'); })() : 'development-only-secret');

export const publicUser = (user: UserRecord) => {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

export const createToken = (user: UserRecord) =>
  jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

export const createRefreshToken = (user: UserRecord) =>
  jwt.sign({ sub: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string): UserRecord | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return typeof payload.sub === 'string' ? (users.get(payload.sub) ?? null) : null;
  } catch {
    return null;
  }
};

export const refreshAccessToken = (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;
  if (payload.type !== 'refresh') throw new Error('Invalid refresh token');
  const user = typeof payload.sub === 'string' ? users.get(payload.sub) : undefined;
  if (!user) throw new Error('Invalid refresh token');
  return { token: createToken(user), refreshToken: createRefreshToken(user) };
};

export const createUser = async (input: { fullName: string; email: string; phone: string; password: string; role: UserRole }) => {
  const email = input.email.trim().toLowerCase();
  if (findUserByEmail(email)) {
    throw new Error('An account with this email already exists');
  }
  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    passwordHash: await bcrypt.hash(input.password, 12),
    role: input.role,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  };
  users.set(user.id, user);
  return publicUser(user);
};

export const registerUser = async (input: { fullName: string; email: string; phone: string; password: string; role?: UserRole }) => {
  const email = input.email.trim().toLowerCase();
  if (findUserByEmail(email)) {
    throw new Error('An account with this email already exists');
  }

  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    passwordHash: await bcrypt.hash(input.password, 12),
    role: input.role === 'partner' ? 'partner' : 'client',
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  };

  users.set(user.id, user);
  return { user: publicUser(user), token: createToken(user), refreshToken: createRefreshToken(user) };
};

export const loginUser = async (email: string, password: string) => {
  const user = findUserByEmail(email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('Invalid email or password');
  }
  return { user: publicUser(user), token: createToken(user), refreshToken: createRefreshToken(user) };
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

  // Try local JWT first
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const user = typeof payload.sub === 'string' ? users.get(payload.sub) : undefined;
    if (!user) throw new Error('User not found');
    request.user = user;
    return next();
  } catch {
    // fall through to Supabase token validation below
  }

  // Try Supabase access token verification (server-side check)
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) throw new Error('Supabase URL not configured');

    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.VITE_SUPABASE_ANON_KEY ?? '',
      },
    });
    if (!res.ok) throw new Error('Supabase token invalid');
    const body = await res.json();
    const supUser = body;
    if (!supUser || !supUser.id) throw new Error('Supabase user not found');

    // Map Supabase user to local UserRecord shape for request handling
    const meta = (supUser.user_metadata || {}) as any;
    const mapped: UserRecord = {
      id: supUser.id,
      fullName: meta.full_name || supUser.email?.split('@')[0] || 'User',
      email: supUser.email || '',
      phone: meta.phone || '',
      passwordHash: '', // unknown on Supabase
      role: (meta.role && (['client','partner','company','admin'] as string[]).includes(meta.role)) ? (meta.role as UserRole) : 'client',
      isVerified: true,
      createdAt: supUser.created_at || new Date().toISOString(),
      updatedAt: supUser.updated_at || supUser.created_at || new Date().toISOString(),
    };

    // insert into local map if missing (optional, keep persistence)
    if (!users.has(mapped.id)) users.set(mapped.id, mapped);

    request.user = mapped;
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
