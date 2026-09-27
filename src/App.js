import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./components/Login";
import AppLayout from "./components/AppLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import careersData from "./data/clearcareers_data.json";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import CookieConsent from "./components/CookieConsent";

// Code-split heavy pages to eliminate initial bundle latency
const Registration = lazy(() => import("./pages/Registration"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const Assessment = lazy(() => import("./pages/Assessment"));
const DiscoveryTest = lazy(() => import("./pages/DiscoveryTest"));
const Profile = lazy(() => import("./pages/Profile"));
const ExploreCareers = lazy(() => import("./pages/ExploreCareers"));
const CareerHub = lazy(() => import("./pages/CareerHub"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const CareerRealityV2 = lazy(() => import("./pages/CareerRealityV2"));
const InsightsFeed = lazy(() => import("./pages/InsightsFeed"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const CareerSearch = lazy(() => import("./pages/CareerSearch"));
const CareerDetails = lazy(() => import("./pages/CareerDetails"));
const TrialMission = lazy(() => import("./pages/TrialMission"));
const StrideStage = lazy(() => import("./pages/StrideStage"));
const CompanyInfo = lazy(() => import("./pages/CompanyInfo"));
const SupportInfo = lazy(() => import("./pages/SupportInfo"));
const CareerReport = lazy(() => import("./pages/CareerReport"));
const CareerIntelligence = lazy(() => import("./pages/CareerIntelligence"));
const CareerDecision = lazy(() => import("./pages/CareerDecision"));
const DecisionReport = lazy(() => import("./pages/DecisionReport"));
const ParentReport = lazy(() => import("./pages/ParentReport"));
const SharedParentReport = lazy(() => import("./pages/SharedParentReport"));
const ReportsHub = lazy(() => import("./pages/ReportsHub"));

function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-[#EFF6FF] flex flex-col">
      {/* Nav skeleton */}
      <div className="h-14 bg-white/80 backdrop-blur-md border-b border-[#DBEAFE] flex items-center px-6 gap-4 animate-pulse">
        <div className="h-7 w-28 rounded-lg bg-gradient-to-r from-blue-200 to-indigo-200" />
        <div className="flex-1" />
        <div className="h-7 w-20 rounded-full bg-[#DBEAFE]" />
      </div>
      {/* Hero skeleton */}
      <div className="max-w-4xl mx-auto w-full px-6 py-12 flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-2/3 rounded-xl bg-gradient-to-r from-blue-200 via-sky-200 to-indigo-200" />
        <div className="h-5 w-1/2 rounded-lg bg-blue-100" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="h-32 rounded-2xl bg-white border border-[#DBEAFE] shadow-sm p-4 flex flex-col justify-between">
            <div className="h-4 w-3/4 rounded bg-blue-100" />
            <div className="h-3 w-1/2 rounded bg-sky-50" />
            <div className="h-6 w-16 rounded-full bg-blue-50 border border-blue-100" />
          </div>
          <div className="h-32 rounded-2xl bg-white border border-[#DBEAFE] shadow-sm p-4 flex flex-col justify-between">
            <div className="h-4 w-3/4 rounded bg-blue-100" />
            <div className="h-3 w-1/2 rounded bg-sky-50" />
            <div className="h-6 w-16 rounded-full bg-blue-50 border border-blue-100" />
          </div>
          <div className="h-32 rounded-2xl bg-white border border-[#DBEAFE] shadow-sm p-4 flex flex-col justify-between">
            <div className="h-4 w-3/4 rounded bg-blue-100" />
            <div className="h-3 w-1/2 rounded bg-sky-50" />
            <div className="h-6 w-16 rounded-full bg-blue-50 border border-blue-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requireRegistration = false }) {
  const { loading, token, isRegistered } = useAuth();
  if (loading) return <AppLoadingSkeleton />;
  if (!token) return <Navigate to="/" replace />;
  if (requireRegistration && !isRegistered) return <Navigate to="/" replace />;
  return children;
}

function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, setIsLoginOpen } = useAuth();
  const theme = "light";
  const [careerSearchQuery, setCareerSearchQuery] = useState("");

  const activePage = useMemo(() => {
    const path = location.pathname;
    if (path === "/dashboard") return "student-dashboard";
    if (path === "/assessment") return "assessment";
    if (path === "/career-reality") return "career-reality";
    if (path === "/insights-feed") return "insights-feed";
    if (path === "/career-hubs") return "career-hubs";
    if (path === "/roadmap") return "roadmap";
    if (path.startsWith("/career-details")) return "career-reality";
    if (path.startsWith("/career-search")) return "career-reality";
    if (path === "/trial-mission") return "trial-mission";
    if (path.startsWith("/career-intelligence")) return "career-intelligence";
    if (path === "/career-decision") return "career-decision";
    if (path === "/reports" || path === "/reports/") return "reports";
    if (path.startsWith("/careers/") && (path.includes("/decision-report") || path.includes("/parent-report"))) return "career-decision";
    return "landing";
  }, [location.pathname]);

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
      "trial-mission": "/trial-mission",
      "career-intelligence": "/career-intelligence",
      "career-decision": "/career-decision",
      reports: "/reports",
      "report-engine": "/reports",
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
        activePage={activePage}
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
  const navigate = useNavigate();

  useEffect(() => {
    // If Supabase redirects directly to root "/" with tokens or code, forward to /oauth/callback
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    if (
      (hash && (hash.includes("access_token=") || hash.includes("error="))) ||
      (search && (search.includes("code=") || search.includes("error=")))
    ) {
      if (window.location.pathname !== "/oauth/callback") {
        navigate(`/oauth/callback${search}${hash}`, { replace: true });
      }
    }
  }, [navigate]);

  return (
    <>
      <Suspense fallback={<AppLoadingSkeleton />}>
        <Routes>
          <Route path="/" element={<Landing onStartDiscovery={() => setIsLoginOpen(true)} onExploreCareers={() => navigate("/explore-careers")} onOpenAuth={() => setIsLoginOpen(true)} theme="light" />} />
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
          <Route path="/explore-careers" element={<ExploreCareers />} />
          <Route path="/roadmap" element={<AppShell><Roadmap /></AppShell>} />
          <Route path="/career-search" element={<AppShell><CareerSearch /></AppShell>} />
          <Route path="/career-details/:careerName" element={<AppShell><CareerDetails /></AppShell>} />
          <Route path="/career-report/:sessionId" element={<ProtectedRoute requireRegistration><AppShell><CareerReport /></AppShell></ProtectedRoute>} />
          <Route path="/trial-mission" element={<ProtectedRoute><AppShell><TrialMission /></AppShell></ProtectedRoute>} />
          <Route path="/career-intelligence" element={<ProtectedRoute><AppShell><CareerIntelligence /></AppShell></ProtectedRoute>} />
          <Route path="/career-intelligence/family/:familyKey" element={<ProtectedRoute><AppShell><CareerIntelligence /></AppShell></ProtectedRoute>} />
          <Route path="/career-intelligence/career/:careerSlug" element={<ProtectedRoute><AppShell><CareerIntelligence /></AppShell></ProtectedRoute>} />
          <Route path="/career-decision" element={<ProtectedRoute><AppShell><CareerDecision /></AppShell></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute requireRegistration><AppShell><ReportsHub /></AppShell></ProtectedRoute>} />
          <Route path="/careers/:careerId/report" element={<ProtectedRoute requireRegistration><AppShell><DecisionReport /></AppShell></ProtectedRoute>} />
          <Route path="/careers/:careerId/decision-report" element={<ProtectedRoute requireRegistration><AppShell><DecisionReport /></AppShell></ProtectedRoute>} />
          <Route path="/careers/:careerId/parent-report" element={<ProtectedRoute requireRegistration><AppShell><ParentReport /></AppShell></ProtectedRoute>} />
          <Route path="/reports/shared/:token" element={<SharedParentReport />} />
          <Route path="/shared/parent/:token" element={<SharedParentReport />} />
          <Route path="/shared/:token" element={<SharedParentReport />} />
          <Route path="/stride-journey/:stageId" element={<AppShell><StrideStage /></AppShell>} />
          <Route path="/company/:tabId" element={<CompanyInfo />} />
          <Route path="/support/:tabId" element={<SupportInfo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Login modal overlay */}
      {isLoginOpen && <Login onBack={() => setIsLoginOpen(false)} />}

      {/* Registration modal overlay — shown only after auth resolves and user is not registered */}
      {!loading && token && !isRegistered && (
        <Suspense fallback={null}>
          <Registration />
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <CookieConsent />
          <SpeedInsights />
          <Analytics />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
