import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, TrendingUp, Terminal, Users,
  ArrowRight, ArrowLeft, ChevronDown, Brain,
  Target, Globe, Lock, Star
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
export default function Hero({ onStartDiscovery, onExploreCareers, careersCount = 0, isDark = false }) {

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

          {/* Minimal Stride-style 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stage: "Stage 01", title: "Fun Discovery Test", phase: "(Discover)", value: "Find Your Fit", desc: "Answer simple questions and let our AI match you with the best jobs." },
              { stage: "Stage 02", title: "Explore Job Realities", phase: "(Explore)", value: "Salaries & Trends", desc: "See salaries, future growth, skill paths, and job stats before deciding." },
              { stage: "Stage 03", title: "Practice Trial Tasks", phase: "(Experience)", value: "Play the Role", desc: "Try real day-to-day tasks (like basic coding or design) to see if you enjoy it." },
              { stage: "Stage 04", title: "Connect with Experts", phase: "(Align)", value: "Career Hubs", desc: "Join hubs to chat with real experts in that field and ask them questions." }
            ].map((card, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 flex flex-col justify-between min-h-[220px] transition hover:shadow-md ${
                  isDark ? "bg-[#25221b] text-amber-100/90" : "bg-[#FAF2DB] text-[#0b1a36]"
                }`}
              >
                <div>
                  <span className="text-xs font-semibold opacity-60">{card.stage}</span>
                  <h3 className="mt-3 text-xl font-serif font-bold leading-tight">{card.title}</h3>
                  <span className="text-xs opacity-60 mt-1 block">{card.phase}</span>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-900/10">
                  <span className="text-3xl font-black block">{card.value}</span>
                  <span className="text-xs opacity-60 mt-0.5 block">{card.desc}</span>
                </div>
              </div>
            ))}
          </div>

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
    <div className={`relative px-6 py-16 md:py-24 transition-colors duration-300 ${
      isDark 
        ? "bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0b0f19] text-slate-100" 
        : "bg-[#FAF6EC] text-[#0b1a36]"
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
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase ${
                isDark 
                  ? "border-amber-500/25 bg-amber-500/10 text-amber-300" 
                  : "border-[#0b1a36]/10 bg-[#FAF2DB] text-[#0b1a36]"
              }`}
            >
              <span className={`h-2 w-2 rounded-full animate-pulse ${isDark ? "bg-amber-300" : "bg-[#0b1a36]"}`}></span>
              THE FUTURE OF CAREER DISCOVERY
            </motion.div>

            {/* Title */}
            <motion.h1 
              variants={fadeUp}
              className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${
                isDark ? "text-white" : "text-[#0b1a36]"
              }`}
            >
              Stop guessing <br className="hidden sm:inline" />
              your future. <br />
              <span className="text-amber-600 dark:text-amber-400">Experience it.</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={fadeUp}
              className={`text-base sm:text-lg leading-relaxed max-w-xl ${
                isDark ? "text-slate-400" : "text-slate-600"
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
                className="group inline-flex items-center justify-center gap-2 bg-[#F3E3B6] hover:bg-[#ebd08b] active:scale-95 text-[#0b1a36] font-bold rounded-full px-8 py-4 shadow-lg shadow-amber-500/5 transition-all duration-200 text-sm sm:text-base cursor-pointer"
              >
                <span>Start Your Career Discovery</span>
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onExploreCareers}
                className={`inline-flex items-center justify-center gap-2 border font-bold rounded-full px-8 py-4 transition-all duration-200 text-sm sm:text-base active:scale-95 cursor-pointer ${
                  isDark 
                    ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200" 
                    : "border-[#0b1a36]/10 bg-transparent text-[#0b1a36] hover:bg-[#0b1a36]/5"
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
            <div className={`w-full max-w-md rounded-[2rem] shadow-2xl p-6 relative overflow-hidden transition-all duration-300 border ${
              isDark ? "bg-[#111827]/90 border-slate-800" : "bg-white/95 border-slate-100/80"
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
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
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
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
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
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
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
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
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
      desc: "Stop guessing. Test-drive different careers through fun games and find out what you're actually good at before choosing a college major."
    },
    {
      icon: Users,
      title: "For Parents",
      desc: "Get peace of mind. See clear reports showing exactly why a career path fits your child based on their interests and trial game scores."
    },
    {
      icon: TrendingUp,
      title: "For Schools",
      desc: "Help every student. Give students a personalized roadmap and track their success with easy tools for counselors."
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } } }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`rounded-2xl p-6 flex flex-col justify-between min-h-[200px] transition hover:shadow-md ${
                  isDark ? "bg-[#25221b] text-amber-100/90" : "bg-[#FAF2DB] text-[#0b1a36]"
                }`}
              >
                <div>
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${
                    isDark ? "bg-amber-500/10 text-amber-300" : "bg-white text-slate-800"
                  } shadow-sm shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-5 text-xl font-serif font-bold leading-tight">{card.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {card.desc}
                  </p>
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
