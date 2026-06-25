import { useEffect, useMemo, useState } from "react";
import { isFirebaseReady, saveDocument, getDocuments } from "../utils/firebaseStorage";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

const CATEGORY_TABS = ["All", "News", "Opportunity", "Scholarship", "Innovation"];

const INITIAL_INSIGHTS = [
  {
    id: "insight-1",
    title: "AI Internship Cohort Open for Engineering Students",
    category: "Opportunity",
    source: "Google Careers",
    publishedAt: "2026-04-12T08:30:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
    summary: "Apply now for a 12-week AI internship designed for software engineering learners with a focus on ML product development.",
    tags: ["AI", "Software Engineering", "Internship"],
    link: "https://www.google.com/search?q=AI+internship+for+students",
  },
  {
    id: "insight-2",
    title: "MIT announces new scholarship for tech-focused first-year students",
    category: "Scholarship",
    source: "MIT News",
    publishedAt: "2026-04-12T06:15:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?auto=format&fit=crop&w=900&q=80",
    summary: "A fresh scholarship fund for students pursuing computer science, AI, and UX design studies is now accepting applications.",
    tags: ["Scholarship", "Technology", "Design"],
    link: "https://news.mit.edu/",
  },
  {
    id: "insight-3",
    title: "How Gemini is shaping student career briefs in software engineering",
    category: "Innovation",
    source: "TechCrunch",
    publishedAt: "2026-04-11T18:50:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80",
    summary: "A new generation of AI tools is helping students discover skills, internships, and scholarships faster than ever.",
    tags: ["AI", "Innovation", "FutureOfWork"],
    link: "https://techcrunch.com/",
  },
  {
    id: "insight-4",
    title: "Latest tech news: Student challenge opens for product design learners",
    category: "News",
    source: "The Verge",
    publishedAt: "2026-04-12T07:45:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    summary: "Design students can compete in a new product challenge with mentorship and prizes from top tech teams.",
    tags: ["Design", "Software Engineering", "Career"],
    link: "https://www.theverge.com/",
  },
  {
    id: "insight-5",
    title: "Scholarship alert: Women in Tech program awards 50 grants",
    category: "Scholarship",
    source: "Women Who Code",
    publishedAt: "2026-04-11T13:20:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    summary: "Fifty grants will support future software engineers and product designers from underrepresented backgrounds.",
    tags: ["Scholarship", "Software Engineering", "Diversity"],
    link: "https://www.womenwhocode.com/",
  },
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
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  return `${Math.floor(diffSeconds / 86400)} days ago`;
}

