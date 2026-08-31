import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Cpu,
  Bot,
  Code,
  Sparkles,
  UserCheck,
  Shield,
} from "lucide-react";
import RoleDetail from "./RoleDetail";

const AIML_ROLES_DATA = {
  aiml_intern: {
    key: "aiml_intern",
    title: "AI / ML Intern",
    category: "Entry Level (0–2 Yrs)",
    salary: "₹5–12 LPA",
    experienceTier: "Entry Level (0–2 Years)",
    icon: Code,
    matchScore: 95,
    tagline:
      "Learn fundamentals, support data pipelines, and write basic code under supervision.",
    summary:
      "An entry-level position focused on mastering AI/ML fundamentals, supporting data pipelines, and writing baseline code under senior guidance.",
    keyTasks: [
      "Assisting senior engineers with dataset preparation and cleaning.",
      "Running baseline model performance checks and validating data pipelines.",
      "Writing simple automation scripts and documenting empirical findings.",
      "Reviewing project execution updates and participating in daily team syncs.",
    ],
    preparation:
      "BSc CS / B.Tech or self-taught learning via online certifications (Coursera, deeplearning.ai, fast.ai), bootcamps, and GitHub portfolio projects.",
    dailyFocus:
      "Learning framework workflows, cleaning messy datasets, and assisting with code reviews.",
  },
  junior_ai_engineer: {
    key: "junior_ai_engineer",
    title: "Junior AI Engineer",
    category: "Entry Level (0–2 Yrs)",
    salary: "₹5–12 LPA",
    experienceTier: "Entry Level (0–2 Years)",
    icon: Cpu,
    matchScore: 92,
    tagline:
      "Clean messy datasets, engineer model features, and run baseline accuracy evaluations.",
    summary:
      "Focuses on hands-on data wrangling, feature engineering, and evaluating initial machine learning model accuracy metrics.",
    keyTasks: [
      "Deep diving into raw datasets to clean bad or missing data.",
      "Engineering key data features for upcoming model training runs.",
      "Evaluating model accuracy using metrics like precision, recall, and F1-score.",
      "Collaborating with software engineers and data analysts in daily standups.",
    ],
    preparation:
      "Strong Python & SQL fundamentals, linear algebra/statistics foundation, and hands-on practice with Scikit-Learn, PyTorch, or TensorFlow.",
    dailyFocus:
      "60-70% of time spent on data cleaning, feature engineering, and debugging basic scripts.",
  },
  ai_engineer: {
    key: "ai_engineer",
    title: "AI / ML Engineer",
    category: "Mid Level (3–7 Yrs)",
    salary: "₹12–30 LPA",
    experienceTier: "Mid Level (3–7 Years)",
    icon: Brain,
    matchScore: 92,
    tagline:
      "Design, build, and train intelligent machine learning models that learn from data.",
    summary:
      "Sits at the intersection of mathematics, software engineering, and data science to build systems that learn from data and make smart decisions without being explicitly programmed.",
    keyTasks: [
      "Building and training production ML models and adjusting hyperparameters.",
      "Writing clean, modular code and submitting work for peer review.",
      "Monitoring performance dashboards and optimizing model execution speed.",
      "Syncing daily with product managers, data analysts, and backend teams.",
    ],
    schedule: [
      {
        time: "09:00 AM",
        task: "Review model performance dashboards & overnight project updates.",
      },
      {
        time: "11:00 AM",
        task: "Deep dive into datasets: clean bad data & engineer features.",
      },
      {
        time: "01:00 PM",
        task: "Team standup: sync with engineers, PMs, and data analysts.",
      },
      {
        time: "03:00 PM",
        task: "Train and test ML models, adjust hyperparameters, document findings.",
      },
      {
        time: "05:00 PM",
        task: "Optimize model accuracy/efficiency; submit code for peer review.",
      },
      {
        time: "07:00 PM",
        task: "Continuous upskilling: read research papers or complete online modules.",
      },
    ],
    preparation:
      "3+ years of software/ML experience, strong system design, PyTorch/TensorFlow expertise, and MLOps deployment knowledge.",
    dailyFocus:
      "Training models, hyperparameter tuning, MLOps integrations, and cross-team alignment.",
  },
  senior_ai_engineer: {
    key: "senior_ai_engineer",
    title: "Senior AI Engineer",
    category: "Senior Level (8+ Yrs)",
    salary: "₹30–70+ LPA",
    experienceTier: "Senior Level (8+ Years)",
    icon: Sparkles,
    matchScore: 88,
    tagline:
      "Optimize neural architecture efficiency, debug model weights, and lead technical peer reviews.",
    summary:
      "Leads complex model development, solves layered technical problems with no clear answers, and reviews peer code for scalability and accuracy.",
    keyTasks: [
      "Architecting robust model training pipelines and distributed training jobs.",
      "Performing deep code and performance reviews across technical teams.",
      "Tuning advanced neural architectures and debugging complex data edge cases.",
      "Mentoring junior/mid-level AI engineers on production best practices.",
    ],
    preparation:
      "8+ years in software engineering / ML, proven experience shipping models to scale, and strong architectural reasoning.",
    dailyFocus:
      "Complex problem solving, model architecture design, code reviews, and high-level debugging.",
  },
  ai_architect: {
    key: "ai_architect",
    title: "AI Architect",
    category: "Senior Level (8+ Yrs)",
    salary: "₹30–70+ LPA",
    experienceTier: "Senior Level (8+ Years)",
    icon: Bot,
    matchScore: 85,
    tagline:
      "Design large-scale enterprise AI infrastructure, model deployment pipelines, and cloud strategies.",
    summary:
      "Focuses on designing end-to-end AI system infrastructure, selecting frameworks, and bridging machine learning models with enterprise software architecture.",
    keyTasks: [
      "Designing scalable data pipelines and real-time model inference services.",
      "Selecting appropriate cloud services, GPU resources, and ML frameworks.",
      "Establishing technical governance, security protocols, and system reliability.",
      "Solving multi-step system design challenges across complex technical stacks.",
    ],
    preparation:
      "Deep expertise in distributed systems, cloud computing (AWS/GCP), MLOps, Docker/Kubernetes, and enterprise software architecture.",
    dailyFocus:
      "System architecture diagrams, cloud resource allocation, tech stack evaluation, and cross-team alignment.",
  },
  director_of_ai: {
    key: "director_of_ai",
    title: "Director of AI",
    category: "Elite Roles (Top 1%)",
    salary: "₹1 Crore+ LPA",
    experienceTier: "Executive Leadership",
    icon: UserCheck,
    matchScore: 82,
    tagline:
      "Oversee organization-wide AI strategy, manage cross-functional data teams, and drive business impact.",
    summary:
      "Executive leadership role responsible for setting organization-wide AI strategy, managing team structures, and aligning technical delivery with business growth.",
    keyTasks: [
      "Managing multidisciplinary engineering, data science, and product teams.",
      "Defining high-level technical direction and AI product roadmaps.",
      "Allocating computational infrastructure budgets and engineering headcount.",
      "Ensuring AI initiatives deliver measurable business ROI and strategic value.",
    ],
    preparation:
      "10+ years of technical leadership, track record of managing engineering organizations, and business strategy acumen.",
    dailyFocus:
      "Resource allocation, executive leadership syncs, strategic planning, and organizational design.",
  },
  caio_founder: {
    key: "caio_founder",
    title: "Chief AI Officer / Founder",
    category: "Elite Roles (Top 1%)",
    salary: "₹1 Crore+ LPA",
    experienceTier: "Executive Leadership / Entrepreneur",
    icon: Shield,
    matchScore: 80,
    tagline:
      "Steer corporate AI innovation, establish governance frameworks, and build cutting-edge technology.",
    summary:
      "Highest executive or founder level responsible for total AI vision, proprietary technology stack strategy, or building an AI-first startup venture.",
    keyTasks: [
      "Driving company-wide technology innovation and core vision.",
      "Representing AI strategy to board members, investors, and enterprise clients.",
      "Setting ethical, governance, and compliance frameworks for AI safety.",
      "Pioneering market-shifting AI applications and proprietary IP development.",
    ],
    preparation:
      "Extensive industry authority, venture-building capability, or top-tier technical expertise paired with business leadership.",
    dailyFocus:
      "Company vision, investor relations, ethical governance, and high-impact technology partnerships.",
  },
};

