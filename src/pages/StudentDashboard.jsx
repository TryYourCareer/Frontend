import { ClipboardList, CheckCircle2, Zap, Flame, TrendingUp, Sparkles, ArrowRight, BarChart3, Target, Play, User, BookOpen, Briefcase, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/users";

// ── Refreshed App Color Tokens ──────────────────────────────────────────
const APP_NAVY = "#0b1a36";
const APP_BLUE = "#1E88E5";
const APP_EMERALD = "#10b981";
const APP_AMBER = "#d97706";

const dashboardData = {
  userName: "Jane",
  stats: [
    { label: "Assessments",    value: "3/3",          icon: ClipboardList, bg: "bg-white", border: "border-[#D3E3F5]", iconBg: "bg-[#F0F6FC]", iconColor: APP_BLUE,    textColor: "text-[#0b1a36]" },
    { label: "Missions Done",  value: "12 Completed", icon: CheckCircle2,  bg: "bg-white", border: "border-[#D3E3F5]", iconBg: "bg-[#F0F6FC]", iconColor: APP_EMERALD, textColor: "text-[#0b1a36]" },
    { label: "Skills Unlocked",value: "8 Active",     icon: Zap,           bg: "bg-white", border: "border-[#D3E3F5]", iconBg: "bg-[#F0F6FC]", iconColor: APP_AMBER,   textColor: "text-[#0b1a36]" },
    { label: "Streak",         value: "5 Days",       icon: Flame,         bg: "bg-white", border: "border-[#D3E3F5]", iconBg: "bg-[#F0F6FC]", iconColor: "#ef4444",   textColor: "text-[#0b1a36]" },
  ],
  compatibility: [
    { label: "Software Engineering", value: 92, color: APP_BLUE },
    { label: "UX Design",            value: 78, color: "#8b5cf6" },
    { label: "Product Management",   value: 65, color: APP_AMBER },
  ],
  skillProfile: {
    labels: ["Problem Solving", "Creativity", "Communication", "Technical", "Leadership", "Adaptability"],
    values:  [85, 74, 78, 88, 68, 81],
  },
  missions: [
    { title: "Frontend Fixer",   subtitle: "Software Engineer · Today",     score: "85%", accent: APP_BLUE },
    { title: "Wireframe Wizard", subtitle: "UX Designer · Yesterday",       score: "92%", accent: "#8b5cf6" },
    { title: "Sprint Planning",  subtitle: "Product Manager · 2 days ago",  score: "—",   accent: APP_AMBER },
  ],
  recommendations: [
    "Complete Data Science Mission",
    "Read 'Day in the Life: PM'",
  ],
};

/* ── Skeleton helpers ────────────────────────────────────────────────────── */
function Bone({ className = "", style }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} style={style} />;
}

