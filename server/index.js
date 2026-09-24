const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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
    { id: 'usr-1', email: 'manager@freshharvest.org', role: 'restaurant', name: 'Fresh Harvest Bistro' },
    { id: 'usr-2', email: 'coordinator@hopeshelter.org', role: 'ngo', name: 'Hope Shelter & Care Center' },
    { id: 'usr-3', email: 'driver402@surplusrescue.org', role: 'driver', name: 'Rahul Sharma (Courier #402)' },
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
      recipient_ngo: 'Hope Shelter',
      driver_name: 'Rahul Sharma',
      status: 'EN_ROUTE',
      pickup_window: '6:30 PM - 8:00 PM',
      pin_code: '4829',
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
      recipient_ngo: 'City Food Bank',
      driver_name: 'Unassigned',
      status: 'CLAIMED',
      pickup_window: '7:00 PM - 9:00 PM',
      pin_code: '1942',
      created_at: new Date().toISOString()
    }
  ],
  stats: {
    meals_rescued: 4850,
    co2_saved_kg: 3200,
    tax_deductions_inr: 145200,
    active_routes: 14
  }
};

// Helper to normalize food category to match SQL constraint
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

// ============================================================================
// API ROUTES
// ============================================================================

// 1. Health Check & Supabase Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Surplus-To-Shelter Unified API',
    supabaseConnected: isSupabaseConfigured,
    database: isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local Memory Storage',
    timestamp: new Date().toISOString()
  });
});

// 2. Auth Login Endpoint
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

  // Memory fallback lookup
  const user = memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (user) {
    return res.json({ success: true, user });
  }

  // If not found in DB
  return res.status(404).json({
    success: false,
    error: `There isn't any account created using this email (${email}). Please register first.`
  });
});

// 2b. Get All Users Endpoint
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
    if (!existingEmails.has(item.email)) {
      combined.push(item);
    }
  }

  res.json({ success: true, users: combined });
});

// 2c. Register New User Endpoint (Drivers, Restaurants, NGOs)
app.post('/api/users', async (req, res) => {
  const { email, role, name, phone, address } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const newUser = {
    email,
    role: role || 'driver',
    name: name || email.split('@')[0],
    phone: phone || '',
    address: address || '',
    created_at: new Date().toISOString()
  };

  memoryDb.users.unshift(newUser);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').insert([newUser]).select();
      if (error) {
        console.warn('Supabase user insert notice:', error.message);
      } else if (data && data.length > 0) {
        console.log('✅ New User Saved to Supabase:', data[0]);
        return res.json({ success: true, user: data[0], storage: 'supabase' });
      }
    } catch (e) {
      console.error('Error inserting user to Supabase:', e);
    }
  }

  res.json({ success: true, user: newUser, storage: 'memory' });
});


// 3. Get All Donations
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
    if (!existingIds.has(item.id)) {
      combined.push(item);
    }
  }

  res.json({ success: true, donations: combined });
});

// 4. Create New Surplus Food Donation
app.post('/api/donations', async (req, res) => {
  const donation = {
    id: `DON-${Math.floor(1000 + Math.random() * 9000)}`,
    title: req.body.title || 'Surplus Food Batch',
    category: normalizeCategory(req.body.category),
    quantity_kg: Number(req.body.quantity_kg) || 20,
    portions: Number(req.body.portions) || 30,
    temp_requirement: req.body.temp_requirement || 'Ambient',
    donor_name: req.body.donor_name || 'Fresh Harvest Bistro',
    donor_address: req.body.donor_address || 'C-Scheme, Jaipur',
    recipient_ngo: 'Unassigned',
    driver_name: 'Unassigned',
    status: 'AVAILABLE',
    pickup_window: req.body.pickup_window || 'Next 2 Hours',
    pin_code: `${Math.floor(1000 + Math.random() * 9000)}`,
    created_at: new Date().toISOString()
  };

  memoryDb.donations.unshift(donation);
  memoryDb.stats.meals_rescued += donation.portions;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('donations').insert([donation]).select();
      if (error) {
        console.warn('⚠️ Supabase donations insert notice:', error.message);
      } else if (data && data.length > 0) {
        console.log('✅ Donation saved directly to Supabase DB:', data[0].id);
        return res.json({ success: true, donation: data[0], storage: 'supabase' });
      }
    } catch (e) {
      console.warn('Supabase donation insert exception:', e.message);
    }
  }

  res.json({ success: true, donation, storage: 'memory' });
});

// 5. NGO Claim Donation
app.post('/api/donations/:id/claim', async (req, res) => {
  const { id } = req.params;
  const { ngo_name } = req.body;

  const d = memoryDb.donations.find(item => item.id === id);
  if (d) {
    d.recipient_ngo = ngo_name || 'Hope Shelter';
    d.status = 'CLAIMED';
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('donations')
        .update({ recipient_ngo: ngo_name || 'Hope Shelter', status: 'CLAIMED' })
        .eq('id', id)
        .select();
      if (!error && data && data.length > 0) return res.json({ success: true, donation: data[0] });
    } catch (e) {}
  }

  res.json({ success: true, donation: d });
});

// 6. Assign Driver Courier
app.post('/api/donations/:id/assign-driver', async (req, res) => {
  const { id } = req.params;
  const { driver_name } = req.body;

  const d = memoryDb.donations.find(item => item.id === id);
  if (d) {
    d.driver_name = driver_name || 'Rahul Sharma';
    d.status = 'EN_ROUTE';
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('donations')
        .update({ driver_name: driver_name || 'Rahul Sharma', status: 'EN_ROUTE' })
        .eq('id', id)
        .select();
      if (!error && data && data.length > 0) return res.json({ success: true, donation: data[0] });
    } catch (e) {}
  }

  res.json({ success: true, donation: d });
});

// 7. Update Delivery Status
app.post('/api/donations/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const d = memoryDb.donations.find(item => item.id === id);
  if (d) {
    d.status = status || 'DELIVERED';
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('donations')
        .update({ status: status || 'DELIVERED' })
        .eq('id', id)
        .select();
      if (!error && data && data.length > 0) return res.json({ success: true, donation: data[0] });
    } catch (e) {}
  }

  res.json({ success: true, donation: d });
});

// 8. Get Platform Telemetry & Stats
app.get('/api/stats', async (req, res) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('impact_logs').select('*').single();
      if (!error && data) return res.json({ success: true, stats: data });
    } catch (e) {}
  }
  res.json({ success: true, stats: memoryDb.stats });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Surplus-To-Shelter Supabase Backend Server running on http://localhost:${PORT}`);
});

