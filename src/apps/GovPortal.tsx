import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEcoKogiStore, ReportStatus, WasteReport, FleetVehicle, FleetRoute, FleetAssignment, OfficerProfile } from '../store/eco-store';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Bot, Database, MapPin, Truck, TriangleAlert, CircleCheck, ChartBar, ChartBarStacked, LayoutDashboard, Settings, LogOut, Bell, Navigation, Wifi, WifiOff, Clock, Wrench, Gauge, Users, Route, Calendar, TrendingUp, Award, Leaf, ChartPie, ExternalLink, Presentation, Recycle, Activity, Globe, Maximize, Minimize, FileText, LoaderCircle, RefreshCw, Sun, CloudSun, Shield, Timer, Send, Map, Megaphone, ArrowUpRight, Trash2, Flame, Package, Sparkles, Filter, CircleGauge, ArrowLeft, Search, Plus, Pencil, UserCheck, UserX, ChevronRight, HardDrive, Download, Fuel, Signal } from 'lucide-react';
import { UserAccountsAdmin } from './UserAccountsAdmin';
import { SmartMap } from '../pages/SmartMap';
import { AIAssistant } from '../pages/AIAssistant';
import { SystemConfigAdmin } from './SystemConfigAdmin';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, ComposedChart, Line, RadialBarChart, RadialBar } from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';

