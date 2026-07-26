import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Search, Save, RotateCcw, Globe, Clock, Bell, Shield, Mail, MessageSquare, Smartphone, ChevronRight, Info, Check, SlidersHorizontal, Sun, Moon, Key } from 'lucide-react';

type LGAOption = 'lokoja' | 'okene' | 'kabba' | 'ankpa' | 'idah';
type TimeZoneOption = 'africa_lagos' | 'africa_cairo' | 'africa_nairobi' | 'utc';
type LanguageOption = 'en' | 'ha' | 'yo' | 'ig';
type PasswordPolicyOption = 'standard' | 'strict' | 'very_strict';

interface SystemConfig {
  // General
  systemName: string;
  agencyName: string;
  defaultLga: LGAOption;
  timeZone: TimeZoneOption;
  language: LanguageOption;
  // Waste Collection
  collectionFrequency: string;
  defaultVehicleCapacity: number;
  incidentResponseTime: string;
  autoAssignment: boolean;
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  // Security
  sessionTimeout: number;
  passwordPolicy: PasswordPolicyOption;
  twoFactorAuth: boolean;
}

const DEFAULT_CONFIG: SystemConfig = {
  systemName: 'EcoKogi Waste Management',
  agencyName: 'Kogi State Waste Management Authority',
  defaultLga: 'lokoja',
  timeZone: 'africa_lagos',
  language: 'en',
  collectionFrequency: 'daily',
  defaultVehicleCapacity: 5000,
  incidentResponseTime: '2 hours',
  autoAssignment: true,
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: false,
  sessionTimeout: 30,
  passwordPolicy: 'standard',
  twoFactorAuth: false,
};

const LGA_LABELS: Record<LGAOption, string> = {
  lokoja: 'Lokoja',
  okene: 'Okene',
  kabba: 'Kabba',
  ankpa: 'Ankpa',
  idah: 'Idah',
};

const TIMEZONE_LABELS: Record<TimeZoneOption, string> = {
  africa_lagos: 'Africa/Lagos (UTC+1)',
  africa_cairo: 'Africa/Cairo (UTC+2)',
  africa_nairobi: 'Africa/Nairobi (UTC+3)',
  utc: 'UTC (Coordinated Universal Time)',
};

const LANGUAGE_LABELS: Record<LanguageOption, string> = {
  en: 'English',
  ha: 'Hausa',
  yo: 'Yoruba',
  ig: 'Igbo',
};

const PASSWORD_POLICY_LABELS: Record<PasswordPolicyOption, string> = {
  standard: 'Standard (8+ chars, 1 uppercase)',
  strict: 'Strict (10+ chars, mixed case, 1 number)',
  very_strict: 'Very Strict (12+ chars, mixed case, number, special)',
};

const COLLECTION_FREQ_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'alternate_days', label: 'Alternate Days' },
  { value: 'twice_weekly', label: 'Twice Weekly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'on_demand', label: 'On Demand' },
];

interface ConfigCardProps {
  title: string;
  icon: React.ElementType;
  accentColor: string;
  children: React.ReactNode;
  isHighlighted?: boolean;
}

const ConfigCard: React.FC<ConfigCardProps> = ({ title, icon: Icon, accentColor, children, isHighlighted }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={`rounded-xl border transition-all duration-200 ${
      isHighlighted
        ? `border-${accentColor}-300 ring-2 ring-${accentColor}-200/50 shadow-md`
        : 'border-slate-200 shadow-sm hover:shadow-md'
    } bg-white`}
  >
    <CardHeader className="pb-4 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${accentColor}-50 text-${accentColor}-600`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <CardTitle className="text-base font-semibold text-slate-800">{title}</CardTitle>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-5 space-y-4">{children}</CardContent>
  </motion.div>
);

interface FieldLabelProps {
  label: string;
  description?: string;
}

const FieldLabel: React.FC<FieldLabelProps> = ({ label, description }) => (
  <div className="mb-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
  </div>
);

