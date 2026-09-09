export type UserRole = 'client' | 'company' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  agreeTerms: boolean;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  nameSw: string;
  description: string;
  descriptionSw: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'consultation',
    slug: 'consultation',
    name: 'Consultation (Civil Works)',
    nameSw: 'Ushauri (Kazi za Miji)',
    description: 'Architectural, structural & services drawings, BoQ, construction management',
    descriptionSw: 'Mchoro wa kiarkitektcha, kistruktcha & huduma, BoQ, usimamizi wa ujenzi',
    icon: 'drafting',
    color: '#ea6d32',
    isActive: true,
    order: 1,
  },
  {
    id: 'construction',
    slug: 'construction',
    name: 'Construction (Labour & Materials)',
    nameSw: 'Ujenzi (Wafanyikazi & Vifaa)',
    description: 'Building materials marketplace & labour job board',
    descriptionSw: 'Soko la vifaa vya ujenzi & orodha ya kazi za wafanyikazi',
    icon: 'hammer',
    color: '#1a1a2e',
    isActive: true,
    order: 2,
  },
  {
    id: 'real-estate',
    slug: 'real-estate',
    name: 'Real Estate & Property Development',
    nameSw: 'Nyumba & Maendeleo ya Mali',
    description: 'Property listings, verification, acquisition & development',
    descriptionSw: 'Orodha ya mali, uthibitishaji, ununuzi & maendeleo',
    icon: 'building',
    color: '#00b4d8',
    isActive: true,
    order: 3,
  },
  {
    id: 'rental',
    slug: 'rental',
    name: 'Rental Housing',
    nameSw: 'Nyumba za Kukodiwa',
    description: 'Long-term rental listings with verified landlords',
    descriptionSw: 'Orodha za nyumba za kukodiwa kwa muda mrefu na wamiliki waliothibitishwa',
    icon: 'home',
    color: '#10b981',
    isActive: true,
    order: 4,
  },
  {
    id: 'hotels',
    slug: 'hotels',
    name: 'Hotels & Airbnb',
    nameSw: 'Hoteli & Airbnb',
    description: 'Short-term bookings with live availability',
    descriptionSw: 'Utekelezaji wa muda mfupi na uwepo wa haraka',
    icon: 'bed',
    color: '#f59e0b',
    isActive: true,
    order: 5,
  },
];

export type DrawingType = 'architectural' | 'structural' | 'services' | 'boq';
export type DrawingStatus = 'submitted' | 'in_review' | 'quoted' | 'in_progress' | 'delivered' | 'revision_requested';

export interface DrawingRequest {
  id: string;
  clientId: string;
  type: DrawingType;
  title: string;
  description: string;
  attachments: Attachment[];
  status: DrawingStatus;
  quote?: Quote;
  assignedConsultant?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'video' | 'document';
  size: number;
  isWatermarked?: boolean;
}

export interface Quote {
  id: string;
  requestId: string;
  amount: number;
  currency: 'TZS' | 'USD';
  breakdown: QuoteItem[];
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
}

export interface QuoteItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export type MaterialCategory = 'building' | 'electrical' | 'mechanical' | 'ict';

export interface Material {
  id: string;
  supplierId: string;
  category: MaterialCategory;
  name: string;
  description: string;
  specifications: string;
  grade: string;
  unit: string;
  price: number;
  currency: 'TZS' | 'USD';
  stock: number;
  images: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface MaterialOrder {
  id: string;
  clientId: string;
  items: OrderItem[];
  deliveryAddress: Address;
  deliveryCoordinates?: Coordinates;
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  materialId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';

export type LabourCategory = 'concrete' | 'walling' | 'formwork' | 'steel_fixing' | 'roofing' | 'finishing' | 'plumbing' | 'electrical';

export interface LabourJob {
  id: string;
  clientId: string;
  category: LabourCategory;
  title: string;
  description: string;
  scopeOfWork: string;
  location: Address;
  coordinates?: Coordinates;
  attachments: Attachment[];
  budgetRange?: { min: number; max: number };
  status: LabourJobStatus;
  assignedTeam?: string;
  createdAt: string;
  updatedAt: string;
}

export type LabourJobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface Property {
  id: string;
  partnerId: string;
  type: 'land' | 'farm' | 'residential' | 'commercial' | 'mixed';
  title: string;
  description: string;
  price: number;
  currency: 'TZS' | 'USD';
  priceType: 'fixed' | 'negotiable';
  location: Address;
  coordinates?: Coordinates;
  area: number;
  areaUnit: 'sqm' | 'acre' | 'hectare';
  images: string[];
  documents: Document[];
  isVerified: boolean;
  verificationBadge?: VerificationBadge;
  status: PropertyStatus;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: 'title_deed' | 'survey_plan' | 'valuation' | 'other';
  isVerified: boolean;
}

export interface VerificationBadge {
  level: 'basic' | 'verified' | 'premium';
  verifiedBy: string;
  verifiedAt: string;
  notes?: string;
}

export type PropertyStatus = 'draft' | 'active' | 'under_offer' | 'sold' | 'archived';

export interface RentalProperty {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  houseType: 'rooms' | 'apartment' | 'house' | 'hostel';
  bedrooms: number;
  bathrooms: number;
  rent: number;
  currency: 'TZS' | 'USD';
  deposit: number;
  location: Address;
  coordinates?: Coordinates;
  images: string[];
  videos: string[];
  amenities: string[];
  houseRules: string;
  availabilityDate: string;
  status: RentalStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RentalStatus = 'available' | 'booked' | 'occupied' | 'maintenance' | 'archived';

export interface HotelProperty {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  type: 'hotel' | 'apartment' | 'villa' | 'cottage';
  location: Address;
  coordinates?: Coordinates;
  images: string[];
  amenities: string[];
  policies: HotelPolicy[];
  rooms: HotelRoom[];
  rating: number;
  reviewCount: number;
  status: HotelStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HotelPolicy {
  checkIn: string;
  checkOut: string;
  cancellationPolicy: string;
  houseRules: string[];
  childrenAllowed: boolean;
  petsAllowed: boolean;
}

export interface HotelRoom {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  type: 'single' | 'double' | 'suite' | 'apartment';
  capacity: number;
  pricePerNight: number;
  currency: 'TZS' | 'USD';
  amenities: string[];
  images: string[];
  availability: Availability[];
}

export interface Availability {
  date: string;
  isAvailable: boolean;
  priceOverride?: number;
}

export type HotelStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface Address {
  street?: string;
  ward: string;
  district: string;
  region: string;
  country: string;
  formatted: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments: Attachment[];
  readAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export type NotificationType =
  | 'drawing_update'
  | 'quote_received'
  | 'order_update'
  | 'job_application'
  | 'booking_request'
  | 'payment_received'
  | 'review_received'
  | 'system';

export interface Review {
  id: string;
  authorId: string;
  targetId: string;
  targetType: 'partner' | 'property' | 'hotel' | 'labour_team';
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: 'TZS' | 'USD';
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

export type PaymentMethod = 'mpesa' | 'tigo_pesa' | 'airtel_money' | 'bank_transfer' | 'card';

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type Language = 'en' | 'sw';

export interface TranslationKeys {
  [key: string]: string | TranslationKeys;
}