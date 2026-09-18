import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createUser, loginUser, publicUser, registerUser, requireAuth, requireRoles, refreshAccessToken, verifyToken, type AuthRequest } from './auth.js';
import { resources, users, persist, hydrate } from './store.js';
import { seedIfEmpty } from './seed.js';
import { fetchTable, insertRecord, fetchRecordById, insertMessage, fetchMessagesByThread, fetchMessagesByContext, supabaseAdmin } from './supabase.js';
import { firestore, auth as firebaseAuth } from './firebase.js';

hydrate();
await seedIfEmpty();

const app = express();
app.disable('x-powered-by');
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:4173';

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('X-XSS-Protection', '0');
  response.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

const rateLimitMap = new Map<string, number[]>();
const rateLimiter = (windowMs = 15 * 60 * 1000, max = 20) =>
  (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const key = request.ip || request.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const hits = (rateLimitMap.get(key) || []).filter((t) => now - t < windowMs);
    if (hits.length >= max) {
      response.status(429).json({ code: 'RATE_LIMITED', message: 'Too many requests, please try again later' });
      return;
    }
    hits.push(now);
    rateLimitMap.set(key, hits);
    next();
  };

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: (typeof firestore !== 'undefined' && firestore) ? 'firestore' : 'local-store', timestamp: new Date().toISOString() });
});

const registrationSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(8),
  role: z.enum(['client', 'partner']).optional(),
});

app.post('/api/auth/register', rateLimiter(), async (request, response) => {
  const parsed = registrationSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Please provide valid registration details', details: parsed.error.flatten() });
    return;
  }
  try {
    const result = await registerUser(parsed.data);
    persist();
    response.status(201).json(result);
  } catch (error) {
    response.status(409).json({ code: 'ACCOUNT_EXISTS', message: error instanceof Error ? error.message : 'Registration failed' });
  }
});

app.post('/api/auth/login', rateLimiter(), async (request, response) => {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email and password are required' });
    return;
  }
  try {
    response.json(await loginUser(parsed.data.email, parsed.data.password));
  } catch (error) {
    response.status(401).json({ code: 'UNAUTHORIZED', message: error instanceof Error ? error.message : 'Login failed' });
  }
});

app.post('/api/auth/logout', requireAuth, (_request, response) => response.status(204).send());
app.get('/api/auth/me', requireAuth, (request: AuthRequest, response) => response.json(publicUser(request.user!)));
app.get('/api/users', requireAuth, requireRoles('admin'), (_request, response) => {
  response.json({ data: [...users.values()].map(publicUser), meta: { total: users.size, page: 1, limit: users.size } });
});

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(8),
  role: z.enum(['client', 'partner', 'company', 'admin']),
});

app.post('/api/users', requireAuth, requireRoles('admin'), async (request, response) => {
  const parsed = createUserSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Please provide valid user details', details: parsed.error.flatten() });
    return;
  }
  try {
    const user = await createUser(parsed.data);
    persist();
    response.status(201).json(user);
  } catch (error) {
    response.status(409).json({ code: 'ACCOUNT_EXISTS', message: error instanceof Error ? error.message : 'Failed to create user' });
  }
});

app.post('/api/auth/refresh', (request, response) => {
  const { refreshToken } = request.body || {};
  if (!refreshToken) {
    response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Refresh token is required' });
    return;
  }
  try {
    response.json(refreshAccessToken(refreshToken));
  } catch {
    response.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' });
  }
});

// ==================== PLATFORM SERVICES (workflows + shared services) ====================

const notify = (userId: string, type: string, title: string, message: string, data?: Record<string, unknown>) => {
  const repo = resources.get('notifications')!;
  const id = randomUUID();
  const now = new Date().toISOString();
  repo.set(id, { id, ownerId: userId, type, title, message, data: data || {}, readAt: null, createdAt: now, updatedAt: now });
};

const notifyRoles = (roles: string[], type: string, title: string, message: string, data?: Record<string, unknown>) => {
  for (const user of users.values()) {
    if (roles.includes(user.role)) notify(user.id, type, title, message, data);
  }
};

const isStaff = (role: string) => role === 'admin' || role === 'company';