export const SystemConfigAdmin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [config, setConfig] = useState<SystemConfig>(() => ({ ...DEFAULT_CONFIG }));
  const [searchQuery, setSearchQuery] = useState('');

  const updateField = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_CONFIG });
    toast.success('Configuration reset to defaults', {
      description: 'All fields have been restored to their original values.',
    });
  };

  const handleSave = () => {
    toast.success('Configuration saved successfully', {
      description: 'System settings have been updated and applied.',
      icon: <Check className="w-4 h-4 text-emerald-500" />,
    });
  };

  // Derive search highlight state for each card
  const q = searchQuery.toLowerCase().trim();
  const searchMatches = useMemo(() => {
    if (!q) return { general: false, waste: false, notifications: false, security: false };
    return {
      general: ['system name', 'agency name', 'default lga', 'time zone', 'language', config.systemName, config.agencyName, LGA_LABELS[config.defaultLga], TIMEZONE_LABELS[config.timeZone], LANGUAGE_LABELS[config.language]].some(v => v.toLowerCase().includes(q)),
      waste: ['collection frequency', 'vehicle capacity', 'incident response', 'auto assignment', config.collectionFrequency, String(config.defaultVehicleCapacity), config.incidentResponseTime].some(v => v.toLowerCase().includes(q)),
      notifications: ['email notifications', 'sms notifications', 'push notifications'].some(v => v.toLowerCase().includes(q)),
      security: ['session timeout', 'password policy', 'two-factor authentication', '2fa', String(config.sessionTimeout), PASSWORD_POLICY_LABELS[config.passwordPolicy]].some(v => v.toLowerCase().includes(q)),
    };
  }, [q, config]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium">Government Portal</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-medium">Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-semibold">System Configuration</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
              <p className="text-sm text-slate-500">Adjust system-wide settings and operational parameters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search configuration fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {/* Configuration Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. General System Card */}
        <ConfigCard title="General System" icon={Globe} accentColor="blue" isHighlighted={searchMatches.general}>
          <div>
            <FieldLabel label="System Name" description="Display name of the waste management system" />
            <Input
              value={config.systemName}
              onChange={(e) => updateField('systemName', e.target.value)}
              placeholder="System name"
            />
          </div>
          <div>
            <FieldLabel label="Government Agency Name" />
            <Input
              value={config.agencyName}
              onChange={(e) => updateField('agencyName', e.target.value)}
              placeholder="Agency name"
            />
          </div>
          <div>
            <FieldLabel label="Default LGA" description="Primary Local Government Area" />
            <Select value={config.defaultLga} onValueChange={(v: LGAOption) => updateField('defaultLga', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select LGA" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(LGA_LABELS) as [LGAOption, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel label="Time Zone" />
              <Select value={config.timeZone} onValueChange={(v: TimeZoneOption) => updateField('timeZone', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TIMEZONE_LABELS) as [TimeZoneOption, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel label="Language" />
              <Select value={config.language} onValueChange={(v: LanguageOption) => updateField('language', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(LANGUAGE_LABELS) as [LanguageOption, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ConfigCard>

        {/* 2. Waste Collection Card */}
        <ConfigCard title="Waste Collection" icon={Clock} accentColor="emerald" isHighlighted={searchMatches.waste}>
          <div>
            <FieldLabel label="Collection Frequency" description="How often waste is collected from designated zones" />
            <Select value={config.collectionFrequency} onValueChange={(v) => updateField('collectionFrequency', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {COLLECTION_FREQ_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel label="Default Vehicle Capacity" description="In kilograms" />
              <Input
                type="number"
                value={config.defaultVehicleCapacity}
                onChange={(e) => updateField('defaultVehicleCapacity', parseInt(e.target.value) || 0)}
                placeholder="5000"
              />
            </div>
            <div>
              <FieldLabel label="Incident Response Time" description="Target response window" />
              <Input
                value={config.incidentResponseTime}
                onChange={(e) => updateField('incidentResponseTime', e.target.value)}
                placeholder="2 hours"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-800">Auto Assignment</p>
              <p className="text-xs text-slate-500">Automatically assign officers to incoming reports</p>
            </div>
            <Switch
              checked={config.autoAssignment}
              onCheckedChange={(v) => updateField('autoAssignment', v)}
            />
          </div>
        </ConfigCard>

        {/* 3. Notifications Card */}
        <ConfigCard title="Notifications" icon={Bell} accentColor="amber" isHighlighted={searchMatches.notifications}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Email Notifications</p>
                  <p className="text-xs text-slate-500">System alerts and reports via email</p>
                </div>
              </div>
              <Switch
                checked={config.emailNotifications}
                onCheckedChange={(v) => updateField('emailNotifications', v)}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">SMS Notifications</p>
                  <p className="text-xs text-slate-500">Critical alerts via SMS to field officers</p>
                </div>
              </div>
              <Switch
                checked={config.smsNotifications}
                onCheckedChange={(v) => updateField('smsNotifications', v)}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Push Notifications</p>
                  <p className="text-xs text-slate-500">Mobile push notifications for all users</p>
                </div>
              </div>
              <Switch
                checked={config.pushNotifications}
                onCheckedChange={(v) => updateField('pushNotifications', v)}
              />
            </div>
          </div>
        </ConfigCard>

        {/* 4. Security Card */}
        <ConfigCard title="Security" icon={Shield} accentColor="red" isHighlighted={searchMatches.security}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel label="Session Timeout" description="In minutes of inactivity" />
              <Input
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => updateField('sessionTimeout', parseInt(e.target.value) || 0)}
                placeholder="30"
              />
            </div>
            <div>
              <FieldLabel label="Password Policy" />
              <Select value={config.passwordPolicy} onValueChange={(v: PasswordPolicyOption) => updateField('passwordPolicy', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PASSWORD_POLICY_LABELS) as [PasswordPolicyOption, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-red-50 text-red-600">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Require 2FA for all admin accounts</p>
              </div>
            </div>
            <Switch
              checked={config.twoFactorAuth}
              onCheckedChange={(v) => updateField('twoFactorAuth', v)}
            />
          </div>
        </ConfigCard>
      </div>

      {/* Action Footer */}
      <Card className="border-slate-200 shadow-sm bg-white sticky bottom-0">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Changes are saved locally and will be applied system-wide.</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};