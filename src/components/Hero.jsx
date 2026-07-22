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
  return (
    <div className={`relative px-6 py-12 md:py-20 ${isDark ? "bg-[#161513] text-slate-100" : "bg-[#FAF6EC] text-[#0b1a36]"}`}>
      <div className="mx-auto max-w-6xl">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-12">
          {/* Two-column Header Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Pill & Heading */}
            <motion.div variants={fadeUp} className="flex flex-col items-start text-left">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${
                isDark ? "border-amber-500/25 bg-amber-500/10 text-amber-300" : "border-slate-800 bg-transparent text-slate-800"
              }`}>
                CAREER ADVENTURE
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold leading-[1.1] tracking-tight text-slate-900">
                Find the perfect<br />career. Stop guessing<br />your future.
              </h1>
            </motion.div>

            {/* Right Column: Blurb & Gold Button */}
            <motion.div variants={fadeUp} className="flex flex-col items-start md:pt-14 text-left">
              <p className={`text-base sm:text-lg leading-relaxed max-w-md ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Not sure what career is right for you? Take our fun Discovery Test, explore job salaries and paths, try simple trial missions, and chat with real experts—all in one place.
              </p>
              <button
                type="button"
                onClick={onStartDiscovery}
                className="mt-6 rounded-md bg-[#F3E3B6] hover:bg-[#ebd08b] text-slate-900 font-bold px-6 py-3.5 text-sm shadow-sm transition-colors duration-200"
              >
                Get started today
              </button>
            </motion.div>
          </div>

          {/* Centered Career Discovery Graphic */}
          <motion.div variants={fadeUp} className="relative rounded-2xl overflow-hidden shadow-xl">
            <img
              src="/career_discovery.png"
              alt="Personalized Career Pathway"
              className="w-full object-cover max-h-[520px]"
            />
          </motion.div>

          {/* Gold Bottom Validation Banner */}
          <motion.div
            variants={fadeUp}
            className={`rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              isDark ? "bg-[#25221b] text-amber-100" : "bg-[#F9E9BE] text-[#0b1a36]"
            }`}
          >
            {/* Left Content */}
            <div className="flex flex-col items-start gap-4 text-left max-w-xl">
              <p className="text-sm sm:text-base font-medium leading-relaxed">
                TryYourCareers helps you find what you love. We offer interactive trial games, expert advice, and clear guides to take the stress out of planning your future.
              </p>
              <button
                type="button"
                onClick={onExploreCareers}
                className={`rounded-md px-5 py-2.5 text-xs font-bold transition-colors ${
                  isDark ? "bg-amber-400 hover:bg-amber-500 text-slate-900" : "bg-[#0b1a36] hover:bg-[#122b59] text-white"
                }`}
              >
                Learn more
              </button>
            </div>

            {/* Right Content: Social Proof */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex -space-x-2.5">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#F9E9BE]"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
                  alt="Student 1"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#F9E9BE]"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                  alt="Student 2"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-[#F9E9BE]"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                  alt="Student 3"
                />
              </div>
              <span className="text-xs font-bold tracking-tight">+{careersCount ? (careersCount * 60).toLocaleString() : "12,400"} Members</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll down indicator */}
        <motion.button
          onClick={onScrollDown}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className={`mt-12 flex flex-col items-center gap-1.5 mx-auto text-[10px] font-bold tracking-widest uppercase ${isDark ? "text-slate-600 hover:text-slate-400" : "text-[#99adc7] hover:text-[#4f6283]"} transition`}
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
