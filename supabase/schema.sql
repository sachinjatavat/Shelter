-- ============================================================================
-- SURPLUS-TO-SHELTER SUPABASE DATABASE SCHEMA (MULTI-CATEGORY & MONETIZATION EXPANSION)
-- Execute this SQL in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('restaurant', 'ngo', 'driver', 'admin')),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  lat NUMERIC DEFAULT 26.9124,
  lng NUMERIC DEFAULT 75.7873,
  capacity_meals INT DEFAULT 100,
  accepted_categories TEXT DEFAULT 'Food,Clothes,Books,Hygiene,Household Goods,Blankets',
  is_active BOOLEAN DEFAULT TRUE,
  active_deliveries INT DEFAULT 0,
  verification_status TEXT DEFAULT 'VERIFIED' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  approved_categories TEXT DEFAULT 'Food,Clothes,Books,Hygiene,Household Goods,Blankets',
  subscription_tier TEXT DEFAULT 'FREE' CHECK (subscription_tier IN ('FREE', 'ONBOARDED', 'PREMIUM')),
  payment_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for existing users table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('restaurant', 'ngo', 'driver', 'admin'));
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'VERIFIED';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_categories TEXT DEFAULT 'Food,Clothes,Books,Hygiene,Household Goods,Blankets';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'FREE';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_account_id TEXT;
  END IF;
END $$;

-- 2. DONATIONS TABLE (Multi-Category, AI Matching, QR Tokens & Monetary Tracking)
CREATE TABLE IF NOT EXISTS public.donations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  donation_type TEXT DEFAULT 'food' CHECK (donation_type IN ('food', 'physical', 'money')),
  quantity_kg NUMERIC DEFAULT 0,
  portions INT DEFAULT 0,
  item_condition TEXT DEFAULT 'Good',
  unit TEXT DEFAULT 'items',
  temp_requirement TEXT DEFAULT 'Ambient',
  donor_name TEXT NOT NULL,
  donor_address TEXT NOT NULL,
  donor_lat NUMERIC DEFAULT 26.9124,
  donor_lng NUMERIC DEFAULT 75.7873,
  recipient_ngo TEXT DEFAULT 'Unassigned',
  ngo_id TEXT,
  driver_name TEXT DEFAULT 'Unassigned',
  driver_id TEXT,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'MATCHED', 'CLAIMED', 'EN_ROUTE', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'EXPIRED')),
  match_score INT DEFAULT 0,
  distance_km NUMERIC DEFAULT 0,
  matched_at TIMESTAMPTZ,
  match_status TEXT DEFAULT 'UNMATCHED',
  pickup_window TEXT NOT NULL,
  expiry_minutes INT DEFAULT 240,
  pin_code TEXT DEFAULT '4829',
  
  -- Medical & Legal Safety Compliance Fields
  medical_safety_verified BOOLEAN DEFAULT FALSE,
  expiry_date TEXT,
  safety_disclaimer_accepted BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  -- Monetary Donation Fields
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  is_anonymous BOOLEAN DEFAULT FALSE,
  hide_amount BOOLEAN DEFAULT FALSE,
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'NOT_CONFIGURED')),
  payment_provider TEXT,
  payment_reference TEXT,
  
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

-- Migration for existing donations table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donations') THEN
    ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_category_check;
    ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_status_check;
    ALTER TABLE public.donations ADD CONSTRAINT donations_status_check CHECK (status IN ('AVAILABLE', 'MATCHED', 'CLAIMED', 'EN_ROUTE', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'EXPIRED'));
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS donation_type TEXT DEFAULT 'food';
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS item_condition TEXT DEFAULT 'Good';
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'items';
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS medical_safety_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS expiry_date TEXT;
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS safety_disclaimer_accepted BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS hide_amount BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS payment_provider TEXT;
    ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS payment_reference TEXT;
  END IF;
END $$;

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
  monetary_raised_inr NUMERIC DEFAULT 0,
  goods_donated_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MONETARY DONATIONS TABLE (Secure Separate Ledger for Statutory & Tax Audit)
