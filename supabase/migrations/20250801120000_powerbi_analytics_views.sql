-- =============================================================================
-- EcoKogi Power BI Analytics Views
-- Comprehensive SQL views for Microsoft Power BI data consumption
-- Covers: Executive KPIs, Environmental Health Index, Environmental Priority
-- Index, EcoScore Analytics, Citizen Participation, Recycling Analytics,
-- Waste Collection Performance, and Community Leaderboard
-- =============================================================================

-- Drop existing views to allow column restructuring
DROP VIEW IF EXISTS powerbi_available_datasets CASCADE;
DROP VIEW IF EXISTS powerbi_executive_kpis CASCADE;
DROP VIEW IF EXISTS powerbi_environmental_health_index CASCADE;
DROP VIEW IF EXISTS powerbi_environmental_priority_index CASCADE;
DROP VIEW IF EXISTS powerbi_ecoscore_analytics CASCADE;
DROP VIEW IF EXISTS powerbi_citizen_participation_flat CASCADE;
DROP VIEW IF EXISTS powerbi_recycling_analytics_enhanced CASCADE;
DROP VIEW IF EXISTS powerbi_collection_performance CASCADE;
DROP VIEW IF EXISTS powerbi_community_leaderboard CASCADE;

-- =============================================================================
-- 1. EXECUTIVE KPIs VIEW
-- Single-row summary of all key performance indicators for Power BI
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_executive_kpis AS
SELECT
  -- Waste Reports Summary
  (SELECT COUNT(*) FROM waste_reports) AS total_waste_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Pending') AS pending_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'In Progress') AS in_progress_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Collected') AS collected_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Recycled') AS recycled_reports,

  -- Collection & Recycling Rates
  CASE
    WHEN (SELECT COUNT(*) FROM waste_reports) > 0
    THEN ROUND(
      (SELECT COUNT(*) FROM waste_reports WHERE status IN ('Collected', 'Recycled'))::numeric
      / (SELECT COUNT(*) FROM waste_reports)::numeric * 100, 1
    )
    ELSE 0
  END AS collection_rate_percent,

  CASE
    WHEN (SELECT COUNT(*) FROM waste_reports WHERE status IN ('Collected', 'Recycled')) > 0
    THEN ROUND(
      (SELECT COUNT(*) FROM waste_reports WHERE status = 'Recycled')::numeric
      / (SELECT COUNT(*) FROM waste_reports WHERE status IN ('Collected', 'Recycled'))::numeric * 100, 1
    )
    ELSE 0
  END AS recycling_rate_percent,

  -- Recycling Volume & Revenue
  (SELECT COUNT(*) FROM recycling_transactions WHERE status = 'Completed') AS total_recycling_transactions,
  COALESCE((SELECT SUM(weight_kg) FROM recycling_transactions WHERE status = 'Completed'), 0) AS total_recycled_weight_kg,
  COALESCE((SELECT SUM(total_payout) FROM recycling_transactions WHERE status = 'Completed'), 0) AS total_payout_ngn,
  COALESCE((SELECT AVG(rate_per_kg) FROM recycling_transactions WHERE status = 'Completed'), 0) AS avg_rate_per_kg,

  -- Pickup Performance
  (SELECT COUNT(*) FROM pickup_requests) AS total_pickup_requests,
  (SELECT COUNT(*) FROM pickup_requests WHERE status = 'Completed') AS completed_pickups,
  (SELECT COUNT(*) FROM pickup_requests WHERE status = 'Scheduled') AS scheduled_pickups,
  (SELECT COUNT(*) FROM pickup_requests WHERE status = 'In Transit') AS in_transit_pickups,

  -- User Metrics
  (SELECT COUNT(*) FROM profiles WHERE role = 'citizen') AS total_citizens,
  (SELECT COUNT(*) FROM profiles WHERE role = 'citizen' AND is_verified = true) AS verified_citizens,
  (SELECT COUNT(*) FROM profiles WHERE role = 'vendor') AS total_vendors,
  (SELECT COUNT(*) FROM profiles WHERE role = 'government') AS total_gov_officials,
  (SELECT COUNT(*) FROM profiles) AS total_users,

  -- Environmental Impact
  COALESCE((SELECT SUM(co2_saved_kg) FROM analytics), 0) AS total_co2_saved_kg,

  -- Operations
  (SELECT COUNT(*) FROM officers WHERE is_active = true) AS active_officers,
  (SELECT COUNT(*) FROM officers WHERE status = 'On Route') AS officers_on_route,

  -- Engagement
  (SELECT COUNT(*) FROM reward_redemptions) AS total_reward_redemptions,
  (SELECT COUNT(*) FROM reward_redemptions WHERE status = 'Delivered') AS delivered_rewards,
  (SELECT COUNT(*) FROM challenges WHERE is_active = true) AS active_challenges,
  (SELECT COUNT(*) FROM challenge_participations) AS total_challenge_participations,
  (SELECT COUNT(*) FROM waste_classifications WHERE status = 'completed') AS ai_classifications_completed,

  -- Points Economy
  COALESCE((SELECT SUM(eco_points) FROM profiles), 0) AS total_eco_points_in_circulation,
  COALESCE((SELECT SUM(points_earned) FROM waste_reports WHERE status <> 'Pending'), 0) AS total_points_earned,
  COALESCE((SELECT SUM(points_spent) FROM reward_redemptions), 0) AS total_points_redeemed,

  now() AS generated_at;

