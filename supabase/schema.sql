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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DONATIONS TABLE (Surplus Food Postings)
CREATE TABLE IF NOT EXISTS public.donations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Cooked Meals', 'Bakery', 'Fresh Produce', 'Dairy & Chilled')),
  quantity_kg NUMERIC NOT NULL,
  portions INT NOT NULL,
  temp_requirement TEXT DEFAULT 'Ambient',
  donor_name TEXT NOT NULL,
  donor_address TEXT NOT NULL,
  recipient_ngo TEXT DEFAULT 'Unassigned',
  driver_name TEXT DEFAULT 'Unassigned',
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'CLAIMED', 'EN_ROUTE', 'PICKED_UP', 'DELIVERED')),
  pickup_window TEXT NOT NULL,
  pin_code TEXT DEFAULT '4829',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PICKUPS TABLE (Courier Dispatch & Live Tracking)
CREATE TABLE IF NOT EXISTS public.pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id TEXT REFERENCES public.donations(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  vehicle_number TEXT DEFAULT 'RJ-14-EV-9401',
  eta_minutes INT DEFAULT 12,
  status TEXT DEFAULT 'ASSIGNED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. IMPACT LOGS TABLE (Analytics & 80G Receipts)
CREATE TABLE IF NOT EXISTS public.impact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meals_rescued INT DEFAULT 0,
  co2_saved_kg NUMERIC DEFAULT 0,
  tax_deduction_inr NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================
INSERT INTO public.users (email, role, name, phone, address) VALUES
('manager@freshharvest.org', 'restaurant', 'Fresh Harvest Bistro', '+91 98290 12345', 'Plot 42, C-Scheme, Jaipur'),
('coordinator@hopeshelter.org', 'ngo', 'Hope Shelter & Care Center', '+91 98290 67890', 'Sector 3, JLN Marg, Jaipur'),
('driver402@surplusrescue.org', 'driver', 'Rahul Sharma (Courier #402)', '+91 98290 88402', 'Jaipur Sector 4 Grid'),
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.donations (id, title, category, quantity_kg, portions, temp_requirement, donor_name, donor_address, recipient_ngo, driver_name, status, pickup_window, pin_code) VALUES
('DON-9482', '50 Meals - Fresh Prepared Rice & Curry', 'Cooked Meals', 35, 50, 'Hot (68°C)', 'Fresh Harvest Bistro', 'C-Scheme, Jaipur', 'Hope Shelter', 'Rahul Sharma', 'EN_ROUTE', '6:30 PM - 8:00 PM', '4829'),
('DON-9483', '30 Meals - Bakery Bread & Pastries', 'Bakery', 18, 30, 'Ambient', 'Artisan Bakery', 'Raja Park, Jaipur', 'City Food Bank', 'Unassigned', 'CLAIMED', '7:00 PM - 9:00 PM', '1942'),
('DON-9484', '20 kg Fresh Organic Produce', 'Fresh Produce', 20, 40, 'Chilled (4°C)', 'FreshMart Organics', 'Malviya Nagar, Jaipur', 'Unassigned', 'Unassigned', 'AVAILABLE', '8:00 PM - 10:00 PM', '7301')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.impact_logs (meals_rescued, co2_saved_kg, tax_deduction_inr) VALUES
(4850, 3200, 145200);

-- Enable RLS Policies (Read Access for All)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read access on donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on pickups" ON public.pickups FOR SELECT USING (true);
CREATE POLICY "Allow public read access on impact_logs" ON public.impact_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert on donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on donations" ON public.donations FOR UPDATE USING (true);