CREATE TABLE IF NOT EXISTS public.monetary_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id TEXT REFERENCES public.donations(id) ON DELETE CASCADE,
  donor_id TEXT,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  recipient_ngo_id TEXT,
  recipient_ngo_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  is_anonymous BOOLEAN DEFAULT FALSE,
  hide_amount BOOLEAN DEFAULT FALSE,
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED')),
  payment_provider TEXT,
  payment_gateway_ref TEXT,
  webhook_verified BOOLEAN DEFAULT FALSE,
  tax_receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NGO VERIFICATIONS TABLE (Admin Approval & Regulatory Clearance Audit)
CREATE TABLE IF NOT EXISTS public.ngo_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id TEXT NOT NULL,
  ngo_name TEXT NOT NULL,
  registration_number TEXT,
  tax_exempt_80g_id TEXT,
  medical_license_number TEXT,
  approved_categories TEXT DEFAULT 'Food,Clothes,Books,Hygiene,Household Goods,Blankets',
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by TEXT DEFAULT 'System Admin',
  review_notes TEXT,
  onboarding_fee_paid BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 8. CORPORATE SPONSORSHIPS & CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_logo TEXT,
  campaign_type TEXT DEFAULT 'CSR Campaign',
  target_amount NUMERIC DEFAULT 100000,
  raised_amount NUMERIC DEFAULT 0,
  target_units INT DEFAULT 500,
  delivered_units INT DEFAULT 0,
  category TEXT DEFAULT 'Blankets',
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ADVERTISEMENTS TABLE (Controlled Platform Placement)
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  banner_text TEXT NOT NULL,
  cta_url TEXT DEFAULT '#',
  placement TEXT DEFAULT 'DASHBOARD_BANNER' CHECK (placement IN ('DASHBOARD_BANNER', 'SIDEBAR_CARD', 'DONATION_FOOTER')),
  is_active BOOLEAN DEFAULT TRUE,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NGO SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id TEXT NOT NULL,
  ngo_name TEXT NOT NULL,
  tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'ONBOARDING_PACKAGE', 'PREMIUM')),
  price_inr NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
  features JSONB DEFAULT '["Standard food feed", "Basic matching"]'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INITIAL SEED DATA (Idempotent: Safe to run repeatedly)
-- ============================================================================
INSERT INTO public.users (email, role, name, phone, address, lat, lng, capacity_meals, accepted_categories, is_active, verification_status, approved_categories, subscription_tier) VALUES
('manager@freshharvest.org', 'restaurant', 'Fresh Harvest Bistro', '+91 98290 12345', 'Plot 42, C-Scheme, Jaipur', 26.9124, 75.7873, 0, '', true, 'VERIFIED', 'All', 'FREE'),
('coordinator@hopeshelter.org', 'ngo', 'Hope Shelter & Care Center', '+91 98290 67890', 'Sector 3, JLN Marg, Jaipur', 26.8915, 75.8078, 150, 'Cooked Meals,Bakery,Fresh Produce,Clothes,Books,Hygiene,Medicines', true, 'VERIFIED', 'Food,Clothes,Books,Hygiene,Medicines,Blankets', 'PREMIUM'),
('cityfoodbank@shelter.org', 'ngo', 'City Food Bank', '+91 98290 55443', 'Raja Park, Jaipur', 26.8980, 75.8235, 80, 'Bakery,Fresh Produce,Clothes,Books', true, 'VERIFIED', 'Food,Clothes,Books', 'ONBOARDED'),
('communitykitchen@shelter.org', 'ngo', 'Community Kitchen Shelter', '+91 98290 11223', 'Sector 4, Mansarovar, Jaipur', 26.8500, 75.7700, 200, 'Cooked Meals,Dairy & Chilled,Blankets,Household Goods', true, 'PENDING', 'Food,Blankets', 'FREE'),
('driver402@surplusrescue.org', 'driver', 'Rahul Sharma (Courier #402)', '+91 98290 88402', 'Jaipur Sector 4 Grid', 26.9000, 75.7900, 0, '', true, 'VERIFIED', '', 'FREE'),
('driver403@surplusrescue.org', 'driver', 'Priya Verma (Courier #403)', '+91 98290 77403', 'Jaipur C-Scheme Hub', 26.9100, 75.7850, 0, '', true, 'VERIFIED', '', 'FREE'),
('driver404@surplusrescue.org', 'driver', 'Amit Patel (Courier #404)', '+91 98290 66404', 'Jaipur JLN Grid', 26.8950, 75.8100, 0, '', true, 'VERIFIED', '', 'FREE'),
('admin@surplusrescue.org', 'admin', 'System Administrator', '+91 98290 99999', 'Central Platform Ops Center', 26.9124, 75.7873, 0, '', true, 'VERIFIED', 'All', 'PREMIUM')
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  verification_status = EXCLUDED.verification_status,
  approved_categories = EXCLUDED.approved_categories;

