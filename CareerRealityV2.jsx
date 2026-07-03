import { ArrowLeft, MessageSquare, Sparkles, Lock, BarChart3, Activity, ShieldCheck, ClipboardCheck, Bolt, Globe2, TrendingUp, CircleDollarSign, Briefcase, Users, Star, BookOpen } from "lucide-react";

const CAREER_TEMPLATES = {
  aiEngineer: {
    title: "AI Engineer",
    description: "Your analytical precision and love for patterns makes you ideal for translating complex data into practical business solutions.",
    matchPercentage: 95,
    alternativeMatches: ["Machine Learning Engineer", "Data Scientist", "Research Scientist", "MLOps Engineer"],
    skillTags: ["Machine Learning", "Python", "Deep Learning", "Data Science", "Model Architecture"],
    workAllocation: [
      { title: "Coding & Implementation", percentage: 40, color: "from-blue-500 to-blue-600", description: "Building models, training pipelines, and writing production-grade code." },
      { title: "Research & Architecture", percentage: 25, color: "from-violet-500 to-fuchsia-500", description: "Evaluating algorithms, prototyping models, and selecting the right architecture." },
      { title: "Data Engineering", percentage: 20, color: "from-emerald-500 to-teal-500", description: "Preparing datasets, cleaning inputs, and validating data quality." },
      { title: "Testing & Collaboration", percentage: 15, color: "from-slate-400 to-slate-500", description: "Reviewing results, documenting experiments, and aligning with stakeholders." },
    ],
    workEnvironment: ["Remote Friendly", "Research-driven", "Cross-functional"],
    stressLevel: "High",
    stressPercent: 72,
    stressDescription: "Fast-moving goals and complex technical tradeoffs mean this role is challenging but rewarding.",
    honestChallenges: [
      { title: "Continuous Learning", description: "You need to keep up with new papers, tools, and frameworks on an ongoing basis.", icon: <Sparkles size={18} className="text-red-600" /> },
      { title: "Data Fatigue", description: "A large portion of work is cleaning and preparing messy, real-world data.", icon: <ClipboardCheck size={18} className="text-red-600" /> },
      { title: "Rapid Change", description: "The field evolves quickly, so adaptability is essential.", icon: <Bolt size={18} className="text-red-600" /> },
    ],
    recommendedLearning: ["Deep Learning Specialization", "fast.ai course", "Kaggle competitions"],
    learningPath: ["Master Python and ML fundamentals", "Build end-to-end AI systems", "Practice model evaluation", "Study recent research papers"],
    educationPathways: ["B.Tech / B.E. in CS", "M.S. in AI/ML", "AI certifications", "Online deep learning programs"],
    coreStrengths: ["Analytical Thinking", "Pattern Recognition", "Problem Solving", "Technical Adaptability"],
    skillGapAnalysis: ["Advanced statistics", "Production ML deployment", "Large-scale model tuning"],
    growthAreas: ["MLOps", "Explainable AI", "Ethical AI"],
    keyMetrics: [
      { label: "Average Salary", value: "₹35 LPA", icon: CircleDollarSign },
      { label: "Demand Growth", value: "21%", icon: TrendingUp },
      { label: "Job Openings", value: "9.6K", icon: Users },
      { label: "Automation Risk", value: "22%", icon: ShieldCheck },
    ],
    careerSnapshot: [
      { label: "Industry", value: "Artificial Intelligence" },
      { label: "Experience Level", value: "Mid-Senior" },
      { label: "Learning Curve", value: "Steep" },
      { label: "Competition", value: "High" },
      { label: "Growth Potential", value: "Strong" },
    ],
    pageHighlights: ["Daily work allocation", "Stress & environment", "Mentor guidance", "Career snapshot"],
    mentor: {
      label: "AI Mentor",
      title: "Always here to guide you",
      quote: "Becoming a strong AI Engineer is about mastering both math and practical systems."
    }
  },
  businessAnalyst: {
    title: "Business Analyst",
    description: "Your ability to translate business problems into data-driven solutions makes this role a strong match.",
    matchPercentage: 92,
    alternativeMatches: ["Data Analyst", "Business Intelligence Analyst", "Product Analyst", "Operations Analyst"],
    skillTags: ["Data Analysis", "Stakeholder Management", "Business Intelligence", "Requirement Gathering", "Reporting"],
    workAllocation: [
      { title: "Data Analysis", percentage: 35, color: "from-blue-500 to-blue-600", description: "Turning raw metrics into meaningful business insights." },
      { title: "Stakeholder Meetings", percentage: 25, color: "from-emerald-500 to-teal-500", description: "Aligning priorities and translating requirements." },
      { title: "Strategy & Reporting", percentage: 20, color: "from-violet-500 to-fuchsia-500", description: "Creating dashboards, business cases, and recommendations." },
      { title: "Documentation", percentage: 20, color: "from-slate-400 to-slate-500", description: "Writing clear briefs, workflows, and process notes." },
    ],
    workEnvironment: ["Client-facing", "Cross-functional", "Strategy oriented"],
    stressLevel: "Moderate",
    stressPercent: 58,
    stressDescription: "Multiple stakeholders and tight timelines create pressure, but the work is highly impactful.",
    honestChallenges: [
      { title: "Ambiguous Requirements", description: "Turning vague goals into clear steps is a constant part of the job.", icon: <Sparkles size={18} className="text-red-600" /> },
      { title: "Data Quality", description: "Missing or inconsistent data slows analysis and reporting.", icon: <ClipboardCheck size={18} className="text-red-600" /> },
      { title: "Stakeholder Alignment", description: "Balancing different priorities is often the hardest part.", icon: <Bolt size={18} className="text-red-600" /> },
    ],
    recommendedLearning: ["Business Analysis Foundations", "Google Data Analytics", "Power BI training"],
    learningPath: ["Learn Excel and BI tools", "Practice stakeholder interviews", "Build reusable reports", "Understand business domains"],
    educationPathways: ["B.Com / BBA", "MBA in Business Analytics", "BI certification", "Business analysis workshops"],
    coreStrengths: ["Structured Thinking", "Communication", "Problem Solving", "Negotiation"],
    skillGapAnalysis: ["Advanced dashboarding", "SQL for analytics", "Process mapping"],
    growthAreas: ["Business strategy", "Product analytics", "Leadership"],
    keyMetrics: [
      { label: "Average Salary", value: "₹18 LPA", icon: CircleDollarSign },
      { label: "Demand Growth", value: "14%", icon: TrendingUp },
      { label: "Job Openings", value: "15.2K", icon: Users },
      { label: "Automation Risk", value: "30%", icon: ShieldCheck },
    ],
    careerSnapshot: [
      { label: "Industry", value: "Business Operations" },
      { label: "Experience Level", value: "Mid" },
      { label: "Learning Curve", value: "Medium" },
      { label: "Competition", value: "Medium" },
      { label: "Growth Potential", value: "Good" },
    ],
    pageHighlights: ["Daily work allocation", "Stress & environment", "Mentor guidance", "Career snapshot"],
    mentor: {
      label: "Business Mentor",
      title: "Your business strategy partner",
      quote: "Great business analysis starts with asking the right questions and making the numbers speak clearly."
    }
  },
  uiUxDesigner: {
    title: "UI/UX Designer",
    description: "Your user empathy and visual problem-solving strengths make this role a natural fit.",
    matchPercentage: 88,
    alternativeMatches: ["Product Designer", "UX Researcher", "Interaction Designer", "Visual Designer"],
    skillTags: ["User Research", "Wireframing", "Prototyping", "Design Systems", "Creative Problem Solving"],
    workAllocation: [
      { title: "User Research", percentage: 30, color: "from-blue-500 to-blue-600", description: "Learning what users need and validating concepts." },
      { title: "Design & Prototyping", percentage: 35, color: "from-violet-500 to-fuchsia-500", description: "Creating wireframes, mockups, and interactive flows." },
      { title: "Testing & Feedback", percentage: 20, color: "from-emerald-500 to-teal-500", description: "Running user tests and refining designs." },
      { title: "Collaboration", percentage: 15, color: "from-slate-400 to-slate-500", description: "Working with product, engineering, and marketing teams." },
    ],
    workEnvironment: ["Creative studio", "User-centered", "Collaborative"],
    stressLevel: "Moderate",
    stressPercent: 52,
    stressDescription: "Frequent critiques and changing product direction are normal, but the work is very creative.",
    honestChallenges: [
      { title: "Design Iteration", description: "You may revisit designs multiple times before landing on the best solution.", icon: <Sparkles size={18} className="text-red-600" /> },
      { title: "User Feedback", description: "Different users and stakeholders often have conflicting opinions.", icon: <ClipboardCheck size={18} className="text-red-600" /> },
      { title: "Polished Delivery", description: "High visual standards mean attention to detail is essential.", icon: <Bolt size={18} className="text-red-600" /> },
    ],
    recommendedLearning: ["Interaction Design Foundation", "Figma advanced tutorials", "UX research courses"],
    learningPath: ["Learn user research methods", "Build wireframes and prototypes", "Run usability tests", "Create a design portfolio"],
    educationPathways: ["B.Des / BFA", "UX bootcamps", "Human-centered design certificates", "Mentorship programs"],
    coreStrengths: ["Empathy", "Visual Communication", "Problem Framing", "Collaboration"],
    skillGapAnalysis: ["Design systems", "User testing", "Prototyping motion"],
    growthAreas: ["Service design", "Design leadership", "Inclusive design"],
    keyMetrics: [
      { label: "Average Salary", value: "₹14 LPA", icon: CircleDollarSign },
      { label: "Demand Growth", value: "16%", icon: TrendingUp },
      { label: "Job Openings", value: "8.1K", icon: Users },
      { label: "Automation Risk", value: "18%", icon: ShieldCheck },
    ],
    careerSnapshot: [
      { label: "Industry", value: "Design & Experience" },
      { label: "Experience Level", value: "Mid" },
      { label: "Learning Curve", value: "Medium" },
      { label: "Competition", value: "High" },
      { label: "Growth Potential", value: "Strong" },
    ],
    pageHighlights: ["Daily work allocation", "Stress & environment", "Mentor guidance", "Career snapshot"],
    mentor: {
      label: "Design Mentor",
      title: "Your guide through product experiences",
      quote: "Great design starts with understanding people, then creating interfaces that feel effortless."
    }
  },
  cyberSecurityAnalyst: {
    title: "Cyber Security Analyst",
    description: "Your attention to detail and risk-focused mindset make you ideal for defending systems and responding to threats.",
    matchPercentage: 90,
    alternativeMatches: ["Security Engineer", "Threat Analyst", "SOC Analyst", "Risk Analyst"],
    skillTags: ["Threat Detection", "Network Security", "Risk Analysis", "Incident Response", "Security Operations"],
    workAllocation: [
      { title: "Monitoring & Detection", percentage: 35, color: "from-blue-500 to-blue-600", description: "Tracking alerts, logs, and suspicious activity." },
      { title: "Investigation", percentage: 25, color: "from-violet-500 to-fuchsia-500", description: "Analyzing incidents and tracing attack paths." },
      { title: "Compliance", percentage: 20, color: "from-emerald-500 to-teal-500", description: "Ensuring security policies and controls are followed." },
      { title: "Improvement Planning", percentage: 20, color: "from-slate-400 to-slate-500", description: "Enhancing defenses and updating response plans." },
    ],
    workEnvironment: ["Security operations", "High-alert", "Team-based"],
    stressLevel: "High",
    stressPercent: 68,
    stressDescription: "Urgent incidents and high stakes make this role intense, but it is very impactful.",
    honestChallenges: [
      { title: "Threat Volume", description: "There is usually more to investigate than time allows.", icon: <Sparkles size={18} className="text-red-600" /> },
      { title: "Complex Tools", description: "Security platforms and logs can be overwhelming at first.", icon: <ClipboardCheck size={18} className="text-red-600" /> },
      { title: "High Stakes", description: "A single oversight can have serious consequences.", icon: <Bolt size={18} className="text-red-600" /> },
    ],
    recommendedLearning: ["CompTIA Security+", "Certified Ethical Hacker", "MITRE ATT&CK training"],
    learningPath: ["Build security fundamentals", "Learn SIEM tools", "Practice incident response", "Map threat patterns"],
    educationPathways: ["B.Tech in CS", "Cybersecurity diploma", "CEH or CISSP", "Red team workshops"],
    coreStrengths: ["Attention to Detail", "Risk Awareness", "Technical Investigation", "Persistence"],
    skillGapAnalysis: ["Cloud security", "Forensics", "Intrusion analysis"],
    growthAreas: ["Security architecture", "Threat intelligence", "Compliance leadership"],
    keyMetrics: [
      { label: "Average Salary", value: "₹22 LPA", icon: CircleDollarSign },
      { label: "Demand Growth", value: "19%", icon: TrendingUp },
      { label: "Job Openings", value: "7.4K", icon: Users },
      { label: "Automation Risk", value: "25%", icon: ShieldCheck },
    ],
    careerSnapshot: [
      { label: "Industry", value: "Cybersecurity" },
      { label: "Experience Level", value: "Mid" },
      { label: "Learning Curve", value: "Steep" },
      { label: "Competition", value: "Medium" },
      { label: "Growth Potential", value: "Very Strong" },
    ],
    pageHighlights: ["Daily work allocation", "Stress & environment", "Mentor guidance", "Career snapshot"],
    mentor: {
      label: "Security Mentor",
      title: "Here to help you secure systems",
      quote: "Strong security work comes from discipline, persistence, and understanding attacker behavior."
    }
  }
};

