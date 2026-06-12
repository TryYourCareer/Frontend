import { useMemo, useState } from "react";
import { Moon, Sun, Home, UserPlus, ClipboardList, Compass, Newspaper, Users, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import careersData from "../data/clearcareers_data.json";

const SIDE_MENU = [
  { label: "Landing Page", icon: Home, action: "home" },
  { label: "Onboarding", icon: UserPlus, action: "onboarding" },
  { label: "Assessment", icon: ClipboardList, action: "assessment" },
  { label: "Career Reality", icon: Compass, action: "career-reality" },
  { label: "Insights Feed", icon: Newspaper, action: "insights-feed" },
  { label: "Career Hubs", icon: Users, action: "career-hubs" },
  { label: "Student Dashboard", icon: LayoutDashboard, action: "student-dashboard" },
];

export default function Landing({ onStartDiscovery, onOpenAssessment, onOpenCareerReality, onOpenInsightsFeed, onOpenCareerHubs, onOpenStudentDashboard, onExploreCareers, onOpenAuth, profile, user, onLogout, theme = "light", onToggleTheme, searchQuery = "", onSearchChange }) {
  const [careers] = useState(
    (careersData || [])
      .map((item) => ({
        title: item["Career Name"] || "",
        cluster: item.Cluster || "",
      }))
      .filter((career) => career.title && career.cluster)
  );
  const isDark = theme === "dark";

  const clusterResults = useMemo(() => {
    const query = String(searchQuery || "").trim().toLowerCase();
    if (!query) return [];
    const clusters = [...new Set(careers.map((career) => String(career.cluster || "").trim()).filter(Boolean))];
    return clusters.filter((cluster) => cluster.toLowerCase().includes(query)).slice(0, 8);
  }, [careers, searchQuery]);

  const handleSearchSubmit = () => onExploreCareers?.(searchQuery);
  const handleSelectCluster = (clusterName) => {
    onSearchChange?.(clusterName);
    onExploreCareers?.(clusterName);
  };

  const handleNavAction = (action) => {
    if (action === "onboarding") onStartDiscovery?.();
    else if (action === "assessment") onOpenAssessment?.();
    else if (action === "career-reality") onOpenCareerReality?.();
    else if (action === "insights-feed") onOpenInsightsFeed?.();
    else if (action === "career-hubs") onOpenCareerHubs?.();
    else if (action === "student-dashboard") onOpenStudentDashboard?.();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#dfe7f4]"}`}>
      <div className="mx-auto max-w-[1480px] lg:flex">

        {/* Sidebar — desktop only */}
        <aside className={`hidden lg:flex lg:w-[240px] lg:min-h-screen lg:flex-col lg:border-r ${isDark ? "lg:border-slate-700/60 lg:bg-slate-900" : "lg:border-[#cfd6e5] lg:bg-[#edf2fa]"}`}>

          {/* Logo + theme toggle */}
          <div className={`flex items-center justify-between px-5 pt-5 pb-4 border-b ${isDark ? "border-slate-800" : "border-[#d9e2f0]"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-md">C</div>
              <div>
                <p className={`cc-display text-sm font-black tracking-tight leading-none ${isDark ? "text-slate-100" : "text-[#0f1c3d]"}`}>Clear Careers</p>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-[#7089b5]"}`}>Career Discovery</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className={`rounded-full border p-1.5 transition ${isDark ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-[#c5d3eb] bg-[#f4f7fc] text-[#4a5f86] hover:bg-[#e2ecf9]"}`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>

          {/* Nav links */}
          <div className="flex-1 px-3 py-4 overflow-y-auto">
            <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-500" : "text-[#9aadca]"}`}>Navigation</p>
            {SIDE_MENU.map(({ label, icon: Icon, action }) => (
              <button
                key={action}
                onClick={() => handleNavAction(action)}
                className={`cc-body mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold leading-none transition ${isDark ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-[#4e607f] hover:bg-[#e4ebf8] hover:text-[#1a3669]"}`}
              >
                <Icon size={16} className={isDark ? "text-cyan-500" : "text-[#3a6bcf]"} />
                {label}
              </button>
            ))}
          </div>

          {/* User section */}
          <div className={`mt-auto p-4 border-t ${isDark ? "border-slate-800" : "border-[#d9e2f0]"}`}>
            {user ? (
              <div className={`rounded-2xl border p-3.5 ${isDark ? "border-slate-700 bg-slate-800" : "bg-blue-50 border-blue-100"}`}>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shrink-0">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`cc-display text-sm font-extrabold truncate ${isDark ? "text-slate-100" : "text-[#1f2d4f]"}`}>{user.email.split("@")[0]}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 cc-pulse-dot" />
                      <p className={`cc-body text-xs ${isDark ? "text-slate-400" : "text-[#7082a5]"}`}>Logged In</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className={`rounded-2xl border border-dashed p-3.5 ${isDark ? "border-slate-700 bg-slate-800/50" : "border-[#c9d6ec] bg-[#eaf0f9]"}`}>
                <p className={`cc-display text-xs font-bold ${isDark ? "text-slate-300" : "text-[#4a5f86]"}`}>Not logged in yet?</p>
                <p className={`cc-body mt-1 text-[11px] ${isDark ? "text-slate-500" : "text-[#6f82a7]"}`}>Log in to track your progress and save your preferences.</p>
                <button
                  onClick={onOpenAuth}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  <LogIn size={12} />
                  Sign In
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Navbar
            onStartDiscovery={onStartDiscovery}
            onOpenAssessment={onOpenAssessment}
            onOpenCareerReality={onOpenCareerReality}
            onOpenInsightsFeed={onOpenInsightsFeed}
            onOpenCareerHubs={onOpenCareerHubs}
            onOpenStudentDashboard={onOpenStudentDashboard}
            user={user}
            onOpenAuth={onOpenAuth}
            onLogout={onLogout}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSearchSubmit={handleSearchSubmit}
            clusterResults={clusterResults}
            onSelectCluster={handleSelectCluster}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
          <Hero onStartDiscovery={onStartDiscovery} onExploreCareers={onExploreCareers} careersCount={careers.length} isDark={isDark} />
        </main>
      </div>
    </div>
  );
}