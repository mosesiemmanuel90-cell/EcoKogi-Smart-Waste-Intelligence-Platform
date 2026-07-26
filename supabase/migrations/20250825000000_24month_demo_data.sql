-- =============================================================================
-- EcoKogi 24-Month Realistic Demo Data Generation
-- Generates data spanning July 2024 to July 2026
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION get_monthly_baseline(lga_name TEXT, month_offset INT)
RETURNS TABLE(
  base_reports INT, base_recycling INT, base_pickups INT,
  base_weight INT, base_payout INT, base_citizens INT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT
    CASE lga_name
      WHEN 'Lokoja' THEN GREATEST(5, (12 + month_offset * 0.5)::INT)
      WHEN 'Anyigba' THEN GREATEST(3, (8 + month_offset * 0.4)::INT)
      WHEN 'Okene' THEN GREATEST(3, (7 + month_offset * 0.35)::INT)
      WHEN 'Idah' THEN GREATEST(2, (5 + month_offset * 0.3)::INT)
      WHEN 'Kabba' THEN GREATEST(2, (4 + month_offset * 0.25)::INT)
      WHEN 'Ankpa' THEN GREATEST(2, (4 + month_offset * 0.25)::INT)
      ELSE GREATEST(1, (3 + month_offset * 0.2)::INT)
    END AS base_reports,
    CASE lga_name
      WHEN 'Lokoja' THEN GREATEST(3, (8 + month_offset * 0.5)::INT)
      WHEN 'Anyigba' THEN GREATEST(2, (6 + month_offset * 0.4)::INT)
      WHEN 'Okene' THEN GREATEST(2, (5 + month_offset * 0.35)::INT)
      WHEN 'Idah' THEN GREATEST(1, (4 + month_offset * 0.3)::INT)
      WHEN 'Kabba' THEN GREATEST(1, (3 + month_offset * 0.25)::INT)
      WHEN 'Ankpa' THEN GREATEST(1, (3 + month_offset * 0.25)::INT)
      ELSE GREATEST(1, (2 + month_offset * 0.2)::INT)
    END AS base_recycling,
    CASE lga_name
      WHEN 'Lokoja' THEN GREATEST(2, (5 + month_offset * 0.3)::INT)
      WHEN 'Anyigba' THEN GREATEST(1, (3 + month_offset * 0.25)::INT)
      WHEN 'Okene' THEN GREATEST(1, (3 + month_offset * 0.2)::INT)
      WHEN 'Idah' THEN GREATEST(1, (2 + month_offset * 0.2)::INT)
      WHEN 'Kabba' THEN GREATEST(1, (2 + month_offset * 0.15)::INT)
      WHEN 'Ankpa' THEN GREATEST(1, (2 + month_offset * 0.15)::INT)
      ELSE GREATEST(1, (1 + month_offset * 0.1)::INT)
    END AS base_pickups,
    CASE lga_name
      WHEN 'Lokoja' THEN GREATEST(50, (200 + month_offset * 10)::INT)
      WHEN 'Anyigba' THEN GREATEST(30, (120 + month_offset * 8)::INT)
      WHEN 'Okene' THEN GREATEST(30, (100 + month_offset * 7)::INT)
      WHEN 'Idah' THEN GREATEST(20, (80 + month_offset * 5)::INT)
      WHEN 'Kabba' THEN GREATEST(15, (60 + month_offset * 4)::INT)
      WHEN 'Ankpa' THEN GREATEST(15, (60 + month_offset * 4)::INT)
      ELSE GREATEST(10, (40 + month_offset * 3)::INT)
    END AS base_weight,
    CASE lga_name
      WHEN 'Lokoja' THEN GREATEST(5000, (20000 + month_offset * 1000)::INT)
      WHEN 'Anyigba' THEN GREATEST(3000, (12000 + month_offset * 800)::INT)
      WHEN 'Okene' THEN GREATEST(3000, (10000 + month_offset * 700)::INT)
      WHEN 'Idah' THEN GREATEST(2000, (8000 + month_offset * 500)::INT)
      WHEN 'Kabba' THEN GREATEST(1500, (6000 + month_offset * 400)::INT)
      WHEN 'Ankpa' THEN GREATEST(1500, (6000 + month_offset * 400)::INT)
      ELSE GREATEST(1000, (4000 + month_offset * 300)::INT)
    END AS base_payout,
    CASE lga_name
      WHEN 'Lokoja' THEN GREATEST(5, (15 + month_offset * 0.3)::INT)
      WHEN 'Anyigba' THEN GREATEST(3, (10 + month_offset * 0.25)::INT)
      WHEN 'Okene' THEN GREATEST(3, (8 + month_offset * 0.2)::INT)
      WHEN 'Idah' THEN GREATEST(2, (6 + month_offset * 0.2)::INT)
      WHEN 'Kabba' THEN GREATEST(2, (5 + month_offset * 0.15)::INT)
      WHEN 'Ankpa' THEN GREATEST(2, (5 + month_offset * 0.15)::INT)
      ELSE GREATEST(1, (3 + month_offset * 0.1)::INT)
    END AS base_citizens;
END;
$$;

-- Clear existing demo data
DELETE FROM challenge_participations WHERE challenge_id IN (SELECT id FROM challenges WHERE is_active = true OR created_at >= NOW() - INTERVAL '24 months');
DELETE FROM waste_reports WHERE created_at >= '2024-07-01' AND created_at <= '2026-07-31';
DELETE FROM recycling_transactions WHERE created_at >= '2024-07-01' AND created_at <= '2026-07-31';
DELETE FROM pickup_requests WHERE created_at >= '2024-07-01' AND created_at <= '2026-07-31';
DELETE FROM fleet_assignments WHERE scheduled_date >= '2024-07-01';
DELETE FROM analytics WHERE period_start >= '2024-07-01';
DELETE FROM notifications WHERE created_at >= '2024-07-01' AND created_at <= '2026-07-31';
DELETE FROM leaderboard WHERE updated_at >= '2024-07-01';
DELETE FROM waste_classifications WHERE created_at >= '2024-07-01' AND created_at <= '2026-07-31';
DELETE FROM fleet_schedules;
DELETE FROM reward_redemptions WHERE redeemed_at >= '2024-07-01' AND redeemed_at <= '2026-07-31';
UPDATE profiles SET total_reports = 0, total_weight_kg = 0, eco_points = 50, eco_score = 10 WHERE role = 'citizen';

-- 24-Month Data Generation Loop
DO $$
DECLARE
  lgas TEXT[] := ARRAY['Lokoja', 'Anyigba', 'Okene', 'Idah', 'Kabba', 'Ankpa'];
  lga_count INT := 6;
  start_date DATE := '2024-07-01';
  month_count INT := 25;
  waste_types TEXT[] := ARRAY['Plastic', 'Metal', 'Paper', 'Organic', 'Electronic Waste', 'Glass', 'Textile', 'Mixed Waste'];
  wt_count INT := 8;
  report_statuses TEXT[] := ARRAY['Pending', 'In Progress', 'Collected', 'Recycled', 'Collected', 'Recycled'];
  rs_count INT := 6;
  pickup_statuses TEXT[] := ARRAY['Scheduled', 'Assigned', 'In Transit', 'Completed', 'Completed'];
  ps_count INT := 5;
  tx_statuses TEXT[] := ARRAY['Completed', 'Completed', 'Completed', 'Pending'];
  ts_count INT := 4;
  quality_grades TEXT[] := ARRAY['A', 'B', 'C'];
  qg_count INT := 3;
  notif_types TEXT[] := ARRAY['info', 'reward', 'pickup', 'report', 'challenge', 'system'];
  nt_count INT := 6;
  loc_lokoja TEXT[] := ARRAY['Lokoja Main Market', 'Confluence Area, Lokoja', 'Lokoja Motor Park', 'Lokoja Waterfront', 'Lokoja GRA Phase II', 'New Layout, Lokoja', 'Lokoja Township Stadium', 'Ganaja Junction, Lokoja', 'Kabba Road, Lokoja', 'Felele Area, Lokoja'];
  loc_anyigba TEXT[] := ARRAY['Anyigba University Junction', 'Anyigba Central Market', 'Anyigba River Bank', 'Anyigba School Zone', 'Anyigba Bye-Pass', 'Anyigba Community Road', 'Anyigba Farm Road', 'University Gate, Anyigba'];
  loc_okene TEXT[] := ARRAY['Okene Town Hall Area', 'Okene Motor Park', 'Okene Residential Zone', 'Okene Main Market', 'Okene Old Market', 'Okene Hill Road', 'Okene Palace Road', 'Okene Hospital Road'];
  loc_idah TEXT[] := ARRAY['Idah Government House Road', 'Idah Market Square', 'Idah Riverside', 'Idah Bridge Street', 'Idah Junction', 'Idah School Road', 'Idah Hospital Area'];
  loc_kabba TEXT[] := ARRAY['Kabba Main Junction', 'Kabba Market', 'Kabba Residential Area', 'Kabba Station Road', 'Kabba Central Area', 'Kabba Roundabout', 'Kabba Community Hall'];
  loc_ankpa TEXT[] := ARRAY['Ankpa Town Center', 'Ankpa Market Road', 'Ankpa School Zone', 'Ankpa Mosque Street', 'Ankpa Stadium Road', 'Ankpa Community Hall', 'Ankpa New Layout'];
  descriptions TEXT[] := ARRAY[
    'Piles of plastic bottles near the market entrance',
    'Abandoned metal scrap blocking the drainage',
    'Stack of old newspapers at the bus stop',
    'Food waste accumulating near the restaurant row',
    'Broken electronics dumped by the roadside',
    'Mixed household waste overflowing the bin',
    'Glass bottles scattered near the junction',
    'Old clothes and fabric piled at the collection point',
    'Plastic wrappers clogging the gutter',
    'Metal cans near the workshop area',
    'Paper packaging waste from the shopping complex',
    'Organic waste from the fruit market',
    'E-waste including old phones and chargers',
    'General waste near the construction site',
    'Broken glass bottles at the parking lot',
    'Textile waste from the tailoring shops',
    'Sawdust and wood shavings from the carpentry workshop',
    'Rubber waste from the auto repair shop',
    'Battery waste dumped near the school',
    'Carton and cardboard waste from the supermarket'
  ];
  desc_count INT := 20;
  m INT; lga_idx INT; lga_name TEXT;
  month_date DATE; month_start DATE; month_end DATE;
  base_r INT; base_rec INT; base_p INT; base_w INT; base_pay INT; base_cit INT;
  days_in_month INT;
  d INT; r INT; ri INT; rec_i INT; p_i INT; n_i INT;
  citizen_ids UUID[]; officer_ids UUID[]; vehicle_ids UUID[]; route_ids UUID[]; partner_ids UUID[]; reward_ids UUID[];
  cid UUID; oid UUID; vid UUID; rid UUID; pid UUID; rwid UUID;
  rep_status TEXT; pickup_status TEXT; tx_status TEXT; wtype TEXT; qgrade TEXT;
  wt NUMERIC; rate INT; payout INT;
  lat NUMERIC; lng NUMERIC;
  report_date TIMESTAMPTZ;
  is_rainy_season BOOLEAN;
  season_factor INT;
  total_reports INT := 0; total_tx INT := 0; total_pickups INT := 0;
  total_assignments INT := 0; total_notifs INT := 0; total_analytics INT := 0;
  total_classifications INT := 0; total_schedules INT := 0; total_lb INT := 0;
  total_redemptions INT := 0;
  rand_idx INT; loc_idx INT;
BEGIN
  SELECT ARRAY(SELECT id FROM profiles WHERE role = 'citizen' ORDER BY id) INTO citizen_ids;
  SELECT ARRAY(SELECT id FROM officers WHERE is_active = true ORDER BY id) INTO officer_ids;
  SELECT ARRAY(SELECT id FROM fleet_vehicles WHERE is_active = true ORDER BY id) INTO vehicle_ids;
  SELECT ARRAY(SELECT id FROM fleet_routes WHERE is_active = true ORDER BY id) INTO route_ids;
  SELECT ARRAY(SELECT id FROM recycling_partners WHERE is_active = true ORDER BY id) INTO partner_ids;
  SELECT ARRAY(SELECT id FROM rewards WHERE is_active = true ORDER BY id) INTO reward_ids;

  FOR m IN 0..(month_count - 1) LOOP
    month_date := start_date + (m || ' months')::INTERVAL;
    month_start := DATE_TRUNC('month', month_date)::DATE;
    month_end := (DATE_TRUNC('month', month_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    days_in_month := EXTRACT(DAY FROM month_end);
    is_rainy_season := EXTRACT(MONTH FROM month_date) BETWEEN 5 AND 10;
    season_factor := CASE WHEN is_rainy_season THEN 3 ELSE 0 END;

    FOR lga_idx IN 1..lga_count LOOP
      lga_name := lgas[lga_idx];
      SELECT base_reports, base_recycling, base_pickups, base_weight, base_payout, base_citizens
      INTO base_r, base_rec, base_p, base_w, base_pay, base_cit
      FROM get_monthly_baseline(lga_name, m);
      base_r := base_r + season_factor;
      base_rec := base_rec + (season_factor / 2)::INT;
      base_p := base_p + (season_factor / 3)::INT;

      -- A. WASTE REPORTS
      FOR d IN 1..days_in_month LOOP
        ri := base_r / days_in_month;
        IF EXTRACT(DOW FROM month_start + (d-1)) IN (0, 6) THEN ri := ri + 1; END IF;
        ri := GREATEST(1, ri + (RANDOM() * 2)::INT);
        FOR r IN 1..ri LOOP
          total_reports := total_reports + 1;
          cid := citizen_ids[(RANDOM() * (array_length(citizen_ids,1) - 1) + 1)::INT];
          rep_status := report_statuses[(RANDOM() * (rs_count - 1) + 1)::INT];
          wtype := waste_types[(RANDOM() * (wt_count - 1) + 1)::INT];
          rand_idx := (RANDOM() * (desc_count - 1) + 1)::INT;
          CASE lga_name
            WHEN 'Lokoja' THEN loc_idx := (RANDOM() * (array_length(loc_lokoja,1) - 1) + 1)::INT;
            WHEN 'Anyigba' THEN loc_idx := (RANDOM() * (array_length(loc_anyigba,1) - 1) + 1)::INT;
            WHEN 'Okene' THEN loc_idx := (RANDOM() * (array_length(loc_okene,1) - 1) + 1)::INT;
            WHEN 'Idah' THEN loc_idx := (RANDOM() * (array_length(loc_idah,1) - 1) + 1)::INT;
            WHEN 'Kabba' THEN loc_idx := (RANDOM() * (array_length(loc_kabba,1) - 1) + 1)::INT;
            WHEN 'Ankpa' THEN loc_idx := (RANDOM() * (array_length(loc_ankpa,1) - 1) + 1)::INT;
            ELSE loc_idx := 1;
          END CASE;
          lat := 7.0 + RANDOM() * 1.2;
          lng := 6.0 + RANDOM() * 1.8;
          IF rep_status <> 'Pending' AND array_length(officer_ids, 1) > 0 THEN
            oid := officer_ids[(RANDOM() * (array_length(officer_ids,1) - 1) + 1)::INT];
          ELSE oid := NULL; END IF;
          report_date := (month_start + (d-1) || ' ' || LPAD((6 + (RANDOM() * 12)::INT)::TEXT, 2, '0') || ':' || LPAD((RANDOM() * 59)::INT::TEXT, 2, '0') || ':00+01')::TIMESTAMPTZ;
          INSERT INTO waste_reports (id, reporter_id, waste_type, description, location, latitude, longitude, status, points_earned, assigned_officer_id, created_at, updated_at)
          VALUES (gen_random_uuid(), cid, wtype, descriptions[rand_idx],
            CASE lga_name
              WHEN 'Lokoja' THEN loc_lokoja[loc_idx] WHEN 'Anyigba' THEN loc_anyigba[loc_idx]
              WHEN 'Okene' THEN loc_okene[loc_idx] WHEN 'Idah' THEN loc_idah[loc_idx]
              WHEN 'Kabba' THEN loc_kabba[loc_idx] WHEN 'Ankpa' THEN loc_ankpa[loc_idx]
              ELSE lga_name || ' Area'
            END,
            lat, lng, rep_status,
            CASE WHEN rep_status IN ('Collected', 'Recycled') THEN 50 ELSE 0 END,
            oid, report_date, report_date + INTERVAL '1 hour'
          ) ON CONFLICT (id) DO NOTHING;
        END LOOP;
      END LOOP;

      -- B. RECYCLING TRANSACTIONS
      FOR rec_i IN 1..base_rec LOOP
        total_tx := total_tx + 1;
        wtype := waste_types[(RANDOM() * (wt_count - 1) + 1)::INT];
        wt := (RANDOM() * 50 + 2)::NUMERIC(10,1);
        CASE wtype
          WHEN 'Plastic' THEN rate := 150; WHEN 'Metal' THEN rate := 400;
          WHEN 'Paper' THEN rate := 80; WHEN 'Organic' THEN rate := 50;
          WHEN 'Electronic Waste' THEN rate := 600; WHEN 'Glass' THEN rate := 120;
          WHEN 'Textile' THEN rate := 90; ELSE rate := 20;
        END CASE;
        payout := (wt * rate)::INT;
        tx_status := tx_statuses[(RANDOM() * (ts_count - 1) + 1)::INT];
        qgrade := quality_grades[(RANDOM() * (qg_count - 1) + 1)::INT];
        pid := partner_ids[(RANDOM() * (array_length(partner_ids,1) - 1) + 1)::INT];
        report_date := (month_start + ((RANDOM() * (days_in_month - 1))::INT) || ' ' || LPAD((8 + (RANDOM() * 10)::INT)::TEXT, 2, '0') || ':' || LPAD((RANDOM() * 59)::INT::TEXT, 2, '0') || ':00+01')::TIMESTAMPTZ;
        INSERT INTO recycling_transactions (id, partner_id, citizen_id, material_type, weight_kg, rate_per_kg, total_payout, quality_grade, status, created_at)
        VALUES (gen_random_uuid(), pid,
          CASE WHEN RANDOM() > 0.3 THEN citizen_ids[(RANDOM() * (array_length(citizen_ids,1) - 1) + 1)::INT] ELSE NULL END,
          wtype, wt, rate, payout, qgrade, tx_status, report_date
        ) ON CONFLICT (id) DO NOTHING;
      END LOOP;

      -- C. PICKUP REQUESTS
      FOR p_i IN 1..base_p LOOP
        total_pickups := total_pickups + 1;
        cid := citizen_ids[(RANDOM() * (array_length(citizen_ids,1) - 1) + 1)::INT];
        wtype := waste_types[(RANDOM() * (wt_count - 1) + 1)::INT];
        pickup_status := pickup_statuses[(RANDOM() * (ps_count - 1) + 1)::INT];
        IF pickup_status IN ('Assigned', 'In Transit', 'Completed') AND array_length(officer_ids, 1) > 0 THEN
          oid := officer_ids[(RANDOM() * (array_length(officer_ids,1) - 1) + 1)::INT];
        ELSE oid := NULL; END IF;
        report_date := (month_start + ((RANDOM() * (days_in_month - 1))::INT) || ' ' || LPAD((7 + (RANDOM() * 11)::INT)::TEXT, 2, '0') || ':' || LPAD((RANDOM() * 59)::INT::TEXT, 2, '0') || ':00+01')::TIMESTAMPTZ;
        INSERT INTO pickup_requests (id, citizen_id, officer_id, waste_type, estimated_weight_kg, pickup_address, scheduled_date, status, notes, created_at, updated_at)
        VALUES (gen_random_uuid(), cid, oid, wtype, (RANDOM() * 40 + 3)::NUMERIC(10,1),
          lga_name || ' - ' || CASE WHEN RANDOM() > 0.5 THEN 'Market Area' ELSE 'Residential Zone' END,
          report_date + INTERVAL '1 day', pickup_status,
          CASE WHEN RANDOM() > 0.7 THEN 'Please collect before 10am' ELSE NULL END,
          report_date, report_date + INTERVAL '30 minutes'
        ) ON CONFLICT (id) DO NOTHING;
      END LOOP;

      -- D. FLEET ASSIGNMENTS (weekly)
      FOR d IN 1..days_in_month BY 7 LOOP
        IF array_length(vehicle_ids, 1) > 0 AND array_length(officer_ids, 1) > 0 THEN
          FOR ri IN 1..LEAST(3, array_length(vehicle_ids, 1)) LOOP
            total_assignments := total_assignments + 1;
            vid := vehicle_ids[(RANDOM() * (array_length(vehicle_ids,1) - 1) + 1)::INT];
            oid := officer_ids[(RANDOM() * (array_length(officer_ids,1) - 1) + 1)::INT];
            report_date := (month_start + (d-1) || ' 06:00:00+01')::TIMESTAMPTZ;
            INSERT INTO fleet_assignments (id, officer_id, vehicle_id, route_id, assignment_type, status, scheduled_date, start_time, end_time, collections_completed, total_weight_collected_kg, created_at, updated_at)
            VALUES (gen_random_uuid(), oid, vid,
              CASE WHEN array_length(route_ids, 1) > 0 THEN route_ids[(RANDOM() * (array_length(route_ids,1) - 1) + 1)::INT] ELSE NULL END,
              'daily', 'completed', report_date::DATE, report_date, report_date + INTERVAL '8 hours',
              (RANDOM() * 15 + 3)::INT, (RANDOM() * 500 + 100)::NUMERIC(10,1),
              report_date, report_date + INTERVAL '8 hours'
            ) ON CONFLICT (id) DO NOTHING;
          END LOOP;
        END IF;
      END LOOP;

      -- E. ANALYTICS (monthly per LGA)
      total_analytics := total_analytics + 1;
      INSERT INTO analytics (id, period_type, period_start, period_end, lga, total_reports, total_collections, total_weight_kg, total_payout, co2_saved_kg, active_citizens, active_vendors, created_at)
      VALUES (gen_random_uuid(), 'monthly', month_start, month_end, lga_name,
        base_r + (RANDOM() * 5 + season_factor)::INT, (base_r * 0.7 + RANDOM() * 3)::INT,
        base_w + (RANDOM() * 50)::NUMERIC(10,1), base_pay + (RANDOM() * 5000)::INT,
        base_w * 0.5 + (RANDOM() * 20)::NUMERIC(10,1), base_cit + (RANDOM() * 3)::INT,
        GREATEST(1, (lga_idx + (RANDOM() * 2)::INT)), month_start
      ) ON CONFLICT (id) DO NOTHING;

      -- F. NOTIFICATIONS
      FOR n_i IN 1..LEAST(5, base_cit + 2) LOOP
        total_notifs := total_notifs + 1;
        cid := citizen_ids[(RANDOM() * (array_length(citizen_ids,1) - 1) + 1)::INT];
        report_date := (month_start + ((RANDOM() * (days_in_month - 1))::INT) || ' ' || LPAD((8 + (RANDOM() * 12)::INT)::TEXT, 2, '0') || ':' || LPAD((RANDOM() * 59)::INT::TEXT, 2, '0') || ':00+01')::TIMESTAMPTZ;
        INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
        VALUES (gen_random_uuid(), cid,
          CASE (RANDOM() * 4)::INT
            WHEN 0 THEN 'Points Earned!' WHEN 1 THEN 'Weekly Impact Report'
            WHEN 2 THEN 'Pickup Confirmed' WHEN 3 THEN 'Challenge Update'
            ELSE 'EcoScore Increased'
          END,
          CASE (RANDOM() * 4)::INT
            WHEN 0 THEN 'You earned points for your waste report in ' || lga_name || '.'
            WHEN 1 THEN 'Your weekly impact: ' || (RANDOM() * 5 + 1)::INT || ' reports, ' || (RANDOM() * 20 + 5)::INT || 'kg recycled.'
            WHEN 2 THEN 'Your waste pickup in ' || lga_name || ' has been completed.'
            WHEN 3 THEN 'Community challenge progress updated in ' || lga_name || '.'
            ELSE 'Your EcoScore increased! Keep up the great work in ' || lga_name || '.'
          END,
          notif_types[(RANDOM() * (nt_count - 1) + 1)::INT], RANDOM() > 0.4, report_date
        ) ON CONFLICT (id) DO NOTHING;
      END LOOP;

      -- G. LEADERBOARD (monthly entries)
      FOR ri IN 1..LEAST(10, array_length(citizen_ids, 1)) LOOP
        total_lb := total_lb + 1;
        cid := citizen_ids[ri];
        INSERT INTO leaderboard (id, profile_id, period, rank, total_points, total_reports, total_weight_kg, updated_at)
        VALUES (gen_random_uuid(), cid, 'monthly', ri, (RANDOM() * 500 + 50)::INT, (RANDOM() * 10 + 1)::INT, (RANDOM() * 100 + 5)::NUMERIC(10,1), month_start + (RANDOM() * (days_in_month - 1))::INT)
        ON CONFLICT (profile_id, period) DO UPDATE SET rank = EXCLUDED.rank, total_points = EXCLUDED.total_points, total_reports = EXCLUDED.total_reports, total_weight_kg = EXCLUDED.total_weight_kg, updated_at = EXCLUDED.updated_at;
      END LOOP;

      -- H. WASTE CLASSIFICATIONS
      FOR ri IN 1..GREATEST(1, base_r / 3) LOOP
        total_classifications := total_classifications + 1;
        cid := citizen_ids[(RANDOM() * (array_length(citizen_ids,1) - 1) + 1)::INT];
        wtype := waste_types[(RANDOM() * (wt_count - 1) + 1)::INT];
        report_date := (month_start + ((RANDOM() * (days_in_month - 1))::INT) || ' ' || LPAD((8 + (RANDOM() * 12)::INT)::TEXT, 2, '0') || ':' || LPAD((RANDOM() * 59)::INT::TEXT, 2, '0') || ':00+01')::TIMESTAMPTZ;
        INSERT INTO waste_classifications (id, user_id, image_url, waste_type, confidence_score, recommendation, all_detected_types, status, created_at)
        VALUES (gen_random_uuid(), cid, 'https://images.unsplash.com/photo-1500000000000?w=400', wtype, 0.7 + RANDOM() * 0.29, 'Dispose of ' || LOWER(wtype) || ' in designated recycling bins.', ARRAY[wtype, waste_types[(RANDOM() * (wt_count - 1) + 1)::INT]], 'completed', report_date)
        ON CONFLICT (id) DO NOTHING;
      END LOOP;

      -- I. REWARD REDEMPTIONS
      IF array_length(reward_ids, 1) > 0 THEN
        FOR ri IN 1..GREATEST(1, base_rec / 4) LOOP
          total_redemptions := total_redemptions + 1;
          cid := citizen_ids[(RANDOM() * (array_length(citizen_ids,1) - 1) + 1)::INT];
          rwid := reward_ids[(RANDOM() * (array_length(reward_ids,1) - 1) + 1)::INT];
          report_date := (month_start + ((RANDOM() * (days_in_month - 1))::INT) || ' ' || LPAD((9 + (RANDOM() * 11)::INT)::TEXT, 2, '0') || ':' || LPAD((RANDOM() * 59)::INT::TEXT, 2, '0') || ':00+01')::TIMESTAMPTZ;
          INSERT INTO reward_redemptions (id, profile_id, reward_id, points_spent, status, redeemed_at)
          VALUES (gen_random_uuid(), cid, rwid, (RANDOM() * 300 + 50)::INT, CASE (RANDOM() * 3)::INT WHEN 0 THEN 'Pending' WHEN 1 THEN 'Delivered' WHEN 2 THEN 'Delivered' ELSE 'Cancelled' END, report_date)
          ON CONFLICT (id) DO NOTHING;
        END LOOP;
      END IF;

      -- J. FLEET SCHEDULES
      IF array_length(vehicle_ids, 1) > 0 AND array_length(route_ids, 1) > 0 THEN
        FOR ri IN 1..LEAST(3, array_length(vehicle_ids, 1)) LOOP
          total_schedules := total_schedules + 1;
          INSERT INTO fleet_schedules (id, vehicle_id, route_id, day_of_week, start_time, end_time, is_recurring, is_active, created_at)
          VALUES (gen_random_uuid(), vehicle_ids[(RANDOM() * (array_length(vehicle_ids,1) - 1) + 1)::INT], route_ids[(RANDOM() * (array_length(route_ids,1) - 1) + 1)::INT], (RANDOM() * 6)::INT, '06:00:00', '14:00:00', true, true, month_start)
          ON CONFLICT (id) DO NOTHING;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;

  UPDATE profiles p SET
    total_reports = (SELECT COUNT(*) FROM waste_reports WHERE reporter_id = p.id),
    total_weight_kg = COALESCE((SELECT SUM(weight_kg) FROM recycling_transactions WHERE citizen_id = p.id AND status = 'Completed'), 0),
    eco_points = LEAST(5000, 50 + (SELECT COALESCE(SUM(points_earned), 0) FROM waste_reports WHERE reporter_id = p.id AND status IN ('Collected', 'Recycled'))),
    eco_score = LEAST(1000, 10 + (SELECT COUNT(*) FROM waste_reports WHERE reporter_id = p.id AND status = 'Recycled') * 5 + (SELECT COALESCE(SUM(weight_kg)::INT, 0) FROM recycling_transactions WHERE citizen_id = p.id AND status = 'Completed') / 2)
  WHERE role = 'citizen';
END;
$$;

-- Refresh all dashboard views
CREATE OR REPLACE VIEW gov_executive_kpis AS
SELECT
  (SELECT COUNT(*) FROM waste_reports) AS total_waste_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Pending') AS pending_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'In Progress') AS in_progress_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Collected') AS collected_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Recycled') AS recycled_reports,
  CASE WHEN (SELECT COUNT(*) FROM waste_reports) > 0
    THEN ROUND((SELECT COUNT(*) FROM waste_reports WHERE status IN ('Collected', 'Recycled'))::numeric / (SELECT COUNT(*) FROM waste_reports)::numeric * 100, 1) ELSE 0
  END AS collection_rate_percent,
  (SELECT COUNT(*) FROM recycling_transactions WHERE status = 'Completed') AS total_recycling_transactions,
  COALESCE((SELECT SUM(weight_kg) FROM recycling_transactions WHERE status = 'Completed'), 0) AS total_recycled_weight_kg,
  COALESCE((SELECT SUM(total_payout) FROM recycling_transactions WHERE status = 'Completed'), 0) AS total_payout_ngn,
  (SELECT COUNT(*) FROM pickup_requests) AS total_pickup_requests,
  (SELECT COUNT(*) FROM pickup_requests WHERE status = 'Completed') AS completed_pickups,
  (SELECT COUNT(*) FROM profiles WHERE role = 'citizen') AS total_citizens,
  (SELECT COUNT(*) FROM profiles WHERE role = 'citizen' AND is_verified = true) AS verified_citizens,
  COALESCE((SELECT SUM(co2_saved_kg) FROM analytics), 0) AS total_co2_saved_kg,
  (SELECT COUNT(*) FROM officers WHERE is_active = true) AS active_officers,
  (SELECT COUNT(*) FROM reward_redemptions) AS total_reward_redemptions,
  (SELECT COUNT(*) FROM challenges WHERE is_active = true) AS active_challenges,
  (SELECT COUNT(*) FROM challenge_participations) AS total_challenge_participations,
  NOW() AS generated_at;
GRANT SELECT ON gov_executive_kpis TO authenticated;
GRANT SELECT ON gov_executive_kpis TO service_role;

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
FROM waste_reports wr LEFT JOIN profiles p ON wr.reporter_id = p.id
GROUP BY COALESCE(p.lga, 'Unknown') ORDER BY total_reports DESC;
GRANT SELECT ON gov_reports_by_lga TO authenticated;
GRANT SELECT ON gov_reports_by_lga TO service_role;

CREATE OR REPLACE VIEW gov_reports_by_type AS
SELECT
  wr.waste_type, COUNT(*) AS total_reports,
  ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM waste_reports), 0)::numeric * 100, 1) AS percentage,
  COUNT(CASE WHEN wr.status = 'Recycled' THEN 1 END) AS recycled_count,
  COUNT(CASE WHEN wr.status = 'Collected' THEN 1 END) AS collected_count,
  COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) AS pending_count
