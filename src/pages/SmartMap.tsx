import React from 'react';
import { Map, MapPin, Trash2, Recycle, Gauge, Check, Activity, Satellite, Route, Leaf, Shield, Thermometer, Sparkles, Circle, Square, Star, Triangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const kpiCards = [
  { label: 'Active Hotspots', value: '14', icon: Activity, color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  { label: 'Illegal Dumpsites', value: '8', icon: Trash2, color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
  { label: 'Registered Recyclers', value: '23', icon: Recycle, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  { label: 'Fleet Coverage', value: '88%', icon: Gauge, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
];

const legendItems = [
  { icon: Circle, label: 'Hotspot', color: 'text-red-500' },
  { icon: Square, label: 'Dumpsite', color: 'text-orange-500' },
  { icon: Triangle, label: 'Recycler', color: 'text-emerald-500' },
  { icon: Star, label: 'Government Facility', color: 'text-blue-500' },
];

const futureFeatures = [
  { icon: Route, label: 'Live GPS Tracking', badge: 'Coming Soon' },
  { icon: Satellite, label: 'Satellite Monitoring', badge: 'Coming Soon' },
  { icon: Activity, label: 'Heat Maps', badge: 'Coming Soon' },
  { icon: Shield, label: 'Route Optimization', badge: 'Coming Soon' },
  { icon: Thermometer, label: 'Environmental Risk Zones', badge: 'Coming Soon' },
];

// Kogi State SVG - simplified geographical outline with 21 LGA regions
const KogiMapSVG = () => (
  <svg viewBox="0 0 500 600" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background outline */}
    <path
      d="M250 20 C280 25 310 40 330 60 C350 80 360 100 370 120 C380 140 390 150 400 170 C410 190 415 210 420 230 C425 250 430 270 425 290 C420 310 410 330 395 345 C380 360 360 370 340 380 C320 390 300 395 280 400 C260 405 240 410 220 415 C200 420 180 425 160 430 C140 435 120 440 100 445 C80 450 65 455 55 440 C45 425 40 400 42 375 C44 350 50 325 60 300 C70 275 85 250 95 230 C105 210 115 195 130 175 C145 155 160 140 175 120 C190 100 210 80 230 55 C240 40 245 28 250 20Z"
      className="fill-slate-800/50 stroke-emerald-500/30"
      strokeWidth="2"
    />
    
    {/* LGA Region 1 - Adavi */}
    <path d="M180 180 L200 175 L210 190 L195 205 L175 200 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 2 - Ajaokuta */}
    <path d="M210 190 L230 185 L240 200 L225 215 L210 205 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 3 - Ankpa */}
    <path d="M280 200 L300 195 L310 210 L295 225 L275 218 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 4 - Bassa */}
    <path d="M240 250 L260 245 L270 260 L255 275 L235 268 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 5 - Dekina */}
    <path d="M300 240 L320 235 L330 250 L315 265 L295 258 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 6 - Ibaji */}
    <path d="M340 280 L360 275 L370 290 L355 305 L335 298 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 7 - Idah */}
    <path d="M310 310 L330 305 L340 320 L325 335 L305 328 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 8 - Igalamela */}
    <path d="M270 330 L290 325 L300 340 L285 355 L265 348 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 9 - Ijumu */}
    <path d="M150 250 L170 245 L180 260 L165 275 L145 268 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 10 - Kabba/Bunu */}
    <path d="M130 210 L150 205 L160 220 L145 235 L125 228 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 11 - Kogi */}
    <path d="M160 300 L180 295 L190 310 L175 325 L155 318 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 12 - Lokoja */}
    <path d="M200 140 L220 135 L230 150 L215 165 L195 158 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 13 - Mopa-Muro */}
    <path d="M110 170 L130 165 L140 180 L125 195 L105 188 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 14 - Ofu */}
    <path d="M260 290 L280 285 L290 300 L275 315 L255 308 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 15 - Ogori/Magongo */}
    <path d="M170 230 L190 225 L200 240 L185 255 L165 248 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 16 - Okehi */}
    <path d="M220 230 L240 225 L250 240 L235 255 L215 248 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 17 - Okene */}
    <path d="M190 270 L210 265 L220 280 L205 295 L185 288 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 18 - Olamaboro */}
    <path d="M340 220 L360 215 L370 230 L355 245 L335 238 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 19 - Omala */}
    <path d="M360 180 L380 175 L390 190 L375 205 L355 198 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 20 - Yagba East */}
    <path d="M100 230 L120 225 L130 240 L115 255 L95 248 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    {/* LGA Region 21 - Yagba West */}
    <path d="M80 270 L100 265 L110 280 L95 295 L75 288 Z" className="fill-slate-700/40 stroke-emerald-500/20" strokeWidth="1" />
    
    {/* LGA labels */}
    <text x="185" y="198" className="fill-slate-400 text-[4px] font-medium">Adavi</text>
    <text x="215" y="208" className="fill-slate-400 text-[4px] font-medium">Ajaokuta</text>
    <text x="282" y="218" className="fill-slate-400 text-[4px] font-medium">Ankpa</text>
    <text x="240" y="268" className="fill-slate-400 text-[4px] font-medium">Bassa</text>
    <text x="302" y="258" className="fill-slate-400 text-[4px] font-medium">Dekina</text>
    <text x="342" y="298" className="fill-slate-400 text-[4px] font-medium">Ibaji</text>
    <text x="312" y="328" className="fill-slate-400 text-[4px] font-medium">Idah</text>
    <text x="272" y="348" className="fill-slate-400 text-[4px] font-medium">Igalamela</text>
    <text x="152" y="268" className="fill-slate-400 text-[4px] font-medium">Ijumu</text>
    <text x="132" y="228" className="fill-slate-400 text-[4px] font-medium">Kabba/Bunu</text>
    <text x="162" y="318" className="fill-slate-400 text-[4px] font-medium">Kogi</text>
    <text x="202" y="158" className="fill-slate-400 text-[4px] font-medium">Lokoja</text>
    <text x="112" y="188" className="fill-slate-400 text-[4px] font-medium">Mopa-Muro</text>
    <text x="262" y="308" className="fill-slate-400 text-[4px] font-medium">Ofu</text>
    <text x="172" y="248" className="fill-slate-400 text-[4px] font-medium">Ogori</text>
    <text x="222" y="248" className="fill-slate-400 text-[4px] font-medium">Okehi</text>
    <text x="192" y="288" className="fill-slate-400 text-[4px] font-medium">Okene</text>
    <text x="342" y="238" className="fill-slate-400 text-[4px] font-medium">Olamaboro</text>
    <text x="362" y="198" className="fill-slate-400 text-[4px] font-medium">Omala</text>
    <text x="102" y="248" className="fill-slate-400 text-[4px] font-medium">Yagba E</text>
    <text x="82" y="288" className="fill-slate-400 text-[4px] font-medium">Yagba W</text>

    {/* Central marker - Lokoja (capital) */}
    <circle cx="210" cy="150" r="4" className="fill-emerald-400 stroke-slate-900" strokeWidth="1.5" />
    <text x="210" y="142" className="fill-emerald-300 text-[5px] font-bold text-center" textAnchor="middle">Lokoja</text>
  </svg>
);

export const SmartMap: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 md:p-8">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(16,185,129,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(52,211,153,0.3) 0%, transparent 50%)'}} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Map className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Smart Map & GIS Dashboard</h1>
          </div>
          <p className="text-emerald-200/70 text-sm md:text-base max-w-2xl">
            Geospatial monitoring of waste incidents across Kogi State.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-none shadow-sm bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${kpi.bgColor} ${kpi.borderColor} border`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Map Section + Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kogi State Map */}
        <Card className="lg:col-span-3 border-none shadow-sm bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Kogi State GIS Map
            </CardTitle>
            <CardDescription className="text-slate-400">
              21 Local Government Areas — Geospatial View
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="relative w-full aspect-[5/6] max-h-[500px] mx-auto">
              <KogiMapSVG />
              
              {/* Interactive GIS Coming Soon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-emerald-500/30 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold text-sm">Interactive GIS Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend Panel */}
        <Card className="border-none shadow-sm bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Map className="w-4 h-4 text-emerald-400" />
              Map Legend
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">Feature markers legend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {legendItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-700/30 border border-slate-700/50">
                    <div className={`${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Future Features Card */}
      <Card className="border-none shadow-sm bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Future GIS Integrations
          </CardTitle>
          <CardDescription className="text-slate-400">
            Upcoming geospatial capabilities on the roadmap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {futureFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/30 border border-slate-700/50 hover:border-emerald-500/30 transition-all">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{feature.label}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      {feature.badge}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};