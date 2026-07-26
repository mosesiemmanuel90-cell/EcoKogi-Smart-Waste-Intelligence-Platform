import React, { useState, useEffect } from 'react';
import { EcoKogiProvider, useEcoKogiStore } from './store/eco-store';
import { MobileApp } from './apps/MobileApp';
import { GovPortal } from './apps/GovPortal';
import { RecyclePortal } from './apps/RecyclePortal';
import { AuthScreen } from './apps/AuthScreen';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { Building2, Leaf, Recycle, Smartphone, LogIn } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';

type PortalType = 'landing' | 'auth' | 'about' | 'contact' | 'privacy' | 'terms' | 'faq' | 'mobile' | 'government' | 'recycling' | 'not-found';

function AppContent() {
  const [activePortal, setActivePortal] = useState<PortalType>('landing');
  const { session, profile, loading, initialized, signOut } = useEcoKogiStore();

  // Register the setter for external navigation
  React.useEffect(() => {
    _setActivePortal = setActivePortal;
    return () => { _setActivePortal = null; };
  }, []);

  // Auto-route to the correct portal based on user role when profile loads
  useEffect(() => {
    if (session && profile?.role) {
      switch (profile.role) {
        case 'citizen':
          setActivePortal('mobile');
          break;
        case 'government':
        case 'admin':
          setActivePortal('government');
          break;
        case 'vendor':
          setActivePortal('recycling');
          break;
        default:
          setActivePortal('landing');
      }
    }
  }, [session, profile?.role]);

  // Redirect away from auth screen once a session/profile is available
  useEffect(() => {
    if (activePortal === 'auth' && session && profile?.role) {
      switch (profile.role) {
        case 'citizen':
          setActivePortal('mobile');
          break;
        case 'government':
        case 'admin':
          setActivePortal('government');
          break;
        case 'vendor':
          setActivePortal('recycling');
          break;
        default:
          setActivePortal('landing');
      }
    }
  }, [activePortal, session, profile?.role]);

  // When session clears (logout), always return to landing
  useEffect(() => {
    if (!session && initialized) {
      setActivePortal('landing');
    }
  }, [session, initialized]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading EcoKogi...</p>
        </div>
      </div>
    );
  }

  // Show AuthScreen when user explicitly navigated to it, or when
  // session is null AND the user is not already looking at the landing page
  if (activePortal === 'auth') {
    return <AuthScreen onBack={() => setActivePortal('landing')} />;
  }

  // 404 Not Found page
  if (activePortal === 'not-found') {
    return (
      <NotFound
        onGoHome={() => setActivePortal('landing')}
        onBack={() => setActivePortal('landing')}
      />
    );
  }

  // About EcoKogi page
  if (activePortal === 'about') {
    return <About onBack={() => setActivePortal('landing')} />;
  }

  // Contact page
  if (activePortal === 'contact') {
    return <Contact onBack={() => setActivePortal('landing')} />;
  }

  // Privacy page
  if (activePortal === 'privacy') {
    return <Privacy onBack={() => setActivePortal('landing')} />;
  }

  // Terms page
  if (activePortal === 'terms') {
    return <Terms onBack={() => setActivePortal('landing')} />;
  }

  // FAQ page
  if (activePortal === 'faq') {
    return <FAQ onBack={() => setActivePortal('landing')} />;
  }

  // Landing Page: shown when no session (public) or when no auto-route has happened
  if (activePortal === 'landing') {
    const role = profile?.role;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-8">
        {/* Hero banner with custom generated background and green overlay */}
        <div
          className="relative w-full max-w-5xl h-64 sm:h-80 rounded-3xl overflow-hidden shadow-xl bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://storage.googleapis.com/dala-prod-public-storage/generated-images/4053c4e1-84c6-4549-82f9-1b97af48d950/ecokogi-hero-banner-4d1c8e37-1784694372713.webp)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/70 via-green-900/60 to-transparent" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl drop-shadow-lg">
              EcoKogi
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl drop-shadow-md">
              Transforming Waste into Wealth for Kogi State. A comprehensive waste management and recycling ecosystem.
            </p>
          </div>
        </div>

        {/* Simple top nav bar */}
        <nav className="w-full max-w-5xl flex items-center justify-between px-2">
          <span className="text-lg font-bold text-slate-800 tracking-tight">EcoKogi</span>
          <button
            onClick={() => setActivePortal('about')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Leaf className="w-4 h-4" />
            About EcoKogi
          </button>
        </nav>

        {/* Show sign-in button when user is not logged in */}
        {!session && (
          <div className="text-center">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-lg px-10 py-6 rounded-xl"
              onClick={() => setActivePortal('auth')}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In to Get Started
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${role && role !== 'citizen' ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500'}`} onClick={() => { if (!role || role === 'citizen') setActivePortal('mobile'); }}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-emerald-100 p-3 rounded-xl mb-2">
                <Smartphone className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle>Citizen App</CardTitle>
              <CardDescription>Report waste, earn points, and save Kogi State.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button variant="outline" className={`w-full border-emerald-200 ${role && role !== 'citizen' ? 'text-slate-400' : 'text-emerald-700 hover:bg-emerald-50'}`}>{role && role !== 'citizen' ? 'Access Denied' : 'Launch App'}</Button>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${role && role !== 'government' && role !== 'admin' ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}`} onClick={() => { if (role === 'government' || role === 'admin') setActivePortal('government'); }}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-xl mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Gov Portal</CardTitle>
              <CardDescription>Manage collection fleets and monitor waste hotspots.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button variant="outline" className={`w-full border-blue-200 ${role && role !== 'government' && role !== 'admin' ? 'text-slate-400' : 'text-blue-700 hover:bg-blue-50'}`}>{role && role !== 'government' && role !== 'admin' ? 'Access Denied' : 'Admin Dashboard'}</Button>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${role && role !== 'vendor' ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-500'}`} onClick={() => { if (role === 'vendor') setActivePortal('recycling'); }}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-orange-100 p-3 rounded-xl mb-2">
                <Recycle className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle>Recycling Portal</CardTitle>
              <CardDescription>Vendor intake, payouts, and material processing.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button variant="outline" className={`w-full border-orange-200 ${role && role !== 'vendor' ? 'text-slate-400' : 'text-orange-700 hover:bg-orange-50'}`}>{role && role !== 'vendor' ? 'Access Denied' : 'Vendor Access'}</Button>
            </CardContent>
          </Card>
        </div>

        {session && (
          <div className="flex items-center space-x-4 mt-4">
            <span className="text-sm text-slate-500">Signed in as {profile?.full_name || profile?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        )}

        <footer className="text-slate-400 text-sm mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <button onClick={() => setActivePortal('contact')} className="hover:text-emerald-600 transition-colors">Contact</button>
          <button onClick={() => setActivePortal('privacy')} className="hover:text-emerald-600 transition-colors">Privacy</button>
          <button onClick={() => setActivePortal('terms')} className="hover:text-emerald-600 transition-colors">Terms</button>
          <button onClick={() => setActivePortal('faq')} className="hover:text-emerald-600 transition-colors">FAQ</button>
          <span className="text-slate-300">&middot;</span>
          <span>&copy; 2024 EcoKogi Waste Management Authority. Built for the Confluence State.</span>
        </footer>
      </div>
    );
  }

  // Role-based portal rendering
  const renderPortal = () => {
    switch (activePortal) {
      case 'mobile':
        return <MobileApp onBack={() => setActivePortal('landing')} />;
      case 'government':
        return <GovPortal onBack={() => setActivePortal('landing')} />;
      case 'recycling':
        return <RecyclePortal onBack={() => setActivePortal('landing')} />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderPortal()}
      <Toaster position="top-center" />
    </>
  );
}

// Expose setActivePortal for external 404 navigation
// This can be called from anywhere: setActivePortal('not-found')
let _setActivePortal: React.Dispatch<React.SetStateAction<PortalType>> | null = null;

export function navigateToNotFound() {
  _setActivePortal?.('not-found');
}

function App() {
  return (
    <EcoKogiProvider>
      <ErrorBoundary onGoHome={() => {}}>
        <AppContent />
      </ErrorBoundary>
    </EcoKogiProvider>
  );
}

export default App;