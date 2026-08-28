import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, TrendingUp, Terminal, Users,
  ArrowRight, ArrowLeft, ChevronDown,
  CheckCircle2, Clock, X, Loader2, ChevronRight
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
const STAGES_DATA = {
  discover: {
    id: "discover",
    num: "01",
    title: "Discovery Test",
    subtitle: "Find Your Fit with AI-powered Cognitive Profiling",
    desc: "Answer a set of intuitive questions about your preferences, working style, and natural strengths. Our alignment engine matches your responses with career archetypes that fit your personality best.",
    time: "~5 minutes",
    cta: "Start Discovery Test",
    path: "/assessment",
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/20",
    themeColor: "amber",
    highlights: [
      "No preparation needed — just honest answers",
      "Matches you with top 3 career clusters",
      "Measures interests, stability preference & stress tolerance"
    ]
  },
  explore: {
    id: "explore",
    num: "02",
    title: "Explore Job Realities",
    subtitle: "Look Beyond Job Titles. Explore Salaries, Trends & Requirements",
    desc: "Dive deep into verified job market metrics. Compare entry-level pay vs peak growth potential, understand day-to-day stress levels, and see the exact degree or certification path required.",
    time: "~10 minutes",
    cta: "Explore Careers & Salaries",
    path: "/explore-careers",
    gradient: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-500/20",
    themeColor: "blue",
    highlights: [
      "Compare pay brackets across 15+ job families in India",
      "Assess automation & AI replacement index scores",
      "Clear educational roadmap guidelines"
    ]
  },
  experience: {
    id: "experience",
    num: "03",
    title: "Practice Trial Tasks",
    subtitle: "Test-Drive a Day in the Life before committing",
    desc: "Experience real-world assignments. Complete simple mock tasks—like basic code refactoring or design layout tests—to see if you actually enjoy doing the day-to-day work.",
    time: "~15 minutes",
    cta: "Launch Trial Sandbox",
    path: "/trial-mission",
    gradient: "from-violet-400 to-purple-500",
    shadow: "shadow-violet-500/20",
    themeColor: "violet",
    highlights: [
      "Hands-on interactive workspace simulation",
      "Designed for complete beginners to test skills",
      "Instant pass/fail feedback on your task outcome"
    ]
  },
  align: {
    id: "align",
    num: "04",
    title: "Connect with Experts",
    subtitle: "Get Real-World Insights from Professionals in the Hubs",
    desc: "Join industry hubs and interact with experienced practitioners. Ask open questions about office culture, real-world stress, progression timelines, and direct networking opportunities.",
    time: "Ongoing community access",
    cta: "Enter Career Hubs",
    path: "/career-hubs",
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/20",
    themeColor: "emerald",
    highlights: [
      "Access professional QA forums and group chats",
      "Network with potential career mentors",
      "Gain authentic insiders' views on daily schedules"
    ]
  }
};

