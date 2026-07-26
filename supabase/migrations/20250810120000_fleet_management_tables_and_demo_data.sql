-- ============================================================================
-- Fleet Management Tables & Demo Data for EcoKogi
-- Creates fleet_vehicles, fleet_routes, fleet_assignments, fleet_schedules
-- Seeds 8 vehicles, 6 routes, 8 assignments, 30 schedules, 8 officers
-- GPS coordinates around Lokoja, Kogi State
-- ============================================================================

-- 1. FLEET VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.fleet_vehicles (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    vehicle_name text NOT NULL,
    plate_number text NOT NULL UNIQUE,
    vehicle_type text NOT NULL DEFAULT 'compactor_truck' 
        CHECK (vehicle_type IN ('compactor_truck', 'skip_loader', 'tipper_truck', 'mini_truck', 'electric_van')),
    status text NOT NULL DEFAULT 'idle' 
        CHECK (status IN ('active', 'idle', 'maintenance', 'out_of_service', 'on_route')),
    fuel_level integer NOT NULL DEFAULT 100 CHECK (fuel_level >= 0 AND fuel_level <= 100),
    fuel_type text NOT NULL DEFAULT 'diesel' 
        CHECK (fuel_type IN ('diesel', 'petrol', 'cng', 'electric', 'hybrid')),
    capacity_kg numeric NOT NULL DEFAULT 5000 CHECK (capacity_kg > 0),
    current_load_kg numeric NOT NULL DEFAULT 0 CHECK (current_load_kg >= 0),
    latitude numeric(10, 7),
    longitude numeric(10, 7),
    gps_status text NOT NULL DEFAULT 'online' 
        CHECK (gps_status IN ('online', 'offline', 'weak_signal', 'error')),
    last_gps_update timestamptz,
    speed_kmh numeric(5, 2) DEFAULT 0,
    mileage_km integer DEFAULT 0,
    last_maintenance_date date,
    next_maintenance_date date,
    engine_hours numeric(8, 2) DEFAULT 0,
    assigned_zone text DEFAULT 'Lokoja Central',
    assigned_driver_id uuid REFERENCES public.officers(id),
    image_url text,
    year_manufactured integer,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. FLEET ROUTES TABLE
CREATE TABLE IF NOT EXISTS public.fleet_routes (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    route_name text NOT NULL,
    route_code text NOT NULL UNIQUE,
    zone text NOT NULL DEFAULT 'Lokoja Central',
    start_point text NOT NULL,
    end_point text NOT NULL,
    distance_km numeric(6, 2) NOT NULL DEFAULT 0,
    estimated_duration_minutes integer NOT NULL DEFAULT 60,
    waypoints jsonb DEFAULT '[]'::jsonb,
    schedule_type text NOT NULL DEFAULT 'daily' 
        CHECK (schedule_type IN ('daily', 'weekdays', 'weekly', 'biweekly', 'on_demand')),
    scheduled_time time DEFAULT '06:00:00',
    status text NOT NULL DEFAULT 'planned' 
        CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    assigned_vehicle_id uuid REFERENCES public.fleet_vehicles(id),
    total_collections integer DEFAULT 0,
    total_weight_kg numeric DEFAULT 0,
    last_completed_at timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. FLEET ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.fleet_assignments (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    officer_id uuid NOT NULL REFERENCES public.officers(id),
    vehicle_id uuid NOT NULL REFERENCES public.fleet_vehicles(id),
    route_id uuid REFERENCES public.fleet_routes(id),
    assignment_type text NOT NULL DEFAULT 'daily' 
        CHECK (assignment_type IN ('daily', 'weekly', 'permanent', 'temporary')),
    status text NOT NULL DEFAULT 'scheduled' 
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_date date NOT NULL DEFAULT CURRENT_DATE,
    start_time timestamptz,
    end_time timestamptz,
    collections_completed integer DEFAULT 0,
    total_weight_collected_kg numeric DEFAULT 0,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(officer_id, vehicle_id, scheduled_date)
);

-- 4. FLEET SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.fleet_schedules (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    vehicle_id uuid NOT NULL REFERENCES public.fleet_vehicles(id),
    route_id uuid REFERENCES public.fleet_routes(id),
    day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time time NOT NULL DEFAULT '06:00:00',
    end_time time NOT NULL DEFAULT '14:00:00',
    is_recurring boolean NOT NULL DEFAULT true,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_status ON public.fleet_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_zone ON public.fleet_vehicles(assigned_zone);
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_gps ON public.fleet_vehicles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_assigned_driver ON public.fleet_vehicles(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_fleet_routes_zone ON public.fleet_routes(zone);
CREATE INDEX IF NOT EXISTS idx_fleet_routes_status ON public.fleet_routes(status);
CREATE INDEX IF NOT EXISTS idx_fleet_routes_assigned_vehicle ON public.fleet_routes(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fleet_assignments_officer ON public.fleet_assignments(officer_id);
CREATE INDEX IF NOT EXISTS idx_fleet_assignments_vehicle ON public.fleet_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fleet_assignments_date ON public.fleet_assignments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_fleet_assignments_status ON public.fleet_assignments(status);
CREATE INDEX IF NOT EXISTS idx_fleet_schedules_vehicle ON public.fleet_schedules(vehicle_id);

-- 6. ROW LEVEL SECURITY
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fleet vehicles - Government read" ON public.fleet_vehicles;
CREATE POLICY "Fleet vehicles - Government read"
    ON public.fleet_vehicles FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('government', 'admin')));

DROP POLICY IF EXISTS "Fleet vehicles - Admin write" ON public.fleet_vehicles;
CREATE POLICY "Fleet vehicles - Admin write"
    ON public.fleet_vehicles FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Fleet routes - Government read" ON public.fleet_routes;
CREATE POLICY "Fleet routes - Government read"
    ON public.fleet_routes FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('government', 'admin')));

DROP POLICY IF EXISTS "Fleet routes - Admin write" ON public.fleet_routes;
CREATE POLICY "Fleet routes - Admin write"
    ON public.fleet_routes FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Fleet assignments - Government read" ON public.fleet_assignments;
CREATE POLICY "Fleet assignments - Government read"
    ON public.fleet_assignments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('government', 'admin')));