GRANT SELECT ON powerbi_executive_kpis TO authenticated;
GRANT SELECT ON powerbi_executive_kpis TO service_role;


-- =============================================================================
-- 2. ENVIRONMENTAL HEALTH INDEX (EHI)
-- Composite score per LGA on 0-100 scale for Power BI gauge/map visuals
-- Components: Collection (30%), Recycling (25%), Participation (25%),
--             Pending Penalty (-20%), Community Engagement (20%)
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_environmental_health_index AS
WITH lga_stats AS (
  SELECT
    COALESCE(p.lga, 'Unknown') AS lga,
    COUNT(DISTINCT wr.id) AS total_reports,
    COUNT(DISTINCT CASE WHEN wr.status IN ('Collected', 'Recycled') THEN wr.id END) AS resolved_reports,
    COUNT(DISTINCT CASE WHEN wr.status = 'Recycled' THEN wr.id END) AS recycled_count,
    COUNT(DISTINCT CASE WHEN wr.status = 'Pending' THEN wr.id END) AS pending_count,
    COUNT(DISTINCT wr.reporter_id) AS unique_reporters
  FROM profiles p
  LEFT JOIN waste_reports wr ON wr.reporter_id = p.id
  GROUP BY COALESCE(p.lga, 'Unknown')
),
lga_challenges AS (
  SELECT
    COALESCE(cp_p.lga, 'Unknown') AS lga,
    COUNT(*) AS challenge_participations
  FROM challenge_participations cp
  JOIN profiles cp_p ON cp.profile_id = cp_p.id
  GROUP BY COALESCE(cp_p.lga, 'Unknown')
)
SELECT
  ls.lga,
  ls.total_reports,
  ls.resolved_reports,
  ls.pending_count,
  ls.unique_reporters,
  -- Component Scores
  CASE
    WHEN ls.total_reports > 0
    THEN ROUND((ls.resolved_reports::numeric / ls.total_reports::numeric) * 30, 1)
    ELSE 0
  END AS collection_score,
  CASE
    WHEN ls.total_reports > 0
    THEN ROUND((ls.recycled_count::numeric / ls.total_reports::numeric) * 25, 1)
    ELSE 0
  END AS recycling_score,
  LEAST(ROUND((ls.unique_reporters::numeric * 5), 1), 25) AS participation_score,
  (-LEAST((ls.pending_count * 2), 20)) AS pending_penalty,
  LEAST((COALESCE(lc.challenge_participations, 0) * 3), 20) AS community_score,
  -- Composite Index (0-100)
  GREATEST(0, LEAST(100, ROUND(
    CASE
      WHEN ls.total_reports > 0 THEN
        ((ls.resolved_reports::numeric / ls.total_reports::numeric) * 30)
        + ((ls.recycled_count::numeric / ls.total_reports::numeric) * 25)
        + LEAST((ls.unique_reporters::numeric * 5), 25)
        - LEAST((ls.pending_count * 2), 20)
        + LEAST((COALESCE(lc.challenge_participations, 0) * 3), 20)
      ELSE 50
    END, 2
  ))) AS environmental_health_index,
  -- Rating Label
  CASE
    WHEN GREATEST(0, LEAST(100,
      CASE WHEN ls.total_reports > 0 THEN
        ((ls.resolved_reports::numeric / ls.total_reports::numeric) * 30)
        + ((ls.recycled_count::numeric / ls.total_reports::numeric) * 25)
        + LEAST((ls.unique_reporters::numeric * 5), 25)
        - LEAST((ls.pending_count * 2), 20)
        + LEAST((COALESCE(lc.challenge_participations, 0) * 3), 20)
      ELSE 50 END
    )) >= 80 THEN 'Excellent'
    WHEN GREATEST(0, LEAST(100,
      CASE WHEN ls.total_reports > 0 THEN
        ((ls.resolved_reports::numeric / ls.total_reports::numeric) * 30)
        + ((ls.recycled_count::numeric / ls.total_reports::numeric) * 25)
        + LEAST((ls.unique_reporters::numeric * 5), 25)
        - LEAST((ls.pending_count * 2), 20)
        + LEAST((COALESCE(lc.challenge_participations, 0) * 3), 20)
      ELSE 50 END
    )) >= 60 THEN 'Good'
    WHEN GREATEST(0, LEAST(100,
      CASE WHEN ls.total_reports > 0 THEN
        ((ls.resolved_reports::numeric / ls.total_reports::numeric) * 30)
        + ((ls.recycled_count::numeric / ls.total_reports::numeric) * 25)
        + LEAST((ls.unique_reporters::numeric * 5), 25)
        - LEAST((ls.pending_count * 2), 20)
        + LEAST((COALESCE(lc.challenge_participations, 0) * 3), 20)
      ELSE 50 END
    )) >= 40 THEN 'Fair'
    ELSE 'Critical'
  END AS health_rating,
  COALESCE(lc.challenge_participations, 0) AS challenge_participations,
  now() AS calculated_at
