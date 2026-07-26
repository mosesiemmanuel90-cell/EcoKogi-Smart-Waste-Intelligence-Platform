-- =============================================================================
-- EcoKogi Government Executive Dashboard - Views & Functions
-- Provides aggregated data for KPIs, charts, maps, and Power BI integration
-- =============================================================================

-- =============================================================================
-- 1. EXECUTIVE KPI SUMMARY VIEW
-- Real-time key performance indicators for the government dashboard
-- =============================================================================
CREATE OR REPLACE VIEW gov_executive_kpis AS
SELECT
  -- Waste Reports
  (SELECT COUNT(*) FROM waste_reports) AS total_waste_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Pending') AS pending_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'In Progress') AS in_progress_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Collected') AS collected_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Recycled') AS recycled_reports,
  
  -- Collection Rate
  CASE 
    WHEN (SELECT COUNT(*) FROM waste_reports) > 0 
    THEN ROUND(
      (SELECT COUNT(*) FROM waste_reports WHERE status IN ('Collected', 'Recycled'))::numeric 
      / (SELECT COUNT(*) FROM waste_reports)::numeric * 100, 1
    )
    ELSE 0 
  END AS collection_rate_percent,
  
  -- Recycling Transactions
  (SELECT COUNT(*) FROM recycling_transactions WHERE status = 'Completed') AS total_recycling_transactions,
  COALESCE((SELECT SUM(weight_kg) FROM recycling_transactions WHERE status = 'Completed'), 0) AS total_recycled_weight_kg,
  COALESCE((SELECT SUM(total_payout) FROM recycling_transactions WHERE status = 'Completed'), 0) AS total_payout_ngn,
  
  -- Pickup Requests
  (SELECT COUNT(*) FROM pickup_requests) AS total_pickup_requests,
  (SELECT COUNT(*) FROM pickup_requests WHERE status = 'Completed') AS completed_pickups,
  (SELECT COUNT(*) FROM pickup_requests WHERE status = 'Scheduled') AS scheduled_pickups,
  (SELECT COUNT(*) FROM pickup_requests WHERE status = 'In Transit') AS in_transit_pickups,
  
  -- Citizens & Users
  (SELECT COUNT(*) FROM profiles WHERE role = 'citizen') AS total_citizens,
  (SELECT COUNT(*) FROM profiles WHERE role = 'citizen' AND is_verified = true) AS verified_citizens,
  (SELECT COUNT(*) FROM profiles WHERE role = 'vendor') AS total_vendors,
  (SELECT COUNT(*) FROM profiles WHERE role = 'government') AS total_gov_officials,
  (SELECT COUNT(*) FROM profiles) AS total_users,
  
  -- Environmental Impact
  COALESCE((SELECT SUM(co2_saved_kg) FROM analytics), 0) AS total_co2_saved_kg,
  
  -- Officers
  (SELECT COUNT(*) FROM officers WHERE is_active = true) AS active_officers,
  (SELECT COUNT(*) FROM officers WHERE status = 'On Route') AS officers_on_route,
  
  -- Rewards
  (SELECT COUNT(*) FROM reward_redemptions) AS total_reward_redemptions,
  (SELECT COUNT(*) FROM reward_redemptions WHERE status = 'Delivered') AS delivered_rewards,
  
  -- Challenges
  (SELECT COUNT(*) FROM challenges WHERE is_active = true) AS active_challenges,
  (SELECT COUNT(*) FROM challenge_participations) AS total_challenge_participations,
  
  -- AI Classifications
  (SELECT COUNT(*) FROM waste_classifications WHERE status = 'completed') AS ai_classifications_completed,
  
  -- Last Updated
  NOW() AS generated_at;

GRANT SELECT ON gov_executive_kpis TO authenticated;
GRANT SELECT ON gov_executive_kpis TO service_role;


