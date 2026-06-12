import { useState } from "react";
import { ArrowLeft, Clock, TrendingUp, Activity, CheckCircle2, DollarSign, Wrench, BookOpen, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

const careerData = {
  title: "Software Engineer",
  tagline: "Build products, solve problems, and ship real software.",
  demandBadge: "High Demand – 12% Growth",
  medianSalary: "₹15 LPA",
  icon: "💻",
  timeline: [
    { time: "09:00 AM", title: "Standup Meeting", description: "Sync with your team on progress, blockers, and priorities.", icon: "🗣️" },
    { time: "10:00 AM", title: "Deep Work (Coding)", description: "Focus on writing and refining code for a feature or bug fix.", icon: "💻" },
    { time: "02:00 PM", title: "Debugging", description: "Track down issues, reproduce bugs, and verify fixes.", icon: "🔍" },
    { time: "04:00 PM", title: "Code Review", description: "Review teammates' changes and improve code quality together.", icon: "✅" },
  ],
  realityCheck: [
    "You will read a lot of other people's code.",
    "Frequent meetings are part of the job, even on coding days.",
    "Debugging can be frustrating, but it teaches you how systems work.",
  ],
  proInsights: [
    "Beginner mistake: copy-pasting without understanding the flow.",
    "Real-world skills: clear communication and code readability.",
    "College rarely prepares you for complex legacy systems.",
  ],
  hardSkills: ["JavaScript", "Python", "React", "Git", "SQL", "AWS"],
  softSkills: ["Problem Solving", "Communication", "Teamwork", "Adaptability"],
  educationPathways: ["B.S. Computer Science", "Coding Bootcamps", "Self-Learning"],
};

const TABS = [
  { key: "day", label: "Day in the Life", icon: Clock },
  { key: "reality", label: "Reality Check", icon: AlertCircle },
  { key: "pro", label: "Pro Insights", icon: TrendingUp },
];

export default function CareerReality({ onBack }) {
  const [activeTab, setActiveTab] = useState("day");

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Back button */}
          {onBack && (
            <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-[#d2d9ea] bg-white px-4 py-2 text-sm font-semibold text-[#3d4f71] transition hover:bg-[#eef2f9] hover:-translate-y-0.5">
              <ArrowLeft size={16} />
              Back to Home
            </button>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr] lg:items-start">
            <div className="space-y-5">

              {/* Career header card */}
              <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.08)] sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#eef5ff] text-3xl shadow-sm">
                      {careerData.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#4f6d97]">Career Reality Check</p>
                      <h1 className="mt-1.5 text-2xl font-black text-[#0f2140] sm:text-3xl">{careerData.title}</h1>
                      <p className="mt-2 text-sm leading-relaxed text-[#52617a] sm:text-base">{careerData.tagline}</p>
                    </div>
                  </div>

                  <div className="shrink-0 space-y-2 rounded-2xl border border-[#e8edf7] bg-[#fbfcff] p-4 text-sm text-[#425672] sm:w-60">
                    <div className="flex items-center gap-2 rounded-xl bg-[#eef4ff] px-3 py-2.5 text-[#2649a7]">
                      <Activity size={14} />
                      {careerData.demandBadge}
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-[#f7f8fc] px-3 py-2.5 font-semibold text-[#152d55]">
                      <DollarSign size={14} />
                      Median: {careerData.medianSalary}
                    </div>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f5fde] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#274fc4]">
                      <TrendingUp size={14} />
                      Start Trial Mission
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs card */}
              <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8">
                <div className="flex flex-wrap gap-2 border-b border-[#e6ebf4] pb-4">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button key={key} type="button" onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === key ? "bg-[#2f5fde] text-white shadow-[0_8px_18px_rgba(47,93,222,0.22)]" : "bg-[#f2f5fb] text-[#5c6f8e] hover:bg-[#e8eef9]"}`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 min-h-[260px] cc-fadein">
                  {activeTab === "day" && (
                    <div className="space-y-5">
                      <p className="text-sm leading-relaxed text-[#4a5f7f]">This career is built around focus, collaboration, and consistent problem solving. Here's what a realistic day can look like.</p>
                      <ul className="space-y-5 border-l-2 border-[#dbe2ef] pl-6">
                        {careerData.timeline.map((item) => (
                          <li key={item.time} className="relative pl-2">
                            <span className="absolute -left-[1.85rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#3b82f6] bg-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-base">{item.icon}</span>
                              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#556987]">{item.time}</span>
                            </div>
                            <h3 className="mt-1.5 text-base font-bold text-[#10213f]">{item.title}</h3>
                            <p className="mt-0.5 text-sm leading-relaxed text-[#445371]">{item.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === "reality" && (
                    <div className="space-y-4 cc-fadein">
                      <h2 className="flex items-center gap-2 text-xl font-bold text-[#10213f]">
                        <AlertCircle size={20} className="text-amber-500" />
                        The Unglamorous Truth
                      </h2>
                      <p className="text-sm leading-relaxed text-[#4a5f7f]">Software engineering is exciting, but it also comes with real challenges. Students should know that the job often includes time-consuming maintenance work, collaboration overhead, and repeated debugging cycles.</p>
                      <ul className="space-y-2.5">
                        {careerData.realityCheck.map((point) => (
                          <li key={point} className="flex items-start gap-3 rounded-2xl border border-[#e6edf7] bg-[#f7f9fd] px-4 py-3">
                            <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-400" />
                            <span className="text-sm text-[#425672]">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === "pro" && (
                    <div className="space-y-4 cc-fadein">
                      <h2 className="flex items-center gap-2 text-xl font-bold text-[#10213f]">
                        <TrendingUp size={20} className="text-blue-500" />
                        Pro Insights
                      </h2>
                      <ul className="space-y-2.5">
                        {careerData.proInsights.map((insight) => (
                          <li key={insight} className="flex items-start gap-3 rounded-2xl border border-[#e6edf7] bg-[#f7f9fd] px-4 py-3">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-blue-400" />
                            <span className="text-sm text-[#425672]">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5 lg:sticky lg:top-8">
              <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#10213f]">
                  <Wrench size={16} className="text-blue-500" />
                  Core Tools & Skills
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {careerData.hardSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-[#eef3ff] px-3.5 py-1.5 text-sm font-semibold text-[#2f4b9f]">{skill}</span>
                  ))}
                </div>
                <div className="mt-5">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#5c718f]">
                    <Activity size={12} />
                    Soft Skills
                  </h3>
                  <div className="mt-3 grid gap-2">
                    {careerData.softSkills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 rounded-xl border border-[#d8e2f6] bg-[#f7f9fd] px-3.5 py-2 text-sm text-[#405b81]">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#10213f]">
                  <BookOpen size={16} className="text-violet-500" />
                  Education Pathways
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {careerData.educationPathways.map((pathway) => (
                    <li key={pathway} className="flex items-center gap-3 rounded-xl border border-[#e6edf7] bg-[#f7f9fd] px-4 py-3 text-sm text-[#4a5f7d]">
                      <GraduationCapIcon />
                      {pathway}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function GraduationCapIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
