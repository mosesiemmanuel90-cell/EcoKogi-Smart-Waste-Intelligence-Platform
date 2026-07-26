-- ============================================================================
-- Migration: Recycling Vendor Setup & Seed Data
-- Purpose: Create default vendor user, recycling partner, and seed sample
--          materials, payout rates, transaction history & dashboard statistics
--          so the Vendor Portal loads without configuration errors.
-- ============================================================================

-- ============================================================================
-- STEP 1: Create vendor auth user (idempotent)
-- ============================================================================
DO $$
DECLARE
  vendor_user_id uuid := 'd0d0d0d0-1111-4000-8000-000000000001';
  existing_user record;
BEGIN
  SELECT id INTO existing_user FROM auth.users WHERE id = vendor_user_id;

  IF existing_user IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      vendor_user_id,
      '00000000-0000-0000-0000-000000000000',
      'vendor@ecokogi.ng',
      crypt('EcoKogiVendor2025!', gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', 'EcoKogi Recycling Hub'),
      'authenticated',
      'authenticated',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    RAISE NOTICE 'Created vendor auth user: vendor@ecokogi.ng';
  ELSE
    RAISE NOTICE 'Vendor auth user already exists.';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Create/update vendor profile (idempotent)
-- ============================================================================
INSERT INTO profiles (id, email, full_name, role, is_verified, eco_points, total_reports, total_weight_kg)
VALUES (
  'd0d0d0d0-1111-4000-8000-000000000001',
  'vendor@ecokogi.ng',
  'EcoKogi Recycling Hub',
  'vendor',
  true,
  0,
  0,
  0
)
ON CONFLICT (id) DO UPDATE SET
  role = 'vendor',
  is_verified = true,
  full_name = EXCLUDED.full_name;

-- ============================================================================
-- STEP 3: Create default recycling partner linked to vendor profile
-- ============================================================================
INSERT INTO recycling_partners (
  id, profile_id, business_name, contact_person, phone, email,
  address, lga, materials_accepted, is_verified, is_active
)
VALUES (
  'd0d0d0d0-2222-4000-8000-000000000001',
  'd0d0d0d0-1111-4000-8000-000000000001',
  'EcoKogi Recycling Hub',
  'EcoKogi Admin',
  '+234-800-ECO-KOGI',
  'vendor@ecokogi.ng',
  'Block A, Kogi State Recycling Complex, Lokoja',
  'Lokoja',
  ARRAY['Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'Glass', 'Textile'],
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  is_verified = true,
  is_active = true,
  profile_id = EXCLUDED.profile_id;

-- ============================================================================
-- STEP 4: Seed sample recycling transactions (history + dashboard stats)
-- ============================================================================
INSERT INTO recycling_transactions (
  id, partner_id, citizen_id, material_type, weight_kg, rate_per_kg,
  total_payout, quality_grade, status, created_at
)
VALUES
  ('d0d0d0d0-aaaa-4000-8000-000000000001',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Plastic', 25.5, 150, 3825, 'A', 'Completed', now() - interval '1 hour'),
  ('d0d0d0d0-aaaa-4000-8000-000000000002',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Metal', 12.0, 400, 4800, 'A', 'Completed', now() - interval '3 hours'),
  ('d0d0d0d0-aaaa-4000-8000-000000000003',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Paper', 40.0, 80, 3200, 'B', 'Completed', now() - interval '5 hours'),
  ('d0d0d0d0-aaaa-4000-8000-000000000004',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Organic', 60.0, 50, 3000, 'A', 'Completed', now() - interval '1 day'),
  ('d0d0d0d0-aaaa-4000-8000-000000000005',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Electronic', 5.5, 600, 3300, 'A', 'Completed', now() - interval '1 day' - interval '2 hours'),
  ('d0d0d0d0-aaaa-4000-8000-000000000006',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Plastic', 35.0, 150, 5250, 'B', 'Completed', now() - interval '2 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000007',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Glass', 18.0, 100, 1800, 'A', 'Completed', now() - interval '3 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000008',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Textile', 22.0, 60, 1320, 'B', 'Completed', now() - interval '4 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000009',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Metal', 8.5, 400, 3400, 'A', 'Completed', now() - interval '5 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000010',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Paper', 55.0, 80, 4400, 'C', 'Completed', now() - interval '6 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000011',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Plastic', 45.0, 150, 6750, 'A', 'Completed', now() - interval '10 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000012',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Electronic', 3.2, 600, 1920, 'A', 'Completed', now() - interval '12 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000013',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Metal', 15.0, 400, 6000, 'B', 'Completed', now() - interval '14 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000014',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Organic', 80.0, 50, 4000, 'A', 'Completed', now() - interval '18 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000015',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Plastic', 30.0, 150, 4500, 'B', 'Completed', now() - interval '21 days'),
  ('d0d0d0d0-aaaa-4000-8000-000000000016',
   'd0d0d0d0-2222-4000-8000-000000000001', NULL,
   'Glass', 10.0, 100, 1000, 'A', 'Pending', now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 5: Create vendor dashboard stats view
-- ============================================================================
CREATE OR REPLACE VIEW vendor_dashboard_stats WITH (security_invoker = true) AS
SELECT
  rp.id AS partner_id,
  rp.business_name,
  COUNT(rt.id) AS total_transactions,
  COALESCE(SUM(rt.weight_kg), 0) AS total_weight_kg,
  COALESCE(SUM(rt.total_payout), 0) AS total_payout,
  COALESCE(SUM(rt.weight_kg) FILTER (WHERE rt.created_at >= now() - interval '30 days'), 0) AS monthly_weight_kg,
  COALESCE(SUM(rt.total_payout) FILTER (WHERE rt.created_at >= now() - interval '30 days'), 0) AS monthly_payout,
  COUNT(rt.id) FILTER (WHERE rt.status = 'Pending') AS pending_transactions,
  COUNT(rt.id) FILTER (WHERE rt.status = 'Completed') AS completed_transactions,
  COUNT(DISTINCT rt.material_type) AS materials_processed,
  COALESCE(AVG(rt.rate_per_kg) FILTER (WHERE rt.status = 'Completed'), 0) AS avg_rate_per_kg
FROM recycling_partners rp
LEFT JOIN recycling_transactions rt ON rt.partner_id = rp.id
GROUP BY rp.id, rp.business_name;

GRANT SELECT ON vendor_dashboard_stats TO authenticated;

-- ============================================================================
-- STEP 6: Performance indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_partner_created
  ON recycling_transactions(partner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recycling_transactions_material_type
  ON recycling_transactions(material_type);

CREATE INDEX IF NOT EXISTS idx_recycling_transactions_status
  ON recycling_transactions(status);

CREATE INDEX IF NOT EXISTS idx_recycling_partners_profile
  ON recycling_partners(profile_id);

-- ============================================================================
-- STEP 7: Vendor-specific SELECT policy for own partner record
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'recycling_partners_vendor_select_own'
      AND tablename = 'recycling_partners'
  ) THEN
    CREATE POLICY recycling_partners_vendor_select_own
    ON recycling_partners
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());
  END IF;
END $$;
