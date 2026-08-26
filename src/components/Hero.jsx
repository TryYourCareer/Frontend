import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, TrendingUp, Terminal, Users,
  ArrowRight, ArrowLeft, ChevronDown, Brain,
  Target, Globe, Lock, Star, CheckCircle2, Clock, X, Loader2
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

export default function Hero({ onStartDiscovery, onExploreCareers, careersCount = 0, isDark = false }) {
  const navigate = useNavigate();
  const { token, setIsLoginOpen } = useAuth();
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

      {/* ── Journey Section ────────────────────────────────────────────────────── */}
      <div id="journey-section" className={`py-20 px-6 ${isDark ? "bg-slate-950" : "bg-[#FAF6EC]"} scroll-mt-6 text-left`}>
        <div className="mx-auto max-w-6xl">
          {/* Header row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">
            <div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${
                isDark ? "border-amber-500/25 bg-amber-500/10 text-amber-300" : "border-slate-800 bg-transparent text-slate-800"
              }`}>
                THE STRIDE JOURNEY
              </span>
              <h2 className="mt-4 text-4xl sm:text-5xl font-serif font-semibold tracking-tight text-slate-900 leading-tight">
                Your journey to lasting success with TryYourCareers
              </h2>
            </div>
            <div className="md:pt-12">
              <p className={`text-base sm:text-lg leading-relaxed max-w-md ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                TryYourCareers guides your personalized journey, ensuring interactive skill test-drives and clear career validation.
              </p>
            </div>
          </div>

          {/* Connected Stride Roadway */}
          <div className="relative">
            {/* Horizontal roadway line for desktop */}
            <div className="absolute top-[28px] left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-amber-400 via-blue-400 via-violet-400 to-emerald-400 hidden lg:block z-0 opacity-35" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  id: "discover",
                  stage: "Stage 01",
                  phase: "Discover",
                  title: "Fun Discovery Test",
                  subtitle: "Find Your Fit",
                  desc: "Answer simple questions and let our AI match you with the best jobs.",
                  icon: Sparkles,
                  gradient: "from-amber-400 to-orange-500",
                  shadow: "shadow-amber-500/20",
                  badgeBg: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
                  badgeBorder: "border-amber-100 dark:border-amber-900/30"
                },
                {
                  id: "explore",
                  stage: "Stage 02",
                  phase: "Explore",
                  title: "Explore Job Realities",
                  subtitle: "Salaries & Trends",
                  desc: "See salaries, future growth, skill paths, and job stats before deciding.",
                  icon: TrendingUp,
                  gradient: "from-blue-400 to-indigo-500",
                  shadow: "shadow-blue-500/20",
                  badgeBg: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
                  badgeBorder: "border-blue-100 dark:border-blue-900/30"
                },
                {
                  id: "experience",
                  stage: "Stage 03",
                  phase: "Experience",
                  title: "Practice Trial Tasks",
                  subtitle: "Play the Role",
                  desc: "Try real day-to-day tasks (like basic coding or design) to see if you enjoy it.",
                  icon: Terminal,
                  gradient: "from-violet-400 to-purple-500",
                  shadow: "shadow-violet-500/20",
                  badgeBg: "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400",
                  badgeBorder: "border-violet-100 dark:border-violet-900/30"
                },
                {
                  id: "align",
                  stage: "Stage 04",
                  phase: "Align",
                  title: "Connect with Experts",
                  subtitle: "Career Hubs",
                  desc: "Join hubs to chat with real experts in that field and ask them questions.",
                  icon: Users,
                  gradient: "from-emerald-400 to-teal-500",
                  shadow: "shadow-emerald-500/20",
                  badgeBg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
                  badgeBorder: "border-emerald-100 dark:border-emerald-900/30"
                }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleStageClick(step.id)}
                    className="group relative flex flex-col items-center lg:items-start text-center lg:text-left z-10 cursor-pointer"
                  >
                    {/* Step Icon container */}
                    <div className="mb-5 relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.gradient} text-white shadow-lg ${step.shadow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon size={22} />
                      </div>
                      {/* Badge */}
                      <div className={`absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-md border text-[9px] font-black tracking-wider shadow-sm transition-colors ${
                        isDark 
                          ? "bg-slate-900 border-slate-800 text-slate-400" 
                          : "bg-white border-slate-200 text-slate-500"
                      }`}>
                        {step.stage}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className={`w-full rounded-2xl border p-6 flex-1 flex flex-col justify-between transition-all duration-350 group-hover:-translate-y-1.5 group-hover:shadow-lg ${
                      isDark 
                        ? "bg-[#181d2a] border-slate-800 text-slate-100 group-hover:border-slate-700" 
                        : "bg-[#FAF2DB]/30 border-slate-300/60 text-[#0b1a36] group-hover:border-[#ebd08b]"
                    }`}>
                      <div>
                        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${step.badgeBg} ${step.badgeBorder}`}>
                          {step.phase}
                        </span>
                        <h3 className="mt-4 text-xl font-bold font-serif leading-tight">{step.title}</h3>
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-950/5 dark:border-white/5">
                        <span className="text-2xl font-black block text-[#7B4A28] dark:text-amber-400">{step.subtitle}</span>
                        <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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

          {/* Testimonial Section inside Stride Journey */}
          <TestimonialSlider isDark={isDark} />
        </div>
      </div>

      {/* ── Ecosystem cards section ───────────────────────────────────────────── */}
      <EcosystemSection isDark={isDark} />
    </section>
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

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  return (
    <div className={`relative px-6 py-16 md:py-24 transition-colors duration-300 ${isDark
        ? "bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0b0f19] text-slate-100"
        : "bg-[#EBF2FC] text-[#0b1a36]"
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
                  : "border-blue-100 bg-[#E5EFFF] text-[#2b59c3]"
                }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#2B59C3] animate-pulse"></span>
              THE FUTURE OF CAREER DISCOVERY
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${isDark ? "text-white" : "text-[#0b1a36]"
                }`}
            >
              Stop guessing <br className="hidden sm:inline" />
              your future. <br />
              <span className="text-blue-600 dark:text-blue-400">Experience it.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className={`text-base sm:text-lg leading-relaxed max-w-xl ${isDark ? "text-slate-400" : "text-slate-600"
                }`}
            >
              Eliminate career confusion caused by pressure and trends. Discover your true path through structured assessment, real-world trials, and evidence-based guidance.
            </motion.p>

            {/* Button Row */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2"
            >
              <button
                type="button"
                onClick={onStartDiscovery}
                className="group inline-flex items-center justify-center gap-2 bg-[#2B59C3] hover:bg-blue-700 active:scale-95 text-white font-bold rounded-full px-8 py-4 shadow-lg shadow-blue-500/25 transition-all duration-200 text-sm sm:text-base cursor-pointer"
              >
                <span>Start Your Career Discovery</span>
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onExploreCareers}
                className={`inline-flex items-center justify-center gap-2 border font-bold rounded-full px-8 py-4 transition-all duration-200 text-sm sm:text-base active:scale-95 cursor-pointer ${isDark
                    ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200"
                    : "border-slate-200/80 bg-white/60 hover:bg-slate-50 text-[#0b1a36]"
                  }`}
              >
                <span>🎯 Explore Careers</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column: Beautiful Browser Mockup */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-5 w-full flex justify-center"
          >
            <div className={`w-full max-w-md rounded-[2rem] shadow-2xl p-6 relative overflow-hidden transition-all duration-300 border ${isDark ? "bg-[#111827]/90 border-slate-800" : "bg-white/95 border-slate-100/80"
              }`}>
              {/* Browser Title Bar / Top Bar */}
              <div className={`flex items-center gap-2 pb-4 mb-5 border-b ${isDark ? "border-slate-800/80" : "border-slate-100"}`}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className={`h-6 w-3/5 rounded-full mx-auto ${isDark ? "bg-slate-800/60" : "bg-slate-100"}`} />
              </div>

              {/* Steps List */}
              <div className="flex flex-col gap-4">
                {/* Step 1 */}
                <motion.div
                  variants={itemVariants}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isDark
                      ? "bg-slate-950/60 border-slate-800/60 hover:border-slate-700/60"
                      : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-lg shrink-0">
                    1
                  </div>
                  <div className="text-left">
                    <h4 className={`font-bold text-base leading-snug ${isDark ? "text-slate-200" : "text-[#0B1A36]"}`}>
                      Direction Assessment
                    </h4>
                    <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Psychometric & interest routing
                    </p>
                  </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div 
                  variants={itemVariants}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isDark
                      ? "bg-slate-950/60 border-slate-800/60 hover:border-slate-700/60"
                      : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold text-lg shrink-0">
                    2
                  </div>
                  <div className="text-left">
                    <h4 className={`font-bold text-base leading-snug ${isDark ? "text-slate-200" : "text-[#0B1A36]"}`}>
                      Reality-Based Intel
                    </h4>
                    <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Data-driven authentic reality
                    </p>
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  variants={itemVariants}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isDark
                      ? "bg-slate-950/60 border-slate-800/60 hover:border-slate-700/60"
                      : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-lg shrink-0">
                    3
                  </div>
                  <div className="text-left">
                    <h4 className={`font-bold text-base leading-snug ${isDark ? "text-slate-200" : "text-[#0B1A36]"}`}>
                      Career Trial Missions
                    </h4>
                    <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Experiential micro-internships
                    </p>
                  </div>
                </motion.div>

                {/* Step 4 */}
                <motion.div
                  variants={itemVariants}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isDark
                      ? "bg-slate-950/60 border-slate-800/60 hover:border-slate-700/60"
                      : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold text-lg shrink-0">
                    4
                  </div>
                  <div className="text-left">
                    <h4 className={`font-bold text-base leading-snug ${isDark ? "text-slate-200" : "text-[#0B1A36]"}`}>
                      Dual-Confidence Reports
                    </h4>
                    <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Actionable analytics for all
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
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

/* ─────────────────────────── Ecosystem Section ──────────────────────────── */
function EcosystemSection({ isDark }) {
  const cards = [
    {
      icon: Brain,
      title: "For Students",
      desc: "Stop guessing. Test-drive different careers through interactive simulations and discover what you excel at before choosing your college path.",
      features: [
        "Interactive simulator test-drives",
        "Cognitive fit & strength matching",
        "Real-world day-in-the-life tasks"
      ],
      gradient: "from-violet-500 to-indigo-600",
      shadow: "shadow-violet-500/20",
      bulletColor: "bg-violet-500 dark:bg-violet-400"
    },
    {
      icon: Users,
      title: "For Parents",
      desc: "Gain absolute peace of mind. Review objective, data-backed reports that clarify exactly why a career path suits your child's natural abilities.",
      features: [
        "In-depth career confidence reports",
        "Objective interest & aptitude alignment",
        "Data-backed college investment validation"
      ],
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-orange-500/20",
      bulletColor: "bg-orange-500 dark:bg-orange-400"
    },
    {
      icon: TrendingUp,
      title: "For Schools",
      desc: "Empower your guidance counselors. Deploy automated pathway mapping tools and track student achievements with easy-to-use cohort dashboard metrics.",
      features: [
        "Automated personalized roadmaps",
        "Counselor cohort success analytics",
        "Curriculum & skill milestone tracking"
      ],
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      bulletColor: "bg-emerald-500 dark:bg-emerald-400"
    }
  ];

  return (
    <div className={`py-20 px-6 ${isDark ? "bg-slate-950" : "bg-[#FAF6EC]"} text-left`}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">
          <div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${
              isDark ? "border-amber-500/25 bg-amber-500/10 text-amber-300" : "border-slate-800 bg-transparent text-slate-800"
            }`}>
              THE EDUCATION ECOSYSTEM
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-serif font-semibold tracking-tight text-slate-900 leading-tight">
              Designed for the entire ecosystem
            </h2>
          </div>
          <div className="md:pt-12">
            <p className={`text-base sm:text-lg leading-relaxed max-w-md ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Aligning students, parents, and educators with evidence-based career discovery.
            </p>
          </div>
        </div>

        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } } }}
                whileHover={{ y: -6, scale: 1.015 }}
                className={`group rounded-2xl p-6 flex flex-col justify-between transition-all duration-350 border ${
                  isDark 
                    ? "bg-[#181d2a] border-slate-800/80 text-slate-100 hover:border-slate-700 hover:shadow-xl hover:shadow-violet-500/5" 
                    : "bg-[#FAF2DB]/30 border-[#e2d9c8] text-[#0b1a36] hover:border-[#ebd08b] hover:shadow-xl"
                }`}
              >
                <div>
                  {/* Icon Block */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${card.gradient} text-white shadow-md ${card.shadow} transition-transform duration-300 group-hover:scale-105`}>
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold font-serif leading-tight">{card.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                    {card.desc}
                  </p>

                  {/* Bullet features list */}
                  <ul className="mt-6 space-y-2.5">
                    {card.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-center gap-2.5 text-xs font-semibold">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${card.bulletColor}`} />
                        <span className={isDark ? "text-slate-350" : "text-slate-700"}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
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
    quote: "TryYourCareers truly changed my life. I'd tried everything, but this program gave me the simulator test-drives and personalized guidance I needed. I found my fit in Software Engineering and finally feel truly energized, confident, and in control of my future. It's more than just a test; it's a complete career milestone.",
    bgColor: "bg-[#F3E3B6]"
  },
  {
    name: "Elena M.",
    role: "Data Analyst Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    quote: "The interactive trial sandboxes let me feel what it's actually like to analyze models and write Python code. I'm now studying Data Science with 100% confidence instead of guessing.",
    bgColor: "bg-[#F9E9BE]"
  },
  {
    name: "Marcus K.",
    role: "DevOps Engineer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    quote: "Having the confidence reports backed by actual runtime simulator testing made it so easy to get validation from my parents and counselors. Highly recommend the simulator!",
    bgColor: "bg-[#FAF2DB]"
  }
];

