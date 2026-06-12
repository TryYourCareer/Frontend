import { ArrowRight, Compass, Users, ShieldCheck, TrendingUp, GraduationCap, BarChart3, Zap } from "lucide-react";

export default function Hero({ onStartDiscovery, onExploreCareers, careersCount = 0, isDark = false }) {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1.1fr_0.9fr]">

        {/* Hero card */}
        <div className={`rounded-[28px] px-6 py-8 sm:px-8 sm:py-10 ${isDark ? "bg-slate-800/60 border border-slate-700/50" : "bg-[#dde5f2]/55 border border-[#c4d4f1]/60"}`}>
          <span className={`cc-body inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold tracking-[0.03em] sm:text-sm ${isDark ? "border-slate-600 bg-slate-700/60 text-cyan-300" : "border-[#c4d4f1] bg-[#dce8fa] text-[#3a63d4]"}`}>
            <Zap size={12} className="shrink-0" />
            THE FUTURE OF CAREER DISCOVERY
          </span>

          <h1 className={`cc-display mt-6 text-[36px] font-black leading-[0.95] tracking-[-0.025em] sm:text-[46px] lg:text-[52px] ${isDark ? "text-slate-50" : "text-[#101c3e]"}`}>
            Stop guessing <br />
            your future. <br />
            <span className="bg-[linear-gradient(90deg,#2f67e3_0%,#3867e7_45%,#5b5be8_100%)] bg-clip-text text-transparent">
              Experience it.
            </span>
          </h1>

          <p className={`cc-body mt-5 max-w-xl text-base leading-relaxed sm:text-lg ${isDark ? "text-slate-400" : "text-[#4f6283]"}`}>
            Eliminate career confusion caused by pressure and trends.
            Discover your true path through structured assessment,
            real-world trials, and evidence-based guidance.
          </p>

          {careersCount > 0 && (
            <div className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${isDark ? "border-slate-600 bg-slate-700/50 text-slate-300" : "border-[#c4d4f1] bg-white/60 text-[#3a63d4]"}`}>
              <BarChart3 size={14} />
              {careersCount}+ careers in our database
            </div>
          )}

          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={onStartDiscovery}
              className="cc-display flex items-center justify-between gap-2 rounded-full bg-[linear-gradient(120deg,#2f67e3_0%,#315fd6_100%)] px-6 py-3.5 text-left text-base font-bold text-white shadow-[0_10px_24px_rgba(46,98,223,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(46,98,223,0.38)] active:translate-y-0 sm:flex-1"
            >
              <span>Start Your Career Discovery Journey</span>
              <ArrowRight size={20} className="shrink-0" />
            </button>

            <button
              onClick={onExploreCareers}
              className={`cc-display flex items-center justify-center gap-2.5 rounded-full border px-5 py-3 text-base font-bold transition hover:-translate-y-0.5 sm:shrink-0 ${isDark ? "border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-700" : "border-[#cdd8ea] bg-[#dce5f3]/55 text-[#304f84] hover:bg-[#ccd8ed]"}`}
            >
              <Compass size={16} />
              Explore Careers
            </button>
          </div>
        </div>

        {/* Feature panel */}
        <div className={`rounded-[28px] border overflow-hidden ${isDark ? "border-slate-700/60 bg-slate-800/50" : "border-[#d2d9e6] bg-[#f2f4f8]"} shadow-[0_13px_26px_rgba(86,102,136,0.14)]`}>
          {/* Window chrome */}
          <div className={`border-b px-4 py-3 sm:px-5 ${isDark ? "border-slate-700/60 bg-slate-900/40" : "border-[#d9dee8] bg-white/40"}`}>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[#ff6560]" />
              <span className="h-3 w-3 rounded-full bg-[#f4bc21]" />
              <span className="h-3 w-3 rounded-full bg-[#16c392]" />
              <span className={`ml-3 h-6 flex-1 rounded-lg ${isDark ? "bg-slate-700" : "bg-[#e0e5ed]"}`} />
            </div>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            <Feature icon={ClipboardListIcon} index="1" title="Direction Assessment" desc="Psychometric & interest routing" tint="blue" isDark={isDark} />
            <Feature icon={ShieldCheck} index="2" title="Reality-Based Intel" desc="Data-driven authentic reality" tint="violet" isDark={isDark} />
            <Feature icon={Users} index="3" title="Career Trial Missions" desc="Experiential micro-internships" tint="green" isDark={isDark} />
            <Feature icon={BarChart3} index="4" title="Dual-Confidence Reports" desc="Actionable analytics for all" tint="amber" isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Ecosystem cards */}
      <div className={`mx-auto mt-8 max-w-6xl rounded-[24px] border p-5 sm:p-8 ${isDark ? "border-slate-700/60 bg-slate-800/40" : "border-[#d9e0ec] bg-[#f7f9fc]"}`}>
        <div className="text-center">
          <h2 className={`cc-display text-xl font-black tracking-[-0.02em] sm:text-3xl ${isDark ? "text-slate-50" : "text-[#0f1c3d]"}`}>
            Designed for the entire ecosystem
          </h2>
          <p className={`cc-body mx-auto mt-2.5 max-w-2xl text-sm sm:text-base ${isDark ? "text-slate-400" : "text-[#4f6283]"}`}>
            Aligning students, parents, and educators with evidence-based career discovery.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <EcosystemCard
            icon={GraduationCap}
            iconClass={isDark ? "bg-blue-900/50 text-blue-300" : "bg-[#d9e8ff] text-[#2f66de]"}
            title="For Students"
            description="Stop guessing. Try careers before committing to a major. Build confidence through real-world micro-internships and discover what you actually enjoy doing."
            isDark={isDark}
          />
          <EcosystemCard
            icon={Users}
            iconClass={isDark ? "bg-violet-900/50 text-violet-300" : "bg-[#e2e5ff] text-[#5a5ce6]"}
            title="For Parents"
            description="Get peace of mind. Receive data-driven confidence reports that validate your child's choices based on their actual performance and sustained interest."
            isDark={isDark}
          />
          <EcosystemCard
            icon={TrendingUp}
            iconClass={isDark ? "bg-emerald-900/50 text-emerald-300" : "bg-[#d9f5eb] text-[#119b72]"}
            title="For Schools"
            description="Scale career counseling. Provide every student with personalized, structured discovery paths and track aggregate engagement and outcomes."
            isDark={isDark}
          />
        </div>
      </div>
    </section>
  );
}

// Placeholder to avoid naming conflict
function ClipboardListIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </svg>
  );
}

function Feature({ icon: Icon, index, title, desc, tint, isDark }) {
  const iconColor = {
    blue: isDark ? "bg-blue-900/40 text-blue-300" : "bg-[#d5e5ff] text-[#356ce4]",
    violet: isDark ? "bg-violet-900/40 text-violet-300" : "bg-[#e0e0ff] text-[#6366f1]",
    green: isDark ? "bg-emerald-900/40 text-emerald-300" : "bg-[#d8f5eb] text-[#0ea777]",
    amber: isDark ? "bg-amber-900/40 text-amber-300" : "bg-[#f9efcc] text-[#db8a00]",
  };

  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-3.5 transition hover:-translate-y-0.5 ${isDark ? "border-slate-700/60 bg-slate-900/40 hover:bg-slate-900/60" : "border-[#e1e5ec] bg-[#ecf0f7] hover:bg-[#e4eaf5]"}`}>
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconColor[tint]}`}>
        <Icon size={18} />
      </div>
      <div>
        <h4 className={`cc-display text-base font-black leading-none ${isDark ? "text-slate-100" : "text-[#142447]"}`}>{title}</h4>
        <p className={`cc-body mt-1 text-sm leading-tight ${isDark ? "text-slate-400" : "text-[#5b6f92]"}`}>{desc}</p>
      </div>
    </div>
  );
}

function EcosystemCard({ icon: Icon, iconClass, title, description, isDark }) {
  return (
    <article className={`rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-lg ${isDark ? "border-slate-700/60 bg-slate-800/50 hover:bg-slate-800" : "border-[#e2e7f0] bg-[#eef2f8] hover:bg-white"}`}>
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${iconClass}`}>
        <Icon size={20} />
      </div>
      <h3 className={`cc-display mt-4 text-xl font-black ${isDark ? "text-slate-50" : "text-[#132447]"}`}>{title}</h3>
      <p className={`cc-body mt-2.5 text-sm leading-relaxed sm:text-base ${isDark ? "text-slate-400" : "text-[#415b86]"}`}>
        {description}
      </p>
    </article>
  );
}