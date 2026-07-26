import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export type WasteType = 'Plastic' | 'Metal' | 'Paper' | 'Organic' | 'Electronic' | 'General';
export type ReportStatus = 'Pending' | 'In Progress' | 'Collected' | 'Recycled';
export type OfficerStatus = 'Available' | 'On Route' | 'On-site' | 'Offline';
export type VehicleStatus = 'active' | 'idle' | 'maintenance' | 'out_of_service' | 'on_route';
export type GpsStatus = 'online' | 'offline' | 'weak_signal' | 'error';

export interface WasteReport {
  id: string;
  reporterName: string;
  type: WasteType;
  description: string;
  location: string;
  status: ReportStatus;
  timestamp: string;
  points: number;
  image_url?: string;
  assigned_officer_id?: string;
  collected_at?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  provider: string;
}

export interface RecyclingTransaction {
  id: string;
  vendorId: string;
  materialType: WasteType;
  weight: number;
  payout: number;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'citizen' | 'government' | 'vendor' | 'admin';
  eco_points: number;
  eco_score: number;
  avatar_url?: string;
  lga?: string;
  total_reports: number;
}

export interface OfficerProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  zone: string;
  truck_id?: string;
  status: string;
  is_active: boolean;
}

export interface FleetVehicle {
  id: string;
  vehicle_name: string;
  plate_number: string;
  vehicle_type: string;
  status: VehicleStatus;
  fuel_level: number;
  fuel_type: string;
  capacity_kg: number;
  current_load_kg: number;
  latitude: number | null;
  longitude: number | null;
  gps_status: GpsStatus;
  last_gps_update: string | null;
  speed_kmh: number;
  mileage_km: number;
  assigned_zone: string;
  assigned_driver_id: string | null;
  year_manufactured: number | null;
}

export interface FleetRoute {
  id: string;
  route_name: string;
  route_code: string;
  zone: string;
  start_point: string;
  end_point: string;
  distance_km: number;
  estimated_duration_minutes: number;
  waypoints: Array<{lat: number; lng: number; name: string}>;
  schedule_type: string;
  scheduled_time: string;
  status: string;
}

export interface FleetAssignment {
  id: string;
  officer_id: string;
  vehicle_id: string;
  route_id: string | null;
  status: string;
  scheduled_date: string;
  start_time: string | null;
  collections_completed: number;
  total_weight_collected_kg: number;
  officers?: { full_name: string };
  fleet_vehicles?: { vehicle_name: string; plate_number: string };
  fleet_routes?: { route_name: string };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

export interface RecyclingPartner {
  id: string;
  name: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  current_value: number;
  reward_points: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface LeaderboardEntry {
  id: string;
  profile_id: string;
  period: string;
  rank: number;
  total_points: number;
  total_reports: number;
  total_weight_kg: number;
  profiles?: { full_name: string; email: string };
}

export interface EnvironmentalTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon?: string;
  is_active: boolean;
}

interface EcoKogiStore {
  // Auth
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  
  // Data
  reports: WasteReport[];
  transactions: RecyclingTransaction[];
  userPoints: number;
  notifications: Notification[];
  officers: OfficerProfile[];
  recyclingPartners: RecyclingPartner[];
  fleetVehicles: FleetVehicle[];
  fleetRoutes: FleetRoute[];
  fleetAssignments: FleetAssignment[];
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  environmentalTips: EnvironmentalTip[];
  
