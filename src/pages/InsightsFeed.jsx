import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Clock, ExternalLink, Tag } from "lucide-react";

import { isFirebaseReady, saveDocument, getDocuments } from "../utils/supabaseStorage";
import BACKEND_BASE_URL from "../API/BaseURL";

const API_BASE_URL = BACKEND_BASE_URL;
const CATEGORY_TABS = ["All", "News", "Opportunity", "Scholarship", "Innovation"];

const INITIAL_INSIGHTS = [
  { id: "insight-1", title: "AI Internship Cohort Open for Engineering Students", category: "Opportunity", source: "Google Careers", publishedAt: "2026-04-12T08:30:00.000Z", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80", summary: "Apply now for a 12-week AI internship designed for software engineering learners with a focus on ML product development.", tags: ["AI", "Software Engineering", "Internship"], link: "https://www.google.com/search?q=AI+internship+for+students" },
  { id: "insight-2", title: "MIT announces new scholarship for tech-focused first-year students", category: "Scholarship", source: "MIT News", publishedAt: "2026-04-12T06:15:00.000Z", imageUrl: "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=900&q=80", summary: "A fresh scholarship fund for students pursuing computer science, AI, and UX design studies is now accepting applications.", tags: ["Scholarship", "Technology", "Design"], link: "https://news.mit.edu/" },
  { id: "insight-3", title: "How Gemini is shaping student career briefs in software engineering", category: "Innovation", source: "TechCrunch", publishedAt: "2026-04-11T18:50:00.000Z", imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80", summary: "A new generation of AI tools is helping students discover skills, internships, and scholarships faster than ever.", tags: ["AI", "Innovation", "FutureOfWork"], link: "https://techcrunch.com/" },
  { id: "insight-4", title: "Latest tech news: Student challenge opens for product design learners", category: "News", source: "The Verge", publishedAt: "2026-04-12T07:45:00.000Z", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80", summary: "Design students can compete in a new product challenge with mentorship and prizes from top tech teams.", tags: ["Design", "Software Engineering", "Career"], link: "https://www.theverge.com/" },
  { id: "insight-5", title: "Scholarship alert: Women in Tech program awards 50 grants", category: "Scholarship", source: "Women Who Code", publishedAt: "2026-04-11T13:20:00.000Z", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80", summary: "Fifty grants will support future software engineers and product designers from underrepresented backgrounds.", tags: ["Scholarship", "Software Engineering", "Diversity"], link: "https://www.womenwhocode.com/" },
];

const badgeStyles = {
  News: "bg-[#e8f0fe] text-[#1f4ebd]",
  Opportunity: "bg-[#e9f8ee] text-[#0f7e46]",
  Scholarship: "bg-[#fff4e6] text-[#9c5a1a]",
  Innovation: "bg-[#f5edff] text-[#5a2eb5]",
};

function formatTimeAgo(timestamp) {
  const diffSeconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (diffSeconds < 60) return "Just now";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

export default function InsightsFeed({ onBack }) {
  const [insights, setInsights] = useState(INITIAL_INSIGHTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);


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
      } catch { /* fall through */ }
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
        await Promise.all(INITIAL_INSIGHTS.map((insight) => saveDocument("insightsFeed", insight.id, { ...insight, syncedAt: new Date().toISOString() })));
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
      const matchesCategory = activeCategory === "All" || insight.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || insight.title.toLowerCase().includes(query) || insight.summary.toLowerCase().includes(query) || insight.tags.some((tag) => tag.toLowerCase().includes(query)) || insight.source.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, insights, searchQuery]);

  return (
    <section className="min-h-screen bg-[#FAF6EC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">

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
          <div className="rounded-3xl border border-slate-300 bg-white p-8 text-center">
            <Search size={28} className="mx-auto mb-3 text-slate-400" />
            <p className="font-bold text-slate-900 text-sm">No insights matched your search.</p>
            <p className="mt-0.5 text-xs text-slate-500">Try a different keyword or category.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInsights.map((insight) => (
              <article key={insight.id} className="overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm transition hover:shadow-md sm:grid sm:grid-cols-[200px_1fr]">
                <div className="relative h-44 overflow-hidden sm:h-auto">
                  <img src={insight.imageUrl} alt={insight.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
                <div className="flex flex-col justify-between p-4 sm:p-5">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeStyles[insight.category] || "bg-slate-100 text-slate-800"}`}>{insight.category}</span>
                      <span className="text-[10px] font-bold text-slate-500">{insight.source}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={10} />
                        {formatTimeAgo(insight.publishedAt)}
                      </span>
                    </div>
                    <a href={insight.link} target="_blank" rel="noreferrer" className="block text-base font-bold leading-snug text-slate-900 transition hover:text-slate-750">
                      {insight.title}
                    </a>
                    <p className="text-xs leading-relaxed text-slate-650">{insight.summary}</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 rounded-full bg-[#FAF2DB] border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-sm">
                          <Tag size={8} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400">Daily briefing item</span>
                    <a href={insight.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#0b1a36] hover:underline transition">
                      Read Full Story
                      <ExternalLink size={10} />
                    </a>
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