-- =============================================================================
-- 2. WASTE REPORTS BY LGA VIEW
-- Geographic distribution of waste reports for map visualization
-- =============================================================================
CREATE OR REPLACE VIEW gov_reports_by_lga AS
SELECT
  COALESCE(p.lga, 'Unknown') AS lga,
  COUNT(wr.id) AS total_reports,
  COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) AS pending,
  COUNT(CASE WHEN wr.status = 'In Progress' THEN 1 END) AS in_progress,
  COUNT(CASE WHEN wr.status = 'Collected' THEN 1 END) AS collected,
  COUNT(CASE WHEN wr.status = 'Recycled' THEN 1 END) AS recycled,
  ROUND(AVG(wr.points_earned), 0) AS avg_points_earned,
  COUNT(CASE WHEN wr.latitude IS NOT NULL AND wr.longitude IS NOT NULL THEN 1 END) AS geolocated_reports
FROM waste_reports wr
LEFT JOIN profiles p ON wr.reporter_id = p.id
GROUP BY COALESCE(p.lga, 'Unknown')
ORDER BY total_reports DESC;

GRANT SELECT ON gov_reports_by_lga TO authenticated;
GRANT SELECT ON gov_reports_by_lga TO service_role;


-- =============================================================================
-- 3. WASTE REPORTS BY TYPE VIEW
-- Waste type distribution for pie/donut charts
-- =============================================================================
CREATE OR REPLACE VIEW gov_reports_by_type AS
SELECT
  wr.waste_type,
  COUNT(*) AS total_reports,
  ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM waste_reports), 0)::numeric * 100, 1) AS percentage,
  COUNT(CASE WHEN wr.status = 'Recycled' THEN 1 END) AS recycled_count,
  COUNT(CASE WHEN wr.status = 'Collected' THEN 1 END) AS collected_count,
  COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) AS pending_count
FROM waste_reports wr
GROUP BY wr.waste_type
ORDER BY total_reports DESC;

GRANT SELECT ON gov_reports_by_type TO authenticated;
GRANT SELECT ON gov_reports_by_type TO service_role;


-- =============================================================================
-- 4. WASTE REPORTS TIMELINE VIEW
-- Time-series data for trend charts (daily aggregation)
-- =============================================================================
CREATE OR REPLACE VIEW gov_reports_timeline AS
SELECT
  DATE(wr.created_at) AS report_date,
  COUNT(*) AS total_reports,
  COUNT(CASE WHEN wr.status IN ('Collected', 'Recycled') THEN 1 END) AS resolved,
  COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) AS pending,
  COUNT(DISTINCT wr.reporter_id) AS unique_reporters
FROM waste_reports wr
WHERE wr.created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(wr.created_at)
ORDER BY report_date ASC;

GRANT SELECT ON gov_reports_timeline TO authenticated;
GRANT SELECT ON gov_reports_timeline TO service_role;


-- =============================================================================
-- 5. RECYCLING METRICS VIEW
-- Recycling transaction analytics for charts
-- =============================================================================
CREATE OR REPLACE VIEW gov_recycling_metrics AS
SELECT
  DATE(rt.created_at) AS transaction_date,
  COUNT(*) AS total_transactions,
  COALESCE(SUM(rt.weight_kg), 0) AS total_weight_kg,
  COALESCE(SUM(rt.total_payout), 0) AS total_payout_ngn,
  COUNT(DISTINCT rt.citizen_id) AS unique_citizens,
  COUNT(DISTINCT rt.partner_id) AS active_partners
FROM recycling_transactions rt
WHERE rt.status = 'Completed'
  AND rt.created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(rt.created_at)
ORDER BY transaction_date ASC;

GRANT SELECT ON gov_recycling_metrics TO authenticated;
GRANT SELECT ON gov_recycling_metrics TO service_role;


-- =============================================================================
-- 6. RECYCLING BY MATERIAL TYPE VIEW
-- Material breakdown for recycling charts
-- =============================================================================
CREATE OR REPLACE VIEW gov_recycling_by_material AS
SELECT
  rt.material_type,
  COUNT(*) AS total_transactions,
  COALESCE(SUM(rt.weight_kg), 0) AS total_weight_kg,
  COALESCE(SUM(rt.total_payout), 0) AS total_payout_ngn,
  COALESCE(AVG(rt.rate_per_kg), 0) AS avg_rate_per_kg,
  ROUND(AVG(CASE WHEN rt.quality_grade = 'A' THEN 100 WHEN rt.quality_grade = 'B' THEN 66 WHEN rt.quality_grade = 'C' THEN 33 ELSE 0 END), 1) AS avg_quality_score
FROM recycling_transactions rt
WHERE rt.status = 'Completed'
GROUP BY rt.material_type
ORDER BY total_weight_kg DESC;

