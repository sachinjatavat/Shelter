-- ============================================================================
-- SURPLUS-TO-SHELTER SUPABASE DATABASE SCHEMA
-- Execute this SQL in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('restaurant', 'ngo', 'driver')),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  lat NUMERIC DEFAULT 26.9124,
  lng NUMERIC DEFAULT 75.7873,
  capacity_meals INT DEFAULT 100,
  accepted_categories TEXT DEFAULT 'Cooked Meals,Bakery,Fresh Produce,Dairy & Chilled',
  is_active BOOLEAN DEFAULT TRUE,
  active_deliveries INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DONATIONS TABLE (Surplus Food Postings, AI Matching & QR Tokens)
CREATE TABLE IF NOT EXISTS public.donations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Cooked Meals', 'Bakery', 'Fresh Produce', 'Dairy & Chilled')),
  quantity_kg NUMERIC NOT NULL,
  portions INT NOT NULL,
  temp_requirement TEXT DEFAULT 'Ambient',
  donor_name TEXT NOT NULL,
  donor_address TEXT NOT NULL,
  donor_lat NUMERIC DEFAULT 26.9124,
  donor_lng NUMERIC DEFAULT 75.7873,
  recipient_ngo TEXT DEFAULT 'Unassigned',
  ngo_id TEXT,
  driver_name TEXT DEFAULT 'Unassigned',
  driver_id TEXT,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'MATCHED', 'CLAIMED', 'EN_ROUTE', 'PICKED_UP', 'DELIVERED', 'EXPIRED')),
  match_score INT DEFAULT 0,
  distance_km NUMERIC DEFAULT 0,
  matched_at TIMESTAMPTZ,
  match_status TEXT DEFAULT 'UNMATCHED',
  pickup_window TEXT NOT NULL,
  expiry_minutes INT DEFAULT 240,
  pin_code TEXT DEFAULT '4829',
  
  -- QR Verification Tokens
  pickup_token TEXT,
  delivery_token TEXT,
  pickup_verified_at TIMESTAMPTZ,
  pickup_verified_by TEXT,
  delivery_verified_at TIMESTAMPTZ,
  delivery_verified_by TEXT,
  
  -- Driver Reassignment Audit Log
  assignment_history JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MATCHES TABLE (Audit Trail for NGO Matching)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id TEXT REFERENCES public.donations(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  match_score INT NOT NULL,
  distance_km NUMERIC NOT NULL,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  match_status TEXT DEFAULT 'MATCHED'
);

-- 4. PICKUPS TABLE (Courier Dispatch, Reassignments & Live Tracking)
CREATE TABLE IF NOT EXISTS public.pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id TEXT REFERENCES public.donations(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  driver_id TEXT,
  reassigned_from TEXT,
  vehicle_number TEXT DEFAULT 'RJ-14-EV-9401',
  eta_minutes INT DEFAULT 12,
  status TEXT DEFAULT 'ASSIGNED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. IMPACT LOGS TABLE (Real Dynamic Analytics)
CREATE TABLE IF NOT EXISTS public.impact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meals_rescued INT DEFAULT 0,
  co2_saved_kg NUMERIC DEFAULT 0,
  tax_deduction_inr NUMERIC DEFAULT 0,
  completed_deliveries INT DEFAULT 0,
  participating_restaurants INT DEFAULT 0,
  ngos_served INT DEFAULT 0,
  drivers_involved INT DEFAULT 0,
  avg_pickup_time_mins NUMERIC DEFAULT 15,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================
INSERT INTO public.users (email, role, name, phone, address, lat, lng, capacity_meals, accepted_categories, is_active) VALUES
('manager@freshharvest.org', 'restaurant', 'Fresh Harvest Bistro', '+91 98290 12345', 'Plot 42, C-Scheme, Jaipur', 26.9124, 75.7873, 0, '', true),
('coordinator@hopeshelter.org', 'ngo', 'Hope Shelter & Care Center', '+91 98290 67890', 'Sector 3, JLN Marg, Jaipur', 26.8915, 75.8078, 150, 'Cooked Meals,Bakery,Fresh Produce', true),
('cityfoodbank@shelter.org', 'ngo', 'City Food Bank', '+91 98290 55443', 'Raja Park, Jaipur', 26.8980, 75.8235, 80, 'Bakery,Fresh Produce', true),
('communitykitchen@shelter.org', 'ngo', 'Community Kitchen Shelter', '+91 98290 11223', 'Sector 4, Mansarovar, Jaipur', 26.8500, 75.7700, 200, 'Cooked Meals,Dairy & Chilled', true),
('driver402@surplusrescue.org', 'driver', 'Rahul Sharma (Courier #402)', '+91 98290 88402', 'Jaipur Sector 4 Grid', 26.9000, 75.7900, 0, '', true),
('driver403@surplusrescue.org', 'driver', 'Priya Verma (Courier #403)', '+91 98290 77403', 'Jaipur C-Scheme Hub', 26.9100, 75.7850, 0, '', true),
('driver404@surplusrescue.org', 'driver', 'Amit Patel (Courier #404)', '+91 98290 66404', 'Jaipur JLN Grid', 26.8950, 75.8100, 0, '', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.donations (id, title, category, quantity_kg, portions, temp_requirement, donor_name, donor_address, recipient_ngo, driver_name, status, pickup_window, pin_code) VALUES
('DON-9482', '50 Meals - Fresh Prepared Rice & Curry', 'Cooked Meals', 35, 50, 'Hot (68°C)', 'Fresh Harvest Bistro', 'C-Scheme, Jaipur', 'Hope Shelter', 'Rahul Sharma', 'EN_ROUTE', '6:30 PM - 8:00 PM', '4829'),
('DON-9483', '30 Meals - Bakery Bread & Pastries', 'Bakery', 18, 30, 'Ambient', 'Artisan Bakery', 'Raja Park, Jaipur', 'City Food Bank', 'Unassigned', 'CLAIMED', '7:00 PM - 9:00 PM', '1942'),
('DON-9484', '20 kg Fresh Organic Produce', 'Fresh Produce', 20, 40, 'Chilled (4°C)', 'FreshMart Organics', 'Malviya Nagar, Jaipur', 'Unassigned', 'Unassigned', 'AVAILABLE', '8:00 PM - 10:00 PM', '7301')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.impact_logs (meals_rescued, co2_saved_kg, tax_deduction_inr, completed_deliveries, participating_restaurants, ngos_served, drivers_involved, avg_pickup_time_mins) VALUES
(4850, 3200, 145200, 124, 18, 12, 15, 14.2);

-- Enable RLS Policies (Read Access for All)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read access on donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access on pickups" ON public.pickups FOR SELECT USING (true);
CREATE POLICY "Allow public read access on impact_logs" ON public.impact_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert on donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on donations" ON public.donations FOR UPDATE USING (true);
