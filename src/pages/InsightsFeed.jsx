import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Clock,
  ExternalLink,
  Tag,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  UserCheck,
} from "lucide-react";

import { isFirebaseReady, getDocuments } from "../utils/supabaseStorage";
import BACKEND_BASE_URL from "../API/BaseURL";
import SEO from "../components/SEO";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = BACKEND_BASE_URL;
const CATEGORY_TABS = ["All", "Opportunity", "Skill Trend", "News", "Success Story"];

const INITIAL_INSIGHTS = [
  { id: "insight-1", title: "AI Internship Cohort Open for Engineering Students", category: "Opportunity", source: "Google Careers", publishedAt: "2026-04-12T08:30:00.000Z", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80", summary: "Apply now for a 12-week AI internship designed for software engineering learners with a focus on ML product development.", tags: ["AI", "Software Engineering", "Internship"], link: "https://www.google.com/search?q=AI+internship+for+students" },
  { id: "insight-2", title: "MIT announces new scholarship for tech-focused first-year students", category: "Success Story", source: "MIT News", publishedAt: "2026-04-12T06:15:00.000Z", imageUrl: "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=900&q=80", summary: "A fresh scholarship fund for students pursuing computer science, AI, and UX design studies is now accepting applications.", tags: ["Scholarship", "Technology", "Design"], link: "https://news.mit.edu/" },
  { id: "insight-3", title: "How Gemini is shaping student career briefs in software engineering", category: "Skill Trend", source: "TechCrunch", publishedAt: "2026-04-11T18:50:00.000Z", imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80", summary: "A new generation of AI tools is helping students discover skills, internships, and scholarships faster than ever.", tags: ["AI", "Innovation", "FutureOfWork"], link: "https://techcrunch.com/" },
  { id: "insight-4", title: "Latest tech news: Student challenge opens for product design learners", category: "News", source: "The Verge", publishedAt: "2026-04-12T07:45:00.000Z", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80", summary: "Design students can compete in a new product challenge with mentorship and prizes from top tech teams.", tags: ["Design", "Software Engineering", "Career"], link: "https://www.theverge.com/" },
  { id: "insight-5", title: "Scholarship alert: Women in Tech program awards 50 grants", category: "Success Story", source: "Women Who Code", publishedAt: "2026-04-11T13:20:00.000Z", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80", summary: "Fifty grants will support future software engineers and product designers from underrepresented backgrounds.", tags: ["Scholarship", "Software Engineering", "Diversity"], link: "https://www.womenwhocode.com/" },
];

const badgeStyles = {
  News: "bg-sky-50 text-[#1E88E5] border border-sky-200",
  Opportunity: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Success Story": "bg-amber-50 text-amber-800 border border-amber-200",
  Scholarship: "bg-amber-50 text-amber-800 border border-amber-200",
  "Skill Trend": "bg-purple-50 text-purple-700 border border-purple-200",
  Innovation: "bg-purple-50 text-purple-700 border border-purple-200",
};

function mapEducationToStage(edu) {
  if (!edu || typeof edu !== "string") return "All";
  const s = edu.toLowerCase();
  if (
    s.includes("school") ||
    s.includes("class") ||
    s.includes("hsc") ||
    s.includes("ssc") ||
    s.includes("+2") ||
    s.includes("10th") ||
    s.includes("12th") ||
    s.includes("k12")
  ) {
    return "school";
  }
  if (
    s.includes("working") ||
    s.includes("employed") ||
    s.includes("professional") ||
    s.includes("ph.d") ||
    s.includes("doctorate") ||
    s.includes("experienced")
  ) {
    return "professional";
  }
  if (
    s.includes("bachelor") ||
    s.includes("b.") ||
    s.includes("m.") ||
    s.includes("degree") ||
    s.includes("college") ||
    s.includes("undergrad") ||
    s.includes("diploma") ||
    s.includes("iti") ||
    s.includes("mba") ||
    s.includes("student")
  ) {
    return "undergrad";
  }
  return "All";
}

function mapInterestToDomain(interest) {
  if (!interest || typeof interest !== "string" || interest === "—" || interest.toLowerCase() === "other") {
    return "All";
  }
  const s = interest.toLowerCase();
  if (s.includes("tech") || s.includes("code") || s.includes("software") || s.includes("ai") || s.includes("digital") || s.includes("data")) {
    return "Technology";
  }
  if (s.includes("business") || s.includes("finance") || s.includes("corporate") || s.includes("strategy") || s.includes("entrepreneur")) {
    return "Business";
  }
  if (s.includes("media") || s.includes("art") || s.includes("design") || s.includes("journalism") || s.includes("public discourse")) {
    return "Media";
  }
  if (s.includes("sport") || s.includes("fitness") || s.includes("esport")) {
    return "Sports";
  }
  if (s.includes("health") || s.includes("medical") || s.includes("wellness") || s.includes("lifestyle") || s.includes("hospitality")) {
    return "Healthcare";
  }
  if (s.includes("education") || s.includes("teach") || s.includes("coaching") || s.includes("social impact") || s.includes("public service")) {
    return "Education";
  }
  if (s.includes("emerging") || s.includes("frontier") || s.includes("interdisciplinary")) {
    return "Emerging";
  }
  if (s.includes("heritage") || s.includes("cultural") || s.includes("india")) {
    return "Cultural";
  }
  return interest;
}

function formatTimeAgo(timestamp) {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp)) / 1000));
  if (diffSeconds < 60) return "Just now";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

function mapBackendInsight(item) {
  let source = "Career Link";
  try {
    if (item.source_url) {
      source = new URL(item.source_url).hostname.replace("www.", "");
    }
  } catch (e) {
    // fallback
  }

  let category = "News";
  const typeMap = {
    opportunity: "Opportunity",
    skill_trend: "Skill Trend",
    news: "News",
    success_story: "Success Story"
  };
  if (item.insight_type && typeMap[item.insight_type.toLowerCase()]) {
    category = typeMap[item.insight_type.toLowerCase()];
  } else if (item.insight_type) {
    category = item.insight_type.charAt(0).toUpperCase() + item.insight_type.slice(1).replace("_", " ");
  }

  let imageUrl = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"; // Default
  const domainLower = (item.domain || "").toLowerCase();
  if (domainLower.includes("tech")) {
    imageUrl = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80";
  } else if (domainLower.includes("sport") || domainLower.includes("fitness")) {
    imageUrl = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80";
  } else if (domainLower.includes("hospitality") || domainLower.includes("wellness") || domainLower.includes("lifestyle")) {
    imageUrl = "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=900&q=80";
  } else if (domainLower.includes("education") || domainLower.includes("coaching") || domainLower.includes("human")) {
    imageUrl = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80";
  } else if (domainLower.includes("emerging") || domainLower.includes("frontier") || domainLower.includes("interdisciplinary")) {
    imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80";
  }

  const tags = [];
  if (item.domain) {
    const shortDomain = item.domain
      .replace(/&/g, "/")
      .split(",")[0]
      .trim();
    tags.push(shortDomain.length > 25 ? shortDomain.slice(0, 22) + "..." : shortDomain);
  }
  if (item.stage) {
    const stageTitle = item.stage.charAt(0).toUpperCase() + item.stage.slice(1);
    tags.push(stageTitle);
  }
  if (item.actionable) {
    tags.push("Actionable");
  }

  return {
    id: item.id || `insight-${Math.random()}`,
    title: item.title,
    category: category,
    source: source,
    publishedAt: item.created_at || new Date().toISOString(),
    imageUrl: imageUrl,
    summary: item.summary,
    tags: tags,
    link: item.source_url,
    domain: item.domain,
    stage: item.stage,
    actionable: item.actionable
  };
}

export default function InsightsFeed({ onBack }) {
  const { token, profile, user } = useAuth();
  const activeProfile = useMemo(() => profile || user || {}, [profile, user]);

  const currentEducation = activeProfile?.current_education || activeProfile?.currentlyPursuing || "";
  const areaOfInterest = activeProfile?.area_of_interest || activeProfile?.areaOfInterest || "";

  const autoStage = useMemo(() => mapEducationToStage(currentEducation), [currentEducation]);
  const autoDomain = useMemo(() => mapInterestToDomain(areaOfInterest), [areaOfInterest]);

  const [isTailored, setIsTailored] = useState(true);
  const [insights, setInsights] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Live AI Ingestion Trigger State
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/insights`;
      const params = [];
      const effectiveDomain = isTailored && autoDomain !== "All" ? autoDomain : null;
      const effectiveStage = isTailored && autoStage !== "All" ? autoStage : null;

      if (effectiveDomain) {
        params.push(`domain=${encodeURIComponent(effectiveDomain)}`);
      }
      if (effectiveStage) {
        params.push(`stage=${encodeURIComponent(effectiveStage.toLowerCase())}`);
      }
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      let response = await fetch(url);
      let payload = response.ok ? await response.json() : [];

      // If strict tailored filter yielded 0 results, fall back to general feed so user always gets content
      if (payload.length === 0 && (effectiveDomain || effectiveStage)) {
        const fallbackRes = await fetch(`${API_BASE_URL}/insights`);
        if (fallbackRes.ok) {
          payload = await fallbackRes.json();
        }
      }

      if (!Array.isArray(payload)) throw new Error("Invalid insights payload");
      
      const mapped = payload.map(mapBackendInsight);
      setInsights(mapped);
    } catch (err) {
      console.warn("Backend fetch failed, attempting Firebase fallback...", err);
      let fallbackLoaded = false;
      if (isFirebaseReady) {
        try {
          const fbInsights = await getDocuments("insightsFeed", 50);
          if (fbInsights && fbInsights.length > 0) {
            setInsights(fbInsights);
            fallbackLoaded = true;
          }
        } catch (fbErr) {
          console.error("Firebase fetch failed:", fbErr);
        }
      }
      if (!fallbackLoaded) {
        setInsights(INITIAL_INSIGHTS);
      }
    } finally {
      setLoading(false);
    }
  }, [isTailored, autoDomain, autoStage]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Trigger Live AI Ingestion Pipeline
  const handleTriggerIngestion = async () => {
    if (isTriggering) return;
    setIsTriggering(true);
    setTriggerStatus({
      type: "loading",
      message: "AI agent is searching live web results & extracting opportunities...",
    });

    try {
      const cronSecret = process.env.REACT_APP_CRON_SECRET || "_2tM-Uqwa3tikeXcfsSh1eWbMoqEQdC18LjPj-qngjc";
      const headers = {
        "Content-Type": "application/json",
      };
      if (cronSecret) {
        headers["X-Cron-Secret"] = cronSecret;
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/insights/run?limit=3`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned ${res.status}`);
      }

      const data = await res.json();
      const count = data.inserted ?? 0;
      setTriggerStatus({
        type: "success",
        message: count > 0 
          ? `Discovered and added ${count} new live insights to the feed!`
          : "AI search complete! All latest opportunities are currently up to date.",
      });

      // Refresh feed with newly inserted opportunities
      await fetchInsights();

      setTimeout(() => {
        setTriggerStatus(null);
      }, 5000);
    } catch (err) {
      console.error("Trigger error:", err);
      setTriggerStatus({
        type: "error",
        message: err.message || "Failed to trigger live AI ingestion. Please try again.",
      });
      setTimeout(() => {
        setTriggerStatus(null);
      }, 6000);
    } finally {
      setIsTriggering(false);
    }
  };

  const filteredInsights = useMemo(() => {
    return insights.filter((insight) => {
      const matchesCategory = activeCategory === "All" || insight.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        insight.title.toLowerCase().includes(query) || 
        insight.summary.toLowerCase().includes(query) || 
        (insight.tags && insight.tags.some((tag) => tag.toLowerCase().includes(query))) || 
        (insight.source && insight.source.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, insights, searchQuery]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 sm:px-6 lg:px-10">
      <SEO
        title="Daily Career Insights & Tech Opportunities"
        description="Stay ahead with curated internship opportunities, in-demand skill trends, student scholarships, and technology industry news."
        keywords="career insights, tech internships, student scholarships, tech trends, job market news"
        url="/insights-feed"
      />
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Title Header & Trigger Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D3E3F5]/60">
          <div className="space-y-1.5">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0b1a36]">
              Daily Career Insights
            </h1>
            <p className="text-xs font-semibold text-slate-500 max-w-2xl">
              Curated opportunities, industry skill trends, and fresh career news for students and professionals.
            </p>
          </div>

          {/* Live AI Trigger Button */}
          <button
            id="trigger-ai-insights-btn"
            type="button"
            onClick={handleTriggerIngestion}
            disabled={isTriggering}
            className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0b1a36] via-[#152e59] to-[#1E88E5] text-white text-xs font-bold shadow-md shadow-blue-900/10 hover:shadow-lg hover:shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {isTriggering ? (
              <>
                <Loader2 size={15} className="animate-spin text-blue-300" />
                <span>Searching Live Opportunities...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} className="text-amber-300 animate-pulse" />
                <span>Discover Live Insights</span>
              </>
            )}
          </button>
        </div>

        {/* Live Status Toast Banner */}
        {triggerStatus && (
          <div
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-xs font-medium border shadow-sm transition-all animate-[fadeIn_0.3s_ease-out] ${
              triggerStatus.type === "loading"
                ? "bg-blue-50/90 border-blue-200 text-blue-900"
                : triggerStatus.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                : "bg-red-50/90 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {triggerStatus.type === "loading" && <Loader2 size={16} className="animate-spin text-blue-600 shrink-0" />}
              {triggerStatus.type === "success" && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
              {triggerStatus.type === "error" && <AlertCircle size={16} className="text-red-600 shrink-0" />}
              <span className="font-semibold">{triggerStatus.message}</span>
            </div>
            {triggerStatus.type !== "loading" && (
              <button
                type="button"
                onClick={() => setTriggerStatus(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-slate-200/50 transition"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Toolbar: categories left, search right */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TABS.map((category) => (
              <button key={category} type="button" onClick={() => setActiveCategory(category)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${activeCategory === category ? "bg-[#0b1a36] text-white shadow-sm" : "bg-white border border-[#D3E3F5] text-slate-800 hover:bg-[#F0F6FC]"}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2 rounded-xl border border-[#D3E3F5] bg-white px-3.5 py-2 shadow-sm min-w-[200px]">
            <Search size={14} className="shrink-0 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keywords..."
              className="w-full border-none bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="shrink-0 rounded-lg p-0.5 text-slate-400 hover:text-slate-600">
                <Filter size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Profile Auto-Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#D3E3F5] rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <UserCheck size={14} className="text-[#1E88E5]" />
              <span>Tailored by Profile:</span>
            </div>

            {/* Current Education -> Stage */}
            <div className="flex items-center gap-2 bg-[#F0F6FC] border border-[#D3E3F5] px-3 py-1.5 rounded-xl">
              <GraduationCap size={14} className="text-[#0b1a36]" />
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Current Education:</span>
              <span className="font-bold text-slate-800 text-xs">
                {currentEducation || "All Stages"}
              </span>
              {autoStage !== "All" && (
                <span className="ml-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {autoStage}
                </span>
              )}
            </div>

            {/* Area of Interest -> Sector */}
            <div className="flex items-center gap-2 bg-[#F0F6FC] border border-[#D3E3F5] px-3 py-1.5 rounded-xl">
              <Briefcase size={14} className="text-[#0b1a36]" />
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Area of Interest:</span>
              <span className="font-bold text-slate-800 text-xs">
                {areaOfInterest || "All Sectors"}
              </span>
              {autoDomain !== "All" && (
                <span className="ml-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {autoDomain}
                </span>
              )}
            </div>
          </div>

          {/* Tailored / All toggle */}
          {(autoStage !== "All" || autoDomain !== "All") && (
            <button
              type="button"
              onClick={() => setIsTailored((prev) => !prev)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition ${
                isTailored
                  ? "bg-[#0b1a36] text-white border-[#0b1a36] shadow-sm"
                  : "bg-white text-slate-600 border-[#D3E3F5] hover:bg-slate-50"
              }`}
            >
              {isTailored ? "Tailored Active" : "Showing All (Click to Tailor)"}
            </button>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-[#D3E3F5] bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="h-32 w-full rounded-xl bg-slate-100 sm:h-28 sm:w-44 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/4 rounded-full bg-slate-100" />
                    <div className="h-5 w-3/4 rounded-full bg-slate-100" />
                    <div className="h-3 w-full rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredInsights.length === 0 ? (
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-8 text-center shadow-sm">
            <Search size={28} className="mx-auto mb-3 text-slate-400" />
            <p className="font-bold text-slate-900 text-sm">No insights matched your search.</p>
            <p className="mt-0.5 text-xs text-slate-500">Try a different keyword, category, or filter combination.</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-[fadeIn_0.3s_ease-out]">
            {filteredInsights.map((insight) => (
              <article key={insight.id} className="overflow-hidden rounded-3xl border border-[#D3E3F5] bg-white shadow-sm transition hover:shadow-md sm:grid sm:grid-cols-[200px_1fr]">
                <div className="relative h-44 overflow-hidden sm:h-auto select-none">
                  <img src={insight.imageUrl} alt={insight.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
                <div className="flex flex-col justify-between p-4 sm:p-5">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeStyles[insight.category] || "bg-[#F0F6FC] text-slate-800"}`}>{insight.category}</span>
                      <span className="text-[10px] font-extrabold text-slate-500 hover:text-slate-700 cursor-default">{insight.source}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={10} />
                        {formatTimeAgo(insight.publishedAt)}
                      </span>
                    </div>
                    {insight.link ? (
                      <a href={insight.link} target="_blank" rel="noreferrer" className="block text-base font-extrabold leading-snug text-slate-900 transition hover:text-[#1E88E5]">
                        {insight.title}
                      </a>
                    ) : (
                      <h2 className="text-base font-extrabold leading-snug text-slate-900">{insight.title}</h2>
                    )}
                    <p className="text-xs leading-relaxed text-slate-600">{insight.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {insight.tags && insight.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 rounded-full bg-[#F0F6FC] border border-[#D3E3F5] px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm transition hover:bg-[#EAF2FA]">
                          <Tag size={8} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#D3E3F5] pt-3">
                    <span className="text-[10px] font-bold text-slate-400">Daily briefing item</span>
                    {insight.link && (
                      <a href={insight.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#0b1a36] hover:underline transition">
                        Read Full Story
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}