FROM lga_stats ls
LEFT JOIN lga_challenges lc ON lc.lga = ls.lga
ORDER BY GREATEST(0, LEAST(100, ROUND(
    CASE
      WHEN ls.total_reports > 0 THEN
        ((ls.resolved_reports::numeric / ls.total_reports::numeric) * 30)
        + ((ls.recycled_count::numeric / ls.total_reports::numeric) * 25)
        + LEAST((ls.unique_reporters::numeric * 5), 25)
        - LEAST((ls.pending_count * 2), 20)
        + LEAST((COALESCE(lc.challenge_participations, 0) * 3), 20)
      ELSE 50
    END, 2
  ))) DESC;

GRANT SELECT ON powerbi_environmental_health_index TO authenticated;
GRANT SELECT ON powerbi_environmental_health_index TO service_role;


-- =============================================================================
-- 3. ENVIRONMENTAL PRIORITY INDEX (EPI)
-- Priority scoring per LGA × waste_type for intervention planning
-- Components: Urgency, Volume, Neglect, Recurrence, Environmental Impact
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_environmental_priority_index AS
SELECT
  COALESCE(p.lga, 'Unknown') AS lga,
  wr.waste_type,
  COUNT(wr.id) AS total_incidents,
  COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) AS pending_count,
  COUNT(CASE WHEN wr.status = 'In Progress' THEN 1 END) AS in_progress_count,
  COALESCE(ROUND(AVG(
    CASE WHEN wr.status = 'Pending'
    THEN EXTRACT(EPOCH FROM (now() - wr.created_at)) / 3600
    ELSE 0 END
  ), 1), 0) AS avg_hours_pending,

  -- Scoring Components
  (COUNT(wr.id) * 3) AS volume_score,
  CASE
    WHEN COUNT(wr.id) > 0
    THEN ROUND(
      (COUNT(CASE WHEN wr.status IN ('Pending', 'In Progress') THEN 1 END)::numeric
      / COUNT(wr.id)::numeric) * 40, 1
    )
    ELSE 0
  END AS neglect_score,
  CASE
    WHEN COUNT(wr.id) > 3 THEN 15
    WHEN COUNT(wr.id) > 1 THEN 8
    ELSE 0
  END AS recurrence_score,
  SUM(CASE wr.waste_type
    WHEN 'Electronic' THEN 10
    WHEN 'Electronic Waste' THEN 10
    WHEN 'Glass' THEN 7
    WHEN 'Metal' THEN 6
    WHEN 'Plastic' THEN 8
    WHEN 'Textile' THEN 5
    WHEN 'Mixed Waste' THEN 9
    WHEN 'Organic' THEN 3
    WHEN 'Paper' THEN 2
    ELSE 4
  END) AS impact_score,

  -- Composite Priority Index
  ROUND(
    (COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) * 5
     + COUNT(CASE WHEN wr.status = 'In Progress' THEN 1 END) * 2)::numeric
    + (COALESCE(AVG(
        CASE WHEN wr.status = 'Pending'
        THEN EXTRACT(EPOCH FROM (now() - wr.created_at)) / 3600
        ELSE 0 END
      ), 0) * 0.5)
    + (COUNT(wr.id) * 3)::numeric
    + CASE
        WHEN COUNT(wr.id) > 0
        THEN (COUNT(CASE WHEN wr.status IN ('Pending', 'In Progress') THEN 1 END)::numeric
              / COUNT(wr.id)::numeric) * 40
        ELSE 0
      END
    + (CASE
        WHEN COUNT(wr.id) > 3 THEN 15
        WHEN COUNT(wr.id) > 1 THEN 8
        ELSE 0
       END)::numeric
    + (SUM(CASE wr.waste_type
        WHEN 'Electronic' THEN 10
        WHEN 'Electronic Waste' THEN 10
        WHEN 'Glass' THEN 7
        WHEN 'Metal' THEN 6
        WHEN 'Plastic' THEN 8
        WHEN 'Textile' THEN 5
        WHEN 'Mixed Waste' THEN 9
        WHEN 'Organic' THEN 3
        WHEN 'Paper' THEN 2
        ELSE 4
       END))::numeric
  , 1) AS priority_index,

  -- Priority Level
  CASE
    WHEN ((COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) * 5)
          + (COUNT(wr.id) * 3)
          + SUM(CASE wr.waste_type
              WHEN 'Electronic' THEN 10
              WHEN 'Electronic Waste' THEN 10
              WHEN 'Plastic' THEN 8
              WHEN 'Mixed Waste' THEN 9
              ELSE 4
            END)) >= 50 THEN 'Critical'
    WHEN ((COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) * 5)
          + (COUNT(wr.id) * 3)) >= 25 THEN 'High'
    WHEN COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) > 0 THEN 'Medium'
    ELSE 'Low'
  END AS priority_level,

  -- Recommended Action
  CASE
    WHEN COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) >= 5
      THEN 'Immediate dispatch required'
    WHEN COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) >= 2
      THEN 'Schedule collection within 24h'
    WHEN wr.waste_type IN ('Electronic', 'Electronic Waste')
      THEN 'Specialized handling needed'
    WHEN COUNT(wr.id) > 3
      THEN 'Increase patrol frequency'
    ELSE 'Monitor and maintain'
  END AS recommended_action,

  now() AS calculated_at
