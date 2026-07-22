import { ArrowLeft, ArrowRight, Cpu, Activity, Sparkles, Box, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TABS = ["All Roles", "Trending Now", "Fastest Growing", "Future-Proof"];
const CAREERS = [
  {
    title: "Software Engineer",
    description:
      "Build the digital tools, systems, and applications that shape how the world interacts with technology.",
    match: "98%",
    icon: Cpu,
  },
  {
    title: "Data Scientist",
    description: "Transform raw data into meaningful insights using math and programming.",
    match: "92%",
    icon: Activity,
  },
  {
    title: "AI Engineer",
    description: "Design and implement machine learning models that automate complex tasks.",
    match: "85%",
    icon: Sparkles,
  },
  {
    title: "Full Stack Developer",
    description:
      "Own the entire product lifecycle by bridging the gap between front-end visuals and back-end logic.",
    match: "82%",
    icon: Box,
  },
];

export default function CareerCluster({ onBack, onSelectCareer }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Roles");

  return (
    <section className="min-h-screen bg-[#FAF6EC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumbs Navigation */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-6">
          <span className="cursor-pointer hover:text-slate-900 transition" onClick={() => navigate("/dashboard")}>Home</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="cursor-pointer hover:text-slate-900 transition" onClick={onBack}>Matches</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-slate-900 font-bold">Technology Cluster</span>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
                Technology Career Cluster
              </h1>
              <p className="text-sm text-slate-650 leading-relaxed">
                The backbone of the modern world. Explore roles that involve building software, analyzing massive datasets, and architecting the next generation of artificial intelligence.
              </p>
            </div>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-850 transition hover:bg-slate-55 shadow-sm shrink-0"
              >
                <ArrowLeft size={16} />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  tab === activeTab
                    ? "bg-[#0b1a36] text-white shadow-sm"
                    : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {CAREERS.map((career) => {
            const Icon = career.icon;
            return (
              <button
                key={career.title}
                type="button"
                onClick={() => onSelectCareer?.(career.title)}
                className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-left hover:border-slate-400 hover:shadow-sm transition duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#FAF2DB] text-slate-900 border border-slate-200 shadow-sm shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-slate-900">{career.title}</h2>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{career.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="rounded-full bg-[#FAF2DB]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                      {career.match}
                    </span>
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-800 transition hover:bg-slate-200">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
