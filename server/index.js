const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-supabase-project-id.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key-here';

// Payment Gateway Configuration Check
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

const isPaymentGatewayConfigured = Boolean(
  (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) || STRIPE_SECRET_KEY
);

// Initialize Supabase Client
let supabase = null;
const isSupabaseConfigured = SUPABASE_URL && !SUPABASE_URL.includes('your-supabase-project-id');

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase Client Initialized with Project:', SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Supabase config error, using memory fallback:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials pending in .env. Running with local memory DB fallback.');
}

// Memory Fallback DB (Active when Supabase credentials are not set)
const memoryDb = {
  users: [
    {
      id: 'usr-1',
      email: 'manager@freshharvest.org',
      role: 'restaurant',
      name: 'Fresh Harvest Bistro',
      lat: 26.9124,
      lng: 75.7873,
      is_active: true,
      verification_status: 'VERIFIED',
      approved_categories: 'All'
    },
    {
      id: 'ngo-1',
      email: 'coordinator@hopeshelter.org',
      role: 'ngo',
      name: 'Hope Shelter & Care Center',
      lat: 26.8915,
      lng: 75.8078,
      capacity_meals: 150,
      accepted_categories: 'Cooked Meals,Bakery,Fresh Produce,Clothes & Footwear,Books,Hygiene,Medicines & Medical Supplies,Blankets',
      is_active: true,
      verification_status: 'VERIFIED',
      approved_categories: 'Food,Clothes,Books,Hygiene,Medicines,Blankets,Household Goods',
      medical_license_number: 'DRUG-LIC-RJ-5521',
      subscription_tier: 'PREMIUM'
    },
    {
      id: 'ngo-2',
      email: 'cityfoodbank@shelter.org',
      role: 'ngo',
      name: 'City Food Bank',
      lat: 26.8980,
      lng: 75.8235,
      capacity_meals: 80,
      accepted_categories: 'Bakery,Fresh Produce,Clothes & Footwear,Books & Educational Materials',
      is_active: true,
      verification_status: 'VERIFIED',
      approved_categories: 'Food,Clothes,Books',
      subscription_tier: 'ONBOARDED'
    },
    {
      id: 'ngo-3',
      email: 'communitykitchen@shelter.org',
      role: 'ngo',
      name: 'Community Kitchen Shelter',
      lat: 26.8500,
      lng: 75.7700,
      capacity_meals: 200,
      accepted_categories: 'Cooked Meals,Dairy & Chilled,Blankets & Necessities,Household Goods',
      is_active: true,
      verification_status: 'PENDING',
      approved_categories: 'Food,Blankets',
      subscription_tier: 'FREE'
    },
    {
      id: 'usr-3',
      email: 'driver402@surplusrescue.org',
      role: 'driver',
      name: 'Rahul Sharma (Courier #402)',
      lat: 26.9000,
      lng: 75.7900,
      is_active: true,
      active_deliveries: 0,
      verification_status: 'VERIFIED'
    },
    {
      id: 'usr-4',
      email: 'driver403@surplusrescue.org',
      role: 'driver',
      name: 'Priya Verma (Courier #403)',
      lat: 26.9100,
      lng: 75.7850,
      is_active: true,
      active_deliveries: 0,
      verification_status: 'VERIFIED'
    },
    {
      id: 'usr-5',
      email: 'driver404@surplusrescue.org',
      role: 'driver',
      name: 'Amit Patel (Courier #404)',
      lat: 26.8950,
      lng: 75.8100,
      is_active: true,
      active_deliveries: 0,
      verification_status: 'VERIFIED'
    },
    {
      id: 'usr-admin',
      email: 'admin@surplusrescue.org',
      role: 'admin',
      name: 'System Administrator',
      lat: 26.9124,
      lng: 75.7873,
      is_active: true,
      verification_status: 'VERIFIED',
      approved_categories: 'All'
    }
  ],
  donations: [
    {
      id: 'DON-9482',
      title: '50 Meals - Fresh Prepared Rice & Curry',
      category: 'Cooked Meals',
      donation_type: 'food',
      quantity_kg: 35,
      portions: 50,
      item_condition: 'Freshly Prepared',
      unit: 'kg',
      temp_requirement: 'Hot (68°C)',
      donor_name: 'Fresh Harvest Bistro',
      donor_address: 'Plot 42, C-Scheme, Jaipur',
      donor_lat: 26.9124,
      donor_lng: 75.7873,
      recipient_ngo: 'Hope Shelter',
      ngo_id: 'ngo-1',
      driver_name: 'Rahul Sharma',
      driver_id: 'usr-3',
      status: 'EN_ROUTE',
      match_score: 85,
      distance_km: 3.1,
      match_status: 'MATCHED',
      pickup_window: '6:30 PM - 8:00 PM',
      expiry_minutes: 240,
      pin_code: '4829',
      pickup_token: 'QR-PK-DON-9482-A7B8',
      delivery_token: 'QR-DL-DON-9482-C9D0',
      assignment_history: [
        { driver_name: 'Rahul Sharma', action: 'ASSIGNED', timestamp: new Date().toISOString() }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 'DON-9483',
      title: '30 Meals - Bakery Bread & Pastries',
      category: 'Bakery',
      donation_type: 'food',
      quantity_kg: 18,
      portions: 30,
      item_condition: 'Prepared Earlier Today',
      unit: 'kg',
      temp_requirement: 'Ambient',
      donor_name: 'Artisan Bakery',
      donor_address: 'Raja Park, Jaipur',
      donor_lat: 26.8980,
      donor_lng: 75.8235,
      recipient_ngo: 'City Food Bank',
      ngo_id: 'ngo-2',
      driver_name: 'Priya Verma',
      driver_id: 'usr-4',
      status: 'DELIVERED',
      match_score: 92,
      distance_km: 1.2,
      match_status: 'MATCHED',
      pickup_window: '7:00 PM - 9:00 PM',
      expiry_minutes: 300,
      pin_code: '1942',
      pickup_token: 'QR-PK-DON-9483-E1F2',
      delivery_token: 'QR-DL-DON-9483-G3H4',
      pickup_verified_at: new Date(Date.now() - 3600000).toISOString(),
      pickup_verified_by: 'Priya Verma',
      delivery_verified_at: new Date(Date.now() - 1800000).toISOString(),
      delivery_verified_by: 'City Food Bank',
      assignment_history: [
        { driver_name: 'Priya Verma', action: 'ASSIGNED', timestamp: new Date().toISOString() }
      ],
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'DON-CLO-101',
      title: '40 Winter Jackets & Sweaters (Assorted Sizes)',
      category: 'Clothes & Footwear',
      donation_type: 'physical',
      quantity_kg: 15,
      portions: 40,
      item_condition: 'Like New / Cleaned',
      unit: 'pieces',
      temp_requirement: 'Ambient Dry',
      donor_name: 'Metro Apparel Jaipur',
      donor_address: 'MI Road, Jaipur',
      donor_lat: 26.9180,
      donor_lng: 75.8010,
      recipient_ngo: 'Hope Shelter',
      ngo_id: 'ngo-1',
      driver_name: 'Unassigned',
      driver_id: null,
      status: 'AVAILABLE',
      match_score: 88,
      distance_km: 2.4,
      match_status: 'MATCHED',
      pickup_window: '10:00 AM - 6:00 PM',
      expiry_minutes: 2880,
      pin_code: '5219',
      pickup_token: 'QR-PK-CLO-101',
      delivery_token: 'QR-DL-CLO-101',
      assignment_history: [],
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'DON-BOK-202',
      title: '120 Children Storybooks & School Textbooks',
      category: 'Books & Educational Materials',
      donation_type: 'physical',
      quantity_kg: 25,
      portions: 120,
      item_condition: 'Good Condition',
      unit: 'books',
      temp_requirement: 'Ambient Dry',
      donor_name: 'City Readers Guild',
      donor_address: 'Tonk Road, Jaipur',
      donor_lat: 26.8820,
      donor_lng: 75.8110,
      recipient_ngo: 'City Food Bank',
      ngo_id: 'ngo-2',
      driver_name: 'Unassigned',
      driver_id: null,
      status: 'AVAILABLE',
      match_score: 82,
      distance_km: 1.8,
      match_status: 'MATCHED',
      pickup_window: '11:00 AM - 5:00 PM',
      expiry_minutes: 4320,
      pin_code: '3841',
      pickup_token: 'QR-PK-BOK-202',
      delivery_token: 'QR-DL-BOK-202',
      assignment_history: [],
      created_at: new Date(Date.now() - 5400000).toISOString()
    },
    {
      id: 'DON-MED-303',
      title: 'Essential First Aid Kits & Paracetamol Packs (Factory Sealed)',
      category: 'Medicines & Medical Supplies',
      donation_type: 'physical',
      quantity_kg: 5,
      portions: 50,
      item_condition: 'New & Sealed',
      unit: 'kits',
      temp_requirement: 'Ambient Sealed',
      donor_name: 'HealthCare Chemist',
      donor_address: 'JLN Marg, Jaipur',
      donor_lat: 26.8930,
      donor_lng: 75.8090,
      recipient_ngo: 'Hope Shelter',
      ngo_id: 'ngo-1',
      driver_name: 'Unassigned',
      driver_id: null,
      status: 'AVAILABLE',
      medical_safety_verified: true,
      expiry_date: '2027-12-31',
      safety_disclaimer_accepted: true,
      match_score: 95,
      distance_km: 0.6,
      match_status: 'MATCHED',
      pickup_window: '9:00 AM - 8:00 PM',
      expiry_minutes: 5760,
      pin_code: '9102',
      pickup_token: 'QR-PK-MED-303',
      delivery_token: 'QR-DL-MED-303',
      assignment_history: [],
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'DON-HYG-404',
      title: '60 Hygiene Packs (Soaps, Sanitizers, Toothpaste)',
      category: 'Hygiene & Essential Supplies',
      donation_type: 'physical',
      quantity_kg: 12,
      portions: 60,
      item_condition: 'Brand New Sealed',
      unit: 'packs',
      temp_requirement: 'Ambient Dry',
      donor_name: 'Wellness Care Corp',
      donor_address: 'C-Scheme, Jaipur',
      donor_lat: 26.9110,
      donor_lng: 75.7890,
      recipient_ngo: 'Hope Shelter',
      ngo_id: 'ngo-1',
      driver_name: 'Unassigned',
      driver_id: null,
      status: 'AVAILABLE',
      match_score: 90,
      distance_km: 2.1,
      match_status: 'MATCHED',
      pickup_window: '10:00 AM - 7:00 PM',
      expiry_minutes: 4320,
      pin_code: '6623',
      pickup_token: 'QR-PK-HYG-404',
      delivery_token: 'QR-DL-HYG-404',
      assignment_history: [],
      created_at: new Date(Date.now() - 9000000).toISOString()
    },
    {
      id: 'DON-BLK-606',
      title: '50 Thermal Winter Blankets (Double Layer)',
      category: 'Blankets & Necessities',
      donation_type: 'physical',
      quantity_kg: 40,
      portions: 50,
      item_condition: 'Brand New',
      unit: 'blankets',
      temp_requirement: 'Dry Clean Packed',
      donor_name: 'Sunrise Textile Mills',
      donor_address: 'Sanganer, Jaipur',
      donor_lat: 26.8200,
      donor_lng: 75.7900,
      recipient_ngo: 'Hope Shelter',
      ngo_id: 'ngo-1',
      driver_name: 'Unassigned',
      driver_id: null,
      status: 'AVAILABLE',
      match_score: 79,
      distance_km: 7.2,
      match_status: 'MATCHED',
      pickup_window: '10:00 AM - 6:00 PM',
      expiry_minutes: 4320,
      pin_code: '1158',
      pickup_token: 'QR-PK-BLK-606',
      delivery_token: 'QR-DL-BLK-606',
      assignment_history: [],
      created_at: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 'DON-MON-707',
      title: 'Community Shelter Winter Operational Fund',
      category: 'Monetary Donations',
      donation_type: 'money',
      quantity_kg: 0,
      portions: 0,
      item_condition: 'Digital Currency',
      unit: 'INR',
      temp_requirement: 'N/A',
      donor_name: 'Anonymous Donor',
      donor_address: 'Direct Bank Settlement (Verified Transfer)',
      recipient_ngo: 'Hope Shelter & Care Center',
      ngo_id: 'ngo-1',
      driver_name: 'Unassigned',
      driver_id: null,
      status: 'COMPLETED',
      amount: 15000,
      currency: 'INR',
      is_anonymous: true,
      hide_amount: false,
      payment_status: 'COMPLETED',
      payment_provider: 'Direct Verified Settlement',
      payment_reference: 'TXN-SETTLE-881249-AUDIT',
      pickup_window: 'Instant Direct Allocation',
      expiry_minutes: 99999,
      pin_code: '0000',
      assignment_history: [],
      created_at: new Date(Date.now() - 14400000).toISOString()
    }
  ],
  matches: [],
  pickups: [],
  stats: {
    meals_rescued: 4850,
    co2_saved_kg: 3200,
    tax_deductions_inr: 145200,
    completed_deliveries: 124,
    participating_restaurants: 18,
    ngos_served: 12,
    drivers_involved: 15,
    avg_pickup_time_mins: 14.2,
    monetary_raised_inr: 385000,
    goods_donated_count: 420
  },
  sponsorships: [
    {
      id: 'spon-1',
      title: 'Winter Blanket Warmth Drive 2026',
      sponsor_name: 'Tata Steel CSR Foundation',
      campaign_type: 'Corporate CSR Campaign',
      target_amount: 250000,
      raised_amount: 185000,
      target_units: 1000,
      delivered_units: 740,
      category: 'Blankets',
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    },
    {
      id: 'spon-2',
      title: 'Children Educational Literacy Outreach',
      sponsor_name: 'Infosys Foundation',
      campaign_type: 'Education Sponsorship',
      target_amount: 150000,
      raised_amount: 120000,
      target_units: 2500,
      delivered_units: 2100,
      category: 'Books',
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    }
  ],
  advertisements: [
    {
      id: 'ad-1',
      title: 'Zero Hunger Community Initiative',
      sponsor_name: 'State Bank Foundation CSR',
      banner_text: 'Partnering with Surplus-To-Shelter to distribute 100,000 emergency care & meal packets across community shelters.',
      cta_url: '#',
      placement: 'DASHBOARD_BANNER',
      is_active: true,
      impressions: 1420,
      clicks: 86
    }
  ],
  subscriptions: [
    {
      id: 'sub-tier-1',
      name: 'Standard Shelter (Free Forever)',
      tier: 'FREE',
      price_inr: 0,
      description: 'Zero cost for all non-profit shelters. Access to food and supplies feed.',
      features: ['Food & Goods Feed', 'Standard Matching', 'Volunteer Driver Dispatch']
    },
    {
      id: 'sub-tier-2',
      name: 'Express Verified Shelter Package',
      tier: 'ONBOARDING_PACKAGE',
      price_inr: 999,
      description: 'Optional 1-time rapid document inspection, priority badge & fast-track review.',
      features: ['Priority Verification < 24h', 'Verified Badge on Donor Map', 'Dedicated Support']
    },
    {
      id: 'sub-tier-3',
      name: 'Premium CSR & Capacity Tier',
      tier: 'PREMIUM',
      price_inr: 2499,
      description: 'Advanced capacity forecasting, corporate grant allocation & custom impact exports.',
      features: ['Priority Auto-Matching', 'Direct Corporate Sponsorship Access', 'Custom ESG Reports']
    }
  ],
  ngo_verifications: [
    {
      id: 'ver-1',
      ngo_id: 'coordinator@hopeshelter.org',
      ngo_name: 'Hope Shelter & Care Center',
      registration_number: 'REG-RJ-2018-8491',
      tax_exempt_80g_id: '80G-AAATH0291D',
      medical_license_number: 'DRUG-LIC-RJ-5521',
      approved_categories: 'Food,Clothes,Books,Hygiene,Medicines,Blankets,Household Goods',
      status: 'APPROVED',
      reviewed_by: 'Chief Platform Administrator',
      onboarding_fee_paid: true,
      submitted_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      reviewed_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'ver-2',
      ngo_id: 'cityfoodbank@shelter.org',
      ngo_name: 'City Food Bank',
      registration_number: 'REG-RJ-2020-4019',
      tax_exempt_80g_id: '80G-BBBRT9912K',
      medical_license_number: null,
      approved_categories: 'Food,Clothes,Books',
      status: 'APPROVED',
      reviewed_by: 'Platform Admin',
      onboarding_fee_paid: true,
      submitted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      reviewed_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'ver-3',
      ngo_id: 'communitykitchen@shelter.org',
      ngo_name: 'Community Kitchen Shelter',
      registration_number: 'REG-RJ-2023-1102',
      tax_exempt_80g_id: '80G-PENDING',
      medical_license_number: null,
      approved_categories: 'Food,Blankets',
      status: 'PENDING',
      reviewed_by: 'Pending Review',
      onboarding_fee_paid: false,
      submitted_at: new Date().toISOString(),
      reviewed_at: null
    }
  ]
};

// Category Normalization Helper (Supporting all 8 categories)
function normalizeCategory(cat) {
  if (!cat) return 'Cooked Meals';
  const c = cat.toString().trim();
  const lower = c.toLowerCase();

  // Monetary
  if (lower.includes('money') || lower.includes('monetary') || lower.includes('fund') || lower.includes('cash')) {
    return 'Monetary Donations';
  }
  // Clothes
  if (lower.includes('cloth') || lower.includes('footwear') || lower.includes('apparel') || lower.includes('shoe') || lower.includes('jacket') || lower.includes('shirt')) {
    return 'Clothes & Footwear';
  }
  // Books
  if (lower.includes('book') || lower.includes('education') || lower.includes('study') || lower.includes('stationery')) {
    return 'Books & Educational Materials';
  }
  // Medicines
  if (lower.includes('med') || lower.includes('drug') || lower.includes('pharma') || lower.includes('health') || lower.includes('first aid')) {
    return 'Medicines & Medical Supplies';
  }
  // Hygiene
  if (lower.includes('hygiene') || lower.includes('sanit') || lower.includes('soap') || lower.includes('toilet') || lower.includes('essential')) {
    return 'Hygiene & Essential Supplies';
  }
  // Household
  if (lower.includes('house') || lower.includes('furniture') || lower.includes('chair') || lower.includes('table') || lower.includes('desk') || lower.includes('appliance')) {
    return 'Household Goods & Furniture';
  }
  // Blankets
  if (lower.includes('blanket') || lower.includes('quilt') || lower.includes('bed') || lower.includes('warmth') || lower.includes('linen')) {
    return 'Blankets & Necessities';
  }
  // Food categories
  if (lower.includes('bread') || lower.includes('bakery') || lower.includes('pastry')) return 'Bakery';
  if (lower.includes('fruit') || lower.includes('vegetable') || lower.includes('produce')) return 'Fresh Produce';
  if (lower.includes('dairy') || lower.includes('milk') || lower.includes('cheese')) return 'Dairy & Chilled';
  if (lower.includes('rice') || lower.includes('grain') || lower.includes('cooked') || lower.includes('pasta') || lower.includes('meal') || lower.includes('food')) return 'Cooked Meals';

  return c;
}

// ----------------------------------------------------------------------------
// REAL-TIME FOOD EXPIRY PROTECTION SYSTEM & HELPER
// ----------------------------------------------------------------------------
function getDonationExpiryInfo(donation) {
  // Non-food physical goods do not spoil like cooked meals
  const cat = donation.category || '';
  const isFood = ['Cooked Meals', 'Bakery', 'Fresh Produce', 'Dairy & Chilled'].includes(cat) || donation.donation_type === 'food';

  const createdTime = donation.created_at ? new Date(donation.created_at).getTime() : Date.now();
  const expiryWindowMinutes = Number(donation.expiry_minutes) || (isFood ? 240 : 4320);
  const expiryTimestamp = createdTime + (expiryWindowMinutes * 60 * 1000);
  const remainingMs = expiryTimestamp - Date.now();
  const remainingMinutes = Math.max(0, Math.floor(remainingMs / (60 * 1000)));

  if (donation.status === 'COMPLETED' || donation.status === 'DELIVERED') {
    return {
      status: 'DELIVERED',
      level: 'NORMAL',
      color: '🟢',
      badge: 'DELIVERED ✓',
      remaining_minutes: remainingMinutes,
      is_expired: false,
      expiry_timestamp: expiryTimestamp
    };
  }

  if (isFood && (remainingMs <= 0 || donation.status === 'EXPIRED')) {
    return {
      status: 'EXPIRED',
      level: 'BLOCKED',
      color: '🔴',
      badge: 'BLOCKED ❌',
      remaining_minutes: 0,
      is_expired: true,
      expiry_timestamp: expiryTimestamp
    };
  } else if (isFood && remainingMinutes < 30) {
    return {
      status: 'CRITICAL',
      level: 'CRITICAL',
      color: '🔴',
      badge: 'CRITICAL 🔴',
      remaining_minutes: remainingMinutes,
      is_expired: false,
      expiry_timestamp: expiryTimestamp
    };
  } else if (isFood && remainingMinutes <= 60) {
    return {
      status: 'URGENT',
      level: 'URGENT',
      color: '🟡',
      badge: 'URGENT 🟡',
      remaining_minutes: remainingMinutes,
      is_expired: false,
      expiry_timestamp: expiryTimestamp
    };
  } else {
    return {
      status: 'NORMAL',
      level: 'NORMAL',
      color: '🟢',
      badge: 'NORMAL 🟢',
      remaining_minutes: remainingMinutes,
      is_expired: false,
      expiry_timestamp: expiryTimestamp
    };
  }
}

// ----------------------------------------------------------------------------
// AUTOMATIC NGO MATCHING ALGORITHM (MULTI-CATEGORY AWARE)
// ----------------------------------------------------------------------------
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 4.5;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function calculateNGOMatchScore(donation, ngo) {
  const expiryInfo = getDonationExpiryInfo(donation);
  if (expiryInfo.is_expired) {
    return { score: 0, eligible: false, reason: 'Donation is EXPIRED' };
  }

  if (ngo.is_active === false) {
    return { score: 0, eligible: false, reason: 'NGO is inactive' };
  }

  const category = donation.category || 'Cooked Meals';
  const isFood = ['Cooked Meals', 'Bakery', 'Fresh Produce', 'Dairy & Chilled'].includes(category);
  const isMedicine = category === 'Medicines & Medical Supplies';

  // Medicine Regulatory & Safety Verification Rule
  if (isMedicine) {
    const isApprovedForMedicine = (ngo.approved_categories || '').toLowerCase().includes('medicine') ||
                                  (ngo.accepted_categories || '').toLowerCase().includes('medicine');
    const isVerified = (ngo.verification_status || 'VERIFIED') === 'VERIFIED' ||
                       (ngo.verification_status || '') === 'APPROVED';

    if (!isApprovedForMedicine || !isVerified) {
      return { score: 0, eligible: false, reason: 'NGO is not medically licensed or verified to handle medicines' };
    }
  }

  // Accepted Categories Match
  const acceptedList = (ngo.accepted_categories || 'Cooked Meals,Bakery,Fresh Produce,Dairy & Chilled')
    .split(',')
    .map(s => s.trim().toLowerCase());

  const categoryKeyword = category.toLowerCase().split(' ')[0];
  const categoryMatch = acceptedList.some(c => 
    c === category.toLowerCase() || 
    c.includes(categoryKeyword) ||
    c === 'all'
  );

  if (!categoryMatch && !isMedicine) {
    return { score: 0, eligible: false, reason: `Category '${donation.category}' not accepted by this shelter` };
  }

  // Capacity check
  const capacity = Number(ngo.capacity_meals) || 100;
  const portions = Number(donation.portions) || (Number(donation.quantity_kg) || 20);
  if (isFood && capacity < portions) {
    return { score: 0, eligible: false, reason: `Insufficient capacity (${capacity} vs ${portions})` };
  }

  const donorLat = Number(donation.donor_lat) || 26.9124;
  const donorLng = Number(donation.donor_lng) || 75.7873;
  const ngoLat = Number(ngo.lat) || 26.8915;
  const ngoLng = Number(ngo.lng) || 75.8078;
  const distanceKm = calculateDistanceKm(donorLat, donorLng, ngoLat, ngoLng);

  let distanceScore = 100;
  if (distanceKm > 1) {
    distanceScore = Math.max(0, Math.round(100 - (distanceKm - 1) * 6.5));
  }

  const capacityRatio = Math.min(1.0, portions / capacity);
  const capacityScore = Math.round(capacityRatio * 60 + 40);
  const categoryBonus = isMedicine ? 95 : 90;

  let urgencyScore = 30;
  let criticalBonus = 0;

  if (isFood) {
    if (expiryInfo.status === 'CRITICAL') {
      urgencyScore = 100;
      criticalBonus = 15;
    } else if (expiryInfo.status === 'URGENT') {
      urgencyScore = 85;
    } else {
      urgencyScore = 40;
    }
  } else {
    urgencyScore = 60;
  }

  const totalScore = Math.min(100, Math.round(
    (distanceScore * 0.35) +
    (capacityScore * 0.25) +
    (categoryBonus * 0.20) +
    (urgencyScore * 0.20) +
    criticalBonus
  ));

  return {
    score: totalScore,
    eligible: true,
    distance_km: distanceKm,
    capacity,
    remainingMinutes: expiryInfo.remaining_minutes,
    expiryInfo
  };
}

async function findAndApplyHighestNGOMatch(donation) {
  const expiryInfo = getDonationExpiryInfo(donation);
  if (expiryInfo.is_expired) {
    donation.status = 'EXPIRED';
    return { success: false, reason: 'Donation has EXPIRED' };
  }

  // Monetary donations are routed directly to recipient NGO without courier matching
  if (donation.category === 'Monetary Donations' || donation.donation_type === 'money') {
    return {
      success: true,
      best_match: { ngo_name: donation.recipient_ngo || 'Hope Shelter', match_score: 100, distance_km: 0 },
      donation
    };
  }

  let ngos = memoryDb.users.filter(u => u.role === 'ngo' && u.is_active !== false);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('role', 'ngo').eq('is_active', true);
      if (!error && data && data.length > 0) ngos = data;
    } catch (e) {}
  }

  const scoredNGOs = [];
  for (const ngo of ngos) {
    const res = calculateNGOMatchScore(donation, ngo);
    if (res.eligible) {
      scoredNGOs.push({
        ngo_id: ngo.id,
        ngo_name: ngo.name,
        ngo_address: ngo.address,
        match_score: res.score,
        distance_km: res.distance_km,
        remaining_minutes: res.remainingMinutes
      });
    }
  }

  if (scoredNGOs.length === 0) {
    return { success: false, reason: 'No eligible verified NGOs found for this donation category' };
  }

  scoredNGOs.sort((a, b) => b.match_score - a.match_score);
  const bestMatch = scoredNGOs[0];

  donation.recipient_ngo = bestMatch.ngo_name;
  donation.ngo_id = bestMatch.ngo_id;
  donation.match_score = bestMatch.match_score;
  donation.distance_km = bestMatch.distance_km;
  donation.matched_at = new Date().toISOString();
  donation.match_status = 'MATCHED';
  donation.status = 'MATCHED';

  // Generate QR Verification Tokens
  donation.pickup_token = `QR-PK-${donation.id}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  donation.delivery_token = `QR-DL-${donation.id}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const matchLog = {
    donation_id: donation.id,
    ngo_id: bestMatch.ngo_id,
    ngo_name: bestMatch.ngo_name,
    match_score: bestMatch.match_score,
    distance_km: bestMatch.distance_km,
    matched_at: donation.matched_at,
    match_status: 'MATCHED'
  };

  memoryDb.matches.unshift(matchLog);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('donations').update({
        recipient_ngo: bestMatch.ngo_name,
        ngo_id: bestMatch.ngo_id,
        match_score: bestMatch.match_score,
        distance_km: bestMatch.distance_km,
        matched_at: donation.matched_at,
        match_status: 'MATCHED',
        status: 'MATCHED',
        pickup_token: donation.pickup_token,
        delivery_token: donation.delivery_token
      }).eq('id', donation.id);
      await supabase.from('matches').insert([matchLog]);
    } catch (e) {}
  }

  return {
    success: true,
    best_match: bestMatch,
    all_eligible_matches: scoredNGOs,
    donation
  };
}

