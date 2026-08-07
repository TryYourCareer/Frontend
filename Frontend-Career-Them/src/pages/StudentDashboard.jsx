import { ClipboardList, CheckCircle2, Zap, Flame, TrendingUp, Sparkles, ArrowRight, BarChart3, Target, Play, User, BookOpen, Briefcase, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/users";

// ── Logo-extracted palette ─────────────────────────────────────────────────
const LOGO_BLUE   = "#5B7EC9";
const LOGO_DARK   = "#3D1F08";
const LOGO_MID    = "#7B4A28";
const LOGO_TAN    = "#B8712E";

const dashboardData = {
  userName: "Jane",
  stats: [
    { label: "Assessments",    value: "3/3",          icon: ClipboardList, bg: `bg-[#EEF2FB]`,  iconColor: LOGO_BLUE,  textColor: LOGO_BLUE  },
    { label: "Missions Done",  value: "12 Completed", icon: CheckCircle2,  bg: `bg-[#FBF0E8]`,  iconColor: LOGO_TAN,   textColor: LOGO_TAN   },
    { label: "Skills Unlocked",value: "8 Active",     icon: Zap,           bg: `bg-[#F3E8DF]`,  iconColor: LOGO_MID,   textColor: LOGO_MID   },
    { label: "Streak",         value: "5 Days",       icon: Flame,         bg: `bg-[#F0EAE2]`,  iconColor: LOGO_DARK,  textColor: LOGO_DARK  },
  ],
  compatibility: [
    { label: "Software Engineering", value: 92, color: LOGO_BLUE },
    { label: "UX Design",            value: 78, color: LOGO_MID  },
    { label: "Product Management",   value: 65, color: LOGO_TAN  },
  ],
  skillProfile: {
    labels: ["Problem Solving", "Creativity", "Communication", "Technical", "Leadership", "Adaptability"],
    values:  [85, 74, 78, 88, 68, 81],
  },
  missions: [
    { title: "Frontend Fixer",   subtitle: "Software Engineer · Today",     score: "85%", accent: LOGO_BLUE },
    { title: "Wireframe Wizard", subtitle: "UX Designer · Yesterday",       score: "92%", accent: LOGO_MID  },
    { title: "Sprint Planning",  subtitle: "Product Manager · 2 days ago",  score: "—",   accent: LOGO_TAN  },
  ],
  recommendations: [
    "Complete Data Science Mission",
    "Read 'Day in the Life: PM'",
  ],
};

/* ── Skeleton helpers ────────────────────────────────────────────────────── */
function Bone({ className = "", style }) {
  return <div className={`animate-pulse rounded-xl bg-[#e8dfc8] ${className}`} style={style} />;
}

function DashboardSkeleton() {
  return (
    <section className="min-h-screen bg-[#FAF6EC] px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header skeleton */}
        <div className="flex flex-col gap-3 border-b border-[#e2d9c8] pb-6">
          <Bone className="h-5 w-28 rounded-full" />
          <Bone className="h-8 w-64" />
          <Bone className="h-3 w-72 rounded-full" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          {/* Main column */}
          <div className="space-y-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-h-[118px] rounded-2xl border border-[#e8dfc8] bg-[#f0e9d8] p-4 flex flex-col justify-between animate-pulse">
                  <div className="flex justify-between">
                    <Bone className="h-2.5 w-16 rounded-full bg-[#ddd0b8]" />
                    <Bone className="h-7 w-7 rounded-lg bg-[#ddd0b8]" />
                  </div>
                  <Bone className="h-6 w-24 bg-[#ddd0b8]" />
                </div>
              ))}
            </div>

            {/* Metrics row */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e2d9c8] bg-white p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <Bone className="h-3 w-32 rounded-full" />
                  <Bone className="h-4 w-10 rounded-full" />
                </div>
                {[80, 60, 45].map((w, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <Bone className="h-2.5 w-32 rounded-full" />
                      <Bone className="h-2.5 w-8 rounded-full" />
                    </div>
                    <Bone className="h-1.5 rounded-full" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-[#e2d9c8] bg-white p-5 shadow-sm space-y-3">
                <Bone className="h-3 w-24 rounded-full" />
                <Bone className="h-40 w-full rounded-xl" />
              </div>
            </div>

            {/* Missions skeleton */}
            <div className="rounded-2xl border border-[#e2d9c8] bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <Bone className="h-3 w-36 rounded-full" />
                <Bone className="h-6 w-16 rounded-lg" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#FAF6EC]/40 p-3">
                  <div className="flex items-center gap-3">
                    <Bone className="h-8 w-8 rounded-lg flex-shrink-0" />
                    <div className="space-y-1.5">
                      <Bone className="h-3 w-28 rounded-full" />
                      <Bone className="h-2.5 w-36 rounded-full" />
                    </div>
                  </div>
                  <Bone className="h-6 w-12 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-[#e2d9c8] bg-white p-5 shadow-sm space-y-4">
              <Bone className="h-3 w-36 rounded-full" />
              {[...Array(2)].map((_, i) => (
                <Bone key={i} className="h-10 w-full rounded-xl" />
              ))}
              <Bone className="h-9 w-full rounded-xl" />
            </div>
            <div className="rounded-2xl border border-[#e2d9c8] bg-white p-5 shadow-sm space-y-4">
              <Bone className="h-3 w-24 rounded-full" />
              <Bone className="h-28 w-full rounded-xl" />
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
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
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
      <text x={x} y={y - 6} textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#4B3F35" dominantBaseline="middle">
        {label}
      </text>
    </g>
  );
}

const radarColors = [LOGO_BLUE, LOGO_TAN, LOGO_MID, LOGO_BLUE, LOGO_TAN, LOGO_MID];

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { loading, profile: authProfile } = useAuth();
  const [userData, setUserData] = useState(null);
  const [fetchingUser, setFetchingUser] = useState(false);

  // Use profile from auth context; if not present, fetch from API
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

  // Derive display values from real profile
  const firstName = userData?.name?.split(" ")[0] || "there";
  const fullName  = userData?.name || "—";
  const email     = userData?.email || "—";
  const education = userData?.current_education || "—";
  const interest  = userData?.area_of_interest || "—";
  const gender    = userData?.gender || "—";

  return (
    <section className="min-h-screen bg-[#FAF6EC] px-6 py-10 text-slate-800 text-left">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-6">
          <span
            className="inline-flex w-fit items-center rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest uppercase border"
            style={{ borderColor: LOGO_BLUE, color: LOGO_BLUE, backgroundColor: "#EEF2FB" }}
          >
            STUDENT PORTAL
          </span>
          <h1 className="text-3xl font-serif font-bold leading-tight" style={{ color: LOGO_DARK }}>
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-xs text-slate-500">You're making great progress on your career discovery journey.</p>

          {/* Profile info pills */}
          <div className="flex flex-wrap gap-2 mt-1">
            <InfoPill icon={<User size={11} />} label={fullName} />
            {email !== "—" && <InfoPill icon={<Mail size={11} />} label={email} />}
            {education !== "—" && <InfoPill icon={<BookOpen size={11} />} label={education} />}
            {interest !== "—" && <InfoPill icon={<Briefcase size={11} />} label={interest} />}
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
                    className={`${stat.bg} rounded-2xl p-4 flex flex-col justify-between min-h-[118px] border border-white/60 shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={{ color: stat.textColor }}>
                        {stat.label}
                      </span>
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/70">
                        <Icon size={14} style={{ color: stat.iconColor }} />
                      </div>
                    </div>
                    <p className="mt-4 text-xl font-serif font-bold" style={{ color: stat.textColor }}>
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Metrics Row */}
            <div className="grid gap-6 sm:grid-cols-2">

              {/* Compatibility */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: LOGO_DARK }}>
                    Dynamic Compatibility
                  </h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                    style={{ backgroundColor: "#EEF2FB", color: LOGO_BLUE }}
                  >
                    Live
                  </span>
                </div>
                <div className="mt-5 space-y-3.5">
                  {compatibility.map((item) => (
                    <CompatBar key={item.label} {...item} />
                  ))}
                </div>
              </div>

              {/* Skill Radar */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: LOGO_DARK }}>
                  Skill Profile
                </h3>
                <div className="mt-4 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-44 w-full">
                    <polygon points="50,5 85,30 85,70 50,95 15,70 15,30" fill="#FAF6EC" stroke="#e2e8f0" strokeWidth="0.8" />
                    <polygon
                      points="50,17 78,36 74,66 50,83 23,66 22,36"
                      fill={LOGO_BLUE}
                      opacity="0.12"
                      stroke={LOGO_BLUE}
                      strokeWidth="1"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: LOGO_DARK }}>
                  <Target size={12} style={{ color: LOGO_BLUE }} />
                  Recent Trial Missions
                </h3>
                <button
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition hover:opacity-80"
                  style={{ backgroundColor: "#EEF2FB", color: LOGO_BLUE }}
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {missions.map((mission) => (
                  <div key={mission.title} className="rounded-xl border border-slate-100 bg-[#FAF6EC]/40 p-3 hover:bg-[#FAF6EC]/80 transition">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                          style={{ backgroundColor: `${mission.accent}18` }}
                        >
                          <Play size={12} style={{ color: mission.accent }} className="ml-0.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{mission.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{mission.subtitle}</p>
                        </div>
                      </div>
                      <div
                        className="rounded-md px-3 py-1.5 text-xs font-bold"
                        style={
                          mission.score === "—"
                            ? { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                            : { backgroundColor: `${mission.accent}15`, color: mission.accent }
                        }
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
            <div className="rounded-2xl border border-[#e2d9c8] bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: LOGO_DARK }}>Your Profile</h3>
              <div className="space-y-2.5 text-xs text-slate-600">
                <ProfileRow icon={<User size={12} />} label="Name" value={fullName} />
                <ProfileRow icon={<BookOpen size={12} />} label="Education" value={education} />
                <ProfileRow icon={<Briefcase size={12} />} label="Interest" value={interest} />
                {gender !== "—" && <ProfileRow icon={<User size={12} />} label="Gender" value={gender} />}
                {email !== "—" && <ProfileRow icon={<Mail size={12} />} label="Email" value={email} />}
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: LOGO_DARK }}>
                <BarChart3 size={12} style={{ color: LOGO_TAN }} />
                Recommended Next Steps
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                {recommendations.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 border"
                    style={{ backgroundColor: "#FBF0E8", borderColor: "#f0d8c4" }}
                  >
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: LOGO_TAN }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: LOGO_DARK }}
              >
                <Play size={12} className="ml-0.5" />
                Start Next Mission
              </button>
            </div>

            {/* AI Insights */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: LOGO_DARK }}>
                  <Sparkles size={12} style={{ color: LOGO_BLUE }} />
                  AI Insights
                </h3>
                <button className="flex items-center gap-1 text-[10px] font-bold transition hover:opacity-70" style={{ color: LOGO_BLUE }}>
                  Generate <TrendingUp size={11} />
                </button>
              </div>
              <div
                className="mt-4 rounded-xl border border-dashed p-5 text-center text-xs text-slate-500"
                style={{ backgroundColor: "#EEF2FB30", borderColor: `${LOGO_BLUE}40` }}
              >
                <Sparkles size={20} className="mx-auto mb-2.5" style={{ color: `${LOGO_BLUE}80` }} />
                <p className="font-bold" style={{ color: LOGO_DARK }}>No Insights Yet</p>
                <p className="mt-1">Click the button above to generate personalized insights.</p>
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2d9c8] bg-white px-3 py-1 text-[11px] font-medium text-slate-600">
      <span style={{ color: LOGO_MID }}>{icon}</span>
      {label}
    </span>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0" style={{ color: LOGO_MID }}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}
