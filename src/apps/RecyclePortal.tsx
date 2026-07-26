import React, { useState } from 'react';
import { useEcoKogiStore, WasteType } from '../store/eco-store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Recycle, Package, DollarSign, History, Plus, LogOut, Search, CircleAlert, TrendingUp, Leaf, Calendar, Award, ChartBar } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const RecyclePortal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { transactions, addTransaction, profile, signOut, recyclingPartners } = useEcoKogiStore();
  const [formData, setFormData] = useState({
    materialType: 'Plastic' as WasteType,
    weight: '',
    partnerId: null as string | null,
  });
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const materialRates: Record<WasteType, number> = {
    'Plastic': 150, // N150 per kg
    'Metal': 400,
    'Paper': 80,
    'Organic': 50,
    'Electronic': 600,
    'General': 20,
  };

  // CO2 savings factors (kg CO2 per kg of material)
  const co2Factors: Record<WasteType, number> = {
    'Plastic': 2.5,
    'Metal': 3.8,
    'Paper': 1.1,
    'Organic': 0.6,
    'Electronic': 4.2,
    'General': 0.3,
  };

  const handleIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerId) {
      toast.error('Critical Error: No Recycling Partner', {
        description: 'Cannot log transaction. Please contact support to register a recycling partner for this terminal.',
      });
      return;
    }

    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    const payout = weight * materialRates[formData.materialType];
    try {
      await addTransaction({
        vendorId: formData.partnerId,
        materialType: formData.materialType,
        weight,
        payout,
      });

      toast.success(`Logged ${weight}kg of ${formData.materialType}. Payout: ₦${payout.toLocaleString()}`);
      setFormData({ materialType: 'Plastic', weight: '', partnerId: formData.partnerId });
    } catch (error: any) {
      toast.error('Transaction failed', { description: error.message });
    }
  };
  
  // Simulate assigning the first available partner to this terminal
  useState(() => {
      if (recyclingPartners.length > 0 && !formData.partnerId) {
          setFormData(prev => ({...prev, partnerId: recyclingPartners[0].id}));
      }
  });

  const totalPayout = transactions.reduce((acc, curr) => acc + curr.payout, 0);
  const totalWeight = transactions.reduce((acc, curr) => acc + curr.weight, 0);

  // Calculate CO2 savings
  const totalCo2Saved = transactions.reduce((acc, curr) => {
    const factor = co2Factors[curr.materialType as WasteType] || 0.5;
    return acc + (curr.weight * factor);
  }, 0);

  // Material breakdown for chart
  const materialBreakdown = Object.entries(
    transactions.reduce((acc, curr) => {
      const type = curr.materialType;
      if (!acc[type]) acc[type] = 0;
      acc[type] += curr.weight;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#6b7280', '#f59e0b', '#10b981', '#8b5cf6', '#64748b'];

  // Filter transactions by period
  const getFilteredTransactions = () => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (reportPeriod) {
      case 'daily':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }
    
    return transactions.filter(t => new Date(t.timestamp) >= cutoff);
  };

  const filteredTransactions = getFilteredTransactions();
  const filteredWeight = filteredTransactions.reduce((acc, curr) => acc + curr.weight, 0);
  const filteredPayout = filteredTransactions.reduce((acc, curr) => acc + curr.payout, 0);

  // Quality grades distribution (mock data based on transactions)
  const qualityGrades = [
    { grade: 'A', count: Math.floor(transactions.length * 0.6), color: 'bg-emerald-500' },
    { grade: 'B', count: Math.floor(transactions.length * 0.3), color: 'bg-blue-500' },
    { grade: 'C', count: Math.floor(transactions.length * 0.1), color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-orange-50/30 flex flex-col">
      <header className="h-20 bg-white border-b border-orange-100 px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-orange-600 p-2 rounded-lg">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">RecyclePoint Vendor</h1>
            <p className="text-xs text-orange-600 font-bold">{recyclingPartners.find(p => p.id === formData.partnerId)?.name || 'Lokoja Main Hub'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-slate-500" onClick={() => { signOut(); onBack(); }}>
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        {!formData.partnerId && (
            <Card className="border-red-500 bg-red-50 text-red-900">
                <CardContent className="p-6 flex items-center space-x-4">
                    <CircleAlert className="w-8 h-8 text-red-500" />
                    <div>
                        <CardTitle className="text-lg">Configuration Error</CardTitle>
                        <CardDescription className="text-red-700">This terminal has no assigned recycling partner. Please contact an administrator to resolve this before logging transactions.</CardDescription>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-orange-600 text-white">
            <CardContent className="p-6">
              <p className="text-orange-100 text-sm font-medium">Total Payouts</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-black">₦{totalPayout.toLocaleString()}</p>
                <DollarSign className="w-8 h-8 opacity-40" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-500 text-sm font-medium">Total Materials</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-black text-slate-900">{totalWeight.toLocaleString()} <span className="text-lg font-normal text-slate-400">kg</span></p>
                <Package className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-500 text-sm font-medium">CO₂ Saved</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-black text-emerald-600">{totalCo2Saved.toFixed(1)} <span className="text-lg font-normal text-slate-400">kg</span></p>
                <Leaf className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-500 text-sm font-medium">Transactions</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-black text-slate-900">{transactions.length}</p>
                <History className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Filter */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-700">Report Period:</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={reportPeriod === 'daily' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReportPeriod('daily')}
                  className={reportPeriod === 'daily' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  Daily
                </Button>
                <Button 
                  variant={reportPeriod === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReportPeriod('weekly')}
                  className={reportPeriod === 'weekly' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  Weekly
                </Button>
                <Button 
                  variant={reportPeriod === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReportPeriod('monthly')}
                  className={reportPeriod === 'monthly' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  Monthly
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-slate-500">Period Weight</p>
                <p className="text-2xl font-bold text-slate-900">{filteredWeight.toFixed(1)} kg</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Period Payout</p>
                <p className="text-2xl font-bold text-orange-600">₦{filteredPayout.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{filteredTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Material Breakdown & Quality */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="w-5 h-5 text-orange-600" />
                Material Breakdown
              </CardTitle>
              <CardDescription>Distribution of materials by weight</CardDescription>
            </CardHeader>
            <CardContent>
              {materialBreakdown.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={materialBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {materialBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <p>No material data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                Quality Grades
              </CardTitle>
              <CardDescription>Material quality distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityGrades.map((grade) => (
                  <div key={grade.grade} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${grade.color} flex items-center justify-center text-white font-bold text-xl`}>
                      {grade.grade}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-700">Grade {grade.grade}</span>
                        <span className="text-sm text-slate-500">{grade.count} items</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={`${grade.color} h-2 rounded-full`} 
                          style={{ width: `${(grade.count / transactions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-none shadow-sm sticky top-8">
              <CardHeader>
                <CardTitle>Log New Material</CardTitle>
                <CardDescription>Record material weight and calculate payout.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIntake} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Material Type</label>
                    <select 
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none"
                      value={formData.materialType}
                      onChange={(e) => setFormData({...formData, materialType: e.target.value as WasteType})}
                    >
                      {Object.keys(materialRates).map(type => (
                        <option key={type} value={type}>{type} (₦{materialRates[type as WasteType]}/kg)</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Weight (kg)</label>
                    <Input 
                      type="number" 
                      placeholder="Enter weight in kg" 
                      className="h-11 rounded-xl bg-slate-50"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      required
                    />
                  </div>
                  <div className="pt-4 p-4 bg-orange-50 rounded-xl space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Current Rate:</span>
                      <span className="font-bold">₦{materialRates[formData.materialType]}/kg</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-orange-700">
                      <span>Est. Payout:</span>
                      <span>₦{((parseFloat(formData.weight) || 0) * materialRates[formData.materialType]).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-600 pt-2 border-t border-orange-200">
                      <span>CO₂ Savings:</span>
                      <span className="font-semibold">{((parseFloat(formData.weight) || 0) * (co2Factors[formData.materialType] || 0.5)).toFixed(2)} kg</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-lg font-bold" disabled={!formData.partnerId}>
                    <Plus className="mr-2 w-5 h-5" /> Log Material
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Partner Info */}
            <Card className="border-none shadow-sm mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Partner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Recycle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{recyclingPartners.find(p => p.id === formData.partnerId)?.name || 'Not Assigned'}</p>
                    <p className="text-xs text-slate-500">Lokoja Main Hub</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <p className="text-xs text-slate-600">Materials Accepted</p>
                    <p className="font-bold text-emerald-700">7 Types</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-slate-600">Operating Hours</p>
                    <p className="font-bold text-blue-700">8AM - 6PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Recent material intake records.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search logs..." className="pl-9 h-10 rounded-lg bg-slate-50 border-none" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="pl-6">Material</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead>CO₂ Saved</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="pr-6 text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="pl-6 font-bold text-slate-700">{t.materialType}</TableCell>
                        <TableCell>{t.weight} kg</TableCell>
                        <TableCell className="font-bold text-orange-600">₦{t.payout.toLocaleString()}</TableCell>
                        <TableCell className="text-emerald-600 font-semibold">
                          {(t.weight * (co2Factors[t.materialType as WasteType] || 0.5)).toFixed(2)} kg
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{new Date(t.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-orange-600">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16 text-slate-400">
                          <History className="w-12 h-12 mx-auto mb-2 opacity-10" />
                          <p>No intake transactions logged today.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};