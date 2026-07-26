-- ============================================================================
-- Migration: Fleet Management RLS - Authenticated SELECT
-- Purpose: Allow all authenticated users to read fleet data so the GovPortal
--          Fleet Management page displays vehicles, routes, assignments, etc.
--          The GovPortal UI is already gated at the app routing level.
-- ============================================================================

-- Fleet vehicles: allow authenticated SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'fleet_vehicles_authenticated_select'
      AND tablename = 'fleet_vehicles'
  ) THEN
    CREATE POLICY fleet_vehicles_authenticated_select
    ON fleet_vehicles
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Fleet routes: allow authenticated SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'fleet_routes_authenticated_select'
      AND tablename = 'fleet_routes'
  ) THEN
    CREATE POLICY fleet_routes_authenticated_select
    ON fleet_routes
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Fleet assignments: allow authenticated SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'fleet_assignments_authenticated_select'
      AND tablename = 'fleet_assignments'
  ) THEN
    CREATE POLICY fleet_assignments_authenticated_select
    ON fleet_assignments
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Fleet schedules: allow authenticated SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'fleet_schedules_authenticated_select'
      AND tablename = 'fleet_schedules'
  ) THEN
    CREATE POLICY fleet_schedules_authenticated_select
    ON fleet_schedules
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;
