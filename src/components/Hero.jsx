import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Target,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Compass,
  Play,
  BarChart3,
  Users,
  Zap,
  Award,
  Check,
  Briefcase,
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

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN HERO EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Hero({ onStartDiscovery, onExploreCareers, careersCount = 0, isDark = true }) {
  return (
    <section className="relative overflow-visible">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <HeroBanner
        isDark={isDark}
        onStartDiscovery={onStartDiscovery}
        onExploreCareers={onExploreCareers}
        careersCount={careersCount}
        onScrollDown={() => {
          const el = document.getElementById("how-it-works-section");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      {/* ── Interactive How It Works / Application UX Section ───────────────── */}
      <HowItWorksInteractiveSection
        isDark={isDark}
        onStartDiscovery={onStartDiscovery}
        onExploreCareers={onExploreCareers}
      />

      {/* ── Ecosystem cards section ───────────────────────────────────────────── */}
      <EcosystemSection isDark={isDark} />
    </section>
  );
}

/* ─────────────────────────── Abstract Career Test Continuous Loop Visualization ─────────────────────────── */
function AbstractCareerTestLoop({ isDark }) {
  const [activeStep, setActiveStep] = useState(0);

  // Auto continuous loop across 4 steps (4.2 seconds per step for full sequential pop-ins)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // Framer Motion spring variants for staggered word pop-ins
  const wordPopVariant = {
    hidden: { opacity: 0, scale: 0.6, y: 12 },
    show: (delayIndex) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: delayIndex * 0.22 + 0.15,
        type: "spring",
        stiffness: 140,
        damping: 14,
      },
    }),
  };

  return (
    <div className="w-full max-w-md relative flex flex-col justify-center items-center min-h-[380px] py-4">
      {/* ── Center Visualization Area (Frameless 4-step loop with sequential word pop-ins) ──────────── */}
      <div className="relative w-full flex items-center justify-center min-h-[340px]">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Floating Tags (Unified App Theme Colors) ──────────────────── */}
          {activeStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center justify-center space-y-4 py-4"
            >
              <div className="flex flex-wrap justify-center gap-2.5 max-w-xs">
                {/* Interests - Sky Blue */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={0}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-500/20 text-[#1E88E5] dark:text-sky-300 border border-sky-200 dark:border-sky-500/40 shadow-2xs"
                >
                  Interests
                </motion.span>

                {/* Personality - Primary Navy */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={1}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#F0F6FC] dark:bg-blue-500/20 text-[#0b1a36] dark:text-blue-300 border border-[#D3E3F5] dark:border-blue-500/40 shadow-2xs"
                >
                  Personality
                </motion.span>
              </div>

              <div className="flex flex-wrap justify-center gap-2.5 max-w-xs">
                {/* Can't stands - Soft neutral */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={2}
                  className="px-4 py-2 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  Can't stands
                </motion.span>

                {/* Ideal work environment - Deep Navy */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={3}
                  className="px-6 py-3 rounded-full text-xs font-extrabold bg-[#0b1a36] text-white border border-[#0b1a36] shadow-md"
                >
                  Ideal work environment
                </motion.span>
              </div>

              <div className="flex justify-center">
                {/* Skills preferences - Accent Blue */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={4}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-emerald-500/20 text-[#1E88E5] dark:text-emerald-300 border border-sky-200 dark:border-emerald-500/30 shadow-2xs"
                >
                  Skills preferences
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Vibrant Blue Circle Forming & Words Populating One by One ── */}
          {activeStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="relative w-full flex items-center justify-center py-4"
            >
              {/* Central Glowing Circle */}
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, type: "spring", stiffness: 100, damping: 15 }}
                className="w-44 h-44 rounded-full bg-gradient-to-tr from-[#1E88E5] via-sky-400 to-[#0b1a36] text-white flex flex-col items-center justify-center font-bold text-center shadow-xl border-4 border-sky-100 dark:border-sky-400/50 z-10 relative"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="text-3xl font-black tracking-tight text-white"
                >
                  94%
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="text-[10px] font-extrabold uppercase tracking-wider text-sky-100"
                >
                  Attributes Fit
                </motion.span>
              </motion.div>

              {/* Satellite Words Populating One by One around the Circle */}
              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={1}
                className="absolute top-0 left-1 z-20 bg-white dark:bg-slate-900 text-[#0b1a36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xs border border-[#D3E3F5] dark:border-slate-800"
              >
                Analytical 92%
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={2}
                className="absolute top-1 right-1 z-20 bg-white dark:bg-slate-900 text-[#0b1a36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xs border border-[#D3E3F5] dark:border-slate-800"
              >
                Creative Fit 98%
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={3}
                className="absolute bottom-2 left-2 z-20 bg-white dark:bg-slate-900 text-[#0b1a36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xs border border-[#D3E3F5] dark:border-slate-800"
              >
                Leadership 88%
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={4}
                className="absolute bottom-1 right-2 z-20 bg-white dark:bg-slate-900 text-[#0b1a36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xs border border-[#D3E3F5] dark:border-slate-800"
              >
                Strategic 95%
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={5}
                className="absolute top-20 -left-4 z-20 bg-sky-50 dark:bg-blue-900/40 text-[#1E88E5] dark:text-blue-200 text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-2xs border border-sky-200 dark:border-blue-800"
              >
                Problem Solver
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 3: Venn Circles Drawing & Words Populating One by One ───────── */}
          {activeStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4 }}
              className="relative w-full flex items-center justify-center py-4"
            >
              {/* Left Circle: YOUR SKILLS (Sky Circle) */}
              <motion.div
                initial={{ x: -40, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="w-38 h-38 sm:w-44 sm:h-44 rounded-full bg-sky-400/30 dark:bg-sky-400/30 border-2 border-[#1E88E5]/80 flex items-center justify-center text-[11px] font-black text-[#0b1a36] dark:text-sky-200 uppercase tracking-wider -mr-8 shadow-lg backdrop-blur-xs"
              >
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={1}
                >
                  YOUR SKILLS
                </motion.span>
              </motion.div>

              {/* Right Circle: MARKET DEMAND (Navy Circle) */}
              <motion.div
                initial={{ x: 40, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100, delay: 0.15 }}
                className="w-38 h-38 sm:w-44 sm:h-44 rounded-full bg-[#0b1a36]/25 dark:bg-purple-500/25 border-2 border-[#0b1a36]/80 flex items-center justify-center text-[11px] font-black text-[#0b1a36] dark:text-purple-200 uppercase tracking-wider -ml-8 shadow-lg backdrop-blur-xs"
              >
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={2}
                >
                  MARKET DEMAND
                </motion.span>
              </motion.div>

              {/* Words populating one by one inside/around Venn */}
              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={3}
                className="absolute top-0 left-0 bg-white dark:bg-slate-900 text-[#0b1a36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xs border border-[#D3E3F5] dark:border-slate-800"
              >
                Data Scientist ⭐⭐⭐⭐
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={4}
                className="absolute bottom-0 right-0 bg-white dark:bg-slate-900 text-[#0b1a36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xs border border-[#D3E3F5] dark:border-slate-800"
              >
                Product Manager ⭐⭐⭐⭐
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 4: Venn Intersection ("You're a Visionary!") & Career Titles ── */}
          {activeStep === 3 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4 }}
              className="relative w-full flex items-center justify-center py-2 h-full"
            >
              {/* Concentric orbit line */}
              <div className="absolute inset-1 rounded-full border border-[#D3E3F5] dark:border-slate-800 opacity-50 pointer-events-none" />

              {/* Left Circle: YOUR SKILLS */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-sky-400/50 via-[#1E88E5]/30 to-sky-200/20 border border-[#1E88E5]/80 flex flex-col items-center justify-center text-[10px] font-extrabold text-[#0b1a36] dark:text-sky-200 uppercase tracking-widest -mr-9 shadow-xl"
              >
                <span className="mt-8">YOUR SKILLS</span>
              </motion.div>

              {/* Right Circle: MARKET DEMAND */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-[#0b1a36]/40 via-[#0b1a36]/30 to-blue-900/20 border border-[#0b1a36]/80 flex flex-col items-center justify-center text-[10px] font-extrabold text-[#0b1a36] dark:text-purple-200 uppercase tracking-widest -ml-9 shadow-xl"
              >
                <span className="mt-8">MARKET DEMAND</span>
              </motion.div>

              {/* Center Overlap Headline Text: "You're a Visionary!" */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.5, type: "spring", stiffness: 120 }}
                className="absolute z-20 text-center pointer-events-none"
              >
                <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#0b1a36] dark:text-white drop-shadow-md leading-tight">
                  You're a<br />Visionary!
                </h3>
              </motion.div>

              {/* ── Surrounding Floating Career Cards matching site typography ──── */}
              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={1}
                className="absolute top-0 z-30 bg-white/95 dark:bg-slate-900/95 border border-[#D3E3F5] dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-xs text-[10px]"
              >
                <p className="font-bold text-[#0b1a36] dark:text-white">Museum Curator</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={2}
                className="absolute top-10 left-0 z-30 bg-white/95 dark:bg-slate-900/95 border border-[#D3E3F5] dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-xs text-[10px]"
              >
                <p className="font-bold text-[#0b1a36] dark:text-white">Archaeology</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={3}
                className="absolute bottom-6 left-1 z-30 bg-white/95 dark:bg-slate-900/95 border border-[#D3E3F5] dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-xs text-[10px]"
              >
                <p className="font-bold text-[#0b1a36] dark:text-white">Design Thinker</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐☆</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={4}
                className="absolute -bottom-2 z-30 bg-white/95 dark:bg-slate-900/95 border border-[#D3E3F5] dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-xs text-[10px]"
              >
                <p className="font-bold text-[#0b1a36] dark:text-white">User Experience Designer</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={5}
                className="absolute top-12 right-8 z-30 bg-white/95 dark:bg-slate-900/95 border border-[#D3E3F5] dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-xs text-[10px]"
              >
                <p className="font-bold text-[#0b1a36] dark:text-white">Architect</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={6}
                className="absolute top-3 right-0 z-30 bg-white/95 dark:bg-slate-900/95 border border-[#D3E3F5] dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-xs text-[10px]"
              >
                <p className="font-bold text-[#0b1a36] dark:text-white">Engineering</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={7}
                className="absolute bottom-8 right-1 z-30 bg-white/95 dark:bg-slate-900/95 border border-[#D3E3F5] dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-xs text-[10px]"
              >
                <p className="font-bold text-[#0b1a36] dark:text-white">Product Manager</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐☆</p>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────── Hero Banner ────────────────────────────────── */
function HeroBanner({ isDark, onStartDiscovery, onExploreCareers, careersCount, onScrollDown }) {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className={`relative px-6 py-16 md:py-24 transition-colors duration-300 ${isDark
        ? "bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0b0f19] text-slate-100"
        : "bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] text-[#0b1a36]"
      }`}>
      {/* Background decoration or grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, description & buttons */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
          >
            {/* Pill */}
            <motion.div
              variants={fadeUp}
              className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase ${isDark
                ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                : "border-blue-200/80 bg-blue-50/70 text-[#2563eb]"
                }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#3b82f6]"></span>
              THE FUTURE OF CAREER DISCOVERY
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              className={`text-4xl sm:text-5xl lg:text-[58px] xl:text-[66px] font-black tracking-[-0.03em] leading-[1.08] text-center lg:text-left ${isDark ? "text-white" : "text-[#0e131f]"
                }`}
            >
              Stop guessing <br className="hidden sm:inline" />
              your future. <br />
              <span className="bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#4f46e5] light:from-sky-400 light:via-blue-400 light:to-indigo-400 bg-clip-text text-transparent">Experience it.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className={`text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0 text-center lg:text-left ${isDark ? "text-slate-400" : "text-slate-600"
                }`}
            >
              Eliminate career confusion caused by pressure and trends. Discover your true path through structured assessment, real-world trials, and evidence-based guidance.
            </motion.p>

            {/* Button Row */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 w-full sm:w-auto pt-1"
            >
              <button
                type="button"
                onClick={onStartDiscovery}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1d4ed8] hover:bg-[#122b59] active:scale-95 text-white font-bold rounded-full px-6 py-3.5 shadow-xs transition-all duration-200 text-xs sm:text-sm cursor-pointer"
              >
                <span>Start Your Career Journey </span>
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onExploreCareers}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 border font-bold rounded-full px-6 py-3.5 transition-all duration-200 text-xs sm:text-sm active:scale-95 cursor-pointer ${isDark
                    ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200"
                    : "border-[#D3E3F5] bg-white hover:bg-[#F0F6FC] text-[#0b1a36]"
                  }`}
              >
                <span>Explore Careers</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column: Beautiful Abstract Career Test Visualization */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-5 w-full flex justify-center"
          >
            <AbstractCareerTestLoop isDark={isDark} />
          </motion.div>
        </div>

        {/* Scroll down indicator */}
        <motion.button
          onClick={onScrollDown}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className={`mt-16 flex flex-col items-center gap-1.5 mx-auto text-[10px] font-bold tracking-widest uppercase cursor-pointer ${isDark ? "text-slate-600 hover:text-slate-400" : "text-[#1E88E5] hover:text-[#0b1a36]"} transition`}
        >
          <span>Explore Ecosystem</span>
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

/* ─────────────────────────── Interactive "How TryYourCareer Works" Application UX Section ──────────────────────────── */
function HowItWorksInteractiveSection({ isDark, onStartDiscovery, onExploreCareers }) {
  const [activeTab, setActiveTab] = useState("discovery");

  // ── Stage 1: RIASEC Mini-Quiz Demo State ──
  const [selectedQuizOption, setSelectedQuizOption] = useState("investigative");
  const [quizCalculating, setQuizCalculating] = useState(false);

  // ── Stage 2: Career Reality Explorer State ──
  const [selectedCareer, setSelectedCareer] = useState("ds"); // "ds" | "cloud" | "pm" | "cyber"
  const [experienceLevel, setExperienceLevel] = useState(2); // 0 (Entry), 1 (Mid), 2 (Senior)
  const [activeTimelineHour, setActiveTimelineHour] = useState(0);

  // ── Stage 3: Trial Mission Workspace Demo State ──
  const [missionStep, setMissionStep] = useState(0); // 0 (Ready), 1 (Cleaned), 2 (Trained), 3 (Evaluated)
  const [missionRunning, setMissionRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    "Ready: Click '1. Filter Anomalies' to begin simulated workspace.",
  ]);

  // ── Stage 4: Decision Intelligence State ──
  const [compareCareerA, setCompareCareerA] = useState("ds");
  const [compareCareerB, setCompareCareerB] = useState("pm");

  // ── Stage 5: Community Chat Demo State ──
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "Aarav K.",
      role: "Student",
      avatar: "AK",
      text: "Just completed the FinTech Anomaly Detection mission! How math-intensive is the senior level?",
      time: "2m ago",
      isMentor: false,
    },
    {
      sender: "Dev R.",
      role: "Senior Data Scientist @ Uber (Verified Mentor)",
      avatar: "DR",
      text: "Great job Aarav! Senior level is 70% business domain intuition and feature engineering, 30% deep math. Your 94% score is a solid foundation!",
      time: "1m ago",
      isMentor: true,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ── Step Navigation Config ──
  const steps = [
    {
      id: "discovery",
      num: "01",
      icon: Sparkles,
      tag: "Psychometric Fit",
      title: "Discovery & Match",
      desc: "10-min assessment to discover your top ranked career fits.",
      color: "from-[#1E88E5] to-[#0284c7]",
    },
    {
      id: "reality",
      num: "02",
      icon: Compass,
      tag: "500+ Verified Careers",
      title: "Career Reality Explorer",
      desc: "Verified salary facts, 9-to-6 daily routines & market growth.",
      color: "from-indigo-600 to-blue-700",
    },
    {
      id: "missions",
      num: "03",
      icon: Play,
      tag: "The Job Sandbox",
      title: "Simulated Trial Missions",
      desc: "30-min browser sandboxes to test-drive real-world job tasks.",
      color: "from-emerald-600 to-teal-700",
    },
    {
      id: "decision",
      num: "04",
      icon: BarChart3,
      tag: "Trade-off Matrix",
      title: "Decision Intelligence",
      desc: "Side-by-side matrix comparing salary, autonomy & learning curves.",
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "community",
      num: "05",
      icon: Users,
      tag: "Live Peer Networks",
      title: "Career Hub & Mentorship",
      desc: "Live peer channels and guidance from verified industry mentors.",
      color: "from-purple-600 to-pink-600",
    },
  ];

  // ── Stage 1 Quiz Handler ──
  const handleSelectQuiz = (optionId) => {
    setSelectedQuizOption(optionId);
    setQuizCalculating(true);
    setTimeout(() => setQuizCalculating(false), 350);
  };

  const quizOptions = [
    {
      id: "investigative",
      icon: "🔬",
      title: "Analyze Data & Anomalies",
      desc: "Investigate data patterns, run statistical tests, and discover root causes.",
      primaryCareer: "Data Scientist & ML Engineer",
      matchScore: 96,
      secCareer: "Quantitative Research Analyst",
      secScore: 91,
    },
    {
      id: "realistic",
      icon: "⚙️",
      title: "Architect Technical Solutions",
      desc: "Build scalable systems, optimize cloud pipelines, and solve technical bottlenecks.",
      primaryCareer: "Cloud Solutions Architect",
      matchScore: 95,
      secCareer: "Cybersecurity Lead",
      secScore: 89,
    },
    {
      id: "enterprising",
      icon: "🎯",
      title: "Drive Strategy & Execution",
      desc: "Align team goals, manage roadmaps, and maximize product business impact.",
      primaryCareer: "AI Product Manager",
      matchScore: 94,
      secCareer: "Tech Strategy Consultant",
      secScore: 88,
    },
    {
      id: "artistic",
      icon: "🎨",
      title: "Design User Experiences",
      desc: "Empathize with users, craft intuitive interfaces, and prototype workflows.",
      primaryCareer: "Principal Product Designer",
      matchScore: 95,
      secCareer: "Human-AI Interaction Lead",
      secScore: 90,
    },
  ];

  const currentQuizData = quizOptions.find((q) => q.id === selectedQuizOption) || quizOptions[0];

  // ── Stage 2 Career Reality Data ──
  const careerRealities = {
    ds: {
      name: "Data Scientist & ML Engineer",
      category: "Data & Artificial Intelligence",
      autonomy: "9.2 / 10",
      weeklyHours: "42 hrs/wk",
      growth: "+26% YoY",
      salaries: [
        { exp: "Entry (0-2 Yrs)", inr: "₹8.5L – ₹14L", usd: "$75k – $95k" },
        { exp: "Mid-Level (3-6 Yrs)", inr: "₹18L – ₹32L", usd: "$135k – $170k" },
        { exp: "Senior / Lead (7+ Yrs)", inr: "₹42L – ₹80L+", usd: "$210k – $350k+" },
      ],
      timeline: [
        {
          time: "09:30 AM",
          tag: "Standup",
          task: "Cross-functional sprint check-in with Product & Backend teams on recommendation engine latency.",
        },
        {
          time: "11:45 AM",
          tag: "Deep Work",
          task: "Feature engineering in Jupyter & fine-tuning XGBoost classification weights on 2.4M user records.",
        },
        {
          time: "03:15 PM",
          tag: "Impact Review",
          task: "Presenting A/B test conversion lift (+8.4% retention) to VP of Engineering.",
        },
      ],
    },
    cloud: {
      name: "Cloud Solutions Architect",
      category: "Cloud Infrastructure & DevOps",
      autonomy: "9.0 / 10",
      weeklyHours: "44 hrs/wk",
      growth: "+29% YoY",
      salaries: [
        { exp: "Entry (0-2 Yrs)", inr: "₹9L – ₹16L", usd: "$85k – $110k" },
        { exp: "Mid-Level (3-6 Yrs)", inr: "₹22L – ₹38L", usd: "$150k – $195k" },
        { exp: "Senior / Lead (7+ Yrs)", inr: "₹48L – ₹95L+", usd: "$240k – $400k+" },
      ],
      timeline: [
        {
          time: "09:30 AM",
          tag: "Triage",
          task: "Reviewing multi-region Kubernetes cluster health and auto-scaling telemetry.",
        },
        {
          time: "11:45 AM",
          tag: "Terraform",
          task: "Provisioning zero-trust VPC networks and automated failover pipelines on AWS.",
        },
        {
          time: "03:15 PM",
          tag: "Architecture",
          task: "Leading cross-team design review for serverless microservice migration.",
        },
      ],
    },
    pm: {
      name: "AI Product Manager",
      category: "Product & Strategy",
      autonomy: "8.6 / 10",
      weeklyHours: "46 hrs/wk",
      growth: "+22% YoY",
      salaries: [
        { exp: "Entry (0-2 Yrs)", inr: "₹10L – ₹18L", usd: "$80k – $105k" },
        { exp: "Mid-Level (3-6 Yrs)", inr: "₹24L – ₹42L", usd: "$140k – $185k" },
        { exp: "Senior / Lead (7+ Yrs)", inr: "₹45L – ₹90L+", usd: "$225k – $380k+" },
      ],
      timeline: [
        {
          time: "09:30 AM",
          tag: "Roadmap",
          task: "Prioritizing Q3 feature backlog based on user churn feedback and revenue impact.",
        },
        {
          time: "11:45 AM",
          tag: "Customer Discovery",
          task: "Conducting user interviews with enterprise clients on AI automation workflows.",
        },
        {
          time: "03:15 PM",
          tag: "Exec Sync",
          task: "Pitching business case and resource budget to Chief Product Officer.",
        },
      ],
    },
    cyber: {
      name: "Cybersecurity Architect",
      category: "Security & Threat Intelligence",
      autonomy: "8.9 / 10",
      weeklyHours: "43 hrs/wk",
      growth: "+32% YoY",
      salaries: [
        { exp: "Entry (0-2 Yrs)", inr: "₹8L – ₹15L", usd: "$80k – $105k" },
        { exp: "Mid-Level (3-6 Yrs)", inr: "₹20L – ₹36L", usd: "$140k – $180k" },
        { exp: "Senior / Lead (7+ Yrs)", inr: "₹45L – ₹85L+", usd: "$220k – $360k+" },
      ],
      timeline: [
        {
          time: "09:30 AM",
          tag: "Threat Briefing",
          task: "Reviewing global zero-day vulnerability advisories and automated SIEM alerts.",
        },
        {
          time: "11:45 AM",
          tag: "Penetration Audit",
          task: "Simulating adversarial OAuth token injection against new API endpoints.",
        },
        {
          time: "03:15 PM",
          tag: "Compliance",
          task: "Validating SOC-2 and ISO-27001 data isolation policies with engineering leads.",
        },
      ],
    },
  };

  const currentCareer = careerRealities[selectedCareer] || careerRealities.ds;

  // ── Stage 3 Trial Mission Actions ──
  const handleMissionAction = (stepIndex) => {
    setMissionRunning(true);
    if (stepIndex === 1) {
      setTimeout(() => {
        setTerminalLogs((prev) => [
          ...prev,
          "✓ Executed Pandas data cleaning: Filtered 1,420 missing billing rows.",
          "✓ Imputed missing tenure data using median distribution.",
        ]);
        setMissionStep(1);
        setMissionRunning(false);
      }, 700);
    } else if (stepIndex === 2) {
      setTimeout(() => {
        setTerminalLogs((prev) => [
          ...prev,
          "✓ Running correlation matrix: Detected 0.82 correlation on support ticket latency.",
          "✓ Generated automated churn risk classification model (Accuracy: 94.2%).",
        ]);
        setMissionStep(2);
        setMissionRunning(false);
      }, 800);
    } else if (stepIndex === 3) {
      setTimeout(() => {
        setTerminalLogs((prev) => [
          ...prev,
          "✓ Submitted solution to automated industry rubric engine.",
          "★ EVALUATION COMPLETE: 96/100 (Top 5% Benchmark). Verified Badge Issued!",
        ]);
        setMissionStep(3);
        setMissionRunning(false);
      }, 900);
    }
  };

  const resetMission = () => {
    setMissionStep(0);
    setTerminalLogs(["Ready: Click '1. Filter Anomalies' to begin simulated workspace."]);
  };

  // ── Stage 4 Decision Comparison Matrix Data ──
  const comparisonMatrix = {
    ds: { name: "Data Scientist", salary: 94, autonomy: 92, learningCurve: "Steep (Math & Code)", stress: "Moderate (6/10)", demand: "+26% High" },
    pm: { name: "Product Manager", salary: 90, autonomy: 86, learningCurve: "Moderate (Strategy & UX)", stress: "High (8/10)", demand: "+22% High" },
    cyber: { name: "Cybersecurity Lead", salary: 92, autonomy: 89, learningCurve: "Steep (Networks & OS)", stress: "Moderate-High (7/10)", demand: "+32% Extreme" },
    cloud: { name: "Cloud Architect", salary: 95, autonomy: 90, learningCurve: "High (Distributed Systems)", stress: "Moderate (6.5/10)", demand: "+29% Very High" },
  };

  const compA = comparisonMatrix[compareCareerA] || comparisonMatrix.ds;
  const compB = comparisonMatrix[compareCareerB] || comparisonMatrix.pm;

  // ── Stage 5 Chat Send Handler ──
  const handleSendChat = (customText) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: "You (Demo User)",
      role: "Aspiring Explorer",
      avatar: "ME",
      text: textToSend,
      time: "Just now",
      isMentor: false,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Great question! That's covered extensively in the verified career realities and trial missions. Check the Day-in-the-Life tab!";
      if (textToSend.toLowerCase().includes("math") || textToSend.toLowerCase().includes("coding")) {
        reply = "Beginner trial missions guide you step-by-step with structured hints! You learn the exact practical math needed on the job.";
      } else if (textToSend.toLowerCase().includes("salary") || textToSend.toLowerCase().includes("switch")) {
        reply = "Career switchers typically jump to ₹14L–₹22L after 3 verifiable trial missions in their portfolio!";
      } else if (textToSend.toLowerCase().includes("hour") || textToSend.toLowerCase().includes("time")) {
        reply = "Each trial mission is designed to be completed in 25–40 minutes directly inside your web browser!";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "Dev R.",
          role: "Senior Data Scientist @ Uber (Verified Mentor)",
          avatar: "DR",
          text: reply,
          time: "Just now",
          isMentor: true,
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div
      id="how-it-works-section"
      className={`py-20 md:py-28 px-4 sm:px-6 relative transition-colors duration-300 ${isDark
        ? "bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0b0f19] text-slate-100"
        : "bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] text-[#0b1a36]"
        }`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16 space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-[#1E88E5] border border-[#D3E3F5] shadow-2xs">
            <Sparkles size={14} className="text-[#1E88E5]" />
            <span>Interactive Application Demo</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.18] text-[#0b1a36]">
            How <span className="text-[#1E88E5]">TryYourCareer</span> Works
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
            Stop guessing your future. Interact with the 5 integrated stages below to experience how TryYourCareer guides you from self-discovery to real-world job micro-missions.
          </p>
        </div>

        {/* 2-Column Interactive Workspace Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* Left Column: 5 Step Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 h-full">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeTab === step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveTab(step.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative flex items-start gap-4 cursor-pointer flex-1 flex flex-col justify-center ${isActive
                    ? "bg-white border-[#1E88E5] shadow-lg shadow-sky-900/10 ring-2 ring-[#1E88E5]/20 scale-[1.01]"
                    : "bg-white/90 border-[#D3E3F5] hover:bg-white hover:border-[#1E88E5]/60 hover:shadow-xs"
                    }`}
                >
                  <div className="flex items-start gap-4 w-full">
                    {/* Step Icon Badge */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${isActive
                        ? "bg-[#1E88E5] text-white shadow-md shadow-sky-500/30 scale-105"
                        : "bg-[#F0F6FC] text-[#1E88E5] border border-[#D3E3F5]"
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${isActive
                            ? "bg-[#E0F2FE] text-[#0284c7] font-bold"
                            : "bg-[#F0F6FC] text-slate-600 border border-[#D3E3F5]"
                            }`}
                        >
                          Step {step.num} • {step.tag}
                        </span>
                      </div>

                      <h3
                        className={`text-base font-bold transition-colors ${isActive ? "text-[#0b1a36]" : "text-slate-800"
                          }`}
                      >
                        {step.title}
                      </h3>

                      <p className="text-xs leading-relaxed mt-0.5 text-slate-600 font-medium line-clamp-1">
                        {step.desc}
                      </p>
                    </div>

                    {/* Active Indicator Arrow */}
                    {isActive && (
                      <div className="text-[#1E88E5] shrink-0 self-center hidden sm:block">
                        <ArrowRight size={18} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Interactive Demo Sandbox */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="rounded-3xl border border-[#D3E3F5] bg-white text-[#0b1a36] shadow-xl shadow-sky-900/8 overflow-hidden flex flex-col h-full justify-between">
              {/* Sandbox Top Bar Window Header */}
              <div className="px-5 py-3.5 border-b border-[#D3E3F5] bg-[#F8FBFE] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Interactive Live Sandbox Demo
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E88E5] bg-[#E0F2FE] px-3 py-1 rounded-full border border-sky-200">
                  <span className="w-2 h-2 rounded-full bg-[#1E88E5] animate-pulse" />
                  <span>Click to Test Live</span>
                </div>
              </div>

              {/* Dynamic Sandbox Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-white h-full">
                <AnimatePresence mode="wait">
                  {/* ───────────────── DEMO 1: RIASEC MINI-QUIZ ───────────────── */}
                  {activeTab === "discovery" && (
                    <motion.div
                      key="demo-discovery"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 flex-1 flex flex-col justify-between h-full"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E88E5] bg-[#E0F2FE] px-2 py-0.5 rounded-md">
                              Question 1 of 24
                            </span>
                            <h4 className="text-sm sm:text-base font-extrabold text-[#0b1a36]">
                              Problem-Solving Instinct
                            </h4>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                            ✓ AI Powered Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          "When your team encounters an ambiguous, high-impact challenge, which approach feels most natural to you?"
                        </p>
                      </div>

                      {/* 4 Clickable Mini-Quiz Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {quizOptions.map((opt) => {
                          const isSelected = selectedQuizOption === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectQuiz(opt.id)}
                              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${isSelected
                                ? "bg-[#F0F6FC] border-[#1E88E5] shadow-xs ring-1 ring-[#1E88E5]"
                                : "bg-white border-[#D3E3F5] hover:bg-[#F8FBFE] hover:border-slate-300"
                                }`}
                            >
                              <span className="text-xl shrink-0">{opt.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-xs font-bold ${isSelected ? "text-[#1E88E5]" : "text-[#0b1a36]"
                                    }`}
                                >
                                  {opt.title}
                                </div>
                                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {opt.desc}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Live Calculation Output Card */}
                      <div className="p-4 rounded-2xl bg-[#F8FBFE] border border-[#D3E3F5] space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600 uppercase tracking-wider text-[10px]">
                            Live Match Engine Result:
                          </span>
                          {quizCalculating ? (
                            <span className="text-[#1E88E5] text-[11px] animate-pulse">
                              Computing Vector Similarity...
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-[11px]">
                              ✓ Ranked from 500+ Career Database
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-sky-200 shadow-2xs flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-[#0b1a36]">
                                1. {currentQuizData.primaryCareer}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Primary Psychometric Match
                              </div>
                            </div>
                            <div className="text-base font-black text-[#1E88E5]">
                              {currentQuizData.matchScore}%
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-[#0b1a36]">
                                2. {currentQuizData.secCareer}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Secondary Cluster Match
                              </div>
                            </div>
                            <div className="text-base font-black text-purple-600">
                              {currentQuizData.secScore}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={onStartDiscovery}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E88E5] hover:bg-[#1976D2] text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
                        >
                          <span>Take Full 10-Minute Assessment</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ───────────────── DEMO 2: CAREER REALITY EXPLORER ───────────────── */}
                  {activeTab === "reality" && (
                    <motion.div
                      key="demo-reality"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 flex-1 flex flex-col justify-between h-full"
                    >
                      {/* Career Selector Pills */}
                      <div className="flex flex-wrap gap-1.5 p-1 bg-[#F0F6FC] rounded-xl border border-[#D3E3F5]">
                        {[
                          { id: "ds", label: "Data Scientist" },
                          { id: "cloud", label: "Cloud Architect" },
                          { id: "pm", label: "AI Product Manager" },
                          { id: "cyber", label: "Cybersecurity" },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCareer(c.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedCareer === c.id
                              ? "bg-[#1E88E5] text-white shadow-xs"
                              : "text-slate-600 hover:text-[#0b1a36] hover:bg-white/60"
                              }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>

                      {/* Career Header Overview */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-[#F8FBFE] rounded-2xl border border-[#D3E3F5]">
                        <div>
                          <div className="text-xs font-extrabold text-[#0b1a36]">
                            {currentCareer.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Cluster: {currentCareer.category}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-bold">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Autonomy: {currentCareer.autonomy}
                          </span>
                          <span className="text-blue-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                            Growth: {currentCareer.growth}
                          </span>
                        </div>
                      </div>

                      {/* Experience Tier Selector & Real Salary Breakdown */}
                      <div className="space-y-2 p-3.5 bg-white rounded-2xl border border-[#D3E3F5]">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600">Select Career Experience Tier:</span>
                          <span className="text-[#1E88E5] font-extrabold">
                            {currentCareer.salaries[experienceLevel].exp}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {currentCareer.salaries.map((sal, idx) => (
                            <button
                              key={sal.exp}
                              type="button"
                              onClick={() => setExperienceLevel(idx)}
                              className={`p-2 rounded-xl text-center border transition cursor-pointer ${experienceLevel === idx
                                ? "bg-[#E0F2FE] border-[#1E88E5] shadow-xs"
                                : "bg-[#F8FBFE] border-[#D3E3F5] hover:bg-slate-50"
                                }`}
                            >
                              <div className="text-[10px] font-bold text-slate-500">{sal.exp.split(" ")[0]}</div>
                              <div className="text-xs font-black text-[#0b1a36] mt-0.5">{sal.inr}</div>
                              <div className="text-[10px] text-slate-500">{sal.usd}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Clickable 9 AM - 6 PM Day Timeline */}
                      <div className="space-y-1.5 p-3.5 bg-[#F8FBFE] rounded-2xl border border-[#D3E3F5]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Verified 9:00 AM – 6:00 PM Daily Routine:
                        </div>
                        <div className="space-y-1.5">
                          {currentCareer.timeline.map((item, idx) => (
                            <div
                              key={item.time}
                              onClick={() => setActiveTimelineHour(idx)}
                              className={`p-2 rounded-xl text-xs flex items-start gap-2.5 transition cursor-pointer ${activeTimelineHour === idx
                                ? "bg-white border border-[#1E88E5] shadow-2xs"
                                : "bg-white/70 border border-transparent hover:bg-white"
                                }`}
                            >
                              <span className="text-[10px] font-extrabold text-[#1E88E5] bg-[#E0F2FE] px-1.5 py-0.5 rounded shrink-0">
                                {item.time}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-[#0b1a36] mr-1.5">[{item.tag}]</span>
                                <span className="text-slate-600 font-medium">{item.task}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={onExploreCareers}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0b1a36] hover:bg-[#122b59] text-white text-xs font-bold shadow-md transition cursor-pointer"
                        >
                          <span>Explore 500+ Verified Realities</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ───────────────── DEMO 3: TRIAL MISSIONS WORKSPACE ───────────────── */}
                  {activeTab === "missions" && (
                    <motion.div
                      key="demo-missions"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 flex-1 flex flex-col justify-between h-full"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
                            <Briefcase size={12} />
                            <span>Interactive In-Browser Micro-Internship</span>
                          </div>
                          <h4 className="text-base font-extrabold text-[#0b1a36]">
                            FinTech Churn Prediction & Model Deployment Sprint
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={resetMission}
                          className="text-[11px] font-bold text-slate-500 hover:text-[#1E88E5] underline cursor-pointer"
                        >
                          Reset Demo
                        </button>
                      </div>

                      {/* 3 Step Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleMissionAction(1)}
                          disabled={missionRunning || missionStep >= 1}
                          className={`p-2.5 rounded-xl text-xs font-bold border text-left transition cursor-pointer flex items-center justify-between ${missionStep >= 1
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-white border-[#D3E3F5] hover:border-[#1E88E5] text-[#0b1a36]"
                            }`}
                        >
                          <span>1. Filter Anomalies</span>
                          {missionStep >= 1 ? <Check size={14} className="text-emerald-600" /> : <Play size={13} className="text-[#1E88E5]" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMissionAction(2)}
                          disabled={missionRunning || missionStep < 1 || missionStep >= 2}
                          className={`p-2.5 rounded-xl text-xs font-bold border text-left transition cursor-pointer flex items-center justify-between ${missionStep >= 2
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : missionStep < 1
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-white border-[#D3E3F5] hover:border-[#1E88E5] text-[#0b1a36]"
                            }`}
                        >
                          <span>2. Train Model</span>
                          {missionStep >= 2 ? <Check size={14} className="text-emerald-600" /> : <Play size={13} className="text-[#1E88E5]" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMissionAction(3)}
                          disabled={missionRunning || missionStep < 2 || missionStep >= 3}
                          className={`p-2.5 rounded-xl text-xs font-bold border text-left transition cursor-pointer flex items-center justify-between ${missionStep >= 3
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : missionStep < 2
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-[#1E88E5] text-white border-[#1E88E5] hover:bg-[#1976D2]"
                            }`}
                        >
                          <span>3. Submit & Score</span>
                          {missionStep >= 3 ? <Award size={14} className="text-emerald-600" /> : <Zap size={13} />}
                        </button>
                      </div>

                      {/* Simulated Interactive Terminal */}
                      <div className="bg-[#0b1a36] text-slate-100 p-4 rounded-2xl font-mono text-xs space-y-1.5 min-h-[140px] flex-1 flex flex-col justify-center shadow-inner">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] border-b border-slate-700 pb-1.5 font-sans">
                          <span>Terminal: session_sandbox_env_v2.py</span>
                          <span className="text-emerald-400">Status: Active</span>
                        </div>
                        <div className="space-y-1">
                          {terminalLogs.map((log, i) => (
                            <div
                              key={i}
                              className={
                                log.startsWith("★")
                                  ? "text-amber-300 font-bold"
                                  : log.startsWith("✓")
                                    ? "text-emerald-400"
                                    : "text-slate-300"
                              }
                            >
                              {log}
                            </div>
                          ))}
                          {missionRunning && (
                            <div className="text-sky-300 animate-pulse">Running simulation task...</div>
                          )}
                        </div>
                      </div>

                      {/* Verified Badge Unlock Card */}
                      {missionStep === 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <Award size={24} className="text-emerald-600" />
                            <div>
                              <div className="text-xs font-bold text-emerald-950">
                                Verified Level-1 Data Analyst Portfolio Badge Earned!
                              </div>
                              <div className="text-[11px] text-emerald-700">
                                Automated Industry Rubric Score: <strong>96 / 100</strong> (Top 5% Cohort)
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-extrabold bg-emerald-600 text-white px-3 py-1 rounded-lg">
                            Ready to Share
                          </span>
                        </motion.div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={onExploreCareers}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E88E5] hover:bg-[#1976D2] text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
                        >
                          <span>Browse 100+ Live Trial Missions</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ───────────────── DEMO 4: DECISION MATRIX COMPARATOR ───────────────── */}
                  {activeTab === "decision" && (
                    <motion.div
                      key="demo-decision"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 flex-1 flex flex-col justify-between h-full"
                    >
                      <div>
                        <h4 className="text-base font-extrabold text-[#0b1a36]">
                          Interactive Side-by-Side Career Trade-off Matrix
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Select any two career tracks to immediately visualize and quantify their real trade-offs:
                        </p>
                      </div>

                      {/* Selectors */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 bg-[#F0F6FC] rounded-xl border border-[#D3E3F5]">
                          <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                            Career A:
                          </label>
                          <select
                            value={compareCareerA}
                            onChange={(e) => setCompareCareerA(e.target.value)}
                            className="w-full text-xs font-bold bg-white text-[#0b1a36] p-1.5 rounded-lg border border-[#D3E3F5] outline-none"
                          >
                            <option value="ds">Data Scientist & ML</option>
                            <option value="cloud">Cloud Architect</option>
                            <option value="pm">Product Manager</option>
                            <option value="cyber">Cybersecurity Lead</option>
                          </select>
                        </div>

                        <div className="p-2.5 bg-[#F0F6FC] rounded-xl border border-[#D3E3F5]">
                          <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                            Career B:
                          </label>
                          <select
                            value={compareCareerB}
                            onChange={(e) => setCompareCareerB(e.target.value)}
                            className="w-full text-xs font-bold bg-white text-[#0b1a36] p-1.5 rounded-lg border border-[#D3E3F5] outline-none"
                          >
                            <option value="pm">Product Manager</option>
                            <option value="ds">Data Scientist & ML</option>
                            <option value="cloud">Cloud Architect</option>
                            <option value="cyber">Cybersecurity Lead</option>
                          </select>
                        </div>
                      </div>

                      {/* Metric Comparison Bars */}
                      <div className="p-4 bg-[#F8FBFE] rounded-2xl border border-[#D3E3F5] space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-[#0b1a36]">Salary Ceiling Growth</span>
                            <span className="text-slate-600">
                              {compA.name} ({compA.salary}%) vs {compB.name} ({compB.salary}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                            <div className="bg-[#1E88E5] h-full" style={{ width: `${compA.salary / 2}%` }} />
                            <div className="bg-amber-500 h-full" style={{ width: `${compB.salary / 2}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-[#0b1a36]">Workplace Autonomy</span>
                            <span className="text-slate-600">
                              {compA.name} ({compA.autonomy}%) vs {compB.name} ({compB.autonomy}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                            <div className="bg-emerald-500 h-full" style={{ width: `${compA.autonomy / 2}%` }} />
                            <div className="bg-purple-500 h-full" style={{ width: `${compB.autonomy / 2}%` }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="p-2.5 bg-white rounded-xl border border-[#D3E3F5]">
                            <div className="text-[10px] font-bold text-slate-500">{compA.name} Curve</div>
                            <div className="font-bold text-[#0b1a36] mt-0.5">{compA.learningCurve}</div>
                            <div className="text-[11px] text-slate-500">Stress: {compA.stress}</div>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-[#D3E3F5]">
                            <div className="text-[10px] font-bold text-slate-500">{compB.name} Curve</div>
                            <div className="font-bold text-[#0b1a36] mt-0.5">{compB.learningCurve}</div>
                            <div className="text-[11px] text-slate-500">Stress: {compB.stress}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={onExploreCareers}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0b1a36] hover:bg-[#122b59] text-white text-xs font-bold shadow-md transition cursor-pointer"
                        >
                          <span>Compare Any 2 Careers in Full Matrix</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ───────────────── DEMO 5: COMMUNITY CHAT & MENTORSHIP ───────────────── */}
                  {activeTab === "community" && (
                    <motion.div
                      key="demo-community"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3.5 flex-1 flex flex-col justify-between h-full"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <h4 className="text-xs font-extrabold text-[#0b1a36]">
                            #data-science-community • 4 Verified Mentors Online
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-[#1E88E5]">Live Interactive Channel</span>
                      </div>

                      {/* Quick Prompt Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Is coding required for beginner missions?",
                          "What is the starting salary for career switchers?",
                          "How many hours does a trial mission take?",
                        ].map((prompt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendChat(prompt)}
                            className="text-[10px] font-bold bg-[#F0F6FC] hover:bg-[#E0F2FE] text-[#1E88E5] px-2.5 py-1 rounded-full border border-[#D3E3F5] transition cursor-pointer"
                          >
                            + "{prompt}"
                          </button>
                        ))}
                      </div>

                      {/* Chat Messages Window */}
                      <div className="space-y-2.5 p-3.5 bg-[#F8FBFE] rounded-2xl border border-[#D3E3F5] flex-1 min-h-[160px] max-h-[220px] overflow-y-auto text-xs">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${msg.isMentor ? "bg-emerald-600" : "bg-[#1E88E5]"
                                }`}
                            >
                              {msg.avatar}
                            </div>
                            <div
                              className={`flex-1 p-2.5 rounded-xl border ${msg.isMentor
                                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                                : "bg-white border-[#D3E3F5] text-[#0b1a36]"
                                }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-[11px]">
                                  {msg.sender}
                                  <span className="text-[10px] font-normal text-slate-500 ml-1.5">
                                    ({msg.role})
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400">{msg.time}</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed text-xs">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="text-[11px] text-emerald-700 italic flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Dev R. (Mentor) is typing a reply...
                          </div>
                        )}
                      </div>

                      {/* Interactive Chat Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendChat();
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask a question or click a prompt above..."
                          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-white border border-[#D3E3F5] outline-none focus:border-[#1E88E5]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#1976D2] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                        >
                          Send
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stat Highlights */}
        <div className="mt-14 pt-8 border-t border-[#D3E3F5] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#1E88E5]">500+</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              Verified Career Realities
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-700">100+</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              In-Browser Trial Missions
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">6-Factor</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              Psychometric Fit
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">98.4%</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              Decision Confidence Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Designed for the entire ecosystem Section ──────────────────────────── */
function EcosystemSection({ isDark }) {
  const cards = [
    {
      title: "For Students",
      desc: "Stop guessing. Try careers before committing to a major. Build confidence through real-world micro-internships and discover what you actually enjoy doing.",
      icon: Target,
      iconColor: "text-[#1E88E5] dark:text-sky-400",
      iconBg: "bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/60",
    },
    {
      title: "For Parents",
      desc: "Get peace of mind. Receive data-driven confidence reports that validate your child's choices based on their actual performance and sustained interest.",
      icon: ShieldCheck,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60",
    },
    {
      title: "For Schools",
      desc: "Scale career counseling. Provide every student with personalized, structured discovery paths and track aggregate engagement and outcomes.",
      icon: TrendingUp,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60",
    },
  ];

  return (
    <div
      id="ecosystem-section"
      className={`py-20 md:py-24 px-6 ${isDark
        ? "bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0b0f19] text-slate-100"
        : "bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] text-[#0b1a36]"
        } text-left transition-colors duration-300`}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-16 max-w-2xl mx-auto space-y-3">
          <h2
            className={`text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-tight ${isDark ? "text-white" : "text-[#0b1a36]"
              }`}
          >
            Designed for the entire ecosystem
          </h2>
          <p
            className={`text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"
              }`}
          >
            Aligning students, parents, and educators with evidence-based career discovery.
          </p>
        </div>

        {/* 3 Grid Cards */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                whileHover={{ y: -5 }}
                className={`flex flex-col p-8 sm:p-9 rounded-[28px] border shadow-xs hover:shadow-md transition-all duration-300 text-left ${isDark
                  ? "bg-[#141923] border-slate-800/80 text-slate-100"
                  : "bg-white border-[#D3E3F5] text-slate-900"
                  }`}
              >
                {/* Icon Container */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mb-6 ${card.iconBg}`}
                >
                  <Icon size={22} className={card.iconColor} />
                </div>

                {/* Title */}
                <h3
                  className={`text-xl font-bold font-sans tracking-tight mb-3 ${isDark ? "text-white" : "text-[#0b1a36]"
                    }`}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                >
                  {card.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}