FROM profiles p
LEFT JOIN waste_reports wr ON wr.reporter_id = p.id
GROUP BY COALESCE(p.lga, 'Unknown'), wr.waste_type
ORDER BY priority_index DESC;

GRANT SELECT ON powerbi_environmental_priority_index TO authenticated;
GRANT SELECT ON powerbi_environmental_priority_index TO service_role;


-- =============================================================================
-- 4. ECOSCORE ANALYTICS
-- Detailed eco_score breakdown per citizen for Power BI trend analysis
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_ecoscore_analytics AS
SELECT
  p.id AS citizen_id,
  p.full_name,
  p.email,
  p.lga,
  p.eco_points,
  p.eco_score,
  p.total_reports,
  p.total_weight_kg,
  p.is_verified,
  p.created_at AS joined_date,
  -- Activity Breakdown
  COUNT(DISTINCT wr.id) AS total_reports_filed,
  COUNT(DISTINCT CASE WHEN wr.status = 'Recycled' THEN wr.id END) AS recycled_reports,
  COUNT(DISTINCT CASE WHEN wr.status = 'Collected' THEN wr.id END) AS collected_reports,
  COALESCE(SUM(wr.points_earned) FILTER (WHERE wr.status <> 'Pending'), 0) AS total_points_earned,
  -- Recycling Metrics
  COALESCE(SUM(rt.weight_kg), 0) AS total_recycled_weight_kg,
  COALESCE(SUM(rt.total_payout), 0) AS total_recycling_payout,
  COUNT(DISTINCT rt.id) AS recycling_transactions_count,
  -- Engagement
  COUNT(DISTINCT cp.id) AS challenges_participated,
  COUNT(DISTINCT CASE WHEN cp.completed = true THEN cp.id END) AS challenges_completed,
  COUNT(DISTINCT rr.id) AS rewards_redeemed,
  COALESCE(SUM(rr.points_spent), 0) AS total_points_spent,
  -- Tier Classification
  CASE
    WHEN p.eco_score >= 1000 THEN 'Champion'
    WHEN p.eco_score >= 500 THEN 'Leader'
    WHEN p.eco_score >= 200 THEN 'Advocate'
    WHEN p.eco_score >= 50 THEN 'Contributor'
    ELSE 'Beginner'
  END AS ecoscore_tier,
  -- Activity Level
  CASE
    WHEN GREATEST(
      COALESCE((SELECT MAX(waste_reports.created_at) FROM waste_reports WHERE waste_reports.reporter_id = p.id), p.created_at),
      COALESCE((SELECT MAX(recycling_transactions.created_at) FROM recycling_transactions WHERE recycling_transactions.citizen_id = p.id), p.created_at)
    ) >= (now() - INTERVAL '7 days') THEN 'Very Active'
    WHEN GREATEST(
      COALESCE((SELECT MAX(waste_reports.created_at) FROM waste_reports WHERE waste_reports.reporter_id = p.id), p.created_at),
      COALESCE((SELECT MAX(recycling_transactions.created_at) FROM recycling_transactions WHERE recycling_transactions.citizen_id = p.id), p.created_at)
    ) >= (now() - INTERVAL '30 days') THEN 'Active'
    WHEN GREATEST(
      COALESCE((SELECT MAX(waste_reports.created_at) FROM waste_reports WHERE waste_reports.reporter_id = p.id), p.created_at),
      COALESCE((SELECT MAX(recycling_transactions.created_at) FROM recycling_transactions WHERE recycling_transactions.citizen_id = p.id), p.created_at)
    ) >= (now() - INTERVAL '90 days') THEN 'Occasional'
    ELSE 'Dormant'
  END AS activity_level,
  -- Last Activity
  GREATEST(
    COALESCE((SELECT MAX(waste_reports.created_at) FROM waste_reports WHERE waste_reports.reporter_id = p.id), p.created_at),
    COALESCE((SELECT MAX(recycling_transactions.created_at) FROM recycling_transactions WHERE recycling_transactions.citizen_id = p.id), p.created_at)
  ) AS last_activity_at,
  now() AS calculated_at
