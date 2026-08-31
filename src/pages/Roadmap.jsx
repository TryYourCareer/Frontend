import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  ExternalLink,
  Sliders,
  Compass,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ROADMAP_DATA = {
  aiEngineer: {
    title: "AI Engineer",
    category: "Technology",
    summary:
      "Learn mathematical modeling, statistical learning, neural architectures, and model training to build intelligent systems.",
    difficulty: "Advanced",
    duration: "6-8 Months",
    color: "from-cyan-500 to-blue-600",
    pillColor:
      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-800",
    steps: [
      {
        title: "Step 1: Mathematical Foundations",
        description:
          "Master the essential linear algebra, calculus, and probability concepts required to understand machine learning models.",
        tasks: [
          {
            name: "Linear Algebra: Matrices, vectors, eigenvalues & eigenvectors",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/linear-algebra/",
          },
          {
            name: "Multivariable Calculus: Gradients, partial derivatives, chain rule",
            source: "Khan Academy",
            link: "#",
          },
          {
            name: "Probability & Statistics: Distributions, Bayes Theorem, PDF/CDF",
            source: "W3Schools",
            link: "https://www.w3schools.com/statistics/",
          },
        ],
        estimatedTime: "4 Weeks",
      },
      {
        title: "Step 2: Python Programming & Data Manipulation",
        description:
          "Get comfortable writing optimized Python scripts, handling files, and plotting complex datasets.",
        tasks: [
          {
            name: "Python Core: Data structures, OOP, file handling, generators",
            source: "W3Schools",
            link: "https://www.w3schools.com/python/",
          },
          {
            name: "Data Manipulation: Pandas arrays, NumPy matrix calculations",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/pandas-tutorial/",
          },
          {
            name: "Data Visualization: Matplotlib and Seaborn dashboards",
            source: "W3Schools",
            link: "https://www.w3schools.com/python/python_matplotlib.asp",
          },
        ],
        estimatedTime: "4 Weeks",
      },
      {
        title: "Step 3: Classical Machine Learning Models",
        description:
          "Build supervised and unsupervised statistical models from scratch using Scikit-Learn.",
        tasks: [
          {
            name: "Regression Models: Linear, logistic, ridge & lasso",
            source: "W3Schools",
            link: "https://www.w3schools.com/python/python_ml_linear_regression.asp",
          },
          {
            name: "Tree-based Algorithms: Decision Trees, Random Forests, XGBoost",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/decision-tree/",
          },
          {
            name: "Clustering & Dim Reduction: K-Means, PCA, t-SNE",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/k-means-clustering-introduction/",
          },
        ],
        estimatedTime: "6 Weeks",
      },
      {
        title: "Step 4: Deep Learning & Neural Networks",
        description:
          "Understand neural backpropagation and implement feed-forward networks using PyTorch or TensorFlow.",
        tasks: [
          {
            name: "Neural Networks: Backprop, activation functions, loss functions",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/artificial-neural-networks/",
          },
          {
            name: "Computer Vision: Convolutional Neural Networks (CNNs), ResNet",
            source: "PyTorch Tutorials",
            link: "#",
          },
          {
            name: "NLP & Transformers: Recurrent Nets, Attention mechanism, BERT",
            source: "HuggingFace Course",
            link: "#",
          },
        ],
        estimatedTime: "8 Weeks",
      },
      {
        title: "Step 5: MLOps & Model Deployment",
        description:
          "Deploy trained models to production servers and manage pipeline monitoring.",
        tasks: [
          {
            name: "Containerization: Build model deployment containers with Docker",
            source: "W3Schools",
            link: "https://www.w3schools.com/aws/",
          },
          {
            name: "Model Hosting: Deploy FastAPI servers on AWS or GCP EC2 instances",
            source: "AWS Academy",
            link: "#",
          },
          {
            name: "Monitoring: MLflow tracking and pipeline instrumentation",
            source: "GeeksforGeeks",
            link: "#",
          },
        ],
        estimatedTime: "4 Weeks",
      },
    ],
  },
  businessAnalyst: {
    title: "Business Analyst",
    category: "Business",
    summary:
      "Coordinate between stakeholders and development teams using agile modeling, requirements analysis, and dashboarding.",
    difficulty: "Beginner-Intermediate",
    duration: "4-5 Months",
    color: "from-blue-500 to-indigo-650",
    pillColor:
      "bg-blue-50 text-blue-700 border-blue-205 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
    steps: [
      {
        title: "Step 1: Excel & SQL Data Querying",
        description:
          "Master structured reporting tools, database queries, and conditional functions.",
        tasks: [
          {
            name: "Excel Mastery: VLOOKUP, INDEX/MATCH, Pivot Tables, Solver",
            source: "W3Schools",
            link: "https://www.w3schools.com/excel/",
          },
          {
            name: "SQL Basics: Queries, JOINS, filters, subqueries, group by",
            source: "W3Schools",
            link: "https://www.w3schools.com/sql/",
          },
          {
            name: "Data Warehousing: Star vs Snowflake schemas",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/star-schema-in-data-warehouse/",
          },
        ],
        estimatedTime: "4 Weeks",
      },
      {
        title: "Step 2: Business Intelligence & Data Viz",
        description:
          "Design reports, track key performance indicators, and build interactive stakeholder dashboards.",
        tasks: [
          {
            name: "Power BI / Tableau: Interactive reporting & data connections",
            source: "W3Schools",
            link: "https://www.w3schools.com/powerbi/",
          },
          {
            name: "Metric Modeling: Defining North Star metrics, KPIs, retention metrics",
            source: "GeeksforGeeks",
            link: "#",
          },
        ],
        estimatedTime: "4 Weeks",
      },
      {
        title: "Step 3: Agile Methodologies & Project Modeling",
        description:
          "Document business specifications, create wireframes, and model workflow diagrams using UML/BPMN.",
        tasks: [
          {
            name: "UML Modeling: Use Cases, Activity Diagrams, Sequence Diagrams",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/unified-modeling-language-uml-introduction/",
          },
          {
            name: "Agile Planning: Product backlog management, writing user stories",
            source: "Atlassian Guide",
            link: "#",
          },
        ],
        estimatedTime: "5 Weeks",
      },
    ],
  },
  uiUxDesigner: {
    title: "UI/UX Designer",
    category: "Design",
    summary:
      "Establish user empathy, build visual architectures, wireframe interactions, and run validation usability trials.",
    difficulty: "Beginner-Intermediate",
    duration: "4-6 Months",
    color: "from-purple-500 to-pink-600",
    pillColor:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800",
    steps: [
      {
        title: "Step 1: Design Principles & Foundations",
        description:
          "Learn visual balance, typography rules, color matching, and interface spacing systems.",
        tasks: [
          {
            name: "Visual Grammar: Contrast, repetition, alignment, proximity",
            source: "W3Schools",
            link: "https://www.w3schools.com/graphics/",
          },
          {
            name: "Typography: Hierarchy, font scaling, readability rules",
            source: "Google Fonts Guide",
            link: "#",
          },
          {
            name: "Color Science: Palettes, emotional response, contrast ratios",
            source: "GeeksforGeeks",
            link: "#",
          },
        ],
        estimatedTime: "3 Weeks",
      },
      {
        title: "Step 2: UX Research & User Journey Map",
        description:
          "Formulate user interview scripts, build personas, and diagram user flows.",
        tasks: [
          {
            name: "User Research: Empathy maps, quantitative vs qualitative trials",
            source: "Nielsen Norman Group",
            link: "#",
          },
          {
            name: "Information Architecture: Card sorting, site map building",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/information-architecture-in-ux-design/",
          },
        ],
        estimatedTime: "4 Weeks",
      },
      {
        title: "Step 3: Interface Prototyping (Figma)",
        description:
          "Design high-fidelity interactive wireframes, component design systems, and auto-layouts.",
        tasks: [
          {
            name: "Figma Fundamentals: Vector tools, constraints, auto-layouts",
            source: "Figma Academy",
            link: "#",
          },
          {
            name: "Design System: Reusable button components, input variants",
            source: "GeeksforGeeks",
            link: "#",
          },
        ],
        estimatedTime: "6 Weeks",
      },
    ],
  },
  cyberSecurityAnalyst: {
    title: "Cyber Security Analyst",
    category: "Security",
    summary:
      "Configure firewall routing, run network scans, analyze incident reports, and design zero-trust networks.",
    difficulty: "Advanced",
    duration: "6-7 Months",
    color: "from-red-500 to-rose-600",
    pillColor:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800",
    steps: [
      {
        title: "Step 1: Networks & Operating System Basics",
        description:
          "Master TCP/IP architectures, router subnets, dns servers, and Linux shell commands.",
        tasks: [
          {
            name: "Networking Fundamentals: OSI model, subnet masking, ports",
            source: "W3Schools",
            link: "https://www.w3schools.com/cybersecurity/cybersecurity_networks.php",
          },
          {
            name: "Linux Administration: File permissions, process monitoring, grep",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/linux-commands/",
          },
        ],
        estimatedTime: "4 Weeks",
      },
      {
        title: "Step 2: Penetration Testing & Cryptography",
        description:
          "Identify vulnerabilities in mock systems and understand symmetric/asymmetric data cyphers.",
        tasks: [
          {
            name: "Scanning Tools: Port discovery scanning with Nmap",
            source: "Nmap Docs",
            link: "#",
          },
          {
            name: "OWASP Top 10: SQL injection, cross-site scripting (XSS)",
            source: "W3Schools",
            link: "https://www.w3schools.com/cybersecurity/cybersecurity_vulnerabilities.php",
          },
        ],
        estimatedTime: "6 Weeks",
      },
    ],
  },
  dataScientist: {
    title: "Data Scientist",
    category: "Technology",
    summary:
      "Extract metrics, design experimental A/B testing trials, and structure automated statistical pipelines.",
    difficulty: "Intermediate-Advanced",
    duration: "5-6 Months",
    color: "from-emerald-500 to-teal-650",
    pillColor:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
    steps: [
      {
        title: "Step 1: SQL & Relational Databases",
        description:
          "Write aggregation queries and optimize indices to manipulate massive tabular databases.",
        tasks: [
          {
            name: "SQL Intermediate: Subqueries, common table expressions, Window functions",
            source: "W3Schools",
            link: "https://www.w3schools.com/sql/",
          },
          {
            name: "Database Design: Primary keys, index optimizations",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/sql-indexes/",
          },
        ],
        estimatedTime: "3 Weeks",
      },
      {
        title: "Step 2: Statistical Modeling & A/B Testing",
        description:
          "Validate hypotheses, model outcomes, and structure statistical trial matrices.",
        tasks: [
          {
            name: "Hypothesis Testing: T-tests, Z-tests, ANOVA validation",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/t-test/",
          },
          {
            name: "A/B Testing: Defining sample size, control groups, significance ratio",
            source: "W3Schools",
            link: "#",
          },
        ],
        estimatedTime: "5 Weeks",
      },
    ],
  },
  softwareEngineer: {
    title: "Software Engineer",
    category: "Technology",
    summary:
      "Master algorithms, object-oriented design, client-server connections, and cloud deployment pipelines.",
    difficulty: "Intermediate",
    duration: "6 Months",
    color: "from-blue-600 to-indigo-650",
    pillColor:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
    steps: [
      {
        title: "Step 1: Programming & DSA Core",
        description:
          "Learn data structures, memory layouts, complexity analysis (Big O), and basic algorithms.",
        tasks: [
          {
            name: "Data Structures: Arrays, Linked Lists, Stacks, Queues, Hash Tables",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/data-structures/",
          },
          {
            name: "Sorting & Searching: Bubble sort, Quick sort, Binary search",
            source: "W3Schools",
            link: "https://www.w3schools.com/dsa/",
          },
        ],
        estimatedTime: "5 Weeks",
      },
      {
        title: "Step 2: Client-Server & API Integration",
        description:
          "Build clean RESTful APIs, manage CORS headers, and fetch data in client pages.",
        tasks: [
          {
            name: "Node.js & Express: Routing, middleware, databases integration",
            source: "W3Schools",
            link: "https://www.w3schools.com/nodejs/",
          },
          {
            name: "REST APIs: HTTP verbs, request/response headers, JSON models",
            source: "GeeksforGeeks",
            link: "https://www.geeksforgeeks.org/rest-api-introduction/",
          },
        ],
        estimatedTime: "6 Weeks",
      },
    ],
  },
};

