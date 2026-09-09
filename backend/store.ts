import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type UserRole = 'client' | 'partner' | 'company' | 'admin';

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceRecord {
  id: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export const users = new Map<string, UserRecord>();
export const resources = new Map<string, Map<string, ResourceRecord>>([
  ['properties', new Map()],
  ['rentals', new Map()],
  ['hotels', new Map()],
  ['products', new Map()],
  ['labourJobs', new Map()],
  ['labourTeams', new Map()],
  ['projects', new Map()],
  ['blogPosts', new Map()],
  ['consultations', new Map()],
  ['orders', new Map()],
  ['bookings', new Map()],
  ['messages', new Map()],
  ['notifications', new Map()],
  ['reviews', new Map()],
  ['payments', new Map()],
]);

export const findUserByEmail = (email: string) =>
  [...users.values()].find((user) => user.email === email.toLowerCase());

const DATA_FILE = join(process.cwd(), 'data', 'store.json');

export const persist = () => {
  try {
    mkdirSync(join(process.cwd(), 'data'), { recursive: true });
    const snapshot = {
      users: [...users.values()],
      resources: Object.fromEntries([...resources.entries()].map(([k, m]) => [k, [...m.values()]])),
    };
    writeFileSync(DATA_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to persist store:', error);
  }
};

export const hydrate = () => {
  try {
    if (!existsSync(DATA_FILE)) return;
    const snapshot = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    for (const u of snapshot.users || []) {
      if (u && u.id) users.set(u.id, u);
    }
    for (const [key, records] of Object.entries(snapshot.resources || {})) {
      const repo = resources.get(key);
      if (!repo || !Array.isArray(records)) continue;
      for (const r of records) {
        if (r && r.id) repo.set(r.id, r);
      }
    }
    console.log('Store hydrated from ' + DATA_FILE);
  } catch (error) {
    console.error('Failed to hydrate store:', error);
  }
};
