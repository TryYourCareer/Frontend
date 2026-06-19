export default function Hero({ onStartDiscovery, onExploreCareers, careersCount = 0, theme = "light" }) {
  const isDark = theme === "dark";

  return (
    <section className={`px-4 py-5 sm:px-5 lg:px-7 ${isDark ? "bg-slate-950" : "bg-[radial-gradient(circle_at_top,_#eef6ff_0%,_#f7fbff_50%,_#ffffff_100%)]"}`}>
      <div className="mx-auto grid max-w-[1100px] gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className={`rounded-[25px] px-5 py-6 sm:px-6 sm:py-7 lg:py-8 ${
          isDark 
            ? "bg-slate-800/60 border border-slate-700/50" 
            : "border border-slate-200 bg-[#f8faff] shadow-sm"
        }`}>
          <span className={`cc-body inline-flex rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.03em] sm:text-sm ${
            isDark
              ? "border-slate-600 bg-slate-700/80 text-slate-300"
              : "border-[#c4d4f1] bg-[#dce8fa] text-[#3a63d4]"
          }`}>
            ● THE FUTURE OF CAREER DISCOVERY
          </span>

          <h1 className={`cc-display mt-6 text-[36px] font-black leading-[0.95] tracking-[-0.025em] sm:text-[45px] lg:text-[50px] ${
            isDark ? "text-slate-100" : "text-[#101c3e]"
          }`}>
            Stop guessing <br />
            your future. <br />
            <span className={`bg-clip-text text-transparent ${
              isDark
                ? "bg-[linear-gradient(90deg,#60a5fa_0%,#a78bfa_45%,#34d399_100%)]"
                : "bg-[linear-gradient(90deg,#2f67e3_0%,#3867e7_45%,#5b5be8_100%)]"
            }`}>
              Experience it.
            </span>
          </h1>

          <p className={`cc-body mt-5 max-w-3xl text-base leading-[1.8] sm:text-lg ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}>
            Eliminate career confusion caused by pressure and trends. Discover your true path through structured assessment, real-world trials, and evidence-based guidance.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3.5">
            <button
              onClick={onStartDiscovery}
              className={`cc-display flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-base font-bold transition sm:shrink-0 ${
                isDark
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                  : "bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-900 shadow-lg shadow-sky-200/50"
              }`}
            >
              <span>Start Your Career Discovery Journey</span>
              <span>→</span>
            </button>
            <button
              onClick={onExploreCareers}
              className={`cc-display flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-base font-bold transition sm:shrink-0 ${
                isDark
                  ? "border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>🎯 Explore Careers</span>
            </button>
          </div>

        </div>

        <div className={`rounded-[28px] border ${
          isDark
            ? "border-slate-700/50 bg-slate-800/40 shadow-[0_13px_26px_rgba(0,0,0,0.3)]"
            : "border-[#d2d9e6] bg-[#f2f4f8] shadow-[0_13px_26px_rgba(86,102,136,0.14)]"
        }`}>
          <div className={`border-b p-3.5 sm:p-4 ${
            isDark ? "border-slate-700/50" : "border-[#d9dee8]"
          }`}>
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full bg-[#ff6560]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#f4bc21]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#16c392]" />
              <span className={`ml-3 h-7 flex-1 rounded-lg ${
                isDark ? "bg-slate-700" : "bg-[#e0e5ed]"
              }`} />
            </div>
          </div>

          <div className="space-y-3 p-3.5 sm:p-5">
            <Feature index="1" title="Direction Assessment" desc="Psychometric & interest routing" tint="blue" isDark={isDark} />
            <Feature index="2" title="Reality-Based Intel" desc="Data-driven authentic reality" tint="violet" isDark={isDark} />
            <Feature index="3" title="Career Trial Missions" desc="Experiential micro-internships" tint="green" isDark={isDark} />
            <Feature index="4" title="Dual-Confidence Reports" desc="Actionable analytics for all" tint="amber" isDark={isDark} />
          </div>
        </div>
      </div>

      <div className={`mx-auto mt-7 max-w-[1100px] rounded-[20px] border p-4 sm:p-6 ${
        isDark
          ? "border-slate-700/50 bg-slate-800/40"
          : "border-[#d9e0ec] bg-[#f7f9fc]"
      }`}>
        <div className="text-center">
          <h2 className={`cc-display text-xl font-black tracking-[-0.02em] sm:text-3xl ${
            isDark ? "text-slate-100" : "text-[#0f1c3d]"
          }`}>
            Designed for the entire ecosystem
          </h2>
          <p className={`cc-body mx-auto mt-2.5 max-w-4xl text-sm sm:text-lg ${
            isDark ? "text-slate-400" : "text-[#4f6283]"
          }`}>
            Aligning students, parents, and educators with evidence-based career discovery.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <EcosystemCard
            icon="◎"
            iconClass={isDark ? "bg-blue-900/40 text-blue-300" : "bg-[#d9e8ff] text-[#2f66de]"}
            title="For Students"
            description="Stop guessing. Try careers before committing to a major. Build confidence through real-world micro-internships and discover what you actually enjoy doing."
            isDark={isDark}
          />
          <EcosystemCard
            icon="◈"
            iconClass={isDark ? "bg-indigo-900/40 text-indigo-300" : "bg-[#e2e5ff] text-[#5a5ce6]"}
            title="For Parents"
            description="Get peace of mind. Receive data-driven confidence reports that validate your child's choices based on their actual performance and sustained interest."
            isDark={isDark}
          />
          <EcosystemCard
            icon="↗"
            iconClass={isDark ? "bg-emerald-900/40 text-emerald-300" : "bg-[#d9f5eb] text-[#119b72]"}
            title="For Schools"
            description="Scale career counseling. Provide every student with personalized, structured discovery paths and track aggregate engagement and outcomes."
            isDark={isDark}
          />
        </div>
      </div>
    </section>
  );
}

function Feature({ index, title, desc, tint, isDark = false }) {
  const iconColor = isDark ? {
    blue: "bg-blue-900/40 text-blue-300",
    violet: "bg-indigo-900/40 text-indigo-300",
    green: "bg-emerald-900/40 text-emerald-300",
    amber: "bg-amber-900/40 text-amber-300",
  } : {
    blue: "bg-[#d5e5ff] text-[#356ce4]",
    violet: "bg-[#e0e0ff] text-[#6366f1]",
    green: "bg-[#d8f5eb] text-[#0ea777]",
    amber: "bg-[#f9efcc] text-[#db8a00]",
  };

  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-3.5 ${
      isDark
        ? "border-slate-700/50 bg-slate-800/30"
        : "border-[#e1e5ec] bg-[#ecf0f7]"
    }`}>
      <div className={`grid h-10 w-10 place-items-center rounded-xl text-base font-black ${iconColor[tint]}`}>
        {index}
      </div>
      <div>
        <h4 className={`cc-display text-lg font-black leading-none ${
          isDark ? "text-slate-100" : "text-[#142447]"
        }`}>{title}</h4>
        <p className={`cc-body mt-1 text-sm leading-tight ${
          isDark ? "text-slate-400" : "text-[#5b6f92]"
        }`}>{desc}</p>
      </div>
    </div>
  );
}

function EcosystemCard({ icon, iconClass, title, description, isDark = false }) {
  return (
    <article className={`rounded-2xl border p-4 sm:p-5 ${
      isDark
        ? "border-slate-700/50 bg-slate-800/40"
        : "border-[#e2e7f0] bg-[#eef2f8]"
    }`}>
      <div className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-black ${iconClass}`}>
        {icon}
      </div>
      <h3 className={`cc-display mt-4 text-2xl font-black ${
        isDark ? "text-slate-100" : "text-[#132447]"
      }`}>{title}</h3>
      <p className={`cc-body mt-2.5 text-sm leading-[1.5] sm:text-base ${
        isDark ? "text-slate-400" : "text-[#415b86]"
      }`}>
        {description}
      </p>
    </article>
  );
}