FROM waste_reports wr GROUP BY wr.waste_type ORDER BY total_reports DESC;
GRANT SELECT ON gov_reports_by_type TO authenticated;
GRANT SELECT ON gov_reports_by_type TO service_role;

CREATE OR REPLACE VIEW gov_reports_timeline AS
SELECT
  DATE(wr.created_at) AS report_date, COUNT(*) AS total_reports,
  COUNT(CASE WHEN wr.status IN ('Collected', 'Recycled') THEN 1 END) AS resolved,
  COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) AS pending,
  COUNT(DISTINCT wr.reporter_id) AS unique_reporters
FROM waste_reports wr WHERE wr.created_at >= NOW() - INTERVAL '730 days'
GROUP BY DATE(wr.created_at) ORDER BY report_date ASC;
GRANT SELECT ON gov_reports_timeline TO authenticated;
GRANT SELECT ON gov_reports_timeline TO service_role;

CREATE OR REPLACE VIEW gov_recycling_metrics AS
SELECT
  DATE(rt.created_at) AS transaction_date, COUNT(*) AS total_transactions,
  COALESCE(SUM(rt.weight_kg), 0) AS total_weight_kg,
  COALESCE(SUM(rt.total_payout), 0) AS total_payout_ngn,
  COUNT(DISTINCT rt.citizen_id) AS unique_citizens,
  COUNT(DISTINCT rt.partner_id) AS active_partners
