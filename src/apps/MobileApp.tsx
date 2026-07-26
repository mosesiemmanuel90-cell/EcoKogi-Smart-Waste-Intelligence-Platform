import React, { useState, useRef } from 'react';
import { useEcoKogiStore, WasteType } from '../store/eco-store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Home, Camera, Wallet, User, ArrowLeft, Send, MapPin, Trash2, Award, Bell, Loader, Trophy, Lightbulb, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

// Mock AI classification with confidence
const classifyWaste = async (file: File): Promise<{ type: WasteType; confidence: number; recommendation: string }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const types: WasteType[] = ['Plastic', 'Metal', 'Paper', 'Organic', 'Electronic', 'General'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const confidence = 0.75 + Math.random() * 0.2;
      const recommendations: Record<WasteType, string> = {
        Plastic: 'Rinse and place in recycling bin. Flatten bottles to save space.',
        Metal: 'Clean and separate by type. Scrap metal can be sold for cash.',
        Paper: 'Keep dry and remove plastic wrapping. Flatten cardboard.',
        Organic: 'Compost at home or use green bin. Great for gardening!',
        Electronic: 'Take to e-waste collection points. Contains hazardous materials.',
        General: 'Sort if possible. Place in general waste bin.',
      };
      toast.success(`AI identified waste as: ${randomType} (${Math.round(confidence * 100)}% confident)`);
      resolve({ type: randomType, confidence, recommendation: recommendations[randomType] });
    }, 1500);
  });
};