DROP POLICY IF EXISTS "Fleet assignments - Admin write" ON public.fleet_assignments;
CREATE POLICY "Fleet assignments - Admin write"
    ON public.fleet_assignments FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Fleet schedules - Government read" ON public.fleet_schedules;
CREATE POLICY "Fleet schedules - Government read"
    ON public.fleet_schedules FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('government', 'admin')));

DROP POLICY IF EXISTS "Fleet schedules - Admin write" ON public.fleet_schedules;
CREATE POLICY "Fleet schedules - Admin write"
    ON public.fleet_schedules FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 7. DEMO DATA: Officers
INSERT INTO public.officers (full_name, phone, zone, truck_id, status, is_active)
VALUES 
    ('Musa Ibrahim', '+234-801-234-5678', 'Lokoja Central', 'TRK-001', 'On Route', true),
    ('Adekunle Ojo', '+234-802-345-6789', 'Lokoja North', 'TRK-002', 'Available', true),
    ('Fatima Bello', '+234-803-456-7890', 'Lokoja South', 'TRK-003', 'On Route', true),
    ('Emeka Nwosu', '+234-804-567-8901', 'Kabba/Bunu', 'TRK-004', 'Available', true),
    ('Ibrahim Salisu', '+234-805-678-9012', 'Okene', 'TRK-005', 'Offline', true),
    ('Grace Adeyemi', '+234-806-789-0123', 'Lokoja West', 'TRK-006', 'On Route', true),
    ('Yusuf Danjuma', '+234-807-890-1234', 'Lokoja East', 'TRK-007', 'Available', true),
    ('Blessing Okafor', '+234-808-901-2345', 'Ajaokuta', 'TRK-008', 'On Route', true)
