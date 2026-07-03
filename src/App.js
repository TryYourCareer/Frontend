import { useEffect, useMemo, useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Assessment from "./pages/Assessment";
import Profile from "./pages/Profile";
import ExploreCareers from "./pages/ExploreCareers";
import CareerHub from "./pages/CareerHub";
import StudentDashboard from "./pages/StudentDashboard";
import CareerRealityV2 from "./pages/CareerRealityV2";
import InsightsFeed from "./pages/InsightsFeed";
import AuthModal from "./components/AuthModal";
import AppLayout from "./components/AppLayout";
import { supabase, isSupabaseConfigured } from "./supabaseConfig";
import careersData from "./data/clearcareers_data.json";

const PROFILE_STORAGE_KEY = "clear-careers-generated-profile";
const THEME_STORAGE_KEY = "clear-careers-theme";

function App() {
  const [step, setStep] = useState("landing");
  const [generatedProfile, setGeneratedProfile] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [careerSearchQuery, setCareerSearchQuery] = useState("");
  const [selectedClusterId, setSelectedClusterId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      try {
        setGeneratedProfile(JSON.parse(saved));
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return () => { };
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Careers data for search autocomplete
  const careers = useMemo(
    () =>
      (careersData || [])
        .map((item) => ({
          title: item["Career Name"] || "",
          cluster: item.Cluster || "",
        }))
        .filter((career) => career.title && career.cluster),
    []
  );

  const clusterResults = useMemo(() => {
    const query = String(careerSearchQuery || "").trim().toLowerCase();
    if (!query) return [];
    const clusters = [
      ...new Set(
        careers
          .map((career) => String(career.cluster || "").trim())
          .filter(Boolean)
      ),
    ];
    return clusters
      .filter((cluster) => cluster.toLowerCase().includes(query))
      .slice(0, 8);
  }, [careers, careerSearchQuery]);

  const handleSearchSubmit = () => {
    setCareerSearchQuery(careerSearchQuery);
    setStep("explore-careers");
  };

  const handleSelectCluster = (clusterName) => {
    setCareerSearchQuery(clusterName);
    setStep("explore-careers");
  };

  // Navigation handler for the sidebar
  const handleNavigate = (action) => {
    if (action === "landing") {
      setStep("landing");
    } else if (action === "login") {
      setStep("login");
    } else if (action === "assessment") {
      setStep("assessment");
    } else if (action === "career-reality") {
      setStep("career-reality");
    } else if (action === "insights-feed") {
      setStep("insights-feed");
    } else if (action === "career-hubs") {
      setStep("career-hubs");
    } else if (action === "student-dashboard") {
      setStep("student-dashboard");
    } else if (action === "onboarding") {
      setStep("onboarding");
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const handleToggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <div>
      <AppLayout
        activePage={step}
        onNavigate={handleNavigate}
        user={user}
        onOpenAuth={() => setShowAuth(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        searchQuery={careerSearchQuery}
        onSearchChange={setCareerSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        clusterResults={clusterResults}
        onSelectCluster={handleSelectCluster}
      >
        {step === "landing" && (
          <Landing
            onStartDiscovery={() => setStep("onboarding")}
            onOpenAssessment={() => setStep("assessment")}
            onOpenCareerReality={() => setStep("career-reality")}
            onOpenInsightsFeed={() => setStep("insights-feed")}
            onOpenCareerHubs={() => setStep("career-hubs")}
            onOpenStudentDashboard={() => setStep("student-dashboard")}
            onExploreCareers={(query = "") => {
              if (typeof query === "string") {
                setCareerSearchQuery(query);
              }
              setStep("explore-careers");
            }}
            onOpenAuth={() => setShowAuth(true)}
            profile={generatedProfile}
            user={user}
            theme={theme}
            searchQuery={careerSearchQuery}
            onSearchChange={setCareerSearchQuery}
            onToggleTheme={handleToggleTheme}
            onLogout={handleLogout}
          />
        )}

        {step === "login" && (
          <Login
            onBack={() => setStep("landing")}
          />
        )}

        {step === "onboarding" && (
          <Onboarding
            onBack={() => setStep("landing")}
            onContinue={(profile) => {
              setGeneratedProfile(profile);
              localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
              setStep("assessment");
            }}
          />
        )}

        {step === "assessment" && (
          <Assessment
            onBack={() => setStep("landing")}
            onOpenCluster={(clusterId) => {
              setSelectedClusterId(clusterId);
              setStep("explore-careers");
            }}
            user={user}
          />
        )}

        {step === "profile" && (
          <Profile
            profile={generatedProfile}
            onRestart={() => {
              setGeneratedProfile(null);
              localStorage.removeItem(PROFILE_STORAGE_KEY);
              setStep("landing");
            }}
          />
        )}

        {step === "career-reality" && (
          <CareerRealityV2 onBack={() => setStep("landing")} />
        )}

        {step === "insights-feed" && (
          <InsightsFeed onBack={() => setStep("landing")} />
        )}

        {step === "career-hubs" && (
          <CareerHub onBack={() => setStep("landing")} />
        )}

        {step === "student-dashboard" && (
          <StudentDashboard onBack={() => setStep("landing")} />
        )}

        {step === "explore-careers" && (
          <ExploreCareers
            onBack={() => setStep("landing")}
            user={user}
            onOpenAuth={() => setShowAuth(true)}
            initialSearch={careerSearchQuery}
            selectedClusterId={selectedClusterId}
            onClusterSelected={() => setSelectedClusterId(null)}
          />
        )}
      </AppLayout>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuthSuccess={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}

export default App;