export default function InsightsFeed({ theme = "light", onBack }) {
  const isDark = theme === "dark";
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
        const parsed = JSON.parse(cachedPayload);
        setInsights(parsed);
        setLastUpdated(new Date(Number(cachedTimestamp)).toISOString());
        return;
      } catch {
        // Continue to fetch fresh insights if cache is invalid.
      }
    }

    const fetchInsights = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/insights`);
        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }
        const payload = await response.json();
        if (!Array.isArray(payload)) {
          throw new Error("Invalid insights payload");
        }
        setInsights(payload);
        localStorage.setItem("clearcareers-insights-cache", JSON.stringify(payload));
        localStorage.setItem("clearcareers-insights-ts", String(Date.now()));
        setLastUpdated(new Date().toISOString());
      } catch (fetchError) {
        setError("We could not refresh today’s insights, showing the latest available feed.");
        setInsights(INITIAL_INSIGHTS);
        setLastUpdated(new Date().toISOString());
      } finally {
        setLoading(false);
      }
    };

    const syncInsightsToFirebase = async () => {
      if (!isFirebaseReady) {
        return;
      }

      try {
        await Promise.all(
          INITIAL_INSIGHTS.map((insight) =>
            saveDocument("insightsFeed", insight.id, {
              ...insight,
              syncedAt: new Date().toISOString(),
            })
          )
        );

        const fbInsights = await getDocuments("insightsFeed", 50);
        if (fbInsights && fbInsights.length > 0) {
          setInsights(fbInsights);
          setLastUpdated(new Date().toISOString());
        }
      } catch {
        // Ignore logging failures.
      }
    };

    fetchInsights();
    syncInsightsToFirebase();
  }, []);

  const filteredInsights = useMemo(() => {
    return insights.filter((insight) => {
      const matchesCategory = activeCategory === "All" || insight.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        insight.title.toLowerCase().includes(query) ||
        insight.summary.toLowerCase().includes(query) ||
        insight.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        insight.source.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, insights, searchQuery]);

  return (
    <section className={`min-h-screen px-4 py-8 sm:px-6 lg:px-10 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#f3f6fb] text-slate-900"}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className={`flex flex-col gap-4 rounded-[32px] px-6 py-6 shadow-[0_20px_60px_rgba(35,60,115,0.08)] sm:px-10 sm:py-8 lg:flex-row lg:items-center lg:justify-between ${isDark ? "border border-slate-700 bg-slate-900" : "border border-[#d7e0f2] bg-white"}`}>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#3b5d98]">Your Daily Insights</p>
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#0e2140] sm:text-5xl">Your Daily Insights</h1>
            <p className="max-w-2xl text-sm leading-7 text-[#556a8f] sm:text-base">
              Curated opportunities based on your Software Engineering & Design interests.
            </p>
            <p className="text-sm text-[#7b8aa4]">Updated daily from Google Trends, expert sources, and student career briefs.</p>
          </div>

          <div className={`flex w-full max-w-xl items-center gap-2 rounded-3xl px-4 py-3 shadow-sm sm:px-5 sm:py-4 ${isDark ? "border border-slate-700 bg-slate-900 text-slate-100" : "border border-[#d8e1ef] bg-[#f8fafc]"}`}>
            <span className="text-[#5c6f8f]">🔍</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search insights by keyword, tag, or source"
              className="w-full border-none bg-transparent text-sm text-[#1f3052] outline-none placeholder:text-[#8b9bb8]"
            />
            <button
              type="button"
              className="inline-flex items-center rounded-2xl bg-[#eef2ff] px-3 py-2 text-sm font-semibold text-[#3051b1] transition hover:bg-[#dbe6ff]"
            >
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-3">
          <div className="flex min-w-[720px] gap-2">
            {CATEGORY_TABS.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-[#2f5fde] text-white shadow-[0_10px_25px_rgba(47,93,222,0.18)]"
                    : "bg-[#f4f7fe] text-[#4f6090] hover:bg-[#e7ecfc]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className={`flex flex-col gap-2 rounded-3xl border px-5 py-4 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-slate-700 bg-slate-900 text-slate-200" : "border border-[#e2e9f5] bg-[#eef4fc] text-[#4e627f]"}`}>
            <p>{filteredInsights.length} insights available for {activeCategory}.</p>
            <p>{lastUpdated ? `Last refreshed: ${new Date(lastUpdated).toLocaleDateString()}` : "Refreshing insights..."}</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse rounded-[28px] border border-[#dde5f0] bg-white p-6 shadow-[0_16px_40px_rgba(60,91,166,0.06)]">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-40 w-full rounded-3xl bg-[#e8eef7] sm:h-36 sm:w-56"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-4 w-1/4 rounded-full bg-[#e8eef7]" />
                      <div className="h-6 w-3/4 rounded-full bg-[#e8eef7]" />
                      <div className="h-4 w-full rounded-full bg-[#e8eef7]" />
                      <div className="h-4 w-5/6 rounded-full bg-[#e8eef7]" />
                      <div className="h-8 w-1/3 rounded-full bg-[#e8eef7]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {error ? (
                <div className="rounded-3xl border border-[#f3d0d0] bg-[#fff2f2] px-6 py-4 text-sm text-[#8f2d2d]">
                  {error}
                </div>
              ) : null}

              {filteredInsights.length === 0 ? (
                <div className="rounded-[28px] border border-[#dfe7f1] bg-white p-8 text-center text-sm text-[#5b6d87] shadow-sm">
                  No insights matched your search. Try a different keyword or choose another category.
                </div>
              ) : (
                <div className="grid gap-5">
                  {filteredInsights.map((insight) => (
                    <article
                      key={insight.id}
                      className="grid gap-5 overflow-hidden rounded-[32px] border border-[#d8e2f4] bg-white shadow-[0_20px_50px_rgba(34,61,112,0.08)] sm:grid-cols-[240px_1fr]"
                    >
                      <div className="relative h-60 overflow-hidden sm:h-auto">
                        <img
                          src={insight.imageUrl}
                          alt={insight.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between p-6">
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badgeStyles[insight.category]}`}>
                              {insight.category}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#68779a]">{insight.source}</span>
                            <span className="text-xs text-[#8f9fb7]">{formatTimeAgo(insight.publishedAt)}</span>
                          </div>
                          <a
                            href={insight.link}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-2xl font-bold leading-tight text-[#0f2140] transition hover:text-[#2f5fde]"
                          >
                            {insight.title}
                          </a>
                          <p className="text-sm leading-7 text-[#515f7d]">{insight.summary}</p>
                          <div className="flex flex-wrap gap-2">
                            {insight.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-semibold text-[#2e58b4]">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#e6ecf6] pt-4">
                          <span className="text-sm font-semibold text-[#3b4f76]">Daily briefing item</span>
                          <a
                            href={insight.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f5fde] transition hover:text-[#274fc4]"
                          >
                            Read Full Story ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