FROM profiles p
LEFT JOIN waste_reports wr ON wr.reporter_id = p.id
LEFT JOIN recycling_transactions rt ON rt.citizen_id = p.id
LEFT JOIN challenge_participations cp ON cp.profile_id = p.id
LEFT JOIN reward_redemptions rr ON rr.profile_id = p.id
WHERE p.role = 'citizen'
GROUP BY p.id, p.full_name, p.email, p.lga, p.eco_points, p.eco_score,
         p.total_reports, p.total_weight_kg, p.is_verified, p.created_at
ORDER BY p.eco_score DESC;

GRANT SELECT ON powerbi_ecoscore_analytics TO authenticated;
GRANT SELECT ON powerbi_ecoscore_analytics TO service_role;


-- =============================================================================
-- 5. CITIZEN PARTICIPATION (FLAT)
-- Denormalized citizen engagement data for Power BI import
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_citizen_participation_flat AS
SELECT
  p.id AS citizen_id,
  p.full_name,
  p.email,
  p.lga,
  p.eco_points,
  p.eco_score,
  p.total_reports,
  p.total_weight_kg,
  p.is_verified,
  p.created_at AS joined_date,
  -- Waste Reporting
  (SELECT COUNT(*) FROM waste_reports WHERE reporter_id = p.id) AS total_waste_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE reporter_id = p.id AND status = 'Recycled') AS recycled_reports,
  -- Recycling Activity
  (SELECT COUNT(*) FROM recycling_transactions WHERE citizen_id = p.id) AS total_recycling_txns,
  (SELECT COALESCE(SUM(weight_kg), 0) FROM recycling_transactions WHERE citizen_id = p.id) AS total_recycled_kg,
  -- Pickup Usage
  (SELECT COUNT(*) FROM pickup_requests WHERE citizen_id = p.id) AS total_pickup_requests,
  -- Challenge Engagement
  (SELECT COUNT(*) FROM challenge_participations WHERE profile_id = p.id) AS challenges_joined,
  (SELECT COUNT(*) FROM challenge_participations WHERE profile_id = p.id AND completed = true) AS challenges_completed,
  -- Rewards
  (SELECT COUNT(*) FROM reward_redemptions WHERE profile_id = p.id) AS rewards_redeemed,
  (SELECT COALESCE(SUM(points_spent), 0) FROM reward_redemptions WHERE profile_id = p.id) AS total_points_spent,
  -- AI Feature Usage
  (SELECT COUNT(*) FROM waste_classifications WHERE user_id = p.id) AS ai_classifications_used,
  -- Tenure & Segmentation
  EXTRACT(DAY FROM (now() - p.created_at))::integer AS days_since_signup,
  CASE
    WHEN p.created_at >= (now() - INTERVAL '30 days') THEN 'New'
    WHEN p.created_at >= (now() - INTERVAL '90 days') THEN 'Recent'
    WHEN p.created_at >= (now() - INTERVAL '365 days') THEN 'Established'
    ELSE 'Veteran'
  END AS citizen_tenure,
  EXTRACT(YEAR FROM p.created_at) AS signup_year,
  EXTRACT(MONTH FROM p.created_at) AS signup_month,
  now() AS calculated_at