export default function Roadmap() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get pre-selected pathway from URL params
  const defaultPathway = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const p = params.get("career") || params.get("path");
    return ROADMAP_DATA[p] ? p : "aiEngineer";
  }, [location]);

  const [activePathway, setActivePathway] = useState(defaultPathway);
  const [completedTasks, setCompletedTasks] = useState({});

  const currentPath = ROADMAP_DATA[activePathway];

  const handleToggleTask = (stepIndex, taskIndex) => {
    const key = `${activePathway}-${stepIndex}-${taskIndex}`;
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const currentPathTotalTasks = useMemo(() => {
    return currentPath.steps.reduce((acc, step) => acc + step.tasks.length, 0);
  }, [currentPath]);

  const currentPathCompletedTasksCount = useMemo(() => {
    let count = 0;
    currentPath.steps.forEach((step, sIdx) => {
      step.tasks.forEach((_, tIdx) => {
        const key = `${activePathway}-${sIdx}-${tIdx}`;
        if (completedTasks[key]) count++;
      });
    });
    return count;
  }, [currentPath, activePathway, completedTasks]);

  const progressPercent = useMemo(() => {
    if (currentPathTotalTasks === 0) return 0;
    return Math.round(
      (currentPathCompletedTasksCount / currentPathTotalTasks) * 100
    );
  }, [currentPathTotalTasks, currentPathCompletedTasksCount]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-6 py-8 sm:px-10 lg:px-12 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumbs Navigation */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          <span
            className="cursor-pointer hover:text-slate-900 transition"
            onClick={() => navigate("/dashboard")}
          >
            Home
          </span>
          <ChevronRight size={10} className="text-slate-400" />
          <span
            className="cursor-pointer hover:text-slate-900 transition"
            onClick={() => navigate("/career-reality")}
          >
            Matches
          </span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-[#0b1a36] font-bold">Roadmaps</span>
          <ChevronRight size={10} className="text-slate-400" />
          <span className="text-[#0b1a36] font-bold">{currentPath.title}</span>
        </nav>

        {/* Header block */}
        <div className="flex flex-col gap-5 rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E88E5]">
                <Compass size={13} className="animate-spin" />
                Interactive Curated Learning Roadmap
              </span>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0b1a36] sm:text-4xl">
                Career Roadmap Pathways
              </h1>
              <p className="max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                Navigate your path from initial foundation modules up to advanced models and certifications. Check off milestones as you build your career portfolio.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/career-reality")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50 shrink-0 self-start"
            >
              <ArrowLeft size={14} />
              Reality Board
            </button>
          </div>

          {/* Pathway Selector */}
          <div className="border-t border-slate-100 pt-5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
              Select Your Target Career Path
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ROADMAP_DATA).map(([key, data]) => {
                const isActive = activePathway === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActivePathway(key)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition shadow-xs ${
                      isActive
                        ? "bg-[#0b1a36] text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {data.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected pathway detail banner */}
        <div className="rounded-3xl border border-[#0b1a36] bg-[#0b1a36] p-6 text-white shadow-md sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
              {currentPath.category} Track
            </span>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
              {currentPath.title} Syllabus
            </h2>
            <p className="max-w-2xl text-xs leading-relaxed text-[#dce4ff]">
              {currentPath.summary}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200 pt-2">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-sky-400" /> Duration: {currentPath.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Sliders size={13} className="text-sky-400" /> Difficulty: {currentPath.difficulty}
              </span>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="shrink-0 flex items-center gap-4 bg-white/10 border border-white/15 rounded-3xl p-4 md:w-60 justify-center">
            <div className="relative h-14 w-14 grid place-items-center">
              <svg
                className="absolute inset-0 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-white/15"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-sky-400"
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
              <span className="text-xs font-black text-white">{progressPercent}%</span>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">
                Overall Progress
              </p>
              <p className="text-xs font-bold mt-0.5 text-white">
                {currentPathCompletedTasksCount} / {currentPathTotalTasks} Milestones
              </p>
            </div>
          </div>
        </div>

        {/* Roadmap steps flow */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#D3E3F5]">
          <AnimatePresence mode="popLayout">
            {currentPath.steps.map((step, sIdx) => {
              const completedInStep = step.tasks.filter(
                (_, tIdx) => completedTasks[`${activePathway}-${sIdx}-${tIdx}`]
              ).length;
              const isStepCompleted = completedInStep === step.tasks.length;

              return (
                <motion.div
                  key={`${activePathway}-${sIdx}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: sIdx * 0.05,
                  }}
                  className="relative group"
                >
                  {/* Step Connector Indicator Dot */}
                  <div
                    className={`absolute -left-[27px] sm:-left-[31px] top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 transition-all z-10 ${
                      isStepCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                        : completedInStep > 0
                        ? "bg-[#0b1a36] border-[#0b1a36] text-white"
                        : "bg-white border-[#D3E3F5] text-slate-500 group-hover:border-[#0b1a36]"
                    }`}
                  >
                    {isStepCompleted ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <span className="text-[10px] font-black">{sIdx + 1}</span>
                    )}
                  </div>

                  {/* Step Card Content */}
                  <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E88E5]">
                          Stage {sIdx + 1}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-slate-900 mt-1">
                          {step.title}
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-[#F0F6FC] border border-[#D3E3F5] rounded-full px-2.5 py-1 self-start sm:self-auto">
                        <Clock size={10} className="text-[#1E88E5]" /> {step.estimatedTime}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600 mb-4">
                      {step.description}
                    </p>

                    {/* Task checklist */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Learning milestones:
                      </p>
                      <div className="grid gap-2">
                        {step.tasks.map((task, tIdx) => {
                          const taskKey = `${activePathway}-${sIdx}-${tIdx}`;
                          const isDone = completedTasks[taskKey];

                          return (
                            <div
                              key={tIdx}
                              onClick={() => handleToggleTask(sIdx, tIdx)}
                              className={`flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition-all duration-200 ${
                                isDone
                                  ? "bg-emerald-50/50 border-emerald-200 text-slate-800"
                                  : "bg-[#F0F6FC] border-[#D3E3F5] hover:bg-white text-slate-700 hover:border-slate-300 shadow-2xs"
                              }`}
                            >
                              <button
                                type="button"
                                className="mt-0.5 text-slate-400 focus:outline-none shrink-0"
                              >
                                {isDone ? (
                                  <CheckCircle2
                                    size={15}
                                    className="text-emerald-600 fill-emerald-600/10"
                                  />
                                ) : (
                                  <Circle size={15} className="text-slate-300" />
                                )}
                              </button>
                              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span
                                  className={`text-xs font-semibold leading-relaxed ${
                                    isDone
                                      ? "line-through text-slate-400"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {task.name}
                                </span>

                                {task.link && (
                                  <a
                                    href={task.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[9px] font-bold text-[#0b1a36] bg-white border border-[#D3E3F5] hover:bg-[#EAF2FA] px-2.5 py-1 rounded-lg self-start sm:self-center transition shadow-2xs"
                                  >
                                    <span>{task.source} Tutorial</span>
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

        {/* Placement / Certificate Card */}
        <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <Award size={36} className="mx-auto text-emerald-500 animate-bounce" />
          <h3 className="font-serif text-lg font-bold text-slate-900">
            Complete Pathway Certification
          </h3>
          <p className="text-xs leading-relaxed text-slate-600">
            Once you check off all milestones for the <strong>{currentPath.title}</strong> path, you will unlock the graduation capstone challenge and receive your customized verified completion badge!
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/career-reality")}
              className="inline-flex items-center gap-2 rounded-full bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold text-xs px-5 py-2.5 shadow-xs transition"
            >
              Return to Reality Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}