  // Actions
  addReport: (report: Omit<WasteReport, 'id' | 'status' | 'timestamp' | 'points' | 'reporterName'> & {image_url: string | null}) => Promise<void>;
  updateReportStatus: (id: string, status: ReportStatus) => Promise<void>;
  addTransaction: (transaction: Omit<RecyclingTransaction, 'id' | 'timestamp'>) => Promise<void>;
  redeemPoints: (amount: number) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  assignOfficerToReport: (reportId: string, officerId: string) => Promise<void>;
}

const EcoKogiContext = createContext<EcoKogiStore | null>(null);

export const EcoKogiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [transactions, setTransactions] = useState<RecyclingTransaction[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [officers, setOfficers] = useState<OfficerProfile[]>([]);
  const [recyclingPartners, setRecyclingPartners] = useState<RecyclingPartner[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [fleetRoutes, setFleetRoutes] = useState<FleetRoute[]>([]);
  const [fleetAssignments, setFleetAssignments] = useState<FleetAssignment[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [environmentalTips, setEnvironmentalTips] = useState<EnvironmentalTip[]>([]);

  const handleSupabaseError = (error: any, message: string) => {
    console.error(message, error);
    toast.error(message, { description: error.message });
  }

  const fetchProfile = useCallback(async (userId: string, email?: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) {
        console.warn('Profile fetch query error, using fallback citizen role.', error);
        // Fallback profile so auth flow is not blocked
        setProfile({
          id: userId,
          email: email || '',
          full_name: fullName || 'EcoKogi User',
          role: 'citizen',
          eco_points: 0,
          eco_score: 0,
          total_reports: 0,
        });
        setUserPoints(0);
        return;
      }
      if (data) {
        setProfile(data);
        setUserPoints(data.eco_points || 0);
      } else {
        // No profile row found yet (e.g., trigger hasn't completed) — assign fallback
        setProfile({
          id: userId,
          email: email || '',
          full_name: fullName || 'EcoKogi User',
          role: 'citizen',
          eco_points: 0,
          eco_score: 0,
          total_reports: 0,
        });
        setUserPoints(0);
      }
    } catch (error) {
      console.warn('Profile fetch failed (unexpected error), using fallback citizen role.', error);
      // Fallback profile so auth flow is not blocked
      setProfile({
        id: userId,
        email: email || '',
        full_name: fullName || 'EcoKogi User',
        role: 'citizen',
        eco_points: 0,
        eco_score: 0,
        total_reports: 0,
      });
      setUserPoints(0);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [reportsRes, transactionsRes, notificationsRes, officersRes, partnersRes, fleetVehiclesRes, fleetRoutesRes, fleetAssignmentsRes, challengesRes, leaderboardRes, tipsRes] = await Promise.all([
        supabase.from('waste_reports').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(50),
        supabase.from('recycling_transactions').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('officers').select('*').eq('is_active', true),
        supabase.from('recycling_partners').select('*'),
        supabase.from('fleet_vehicles').select('*').order('vehicle_name'),
        supabase.from('fleet_routes').select('*').order('route_name'),
        supabase.from('fleet_assignments').select('*, officers(full_name), fleet_vehicles(vehicle_name, plate_number), fleet_routes(route_name)').eq('scheduled_date', new Date().toISOString().split('T')[0]),
        supabase.from('challenges').select('*').eq('is_active', true).order('start_date', { ascending: false }),
        supabase.from('leaderboard').select('*, profiles(full_name, email)').eq('period', 'monthly').order('rank').limit(10),
        supabase.from('environmental_tips').select('*').eq('is_active', true).order('display_order'),
      ]);

      if (reportsRes.error) throw reportsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;
      if (notificationsRes.error) throw notificationsRes.error;
      if (officersRes.error) console.warn('Officers fetch error:', officersRes.error);
      if (partnersRes.error) throw partnersRes.error;

      setReports(reportsRes.data.map((r: any) => ({ ...r, reporterName: r.profiles.full_name, timestamp: r.created_at, type: r.waste_type, points: r.points_earned, image_url: r.image_url })) || []);
      setTransactions(transactionsRes.data.map((t: any) => ({ ...t, materialType: t.material_type, weight: t.weight_kg, payout: t.total_payout, timestamp: t.created_at, vendorId: t.partner_id })) || []);
      setNotifications(notificationsRes.data || []);
      setOfficers(officersRes.data || []);
      setRecyclingPartners((partnersRes.data || []).map((p: any) => ({ ...p, name: p.business_name })));
      setFleetVehicles(fleetVehiclesRes.data || []);
      setFleetRoutes((fleetRoutesRes.data || []).map((r: any) => ({
        ...r,
        waypoints: typeof r.waypoints === 'string' ? JSON.parse(r.waypoints) : (r.waypoints || [])
      })));
      setFleetAssignments(fleetAssignmentsRes.data || []);
      setChallenges(challengesRes.data || []);
      setLeaderboard(leaderboardRes.data || []);
      setEnvironmentalTips(tipsRes.data || []);

    } catch (error) {
      handleSupabaseError(error, 'Failed to fetch initial data.');
    }
  }, [user]);

  // Restore session on mount (handles page refresh)
  useEffect(() => {
    if (!supabase?.auth) {
      setLoading(false);
      setInitialized(true);
      return;
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name);
      }
      setLoading(false);
      setInitialized(true);
    });
  }, [fetchProfile]);

  // Listen for auth state changes (login, logout, token refresh)
  useEffect(() => {
    if (!supabase?.auth) return;
    const sub = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email, session.user.user_metadata?.full_name);
      } else {
        setProfile(null);
        setUserPoints(0);
      }
    });
    return () => sub.data.subscription.unsubscribe();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      fetchData();

      const changes = supabase.channel('ecokogi-realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          console.log('Change received!', payload);
          toast.info('Data updated in real-time!');
          fetchData();
          fetchProfile(user.id);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(changes);
      };
    }
  }, [user, fetchData, fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role: role } } });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      handleSupabaseError(error, 'Sign up failed.');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      handleSupabaseError(error, 'Sign in failed.');
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear all state completely
    setSession(null);
    setUser(null);
    setProfile(null);
    setUserPoints(0);
    setReports([]);
    setTransactions([]);
    setNotifications([]);
    setOfficers([]);
    setRecyclingPartners([]);
    setFleetVehicles([]);
    setFleetRoutes([]);
    setFleetAssignments([]);
    setChallenges([]);
    setLeaderboard([]);
    setEnvironmentalTips([]);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user.email, user.user_metadata?.full_name);
  };

  const addReport = async (data: Omit<WasteReport, 'id' | 'status' | 'timestamp' | 'points' | 'reporterName'> & { image_url: string | null }) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const { error } = await supabase.from('waste_reports').insert({
        reporter_id: user.id,
        waste_type: data.type,
        description: data.description,
        location: data.location,
        image_url: data.image_url,
        status: 'Pending',
        points_earned: 50,
      });
      if (error) throw error;
      // Persist EcoPoints and EcoScore in the profiles table
      const newPoints = (profile?.eco_points || 0) + 50;
      const newTotalReports = (profile?.total_reports || 0) + 1;
      const newScore = Math.min(100, (profile?.eco_score || 0) + 3);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ eco_points: newPoints, eco_score: newScore, total_reports: newTotalReports })
        .eq('id', user.id);
      if (profileError) throw profileError;
      setProfile(prev => prev ? { ...prev, eco_points: newPoints, eco_score: newScore, total_reports: newTotalReports } : prev);
      setUserPoints(newPoints);
      // Re-fetch reports and profile to reflect the new data immediately
      await fetchData();
      await fetchProfile(user.id);
    } catch (error) {
      handleSupabaseError(error, 'Could not submit report.');
      throw error;
    }
  };

  const updateReportStatus = async (id: string, status: ReportStatus) => {
    try {
      const { error } = await supabase.from('waste_reports').update({ status }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'Could not update report status.');
    }
  };

  const addTransaction = async (data: Omit<RecyclingTransaction, 'id' | 'timestamp'>) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const { error } = await supabase.from('recycling_transactions').insert({
        partner_id: data.vendorId,
        material_type: data.materialType,
        weight_kg: data.weight,
        total_payout: data.payout,
      });
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'Could not add transaction.');
      throw error;
    }
  };

  const redeemPoints = async (amount: number): Promise<boolean> => {
    if (!user || !profile) return false;
    if (profile.eco_points < amount) {
      toast.error('Insufficient points');
      return false;
    }
    try {
      const { error } = await supabase.from('profiles').update({ eco_points: profile.eco_points - amount }).eq('id', user.id);
      if (error) throw error;
      setProfile({ ...profile, eco_points: profile.eco_points - amount });
      setUserPoints(profile.eco_points - amount);
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Could not redeem points.');
      return false;
    }
  };

  const assignOfficerToReport = async (reportId: string, officerId: string) => {
    try {
      const { error } = await supabase.from('waste_reports').update({ assigned_officer_id: officerId, status: 'In Progress' }).eq('id', reportId);
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'Could not assign officer.');
    }
  };

  return (
    <EcoKogiContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        initialized,
        signUp,
        signIn,
        signOut,
        reports,
        transactions,
        userPoints,
        notifications,
        officers,
        recyclingPartners,
        fleetVehicles,
        fleetRoutes,
        fleetAssignments,
        challenges,
        leaderboard,
        environmentalTips,
        addReport,
        updateReportStatus,
        addTransaction,
        redeemPoints,
        refreshProfile,
        assignOfficerToReport,
      }}
    >
      {children}
    </EcoKogiContext.Provider>
  );
};

export const useEcoKogiStore = () => {
  const context = useContext(EcoKogiContext);
  if (!context) {
    throw new Error('useEcoKogiStore must be used within an EcoKogiProvider');
  }
  return context;
};