GRANT SELECT ON gov_recycling_by_material TO authenticated;
GRANT SELECT ON gov_recycling_by_material TO service_role;


-- =============================================================================
-- 7. OFFICER PERFORMANCE VIEW
-- Officer metrics for performance dashboard
-- =============================================================================
CREATE OR REPLACE VIEW gov_officer_performance AS
SELECT
  o.id AS officer_id,
  o.full_name,
  o.zone,
  o.truck_id,
  o.status AS officer_status,
  o.is_active,
  COUNT(DISTINCT wr.id) AS assigned_reports,
  COUNT(DISTINCT CASE WHEN wr.status IN ('Collected', 'Recycled') THEN wr.id END) AS resolved_reports,
  COUNT(DISTINCT pr.id) AS assigned_pickups,
  COUNT(DISTINCT CASE WHEN pr.status = 'Completed' THEN pr.id END) AS completed_pickups,
  CASE 
    WHEN COUNT(DISTINCT wr.id) > 0 
    THEN ROUND(
      COUNT(DISTINCT CASE WHEN wr.status IN ('Collected', 'Recycled') THEN wr.id END)::numeric 
      / COUNT(DISTINCT wr.id)::numeric * 100, 1
    )
    ELSE 0 
  END AS resolution_rate_percent,
  CASE 
    WHEN COUNT(DISTINCT pr.id) > 0 
    THEN ROUND(
      COUNT(DISTINCT CASE WHEN pr.status = 'Completed' THEN pr.id END)::numeric 
      / COUNT(DISTINCT pr.id)::numeric * 100, 1
    )
    ELSE 0 
  END AS pickup_completion_rate
FROM officers o
LEFT JOIN waste_reports wr ON wr.assigned_officer_id = o.id
LEFT JOIN pickup_requests pr ON pr.officer_id = o.id
WHERE o.is_active = true
GROUP BY o.id, o.full_name, o.zone, o.truck_id, o.status, o.is_active
ORDER BY resolved_reports DESC;

GRANT SELECT ON gov_officer_performance TO authenticated;
GRANT SELECT ON gov_officer_performance TO service_role;


-- =============================================================================
-- 8. GEOGRAPHIC REPORT DATA VIEW (for Map visualization)
-- Returns geolocated waste reports with full details
-- =============================================================================
CREATE OR REPLACE VIEW gov_map_reports AS
SELECT
  wr.id,
  wr.waste_type,
  wr.status,
  wr.description,
  wr.latitude,
  wr.longitude,
  wr.image_url,
  wr.points_earned,
  wr.created_at,
  wr.updated_at,
  COALESCE(p.full_name, 'Anonymous') AS reporter_name,
  COALESCE(p.lga, 'Unknown') AS lga,
  COALESCE(o.full_name, 'Unassigned') AS assigned_officer
FROM waste_reports wr
LEFT JOIN profiles p ON wr.reporter_id = p.id
LEFT JOIN officers o ON wr.assigned_officer_id = o.id
WHERE wr.latitude IS NOT NULL 
  AND wr.longitude IS NOT NULL
ORDER BY wr.created_at DESC;

GRANT SELECT ON gov_map_reports TO authenticated;
GRANT SELECT ON gov_map_reports TO service_role;


-- =============================================================================
-- 9. MONTHLY ANALYTICS SUMMARY VIEW
-- Aggregated monthly metrics for executive reporting
-- =============================================================================
CREATE OR REPLACE VIEW gov_monthly_summary AS
SELECT
  DATE_TRUNC('month', period_start)::DATE AS month,
  SUM(total_reports) AS total_reports,
  SUM(total_collections) AS total_collections,
  SUM(total_weight_kg) AS total_weight_kg,
  SUM(total_payout) AS total_payout_ngn,
  SUM(co2_saved_kg) AS total_co2_saved_kg,
  AVG(active_citizens) AS avg_active_citizens,
  AVG(active_vendors) AS avg_active_vendors
FROM analytics
GROUP BY DATE_TRUNC('month', period_start)
ORDER BY month DESC;

GRANT SELECT ON gov_monthly_summary TO authenticated;
GRANT SELECT ON gov_monthly_summary TO service_role;


