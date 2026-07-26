-- ============================================================
-- EcoKogi Comprehensive Demo Data Seed
-- 50 Citizens, 100+ Waste Reports, 30 Pickup Requests,
-- 15 Collection Trucks, 20 Recycling Vendors, 150 Transactions,
-- Reward History, EcoScores, Challenges, Notifications
-- Distributed across: Lokoja, Anyigba, Okene, Idah, Kabba, Ankpa
-- ============================================================

-- STEP 1: Create 50 Citizen auth users + profiles
DO $$
DECLARE
  citizen_emails TEXT[] := ARRAY[
    'adaeze.okonkwo@ecokogi.ng', 'ibrahim.musa@ecokogi.ng', 'fatima.abubakar@ecokogi.ng',
    'emmanuel.adeyemi@ecokogi.ng', 'grace.olaoluwa@ecokogi.ng', 'yusuf.danjuma@ecokogi.ng',
    'blessing.nwankwo@ecokogi.ng', 'mohammed.sani@ecokogi.ng', 'joy.uchenna@ecokogi.ng',
    'abdullahi.kolo@ecokogi.ng', 'chioma.eze@ecokogi.ng', 'hassan.gombe@ecokogi.ng',
    'amina.bello@ecokogi.ng', 'peter.okoro@ecokogi.ng', 'khadija.yakubu@ecokogi.ng',
    'david.ogunleye@ecokogi.ng', 'mariam.suleiman@ecokogi.ng', 'john.adekunle@ecokogi.ng',
    'hauwa.mohammed@ecokogi.ng', 'samuel.obi@ecokogi.ng', 'zainab.ahmed@ecokogi.ng',
    'michael.ogbonna@ecokogi.ng', 'aisha.idris@ecokogi.ng', 'james.okafor@ecokogi.ng',
    'halima.usman@ecokogi.ng', 'daniel.adeyinka@ecokogi.ng', 'safiatu.garba@ecokogi.ng',
    'paul.ogunwale@ecokogi.ng', 'nancy.ezeaku@ecokogi.ng', 'aliyu.mustapha@ecokogi.ng',
    'ruth.chukwu@ecokogi.ng', 'osman.yahaya@ecokogi.ng', 'esther.adeboye@ecokogi.ng',
    'isaac.nnamdi@ecokogi.ng', 'hawau.abdullahi@ecokogi.ng', 'thomas.oladele@ecokogi.ng',
    'comfort.igwe@ecokogi.ng', 'suleiman.dauda@ecokogi.ng', 'mercy.okonkwo@ecokogi.ng',
    'gabriel.adejoro@ecokogi.ng', 'fati.lawal@ecokogi.ng', 'benjamin.ugwu@ecokogi.ng',
    'patience.omale@ecokogi.ng', 'stephen.adeyemi@ecokogi.ng', 'baraka.nasiru@ecokogi.ng',
    'victoria.chikezie@ecokogi.ng', 'ismaila.bako@ecokogi.ng', 'lydia.ogbodo@ecokogi.ng',
    'frank.okolie@ecokogi.ng', 'aisha.mohammad@ecokogi.ng'
  ];
  citizen_names TEXT[] := ARRAY[
    'Adaeze Okonkwo', 'Ibrahim Musa', 'Fatima Abubakar',
    'Emmanuel Adeyemi', 'Grace Olaoluwa', 'Yusuf Danjuma',
    'Blessing Nwankwo', 'Mohammed Sani', 'Joy Uchenna',
    'Abdullahi Kolo', 'Chioma Eze', 'Hassan Gombe',
    'Amina Bello', 'Peter Okoro', 'Khadija Yakubu',
    'David Ogunleye', 'Mariam Suleiman', 'John Adekunle',
    'Hauwa Mohammed', 'Samuel Obi', 'Zainab Ahmed',
    'Michael Ogbonna', 'Aisha Idris', 'James Okafor',
    'Halima Usman', 'Daniel Adeyinka', 'Safiatu Garba',
    'Paul Ogunwale', 'Nancy Ezeaku', 'Aliyu Mustapha',
    'Ruth Chukwu', 'Osman Yahaya', 'Esther Adeboye',
    'Isaac Nnamdi', 'Hawau Abdullahi', 'Thomas Oladele',
    'Comfort Igwe', 'Suleiman Dauda', 'Mercy Okonkwo',
    'Gabriel Adejoro', 'Fati Lawal', 'Benjamin Ugwu',
    'Patience Omale', 'Stephen Adeyemi', 'Baraka Nasiru',
    'Victoria Chikezie', 'Ismaila Bako', 'Lydia Ogbodo',
    'Frank Okolie', 'Aisha Mohammad'
  ];
  citizen_lgas TEXT[] := ARRAY[
    'Lokoja', 'Lokoja', 'Lokoja', 'Lokoja', 'Lokoja', 'Lokoja', 'Lokoja', 'Lokoja', 'Lokoja',
    'Anyigba', 'Anyigba', 'Anyigba', 'Anyigba', 'Anyigba', 'Anyigba', 'Anyigba', 'Anyigba',
    'Okene', 'Okene', 'Okene', 'Okene', 'Okene', 'Okene', 'Okene', 'Okene',
    'Idah', 'Idah', 'Idah', 'Idah', 'Idah', 'Idah', 'Idah', 'Idah',
    'Kabba', 'Kabba', 'Kabba', 'Kabba', 'Kabba', 'Kabba', 'Kabba', 'Kabba',
    'Ankpa', 'Ankpa', 'Ankpa', 'Ankpa', 'Ankpa', 'Ankpa', 'Ankpa', 'Ankpa', 'Ankpa'
  ];
  i INT;
  citizen_id UUID;
  eco_pts INT;
  eco_scr INT;
  total_rpts INT;
  total_wt NUMERIC;
