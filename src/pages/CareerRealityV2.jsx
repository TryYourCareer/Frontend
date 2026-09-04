import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Activity,
  ShieldCheck,
  Download,
  BookOpen,
  Sparkles,
  Star,
} from "lucide-react";
import CareerReality from "./CareerReality";
import { useNavigate } from "react-router-dom";
import { getCareerFitReport } from "../services/discoveryTest";

const CAREER_TEMPLATES = [
  {
    key: "aiEngineer",
    title: "AI / ML Engineer",
    subtitle: "Artificial Intelligence",
    category: "Technology",
    description:
      "Your analytical precision and love for patterns make you a natural fit for translating complex data into strategic business insights.",
    matchPercentage: 95,
    starRating: 5.0,
    skillTags: ["Machine Learning", "Python & SQL", "Data Pipeline", "Mathematics"],
    strengths: [
      { label: "Technical Aptitude", percent: 95 },
      { label: "Investigative Aptitude", percent: 84 },
      { label: "Leadership Aptitude", percent: 79 },
    ],
    reports: [
      { label: "6D Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
  },
  {
    key: "businessAnalyst",
    title: "Business Analyst",
    subtitle: "Business Intelligence",
    category: "Business & Development",
    description:
      "Your logical reasoning and stakeholder skills make you ideal for turning business challenges into data-backed decisions.",
    matchPercentage: 92,
    starRating: 4.8,
    skillTags: ["Analytical Thinking", "Business Strategy", "Dashboarding"],
    strengths: [
      { label: "Entrepreneurial Aptitude", percent: 92 },
      { label: "Investigative Aptitude", percent: 88 },
      { label: "Leadership Aptitude", percent: 83 },
    ],
    reports: [
      { label: "6D Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
  },
  {
    key: "uiUxDesigner",
    title: "UI/UX Designer",
    subtitle: "Design Leadership",
    category: "Creative Product",
    description:
      "Your empathy for users and visual problem-solving make you a strong candidate for creating intuitive, delightful digital experiences.",
    matchPercentage: 88,
    starRating: 4.5,
    skillTags: ["User Research", "Wireframing", "Interaction Design"],
    strengths: [
      { label: "Creative Aptitude", percent: 94 },
      { label: "Social Aptitude", percent: 82 },
      { label: "Technical Aptitude", percent: 75 },
    ],
    reports: [
      { label: "6D Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
  },
  {
    key: "cyberSecurityAnalyst",
    title: "Cyber Security Analyst",
    subtitle: "Security & Risk",
    category: "Security",
    description:
      "Your attention to detail and risk-focused mindset make you a natural fit for defending systems and analyzing threats.",
    matchPercentage: 90,
    starRating: 4.7,
    skillTags: ["Threat Detection", "Risk Analysis", "Incident Response"],
    strengths: [
      { label: "Technical Aptitude", percent: 95 },
      { label: "Investigative Aptitude", percent: 89 },
      { label: "Leadership Aptitude", percent: 84 },
    ],
    reports: [
      { label: "6D Personality Profile", icon: BarChart3 },
      { label: "Interest Assessment", icon: Activity },
      { label: "Aptitude Report", icon: ShieldCheck },
    ],
    roadmapTitle: "Want to see your detailed roadmap?",
    roadmapDescription:
      "Every match comes with a curated learning path, mentorship opportunities, and industry certifications to get you started.",
  },
];

export default function CareerRealityV2({ onBack }) {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("results");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDynamicReport() {
      const sessionId = localStorage.getItem("latest_test_session_id");
      if (!sessionId) return;
      try {
        setLoading(true);
        const data = await getCareerFitReport(sessionId);
        if (data && data.top_matches && data.top_matches.length > 0) {
          setReportData(data);
        }
      } catch (err) {
        console.warn("Unable to fetch career fit report for reality check:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDynamicReport();
  }, []);

  const dynamicMatches = useMemo(() => {
    if (!reportData || !reportData.top_matches || reportData.top_matches.length === 0) {
      return CAREER_TEMPLATES;
    }

    const vector = reportData.dimension_vector || {};
    const strengthsFromVector = Object.entries(vector)
      .map(([dim, val]) => ({
        label: dim.charAt(0).toUpperCase() + dim.slice(1) + " Aptitude",
        percent: Math.round((val || 0.5) * 100),
      }))
      .sort((a, b) => b.percent - a.percent);

    return reportData.top_matches.map((m, idx) => ({
      key: `match-${idx}`,
      title: m.career_name,
      subtitle: m.sector || m.cluster,
      category: m.sector || m.cluster,
      description: m.why_it_fits,
      matchPercentage: m.similarity_score,
      starRating: m.star_rating,
      skillTags: m.key_skills && m.key_skills.length > 0 ? m.key_skills : ["Problem Solving", "Domain Analysis"],
      strengths: strengthsFromVector.slice(0, 3),
      reports: [
        { label: "6D Personality Fit", icon: BarChart3 },
        { label: "RIASEC Vector Assessment", icon: Activity },
        { label: "Stage 2 Reflection Insights", icon: ShieldCheck },
      ],
      roadmapTitle: `Want to see your detailed roadmap for ${m.career_name}?`,
      roadmapDescription: m.why_it_fits,
    }));
  }, [reportData]);

  const activeCareer = dynamicMatches[selectedIndex] || dynamicMatches[0];

  if (activePage === "realityDetail") {
    return <CareerReality onBack={() => setActivePage("results")} />;
  }

  return (
    <section className="min-h-screen bg-[#FAF6EC] px-4 py-8 sm:px-6 lg:px-10 text-left">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-5 md:px-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#FAF2DB] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Sparkles size={14} className="text-[#7B4A28]" />
                {reportData ? "Dynamic Assessment Matches" : "Career Reality Check"}
              </span>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Your Suggested Career Paths
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                {reportData
                  ? "Based on your 6D RIASEC vector and Stage 2 reflection assessment, here are your top recommended career trajectories."
                  : "Explore real-world career trajectories, core skill requirements, and practical roadmaps to guide your career decisions."}
              </p>
            </div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
          </div>
        </div>

        {!reportData && !loading && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Unlock Personalized Match Scores</p>
              <p className="text-xs text-slate-700">Take the 15-minute Discovery Assessment to generate your dynamic 6D RIASEC career fit scores.</p>
            </div>
            <button
              onClick={() => navigate("/assessment")}
              className="px-4 py-2 bg-[#7B4A28] hover:bg-[#633a1f] text-white text-xs font-bold rounded-xl transition shadow"
            >
              Take Discovery Test
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {dynamicMatches.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={item.key || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`group flex flex-col justify-between rounded-3xl border p-5 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-slate-800 bg-[#FAF2DB]/80 shadow-sm"
                    : "border-slate-300 bg-white hover:border-slate-400 hover:shadow-sm"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {item.subtitle}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.starRating && (
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star size={12} className="fill-amber-400 text-amber-400 mr-0.5" />
                          <span>{item.starRating}</span>
                        </div>
                      )}
                      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                        {item.matchPercentage}% Match
                      </span>
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.description}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.skillTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(idx);
                      navigate(`/career-details/${encodeURIComponent(item.title)}`);
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#7B4A28] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#633a1f]"
                  >
                    <BookOpen size={13} />
                    Explore Reality
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(idx);
                      navigate(`/roadmap?career=${encodeURIComponent(item.title)}`);
                    }}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50"
                  >
                    <ArrowRight size={13} />
                    Roadmap
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-300 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Selected Role Strengths</p>
                <h3 className="mt-1 font-serif text-lg font-bold text-slate-900">{activeCareer.title}</h3>
              </div>
              <span className="rounded-full bg-[#FAF2DB] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0b1a36]">
                {activeCareer.strengths[0]?.percent || 90}% Aptitude
              </span>
            </div>
            <div className="mt-6 space-y-5">
              {activeCareer.strengths.map((strength) => (
                <div key={strength.label}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-800">{strength.label}</p>
                    <span className="text-xs font-semibold text-slate-500">{strength.percent}%</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#7B4A28]" style={{ width: `${strength.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-300 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Analytic Reports</p>
                <h3 className="mt-1 font-serif text-lg font-bold text-slate-900">Diagnostic Reports</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800">
                3 reports
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {activeCareer.reports.map((rep) => {
                const Icon = rep.icon;
                return (
                  <div key={rep.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm">
                        <Icon size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{rep.label}</p>
                        <p className="text-[10px] text-slate-500">Download or view your insights</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const sid = localStorage.getItem("latest_test_session_id");
                        if (sid) navigate(`/career-report/${sid}`);
                      }}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-800 transition hover:bg-slate-300"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-[#3D1F08] p-5 text-white sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400">Action Roadmap</p>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-white">{activeCareer.roadmapTitle}</h3>
              <p className="max-w-2xl text-xs leading-relaxed text-amber-100/90">{activeCareer.roadmapDescription}</p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={() => navigate(`/roadmap?career=${encodeURIComponent(activeCareer.title)}`)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-slate-50"
              >
                <ArrowRight size={14} />
                View Full Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}