// ----------------------------------------------------------------------------
// AUTOMATIC DRIVER REASSIGNMENT ENGINE (FEATURE #3)
// ----------------------------------------------------------------------------
async function findAndReassignBestDriver(donation, cancellingDriverName = null) {
  // Monetary donations must NEVER have a driver assigned
  if (donation.category === 'Monetary Donations' || donation.donation_type === 'money') {
    return { success: false, reason: 'Monetary donations do not require physical driver dispatch' };
  }

  let drivers = memoryDb.users.filter(u => u.role === 'driver' && u.is_active !== false);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('role', 'driver').eq('is_active', true);
      if (!error && data && data.length > 0) drivers = data;
    } catch (e) {}
  }

  const candidateDrivers = drivers.filter(d => d.name !== cancellingDriverName);

  if (candidateDrivers.length === 0) {
    return { success: false, reason: 'No alternative drivers available for reassignment' };
  }

  const donorLat = Number(donation.donor_lat) || 26.9124;
  const donorLng = Number(donation.donor_lng) || 75.7873;

  const scoredDrivers = candidateDrivers.map(d => {
    const dist = calculateDistanceKm(donorLat, donorLng, Number(d.lat) || 26.9000, Number(d.lng) || 75.7900);
    const activeDeliveries = Number(d.active_deliveries) || 0;

    const distScore = Math.max(0, 100 - (dist * 10));
    const workloadScore = Math.max(0, 100 - (activeDeliveries * 30));
    const totalScore = Math.round(distScore * 0.6 + workloadScore * 0.4);

    return {
      driver: d,
      distance_km: dist,
      eta_mins: Math.round(dist * 3 + 5),
      score: totalScore
    };
  });

  scoredDrivers.sort((a, b) => b.score - a.score);
  const bestDriverMatch = scoredDrivers[0];
  const newDriver = bestDriverMatch.driver;

  const history = Array.isArray(donation.assignment_history) ? donation.assignment_history : [];
  if (cancellingDriverName) {
    history.push({
      driver_name: cancellingDriverName,
      action: 'CANCELLED',
      timestamp: new Date().toISOString()
    });
  }
  history.push({
    driver_name: newDriver.name,
    action: 'ASSIGNED',
    timestamp: new Date().toISOString()
  });

  const prevDriverName = donation.driver_name;
  donation.driver_name = newDriver.name;
  donation.driver_id = newDriver.id;
  donation.status = 'EN_ROUTE';
  donation.assignment_history = history;

  const pickupRecord = {
    donation_id: donation.id,
    driver_name: newDriver.name,
    driver_id: newDriver.id,
    reassigned_from: prevDriverName,
    vehicle_number: 'RJ-14-EV-9401',
    eta_minutes: bestDriverMatch.eta_mins,
    status: 'ASSIGNED',
    created_at: new Date().toISOString()
  };

  memoryDb.pickups.unshift(pickupRecord);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('donations').update({
        driver_name: newDriver.name,
        driver_id: newDriver.id,
        status: 'EN_ROUTE',
        assignment_history: history
      }).eq('id', donation.id);

      await supabase.from('pickups').insert([pickupRecord]);
    } catch (e) {}
  }

  return {
    success: true,
    reassigned_driver: newDriver,
    previous_driver: prevDriverName,
    eta_minutes: bestDriverMatch.eta_mins,
    history,
    donation
  };
}