ON CONFLICT DO NOTHING;

-- 8. DEMO DATA: Fleet Vehicles (8 trucks with GPS around Lokoja)
INSERT INTO public.fleet_vehicles (
    vehicle_name, plate_number, vehicle_type, status, fuel_level, fuel_type,
    capacity_kg, current_load_kg, latitude, longitude, gps_status, last_gps_update,
    speed_kmh, mileage_km, last_maintenance_date, next_maintenance_date,
    assigned_zone, assigned_driver_id, year_manufactured
)
SELECT 
    v.vehicle_name, v.plate_number, v.vehicle_type, v.status, v.fuel_level, v.fuel_type,
    v.capacity_kg, v.current_load_kg, v.latitude, v.longitude, v.gps_status, v.last_gps_update,
    v.speed_kmh, v.mileage_km, v.last_maintenance_date, v.next_maintenance_date,
    v.assigned_zone, o.id, v.year_manufactured
FROM (
    VALUES 
        ('EcoKogi Compactor #1'::text, 'KGI-001-AC'::text, 'compactor_truck'::text, 'on_route'::text, 72, 'diesel'::text,
         8000::numeric, 3200::numeric, 7.8014200::numeric, 6.7334200::numeric, 'online'::text, now() - interval '2 minutes', 35::numeric, 45200, 
         DATE '2025-06-15', DATE '2025-09-15', 'Lokoja Central'::text, 'Musa Ibrahim'::text, 2022),
        ('EcoKogi Compactor #2', 'KGI-002-AC', 'compactor_truck', 'active', 88, 'diesel',
         8000::numeric, 0::numeric, 7.8105300::numeric, 6.7451200::numeric, 'online'::text, now() - interval '5 minutes', 0::numeric, 32100,
         DATE '2025-07-01', DATE '2025-10-01', 'Lokoja North', 'Adekunle Ojo', 2023),
        ('EcoKogi Skip Loader #1', 'KGI-003-SL', 'skip_loader', 'on_route', 45, 'diesel',
         12000::numeric, 7800::numeric, 7.7892100::numeric, 6.7189500::numeric, 'online'::text, now() - interval '1 minute', 28::numeric, 67800,
         DATE '2025-05-20', DATE '2025-08-20', 'Lokoja South', 'Fatima Bello', 2021),
        ('EcoKogi Tipper #1', 'KGI-004-TT', 'tipper_truck', 'idle', 95, 'diesel',
         15000::numeric, 0::numeric, 7.8234500::numeric, 6.7612300::numeric, 'online'::text, now() - interval '15 minutes', 0::numeric, 28500,
         DATE '2025-06-30', DATE '2025-09-30', 'Kabba/Bunu', 'Emeka Nwosu', 2023),
        ('EcoKogi Mini #1', 'KGI-005-MT', 'mini_truck', 'maintenance', 30, 'cng',
         3000::numeric, 0::numeric, 7.7956700::numeric, 6.7278900::numeric, 'offline'::text, now() - interval '2 hours', 0::numeric, 89200,
         DATE '2025-07-10', DATE '2025-07-25', 'Okene', 'Ibrahim Salisu', 2020),
        ('EcoKogi Compactor #3', 'KGI-006-AC', 'compactor_truck', 'on_route', 61, 'diesel',
         8000::numeric, 5100::numeric, 7.8078900::numeric, 6.7023400::numeric, 'online'::text, now() - interval '30 seconds', 42::numeric, 18900,
         DATE '2025-07-05', DATE '2025-10-05', 'Lokoja West', 'Grace Adeyemi', 2024),
        ('EcoKogi Electric Van #1', 'KGI-007-EV', 'electric_van', 'active', 82, 'electric',
         2000::numeric, 0::numeric, 7.8156700::numeric, 6.7534500::numeric, 'online'::text, now() - interval '3 minutes', 0::numeric, 12400,
         DATE '2025-06-20', DATE '2025-09-20', 'Lokoja East', 'Yusuf Danjuma', 2024),
        ('EcoKogi Compactor #4', 'KGI-008-AC', 'compactor_truck', 'on_route', 53, 'hybrid',
         10000::numeric, 6200::numeric, 7.7623400::numeric, 6.6987600::numeric, 'weak_signal'::text, now() - interval '10 minutes', 38::numeric, 52300,
         DATE '2025-05-15', DATE '2025-08-15', 'Ajaokuta', 'Blessing Okafor', 2022)
    ) AS v(vehicle_name, plate_number, vehicle_type, status, fuel_level, fuel_type,
           capacity_kg, current_load_kg, latitude, longitude, gps_status, last_gps_update,
           speed_kmh, mileage_km, last_maintenance_date, next_maintenance_date,
           assigned_zone, driver_name, year_manufactured)