FROM profiles p
WHERE p.role = 'citizen'
ORDER BY p.eco_points DESC;

GRANT SELECT ON powerbi_citizen_participation_flat TO authenticated;
GRANT SELECT ON powerbi_citizen_participation_flat TO service_role;


-- =============================================================================
-- 6. RECYCLING ANALYTICS (ENHANCED)
-- Extended recycling data with CO2 estimates for Power BI
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_recycling_analytics_enhanced AS
SELECT
  rt.id AS transaction_id,
  rt.material_type,
  rt.weight_kg,
  rt.rate_per_kg,
  rt.total_payout,
  rt.quality_grade,
  rt.status AS transaction_status,
  rt.created_at AS transaction_date,
  -- Partner Info
  rp.id AS partner_id,
  rp.business_name AS partner_name,
  rp.lga AS partner_lga,
  rp.is_verified AS partner_verified,
  -- Citizen Info
  c.id AS citizen_id,
  c.full_name AS citizen_name,
  c.lga AS citizen_lga,
  -- CO2 Estimate (kg CO2 per kg material)
  ROUND(rt.weight_kg * CASE rt.material_type
    WHEN 'Plastic' THEN 2.5
    WHEN 'Metal' THEN 3.8
    WHEN 'Paper' THEN 1.2
    WHEN 'Organic' THEN 0.5
    WHEN 'Electronic' THEN 5.0
    WHEN 'Electronic Waste' THEN 5.0
    WHEN 'Glass' THEN 1.8
    WHEN 'Textile' THEN 2.0
    WHEN 'Mixed Waste' THEN 1.0
    ELSE 1.0
  END, 2) AS estimated_co2_saved_kg,
  -- Time Dimensions for Power BI
  EXTRACT(YEAR FROM rt.created_at) AS transaction_year,
  EXTRACT(MONTH FROM rt.created_at) AS transaction_month,
  EXTRACT(DAY FROM rt.created_at) AS transaction_day,
  EXTRACT(DOW FROM rt.created_at) AS transaction_day_of_week,
  TO_CHAR(rt.created_at, 'YYYY-MM') AS transaction_year_month,
  TO_CHAR(rt.created_at, '"W"IW') AS transaction_week_of_year,
  now() AS calculated_at
