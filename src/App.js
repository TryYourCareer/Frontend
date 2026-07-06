import { useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./components/Login";
import Registration from "./pages/Registration";
import OAuthCallback from "./pages/OAuthCallback";
import Assessment from "./pages/Assessment";
import Profile from "./pages/Profile";
import ExploreCareers from "./pages/ExploreCareers";
import CareerHub from "./pages/CareerHub";
import StudentDashboard from "./pages/StudentDashboard";
import CareerRealityV2 from "./pages/CareerRealityV2";
import InsightsFeed from "./pages/InsightsFeed";
import AppLayout from "./components/AppLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import careersData from "./data/clearcareers_data.json";

const THEME_STORAGE_KEY = "clear-careers-theme";

function ProtectedRoute({ children, requireRegistration = false }) {
  const { loading, token, isRegistered } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-slate-600">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  if (requireRegistration && !isRegistered) return <Navigate to="/register" replace />;
  return children;
}

function AppShell({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || "light");
  const [careerSearchQuery, setCareerSearchQuery] = useState("");

  const careers = useMemo(
    () => (careersData || []).map((item) => ({ title: item["Career Name"] || "", cluster: item.Cluster || "" })).filter((career) => career.title && career.cluster),
    []
  );

  const clusterResults = useMemo(() => {
    const query = String(careerSearchQuery || "").trim().toLowerCase();
    if (!query) return [];
    return [...new Set(careers.map((career) => career.cluster).filter(Boolean))].filter((cluster) => cluster.toLowerCase().includes(query)).slice(0, 8);
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
    };
    navigate(map[action] || "/");
  };

  const isDark = theme === "dark";
  return (
    <div className={`cc-app-layout min-h-screen ${isDark ? "bg-[#0f172a]" : "bg-[#f1f5f9]"}`}>
      <AppLayout
        activePage="landing"
        onNavigate={handleNavigate}
        user={user}
        onOpenProfile={() => navigate("/profile")}
        onOpenAuth={() => navigate("/login")}
        onLogout={logout}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
        searchQuery={careerSearchQuery}
        onSearchChange={setCareerSearchQuery}
        onSearchSubmit={() => navigate("/explore-careers")}
        clusterResults={clusterResults}
        onSelectCluster={(clusterName) => {
          setCareerSearchQuery(clusterName);
          navigate("/explore-careers");
        }}
      >
        {children}
      </AppLayout>
    </div>
  );
}

function AppRoutes() {
  const { token, isRegistered, profile } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<AppShell><Landing onStartDiscovery={() => {}} onOpenAuth={() => {}} theme="light" /></AppShell>} />
      <Route path="/login" element={<Login onBack={() => window.history.back()} />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/register" element={<ProtectedRoute><Registration /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppShell><Profile profile={profile} /></AppShell></ProtectedRoute>} />
      <Route path="/assessment" element={<ProtectedRoute requireRegistration><AppShell><Assessment user={profile} /></AppShell></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute requireRegistration><AppShell><StudentDashboard /></AppShell></ProtectedRoute>} />
      <Route path="/career-reality" element={<ProtectedRoute><AppShell><CareerRealityV2 /></AppShell></ProtectedRoute>} />
      <Route path="/insights-feed" element={<ProtectedRoute><AppShell><InsightsFeed /></AppShell></ProtectedRoute>} />
      <Route path="/career-hubs" element={<ProtectedRoute><AppShell><CareerHub /></AppShell></ProtectedRoute>} />
      <Route path="/explore-careers" element={<ProtectedRoute><AppShell><ExploreCareers /></AppShell></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={token ? (isRegistered ? "/dashboard" : "/register") : "/login"} replace />} />
    </Routes>
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