JOIN public.officers o ON o.full_name = v.driver_name
ON CONFLICT (plate_number) DO NOTHING;

-- 9. DEMO DATA: Fleet Routes
INSERT INTO public.fleet_routes (
    route_name, route_code, zone, start_point, end_point, distance_km,
    estimated_duration_minutes, waypoints, schedule_type, scheduled_time, status
)
VALUES 
    ('Lokoja Central Market Route', 'RT-001', 'Lokoja Central', 
     'Lokoja Central Market', 'Dump Site - Lokoja Outskirts', 12.5, 90,
     '[{"lat": 7.8014, "lng": 6.7334, "name": "Central Market"}, {"lat": 7.8045, "lng": 6.7356, "name": "Ahmadu Bello Way"}, {"lat": 7.8078, "lng": 6.7389, "name": "Confluence Point"}, {"lat": 7.8112, "lng": 6.7412, "name": "River Niger Bridge"}, {"lat": 7.8145, "lng": 6.7445, "name": "Dump Site"}]'::jsonb,
     'daily', '06:00:00', 'active'),
    ('Lokoja North Residential Route', 'RT-002', 'Lokoja North',
     'Government House Area', 'Collection Point - North Zone', 8.3, 60,
     '[{"lat": 7.8105, "lng": 6.7451, "name": "Government House"}, {"lat": 7.8134, "lng": 6.7478, "name": "Residential Area A"}, {"lat": 7.8167, "lng": 6.7501, "name": "Residential Area B"}, {"lat": 7.8198, "lng": 6.7523, "name": "Collection Point"}]'::jsonb,
     'weekdays', '07:00:00', 'active'),
    ('Lokoja South Industrial Route', 'RT-003', 'Lokoja South',
     'Industrial Layout', 'Recycling Center - South', 15.7, 120,
     '[{"lat": 7.7892, "lng": 6.7189, "name": "Industrial Layout"}, {"lat": 7.7856, "lng": 6.7156, "name": "Warehouse District"}, {"lat": 7.7823, "lng": 6.7123, "name": "Factory Zone"}, {"lat": 7.7789, "lng": 6.7089, "name": "Recycling Center"}]'::jsonb,
     'daily', '05:30:00', 'active'),
    ('Kabba Town Route', 'RT-004', 'Kabba/Bunu',
     'Kabba Market Square', 'Kabba Dump Site', 6.2, 45,
     '[{"lat": 7.8234, "lng": 6.7612, "name": "Kabba Market"}, {"lat": 7.8256, "lng": 6.7634, "name": "Town Hall"}, {"lat": 7.8278, "lng": 6.7656, "name": "Residential Area"}, {"lat": 7.8301, "lng": 6.7678, "name": "Dump Site"}]'::jsonb,
     'weekly', '08:00:00', 'planned'),
    ('Lokoja West Commercial Route', 'RT-005', 'Lokoja West',
     'Banking District', 'Waste Transfer Station - West', 10.1, 75,
     '[{"lat": 7.8078, "lng": 6.7023, "name": "Banking District"}, {"lat": 7.8056, "lng": 6.6998, "name": "Commercial Area"}, {"lat": 7.8034, "lng": 6.6967, "name": "Shopping Complex"}, {"lat": 7.8012, "lng": 6.6934, "name": "Transfer Station"}]'::jsonb,
     'daily', '06:30:00', 'active'),
    ('Ajaokuta Steel Route', 'RT-006', 'Ajaokuta',
     'Ajaokuta Steel Mill', 'Ajaokuta Collection Hub', 18.4, 150,
     '[{"lat": 7.7623, "lng": 6.6987, "name": "Steel Mill"}, {"lat": 7.7589, "lng": 6.6956, "name": "Worker Housing"}, {"lat": 7.7556, "lng": 6.6923, "name": "Market Area"}, {"lat": 7.7523, "lng": 6.6889, "name": "Collection Hub"}]'::jsonb,
     'weekdays', '05:00:00', 'active')
