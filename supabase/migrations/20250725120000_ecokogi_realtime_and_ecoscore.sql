-- ============================================================
-- EcoKogi Enhancement: EcoScore Column & Realtime Enablement
-- Adds eco_score to profiles and enables Supabase Realtime
-- for real-time dashboard updates
-- ============================================================

-- ============================================================
-- 1. ADD ECO_SCORE COLUMN TO PROFILES
-- EcoScore is a reputation/impact metric (separate from spendable EcoPoints)
-- ============================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS eco_score INTEGER NOT NULL DEFAULT 0;

-- Index for leaderboard-style queries on eco_score
CREATE INDEX IF NOT EXISTS idx_profiles_eco_score 
ON public.profiles USING btree (eco_score DESC);

-- ============================================================
-- 2. ENABLE SUPABASE REALTIME ON KEY TABLES
-- Required for Gov Portal real-time dashboard & notifications
-- ============================================================

-- Notifications: Real-time bell updates for all users
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Waste Reports: Real-time updates for Gov dashboard incident tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.waste_reports;

-- Pickup Requests: Real-time status updates for citizens and gov
ALTER PUBLICATION supabase_realtime ADD TABLE public.pickup_requests;

-- Challenges: Real-time progress updates for community engagement
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;

-- Challenge Participations: Real-time contribution tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_participations;

-- Leaderboard: Real-time ranking updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;

-- ============================================================
-- 3. ADD STORAGE BUCKET SIZE LIMIT
-- Restrict uploads to 5MB for waste images
-- ============================================================
UPDATE storage.buckets 
SET file_size_limit = 5242880,  -- 5MB
    allowed_mime_types = '{image/jpeg,image/png,image/webp,image/gif}'::text[]
WHERE name = 'waste_images';
