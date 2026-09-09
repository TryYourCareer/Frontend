import { useState } from "react";
import Hero from "../components/Hero";
import careersData from "../data/clearcareers_data.json";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import SEO from "../components/SEO";

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
  theme = "dark",
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
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${isDark ? "bg-[#0f172a]" : "bg-[#FAF6EC]"}`}>
      <SEO
        title="AI-Powered Career Guidance & Exploration Platform"
        description="Discover your ideal career path with AI-driven assessments, salary insights, interactive industry roadmaps, and real-world career reality checks."
        keywords="career guidance, career discovery, AI career test, job roadmaps, tech careers"
        url="/"
      />
      {/* Separated Sticky Top Navbar */}
      <LandingNavbar
        isDark={isDark}
        onExploreCareers={onExploreCareers}
        onStartDiscovery={onStartDiscovery}
      />

      {/* Main content */}
      <div className="flex-1">
        <Hero
          onStartDiscovery={onStartDiscovery}
          onExploreCareers={onExploreCareers}
          careersCount={careers.length}
          isDark={isDark}
        />
      </div>

      {/* Landing Footer */}
      <LandingFooter isDark={isDark} />
    </div>
  );
}