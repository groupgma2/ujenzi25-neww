// Seed module — populates the in-memory store with realistic demo data on first
// run so the dashboards, listings, portfolio and blog are populated for review.
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { users, resources, persist, type UserRecord, type UserRole } from './store.js';

const now = new Date().toISOString();

async function addUser(
  fullName: string,
  email: string,
  phone: string,
  password: string,
  role: UserRole,
): Promise<UserRecord> {
  const user: UserRecord = {
    id: randomUUID(),
    fullName,
    email,
    phone,
    passwordHash: await bcrypt.hash(password, 12),
    role,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  };
  users.set(user.id, user);
  return user;
}

function add(key: string, ownerId: string, data: Record<string, unknown>): void {
  const repo = resources.get(key);
  if (!repo) return;
  const id = (data.id as string) || randomUUID();
  repo.set(id, { id, ownerId, createdAt: now, updatedAt: now, ...data });
}

export async function seedIfEmpty(): Promise<void> {
  if (users.size > 0) return;

  const admin = await addUser('System Administrator', 'admin@ujenzi25.com', '+255 750 000 001', 'Admin@123', 'admin');
  const client = await addUser('Amina Juma', 'amina@example.com', '+255 750 000 002', 'Client@123', 'client');
  const partner = await addUser('BuildCo Supplies Ltd', 'supplier@buildco.co.tz', '+255 750 000 003', 'Partner@123', 'partner');

  // Real estate
  [
    { id: 'prop-001', type: 'residential', title: '3-Bedroom Modern House in Masaki', location: 'Masaki, Dar es Salaam', price: 450000000, size: '250 sqm', image: '/images/hero/real-estate.webp', verified: true, status: 'active', beds: 3, baths: 2 },
    { id: 'prop-002', type: 'land', title: 'Prime Plot in Mikocheni', location: 'Mikocheni, Dar es Salaam', price: 180000000, size: '400 sqm', image: '/images/hero/real-estate.webp', verified: true, status: 'active', beds: 0, baths: 0 },
    { id: 'prop-003', type: 'commercial', title: 'Office Building in the CBD', location: 'Kivukoni, Dar es Salaam', price: 1200000000, size: '900 sqm', image: '/images/hero/real-estate.webp', verified: true, status: 'active' },
    { id: 'prop-004', type: 'residential', title: 'Apartment in Upanga', location: 'Upanga, Dar es Salaam', price: 220000000, size: '120 sqm', image: '/images/hero/real-estate.webp', verified: false, status: 'under_offer' },
    { id: 'prop-005', type: 'farm', title: '10-Acre Farm in Morogoro', location: 'Morogoro', price: 95000000, size: '10 acres', image: '/images/hero/real-estate.webp', verified: true, status: 'active' },
    { id: 'prop-006', type: 'mixed', title: 'Mixed-Use Building in Mwanza', location: 'Nyamagana, Mwanza', price: 850000000, size: '600 sqm', image: '/images/hero/real-estate.webp', verified: true, status: 'active' },
  ].forEach((p) => add('properties', partner.id, p));

  // Rentals
  [
    { id: 'rent-001', title: '2-Bedroom Apartment in Sinza', location: 'Sinza, Dar es Salaam', rent: 850000, bedrooms: 2, bathrooms: 1, type: 'apartment', image: '/images/hero/rental.webp', verified: true, status: 'available' },
    { id: 'rent-002', title: 'Self-Contained Room in Mbezi', location: 'Mbezi Beach, Dar es Salaam', rent: 350000, bedrooms: 1, bathrooms: 1, type: 'rooms', image: '/images/hero/rental.webp', verified: true, status: 'available' },
    { id: 'rent-003', title: '4-Bedroom Family House in Arusha', location: 'Njiro, Arusha', rent: 1500000, bedrooms: 4, bathrooms: 3, type: 'house', image: '/images/hero/rental.webp', verified: false, status: 'booked' },
  ].forEach((r) => add('rentals', partner.id, r));

  // Hotels
  [
    { id: 'hotel-001', name: 'Serengeti View Lodge', location: 'Arusha', price: 120000, rating: 4.8, type: 'hotel', amenities: ['Free WiFi', 'Swimming Pool', 'Restaurant', 'Breakfast Included'], image: '/images/hero/hotels.webp', status: 'active' },
    { id: 'hotel-002', name: 'Zanzibar Beach Resort', location: 'Zanzibar', price: 180000, rating: 4.9, type: 'hotel', amenities: ['Swimming Pool', 'Sea View', 'Room Service'], image: '/images/hero/hotels.webp', status: 'active' },
    { id: 'hotel-003', name: 'Dar City Serviced Apartments', location: 'Dar es Salaam', price: 95000, rating: 4.5, type: 'apartment', amenities: ['Free WiFi', 'Gym', 'Parking'], image: '/images/hero/hotels.webp', status: 'active' },
  ].forEach((h) => add('hotels', partner.id, h));

  // Construction materials (products)
  [
    { id: 'prod-001', name: 'Portland Cement (50kg)', supplier: 'BuildCo Supplies', location: 'Dar es Salaam', price: 16500, unit: 'bag', availableQuantity: 500, grade: 'Grade 42.5', rating: 4.7, image: '/images/hero/construction.webp', category: 'building' },
    { id: 'prod-002', name: 'Steel Reinforcement Bar (12mm)', supplier: 'SteelWorks Ltd', location: 'Mwanza', price: 28000, unit: 'piece', availableQuantity: 1200, grade: 'Fe500', rating: 4.6, image: '/images/hero/construction.webp', category: 'building' },
    { id: 'prod-003', name: 'Electrical Cable (2.5mm²)', supplier: 'PowerTrade', location: 'Arusha', price: 145000, unit: 'roll', availableQuantity: 300, grade: 'Copper', rating: 4.5, image: '/images/hero/construction.webp', category: 'electrical' },
    { id: 'prod-004', name: 'Water Pump (1HP)', supplier: 'BuildCo Supplies', location: 'Dar es Salaam', price: 350000, unit: 'unit', availableQuantity: 80, grade: 'Industrial', rating: 4.8, image: '/images/hero/construction.webp', category: 'mechanical' },
    { id: 'prod-005', name: 'Roofing Sheets (3m)', supplier: 'RoofMaster', location: 'Mbeya', price: 32000, unit: 'sheet', availableQuantity: 2000, grade: 'Gauge 30', rating: 4.4, image: '/images/hero/construction.webp', category: 'building' },
  ].forEach((p) => add('products', partner.id, p));

  // Portfolio projects
  [
    { id: 'proj-001', title: 'Masaki Residential Tower', category: 'residential', location: 'Dar es Salaam', year: '2023', area: '4,500 sqm', image: '/images/hero/portfolio.webp', featured: true },
    { id: 'proj-002', title: 'Dodoma Government Office', category: 'institutional', location: 'Dodoma', year: '2022', area: '8,000 sqm', image: '/images/hero/portfolio.webp', featured: true },
    { id: 'proj-003', title: 'Arusha Shopping Complex', category: 'commercial', location: 'Arusha', year: '2024', area: '6,200 sqm', image: '/images/hero/portfolio.webp', featured: false },
  ].forEach((p) => add('projects', partner.id, p));

  // Blog articles
  [
    { id: 'blog-001', slug: 'cost-of-building-a-house-tz', title: 'How Much Does It Cost to Build a House in Tanzania?', excerpt: 'A detailed cost breakdown for residential construction across regions, from foundation to finishes.', content: 'Building a house in Tanzania involves several cost stages, from land preparation and foundation works to walling, roofing and finishes.', author: 'Eng. Robert Mwakalinga', category: 'cost-guides', readTime: 6, publishedAt: '2026-08-20', image: '/images/hero/blog.webp', featured: true },
    { id: 'blog-002', slug: 'choosing-building-materials', title: 'Choosing the Right Building Materials', excerpt: 'How to balance quality, durability and budget when sourcing cement, steel and finishes.', content: 'The quality of your materials determines the lifespan of your building. Learn what to check before you buy.', author: 'Arch. Fatima Hassan', category: 'how-to', readTime: 5, publishedAt: '2026-08-14', image: '/images/hero/blog.webp', featured: true },
    { id: 'blog-003', slug: 'real-estate-market-trends-2026', title: 'Real Estate Market Trends to Watch in 2026', excerpt: 'Where property prices are heading in Dar es Salaam, Dodoma and beyond.', content: 'The Tanzanian property market continues to grow, with new hotspots emerging in regional capitals.', author: 'Peter Kilonzo', category: 'market-insights', readTime: 4, publishedAt: '2026-08-08', image: '/images/hero/blog.webp', featured: false },
  ].forEach((b) => add('blogPosts', admin.id, b));

  // Consultations, orders, bookings
  [
    { id: 'cons-001', type: 'architectural', title: 'Residential House Plans', status: 'in_review', client: 'Amina Juma', assigned: null, date: '2026-09-02' },
    { id: 'cons-002', type: 'structural', title: 'Warehouse Structural Design', status: 'quoted', client: 'Amina Juma', assigned: 'Eng. Grace Mlay', date: '2026-09-01' },
  ].forEach((c) => add('consultations', client.id, c));

  [
    { id: 'ord-001', item: 'Portland Cement x50', supplier: 'BuildCo Supplies', status: 'processing', amount: 825000, date: '2026-09-05' },
    { id: 'ord-002', item: 'Roofing Sheets x100', supplier: 'RoofMaster', status: 'shipped', amount: 3200000, date: '2026-09-03' },
  ].forEach((o) => add('orders', client.id, o));

  [
    { id: 'book-001', property: 'Serengeti View Lodge', type: 'hotel', checkIn: '2026-10-01', checkOut: '2026-10-03', status: 'confirmed', amount: 240000 },
    { id: 'book-002', property: 'Zanzibar Beach Resort', type: 'hotel', checkIn: '2026-12-15', checkOut: '2026-12-20', status: 'pending', amount: 900000 },
  ].forEach((b) => add('bookings', client.id, b));

  persist();
  console.log('Seeded demo data — admin@ujenzi25.com / Admin@123 (plus client, partner, listings, projects, blog & activity)');
}
