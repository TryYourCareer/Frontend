import { useState } from "react";
import { ArrowLeft, Clock, TrendingUp, Activity, CheckCircle2, DollarSign, Wrench, BookOpen, AlertCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CAREERS_DATA = {
  "software engineer": {
    title: "Software Engineer",
    tagline: "Build products, solve problems, and ship real software.",
    demandBadge: "High Demand – 12% Growth",
    medianSalary: "₹15 LPA",
    icon: "💻",
    timeline: [
      { time: "09:00 AM", title: "Standup Meeting", description: "Sync with your team on progress, blockers, and priorities.", icon: "🗣️" },
      { time: "10:00 AM", title: "Deep Work (Coding)", description: "Focus on writing and refining code for a feature or bug fix.", icon: "💻" },
      { time: "02:00 PM", title: "Debugging", description: "Track down issues, reproduce bugs, and verify fixes.", icon: "🔍" },
      { time: "04:00 PM", title: "Code Review", description: "Review teammates' changes and improve code quality together.", icon: "✅" },
    ],
    realityCheck: [
      "You will read a lot of other people's code.",
      "Frequent meetings are part of the job, even on coding days.",
      "Debugging can be frustrating, but it teaches you how systems work.",
    ],
    proInsights: [
      "Beginner mistake: copy-pasting without understanding the flow.",
      "Real-world skills: clear communication and code readability.",
      "College rarely prepares you for complex legacy systems.",
    ],
    hardSkills: ["JavaScript", "Python", "React", "Git", "SQL", "AWS"],
    softSkills: ["Problem Solving", "Communication", "Teamwork", "Adaptability"],
    educationPathways: ["B.S. Computer Science", "Coding Bootcamps", "Self-Learning"],
  },
  "data scientist": {
    title: "Data Scientist",
    tagline: "Uncover insights, build data models, and tell data stories.",
    demandBadge: "Extreme Demand – 35% Growth",
    medianSalary: "₹16 LPA",
    icon: "📊",
    timeline: [
      { time: "09:30 AM", title: "Data Standup", description: "Coordinate analytics priorities with product teams.", icon: "🗣️" },
      { time: "10:30 AM", title: "Data Wrangling & Pipeline Clean", description: "Clean missing attributes, format dates, and query databases.", icon: "🧹" },
      { time: "02:00 PM", title: "Model Training & Validation", description: "Run regression algorithms, compute confidence coefficients.", icon: "🤖" },
      { time: "04:30 PM", title: "Insight Presentation", description: "Draft slides or dashboard visual maps for stakeholders.", icon: "📈" },
    ],
    realityCheck: [
      "80% of your time will be spent cleaning and formatting messy data.",
      "Stakeholders will frequently ask for simple summaries rather than complex models.",
      "Accuracy metrics don't matter if the model isn't deployable.",
    ],
    proInsights: [
      "Beginner mistake: jumping to deep neural nets when simple regression suffices.",
      "Understand the business logic before coding the mathematical solution.",
      "SQL is your most important daily skill, even more than machine learning libraries.",
    ],
    hardSkills: ["Python", "SQL", "Pandas & NumPy", "Scikit-Learn", "Tableau", "R"],
    softSkills: ["Analytical Thinking", "Data Storytelling", "Critical Thinking", "Stakeholder Alignment"],
    educationPathways: ["B.S. Statistics/Math", "Data Analytics Bootcamps", "Self-Learning"],
  },
  "ai engineer": {
    title: "AI Engineer",
    tagline: "Build neural nets, train models, and deploy intelligent agents.",
    demandBadge: "Extreme Demand – 40% Growth",
    medianSalary: "₹22 LPA",
    icon: "🧠",
    timeline: [
      { time: "09:00 AM", title: "Model Sync", description: "Discuss training runs, loss curves, and resource usage.", icon: "🗣️" },
      { time: "10:00 AM", title: "Model Architecture Design", description: "Write training loops and structure network architectures.", icon: "🧠" },
      { time: "02:00 PM", title: "GPU Grid Operations", description: "Launch and monitor distributed GPU jobs on the cloud.", icon: "⚡" },
      { time: "04:30 PM", title: "Integration Testing", description: "Serve trained model endpoints via FastAPI and run validation tests.", icon: "🔌" },
    ],
    realityCheck: [
      "Hyperparameter tuning can feel like endless trial and error.",
      "Training models takes hours, during which you'll monitor log curves.",
      "Deploying model weights is highly complex and systems-heavy.",
    ],
    proInsights: [
      "Beginner mistake: not tracking training parameters and weight checkpoints.",
      "Data quality determines model accuracy. Better data > complex model.",
      "Learn Linux and docker early; AI systems depend heavily on system configs.",
    ],
    hardSkills: ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker", "CUDA"],
    softSkills: ["System Design", "Cognitive Reasoning", "Patience", "Research Skills"],
    educationPathways: ["M.S. Computer Science / AI", "AI Certifications", "Self-Learning"],
  },
  "full stack developer": {
    title: "Full Stack Developer",
    tagline: "Design front-end layouts and construct secure back-end databases.",
    demandBadge: "Very High Demand – 15% Growth",
    medianSalary: "₹14 LPA",
    icon: "📦",
    timeline: [
      { time: "09:00 AM", title: "Agile Standup", description: "Sync on frontend state management and API integration blockers.", icon: "🗣️" },
      { time: "10:00 AM", title: "Frontend Layout Styling", description: "Construct responsive pages, hover triggers, and input forms.", icon: "🎨" },
      { time: "02:00 PM", title: "API Development", description: "Write backend controllers, secure routes, and index queries.", icon: "⚙️" },
      { time: "04:00 PM", title: "Review & CI/CD", description: "Push commits to Git and verify production test suites.", icon: "🚀" },
    ],
    realityCheck: [
      "JavaScript library frameworks change extremely frequently.",
      "Debugging client state synchronizations requires deep persistence.",
      "CSS layout alignment can take surprisingly long to perfect.",
    ],
    proInsights: [
      "Beginner mistake: trying to learn 5 frameworks at once. Master core HTML/JS first.",
      "Good developers write robust tests; don't rely only on local manual clicks.",
      "API design rules (REST standards) are vital for scalable team collaboration.",
    ],
    hardSkills: ["JavaScript/TypeScript", "React / Next.js", "Node.js & Express", "SQL & NoSQL", "Git", "CSS"],
    softSkills: ["Rapid Adaptability", "Visual Ergonomics", "Coordination", "Logical Reasoning"],
    educationPathways: ["B.S. Software Engineering", "Full Stack Bootcamps", "Self-Learning"],
  }
};

const TABS = [
  { key: "day", label: "Day in the Life", icon: Clock },
  { key: "reality", label: "Reality Check", icon: AlertCircle },
  { key: "pro", label: "Pro Insights", icon: TrendingUp },
];

export default function CareerReality({ onBack, careerTitle = "" }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("day");

  const normalizedKey = String(careerTitle || "").trim().toLowerCase();
  const careerData = CAREERS_DATA[normalizedKey] || CAREERS_DATA["software engineer"];

  return (
    <>
      <section className="min-h-screen bg-[#FAF6EC] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumbs Navigation */}
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-6">
            <span className="cursor-pointer hover:text-slate-900 transition" onClick={() => navigate("/dashboard")}>Home</span>
            <ChevronRight size={10} className="text-slate-400" />
            <span className="cursor-pointer hover:text-slate-900 transition" onClick={onBack}>Matches</span>
            <ChevronRight size={10} className="text-slate-400" />
            <span className="cursor-pointer hover:text-slate-900 transition" onClick={onBack}>Technology Cluster</span>
            <ChevronRight size={10} className="text-slate-400" />
            <span className="text-slate-900 font-bold">{careerData.title}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-6xl space-y-6">

          {/* Back button */}
          {onBack && (
            <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50 shadow-sm">
              <ArrowLeft size={14} />
              Back
            </button>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.7fr_0.9fr] lg:items-start">
            <div className="space-y-4">

              {/* Career header card */}
              <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FAF2DB] text-2xl border border-slate-200 shadow-sm">
                      {careerData.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-450">Career Reality Check</p>
                      <h1 className="mt-1 text-xl font-serif font-bold text-slate-900">{careerData.title}</h1>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-650">{careerData.tagline}</p>
                    </div>
                  </div>

                  <div className="shrink-0 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 sm:w-56">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-slate-800">
                      <Activity size={12} className="shrink-0" />
                      {careerData.demandBadge}
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-900">
                      <DollarSign size={12} className="shrink-0" />
                      Median: {careerData.medianSalary}
                    </div>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1a36] hover:bg-[#122b59] px-4 py-2.5 text-xs font-bold text-white transition">
                      <TrendingUp size={12} className="shrink-0" />
                      Start Trial Mission
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs card */}
              <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button key={key} type="button" onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${activeTab === key ? "bg-[#0b1a36] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-205"}`}
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 min-h-[200px] cc-fadein">
                  {activeTab === "day" && (
                    <div className="space-y-4">
                      <p className="text-xs leading-relaxed text-slate-650">This career is built around focus, collaboration, and consistent problem solving. Here's what a realistic day can look like.</p>
                      <ul className="space-y-4 border-l border-slate-200 pl-4">
                        {careerData.timeline.map((item) => (
                          <li key={item.time} className="relative pl-1">
                            <span className="absolute -left-[1.35rem] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-slate-800 bg-white">
                              <span className="h-1 w-1 rounded-full bg-slate-800" />
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{item.icon}</span>
                              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{item.time}</span>
                            </div>
                            <h3 className="mt-1 text-xs font-bold text-slate-900">{item.title}</h3>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{item.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === "reality" && (
                    <div className="space-y-3 cc-fadein">
                      <h2 className="flex items-center gap-2 text-sm font-bold font-serif text-slate-900">
                        <AlertCircle size={15} className="text-amber-600" />
                        The Unglamorous Truth
                      </h2>
                      <p className="text-xs leading-relaxed text-slate-650">Software engineering is exciting, but it also comes with real challenges. Students should know that the job often includes time-consuming maintenance work, collaboration overhead, and repeated debugging cycles.</p>
                      <ul className="space-y-2">
                        {careerData.realityCheck.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                            <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                            <span className="text-xs text-slate-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === "pro" && (
                    <div className="space-y-3 cc-fadein">
                      <h2 className="flex items-center gap-2 text-sm font-bold font-serif text-slate-900">
                        <TrendingUp size={15} className="text-emerald-700" />
                        Pro Insights
                      </h2>
                      <ul className="space-y-2">
                        {careerData.proInsights.map((insight) => (
                          <li key={insight} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                            <span className="text-xs text-slate-700">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-8">
              <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-1.5 text-sm font-bold font-serif text-slate-900">
                  <Wrench size={14} className="text-slate-800" />
                  Core Tools & Skills
                </h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {careerData.hardSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-[#FAF2DB] px-3 py-1 text-xs font-bold text-slate-950 border border-slate-200 shadow-sm">{skill}</span>
                  ))}
                </div>
                <div className="mt-4">
                  <h3 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    <Activity size={10} />
                    Soft Skills
                  </h3>
                  <div className="mt-2 grid gap-1.5">
                    {careerData.softSkills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-1.5 text-sm font-bold font-serif text-slate-900">
                  <BookOpen size={14} className="text-slate-850" />
                  Education Pathways
                </h2>
                <ul className="mt-3 space-y-2">
                  {careerData.educationPathways.map((pathway) => (
                    <li key={pathway} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
                      <GraduationCapIcon />
                      {pathway}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function GraduationCapIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