FROM recycling_transactions rt
WHERE rt.status = 'Completed' AND rt.created_at >= NOW() - INTERVAL '730 days'
GROUP BY DATE(rt.created_at) ORDER BY transaction_date ASC;
GRANT SELECT ON gov_recycling_metrics TO authenticated;
GRANT SELECT ON gov_recycling_metrics TO service_role;

CREATE OR REPLACE VIEW gov_recycling_by_material AS
SELECT
  rt.material_type, COUNT(*) AS total_transactions,
  COALESCE(SUM(rt.weight_kg), 0) AS total_weight_kg,
  COALESCE(SUM(rt.total_payout), 0) AS total_payout_ngn,
  COALESCE(AVG(rt.rate_per_kg), 0) AS avg_rate_per_kg,
  ROUND(AVG(CASE WHEN rt.quality_grade = 'A' THEN 100 WHEN rt.quality_grade = 'B' THEN 66 WHEN rt.quality_grade = 'C' THEN 33 ELSE 0 END), 1) AS avg_quality_score
FROM recycling_transactions rt WHERE rt.status = 'Completed'
GROUP BY rt.material_type ORDER BY total_weight_kg DESC;
GRANT SELECT ON gov_recycling_by_material TO authenticated;
GRANT SELECT ON gov_recycling_by_material TO service_role;