ON CONFLICT (route_code) DO NOTHING;

-- 10. DEMO DATA: Fleet Assignments
INSERT INTO public.fleet_assignments (officer_id, vehicle_id, route_id, assignment_type, status, scheduled_date, start_time, collections_completed, total_weight_collected_kg)
SELECT o.id, fv.id, fr.id, 'daily', 
    CASE 
        WHEN fv.status = 'on_route' THEN 'in_progress'
        WHEN fv.status = 'active' THEN 'scheduled'
        WHEN fv.status = 'idle' THEN 'scheduled'
        ELSE 'cancelled'
    END,
    CURRENT_DATE,
    CASE WHEN fv.status = 'on_route' THEN now() - (random() * interval '3 hours') ELSE NULL END,
    CASE WHEN fv.status = 'on_route' THEN floor(random() * 8 + 2)::integer ELSE 0 END,
    CASE WHEN fv.status = 'on_route' THEN fv.current_load_kg ELSE 0 END
FROM public.officers o
JOIN public.fleet_vehicles fv ON fv.assigned_zone = o.zone
LEFT JOIN public.fleet_routes fr ON fr.zone = o.zone AND fr.status = 'active'
WHERE o.is_active = true
ON CONFLICT (officer_id, vehicle_id, scheduled_date) DO NOTHING;

-- 11. DEMO DATA: Fleet Schedules
INSERT INTO public.fleet_schedules (vehicle_id, route_id, day_of_week, start_time, end_time, is_recurring)
SELECT fv.id, fr.id, gs.day, '06:00:00', '14:00:00', true
FROM public.fleet_vehicles fv
JOIN public.fleet_routes fr ON fr.zone = fv.assigned_zone AND fr.is_active = true
CROSS JOIN generate_series(0, 4) AS gs(day)
WHERE fv.is_active = true
ON CONFLICT DO NOTHING;

-- 12. UPDATE officers with plate numbers
UPDATE public.officers 
SET truck_id = fv.plate_number
FROM public.fleet_vehicles fv
WHERE fv.assigned_driver_id = officers.id
AND officers.truck_id IS DISTINCT FROM fv.plate_number;

-- 13. GRANT ACCESS FOR SERVICE ROLE
GRANT SELECT ON public.fleet_vehicles TO service_role;
GRANT SELECT ON public.fleet_routes TO service_role;
GRANT SELECT ON public.fleet_assignments TO service_role;
GRANT SELECT ON public.fleet_schedules TO service_role;
GRANT INSERT, UPDATE ON public.fleet_vehicles TO service_role;
GRANT INSERT, UPDATE ON public.fleet_routes TO service_role;
GRANT INSERT, UPDATE ON public.fleet_assignments TO service_role;
GRANT INSERT, UPDATE ON public.fleet_schedules TO service_role;

-- 14. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet_vehicles;