export const GovPortal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Live Power BI Embed URL — set VITE_POWERBI_EMBED_URL in your .env file
  const POWERBI_EMBED_URL: string | null = import.meta.env.VITE_POWERBI_EMBED_URL || null;

  const [activeView, setActiveView] = useState<'ai-assistant' | 'dashboard' | 'smart-map' | 'fleet' | 'reports' | 'analytics' | 'power-bi-reports' | 'officers' | 'settings'>('dashboard');
  const [currentSettingsView, setCurrentSettingsView] = useState<'grid' | 'officer_management' | 'fleet_management' | 'recycler_companies' | 'user_accounts' | 'system_config' | 'notification_settings' | 'powerbi_config' | 'backup_restore'>('grid');
  const [isPowerBiLoading, setIsPowerBiLoading] = useState(true);
  const [powerBiError, setPowerBiError] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }));
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setIsPowerBiLoading(true);
    setPowerBiError(false);
    toast.success('Refreshing Power BI dashboard...');
  };

  // Timeout to detect iframe load failures (10s fallback for unreliable onError)
  useEffect(() => {
    if (!POWERBI_EMBED_URL) return;
    loadedRef.current = false;
    setIsPowerBiLoading(true);
    setPowerBiError(false);
    const timer = setTimeout(() => {
      if (!loadedRef.current) {
        setIsPowerBiLoading(false);
        setPowerBiError(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [POWERBI_EMBED_URL]);

  const { reports, updateReportStatus, profile, signOut, officers, assignOfficerToReport, notifications, fleetVehicles, fleetRoutes, fleetAssignments, leaderboard } = useEcoKogiStore();
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null);

  const stats = [
    { label: 'Active Reports', value: reports.filter(r => r.status === 'Pending').length, icon: TriangleAlert, color: 'text-orange-500' },
    { label: 'Collections Today', value: reports.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length, icon: Truck, color: 'text-blue-500' },
    { label: 'Recycled (kg)', value: '1,240', icon: CircleCheck, color: 'text-emerald-500' },
    { label: 'Eco-Rating', value: '4.8', icon: ChartBar, color: 'text-purple-500' },
  ];

  const chartData = [
    { name: 'Mon', reports: 40 },
    { name: 'Tue', reports: 30 },
    { name: 'Wed', reports: 65 },
    { name: 'Thu', reports: 45 },
    { name: 'Fri', reports: 90 },
    { name: 'Sat', reports: 70 },
    { name: 'Sun', reports: 50 },
  ];

  // Waste type breakdown for analytics
  const wasteTypeData = [
    { name: 'Plastic', value: reports.filter(r => r.type === 'Plastic').length, color: '#3b82f6' },
    { name: 'Metal', value: reports.filter(r => r.type === 'Metal').length, color: '#6b7280' },
    { name: 'Paper', value: reports.filter(r => r.type === 'Paper').length, color: '#f59e0b' },
    { name: 'Organic', value: reports.filter(r => r.type === 'Organic').length, color: '#10b981' },
    { name: 'Electronic', value: reports.filter(r => r.type === 'Electronic').length, color: '#8b5cf6' },
    { name: 'General', value: reports.filter(r => r.type === 'General').length, color: '#64748b' },
  ].filter(item => item.value > 0);

  // LGA performance data
  const lgaData = [
    { lga: 'Lokoja', reports: 45, collections: 38, efficiency: 84 },
    { lga: 'Okene', reports: 32, collections: 28, efficiency: 88 },
    { lga: 'Kabba', reports: 28, collections: 22, efficiency: 79 },
    { lga: 'Ankpa', reports: 18, collections: 15, efficiency: 83 },
    { lga: 'Idah', reports: 24, collections: 20, efficiency: 83 },
  ];

  // ── Analytics Filter State ──
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');
  const [selectedLga, setSelectedLga] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterKey, setFilterKey] = useState(0); // for motion key on filter change

  const lgas = ['Lokoja', 'Okene', 'Kabba', 'Ankpa', 'Idah'];
  const categories = ['Household', 'Commercial', 'Industrial', 'Medical', 'E-Waste'];

  // ── Analytics Data Generators (dynamic based on filters) ──
  const generateTrendData = (days: number, base: number, variance: number) =>
    Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(0, base + Math.floor(Math.random() * variance * 2 - variance)),
        target: base,
      };
    });

  const trendData = generateTrendData(dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365, 42, 18);

  const collectionRateData = [
    { name: 'Collected', value: 72, fill: '#10b981' },
    { name: 'Pending', value: 18, fill: '#f59e0b' },
    { name: 'Missed', value: 10, fill: '#ef4444' },
  ];

  const lgaEfficiencyData = lgas.map((lga) => {
    const base = 75 + Math.floor(Math.random() * 20);
    return { lga, efficiency: Math.min(base, 98), target: 90 };
  });

  const weeklyComparison = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      thisWeek: Math.max(10, 35 + Math.floor(Math.random() * 30)),
      lastWeek: Math.max(10, 30 + Math.floor(Math.random() * 25)),
    };
  });

  const categoryBreakdown = categories.map((cat) => ({
    category: cat,
    tons: Math.floor(Math.random() * 80 + 20),
    recycled: Math.floor(Math.random() * 30 + 5),
  }));

  const routePerformance = [
    { route: 'Lokoja Central', completed: 95, onTime: 88, efficiency: 92 },
    { route: 'Okene East', completed: 82, onTime: 75, efficiency: 78 },
    { route: 'Kabba West', completed: 78, onTime: 70, efficiency: 73 },
    { route: 'Ankpa North', completed: 90, onTime: 85, efficiency: 87 },
    { route: 'Idah South', completed: 85, onTime: 80, efficiency: 82 },
  ];

  const officerWorkload = [
    { name: 'Officer A', assigned: 12, resolved: 10, pending: 2 },
    { name: 'Officer B', assigned: 8, resolved: 5, pending: 3 },
    { name: 'Officer C', assigned: 15, resolved: 14, pending: 1 },
    { name: 'Officer D', assigned: 6, resolved: 4, pending: 2 },
    { name: 'Officer E', assigned: 10, resolved: 8, pending: 2 },
  ];

  const insightBullets = [
    { icon: 'trending', text: `Collection efficiency trending ${Math.random() > 0.5 ? 'up' : 'stable'} at ${72 + Math.floor(Math.random() * 10)}% this ${dateRange}-day period.` },
    { icon: 'alert', text: `${selectedLga === 'all' ? 'Lokoja LGA' : selectedLga} has ${Math.floor(Math.random() * 5 + 1)} high-priority unassigned reports.` },
    { icon: 'leaf', text: `Recycling rate improved to ${15 + Math.floor(Math.random() * 10)}% — ${Math.random() > 0.5 ? 'above' : 'meeting'} national target.` },
  ];

  const handleFilterChange = () => {
    setFilterKey((k) => k + 1);
    toast.success('Analytics filters updated');
  };

  const handleAssignOfficer = async () => {
    if (!selectedReport || !selectedOfficer) {
      toast.error('Please select a report and an officer.');
      return;
    }
    try {
      await assignOfficerToReport(selectedReport.id, selectedOfficer);
      toast.success(`Officer assigned to report ${selectedReport.id.slice(0, 6)}`);
      setSelectedReport(null);
      setSelectedOfficer(null);
    } catch (error: any) {
      toast.error('Assignment failed', { description: error.message });
    }
  };
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-black text-emerald-400">EcoKogi Gov</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Confluence Portal</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavButton icon={Bot} label="AI Assistant" activeView={activeView} targetView="ai-assistant" setView={setActiveView} />
          <NavButton icon={LayoutDashboard} label="Dashboard" activeView={activeView} targetView="dashboard" setView={setActiveView} />
          <NavButton icon={Map} label="Smart Map" activeView={activeView} targetView="smart-map" setView={setActiveView} />
          <NavButton icon={TriangleAlert} label="Incident Reports" activeView={activeView} targetView="reports" setView={setActiveView} />
          <NavButton icon={Truck} label="Fleet Management" activeView={activeView} targetView="fleet" setView={setActiveView} />
          <NavButton icon={TrendingUp} label="Analytics" activeView={activeView} targetView="analytics" setView={setActiveView} />
          <NavButton icon={ChartBarStacked} label="Power BI Reports" activeView={activeView} targetView="power-bi-reports" setView={setActiveView} />
          <NavButton icon={Users} label="Officers" activeView={activeView} targetView="officers" setView={setActiveView} />
          <NavButton icon={Settings} label="Settings" activeView={activeView} targetView="settings" setView={setActiveView} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 px-3">
            {profile?.full_name || 'Admin'} · {profile?.role || 'gov'}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {activeView === 'dashboard' && 'Operations Overview'}
            {activeView === 'smart-map' && 'Smart Map & GIS Dashboard'}
            {activeView === 'reports' && 'Waste Incident Management'}
            {activeView === 'fleet' && 'Collection Fleet Status'}
            {activeView === 'analytics' && 'Analytics & Performance'}
            {activeView === 'power-bi-reports' && 'Power BI Reports'}
            {activeView === 'ai-assistant' && 'AI Assistant'}
            {activeView === 'officers' && 'Officer Management'}
          </h2>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-2 px-3"
              onClick={async () => { await signOut(); onBack(); }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Exit Portal</span>
            </Button>
            <Bell className="text-slate-500" />
            <span className="text-sm font-medium text-slate-500">{profile?.full_name || 'Admin'}</span>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">{(profile?.full_name || 'A')[0]}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === 'smart-map' && <SmartMap />}

          {activeView === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Panel */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 md:p-8">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(16,185,129,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(52,211,153,0.3) 0%, transparent 50%)'}} />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                      Welcome back, {profile?.full_name || 'Admin'}
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                        <Shield className="w-3 h-3" />
                        EcoKogi Admin
                      </span>
                    </h1>
                    <p className="text-emerald-200/70 mt-1.5 flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      <span className="w-1 h-1 rounded-full bg-emerald-400/50" />
                      <Sun className="w-4 h-4" />
                      System Status: <span className="text-emerald-300 font-medium">All Systems Operational</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                      <CloudSun className="w-5 h-5 text-yellow-300" />
                      <span className="text-white text-sm font-medium">32°C</span>
                      <span className="text-emerald-200/60 text-xs">Lokoja</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-white text-sm font-medium">Live</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pending Incidents */}
                <KpiCard
                  icon={TriangleAlert}
                  label="Pending Incidents"
                  value={reports.filter(r => r.status === 'Pending').length}
                  color="text-orange-500"
                  bgColor="bg-orange-50"
                  pulse={true}
                  detail={`${reports.filter(r => r.status === 'In Progress').length} in progress`}
                />
                {/* Active Fleet */}
                <KpiCard
                  icon={Truck}
                  label="Active Fleet"
                  value={fleetVehicles.filter(v => v.status === 'on_route' || v.status === 'active').length}
                  color="text-blue-500"
                  bgColor="bg-blue-50"
                  total={fleetVehicles.length}
                  detail={`${fleetVehicles.filter(v => v.status === 'maintenance').length} in maintenance`}
                />
                {/* Active Officers */}
                <KpiCard
                  icon={Users}
                  label="Active Officers"
                  value={officers.filter(o => o.status === 'On Route' || o.status === 'Available').length}
                  color="text-emerald-500"
                  bgColor="bg-emerald-50"
                  total={officers.length}
                  detail={`${officers.filter(o => o.status === 'Available').length} available now`}
                />
                {/* Citizen Reports */}
                <KpiCard
                  icon={CircleCheck}
                  label="Citizen Reports"
                  value={reports.length}
                  color="text-purple-500"
                  bgColor="bg-purple-50"
                  detail={`${reports.filter(r => r.status === 'Collected').length} resolved`}
                  resolved={reports.filter(r => r.status === 'Collected').length}
                  total={reports.length}
                />
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Collection Summary + Activity Timeline */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Today's Collection Summary */}
                  <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        Today's Collection Summary
                      </CardTitle>
                      <CardDescription>Real-time waste collection metrics for today</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <CollectionMetric label="Organic" value="1,280" unit="kg" percentage={72} color="bg-emerald-500" icon={Leaf} />
                        <CollectionMetric label="Recyclable" value="840" unit="kg" percentage={58} color="bg-blue-500" icon={Recycle} />
                        <CollectionMetric label="Hazardous" value="320" unit="kg" percentage={34} color="bg-red-500" icon={Flame} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" />
                          Total collected: 2,440 kg
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Timer className="w-3.5 h-3.5" />
                          Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity Timeline */}
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Live system-wide events today</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-0">
                        {[
                          { icon: Truck, color: 'bg-blue-500', text: 'Officer John dispatched to Area 4 for waste collection', time: '2 min ago', badge: 'Dispatch' },
                          { icon: TriangleAlert, color: 'bg-orange-500', text: 'New Incident #4082 reported at Lokoja Market', time: '15 min ago', badge: 'Incident' },
                          { icon: CircleCheck, color: 'bg-emerald-500', text: 'Vendor EcoCycle completed collection route #12', time: '32 min ago', badge: 'Completed' },
                          { icon: Users, color: 'bg-purple-500', text: 'Officer Sarah checked in from Zone 3', time: '47 min ago', badge: 'Check-in' },
                          { icon: Trash2, color: 'bg-slate-500', text: 'Overflow alert resolved at Kabba Junction', time: '1 hr ago', badge: 'Resolved' },
                          { icon: Shield, color: 'bg-emerald-500', text: 'System health check passed — all services nominal', time: '2 hr ago', badge: 'System' },
                        ].map((event, i) => (
                          <div key={i} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full ${event.color} flex items-center justify-center shadow-sm`}>
                                <event.icon className="w-4 h-4 text-white" />
                              </div>
                              {i < 5 && <div className="w-px flex-1 bg-slate-200 group-last:hidden" />}
                            </div>
                            <div className="pb-6 flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-slate-800">{event.text}</p>
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">{event.badge}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right column: Quick Actions + Detail Metrics */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Send className="w-5 h-5 text-emerald-600" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>Common operational tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <QuickActionButton icon={Users} label="Dispatch Officer" color="bg-blue-500 hover:bg-blue-600" onClick={() => setActiveView('officers')} />
                        <QuickActionButton icon={TriangleAlert} label="Report Incident" color="bg-orange-500 hover:bg-orange-600" onClick={() => setActiveView('reports')} />
                        <QuickActionButton icon={Map} label="View Fleet Map" color="bg-emerald-500 hover:bg-emerald-600" onClick={() => setActiveView('fleet')} />
                        <QuickActionButton icon={Megaphone} label="Broadcast Alert" color="bg-purple-500 hover:bg-purple-600" onClick={() => toast.success('Broadcast feature coming soon')} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detail Metrics Card */}
                  <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-slate-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Performance Snapshot
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 flex items-center gap-2">
                          <CircleCheck className="w-4 h-4 text-emerald-500" />
                          Resolution Rate
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {reports.length > 0 ? Math.round((reports.filter(r => r.status === 'Collected').length / reports.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-500" />
                          Fleet Utilization
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {fleetVehicles.length > 0 ? Math.round((fleetVehicles.filter(v => v.status === 'on_route' || v.status === 'active').length / fleetVehicles.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          Officer Readiness
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          {officers.length > 0 ? Math.round((officers.filter(o => o.status === 'Available').length / officers.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Environmental Score</span>
                          <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                            <Leaf className="w-3.5 h-3.5" />
                            A+
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Citizens Mini */}
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        Top Citizens
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {leaderboard.slice(0, 3).map((entry, index) => (
                        <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-slate-200 text-slate-600' :
                            'bg-orange-100 text-orange-700'
                          }`}>#{entry.rank}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{entry.profiles?.full_name || 'Citizen'}</p>
                            <p className="text-xs text-slate-400">{entry.total_points} pts</p>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      ))}
                      {leaderboard.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">No citizens ranked yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeView === 'reports' && (
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b-2 border-slate-100">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-4">Report ID</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-4">Citizen Name</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-4">Waste Category</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-4">Location</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-4">Date Reported</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-4">Priority</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 py-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report, idx) => {
                      const hoursSinceReport = Math.abs(new Date().getTime() - new Date(report.timestamp).getTime()) / 36e5;
                      const priority = report.status === 'Pending' && hoursSinceReport < 24 ? 'High' :
                        report.status === 'Pending' && hoursSinceReport < 72 ? 'Medium' :
                        report.status === 'In Progress' ? 'Medium' :
                        report.status === 'Collected' ? 'Low' : 'Low';
                      const priorityColor = priority === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                        priority === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-emerald-100 text-emerald-700 border-emerald-200';
                      const statusColor = report.status === 'Collected' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        report.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-orange-100 text-orange-700 border-orange-200';
                      return (
                        <TableRow key={report.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100/70 transition-colors border-b border-slate-100`}>
                          <TableCell className="font-mono text-xs font-semibold text-slate-700 py-4">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              #{report.id.slice(0, 6).toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-sm text-slate-800 py-4">{report.reporterName}</TableCell>
                          <TableCell className="py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                              {report.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 py-4 max-w-[180px] truncate" title={report.location}>{report.location}</TableCell>
                          <TableCell className="text-sm text-slate-600 py-4 whitespace-nowrap">
                            {new Date(report.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${priorityColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                priority === 'High' ? 'bg-red-500' :
                                priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              {priority}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusColor}`}>
                              {report.status === 'Collected' ? '✓' :
                               report.status === 'In Progress' ? '⟳' : '○'}
                              <span>{report.status}</span>
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {reports.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">📋</span>
                            <p className="text-sm font-medium">No incident reports recorded yet.</p>
                            <p className="text-xs text-slate-400">New reports from citizens will appear here.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {reports.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {reports.length} total report{reports.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-400" /> {reports.filter(r => r.status === 'Pending').length} pending
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400" /> {reports.filter(r => r.status === 'In Progress').length} in progress
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> {reports.filter(r => r.status === 'Collected').length} collected
                    </span>
                  </span>
                </div>
              )}
            </Card>
          )}

          {activeView === 'fleet' && (
            <div className="space-y-6">
              {/* Fleet Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Total Vehicles</p>
                      <p className="text-2xl font-bold text-slate-900">{fleetVehicles.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                      <Navigation className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">On Route</p>
                      <p className="text-2xl font-bold text-slate-900">{fleetVehicles.filter(v => v.status === 'on_route').length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Maintenance</p>
                      <p className="text-2xl font-bold text-slate-900">{fleetVehicles.filter(v => v.status === 'maintenance').length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                      <Fuel className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Low Fuel</p>
                      <p className="text-2xl font-bold text-slate-900">{fleetVehicles.filter(v => v.fuel_level < 40).length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Route Map & Vehicle List */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map View */}
                <Card className="lg:col-span-2 p-6 border-none shadow-sm">
                  <CardTitle className="mb-4 text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Fleet GPS Tracking
                  </CardTitle>
                  <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl relative overflow-hidden">
                    {/* Map background with grid */}
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
                    
                    {/* Vehicle markers */}
                    {fleetVehicles.filter(v => v.latitude && v.longitude).map((vehicle) => {
                      const minLat = 7.75, maxLat = 7.83;
                      const minLng = 6.68, maxLng = 6.77;
                      const x = ((vehicle.longitude! - minLng) / (maxLng - minLng)) * 80 + 10;
                      const y = 90 - (((vehicle.latitude! - minLat) / (maxLat - minLat)) * 80 + 10);
                      
                      return (
                        <div
                          key={vehicle.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                          style={{ left: `${x}%`, top: `${y}%` }}
                        >
                          <div className={`relative ${vehicle.status === 'on_route' ? 'animate-pulse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
                              vehicle.status === 'on_route' ? 'bg-emerald-500' :
                              vehicle.status === 'active' ? 'bg-blue-500' :
                              vehicle.status === 'maintenance' ? 'bg-orange-500' :
                              vehicle.status === 'idle' ? 'bg-slate-400' : 'bg-red-500'
                            }`}>
                              <Truck className="w-4 h-4 text-white" />
                            </div>
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                              vehicle.gps_status === 'online' ? 'bg-emerald-400' :
                              vehicle.gps_status === 'weak_signal' ? 'bg-yellow-400' : 'bg-red-400'
                            }`} />
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                              <p className="font-bold">{vehicle.vehicle_name}</p>
                              <p className="text-slate-300">{vehicle.plate_number}</p>
                              <p className="text-slate-400">{vehicle.speed_kmh} km/h • {vehicle.fuel_level}% fuel</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Legend</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span>On Route</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span>Active</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /><span>Maintenance</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400" /><span>Idle</span></div>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                      <p className="text-xs font-semibold text-slate-700">Lokoja, Kogi State</p>
                      <p className="text-xs text-slate-500">{fleetVehicles.filter(v => v.gps_status === 'online').length} vehicles online</p>
                    </div>
                  </div>
                </Card>

                {/* Driver Assignments */}
                <Card className="p-6 border-none shadow-sm">
                  <CardTitle className="mb-4 text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Driver Assignments
                  </CardTitle>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {fleetAssignments.slice(0, 8).map((assignment) => {
                      const vehicle = fleetVehicles.find(v => v.id === assignment.vehicle_id);
                      const officer = officers.find(o => o.id === assignment.officer_id);
                      return (
                        <div key={assignment.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            assignment.status === 'in_progress' ? 'bg-emerald-100 text-emerald-600' :
                            assignment.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Truck className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{officer?.full_name || 'Unassigned'}</p>
                            <p className="text-xs text-slate-500 truncate">{vehicle?.vehicle_name || 'No vehicle'}</p>
                          </div>
                          <Badge variant={assignment.status === 'in_progress' ? 'default' : 'secondary'} className="text-xs">
                            {assignment.status === 'in_progress' ? 'Active' : assignment.status === 'scheduled' ? 'Pending' : 'Done'}
                          </Badge>
                        </div>
                      );
                    })}
                    {fleetAssignments.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">No assignments today</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Vehicle Cards Grid */}
              <Card className="p-6 border-none shadow-sm">
                <CardTitle className="mb-4 text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Fleet Vehicles
                </CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {fleetVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          vehicle.status === 'on_route' ? 'bg-emerald-100 text-emerald-600' :
                          vehicle.status === 'active' ? 'bg-blue-100 text-blue-600' :
                          vehicle.status === 'maintenance' ? 'bg-orange-100 text-orange-600' :
                          vehicle.status === 'idle' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600'
                        }`}>
                          <Truck className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          {vehicle.gps_status === 'online' ? (
                            <Wifi className="w-4 h-4 text-emerald-500" />
                          ) : vehicle.gps_status === 'weak_signal' ? (
                            <Signal className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 truncate">{vehicle.vehicle_name}</h4>
                      <p className="text-xs text-slate-500 font-mono mb-3">{vehicle.plate_number}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1"><Fuel className="w-3 h-3" />Fuel</span>
                          <span className={`font-semibold ${vehicle.fuel_level < 40 ? 'text-red-600' : 'text-slate-700'}`}>{vehicle.fuel_level}%</span>
                        </div>
                        <Progress value={vehicle.fuel_level} className={`h-1.5 ${vehicle.fuel_level < 40 ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`} />
                        
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500 flex items-center gap-1"><Gauge className="w-3 h-3" />Load</span>
                          <span className="font-semibold text-slate-700">{Math.round((vehicle.current_load_kg / vehicle.capacity_kg) * 100)}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500">Zone</span>
                          <span className="font-medium text-slate-600 truncate max-w-[100px]">{vehicle.assigned_zone}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <Badge variant={
                          vehicle.status === 'on_route' ? 'default' :
                          vehicle.status === 'active' ? 'secondary' :
                          vehicle.status === 'maintenance' ? 'destructive' : 'outline'
                        } className="text-xs w-full justify-center">
                          {vehicle.status === 'on_route' ? 'On Route' :
                           vehicle.status === 'active' ? 'Active' :
                           vehicle.status === 'maintenance' ? 'Maintenance' :
                           vehicle.status === 'idle' ? 'Idle' : 'Out of Service'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Collection Schedule */}
              <Card className="p-6 border-none shadow-sm">
                <CardTitle className="mb-4 text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Collection Routes Schedule
                </CardTitle>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fleetRoutes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-semibold">{route.route_name}</TableCell>
                        <TableCell>{route.zone}</TableCell>
                        <TableCell className="capitalize">{route.schedule_type}</TableCell>
                        <TableCell className="font-mono text-sm">{route.scheduled_time?.slice(0, 5)}</TableCell>
                        <TableCell>{route.distance_km} km</TableCell>
                        <TableCell>
                          <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                            {route.status === 'active' ? 'Active' : route.status === 'planned' ? 'Planned' : route.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {fleetRoutes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">No routes configured</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeView === 'analytics' && (
            <motion.div
              key={filterKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* ── Filter Bar ── */}
              <Card className="p-4 border border-slate-200 shadow-sm bg-white">
                <div className="flex flex-wrap items-center gap-3">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700 mr-1">Filters</span>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <Select value={dateRange} onValueChange={(v) => { setDateRange(v as any); handleFilterChange(); }}>
                      <SelectTrigger className="h-8 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="90d">90 Days</SelectItem>
                        <SelectItem value="ytd">YTD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <Select value={selectedLga} onValueChange={(v) => { setSelectedLga(v); handleFilterChange(); }}>
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue placeholder="All LGAs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All LGAs</SelectItem>
                        {lgas.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); handleFilterChange(); }}>
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setDateRange('30d'); setSelectedLga('all'); setSelectedCategory('all'); handleFilterChange(); }}>
                      <RefreshCw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                  </div>
                </div>
              </Card>

              {/* ── Executive Insights ── */}
              <Card className="p-5 border border-slate-200 shadow-sm bg-gradient-to-r from-indigo-50/80 via-slate-50 to-emerald-50/80">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">Executive Insights</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Auto-generated</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {insightBullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white/80 rounded-lg p-3 border border-slate-100">
                      {b.icon === 'trending' && <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />}
                      {b.icon === 'alert' && <TriangleAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                      {b.icon === 'leaf' && <Leaf className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />}
                      <p className="text-xs text-slate-600 leading-relaxed">{b.text}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* ── 8 Charts Grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* 1. Collection Trend (Area) */}
                <Card className="p-5 border border-slate-200 shadow-sm">
                  <CardTitle className="mb-4 text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Collection Trend
                    <span className="text-[10px] text-slate-400 font-normal ml-auto">{dateRange.toUpperCase()}</span>
                  </CardTitle>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#trendGrad)" dot={false} />
                        <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 2. Collection Rate (Donut) */}
                <Card className="p-5 border border-slate-200 shadow-sm">
                  <CardTitle className="mb-4 text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <CircleGauge className="w-4 h-4 text-blue-500" />
                    Collection Rate
                  </CardTitle>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={collectionRateData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                          {collectionRateData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 3. LGA Efficiency (RadialBar) */}
                <Card className="p-5 border border-slate-200 shadow-sm">
                  <CardTitle className="mb-4 text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <Gauge className="w-4 h-4 text-amber-500" />
                    LGA Efficiency
                  </CardTitle>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={12} data={lgaEfficiencyData}>
                        <RadialBar dataKey="efficiency" cornerRadius={6} label={{ position: 'insideStart', fill: '#475569', fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 4. Weekly Comparison (Composed) */}
                <Card className="p-5 border border-slate-200 shadow-sm">
                  <CardTitle className="mb-4 text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <ChartBar className="w-4 h-4 text-purple-500" />
                    Weekly Comparison
                  </CardTitle>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={weeklyComparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Legend iconType="line" />
                        <Bar dataKey="lastWeek" fill="#e2e8f0" name="Last Week" radius={[4, 4, 0, 0]} barSize={16} />
                        <Bar dataKey="thisWeek" fill="#8b5cf6" name="This Week" radius={[4, 4, 0, 0]} barSize={16} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 5. Category Breakdown (Stacked Bar) */}
                <Card className="p-5 border border-slate-200 shadow-sm">
                  <CardTitle className="mb-4 text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <Package className="w-4 h-4 text-cyan-500" />
                    Category Breakdown
                  </CardTitle>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Legend iconType="square" />
                        <Bar dataKey="tons" fill="#06b6d4" name="Total Tons" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="recycled" fill="#10b981" name="Recycled" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 6. Route Performance (Horizontal Bar) */}
                <Card className="p-5 border border-slate-200 shadow-sm">
                  <CardTitle className="mb-4 text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <Route className="w-4 h-4 text-rose-500" />
                    Route Performance
                  </CardTitle>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={routePerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <YAxis dataKey="route" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={90} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Legend iconType="square" />
                        <Bar dataKey="completed" fill="#f43f5e" name="Completed %" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="onTime" fill="#f97316" name="On-Time %" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 7. Officer Workload (Grouped Bar) */}
                <Card className="p-5 border border-slate-200 shadow-sm">
                  <CardTitle className="mb-4 text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <Users className="w-4 h-4 text-sky-500" />
                    Officer Workload
                  </CardTitle>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={officerWorkload}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Legend iconType="square" />
                        <Bar dataKey="assigned" fill="#0ea5e9" name="Assigned" radius={[4, 4, 0, 0]} barSize={10} />
                        <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} barSize={10} />
                        <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} barSize={10} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 8. Waste Type Distribution (Pie) */}
                <Card className="p-5 border border-slate-200 shadow-sm">
                  <CardTitle className="mb-4 text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <ChartPie className="w-4 h-4 text-indigo-500" />
                    Waste Type Distribution
                  </CardTitle>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={wasteTypeData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {wasteTypeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

              </div>
            </motion.div>
          )}

          {activeView === 'power-bi-reports' && (
            <div className="space-y-6">
              {/* Header section */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500">
                    Home / <span className="text-slate-700 font-medium">Power BI Reports</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                    Live operational intelligence, KPIs, trends, and executive reports powered by Microsoft Power BI.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {lastUpdated && (
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Last updated: {lastUpdated}
                    </span>
                  )}
                  {POWERBI_EMBED_URL ? (
                    <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shrink-0">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 inline-block" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 shrink-0">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 inline-block" />
                      Standby
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar - Above Container */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleRefresh}
                    disabled={isPowerBiLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isPowerBiLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      if (!embedContainerRef.current) return;
                      if (!document.fullscreenElement) {
                        embedContainerRef.current.requestFullscreen?.().catch(() => {
                          toast.error('Full screen mode is not supported by your browser.');
                        });
                        setIsFullScreen(true);
                      } else {
                        document.exitFullscreen?.();
                        setIsFullScreen(false);
                      }
                    }}
                  >
                    {isFullScreen ? (
                      <><Minimize className="w-4 h-4" /> Exit Full Screen</>
                    ) : (
                      <><Maximize className="w-4 h-4" /> Full Screen</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={!POWERBI_EMBED_URL || isPowerBiLoading || powerBiError}
                    onClick={() => {
                      toast.success('Preparing PDF export...', {
                        description: 'Opening print-friendly view. Use "Save as PDF" in the print dialog.',
                      });
                      setTimeout(() => window.print(), 500);
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!POWERBI_EMBED_URL}
                  onClick={() => POWERBI_EMBED_URL && window.open(POWERBI_EMBED_URL, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Live Dashboard
                </Button>
              </div>

              {/* Embed Container */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0 relative" ref={embedContainerRef}>
                  {POWERBI_EMBED_URL ? (
                    <>
                      {/* Loading overlay */}
                      {isPowerBiLoading && !powerBiError && (
                        <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <LoaderCircle className="w-8 h-8 text-emerald-500 animate-spin" />
                            <p className="text-sm font-medium text-slate-600">Loading Power BI dashboard...</p>
                          </div>
                        </div>
                      )}

                      {/* Error overlay */}
                      {powerBiError && (
                        <div className="absolute inset-0 z-20 bg-red-50/90 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center max-w-md mx-auto p-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
                              <TriangleAlert className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Unable to Load Dashboard</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              Unable to load Power BI Dashboard. Please try again later or contact the administrator.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={handleRefresh}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Retry
                            </Button>
                          </div>
                        </div>
                      )}

                      <iframe
                        key={refreshKey}
                        src={POWERBI_EMBED_URL}
                        className="w-full h-[800px]"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        title="Power BI Report"
                        onLoad={() => {
                          loadedRef.current = true;
                          setIsPowerBiLoading(false);
                          setPowerBiError(false);
                        }}
                        onError={() => {
                          setIsPowerBiLoading(false);
                          setPowerBiError(true);
                        }}
                      />
                    </>
                  ) : (
                    <div className="relative min-h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                      {/* Abstract grid pattern background */}
                      <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />

                      {/* Decorative chart outlines */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <svg className="w-96 h-96" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="40" y="180" width="30" height="90" rx="4" className="fill-slate-600" />
                          <rect x="85" y="130" width="30" height="140" rx="4" className="fill-slate-600" />
                          <rect x="130" y="100" width="30" height="170" rx="4" className="fill-slate-600" />
                          <rect x="175" y="60" width="30" height="210" rx="4" className="fill-slate-600" />
                          <rect x="220" y="120" width="30" height="150" rx="4" className="fill-slate-600" />
                          <rect x="265" y="150" width="30" height="120" rx="4" className="fill-slate-600" />
                          <rect x="310" y="80" width="30" height="190" rx="4" className="fill-slate-600" />
                          <path d="M40 280 L355 280" className="stroke-slate-400" strokeWidth="2" />
                        </svg>
                      </div>

                      {/* Power BI empty state */}
                      <div className="relative z-10 text-center max-w-xl mx-auto p-10">
                        {/* Power BI logo SVG */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-xl border border-yellow-300/50 flex items-center justify-center">
                          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="11" width="4" height="10" rx="1" fill="#F2C811" />
                            <rect x="8" y="7" width="4" height="14" rx="1" fill="#F2C811" opacity="0.8" />
                            <rect x="14" y="4" width="4" height="17" rx="1" fill="#F2C811" opacity="0.6" />
                            <rect x="20" y="1" width="4" height="20" rx="1" fill="#F2C811" opacity="0.4" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                          Live Power BI Dashboard
                        </h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                          Connect a Power BI Embed URL to display live operational analytics.
                        </p>
                        <Button
                          disabled
                          className="inline-flex items-center gap-2 bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Live Dashboard
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 8-Card Analytical Details Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Executive KPIs */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Presentation className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">Executive KPIs</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Summary of key operational metrics including collection efficiency, waste diversion rates, and monthly performance indicators.
                    </p>
                  </CardContent>
                </Card>

                {/* 2. Waste Collection Trends */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">Waste Collection Trends</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Temporal view of waste generation and collection volumes across days, weeks, and months.
                    </p>
                  </CardContent>
                </Card>

                {/* 3. Waste Type Analysis */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                        <ChartPie className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">Waste Type Analysis</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Breakdown of organic, recyclable, plastic, and hazardous waste streams with volume comparisons.
                    </p>
                  </CardContent>
                </Card>

                {/* 4. Recycling Performance */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-green-50 text-green-600">
                        <Recycle className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">Recycling Performance</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Efficiency rate, vendor metrics, material recovery rate, and recycling program adoption.
                    </p>
                  </CardContent>
                </Card>

                {/* 5. LGA Performance */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">LGA Performance</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Local Government Area leaderboards, collection coverage scores, and zone-level efficiency ratings.
                    </p>
                  </CardContent>
                </Card>

                {/* 6. Hotspot Analysis */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                        <Activity className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">Hotspot Analysis</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Identification of overflow-prone locations, response times, and critical zone heat maps.
                    </p>
                  </CardContent>
                </Card>

                {/* 7. Citizen Leaderboard */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
                        <Award className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">Citizen Leaderboard</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Public engagement tracking, community scores, participation trends, and top contributor rankings.
                    </p>
                  </CardContent>
                </Card>

                {/* 8. Environmental Impact */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm">Environmental Impact</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      CO2 emission reduction, landfill diversion rate, trees saved, and sustainability scorecard.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === 'settings' && currentSettingsView === 'officer_management' && (
            <OfficerManagement
              officers={officers}
              onBack={() => setCurrentSettingsView('grid')}
            />
          )}

          {activeView === 'settings' && currentSettingsView === 'fleet_management' && (
            <AdminManagementLayout
              title="Fleet Management"
              subtitle="Monitor garbage trucks, active status, fuel levels, and maintenance schedules"
              icon={Truck}
              accentColor="emerald"
              onBack={() => setCurrentSettingsView('grid')}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-slate-500">Total Vehicles</p>
                    <p className="text-2xl font-bold text-slate-900">24</p>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <CircleCheck className="w-3.5 h-3.5" /> 18 Active
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-slate-500">On Route</p>
                    <p className="text-2xl font-bold text-slate-900">12</p>
                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                      <Clock className="w-3.5 h-3.5" /> 4 Scheduled
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-slate-500">Maintenance Due</p>
                    <p className="text-2xl font-bold text-slate-900">3</p>
                    <div className="flex items-center gap-1.5 text-xs text-red-600">
                      <Wrench className="w-3.5 h-3.5" /> 2 Overdue
                    </div>
                  </CardContent>
                </Card>
              </div>
              <p className="text-sm text-slate-500 text-center py-8">Full fleet management with real-time tracking, fuel logs, and maintenance scheduling coming soon.</p>
            </AdminManagementLayout>
          )}

          {activeView === 'settings' && currentSettingsView === 'recycler_companies' && (
            <AdminManagementLayout
              title="Recycler Companies"
              subtitle="Manage registered recycling partners, waste processing sites, and vendor contracts"
              icon={Recycle}
              accentColor="orange"
              onBack={() => setCurrentSettingsView('grid')}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-slate-500">Active Partners</p>
                    <p className="text-2xl font-bold text-slate-900">8</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-slate-500">Processing Sites</p>
                    <p className="text-2xl font-bold text-slate-900">14</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-slate-500">Monthly Tonnage</p>
                    <p className="text-2xl font-bold text-slate-900">342.5t</p>
                  </CardContent>
                </Card>
              </div>
              <p className="text-sm text-slate-500 text-center py-8">Comprehensive partner management, contract tracking, and waste audit trail coming soon.</p>
            </AdminManagementLayout>
          )}

          {activeView === 'settings' && currentSettingsView === 'user_accounts' && (
            <UserAccountsAdmin onBack={() => setCurrentSettingsView('grid')} />
          )}

          {activeView === 'settings' && currentSettingsView === 'system_config' && (
            <SystemConfigAdmin onBack={() => setCurrentSettingsView('grid')} />
          )}

          {activeView === 'settings' && currentSettingsView === 'notification_settings' && (
            <AdminManagementLayout
              title="Notification Settings"
              subtitle="Configure SMS, email, and app push notification preferences for alerts and reports"
              icon={Bell}
              accentColor="amber"
              onBack={() => setCurrentSettingsView('grid')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-slate-800">SMS Alerts</p>
                      <p className="text-sm text-slate-500">Critical system alerts via SMS</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Send className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-slate-800">Email Reports</p>
                      <p className="text-sm text-slate-500">Weekly digest & incident reports</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-slate-800">Push Notifications</p>
                      <p className="text-sm text-slate-500">App push for mobile officers</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Paused</span>
                </div>
              </div>
            </AdminManagementLayout>
          )}

          {activeView === 'settings' && currentSettingsView === 'powerbi_config' && (
            <AdminManagementLayout
              title="Power BI Configuration"
              subtitle="Embed keys, workspace configurations, and report parameters"
              icon={ChartBar}
              accentColor="cyan"
              onBack={() => setCurrentSettingsView('grid')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">Workspace ID</p>
                    <p className="text-sm text-slate-500 font-mono text-xs">a1b2c3d4-...-e5f6g7h8</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">Embed Report URL</p>
                    <p className="text-sm text-slate-500 font-mono text-xs">https://app.powerbi.com/reportEmbed</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">Last Synced</p>
                    <p className="text-sm text-slate-500">2 hours ago</p>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Sync
                  </Button>
                </div>
              </div>
            </AdminManagementLayout>
          )}

          {activeView === 'settings' && currentSettingsView === 'backup_restore' && (
            <AdminManagementLayout
              title="Backup & Restore"
              subtitle="Schedule system database backups, download export dumps, and restore checkpoints"
              icon={HardDrive}
              accentColor="red"
              onBack={() => setCurrentSettingsView('grid')}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-slate-500">Last Backup</p>
                    <p className="text-2xl font-bold text-slate-900">Today</p>
                    <p className="text-xs text-slate-400">02:30 AM</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-slate-500">Backup Size</p>
                    <p className="text-2xl font-bold text-slate-900">2.4 GB</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm text-slate-500">Retention</p>
                    <p className="text-2xl font-bold text-slate-900">30 days</p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-3">
                <Button className="bg-red-600 hover:bg-red-700 text-white"><Download className="w-4 h-4 mr-1.5" /> Download Backup</Button>
                <Button variant="outline"><RefreshCw className="w-4 h-4 mr-1.5" /> Run Now</Button>
              </div>
            </AdminManagementLayout>
          )}

          {activeView === 'settings' && currentSettingsView === 'grid' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure and manage your EcoKogi government administration portal</p>
                </div>
              </div>

              {/* 8 Management Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Officer Management */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base mb-2">Officer Management</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">Manage active officers, LGA assignments, and duty status.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold"
                      onClick={() => setCurrentSettingsView('officer_management')}
                    >
                      Manage
                    </Button>
                  </CardContent>
                </Card>

                {/* 2. Fleet Management */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Truck className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base mb-2">Fleet Management</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">Monitor garbage trucks, active status, fuel levels, and maintenance schedules.</p>
                    <Button variant="outline" size="sm" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                      onClick={() => setCurrentSettingsView('fleet_management')}>
                      Manage
                    </Button>
                  </CardContent>
                </Card>

                {/* 3. Recycler Companies */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Recycle className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base mb-2">Recycler Companies</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">Manage registered recycling partners, waste processing sites, and vendor contracts.</p>
                    <Button variant="outline" size="sm" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 text-xs font-semibold"
                      onClick={() => setCurrentSettingsView('recycler_companies')}>
                      Manage
                    </Button>
                  </CardContent>
                </Card>

                {/* 4. User Accounts */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base mb-2">User Accounts</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">Oversee portal access levels, citizen accounts, and administrative roles.</p>
                    <Button variant="outline" size="sm" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold"
                      onClick={() => setCurrentSettingsView('user_accounts')}>
                      Manage
                    </Button>
                  </CardContent>
                </Card>

                {/* 5. System Configuration */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Settings className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base mb-2">System Configuration</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">Adjust local government area (LGA) settings, operational schedules, and waste thresholds.</p>
                    <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                      onClick={() => setCurrentSettingsView('system_config')}>
                      Manage
                    </Button>
                  </CardContent>
                </Card>

                {/* 6. Notification Settings */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Bell className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base mb-2">Notification Settings</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">Configure SMS, email, and app push notification preferences for alerts and reports.</p>
                    <Button variant="outline" size="sm" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-semibold"
                      onClick={() => setCurrentSettingsView('notification_settings')}>
                      Manage
                    </Button>
                  </CardContent>
                </Card>

                {/* 7. Power BI Configuration */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <ChartBar className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base mb-2">Power BI Configuration</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">Embed keys, workspace configurations, and report parameters.</p>
                    <Button variant="outline" size="sm" className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50 text-xs font-semibold"
                      onClick={() => setCurrentSettingsView('powerbi_config')}>
                      Manage
                    </Button>
                  </CardContent>
                </Card>

                {/* 8. Backup & Restore */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Database className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base mb-2">Backup & Restore</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">Schedule system database backups, download export dumps, and restore checkpoints.</p>
                    <Button variant="outline" size="sm" className="w-full border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold"
                      onClick={() => setCurrentSettingsView('backup_restore')}>
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === 'ai-assistant' && <AIAssistant />}

          {activeView === 'officers' && (
            <div className="space-y-6">
              {/* Officer Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Total Officers</p>
                      <p className="text-2xl font-bold text-slate-900">{officers.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                      <CircleCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Available Now</p>
                      <p className="text-2xl font-bold text-slate-900">{officers.filter(o => o.status === 'Available').length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">On Route</p>
                      <p className="text-2xl font-bold text-slate-900">{officers.filter(o => o.status === 'On Route').length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Officers List */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Officer Directory</CardTitle>
                  <CardDescription>Manage and monitor field officers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead>Truck ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {officers.map((officer) => (
                        <TableRow key={officer.id}>
                          <TableCell className="font-semibold">{officer.full_name}</TableCell>
                          <TableCell>{officer.zone}</TableCell>
                          <TableCell className="font-mono text-sm">{officer.truck_id || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={
                              officer.status === 'Available' ? 'default' :
                              officer.status === 'On Route' ? 'secondary' :
                              'outline'
                            }>
                              {officer.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">{officer.phone || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Officer</DialogTitle>
            <DialogDescription>Select an officer to handle report {selectedReport?.id.slice(0, 6)}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={setSelectedOfficer}>
                <SelectTrigger>
                    <SelectValue placeholder="Select an officer" />
                </SelectTrigger>
                <SelectContent>
                    {officers.map(officer => (
                        <SelectItem key={officer.id} value={officer.id}>{officer.full_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAssignOfficer}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const KpiCard: React.FC<{
  icon: React.ElementType, label: string, value: number,
  color: string, bgColor: string, total?: number, detail?: string,
  pulse?: boolean, resolved?: number
}> = ({ icon: Icon, label, value, color, bgColor, total, detail, pulse, resolved }) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 group">
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${bgColor} ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
        {pulse && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
      </div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {total !== undefined && <span className="text-sm text-slate-400">/ {total}</span>}
      </div>
      {resolved !== undefined && total !== undefined && total > 0 && (
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(resolved / total) * 100}%` }} />
        </div>
      )}
      {detail && <p className="text-xs text-slate-400 mt-1.5">{detail}</p>}
    </CardContent>
  </Card>
);

const CollectionMetric: React.FC<{
  label: string, value: string, unit: string,
  percentage: number, color: string, icon: React.ElementType
}> = ({ label, value, unit, percentage, color, icon: Icon }) => (
  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-slate-500" />
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value} <span className="text-sm font-medium text-slate-400">{unit}</span></p>
    <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
    <p className="text-xs text-slate-400 mt-1">{percentage}% of total capacity</p>
  </div>
);

const QuickActionButton: React.FC<{
  icon: React.ElementType, label: string,
  color: string, onClick: () => void
}> = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-white ${color} transition-all duration-200 active:scale-[0.97] shadow-sm`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-semibold leading-tight text-center">{label}</span>
  </button>
);

// ===== Reusable Admin Management Layout =====
const AdminManagementLayout: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  onBack: () => void;
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}> = ({ title, subtitle, icon: LayoutIcon, accentColor, onBack, children, searchValue, onSearchChange, searchPlaceholder }) => (
  <div className="space-y-6">
    {/* Breadcrumbs */}
    <nav className="flex items-center gap-2 text-sm text-slate-500">
      <span className="font-medium">Government Portal</span>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="font-medium">Settings</span>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-slate-800 font-semibold">{title}</span>
    </nav>

    {/* Header with Back Button and Title */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${accentColor}-100`}>
            <LayoutIcon className={`w-5 h-5 text-${accentColor}-600`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Search Bar — only show when searchValue/onSearchChange are provided */}
    {typeof searchValue !== 'undefined' && onSearchChange && (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={searchPlaceholder || `Search ${title}...`}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>
    )}

    {/* Content Area */}
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  </div>
);

// Local Officer type for the Officer Management module
interface Officer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  lga: string;
  role: string;
  status: 'active' | 'inactive';
}

// Helper: map OfficerProfile → Officer
const mapProfileToOfficer = (p: OfficerProfile): Officer => ({
  id: p.id,
  firstName: p.full_name?.split(' ')[0] || '',
  lastName: p.full_name?.split(' ').slice(1).join(' ') || '',
  email: p.email || '',
  phone: p.phone || '',
  lga: p.zone || '',
  role: 'Field Officer',
  status: p.is_active === false ? 'inactive' : 'active',
});

// Officer Management sub-view
const OfficerManagement: React.FC<{ officers: OfficerProfile[], onBack: () => void }> = ({ officers, onBack }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [lgaFilter, setLgaFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [localOfficers, setLocalOfficers] = useState<Officer[]>(() => officers.map(mapProfileToOfficer));

  useEffect(() => {
    setLocalOfficers(officers.map(mapProfileToOfficer));
  }, [officers]);

  const lgas = useMemo(() => {
    const set = new Set<string>();
    localOfficers.forEach(o => set.add(o.lga));
    return Array.from(set).sort();
  }, [localOfficers]);

  const filteredOfficers = useMemo(() => {
    return localOfficers.filter(o => {
      const matchesSearch = `${o.firstName} ${o.lastName} ${o.email}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesLga = lgaFilter === 'all' || o.lga === lgaFilter;
      return matchesSearch && matchesStatus && matchesLga;
    });
  }, [localOfficers, search, statusFilter, lgaFilter]);

  const handleAddOfficer = (officer: Omit<Officer, 'id'>) => {
    const newOfficer: Officer = {
      ...officer,
      id: `officer_${Date.now()}`,
    };
    setLocalOfficers(prev => [...prev, newOfficer]);
    setIsAddModalOpen(false);
  };

  const handleEditOfficer = (updated: Officer) => {
    setLocalOfficers(prev => prev.map(o => o.id === updated.id ? updated : o));
    setEditingOfficer(null);
  };

  const toggleStatus = (id: string) => {
    setLocalOfficers(prev => prev.map(o => {
      if (o.id !== id) return o;
      return { ...o, status: o.status === 'active' ? 'inactive' : 'active' };
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Officer Management</h2>
            <p className="text-sm text-slate-500 mt-1">Manage active officers, LGA assignments, and duty status.</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Officer
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={lgaFilter}
                onChange={(e) => setLgaFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All LGA</option>
                {lgas.map(lga => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Officers Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Officer</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Email</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">LGA</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Phone</th>
                  <th className="text-left px-6 py-3 font-semibold text-slate-700">Status</th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOfficers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No officers found matching your filters.
                    </td>
                  </tr>
                )}
                {filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                          {officer.firstName[0]}{officer.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{officer.firstName} {officer.lastName}</p>
                          <p className="text-xs text-slate-500">{officer.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{officer.email}</td>
                    <td className="px-6 py-4 text-slate-600">{officer.lga}</td>
                    <td className="px-6 py-4 text-slate-600">{officer.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        officer.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {officer.status === 'active' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {officer.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatus(officer.id)}
                          title={officer.status === 'active' ? 'Deactivate' : 'Activate'}
                          className="text-slate-500 hover:text-blue-600"
                        >
                          {officer.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingOfficer(officer)}
                          title="Edit"
                          className="text-slate-500 hover:text-blue-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <OfficerModal
        isOpen={isAddModalOpen || !!editingOfficer}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingOfficer(null);
        }}
        onSubmit={(officer) => {
          if (editingOfficer) {
            handleEditOfficer({ ...officer, id: editingOfficer.id });
          } else {
            handleAddOfficer(officer);
          }
        }}
        initialData={editingOfficer}
      />
    </div>
  );
};

const OfficerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (officer: Omit<Officer, 'id'>) => void;
  initialData: Officer | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Omit<Officer, 'id'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    lga: '',
    role: '',
    status: 'active',
  });

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setFormData(rest);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        lga: '',
        role: '',
        status: 'active',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-lg border-slate-200 shadow-xl">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-800">
            {initialData ? 'Edit Officer' : 'Add Officer'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="officer@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">LGA</label>
              <Input
                value={formData.lga}
                onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                placeholder="LGA"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Role"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 p-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSubmit(formData)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!formData.firstName || !formData.lastName || !formData.email}
          >
            {initialData ? 'Save Changes' : 'Add Officer'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const NavButton: React.FC<{icon: React.ElementType, label: string, activeView?: string, targetView?: string, setView?: (view: any) => void}> = ({ icon: Icon, label, activeView, targetView, setView }) => (
  <Button 
    variant={activeView === targetView ? 'secondary' : 'ghost'} 
    className="w-full justify-start space-x-3 text-sm font-medium h-12"
    onClick={() => setView && setView(targetView)}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </Button>
);