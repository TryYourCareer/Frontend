import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Clock, ExternalLink, Tag, RefreshCw, Rss } from "lucide-react";
import { isFirebaseReady, saveDocument, getDocuments } from "../utils/firebaseStorage";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";
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
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const cachedPayload = localStorage.getItem("clearcareers-insights-cache");
    const cachedTimestamp = localStorage.getItem("clearcareers-insights-ts");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (cachedPayload && cachedTimestamp && now - Number(cachedTimestamp) < oneDay) {
      try {
        setInsights(JSON.parse(cachedPayload));
        setLastUpdated(new Date(Number(cachedTimestamp)).toISOString());
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }

    const fetchInsights = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/insights`);
        if (!response.ok) throw new Error("Failed to fetch insights");
        const payload = await response.json();
        if (!Array.isArray(payload)) throw new Error("Invalid insights payload");
        setInsights(payload);
        localStorage.setItem("clearcareers-insights-cache", JSON.stringify(payload));
        localStorage.setItem("clearcareers-insights-ts", String(Date.now()));
        setLastUpdated(new Date().toISOString());
      } catch {
        setError("We could not refresh today's insights, showing the latest available feed.");
        setInsights(INITIAL_INSIGHTS);
        setLastUpdated(new Date().toISOString());
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
          setLastUpdated(new Date().toISOString());
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
    <section className="min-h-screen bg-[#f3f6fb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header card */}
        <div className="flex flex-col gap-5 rounded-[32px] border border-[#d7e0f2] bg-white px-6 py-6 shadow-[0_20px_60px_rgba(35,60,115,0.08)] sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Rss size={14} className="text-[#3b5d98]" />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#3b5d98]">Your Daily Insights</p>
            </div>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-[#0e2140] sm:text-4xl">Your Daily Insights</h1>
            <p className="max-w-xl text-sm leading-relaxed text-[#556a8f] sm:text-base">Curated opportunities based on your Software Engineering & Design interests.</p>
            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs text-[#7b8aa4]">
                <RefreshCw size={12} />
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2 rounded-2xl border border-[#d8e1ef] bg-[#f8fafc] px-4 py-3 shadow-sm">
              <Search size={16} className="shrink-0 text-[#5c6f8f]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, tag, or source"
                className="w-full border-none bg-transparent text-sm text-[#1f3052] outline-none placeholder:text-[#8b9bb8]"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="shrink-0 rounded-lg p-0.5 text-[#8b9bb8] hover:text-[#4a5f7f]">
                  <Filter size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map((category) => (
            <button key={category} type="button" onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${activeCategory === category ? "bg-[#2f5fde] text-white shadow-[0_8px_20px_rgba(47,93,222,0.22)]" : "bg-[#f4f7fe] text-[#4f6090] hover:bg-[#e7ecfc]"}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#e2e9f5] bg-[#eef4fc] px-5 py-3 text-sm text-[#4e627f]">
          <span>{filteredInsights.length} insights in <strong>{activeCategory}</strong></span>
          {loading && (
            <div className="flex items-center gap-2 text-[#3b5d98]">
              <RefreshCw size={13} className="animate-spin" />
              Refreshing...
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-[#f3d0d0] bg-[#fff2f2] px-5 py-3.5 text-sm text-[#8f2d2d]">{error}</div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-[28px] border border-[#dde5f0] bg-white p-6">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="h-44 w-full rounded-2xl bg-[#e8eef7] sm:h-36 sm:w-52 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/4 rounded-full bg-[#e8eef7]" />
                    <div className="h-6 w-3/4 rounded-full bg-[#e8eef7]" />
                    <div className="h-4 w-full rounded-full bg-[#e8eef7]" />
                    <div className="h-4 w-5/6 rounded-full bg-[#e8eef7]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="rounded-[28px] border border-[#dfe7f1] bg-white p-10 text-center">
            <Search size={32} className="mx-auto mb-4 text-[#b2c0d6]" />
            <p className="font-semibold text-[#5b6d87]">No insights matched your search.</p>
            <p className="mt-1 text-sm text-[#8a9bb5]">Try a different keyword or category.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredInsights.map((insight) => (
              <article key={insight.id} className="overflow-hidden rounded-[28px] border border-[#d8e2f4] bg-white shadow-[0_16px_40px_rgba(34,61,112,0.07)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(34,61,112,0.12)] sm:grid sm:grid-cols-[220px_1fr]">
                <div className="relative h-52 overflow-hidden sm:h-auto">
                  <img src={insight.imageUrl} alt={insight.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:bg-gradient-to-r" />
                </div>
                <div className="flex flex-col justify-between p-5 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] ${badgeStyles[insight.category]}`}>{insight.category}</span>
                      <span className="text-xs font-semibold text-[#68779a]">{insight.source}</span>
                      <span className="flex items-center gap-1 text-xs text-[#8f9fb7]">
                        <Clock size={10} />
                        {formatTimeAgo(insight.publishedAt)}
                      </span>
                    </div>
                    <a href={insight.link} target="_blank" rel="noreferrer" className="block text-xl font-bold leading-snug text-[#0f2140] transition hover:text-[#2f5fde]">
                      {insight.title}
                    </a>
                    <p className="text-sm leading-relaxed text-[#515f7d]">{insight.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {insight.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 rounded-full bg-[#eef3ff] px-2.5 py-0.5 text-xs font-semibold text-[#2e58b4]">
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#e6ecf6] pt-4">
                    <span className="text-xs font-semibold text-[#3b4f76]">Daily briefing item</span>
                    <a href={insight.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f5fde] transition hover:text-[#274fc4]">
                      Read Full Story
                      <ExternalLink size={13} />
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