function DashboardSkeleton() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-8 sm:px-10 lg:px-12 text-slate-800 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header skeleton */}
        <div className="flex flex-col gap-3 border-b border-[#D3E3F5] pb-6">
          <Bone className="h-4 w-28 rounded-full bg-slate-200" />
          <Bone className="h-8 w-64 rounded-xl bg-slate-200" />
          <Bone className="h-3 w-72 rounded-full bg-slate-200" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          {/* Main column */}
          <div className="space-y-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-h-[118px] rounded-3xl border border-[#D3E3F5] bg-white p-5 flex flex-col justify-between shadow-xs">
                  <div className="flex justify-between">
                    <Bone className="h-2.5 w-16 rounded-full bg-slate-200" />
                    <Bone className="h-8 w-8 rounded-xl bg-slate-200" />
                  </div>
                  <Bone className="h-6 w-24 rounded-lg bg-slate-200" />
                </div>
              ))}
            </div>

            {/* Metrics row */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <Bone className="h-3 w-32 rounded-full bg-slate-200" />
                  <Bone className="h-4 w-10 rounded-full bg-slate-200" />
                </div>
                {[80, 60, 45].map((w, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <Bone className="h-2.5 w-32 rounded-full bg-slate-200" />
                      <Bone className="h-2.5 w-8 rounded-full bg-slate-200" />
                    </div>
                    <Bone className="h-1.5 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-3">
                <Bone className="h-3 w-24 rounded-full bg-slate-200" />
                <Bone className="h-40 w-full rounded-2xl bg-slate-200" />
              </div>
            </div>

            {/* Missions skeleton */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <Bone className="h-3 w-36 rounded-full bg-slate-200" />
                <Bone className="h-6 w-16 rounded-lg bg-slate-200" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-3.5">
                  <div className="flex items-center gap-3">
                    <Bone className="h-9 w-9 rounded-xl flex-shrink-0 bg-slate-200" />
                    <div className="space-y-1.5">
                      <Bone className="h-3 w-28 rounded-full bg-slate-200" />
                      <Bone className="h-2.5 w-36 rounded-full bg-slate-200" />
                    </div>
                  </div>
                  <Bone className="h-6 w-12 rounded-md bg-slate-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <Bone className="h-3 w-36 rounded-full bg-slate-200" />
              {[...Array(3)].map((_, i) => (
                <Bone key={i} className="h-8 w-full rounded-xl bg-slate-200" />
              ))}
            </div>
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <Bone className="h-3 w-24 rounded-full bg-slate-200" />
              <Bone className="h-28 w-full rounded-2xl bg-slate-200" />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */
function CompatBar({ label, value, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-700">
        <span className="font-semibold">{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#edf3fb]">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function RadarDot({ angle, radius, label, color }) {
  const rad = (angle * Math.PI) / 180;
  const x   = 50 + Math.cos(rad) * radius;
  const y   = 50 + Math.sin(rad) * radius;
  return (
    <g>
      <circle cx={x} cy={y} r="2.8" fill={color} />
      <text x={x} y={y - 6} textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#0b1a36" dominantBaseline="middle">
        {label}
      </text>
    </g>
  );
}

const radarColors = [APP_BLUE, APP_AMBER, "#8b5cf6", APP_BLUE, APP_AMBER, "#8b5cf6"];

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { loading, profile: authProfile } = useAuth();
  const [userData, setUserData] = useState(null);
  const [fetchingUser, setFetchingUser] = useState(false);

  useEffect(() => {
    if (authProfile) {
      setUserData(authProfile);
      return;
    }
    if (!loading) {
      setFetchingUser(true);
      getUserProfile()
        .then((u) => setUserData(u))
        .catch(() => setUserData(null))
        .finally(() => setFetchingUser(false));
    }
  }, [authProfile, loading]);

  const { stats, compatibility, missions, recommendations } = dashboardData;

  if (loading || fetchingUser) return <DashboardSkeleton />;

  const firstName = userData?.name?.split(" ")[0] || "there";
  const fullName  = userData?.name || "—";
  const email     = userData?.email || "—";
  const education = userData?.current_education || "—";
  const interest  = userData?.area_of_interest || "—";
  const gender    = userData?.gender || "—";

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-8 sm:px-10 lg:px-12 text-slate-800 font-sans text-left">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-[#D3E3F5] pb-6">
          <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase text-[#1E88E5]">
            Student Portal
          </span>
          <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-[#0b1a36] sm:text-4xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
            You're making great progress on your career discovery journey.
          </p>

          {/* Profile info pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            <InfoPill icon={<User size={12} />} label={fullName} />
            {email !== "—" && <InfoPill icon={<Mail size={12} />} label={email} />}
            {education !== "—" && <InfoPill icon={<BookOpen size={12} />} label={education} />}
            {interest !== "—" && <InfoPill icon={<Briefcase size={12} />} label={interest} />}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">

          {/* Main Column */}
          <div className="space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`rounded-3xl p-5 flex flex-col justify-between min-h-[118px] border border-[#D3E3F5] bg-white shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        {stat.label}
                      </span>
                      <div className="grid h-8 w-8 place-items-center rounded-xl border border-[#D3E3F5] bg-[#F0F6FC] shadow-2xs">
                        <Icon size={15} style={{ color: stat.iconColor }} />
                      </div>
                    </div>
                    <p className="mt-4 font-serif text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Metrics Row */}
            <div className="grid gap-6 sm:grid-cols-2">

              {/* Compatibility */}
              <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-slate-900">
                    Dynamic Compatibility
                  </h3>
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-[#1E88E5]">
                    Live
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {compatibility.map((item) => (
                    <CompatBar key={item.label} {...item} />
                  ))}
                </div>
              </div>

              {/* Skill Radar */}
              <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
                <h3 className="font-serif text-base font-bold text-slate-900">
                  Skill Profile
                </h3>
                <div className="mt-4 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-44 w-full">
                    <polygon points="50,5 85,30 85,70 50,95 15,70 15,30" fill="#F0F6FC" stroke="#D3E3F5" strokeWidth="0.8" />
                    <polygon
                      points="50,17 78,36 74,66 50,83 23,66 22,36"
                      fill={APP_BLUE}
                      opacity="0.12"
                      stroke={APP_BLUE}
                      strokeWidth="1.2"
                    />
                    {dashboardData.skillProfile.labels.map((label, index) => {
                      const angle = 90 + index * 60;
                      return (
                        <RadarDot key={label} angle={angle} radius={33} label={label} color={radarColors[index]} />
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Trial Missions */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 font-serif text-base font-bold text-slate-900">
                  <Target size={16} className="text-[#1E88E5]" />
                  Recent Trial Missions
                </h3>
                <button className="flex items-center gap-1 text-xs font-bold text-[#1E88E5] hover:underline transition">
                  View All <ArrowRight size={12} />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {missions.map((mission) => (
                  <div key={mission.title} className="rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-4 transition hover:bg-white hover:border-slate-300 hover:shadow-2xs">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#D3E3F5] bg-white shadow-2xs"
                        >
                          <Play size={13} style={{ color: mission.accent }} className="ml-0.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{mission.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{mission.subtitle}</p>
                        </div>
                      </div>
                      <div
                        className="rounded-full border border-[#D3E3F5] bg-white px-3 py-1 text-xs font-bold shadow-2xs"
                        style={{ color: mission.score === "—" ? "#94a3b8" : mission.accent }}
                      >
                        {mission.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-6">

            {/* User Profile Card */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900">Your Profile</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <ProfileRow icon={<User size={14} />} label="Name" value={fullName} />
                <ProfileRow icon={<BookOpen size={14} />} label="Education" value={education} />
                <ProfileRow icon={<Briefcase size={14} />} label="Interest" value={interest} />
                {gender !== "—" && <ProfileRow icon={<User size={14} />} label="Gender" value={gender} />}
                {email !== "—" && <ProfileRow icon={<Mail size={14} />} label="Email" value={email} />}
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
              <h3 className="flex items-center gap-2 font-serif text-base font-bold text-slate-900">
                <BarChart3 size={16} className="text-[#d97706]" />
                Recommended Next Steps
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-700">
                {recommendations.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-2xl border border-sky-100 bg-[#EAF2FA] p-3 text-slate-800"
                  >
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#1E88E5]" />
                    <span className="font-semibold leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#0b1a36] hover:bg-[#122b59] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
              >
                <Play size={12} className="ml-0.5" />
                Start Next Mission
              </button>
            </div>

            {/* AI Insights */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-serif text-base font-bold text-slate-900">
                  <Sparkles size={16} className="text-[#1E88E5]" />
                  AI Insights
                </h3>
                <button className="flex items-center gap-1 text-[11px] font-bold text-[#1E88E5] hover:underline transition">
                  Generate <TrendingUp size={12} />
                </button>
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-[#D3E3F5] bg-[#F0F6FC] p-6 text-center text-xs text-slate-500">
                <Sparkles size={22} className="mx-auto mb-2 text-[#1E88E5]/70" />
                <p className="font-serif font-bold text-slate-900 text-sm">No Insights Yet</p>
                <p className="mt-1 leading-relaxed">Click the button above to generate personalized insights.</p>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </section>
  );
}

/* ── Small helper sub-components ─────────────────────────────────────────── */
function InfoPill({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D3E3F5] bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
      <span className="text-[#1E88E5]">{icon}</span>
      {label}
    </span>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-[#1E88E5]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}