import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Flame,
  Sparkles, ArrowRight, BarChart3, Target,
  Award, Compass, Layers,
  ChevronRight, ArrowUpRight,
  Check, MessageSquare, Terminal
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/users";
import { getCareerFitReport } from "../services/discoveryTest";
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
        title: "Software Systems Architect",
        sector: "Technology",
        discipline: "Software & Cloud",
        matchScore: 94,
        salaryRange: "₹8 – ₹35 LPA",
        description: "Designs fault-tolerant cloud software and scalable distributed microservices.",
        skills: ["System Design", "Cloud Infrastructure", "Distributed Data"],
      },
      {
        title: "Reliability Engineer",
        sector: "Engineering",
        discipline: "Industrial & Asset Engineering",
        matchScore: 89,
        salaryRange: "₹6 – ₹28 LPA",
        description: "Prevents critical asset downtime using sensor vibration and predictive maintenance.",
        skills: ["RCFA & FMEA", "Vibration Analysis", "CMMS Systems"],
      },
      {
        title: "AI Solutions Consultant",
        sector: "Technology",
        discipline: "Applied AI & Strategy",
        matchScore: 86,
        salaryRange: "₹10 – ₹40 LPA",
        description: "Aligns machine learning model pipelines with industrial automation needs.",
        skills: ["Machine Learning", "Model Governance", "Solution Architecture"],
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

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#0b1a36] leading-tight">
                Welcome back, {firstName} 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Your personalized career discovery ecosystem is active. Track your 6D behavioral alignment, explore verified compensation benchmarks, and practice real-world trial simulations.
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

        {/* 4 Stat Cards Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatHighlightCard
            icon={<ClipboardList size={16} />}
            label="Discovery Status"
            value={reportData ? "Vector Mapped" : "Ready"}
            subText={reportData ? "6D RIASEC Active" : "15-Min Assessment"}
            color="text-blue-600"
            bg="bg-blue-50/60"
            border="border-blue-200"
            action={() => navigate("/assessment")}
          />
          <StatHighlightCard
            icon={<Layers size={16} />}
            label="Reality Verification"
            value="513 Roles"
            subText="Real Market Salarie"
            color="text-emerald-600"
            bg="bg-emerald-50/60"
            border="border-emerald-200"
            action={() => navigate("/career-reality")}
          />
          <StatHighlightCard
            icon={<Terminal size={16} />}
            label="Trial Simulations"
            value="3 Workspaces"
            subText="Hands-on Role Labs"
            color="text-purple-600"
            bg="bg-purple-50/60"
            border="border-purple-200"
            action={() => navigate("/trial-mission")}
          />
          <StatHighlightCard
            icon={<Flame size={16} />}
            label="Momentum"
            value="5-Day Streak"
            subText="Consistent Explorer"
            color="text-amber-600"
            bg="bg-amber-50/60"
            border="border-amber-200"
            action={() => navigate("/roadmap")}
          />
        </div>

        {/* Dashboard Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.85fr_1fr]">

          {/* LEFT COLUMN: Top Matches, Dimensional Traits & Simulation Sandbox */}
          <div className="space-y-8">

            {/* Top Recommended Career Matches Section */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                    {reportData ? "Dynamic Cognitive Alignment" : "High-Growth Spotlight"}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0b1a36]">
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
              <div className="space-y-3.5">
                {topMatches.map((career, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC]/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all duration-300 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-[#1E88E5]">
                            {career.sector}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">{career.discipline}</span>
                        </div>
                        <h4
                          onClick={() => navigate(`/career-details/${encodeURIComponent(career.title)}`)}
                          className="font-serif text-base font-bold text-[#0b1a36] hover:text-blue-600 transition cursor-pointer"
                        >
                          {career.title}
                        </h4>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black px-2.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800">
                          {career.matchScore}% Fit
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold mt-1">{career.salaryRange}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {career.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                      <div className="flex flex-wrap gap-1.5">
                        {career.skills.map((skill) => (
                          <span key={skill} className="text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/career-details/${encodeURIComponent(career.title)}`)}
                          className="rounded-xl bg-[#0b1a36] hover:bg-[#152e5d] text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          Reality Check
                        </button>
                        <button
                          onClick={() => navigate(`/roadmap?career=${encodeURIComponent(career.title)}`)}
                          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          Roadmap
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
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0b1a36] flex items-center gap-2">
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
                      <h4 className="font-serif text-sm font-bold text-[#0b1a36] leading-snug">
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
                <h3 className="font-serif text-sm font-bold text-[#0b1a36] flex items-center gap-1.5">
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
              <h3 className="font-serif text-sm font-bold text-[#0b1a36] flex items-center gap-1.5">
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
                <h4 className="font-serif text-base font-bold">Connect with Peer Communities</h4>
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

function StatHighlightCard({ icon, label, value, subText, color, bg, border, action }) {
  return (
    <div
      onClick={action}
      className={`p-5 rounded-3xl border ${border} bg-white hover:border-slate-300 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-2`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-xl ${bg} ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-lg font-black text-[#0b1a36]">{value}</p>
        <p className="text-[11px] text-slate-500 font-medium">{subText}</p>
      </div>
    </div>
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