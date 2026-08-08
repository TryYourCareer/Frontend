import { useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./components/Login";
import Registration from "./pages/Registration";
import OAuthCallback from "./pages/OAuthCallback";
import Assessment from "./pages/Assessment";
import DiscoveryTest from "./pages/DiscoveryTest";
import Profile from "./pages/Profile";
import ExploreCareers from "./pages/ExploreCareers";
import CareerHub from "./pages/CareerHub";
import StudentDashboard from "./pages/StudentDashboard";
import CareerRealityV2 from "./pages/CareerRealityV2";
import InsightsFeed from "./pages/InsightsFeed";
import AppLayout from "./components/AppLayout";
import Roadmap from "./pages/Roadmap";
import CareerSearch from "./pages/CareerSearch";
import CareerDetails from "./pages/CareerDetails";


import { AuthProvider, useAuth } from "./contexts/AuthContext";
import careersData from "./data/clearcareers_data.json";



function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF6EC] flex flex-col">
      {/* Nav skeleton */}
      <div className="h-14 bg-white border-b border-[#e2d9c8] flex items-center px-6 gap-4 animate-pulse">
        <div className="h-7 w-28 rounded-lg bg-[#e8dfc8]" />
        <div className="flex-1" />
        <div className="h-7 w-20 rounded-full bg-[#e8dfc8]" />
        <div className="h-7 w-7 rounded-full bg-[#e8dfc8]" />
      </div>
      {/* Content skeleton */}
      <div className="flex-1 px-6 py-10 mx-auto w-full max-w-6xl space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-full bg-[#e8dfc8]" />
          <div className="h-8 w-64 rounded-xl bg-[#e8dfc8]" />
          <div className="h-3 w-80 rounded-full bg-[#e8dfc8]" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#f0e9d8] border border-[#e8dfc8]" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="h-44 rounded-2xl bg-[#f0e9d8] border border-[#e8dfc8]" />
          <div className="h-44 rounded-2xl bg-[#f0e9d8] border border-[#e8dfc8]" />
        </div>
        <div className="h-48 rounded-2xl bg-[#f0e9d8] border border-[#e8dfc8]" />
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requireRegistration = false }) {
  const { loading, token, isRegistered } = useAuth();
  if (loading) return <AppLoadingSkeleton />;
  if (!token) return <Navigate to="/login" replace />;
  if (requireRegistration && !isRegistered) return <Navigate to="/" replace />;
  return children;
}

function AppShell({ children }) {
  const navigate = useNavigate();
  const { user, logout, setIsLoginOpen } = useAuth();
  const theme = "light";
  const [careerSearchQuery, setCareerSearchQuery] = useState("");

  const careers = useMemo(
    () => (careersData || []).map((item) => ({ title: item["Career Name"] || "", cluster: item.Cluster || "" })).filter((career) => career.title && career.cluster),
    []
  );

  // Filter careers by title match — returns career names for the dropdown
  const clusterResults = useMemo(() => {
    const query = String(careerSearchQuery || "").trim().toLowerCase();
    if (!query) return [];
    return careers
      .filter((career) => career.title.toLowerCase().includes(query))
      .map((career) => career.title)
      .slice(0, 8);
  }, [careers, careerSearchQuery]);


  const handleNavigate = (action) => {
    const map = {
      landing: "/",
      login: "/login",
      assessment: "/assessment",
      "career-reality": "/career-reality",
      "insights-feed": "/insights-feed",
      "career-hubs": "/career-hubs",
      "student-dashboard": "/dashboard",
      onboarding: "/register",
      profile: "/profile",
      roadmap: "/roadmap",
    };
    if (action === "login") {
      setIsLoginOpen(true);
    } else {
      navigate(map[action] || "/");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isDark = theme === "dark";
  return (
    <div className={`cc-app-layout min-h-screen ${isDark ? "bg-[#0f172a]" : "bg-[#f1f5f9]"}`}>
      <AppLayout
        activePage="landing"
        onNavigate={handleNavigate}
        user={user}
        onOpenProfile={() => navigate("/profile")}
        onOpenAuth={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        searchQuery={careerSearchQuery}
        onSearchChange={setCareerSearchQuery}
        onSearchSubmit={() => {
          const q = careerSearchQuery.trim();
          if (q) {
            navigate(`/career-search?q=${encodeURIComponent(q)}`);
            setCareerSearchQuery("");
          }
        }}
        clusterResults={clusterResults}
        onSelectCluster={(careerName) => {
          navigate(`/career-search?q=${encodeURIComponent(careerName)}`);
          setCareerSearchQuery("");
        }}
      >
        {children}
      </AppLayout>
    </div>
  );
}

function AppRoutes() {
  const { token, isRegistered, loading, profile, isLoginOpen, setIsLoginOpen } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing onStartDiscovery={() => setIsLoginOpen(true)} onOpenAuth={() => setIsLoginOpen(true)} theme="light" />} />
        <Route path="/login" element={<Login onBack={() => window.history.back()} />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        {/* /register now redirects to / — the Registration modal is rendered globally below */}
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/profile" element={<ProtectedRoute><AppShell><Profile profile={profile} /></AppShell></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute requireRegistration><AppShell><Assessment user={profile} /></AppShell></ProtectedRoute>} />
        <Route path="/discovery-test" element={<ProtectedRoute requireRegistration><AppShell><DiscoveryTest /></AppShell></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute requireRegistration><AppShell><StudentDashboard /></AppShell></ProtectedRoute>} />
        <Route path="/career-reality" element={<ProtectedRoute><AppShell><CareerRealityV2 /></AppShell></ProtectedRoute>} />
        <Route path="/insights-feed" element={<ProtectedRoute><AppShell><InsightsFeed /></AppShell></ProtectedRoute>} />
        <Route path="/career-hubs" element={<ProtectedRoute><AppShell><CareerHub /></AppShell></ProtectedRoute>} />
        <Route path="/explore-careers" element={<ProtectedRoute><AppShell><ExploreCareers /></AppShell></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><AppShell><Roadmap /></AppShell></ProtectedRoute>} />
        <Route path="/career-search" element={<ProtectedRoute><AppShell><CareerSearch /></AppShell></ProtectedRoute>} />
        <Route path="/career-details/:careerName" element={<ProtectedRoute><AppShell><CareerDetails /></AppShell></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />


      </Routes>

      {/* Login modal overlay */}
      {isLoginOpen && <Login onBack={() => setIsLoginOpen(false)} />}

      {/* Registration modal overlay — shown only after auth resolves and user is not registered */}
      {!loading && token && !isRegistered && <Registration />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
