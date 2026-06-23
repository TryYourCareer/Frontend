import { useState } from "react";
import Hero from "../components/Hero";
import careersData from "../data/clearcareers_data.json";

export default function Landing({
  onStartDiscovery,
  onOpenAssessment,
  onOpenCareerReality,
  onOpenInsightsFeed,
  onOpenCareerHubs,
  onOpenStudentDashboard,
  onExploreCareers,
  onOpenAuth,
  profile,
  user,
  onLogout,
  theme = "light",
  onToggleTheme,
  searchQuery = "",
  onSearchChange,
}) {
  const [careers] = useState(
    (careersData || [])
      .map((item) => ({
        title: item["Career Name"] || "",
        cluster: item.Cluster || "",
      }))
      .filter((career) => career.title && career.cluster)
  );
  const isDark = theme === "dark";

  return (
    <div className={`min-h-full transition-colors duration-300 ${isDark ? "bg-[#0f172a]" : "bg-[#f1f5f9]"}`}>
      {/* Main content — no more inline sidebar or Navbar, handled by AppLayout */}
      <Hero
        onStartDiscovery={onStartDiscovery}
        onExploreCareers={onExploreCareers}
        careersCount={careers.length}
        isDark={isDark}
      />
    </div>
  );
}