CREATE OR REPLACE VIEW gov_officer_performance AS
SELECT
  o.id AS officer_id, o.full_name, o.zone, o.truck_id, o.status AS officer_status, o.is_active,
  COUNT(DISTINCT wr.id) AS assigned_reports,
  COUNT(DISTINCT CASE WHEN wr.status IN ('Collected', 'Recycled') THEN wr.id END) AS resolved_reports,
  COUNT(DISTINCT pr.id) AS assigned_pickups,
  COUNT(DISTINCT CASE WHEN pr.status = 'Completed' THEN pr.id END) AS completed_pickups,
  CASE WHEN COUNT(DISTINCT wr.id) > 0 THEN ROUND(COUNT(DISTINCT CASE WHEN wr.status IN ('Collected', 'Recycled') THEN wr.id END)::numeric / COUNT(DISTINCT wr.id)::numeric * 100, 1) ELSE 0 END AS resolution_rate_percent,
  CASE WHEN COUNT(DISTINCT pr.id) > 0 THEN ROUND(COUNT(DISTINCT CASE WHEN pr.status = 'Completed' THEN pr.id END)::numeric / COUNT(DISTINCT pr.id)::numeric * 100, 1) ELSE 0 END AS pickup_completion_rate
FROM officers o
LEFT JOIN waste_reports wr ON wr.assigned_officer_id = o.id
LEFT JOIN pickup_requests pr ON pr.officer_id = o.id
WHERE o.is_active = true
GROUP BY o.id, o.full_name, o.zone, o.truck_id, o.status, o.is_active
ORDER BY resolved_reports DESC;
GRANT SELECT ON gov_officer_performance TO authenticated;
GRANT SELECT ON gov_officer_performance TO service_role;

