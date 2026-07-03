import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  BarChart3,
  Activity,
  ShieldCheck,
  CircleDollarSign,
  Users,
  Download,
  FolderOpen,
  Briefcase,
  TrendingUp,
  DownloadCloud,
} from "lucide-react";
import CareerCluster from "./CareerCluster";

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
  dataScientist: {
    title: "Data Scientist",
    subtitle: "Data Insights",
    category: "Technology",
    description:
      "Your passion for data and experimentation makes you a great fit for uncovering insights that power product decisions.",
    matchPercentage: 93,
    skillTags: ["Python & SQL", "Statistical Modeling", "Data Storytelling"],
    alternativeMatches: [
      {
        score: 95,
        title: "Technology",
        description: "Continue honing the technical skills that make data science possible.",
      },
      {
        score: 92,
        title: "Business & Development",
        description: "Bring insight-driven storytelling into business strategy.",
      },
    ],
    roleSuggestions: ["Research Scientist", "Analytics Lead", "Machine Learning Engineer"],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
    strengths: [
      { label: "Analytical Thinking", percent: 95 },
      { label: "Logical Reasoning", percent: 86 },
      { label: "Problem Solving", percent: 82 },
    ],
    reports: [
      { label: "Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    detailTitle: "Data Science Career Reality",
    detailItems: [
      {
        label: "Typical day",
        value: "Analyze datasets, validate models, and communicate results to stakeholders.",
      },
      {
        label: "What you need",
        value: "Storytelling with data, math fundamentals, and strong coding discipline.",
      },
      {
        label: "Career focus",
        value: "Turning raw data into actionable business and product strategies.",
      },
    ],
  },
  softwareEngineer: {
    title: "Software Engineer",
    subtitle: "Engineering Excellence",
    category: "Technology",
    description:
      "Your practical problem solving and technical focus make you a strong fit for building reliable software systems.",
    matchPercentage: 91,
    skillTags: ["Python & SQL", "System Design", "Collaboration"],
    alternativeMatches: [
      {
        score: 95,
        title: "Technology",
        description: "Explore high-impact engineering roles driven by strong systems design skills.",
      },
      {
        score: 92,
        title: "Business & Development",
        description: "Bridge engineering with business outcomes through product-led delivery.",
      },
    ],
    roleSuggestions: ["Backend Developer", "Full Stack Engineer", "DevOps Specialist"],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
    strengths: [
      { label: "Analytical Thinking", percent: 95 },
      { label: "Logical Reasoning", percent: 87 },
      { label: "Problem Solving", percent: 85 },
    ],
    reports: [
      { label: "Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    detailTitle: "Software Engineering Career Reality",
    detailItems: [
      {
        label: "Typical day",
        value: "Write code, review architecture, and ship features with a collaborative team.",
      },
      {
        label: "What you need",
        value: "Strong problem solving, clean code habits, and a solid understanding of systems.",
      },
      {
        label: "Career focus",
        value: "Creating scalable products, solving technical challenges, and building engineering best practices.",
      },
    ],
  },
};

const ROLE_DEFAULTS = ["Software Developer", "System Analyst", "Security Analyst"];

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

function getCurrentCareerTemplate() {
  const profile = parseProfileFromStorage();
  const profileKey = resolveCareerKey(profile);
  if (profileKey && CAREER_TEMPLATES[profileKey]) return CAREER_TEMPLATES[profileKey];

  const queryKey = getQueryCareerKey();
  if (queryKey && CAREER_TEMPLATES[queryKey]) return CAREER_TEMPLATES[queryKey];

  return CAREER_TEMPLATES.aiEngineer;
}

export default function CareerRealityV2({ onBack }) {
  const [activePage, setActivePage] = useState("results");
  const roadmapRef = useRef(null);
  const career = useMemo(() => getCurrentCareerTemplate(), []);

  const scrollToRoadmap = () => {
    if (roadmapRef.current) {
      roadmapRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (activePage === "cluster") {
    return <CareerCluster onBack={() => setActivePage("results")} />;
  }

  return (
    <section className="min-h-screen bg-[#f3f6ff] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-5 rounded-[32px] border border-[#d9e4ff] bg-white/90 p-6 shadow-[0_28px_80px_rgba(37,78,181,0.08)] md:p-8">
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

        <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-[#dbe5ff] bg-white p-6 shadow-[0_24px_64px_rgba(24,64,142,0.08)] sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.7fr] lg:items-center">
                <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[#eef4ff] shadow-sm sm:h-32 sm:w-32">
                    <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[#5069f0] to-[#6f47e4] text-[28px] text-white shadow-md">
                      <Briefcase size={32} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#eef5ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#3b63d3]">
                        Match #1
                      </span>
                      <span className="rounded-full bg-[#f2f6ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b77b4]">
                        {career.title}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-[#0e1f45] sm:text-4xl">{career.category}</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#556987]">
                        {career.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {career.skillTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#eef5ff] px-3 py-2 text-xs font-semibold text-[#2e57c0]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#e5edff] bg-[#f7f9ff] p-6 text-center shadow-sm">
                  <div className="text-sm font-semibold uppercase tracking-[0.24em] text-[#556987]">
                    Match Score
                  </div>
                  <div className="mt-6 flex items-center justify-center rounded-[26px] bg-white px-6 py-7 text-center shadow-[0_12px_24px_rgba(43,87,213,0.12)]">
                    <div>
                      <p className="text-5xl font-black text-[#1c305e]">{career.matchPercentage}%</p>
                      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#5d6c95]">Top match</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setActivePage("cluster")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3748ff] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(55,72,255,0.24)] transition hover:bg-[#2235d6]"
                >
                  <BookOpen size={16} />
                  Explore Career
                </button>
                <button
                  type="button"
                  onClick={scrollToRoadmap}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7defd] bg-white px-6 py-3 text-sm font-semibold text-[#3b4f7d] transition hover:bg-[#f6f8ff]"
                >
                  <ArrowRight size={16} />
                  Roadmap
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7defd] bg-white text-[#3b4f7d] transition hover:bg-[#f6f8ff]"
                >
                  <Bookmark size={18} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {career.alternativeMatches.map((match) => (
                <div key={match.title} className="rounded-[28px] border border-[#e2e7ff] bg-white p-5 shadow-[0_18px_40px_rgba(20,51,121,0.04)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f75a9]">{match.score}%</p>
                      <h3 className="mt-3 text-xl font-bold text-[#10213f]">{match.title}</h3>
                    </div>
                    <div className="rounded-3xl bg-[#eef4ff] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#3c5fd1]">
                      View Details
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#5a6a8e]">{match.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-[#dbe5ff] bg-white p-5 shadow-[0_18px_40px_rgba(24,64,142,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5c72a6]">Quick role suggestions</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {(career.roleSuggestions.length ? career.roleSuggestions : ROLE_DEFAULTS).map((role) => (
                  <span key={role} className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm font-semibold text-[#2545a0]">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div
              ref={roadmapRef}
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
                  <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#2f3f8f] shadow-[0_10px_24px_rgba(255,255,255,0.24)] transition hover:bg-[#f7f8ff]">
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

          </div>

          <aside className="space-y-6">
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
          </aside>
        </div>

        <div className="flex justify-center">
          <button className="inline-flex items-center justify-center rounded-full bg-[#3748ff] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_56px_rgba(55,72,255,0.24)] transition hover:bg-[#273ae9]">
            <DownloadCloud size={18} />
            Download Full Report
          </button>
        </div>
      </div>
    </section>
  );
}
