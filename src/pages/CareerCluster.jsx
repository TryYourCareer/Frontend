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
    <section className="min-h-screen bg-[#FAF6EC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Technology Career Cluster
              </h1>
              <p className="text-sm leading-relaxed text-slate-600">
                The backbone of the modern world. Explore roles that involve building software, analyzing massive datasets, and architecting the next generation of artificial intelligence.
              </p>
            </div>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50"
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
                    : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
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
                className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-left transition duration-200 hover:border-slate-400 hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-slate-200 bg-[#FAF2DB] text-slate-900 shadow-sm">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-slate-900">{career.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{career.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
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