CREATE OR REPLACE VIEW gov_monthly_summary AS
SELECT
  DATE_TRUNC('month', period_start)::DATE AS month,
  SUM(total_reports) AS total_reports, SUM(total_collections) AS total_collections,
  SUM(total_weight_kg) AS total_weight_kg, SUM(total_payout) AS total_payout_ngn,
  SUM(co2_saved_kg) AS total_co2_saved_kg,
  AVG(active_citizens) AS avg_active_citizens, AVG(active_vendors) AS avg_active_vendors
FROM analytics GROUP BY DATE_TRUNC('month', period_start) ORDER BY month DESC;
GRANT SELECT ON gov_monthly_summary TO authenticated;
GRANT SELECT ON gov_monthly_summary TO service_role;

CREATE OR REPLACE VIEW powerbi_executive_kpis AS
SELECT
  (SELECT COUNT(*) FROM waste_reports) AS total_waste_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Pending') AS pending_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Collected') AS collected_reports,
  (SELECT COUNT(*) FROM waste_reports WHERE status = 'Recycled') AS recycled_reports,
  CASE WHEN (SELECT COUNT(*) FROM waste_reports) > 0
    THEN ROUND((SELECT COUNT(*) FROM waste_reports WHERE status IN ('Collected', 'Recycled'))::numeric / (SELECT COUNT(*) FROM waste_reports)::numeric * 100, 1) ELSE 0
  END AS collection_rate_percent,
  (SELECT COUNT(*) FROM recycling_transactions WHERE status = 'Completed') AS total_recycling_transactions,
  COALESCE((SELECT SUM(weight_kg) FROM recycling_transactions WHERE status = 'Completed'), 0) AS total_recycled_weight_kg,
  COALESCE((SELECT SUM(total_payout) FROM recycling_transactions WHERE status = 'Completed'), 0) AS total_payout_ngn,
  (SELECT COUNT(*) FROM pickup_requests) AS total_pickup_requests,
  (SELECT COUNT(*) FROM pickup_requests WHERE status = 'Completed') AS completed_pickups,
  (SELECT COUNT(*) FROM profiles WHERE role = 'citizen') AS total_citizens,
  (SELECT COUNT(*) FROM profiles WHERE role = 'citizen' AND is_verified = true) AS verified_citizens,
  COALESCE((SELECT SUM(co2_saved_kg) FROM analytics), 0) AS total_co2_saved_kg,
  (SELECT COUNT(*) FROM officers WHERE is_active = true) AS active_officers,
  (SELECT COUNT(*) FROM reward_redemptions) AS total_reward_redemptions,
  COALESCE((SELECT SUM(eco_points) FROM profiles), 0) AS total_eco_points_in_circulation,
  now() AS generated_at;
