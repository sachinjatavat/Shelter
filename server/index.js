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
    { id: 'usr-1', email: 'manager@freshharvest.org', role: 'restaurant', name: 'Fresh Harvest Bistro', lat: 26.9124, lng: 75.7873, is_active: true },
    { id: 'ngo-1', email: 'coordinator@hopeshelter.org', role: 'ngo', name: 'Hope Shelter & Care Center', lat: 26.8915, lng: 75.8078, capacity_meals: 150, accepted_categories: 'Cooked Meals,Bakery,Fresh Produce', is_active: true },
    { id: 'ngo-2', email: 'cityfoodbank@shelter.org', role: 'ngo', name: 'City Food Bank', lat: 26.8980, lng: 75.8235, capacity_meals: 80, accepted_categories: 'Bakery,Fresh Produce', is_active: true },
    { id: 'ngo-3', email: 'communitykitchen@shelter.org', role: 'ngo', name: 'Community Kitchen Shelter', lat: 26.8500, lng: 75.7700, capacity_meals: 200, accepted_categories: 'Cooked Meals,Dairy & Chilled', is_active: true },
    { id: 'usr-3', email: 'driver402@surplusrescue.org', role: 'driver', name: 'Rahul Sharma (Courier #402)', lat: 26.9000, lng: 75.7900, is_active: true, active_deliveries: 0 },
    { id: 'usr-4', email: 'driver403@surplusrescue.org', role: 'driver', name: 'Priya Verma (Courier #403)', lat: 26.9100, lng: 75.7850, is_active: true, active_deliveries: 0 },
    { id: 'usr-5', email: 'driver404@surplusrescue.org', role: 'driver', name: 'Amit Patel (Courier #404)', lat: 26.8950, lng: 75.8100, is_active: true, active_deliveries: 0 }
  ],
  donations: [
    {
      id: 'DON-9482',
      title: '50 Meals - Fresh Prepared Rice & Curry',
      category: 'Cooked Meals',
      quantity_kg: 35,
      portions: 50,
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
      quantity_kg: 18,
      portions: 30,
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
    avg_pickup_time_mins: 14.2
  }
};

function normalizeCategory(cat) {
  if (!cat) return 'Cooked Meals';
  const c = cat.toString().trim();
  if (['Cooked Meals', 'Bakery', 'Fresh Produce', 'Dairy & Chilled'].includes(c)) return c;
  if (c.includes('Rice') || c.includes('Grain') || c.includes('Cooked') || c.includes('Pasta')) return 'Cooked Meals';
  if (c.includes('Bread') || c.includes('Bakery') || c.includes('Pastry')) return 'Bakery';
  if (c.includes('Fruit') || c.includes('Vegetable') || c.includes('Produce')) return 'Fresh Produce';
  if (c.includes('Dairy') || c.includes('Milk') || c.includes('Cheese')) return 'Dairy & Chilled';
  return 'Cooked Meals';
}

