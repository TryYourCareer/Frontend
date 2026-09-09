import { ClipboardList, CheckCircle2, Zap, Flame, TrendingUp, Sparkles, ArrowRight, BarChart3, Target, Play, User, BookOpen, Briefcase, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/users";

// ── Harmonious Light Pastel Multi-Color Palette ─────────────────────────────
const dashboardData = {
  userName: "Jane",
  stats: [
    { label: "Assessments",    value: "3/3",          icon: ClipboardList, bg: "bg-sky-50",     border: "border-sky-200",     iconColor: "#1E88E5",  textColor: "#0b1a36"  },
    { label: "Missions Done",  value: "12 Completed", icon: CheckCircle2,  bg: "bg-emerald-50", border: "border-emerald-200", iconColor: "#059669",  textColor: "#065f46"  },
    { label: "Skills Unlocked",value: "8 Active",     icon: Zap,           bg: "bg-purple-50",  border: "border-purple-200",  iconColor: "#7c3aed",  textColor: "#5b21b6"  },
    { label: "Streak",         value: "5 Days",       icon: Flame,         bg: "bg-amber-50",   border: "border-amber-200",   iconColor: "#d97706",  textColor: "#92400e"  },
  ],
  compatibility: [
    { label: "Software Engineering", value: 92, color: "#1E88E5" },
    { label: "UX Design",            value: 78, color: "#7c3aed" },
    { label: "Product Management",   value: 65, color: "#059669" },
  ],
  skillProfile: {
    labels: ["Problem Solving", "Creativity", "Communication", "Technical", "Leadership", "Adaptability"],
    values:  [85, 74, 78, 88, 68, 81],
  },
  missions: [
    { title: "Frontend Fixer",   subtitle: "Software Engineer · Today",     score: "85%", accent: "#1E88E5" },
    { title: "Wireframe Wizard", subtitle: "UX Designer · Yesterday",       score: "92%", accent: "#7c3aed" },
    { title: "Sprint Planning",  subtitle: "Product Manager · 2 days ago",  score: "—",   accent: "#059669" },
  ],
  recommendations: [
    "Complete Data Science Mission",
    "Read 'Day in the Life: PM'",
  ],
};

/* ── Skeleton helpers ────────────────────────────────────────────────────── */
function Bone({ className = "", style }) {
  return <div className={`animate-pulse rounded-xl bg-[#D3E3F5]/60 ${className}`} style={style} />;
}

function DashboardSkeleton() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header skeleton */}
        <div className="flex flex-col gap-3 border-b border-[#D3E3F5] pb-6">
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
                <div key={i} className="min-h-[118px] rounded-3xl border border-[#D3E3F5] bg-white p-4 flex flex-col justify-between animate-pulse">
                  <div className="flex justify-between">
                    <Bone className="h-2.5 w-16 rounded-full bg-[#D3E3F5]" />
                    <Bone className="h-7 w-7 rounded-2xl bg-[#D3E3F5]" />
                  </div>
                  <Bone className="h-6 w-24 bg-[#D3E3F5]" />
                </div>
              ))}
            </div>

            {/* Metrics row */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-[#D3E3F5] bg-white p-5 space-y-4 shadow-xs">
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
              <div className="rounded-3xl border border-[#D3E3F5] bg-white p-5 shadow-xs space-y-3">
                <Bone className="h-3 w-24 rounded-full" />
                <Bone className="h-40 w-full rounded-2xl" />
              </div>
            </div>

            {/* Missions skeleton */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <Bone className="h-3 w-36 rounded-full" />
                <Bone className="h-6 w-16 rounded-lg" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-[#D3E3F5]/60 bg-[#F0F6FC] p-3">
                  <div className="flex items-center gap-3">
                    <Bone className="h-8 w-8 rounded-2xl flex-shrink-0" />
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
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-5 shadow-xs space-y-4">
              <Bone className="h-3 w-36 rounded-full" />
              {[...Array(2)].map((_, i) => (
                <Bone key={i} className="h-10 w-full rounded-2xl" />
              ))}
              <Bone className="h-9 w-full rounded-2xl" />
            </div>
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-5 shadow-xs space-y-4">
              <Bone className="h-3 w-24 rounded-full" />
              <Bone className="h-28 w-full rounded-2xl" />
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
        <span className="font-semibold">{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#F0F6FC]">
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

const radarColors = ["#1E88E5", "#7c3aed", "#059669", "#1E88E5", "#7c3aed", "#059669"];

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const navigate = useNavigate();
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
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-10 text-slate-800 text-left">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[#D3E3F5] pb-6">
          <span
            className="inline-flex w-fit items-center rounded-full px-3.5 py-1 text-[10px] font-bold tracking-widest uppercase border border-sky-200 bg-sky-50 text-[#1E88E5]"
          >
            STUDENT PORTAL
          </span>
          <h1 className="text-3xl font-serif font-bold leading-tight text-[#0b1a36]">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-xs text-slate-500">You're making great progress on your career discovery journey.</p>

          {/* Profile info pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
            <div className="flex flex-wrap gap-2">
              <InfoPill icon={<User size={11} />} label={fullName} />
              {email !== "—" && <InfoPill icon={<Mail size={11} />} label={email} />}
              {education !== "—" && <InfoPill icon={<BookOpen size={11} />} label={education} />}
              {interest !== "—" && <InfoPill icon={<Briefcase size={11} />} label={interest} />}
            </div>
            <button
              onClick={() => navigate("/assessment")}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0b1a36] hover:bg-[#122b59] text-white text-xs font-bold rounded-full shadow-xs transition shrink-0 cursor-pointer"
            >
              <Sparkles size={14} className="text-[#1E88E5]" />
              <span>View Career Fit Diagnostic</span>
            </button>
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
                    className={`${stat.bg} rounded-3xl p-5 flex flex-col justify-between min-h-[128px] border ${stat.border} shadow-2xs hover:shadow-xs transition`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: stat.textColor }}>
                        {stat.label}
                      </span>
                      <div className="grid h-8 w-8 place-items-center rounded-2xl bg-white shadow-2xs border border-white">
                        <Icon size={15} style={{ color: stat.iconColor }} />
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-serif font-bold" style={{ color: stat.textColor }}>
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
                    Dynamic Compatibility
                  </h3>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold border border-sky-200 bg-sky-50 text-[#1E88E5]"
                  >
                    Live
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  {compatibility.map((item) => (
                    <CompatBar key={item.label} {...item} />
                  ))}
                </div>
              </div>

              {/* Skill Radar */}
              <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
                  Skill Profile
                </h3>
                <div className="mt-4 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-44 w-full">
                    <polygon points="50,5 85,30 85,70 50,95 15,70 15,30" fill="#F0F6FC" stroke="#D3E3F5" strokeWidth="0.8" />
                    <polygon
                      points="50,17 78,36 74,66 50,83 23,66 22,36"
                      fill="#1E88E5"
                      opacity="0.12"
                      stroke="#1E88E5"
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
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
                  <Target size={14} className="text-[#1E88E5]" />
                  Recent Trial Missions
                </h3>
                <button
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition hover:opacity-80 border border-sky-200 bg-sky-50 text-[#1E88E5] cursor-pointer"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {missions.map((mission) => (
                  <div key={mission.title} className="rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-4 hover:bg-[#EAF2FA] transition">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white shadow-2xs border border-sky-100"
                        >
                          <Play size={13} style={{ color: mission.accent }} className="ml-0.5" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800">{mission.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{mission.subtitle}</p>
                        </div>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-xs font-bold border border-[#D3E3F5] bg-white shadow-2xs"
                        style={
                          mission.score === "—"
                            ? { color: "#94a3b8" }
                            : { color: mission.accent }
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
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36]">Your Profile</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <ProfileRow icon={<User size={13} />} label="Name" value={fullName} />
                <ProfileRow icon={<BookOpen size={13} />} label="Education" value={education} />
                <ProfileRow icon={<Briefcase size={13} />} label="Interest" value={interest} />
                {gender !== "—" && <ProfileRow icon={<User size={13} />} label="Gender" value={gender} />}
                {email !== "—" && <ProfileRow icon={<Mail size={13} />} label="Email" value={email} />}
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
                <BarChart3 size={14} className="text-[#1E88E5]" />
                Recommended Next Steps
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {recommendations.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-2xl px-4 py-3 border border-sky-200 bg-sky-50 shadow-2xs"
                  >
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#1E88E5]" />
                    <span className="font-semibold text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold text-white transition hover:bg-[#122b59] bg-[#0b1a36] shadow-xs cursor-pointer"
              >
                <Play size={12} className="ml-0.5" />
                Start Next Mission
              </button>
            </div>

            {/* AI Insights */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
                  <Sparkles size={14} className="text-[#1E88E5]" />
                  AI Insights
                </h3>
                <button className="flex items-center gap-1 text-xs font-bold transition hover:underline text-[#1E88E5] cursor-pointer">
                  Generate <TrendingUp size={12} />
                </button>
              </div>
              <div
                className="rounded-2xl border border-dashed border-[#D3E3F5] bg-[#F0F6FC] p-6 text-center text-xs text-slate-500 shadow-2xs"
              >
                <Sparkles size={22} className="mx-auto mb-2 text-[#1E88E5]" />
                <p className="font-bold text-[#0b1a36]">No Insights Yet</p>
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D3E3F5] bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
      <span className="text-[#1E88E5]">{icon}</span>
      {label}
    </span>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-[#1E88E5]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="font-semibold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}