import 'dotenv/config';
import { insertRecord } from '../supabase.js';

async function run() {
  try {
    const now = new Date().toISOString();
    const payload = {
      title: 'AUTOTEST PROPERTY - DO NOT KEEP',
      owner_id: null,
      type: 'test',
      location: 'local-run',
      latitude: 0,
      longitude: 0,
      price: 0,
      size: '0 m2',
      description: 'Automated test insert to verify Supabase connectivity',
      image_url: null,
      verified: false,
      created_at: now,
      updated_at: now,
    };

    const inserted = await insertRecord('properties', payload);
    console.log('INSERT_SUCCESS', inserted);
  } catch (err) {
    console.error('INSERT_FAILED', err);
    process.exit(1);
  }
}

run();
