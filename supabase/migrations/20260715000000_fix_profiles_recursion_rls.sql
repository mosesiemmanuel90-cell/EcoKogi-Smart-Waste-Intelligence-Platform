-- ============================================================
-- Fix Recursive RLS Policies on `profiles`
-- Resolves: "Infinite recursion detected in policy for relation 'profiles'"
-- ============================================================

-- ============================================================
-- 1. Create a SECURITY DEFINER helper function to check user role
--    This bypasses RLS to avoid recursion when checking roles
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_gov_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role IN ('government', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_vendor_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role IN ('vendor', 'admin')
  );
$$;

-- ============================================================
-- 2. Fix PROFILES policies - remove recursive self-references
-- ============================================================

-- Drop the recursive policies
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_gov_select_all" ON public.profiles;

-- Recreate using the helper functions (no recursion)
-- Admins can read all profiles
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Government/Admin can read all profiles
CREATE POLICY "profiles_gov_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_gov_or_admin());

-- ============================================================
-- 3. Fix OTHER tables' policies that reference profiles
--    These don't cause recursion but using helper functions
--    is cleaner and more performant
-- ============================================================

-- Waste Reports policies
DROP POLICY IF EXISTS "waste_reports_gov_select_all" ON public.waste_reports;
DROP POLICY IF EXISTS "waste_reports_gov_update" ON public.waste_reports;

CREATE POLICY "waste_reports_gov_select_all" ON public.waste_reports
  FOR SELECT TO authenticated
  USING (public.is_gov_or_admin());

CREATE POLICY "waste_reports_gov_update" ON public.waste_reports
  FOR UPDATE TO authenticated
  USING (public.is_gov_or_admin());

-- Officers policies
DROP POLICY IF EXISTS "officers_gov_insert" ON public.officers;
DROP POLICY IF EXISTS "officers_gov_update" ON public.officers;

CREATE POLICY "officers_gov_insert" ON public.officers
  FOR INSERT TO authenticated
  WITH CHECK (public.is_gov_or_admin());

CREATE POLICY "officers_gov_update" ON public.officers
  FOR UPDATE TO authenticated
  USING (public.is_gov_or_admin());

-- Pickup Requests policies
DROP POLICY IF EXISTS "pickup_requests_gov_select_all" ON public.pickup_requests;
DROP POLICY IF EXISTS "pickup_requests_gov_update" ON public.pickup_requests;

CREATE POLICY "pickup_requests_gov_select_all" ON public.pickup_requests
  FOR SELECT TO authenticated
  USING (public.is_gov_or_admin());

CREATE POLICY "pickup_requests_gov_update" ON public.pickup_requests
  FOR UPDATE TO authenticated
  USING (public.is_gov_or_admin());

-- Recycling Partners policies
DROP POLICY IF EXISTS "recycling_partners_vendor_insert" ON public.recycling_partners;
DROP POLICY IF EXISTS "recycling_partners_vendor_update" ON public.recycling_partners;
DROP POLICY IF EXISTS "recycling_partners_gov_select_all" ON public.recycling_partners;

CREATE POLICY "recycling_partners_vendor_insert" ON public.recycling_partners
  FOR INSERT TO authenticated
  WITH CHECK (public.is_vendor_or_admin());

CREATE POLICY "recycling_partners_vendor_update" ON public.recycling_partners
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "recycling_partners_gov_select_all" ON public.recycling_partners
  FOR SELECT TO authenticated
  USING (public.is_gov_or_admin());

-- Recycling Transactions policies
DROP POLICY IF EXISTS "recycling_transactions_gov_select_all" ON public.recycling_transactions;

CREATE POLICY "recycling_transactions_gov_select_all" ON public.recycling_transactions
  FOR SELECT TO authenticated
  USING (public.is_gov_or_admin());

-- Leaderboard policies
DROP POLICY IF EXISTS "leaderboard_admin_manage" ON public.leaderboard;

CREATE POLICY "leaderboard_admin_manage" ON public.leaderboard
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Challenges policies
DROP POLICY IF EXISTS "challenges_select" ON public.challenges;
DROP POLICY IF EXISTS "challenges_gov_insert" ON public.challenges;
DROP POLICY IF EXISTS "challenges_gov_update" ON public.challenges;

CREATE POLICY "challenges_select" ON public.challenges
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_gov_or_admin());

CREATE POLICY "challenges_gov_insert" ON public.challenges
  FOR INSERT TO authenticated
  WITH CHECK (public.is_gov_or_admin());

CREATE POLICY "challenges_gov_update" ON public.challenges
  FOR UPDATE TO authenticated
  USING (public.is_gov_or_admin());

-- Notifications policies
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;

CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_gov_or_admin());

-- Rewards policies
DROP POLICY IF EXISTS "rewards_admin_manage" ON public.rewards;

CREATE POLICY "rewards_admin_manage" ON public.rewards
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Reward Redemptions policies
DROP POLICY IF EXISTS "reward_redemptions_admin_manage" ON public.reward_redemptions;

CREATE POLICY "reward_redemptions_admin_manage" ON public.reward_redemptions
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Environmental Tips policies
DROP POLICY IF EXISTS "environmental_tips_admin_manage" ON public.environmental_tips;

CREATE POLICY "environmental_tips_admin_manage" ON public.environmental_tips
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Analytics policies
DROP POLICY IF EXISTS "analytics_gov_select" ON public.analytics;
DROP POLICY IF EXISTS "analytics_admin_manage" ON public.analytics;

CREATE POLICY "analytics_gov_select" ON public.analytics
  FOR SELECT TO authenticated
  USING (public.is_gov_or_admin());

CREATE POLICY "analytics_admin_manage" ON public.analytics
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 4. Verify waste_reports INSERT policy is correct
--    (should already be fine, but ensure it's explicit)
-- ============================================================
-- The existing policy is:
-- CREATE POLICY "waste_reports_insert" ON public.waste_reports
--   FOR INSERT TO authenticated
--   WITH CHECK (reporter_id = auth.uid());
-- This is correct and does not cause recursion.
