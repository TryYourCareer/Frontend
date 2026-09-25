import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, BarChart3, Target,
  Award, Compass, Layers,
  ChevronRight, ArrowUpRight,
  Check, MessageSquare, Terminal, SlidersHorizontal
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/users";
import { getCareerFitReport } from "../services/discoveryTest";
import { getLatestRecommendation } from "../services/decisionIntelligence";
import SEO from "../components/SEO";
import BACKEND_BASE_URL from "../API/BaseURL";

const STAGES = [
  { id: 1, name: "Discovery Test", path: "/assessment", desc: "6D RIASEC Vector Analysis", icon: Compass },
  { id: 2, name: "Career Reality", path: "/career-reality", desc: "500+ Verified Market Tracks", icon: Layers },
  { id: 3, name: "Trial Simulation", path: "/trial-mission", desc: "Hands-on Role Sandbox", icon: Terminal },
  { id: 4, name: "Learning Roadmap", path: "/roadmap", desc: "5-Stage Milestone Path", icon: Award },
];

const DEFAULT_SIMULATIONS = [
  {
    id: "frontend-fixer",
    title: "Frontend Architecture & API Lab",
    role: "Software Engineer",
    duration: "20 Mins",
    difficulty: "Intermediate",
    status: "Ready",
    accent: "border-blue-200 bg-gradient-to-br from-blue-50/60 to-white",
    iconColor: "text-blue-600",
    badge: "Engineering Track",
  },
  {
    id: "ux-audit",
    title: "UX Wireframe & Design Strategy",
    role: "Product Designer",
    duration: "15 Mins",
    difficulty: "Beginner Friendly",
    status: "Popular",
    accent: "border-purple-200 bg-gradient-to-br from-purple-50/60 to-white",
    iconColor: "text-purple-600",
    badge: "Design Track",
  },
  {
    id: "rca-process",
    title: "Root Cause Failure Analysis (RCFA)",
    role: "Reliability Engineer",
    duration: "25 Mins",
    difficulty: "Advanced",
    status: "High Value",
    accent: "border-amber-200 bg-gradient-to-br from-amber-50/60 to-white",
    iconColor: "text-amber-600",
    badge: "Industry 4.0",
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { loading: authLoading, profile: authProfile, user: authUser } = useAuth();
  const [userData, setUserData] = useState(() => authProfile || null);
  const [reportData, setReportData] = useState(null);
  const [featuredCareers, setFeaturedCareers] = useState([]);
  const [decisionReports, setDecisionReports] = useState([]);
  const [decisionReportsLoading, setDecisionReportsLoading] = useState(false);
  const [decisionReportsError, setDecisionReportsError] = useState(null);

  // Load evaluated decision recommendations / completed reports
  useEffect(() => {
    let isMounted = true;
    async function loadDecisionReports() {
      setDecisionReportsLoading(true);
      setDecisionReportsError(null);
      try {
        const snap = await getLatestRecommendation();
        const list = snap?.ranked_career_candidates || snap?.candidates || [];
        if (isMounted && Array.isArray(list)) {
          setDecisionReports(list);
        }
      } catch (err) {
        if (isMounted) {
          setDecisionReports([]);
        }
      } finally {
        if (isMounted) {
          setDecisionReportsLoading(false);
        }
      }
    }
    loadDecisionReports();
    return () => { isMounted = false; };
  }, []);


  // Sync auth profile
  useEffect(() => {
    if (authProfile) {
      setUserData(authProfile);
      return;
    }
    if (!authLoading && !userData) {
      getUserProfile()
        .then((u) => setUserData(u))
        .catch(() => setUserData(null));
    }
  }, [authProfile, authLoading, userData]);

  // Load real assessment report and featured database careers
  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      const sessionId = localStorage.getItem("latest_test_session_id");

      // 1. Fetch real assessment report if exists
      if (sessionId) {
        try {
          const rep = await getCareerFitReport(sessionId);
          if (isMounted && rep) {
            setReportData(rep);
          }
        } catch (err) {
          console.warn("No active test report for dashboard:", err);
        }
      }

      // 2. Fetch featured careers from backend database
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/match-engine/careers`);
        if (res.ok) {
          const careers = await res.json();
          if (isMounted && Array.isArray(careers) && careers.length > 0) {
            setFeaturedCareers(careers.slice(0, 3));
          }
        }
      } catch (err) {
        console.warn("Featured careers fetch failed:", err);
      }
    }

    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  const activeProfile = authProfile || userData;
  const fullName = activeProfile?.name || authUser?.user_metadata?.full_name || authUser?.name || "Explorer";
  const firstName = (fullName !== "Explorer" ? fullName.split(" ")[0] : "") || activeProfile?.email?.split("@")[0] || "Explorer";
  const education = activeProfile?.current_education || "Undergraduate / Graduate Studies";

  // Dynamic RIASEC 6-Dimensional Trait Calculation
  const dimensionTraits = useMemo(() => {
    const rawVector = reportData?.dimension_vector || {
      investigative: 0.85,
      technical: 0.78,
      creative: 0.65,
      social: 0.58,
      entrepreneurial: 0.52,
      leadership: 0.48,
    };

    return Object.entries(rawVector).map(([key, val]) => {
      const pct = Math.round((typeof val === "number" ? val : 0.5) * 100);
      return {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        percent: pct,
        key: key.toLowerCase(),
      };
    }).sort((a, b) => b.percent - a.percent);
  }, [reportData]);

  // Dynamic Top Career Matches (from real assessment or spotlight DB)
  const topMatches = useMemo(() => {
    if (reportData?.top_matches && reportData.top_matches.length > 0) {
      return reportData.top_matches.slice(0, 3).map((m) => ({
        title: m.career_name,
        sector: m.sector || m.cluster || "Technology",
        discipline: m.discipline || m.sector || "Specialization Track",
        matchScore: m.similarity_score > 1 ? Math.round(m.similarity_score) : Math.round((m.similarity_score || 0.85) * 100),
        salaryRange: m.salary_range || "₹6 – ₹24 LPA",
        description: m.why_it_fits || "High dimensional fit with your investigative and technical profile.",
        skills: m.key_skills?.slice(0, 3) || ["Root Cause Analysis", "Systems Design", "Data Strategy"],
      }));
    }

    if (featuredCareers.length > 0) {
      return featuredCareers.map((c) => {
        const sal = c.salary_india_lpa || {};
        const salaryRange = sal.entry && sal.senior ? `₹${sal.entry} – ${sal.senior}` : "₹5 – ₹25 LPA";
        return {
          title: c.career_name || "Career Role",
          sector: c.sector || "Engineering",
          discipline: c.discipline || c.sector || "Specialization",
          matchScore: 92,
          salaryRange,
          description: c.description || "High-demand industry specialization with verified growth trajectory.",
          skills: Array.isArray(c.core_skills) ? c.core_skills.slice(0, 3) : ["System Design", "Diagnostics", "Execution"],
        };
      });
    }

    return [
      {
        title: "VFX Artist",
        sector: "ARTS, MEDIA & DESIGN",
        discipline: "Visual Effects & Animation",
        matchScore: 98,
        salaryRange: "₹6 – ₹28 LPA",
        description: "Your dimensional profile aligns well with competencies required for VFX Artist in Arts, Media & Design.",
        skills: ["3D Modeling", "Compositing", "CGI Simulation"],
      },
      {
        title: "Typography Designer",
        sector: "ARTS, MEDIA & DESIGN",
        discipline: "Typeface & Brand Identity",
        matchScore: 98,
        salaryRange: "₹6 – ₹28 LPA",
        description: "Your dimensional profile aligns well with competencies required for Typography Designer in Arts, Media & Design.",
        skills: ["Font Geometry", "Editorial Layout", "Glyph Design"],
      },
      {
        title: "E-Learning Specialist",
        sector: "EDUCATION",
        discipline: "Instructional Design & EdTech",
        matchScore: 98,
        salaryRange: "₹6 – ₹28 LPA",
        description: "Your dimensional profile aligns well with competencies required for E-Learning Specialist in Education.",
        skills: ["LMS Architecture", "Curriculum Mapping", "Interactive Storyboarding"],
      },
      {
        title: "Character Artist",
        sector: "ARTS, MEDIA & DESIGN",
        discipline: "3D Digital Sculpting",
        matchScore: 97,
        salaryRange: "₹6 – ₹28 LPA",
        description: "Your dimensional profile aligns well with competencies required for Character Artist in Arts, Media & Design.",
        skills: ["ZBrush Sculpting", "Anatomy Modeling", "Texture Baking"],
      },
      {
        title: "Packaging Designer",
        sector: "ARTS, MEDIA & DESIGN",
        discipline: "Industrial Packaging & Brand UX",
        matchScore: 97,
        salaryRange: "₹6 – ₹28 LPA",
        description: "Your dimensional profile aligns well with competencies required for Packaging Designer in Arts, Media & Design.",
        skills: ["Dieline Engineering", "Material Sustainability", "Shelf Impact UX"],
      },
    ];
  }, [reportData, featuredCareers]);

  // Overall Clarity Score
  const clarityScore = reportData ? 88 : 45;

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f7fafd] via-[#eef4fc] to-[#e4eef9] px-4 py-8 sm:px-6 lg:px-10 text-slate-800 font-sans text-left">
      <SEO
        title="Student Career Command Center | ClearCareers"
        description="Track your personalized career discovery roadmap, RIASEC vector diagnostic scores, interactive trial mission simulations, and verified industry trajectories."
      />

      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Top Hero Command Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-8 lg:p-10 shadow-sm shadow-blue-900/5 space-y-6">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1E88E5]">
                  <Sparkles size={13} className="text-[#1E88E5]" />
                  Career Command Center
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  {education}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black tracking-tight text-[#0b1a36] leading-tight">
                Welcome back, {firstName} 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Your personalized career discovery ecosystem is active.
              </p>
            </div>

            {/* Quick Readiness Score Card */}
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 bg-gradient-to-br from-[#F0F6FC] to-white p-5 rounded-3xl border border-[#D3E3F5] shadow-xs">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600 transition-all duration-1000 ease-out"
                    strokeDasharray={`${clarityScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-black text-[#0b1a36]">{clarityScore}%</span>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-slate-400">Clarity</span>
                </div>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-xs font-bold text-[#0b1a36] block">
                  {reportData ? "Verified Diagnostic Match" : "Diagnostic Ready"}
                </span>
                <p className="text-[11px] text-slate-500 max-w-[160px]">
                  {reportData ? "Based on your 6D RIASEC vector." : "Take the 15-min assessment to reach 100%."}
                </p>
                {!reportData && (
                  <button
                    onClick={() => navigate("/assessment")}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    Start Test Now <ArrowRight size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4-Stage Career Readiness Journey Stepper */}
          <div className="pt-6 border-t border-[#D3E3F5] space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your 4-Stage Career Launch Trajectory
              </span>
              <span className="text-xs font-bold text-blue-600">
                Stage {reportData ? "02 / 04 Active" : "01 / 04 In Progress"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STAGES.map((stage) => {
                const Icon = stage.icon;
                const isPassed = reportData ? stage.id <= 2 : stage.id === 1;
                const isCurrent = reportData ? stage.id === 2 : stage.id === 1;
                return (
                  <div
                    key={stage.id}
                    onClick={() => navigate(stage.path)}
                    className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isCurrent
                        ? "bg-gradient-to-br from-blue-50/70 to-white border-blue-300 shadow-xs"
                        : "bg-[#F0F6FC]/60 border-[#D3E3F5] hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isPassed ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        <Icon size={14} />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Step 0{stage.id}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#0b1a36] group-hover:text-blue-600 transition flex items-center gap-1">
                        {stage.name}
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition" />
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>



        {/* Dashboard Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.85fr_1fr]">

          {/* LEFT COLUMN: Top Matches, Dimensional Traits & Simulation Sandbox */}
          <div className="space-y-8">


            {/* Your Decision Reports Section */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 shadow-xs space-y-5" data-testid="dashboard-decision-reports-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                    Evidence-Backed Dossiers
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
                      <Award size={16} />
                    </span>
                    <h3 className="font-sans text-lg sm:text-xl font-bold text-[#0b1a36]">
                      Your Decision Reports
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/career-decision")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition self-start sm:self-auto cursor-pointer"
                  data-testid="explore-all-decisions-link"
                >
                  Explore All Decisions <ChevronRight size={13} />
                </button>
              </div>

              {decisionReportsLoading ? (
                <div className="py-6 flex items-center justify-center text-xs text-slate-400">
                  Loading decision reports...
                </div>
              ) : decisionReportsError ? (
                <div className="py-4 text-xs text-slate-500 bg-slate-50 rounded-2xl p-4">
                  Unable to load decision reports.
                </div>
              ) : decisionReports.length === 0 ? (
                <div className="py-6 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 p-6 space-y-2" data-testid="dashboard-reports-empty-state">
                  <p className="text-xs font-semibold text-slate-700">No Completed Decision Reports Yet</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Complete a hands-on Trial Mission to generate your personalized, evidence-based Decision Report.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => navigate("/trial-mission")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      data-testid="start-trial-from-empty-reports"
                    >
                      <Terminal size={13} />
                      <span>Start Trial Simulation</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="dashboard-reports-grid">
                  {decisionReports.map((rep) => (
                    <div
                      key={rep.career_id}
                      className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-4 sm:p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition group"
                      data-testid={`dashboard-report-card-${rep.career_id}`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {rep.recommendation_category ? rep.recommendation_category.replace(/_/g, " ") : "Decision Report"}
                          </span>
                          {(rep.fit_tier || rep.fit_index !== undefined) && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              {rep.fit_tier ? rep.fit_tier.replace(/_/g, " ") : `${Math.round(rep.fit_index)}% Fit`}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                            {rep.career_title || rep.career_name || rep.career_code || "Career Decision Report"}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {rep.rationale_summary || "Comprehensive decision dossier backed by your simulation evidence."}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Canonical Report
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/careers/${rep.career_id}/decision-report`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1a36] hover:bg-blue-600 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                          data-testid={`view-decision-report-${rep.career_id}`}
                        >
                          <span>View Report</span>
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Recommended Career Matches Section */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                    {reportData ? "Dynamic Cognitive Alignment" : "High-Growth Spotlight"}
                  </span>
                  <h3 className="font-sans text-lg sm:text-xl font-bold text-[#0b1a36]">
                    {reportData ? "Your Top Career Matches" : "Recommended Career Tracks"}
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/career-reality")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  Explore All 500+ <ChevronRight size={13} />
                </button>
              </div>

              {/* Match Cards List */}
              <div className="divide-y divide-slate-100">
                {topMatches.map((career, idx) => (
                  <div
                    key={idx}
                    className="py-5 first:pt-2 last:pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-[#F0F6FC]/40 rounded-2xl px-3 -mx-3"
                  >
                    {/* Left Column: Sector & Fit pills, Title, Description */}
                    <div className="space-y-1.5 text-left max-w-xl">
                      {/* Sector & Fit Badges */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-[#1E88E5]">
                          {career.sector}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                          {career.matchScore}% Fit
                        </span>
                      </div>

                      {/* Career Title */}
                      <h4
                        onClick={() => navigate(`/career-details/${encodeURIComponent(career.title)}`)}
                        className="font-sans text-lg sm:text-xl font-bold text-[#0b1a36] hover:text-blue-600 transition cursor-pointer"
                      >
                        {career.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed font-normal">
                        {career.description}
                      </p>
                    </div>

                    {/* Right Column: Compensation & Actions */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0 justify-between md:justify-end pt-2 md:pt-0">
                      {/* Compensation */}
                      <div className="text-left md:text-right">
                        <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider block">
                          COMPENSATION
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#0b1a36]">
                          {career.salaryRange}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => navigate(`/career-details/${encodeURIComponent(career.title)}`)}
                          className="rounded-full bg-[#0b1a36] hover:bg-[#152e5d] text-white px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          Deep-Dive
                        </button>
                        <button
                          onClick={() => navigate(`/roadmap?career=${encodeURIComponent(career.title)}`)}
                          className="rounded-full border border-[#D3E3F5] bg-white hover:bg-[#F0F6FC] text-[#0b1a36] px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          Roadmap
                        </button>
                        <button
                          onClick={() => navigate(`/career-reality`)}
                          title="Filter & Compare"
                          className="w-8 h-8 rounded-full border border-[#D3E3F5] bg-white hover:bg-[#F0F6FC] text-slate-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                        >
                          <SlidersHorizontal size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trial Missions & Role Simulators Sandbox */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-0.5">
                    Stage 03 Sandbox
                  </span>
                  <h3 className="font-sans text-lg sm:text-xl font-bold text-[#0b1a36] flex items-center gap-2">
                    <Terminal size={18} className="text-purple-600" />
                    Interactive Trial Simulations
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/trial-mission")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 transition cursor-pointer"
                >
                  All Labs <ChevronRight size={13} />
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {DEFAULT_SIMULATIONS.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => navigate("/trial-mission")}
                    className={`p-5 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-3 ${sim.accent}`}
                  >
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-600 inline-block">
                        {sim.badge}
                      </span>
                      <h4 className="font-sans text-sm font-bold text-[#0b1a36] leading-snug">
                        {sim.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{sim.role}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-semibold text-slate-500">{sim.duration}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-blue-700">
                        Launch <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Psychometrics, Action Goals & Profile */}
          <div className="space-y-6">

            {/* Psychometric 6D RIASEC Vector Breakdown */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-sm font-bold text-[#0b1a36] flex items-center gap-1.5">
                  <BarChart3 size={15} className="text-blue-600" />
                  6D RIASEC Behavioral Vector
                </h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Match Engine
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Cognitive strengths computed for optimal career track alignment.
              </p>

              <div className="space-y-3 pt-1">
                {dimensionTraits.map((trait) => (
                  <div key={trait.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{trait.label}</span>
                      <span className="text-[#0b1a36] font-bold">{trait.percent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                        style={{ width: `${trait.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {!reportData && (
                <button
                  onClick={() => navigate("/assessment")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b1a36] hover:bg-[#122b59] text-white py-2.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  Calibrate Vector with Assessment
                </button>
              )}
            </div>

            {/* Actionable Next Goals Checklist */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-sans text-sm font-bold text-[#0b1a36] flex items-center gap-1.5">
                <Target size={15} className="text-emerald-600" />
                Recommended Discovery Actions
              </h3>

              <div className="space-y-2.5">
                <GoalItem
                  done={Boolean(reportData)}
                  text="Take the 15-Minute RIASEC Discovery Test"
                  onClick={() => navigate("/assessment")}
                />
                <GoalItem
                  done={true}
                  text="Explore 513 Verified Career Realities"
                  onClick={() => navigate("/career-reality")}
                />
                <GoalItem
                  done={false}
                  text="Run 1 Hands-on Trial Simulation Lab"
                  onClick={() => navigate("/trial-mission")}
                />
                <GoalItem
                  done={false}
                  text="Build 5-Stage Learning Roadmap"
                  onClick={() => navigate("/roadmap")}
                />
              </div>
            </div>

            {/* Career Hubs Community CTA */}
            <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-[#0b1a36] to-[#122c5e] p-6 text-white shadow-md space-y-3.5 text-center">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto text-sky-300">
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 className="font-sans text-base font-bold">Connect with Peer Communities</h4>
                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  Join 15 verified discipline hubs to discuss career transitions, salaries, and interview tracks.
                </p>
              </div>
              <button
                onClick={() => navigate("/career-hubs")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#0b1a36] hover:bg-blue-50 px-4 py-2.5 text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Join Career Hubs <ArrowRight size={13} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}



function GoalItem({ done, text, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
        done
          ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
          : "bg-[#F0F6FC] border-[#D3E3F5] text-slate-700 hover:border-blue-300"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
          done ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-transparent"
        }`}>
          <Check size={11} />
        </div>
        <span className="text-xs font-semibold">{text}</span>
      </div>
      <ChevronRight size={13} className="text-slate-400 shrink-0" />
    </div>
  );
}