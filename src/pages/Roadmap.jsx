import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Circle, Clock, Award,
  ExternalLink, Sliders, Compass, ChevronRight, Search, Sparkles
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BACKEND_BASE_URL from "../API/BaseURL";
import { getCareerFitReport } from "../services/discoveryTest";
import SEO from "../components/SEO";

const CURATED_ROADMAPS = {
  "ai engineer": {
    title: "AI Engineer",
    category: "Technology",
    summary: "Learn mathematical modeling, statistical learning, neural architectures, and model training to build intelligent systems.",
    difficulty: "Advanced",
    duration: "6-8 Months",
    color: "from-cyan-500 to-blue-600",
    steps: [
      {
        title: "Step 1: Mathematical Foundations",
        description: "Master the essential linear algebra, calculus, and probability concepts required to understand machine learning models.",
        tasks: [
          { name: "Linear Algebra: Matrices, vectors, eigenvalues & eigenvectors", source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/linear-algebra/" },
          { name: "Multivariable Calculus: Gradients, partial derivatives, chain rule", source: "Khan Academy", link: "https://www.khanacademy.org/math/multivariable-calculus" },
          { name: "Probability & Statistics: Distributions, Bayes Theorem, PDF/CDF", source: "W3Schools", link: "https://www.w3schools.com/statistics/" }
        ],
        estimatedTime: "4 Weeks"
      },
      {
        title: "Step 2: Python Programming & Data Manipulation",
        description: "Get comfortable writing optimized Python scripts, handling files, and plotting complex datasets.",
        tasks: [
          { name: "Python Core: Data structures, OOP, file handling, generators", source: "W3Schools", link: "https://www.w3schools.com/python/" },
          { name: "Data Manipulation: Pandas arrays, NumPy matrix calculations", source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/pandas-tutorial/" },
          { name: "Data Visualization: Matplotlib and Seaborn dashboards", source: "W3Schools", link: "https://www.w3schools.com/python/python_matplotlib.asp" }
        ],
        estimatedTime: "4 Weeks"
      },
      {
        title: "Step 3: Classical Machine Learning Models",
        description: "Build supervised and unsupervised statistical models from scratch using Scikit-Learn.",
        tasks: [
          { name: "Regression Models: Linear, logistic, ridge & lasso", source: "W3Schools", link: "https://www.w3schools.com/python/python_ml_linear_regression.asp" },
          { name: "Tree-based Algorithms: Decision Trees, Random Forests, XGBoost", source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/decision-tree/" },
          { name: "Clustering & Dim Reduction: K-Means, PCA, t-SNE", source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/k-means-clustering-introduction/" }
        ],
        estimatedTime: "6 Weeks"
      },
      {
        title: "Step 4: Deep Learning & Neural Networks",
        description: "Understand neural backpropagation and implement feed-forward networks using PyTorch or TensorFlow.",
        tasks: [
          { name: "Neural Networks: Backprop, activation functions, loss functions", source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/artificial-neural-networks/" },
          { name: "Computer Vision: Convolutional Neural Networks (CNNs), ResNet", source: "PyTorch Tutorials", link: "https://pytorch.org/tutorials/" },
          { name: "NLP & Transformers: Recurrent Nets, Attention mechanism, BERT", source: "HuggingFace Course", link: "https://huggingface.co/learn" }
        ],
        estimatedTime: "8 Weeks"
      },
      {
        title: "Step 5: MLOps & Model Deployment",
        description: "Deploy trained models to production servers and manage pipeline monitoring.",
        tasks: [
          { name: "Containerization: Build model deployment containers with Docker", source: "W3Schools", link: "https://www.w3schools.com/aws/" },
          { name: "Model Hosting: Deploy FastAPI servers on AWS or GCP EC2 instances", source: "AWS Academy", link: "https://aws.amazon.com/training/" },
          { name: "Monitoring: MLflow tracking and pipeline instrumentation", source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/" }
        ],
        estimatedTime: "4 Weeks"
      }
    ]
  },
  "actuary": {
    title: "Actuary",
    category: "Finance & Risk",
    summary: "Master probability modeling, statistical distributions, insurance pricing, reserving, and actuarial examination modules.",
    difficulty: "Advanced",
    duration: "12-18 Months (Certification Track)",
    color: "from-blue-600 to-indigo-700",
    steps: [
      {
        title: "Stage 1: Mathematical Foundations & Financial Mathematics",
        description: "Master probability theory, calculus, interest theory, annuities, and financial mathematics core for actuarial analysis.",
        tasks: [
          { name: "Financial Mathematics: Present value, annuities, yield curves, bond amortization", source: "W3Schools", link: "https://www.w3schools.com/statistics/" },
          { name: "Probability Theory: Random variables, joint distributions, central limit theorem", source: "Khan Academy", link: "https://www.khanacademy.org/math/statistics-probability" },
          { name: "Calculus & Optimization: Multivariable integration, moment generating functions", source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/calculus/" }
        ],
        estimatedTime: "8 Weeks"
      },
      {
        title: "Stage 2: Statistical & Actuarial Modeling (R & Python)",
        description: "Build loss distribution models, parametric curve fits, and risk simulations using R, Python, and Excel.",
        tasks: [
          { name: "Statistical Modeling in R / Python: Generalized Linear Models (GLMs), regression", source: "W3Schools", link: "https://www.w3schools.com/r/" },
          { name: "Excel Advanced Financial Modeling: Data tables, Solver, VBA macro automation", source: "W3Schools", link: "https://www.w3schools.com/excel/" },
          { name: "Monte Carlo Simulations: Simulating aggregate claim distributions and tail risks", source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/monte-carlo-simulation/" }
        ],
        estimatedTime: "10 Weeks"
      },
      {
        title: "Stage 3: Insurance Pricing, Reserving & Loss Reserving",
        description: "Learn standard actuarial reserving methods (Chain Ladder, Bornhuetter-Ferguson) and underwriting premium structures.",
        tasks: [
          { name: "Loss Reserving Techniques: Triangle development, Chain Ladder, IBNR calculation", source: "Actuarial Lookup", link: "https://www.actuaries.org.uk/" },
          { name: "Pricing & Pure Premium: Frequency-severity modeling and credibility theory", source: "Institute of Actuaries", link: "https://www.actuariesindia.org/" },
          { name: "Survival Models: Life tables, hazard rates, mortality decrement tables", source: "Khan Academy", link: "https://www.khanacademy.org/" }
        ],
        estimatedTime: "12 Weeks"
      },
      {
        title: "Stage 4: IFRS 17, Solvency & Regulatory Standards",
        description: "Understand insurance accounting standards, solvency capital requirements (RBC), and statutory reporting.",
        tasks: [
          { name: "IFRS 17 Framework: Contractual service margin, risk adjustments, measurement models", source: "IFRS Foundation", link: "https://www.ifrs.org/" },
          { name: "Solvency & Capital Management: Enterprise Risk Management (ERM) and stress testing", source: "IAI Standards", link: "https://www.actuariesindia.org/" },
          { name: "Professional Code of Conduct & Statutory Peer Review practices", source: "Society of Actuaries", link: "https://www.soa.org/" }
        ],
        estimatedTime: "8 Weeks"
      },
      {
        title: "Stage 5: Professional Exam Preparation (IAI / SOA / IFoA)",
        description: "Prepare and clear initial Core Principles exams (CS1, CS2, CM1, CM2 / Exams P & FM).",
        tasks: [
          { name: "Exam CS1 / Exam P: Actuarial Statistics and Probability mock papers", source: "Actuaries India", link: "https://www.actuariesindia.org/" },
          { name: "Exam CM1 / Exam FM: Actuarial Mathematics & Financial Modeling practice series", source: "Society of Actuaries", link: "https://www.soa.org/" },
          { name: "Industry Internship Project: Build automated claims reserving dashboard", source: "GitHub Portfolio", link: "https://github.com/" }
        ],
        estimatedTime: "12 Weeks"
      }
    ]
  }
};

function generateDynamicRoadmap(career) {
  const cName = career.career_name || career.title || "Career";
  const sector = career.sector || career.cluster || career.discipline || "Industry";
  const rawSkills = career.core_skills || career.key_skills || [];
  const skills = Array.isArray(rawSkills) ? rawSkills : typeof rawSkills === "string" ? rawSkills.split(",").map(s => s.trim()) : [];
  
  const skill1 = skills[0] || "Foundational Methodologies";
  const skill2 = skills[1] || "Core Industry Software & Tooling";
  const skill3 = skills[2] || "Advanced Problem Solving & System Modeling";
  const skill4 = skills[3] || "Quality Assurance & Standards";
  const skill5 = skills[4] || "Leadership & Project Delivery";

  return {
    title: cName,
    category: sector,
    summary: career.description || `Structured learning roadmap for ${cName} within the ${sector} sector covering foundational competencies, technical tooling, and industry portfolio projects.`,
    difficulty: "Intermediate-Advanced",
    duration: "6-9 Months",
    color: "from-blue-600 to-indigo-700",
    steps: [
      {
        title: `Stage 1: Mathematical & ${sector} Foundations`,
        description: `Establish core foundational principles, quantitative reasoning, and domain fundamentals essential for ${cName}.`,
        tasks: [
          { name: `Domain Fundamentals: Core concepts and theoretical principles of ${cName}`, source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/" },
          { name: "Quantitative & Analytical Thinking: Problem breakdown and data analysis", source: "Khan Academy", link: "https://www.khanacademy.org/" },
          { name: "Industry Orientation: Industry standards, key terminology, and role responsibilities", source: "W3Schools", link: "https://www.w3schools.com/" }
        ],
        estimatedTime: "4 Weeks"
      },
      {
        title: `Stage 2: Technical Tooling & ${skill1}`,
        description: `Hands-on training with primary software tools, platforms, and ${skill1}.`,
        tasks: [
          { name: `Core Skill Mastery: ${skill1}`, source: "Documentation", link: "https://www.w3schools.com/" },
          { name: `Tooling & Execution: ${skill2}`, source: "GeeksforGeeks", link: "https://www.geeksforgeeks.org/" },
          { name: "Practical Lab: Setting up local development/modeling environment", source: "TutorialsPoint", link: "https://www.tutorialspoint.com/" }
        ],
        estimatedTime: "6 Weeks"
      },
      {
        title: `Stage 3: Advanced Applications & ${skill3}`,
        description: `Deepen expertise in complex workflows, real-world case studies, and ${skill3}.`,
        tasks: [
          { name: `Advanced Execution: ${skill3}`, source: "Coursera / edX", link: "https://www.coursera.org/" },
          { name: `Optimization & Process: ${skill4}`, source: "Industry Whitepapers", link: "https://www.geeksforgeeks.org/" },
          { name: "Collaborative Workflows: Working in cross-functional teams and documentation", source: "Atlassian Guide", link: "https://www.atlassian.com/agile" }
        ],
        estimatedTime: "6 Weeks"
      },
      {
        title: `Stage 4: Industry Standards, Certifications & ${skill5}`,
        description: `Prepare for professional credentials, regulatory compliance, and ${skill5}.`,
        tasks: [
          { name: `Credential Preparation: Industry recognized certificates for ${cName}`, source: "Certification Guide", link: "https://www.geeksforgeeks.org/" },
          { name: `Standards & Compliance: ${skill5}`, source: "Standards Body", link: "https://www.iso.org/" },
          { name: "Industry Case Studies: Analyzing production scenarios and retrospective reviews", source: "Harvard Business Review / Tech Docs", link: "#" }
        ],
        estimatedTime: "6 Weeks"
      },
      {
        title: "Stage 5: Capstone Project & Portfolio Development",
        description: `Build a production-grade portfolio demonstrating end-to-end expertise in ${cName}.`,
        tasks: [
          { name: `Capstone Deliverable: Build a complete real-world project aligned with ${cName}`, source: "GitHub Portfolio", link: "https://github.com/" },
          { name: "Portfolio Presentation: Document project decisions, tradeoffs, and outcomes", source: "Medium / Dev.to", link: "https://dev.to/" },
          { name: "Technical Interview & Portfolio Review Preparation", source: "InterviewBit / LeetCode", link: "https://www.interviewbit.com/" }
        ],
        estimatedTime: "4 Weeks"
      }
    ]
  };
}

export default function Roadmap() {
  const navigate = useNavigate();
  const location = useLocation();

  const [dbCareers, setDbCareers] = useState([]);
  const [userMatchedCareers, setUserMatchedCareers] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [searchFilter, setSearchFilter] = useState("");

  // 1. Fetch careers list & user's matched careers
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/match-engine/careers`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setDbCareers(data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch backend careers in Roadmap:", err);
      }

      const sessionId = localStorage.getItem("latest_test_session_id");
      if (sessionId) {
        try {
          const report = await getCareerFitReport(sessionId);
          if (isMounted && report && report.top_matches) {
            setUserMatchedCareers(report.top_matches.map(m => m.career_name));
          }
        } catch (err) {
          console.warn("Could not fetch user matched careers in Roadmap:", err);
        }
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, []);

  // 2. Determine target career from URL query param `?career=Actuary`
  const targetCareerName = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const careerParam = params.get("career") || params.get("path");
    return careerParam ? careerParam.trim() : "Actuary";
  }, [location.search]);

  // 3. Build active roadmap object for the target career
  const currentPath = useMemo(() => {
    const lowerTarget = targetCareerName.toLowerCase();

    // Check curated roadmaps first
    for (const [k, v] of Object.entries(CURATED_ROADMAPS)) {
      if (k.toLowerCase() === lowerTarget || v.title.toLowerCase() === lowerTarget) {
        return v;
      }
    }

    // Check database careers
    const foundInDb = dbCareers.find(c => (c.career_name || "").toLowerCase() === lowerTarget);
    if (foundInDb) {
      return generateDynamicRoadmap(foundInDb);
    }

    // Default dynamic fallback
    return generateDynamicRoadmap({
      career_name: targetCareerName,
      sector: "Professional Track",
      core_skills: ["Domain Foundations", "Technical Tools", "System Analysis", "Quality & Compliance", "Portfolio Project"]
    });
  }, [targetCareerName, dbCareers]);

  // 4. Fast selector career buttons (user matches + curated popular + current)
  const selectorOptions = useMemo(() => {
    const set = new Set();
    if (targetCareerName) set.add(targetCareerName);
    userMatchedCareers.forEach(c => set.add(c));
    ["Actuary", "AI Engineer", "Site Reliability Engineer", "Data Scientist", "Software Engineer", "UI/UX Designer"].forEach(c => set.add(c));
    return Array.from(set);
  }, [targetCareerName, userMatchedCareers]);

  const handleSelectCareer = (cName) => {
    navigate(`/roadmap?career=${encodeURIComponent(cName)}`);
  };

  const handleToggleTask = (stepIndex, taskIndex) => {
    const key = `${targetCareerName}-${stepIndex}-${taskIndex}`;
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentPathTotalTasks = useMemo(() => {
    return currentPath.steps.reduce((acc, step) => acc + step.tasks.length, 0);
  }, [currentPath]);

  const currentPathCompletedTasksCount = useMemo(() => {
    let count = 0;
    currentPath.steps.forEach((step, sIdx) => {
      step.tasks.forEach((_, tIdx) => {
        const key = `${targetCareerName}-${sIdx}-${tIdx}`;
        if (completedTasks[key]) count++;
      });
    });
    return count;
  }, [currentPath, targetCareerName, completedTasks]);

  const progressPercent = useMemo(() => {
    if (currentPathTotalTasks === 0) return 0;
    return Math.round((currentPathCompletedTasksCount / currentPathTotalTasks) * 100);
  }, [currentPathTotalTasks, currentPathCompletedTasksCount]);

  // Filtered dropdown careers when searching
  const filteredDbCareers = useMemo(() => {
    if (!searchFilter.trim()) return [];
    const q = searchFilter.toLowerCase();
    return dbCareers
      .filter(c => (c.career_name || "").toLowerCase().includes(q) || (c.sector || "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchFilter, dbCareers]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-6 sm:px-6 lg:px-10 font-sans text-left">
      <SEO
        title={`${currentPath.title} Learning Roadmap - ClearCareers`}
        description={`Interactive career roadmap for ${currentPath.title}. Master domain foundations, technical competencies, certifications, and portfolio capstones.`}
      />

      <div className="mx-auto max-w-6xl">
        {/* Breadcrumbs Navigation */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-6">
          <span className="cursor-pointer hover:text-[#0b1a36] transition" onClick={() => navigate("/dashboard")}>Home</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="cursor-pointer hover:text-[#0b1a36] transition" onClick={() => navigate("/career-reality")}>Career Reality</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-[#0b1a36] font-bold">Roadmaps</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-[#1E88E5] font-bold">{currentPath.title}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header block */}
        <div className="flex flex-col gap-5 rounded-3xl border border-[#D3E3F5] bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-1 text-[10px] font-bold text-[#1E88E5]">
                  <Compass size={12} className="animate-spin" />
                  Interactive Curated Learning Roadmap
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b1a36] tracking-tight leading-tight">
                {currentPath.title} Career Roadmap
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
                Structured progressive curriculum covering mathematical foundations, software tooling, professional certifications, and portfolio capstone milestones.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/career-reality")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50 shadow-xs self-start cursor-pointer"
            >
              <ArrowLeft size={14} />
              Career Reality
            </button>
          </div>

          {/* Pathway Selector & Quick Search */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Target Career Path
              </label>
              
              {/* Quick Career Switcher Search */}
              <div className="relative w-full sm:w-72">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Switch career pathway..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#1E88E5] focus:bg-white focus:ring-1 focus:ring-[#1E88E5]"
                />
                {filteredDbCareers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-30 max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg space-y-1">
                    {filteredDbCareers.map((c) => (
                      <button
                        key={c.id || c.career_name}
                        type="button"
                        onClick={() => {
                          handleSelectCareer(c.career_name);
                          setSearchFilter("");
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 hover:bg-sky-50 hover:text-[#1E88E5] transition flex items-center justify-between cursor-pointer"
                      >
                        <span>{c.career_name}</span>
                        <span className="text-[10px] text-slate-400">{c.sector}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectorOptions.map((cName) => {
                const isActive = targetCareerName.toLowerCase() === cName.toLowerCase();
                return (
                  <button
                    key={cName}
                    type="button"
                    onClick={() => handleSelectCareer(cName)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer inline-flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#0b1a36] border-[#0b1a36] text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isActive && <Sparkles size={11} className="text-amber-400" />}
                    {cName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected pathway detail banner */}
        <div className="rounded-3xl border border-[#0b1a36] bg-[#0b1a36] p-6 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <span className="rounded-full bg-white/15 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              {currentPath.category} Track
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">{currentPath.title} Syllabus</h2>
            <p className="max-w-2xl text-xs leading-relaxed text-blue-50/85">
              {currentPath.summary}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/90 pt-2">
              <span className="flex items-center gap-1.5"><Clock size={12} /> Duration: {currentPath.duration}</span>
              <span className="flex items-center gap-1.5"><Sliders size={12} /> Difficulty: {currentPath.difficulty}</span>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="shrink-0 flex items-center gap-4 bg-white/10 border border-white/10 rounded-3xl p-4 md:w-56 justify-center">
            <div className="relative h-14 w-14 grid place-items-center">
              <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-emerald-400"
                  strokeWidth="3.5"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${progressPercent}, 100` }}
                  transition={{ duration: 0.6 }}
                />
              </svg>
              <span className="text-xs font-bold">{progressPercent}%</span>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Overall Progress</p>
              <p className="text-xs font-bold mt-0.5">{currentPathCompletedTasksCount} / {currentPathTotalTasks} Milestones</p>
            </div>
          </div>
        </div>

        {/* Roadmap steps flow */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
          <AnimatePresence mode="popLayout">
            {currentPath.steps.map((step, sIdx) => {
              const completedInStep = step.tasks.filter((_, tIdx) => completedTasks[`${targetCareerName}-${sIdx}-${tIdx}`]).length;
              const isStepCompleted = completedInStep === step.tasks.length;

              return (
                <motion.div
                  key={`${targetCareerName}-${sIdx}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: sIdx * 0.05 }}
                  className="relative group"
                >
                  {/* Step Connector Indicator Dot */}
                  <div className={`absolute -left-[27px] sm:-left-[31px] top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 transition-all ${
                    isStepCompleted
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                      : completedInStep > 0
                      ? "bg-[#0b1a36] border-[#0b1a36] text-white"
                      : "bg-white border-slate-300 text-slate-500 group-hover:border-[#0b1a36]"
                  } z-10`}>
                    {isStepCompleted ? <CheckCircle2 size={12} /> : <span className="text-[10px] font-black">{sIdx + 1}</span>}
                  </div>

                  {/* Step Card Content */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1E88E5]">
                          Stage {sIdx + 1}
                        </span>
                        <h3 className="text-base font-serif font-bold text-[#0b1a36] mt-1">{step.title}</h3>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 self-start sm:self-center">
                        <Clock size={10} /> {step.estimatedTime}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600 mb-4">
                      {step.description}
                    </p>

                    {/* Task checklist */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Learning milestones:</p>
                      <div className="grid gap-1.5">
                        {step.tasks.map((task, tIdx) => {
                          const taskKey = `${targetCareerName}-${sIdx}-${tIdx}`;
                          const isDone = completedTasks[taskKey];

                          return (
                            <div
                              key={tIdx}
                              onClick={() => handleToggleTask(sIdx, tIdx)}
                              className={`flex items-start gap-2.5 rounded-2xl border p-3 cursor-pointer transition ${
                                isDone
                                  ? "bg-emerald-50/40 border-emerald-300 text-slate-800"
                                  : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <button type="button" className="mt-0.5 text-slate-400 focus:outline-none shrink-0 cursor-pointer">
                                {isDone ? (
                                  <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-600/10" />
                                ) : (
                                  <Circle size={16} className="text-slate-300" />
                                )}
                              </button>
                              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className={`text-xs font-medium leading-relaxed ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}>
                                  {task.name}
                                </span>
                                
                                {task.link && task.link !== "#" && (
                                  <a
                                    href={task.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1E88E5] bg-sky-50 border border-sky-200 hover:bg-sky-100 px-2.5 py-0.5 rounded-full self-start sm:self-center transition shrink-0"
                                  >
                                    <span>{task.source}</span>
                                    <ExternalLink size={9} />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Dynamic final milestones / Placement Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center max-w-lg mx-auto space-y-3 shadow-xs">
          <Award size={35} className="mx-auto text-emerald-500 animate-bounce" />
          <h3 className="text-lg font-bold font-serif text-[#0b1a36]">Complete {currentPath.title} Pathway</h3>
          <p className="text-xs leading-relaxed text-slate-600">
            Once you check off all milestones for the <strong>{currentPath.title}</strong> path, you unlock verified portfolio projects, simulation trials, and capstone credentials.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate("/trial-mission")}
              className="inline-flex items-center gap-2 rounded-full bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-5 py-2.5 shadow-xs transition cursor-pointer"
            >
              Start Trial Mission
            </button>
            <button
              onClick={() => navigate("/career-reality")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-2.5 shadow-xs transition cursor-pointer"
            >
              Back to Career Reality
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}