-- =============================================================================
-- 10. CITIZEN ENGAGEMENT VIEW
-- Citizen activity metrics for engagement analysis
-- =============================================================================
CREATE OR REPLACE VIEW gov_citizen_engagement AS
SELECT
  p.id AS citizen_id,
  p.full_name,
  p.email,
  p.lga,
  p.eco_points,
  p.total_reports,
  p.total_weight_kg,
  p.is_verified,
  p.created_at AS joined_date,
  COUNT(DISTINCT wr.id) AS waste_reports_count,
  COUNT(DISTINCT rt.id) AS recycling_transactions_count,
  COUNT(DISTINCT cp.id) AS challenges_joined,
  COUNT(DISTINCT rr.id) AS rewards_redeemed,
  GREATEST(
    COALESCE((SELECT MAX(created_at) FROM waste_reports WHERE reporter_id = p.id), p.created_at),
    COALESCE((SELECT MAX(created_at) FROM recycling_transactions WHERE citizen_id = p.id), p.created_at)
  ) AS last_activity_at
FROM profiles p
LEFT JOIN waste_reports wr ON wr.reporter_id = p.id
LEFT JOIN recycling_transactions rt ON rt.citizen_id = p.id
LEFT JOIN challenge_participations cp ON cp.profile_id = p.id
LEFT JOIN reward_redemptions rr ON rr.profile_id = p.id
WHERE p.role = 'citizen'
GROUP BY p.id, p.full_name, p.email, p.lga, p.eco_points, p.total_reports, 
         p.total_weight_kg, p.is_verified, p.created_at
ORDER BY p.eco_points DESC;

GRANT SELECT ON gov_citizen_engagement TO authenticated;
GRANT SELECT ON gov_citizen_engagement TO service_role;


-- =============================================================================
-- 11. POWER BI FLAT VIEW - Waste Reports
-- Denormalized view optimized for Power BI import/DirectQuery mode
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_waste_reports_flat AS
SELECT
  wr.id AS report_id,
  wr.waste_type,
  wr.status AS report_status,
  wr.description,
  wr.latitude,
  wr.longitude,
  wr.location AS report_location,
  wr.points_earned,
  wr.image_url,
  wr.created_at AS report_created_at,
  wr.updated_at AS report_updated_at,
  p.id AS reporter_id,
  p.full_name AS reporter_name,
  p.email AS reporter_email,
  p.lga AS reporter_lga,
  p.role AS reporter_role,
  p.eco_points AS reporter_eco_points,
  p.is_verified AS reporter_verified,
  o.id AS officer_id,
  o.full_name AS officer_name,
  o.zone AS officer_zone,
  o.truck_id AS officer_truck_id,
  o.status AS officer_status,
  wc.waste_type AS ai_classified_type,
  wc.confidence_score AS ai_confidence,
  wc.recommendation AS ai_recommendation,
  EXTRACT(YEAR FROM wr.created_at) AS report_year,
  EXTRACT(MONTH FROM wr.created_at) AS report_month,
  EXTRACT(DAY FROM wr.created_at) AS report_day,
  EXTRACT(DOW FROM wr.created_at) AS report_day_of_week,
  TO_CHAR(wr.created_at, 'YYYY-MM') AS report_year_month
FROM waste_reports wr
LEFT JOIN profiles p ON wr.reporter_id = p.id
LEFT JOIN officers o ON wr.assigned_officer_id = o.id
LEFT JOIN waste_classifications wc ON wc.user_id = wr.reporter_id 
  AND wc.created_at >= wr.created_at - INTERVAL '1 hour'
  AND wc.created_at <= wr.created_at + INTERVAL '1 hour';

GRANT SELECT ON powerbi_waste_reports_flat TO authenticated;
GRANT SELECT ON powerbi_waste_reports_flat TO service_role;