GRANT SELECT ON powerbi_executive_kpis TO authenticated;
GRANT SELECT ON powerbi_executive_kpis TO service_role;

CREATE OR REPLACE VIEW powerbi_environmental_health_index AS
SELECT
  COALESCE(SUM(total_weight_kg), 0) AS total_recycled_weight_kg,
  COALESCE(SUM(co2_saved_kg), 0) AS total_co2_saved_kg,
  CASE WHEN COALESCE(SUM(total_weight_kg), 0) > 0
    THEN ROUND(SUM(co2_saved_kg) / SUM(total_weight_kg) * 100, 2) ELSE 0
  END AS carbon_efficiency_ratio,
  COALESCE(AVG(active_citizens), 0) AS avg_active_citizens,
  COALESCE(AVG(active_vendors), 0) AS avg_active_vendors,
  (SELECT COUNT(*) FROM profiles WHERE eco_score >= 50) AS high_eco_score_citizens,
  (SELECT COUNT(*) FROM recycling_partners WHERE is_active = true) AS active_partners,
  now() AS calculated_at
FROM analytics;
GRANT SELECT ON powerbi_environmental_health_index TO authenticated;
GRANT SELECT ON powerbi_environmental_health_index TO service_role;

CREATE OR REPLACE VIEW powerbi_community_engagement AS
SELECT
  (SELECT COUNT(DISTINCT reporter_id) FROM waste_reports) AS reporting_citizens,
  (SELECT COUNT(DISTINCT citizen_id) FROM recycling_transactions WHERE status = 'Completed') AS recycling_citizens,
  (SELECT COUNT(*) FROM challenge_participations) AS challenge_participations,
  (SELECT COUNT(*) FROM reward_redemptions) AS reward_redemptions,
  (SELECT COUNT(*) FROM notifications) AS total_notifications_sent,
  (SELECT COALESCE(AVG(eco_score), 0) FROM profiles WHERE role = 'citizen') AS avg_eco_score,
  (SELECT COUNT(*) FROM profiles WHERE role = 'citizen' AND eco_points > 100) AS active_citizens_over_100_points,
  now() AS calculated_at;