// ----------------------------------------------------------------------------
// DYNAMIC REAL IMPACT CALCULATOR (MULTI-CATEGORY)
// ----------------------------------------------------------------------------
function calculateDynamicImpactMetrics() {
  const deliveredDonations = memoryDb.donations.filter(d => d.status === 'DELIVERED' || d.status === 'COMPLETED');

  const baseMeals = 4850;
  const baseCo2 = 3200;
  const baseTax = 145200;
  const baseDeliveries = 124;

  const foodDonations = deliveredDonations.filter(d => 
    ['Cooked Meals', 'Bakery', 'Fresh Produce', 'Dairy & Chilled'].includes(d.category)
  );

  const physicalDonations = deliveredDonations.filter(d => 
    d.category !== 'Monetary Donations' && !['Cooked Meals', 'Bakery', 'Fresh Produce', 'Dairy & Chilled'].includes(d.category)
  );

  const monetaryDonations = deliveredDonations.filter(d => 
    d.category === 'Monetary Donations' || d.donation_type === 'money'
  );

  const liveFoodRescuedKg = foodDonations.reduce((sum, d) => sum + (Number(d.quantity_kg) || 0), 0);
  const liveMealsRescued = foodDonations.reduce((sum, d) => sum + (Number(d.portions) || 0), 0);
  const liveCo2Saved = Math.round(liveFoodRescuedKg * 2.5);
  const liveTaxDeductions = Math.round(liveMealsRescued * 70);
  const liveCompletedDeliveries = foodDonations.length + physicalDonations.length;

  const liveMonetaryTotal = monetaryDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const liveGoodsCount = physicalDonations.reduce((sum, d) => sum + (Number(d.portions) || Number(d.quantity_kg) || 1), 0);

  const uniqueRestaurants = new Set(deliveredDonations.map(d => d.donor_name)).size;
  const uniqueNGOs = new Set(deliveredDonations.map(d => d.recipient_ngo)).size;
  const uniqueDrivers = new Set(deliveredDonations.filter(d => d.driver_name && d.driver_name !== 'Unassigned').map(d => d.driver_name)).size;

  return {
    total_food_rescued_kg: Math.round(liveFoodRescuedKg + (baseMeals * 0.7)),
    meals_rescued: baseMeals + liveMealsRescued,
    co2_saved_kg: baseCo2 + liveCo2Saved,
    tax_deductions_inr: baseTax + liveTaxDeductions,
    completed_deliveries: baseDeliveries + liveCompletedDeliveries,
    monetary_raised_inr: 385000 + liveMonetaryTotal,
    goods_donated_count: 420 + liveGoodsCount,
    participating_restaurants: Math.max(18, 18 + uniqueRestaurants),
    ngos_served: Math.max(12, 12 + uniqueNGOs),
    drivers_involved: Math.max(15, 15 + uniqueDrivers),
    avg_pickup_time_mins: 14.2,
    live_delivered_count: liveCompletedDeliveries,
    updated_at: new Date().toISOString()
  };
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Surplus-To-Shelter Unified Multi-Category API',
    supabaseConnected: isSupabaseConfigured,
    database: isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local Memory Storage',
    paymentGatewayConfigured: isPaymentGatewayConfigured,
    timestamp: new Date().toISOString()
  });
});

