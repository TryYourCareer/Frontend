import { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  Clock, 
  ExternalLink, 
  Tag, 
  ArrowLeft, 
  Building, 
  Calendar, 
  Share2, 
  BookOpen, 
  GraduationCap, 
  Briefcase 
} from "lucide-react";

import { isFirebaseReady, saveDocument, getDocuments } from "../utils/supabaseStorage";
import BACKEND_BASE_URL from "../API/BaseURL";

const API_BASE_URL = BACKEND_BASE_URL;

// Stage mapping
const STAGES = ["School", "Undergrad", "Professional"];

// The 4 REAL Backend Insight Types
const INSIGHT_TYPES = [
  { label: "All", value: "All" },
  { label: "News", value: "news" },
  { label: "Opportunity", value: "opportunity" },
  { label: "Skill Trend", value: "skill_trend" },
  { label: "Success Story", value: "success_story" },
];

// Fallback dataset matching backend payload structure
const INITIAL_INSIGHTS = [
  {
    id: "insight-1",
    title: "AI Internship Cohort Open for Engineering Students",
    stage: "Undergrad",
    insight_type: "opportunity",
    source_url: "https://careers.google.com/jobs/results/123456",
    created_at: "2026-04-12T08:30:00.000Z",
    image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
    summary: "Apply now for a 12-week AI internship designed for software engineering learners with a focus on ML product development.",
    content: "This intensive 12-week cohort provides direct access to state-of-the-art machine learning labs. Selected engineering students will collaborate closely with Google research mentors.",
    domain: "Software Engineering",
    actionable: true
  },
  {
    id: "insight-2",
    title: "MIT announces new scholarship for tech-focused first-year students",
    stage: "Undergrad",
    insight_type: "opportunity",
    source_url: "https://news.mit.edu/2026/scholarship-first-year-students",
    created_at: "2026-04-10T06:15:00.000Z",
    image_url: "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=900&q=80",
    summary: "A fresh scholarship fund for students pursuing computer science, AI, and UX design studies is now accepting applications.",
    content: "A significant multi-million dollar endowment fund has been launched to support incoming freshmen aiming for high-impact computer science fields.",
    domain: "Technology & Digital",
    actionable: true
  },
  {
    id: "insight-3",
    title: "High School Summer Coding & STEM Bootcamp Registration",
    stage: "School",
    insight_type: "news",
    source_url: "https://techcrunch.com/2026/04/high-school-stem-bootcamp",
    created_at: "2026-04-05T18:50:00.000Z",
    image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80",
    summary: "A new track of basic development tools is helping secondary school students discover foundational software engineering metrics early.",
    content: "Geared entirely towards high school juniors and seniors, this interactive program lays down core full-stack paradigms.",
    domain: "Computer Science",
    actionable: false
  },
  {
    id: "insight-4",
    title: "Backend Engineering Teams Increasing Demand for LLM Tooling Skills",
    stage: "Professional",
    insight_type: "skill_trend",
    source_url: "https://www.hiringlab.org/insights/backend-llm-skills-2026",
    created_at: "2026-03-28T07:45:00.000Z",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    summary: "Job postings mentioning LLM tooling alongside core backend infrastructure designs have surged significantly this quarter.",
    content: "Seeking candidates with 4+ years of hands-on platform engineering experience. Roles focus heavily on microservices optimization and distributed systems.",
    domain: "Backend Development",
    actionable: false
  }
];

// Badge styles mapped directly to backend insight_type
const badgeStyles = {
  news: "bg-blue-50 text-blue-600 border border-blue-100",
  opportunity: "bg-green-50 text-green-700 border border-green-100",
  skill_trend: "bg-purple-50 text-purple-700 border border-purple-100",
  success_story: "bg-amber-50 text-amber-700 border border-amber-100",
};

// Friendly badge labels
const badgeLabels = {
  news: "NEWS",
  opportunity: "OPPORTUNITY",
  skill_trend: "SKILL TREND",
  success_story: "SUCCESS STORY",
};

// Computes "X days ago" from created_at timestamp
function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const diffSeconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (diffSeconds < 60) return "Just now";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

