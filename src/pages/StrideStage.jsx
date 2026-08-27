import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Sparkles, TrendingUp, Terminal, Users, 
  Clock, ArrowRight, CheckCircle2, Lock, Loader2 
} from "lucide-react";

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

export default function StrideStage() {
  const { stageId = "discover" } = useParams();
  const navigate = useNavigate();
  const { token, setIsLoginOpen } = useAuth();
  
  // Interactive mock states
  const [demoCompleted, setDemoCompleted] = useState(false);

  const stage = useMemo(() => {
    // Reset demo complete state when switching stages
    setDemoCompleted(false);
    return STAGES_DATA[stageId] || STAGES_DATA.discover;
  }, [stageId]);

  const handleAction = () => {
    const isPublicPath = stage.path === "/explore-careers" || stage.path === "/explore";
    if (token || isPublicPath) {
      navigate(stage.path);
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF6EC] dark:bg-slate-950 px-6 py-10 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        
        {/* Guest Warning Banner */}
        {!token && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">You are browsing as a Guest</p>
                <p className="text-xs opacity-85">Create a free account to take official tests, get personalized career matches, and access active hubs.</p>
              </div>
            </div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 active:scale-95"
            >
              Sign Up for Free
            </button>
          </div>
        )}

        {/* Stages Stepper Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
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
                onClick={() => navigate(`/stride-journey/${item.id}`)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  isCurrent
                    ? `bg-gradient-to-br ${item.gradient} text-white border-transparent`
                    : "bg-white dark:bg-[#181d2a] border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <Icon size={14} className={isCurrent ? "text-white" : "text-slate-400"} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4">
          {/* Left Column: Info Card */}
          <div className="md:col-span-7 space-y-6 text-left animate-fade-in">
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
              <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-slate-900 dark:text-white leading-tight">
                {stage.title}
              </h1>
              <p className="text-base sm:text-lg font-medium text-[#7B4A28] dark:text-amber-400">
                {stage.subtitle}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-400">
              {stage.desc}
            </p>

            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">What to expect:</h4>
              <ul className="space-y-3">
                {stage.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs font-semibold">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <button
                onClick={handleAction}
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-br ${stage.gradient} ${stage.shadow} hover:opacity-90 active:scale-95 transition-all shadow-md`}
              >
                <span>{demoCompleted && !token ? "Sign up to Unlock Full Access" : stage.cta}</span>
                {(!token && stage.path !== "/explore-careers") ? (
                  <Lock size={14} className="ml-1 shrink-0" />
                ) : (
                  <ArrowRight size={14} className="shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="md:col-span-5 flex justify-center">
            {demoCompleted && !token ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl max-w-sm w-full text-center space-y-4 animate-scale-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Demo Mission Completed!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You have completed the interactive preview of {stage.title}. Create a free account to access all features, get full diagnostics, and record progress.
                </p>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-br ${stage.gradient} ${stage.shadow} hover:opacity-90 transition active:scale-95`}
                >
                  Create Free Account
                </button>
              </div>
            ) : (
              <>
                {stage.id === "discover" && (
                  <InteractiveQuiz onComplete={() => setDemoCompleted(true)} />
                )}

                {stage.id === "explore" && (
                  <InteractiveExplore />
                )}

                {stage.id === "experience" && (
                  <InteractiveExperience onComplete={() => setDemoCompleted(true)} />
                )}

                {stage.id === "align" && (
                  <InteractiveAlign onComplete={() => setDemoCompleted(true)} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Sub-Interactive Components ─────────────────────────── */

function InteractiveQuiz({ onComplete }) {
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl max-w-sm w-full space-y-4 text-left animate-fade-in">
      <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Demo Question {qIdx + 1} of 3</span>
        <span className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 bg-amber-500 transition-all duration-300" style={{ width: `${((qIdx + 1) / 3) * 100}%` }} />
        </span>
      </div>
      <p className="text-sm font-bold text-slate-850 dark:text-slate-200">
        "{questions[qIdx].text}"
      </p>
      <div className="space-y-2">
        {questions[qIdx].options.map((ans, i) => (
          <button
            key={i}
            onClick={handleSelect}
            className="w-full text-left p-3 rounded-xl border border-slate-150 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-amber-50/50 hover:border-amber-300 dark:hover:bg-amber-950/20 transition-all"
          >
            {ans}
          </button>
        ))}
      </div>
    </div>
  );
}

function InteractiveExplore() {
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl max-w-sm w-full space-y-4 text-left animate-fade-in">
      <div className="flex gap-1.5 border-b pb-3 border-slate-100 dark:border-slate-800 overflow-x-auto">
        {Object.keys(careersInfo).map((k) => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
              selected === k
                ? "bg-blue-550 text-white"
                : "bg-slate-50 dark:bg-slate-850 text-slate-500 hover:bg-slate-100"
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
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{info.name}</h4>
          <p className="text-[10px] text-slate-400">Salary Band (LPA)</p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>Entry Level</span>
            <span>{info.entry}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full ${info.color} rounded-full`} style={{ width: `${info.entryVal}%` }} />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>Peak Pay (10+ Yrs)</span>
            <span>{info.peak}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full ${info.color} rounded-full`} style={{ width: `${info.peakVal}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-150/50 dark:border-slate-800 text-center">
          <p className="text-[9px] font-bold text-slate-400">AI automation</p>
          <p className="text-xs font-black text-amber-600 dark:text-amber-400">{info.ai}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-150/50 dark:border-slate-800 text-center">
          <p className="text-[9px] font-bold text-slate-400">Stability</p>
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">{info.stability}</p>
        </div>
      </div>
    </div>
  );
}

function InteractiveExperience({ onComplete }) {
  const [status, setStatus] = useState("idle");

  const handleRun = () => {
    setStatus("running");
    setTimeout(() => {
      setStatus("success");
      onComplete();
    }, 1500);
  };

  return (
    <div className="bg-[#1e1e24] rounded-2xl border border-slate-800 p-5 shadow-xl max-w-sm w-full space-y-3.5 text-left font-mono animate-fade-in">
      <div className="flex items-center justify-between border-b pb-2 border-slate-850">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <span className="text-[9px] font-bold text-slate-550 uppercase">app.py</span>
      </div>
      <div className="text-[10px] text-slate-300 space-y-1">
        <p><span className="text-[#f92672]">def</span> <span className="text-[#a6e22e]">calculate_bonus</span>(salary):</p>
        <p className="pl-4 text-slate-500"># TODO: Fix return value logic</p>
        <p className="pl-4"><span className="text-[#f92672]">if</span> salary &gt; <span className="text-[#ae81ff]">100000</span>:</p>
        <p className="pl-8"><span className="text-[#f92672]">return</span> salary * <span className="text-emerald-400 font-bold">0.15</span> <span className="text-slate-500"># fixed from 0.05</span></p>
        <p className="pl-4"><span className="text-[#f92672]">return</span> salary * <span className="text-[#ae81ff]">0.08</span></p>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px]">
        {status === "idle" && <span className="text-slate-500">Ready to test</span>}
        {status === "running" && (
          <span className="text-amber-400 flex items-center gap-1.5">
            <Loader2 size={11} className="animate-spin" />
            Testing...
          </span>
        )}
        {status === "success" && <span className="text-emerald-400 font-bold">✓ All 3 Tests Passed!</span>}
        
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

function InteractiveAlign({ onComplete }) {
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xl max-w-sm w-full space-y-3.5 text-left animate-fade-in">
      <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#10B981]">●</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">#software-eng-hub</span>
        </div>
        <span className="text-[9px] bg-slate-150 dark:bg-slate-850 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">42 Active</span>
      </div>
      <div className="space-y-3 text-[10px] leading-relaxed max-h-48 overflow-y-auto pr-1">
        {chat.map((msg, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex justify-between text-slate-400">
              <span className={`font-bold ${msg.isUser ? "text-blue-500" : "text-slate-700 dark:text-slate-300"}`}>{msg.sender}</span>
              <span>{msg.time}</span>
            </div>
            <p className={`p-2 rounded-xl ${msg.isUser ? "bg-blue-50 dark:bg-blue-950/20 text-slate-700 dark:text-slate-350 border border-blue-100 dark:border-blue-900/30" : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400"}`}>
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
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
        <p className="text-[9px] font-bold text-slate-400 uppercase">Ask a demo question:</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleAsk("What is the daily work-life balance like?", "Honestly, it depends on project deadlines, but on average it's very manageable! We work 9-5 and rarely work weekends.")}
            disabled={isTyping || chat.length > 2}
            className="text-[9.5px] text-left px-2 py-1.5 rounded-lg border border-slate-150 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-650 hover:text-emerald-700 transition disabled:opacity-50 truncate"
          >
            "What is the daily work-life balance like?"
          </button>
          <button
            onClick={() => handleAsk("Which skills are most critical at entry level?", "Mastering basic debugging, version control (Git), and being eager to learn are far more important than knowing 10 frameworks.")}
            disabled={isTyping || chat.length > 2}
            className="text-[9.5px] text-left px-2 py-1.5 rounded-lg border border-slate-150 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-650 hover:text-emerald-700 transition disabled:opacity-50 truncate"
          >
            "Which skills are most critical at entry level?"
          </button>
        </div>
      </div>
    </div>
  );
}