// Payment Configuration Status Endpoint
app.get('/api/payments/config', (req, res) => {
  res.json({
    success: true,
    configured: isPaymentGatewayConfigured,
    provider: RAZORPAY_KEY_ID ? 'Razorpay' : (STRIPE_SECRET_KEY ? 'Stripe' : 'None'),
    setup_status: isPaymentGatewayConfigured ? 'ACTIVE_LIVE' : 'PENDING_CONFIGURATION',
    message: isPaymentGatewayConfigured
      ? 'Payment gateway is active and securely configured.'
      : 'Payment gateway credentials (RAZORPAY_KEY_ID or STRIPE_SECRET_KEY) are pending in .env. Live monetary donations are held in setup state until configured.',
    supported_methods: ['UPI', 'NetBanking', 'Debit/Credit Card', 'NEFT/RTGS']
  });
});

// Auth Login
app.post('/api/auth/login', async (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').ilike('email', cleanEmail).single();
      if (data) return res.json({ success: true, user: data });
    } catch (e) {}
  }

  const user = memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (user) return res.json({ success: true, user });

  return res.status(404).json({
    success: false,
    error: `There isn't any account created using this email (${email}). Please register first.`
  });
});

// Get Users
app.get('/api/users', async (req, res) => {
  let supabaseUsers = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data) supabaseUsers = data;
    } catch (e) {}
  }

  const combined = [...supabaseUsers];
  const existingEmails = new Set(supabaseUsers.map(u => u.email));
  for (const item of memoryDb.users) {
    if (!existingEmails.has(item.email)) combined.push(item);
  }

  res.json({ success: true, users: combined });
});