const getEcoTier = (score: number): { tier: string; color: string; nextTier: number } => {
  if (score >= 90) return { tier: 'Platinum', color: 'bg-gradient-to-r from-purple-500 to-pink-500', nextTier: 100 };
  if (score >= 70) return { tier: 'Gold', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', nextTier: 90 };
  if (score >= 40) return { tier: 'Silver', color: 'bg-gradient-to-r from-gray-400 to-gray-600', nextTier: 70 };
  return { tier: 'Bronze', color: 'bg-gradient-to-r from-orange-600 to-orange-800', nextTier: 40 };
};

export const MobileApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<'home' | 'report' | 'rewards' | 'challenges' | 'leaderboard' | 'profile' | 'notifications'>('home');
  const { userPoints, reports, addReport, redeemPoints, profile, signOut, notifications, challenges, leaderboard, environmentalTips } = useEcoKogiStore();
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<{ type: WasteType; confidence: number; recommendation: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: 'Plastic' as WasteType,
    description: '',
    location: '',
    image_url: null as string | null,
  });

  const ecoTier = getEcoTier(profile?.eco_score || 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsClassifying(true);
    setClassificationResult(null);
    try {
      const result = await classifyWaste(file);
      setClassificationResult(result);
      
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('waste-images')
        .upload(fileName, file);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('waste-images').getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, type: result.type, image_url: publicUrl }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image or classify waste.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.location) {
      return;
    }
    try {
      await addReport(formData);
      toast.success('Waste report submitted! +50 EcoPoints');
      setFormData({ type: 'Plastic', description: '', location: '', image_url: null });
      setClassificationResult(null);
      setTab('home');
    } catch (error: any) {
      toast.error('Submission failed', { description: error.message });
    }
  };

  const rewards = [
    { id: '1', title: 'Data Bundle 1GB', cost: 200, provider: 'MTN Kogi' },
    { id: '2', title: 'Bus Fare Voucher', cost: 150, provider: 'Kogi Link' },
    { id: '3', title: 'Plant a Tree', cost: 100, provider: 'EcoKogi' },
  ];

  return (
    <div className="flex justify-center bg-slate-900 min-h-screen md:p-8">
      <div className="w-full max-w-[420px] bg-white h-screen md:h-[844px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col border-[8px] border-slate-800 relative">
        
        <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-emerald-600 text-white">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-emerald-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">EcoKogi</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setTab('notifications')} className="relative text-white hover:bg-emerald-700">
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read_status) && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"/>}
            </Button>
            <div className="bg-emerald-500 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
              <Award className="w-4 h-4" />
              <span>{userPoints} pts</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pb-24">
          {tab === 'home' && (
            <div className="space-y-6">
              <img 
                src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/4053c4e1-84c6-4549-82f9-1b97af48d950/citizen-reporting-waste-413a0e28-1783378582026.webp" 
                alt="Community" 
                className="w-full h-40 object-cover rounded-3xl"
              />
              
              {/* EcoScore Card */}
              <div className={`${ecoTier.color} p-6 rounded-3xl text-white shadow-lg`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Your EcoScore</p>
                    <p className="text-4xl font-black">{profile?.eco_score || 0}</p>
                  </div>
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white/20 rounded-full p-1">
                  <div className="bg-white rounded-full h-2" style={{ width: `${((profile?.eco_score || 0) / ecoTier.nextTier) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="font-bold">{ecoTier.tier} Tier</span>
                  <span className="text-white/80">{ecoTier.nextTier - (profile?.eco_score || 0)} pts to next tier</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                <h2 className="text-emerald-900 font-bold text-lg">Welcome back, {profile?.full_name || 'Citizen'}!</h2>
                <p className="text-emerald-700 text-sm">You've submitted {profile?.total_reports || 0} reports. Keep Kogi clean!</p>
                <div className="mt-4 bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Balance</p>
                    <p className="text-2xl font-black text-slate-800">{userPoints} pts</p>
                  </div>
                  <Button onClick={() => setTab('rewards')} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">Redeem</Button>
                </div>
              </div>

              {/* Environmental Tips */}
              {environmentalTips.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Eco Tips
                  </h3>
                  <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                    <p className="font-semibold text-slate-800">{environmentalTips[0].title}</p>
                    <p className="text-sm text-slate-600 mt-1">{environmentalTips[0].content}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Your Recent Reports</h3>
                  <Button variant="link" className="text-emerald-600">See all</Button>
                </div>
                {reports.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Trash2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No reports yet. Start reporting waste to earn points!</p>
                  </div>
                ) : (
                  reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex items-center space-x-4 p-4 rounded-2xl border border-slate-100 bg-white">
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <Trash2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{report.type}</p>
                        <p className="text-xs text-slate-400">{report.location}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        report.status === 'Collected' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {report.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'report' && (
            <form onSubmit={handleReport} className="space-y-6">
              <h2 className="text-2xl font-black text-slate-800">Report Waste</h2>
              <div className="space-y-4">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                <div 
                  className="bg-slate-50 aspect-video rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-2 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isClassifying ? (
                    <>
                      <Loader className="w-10 h-10 animate-spin" />
                      <p className="text-sm font-medium">Analyzing with AI...</p>
                    </>
                  ) : formData.image_url ? (
                    <img src={formData.image_url} alt="Waste" className="w-full h-full object-cover rounded-3xl" />
                  ) : (
                    <>
                      <Camera className="w-10 h-10" />
                      <p className="text-sm font-medium">Add Photo</p>
                      <p className="text-xs">AI will classify it!</p>
                    </>
                  )}
                </div>

                {/* AI Classification Result */}
                {classificationResult && (
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-emerald-900">AI Classification</span>
                      </div>
                      <Badge className="bg-emerald-600">{Math.round(classificationResult.confidence * 100)}% confident</Badge>
                    </div>
                    <div className="bg-white p-3 rounded-xl">
                      <p className="text-sm text-slate-600">Detected: <span className="font-bold text-slate-900">{classificationResult.type}</span></p>
                      <p className="text-xs text-slate-500 mt-1">{classificationResult.recommendation}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 ml-1">Type of Waste</label>
                  <select 
                    className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as WasteType})}
                  >
                    <option value="Plastic">Plastic</option>
                    <option value="Metal">Metal</option>
                    <option value="Paper">Paper</option>
                    <option value="Organic">Organic</option>
                    <option value="Electronic">Electronic</option>
                    <option value="General">General Waste</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 ml-1">Location (Area/LGA)</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      placeholder="e.g. Ganaja Junction, Lokoja" 
                      className="pl-12 h-12 rounded-2xl bg-slate-50"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 ml-1">Description</label>
                  <Textarea 
                    placeholder="Describe the waste size and accessibility..." 
                    className="min-h-[120px] rounded-2xl bg-slate-50"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-lg shadow-emerald-100">
                  Submit Report <Send className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </form>
          )}

          {tab === 'rewards' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-800">Marketplace</h2>
              <div className="grid gap-4">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="rounded-3xl border-slate-100 overflow-hidden shadow-sm">
                    <CardHeader className="bg-slate-50 pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold">{reward.title}</CardTitle>
                        <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {reward.cost} pts
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm">{reward.provider}</p>
                    </CardHeader>
                    <CardFooter className="pt-4">
                      <Button 
                        className="w-full rounded-xl bg-slate-900" 
                        disabled={userPoints < reward.cost}
                        onClick={async () => {
                          try {
                            if (await redeemPoints(reward.cost)) {
                              toast.success(`Redeemed ${reward.title}! Check your SMS for instructions.`);
                            }
                          } catch (error: any) {
                             toast.error('Redemption failed', { description: error.message });
                          }
                        }}
                      >
                        {userPoints < reward.cost ? 'Insufficient Points' : 'Redeem Now'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === 'challenges' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-800">Active Challenges</h2>
              {challenges.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No active challenges at the moment.</p>
                </div>
              ) : (
                challenges.map((challenge) => (
                  <Card key={challenge.id} className="rounded-3xl border-slate-100 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{challenge.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{challenge.description}</p>
                        </div>
                        <Badge className="bg-purple-600">+{challenge.reward_points} pts</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-bold">{challenge.current_value} / {challenge.target_value}</span>
                        </div>
                        <Progress value={(challenge.current_value / challenge.target_value) * 100} className="h-2" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>Ends {new Date(challenge.end_date).toLocaleDateString()}</span>
                      </div>
                      <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">Join Challenge</Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {tab === 'leaderboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-800">Leaderboard</h2>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-3xl text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-8 h-8" />
                  <div>
                    <p className="text-white/80 text-sm">Your Rank</p>
                    <p className="text-3xl font-black">#{leaderboard.find(l => l.profile_id === profile?.id)?.rank || '--'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${
                    entry.profile_id === profile?.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{entry.profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">{entry.total_reports} reports • {entry.total_weight_kg}kg</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{entry.total_points}</p>
                      <p className="text-xs text-slate-500">points</p>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <p>No leaderboard data available yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="space-y-8 text-center pt-8">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-emerald-500 p-1">
                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-slate-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.full_name || 'Citizen'}</h2>
                <p className="text-slate-500">{profile?.lga || 'Kogi State'}</p>
                <Badge className={`mt-2 ${ecoTier.color} text-white`}>{ecoTier.tier} Tier</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-2xl font-bold text-emerald-600">{profile?.total_reports || 0}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase">Reports</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-2xl font-bold text-emerald-600">{userPoints}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase">Points</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-2xl font-bold text-emerald-600">{profile?.eco_score || 0}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase">EcoScore</p>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-xl border-slate-200">Account Settings</Button>
              <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50" onClick={() => { signOut(); onBack(); }}>Logout</Button>
            </div>
          )}
          
          {tab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-800">Notifications</h2>
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>You have no new notifications.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-4 rounded-2xl border ${n.read_status ? 'bg-white' : 'bg-emerald-50 border-emerald-100'}`}>
                    <p className="font-bold text-slate-800">{n.title}</p>
                    <p className="text-sm text-slate-600">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-around px-2">
          <NavButton icon={Home} label="Home" activeTab={tab} targetTab="home" setTab={setTab} />
          <NavButton icon={Camera} label="Report" activeTab={tab} targetTab="report" setTab={setTab} />
          <NavButton icon={Trophy} label="Challenges" activeTab={tab} targetTab="challenges" setTab={setTab} />
          <NavButton icon={Wallet} label="Rewards" activeTab={tab} targetTab="rewards" setTab={setTab} />
          <NavButton icon={User} label="Profile" activeTab={tab} targetTab="profile" setTab={setTab} />
        </nav>
      </div>
    </div>
  );
};

const NavButton: React.FC<{icon: React.ElementType, label: string, activeTab: string, targetTab: string, setTab: (tab: any) => void}> = ({ icon: Icon, label, activeTab, targetTab, setTab }) => (
  <Button variant="ghost" onClick={() => setTab(targetTab)} className={`flex flex-col items-center h-full space-y-1 ${activeTab === targetTab ? 'text-emerald-600' : 'text-slate-400'}`}>
    <Icon className="w-5 h-5" />
    <span className="text-[9px] font-bold">{label}</span>
  </Button>
);