function parseSavedProfile() {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem("clear-careers-generated-profile");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function normalizeString(value) {
  return String(value || "").trim().toLowerCase();
}

function selectCareerKeyFromProfile(profile) {
  if (!profile) return null;
  const candidate = profile?.suggested_careers?.[0]?.title || profile?.top_match || profile?.topMatch || profile?.area_of_interest || profile?.areaOfInterest || profile?.subjects?.[0] || profile?.passions?.[0];
  const text = normalizeString(candidate);
  if (!text) return null;
  if (text.includes("cyber") || text.includes("security") || text.includes("risk")) return "cyberSecurityAnalyst";
  if (text.includes("design") || text.includes("ux") || text.includes("ui") || text.includes("creative")) return "uiUxDesigner";
  if (text.includes("business") || text.includes("analytics") || text.includes("analysis") || text.includes("management")) return "businessAnalyst";
  if (text.includes("ai") || text.includes("machine") || text.includes("learning") || text.includes("data")) return "aiEngineer";
  return null;
}

function getCareerKeyFromUrl() {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("career") || params.get("topMatch") || params.get("role");
    const text = normalizeString(query);
    if (!text) return null;
    if (text.includes("cyber") || text.includes("security") || text.includes("risk")) return "cyberSecurityAnalyst";
    if (text.includes("design") || text.includes("ux") || text.includes("ui") || text.includes("creative")) return "uiUxDesigner";
    if (text.includes("business") || text.includes("analytics") || text.includes("analysis") || text.includes("management")) return "businessAnalyst";
    if (text.includes("ai") || text.includes("machine") || text.includes("learning") || text.includes("data")) return "aiEngineer";
  } catch {
    return null;
  }
  return null;
}

