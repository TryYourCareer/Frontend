import { useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import careersData from "../data/clearcareers_data.json";

const SIDE_MENU = [
  "1. Assessment",
  "2. Career Reality",
  "3. Insights Feed",
  "4. Trial Mission",
  "5. Career Hubs",
  "6. Student Dashboard",
  "7. Decision Report",
  "8. Parent Report",
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
    if (!query) {
      return [];
    }

    const clusters = [...new Set(careers.map((career) => String(career.cluster || "").trim()).filter(Boolean))];
    return clusters
      .filter((cluster) => cluster.toLowerCase().includes(query))
      .slice(0, 8);
  }, [careers, searchQuery]);

  const handleSearchSubmit = () => {
    onExploreCareers?.(searchQuery);
  };

  const handleSelectCluster = (clusterName) => {
    onSearchChange?.(clusterName);
    onExploreCareers?.(clusterName);
  };

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-[linear-gradient(to_bottom,_#111827_0,_#111827_55vh,_#0f172a_100%)]"
          : "bg-[linear-gradient(to_bottom,_#f7fbff_0,_#eef6ff_62vh,_#ffffff_100%)]"
      }`}
    >
      <div className="mx-auto max-w-[1480px] lg:flex">
        <aside
          className={`hidden lg:flex lg:w-[230px] lg:min-h-screen lg:flex-col lg:border-r ${
            isDark ? "lg:border-slate-700 lg:bg-slate-900" : "lg:border-slate-200 lg:bg-white/90"
          }`}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#3164de] text-xs text-white">
                C
              </div>
              <div>
                <p className={`cc-display text-base leading-none font-black tracking-[-0.015em] ${isDark ? "text-slate-100" : "text-[#0f1c3d]"}`}>Clear Careers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "border-[#c5d3eb] bg-[#f4f7fc] text-[#4a5f86] hover:bg-[#e9eff9]"
              }`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={13} /> : <Sun size={13} />}
              <span>{theme === "light" ? "Dark" : "Light"}</span>
            </button>
          </div>

          <div className="px-4 pb-5">
            <div className="max-h-[66vh] overflow-y-auto pr-2">
              {SIDE_MENU.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item.includes("Assessment")) {
                      onOpenAssessment?.();
                      return;
                    }
                    if (item.includes("Career Reality")) {
                      onOpenCareerReality?.();
                      return;
                    }
                    if (item.includes("Insights Feed")) {
                      onOpenInsightsFeed?.();
                      return;
                    }
                    if (item.includes("Career Hubs")) {
                      onOpenCareerHubs?.();
                      return;
                    }
                    if (item.includes("Student Dashboard")) {
                      onOpenStudentDashboard?.();
                      return;
                    }
                  }}
                  className="cc-body mb-1.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold leading-none text-[#4e607f] hover:bg-[#e4ebf8]"
                >
                  <span className="text-base">⌂</span>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4">
            {user ? (
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="cc-display text-sm font-extrabold text-[#1f2d4f]">
                      {user.email.split("@")[0]}
                    </p>
                    <p className="cc-body text-xs text-[#7082a5]">Logged In</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="mt-3 w-full text-xs font-semibold text-red-600 hover:text-red-700 transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#c9d6ec] bg-[#eaf0f9] p-3.5">
                <p className="cc-display text-xs font-bold text-[#4a5f86]">Not logged in yet?</p>
                <p className="cc-body mt-1 text-[11px] text-[#6f82a7]">Log in to track your progress and save your preferences.</p>
                <button
                  onClick={onOpenAuth}
                  className="mt-3 w-full rounded-lg bg-blue-100 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition py-2"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1">
          <Navbar
            onStartDiscovery={onStartDiscovery}
            user={user}
            onOpenAuth={onOpenAuth}
            onLogout={onLogout}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSearchSubmit={handleSearchSubmit}
            clusterResults={clusterResults}
            onSelectCluster={handleSelectCluster}
          />
          <Hero onStartDiscovery={onStartDiscovery} onExploreCareers={onExploreCareers} careersCount={careers.length} theme={theme} />
        </main>
      </div>
    </div>
  );
}