function TestimonialSlider({ isDark }) {
  const [curr, setCurr] = useState(0);
  const active = TESTIMONIALS[curr];
  const next = TESTIMONIALS[(curr + 1) % TESTIMONIALS.length];

  const handlePrev = () => {
    setCurr(prev => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurr(prev => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mt-20 border-t border-slate-900/10 pt-16 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Callout */}
        <div className="lg:col-span-4 flex flex-col items-start gap-4">
          <div>
            <span className="text-xs font-semibold opacity-60">Trusted by</span>
            <p className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">+12,400 Students</p>
          </div>
          <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden shadow-md">
            <img src={active.image} alt={active.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Right Column: Quote & Slider Controls */}
        <div className="lg:col-span-8 flex flex-col justify-between min-h-[280px]">
          <div>
            <div className="flex justify-between items-center w-full">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${
                isDark ? "border-amber-500/25 bg-amber-500/10 text-amber-300" : "border-slate-800 bg-transparent text-slate-800"
              }`}>
                TESTIMONIAL
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-slate-900 transition"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-slate-900 transition"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <h2 className="mt-6 text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-slate-900">
              Real lives changed
            </h2>

            <p className={`mt-6 text-base sm:text-lg leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              "{active.quote}"
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-900/10 pt-4">
            <div>
              <p className="text-sm font-bold text-slate-900">{active.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{active.role}</p>
            </div>

            {/* Next preview card */}
            <div className="hidden sm:flex items-center gap-3 bg-white/40 rounded-xl p-2 border border-slate-900/5 shadow-sm max-w-[200px]">
              <img src={next.image} alt={next.name} className="w-10 h-10 rounded-lg object-cover" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-900 truncate max-w-[120px]">{next.name}</p>
                <p className="text-[8px] text-slate-500 truncate max-w-[120px]">{next.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Stride Stage Modal ─────────────────────────── */
function StrideStageModal({ stageId, onClose, isDark }) {
  const navigate = useNavigate();
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