FROM recycling_transactions rt
LEFT JOIN profiles c ON rt.citizen_id = c.id
LEFT JOIN recycling_partners rp ON rt.partner_id = rp.id;

GRANT SELECT ON powerbi_recycling_analytics_enhanced TO authenticated;
GRANT SELECT ON powerbi_recycling_analytics_enhanced TO service_role;


-- =============================================================================
-- 7. WASTE COLLECTION PERFORMANCE
-- Monthly collection efficiency by LGA for Power BI
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_collection_performance AS
SELECT
  DATE_TRUNC('month', wr.created_at)::date AS period_month,
  COALESCE(p.lga, 'Unknown') AS lga,
  COUNT(wr.id) AS total_reports,
  COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) AS pending,
  COUNT(CASE WHEN wr.status = 'In Progress' THEN 1 END) AS in_progress,
  COUNT(CASE WHEN wr.status = 'Collected' THEN 1 END) AS collected,
  COUNT(CASE WHEN wr.status = 'Recycled' THEN 1 END) AS recycled,
  COUNT(CASE WHEN wr.status IN ('Collected', 'Recycled') THEN 1 END) AS resolved,
  -- Efficiency Rates
  CASE
    WHEN COUNT(wr.id) > 0
    THEN ROUND(
      (COUNT(CASE WHEN wr.status IN ('Collected', 'Recycled') THEN 1 END)::numeric
      / COUNT(wr.id)::numeric) * 100, 1
    )
    ELSE 0
  END AS collection_rate_percent,
  CASE
    WHEN COUNT(CASE WHEN wr.status IN ('Collected', 'Recycled') THEN 1 END) > 0
    THEN ROUND(
      (COUNT(CASE WHEN wr.status = 'Recycled' THEN 1 END)::numeric
      / COUNT(CASE WHEN wr.status IN ('Collected', 'Recycled') THEN 1 END)::numeric) * 100, 1
    )
    ELSE 0
  END AS recycling_rate_percent,
  -- Resolution Time
  ROUND(AVG(
    CASE WHEN wr.status IN ('Collected', 'Recycled')
    THEN EXTRACT(EPOCH FROM (wr.updated_at - wr.created_at)) / 3600
    ELSE NULL END
  ), 1) AS avg_resolution_hours,
  -- Engagement
  COUNT(DISTINCT wr.reporter_id) AS unique_reporters,
  COALESCE(SUM(wr.points_earned) FILTER (WHERE wr.status <> 'Pending'), 0) AS points_distributed,
  COUNT(DISTINCT wr.assigned_officer_id) AS officers_deployed,
  now() AS calculated_at
FROM waste_reports wr
LEFT JOIN profiles p ON wr.reporter_id = p.id
GROUP BY DATE_TRUNC('month', wr.created_at)::date, COALESCE(p.lga, 'Unknown')
ORDER BY DATE_TRUNC('month', wr.created_at)::date DESC, COALESCE(p.lga, 'Unknown');

GRANT SELECT ON powerbi_collection_performance TO authenticated;
GRANT SELECT ON powerbi_collection_performance TO service_role;