BEGIN
  FOR i IN 1..50 LOOP
    citizen_id := ('c1000000-0000-4000-8000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    eco_pts := (RANDOM() * 800 + 50)::INT;
    eco_scr := (RANDOM() * 60 + 20)::INT;
    total_rpts := (RANDOM() * 15 + 1)::INT;
    total_wt := (RANDOM() * 200 + 10)::NUMERIC(10,1);

    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role,
      created_at, updated_at, confirmation_token, confirmation_sent_at,
      email_change, email_change_token_new, recovery_token,
      is_super_admin, phone, phone_confirmed_at, last_sign_in_at
    ) VALUES (
      citizen_id, '00000000-0000-0000-0000-000000000000', citizen_emails[i],
      crypt('EcoKogi2025!', gen_salt('bf')), NOW(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', citizen_names[i], 'role', 'citizen'),
      'authenticated', 'authenticated',
      NOW() - (RANDOM() * 60 || ' days')::INTERVAL, NOW(),
      '', NOW(), '', '', '',
      false, NULL, NULL, NOW()
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO profiles (
      id, email, full_name, role, eco_points, lga, is_verified,
      total_reports, total_weight_kg, eco_score, created_at, updated_at
    ) VALUES (
      citizen_id, citizen_emails[i], citizen_names[i], 'citizen', eco_pts,
      citizen_lgas[i], (RANDOM() > 0.3), total_rpts, total_wt, eco_scr,
      NOW() - (RANDOM() * 60 || ' days')::INTERVAL, NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- STEP 2: Create 19 additional recycling partners/vendors (total 20)
DO $$
DECLARE
  vendor_names TEXT[] := ARRAY[
    'Kogi Green Recyclers', 'Anyigba Waste-to-Wealth', 'Okene Metal Works',
    'Idah Paper Mill Collectors', 'Kabba Organic Compost Ltd', 'Ankpa Plastic Hub',
    'Lokoja E-Waste Solutions', 'Confluence Recycling Co.', 'Benue-Kogi Waste Mgmt',
    'Niger-Niger Recyclers', 'Kogi South Plastics', 'Idah Glass Works',
    'Kabba Textile Recyclers', 'Ankpa Green Energy', 'Okene Scrap Metal Depot',
    'Anyigba Bio-Waste Ltd', 'Lokoja Central Recycling', 'Kogi Clean Tech',
    'Confluence Eco Partners'
  ];
  vendor_lgas TEXT[] := ARRAY[
    'Lokoja', 'Anyigba', 'Okene', 'Idah', 'Kabba', 'Ankpa',
    'Lokoja', 'Lokoja', 'Anyigba', 'Okene', 'Idah', 'Idah',
    'Kabba', 'Ankpa', 'Okene', 'Anyigba', 'Lokoja', 'Lokoja', 'Lokoja'
  ];
  contact_names TEXT[] := ARRAY[
    'Alhaji Sani Mohammed', 'Dr. Comfort Adeyi', 'Engr. Bello Yusuf',
    'Mrs. Ngozi Eze', 'Chief Olatunde Bakare', 'Mallam Garba Aliyu',
    'Engr. Chidi Nwosu', 'Mrs. Amina Lawal', 'Dr. Peter Ogbonna',
    'Alhaji Dauda Sule', 'Mrs. Grace Igwe', 'Engr. Yakubu Hassan',
    'Chief Adekunle Ojo', 'Mallam Nasiru Bako', 'Engr. Fatima Usman',
    'Dr. Samuel Chukwu', 'Mrs. Hauwa Abdullahi', 'Engr. David Oladele',
    'Chief Mercy Okonkwo'
  ];
  i INT;
  vendor_id UUID;
  mat_arr TEXT[];
BEGIN
  FOR i IN 1..19 LOOP
    vendor_id := ('d0d0d0d0-2222-4000-8000-' || LPAD((i+1)::TEXT, 12, '0'))::UUID;
    
    IF i IN (1, 6, 8, 10, 11, 17, 19) THEN mat_arr := ARRAY['Plastic', 'Metal'];
    ELSIF i IN (2, 5, 16) THEN mat_arr := ARRAY['Organic', 'Paper'];
    ELSIF i IN (3, 7, 9, 15) THEN mat_arr := ARRAY['Metal', 'Electronic'];
    ELSIF i IN (4, 12) THEN mat_arr := ARRAY['Paper', 'Textile'];
    ELSIF i IN (13, 18) THEN mat_arr := ARRAY['Textile', 'Organic'];
    ELSIF i = 14 THEN mat_arr := ARRAY['Electronic', 'Plastic'];
    ELSE mat_arr := ARRAY['Plastic', 'Glass'];
    END IF;

    INSERT INTO recycling_partners (
      id, business_name, contact_person, phone, email, address, lga,
      materials_accepted, is_verified, is_active, created_at
    ) VALUES (
      vendor_id, vendor_names[i], contact_names[i],
      '+234' || LPAD((8000000000 + i * 100000 + (RANDOM() * 99999)::INT)::TEXT, 10, '0'),
      LOWER(REPLACE(vendor_names[i], ' ', '')) || '@ecokogi.ng',
      vendor_lgas[i] || ' Main Market', vendor_lgas[i],
      mat_arr, (RANDOM() > 0.2), true,
      NOW() - (RANDOM() * 30 || ' days')::INTERVAL
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- STEP 3: Add 7 more fleet vehicles (total 15)
INSERT INTO fleet_vehicles (
  vehicle_name, plate_number, vehicle_type, status, fuel_level, fuel_type,
  capacity_kg, current_load_kg, latitude, longitude, gps_status,
  last_gps_update, speed_kmh, mileage_km, assigned_zone, year_manufactured, is_active
) VALUES
  ('EcoKogi Compactor #5', 'KGI-009-AC', 'compactor_truck', 'active', 85, 'diesel', 8000, 1200, 7.7531, 6.7351, 'online', NOW(), 0, 45200, 'Anyigba', 2022, true),
  ('EcoKogi Compactor #6', 'KGI-010-AC', 'compactor_truck', 'on_route', 62, 'diesel', 8000, 3400, 7.5589, 7.1476, 'online', NOW(), 35, 38900, 'Okene', 2021, true),
  ('EcoKogi Mini #2', 'KGI-011-MT', 'mini_truck', 'active', 95, 'petrol', 3000, 0, 7.0909, 6.7407, 'online', NOW(), 0, 22100, 'Idah', 2023, true),
  ('EcoKogi Tipper #2', 'KGI-012-TT', 'tipper_truck', 'idle', 78, 'diesel', 12000, 0, 7.3785, 7.4913, 'online', NOW(), 0, 67800, 'Kabba', 2020, true),
  ('EcoKogi Electric Van #2', 'KGI-013-EV', 'electric_van', 'active', 100, 'electric', 2500, 800, 7.0321, 7.6834, 'online', NOW(), 0, 12500, 'Ankpa', 2024, true),
  ('EcoKogi Skip Loader #2', 'KGI-014-SL', 'skip_loader', 'maintenance', 45, 'diesel', 10000, 0, 7.7531, 6.7351, 'offline', NOW() - INTERVAL '2 hours', 0, 89200, 'Lokoja', 2019, true),
  ('EcoKogi CNG Truck #1', 'KGI-015-CN', 'compactor_truck', 'on_route', 70, 'cng', 7000, 2100, 7.5589, 7.1476, 'online', NOW(), 28, 15600, 'Okene', 2023, true)
ON CONFLICT (plate_number) DO NOTHING;

-- STEP 4: Create 100 waste reports
DO $$
DECLARE
  waste_types TEXT[] := ARRAY['Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'General', 'Glass', 'Textile'];
  statuses TEXT[] := ARRAY['Pending', 'In Progress', 'Collected', 'Recycled'];
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
    'Textile waste from the tailoring shops'
  ];
  locations TEXT[] := ARRAY[
    'Lokoja Main Market', 'Confluence Area, Lokoja', 'Lokoja Motor Park',
    'Anyigba University Junction', 'Anyigba Central Market', 'Anyigba River Bank',
    'Okene Town Hall Area', 'Okene Motor Park', 'Okene Residential Zone',
    'Idah Government House Road', 'Idah Market Square', 'Idah Riverside',
    'Kabba Main Junction', 'Kabba Market', 'Kabba Residential Area',
    'Ankpa Town Center', 'Ankpa Market Road', 'Ankpa School Zone',
    'Lokoja Waterfront', 'Lokoja GRA Phase II'
  ];
  i INT;
  report_id UUID;
  reporter_idx INT;
  officer_ids UUID[];
  citizen_ids UUID[];
  report_status TEXT;
  report_date TIMESTAMPTZ;
BEGIN
  SELECT ARRAY(SELECT id FROM officers WHERE is_active = true) INTO officer_ids;
  SELECT ARRAY(SELECT id FROM profiles WHERE role = 'citizen' AND id != 'd0d0d0d0-1111-4000-8000-000000000001') INTO citizen_ids;

  FOR i IN 1..100 LOOP
    report_id := ('e1000000-0000-4000-8000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    reporter_idx := (RANDOM() * (array_length(citizen_ids, 1) - 1) + 1)::INT;
    report_status := statuses[(RANDOM() * 3 + 1)::INT];
    report_date := NOW() - (RANDOM() * 45 || ' days')::INTERVAL;

    INSERT INTO waste_reports (
      id, reporter_id, waste_type, description, location, latitude, longitude,
      image_url, status, points_earned, assigned_officer_id, created_at
    ) VALUES (
      report_id,
      citizen_ids[reporter_idx],
      waste_types[(RANDOM() * (array_length(waste_types, 1) - 1) + 1)::INT],
      descriptions[(RANDOM() * (array_length(descriptions, 1) - 1) + 1)::INT],
      locations[(RANDOM() * (array_length(locations, 1) - 1) + 1)::INT],
      7.0 + RANDOM() * 1.0,
      6.5 + RANDOM() * 1.5,
      CASE WHEN RANDOM() > 0.5 THEN 'https://images.unsplash.com/photo-' || (1500000000000 + (RANDOM() * 100000000)::BIGINT)::TEXT || '?w=400' ELSE NULL END,
      report_status,
      CASE WHEN report_status IN ('Collected', 'Recycled') THEN 50 ELSE 0 END,
      CASE WHEN report_status IN ('In Progress', 'Collected', 'Recycled') AND array_length(officer_ids, 1) > 0
        THEN officer_ids[(RANDOM() * (array_length(officer_ids, 1) - 1) + 1)::INT]
        ELSE NULL END,
      report_date
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- STEP 5: Create 30 pickup requests
DO $$
DECLARE
  waste_types TEXT[] := ARRAY['Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'General', 'Glass', 'Textile'];
  pickup_statuses TEXT[] := ARRAY['Scheduled', 'Assigned', 'In Transit', 'Completed', 'Cancelled'];
  addresses TEXT[] := ARRAY[
    '15 Mosque Road, Lokoja', '42 Market Street, Anyigba', '8 GRA Phase 1, Okene',
    '23 School Road, Idah', '67 Main Market, Kabba', '11 Town Center, Ankpa',
    '55 River Lane, Lokoja', '30 University Gate, Anyigba', '19 Hill Road, Okene',
    '44 Government Area, Idah', '78 Station Road, Kabba', '33 Mosque Street, Ankpa',
    '61 Confluence Drive, Lokoja', '25 Farm Road, Anyigba', '14 Palace Road, Okene',
    '38 Hospital Road, Idah', '52 Junction Road, Kabba', '16 School Lane, Ankpa',
    '70 Waterfront, Lokoja', '45 Community Road, Anyigba', '22 Market Road, Okene',
    '9 Bridge Street, Idah', '63 Central Area, Kabba', '28 Community Hall, Ankpa',
    '85 New Layout, Lokoja', '17 Bye-Pass, Anyigba', '35 Old Market, Okene',
    '48 Junction, Idah', '71 Roundabout, Kabba', '40 Stadium Road, Ankpa'
  ];
  i INT;
  pickup_id UUID;
  citizen_ids UUID[];
  officer_ids UUID[];
  pickup_status TEXT;
BEGIN
  SELECT ARRAY(SELECT id FROM profiles WHERE role = 'citizen' AND id != 'd0d0d0d0-1111-4000-8000-000000000001') INTO citizen_ids;
  SELECT ARRAY(SELECT id FROM officers WHERE is_active = true) INTO officer_ids;

  FOR i IN 1..30 LOOP
    pickup_id := ('f1000000-0000-4000-8000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    pickup_status := pickup_statuses[(RANDOM() * (array_length(pickup_statuses, 1) - 1) + 1)::INT];

    INSERT INTO pickup_requests (
      id, citizen_id, officer_id, waste_type, estimated_weight_kg,
      pickup_address, scheduled_date, status, notes, created_at
    ) VALUES (
      pickup_id,
      citizen_ids[(RANDOM() * (array_length(citizen_ids, 1) - 1) + 1)::INT],
      CASE WHEN pickup_status IN ('Assigned', 'In Transit', 'Completed') AND array_length(officer_ids, 1) > 0
        THEN officer_ids[(RANDOM() * (array_length(officer_ids, 1) - 1) + 1)::INT]
        ELSE NULL END,
      waste_types[(RANDOM() * (array_length(waste_types, 1) - 1) + 1)::INT],
      (RANDOM() * 50 + 5)::NUMERIC(10,1),
      addresses[i],
      NOW() + (RANDOM() * 14 || ' days')::INTERVAL,
      pickup_status,
      CASE
        WHEN RANDOM() > 0.7 THEN 'Please collect before 10am'
        WHEN RANDOM() > 0.5 THEN 'Waste is sorted and bagged'
        WHEN RANDOM() > 0.3 THEN 'Large quantity, may need extra help'
        ELSE NULL
      END,
      NOW() - (RANDOM() * 7 || ' days')::INTERVAL
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- STEP 6: Create ~134 more recycling transactions (total ~150)
DO $$
DECLARE
  material_types TEXT[] := ARRAY['Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'General', 'Glass', 'Textile'];
  quality_grades TEXT[] := ARRAY['A', 'B', 'C'];
  tx_statuses TEXT[] := ARRAY['Completed', 'Completed', 'Completed', 'Pending'];
  partner_ids UUID[];
  citizen_ids UUID[];
  i INT;
  tx_id UUID;
  wt NUMERIC;
  rate INT;
  payout INT;
  mat TEXT;
BEGIN
  SELECT ARRAY(SELECT id FROM recycling_partners) INTO partner_ids;
  SELECT ARRAY(SELECT id FROM profiles WHERE role = 'citizen' AND id != 'd0d0d0d0-1111-4000-8000-000000000001') INTO citizen_ids;

  FOR i IN 1..134 LOOP
    tx_id := ('a1000000-0000-4000-8000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    wt := (RANDOM() * 100 + 2)::NUMERIC(10,1);
    mat := material_types[(RANDOM() * (array_length(material_types, 1) - 1) + 1)::INT];

    IF mat = 'Plastic' THEN rate := 150;
    ELSIF mat = 'Metal' THEN rate := 400;
    ELSIF mat = 'Paper' THEN rate := 80;
    ELSIF mat = 'Organic' THEN rate := 50;
    ELSIF mat = 'Electronic' THEN rate := 600;
    ELSIF mat = 'Glass' THEN rate := 120;
    ELSIF mat = 'Textile' THEN rate := 90;
    ELSE rate := 20;
    END IF;

    payout := (wt * rate)::INT;

    INSERT INTO recycling_transactions (
      id, partner_id, citizen_id, material_type, weight_kg, rate_per_kg,
      total_payout, quality_grade, status, created_at
    ) VALUES (
      tx_id,
      partner_ids[(RANDOM() * (array_length(partner_ids, 1) - 1) + 1)::INT],
      CASE WHEN RANDOM() > 0.3 AND array_length(citizen_ids, 1) > 0
        THEN citizen_ids[(RANDOM() * (array_length(citizen_ids, 1) - 1) + 1)::INT]
        ELSE NULL END,
      mat,
      wt, rate, payout,
      quality_grades[(RANDOM() * (array_length(quality_grades, 1) - 1) + 1)::INT],
      tx_statuses[(RANDOM() * (array_length(tx_statuses, 1) - 1) + 1)::INT],
      NOW() - (RANDOM() * 60 || ' days')::INTERVAL
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- STEP 7: Create reward redemptions
DO $$
DECLARE
  reward_ids UUID[];
  citizen_ids UUID[];
  redemption_statuses TEXT[] := ARRAY['Pending', 'Delivered', 'Delivered', 'Delivered', 'Cancelled'];
  i INT;
  redemption_id UUID;
BEGIN
  SELECT ARRAY(SELECT id FROM rewards WHERE is_active = true) INTO reward_ids;
  SELECT ARRAY(SELECT id FROM profiles WHERE role = 'citizen' AND id != 'd0d0d0d0-1111-4000-8000-000000000001') INTO citizen_ids;

  FOR i IN 1..40 LOOP
    redemption_id := ('b1000000-0000-4000-8000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    INSERT INTO reward_redemptions (
      id, profile_id, reward_id, points_spent, status, redeemed_at
    ) VALUES (
      redemption_id,
      citizen_ids[(RANDOM() * (array_length(citizen_ids, 1) - 1) + 1)::INT],
      reward_ids[(RANDOM() * (array_length(reward_ids, 1) - 1) + 1)::INT],
      (RANDOM() * 400 + 100)::INT,
      redemption_statuses[(RANDOM() * (array_length(redemption_statuses, 1) - 1) + 1)::INT],
      NOW() - (RANDOM() * 30 || ' days')::INTERVAL
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- STEP 8: Add more community challenges
INSERT INTO challenges (title, description, challenge_type, target_value, current_value, reward_points, start_date, end_date, is_active, created_at)
VALUES
  ('Anyigba Plastic-Free Challenge', 'Collect and recycle plastic waste across Anyigba community for a cleaner environment.', 'collection', 300, 187, 750, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', true, NOW() - INTERVAL '10 days'),
  ('Kabba Composting Drive', 'Turn organic waste into compost. Every kg of organic waste counts!', 'recycling', 200, 134, 600, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', true, NOW() - INTERVAL '5 days'),
  ('Idah E-Waste Collection', 'Bring your old electronics to designated collection points. Safe disposal for a greener future.', 'collection', 100, 78, 1000, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', true, NOW() - INTERVAL '15 days'),
  ('Ankpa Clean Waterways', 'Help keep Ankpa rivers and streams clean by reporting and collecting waste near water bodies.', 'community', 150, 92, 800, NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days', true, NOW() - INTERVAL '7 days'),
  ('Kogi-Wide Paper Recycling', 'A state-wide challenge to recycle paper waste. Schools, markets, and offices welcome!', 'recycling', 500, 312, 1200, NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days', true, NOW() - INTERVAL '20 days'),
  ('Okene Metal Recovery', 'Collect and submit scrap metal for recycling. Earn points and keep Okene clean.', 'collection', 250, 250, 900, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day', false, NOW() - INTERVAL '30 days'),
  ('Lokoja Glass Cleanup', 'Collect glass waste from construction sites and markets for safe recycling.', 'collection', 180, 145, 700, NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days', true, NOW() - INTERVAL '12 days')
ON CONFLICT DO NOTHING;

-- STEP 9: Create challenge participations
DO $$
DECLARE
  challenge_ids UUID[];
  citizen_ids UUID[];
  i INT;
  part_id UUID;
  cid UUID;
  pid UUID;
BEGIN
  SELECT ARRAY(SELECT id FROM challenges WHERE is_active = true) INTO challenge_ids;
  SELECT ARRAY(SELECT id FROM profiles WHERE role = 'citizen' AND id != 'd0d0d0d0-1111-4000-8000-000000000001') INTO citizen_ids;

  FOR i IN 1..80 LOOP
    part_id := ('c2000000-0000-4000-8000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    cid := challenge_ids[(RANDOM() * (array_length(challenge_ids, 1) - 1) + 1)::INT];
    pid := citizen_ids[(RANDOM() * (array_length(citizen_ids, 1) - 1) + 1)::INT];
    
    INSERT INTO challenge_participations (
      id, challenge_id, profile_id, contribution, completed, joined_at, completed_at
    ) VALUES (
      part_id, cid, pid,
      (RANDOM() * 50 + 1)::INT,
      RANDOM() > 0.6,
      NOW() - (RANDOM() * 14 || ' days')::INTERVAL,
      CASE WHEN RANDOM() > 0.6 THEN NOW() - (RANDOM() * 3 || ' days')::INTERVAL ELSE NULL END
    ) ON CONFLICT (challenge_id, profile_id) DO UPDATE
    SET contribution = EXCLUDED.contribution,
        completed = EXCLUDED.completed,
        completed_at = EXCLUDED.completed_at;
  END LOOP;
END $$;

-- STEP 10: Create notifications distributed across citizens
DO $$
DECLARE
  citizen_ids UUID[];
  notif_types TEXT[] := ARRAY['info', 'reward', 'pickup', 'report', 'challenge', 'system'];
  notif_titles TEXT[] := ARRAY[
    'Points Earned!', 'Pickup Scheduled', 'Weekly Report',
    'Challenge Update', 'New Reward Available', 'System Update',
    'Report Collected', 'EcoScore Increased', 'New Collection Point',
    'Reward Redeemed'
  ];
  notif_messages TEXT[] := ARRAY[
    'You earned 50 eco-points for your waste report!',
    'Your pickup has been scheduled for tomorrow at 9:00 AM.',
    'Your weekly impact: 5 reports, 12kg recycled, 250 points earned.',
    'The Lokoja Clean Streets challenge is 60% complete. Keep contributing!',
    'New reward available: Data Bundle 1GB for just 200 points.',
    'EcoKogi system maintenance scheduled for this weekend.',
    'Your waste report has been collected. Thank you for keeping Kogi clean!',
    'Your EcoScore increased to 75! You are now in the Silver tier.',
    'A new recycling collection point has opened in your area.',
    'Your reward redemption is being processed. Delivery in 2-3 days.'
  ];
  i INT;
  notif_id UUID;
BEGIN
  SELECT ARRAY(SELECT id FROM profiles WHERE role = 'citizen' AND id != 'd0d0d0d0-1111-4000-8000-000000000001') INTO citizen_ids;

  FOR i IN 1..100 LOOP
    notif_id := ('d2000000-0000-4000-8000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    INSERT INTO notifications (
      id, user_id, title, message, type, is_read, created_at
    ) VALUES (
      notif_id,
      citizen_ids[(RANDOM() * (array_length(citizen_ids, 1) - 1) + 1)::INT],
      notif_titles[(RANDOM() * (array_length(notif_titles, 1) - 1) + 1)::INT],
      notif_messages[(RANDOM() * (array_length(notif_messages, 1) - 1) + 1)::INT],
      notif_types[(RANDOM() * (array_length(notif_types, 1) - 1) + 1)::INT],
      RANDOM() > 0.4,
      NOW() - (RANDOM() * 30 || ' days')::INTERVAL
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- STEP 11: Create leaderboard entries for top citizens
DO $$
DECLARE
  citizen_ids UUID[];
  periods TEXT[] := ARRAY['weekly', 'monthly', 'yearly', 'all_time'];
  i INT;
  j INT;
  lb_id UUID;
  citizen_id UUID;
  pts INT;
  rpts INT;
  wt NUMERIC;
BEGIN
  SELECT ARRAY(SELECT id FROM profiles WHERE role = 'citizen' AND id != 'd0d0d0d0-1111-4000-8000-000000000001' ORDER BY eco_points DESC LIMIT 30) INTO citizen_ids;

  FOR j IN 1..4 LOOP
    FOR i IN 1..30 LOOP
      lb_id := ('e2000000-0000-4000-' || LPAD(j::TEXT, 4, '0') || '-' || LPAD(i::TEXT, 12, '0'))::UUID;
      citizen_id := citizen_ids[i];
      pts := (RANDOM() * 2000 + 100)::INT;
      rpts := (RANDOM() * 20 + 1)::INT;
      wt := (RANDOM() * 300 + 10)::NUMERIC(10,1);

      INSERT INTO leaderboard (
        id, profile_id, period, rank, total_points, total_reports, total_weight_kg, updated_at
      ) VALUES (
        lb_id, citizen_id, periods[j], i, pts, rpts, wt, NOW()
      ) ON CONFLICT (profile_id, period) DO UPDATE
      SET rank = EXCLUDED.rank,
          total_points = EXCLUDED.total_points,
          total_reports = EXCLUDED.total_reports,
          total_weight_kg = EXCLUDED.total_weight_kg,
          updated_at = NOW();
    END LOOP;
  END LOOP;
END $$;

-- STEP 12: Add more environmental tips
INSERT INTO environmental_tips (title, content, category, icon, is_active, display_order)
VALUES
  ('Reduce Plastic Use', 'Carry a reusable water bottle and shopping bag. Every plastic item avoided makes a difference!', 'reduction', NULL, true, 7),
  ('Compost at Home', 'Turn your kitchen scraps into nutrient-rich compost. Mix greens and browns for best results.', 'composting', NULL, true, 8),
  ('Recycle Electronics Safely', 'Never throw electronics in regular trash. They contain hazardous materials. Use designated e-waste points.', 'recycling', NULL, true, 9),
  ('Support Local Recyclers', 'Buy products made from recycled materials. Your purchasing power drives the recycling economy.', 'general', NULL, true, 10)
ON CONFLICT DO NOTHING;

-- STEP 13: Add analytics data for dashboard
DO $$
DECLARE
  lgas TEXT[] := ARRAY['Lokoja', 'Anyigba', 'Okene', 'Idah', 'Kabba', 'Ankpa'];
  i INT;
  j INT;
  analytics_id UUID;
BEGIN
  FOR j IN 1..6 LOOP
    FOR i IN 1..4 LOOP
      analytics_id := ('f2000000-0000-4000-8000-' || LPAD((j*4+i)::TEXT, 12, '0'))::UUID;
      INSERT INTO analytics (
        id, period_type, period_start, period_end, lga,
        total_reports, total_collections, total_weight_kg, total_payout,
        co2_saved_kg, active_citizens, active_vendors
      ) VALUES (
        analytics_id,
        CASE WHEN i <= 2 THEN 'weekly' ELSE 'monthly' END,
        NOW() - (i * 7 || ' days')::INTERVAL::DATE,
        NOW()::DATE,
        lgas[j],
        (RANDOM() * 50 + 10)::INT,
        (RANDOM() * 40 + 5)::INT,
        (RANDOM() * 500 + 50)::NUMERIC(10,1),
        (RANDOM() * 50000 + 5000)::INT,
        (RANDOM() * 1000 + 100)::NUMERIC(10,1),
        (RANDOM() * 15 + 3)::INT,
        (RANDOM() * 5 + 1)::INT
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- STEP 14: Update challenge current values to reflect participation
UPDATE challenges SET current_value = (
  SELECT COALESCE(SUM(contribution), 0) FROM challenge_participations WHERE challenge_id = challenges.id
) WHERE is_active = true;
