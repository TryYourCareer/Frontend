import { useEffect, useState } from "react";
import { isFirebaseReady, saveDocument } from "../utils/firebaseStorage";

const careerData = {
  title: "Software Engineer",
  tagline: "Build products, solve problems, and ship real software.",
  demandBadge: "High Demand – 12% Growth",
  medianSalary: "₹15 LPA",
  icon: "💻",
  timeline: [
    {
      time: "09:00 AM",
      title: "Standup Meeting",
      description: "Sync with your team on progress, blockers, and priorities.",
    },
    {
      time: "10:00 AM",
      title: "Deep Work (Coding)",
      description: "Focus on writing and refining code for a feature or bug fix.",
    },
    {
      time: "02:00 PM",
      title: "Debugging",
      description: "Track down issues, reproduce bugs, and verify fixes.",
    },
    {
      time: "04:00 PM",
      title: "Code Review",
      description: "Review teammates’ changes and improve code quality together.",
    },
  ],
  realityCheck: [
    "You will read a lot of other people’s code.",
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

function TimelineItem({ time, title, description }) {
  return (
    <li className="relative pl-8 pb-8 last:pb-0">
      <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-[#3b82f6] bg-white shadow-sm" />
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#556987]">{time}</div>
      <h3 className="mt-2 text-lg font-bold text-[#10213f]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#445371]">{description}</p>
    </li>
  );
}

export default function CareerReality({ theme = "light", onBack }) {
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("day");

  useEffect(() => {
    if (!isFirebaseReady) {
      return;
    }

    const docId = careerData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    saveDocument("careerReality", docId, {
      title: careerData.title,
      tagline: careerData.tagline,
      demandBadge: careerData.demandBadge,
      medianSalary: careerData.medianSalary,
      icon: careerData.icon,
      timeline: careerData.timeline,
      realityCheck: careerData.realityCheck,
      proInsights: careerData.proInsights,
      hardSkills: careerData.hardSkills,
      softSkills: careerData.softSkills,
      educationPathways: careerData.educationPathways,
      source: "Clear Careers",
    }).catch(() => {
      // Ignore Firestore write failures silently.
    });
  }, []);
  return (
    <section className={`min-h-screen px-4 py-8 sm:px-6 lg:px-10 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#f4f7fb] text-slate-900"}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:grid lg:grid-cols-[1.7fr_0.9fr] lg:items-start">
        {onBack && (
          <button
            onClick={onBack}
            className={`mb-2 inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ${isDark ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" : "border border-[#d2d9ea] bg-white text-[#3d4f71] hover:bg-[#eef2f9]"}`}
          >
            ← Back to Home
          </button>
        )}
        <div className="space-y-6">
          <div className={`rounded-[28px] p-6 shadow-[0_20px_50px_rgba(15,35,80,0.08)] sm:p-8 ${isDark ? "border border-slate-700 bg-slate-900" : "border border-[#dbe2ef] bg-white"}`}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#eef5ff] text-3xl">{careerData.icon}</div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#4f6d97]">Career</p>
                  <h1 className="mt-2 text-3xl font-black text-[#0f2140] sm:text-4xl">{careerData.title}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#52617a] sm:text-base">{careerData.tagline}</p>
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-[#e8edf7] bg-[#fbfcff] p-4 text-sm text-[#425672] shadow-sm sm:w-64">
                <div className="rounded-2xl bg-[#eef4ff] px-4 py-3 text-[#2649a7]">{careerData.demandBadge}</div>
                <div className="rounded-2xl bg-[#f7f8fc] px-4 py-3 font-semibold text-[#152d55]">Median Salary: {careerData.medianSalary}</div>
                <button className="mt-2 w-full rounded-2xl bg-[#2f5fde] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#274fc4]">
                  Start Trial Mission
                </button>
              </div>
            </div>
          </div>

          <div className={`rounded-[28px] p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8 ${isDark ? "border border-slate-700 bg-slate-900" : "border border-[#dbe2ef] bg-white"}`}>
            <div className="flex flex-wrap items-center gap-3 border-b border-[#e6ebf4] pb-4">
              <button
                type="button"
                onClick={() => setActiveTab("day")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeTab === "day"
                    ? "bg-[#2f5fde] text-white shadow-[0_10px_20px_rgba(47,93,222,0.18)]"
                    : "bg-[#f2f5fb] text-[#5c6f8e] hover:bg-[#e8eef9]"
                }`}
              >
                Day in the Life
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reality")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeTab === "reality"
                    ? "bg-[#2f5fde] text-white shadow-[0_10px_20px_rgba(47,93,222,0.18)]"
                    : "bg-[#f2f5fb] text-[#5c6f8e] hover:bg-[#e8eef9]"
                }`}
              >
                Reality Check
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pro")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeTab === "pro"
                    ? "bg-[#2f5fde] text-white shadow-[0_10px_20px_rgba(47,93,222,0.18)]"
                    : "bg-[#f2f5fb] text-[#5c6f8e] hover:bg-[#e8eef9]"
                }`}
              >
                Pro Insights
              </button>
            </div>

            <div className="mt-6 min-h-[260px]">
              {activeTab === "day" && (
                <div className="space-y-6">
                  <p className="text-sm leading-7 text-[#4a5f7f]">
                    This career is built around focus, collaboration, and consistent problem solving. Here’s what a realistic day can look like.
                  </p>
                  <ul className="space-y-6 border-l border-[#dbe2ef] pl-6">
                    {careerData.timeline.map((item) => (
                      <TimelineItem key={item.time} {...item} />
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "reality" && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-[#10213f]">The Unglamorous Truth</h2>
                  <p className="text-sm leading-7 text-[#4a5f7f]">
                    Software engineering is exciting, but it also comes with real challenges. Students should know that the job often includes time-consuming maintenance work, collaboration overhead, and repeated debugging cycles.
                  </p>
                  <ul className="space-y-3">
                    {careerData.realityCheck.map((point) => (
                      <li key={point} className="rounded-3xl border border-[#e6edf7] bg-[#f7f9fd] px-4 py-3 text-sm text-[#425672]">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "pro" && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-[#10213f]">Pro Insights</h2>
                  <ul className="space-y-3">
                    {careerData.proInsights.map((insight) => (
                      <li key={insight} className="rounded-3xl border border-[#e6edf7] bg-[#f7f9fd] px-4 py-3 text-sm text-[#425672]">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-8">
          <div className="space-y-6">
            <div className={`rounded-[28px] p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] ${isDark ? "border border-slate-700 bg-slate-900" : "border border-[#dbe2ef] bg-white"}`}>
              <h2 className="text-xl font-bold text-[#10213f]">Core Tools & Skills</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {careerData.hardSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm font-semibold text-[#2f4b9f]">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5c718f]">Soft Skills</h3>
                <div className="mt-3 grid gap-2">
                  {careerData.softSkills.map((skill) => (
                    <span key={skill} className="rounded-2xl border border-[#d8e2f6] bg-[#f7f9fd] px-4 py-2 text-sm text-[#405b81]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)]">
              <h2 className="text-xl font-bold text-[#10213f]">Education Pathways</h2>
              <ul className="mt-5 space-y-3 text-sm text-[#4a5f7d]">
                {careerData.educationPathways.map((pathway) => (
                  <li key={pathway} className="rounded-3xl border border-[#e6edf7] bg-[#f7f9fd] px-4 py-3">
                    {pathway}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