-- =============================================================================
-- 8. COMMUNITY LEADERBOARD
-- Multi-dimensional citizen rankings for Power BI
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_community_leaderboard AS
SELECT
  p.id AS citizen_id,
  p.full_name,
  p.email,
  p.lga,
  p.eco_points,
  p.eco_score,
  p.total_reports,
  p.total_weight_kg,
  p.is_verified,
  p.created_at AS joined_date,
  -- Rankings
  RANK() OVER (ORDER BY p.eco_points DESC) AS overall_rank,
  RANK() OVER (ORDER BY p.eco_score DESC) AS ecoscore_rank,
  RANK() OVER (ORDER BY p.total_reports DESC) AS reports_rank,
  RANK() OVER (ORDER BY p.total_weight_kg DESC) AS weight_rank,
  RANK() OVER (PARTITION BY COALESCE(p.lga, 'Unknown') ORDER BY p.eco_points DESC) AS lga_rank,
  -- Detailed Metrics
  COALESCE((
    SELECT SUM(wr.points_earned)
    FROM waste_reports wr
    WHERE wr.reporter_id = p.id AND wr.status <> 'Pending'
  ), 0) AS report_points,
  COALESCE((
    SELECT SUM(rt.total_payout)
    FROM recycling_transactions rt
    WHERE rt.citizen_id = p.id AND rt.status = 'Completed'
  ), 0) AS recycling_value,
  COALESCE((
    SELECT COUNT(*)
    FROM waste_reports wr
    WHERE wr.reporter_id = p.id AND wr.status = 'Recycled'
  ), 0) AS recycled_count,
  -- Badge Eligibility
  CASE WHEN p.total_reports >= 50 THEN true ELSE false END AS badge_veteran_reporter,
  CASE WHEN p.total_reports >= 10 THEN true ELSE false END AS badge_active_reporter,
  CASE WHEN p.total_weight_kg >= 100 THEN true ELSE false END AS badge_heavy_recycler,
  CASE WHEN p.total_weight_kg >= 25 THEN true ELSE false END AS badge_recycler,
  CASE WHEN p.eco_points >= 1000 THEN true ELSE false END AS badge_eco_champion,
  CASE WHEN p.eco_points >= 500 THEN true ELSE false END AS badge_eco_warrior,
  -- Percentile
  (PERCENT_RANK() OVER (ORDER BY p.eco_points DESC) * 100) AS points_percentile,
  now() AS calculated_at
FROM profiles p
WHERE p.role = 'citizen'
ORDER BY p.eco_points DESC;

GRANT SELECT ON powerbi_community_leaderboard TO authenticated;
GRANT SELECT ON powerbi_community_leaderboard TO service_role;


-- =============================================================================
-- 9. DATASET REGISTRY / CATALOG
-- Lists all available Power BI datasets with descriptions
-- =============================================================================
CREATE OR REPLACE VIEW powerbi_available_datasets AS
SELECT 'powerbi_executive_kpis' AS view_name, 'Executive KPIs' AS display_name,
       'Single-row summary of all key performance indicators' AS description,
       'authenticated, service_role' AS access_level
UNION ALL
SELECT 'powerbi_environmental_health_index', 'Environmental Health Index',
       'Composite EHI score per LGA (0-100 scale)', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_environmental_priority_index', 'Environmental Priority Index',
       'Priority scoring for areas needing intervention', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_ecoscore_analytics', 'EcoScore Analytics',
       'Detailed eco_score breakdown per citizen', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_citizen_participation_flat', 'Citizen Participation (Flat)',
       'Denormalized citizen engagement data', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_recycling_analytics_enhanced', 'Recycling Analytics (Enhanced)',
       'Extended recycling data with CO2 estimates', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_collection_performance', 'Collection Performance',
       'Monthly collection efficiency by LGA', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_community_leaderboard', 'Community Leaderboard',
       'Multi-dimensional citizen rankings', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_waste_reports_flat', 'Waste Reports (Flat)',
       'Denormalized waste reports for Power BI import', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_recycling_flat', 'Recycling (Flat)',
       'Denormalized recycling data for Power BI', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_challenge_analytics', 'Challenge Analytics',
       'Community challenge performance data', 'authenticated, service_role'
UNION ALL
SELECT 'powerbi_notifications_analytics', 'Notifications Analytics',
       'Notification delivery and read rates', 'authenticated, service_role';

GRANT SELECT ON powerbi_available_datasets TO authenticated;
GRANT SELECT ON powerbi_available_datasets TO service_role;
