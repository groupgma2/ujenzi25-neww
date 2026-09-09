export const APP_NAME = 'UJENZI 25';
export const APP_TAGLINE = 'Your Trusted Construction & Property Partner';
export const APP_TAGLINE_SW = 'Mshirika Wako wa Uaminifu wa Ujenzi na Mali';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  CONSULTATION: '/consultation',
  CONSULTATION_REQUEST: '/consultation/request',
  CONSULTATION_MY_REQUESTS: '/consultation/my-requests',
  CONSULTATION_DETAIL: '/consultation/:id',

  CONSTRUCTION: '/construction',
  CONSTRUCTION_MATERIALS: '/construction/materials',
  CONSTRUCTION_MATERIAL_DETAIL: '/construction/materials/:id',
  CONSTRUCTION_LABOUR: '/construction/labour',
  CONSTRUCTION_LABOUR_DETAIL: '/construction/labour/:id',
  CONSTRUCTION_MY_ORDERS: '/construction/my-orders',
  CONSTRUCTION_POST_JOB: '/construction/post-job',

  REAL_ESTATE: '/real-estate',
  REAL_ESTATE_LISTINGS: '/real-estate/listings',
  REAL_ESTATE_DETAIL: '/real-estate/:id',
  REAL_ESTATE_MY_LISTINGS: '/real-estate/my-listings',
  REAL_ESTATE_ADD: '/real-estate/add',

  RENTAL: '/rental',
  RENTAL_LISTINGS: '/rental/listings',
  RENTAL_DETAIL: '/rental/:id',
  RENTAL_MY_LISTINGS: '/rental/my-listings',
  RENTAL_ADD: '/rental/add',

  HOTELS: '/hotels',
  HOTELS_LISTINGS: '/hotels/listings',
  HOTELS_DETAIL: '/hotels/:id',
  HOTELS_MY_LISTINGS: '/hotels/my-listings',
  HOTELS_ADD: '/hotels/add',
  HOTELS_BOOKING: '/hotels/:id/booking',

  PORTFOLIO: '/portfolio',
  PORTFOLIO_DETAIL: '/portfolio/:id',

  BLOG: '/blog',
  BLOG_DETAIL: '/blog/:slug',

  ABOUT: '/about',
  CONTACT: '/contact',
  CAREERS: '/careers',

  DASHBOARD: '/dashboard',
  DASHBOARD_CLIENT: '/dashboard/client',
  DASHBOARD_PARTNER: '/dashboard/partner',
  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_STAFF: '/dashboard/staff',

  SETTINGS: '/settings',
  PROFILE: '/profile',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  PAYMENTS: '/payments',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ujenzi25_auth_token',
  REFRESH_TOKEN: 'ujenzi25_refresh_token',
  USER: 'ujenzi25_user',
  LANGUAGE: 'ujenzi25_language',
  THEME: 'ujenzi25_theme',
  CART: 'ujenzi25_cart',
  RECENT_SEARCHES: 'ujenzi25_recent_searches',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4', '.webm'],
} as const;

export const PAYMENT_METHODS = [
  { id: 'mpesa', name: 'M-Pesa', icon: 'mpesa', color: '#00a651' },
  { id: 'tigo_pesa', name: 'Tigo Pesa', icon: 'tigo', color: '#0066cc' },
  { id: 'airtel_money', name: 'Airtel Money', icon: 'airtel', color: '#e60000' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'bank', color: '#1a1a2e' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'card', color: '#6366f1' },
] as const;

export const REGIONS_TZ = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma',
  'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza',
  'Njombe', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe',
  'Tabora', 'Tanga', 'Kaskazini Pemba', 'Kaskazini Unguja', 'Kusini Pemba', 'Kusini Unguja',
  'Mjini Magharibi',
] as const;

export const DISTRICTS_BY_REGION: Record<string, string[]> = {
  'Dar es Salaam': ['Ilala', 'Kigamboni', 'Kinondoni', 'Temeke', 'Ubungo'],
  'Arusha': ['Arusha City', 'Arusha Rural', 'Karatu', 'Longido', 'Meru', 'Monduli', 'Ngorongoro'],
  'Mwanza': ['Ilemela', 'Kwimba', 'Magu', 'Misungwi', 'Nyamagana', 'Sengerema', 'Ukerewe'],
  'Dodoma': ['Bahi', 'Chamwino', 'Chemba', 'Dodoma City', 'Kondoa', 'Kongwa', 'Mpwapwa'],
  'Mbeya': ['Busokelo', 'Chunya', 'Kyela', 'Mbarali', 'Mbeya City', 'Mbeya Rural', 'Rungwe'],
};