function getDynamicCareerData() {
  const profile = parseSavedProfile();
  const profileKey = selectCareerKeyFromProfile(profile);
  if (profileKey && CAREER_TEMPLATES[profileKey]) return CAREER_TEMPLATES[profileKey];
  const urlKey = getCareerKeyFromUrl();
  if (urlKey && CAREER_TEMPLATES[urlKey]) return CAREER_TEMPLATES[urlKey];
  return CAREER_TEMPLATES.aiEngineer;
}

export default function CareerRealityV2({ onBack }) {
  const career = getDynamicCareerData();
  const {
    title,
    description,
    matchPercentage,
    alternativeMatches,
    skillTags,
    workAllocation,
    workEnvironment,
    stressLevel,
    stressPercent,
    stressDescription,
    honestChallenges,
    keyMetrics,
    careerSnapshot,
    coreStrengths,
    skillGapAnalysis,
    growthAreas,
    recommendedLearning,
    learningPath,
    educationPathways,
    pageHighlights,
    mentor,
  } = career;

  const quickNavItems = [
    { title: "Career DNA", icon: Globe2 },
    { title: "Skill Gap Analysis", icon: ShieldCheck },
    { title: "Growth Areas", icon: TrendingUp },
    { title: "Recommended Learning", icon: BookOpen },
    { title: "Career Fit Report", icon: Briefcase },
  ];

  return (
    <section className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#d2d9ea] bg-white px-4 py-2 text-sm font-semibold text-[#3d4f71] transition hover:bg-[#eef2f8]"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.7fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.08)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#eef5ff] text-4xl shadow-sm">🤖</div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#4f6d97]">Career Reality Check</p>
                    <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#0f2140] sm:text-4xl">{title}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#52617a] sm:text-base">{description}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <span className="rounded-full bg-[#eef5ff] px-3 py-2 text-sm font-semibold text-[#2f4b9f]">Match {matchPercentage}%</span>
                      {skillTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#f3f7ff] px-3 py-2 text-xs font-semibold text-[#3a5be3]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-[#e6ebf4] bg-[#fbfcff] px-5 py-4 text-sm text-[#425672] shadow-sm sm:w-80">
                  <p className="font-semibold uppercase tracking-[0.2em] text-[#556987]">On this page</p>
                  <ul className="mt-4 space-y-3 text-sm text-[#4a5f7f]">
                    {pageHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#556987]">Alternative matches</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {alternativeMatches.map((match) => (
                        <span key={match} className="rounded-full bg-[#eef5ff] px-3 py-2 text-xs font-semibold text-[#2f4b9f]">{match}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Daily Work Allocation</p>
                  <h2 className="mt-3 text-2xl font-bold text-[#10213f]">What a typical day looks like</h2>
                </div>
                <span className="rounded-full bg-[#eef3ff] px-4 py-2 text-sm font-semibold text-[#2f4b9f]">Balanced distribution</span>
              </div>
              <div className="mt-8 space-y-6">
                {workAllocation.map((item) => (
                  <div key={item.title} className="space-y-4 rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base font-semibold text-[#10213f]">{item.title}</h3>
                      <span className="text-sm font-semibold text-[#10213f]">{item.percentage}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#e7eefb]">
                      <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                    <p className="text-sm leading-6 text-[#5a718f]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-red-100 bg-[#fff1f1] p-6 shadow-[0_20px_50px_rgba(209,63,78,0.08)] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9f2733]">Honest Challenges</p>
                  <h2 className="mt-3 text-2xl font-bold text-[#10213f]">What makes this role tough?</h2>
                </div>
                <div className="rounded-full bg-[#fde8ea] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#c72639]">Real talk</div>
              </div>
              <div className="mt-6 grid gap-4">
                {honestChallenges.map((challenge) => (
                  <div key={challenge.title} className="flex items-start gap-4 rounded-[20px] border border-[#ffe5e7] bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#feeaea] text-red-600">{challenge.icon}</div>
                    <div>
                      <h3 className="text-base font-semibold text-[#10213f]">{challenge.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#5a718f]">{challenge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Feeling aligned?</p>
                  <h2 className="mt-3 text-2xl font-bold text-[#10213f]">See the roadmap required to reach this destination.</h2>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-[#2f5fde] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(47,93,222,0.22)] transition hover:bg-[#244cc1]">
                  View Roadmap
                  <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Learning Path</p>
                  <ul className="mt-4 space-y-3 text-sm text-[#4a5f7f]">
                    {learningPath.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Education Pathways</p>
                  <ul className="mt-4 space-y-3 text-sm text-[#4a5f7f]">
                    {educationPathways.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Skill Gap Analysis</p>
                  <ul className="mt-4 space-y-3 text-sm text-[#4a5f7f]">
                    {skillGapAnalysis.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Growth Areas</p>
                  <ul className="mt-4 space-y-3 text-sm text-[#4a5f7f]">
                    {growthAreas.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-8 rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Recommended Learning</p>
                <ul className="mt-4 space-y-3 text-sm text-[#4a5f7f]">
                  {recommendedLearning.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-8">
            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#f3ecff] text-3xl text-[#6f4de7] shadow-sm">A</div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6a4ee7]">{mentor.label}</p>
                  <h3 className="mt-3 text-xl font-bold text-[#10213f]">{mentor.title}</h3>
                  <p className="mt-4 rounded-[18px] border border-[#ece7ff] bg-[#faf7ff] px-4 py-4 text-sm leading-6 text-[#4f5e89]">
                    “{mentor.quote}”
                  </p>
                  <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6f4ee7] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(111,78,231,0.22)] transition hover:bg-[#593cd8]">
                    <MessageSquare size={16} />
                    Start Chat
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6a4ee7]">Quick Navigation</p>
              <h3 className="mt-3 text-xl font-bold text-[#10213f]">Quick Navigation</h3>
              <div className="mt-6 space-y-3">
                {quickNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-[18px] border border-[#eef2f8] bg-[#f8f9ff] px-4 py-3 text-left text-sm font-medium text-[#324169] transition hover:border-[#dbe2ef] hover:bg-white"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eef5ff] text-[#5f6fc6] shadow-sm">
                        <Icon size={18} />
                      </span>
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Stress Level</p>
                  <h3 className="mt-3 text-xl font-bold text-[#10213f]">{stressLevel}</h3>
                </div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#eef3ff]">
                  <div className="absolute inset-0 rounded-full bg-[#e4ecfb]" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-r from-[#6f4ee7] to-[#3a5be3]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 50% 50%, 50% 100%, 0% 100%)' }} />
                  <div className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-center text-sm font-bold text-[#10213f]">{stressPercent}%</div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#5a718f]">{stressDescription}</p>
            </div>

            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Work Environment</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {workEnvironment.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#eef3ff] px-3.5 py-2 text-sm font-semibold text-[#2f4b9f]">{tag}</span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Key Metrics</p>
                <ShieldCheck size={18} className="text-[#6a4ee7]" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {keyMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="rounded-[20px] border border-[#eef2f8] bg-[#f8faff] p-4">
                      <div className="flex items-center gap-3 text-[#304b81]">
                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#3a5be3] shadow-sm">
                          <Icon size={18} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#10213f]">{metric.label}</p>
                          <p className="mt-1 text-xl font-bold text-[#10213f]">{metric.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#dbe2ef] bg-white p-6 shadow-[0_20px_50px_rgba(15,35,80,0.06)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Career Snapshot</p>
              <div className="mt-6 space-y-4">
                {careerSnapshot.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-[18px] border border-[#eef2f8] bg-[#f9fbff] px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-[#10213f]">{item.label}</p>
                      <p className="mt-1 text-sm text-[#5a718f]">{item.value}</p>
                    </div>
                    <div className="rounded-full bg-[#eef3ff] px-3 py-2 text-xs font-semibold text-[#2f4b9f]">View</div>
                  </div>
                ))}
              </div>
              {coreStrengths.length > 0 && (
                <div className="mt-6 rounded-[20px] border border-[#eef2f8] bg-[#fbfcff] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f6d97]">Core Strengths</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {coreStrengths.map((strength) => (
                      <span key={strength} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#3a5be3]">{strength}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