// ----------------------------------------------------------------------------
// REAL-TIME FOOD EXPIRY PROTECTION SYSTEM & HELPER
// ----------------------------------------------------------------------------
function getDonationExpiryInfo(donation) {
  const createdTime = donation.created_at ? new Date(donation.created_at).getTime() : Date.now();
  const expiryWindowMinutes = Number(donation.expiry_minutes) || 240;
  const expiryTimestamp = createdTime + (expiryWindowMinutes * 60 * 1000);
  const remainingMs = expiryTimestamp - Date.now();
  const remainingMinutes = Math.max(0, Math.floor(remainingMs / (60 * 1000)));

  if (remainingMs <= 0 || donation.status === 'EXPIRED') {
    return {
      status: 'EXPIRED',
      level: 'BLOCKED',
      color: '🔴',
      badge: 'BLOCKED ❌',
      remaining_minutes: 0,
      is_expired: true,
      expiry_timestamp: expiryTimestamp
    };
  } else if (remainingMinutes < 30) {
    return {
      status: 'CRITICAL',
      level: 'CRITICAL',
      color: '🔴',
      badge: 'CRITICAL 🔴',
      remaining_minutes: remainingMinutes,
      is_expired: false,
      expiry_timestamp: expiryTimestamp
    };
  } else if (remainingMinutes <= 60) {
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
// AUTOMATIC NGO MATCHING ALGORITHM
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

  const capacity = Number(ngo.capacity_meals) || 100;
  const portions = Number(donation.portions) || 30;
  if (capacity < portions) {
    return { score: 0, eligible: false, reason: `Insufficient capacity (${capacity} vs ${portions})` };
  }

  const accepted = (ngo.accepted_categories || 'Cooked Meals,Bakery,Fresh Produce,Dairy & Chilled').split(',').map(s => s.trim().toLowerCase());
  const categoryMatch = accepted.some(c => c === donation.category.toLowerCase());
  if (!categoryMatch) {
    return { score: 0, eligible: false, reason: `Category '${donation.category}' not accepted` };
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
  const foodScore = 100;

  let urgencyScore = 30;
  let criticalBonus = 0;

  if (expiryInfo.status === 'CRITICAL') {
    urgencyScore = 100;
    criticalBonus = 15;
  } else if (expiryInfo.status === 'URGENT') {
    urgencyScore = 85;
  } else {
    urgencyScore = 40;
  }

  const totalScore = Math.min(100, Math.round(
    (distanceScore * 0.35) +
    (capacityScore * 0.25) +
    (foodScore * 0.20) +
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
    return { success: false, reason: 'No eligible NGOs found' };
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
  let drivers = memoryDb.users.filter(u => u.role === 'driver' && u.is_active !== false);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('role', 'driver').eq('is_active', true);
      if (!error && data && data.length > 0) drivers = data;
    } catch (e) {}
  }

  // Exclude current driver who cancelled/rejected
  const candidateDrivers = drivers.filter(d => d.name !== cancellingDriverName);

  if (candidateDrivers.length === 0) {
    return { success: false, reason: 'No alternative drivers available for reassignment' };
  }

  // Score candidate drivers by distance & active workload
  const donorLat = Number(donation.donor_lat) || 26.9124;
  const donorLng = Number(donation.donor_lng) || 75.7873;

  const scoredDrivers = candidateDrivers.map(d => {
    const dist = calculateDistanceKm(donorLat, donorLng, Number(d.lat) || 26.9000, Number(d.lng) || 75.7900);
    const activeDeliveries = Number(d.active_deliveries) || 0;

    // Driver Score Formula
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

  // Build Assignment Audit History Log
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

  // Apply Reassignment to Donation
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
// DYNAMIC REAL IMPACT CALCULATOR (FEATURE #5)
// ----------------------------------------------------------------------------
function calculateDynamicImpactMetrics() {
  const deliveredDonations = memoryDb.donations.filter(d => d.status === 'DELIVERED');

  const baseMeals = 4850;
  const baseCo2 = 3200;
  const baseTax = 145200;
  const baseDeliveries = 124;

  const liveFoodRescuedKg = deliveredDonations.reduce((sum, d) => sum + (Number(d.quantity_kg) || 0), 0);
  const liveMealsRescued = deliveredDonations.reduce((sum, d) => sum + (Number(d.portions) || 0), 0);
  const liveCo2Saved = Math.round(liveFoodRescuedKg * 2.5);
  const liveTaxDeductions = Math.round(liveMealsRescued * 70);
  const liveCompletedDeliveries = deliveredDonations.length;

  const uniqueRestaurants = new Set(deliveredDonations.map(d => d.donor_name)).size;
  const uniqueNGOs = new Set(deliveredDonations.map(d => d.recipient_ngo)).size;
  const uniqueDrivers = new Set(deliveredDonations.map(d => d.driver_name)).size;

  return {
    total_food_rescued_kg: Math.round(liveFoodRescuedKg + (baseMeals * 0.7)),
    meals_rescued: baseMeals + liveMealsRescued,
    co2_saved_kg: baseCo2 + liveCo2Saved,
    tax_deductions_inr: baseTax + liveTaxDeductions,
    completed_deliveries: baseDeliveries + liveCompletedDeliveries,
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
    platform: 'Surplus-To-Shelter Unified API',
    supabaseConnected: isSupabaseConfigured,
    database: isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local Memory Storage',
    timestamp: new Date().toISOString()
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
  const { email, name, role, lat, lng, capacity_meals, accepted_categories, vehicle_number } = req.body;
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
    accepted_categories: accepted_categories || 'Cooked Meals,Bakery,Fresh Produce',
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

// Update Profile Name / Info
app.post('/api/users/profile', (req, res) => {
  const { old_name, new_name, email, role } = req.body;
  if (!new_name || !new_name.trim()) {
    return res.status(400).json({ success: false, error: 'New profile name is required.' });
  }

  const cleanNewName = new_name.trim();

  // Find and update matching user in memoryDb
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

// Get Pickups Endpoint (Dynamic Pickup & Driver List for DB Inspector)
app.get('/api/pickups', (req, res) => {
  const pickupsList = [];

  // 1. Add explicitly recorded pickups
  if (memoryDb.pickups && memoryDb.pickups.length > 0) {
    pickupsList.push(...memoryDb.pickups);
  }

  // 2. Add pickups from active donations with assigned drivers
  memoryDb.donations.forEach(d => {
    if (d.driver_name && d.driver_name !== 'Unassigned') {
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

  // 3. Add active driver standby records
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

// Get Donations (With Expiry Protection & Auto-Sweep)
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

  const decorated = combined.map(d => {
    const expiryInfo = getDonationExpiryInfo(d);
    if (expiryInfo.is_expired && d.status !== 'DELIVERED') {
      d.status = 'EXPIRED';
    }
    return { ...d, expiryInfo };
  });

  res.json({ success: true, donations: decorated });
});

// Create Donation
app.post('/api/donations', async (req, res) => {
  const donationId = `DON-${Math.floor(1000 + Math.random() * 9000)}`;
  const donation = {
    id: donationId,
    title: req.body.title || 'Surplus Food Batch',
    category: normalizeCategory(req.body.category),
    quantity_kg: Number(req.body.quantity_kg) || 20,
    portions: Number(req.body.portions) || 30,
    temp_requirement: req.body.temp_requirement || 'Ambient',
    donor_name: req.body.donor_name || 'Fresh Harvest Bistro',
    donor_address: req.body.donor_address || 'C-Scheme, Jaipur',
    donor_lat: Number(req.body.donor_lat) || 26.9124,
    donor_lng: Number(req.body.donor_lng) || 75.7873,
    recipient_ngo: 'Unassigned',
    ngo_id: null,
    driver_name: 'Unassigned',
    driver_id: null,
    status: 'AVAILABLE',
    match_score: 0,
    distance_km: 0,
    match_status: 'UNMATCHED',
    pickup_window: req.body.pickup_window || 'Next 2 Hours',
    expiry_minutes: Number(req.body.expiry_minutes) || 240,
    pin_code: `${Math.floor(1000 + Math.random() * 9000)}`,
    pickup_token: `QR-PK-${donationId}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    delivery_token: `QR-DL-${donationId}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    assignment_history: [],
    created_at: new Date().toISOString()
  };

  const expiryInfo = getDonationExpiryInfo(donation);
  if (expiryInfo.is_expired) {
    donation.status = 'EXPIRED';
    return res.status(422).json({ success: false, error: 'SAFETY BLOCKED: Cannot post EXPIRED food.', expiryInfo });
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

  // Verify Pickup Success
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

  // Verify Delivery Success
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

// Standard Claim & Assign Endpoints
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

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Surplus-To-Shelter Supabase Backend Server running on http://localhost:${PORT}`);
});