export const AMENITIES = {
  rental: [
    'Water Supply', 'Electricity', 'Parking', 'Security', 'Garden', 'Balcony',
    'Wardrobes', 'Kitchen', 'Living Room', 'Dining Area', 'Laundry Area',
    'Backup Generator', 'Solar Power', 'Borehole', 'Septic Tank', 'Fence',
    'CCTV', 'Intercom', 'WiFi Ready', 'Air Conditioning', 'Water Heater',
  ],
  hotel: [
    'Free WiFi', 'Air Conditioning', 'Swimming Pool', 'Restaurant', 'Bar',
    'Room Service', 'Laundry', 'Parking', 'Gym', 'Spa', 'Conference Room',
    'Business Center', 'Airport Shuttle', 'Breakfast Included', 'Pet Friendly',
    'Wheelchair Accessible', 'Elevator', '24hr Reception', 'Safe Deposit Box',
    'TV', 'Mini Bar', 'Balcony', 'Sea View', 'Garden View',
  ],
  property: [
    'Title Deed', 'Survey Plan', 'Water Connection', 'Electricity Connection',
    'Road Access', 'Fenced', 'Security', 'School Nearby', 'Hospital Nearby',
    'Market Nearby', 'Public Transport', 'Shopping Center', 'Place of Worship',
    'Police Station', 'Bank/ATM', 'Internet Ready', 'Drainage', 'Perimeter Wall',
  ],
} as const;

export const DRAWING_TYPES = {
  architectural: { label: 'Architectural Drawings', labelSw: 'Michoro ya Kiarkitektcha', icon: 'drafting' },
  structural: { label: 'Structural Drawings', labelSw: 'Michoro ya Kistruktcha', icon: 'structure' },
  services: { label: 'Services Drawings (MEP)', labelSw: 'Michoro ya Huduma (MEP)', icon: 'settings' },
  boq: { label: 'Bills of Quantities', labelSw: 'Bili za Vifaa', icon: 'calculator' },
} as const;

export const MATERIAL_CATEGORIES = {
  building: { label: 'Building Materials', labelSw: 'Vifaa vya Ujenzi', icon: 'brick' },
  electrical: { label: 'Electrical Materials', labelSw: 'Vifaa vya Umeme', icon: 'zap' },
  mechanical: { label: 'Mechanical Materials', labelSw: 'Vifaa vya Mikanikali', icon: 'cog' },
  ict: { label: 'ICT Materials', labelSw: 'Vifaa vya ICT', icon: 'wifi' },
} as const;

export const LABOUR_CATEGORIES = {
  concrete: { label: 'Concrete Works', labelSw: 'Kazi za Changa', icon: 'layers' },
  walling: { label: 'Walling', labelSw: 'Kazi za Kuta', icon: 'grid' },
  formwork: { label: 'Formwork', labelSw: 'Kazi za Fomu', icon: 'box' },
  steel_fixing: { label: 'Steel Fixing', labelSw: 'Kazi za Chuma', icon: 'wrench' },
  roofing: { label: 'Roofing', labelSw: 'Kazi za Paa', icon: 'home' },
  finishing: { label: 'Finishing Works', labelSw: 'Kazi za Upya', icon: 'brush' },
  plumbing: { label: 'Plumbing', labelSw: 'Ufundi wa Bomba', icon: 'droplet' },
  electrical: { label: 'Electrical Works', labelSw: 'Kazi za Umeme', icon: 'zap' },
} as const;

export const PROPERTY_TYPES = {
  land: { label: 'Land', labelSw: 'Ardhi', icon: 'map-pin' },
  farm: { label: 'Farm', labelSw: 'Shamba', icon: 'tractor' },
  residential: { label: 'Residential Building', labelSw: 'Jengo la Makazi', icon: 'home' },
  commercial: { label: 'Commercial Building', labelSw: 'Jengo la Biashara', icon: 'building' },
  mixed: { label: 'Mixed Use', labelSw: 'Matumizi ya Pamoja', icon: 'layers' },
} as const;

export const HOUSE_TYPES = {
  rooms: { label: 'Rooms', labelSw: 'Vyumba', icon: 'door' },
  apartment: { label: 'Apartment', labelSw: 'Apati', icon: 'building' },
  house: { label: 'Standalone House', labelSw: 'Nyumba ya Pekee', icon: 'home' },
  hostel: { label: 'Hostel', labelSw: 'Hosteli', icon: 'users' },
} as const;

export const HOTEL_TYPES = {
  hotel: { label: 'Hotel', labelSw: 'Hoteli', icon: 'building' },
  apartment: { label: 'Serviced Apartment', labelSw: 'Apati ya Huduma', icon: 'home' },
  villa: { label: 'Villa', labelSw: 'Villa', icon: 'home' },
  cottage: { label: 'Cottage', labelSw: 'Koti', icon: 'tree' },
} as const;

export const ROOM_TYPES = {
  single: { label: 'Single Room', labelSw: 'Chumba cha Mtu Mmoja', icon: 'user' },
  double: { label: 'Double Room', labelSw: 'Chumba cha Watu Wawili', icon: 'users' },
  suite: { label: 'Suite', labelSw: 'Suite', icon: 'crown' },
  apartment: { label: 'Apartment', labelSw: 'Apati', icon: 'building' },
} as const;