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

export default function CareerCluster({ onBack }) {
  const [activeTab, setActiveTab] = useState("All Roles");

  return (
    <section className="min-h-screen bg-[#f4f6ff] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[32px] border border-[#d9e4ff] bg-white p-8 shadow-[0_24px_80px_rgba(37,78,181,0.08)]">
          <div className="space-y-8">
            <div className="flex flex-col gap-6 lg:gap-8">
              <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <h1 className="text-4xl font-black tracking-[-0.04em] text-[#08184a] sm:text-5xl">
                    Technology Career Cluster
                  </h1>
                  <p className="text-sm leading-7 text-[#5f6f8f] sm:text-base">
                    The backbone of the modern world. Explore roles that involve building software, analyzing massive datasets, and architecting the next generation of artificial intelligence.
                  </p>
                </div>
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d7defd] bg-white text-[#354d85] transition hover:bg-[#f6f7ff]"
                  >
                    <ArrowLeft size={18} />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      tab === activeTab
                        ? "bg-[#3748ff] text-white shadow-[0_10px_30px_rgba(55,72,255,0.16)]"
                        : "bg-[#f4f6fb] text-[#5c6b92] hover:bg-[#eef2ff]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {CAREERS.map((career) => {
                const Icon = career.icon;
                return (
                  <button
                    key={career.title}
                    type="button"
                    className="w-full rounded-[28px] border border-[#e7ecff] bg-[#ffffff] p-5 text-left shadow-[0_10px_30px_rgba(23,51,132,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(23,51,132,0.12)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#eef3ff] text-[#3c5fd1] shadow-sm">
                        <Icon size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-[#0f1f45]">{career.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-[#5b6a8f]">{career.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="rounded-full bg-[#eef4ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2e57c0]">
                          {career.match}
                        </span>
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f7ff] text-[#3d5fd2] transition hover:bg-[#eef2ff]">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