GRANT SELECT ON powerbi_community_engagement TO authenticated;
GRANT SELECT ON powerbi_community_engagement TO service_role;

CREATE OR REPLACE VIEW powerbi_waste_trends AS
SELECT
  DATE_TRUNC('month', wr.created_at)::DATE AS month,
  wr.waste_type, COUNT(*) AS total_reports,
  COUNT(CASE WHEN wr.status IN ('Collected', 'Recycled') THEN 1 END) AS collected,
  COUNT(CASE WHEN wr.status = 'Pending' THEN 1 END) AS pending,
  COUNT(DISTINCT wr.reporter_id) AS unique_reporters
FROM waste_reports wr WHERE wr.created_at >= NOW() - INTERVAL '730 days'
GROUP BY DATE_TRUNC('month', wr.created_at), wr.waste_type
ORDER BY month DESC, total_reports DESC;
GRANT SELECT ON powerbi_waste_trends TO authenticated;
GRANT SELECT ON powerbi_waste_trends TO service_role;

-- Record counts
DO $$
BEGIN
  RAISE NOTICE '=== 24-MONTH DEMO DATA GENERATION COMPLETE ===';
  RAISE NOTICE 'Waste Reports: %', (SELECT COUNT(*) FROM waste_reports);
  RAISE NOTICE 'Recycling Transactions: %', (SELECT COUNT(*) FROM recycling_transactions);
  RAISE NOTICE 'Pickup Requests: %', (SELECT COUNT(*) FROM pickup_requests);
  RAISE NOTICE 'Fleet Assignments: %', (SELECT COUNT(*) FROM fleet_assignments);
  RAISE NOTICE 'Analytics Records: %', (SELECT COUNT(*) FROM analytics);
  RAISE NOTICE 'Notifications: %', (SELECT COUNT(*) FROM notifications);
  RAISE NOTICE 'Leaderboard Entries: %', (SELECT COUNT(*) FROM leaderboard);
  RAISE NOTICE 'Waste Classifications: %', (SELECT COUNT(*) FROM waste_classifications);
  RAISE NOTICE 'Fleet Schedules: %', (SELECT COUNT(*) FROM fleet_schedules);
  RAISE NOTICE 'Reward Redemptions: %', (SELECT COUNT(*) FROM reward_redemptions);
  RAISE NOTICE 'Profiles Updated: %', (SELECT COUNT(*) FROM profiles WHERE eco_points > 50);
  RAISE NOTICE '============================================';
END;
$$;