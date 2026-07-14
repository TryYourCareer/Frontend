import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BarChart3,
  Activity,
  ShieldCheck,
  Download,
  DownloadCloud,
  ChevronRight,
} from "lucide-react";
import CareerCluster from "./CareerCluster";
import CareerReality from "./CareerReality";
import { useNavigate } from "react-router-dom";

const CAREER_TEMPLATES = {
  aiEngineer: {
    title: "Technology",
    subtitle: "AI Engineer",
    category: "Technology",
    description:
      "Your analytical precision and love for patterns make you a natural fit for translating complex data into strategic business insights.",
    matchPercentage: 95,
    skillTags: ["Analytical Thinking", "Python & SQL", "Structured Thinking"],
    alternativeMatches: [
      {
        score: 92,
        title: "Business & Development",
        description: "Leverage your data instincts to support business growth and digital transformation.",
      },
      {
        score: 88,
        title: "Business Analyst",
        description: "Use your analytical mindset to bridge business strategy and measurable outcomes.",
      },
    ],
    roleSuggestions: ["Software Developer", "System Analyst", "Security Analyst"],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
    strengths: [
      { label: "Analytical Thinking", percent: 95 },
      { label: "Logical Reasoning", percent: 84 },
      { label: "Problem Solving", percent: 79 },
    ],
    reports: [
      { label: "Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    detailTitle: "Technology Career Reality",
    detailItems: [
      {
        label: "Typical day",
        value:
          "Build models, collaborate with product teams, and translate complex data into usable insights.",
      },
      {
        label: "What you need",
        value: "Strong data fundamentals, statistical reasoning, and a growth mindset for continuous learning.",
      },
      {
        label: "Career focus",
        value: "AI engineering, model deployment, and intelligent automation across industries.",
      },
    ],
  },
  businessAnalyst: {
    title: "Business Analyst",
    subtitle: "Business Intelligence",
    category: "Business & Development",
    description:
      "Your logical reasoning and stakeholder skills make you ideal for turning business challenges into data-backed decisions.",
    matchPercentage: 92,
    skillTags: ["Analytical Thinking", "Business Strategy", "Dashboarding"],
    alternativeMatches: [
      {
        score: 95,
        title: "Technology",
        description: "Translate your analytical strengths into high-impact technical pathways.",
      },
      {
        score: 88,
        title: "Business Analyst",
        description: "Use your analytical mindset to bridge business strategy and measurable outcomes.",
      },
    ],
    roleSuggestions: ["Product Analyst", "Operations Analyst", "Market Researcher"],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
    strengths: [
      { label: "Analytical Thinking", percent: 95 },
      { label: "Logical Reasoning", percent: 88 },
      { label: "Problem Solving", percent: 83 },
    ],
    reports: [
      { label: "Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    detailTitle: "Business Analyst Career Reality",
    detailItems: [
      {
        label: "Typical day",
        value: "Build reports, coordinate with stakeholders, and guide data-driven business decisions.",
      },
      {
        label: "What you need",
        value: "Clear communication skills, analytical tools, and a strong business mindset.",
      },
      {
        label: "Career focus",
        value: "Improving processes, defining metrics, and supporting business transformation.",
      },
    ],
  },
  uiUxDesigner: {
    title: "UI/UX Designer",
    subtitle: "Design Leadership",
    category: "Creative Product",
    description:
      "Your empathy for users and visual problem-solving make you a strong candidate for creating intuitive, delightful digital experiences.",
    matchPercentage: 88,
    skillTags: ["User Research", "Wireframing", "Interaction Design"],
    alternativeMatches: [
      {
        score: 95,
        title: "Technology",
        description: "Explore the technical foundations that support strong product design.",
      },
      {
        score: 92,
        title: "Business & Development",
        description: "Combine user insights with business goals for impactful product direction.",
      },
    ],
    roleSuggestions: ["Product Designer", "UX Researcher", "Visual Designer"],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
    strengths: [
      { label: "Analytical Thinking", percent: 95 },
      { label: "Logical Reasoning", percent: 82 },
      { label: "Problem Solving", percent: 80 },
    ],
    reports: [
      { label: "Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    detailTitle: "Design Career Reality",
    detailItems: [
      {
        label: "Typical day",
        value: "Interview users, prototype interfaces, and iterate with feedback.",
      },
      {
        label: "What you need",
        value: "Design thinking, strong visual communication, and empathy for user behavior.",
      },
      {
        label: "Career focus",
        value: "Experience design, product flows, and human-centered solutions.",
      },
    ],
  },
  cyberSecurityAnalyst: {
    title: "Cyber Security Analyst",
    subtitle: "Security & Risk",
    category: "Security",
    description:
      "Your attention to detail and risk-focused mindset make you a natural fit for defending systems and analyzing threats.",
    matchPercentage: 90,
    skillTags: ["Threat Detection", "Risk Analysis", "Incident Response"],
    alternativeMatches: [
      {
        score: 95,
        title: "Technology",
        description: "Leverage technical expertise to secure modern infrastructure and systems.",
      },
      {
        score: 92,
        title: "Business & Development",
        description: "Support secure business operations through strong governance practices.",
      },
    ],
    roleSuggestions: ["SOC Analyst", "Threat Analyst", "Security Engineer"],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
    strengths: [
      { label: "Analytical Thinking", percent: 95 },
      { label: "Logical Reasoning", percent: 89 },
      { label: "Problem Solving", percent: 84 },
    ],
    reports: [
      { label: "Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    detailTitle: "Cyber Security Career Reality",
    detailItems: [
      {
        label: "Typical day",
        value: "Monitor threats, investigate incidents, and harden critical systems.",
      },
      {
        label: "What you need",
        value: "Strong attention to detail, security fundamentals, and investigative persistence.",
      },
      {
        label: "Career focus",
        value: "Threat response, defensive operations, and resilience planning.",
      },
    ],
  },

};


function parseProfileFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("clear-careers-generated-profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function mapTextToKey(text) {
  const normalized = normalizeText(text);
  if (!normalized) return null;
  if (normalized.includes("security") || normalized.includes("cyber") || normalized.includes("risk")) return "cyberSecurityAnalyst";
  if (normalized.includes("ux") || normalized.includes("ui") || normalized.includes("design")) return "uiUxDesigner";
  if (normalized.includes("business") || normalized.includes("development") || normalized.includes("analyst")) return "businessAnalyst";
  if (normalized.includes("data scientist") || normalized.includes("data") || normalized.includes("machine learning")) return "dataScientist";
  if (normalized.includes("software") || normalized.includes("engineer") || normalized.includes("developer")) return "softwareEngineer";
  if (normalized.includes("ai") || normalized.includes("artificial intelligence")) return "aiEngineer";
  return null;
}

function resolveCareerKey(profile) {
  if (!profile) return null;
  const candidate =
    profile?.suggested_careers?.[0]?.title ||
    profile?.top_match ||
    profile?.topMatch ||
    profile?.area_of_interest ||
    profile?.areaOfInterest ||
    profile?.subjects?.[0] ||
    profile?.passions?.[0] ||
    profile?.career;
  return mapTextToKey(candidate);
}

function getQueryCareerKey() {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const career = params.get("career") || params.get("topMatch") || params.get("role");
    return mapTextToKey(career);
  } catch {
    return null;
  }
}


export default function CareerRealityV2({ onBack }) {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("results");
  const [selectedClusterCareer, setSelectedClusterCareer] = useState(null);

  const initialCareerKey = useMemo(() => {
    const profile = parseProfileFromStorage();
    const profileKey = resolveCareerKey(profile);
    if (profileKey && CAREER_TEMPLATES[profileKey]) return profileKey;

    const queryKey = getQueryCareerKey();
    if (queryKey && CAREER_TEMPLATES[queryKey]) return queryKey;

    return "aiEngineer";
  }, []);

  const [selectedCareerKey, setSelectedCareerKey] = useState(initialCareerKey);
  const career = useMemo(() => CAREER_TEMPLATES[selectedCareerKey] || CAREER_TEMPLATES.aiEngineer, [selectedCareerKey]);

  if (activePage === "cluster") {
    return (
      <CareerCluster
        onBack={() => setActivePage("results")}
        onSelectCareer={(careerTitle) => {
          setSelectedClusterCareer(careerTitle);
          setActivePage("realityDetail");
        }}
      />
    );
  }

  if (activePage === "realityDetail") {
    return (
      <CareerReality
        onBack={() => setActivePage("cluster")}
        careerTitle={selectedClusterCareer}
      />
    );
  }

  return (
    <section className="min-h-screen bg-[#f3f6ff] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumbs Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8fa0c2] mb-6 md:px-8">
          <span className="cursor-pointer hover:text-[#3748ff] transition" onClick={() => navigate("/dashboard")}>Home</span>
          <ChevronRight size={12} className="text-[#b0c0de]" />
          <span className="text-[#10213f] font-black">Matches</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-5  md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-[#dff6e4] px-4 py-2 text-sm font-semibold text-[#1c6b30]">
                Assessment Completed
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-[-0.04em] text-[#0f1f46] sm:text-5xl">
                  Your Career Match Results
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[#556987] sm:text-base">
                  We&apos;ve analyzed your Career DNA, skills, and aspirations. Here are the top professional paths where you&apos;re destined to thrive.
                </p>
              </div>
            </div>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-[#d8e3ff] bg-white px-4 py-2 text-sm font-semibold text-[#344475] transition hover:bg-[#f6f8ff]"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            ) : null}
          </div>
        </div>

        {/* Careers Grid Container (100% Width) */}
        <div className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2">
            {Object.entries(CAREER_TEMPLATES).map(([key, template]) => {
              const isSelected = selectedCareerKey === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedCareerKey(key)}
                  className={`group rounded-[32px] border p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer ${isSelected
                    ? "border-[#3748ff] bg-blue-50/10 shadow-[0_24px_50px_rgba(55,72,255,0.06)] ring-1 ring-[#3748ff]/30"
                    : "border-[#e2e7ff] bg-white hover:border-[#ccd8ea] hover:shadow-lg"
                    }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${isSelected ? "bg-[#3748ff]/10 text-[#3748ff]" : "bg-slate-100 text-slate-600"
                        }`}>
                        {template.subtitle}
                      </span>
                      <span className="rounded-full bg-emerald-50 border border-emerald-250 px-3 py-1.5 text-xs font-black text-emerald-700">
                        {template.matchPercentage}% Match
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#10213f]">{template.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {template.skillTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-50 border border-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-550">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCareerKey(key);
                        setActivePage("cluster");
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#3748ff] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#2235d6]"
                    >
                      <BookOpen size={13} />
                      Explore Career
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCareerKey(key);
                        navigate(`/roadmap?career=${key}`);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-205 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ArrowRight size={13} />
                      Roadmap
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics Section (Below Careers) */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Core Strengths */}
          <div className="rounded-[32px] border border-[#dbe5ff] bg-white p-6 shadow-[0_24px_70px_rgba(20,49,126,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5f75a9]">Core Strengths</p>
                <h3 className="mt-3 text-2xl font-black text-[#10213f]">Core Strengths</h3>
              </div>
              <span className="rounded-full bg-[#eef6ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#3758d4]">
                {career.strengths[0].percent}%
              </span>
            </div>
            <div className="mt-6 space-y-5">
              {career.strengths.map((strength) => (
                <div key={strength.label}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#12224d]">{strength.label}</p>
                    <span className="text-sm font-semibold text-[#4f5d84]">{strength.percent}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#eef3ff]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4f6df7] to-[#7f55ff]"
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytic Reports */}
          <div className="rounded-[32px] border border-[#dbe5ff] bg-white p-6 shadow-[0_24px_70px_rgba(20,49,126,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5f75a9]">Analytic Reports</p>
                <h3 className="mt-3 text-2xl font-black text-[#10213f]">Analytic Reports</h3>
              </div>
              <span className="rounded-full bg-[#eef4ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#3d5fcf]">
                3 reports
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {career.reports.map((report) => {
                const Icon = report.icon;
                return (
                  <div key={report.label} className="flex items-center justify-between rounded-[22px] border border-[#edf1ff] bg-[#f7f8ff] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#3d5fd2] shadow-sm">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#10213f]">{report.label}</p>
                        <p className="text-xs text-[#6e7a9a]">Download or view your insights</p>
                      </div>
                    </div>
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#364f9f] transition hover:bg-[#e5ebff]">
                      <Download size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="rounded-[32px] border border-[#cfe0ff] bg-gradient-to-r from-[#4669ff] via-[#5772ff] to-[#7f63ff] p-6 text-white shadow-[0_24px_80px_rgba(65,93,233,0.18)] sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d9e4ff]">Roadmap</p>
              <h3 className="text-3xl font-black tracking-[-0.03em] text-white">{career.roadmapTitle}</h3>
              <p className="max-w-2xl text-sm leading-7 text-[#dce4ff]">
                {career.roadmapDescription}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate(`/roadmap?career=${selectedCareerKey}`)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#2f3f8f] shadow-[0_10px_24px_rgba(255,255,255,0.24)] transition hover:bg-[#f7f8ff]"
              >
                <ArrowRight size={16} />
                View Full Roadmap
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                <DownloadCloud size={16} />
                Download Report
              </button>
            </div>
          </div>
        </div>

        {/* <div className="flex justify-center">
          <button className="inline-flex items-center justify-center rounded-full bg-[#3748ff] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_56px_rgba(55,72,255,0.24)] transition hover:bg-[#273ae9]">
            <DownloadCloud size={18} />
            Download Full Report
          </button>
        </div> */}
      </div>
    </section>
  );
}