-- Seed Diverse Initial Donations Across Categories
INSERT INTO public.donations (id, title, category, donation_type, quantity_kg, portions, item_condition, unit, temp_requirement, donor_name, donor_address, recipient_ngo, driver_name, status, pickup_window, pin_code) VALUES
('DON-9482', '50 Meals - Fresh Prepared Rice & Curry', 'Cooked Meals', 'food', 35, 50, 'Freshly Prepared', 'kg', 'Hot (68°C)', 'Fresh Harvest Bistro', 'C-Scheme, Jaipur', 'Hope Shelter', 'Rahul Sharma', 'EN_ROUTE', '6:30 PM - 8:00 PM', '4829'),
('DON-9483', '30 Meals - Bakery Bread & Pastries', 'Bakery', 'food', 18, 30, 'Prepared Earlier Today', 'kg', 'Ambient', 'Artisan Bakery', 'Raja Park, Jaipur', 'City Food Bank', 'Unassigned', 'CLAIMED', '7:00 PM - 9:00 PM', '1942'),
('DON-9484', '20 kg Fresh Organic Produce', 'Fresh Produce', 'food', 20, 40, 'Freshly Prepared', 'kg', 'Chilled (4°C)', 'FreshMart Organics', 'Malviya Nagar, Jaipur', 'Unassigned', 'Unassigned', 'AVAILABLE', '8:00 PM - 10:00 PM', '7301'),
('DON-CLO-101', '40 Winter Jackets & Sweaters (Assorted Sizes)', 'Clothes & Footwear', 'physical', 15, 0, 'Like New / Cleaned', 'pieces', 'Ambient Dry', 'Metro Apparel Jaipur', 'MI Road, Jaipur', 'Hope Shelter', 'Unassigned', 'AVAILABLE', '10:00 AM - 6:00 PM', '5219'),
('DON-BOK-202', '120 Children Storybooks & School Textbooks', 'Books & Educational Materials', 'physical', 25, 0, 'Good Condition', 'books', 'Ambient Dry', 'City Readers Guild', 'Tonk Road, Jaipur', 'City Food Bank', 'Unassigned', 'AVAILABLE', '11:00 AM - 5:00 PM', '3841'),
('DON-MED-303', 'Essential First Aid Kits & Paracetamol Packs (Factory Sealed)', 'Medicines & Medical Supplies', 'physical', 5, 0, 'New & Sealed', 'kits', 'Ambient Sealed', 'HealthCare Chemist', 'JLN Marg, Jaipur', 'Hope Shelter', 'Unassigned', 'AVAILABLE', '9:00 AM - 8:00 PM', '9102'),
('DON-HYG-404', '60 Hygiene Packs (Soaps, Sanitizers, Toothpaste)', 'Hygiene & Essential Supplies', 'physical', 12, 0, 'Brand New Sealed', 'packs', 'Ambient Dry', 'Wellness Care Corp', 'C-Scheme, Jaipur', 'Community Kitchen Shelter', 'Unassigned', 'AVAILABLE', '10:00 AM - 7:00 PM', '6623'),
('DON-FUR-505', '6 Wooden Study Desks & 12 Folding Chairs', 'Household Goods & Furniture', 'physical', 80, 0, 'Gently Used', 'units', 'Ambient', 'Urban Living Spaces', 'Mansarovar, Jaipur', 'Hope Shelter', 'Unassigned', 'AVAILABLE', '2:00 PM - 6:00 PM', '4412'),
('DON-BLK-606', '50 Thermal Winter Blankets (Double Layer)', 'Blankets & Necessities', 'physical', 40, 0, 'Brand New', 'blankets', 'Dry Clean Packed', 'Sunrise Textile Mills', 'Sanganer, Jaipur', 'Hope Shelter', 'Unassigned', 'AVAILABLE', '10:00 AM - 6:00 PM', '1158'),
('DON-MON-707', 'Direct Emergency Shelter Support Fund', 'Monetary Donations', 'money', 0, 0, 'N/A', 'INR', 'Digital', 'Anonymous Donor', 'Online Portal', 'Hope Shelter', 'Unassigned', 'COMPLETED', 'Immediate Direct Transfer', '0000')
ON CONFLICT (id) DO NOTHING;

