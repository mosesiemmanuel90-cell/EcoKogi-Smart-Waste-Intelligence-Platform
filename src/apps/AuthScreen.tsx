import React, { useState } from 'react';
import { useEcoKogiStore } from '../store/eco-store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Leaf, Mail, Lock, User, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AuthScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useEcoKogiStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || 'Failed to sign in');
        } else {
          toast.success('Welcome back!');
          // Let App.tsx route to the correct portal via session/profile state
          onBack?.();
        }
      } else {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          return;
        }
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          toast.error(error.message || 'Failed to sign up');
        } else {
          toast.success('Account created! Please check your email to verify.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back to Landing */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Landing
          </button>
        )}

        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">EcoKogi</h1>
          <p className="text-slate-600">Transforming Waste into Wealth for Kogi State</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Sign in to your EcoKogi account' : 'Join the waste management revolution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      className="pl-10 h-12"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">I am a...</label>
                  <select
                    className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="citizen">Citizen</option>
                    <option value="government">Government Official</option>
                    <option value="vendor">Recycling Vendor</option>
                  </select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-lg font-bold"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                    Please wait...
                  </span>
                ) : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-400">
          <p>© 2024 EcoKogi Waste Management Authority</p>
          <p className="mt-1">Built for the Confluence State</p>
        </div>
      </div>
    </div>
  );
};