// Extracts display name from source_url
function extractDomainName(url) {
  if (!url) return "Source";
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return "Source";
  }
}

export default function InsightsFeed({ onBack }) {
  const [insights, setInsights] = useState(INITIAL_INSIGHTS);
  const [activeStage, setActiveStage] = useState("Undergrad");
  const [activeInsightType, setActiveInsightType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState(null);

  useEffect(() => {
    const cachedPayload = localStorage.getItem("clearcareers-insights-cache");
    const cachedTimestamp = localStorage.getItem("clearcareers-insights-ts");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (cachedPayload && cachedTimestamp && now - Number(cachedTimestamp) < oneDay) {
      try {
        setInsights(JSON.parse(cachedPayload));
        setLoading(false);
        return;
      } catch { /* fallback */ }
    }

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/insights`);
        if (!response.ok) throw new Error("Failed to fetch insights");
        const payload = await response.json();
        if (!Array.isArray(payload)) throw new Error("Invalid insights payload");
        setInsights(payload);
        localStorage.setItem("clearcareers-insights-cache", JSON.stringify(payload));
        localStorage.setItem("clearcareers-insights-ts", String(Date.now()));
      } catch {
        setInsights(INITIAL_INSIGHTS);
      } finally {
        setLoading(false);
      }
    };

    const syncInsightsToFirebase = async () => {
      if (!isFirebaseReady) return;
      try {
        await Promise.all(
          INITIAL_INSIGHTS.map((insight) =>
            saveDocument("insightsFeed", insight.id, { ...insight, syncedAt: new Date().toISOString() })
          )
        );
        const fbInsights = await getDocuments("insightsFeed", 50);
        if (fbInsights && fbInsights.length > 0) {
          setInsights(fbInsights);
        }
      } catch { /* ignore */ }
    };

    fetchInsights();
    syncInsightsToFirebase();
  }, []);

  const filteredInsights = useMemo(() => {
    return insights.filter((insight) => {
      // 1. Stage Filter
      const matchesStage = insight.stage === activeStage;

      // 2. Real Backend insight_type Filter
      const matchesType = activeInsightType === "All" || insight.insight_type === activeInsightType;

      // 3. Keyword Search
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        insight.title?.toLowerCase().includes(query) ||
        insight.summary?.toLowerCase().includes(query) ||
        insight.domain?.toLowerCase().includes(query) ||
        insight.source_url?.toLowerCase().includes(query);

      return matchesStage && matchesType && matchesSearch;
    });
  }, [activeStage, activeInsightType, insights, searchQuery]);

  // Full Details View Page
  if (selectedInsight) {
    return (
      <div className="min-h-screen bg-[#FAF6EC] px-4 py-10 font-sans antialiased sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <button 
            onClick={() => setSelectedInsight(null)}
            className="mb-8 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <ArrowLeft size={14} />
            Back to Insights
          </button>

          <div className="relative mb-8 h-64 overflow-hidden rounded-2xl md:h-96">
            <img 
              src={selectedInsight.image_url} 
              alt={selectedInsight.title} 
              className="h-full w-full object-cover" 
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 mb-4">
            <span className={`rounded px-2 py-0.5 uppercase tracking-wide ${badgeStyles[selectedInsight.insight_type] || "bg-gray-100 text-gray-800"}`}>
              {badgeLabels[selectedInsight.insight_type] || selectedInsight.insight_type}
            </span>

            {/* Actionable Indicator */}
            {selectedInsight.actionable && (
              <span className="flex items-center gap-1 text-red-600 font-semibold text-xs">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Actionable
              </span>
            )}

            <div className="flex items-center gap-1">
              <Building size={12} />
              {extractDomainName(selectedInsight.source_url)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              {formatTimeAgo(selectedInsight.created_at)}
            </div>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0f172a] md:text-5xl leading-tight">
            {selectedInsight.title}
          </h1>

          <p className="mt-6 text-sm font-medium leading-relaxed text-gray-600 border-l-4 border-indigo-500 pl-4 bg-gray-50/50 py-3 rounded-r-xl">
            {selectedInsight.summary}
          </p>

          <div className="mt-8 prose prose-slate text-sm leading-relaxed text-gray-700 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Full Details & Information</h3>
            <p>{selectedInsight.content || "No additional content available for this insight item."}</p>
          </div>

          {/* Single Domain Tag */}
          {selectedInsight.domain && (
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-100">
                # {selectedInsight.domain}
              </span>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800">
              <Share2 size={14} />
              Share Resource
            </button>
            <a 
              href={selectedInsight.source_url} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1.5 rounded-xl bg-[#5b36f5] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Apply / Visit Official Source
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EC] px-4 py-8 font-sans antialiased sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Section */}
        <header className="mb-8 flex flex-col gap-6">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              Tue, Jul 14 • Daily Digest
            </p>
            <h1 className="font-serif mt-1 text-4xl font-bold tracking-tight text-[#0f172a] md:text-5xl">
              Insights
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              What's moving across careers today.
            </p>
          </div>

          {/* Stage Selector Bar (School / Undergrad / Professional) */}
          <div>
            <div className="inline-flex w-full max-w-2xl flex-wrap rounded-2xl border border-gray-200/70 bg-white/80 p-1.5 shadow-sm sm:w-auto">
              {[
                { name: "School", icon: BookOpen, color: "text-emerald-600" },
                { name: "Undergrad", icon: GraduationCap, color: "text-indigo-600" },
                { name: "Professional", icon: Briefcase, color: "text-orange-600" },
              ].map((item) => {
                const isActive = activeStage === item.name;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setActiveStage(item.name)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-200 sm:flex-initial ${
                      isActive
                        ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/10"
                        : "text-slate-700 hover:bg-gray-100/70 hover:text-slate-900"
                    }`}
                  >
                    <IconComponent 
                      size={15} 
                      className={`shrink-0 transition-colors ${isActive ? "text-white" : item.color}`} 
                    />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Filter Chips: 4 Real Backend Values */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/60 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {INSIGHT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setActiveInsightType(type.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeInsightType === type.value
                    ? "bg-[#0b1a36] text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Cards List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-1">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">
            <Search className="mx-auto mb-3 text-gray-300" size={36} />
            <p className="text-sm font-bold text-slate-900">No matching insights found for {activeStage}.</p>
            <p className="mt-1 text-xs text-gray-400">Try adjusting your active filters or search query.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredInsights.map((insight) => (
              <article key={insight.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md md:flex-row">
                
                {/* Image Component */}
                <div className="relative h-48 w-full shrink-0 md:h-auto md:w-72">
                  <img 
                    src={insight.image_url} 
                    alt={insight.title} 
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Content Panel */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    {/* Badge, Actionable Red Dot & Source Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                      <span className={`rounded px-1.5 py-0.5 tracking-wide uppercase ${badgeStyles[insight.insight_type] || "bg-gray-100 text-gray-800"}`}>
                        {badgeLabels[insight.insight_type] || insight.insight_type}
                      </span>
                      
                      {/* Actionable Red Dot */}
                      {insight.actionable && (
                        <span className="flex items-center gap-1 text-red-600 font-semibold text-[10px]">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          Actionable
                        </span>
                      )}

                      <span className="text-gray-500">{extractDomainName(insight.source_url)}</span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 font-normal text-gray-400">
                        <Clock size={10} />
                        {formatTimeAgo(insight.created_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="font-serif mt-2.5 text-xl font-bold leading-snug text-[#0f172a] md:text-2xl">
                      <button onClick={() => setSelectedInsight(insight)} className="text-left hover:text-indigo-600 transition-colors">
                        {insight.title}
                      </button>
                    </h2>

                    {/* Summary */}
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      {insight.summary}
                    </p>

                    {/* Single Domain Tag */}
                    {insight.domain && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        <span className="flex items-center gap-1 rounded-md bg-[#fffbeb] border border-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          <Tag size={8} />
                          {insight.domain}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-[10px] text-gray-400">
                    <span className="font-medium">Daily briefing item</span>
                    <a 
                      href={insight.source_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 transition-all"
                    >
                      Read Full Story
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}