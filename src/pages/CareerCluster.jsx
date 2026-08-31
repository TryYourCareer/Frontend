import { ArrowLeft, ArrowRight, Cpu, Activity, Sparkles, Box } from "lucide-react";
import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState("All Roles");

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-8 sm:px-10 lg:px-12 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E88E5]">
                Career Cluster
              </span>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-[#0b1a36] sm:text-4xl">
                Technology Career Cluster
              </h1>
              <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                The backbone of the modern world. Explore roles that involve building software, analyzing massive datasets, and architecting the next generation of artificial intelligence.
              </p>
            </div>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50 shrink-0"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition shadow-xs ${
                  tab === activeTab
                    ? "bg-[#0b1a36] text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {CAREERS.map((career) => {
            const Icon = career.icon;
            return (
              <button
                key={career.title}
                type="button"
                onClick={() => onSelectCareer?.(career.title)}
                className="group w-full rounded-3xl border border-[#D3E3F5] bg-white p-5 text-left transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] text-[#1E88E5] shadow-xs transition-colors">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-lg font-bold text-slate-900 transition-colors group-hover:text-[#0b1a36]">
                      {career.title}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {career.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2.5">
                    <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      {career.match} Match
                    </span>
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F6FC] text-slate-700 group-hover:bg-[#0b1a36] group-hover:text-white transition-all border border-[#D3E3F5]">
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