import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Activity,
  ShieldCheck,
  Download,
  DownloadCloud,
  BookOpen,
} from "lucide-react";
import CareerReality from "./CareerReality";
import { useNavigate } from "react-router-dom";

const CAREER_TEMPLATES = {
  aiEngineer: {
    title: "AI / ML Engineer",
    subtitle: "Artificial Intelligence",
    category: "Technology",
    description:
      "Your analytical precision and love for patterns make you a natural fit for translating complex data into strategic business insights.",
    matchPercentage: 95,
    skillTags: ["Machine Learning", "Python & SQL", "Data Pipeline", "Mathematics"],
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
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
  },
  businessAnalyst: {
    title: "Business Analyst",
    subtitle: "Business Intelligence",
    category: "Business & Development",
    description:
      "Your logical reasoning and stakeholder skills make you ideal for turning business challenges into data-backed decisions.",
    matchPercentage: 92,
    skillTags: ["Analytical Thinking", "Business Strategy", "Dashboarding"],
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
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
  },
  uiUxDesigner: {
    title: "UI/UX Designer",
    subtitle: "Design Leadership",
    category: "Creative Product",
    description:
      "Your empathy for users and visual problem-solving make you a strong candidate for creating intuitive, delightful digital experiences.",
    matchPercentage: 88,
    skillTags: ["User Research", "Wireframing", "Interaction Design"],
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
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
  },
  cyberSecurityAnalyst: {
    title: "Cyber Security Analyst",
    subtitle: "Security & Risk",
    category: "Security",
    description:
      "Your attention to detail and risk-focused mindset make you a natural fit for defending systems and analyzing threats.",
    matchPercentage: 90,
    skillTags: ["Threat Detection", "Risk Analysis", "Incident Response"],
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
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
  },
};

export default function CareerRealityV2({ onBack }) {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("results");
  const [selectedCareerKey, setSelectedCareerKey] = useState("aiEngineer");

  const career = useMemo(
    () => CAREER_TEMPLATES[selectedCareerKey] || CAREER_TEMPLATES.aiEngineer,
    [selectedCareerKey]
  );

  if (activePage === "realityDetail") {
    return <CareerReality onBack={() => setActivePage("results")} />;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-8 sm:px-10 lg:px-12 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E88E5]">
                Assessment Completed
              </span>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-[#0b1a36] sm:text-4xl">
                Your Career Match Results
              </h1>
              <p className="max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                We've analyzed your skills and aspirations. Here are the top professional paths where you're destined to thrive.
              </p>
            </div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            )}
          </div>
        </div>

        {/* Career Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(CAREER_TEMPLATES).map(([key, template]) => {
            const isSelected = selectedCareerKey === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedCareerKey(key)}
                className={`group flex flex-col justify-between rounded-3xl border p-6 cursor-pointer transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 ${
                  isSelected
                    ? "border-[#1E88E5]/40 bg-[#edf3fb] shadow-sm ring-2 ring-[#1E88E5]/20"
                    : "border-[#D3E3F5] bg-white shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full border border-[#D3E3F5] bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {template.subtitle}
                    </span>
                    <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      {template.matchPercentage}% Match
                    </span>
                  </div>
                  <h4 className="font-serif text-xl font-bold text-slate-900 transition group-hover:text-[#0b1a36]">
                    {template.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {template.skillTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-sky-100 bg-[#EAF2FA] px-2.5 py-0.5 text-[10px] font-bold text-[#1E88E5]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCareerKey(key);
                      setActivePage("realityDetail");
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#0b1a36] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#122b59]"
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
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50"
                  >
                    <ArrowRight size={13} />
                    Roadmap
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Stats Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Core Strengths</p>
                <h3 className="mt-1 font-serif text-lg font-bold text-slate-900">Skill Breakdown</h3>
              </div>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E88E5]">
                {career.strengths[0].percent}% Top
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {career.strengths.map((strength) => (
                <div key={strength.label}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-800">{strength.label}</p>
                    <span className="text-xs font-bold text-slate-500">{strength.percent}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf3fb]">
                    <div className="h-full rounded-full bg-[#0b1a36]" style={{ width: `${strength.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Analytic Reports</p>
                <h3 className="mt-1 font-serif text-lg font-bold text-slate-900">Available Insights</h3>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">
                3 reports
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {career.reports.map((report) => {
                const Icon = report.icon;
                return (
                  <div
                    key={report.label}
                    className="flex items-center justify-between rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#D3E3F5] bg-white text-[#1E88E5] shadow-xs">
                        <Icon size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{report.label}</p>
                        <p className="text-[10px] text-slate-500">Download or view your insights</p>
                      </div>
                    </div>
                    <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50">
                      <Download size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Roadmap Footer Banner */}
        <div className="rounded-3xl border border-[#0b1a36] bg-[#0b1a36] p-6 text-white shadow-md sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-400">Roadmap</p>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-white">{career.roadmapTitle}</h3>
              <p className="max-w-2xl text-xs leading-relaxed text-[#dce4ff]">{career.roadmapDescription}</p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={() => navigate(`/roadmap?career=${selectedCareerKey}`)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#0b1a36] shadow-sm transition hover:bg-slate-50"
              >
                <ArrowRight size={14} />
                View Full Roadmap
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/20">
                <DownloadCloud size={14} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}