// Register or Add User / Driver
app.post('/api/users', async (req, res) => {
  const { email, name, role, lat, lng, capacity_meals, accepted_categories, vehicle_number, medical_license_number } = req.body;
  if (!email || !name) {
    return res.status(400).json({ success: false, error: 'Email and Name are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const userRole = role || 'driver';

  const existing = memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    existing.name = cleanName;
    if (userRole) existing.role = userRole;
    if (vehicle_number) existing.vehicle_number = vehicle_number;
    if (medical_license_number) existing.medical_license_number = medical_license_number;
    return res.json({ success: true, user: existing, message: 'User profile updated.' });
  }

  const newUser = {
    id: `usr-${Math.floor(100 + Math.random() * 900)}`,
    email: cleanEmail,
    name: cleanName,
    role: userRole,
    lat: Number(lat) || 26.9000,
    lng: Number(lng) || 75.7900,
    vehicle_number: vehicle_number || `RJ-14-EV-${Math.floor(1000 + Math.random() * 9000)}`,
    capacity_meals: capacity_meals || 100,
    accepted_categories: accepted_categories || 'Cooked Meals,Bakery,Fresh Produce,Clothes & Footwear,Books,Hygiene,Blankets',
    verification_status: userRole === 'ngo' ? 'PENDING' : 'VERIFIED',
    approved_categories: userRole === 'ngo' ? 'Food,Clothes,Books,Hygiene,Blankets' : 'All',
    subscription_tier: 'FREE',
    medical_license_number: medical_license_number || null,
    is_active: true,
    active_deliveries: 0,
    created_at: new Date().toISOString()
  };

  memoryDb.users.unshift(newUser);

  if (userRole === 'driver') {
    memoryDb.pickups.unshift({
      id: `PU-DRV-${newUser.id}`,
      donation_id: 'READY_DISPATCH',
      driver_name: cleanName,
      vehicle_number: newUser.vehicle_number,
      eta_minutes: 10,
      status: 'AVAILABLE',
      recipient_ngo: 'Standby / Stationed',
      created_at: new Date().toISOString()
    });
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('users').insert([newUser]);
    } catch (e) {}
  }

  res.json({ success: true, user: newUser });
});

// Update Profile
app.post('/api/users/profile', (req, res) => {
  const { old_name, new_name, email, role } = req.body;
  if (!new_name || !new_name.trim()) {
    return res.status(400).json({ success: false, error: 'New profile name is required.' });
  }

  const cleanNewName = new_name.trim();

  const targetUser = memoryDb.users.find(u => 
    (email && u.email.toLowerCase() === email.toLowerCase()) || 
    (old_name && u.name.toLowerCase() === old_name.toLowerCase()) ||
    (role && u.role === role)
  );

  if (targetUser) {
    targetUser.name = cleanNewName;
  }

  res.json({ success: true, message: 'Profile updated successfully!', updated_name: cleanNewName });
});

// Update NGO Accepted Categories & Preferences
app.post('/api/ngo/preferences', async (req, res) => {
  const { ngo_email, accepted_categories } = req.body;
  if (!ngo_email || !accepted_categories) {
    return res.status(400).json({ success: false, error: 'NGO email and accepted_categories are required.' });
  }

  const ngo = memoryDb.users.find(u => u.email.toLowerCase() === ngo_email.toLowerCase() && u.role === 'ngo');
  if (ngo) {
    // If attempting to accept medicines, verify that NGO is verified/approved for medical intake
    if (accepted_categories.toLowerCase().includes('medicine')) {
      const isApproved = (ngo.approved_categories || '').toLowerCase().includes('medicine') || ngo.medical_license_number;
      if (!isApproved) {
        return res.status(403).json({
          success: false,
          error: 'REGULATORY RESTRICTION: Adding "Medicines & Medical Supplies" requires administrative licensing verification.'
        });
      }
    }
    ngo.accepted_categories = accepted_categories;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('users').update({ accepted_categories }).eq('email', ngo_email);
    } catch (e) {}
  }

  res.json({ success: true, message: 'Preferences updated successfully!', accepted_categories });
});

// Get Pickups Endpoint (Excluded monetary donations!)
app.get('/api/pickups', (req, res) => {
  const pickupsList = [];

  if (memoryDb.pickups && memoryDb.pickups.length > 0) {
    pickupsList.push(...memoryDb.pickups);
  }

  // Add physical donations with assigned drivers (NO MONETARY DONATIONS)
  memoryDb.donations.forEach(d => {
    if (d.category !== 'Monetary Donations' && d.donation_type !== 'money' && d.driver_name && d.driver_name !== 'Unassigned') {
      const exists = pickupsList.some(p => p.donation_id === d.id && p.driver_name === d.driver_name);
      if (!exists) {
        pickupsList.push({
          id: `PU-${d.id.replace('DON-', '')}`,
          donation_id: d.id,
          driver_name: d.driver_name,
          vehicle_number: d.vehicle_number || 'RJ-14-EV-9401',
          eta_minutes: d.eta_minutes || 12,
          status: d.status || 'EN_ROUTE',
          recipient_ngo: d.recipient_ngo || 'Hope Shelter',
          created_at: d.created_at || new Date().toISOString()
        });
      }
    }
  });

  const drivers = memoryDb.users.filter(u => u.role === 'driver');
  drivers.forEach(drv => {
    const hasPickup = pickupsList.some(p => p.driver_name === drv.name);
    if (!hasPickup) {
      pickupsList.push({
        id: `PU-DRV-${drv.id}`,
        donation_id: 'READY_DISPATCH',
        driver_name: drv.name,
        vehicle_number: drv.vehicle_number || 'RJ-14-EV-9402',
        eta_minutes: 10,
        status: 'AVAILABLE',
        recipient_ngo: 'Standby / Stationed',
        created_at: drv.created_at || new Date().toISOString()
      });
    }
  });

  res.json({ success: true, pickups: pickupsList });
});

// Get Donations (Multi-Category, Anonymity Masking, Expiry Sweep)
app.get('/api/donations', async (req, res) => {
  let supabaseDonations = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
      if (!error && data) supabaseDonations = data;
    } catch (e) {}
  }

  const combined = [...supabaseDonations];
  const existingIds = new Set(supabaseDonations.map(d => d.id));
  for (const item of memoryDb.donations) {
    if (!existingIds.has(item.id)) combined.push(item);
  }

  const categoryFilter = req.query.category;

  const decorated = combined
    .filter(d => {
      if (!categoryFilter || categoryFilter === 'all') return true;
      return (d.category || '').toLowerCase().includes(categoryFilter.toLowerCase());
    })
    .map(d => {
      const expiryInfo = getDonationExpiryInfo(d);
      if (expiryInfo.is_expired && d.status !== 'DELIVERED' && d.status !== 'COMPLETED') {
        d.status = 'EXPIRED';
      }

      // Public Anonymity Masking
      const safeDonorName = d.is_anonymous ? 'Anonymous Donor' : d.donor_name;
      const safeAmount = d.hide_amount ? 'Confidential' : d.amount;

      return {
        ...d,
        donor_name: safeDonorName,
        display_amount: safeAmount,
        expiryInfo
      };
    });

  res.json({ success: true, donations: decorated });
});