// Serve frontend build (if present) so backend can host the entire site from a single deployment
import fs from 'fs';
import path from 'path';
const frontendDist = path.resolve(__dirname, '../../dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // For SPA client-side routing, return index.html for any non-API route
  app.get(/^((?!\/api).)*$/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  console.warn('Frontend build not found at', frontendDist, '- backend will still serve API routes.');
}


// -------- Consultation workflow --------
app.post('/api/consultation/requests', requireAuth, (request: AuthRequest, response) => {
  const { type, title, description } = request.body || {};
  if (!type || !title) {
    response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Type and title are required' });
    return;
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  const record = {
    id, ownerId: request.user!.id, clientId: request.user!.id, clientName: request.user!.fullName,
    type, title, description: description || '', status: 'submitted', assignedTo: null, quote: null,
    createdAt: now, updatedAt: now,
  };
  resources.get('consultations')!.set(id, record);
  notifyRoles(['admin', 'company'], 'consultation_new', 'New consultation request', `${request.user!.fullName} submitted "${title}"`, { id });
  persist();
  response.status(201).json(record);
});

app.get('/api/consultation/requests', requireAuth, (request: AuthRequest, response) => {
  const all = [...resources.get('consultations')!.values()] as any[];
  const data = isStaff(request.user!.role) ? all : all.filter((r) => r.clientId === request.user!.id);
  response.json({ data, meta: { total: data.length, page: 1, limit: data.length } });
});

app.post('/api/consultation/requests/:id/quote', requireAuth, requireRoles('admin', 'company'), (request: AuthRequest, response) => {
  const record = resources.get('consultations')!.get(String(request.params.id)) as any;
  if (!record) { response.status(404).json({ code: 'NOT_FOUND', message: 'Request not found' }); return; }
  const { amount, currency, notes } = request.body || {};
  record.quote = { amount, currency: currency || 'TZS', notes: notes || '', createdAt: new Date().toISOString() };
  record.status = 'quoted';
  record.updatedAt = new Date().toISOString();
  resources.get('consultations')!.set(record.id, record);
  notify(record.clientId, 'quote_received', 'Quotation ready', `A quotation for "${record.title}" is ready for your review`, { id: record.id });
  persist();
  response.json(record);
});

app.post('/api/consultation/requests/:id/accept', requireAuth, (request: AuthRequest, response) => {
  const record = resources.get('consultations')!.get(String(request.params.id)) as any;
  if (!record) { response.status(404).json({ code: 'NOT_FOUND', message: 'Request not found' }); return; }
  if (record.clientId !== request.user!.id) { response.status(403).json({ code: 'FORBIDDEN', message: 'Only the client can accept this request' }); return; }
  record.status = 'in_progress';
  record.updatedAt = new Date().toISOString();
  resources.get('consultations')!.set(record.id, record);
  notifyRoles(['admin', 'company'], 'consultation_accepted', 'Quotation accepted', `${request.user!.fullName} accepted the quotation for "${record.title}"`, { id: record.id });
  persist();
  response.json(record);
});

app.post('/api/consultation/requests/:id/reject', requireAuth, (request: AuthRequest, response) => {
  const record = resources.get('consultations')!.get(String(request.params.id)) as any;
  if (!record) { response.status(404).json({ code: 'NOT_FOUND', message: 'Request not found' }); return; }
  if (record.clientId !== request.user!.id) { response.status(403).json({ code: 'FORBIDDEN', message: 'Only the client can reject this request' }); return; }
  record.status = 'rejected';
  record.updatedAt = new Date().toISOString();
  resources.get('consultations')!.set(record.id, record);
  notifyRoles(['admin', 'company'], 'consultation_rejected', 'Quotation rejected', `${request.user!.fullName} rejected the quotation for "${record.title}"`, { id: record.id });
  persist();
  response.json(record);
});

app.post('/api/consultation/requests/:id/deliver', requireAuth, requireRoles('admin', 'company'), (request: AuthRequest, response) => {
  const record = resources.get('consultations')!.get(String(request.params.id)) as any;
  if (!record) { response.status(404).json({ code: 'NOT_FOUND', message: 'Request not found' }); return; }
  record.status = 'delivered';
  record.updatedAt = new Date().toISOString();
  resources.get('consultations')!.set(record.id, record);
  notify(record.clientId, 'consultation_delivered', 'Work delivered', `Your consultation "${record.title}" has been delivered`, { id: record.id });
  persist();
  response.json(record);
});

app.post('/api/consultation/requests/:id/complete', requireAuth, requireRoles('admin', 'company'), (request: AuthRequest, response) => {
  const record = resources.get('consultations')!.get(String(request.params.id)) as any;
  if (!record) { response.status(404).json({ code: 'NOT_FOUND', message: 'Request not found' }); return; }
  record.status = 'completed';
  record.updatedAt = new Date().toISOString();
  resources.get('consultations')!.set(record.id, record);
  notify(record.clientId, 'consultation_completed', 'Work completed', `Your consultation "${record.title}" is complete`, { id: record.id });
  persist();
  response.json(record);
});

app.post('/api/consultation/requests/:id/assign', requireAuth, requireRoles('admin', 'company'), (request: AuthRequest, response) => {
  const record = resources.get('consultations')!.get(String(request.params.id)) as any;
  if (!record) { response.status(404).json({ code: 'NOT_FOUND', message: 'Request not found' }); return; }
  record.assignedTo = (request.body || {}).consultant || request.user!.fullName;
  record.status = record.status === 'submitted' ? 'in_review' : record.status;
  record.updatedAt = new Date().toISOString();
  resources.get('consultations')!.set(record.id, record);
  persist();
  response.json(record);
});

// -------- Generic status transition (orders, labourJobs, bookings) --------
app.patch('/api/:resource/:id/status', requireAuth, (request: AuthRequest, response) => {
  const repo = resources.get(String(request.params.resource));
  if (!repo) { response.status(404).json({ code: 'NOT_FOUND', message: 'Resource not found' }); return; }
  const record = repo.get(String(request.params.id)) as any;
  if (!record) { response.status(404).json({ code: 'NOT_FOUND', message: 'Record not found' }); return; }
  const { status } = request.body || {};
  if (!status) { response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Status is required' }); return; }
  record.status = status;
  record.updatedAt = new Date().toISOString();
  repo.set(record.id, record);
  if (record.clientId) notify(record.clientId, 'status_changed', 'Status updated', `"${record.title || record.item || record.property || record.id}" is now ${status}`, { id: record.id });
  persist();
  response.json(record);
});

// -------- Messaging (threads + messages) --------
app.post('/api/messages', requireAuth, async (request: AuthRequest, response) => {
  const { threadId, receiverId, content, contextType, contextId } = request.body || {};
  if (!content) { response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Message content is required' }); return; }
  try {
    const saved = await insertMessage({
      sender_id: request.user!.id,
      receiver_id: receiverId || null,
      content,
      thread_id: threadId ?? randomUUID(),
      context_type: contextType ?? null,
      context_id: contextId ?? null,
    });

    if (receiverId) notify(receiverId, 'message_new', 'New message', `${request.user!.fullName} sent you a message`, { threadId: saved.thread_id });
    response.status(201).json(saved);
  } catch (err) {
    console.error('Failed to save message to Supabase:', err);
    response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to save message' });
  }
});

app.get('/api/messages/threads', requireAuth, async (request: AuthRequest, response) => {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
    const userId = request.user!.id;
    const { data, error } = await supabaseAdmin.from('messages').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    if (error) throw error;
    const mine = data ?? [];
    const threads = new Map<string, any>();
    for (const m of mine) {
      if (!threads.has(m.thread_id)) threads.set(m.thread_id, m);
    }
    const values = [...threads.values()];
    response.json({ data: values, meta: { total: values.length, page: 1, limit: values.length } });
  } catch (err) {
    console.error('Failed to fetch message threads:', err);
    response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch threads' });
  }
});

app.get('/api/messages/threads/:id', requireAuth, async (request: AuthRequest, response) => {
  try {
    const threadId = String(request.params.id);
    const messages = await fetchMessagesByThread(threadId);
    response.json({ data: messages, meta: { total: messages.length, page: 1, limit: messages.length } });
  } catch (err) {
    console.error('Failed to fetch thread messages:', err);
    response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch messages' });
  }
});

// -------- Payments --------
app.post('/api/payments', requireAuth, async (request: AuthRequest, response) => {
  const { amount, currency, method, contextType, contextId } = request.body || {};
  if (!amount) { response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Amount is required' }); return; }
  try {
    const now = new Date().toISOString();
    const payload = { owner_id: request.user!.id, amount, currency: currency || 'TZS', method: method || 'mpesa', status: 'pending', reference: 'TXN-' + randomUUID().slice(0, 8).toUpperCase(), context_type: contextType || null, context_id: contextId || null, created_at: now, updated_at: now } as any;
    if (supabaseAdmin) {
      const saved = await insertRecord('payments', payload);
      return response.status(201).json(saved);
    }

    const id = randomUUID();
    const record = { id, ownerId: request.user!.id, amount, currency: currency || 'TZS', method: method || 'mpesa', status: 'pending', reference: payload.reference, contextType: contextType || null, contextId: contextId || null, createdAt: now, updatedAt: now };
    resources.get('payments')!.set(id, record);
    persist();
    response.status(201).json(record);
  } catch (err) {
    console.error('Failed to create payment:', err);
    response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to create payment' });
  }
});

app.post('/api/payments/:id/pay', requireAuth, async (request: AuthRequest, response) => {
  try {
    const id = String(request.params.id);
    if (supabaseAdmin) {
      // update record in Supabase
      const { data, error } = await supabaseAdmin.from('payments').update({ status: 'paid', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) { response.status(404).json({ code: 'NOT_FOUND', message: 'Payment not found' }); return; }
      return response.json(data[0]);
    }

    const record = resources.get('payments')!.get(id) as any;
    if (!record) { response.status(404).json({ code: 'NOT_FOUND', message: 'Payment not found' }); return; }
    record.status = 'paid';
    record.completedAt = new Date().toISOString();
    record.updatedAt = new Date().toISOString();
    resources.get('payments')!.set(record.id, record);
    persist();
    response.json(record);
  } catch (err) {
    console.error('Failed to mark payment paid:', err);
    response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to update payment' });
  }
});

// -------- Reviews --------
app.post('/api/reviews', requireAuth, (request: AuthRequest, response) => {
  const { targetId, targetType, rating, comment } = request.body || {};
  if (!targetId || !rating) { response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Target and rating are required' }); return; }
  const id = randomUUID();
  const now = new Date().toISOString();
  const record = { id, ownerId: request.user!.id, authorId: request.user!.id, targetId, targetType: targetType || 'partner', rating, comment: comment || '', createdAt: now, updatedAt: now };
  resources.get('reviews')!.set(id, record);
  persist();
  response.status(201).json(record);
});

// -------- Global search --------
app.post('/api/search', requireAuth, (request: AuthRequest, response) => {
  const { query } = request.body || {};
  if (!query) { response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Query is required' }); return; }
  const q = String(query).toLowerCase();
  const searchable = ['properties', 'rentals', 'hotels', 'products', 'labourJobs', 'projects', 'blogPosts'];
  const results: any[] = [];
  for (const key of searchable) {
    const repo = resources.get(key)!;
    for (const record of repo.values() as any) {
      const haystack = JSON.stringify(record).toLowerCase();
      if (haystack.includes(q)) results.push({ resource: key, id: record.id, title: record.title || record.name || record.id, location: record.location || null });
    }
  }
  response.json({ data: results.slice(0, 50), meta: { total: results.length } });
});

const resourceNames = ['properties', 'rentals', 'hotels', 'products', 'labourJobs', 'labourTeams', 'projects', 'blogPosts', 'consultations', 'orders', 'bookings', 'messages', 'notifications', 'reviews', 'payments'] as const;
const publicResources = new Set(['properties', 'rentals', 'hotels', 'products', 'labourJobs', 'labourTeams', 'projects', 'blogPosts']);
const internalResources = new Set(['products', 'labourJobs', 'labourTeams', 'consultations']);
const resourceParam = z.enum(resourceNames);

app.get('/api/:resource', async (request, response) => {
  const parsed = resourceParam.safeParse(request.params.resource);
  if (!parsed.success) {
    response.status(404).json({ code: 'NOT_FOUND', message: 'Resource not found' });
    return;
  }

  try {
    // If public resource, return all from Supabase (or fallback to local if Supabase not configured)
    if (publicResources.has(parsed.data)) {
      if (supabaseAdmin) {
        const data = await fetchTable(parsed.data);
        return response.json({ data, meta: { total: data.length, page: 1, limit: data.length } });
      }
      const repo = resources.get(parsed.data)!;
      const all = [...repo.values()];
      return response.json({ data: all, meta: { total: all.length, page: 1, limit: all.length } });
    }

    // Private resource: require authentication
    await new Promise<void>((resolve: any) => requireAuth(request as any, response as any, resolve as any));
    if (response.headersSent) return;
    const viewer = (request as AuthRequest).user!;

    const staff = viewer && (viewer.role === 'admin' || viewer.role === 'company');
    const privateKeys = new Set(['consultations', 'orders', 'bookings', 'messages', 'notifications', 'payments']);

    if (supabaseAdmin) {
      if (staff) {
        const data = await fetchTable(parsed.data);
        return response.json({ data, meta: { total: data.length, page: 1, limit: data.length } });
      } else if (privateKeys.has(parsed.data)) {
        const data = await fetchTable(parsed.data, { ownerId: viewer.id });
        return response.json({ data, meta: { total: data.length, page: 1, limit: data.length } });
      } else {
        const data = await fetchTable(parsed.data);
        return response.json({ data, meta: { total: data.length, page: 1, limit: data.length } });
      }
    }

    // Fallback to local store
    const repository = resources.get(parsed.data)!;
    const all = [...repository.values()];
    const data = privateKeys.has(parsed.data) && viewer && !staff
      ? all.filter((r: any) => r.ownerId === viewer.id)
      : all;
    response.json({ data, meta: { total: data.length, page: 1, limit: data.length } });
  } catch (err) {
    console.error('Failed to fetch resource from Supabase:', err);
    response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch resource' });
  }
});

app.post('/api/:resource', requireAuth, async (request: AuthRequest, response) => {
  const parsed = resourceParam.safeParse(request.params.resource);
  if (!parsed.success) {
    response.status(404).json({ code: 'NOT_FOUND', message: 'Resource not found' });
    return;
  }
  if (internalResources.has(parsed.data)) {
    const role = request.user!.role;
    if (role !== 'admin' && role !== 'company') {
      response.status(403).json({ code: 'FORBIDDEN', message: 'Only admin and staff can manage this resource' });
      return;
    }
  }

  try {
    const now = new Date().toISOString();
    const payload = { ...request.body, owner_id: request.user!.id, created_at: now, updated_at: now } as any;
    if (supabaseAdmin) {
      const saved = await insertRecord(parsed.data, payload);
      return response.status(201).json(saved);
    }

    // Fallback to local store
    const record = { ...request.body, id: randomUUID(), ownerId: request.user!.id, createdAt: now, updatedAt: now };
    resources.get(parsed.data)!.set(record.id, record);
    persist();
    response.status(201).json(record);
  } catch (err) {
    console.error('Failed to create resource in Supabase:', err);
    response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to create resource' });
  }
});

app.get('/api/:resource/:id', requireAuth, async (request, response) => {
  const parsed = resourceParam.safeParse(request.params.resource);
  try {
    if (supabaseAdmin && parsed.success) {
      const rec = await fetchRecordById(parsed.data, String(request.params.id));
      if (!rec) { response.status(404).json({ code: 'NOT_FOUND', message: 'Record not found' }); return; }
      return response.json(rec);
    }

    const repository = parsed.success ? resources.get(parsed.data) : undefined;
    const record = repository?.get(String(request.params.id));
    if (!record) { response.status(404).json({ code: 'NOT_FOUND', message: 'Record not found' }); return; }
    response.json(record);
  } catch (err) {
    console.error('Failed to fetch resource by id:', err);
    response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch record' });
  }
});

app.use((_request, response) => response.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' }));

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong' });
});

const server = app.listen(port, '0.0.0.0', () => console.log(`UJENZI 25 API listening on http://localhost:${port}`));

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