-- =============================================================================
-- 12. POWER BI RECYCLING FLAT VIEW
-- Denormalized recycling data for Power BI
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_recycling_flat AS
SELECT
  rt.id AS transaction_id,
  rt.material_type,
  rt.weight_kg,
  rt.rate_per_kg,
  rt.total_payout,
  rt.quality_grade,
  rt.status AS transaction_status,
  rt.created_at AS transaction_date,
  c.id AS citizen_id,
  c.full_name AS citizen_name,
  c.lga AS citizen_lga,
  c.eco_points AS citizen_eco_points,
  rp.id AS partner_id,
  rp.business_name AS partner_name,
  rp.lga AS partner_lga,
  rp.is_verified AS partner_verified,
  rp.is_active AS partner_active,
  EXTRACT(YEAR FROM rt.created_at) AS transaction_year,
  EXTRACT(MONTH FROM rt.created_at) AS transaction_month,
  TO_CHAR(rt.created_at, 'YYYY-MM') AS transaction_year_month
FROM recycling_transactions rt
LEFT JOIN profiles c ON rt.citizen_id = c.id
LEFT JOIN recycling_partners rp ON rt.partner_id = rp.id;

GRANT SELECT ON powerbi_recycling_flat TO authenticated;
GRANT SELECT ON powerbi_recycling_flat TO service_role;


-- =============================================================================
-- 13. FUNCTION: Get complete dashboard data in a single call
-- =============================================================================
CREATE OR REPLACE FUNCTION get_gov_dashboard_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'kpis', (
      SELECT row_to_json(k.*)::jsonb FROM gov_executive_kpis k
    ),
    'reports_by_lga', (
      SELECT COALESCE(jsonb_agg(row_to_json(l.*)::jsonb), '[]'::jsonb) FROM gov_reports_by_lga l
    ),
    'reports_by_type', (
      SELECT COALESCE(jsonb_agg(row_to_json(t.*)::jsonb), '[]'::jsonb) FROM gov_reports_by_type t
    ),
    'reports_timeline', (
      SELECT COALESCE(jsonb_agg(row_to_json(tl.*)::jsonb), '[]'::jsonb) FROM gov_reports_timeline tl
    ),
    'recycling_metrics', (
      SELECT COALESCE(jsonb_agg(row_to_json(rm.*)::jsonb), '[]'::jsonb) FROM gov_recycling_metrics rm
    ),
    'recycling_by_material', (
      SELECT COALESCE(jsonb_agg(row_to_json(rb.*)::jsonb), '[]'::jsonb) FROM gov_recycling_by_material rb
    ),
    'officer_performance', (
      SELECT COALESCE(jsonb_agg(row_to_json(op.*)::jsonb), '[]'::jsonb) FROM gov_officer_performance op
    ),
    'map_reports', (
      SELECT COALESCE(jsonb_agg(row_to_json(m.*)::jsonb), '[]'::jsonb) FROM (
        SELECT * FROM gov_map_reports LIMIT 500
      ) m
    ),
    'monthly_summary', (
      SELECT COALESCE(jsonb_agg(row_to_json(ms.*)::jsonb), '[]'::jsonb) FROM gov_monthly_summary ms
    ),
    'top_citizens', (
      SELECT COALESCE(jsonb_agg(row_to_json(ce.*)::jsonb), '[]'::jsonb) FROM (
        SELECT * FROM gov_citizen_engagement LIMIT 50
      ) ce
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_gov_dashboard_data() TO authenticated;
GRANT EXECUTE ON FUNCTION get_gov_dashboard_data() TO service_role;


-- =============================================================================
-- 14. FUNCTION: Get Kogi State LGA list
-- =============================================================================
CREATE OR REPLACE FUNCTION get_kogi_lgas()
RETURNS TABLE(lga_name TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT UNNEST(ARRAY[
    'Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah',
    'Igalamela-Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa-Muro',
    'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'
  ]) AS lga_name
  ORDER BY lga_name;
$$;

GRANT EXECUTE ON FUNCTION get_kogi_lgas() TO authenticated;
GRANT EXECUTE ON FUNCTION get_kogi_lgas() TO service_role;


-- =============================================================================
-- 15. PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_waste_reports_created_at ON waste_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waste_reports_status ON waste_reports(status);
CREATE INDEX IF NOT EXISTS idx_waste_reports_waste_type ON waste_reports(waste_type);
CREATE INDEX IF NOT EXISTS idx_waste_reports_geo ON waste_reports(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_created_at ON recycling_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_status ON recycling_transactions(status);
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_material ON recycling_transactions(material_type);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON pickup_requests(status);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_scheduled ON pickup_requests(scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_lga ON profiles(lga) WHERE lga IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_period ON analytics(period_start DESC);