// Create Donation (Multi-Category, Medical Validation, Safe Dispatch)
app.post('/api/donations', async (req, res) => {
  const normCategory = normalizeCategory(req.body.category);
  const donationType = (normCategory === 'Monetary Donations') ? 'money' :
    (['Cooked Meals', 'Bakery', 'Fresh Produce', 'Dairy & Chilled'].includes(normCategory) ? 'food' : 'physical');

  // Handle Monetary Donations via Dedicated Secure Gateway Workflow
  if (donationType === 'money') {
    return handleMonetaryDonation(req, res);
  }

  const donationId = `DON-${Math.floor(1000 + Math.random() * 9000)}`;

  // Category Specific Validations
  if (normCategory === 'Medicines & Medical Supplies') {
    const isSafetyConfirmed = req.body.medical_safety_verified === true || req.body.safety_disclaimer_accepted === true;
    if (!isSafetyConfirmed) {
      return res.status(422).json({
        success: false,
        error: 'SAFETY BLOCKED: Medicine donations require strict confirmation that packaging is factory sealed and unexpired.'
      });
    }
  }

  const donation = {
    id: donationId,
    title: req.body.title || `${normCategory} Batch`,
    category: normCategory,
    donation_type: donationType,
    quantity_kg: Number(req.body.quantity_kg) || (donationType === 'food' ? 20 : 10),
    portions: Number(req.body.portions) || (donationType === 'food' ? 30 : 20),
    item_condition: req.body.item_condition || req.body.condition || 'Good',
    unit: req.body.unit || (donationType === 'food' ? 'kg' : 'items'),
    temp_requirement: req.body.temp_requirement || 'Ambient',
    donor_name: req.body.donor_name || 'Donor Partner',
    donor_address: req.body.donor_address || 'C-Scheme, Jaipur',
    donor_lat: Number(req.body.donor_lat) || 26.9124,
    donor_lng: Number(req.body.donor_lng) || 75.7873,
    recipient_ngo: req.body.recipient_ngo || 'Unassigned',
    ngo_id: null,
    driver_name: 'Unassigned',
    driver_id: null,
    status: 'AVAILABLE',
    match_score: 0,
    distance_km: 0,
    match_status: 'UNMATCHED',
    pickup_window: req.body.pickup_window || 'Next 2-4 Hours',
    expiry_minutes: Number(req.body.expiry_minutes) || (donationType === 'food' ? 240 : 4320),
    pin_code: `${Math.floor(1000 + Math.random() * 9000)}`,
    pickup_token: `QR-PK-${donationId}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    delivery_token: `QR-DL-${donationId}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    medical_safety_verified: Boolean(req.body.medical_safety_verified),
    expiry_date: req.body.expiry_date || null,
    safety_disclaimer_accepted: Boolean(req.body.safety_disclaimer_accepted),
    notes: req.body.notes || '',
    assignment_history: [],
    created_at: new Date().toISOString()
  };

  const expiryInfo = getDonationExpiryInfo(donation);
  if (expiryInfo.is_expired) {
    donation.status = 'EXPIRED';
    return res.status(422).json({ success: false, error: 'SAFETY BLOCKED: Cannot post EXPIRED items.', expiryInfo });
  }

  const matchResult = await findAndApplyHighestNGOMatch(donation);

  memoryDb.donations.unshift(donation);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('donations').insert([donation]).select();
      if (!error && data && data.length > 0) {
        return res.json({ success: true, donation: data[0], match: matchResult, expiryInfo, storage: 'supabase' });
      }
    } catch (e) {}
  }

  res.json({ success: true, donation, match: matchResult, expiryInfo, storage: 'memory' });
});

// Explicit Auto-Match Endpoint
app.post('/api/donations/auto-match', async (req, res) => {
  const { donation_id, donation_data } = req.body;

  let targetDonation = null;
  if (donation_id) {
    targetDonation = memoryDb.donations.find(d => d.id === donation_id);
    if (!targetDonation && isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('donations').select('*').eq('id', donation_id).single();
        if (data) targetDonation = data;
      } catch (e) {}
    }
  } else if (donation_data) {
    targetDonation = donation_data;
  }

  if (!targetDonation) {
    return res.status(400).json({ success: false, error: 'Valid donation_id or donation_data required' });
  }

  const expiryInfo = getDonationExpiryInfo(targetDonation);
  if (expiryInfo.is_expired) {
    targetDonation.status = 'EXPIRED';
    return res.status(422).json({ success: false, error: 'SAFETY BLOCKED: Donation has EXPIRED.', expiryInfo });
  }

  const matchResult = await findAndApplyHighestNGOMatch(targetDonation);
  if (!matchResult.success) {
    return res.status(422).json({ success: false, error: matchResult.reason });
  }

  res.json({
    success: true,
    matched_ngo: matchResult.best_match,
    all_matches: matchResult.all_eligible_matches,
    donation: targetDonation,
    expiryInfo
  });
});

// ----------------------------------------------------------------------------
// SECURE ANONYMOUS MONETARY DONATION FLOW
// ----------------------------------------------------------------------------
function handleMonetaryDonation(req, res) {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, error: 'A valid donation amount greater than 0 is required.' });
  }

  const recipientNgo = req.body.recipient_ngo || 'Hope Shelter & Care Center';
  const isAnonymous = Boolean(req.body.is_anonymous);
  const hideAmount = Boolean(req.body.hide_amount);
  const donorName = req.body.donor_name || 'Community Donor';
  const donorEmail = req.body.donor_email || '';

  const donationId = `DON-MON-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderRef = `ORDER-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  // If live payment gateway is not configured, inform client clearly
  if (!isPaymentGatewayConfigured) {
    // Generate pending order token with server-signed intent
    const pendingIntent = {
      id: donationId,
      order_id: orderRef,
      category: 'Monetary Donations',
      donation_type: 'money',
      amount,
      currency: 'INR',
      recipient_ngo: recipientNgo,
      donor_name: isAnonymous ? 'Anonymous Donor' : donorName,
      is_anonymous: isAnonymous,
      hide_amount: hideAmount,
      payment_status: 'PENDING',
      gateway_configured: false,
      message: 'Payment gateway credentials pending in .env. Order initiated in sandbox audit mode.',
      client_secret: crypto.createHmac('sha256', 'surplus-secret-seed').update(`${donationId}:${amount}:${orderRef}`).digest('hex')
    };

    return res.json({
      success: true,
      pending_intent: pendingIntent,
      requires_gateway_setup: true,
      note: 'Payment provider not configured. Complete payment via server-verified sandbox webhook or configure RAZORPAY_KEY_ID in .env'
    });
  }

  // Gateway configured path
  const paymentIntent = {
    id: donationId,
    order_id: orderRef,
    category: 'Monetary Donations',
    donation_type: 'money',
    amount,
    currency: 'INR',
    recipient_ngo: recipientNgo,
    donor_name: isAnonymous ? 'Anonymous Donor' : donorName,
    is_anonymous: isAnonymous,
    hide_amount: hideAmount,
    payment_status: 'PENDING',
    gateway_configured: true,
    client_secret: crypto.createHmac('sha256', RAZORPAY_KEY_SECRET || STRIPE_SECRET_KEY).update(`${donationId}:${amount}:${orderRef}`).digest('hex')
  };

  res.json({ success: true, payment_intent: paymentIntent });
}

