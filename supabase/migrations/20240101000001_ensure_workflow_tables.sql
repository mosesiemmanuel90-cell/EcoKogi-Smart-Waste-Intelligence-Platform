-- Ensure recycling_partners table has necessary columns
ALTER TABLE public.recycling_partners 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Ensure waste_reports has all necessary columns
ALTER TABLE public.waste_reports
ADD COLUMN IF NOT EXISTS reporter_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS waste_type TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assigned_officer_id UUID,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recycled_at TIMESTAMPTZ;

-- Ensure recycling_transactions has all necessary columns
ALTER TABLE public.recycling_transactions
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.recycling_partners(id),
ADD COLUMN IF NOT EXISTS citizen_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS material_type TEXT,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS rate_per_kg INTEGER,
ADD COLUMN IF NOT EXISTS total_payout INTEGER,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Completed';

-- Ensure profiles has eco_score column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS eco_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS eco_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reports INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'citizen',
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS lga TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create function to update eco_score based on activity
CREATE OR REPLACE FUNCTION public.calculate_eco_score(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_points INTEGER;
  total_reports_count INTEGER;
  total_recycled_kg DECIMAL;
  score INTEGER;
BEGIN
  -- Get user's eco points
  SELECT eco_points, total_reports INTO total_points, total_reports_count
  FROM public.profiles WHERE id = user_id;
  
  -- Get total weight recycled by user
  SELECT COALESCE(SUM(weight_kg), 0) INTO total_recycled_kg
  FROM public.recycling_transactions
  WHERE citizen_id = user_id AND status = 'Completed';
  
  -- Calculate score (0-100)
  score := LEAST(100, (
    (total_points / 10) +
    (total_reports_count * 2) +
    (total_recycled_kg::INTEGER / 5)
  ));
  
  -- Update profile
  UPDATE public.profiles SET eco_score = score WHERE id = user_id;
  
  RETURN score;
END;
$$;

-- Create function to assign officer to report
CREATE OR REPLACE FUNCTION public.assign_officer_to_report(
  report_id UUID,
  officer_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.waste_reports
  SET 
    assigned_officer_id = officer_id,
    assigned_at = now(),
    status = 'In Progress'
  WHERE id = report_id;
END;
$$;

-- Create function to mark report as collected
CREATE OR REPLACE FUNCTION public.mark_report_collected(report_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.waste_reports
  SET 
    status = 'Collected',
    collected_at = now()
  WHERE id = report_id;
END;
$$;

-- Create function to mark report as recycled
CREATE OR REPLACE FUNCTION public.mark_report_recycled(report_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.waste_reports
  SET 
    status = 'Recycled',
    recycled_at = now()
  WHERE id = report_id;
END;
$$;

-- Enable Realtime on all workflow tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.waste_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recycling_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waste_reports_status ON public.waste_reports(status);
CREATE INDEX IF NOT EXISTS idx_waste_reports_reporter ON public.waste_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_waste_reports_assigned_officer ON public.waste_reports(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_citizen ON public.recycling_transactions(citizen_id);
CREATE INDEX IF NOT EXISTS idx_recycling_transactions_partner ON public.recycling_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
