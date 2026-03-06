import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import IslandMap from "./pages/IslandMap";
import Chapter from "./pages/Chapter";
import Games from "./pages/Games";
import GamePlay from "./pages/GamePlay";
import MyIsland from "./pages/MyIsland";
import ParentDashboard from "./pages/ParentDashboard";
import OnboardingIntro from "./pages/OnboardingIntro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, childProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-island-sky to-island-water flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-breathe mb-4">🏝️</div>
          <p className="font-display text-xl text-foreground">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!childProfile) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, childProfile, loading } = useAuth();
  if (loading) return null;
  if (user && childProfile) return <Navigate to="/map" replace />;
  if (user && !childProfile) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/intro" element={<ProtectedRoute><OnboardingIntro /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><IslandMap /></ProtectedRoute>} />
            <Route path="/chapter/:id" element={<ProtectedRoute><Chapter /></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
            <Route path="/game/:gameId" element={<ProtectedRoute><GamePlay /></ProtectedRoute>} />
            <Route path="/my-island" element={<ProtectedRoute><MyIsland /></ProtectedRoute>} />
            <Route path="/parent" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/map" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
