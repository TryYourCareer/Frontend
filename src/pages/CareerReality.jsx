import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Code,
  Sparkles,
  UserCheck,
} from "lucide-react";
import RoleDetail from "./RoleDetail";

/* Parse a single CSV row respecting quoted fields */
function parseCSVRow(row) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVRow(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

const FILTER_TABS = [
  { key: "all", label: "All Roles" },
  { key: "entry", label: "Entry Level" },
  { key: "mid_senior", label: "Mid/Senior Level" },
  { key: "leadership", label: "Executive & Leadership" },
];

export default function CareerReality({ careerName = "AI/Machine Learning Engineer", onBack }) {
  const [currentView, setCurrentView] = useState("list");
  const [selectedRoleKey, setSelectedRoleKey] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCareer() {
      try {
        setLoading(true);
        const res = await fetch("/data/Careers.csv");
        if (res.ok) {
          const text = await res.text();
          const parsed = parseCSV(text);
          const found =
            parsed.find(
              (c) =>
                (c["Career Name"] || "").toLowerCase() === (careerName || "").toLowerCase()
            ) || parsed[0];

          if (isMounted) {
            setCareerData(found || null);
          }
        }
      } catch (err) {
        console.warn("Failed to load career data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCareer();
    return () => {
      isMounted = false;
    };
  }, [careerName]);

  const dynamicRoles = useMemo(() => {
    if (!careerData) return [];

    const cName = careerData["Career Name"] || "Specialist";
    const entryPay = careerData["Entry Salary (LPA)"] ? `₹${careerData["Entry Salary (LPA)"]} LPA` : "₹5–8 LPA";
    const midPay = careerData["Mid Salary (LPA)"] ? `₹${careerData["Mid Salary (LPA)"]} LPA` : "₹12–20 LPA";
    const seniorPay = careerData["Senior Salary (LPA)"] ? `₹${careerData["Senior Salary (LPA)"]} LPA` : "₹25–50 LPA";
    const topPay = careerData["Top Earnings (LPA)"] ? `${careerData["Top Earnings (LPA)"]}` : "₹70L–1 Cr+";

    const skills = (careerData["Core Skills"] || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const mainTask = careerData["What They Do"] || "Executing project deliverables and system maintenance.";
    const entryPath = careerData["Entry Path"] || "Formal degree or industry certifications paired with capstone projects.";
    const certs = careerData["Key Certifications"] || "Recognized professional domain certifications.";

    return [
      {
        key: "tier_intern",
        title: `Associate / Junior ${cName}`,
        category: "Entry Level (0–2 Yrs)",
        salary: entryPay,
        experienceTier: "Entry Level (0–2 Years)",
        icon: Code,
        matchScore: 95,
        tagline: `Master core fundamentals, assist senior teams with ${skills[0] || "tasks"}, and build real project experience.`,
        summary: `Entry-level role focusing on foundational competencies in ${cName}. Supports project workflows, data validation, and basic technical execution under mentor guidance.`,
        keyTasks: [
          `Learning industry workflows and supporting ${skills[0] || "primary"} deliverables.`,
          `Executing test runs, debugging initial issues, and validating pipelines.`,
          `Writing documentation, simple scripts, and reviewing empirical metrics.`,
          `Participating in daily team standups and technical knowledge transfers.`,
        ],
        preparation: `${careerData["Degree Required"] || "Bachelor's Degree"} or certified portfolio projects. Recommended: ${certs}. Path: ${entryPath}.`,
        dailyFocus: "Hands-on learning, assisting senior engineers with code reviews, and resolving foundational tickets.",
      },
      {
        key: "tier_engineer",
        title: `${cName}`,
        category: "Mid Level (3–7 Yrs)",
        salary: midPay,
        experienceTier: "Mid Level (3–7 Years)",
        icon: Brain,
        matchScore: 92,
        tagline: `Design, build, and deploy production systems using ${skills.slice(0, 2).join(" & ")}.`,
        summary: careerData["One-Line Summary"] || `Responsible for end-to-end delivery of ${cName} solutions in production environments.`,
        keyTasks: [
          mainTask,
          `Developing scalable features utilizing ${skills.slice(0, 3).join(", ") || "core tools"}.`,
          `Monitoring performance dashboards and optimizing execution latency.`,
          `Cross-functional collaboration with product managers, QA, and operations teams.`,
        ],
        preparation: `2-5 years practical industry experience with deep mastery of ${skills.slice(0, 3).join(", ") || "domain tools"}.`,
        dailyFocus: "Core technical development, sprint feature delivery, and performance optimizations.",
      },
      {
        key: "tier_senior",
        title: `Senior ${cName}`,
        category: "Senior Level (8+ Yrs)",
        salary: seniorPay,
        experienceTier: "Senior Level (8+ Years)",
        icon: Sparkles,
        matchScore: 88,
        tagline: "Lead complex architectural designs, conduct rigorous peer reviews, and mentor engineers.",
        summary: `Leads complex project streams in ${cName}, resolves non-trivial systemic roadblocks, and establishes coding and quality standards.`,
        keyTasks: [
          `Architecting resilient and scalable infrastructure for ${cName} systems.`,
          `Conducting comprehensive technical design reviews and mentoring junior/mid team members.`,
          `Resolving high-severity system incidents and optimizing core reliability.`,
          `Collaborating with senior leadership to shape technical roadmaps.`,
        ],
        preparation: `5+ years delivering scalable solutions, deep systems design acumen, and demonstrated technical leadership.`,
        dailyFocus: "Architecture design, code review leadership, complex debugging, and team mentoring.",
      },
      {
        key: "tier_lead",
        title: `Director / Lead ${cName}`,
        category: "Elite Roles (Top 1%)",
        salary: topPay,
        experienceTier: "Executive Leadership",
        icon: UserCheck,
        matchScore: 84,
        tagline: `Define organizational strategy, allocate infrastructure budgets, and spearhead technical vision.`,
        summary: `Executive role steering long-term vision, technology stack investments, and high-impact cross-functional initiatives for ${cName}.`,
        keyTasks: [
          `Defining organizational technical vision and multi-year product strategy.`,
          `Managing multidisciplinary team structures and key engineering headcount.`,
          `Aligning technical roadmap milestones with executive business ROI.`,
          `Representing technical strategy to executive stakeholders and external partners.`,
        ],
        preparation: `10+ years of technical leadership, track record of managing engineering organizations, and strategic foresight.`,
        dailyFocus: "Strategic planning, organizational alignment, executive steering, and technology investments.",
      },
    ];
  }, [careerData]);

  const filteredRoles = useMemo(() => {
    return dynamicRoles.filter((role) => {
      if (activeTab === "entry") return role.category.includes("Entry Level");
      if (activeTab === "mid_senior")
        return role.category.includes("Mid Level") || role.category.includes("Senior Level");
      if (activeTab === "leadership")
        return role.category.includes("Executive") || role.category.includes("Elite Roles");
      return true;
    });
  }, [dynamicRoles, activeTab]);

  const handleOpenRoleDetail = (key) => {
    setSelectedRoleKey(key);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedRoleKey(null);
  };

  if (currentView === "detail" && selectedRoleKey) {
    const role = dynamicRoles.find((r) => r.key === selectedRoleKey) || dynamicRoles[0];
    return <RoleDetail role={role} onBack={handleBackToList} />;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 sm:px-6 lg:px-10 font-sans text-left">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#1E88E5]">
              {careerData ? careerData["Cluster"] || "Specialization Track" : "Specialization Track"}
            </span>
            <h1 className="font-sans text-3xl font-bold tracking-tight text-[#0b1a36] sm:text-4xl">
              {careerData ? careerData["Career Name"] : "Career Reality Trajectory"}
            </h1>
            <p className="max-w-3xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Explore dynamic progression stages spanning entry-level, senior, and executive pathways. Click any role
              card to open its dedicated day-to-day breakdown.
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-xs transition hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition shadow-2xs cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#0b1a36] text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4 pt-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 h-28" />
            ))}
          </div>
        ) : (
          /* Roles List */
          <div className="space-y-4 pt-2">
            {filteredRoles.map((role) => {
              const IconComponent = role.icon;

              return (
                <div
                  key={role.key}
                  onClick={() => handleOpenRoleDetail(role.key)}
                  className="group flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#D3E3F5] bg-white p-5 cursor-pointer transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 shadow-xs sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] text-[#1E88E5] shadow-2xs transition group-hover:bg-[#EAF2FA]">
                      <IconComponent size={20} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-sans text-base font-bold text-slate-900 transition group-hover:text-[#0b1a36]">
                          {role.title}
                        </h3>
                        <span className="rounded-full border border-slate-200 bg-[#F0F6FC] px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {role.category}
                        </span>
                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-[#1E88E5]">
                          {role.salary}
                        </span>
                      </div>
                      <p className="max-w-2xl text-xs leading-relaxed text-slate-600">{role.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end shrink-0 sm:self-center">
                    <button
                      type="button"
                      aria-label="View role details"
                      className="grid h-10 w-10 place-items-center rounded-full bg-[#0b1a36] text-white transition-all group-hover:bg-[#122b59] shadow-xs cursor-pointer"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}