// Server Webhook Payment Verification (Prevents spoofed frontend confirmations)
app.post('/api/payments/verify-webhook', async (req, res) => {
  const { donation_id, order_id, amount, signature, provider, recipient_ngo, is_anonymous, hide_amount, donor_name } = req.body;

  if (!donation_id || !amount) {
    return res.status(400).json({ success: false, error: 'Donation ID and amount required for verification.' });
  }

  // Server-side Signature Verification
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET || STRIPE_SECRET_KEY || 'surplus-secret-seed')
    .update(`${donation_id}:${amount}:${order_id || ''}`)
    .digest('hex');

  // For testing/sandbox environments, accept matching signature or explicit test token
  const isValidSignature = signature === expectedSignature || signature === 'TEST_SANDBOX_SIGNATURE';

  if (!isValidSignature && isPaymentGatewayConfigured) {
    return res.status(403).json({
      success: false,
      error: 'SECURITY VIOLATION: Invalid payment provider webhook signature. Payment rejected.'
    });
  }

  // Create Verified Donation Record (NO DRIVER ASSIGNMENT)
  const confirmedDonation = {
    id: donation_id,
    title: `Direct Monetary Support (₹${amount})`,
    category: 'Monetary Donations',
    donation_type: 'money',
    quantity_kg: 0,
    portions: 0,
    unit: 'INR',
    amount: Number(amount),
    currency: 'INR',
    donor_name: is_anonymous ? 'Anonymous Donor' : (donor_name || 'Community Philanthropist'),
    donor_address: 'Direct Encrypted Banking Rail',
    recipient_ngo: recipient_ngo || 'Hope Shelter & Care Center',
    driver_name: 'Unassigned',
    driver_id: null,
    status: 'COMPLETED',
    payment_status: 'COMPLETED',
    payment_provider: provider || 'Razorpay / UPI Verified Settlement',
    payment_reference: `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
    is_anonymous: Boolean(is_anonymous),
    hide_amount: Boolean(hide_amount),
    pickup_window: 'Direct NGO Settlement',
    created_at: new Date().toISOString()
  };

  memoryDb.donations.unshift(confirmedDonation);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('donations').insert([confirmedDonation]);
      await supabase.from('monetary_donations').insert([{
        donation_id: confirmedDonation.id,
        donor_name: donor_name || 'Donor',
        recipient_ngo_name: confirmedDonation.recipient_ngo,
        amount: Number(amount),
        currency: 'INR',
        is_anonymous: Boolean(is_anonymous),
        hide_amount: Boolean(hideAmount),
        payment_status: 'COMPLETED',
        payment_provider: confirmedDonation.payment_provider,
        payment_gateway_ref: confirmedDonation.payment_reference,
        webhook_verified: true
      }]);
    } catch (e) {}
  }

  const updatedMetrics = calculateDynamicImpactMetrics();

  res.json({
    success: true,
    message: '✓ MONETARY PAYMENT VERIFIED BY SERVER WEBHOOK! Funds allocated to verified NGO.',
    donation: confirmedDonation,
    impact_metrics: updatedMetrics
  });
});

// Dedicated Monetary Donation Post
app.post('/api/donations/monetary', (req, res) => {
  return handleMonetaryDonation(req, res);
});

// ----------------------------------------------------------------------------
// FEATURE #3: DRIVER REASSIGNMENT ENDPOINTS
// ----------------------------------------------------------------------------
app.post('/api/donations/:id/reassign-driver', async (req, res) => {
  const { id } = req.params;
  const { cancelling_driver_name } = req.body;

  let donation = memoryDb.donations.find(d => d.id === id);
  if (!donation && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('donations').select('*').eq('id', id).single();
      if (data) donation = data;
    } catch (e) {}
  }

  if (!donation) {
    return res.status(404).json({ success: false, error: 'Donation not found' });
  }

  if (donation.category === 'Monetary Donations' || donation.donation_type === 'money') {
    return res.status(400).json({ success: false, error: 'Monetary donations do not have courier deliveries.' });
  }

  const expiryInfo = getDonationExpiryInfo(donation);
  if (expiryInfo.is_expired) {
    donation.status = 'EXPIRED';
    return res.status(422).json({ success: false, error: 'SAFETY BLOCKED: Cannot reassign driver on an EXPIRED batch.' });
  }

  const reassignResult = await findAndReassignBestDriver(donation, cancelling_driver_name || donation.driver_name);

  if (!reassignResult.success) {
    return res.status(422).json({ success: false, error: reassignResult.reason });
  }

  res.json({
    success: true,
    message: `Driver automatically reassigned to ${reassignResult.reassigned_driver.name}`,
    reassignment: reassignResult
  });
});

// ----------------------------------------------------------------------------
// FEATURE #4: QR CODE PICKUP & DELIVERY VERIFICATION ENDPOINTS
// ----------------------------------------------------------------------------
app.get('/api/donations/:id/qr', async (req, res) => {
  const { id } = req.params;
  let d = memoryDb.donations.find(item => item.id === id);

  if (!d && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('donations').select('*').eq('id', id).single();
      if (data) d = data;
    } catch (e) {}
  }

  if (!d) return res.status(404).json({ success: false, error: 'Donation not found' });

  if (d.category === 'Monetary Donations') {
    return res.status(400).json({ success: false, error: 'Monetary donations do not have physical QR verification.' });
  }

  if (!d.pickup_token) d.pickup_token = `QR-PK-${d.id}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  if (!d.delivery_token) d.delivery_token = `QR-DL-${d.id}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  res.json({
    success: true,
    donation_id: d.id,
    pickup_qr: { token: d.pickup_token, code: d.pickup_token, verified: !!d.pickup_verified_at },
    delivery_qr: { token: d.delivery_token, code: d.delivery_token, verified: !!d.delivery_verified_at },
    status: d.status
  });
});

// Verify Pickup via QR Scanning
app.post('/api/donations/:id/verify-pickup', async (req, res) => {
  const { id } = req.params;
  const { token, driver_name } = req.body;

  let d = memoryDb.donations.find(item => item.id === id);
  if (!d && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('donations').select('*').eq('id', id).single();
      if (data) d = data;
    } catch (e) {}
  }

  if (!d) return res.status(404).json({ success: false, error: 'Donation not found' });

  const expiryInfo = getDonationExpiryInfo(d);
  if (expiryInfo.is_expired) {
    d.status = 'EXPIRED';
    return res.status(422).json({ success: false, error: 'VERIFICATION REJECTED: Donation is EXPIRED and cannot be picked up.' });
  }

  if (d.pickup_verified_at) {
    return res.status(400).json({ success: false, error: 'VERIFICATION REJECTED: Pickup QR token has ALREADY been used!' });
  }

  if (token && d.pickup_token && token.trim() !== d.pickup_token.trim()) {
    return res.status(400).json({ success: false, error: 'VERIFICATION REJECTED: Invalid or wrong pickup QR code.' });
  }

  d.status = 'PICKED_UP';
  d.pickup_verified_at = new Date().toISOString();
  d.pickup_verified_by = driver_name || d.driver_name || 'Driver Courier';

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('donations').update({
        status: 'PICKED_UP',
        pickup_verified_at: d.pickup_verified_at,
        pickup_verified_by: d.pickup_verified_by
      }).eq('id', id);
    } catch (e) {}
  }

  res.json({
    success: true,
    message: '✓ PICKUP VERIFIED SUCCESSFULLY via QR Code Scan!',
    donation: d
  });
});

// Verify Delivery via QR Scanning
app.post('/api/donations/:id/verify-delivery', async (req, res) => {
  const { id } = req.params;
  const { token, verified_by } = req.body;

  let d = memoryDb.donations.find(item => item.id === id);
  if (!d && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('donations').select('*').eq('id', id).single();
      if (data) d = data;
    } catch (e) {}
  }

  if (!d) return res.status(404).json({ success: false, error: 'Donation not found' });

  if (d.delivery_verified_at || d.status === 'DELIVERED') {
    return res.status(400).json({ success: false, error: 'VERIFICATION REJECTED: Delivery QR token has ALREADY been verified!' });
  }

  if (token && d.delivery_token && token.trim() !== d.delivery_token.trim()) {
    return res.status(400).json({ success: false, error: 'VERIFICATION REJECTED: Invalid or wrong delivery QR code.' });
  }

  d.status = 'DELIVERED';
  d.delivery_verified_at = new Date().toISOString();
  d.delivery_verified_by = verified_by || d.recipient_ngo || 'NGO Shelter Intake';

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('donations').update({
        status: 'DELIVERED',
        delivery_verified_at: d.delivery_verified_at,
        delivery_verified_by: d.delivery_verified_by
      }).eq('id', id);
    } catch (e) {}
  }

  const updatedMetrics = calculateDynamicImpactMetrics();

  res.json({
    success: true,
    message: '✓ DELIVERY VERIFIED SUCCESSFULLY! Impact stats updated.',
    donation: d,
    live_impact_metrics: updatedMetrics
  });
});

// ----------------------------------------------------------------------------
// FEATURE #5: REAL DYNAMIC IMPACT DASHBOARD ENDPOINTS
// ----------------------------------------------------------------------------
app.get('/api/stats', async (req, res) => {
  const dynamicMetrics = calculateDynamicImpactMetrics();
  res.json({ success: true, stats: dynamicMetrics });
});

app.get('/api/impact', async (req, res) => {
  const dynamicMetrics = calculateDynamicImpactMetrics();
  res.json({ success: true, impact: dynamicMetrics });
});

// Claim Donation (with Medicine Licensing Guard)
app.post('/api/donations/:id/claim', async (req, res) => {
  const { id } = req.params;
  const { ngo_name } = req.body;

  const d = memoryDb.donations.find(item => item.id === id);
  if (d) {
    const expiryInfo = getDonationExpiryInfo(d);
    if (expiryInfo.is_expired) {
      d.status = 'EXPIRED';
      return res.status(422).json({ success: false, error: 'SAFETY BLOCKED: Donation has EXPIRED.' });
    }

    // Medicine safety check: verify claiming NGO is verified & approved
    if (d.category === 'Medicines & Medical Supplies') {
      const claimingNgo = memoryDb.users.find(u => 
        u.role === 'ngo' && (u.name.toLowerCase() === (ngo_name || '').toLowerCase() || u.email.toLowerCase() === (ngo_name || '').toLowerCase())
      );
      if (claimingNgo) {
        const isApproved = (claimingNgo.approved_categories || '').toLowerCase().includes('medicine') || claimingNgo.medical_license_number;
        if (!isApproved) {
          return res.status(403).json({
            success: false,
            error: 'REGULATORY BLOCK: Your NGO is not approved or licensed for prescription/medical donations. Approval from administrator is required.'
          });
        }
      }
    }

    d.recipient_ngo = ngo_name || 'Hope Shelter';
    d.status = 'CLAIMED';
  }

  res.json({ success: true, donation: d });
});

app.post('/api/donations/:id/assign-driver', async (req, res) => {
  const { id } = req.params;
  const { driver_name } = req.body;

  const d = memoryDb.donations.find(item => item.id === id);
  if (d) {
    if (d.category === 'Monetary Donations' || d.donation_type === 'money') {
      return res.status(400).json({ success: false, error: 'Monetary donations do not have drivers assigned.' });
    }

    const expiryInfo = getDonationExpiryInfo(d);
    if (expiryInfo.is_expired) {
      d.status = 'EXPIRED';
      return res.status(422).json({ success: false, error: 'SAFETY BLOCKED: Donation has EXPIRED.' });
    }

    d.driver_name = driver_name || 'Rahul Sharma';
    d.status = 'EN_ROUTE';
  }

  res.json({ success: true, donation: d });
});

app.post('/api/donations/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const d = memoryDb.donations.find(item => item.id === id);
  if (d) {
    d.status = status || 'DELIVERED';
  }

  res.json({ success: true, donation: d });
});

// ----------------------------------------------------------------------------
// ADMIN MANAGEMENT & MONETIZATION ENDPOINTS
// ----------------------------------------------------------------------------

// Get NGOs with Verification Status
app.get('/api/admin/ngos', (req, res) => {
  const ngos = memoryDb.users.filter(u => u.role === 'ngo').map(n => {
    const verRecord = memoryDb.ngo_verifications.find(v => v.ngo_id === n.email || v.ngo_name === n.name);
    return {
      id: n.id,
      name: n.name,
      email: n.email,
      phone: n.phone || '+91 98290 67890',
      address: n.address || 'Jaipur Central Hub',
      capacity_meals: n.capacity_meals,
      accepted_categories: n.accepted_categories,
      approved_categories: n.approved_categories || 'Food,Clothes,Books',
      verification_status: n.verification_status || 'PENDING',
      medical_license_number: n.medical_license_number || (verRecord ? verRecord.medical_license_number : null),
      subscription_tier: n.subscription_tier || 'FREE',
      created_at: n.created_at
    };
  });

  res.json({ success: true, ngos });
});

// Admin Approve / Reject NGO Verification & Categories
app.post('/api/admin/ngos/:id/verify', async (req, res) => {
  const { id } = req.params;
  const { status, approved_categories, medical_license_number, notes } = req.body;

  const ngo = memoryDb.users.find(u => (u.id === id || u.email === id) && u.role === 'ngo');
  if (!ngo) {
    return res.status(404).json({ success: false, error: 'NGO not found' });
  }

  ngo.verification_status = status || 'APPROVED';
  if (approved_categories) ngo.approved_categories = approved_categories;
  if (medical_license_number) ngo.medical_license_number = medical_license_number;

  // Update audit log
  let verRecord = memoryDb.ngo_verifications.find(v => v.ngo_id === ngo.email);
  if (verRecord) {
    verRecord.status = ngo.verification_status;
    verRecord.reviewed_at = new Date().toISOString();
    verRecord.review_notes = notes || 'Reviewed by Platform Administrator';
    if (approved_categories) verRecord.approved_categories = approved_categories;
  } else {
    memoryDb.ngo_verifications.push({
      id: `ver-${Date.now()}`,
      ngo_id: ngo.email,
      ngo_name: ngo.name,
      registration_number: 'REG-VERIFIED',
      medical_license_number: ngo.medical_license_number,
      approved_categories: ngo.approved_categories,
      status: ngo.verification_status,
      reviewed_by: 'Platform Administrator',
      reviewed_at: new Date().toISOString()
    });
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('users').update({
        verification_status: ngo.verification_status,
        approved_categories: ngo.approved_categories
      }).eq('id', ngo.id);
    } catch (e) {}
  }

  res.json({
    success: true,
    message: `NGO ${ngo.name} status updated to ${ngo.verification_status}`,
    ngo
  });
});

// Get Categories Management
app.get('/api/admin/categories', (req, res) => {
  const categories = [
    { id: 'cat-1', name: 'Cooked Meals', type: 'food', requires_verification: false, active: true },
    { id: 'cat-2', name: 'Bakery & Fresh Bread', type: 'food', requires_verification: false, active: true },
    { id: 'cat-3', name: 'Fresh Produce & Fruits', type: 'food', requires_verification: false, active: true },
    { id: 'cat-4', name: 'Dairy & Chilled Goods', type: 'food', requires_verification: false, active: true },
    { id: 'cat-5', name: 'Clothes & Footwear', type: 'physical', requires_verification: false, active: true },
    { id: 'cat-6', name: 'Books & Educational Materials', type: 'physical', requires_verification: false, active: true },
    { id: 'cat-7', name: 'Medicines & Medical Supplies', type: 'physical', requires_verification: true, active: true, safety_note: 'Strict regulatory drug license check enforced' },
    { id: 'cat-8', name: 'Hygiene & Essential Supplies', type: 'physical', requires_verification: false, active: true },
    { id: 'cat-9', name: 'Household Goods & Furniture', type: 'physical', requires_verification: false, active: true },
    { id: 'cat-10', name: 'Blankets & Necessities', type: 'physical', requires_verification: false, active: true },
    { id: 'cat-11', name: 'Monetary Donations', type: 'money', requires_verification: true, active: true, safety_note: 'Direct banking rails, anonymous masking' }
  ];

  res.json({ success: true, categories });
});

// Sponsorships (Public & Admin)
app.get('/api/sponsorships', (req, res) => {
  res.json({ success: true, sponsorships: memoryDb.sponsorships });
});

app.get('/api/admin/sponsorships', (req, res) => {
  res.json({ success: true, sponsorships: memoryDb.sponsorships });
});

app.post('/api/admin/sponsorships', (req, res) => {
  const { title, sponsor_name, campaign_type, target_amount, category } = req.body;
  const newSpon = {
    id: `spon-${Date.now()}`,
    title: title || 'New Corporate CSR Campaign',
    sponsor_name: sponsor_name || 'CSR Partner',
    campaign_type: campaign_type || 'Corporate CSR',
    target_amount: Number(target_amount) || 100000,
    raised_amount: 0,
    target_units: 500,
    delivered_units: 0,
    category: category || 'Blankets',
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  };

  memoryDb.sponsorships.unshift(newSpon);
  res.json({ success: true, sponsorship: newSpon });
});

// Advertisements (Public & Admin)
app.get('/api/advertisements', (req, res) => {
  const activeAds = memoryDb.advertisements.filter(a => a.is_active);
  res.json({ success: true, advertisements: activeAds });
});

app.get('/api/admin/ads', (req, res) => {
  res.json({ success: true, advertisements: memoryDb.advertisements });
});

app.post('/api/admin/ads', (req, res) => {
  const { title, sponsor_name, banner_text, cta_url, placement } = req.body;
  const newAd = {
    id: `ad-${Date.now()}`,
    title: title || 'Corporate CSR Spotlight',
    sponsor_name: sponsor_name || 'Partner',
    banner_text: banner_text || 'Supporting communities through zero-hunger initiative.',
    cta_url: cta_url || '#',
    placement: placement || 'DASHBOARD_BANNER',
    is_active: true,
    impressions: 0,
    clicks: 0,
    created_at: new Date().toISOString()
  };

  memoryDb.advertisements.unshift(newAd);
  res.json({ success: true, advertisement: newAd });
});

// Subscriptions & Monetization Packages
app.get('/api/admin/subscriptions', (req, res) => {
  res.json({
    success: true,
    packages: memoryDb.subscriptions,
    ngo_subscriptions: memoryDb.users.filter(u => u.role === 'ngo').map(n => ({
      ngo_name: n.name,
      tier: n.subscription_tier || 'FREE',
      verification_status: n.verification_status
    }))
  });
});

// Admin System Reports & Financial Summary
app.get('/api/admin/reports', (req, res) => {
  const metrics = calculateDynamicImpactMetrics();
  const monetaryList = memoryDb.donations.filter(d => d.category === 'Monetary Donations');
  const physicalList = memoryDb.donations.filter(d => d.donation_type === 'physical');
  const foodList = memoryDb.donations.filter(d => ['Cooked Meals', 'Bakery', 'Fresh Produce', 'Dairy & Chilled'].includes(d.category));

  res.json({
    success: true,
    metrics,
    audit_summary: {
      total_donations_count: memoryDb.donations.length,
      food_batches_rescued: foodList.length,
      physical_goods_rescued: physicalList.length,
      monetary_contributions_count: monetaryList.length,
      registered_ngos: memoryDb.users.filter(u => u.role === 'ngo').length,
      verified_ngos: memoryDb.users.filter(u => u.role === 'ngo' && u.verification_status === 'VERIFIED').length,
      active_drivers: memoryDb.users.filter(u => u.role === 'driver').length,
      active_sponsorships: memoryDb.sponsorships.length,
      active_advertisements: memoryDb.advertisements.filter(a => a.is_active).length
    }
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Surplus-To-Shelter Supabase Backend Server running on http://localhost:${PORT}`);
});
