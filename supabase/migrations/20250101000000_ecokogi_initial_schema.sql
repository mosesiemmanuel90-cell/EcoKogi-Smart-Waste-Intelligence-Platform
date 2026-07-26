-- ============================================================
-- EcoKogi Initial Schema Migration
-- Waste Management & Recycling Ecosystem for Kogi State
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'government', 'vendor', 'admin')),
  eco_points INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  lga TEXT, -- Local Government Area in Kogi State
  address TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  total_reports INTEGER NOT NULL DEFAULT 0,
  total_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 2. WASTE REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.waste_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  waste_type TEXT NOT NULL CHECK (waste_type IN ('Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'General')),
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Collected', 'Recycled')),
  points_earned INTEGER NOT NULL DEFAULT 50,
  assigned_officer_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER waste_reports_updated_at
  BEFORE UPDATE ON public.waste_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 3. OFFICERS TABLE (Government/Collection Staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  zone TEXT NOT NULL DEFAULT 'Lokoja Central',
  truck_id TEXT,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'On Route', 'Offline')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Now add the FK from waste_reports to officers (deferred since officers table created after)
-- Already handled inline above since officers table exists before waste_reports references it
-- Actually we need to reorder - let me fix this

-- ============================================================
-- 4. PICKUP REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pickup_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  officer_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
  waste_type TEXT NOT NULL CHECK (waste_type IN ('Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'General')),
  estimated_weight_kg DECIMAL(10,2),
  pickup_address TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Assigned', 'In Transit', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER pickup_requests_updated_at
  BEFORE UPDATE ON public.pickup_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 5. RECYCLING PARTNERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recycling_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  lga TEXT NOT NULL DEFAULT 'Lokoja',
  materials_accepted TEXT[] NOT NULL DEFAULT '{}',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. RECYCLING TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recycling_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES public.recycling_partners(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  material_type TEXT NOT NULL CHECK (material_type IN ('Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'General')),
  weight_kg DECIMAL(10,2) NOT NULL,
  rate_per_kg INTEGER NOT NULL DEFAULT 0,
  total_payout INTEGER NOT NULL DEFAULT 0,
  quality_grade TEXT DEFAULT 'A' CHECK (quality_grade IN ('A', 'B', 'C')),
  status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Disputed')),
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. LEADERBOARD TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly', 'all_time')),
  rank INTEGER NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_reports INTEGER NOT NULL DEFAULT 0,
  total_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, period)
);

CREATE TRIGGER leaderboard_updated_at
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 8. COMMUNITY CHALLENGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'collection' CHECK (challenge_type IN ('collection', 'recycling', 'awareness', 'community')),
  target_value INTEGER NOT NULL DEFAULT 100,
  current_value INTEGER NOT NULL DEFAULT 0,
  reward_points INTEGER NOT NULL DEFAULT 500,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. CHALLENGE PARTICIPATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenge_participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contribution INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(challenge_id, profile_id)
);

-- ============================================================
-- 10. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'reward', 'pickup', 'report', 'challenge', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  reference_id UUID, -- Can reference a report, pickup, etc.
  reference_type TEXT, -- 'waste_report', 'pickup_request', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. REWARDS CATALOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  provider TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('data', 'transport', 'environment', 'food', 'general')),
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT -1, -- -1 means unlimited
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. REWARD REDEMPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Delivered', 'Cancelled')),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. ENVIRONMENTAL TIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.environmental_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('recycling', 'composting', 'reduction', 'general')),
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 14. ANALYTICS TABLE (Aggregated data for dashboards)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  lga TEXT,
  total_reports INTEGER NOT NULL DEFAULT 0,
  total_collections INTEGER NOT NULL DEFAULT 0,
  total_weight_kg DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_payout INTEGER NOT NULL DEFAULT 0,
  co2_saved_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  active_citizens INTEGER NOT NULL DEFAULT 0,
  active_vendors INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(period_type, period_start, lga)
);

-- ============================================================
-- INDEXES (Performance Optimization)
-- ============================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_lga ON public.profiles(lga);
CREATE INDEX IF NOT EXISTS idx_profiles_eco_points ON public.profiles(eco_points DESC);

-- Waste Reports
CREATE INDEX IF NOT EXISTS idx_waste_reports_reporter_id ON public.waste_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_waste_reports_status ON public.waste_reports(status);
CREATE INDEX IF NOT EXISTS idx_waste_reports_waste_type ON public.waste_reports(waste_type);
CREATE INDEX IF NOT EXISTS idx_waste_reports_created_at ON public.waste_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waste_reports_assigned_officer ON public.waste_reports(assigned_officer_id);

-- Officers
CREATE INDEX IF NOT EXISTS idx_officers_zone ON public.officers(zone);
CREATE INDEX IF NOT EXISTS idx_officers_status ON public.officers(status);
CREATE INDEX IF NOT EXISTS idx_officers_profile_id ON public.officers(profile_id);

-- Pickup Requests
CREATE INDEX IF NOT EXISTS idx_pickup_requests_citizen_id ON public.pickup_requests(citizen_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_officer_id ON public.pickup_requests(officer_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON public.pickup_requests(status);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_scheduled_date ON public.pickup_requests(scheduled_date);

-- Recycling Partners
CREATE INDEX IF NOT EXISTS idx_recycling_partners_lga ON public.recycling_partners(lga);
CREATE INDEX IF NOT EXISTS idx_recycling_partners_profile_id ON public.recycling_partners(profile_id);

-- Recycling Transactions
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_partner_id ON public.recycling_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_citizen_id ON public.recycling_transactions(citizen_id);
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_material_type ON public.recycling_transactions(material_type);
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_created_at ON public.recycling_transactions(created_at DESC);

-- Leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON public.leaderboard(period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(period, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_profile_id ON public.leaderboard(profile_id);

-- Challenges
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON public.challenges(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON public.challenges(end_date);

-- Challenge Participations
CREATE INDEX IF NOT EXISTS idx_challenge_participations_challenge_id ON public.challenge_participations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_profile_id ON public.challenge_participations(profile_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Rewards
CREATE INDEX IF NOT EXISTS idx_rewards_is_active ON public.rewards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_rewards_category ON public.rewards(category);

-- Reward Redemptions
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_profile_id ON public.reward_redemptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward_id ON public.reward_redemptions(reward_id);

-- Environmental Tips
CREATE INDEX IF NOT EXISTS idx_environmental_tips_is_active ON public.environmental_tips(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_environmental_tips_display_order ON public.environmental_tips(display_order);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_period ON public.analytics(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_analytics_lga ON public.analytics(lga);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycling_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycling_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Government can read all profiles
CREATE POLICY "profiles_gov_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- ============================================================
-- WASTE REPORTS POLICIES
-- ============================================================
-- Citizens can read their own reports
CREATE POLICY "waste_reports_select_own" ON public.waste_reports
  FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

-- Citizens can create reports
CREATE POLICY "waste_reports_insert" ON public.waste_reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Government/Admin can read all reports
CREATE POLICY "waste_reports_gov_select_all" ON public.waste_reports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- Government/Admin can update reports (status changes)
CREATE POLICY "waste_reports_gov_update" ON public.waste_reports
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- ============================================================
-- OFFICERS POLICIES
-- ============================================================
-- Authenticated users can read officers (for assignment)
CREATE POLICY "officers_select" ON public.officers
  FOR SELECT TO authenticated
  USING (true);

-- Government/Admin can manage officers
CREATE POLICY "officers_gov_insert" ON public.officers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

CREATE POLICY "officers_gov_update" ON public.officers
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- ============================================================
-- PICKUP REQUESTS POLICIES
-- ============================================================
-- Citizens can read their own pickup requests
CREATE POLICY "pickup_requests_select_own" ON public.pickup_requests
  FOR SELECT TO authenticated
  USING (citizen_id = auth.uid());

-- Citizens can create pickup requests
CREATE POLICY "pickup_requests_insert" ON public.pickup_requests
  FOR INSERT TO authenticated
  WITH CHECK (citizen_id = auth.uid());

-- Government/Admin can read and manage all
CREATE POLICY "pickup_requests_gov_select_all" ON public.pickup_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

CREATE POLICY "pickup_requests_gov_update" ON public.pickup_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- ============================================================
-- RECYCLING PARTNERS POLICIES
-- ============================================================
-- Authenticated users can read active partners
CREATE POLICY "recycling_partners_select" ON public.recycling_partners
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Vendors can create their own partner profile
CREATE POLICY "recycling_partners_vendor_insert" ON public.recycling_partners
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('vendor', 'admin')
    )
  );

-- Vendors can update their own partner profile
CREATE POLICY "recycling_partners_vendor_update" ON public.recycling_partners
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Government can read all
CREATE POLICY "recycling_partners_gov_select_all" ON public.recycling_partners
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- ============================================================
-- RECYCLING TRANSACTIONS POLICIES
-- ============================================================
-- Vendors can read and create their own transactions
CREATE POLICY "recycling_transactions_vendor_select" ON public.recycling_transactions
  FOR SELECT TO authenticated
  USING (
    partner_id IN (
      SELECT rp.id FROM public.recycling_partners rp WHERE rp.profile_id = auth.uid()
    )
    OR citizen_id = auth.uid()
  );

CREATE POLICY "recycling_transactions_vendor_insert" ON public.recycling_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    partner_id IN (
      SELECT rp.id FROM public.recycling_partners rp WHERE rp.profile_id = auth.uid()
    )
  );

-- Government can read all transactions
CREATE POLICY "recycling_transactions_gov_select_all" ON public.recycling_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- ============================================================
-- LEADERBOARD POLICIES
-- ============================================================
-- Public read access for authenticated users
CREATE POLICY "leaderboard_select" ON public.leaderboard
  FOR SELECT TO authenticated
  USING (true);

-- Only system/admin can modify (via edge functions)
CREATE POLICY "leaderboard_admin_manage" ON public.leaderboard
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- CHALLENGES POLICIES
-- ============================================================
-- Public read for active challenges
CREATE POLICY "challenges_select" ON public.challenges
  FOR SELECT TO authenticated
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
  ));

-- Government/Admin can manage challenges
CREATE POLICY "challenges_gov_insert" ON public.challenges
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

CREATE POLICY "challenges_gov_update" ON public.challenges
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- ============================================================
-- CHALLENGE PARTICIPATIONS POLICIES
-- ============================================================
CREATE POLICY "challenge_participations_select" ON public.challenge_participations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "challenge_participations_insert" ON public.challenge_participations
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "challenge_participations_update_own" ON public.challenge_participations
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================
-- Users can read their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System/Admin can create notifications (via edge functions)
CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- ============================================================
-- REWARDS POLICIES
-- ============================================================
-- Public read for active rewards
CREATE POLICY "rewards_select" ON public.rewards
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Admin can manage rewards
CREATE POLICY "rewards_admin_manage" ON public.rewards
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- REWARD REDEMPTIONS POLICIES
-- ============================================================
-- Users can read their own redemptions
CREATE POLICY "reward_redemptions_select_own" ON public.reward_redemptions
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- Users can redeem rewards
CREATE POLICY "reward_redemptions_insert" ON public.reward_redemptions
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Admin can manage all redemptions
CREATE POLICY "reward_redemptions_admin_manage" ON public.reward_redemptions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- ENVIRONMENTAL TIPS POLICIES
-- ============================================================
-- Public read for active tips
CREATE POLICY "environmental_tips_select" ON public.environmental_tips
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Admin can manage tips
CREATE POLICY "environmental_tips_admin_manage" ON public.environmental_tips
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- ANALYTICS POLICIES
-- ============================================================
-- Government/Admin can read analytics
CREATE POLICY "analytics_gov_select" ON public.analytics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('government', 'admin')
    )
  );

-- Admin can manage analytics
CREATE POLICY "analytics_admin_manage" ON public.analytics
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- STORAGE BUCKET: waste_images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('waste_images', 'waste_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload
CREATE POLICY "waste_images_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'waste_images');

-- Anyone can view waste images (public bucket)
CREATE POLICY "waste_images_view" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'waste_images');

-- Users can update their own uploads
CREATE POLICY "waste_images_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'waste_images');

-- Users can delete their own uploads
CREATE POLICY "waste_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'waste_images');

-- ============================================================
-- SEED DATA: Rewards Catalog
-- ============================================================
INSERT INTO public.rewards (title, description, points_cost, provider, category) VALUES
  ('Data Bundle 1GB', '1GB MTN data bundle for Kogi residents', 200, 'MTN Kogi', 'data'),
  ('Bus Fare Voucher', '₦500 bus fare credit for Kogi Link transport', 150, 'Kogi Link', 'transport'),
  ('Plant a Tree', 'We plant a tree in your name in Kogi State', 100, 'EcoKogi', 'environment'),
  ('Reusable Shopping Bag', 'Eco-friendly reusable shopping bag', 300, 'EcoKogi', 'general'),
  ('Phone Charging Credit', '₦200 phone charging credit', 100, 'Kogi Power', 'general'),
  ('Pure Water Pack (10)', '10 packs of purified water', 250, 'Kogi Pure Water', 'food'),
  ('Data Bundle 2GB', '2GB Airtel data bundle', 350, 'Airtel Kogi', 'data'),
  ('Community Garden Kit', 'Starter kit for home composting garden', 500, 'EcoKogi', 'environment')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Environmental Tips
-- ============================================================
INSERT INTO public.environmental_tips (title, content, category, display_order) VALUES
  ('Reduce Plastic Use', 'Carry a reusable bag when shopping in Lokoja markets. Every bag refused is a step towards a cleaner Kogi.', 'reduction', 1),
  ('Compost Organic Waste', 'Turn your kitchen scraps into rich fertilizer. Mix brown (dry leaves) and green (food scraps) materials for best results.', 'composting', 2),
  ('Separate Your Waste', 'Use different bins for plastic, paper, metal, and organic waste. This makes recycling easier and more valuable.', 'recycling', 3),
  ('Report Illegal Dumping', 'See waste being dumped in waterways? Report it through the EcoKogi app and earn points while protecting our rivers.', 'general', 4),
  ('E-Waste Awareness', 'Old phones and electronics contain valuable materials. Never throw them in regular bins — bring them to a RecyclePoint vendor.', 'recycling', 5),
  ('Confluence Clean-Up', 'Join monthly clean-up events at the Niger-Benue confluence. Together we keep Kogi State beautiful!', 'general', 6)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Community Challenges
-- ============================================================
INSERT INTO public.challenges (title, description, challenge_type, target_value, reward_points, end_date) VALUES
  ('Lokoja Clean Streets', 'Collect 500kg of waste from Lokoja streets this month', 'collection', 500, 1000, now() + interval '30 days'),
  ('Plastic-Free Week', 'Report 100 plastic waste locations in 7 days', 'recycling', 100, 500, now() + interval '7 days'),
  ('Okene Green Initiative', 'Plant 50 trees in Okene LGA', 'community', 50, 750, now() + interval '60 days')
ON CONFLICT DO NOTHING;