-- Seed Sponsorships
INSERT INTO public.sponsorships (id, title, sponsor_name, campaign_type, target_amount, raised_amount, target_units, delivered_units, category, status)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Winter Blanket Warmth Drive 2026', 'Tata Steel CSR Foundation', 'Corporate CSR', 250000, 185000, 1000, 740, 'Blankets', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM public.sponsorships WHERE title = 'Winter Blanket Warmth Drive 2026');

-- Seed Advertisements / CSR Spotlights
INSERT INTO public.advertisements (id, title, sponsor_name, banner_text, cta_url, placement, is_active)
SELECT 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid, 'Partner in Zero Hunger Initiative', 'State Bank Foundation CSR', 'Committed to feeding 100,000 community members through sustainable surplus rescue logistics.', '#', 'DASHBOARD_BANNER', true
WHERE NOT EXISTS (SELECT 1 FROM public.advertisements WHERE sponsor_name = 'State Bank Foundation CSR');

-- Seed NGO Verification Records
INSERT INTO public.ngo_verifications (ngo_id, ngo_name, registration_number, tax_exempt_80g_id, medical_license_number, approved_categories, status, reviewed_by, onboarding_fee_paid)
SELECT 'coordinator@hopeshelter.org', 'Hope Shelter & Care Center', 'REG-RJ-2018-8491', '80G-AAATH0291D', 'DRUG-LIC-RJ-5521', 'Food,Clothes,Books,Hygiene,Medicines,Blankets,Household Goods', 'APPROVED', 'Chief System Administrator', true
WHERE NOT EXISTS (SELECT 1 FROM public.ngo_verifications WHERE ngo_name = 'Hope Shelter & Care Center');

INSERT INTO public.ngo_verifications (ngo_id, ngo_name, registration_number, tax_exempt_80g_id, medical_license_number, approved_categories, status, reviewed_by, onboarding_fee_paid)
SELECT 'communitykitchen@shelter.org', 'Community Kitchen Shelter', 'REG-RJ-2023-1102', '80G-PENDING', NULL, 'Food,Blankets', 'PENDING', 'Pending Review', false
WHERE NOT EXISTS (SELECT 1 FROM public.ngo_verifications WHERE ngo_name = 'Community Kitchen Shelter');

-- Seed Impact Logs only once
INSERT INTO public.impact_logs (meals_rescued, co2_saved_kg, tax_deduction_inr, completed_deliveries, participating_restaurants, ngos_served, drivers_involved, avg_pickup_time_mins, monetary_raised_inr, goods_donated_count)
SELECT 4850, 3200, 145200, 124, 18, 12, 15, 14.2, 385000, 420
WHERE NOT EXISTS (SELECT 1 FROM public.impact_logs);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monetary_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Clean up any prior policies
DROP POLICY IF EXISTS "Allow all access on users" ON public.users;
DROP POLICY IF EXISTS "Allow all access on donations" ON public.donations;
DROP POLICY IF EXISTS "Allow all access on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow all access on pickups" ON public.pickups;
DROP POLICY IF EXISTS "Allow all access on impact_logs" ON public.impact_logs;
DROP POLICY IF EXISTS "Allow all access on monetary_donations" ON public.monetary_donations;
DROP POLICY IF EXISTS "Allow all access on ngo_verifications" ON public.ngo_verifications;
DROP POLICY IF EXISTS "Allow all access on sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Allow all access on advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Allow all access on subscriptions" ON public.subscriptions;

-- Comprehensive read/write access policies
CREATE POLICY "Allow all access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on donations" ON public.donations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on pickups" ON public.pickups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on impact_logs" ON public.impact_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on monetary_donations" ON public.monetary_donations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on ngo_verifications" ON public.ngo_verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on sponsorships" ON public.sponsorships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on advertisements" ON public.advertisements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on subscriptions" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
