import { ArrowLeft, ClipboardList, CheckCircle2, Zap, Flame, TrendingUp, Sparkles, ArrowRight, BarChart3, Target, Play } from "lucide-react";

const dashboardData = {
  userName: "Jane",
  stats: [
    { label: "Assessments", value: "3/3", tone: "text-[#1f4bb2]", icon: ClipboardList, bg: "bg-[#e4eeff] text-[#2350b2]" },
    { label: "Missions Completed", value: "12", tone: "text-[#1f6f51]", icon: CheckCircle2, bg: "bg-[#dcf6eb] text-[#15794a]" },
    { label: "Skills Unlocked", value: "8", tone: "text-[#8c5bc7]", icon: Zap, bg: "bg-[#ede8ff] text-[#6e3dc0]" },
    { label: "Current Streak", value: "5 Days", tone: "text-[#1f4bb2]", icon: Flame, bg: "bg-[#fff1e0] text-[#b85b00]" },
  ],
  compatibility: [
    { label: "Software Engineering", value: 92, color: "bg-[#1f4bb2]" },
    { label: "UX Design", value: 78, color: "bg-[#18a56b]" },
    { label: "Product Management", value: 65, color: "bg-[#5c6dff]" },
  ],
  skillProfile: {
    labels: ["Problem Solving", "Creativity", "Communication", "Technical", "Leadership", "Adaptability"],
    values: [85, 74, 78, 88, 68, 81],
  },
  missions: [
    { title: "Frontend Fixer", subtitle: "Software Engineer · Today", score: "85%" },
    { title: "Wireframe Wizard", subtitle: "UX Designer · Yesterday", score: "92%" },
    { title: "Sprint Planning", subtitle: "Product Manager · 2 days ago", score: "—" },
  ],
  recommendations: [
    "Complete Data Science Mission",
    "Read ‘Day in the Life: PM’",
  ],
};

function CompatBar({ label, value, color }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-[#425073]">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#e7ecf8]">
        <div className={`${color} h-full rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function RadarDot({ angle, radius, label, value }) {
  const rad = (angle * Math.PI) / 180;
  const x = 50 + Math.cos(rad) * radius;
  const y = 50 + Math.sin(rad) * radius;
  return (
    <g>
      <circle cx={x} cy={y} r="3" fill="#2f5fde" />
      <text x={x} y={y - 8} textAnchor="middle" className="text-[9px] fill-[#22355e]" dominantBaseline="middle">
        {label}
      </text>
    </g>
  );
}

export default function StudentDashboard({ onBack }) {
  const { userName, stats, compatibility, missions, recommendations } = dashboardData;

  return (
    <section className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#3f5a92]">Student Dashboard</p>
            <h1 className="mt-3 text-3xl font-black text-[#0f2140] sm:text-4xl">Welcome back, {userName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#556a8f] sm:text-base">
              You’re making great progress on your career discovery journey.
            </p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#c6d5ea] bg-white px-5 py-2 text-sm font-semibold text-[#2f4bb2] transition hover:bg-[#eef3ff] hover:-translate-y-0.5"
          >
            <ArrowLeft size={15} />
            Back to Home
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.85fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-[28px] border border-[#dce4f5] bg-white p-5 shadow-[0_16px_40px_rgba(60,91,166,0.08)] hover:-translate-y-1 transition">
                    <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${stat.bg}`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#52668f]">{stat.label}</p>
                    <p className={`mt-2 text-3xl font-black ${stat.tone}`}>{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
              <div className="rounded-[32px] border border-[#dce4f5] bg-white p-6 shadow-[0_18px_45px_rgba(60,91,166,0.08)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#3f5a92]">Dynamic Compatibility</p>
                    <p className="mt-2 text-sm text-[#5b6f95]">Updated today</p>
                  </div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f5fde]">
                    Live
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {compatibility.map((item) => (
                    <CompatBar key={item.label} {...item} />
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-[#dce4f5] bg-white p-6 shadow-[0_18px_45px_rgba(60,91,166,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#3f5a92]">Skill Profile</p>
                <div className="mt-6 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-64 w-full">
                    <polygon points="50,5 85,30 85,70 50,95 15,70 15,30" fill="#eef4ff" stroke="#c7d7f0" strokeWidth="0.8" />
                    <polygon
                      points="50,17 78,36 74,66 50,83 23,66 22,36"
                      fill="#3b6de1" opacity="0.16"
                      stroke="#2f5fde"
                      strokeWidth="0.9"
                    />
                    {dashboardData.skillProfile.labels.map((label, index) => {
                      const angle = 90 + index * 60;
                      return (
                        <RadarDot
                          key={label}
                          angle={angle}
                          radius={35}
                          label={label}
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#dce4f5] bg-white p-6 shadow-[0_18px_45px_rgba(60,91,166,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#3f5a92]">
                    <Target size={13} className="text-blue-500" />
                    Recent Trial Missions
                  </p>
                  <p className="mt-2 text-sm text-[#5b6f95]">See your latest progress and mission scores.</p>
                </div>
                <button className="flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#2f5fde] hover:bg-[#e0e9ff]">
                  View All
                  <ArrowRight size={13} />
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {missions.map((mission) => (
                  <div key={mission.title} className="rounded-3xl border border-[#e6edf7] bg-[#f8fbff] p-4 transition hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef4ff] text-[#2f5fde]">
                          <Play size={14} className="ml-0.5" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-[#11244c]">{mission.title}</p>
                          <p className="mt-0.5 text-sm text-[#5b6f95]">{mission.subtitle}</p>
                        </div>
                      </div>
                      <div className={`rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm ${mission.score === "—" ? "bg-[#f7f9fc] text-[#8fa3c1]" : "bg-[#ffffff] text-[#2f5fde]"}`}>
                        {mission.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-[32px] border border-[#dce4f5] bg-white p-6 shadow-[0_18px_45px_rgba(60,91,166,0.08)] lg:sticky lg:top-8">
            <div className="rounded-[28px] border border-[#e8eef9] bg-[#f7faff] p-6">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#3f5a92]">
                <BarChart3 size={13} className="text-blue-500" />
                Recommended Next Steps
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#455b84]">
                {recommendations.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f5fde] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#274fc4] hover:-translate-y-0.5">
                <Play size={13} className="ml-0.5" />
                Start Next Mission
              </button>
            </div>

            <div className="rounded-[28px] border border-[#e8eef9] bg-[#fdfcff] p-6">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#3f5a92]">
                  <Sparkles size={13} className="text-violet-500" />
                  AI-Powered Insights
                </p>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-[#2f5fde] hover:text-[#1c42ab]">
                  Generate
                  <TrendingUp size={12} />
                </button>
              </div>
              <div className="mt-5 rounded-[24px] border border-dashed border-[#d7e0f1] bg-white p-6 text-center text-sm text-[#556a8f]">
                <Sparkles size={24} className="mx-auto mb-3 text-[#c6cfe8]" />
                <p className="font-semibold text-[#2f4bb2]">No Recommendations Yet</p>
                <p className="mt-2">Click the button above to generate your personalized career insights.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