export default function Hero({ onStartDiscovery, onExploreCareers, careersCount = 0, isDark = true }) {
  const [selectedStageModal, setSelectedStageModal] = useState(null);

  const handleStageClick = (stageId) => {
    setSelectedStageModal(stageId);
  };

  return (
    <section className="relative overflow-visible">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <HeroBanner
        isDark={isDark}
        onStartDiscovery={onStartDiscovery}
        onExploreCareers={onExploreCareers}
        careersCount={careersCount}
        onScrollDown={() => {
          const el = document.getElementById("journey-section");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      {/* ── Stride Journey Section (CareerExplorer Scroll-Pinned Style) ──────── */}
      <StrideJourneySection
        isDark={isDark}
        onStartDiscovery={onStartDiscovery}
        onExploreCareers={onExploreCareers}
        onOpenModal={handleStageClick}
      />

      {/* Testimonials */}
      <TestimonialSlider isDark={isDark} />

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedStageModal && (
          <StrideStageModal
            stageId={selectedStageModal}
            onClose={() => setSelectedStageModal(null)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

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
                {/* Interests - Amber/Gold */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={0}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-sm"
                >
                  Interests
                </motion.span>

                {/* Personality - Primary Blue */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={1}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 shadow-sm"
                >
                  Personality
                </motion.span>
              </div>

              <div className="flex flex-wrap justify-center gap-2.5 max-w-xs">
                {/* Can't stands - Rose */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={2}
                  className="px-4 py-2 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-500/20 text-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30"
                >
                  Can't stands
                </motion.span>

                {/* Ideal work environment - Purple */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={3}
                  className="px-6 py-3 rounded-full text-xs font-extrabold bg-purple-100 dark:bg-purple-500/25 text-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-500/40 shadow-md"
                >
                  Ideal work environment
                </motion.span>
              </div>

              <div className="flex justify-center">
                {/* Skills preferences - Emerald */}
                <motion.span
                  variants={wordPopVariant}
                  initial="hidden"
                  animate="show"
                  custom={4}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 shadow-sm"
                >
                  Skills preferences
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Vibrant Yellow Circle Forming & Words Populating One by One ── */}
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
                className="w-44 h-44 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-[#0B1A36] flex flex-col items-center justify-center font-bold text-center shadow-xl border-4 border-amber-100 dark:border-amber-400/50 z-10 relative"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="text-3xl font-black tracking-tight text-[#0B1A36]"
                >
                  94%
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="text-[10px] font-extrabold uppercase tracking-wider text-amber-950"
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
                className="absolute top-0 left-1 z-20 bg-white dark:bg-slate-900 text-[#0B1A36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-800"
              >
                Analytical 92%
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={2}
                className="absolute top-1 right-1 z-20 bg-white dark:bg-slate-900 text-[#0B1A36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-800"
              >
                Creative Fit 98%
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={3}
                className="absolute bottom-2 left-2 z-20 bg-white dark:bg-slate-900 text-[#0B1A36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-800"
              >
                Leadership 88%
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={4}
                className="absolute bottom-1 right-2 z-20 bg-white dark:bg-slate-900 text-[#0B1A36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-800"
              >
                Strategic 95%
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={5}
                className="absolute top-20 -left-4 z-20 bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow border border-blue-200 dark:border-blue-800"
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
              {/* Left Circle: YOUR SKILLS (Yellow Circle) */}
              <motion.div
                initial={{ x: -40, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="w-38 h-38 sm:w-44 sm:h-44 rounded-full bg-amber-400/40 dark:bg-amber-400/30 border-2 border-amber-400/80 flex items-center justify-center text-[11px] font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider -mr-8 shadow-lg backdrop-blur-xs"
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

              {/* Right Circle: MARKET DEMAND (Purple Circle) */}
              <motion.div
                initial={{ x: 40, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100, delay: 0.15 }}
                className="w-38 h-38 sm:w-44 sm:h-44 rounded-full bg-purple-400/35 dark:bg-purple-500/25 border-2 border-purple-400/80 flex items-center justify-center text-[11px] font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider -ml-8 shadow-lg backdrop-blur-xs"
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
                className="absolute top-0 left-0 bg-white dark:bg-slate-900 text-[#0B1A36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800"
              >
                Data Scientist ⭐⭐⭐⭐
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={4}
                className="absolute bottom-0 right-0 bg-white dark:bg-slate-900 text-[#0B1A36] dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800"
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
              <div className="absolute inset-1 rounded-full border border-slate-300 dark:border-slate-800 opacity-50 pointer-events-none" />

              {/* Left Circle: YOUR SKILLS */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-yellow-400/75 via-amber-400/50 to-amber-300/40 border border-amber-400/80 flex flex-col items-center justify-center text-[10px] font-extrabold text-amber-950 dark:text-amber-200 uppercase tracking-widest -mr-9 shadow-xl"
              >
                <span className="mt-8">YOUR SKILLS</span>
              </motion.div>

              {/* Right Circle: MARKET DEMAND */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-purple-400/45 via-purple-300/35 to-indigo-300/30 border border-purple-400/80 flex flex-col items-center justify-center text-[10px] font-extrabold text-purple-950 dark:text-purple-200 uppercase tracking-widest -ml-9 shadow-xl"
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
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B1A36] dark:text-white drop-shadow-md leading-tight">
                  You're a<br />Visionary!
                </h3>
              </motion.div>

              {/* ── Surrounding Floating Career Cards matching site typography ──── */}
              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={1}
                className="absolute top-0 z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-lg text-[10px]"
              >
                <p className="font-bold text-[#0B1A36] dark:text-white">Museum Curator</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={2}
                className="absolute top-10 left-0 z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-lg text-[10px]"
              >
                <p className="font-bold text-[#0B1A36] dark:text-white">Archaeology</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={3}
                className="absolute bottom-6 left-1 z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-lg text-[10px]"
              >
                <p className="font-bold text-[#0B1A36] dark:text-white">Design Thinker</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐☆</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={4}
                className="absolute -bottom-2 z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-lg text-[10px]"
              >
                <p className="font-bold text-[#0B1A36] dark:text-white">User Experience Designer</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={5}
                className="absolute top-12 right-8 z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-lg text-[10px]"
              >
                <p className="font-bold text-[#0B1A36] dark:text-white">Architect</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={6}
                className="absolute top-3 right-0 z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-lg text-[10px]"
              >
                <p className="font-bold text-[#0B1A36] dark:text-white">Engineering</p>
                <p className="text-amber-500 text-[8px]">⭐⭐⭐⭐⭐</p>
              </motion.div>

              <motion.div
                variants={wordPopVariant}
                initial="hidden"
                animate="show"
                custom={7}
                className="absolute bottom-8 right-1 z-30 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-left shadow-lg text-[10px]"
              >
                <p className="font-bold text-[#0B1A36] dark:text-white">Product Manager</p>
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
  // Anim-variants for the mock browser elements
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
      : "bg-[#FAF8F5] text-[#0b1a36]"
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
            className="lg:col-span-7 flex flex-col items-start text-left space-y-6"
          >
            {/* Pill */}
            <motion.div
              variants={fadeUp}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase ${isDark
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                : "border-blue-200/70 bg-blue-50/80 text-[#2563eb]"
                }`}
            >
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              THE FUTURE OF CAREER DISCOVERY
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] ${isDark ? "text-white" : "text-[#0b1a36]"
                }`}
            >
              Stop guessing <br className="hidden sm:inline" />
              your future. <br />
              <span className="text-blue-600 dark:text-blue-400">Experience it.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className={`text-sm sm:text-base leading-relaxed max-w-lg ${isDark ? "text-slate-400" : "text-slate-600"
                }`}
            >
              Eliminate career confusion caused by pressure and trends. Discover your true path through structured assessment, real-world trials, and evidence-based guidance.
            </motion.p>

            {/* Button Row */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-1"
            >
              <button
                type="button"
                onClick={onStartDiscovery}
                className="group inline-flex items-center justify-center gap-2 bg-[#2B59C3] hover:bg-blue-700 active:scale-95 text-white font-bold rounded-full px-6 py-3.5 shadow-md shadow-blue-500/20 transition-all duration-200 text-xs sm:text-sm cursor-pointer"
              >
                <span>Get Start Now </span>
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onExploreCareers}
                className={`inline-flex items-center justify-center gap-2 border font-bold rounded-full px-6 py-3.5 transition-all duration-200 text-xs sm:text-sm active:scale-95 cursor-pointer ${isDark
                    ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200"
                    : "border-slate-200/80 bg-white/60 hover:bg-slate-50 text-[#0b1a36]"
                  }`}
              >
                <span>Explore Careers</span>
              </button>
            </motion.div>

            {/* BY THE NUMBERS Section */}
            <motion.div
              variants={fadeUp}
              className="pt-5 w-full text-left mt-1"
            >
              <h4 className="text-[11px] font-black tracking-widest uppercase text-amber-500 dark:text-amber-400 mb-3.5">
                BY THE NUMBERS
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-start">
                {/* Metric 1: AVG RATING */}
                <div className="flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    AVG RATING
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-amber-500 text-xs">⭐⭐⭐⭐</span>
                    <span className="text-amber-500/70 text-xs">⭐</span>
                    <span className="text-xs font-bold text-[#0b1a36] dark:text-slate-200">4.5</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                    860+ from the last 30 days
                  </p>
                </div>

                {/* Metric 2: Questions Answered */}
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#2563eb] dark:text-blue-400 tracking-tight">
                    500 K
                  </p>
                  <p className="text-[11px] font-medium leading-tight text-slate-600 dark:text-slate-400 mt-0.5">
                    Trusted Users
                  </p>
                </div>

                {/* Metric 3: Degrees & Careers */}
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#7c3aed] dark:text-purple-400 tracking-tight">
                    1500+
                  </p>
                  <p className="text-[11px] font-medium leading-tight text-slate-600 dark:text-slate-400 mt-0.5">
                    Careers
                  </p>
                </div>

                {/* Metric 4: Personality Traits */}
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#059669] dark:text-emerald-400 tracking-tight">
                    140+
                  </p>
                  <p className="text-[11px] font-medium leading-tight text-slate-600 dark:text-slate-400 mt-0.5">
                    Hubs
                  </p>
                </div>
              </div>
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

/* ─────────────────────────── Ecosystem / Career Stages Section ──────────────────────────── */
function EcosystemSection({ isDark }) {
  const stages = [
    {
      title: "Working Professionals",
      desc: "Be your best self at work. Learn what makes you unique and how well-suited you are to your past, current, and future career choices.",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
      alt: "Working Professional"
    },
    {
      title: "College Students & Graduates",
      desc: "Unsure about what to do after college? See the range of careers you can pursue with your interests, personality, and education.",
      img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
      alt: "College Students & Graduates"
    },
    {
      title: "Career Changers",
      desc: "Looking to make a career change? Thinking about going back to school? TryYourCareers will point you in the right direction.",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
      alt: "Career Changers"
    },
    {
      title: "High School Students",
      desc: "Discover your true potential and all of the options you have after high school. Then see which path is right for you.",
      img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
      alt: "High School Students"
    }
  ];

  return (
    <div className={`py-24 px-6 ${isDark ? "bg-slate-950" : "bg-[#FAF8F5]"} text-left`}>
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-4xl sm:text-5xl font-serif font-light tracking-normal ${isDark ? "text-white" : "text-[#1d1d1f]"
            }`}>
            For every career stage
          </h2>
        </div>

        {/* 2x2 Grid of Stage Cards */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.12 } }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {stages.map((stage) => (
            <motion.div
              key={stage.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
              whileHover={{ y: -4 }}
              className={`group flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border ${isDark
                ? "bg-[#141923] border-slate-800/80 text-slate-100"
                : "bg-white border-slate-200/80 text-slate-900"
                }`}
            >
              {/* Image Container */}
              <div className="w-full sm:w-[42%] h-48 sm:h-auto shrink-0 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={stage.img}
                  alt={stage.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Text Content */}
              <div className="w-full sm:w-[58%] p-6 sm:p-7 flex flex-col justify-center text-left">
                <h3 className={`text-xl sm:text-2xl font-serif font-normal leading-tight mb-3 ${isDark ? "text-white" : "text-[#222222]"
                  }`}>
                  {stage.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-[#666666]"
                  }`}>
                  {stage.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Testimonial Slider ─────────────────────────── */
const TESTIMONIALS = [
  {
    name: "David R.",
    role: "Business Owner / Student Parent",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    quote: "TryYourCareers truly changed my life. I tried everything, but this program gave me the simulator test-drives and personalized guidance I needed. I found my fit in Software Engineering and finally feel truly energized, confident, and in control of my future.",
    rating: 5,
    tag: "Software Engineering"
  },
  {
    name: "Elena M.",
    role: "Data Analyst Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    quote: "The interactive trial sandboxes let me feel what it's actually like to analyze models and write Python code. I'm now studying Data Science with 100% confidence instead of guessing.",
    rating: 5,
    tag: "Data Science"
  },
  {
    name: "Marcus K.",
    role: "DevOps Engineer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    quote: "Having the confidence reports backed by actual runtime simulator testing made it so easy to get validation from my parents and counselors. Highly recommend the simulator!",
    rating: 5,
    tag: "DevOps & Cloud"
  }
];

function TestimonialSlider({ isDark }) {
  const [curr, setCurr] = useState(0);
  const active = TESTIMONIALS[curr];
  const next = TESTIMONIALS[(curr + 1) % TESTIMONIALS.length];

  // Auto carousel loop every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurr((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurr(prev => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurr(prev => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`py-16 md:py-24 border-t transition-colors duration-300 ${isDark ? "bg-[#0b0f19] border-slate-800 text-slate-100" : "bg-[#FAF8F5] border-slate-200/80 text-[#0b1a36]"
      }`}>
      <div className="mx-auto max-w-6xl px-6 sm:px-8 text-left">

        {/* Header Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase ${isDark ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-900"
              }`}>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              STUDENT TESTIMONIALS
            </span>
            <h2 className={`mt-3 text-3xl sm:text-4xl font-serif font-extrabold tracking-tight ${isDark ? "text-white" : "text-[#0b1a36]"
              }`}>
              Real Lives Changed
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Testimonial"
              className={`p-3 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer ${isDark
                ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
                : "bg-white border-slate-200 hover:bg-slate-50 text-[#0b1a36] shadow-sm"
                }`}
            >
              <ArrowLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-1.5 px-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurr(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${curr === idx ? "w-6 bg-blue-600" : "w-2 bg-slate-300 dark:bg-slate-700"
                    }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Testimonial"
              className={`p-3 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer ${isDark
                ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
                : "bg-white border-slate-200 hover:bg-slate-50 text-[#0b1a36] shadow-sm"
                }`}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={curr}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl p-6 sm:p-10 border ${isDark
              ? "bg-[#111827]/90 border-slate-800/80 shadow-2xl shadow-slate-950/60"
              : "bg-white border-slate-200/80 shadow-xl shadow-slate-200/40"
              }`}
          >
            {/* Left Column: Reviewer Photo & Trust Badge */}
            <div className="lg:col-span-4 flex flex-col justify-between items-center sm:items-start gap-6">
              <div className="relative w-full max-w-[260px] sm:max-w-none aspect-square rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800">
                <img
                  src={active.image}
                  alt={active.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-amber-500 flex items-center gap-1 shadow-sm">
                  <span>⭐⭐⭐⭐⭐</span>
                </div>
              </div>

              {/* Verified Student Pill */}
              <div className={`w-full p-4 rounded-2xl border ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-[#FAF8F5] border-slate-100"
                }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold tracking-tight">Verified Graduate Match</span>
                </div>
                <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Matched with <span className="font-semibold text-blue-600 dark:text-blue-400">{active.tag}</span>
                </p>
              </div>
            </div>

            {/* Right Column: Quote & Details */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-6 pt-2">
              <div>
                <div className="text-amber-500 font-serif text-5xl leading-none select-none opacity-40">“</div>
                <p className={`text-lg sm:text-xl md:text-2xl font-serif leading-relaxed -mt-4 ${isDark ? "text-slate-200" : "text-[#0b1a36]"
                  }`}>
                  {active.quote}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-[#0b1a36]"}`}>
                    {active.name}
                  </h4>
                  <p className={`text-xs sm:text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {active.role}
                  </p>
                </div>

                {/* Next preview card */}
                <button
                  onClick={handleNext}
                  className={`flex items-center gap-3 rounded-2xl p-2.5 px-3.5 border transition-all duration-200 text-left active:scale-95 cursor-pointer ${isDark
                    ? "bg-slate-900/80 border-slate-800 hover:bg-slate-800"
                    : "bg-[#FAF8F5] border-slate-200/70 hover:bg-slate-100"
                    }`}
                >
                  <img src={next.image} alt={next.name} className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Up Next</span>
                    <p className="text-xs font-bold text-[#0b1a36] dark:text-white truncate max-w-[110px]">{next.name}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

/* ─────────────────────────── CareerExplorer Scroll-Pinned How It Works ─────────── */
function StrideJourneySection({ isDark, onStartDiscovery, onExploreCareers, onOpenModal }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  // Auto scroll-pin calculation to step through 4 stages smoothly
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      const step = Math.min(3, Math.floor(progress * 4));
      setActiveStep(step);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const STEPS = [
    {
      id: "discover",
      num: "01",
      navTitle: "Answer",
      title: "Answer a series of questions",
      desc: "Take the assessment and get your career matches, personality archetype, and more along the way.",
      badge: "Stage 01: Discover",
      ctaText: "Start Assessment",
      ctaAction: () => {
        if (onStartDiscovery) onStartDiscovery();
        else navigate("/assessment");
      },
      gradient: "from-amber-400 to-orange-500"
    },
    {
      id: "archetype",
      num: "02",
      navTitle: "Discover",
      title: "Discover what makes you — You",
      desc: "Find out what makes you stand apart from others and why certain careers are great fits for you.",
      badge: "Stage 02: Personality & Archetype",
      ctaText: "Explore Personality Fits",
      ctaAction: () => {
        if (onStartDiscovery) onStartDiscovery();
        else navigate("/assessment");
      },
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      id: "explore",
      num: "03",
      navTitle: "Explore",
      title: "Explore the world of school & work",
      desc: "Find all the information you need to know about your dream career. Then make a plan to get there.",
      badge: "Stage 03: Career & Salary Metrics",
      ctaText: "Explore Salaries & Trends",
      ctaAction: () => {
        if (onExploreCareers) onExploreCareers();
        else navigate("/explore-careers");
      },
      gradient: "from-violet-400 to-purple-500"
    },
    {
      id: "align",
      num: "04",
      navTitle: "Align",
      title: "Align with experts & trial sandboxes",
      desc: "Experience real-world task sandboxes and connect with practicing mentors in career hubs.",
      badge: "Stage 04: Practical Sandboxes & Hubs",
      ctaText: "Launch Sandboxes & Hubs",
      ctaAction: () => navigate("/career-hubs"),
      gradient: "from-emerald-400 to-teal-500"
    }
  ];

  return (
    <div
      id="journey-section"
      ref={sectionRef}
      className={`relative min-h-[320vh] ${isDark ? "bg-[#10141d] text-slate-100" : "bg-[#FAF8F5] text-slate-900"
        } scroll-mt-6 transition-colors duration-300`}
    >
      {/* Sticky Fullscreen Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center py-6 px-4 sm:px-8 md:px-12">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full max-h-[88vh]">

          {/* ── Far Left Rotated "How it works" Title Bar & Indicator ────────────── */}
          <div className={`hidden xl:flex lg:col-span-1 flex-col items-center justify-center h-full pr-4 border-r ${isDark ? "border-slate-800" : "border-slate-300/80"
            }`}>
            <span className={`text-xs font-bold uppercase tracking-[0.25em] -rotate-90 whitespace-nowrap origin-center my-12 ${isDark ? "text-slate-500" : "text-slate-600 font-extrabold"
              }`}>
              How it works
            </span>
            <div className={`w-1 flex-1 rounded-full relative my-4 overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-300"
              }`}>
              <motion.div
                className="w-full bg-amber-500 rounded-full"
                animate={{
                  height: `${((activeStep + 1) / 4) * 100}%`
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            </div>
          </div>

          {/* ── Left Column: 4 Step Accordion Nav / Content ──────────────────────── */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 text-left pr-0 lg:pr-6">

            <div className="space-y-6">
              {STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`cursor-pointer transition-all duration-300 ${isActive ? "opacity-100 translate-x-0" : isDark ? "opacity-35 hover:opacity-75" : "opacity-45 hover:opacity-90"
                      }`}
                  >
                    {isActive ? (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-amber-500 uppercase tracking-widest">
                            {step.num}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${isDark
                            ? "bg-slate-800 text-slate-300 border-slate-700"
                            : "bg-white text-slate-700 border-slate-300 shadow-sm"
                            }`}>
                            {step.badge}
                          </span>
                        </div>

                        <h3 className={`text-2xl sm:text-3xl md:text-4xl font-serif font-light leading-tight ${isDark ? "text-white" : "text-[#1d1d1f]"
                          }`}>
                          {step.title}
                        </h3>

                        <p className={`text-xs sm:text-sm leading-relaxed max-w-lg font-light ${isDark ? "text-slate-400" : "text-slate-600"
                          }`}>
                          {step.desc}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <button
                            onClick={step.ctaAction}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-gradient-to-r ${step.gradient} shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2`}
                          >
                            <span>{step.ctaText}</span>
                            <ArrowRight size={14} />
                          </button>

                          <button
                            onClick={() => onOpenModal(step.id)}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${isDark
                              ? "text-slate-300 border-slate-700 hover:bg-slate-800"
                              : "text-slate-700 border-slate-300 bg-white hover:bg-slate-100 shadow-sm"
                              }`}
                          >
                            <span>Blueprint</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-3 py-1">
                        <span className={`text-base font-bold font-mono ${isDark ? "text-slate-500" : "text-slate-500"
                          }`}>{step.num}</span>
                        <span className={`text-xl sm:text-2xl font-serif font-light ${isDark ? "text-slate-400" : "text-slate-700"
                          }`}>
                          {step.navTitle}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* ── Center / Right Column: Dynamic Visual Graphic Showcase ──────────────── */}
          <div className="lg:col-span-6 flex items-center justify-center w-full h-full relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35 }}
                className="w-full flex items-center justify-center"
              >

                {/* ── STEP 01 GRAPHIC (Answer a series of questions) ──────────────── */}
                {activeStep === 0 && (
                  <div className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-6">
                    {/* Mobile Phone Mockup */}
                    <div className={`w-full sm:w-72 border rounded-3xl p-4 shadow-2xl space-y-4 text-left ${isDark ? "bg-[#121315] border-slate-800" : "bg-white border-slate-200 shadow-slate-300/50"
                      }`}>
                      <div className={`flex items-center justify-between pb-2 border-b text-[10px] font-mono ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"
                        }`}>
                        <span>≡ TryYourCareers</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${isDark ? "bg-white/10 text-white" : "bg-slate-900 text-white"
                          }`}>Save progress</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Would you like to...</span>
                        <p className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Direct the making of a movie</p>
                      </div>

                      <div className="space-y-2 text-xs">
                        {[
                          { num: 1, label: "Hate it" },
                          { num: 2, label: "Dislike it" },
                          { num: 3, label: "Neutral" },
                          { num: 4, label: "Like it" },
                          { num: 5, label: "Love it", active: true }
                        ].map((opt) => (
                          <div
                            key={opt.num}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${opt.active
                              ? "bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-300 font-bold"
                              : isDark
                                ? "bg-slate-900 border-slate-800 text-slate-400"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                          >
                            <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${isDark ? "border-slate-700" : "border-slate-300"
                              }`}>
                              {opt.num}
                            </span>
                            <span>{opt.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 text-center text-[10px] text-slate-500">
                        Skip question
                      </div>
                      <div className={`pt-1 border-t flex items-center justify-between text-[9px] font-mono ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"
                        }`}>
                        <span>UP NEXT: Personality archetype</span>
                        <span>~ 3 MINS</span>
                      </div>
                    </div>

                    {/* Right Timeline Checklist */}
                    <div className={`hidden sm:flex flex-col space-y-4 text-left border-l pl-4 py-2 ${isDark ? "border-slate-800" : "border-slate-300"
                      }`}>
                      {[
                        { label: "Start", done: true },
                        { label: "Your personality archetype", done: true },
                        { label: "Career matches", done: true },
                        { label: "Degree matches", done: true },
                        { label: "Final results", done: false, active: true, details: ["40 questions", "Career matches and insights", "Degree matches and insights", "Personality report", "Trait report"] }
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            {item.done ? (
                              <div className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-[10px]">✓</div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-400 dark:bg-white border-2 border-slate-400 dark:border-white" />
                            )}
                            <span className={item.active ? isDark ? "text-white text-sm" : "text-slate-900 text-sm font-extrabold" : isDark ? "text-slate-400" : "text-slate-500"}>{item.label}</span>
                          </div>
                          {item.details && (
                            <div className="pl-7 space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                              <p className="font-mono text-slate-600 dark:text-slate-500">{item.details[0]}</p>
                              {item.details.slice(1).map((d, di) => (
                                <p key={di}>• {d}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── STEP 02 GRAPHIC (Discover what makes you — You) ─────────────── */}
                {activeStep === 1 && (
                  <div className="w-full max-w-lg relative min-h-[320px] flex items-center justify-center">
                    {/* Visionary Card */}
                    <div className="absolute -top-4 -left-2 sm:left-4 z-20 w-64 p-4 rounded-2xl bg-gradient-to-br from-purple-900/90 to-slate-900 border border-purple-500/30 text-white shadow-2xl text-left">
                      <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-purple-500/30 text-purple-300">
                        SUPER RARE • 2% OF USERS
                      </span>
                      <h4 className="text-lg font-bold mt-2">Lucas is a visionary</h4>
                      <p className="text-xs text-purple-200">Creative, Introspective, Persuasive</p>
                      <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">
                        Visionaries are all about creating their own artistic empire. They enjoy independent, unstructured spaces where they can be creative.
                      </p>
                    </div>

                    {/* Personality Report Book */}
                    <div className="absolute right-2 sm:right-6 top-0 z-10 w-48 h-60 rounded-xl bg-amber-900/70 border border-amber-500/40 p-4 text-amber-100 flex flex-col justify-between shadow-xl">
                      <span className="text-[9px] font-mono tracking-widest uppercase">PERSONALITY REPORT</span>
                      <div className="w-16 h-16 rounded-full border border-amber-500/40 mx-auto flex items-center justify-center">
                        <div className="w-8 h-8 rotate-45 border border-amber-400" />
                      </div>
                      <span className="text-[9px] font-mono text-center">TryYourCareers</span>
                    </div>

                    {/* Trait Report Book */}
                    <div className="absolute right-10 bottom-2 z-30 w-44 h-56 rounded-xl bg-teal-900/90 border border-teal-400/40 p-4 text-teal-100 shadow-2xl flex flex-col justify-between">
                      <span className="text-[9px] font-mono tracking-widest uppercase">TRAIT REPORT</span>
                      <div className="flex items-end gap-1 h-16 justify-center">
                        <div className="w-2 h-10 bg-teal-400/60 rounded-t" />
                        <div className="w-2 h-14 bg-teal-400 rounded-t" />
                        <div className="w-2 h-8 bg-teal-400/40 rounded-t" />
                        <div className="w-2 h-12 bg-teal-400/80 rounded-t" />
                      </div>
                      <span className="text-[9px] font-mono">sokanu fit engine</span>
                    </div>

                    {/* Highlight Speech Bubble */}
                    <div className="absolute -bottom-6 right-0 z-40 bg-teal-950/90 border border-teal-500/40 p-3 rounded-2xl max-w-xs text-left text-[11px] text-teal-200 shadow-2xl">
                      <p className="font-bold text-white">You value ability utilization, feeling of achievement, and opportunities for advancement.</p>
                      <span className="text-[9px] text-teal-400 underline block mt-1">Learn about your must-haves →</span>
                    </div>
                  </div>
                )}

                {/* ── STEP 03 GRAPHIC (Explore the world of school & work) ───────────── */}
                {activeStep === 2 && (
                  <div className="w-full max-w-lg relative min-h-[320px] flex items-center justify-center">
                    {/* Degree Card 1 */}
                    <div className="absolute top-0 left-4 z-10 bg-white text-slate-900 p-3 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=100&auto=format&fit=crop&q=80" alt="Degree" className="w-12 h-10 rounded-lg object-cover" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Architect Degree</p>
                        <p className="text-amber-500 text-[10px]">⭐⭐⭐⭐⭐</p>
                      </div>
                    </div>

                    {/* Degree Card 2 */}
                    <div className="absolute top-14 left-0 z-20 bg-white text-slate-900 p-3 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=100&auto=format&fit=crop&q=80" alt="Career" className="w-12 h-10 rounded-lg object-cover" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Dental Hygienist</p>
                        <p className="text-amber-500 text-[10px]">⭐⭐⭐⭐⭐</p>
                      </div>
                    </div>

                    {/* Avg Tuition Pill */}
                    <div className="absolute top-16 right-20 z-20 bg-amber-900/90 text-amber-200 px-3 py-1.5 rounded-xl text-left border border-amber-500/30 shadow-lg">
                      <span className="text-[9px] block font-mono">Avg Tuition</span>
                      <span className="text-xs font-bold">$8k/year</span>
                    </div>

                    {/* Salary & Metrics Floating Card */}
                    <div className="absolute bottom-0 right-0 z-30 w-72 bg-white text-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-200 text-left">
                      <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <span className="text-xs font-bold text-slate-900">Filter by average salary</span>
                        <span className="text-[10px] text-slate-400">The avg salary is $56k/yr</span>
                      </div>
                      <div className="flex items-end gap-1 h-12 justify-center mb-2">
                        {[20, 35, 45, 60, 80, 100, 70, 50, 90, 40, 30, 15].map((h, i) => (
                          <div key={i} style={{ height: `${h}%` }} className="w-2 bg-purple-500/70 rounded-t" />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t">
                        <span className="px-2 py-1 bg-slate-100 rounded font-bold text-slate-700">$30,000</span>
                        <span>—</span>
                        <span className="px-2 py-1 bg-slate-100 rounded font-bold text-slate-700">$300,000</span>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="absolute top-36 left-2 z-30 bg-purple-600 text-white px-3 py-1.5 rounded-xl text-left shadow-lg">
                      <span className="text-[9px] block">Avg Salary</span>
                      <span className="text-xs font-bold">$94k</span>
                    </div>

                    <div className="absolute bottom-8 left-16 z-30 bg-amber-500 text-white px-3 py-1.5 rounded-xl text-left shadow-lg">
                      <span className="text-[9px] block">Growth</span>
                      <span className="text-xs font-bold">↑10%</span>
                    </div>
                  </div>
                )}

                {/* ── STEP 04 GRAPHIC (Align with experts & trial sandboxes) ─────────── */}
                {activeStep === 3 && (
                  <div className="w-full max-w-lg space-y-4 text-left">
                    <div className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-4 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                      }`}>
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" alt="Mentor" className="w-11 h-11 rounded-full object-cover shrink-0 border border-emerald-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">Ananya Sharma</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30">
                            Lead UX Architect @ Razorpay
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                          "Hands-on trial tasks in the Stride sandbox gave our junior candidates 10x more confidence during technical interviews than plain resume claims!"
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
                        }`}>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Career Hubs</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">128 Active Mentors</span>
                      </div>
                      <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
                        }`}>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Sandbox Tasks</span>
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">50+ Micro-Simulations</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Stride Stage Modal ─────────────────────────── */
function StrideStageModal({ stageId, onClose, isDark }) {
  const { token, setIsLoginOpen } = useAuth();
  const [activeStageId, setActiveStageId] = useState(stageId);
  const [demoCompleted, setDemoCompleted] = useState(false);

  const stage = useMemo(() => {
    setDemoCompleted(false);
    return STAGES_DATA[activeStageId] || STAGES_DATA.discover;
  }, [activeStageId]);

  const handleAction = () => {
    if (activeStageId === "discover") {
      setActiveStageId("explore");
    } else if (activeStageId === "explore") {
      setActiveStageId("experience");
    } else if (activeStageId === "experience") {
      setActiveStageId("align");
    } else if (activeStageId === "align") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 dark:bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative w-full max-w-5xl rounded-3xl border shadow-2xl p-5 sm:p-8 md:p-10 flex flex-col gap-4 sm:gap-6 transition-colors duration-300 ${
          isDark 
            ? "bg-[#181d2a] border-slate-800 text-slate-100" 
            : "bg-white border-slate-200 text-slate-850"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 text-slate-400 transition p-2 rounded-xl ${
            isDark ? "hover:text-slate-200 hover:bg-slate-800" : "hover:text-slate-650 hover:bg-slate-100"
          }`}
        >
          <X size={20} />
        </button>

        {/* Stepper Navigation inside Modal */}
        <div className={`flex flex-wrap items-center justify-center gap-2 pb-6 border-b pr-8 sm:pr-0 transition-colors ${
          isDark ? "border-slate-850" : "border-slate-200"
        }`}>
          {[
            { id: "discover", title: "Stage 01: Discover", icon: Sparkles, gradient: "from-amber-400 to-orange-500" },
            { id: "explore", title: "Stage 02: Explore", icon: TrendingUp, gradient: "from-blue-400 to-indigo-500" },
            { id: "experience", title: "Stage 03: Experience", icon: Terminal, gradient: "from-violet-400 to-purple-500" },
            { id: "align", title: "Stage 04: Align", icon: Users, gradient: "from-emerald-400 to-teal-500" }
          ].map((item) => {
            const isCurrent = item.id === stage.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveStageId(item.id)}
                className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all shadow-sm ${
                  isCurrent
                    ? `bg-gradient-to-br ${item.gradient} text-white border-transparent`
                    : isDark
                    ? "bg-[#11151f] border-slate-800/80 text-slate-400 hover:bg-slate-800/50"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={12} className={isCurrent ? "text-white" : "text-slate-400"} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Guest Warning Banner inside Modal */}
        {!token && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
            isDark 
              ? "bg-amber-500/10 border-amber-500/20 text-amber-305" 
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}>
            <div className="flex items-center gap-3 text-left">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
              }`}>
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Browsing as a Guest</p>
                <p className="text-xs opacity-90">Create a free account to unlock official tests, get custom job matches, and join hubs.</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setIsLoginOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 active:scale-95"
            >
              Sign Up Free
            </button>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center pt-2">
          {/* Left Column: Info Card */}
          <div className="md:col-span-7 space-y-4 sm:space-y-5 text-left animate-fade-in">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-black text-white bg-gradient-to-br ${stage.gradient} ${stage.shadow}`}>
                Stage {stage.num}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <Clock size={12} />
                <span>{stage.time}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className={`text-2xl sm:text-3xl font-black font-serif tracking-tight leading-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                {stage.title}
              </h3>
              <p className={`text-sm sm:text-base font-bold ${
                isDark ? "text-amber-450" : "text-[#7B4A28]"
              }`}>
                {stage.subtitle}
              </p>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              {stage.desc}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">What to expect:</h4>
              <ul className="space-y-2.5">
                {stage.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs font-semibold">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className={isDark ? "text-slate-350" : "text-slate-650"}>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={handleAction}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-br ${stage.gradient} ${stage.shadow} hover:opacity-90 active:scale-95 transition-all shadow-md`}
              >
                <span>{activeStageId === "align" ? "Finish Tour" : "Understand"}</span>
                <ArrowRight size={13} className="shrink-0" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="md:col-span-5 flex justify-center w-full mt-4 md:mt-0">
            {demoCompleted && !token ? (
              <div className={`rounded-2xl border p-6 shadow-xl max-w-full sm:max-w-sm w-full text-center space-y-4 animate-scale-in transition-colors ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-850"
              }`}>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold">Demo Mission Completed!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You have completed the interactive preview of {stage.title}. Create a free account to access all features, get full diagnostics, and record progress.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    setIsLoginOpen(true);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-br ${stage.gradient} ${stage.shadow} hover:opacity-90 transition active:scale-95`}
                >
                  Create Free Account
                </button>
              </div>
            ) : (
              <>
                {stage.id === "discover" && (
                  <InteractiveQuiz onComplete={() => setDemoCompleted(true)} isDark={isDark} />
                )}

                {stage.id === "explore" && (
                  <InteractiveExplore isDark={isDark} />
                )}

                {stage.id === "experience" && (
                  <InteractiveExperience onComplete={() => setDemoCompleted(true)} isDark={isDark} />
                )}

                {stage.id === "align" && (
                  <InteractiveAlign onComplete={() => setDemoCompleted(true)} isDark={isDark} />
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── Sub-Interactive Components ─────────────────────────── */

function InteractiveQuiz({ onComplete, isDark }) {
  const [qIdx, setQIdx] = useState(0);
  const questions = [
    {
      text: "When solving a complex technical issue, I naturally prefer to...",
      options: [
        "Write code or map out step-by-step logical operations",
        "Draft visual wireframes or style UI elements",
        "Organize team schedules and assign priorities"
      ]
    },
    {
      text: "Which workspace makes you feel most energized and productive?",
      options: [
        "A focused, quiet setup building database infrastructure",
        "A creative whiteboard session designing layout styling",
        "A client-facing standup coordinating deliverables"
      ]
    },
    {
      text: "If you had a weekend to build a passion project, you would create...",
      options: [
        "An automated web-scraping script or helper tool",
        "A polished, interactive landing page interface",
        "A collaborative project dashboard template"
      ]
    }
  ];

  const handleSelect = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className={`p-6 shadow-xl w-full max-w-full sm:max-w-sm space-y-4 text-left rounded-2xl border transition-colors duration-300 ${
      isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
    }`}>
      <div className={`flex items-center justify-between border-b pb-3 transition-colors ${
        isDark ? "border-slate-800" : "border-slate-150"
      }`}>
        <span className={`text-[10px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Demo Question {qIdx + 1} of 3
        </span>
        <span className={`h-1.5 w-16 rounded-full relative overflow-hidden ${
          isDark ? "bg-slate-800" : "bg-slate-100"
        }`}>
          <span className="absolute left-0 top-0 bottom-0 bg-amber-500 transition-all duration-300" style={{ width: `${((qIdx + 1) / 3) * 100}%` }} />
        </span>
      </div>
      <p className="text-sm font-bold">
        "{questions[qIdx].text}"
      </p>
      <div className="space-y-2">
        {questions[qIdx].options.map((ans, i) => (
          <button
            key={i}
            onClick={handleSelect}
            className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
              isDark
                ? "border-slate-800 text-slate-300 hover:bg-amber-955/20 hover:border-amber-500/50"
                : "border-slate-150 text-slate-650 hover:bg-amber-50/50 hover:border-amber-400"
            }`}
          >
            {ans}
          </button>
        ))}
      </div>
    </div>
  );
}

function InteractiveExplore({ isDark }) {
  const [selected, setSelected] = useState("software");
  const careersInfo = {
    software: {
      name: "Software Engineer",
      entry: "₹6 LPA",
      peak: "₹35 LPA",
      entryVal: 20,
      peakVal: 80,
      ai: "Moderate (32%)",
      stability: "Very High (9.2)",
      color: "bg-blue-500"
    },
    design: {
      name: "UX Designer",
      entry: "₹5 LPA",
      peak: "₹28 LPA",
      entryVal: 15,
      peakVal: 65,
      ai: "Low (18%)",
      stability: "High (8.4)",
      color: "bg-indigo-500"
    },
    product: {
      name: "Product Manager",
      entry: "₹8 LPA",
      peak: "₹42 LPA",
      entryVal: 30,
      peakVal: 95,
      ai: "Very Low (10%)",
      stability: "High (8.6)",
      color: "bg-emerald-500"
    }
  };

  const info = careersInfo[selected];

  return (
    <div className={`p-6 shadow-xl w-full max-w-full sm:max-w-sm space-y-4 text-left rounded-2xl border transition-colors duration-300 ${
      isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
    }`}>
      <div className={`flex gap-1.5 border-b pb-3 overflow-x-auto transition-colors ${
        isDark ? "border-slate-800" : "border-slate-150"
      }`}>
        {Object.keys(careersInfo).map((k) => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
              selected === k
                ? "bg-blue-600 text-white shadow-sm"
                : isDark
                ? "bg-slate-800 text-slate-400 hover:bg-slate-750"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {careersInfo[k].name.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <TrendingUp size={16} />
        </div>
        <div>
          <h4 className="text-sm font-bold">{info.name}</h4>
          <p className="text-[10px] text-slate-400">Salary Band (LPA)</p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <div className="space-y-1">
          <div className={`flex justify-between text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-550"}`}>
            <span>Entry Level</span>
            <span>{info.entry}</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <div className={`h-full ${info.color} rounded-full`} style={{ width: `${info.entryVal}%` }} />
          </div>
        </div>
        <div className="space-y-1">
          <div className={`flex justify-between text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-550"}`}>
            <span>Peak Pay (10+ Yrs)</span>
            <span>{info.peak}</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <div className={`h-full ${info.color} rounded-full`} style={{ width: `${info.peakVal}%` }} />
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-3 pt-2 border-t transition-colors ${
        isDark ? "border-slate-800" : "border-slate-150"
      }`}>
        <div className={`p-2.5 rounded-xl border text-center transition-colors ${
          isDark ? "bg-slate-850 border-slate-800/80" : "bg-slate-50 border-slate-150"
        }`}>
          <p className="text-[9px] font-bold text-slate-400">AI automation</p>
          <p className="text-xs font-black text-amber-600 dark:text-amber-400">{info.ai}</p>
        </div>
        <div className={`p-2.5 rounded-xl border text-center transition-colors ${
          isDark ? "bg-slate-850 border-slate-800/80" : "bg-slate-50 border-slate-150"
        }`}>
          <p className="text-[9px] font-bold text-slate-400">Stability</p>
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{info.stability}</p>
        </div>
      </div>
    </div>
  );
}

function InteractiveExperience({ onComplete, isDark }) {
  const [status, setStatus] = useState("idle");

  const handleRun = () => {
    setStatus("running");
    setTimeout(() => {
      setStatus("success");
      onComplete();
    }, 1500);
  };

  return (
    <div className={`p-5 shadow-xl w-full max-w-full sm:max-w-sm space-y-3.5 text-left font-mono rounded-2xl border transition-colors duration-300 ${
      isDark
        ? "bg-[#1e1e24] border-slate-800 text-slate-300"
        : "bg-slate-50 border-slate-200 text-slate-800"
    }`}>
      <div className={`flex items-center justify-between border-b pb-2 transition-colors ${
        isDark ? "border-slate-800" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <span className="text-[9px] font-bold text-slate-405 uppercase">app.py</span>
      </div>
      <div className={`text-[10px] space-y-1 font-mono transition-colors duration-300 ${
        isDark ? "text-slate-300" : "text-slate-700"
      }`}>
        <p>
          <span className={isDark ? "text-[#f92672]" : "text-[#d73a49] font-bold"}>def</span>{" "}
          <span className={isDark ? "text-[#a6e22e]" : "text-[#6f42c1]"}>calculate_bonus</span>(salary):
        </p>
        <p className="pl-4 text-slate-500 italic"># TODO: Fix return value logic</p>
        <p className="pl-4">
          <span className={isDark ? "text-[#f92672]" : "text-[#d73a49] font-bold"}>if</span> salary &gt;{" "}
          <span className={isDark ? "text-[#ae81ff]" : "text-[#005cc5]"}>100000</span>:
        </p>
        <p className="pl-8">
          <span className={isDark ? "text-[#f92672]" : "text-[#d73a49] font-bold"}>return</span> salary *{" "}
          <span className="text-emerald-500 font-bold">0.15</span>{" "}
          <span className="text-slate-500 italic"># fixed from 0.05</span>
        </p>
        <p className="pl-4">
          <span className={isDark ? "text-[#f92672]" : "text-[#d73a49] font-bold"}>return</span> salary *{" "}
          <span className={isDark ? "text-[#ae81ff]" : "text-[#005cc5]"}>0.08</span>
        </p>
      </div>
      <div className={`flex justify-between items-center pt-2 border-t text-[10px] transition-colors ${
        isDark ? "border-slate-800" : "border-slate-200"
      }`}>
        {status === "idle" && <span className="text-slate-500">Ready to test</span>}
        {status === "running" && (
          <span className="text-amber-500 flex items-center gap-1.5 animate-pulse">
            <Loader2 size={11} className="animate-spin" />
            Testing...
          </span>
        )}
        {status === "success" && <span className="text-emerald-500 font-bold">✓ All 3 Tests Passed!</span>}
        
        <button
          onClick={handleRun}
          disabled={status === "running" || status === "success"}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase font-sans transition disabled:opacity-50"
        >
          {status === "success" ? "Completed" : "Run Tests"}
        </button>
      </div>
    </div>
  );
}

function InteractiveAlign({ onComplete, isDark }) {
  const [chat, setChat] = useState([
    { sender: "Rahul S. (Architect)", time: "10:42 AM", text: "Welcome to the Software Engineering Hub! Ask any questions you have about daily work life." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleAsk = (question, answer) => {
    setChat(prev => [...prev, { sender: "You (Guest)", time: "Just now", text: question, isUser: true }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChat(prev => [...prev, { sender: "Rahul S. (Architect)", time: "Just now", text: answer }]);
      onComplete();
    }, 1500);
  };

  return (
    <div className={`p-5 shadow-xl w-full max-w-full sm:max-w-sm space-y-3.5 text-left rounded-2xl border transition-colors duration-300 ${
      isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
    }`}>
      <div className={`flex items-center justify-between border-b pb-2 transition-colors ${
        isDark ? "border-slate-800" : "border-slate-150"
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#10B981]">●</span>
          <span className="text-xs font-bold">#software-eng-hub</span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
          isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
        }`}>
          42 Active
        </span>
      </div>
      <div className="space-y-3 text-[10px] leading-relaxed max-h-48 overflow-y-auto pr-1">
        {chat.map((msg, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex justify-between text-slate-400">
              <span className={`font-bold ${msg.isUser ? "text-blue-500" : isDark ? "text-slate-300" : "text-slate-700"}`}>{msg.sender}</span>
              <span>{msg.time}</span>
            </div>
            <p className={`p-2 rounded-xl transition-colors ${
              msg.isUser
                ? isDark
                  ? "bg-blue-950/30 text-blue-200 border border-blue-900/30"
                  : "bg-blue-50 text-blue-800 border border-blue-100"
                : isDark
                ? "bg-slate-850 text-slate-350"
                : "bg-slate-50 text-slate-600"
            }`}>
              {msg.text}
            </p>
          </div>
        ))}
        {isTyping && (
          <p className="text-slate-400 italic text-[9px] flex items-center gap-1.5 pl-1">
            <Loader2 size={10} className="animate-spin" />
            Rahul is typing...
          </p>
        )}
      </div>
      <div className={`pt-2 border-t space-y-1.5 transition-colors ${
        isDark ? "border-slate-800" : "border-slate-150"
      }`}>
        <p className={`text-[9px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Ask a demo question:
        </p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleAsk("What is the daily work-life balance like?", "Honestly, it depends on project deadlines, but on average it's very manageable! We work 9-5 and rarely work weekends.")}
            disabled={isTyping || chat.length > 2}
            className={`text-[9.5px] text-left px-2 py-1.5 rounded-lg border transition disabled:opacity-50 truncate ${
              isDark
                ? "border-slate-800 text-slate-400 hover:bg-emerald-950/20 hover:text-emerald-400"
                : "border-slate-150 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            "What is the daily work-life balance like?"
          </button>
          <button
            onClick={() => handleAsk("Which skills are most critical at entry level?", "Mastering basic debugging, version control (Git), and being eager to learn are far more important than knowing 10 frameworks.")}
            disabled={isTyping || chat.length > 2}
            className="text-[9.5px] text-left px-2 py-1.5 rounded-lg border border-slate-150 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-655 hover:text-emerald-700 transition disabled:opacity-50 truncate"
          >
            "Which skills are most critical at entry level?"
          </button>
        </div>
      </div>
    </div>
  );
}