const FILTER_TABS = [
  { key: "all", label: "All Roles" },
  { key: "entry", label: "Entry Level" },
  { key: "mid_senior", label: "Mid/Senior Level" },
  { key: "leadership", label: "Executive & Leadership" },
];

export default function CareerReality({ onBack }) {
  const [currentView, setCurrentView] = useState("list");
  const [selectedRoleKey, setSelectedRoleKey] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const rolesList = Object.values(AIML_ROLES_DATA);

  const filteredRoles = rolesList.filter((role) => {
    if (activeTab === "entry") return role.category.includes("Entry Level");
    if (activeTab === "mid_senior")
      return (
        role.category.includes("Mid Level") ||
        role.category.includes("Senior Level")
      );
    if (activeTab === "leadership")
      return (
        role.category.includes("Executive") ||
        role.category.includes("Elite Roles")
      );
    return true;
  });

  const handleOpenRoleDetail = (key) => {
    setSelectedRoleKey(key);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedRoleKey(null);
  };

  if (currentView === "detail" && selectedRoleKey) {
    const role =
      AIML_ROLES_DATA[selectedRoleKey] || AIML_ROLES_DATA.ai_engineer;
    return <RoleDetail role={role} onBack={handleBackToList} />;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-8 sm:px-10 lg:px-12 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E88E5]">
              Career Reality
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0b1a36] sm:text-4xl">
              AI / ML Career Cluster
            </h1>
            <p className="max-w-3xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Explore specialized AI/ML roles spanning entry-level, senior, and executive pathways. Click any role card arrow button to open its dedicated details page.
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50 shrink-0"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition shadow-xs ${
                activeTab === tab.key
                  ? "bg-[#0b1a36] text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Roles List */}
        <div className="space-y-3 pt-2">
          {filteredRoles.map((role) => {
            const IconComponent = role.icon;

            return (
              <div
                key={role.key}
                onClick={() => handleOpenRoleDetail(role.key)}
                className="group flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#D3E3F5] bg-white p-5 cursor-pointer transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 shadow-xs sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] text-[#1E88E5] shadow-xs transition-colors">
                    <IconComponent size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-slate-900 transition group-hover:text-[#0b1a36]">
                        {role.title}
                      </h3>
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {role.category}
                      </span>
                      <span className="rounded-full border border-sky-100 bg-[#EAF2FA] px-2.5 py-0.5 text-[10px] font-bold text-[#1E88E5]">
                        {role.salary}
                      </span>
                    </div>
                    <p className="max-w-2xl text-xs leading-relaxed text-slate-600">
                      {role.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end shrink-0 sm:self-center">
                  <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {role.matchScore}% Match
                  </span>
                  <button
                    type="button"
                    aria-label="View role details"
                    className="grid h-9 w-9 place-items-center rounded-full bg-[#0b1a36] text-white transition-transform group-hover:scale-105 group-hover:bg-[#122b59] shadow-xs"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}