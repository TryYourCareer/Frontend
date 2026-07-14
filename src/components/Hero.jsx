import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, TrendingUp, Terminal, Users,
  ArrowRight, Zap, Compass, Play, RefreshCw,
  BarChart3, Star, ChevronDown, Brain,
  Code2, Target, Award, Cpu, Globe, Lock, Search
} from "lucide-react";


/* ─────────────────────────── animation presets ─────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 90, damping: 18 },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

/* ─────────────────────────── stage definitions ──────────────────────────── */
const STAGES = [
  {
    id: "discover",
    label: "DISCOVER",
    title: "1. Self-Discovery",
    subtitle: "Psychometric Personality Routing",
    blurb:
      "Eliminate career anxiety by mapping your cognitive problem-solving style to aligned pathways. Our AI matches 24 trait dimensions against 300+ career clusters.",
    icon: Sparkles,
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    glowColor: "rgba(99,179,237,0.18)",
    accentCss: "text-cyan-400",
    pillBg: isDark => isDark ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" : "bg-cyan-50 text-cyan-700 border-cyan-200",
    metrics: [
      { icon: Brain, label: "Archetype Mapping", value: "24 Traits" },
      { icon: Target, label: "Interest Matrix", value: "12 Clusters" },
      { icon: Globe, label: "Career Matches", value: "300+" },
    ],
  },
  {
    id: "explore",
    label: "EXPLORE",
    title: "2. Real-World Intel",
    subtitle: "Job Trends & Salary Bands",
    blurb:
      "Access real market data. Analyze salaries, stress levels, remote ratios, and skill prerequisites for any career before you commit a single hour to it.",
    icon: TrendingUp,
    gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
    glowColor: "rgba(167,139,250,0.18)",
    accentCss: "text-violet-400",
    pillBg: isDark => isDark ? "bg-violet-500/10 text-violet-300 border-violet-500/20" : "bg-violet-50 text-violet-700 border-violet-200",
    metrics: [
      { icon: BarChart3, label: "Salary Bands", value: "Live data" },
      { icon: TrendingUp, label: "Market Growth", value: "+24% YoY" },
      { icon: Globe, label: "Remote Ratio", value: "68% remote" },
    ],
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    title: "3. Trial Missions",
    subtitle: "Interactive Simulator Tasks",
    blurb:
      "The only way to truly know if you'll enjoy a role is to do it. Run real simulated code, complete product design tasks, or analyse mock datasets — all inside the browser.",
    icon: Terminal,
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    glowColor: "rgba(52,211,153,0.18)",
    accentCss: "text-emerald-400",
    pillBg: isDark => isDark ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200",
    metrics: [
      { icon: Code2, label: "Coding Sandboxes", value: "50+ missions" },
      { icon: Cpu, label: "Live Execution", value: "Real runtime" },
      { icon: Award, label: "XP Earned", value: "+150 pts avg" },
    ],
  },
  {
    id: "align",
    label: "ALIGN",
    title: "4. Unified Alignment",
    subtitle: "Dual-Confidence Reports",
    blurb:
      "Receive holistic reports that reconcile your performance data, parental sentiment, and industry outcome forecasts into a single confidence score you can act on.",
    icon: Users,
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    glowColor: "rgba(251,191,36,0.18)",
    accentCss: "text-amber-400",
    pillBg: isDark => isDark ? "bg-amber-500/10 text-amber-300 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200",
    metrics: [
      { icon: Users, label: "Stakeholder Buy-In", value: "3-way sync" },
      { icon: Target, label: "Fit Confidence", value: "94% accuracy" },
      { icon: Lock, label: "Private Report", value: "Exportable PDF" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN HERO EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Hero({ onStartDiscovery, onExploreCareers, careersCount = 0, isDark = false, onActiveStageChange }) {
  const [activeStep, setActiveStep] = useState(0);

  /* Scroll-spy via IntersectionObserver */
  useEffect(() => {
    const opts = { root: null, rootMargin: "-30% 0px -50% 0px", threshold: 0 };
    const cb = entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = parseInt(e.target.getAttribute("data-stage-idx"), 10);
          if (!isNaN(idx)) {
            setActiveStep(idx);
            onActiveStageChange?.(idx);
          }
        }
      });
    };
    const io = new IntersectionObserver(cb, opts);
    document.querySelectorAll("[data-stage-idx]").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [onActiveStageChange]);

  const scrollTo = idx => {
    const el = document.getElementById(`stage-${idx}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveStep(idx);
    onActiveStageChange?.(idx);
  };

  return (
    <section className="relative overflow-visible">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <HeroBanner
        isDark={isDark}
        onStartDiscovery={onStartDiscovery}
        onExploreCareers={onExploreCareers}
        careersCount={careersCount}
        onScrollDown={() => scrollTo(0)}
      />

      {/* ── Journey label ────────────────────────────────────────────────────── */}
      <div className={`py-10 px-4 text-center ${isDark ? "bg-slate-950" : "bg-[#eef3fb]"}`}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-[11px] font-extrabold tracking-[0.2em] uppercase ${isDark ? "text-slate-500" : "text-[#7a91b3]"}`}
        >
          Interactive Simulator
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
          className={`cc-display mt-2 text-2xl sm:text-3xl font-black tracking-tight ${isDark ? "text-slate-100" : "text-[#0f1d3c]"}`}
        >
          Your 4-Stage Career Journey
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className={`cc-body mt-3 mx-auto max-w-xl text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-400" : "text-[#4d627f]"}`}
        >
          Scroll through each sandbox stage below. Each section is an interactive simulation — click, drag, and explore.
        </motion.p>
      </div>

      {/* ── Sandbox journey layout (full-width, no sidebar) ───────────────────── */}
      <div className={`relative ${isDark ? "bg-slate-950" : "bg-[#eef3fb]"}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="py-10 space-y-0">
            {STAGES.map((stage, idx) => (
              <StageSection
                key={stage.id}
                stage={stage}
                idx={idx}
                isDark={isDark}
                isActive={idx === activeStep}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Ecosystem cards section ───────────────────────────────────────────── */}
      <EcosystemSection isDark={isDark} />
    </section>
  );
}

/* ─────────────────────────── Hero Banner ────────────────────────────────── */
function HeroBanner({ isDark, onStartDiscovery, onExploreCareers, careersCount, onScrollDown }) {
  const [query, setQuery] = useState("");

  return (
    <div className={`relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:py-24 ${isDark ? "bg-slate-950" : "bg-[#eef3fb]"}`}>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.span
            variants={fadeUp}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-extrabold tracking-[0.12em] uppercase ${
              isDark ? "border-slate-700 bg-slate-800/80 text-cyan-300" : "border-blue-100/80 bg-blue-50 text-blue-600"
            }`}
          >
            <Zap size={11} className="animate-pulse text-cyan-400 shrink-0" />
            The Interactive Career Adventure
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className={`cc-display mt-6 text-[42px] sm:text-[58px] lg:text-[68px] font-black leading-[0.93] tracking-[-0.035em] ${isDark ? "text-slate-50" : "text-[#0b1a36]"}`}
          >
            Stop guessing<br />your future.{" "}
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Play it first.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className={`cc-body mt-6 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed ${isDark ? "text-slate-400" : "text-[#4d627f]"}`}
          >
            Four interactive simulator sandboxes that let you discover your archetype, analyse real market data, trial-run daily tasks, and receive a unified alignment report — all before picking a course.
          </motion.p>

          {/* Search bar inspired by W3Schools & GeeksforGeeks */}
          <motion.div variants={fadeUp} className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search our career tutorials (e.g. Frontend Dev, DevOps, Python, AI)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full px-5 py-4 pl-12 rounded-full border shadow-md outline-none text-sm transition-all ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500/50"
                    : "bg-white border-[#ccd8ea] text-[#0b1a36] placeholder-slate-400 focus:border-blue-500/50"
                }`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </span>
            </div>
            {/* Quick Suggestions Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-500"}`}>Popular:</span>
              {["Python", "Fullstack", "DevOps", "AI Engineer", "UX Design"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${
                    isDark
                      ? "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30"
                      : "border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main buttons */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03, y: -2, boxShadow: "0 14px 32px rgba(79,70,229,0.38)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onStartDiscovery}
              className="cc-display flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-7 py-4 text-sm font-bold text-white shadow-lg"
            >
              <span>Launch Your Discovery</span>
              <ArrowRight size={18} className="shrink-0" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExploreCareers}
              className={`cc-display flex items-center gap-2.5 rounded-full border px-6 py-4 text-sm font-bold transition ${
                isDark ? "border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700" : "border-[#ccd8ea] bg-white/60 text-[#304f84] hover:bg-white"
              }`}
            >
              <Compass size={16} />
              Simulate Pathways ({careersCount}+ loaded)
            </motion.button>
          </motion.div>

          {/* Card Grid inspired by GFG / W3Schools */}
          <motion.div variants={fadeUp} className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-5xl mx-auto">
            {[
              {
                title: "HTML / CSS / JS",
                subtitle: "Frontend Track",
                desc: "Learn to build user interfaces. Simulate layout styling and interactive web behaviors.",
                color: "from-emerald-500 to-teal-600",
                bg: "hover:border-emerald-500/30 hover:bg-emerald-500/5",
                action: "Try it Yourself"
              },
              {
                title: "Python / Node / SQL",
                subtitle: "Backend Track",
                desc: "Build servers, design databases, and connect APIs. Experience structural logic.",
                color: "from-blue-500 to-cyan-600",
                bg: "hover:border-blue-500/30 hover:bg-blue-500/5",
                action: "Solve Challenge"
              },
              {
                title: "TensorFlow / AI Model",
                subtitle: "Data & ML Track",
                desc: "Train models, perform data analysis, and process neural nets inside the simulator.",
                color: "from-purple-500 to-indigo-600",
                bg: "hover:border-purple-500/30 hover:bg-purple-500/5",
                action: "Run Model"
              },
              {
                title: "Docker / AWS Cloud",
                subtitle: "DevOps Track",
                desc: "Deploy code, balance loads, manage Kubernetes, and configure secure gateways.",
                color: "from-amber-500 to-orange-600",
                bg: "hover:border-amber-500/30 hover:bg-amber-500/5",
                action: "Deploy Code"
              }
            ].map((track, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between h-[210px] ${
                  isDark
                    ? "border-slate-800 bg-slate-900/40 text-slate-300"
                    : "border-slate-200 bg-white text-slate-700"
                } ${track.bg}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r ${track.color} bg-clip-text text-transparent`}>
                      {track.subtitle}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className={`font-black text-base mt-1.5 ${isDark ? "text-white" : "text-[#0f1d3c]"}`}>
                    {track.title}
                  </h3>
                  <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {track.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onStartDiscovery}
                  className={`mt-4 w-full py-2 px-3 text-[11px] font-bold rounded-lg text-center text-white bg-gradient-to-r ${track.color} hover:brightness-110 shadow-sm transition`}
                >
                  {track.action}
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            variants={fadeUp}
            className={`mt-10 flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold ${isDark ? "text-slate-500" : "text-[#7a91b3]"}`}
          >
            {[
              { val: "12,400+", label: "students onboarded" },
              { val: "300+", label: "career simulations" },
              { val: "94%", label: "decision confidence" },
            ].map(item => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span className={`font-black text-sm ${isDark ? "text-slate-200" : "text-[#1a3060]"}`}>{item.val}</span>
                {item.label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll down indicator */}
        <motion.button
          onClick={onScrollDown}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className={`mt-16 flex flex-col items-center gap-1.5 mx-auto text-[10px] font-bold tracking-widest uppercase ${isDark ? "text-slate-600 hover:text-slate-400" : "text-[#99adc7] hover:text-[#4f6283]"} transition`}
        >
          <span>Explore Stages</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Stage Section ──────────────────────────────── */
function StageSection({ stage, idx, isDark, isActive }) {
  const Icon = stage.icon;

  return (
    <motion.div
      id={`stage-${idx}`}
      data-stage-idx={idx}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.05 }}
      className={`relative min-h-screen flex flex-col justify-center py-16 sm:py-20 scroll-mt-24 transition-all duration-500 ${
        isActive ? "opacity-100" : "opacity-70 hover:opacity-90"
      }`}
    >
      {/* Ambient stage glow */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none rounded-[32px]"
        style={{
          background: isActive
            ? `radial-gradient(ellipse 60% 50% at 70% 50%, ${stage.glowColor}, transparent)`
            : "transparent",
          transition: "background 0.6s ease",
        }}
      />

      {/* Stage content card */}
      <div className={`rounded-[28px] border overflow-hidden transition-all duration-500 ${
        isActive
          ? isDark
            ? "border-slate-700/80 bg-slate-900/90 shadow-2xl shadow-black/30 ring-1 ring-white/5"
            : "border-[#c8d8ef] bg-white/80 shadow-2xl shadow-blue-900/8 ring-1 ring-white/60"
          : isDark
            ? "border-slate-800/60 bg-slate-900/50"
            : "border-[#d4def0]/60 bg-[#f5f8fd]/60"
      } backdrop-blur-xl`}>

        {/* Mock browser chrome */}
        <div className={`flex items-center justify-between border-b px-5 py-3 ${
          isDark ? "border-slate-800/80 bg-slate-950/60" : "border-[#dce5f1] bg-[#f0f4fb]/80"
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff605c]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd44]" />
            <span className="h-3 w-3 rounded-full bg-[#00ca4e]" />
          </div>
          <div className={`rounded-md px-4 py-1 text-[10px] font-mono select-none ${
            isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200/70 text-slate-500"
          }`}>
            clearcareers.io/sandbox/{stage.id}
          </div>
          <div className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${stage.pillBg(isDark)}`}>
            Stage {idx + 1}
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-10">

          {/* Left: Stage description */}
          <div className="flex flex-col justify-center">
            {/* Number + label */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${stage.gradient} text-white shrink-0`}>
                <Icon size={17} />
              </div>
              <span className={`text-[10px] font-extrabold tracking-[0.15em] uppercase ${stage.accentCss}`}>
                {stage.label}
              </span>
            </div>

            <h3 className={`cc-display text-2xl sm:text-3xl font-black leading-tight tracking-tight ${isDark ? "text-slate-50" : "text-[#0b1a36]"}`}>
              {stage.subtitle}
            </h3>
            <p className={`cc-body mt-4 text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-400" : "text-[#4d627f]"}`}>
              {stage.blurb}
            </p>

            {/* Metric pills */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stage.metrics.map((m, mi) => {
                const MIcon = m.icon;
                return (
                  <div
                    key={mi}
                    className={`rounded-xl border p-3 flex flex-col gap-1.5 ${
                      isDark ? "border-slate-800 bg-slate-800/50" : "border-[#dce8f5] bg-[#f2f7fe]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <MIcon size={11} className={stage.accentCss} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-[#8098bc]"}`}>{m.label}</span>
                    </div>
                    <p className={`text-xs font-black ${isDark ? "text-slate-200" : "text-[#1a3060]"}`}>{m.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Step indicator dots */}
            <div className="mt-8 flex items-center gap-2">
              {STAGES.map((_, di) => (
                <div
                  key={di}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    di === idx
                      ? `w-5 bg-gradient-to-r ${stage.gradient}`
                      : isDark ? "w-1.5 bg-slate-700" : "w-1.5 bg-[#c8d8ee]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right: Interactive sandbox */}
          <div className="flex items-center">
            {idx === 0 && <DiscoverSandbox isDark={isDark} stage={STAGES[0]} />}
            {idx === 1 && <ExploreSandbox isDark={isDark} stage={STAGES[1]} />}
            {idx === 2 && <ExperienceSandbox isDark={isDark} stage={STAGES[2]} />}
            {idx === 3 && <AlignSandbox isDark={isDark} stage={STAGES[3]} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SANDBOX 0 — Discover: Psychometric question widget
   ═══════════════════════════════════════════════════════════════════════════ */
function DiscoverSandbox({ isDark, stage }) {
  const [chosen, setChosen] = useState(null);
  const [phase, setPhase] = useState("question"); // question | analyzing | result

  const questions = [
    {
      q: "How would you prefer to solve a traffic congestion problem?",
      opts: [
        { key: "A", emoji: "🚀", label: "Coordinate driver routes using smart scheduling algorithms." },
        { key: "B", emoji: "🎨", label: "Redesign highways and stations with beautiful, intuitive layouts." },
      ],
      results: {
        A: { archetype: "SYSTEMS ARCHITECT", desc: "You excel at data routing, optimization, and solving programmatic bottlenecks.", color: "text-cyan-400" },
        B: { archetype: "EXPERIENCE DESIGNER", desc: "You focus on human ergonomics, visual balance, and intuitive interactions.", color: "text-violet-400" },
      },
    },
    {
      q: "You're given a week to build something impressive. You choose to:",
      opts: [
        { key: "A", emoji: "📊", label: "Build a real-time analytics dashboard with live data pipelines." },
        { key: "B", emoji: "🤝", label: "Organise a community event and manage stakeholder relationships." },
      ],
      results: {
        A: { archetype: "DATA ENGINEER", desc: "You thrive on complex pipelines, insight extraction, and technical precision.", color: "text-emerald-400" },
        B: { archetype: "PEOPLE MANAGER", desc: "Your strength is communication, coordination, and rallying teams around a goal.", color: "text-amber-400" },
      },
    },
  ];

  const [qIdx, setQIdx] = useState(0);
  const current = questions[qIdx];

  const handleChoose = key => {
    setChosen(key);
    setPhase("analyzing");
    setTimeout(() => setPhase("result"), 1600);
  };

  const handleReset = () => {
    setChosen(null);
    setPhase("question");
    setQIdx(prev => (prev + 1) % questions.length);
  };

  return (
    <div className={`w-full rounded-2xl border flex flex-col gap-4 p-5 ${isDark ? "border-slate-800 bg-slate-950/80" : "border-[#d6e4f5] bg-[#f8fbff]"} shadow-lg`}>
      <div className="flex items-center gap-2">
        <Sparkles size={13} className="text-cyan-400" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-cyan-400">Psychometric Matcher</span>
        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200/70 text-slate-500"}`}>
          Q {qIdx + 1}/{questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "question" && (
          <motion.div key={`q-${qIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <h4 className={`text-sm font-black leading-snug ${isDark ? "text-slate-100" : "text-[#0f1d3c]"}`}>
              "{current.q}"
            </h4>
            <div className="mt-4 space-y-2.5">
              {current.opts.map(opt => (
                <motion.button
                  key={opt.key}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChoose(opt.key)}
                  className={`w-full text-left rounded-xl border p-3.5 text-xs font-semibold leading-relaxed flex items-start gap-2.5 transition-all ${
                    isDark ? "border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800 text-slate-300" : "border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/40 text-slate-700"
                  }`}
                >
                  <span className="text-base shrink-0">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-8"
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isDark ? "bg-cyan-500/10" : "bg-cyan-50"}`}>
              <Brain size={24} className="text-cyan-400 animate-pulse" />
            </div>
            <p className={`text-xs font-bold animate-pulse ${isDark ? "text-slate-400" : "text-slate-500"}`}>Running traits match matrix...</p>
            <div className={`w-36 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {phase === "result" && chosen && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className={`rounded-xl border p-4 ${isDark ? "border-cyan-500/20 bg-cyan-950/20" : "border-cyan-200 bg-cyan-50/60"}`}
          >
            <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-900 uppercase tracking-wider">
              Archetype Matched
            </span>
            <h5 className={`text-lg font-black mt-2 ${current.results[chosen].color}`}>
              {current.results[chosen].archetype}
            </h5>
            <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {current.results[chosen].desc}
            </p>
            <button
              onClick={handleReset}
              className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 hover:underline"
            >
              <RefreshCw size={10} /> Try next question
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "question" && (
        <p className={`text-[9.5px] text-center ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          Select a response to reveal your career archetype
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SANDBOX 1 — Explore: Salary & market intelligence dashboard
   ═══════════════════════════════════════════════════════════════════════════ */
const careerData = [
  { title: "Junior Dev", salary: 72000, demand: "Medium", remote: 55, stability: 80 },
  { title: "Senior DevOps Architect", salary: 148000, demand: "Very High", remote: 72, stability: 91 },
  { title: "Staff SRE", salary: 182000, demand: "Very High", remote: 80, stability: 94 },
  { title: "Principal Cloud Architect", salary: 215000, demand: "Extreme", remote: 85, stability: 96 },
];

function ExploreSandbox({ isDark }) {
  const [sliderVal, setSliderVal] = useState(1);
  const career = careerData[sliderVal];

  return (
    <div className={`w-full rounded-2xl border flex flex-col gap-4 p-5 ${isDark ? "border-slate-800 bg-slate-950/80" : "border-[#d6e4f5] bg-[#f8fbff]"} shadow-lg`}>
      <div className="flex items-center gap-2">
        <TrendingUp size={13} className="text-violet-400" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-violet-400">Market Intelligence Dashboard</span>
      </div>

      <div className={`rounded-xl border p-3.5 ${isDark ? "border-slate-800 bg-slate-900/60" : "border-[#e5edf9] bg-white"}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <AnimatePresence mode="wait">
              <motion.h4
                key={career.title}
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                className={`text-sm font-black ${isDark ? "text-slate-100" : "text-[#0f1d3c]"}`}
              >
                {career.title}
              </motion.h4>
            </AnimatePresence>
            <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Tech Cluster: Cloud Ops</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={career.salary}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-lg font-black text-violet-400"
            >
              ${career.salary.toLocaleString()}
              <span className="text-[9px] font-bold text-slate-500">/yr</span>
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Slider */}
        <div className="mt-4 space-y-1.5">
          <input
            type="range" min={0} max={3} step={1}
            value={sliderVal}
            onChange={e => setSliderVal(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-[8px] font-semibold text-slate-500">
            <span>Junior</span><span>Senior</span><span>Staff</span><span>Principal</span>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Demand", value: career.demand, color: "text-violet-400" },
          { label: "Remote", value: `${career.remote}%`, color: "text-emerald-400" },
          { label: "Stability", value: `${career.stability}%`, color: "text-amber-400" },
        ].map(stat => (
          <div
            key={stat.label}
            className={`rounded-xl border p-2.5 text-center ${isDark ? "border-slate-800 bg-slate-900/40" : "border-[#dce8f5] bg-[#f2f7fe]"}`}
          >
            <p className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-[#8098bc]"}`}>{stat.label}</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={stat.value}
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`text-xs font-black mt-0.5 ${stat.color}`}
              >
                {stat.value}
              </motion.p>
            </AnimatePresence>
          </div>
        ))}
      </div>

      <p className={`text-[9.5px] text-center ${isDark ? "text-slate-600" : "text-slate-400"}`}>
        Drag the slider to preview career progression levels
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SANDBOX 2 — Experience: Interactive trial IDE console
   ═══════════════════════════════════════════════════════════════════════════ */
function ExperienceSandbox({ isDark }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [complete, setComplete] = useState(false);

  const events = [
    { text: "$ node run_mission_tests.js", delay: 0, prog: 0 },
    { text: "> Initializing server node simulation...", delay: 400, prog: 5 },
    { text: "> Fetching config schema: ✓ success", delay: 900, prog: 25 },
    { text: "> Loading dynamic balancer weight params...", delay: 1500, prog: 50 },
    { text: "> Running mock network request: latency <12ms", delay: 2100, prog: 75 },
    { text: "✓ TEST PASSED — Path validity metrics generated! (+15 XP)", delay: 2700, prog: 100 },
  ];

  const runSim = () => {
    if (running) return;
    setRunning(true); setComplete(false); setProgress(0); setLogs([]);
    events.forEach(ev => {
      setTimeout(() => {
        setLogs(p => [...p, ev.text]);
        setProgress(ev.prog);
        if (ev.prog === 100) { setRunning(false); setComplete(true); }
      }, ev.delay);
    });
  };

  return (
    <div className={`w-full rounded-2xl border flex flex-col gap-3 p-5 ${isDark ? "border-slate-800 bg-slate-950/80" : "border-[#d6e4f5] bg-[#f8fbff]"} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-emerald-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-400">Interactive Trial IDE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[8.5px] font-mono ${isDark ? "text-slate-600" : "text-slate-400"}`}>load_balancer.py</span>
          {complete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
            >
              +15 XP
            </motion.span>
          )}
        </div>
      </div>

      {/* Code display */}
      <div className={`rounded-xl border font-mono text-[9.5px] p-3.5 min-h-[130px] flex flex-col justify-between ${isDark ? "border-slate-800 bg-slate-950 text-slate-400" : "border-slate-800 bg-[#0f1117] text-slate-400"}`}>
        <div className="space-y-0.5 overflow-y-auto max-h-[100px]">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic text-[9px]">
              Ready. Click "Execute Trial Mission" to test-drive the DevOps role.
            </p>
          ) : (
            logs.map((l, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                className={
                  l.startsWith("✓") ? "text-emerald-400 font-bold" :
                  l.startsWith("$") ? "text-slate-500" : "text-slate-300"
                }
              >
                {l}
              </motion.p>
            ))
          )}
        </div>
        {progress > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[7.5px] text-slate-600">
              <span>Task Progress</span><span>{progress}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={runSim}
          disabled={running}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-3 transition shadow-md shadow-emerald-900/20"
        >
          {running ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
          {running ? "Executing..." : "Execute Trial Mission"}
        </motion.button>
        {logs.length > 0 && !running && (
          <button
            onClick={() => { setLogs([]); setProgress(0); setComplete(false); }}
            className={`rounded-xl border px-3 py-2 text-xs transition ${isDark ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"}`}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SANDBOX 3 — Align: Confidence match dashboard
   ═══════════════════════════════════════════════════════════════════════════ */
function AlignSandbox({ isDark }) {
  const [stars, setStars] = useState(4);
  const [hoverStar, setHoverStar] = useState(null);

  const bars = [
    { label: "Student Interest Match", val: 96, color: "from-amber-400 to-orange-500" },
    { label: "Parental Validation Index", val: 91, color: "from-amber-400 to-orange-500" },
    { label: "Industry Demand Alignment", val: 88, color: "from-amber-400 to-orange-500" },
  ];

  return (
    <div className={`w-full rounded-2xl border flex flex-col gap-4 p-5 ${isDark ? "border-slate-800 bg-slate-950/80" : "border-[#d6e4f5] bg-[#f8fbff]"} shadow-lg`}>
      <div className="flex items-center gap-2">
        <Users size={13} className="text-amber-400" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-amber-400">Confidence Match Report</span>
      </div>

      {/* Score ring + bars */}
      <div className="flex items-center gap-5">
        {/* Score circle */}
        <div className={`shrink-0 grid place-items-center h-20 w-20 rounded-full border-4 border-dashed border-amber-400/40 ${isDark ? "bg-slate-900/60" : "bg-amber-50/60"}`}>
          <div className="text-center">
            <span className={`text-xl font-black ${isDark ? "text-white" : "text-[#0f1d3c]"}`}>94%</span>
            <p className="text-[7px] font-extrabold uppercase tracking-wider text-amber-400 mt-0.5">Aligned</p>
          </div>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-2.5">
          {bars.map(bar => (
            <div key={bar.label}>
              <div className="flex justify-between mb-1">
                <span className={`text-[9px] font-semibold ${isDark ? "text-slate-500" : "text-slate-500"}`}>{bar.label}</span>
                <span className={`text-[9px] font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>{bar.val}%</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-[#dce8f5]"}`}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${bar.val}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                  className={`h-full rounded-full bg-gradient-to-r ${bar.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Star rating */}
      <div className={`rounded-xl border p-3 flex items-center justify-between ${isDark ? "border-slate-800 bg-slate-900/30" : "border-[#dce8f5] bg-[#f5f9ff]"}`}>
        <span className={`text-[10px] font-semibold ${isDark ? "text-slate-500" : "text-slate-500"}`}>Rate this alignment:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoverStar(s)}
              onMouseLeave={() => setHoverStar(null)}
              onClick={() => setStars(s)}
            >
              <Star
                size={14}
                className={`transition ${s <= (hoverStar ?? stars) ? "fill-amber-400 text-amber-400" : isDark ? "text-slate-700" : "text-slate-300"}`}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Report footer */}
      <div className={`rounded-xl border border-dashed p-3 flex items-center gap-2.5 ${isDark ? "border-slate-700 bg-slate-900/20" : "border-[#c8daf5] bg-[#f0f6ff]"}`}>
        <Lock size={11} className={isDark ? "text-slate-500" : "text-[#8098bc]"} />
        <p className={`text-[9.5px] leading-relaxed ${isDark ? "text-slate-500" : "text-[#6e87ae]"}`}>
          Full alignment report generated as a private PDF — shareable with parents and counselors.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────── Ecosystem Section ──────────────────────────── */
function EcosystemSection({ isDark }) {
  const cards = [
    {
      icon: Users,
      iconBg: isDark => isDark ? "bg-blue-900/50 text-blue-300" : "bg-[#d9e8ff] text-[#2f66de]",
      title: "For Students",
      desc: "Stop guessing. Try careers before committing to a major. Build confidence through real-world micro-simulations.",
    },
    {
      icon: Users,
      iconBg: isDark => isDark ? "bg-violet-900/50 text-violet-300" : "bg-[#e2e5ff] text-[#5a5ce6]",
      title: "For Parents",
      desc: "Get peace of mind. Receive data-driven confidence reports that validate your child's choices based on actual performance.",
    },
    {
      icon: TrendingUp,
      iconBg: isDark => isDark ? "bg-emerald-900/50 text-emerald-300" : "bg-[#d9f5eb] text-[#119b72]",
      title: "For Schools",
      desc: "Scale career counseling. Provide every student with personalized discovery paths and track aggregate outcomes.",
    },
  ];

  return (
    <div className={`py-20 px-4 sm:px-6 ${isDark ? "bg-slate-950" : "bg-[#eef3fb]"}`}>
      <div className="mx-auto max-w-6xl">
        <div className={`rounded-[28px] border p-6 sm:p-10 ${isDark ? "border-slate-800/70 bg-slate-900/60" : "border-[#d4dff0] bg-[#f5f8fd]"}`}>
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`cc-display text-2xl sm:text-3xl font-black tracking-tight ${isDark ? "text-slate-50" : "text-[#0f1c3d]"}`}
            >
              Designed for the entire ecosystem
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`cc-body mt-3 mx-auto max-w-xl text-sm sm:text-base ${isDark ? "text-slate-400" : "text-[#4f6283]"}`}
            >
              Aligning students, parents, and educators with evidence-based career discovery.
            </motion.p>
          </div>

          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}
            className="grid sm:grid-cols-3 gap-5"
          >
            {cards.map(card => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } } }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`rounded-2xl border p-5 cursor-pointer transition-colors duration-200 ${
                    isDark ? "border-slate-700/60 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600" : "border-[#e2e7f0] bg-[#eef2f8] hover:bg-white hover:border-[#bfdbfe]"
                  }`}
                >
                  <div className={`grid h-11 w-11 place-items-center rounded-xl ${card.iconBg(isDark)}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className={`cc-display mt-4 text-xl font-black ${isDark ? "text-slate-50" : "text-[#132447]"}`}>{card.title}</h3>
                  <p className={`cc-body mt-2.5 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-[#415b86]"}`}>{card.desc}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
