import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Clock, ExternalLink, Tag } from "lucide-react";

import { isFirebaseReady, getDocuments } from "../utils/supabaseStorage";
import BACKEND_BASE_URL from "../API/BaseURL";

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
  News: "bg-[#e8f0fe] text-[#1f4ebd] border border-blue-100",
  Opportunity: "bg-[#e9f8ee] text-[#0f7e46] border border-green-100",
  "Success Story": "bg-[#fff4e6] text-[#9c5a1a] border border-amber-100",
  Scholarship: "bg-[#fff4e6] text-[#9c5a1a] border border-amber-100",
  "Skill Trend": "bg-[#f5edff] text-[#5a2eb5] border border-purple-100",
  Innovation: "bg-[#f5edff] text-[#5a2eb5] border border-purple-100",
};

const DOMAIN_OPTIONS = [
  { value: "All", label: "All Sectors" },
  { value: "Technology & Careers", label: "Technology & Careers" },
  { value: "SPORTS, FITNESS & ESPORTS", label: "Sports & Esports" },
  { value: "HOSPITALITY, WELLNESS & LIFESTYLE", label: "Hospitality & Wellness" },
  { value: "EDUCATION, COACHING & HUMAN DEVELOPMENT", label: "Education & Coaching" },
  { value: "EMERGING, FRONTIER & INTERDISCIPLINARY CAREERS", label: "Emerging & Frontier" },
];

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
  const [insights, setInsights] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE_URL}/insights`;
        const params = [];
        if (selectedDomain !== "All") {
          params.push(`domain=${encodeURIComponent(selectedDomain)}`);
        }
        if (selectedStage !== "All") {
          params.push(`stage=${encodeURIComponent(selectedStage.toLowerCase())}`);
        }
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch insights");
        const payload = await response.json();
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
    };

    fetchInsights();
  }, [selectedDomain, selectedStage]);

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
    <section className="min-h-screen bg-[#FAF6EC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Title Header */}
        <div className="space-y-1.5 pb-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0b1a36]">
            Daily Career Insights
          </h1>
          <p className="text-xs font-semibold text-slate-500 max-w-2xl">
            Curated opportunities, industry skill trends, and fresh career news for students and professionals.
          </p>
        </div>

        {/* Toolbar: categories left, search right */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TABS.map((category) => (
              <button key={category} type="button" onClick={() => setActiveCategory(category)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${activeCategory === category ? "bg-[#0b1a36] text-white shadow-sm" : "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 shadow-sm min-w-[200px]">
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

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          {/* Stage Dropdown */}
          <div className="flex flex-col gap-1 min-w-[140px] flex-1 sm:flex-initial">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Career Stage</span>
            <div className="relative">
              <select
                id="stage-select"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-400 hover:bg-slate-100/50"
              >
                <option value="All">All Stages</option>
                <option value="school">School</option>
                <option value="undergrad">Undergrad</option>
                <option value="professional">Professional</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                <Filter size={10} />
              </div>
            </div>
          </div>

          {/* Sector/Domain Dropdown */}
          <div className="flex flex-col gap-1 min-w-[220px] flex-1 sm:flex-initial">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Career Sector</span>
            <div className="relative">
              <select
                id="sector-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-400 hover:bg-slate-100/50"
              >
                {DOMAIN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                <Filter size={10} />
              </div>
            </div>
          </div>
          
          {/* Active filters clear button */}
          {(selectedStage !== "All" || selectedDomain !== "All") && (
            <button
              onClick={() => {
                setSelectedStage("All");
                setSelectedDomain("All");
              }}
              className="sm:self-end mt-2 sm:mt-0 text-[10px] font-extrabold text-red-600 hover:text-red-700 transition py-2 px-3 rounded-xl hover:bg-red-50/50 border border-transparent hover:border-red-100"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-slate-300 bg-white p-5">
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
          <div className="rounded-3xl border border-slate-300 bg-white p-8 text-center shadow-sm">
            <Search size={28} className="mx-auto mb-3 text-slate-400" />
            <p className="font-bold text-slate-900 text-sm">No insights matched your search.</p>
            <p className="mt-0.5 text-xs text-slate-500">Try a different keyword, category, or filter combination.</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-[fadeIn_0.3s_ease-out]">
            {filteredInsights.map((insight) => (
              <article key={insight.id} className="overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm transition hover:shadow-md sm:grid sm:grid-cols-[200px_1fr]">
                <div className="relative h-44 overflow-hidden sm:h-auto select-none">
                  <img src={insight.imageUrl} alt={insight.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
                <div className="flex flex-col justify-between p-4 sm:p-5">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeStyles[insight.category] || "bg-slate-100 text-slate-800"}`}>{insight.category}</span>
                      <span className="text-[10px] font-extrabold text-slate-500 hover:text-slate-700 cursor-default">{insight.source}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={10} />
                        {formatTimeAgo(insight.publishedAt)}
                      </span>
                    </div>
                    {insight.link ? (
                      <a href={insight.link} target="_blank" rel="noreferrer" className="block text-base font-extrabold leading-snug text-slate-900 transition hover:text-blue-800">
                        {insight.title}
                      </a>
                    ) : (
                      <h2 className="text-base font-extrabold leading-snug text-slate-900">{insight.title}</h2>
                    )}
                    <p className="text-xs leading-relaxed text-slate-600">{insight.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {insight.tags && insight.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 rounded-full bg-[#FAF2DB] border border-[#f0dfb4] px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm transition hover:bg-[#f6ebcc]">
                          <Tag size={8} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
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
