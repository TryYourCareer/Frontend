/**
 * CareerHub — WhatsApp Channels-inspired Career Communities UI.
 * Browse channels, follow career hubs, and receive real-time updates and discussions.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Compass, ArrowLeft, Sparkles, X, Radio } from "lucide-react";
import api from "../lib/api";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import CareerCard from "../components/CareerCard";
import ChatWindow from "../components/ChatWindow";
import JoinLeaveButton from "../components/JoinLeaveButton";
import { getCareerFitReport } from "../services/discoveryTest";

function formatMessageTime(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    } else if (diffDays === 1 || (diffDays === 0 && d.getDate() !== now.getDate())) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  } catch {
    return "";
  }
}

function FollowedHubsSkeleton() {
  return (
    <div className="space-y-1.5 p-1">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-transparent animate-pulse">
          <div className="h-11 w-11 rounded-full bg-slate-200 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
              <div className="h-2.5 w-10 bg-slate-200 rounded-md" />
            </div>
            <div className="h-2.5 w-44 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecommendedHubsSkeleton() {
  return (
    <div className="space-y-3 pt-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
              <div className="h-2.5 w-16 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="h-7 w-16 rounded-full bg-slate-200 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function DirectoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-3xl border border-[#D3E3F5] p-5 bg-white space-y-4 animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="h-14 w-14 rounded-full bg-slate-200 shrink-0" />
            <div className="h-8 w-20 rounded-full bg-slate-200 shrink-0" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
            <div className="h-3 w-1/3 bg-slate-100 rounded-md" />
            <div className="space-y-1.5 pt-2">
              <div className="h-3 w-full bg-slate-100 rounded-md" />
              <div className="h-3 w-4/5 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="h-3 w-16 bg-slate-200 rounded-md" />
            <div className="h-3 w-20 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const CATEGORIES = [
  "All Tracks",
  "⭐ Recommended For You",
  "Tech & Engineering",
  "Design & Creative",
  "Data & AI",
  "Product & Business",
  "Healthcare & Science",
  "Skilled Trades & Mfg",
];

export default function CareerHub() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const currentUserId = user?.auth_user_id || user?.id || "";

  // All careers
  const [careers, setCareers] = useState([]);
  const [careersLoading, setCareersLoading] = useState(true);
  const [careersError, setCareersError] = useState(null);

  // Recommended matches from Career Reality / Discovery Test
  const [recommendedMatches, setRecommendedMatches] = useState([]);
  const [reportLoading, setReportLoading] = useState(true);

  // Communities user has joined
  const [myCommunities, setMyCommunities] = useState([]);
  const [myCommLoading, setMyCommLoading] = useState(true);

  // UI state: 'chat' (active chat window) | 'directory' (browse directory)
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [browseSearch, setBrowseSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Tracks");
  const [mobileView, setMobileView] = useState("sidebar"); // "sidebar" | "main"


  const debouncedBrowse = useDebounce(browseSearch);

  // -----------------------------------------------------------------------
  // Fetch all careers
  // -----------------------------------------------------------------------
  useEffect(() => {
    setCareersLoading(true);
    api
      .get("/api/careers")
      .then((data) => setCareers(data || []))
      .catch((err) => setCareersError(err.message || "Failed to load careers."))
      .finally(() => setCareersLoading(false));
  }, []);

  // -----------------------------------------------------------------------
  // Fetch Career Reality / Discovery Test Fit Report
  // -----------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const sessionId = localStorage.getItem("latest_test_session_id");

    if (sessionId) {
      setReportLoading(true);
      getCareerFitReport(sessionId)
        .then((report) => {
          if (!isMounted) return;
          if (report?.top_matches && Array.isArray(report.top_matches) && report.top_matches.length > 0) {
            setRecommendedMatches(report.top_matches);
          }
        })
        .catch((err) => console.warn("Fit report fetch:", err))
        .finally(() => {
          if (isMounted) setReportLoading(false);
        });
    } else {
      setReportLoading(false);
    }

    return () => { isMounted = false; };
  }, []);

  // -----------------------------------------------------------------------
  // Fetch joined communities
  // -----------------------------------------------------------------------
  const fetchMyCommunities = useCallback(() => {
    if (!token) { setMyCommLoading(false); return; }
    setMyCommLoading(true);
    api
      .get("/api/communities")
      .then((data) => setMyCommunities(data || []))
      .catch(() => setMyCommunities([]))
      .finally(() => setMyCommLoading(false));
  }, [token]);

  useEffect(() => { fetchMyCommunities(); }, [fetchMyCommunities]);

  // -----------------------------------------------------------------------
  // Realtime updates for recent messages & unread counts across all hubs
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!supabase?.channel) return;

    let channel;
    try {
      channel = supabase.channel("global_hubs_messages");
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const newMsg = payload.new;
            if (!newMsg || newMsg.deleted) return;

            setMyCommunities((prev) =>
              prev.map((c) => {
                if (c.id === newMsg.community_id) {
                  const isCurrentActive = activeCommunity?.id === c.id;
                  return {
                    ...c,
                    last_message: newMsg.content,
                    last_message_at: newMsg.created_at,
                    unread_count: isCurrentActive
                      ? 0
                      : newMsg.user_id === currentUserId
                      ? c.unread_count
                      : (c.unread_count || 0) + 1,
                  };
                }
                return c;
              })
            );
          }
        )
        .subscribe();
    } catch {
      return;
    }

    return () => {
      if (supabase?.removeChannel && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeCommunity, currentUserId]);

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------
  const joinedIds = useMemo(
    () => new Set(myCommunities.map((c) => c.id)),
    [myCommunities]
  );

  // Helper to find closest database career
  const findMatchingCareer = useCallback((targetName, careersList) => {
    if (!targetName || !careersList || careersList.length === 0) return null;
    const cleanTarget = targetName.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
    const targetWords = cleanTarget.split(/\s+/).filter((w) => w.length > 2);

    // 1. Direct or clean match
    for (const c of careersList) {
      const cName = (c.name || "").toLowerCase();
      const cleanCName = cName.replace(/[^a-z0-9 ]/g, " ").trim();
      if (cName === targetName.toLowerCase() || cleanCName === cleanTarget) return c;
    }

    // 2. Substring & acronym match
    for (const c of careersList) {
      const cName = (c.name || "").toLowerCase();
      if (cName.includes(cleanTarget) || cleanTarget.includes(cName)) return c;
      if (cleanTarget.includes("vfx") && (cName.includes("vfx") || cName.includes("visual effects"))) return c;
      if (cleanTarget.includes("typography") && (cName.includes("graphic designer") || cName.includes("brand identity"))) return c;
      if (cleanTarget.includes("learning") && (cName.includes("instructional") || cName.includes("curriculum"))) return c;
      if (cleanTarget.includes("character") && (cName.includes("illustrator") || cName.includes("animator") || cName.includes("game designer"))) return c;
      if (cleanTarget.includes("package") && cName.includes("packaging")) return c;
    }

    // 3. Multi-word overlap
    let bestMatch = null;
    let maxOverlap = 0;
    for (const c of careersList) {
      const cleanCName = (c.name || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
      const cWords = cleanCName.split(/\s+/).filter((w) => w.length > 2);
      const overlap = targetWords.filter((w) => cWords.includes(w)).length;
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        bestMatch = c;
      }
    }
    if (maxOverlap > 0) return bestMatch;

    return null;
  }, []);

  // Construct exact 5 Recommended Career Hubs from Discovery Test (or top high-demand benchmark)
  const recommendedCareers = useMemo(() => {
    const iconMap = {
      "vfx": "🎬",
      "visual effects": "🎬",
      "artist": "🎨",
      "character": "🎨",
      "typography": "✍️",
      "learning": "📚",
      "education": "📚",
      "design": "📐",
      "designer": "📐",
      "package": "📦",
      "packaging": "📦",
      "cyber": "🛡️",
      "ai": "🤖",
      "machine": "🤖",
      "cloud": "☁️",
      "data": "📊",
    };

    const getIcon = (name, dbIcon) => {
      if (dbIcon && dbIcon !== "🎓") return dbIcon;
      const lower = (name || "").toLowerCase();
      for (const [k, ic] of Object.entries(iconMap)) {
        if (lower.includes(k)) return ic;
      }
      return "🎓";
    };

    // 1. From real Discovery Test Assessment Report
    if (recommendedMatches && recommendedMatches.length > 0) {
      return recommendedMatches.slice(0, 5).map((m, idx) => {
        const mName = (m.career_name || `Recommended Track #${idx + 1}`).trim();
        const score = m.similarity_score > 1
          ? Math.round(m.similarity_score)
          : Math.round((m.similarity_score || 0.85) * 100);

        const matchedDb = findMatchingCareer(mName, careers);
        const commId = matchedDb?.community_id || matchedDb?.id || `rec-comm-${idx}`;

        return {
          id: matchedDb?.id || `rec-career-${idx}`,
          name: mName,
          slug: matchedDb?.slug || mName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          community_id: commId,
          member_count: matchedDb?.member_count || 0,
          icon_url: getIcon(mName, matchedDb?.icon_url),
          description: m.why_it_fits || matchedDb?.description || "Your dimensional profile aligns well with competencies required for this trajectory.",
          cluster: m.sector || matchedDb?.cluster || "Arts, Media & Design",
          matchScore: score,
          whyItFits: m.why_it_fits || "Your dimensional profile aligns well with competencies required for this career.",
          rank: idx + 1,
        };
      });
    }

    // 2. Dynamic top database careers if user hasn't taken Discovery Test yet
    return (careers || []).slice(0, 5).map((c, idx) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      community_id: c.community_id || c.id,
      member_count: c.member_count || 0,
      icon_url: c.icon_url || getIcon(c.name, c.icon_url),
      description: c.description || "Career track community and verified discussions.",
      cluster: c.cluster || "Verified Hub",
      rank: idx + 1,
    }));
  }, [careers, recommendedMatches, findMatchingCareer]);

  // Lookup map for fast lookup
  const recommendedMap = useMemo(() => {
    const map = new Map();
    recommendedCareers.forEach((rc) => {
      map.set(rc.name.toLowerCase(), rc);
      if (rc.id) map.set(String(rc.id), rc);
      if (rc.community_id) map.set(String(rc.community_id), rc);
    });
    return map;
  }, [recommendedCareers]);

  const filteredMyCommunities = useMemo(() => {
    const q = sidebarSearch.toLowerCase().trim();
    if (!q) return myCommunities;
    return myCommunities.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.career_name || "").toLowerCase().includes(q)
    );
  }, [myCommunities, sidebarSearch]);

  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
      // 1. Search Query filter
      if (debouncedBrowse) {
        const q = debouncedBrowse.toLowerCase();
        const matchesName = (career.name || "").toLowerCase().includes(q);
        const matchesCluster = (career.cluster || "").toLowerCase().includes(q);
        const matchesDesc = (career.description || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCluster && !matchesDesc) return false;
      }

      // 2. Category filter
      if (selectedCategory === "⭐ Recommended For You") {
        const cName = (career.name || "").toLowerCase();
        for (const [recKey] of recommendedMap.entries()) {
          if (cName.includes(recKey) || recKey.includes(cName)) return true;
        }
        return false;
      }

      if (selectedCategory !== "All Tracks") {
        const cluster = (career.cluster || "").toLowerCase();
        const cat = selectedCategory.toLowerCase();
        if (!cluster.includes(cat.split(" ")[0].toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [careers, debouncedBrowse, selectedCategory, recommendedMap]);

  // -----------------------------------------------------------------------
  // Handle join / leave
  // -----------------------------------------------------------------------
  const handleMemberChange = useCallback(
    (item, isMember) => {
      const commId = item.community_id || item.id;
      const careerId = item.career_id || item.id;

      if (isMember) {
        const newComm = {
          id: commId,
          career_id: careerId,
          name: item.career_name ? `${item.career_name} Hub` : (item.name?.includes("Hub") || item.name?.includes("Community") ? item.name : `${item.name} Hub`),
          member_count: (item.member_count || 0) + 1,
          created_at: new Date().toISOString(),
          career_name: item.career_name || item.name,
          career_slug: item.career_slug || item.slug,
          career_icon: item.career_icon || item.icon_url,
        };
        setMyCommunities((prev) => {
          if (prev.find((c) => c.id === commId)) return prev;
          return [newComm, ...prev];
        });
        setCareers((prev) =>
          prev.map((c) =>
            (c.id === careerId || c.community_id === commId)
              ? { ...c, member_count: (c.member_count || 0) + 1 }
              : c
          )
        );
      } else {
        setMyCommunities((prev) => prev.filter((c) => c.id !== commId));
        setCareers((prev) =>
          prev.map((c) =>
            (c.id === careerId || c.community_id === commId)
              ? { ...c, member_count: Math.max((c.member_count || 1) - 1, 0) }
              : c
          )
        );
        setActiveCommunity((curr) => (curr?.id === commId ? null : curr));
      }
    },
    []
  );

  const handleOpenCommunity = useCallback((community) => {
    setActiveCommunity(community);
    setMobileView("main");
    // Clear unread count locally and mark as read on backend
    setMyCommunities((prev) =>
      prev.map((c) => (c.id === community.id ? { ...c, unread_count: 0 } : c))
    );
    api.post(`/api/communities/${community.id}/read`).catch(() => {});
  }, []);

  const handleOpenDirectory = useCallback(() => {
    setActiveCommunity(null);
    setMobileView("main");
  }, []);

  return (
    <section className="h-[calc(100vh-80px)] bg-gradient-to-br from-[#f7fafd] via-[#eef4fc] to-[#e4eef9] overflow-hidden flex flex-col font-sans text-left">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_1fr] bg-transparent overflow-hidden">

        {/* ================================================================
            LEFT — WhatsApp Channels Sidebar
        ================================================================ */}
        <aside
          className={`border-r border-[#D3E3F5] flex flex-col overflow-hidden bg-white shadow-xs z-10
            ${mobileView === "sidebar" ? "flex" : "hidden lg:flex"}
          `}
        >
          {/* Search Bar (Rounded Pill in Brand Sky Palette) */}
          <div className="p-3.5 bg-white border-b border-[#D3E3F5] shrink-0">
            <div className="relative">
              <Search size={15} className="absolute inset-y-0 left-3.5 my-auto text-slate-400" />
              <input
                type="text"
                placeholder="Search career hubs..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F0F6FC] border border-[#D3E3F5] text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-[#1E88E5] focus:border-[#1E88E5] outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Channels Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#EAF2FA]">
            {/* ── Followed Channels Section ─────────────────────── */}
            <div className="p-2 space-y-1 bg-white">
              {myCommLoading && <FollowedHubsSkeleton />}

              {!myCommLoading && filteredMyCommunities.length === 0 && (
                <div className="py-6 px-4 text-center">
                  <p className="text-xs font-bold text-[#0b1a36]">Stay updated on your career tracks</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Follow career hubs below, then check back here for verified updates and discussions.
                  </p>
                </div>
              )}

              {!myCommLoading && filteredMyCommunities.map((comm) => {
                const isActive = activeCommunity?.id === comm.id;
                const timeLabel = formatMessageTime(comm.last_message_at || comm.created_at);
                const unreadCount = comm.unread_count > 0 ? comm.unread_count : null;
                const messagePreview = comm.last_message
                  ? comm.last_message
                  : "No messages yet";

                return (
                  <div
                    key={comm.id}
                    onClick={() => handleOpenCommunity(comm)}
                    className={`w-full rounded-2xl p-3 text-left transition flex items-center justify-between gap-3 relative cursor-pointer group ${
                      isActive
                        ? "bg-[#EAF2FA] border border-[#D3E3F5] shadow-2xs"
                        : "hover:bg-[#F0F6FC] border border-transparent hover:border-[#EAF2FA]"
                    }`}
                  >
                    {/* Avatar with ring */}
                    <div className="relative shrink-0">
                      <div className="h-11 w-11 rounded-full bg-[#F0F6FC] border border-[#D3E3F5] flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition">
                        {comm.career_icon || "🎓"}
                      </div>
                    </div>

                    {/* Middle Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-[#0b1a36] truncate">
                          {comm.career_name || comm.name}
                        </p>
                        {timeLabel && (
                          <span className={`text-[10px] shrink-0 font-medium ${unreadCount ? "text-[#1E88E5] font-bold" : "text-slate-400"}`}>
                            {timeLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1">
                        <p className={`text-[11px] truncate ${unreadCount ? "font-semibold text-slate-800" : "text-slate-500"}`}>
                          {messagePreview}
                        </p>
                        {unreadCount && (
                          <span className="min-w-4 h-4 px-1 rounded-full bg-[#1E88E5] text-white text-[9px] font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── "Find hubs to follow" (Top 5 Recommended Hubs) ── */}
            <div className="p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#0b1a36] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500 fill-amber-500" />
                  Recommended Hubs ({Math.min(5, recommendedCareers.length)})
                </span>
                <button
                  type="button"
                  onClick={handleOpenDirectory}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  See all
                </button>
              </div>

              {(careersLoading || reportLoading) && <RecommendedHubsSkeleton />}

              {!careersLoading && !reportLoading && (
                <div className="space-y-3">
                  {(recommendedCareers.length > 0 ? recommendedCareers : careers)
                    .filter((c) => !joinedIds.has(c.community_id))
                    .slice(0, 5)
                    .map((career) => {
                      const count = career.member_count || 0;
                      const followerStr = `${count.toLocaleString()} ${count === 1 ? "follower" : "followers"}`;
                      return (
                        <div
                          key={career.id || career.community_id}
                          className="flex items-center justify-between gap-3 group"
                        >
                          {/* Hub Avatar & Name */}
                          <div
                            onClick={() => navigate(`/career-details/${encodeURIComponent(career.name || "")}`)}
                            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                          >
                            <div className="relative shrink-0">
                              <div className="h-10 w-10 rounded-full bg-[#F0F6FC] border border-[#D3E3F5] flex items-center justify-center text-base group-hover:scale-105 transition shadow-2xs">
                                {career.icon_url || "🎓"}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#0b1a36] truncate group-hover:text-[#1E88E5] transition">
                                {career.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {followerStr}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Follow Button */}
                          {career.community_id && (
                            <div className="shrink-0">
                              <JoinLeaveButton
                                communityId={career.community_id}
                                isMember={false}
                                size="sm"
                                onToggle={(joined) => handleMemberChange(career, joined)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer: Discover More */}
          <div className="p-3 border-t border-[#D3E3F5] bg-white shrink-0">
            <button
              onClick={handleOpenDirectory}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer ${
                !activeCommunity
                  ? "bg-[#0b1a36] hover:bg-[#122b59] text-white"
                  : "border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-sky-50 text-[#0b1a36]"
              }`}
            >
              <Compass size={14} className={!activeCommunity ? "text-amber-300" : "text-[#1E88E5]"} />
              Discover all hubs ({careers.length})
            </button>
          </div>
        </aside>

        {/* ================================================================
            RIGHT — Main Pane (Discover Hubs vs Active Hub)
        ================================================================ */}
        <main
          className={`flex flex-col min-h-0 overflow-hidden bg-gradient-to-br from-[#f7fafd] via-[#eef4fc] to-[#e4eef9]
            ${mobileView === "main" ? "flex" : "hidden lg:flex"}
          `}
        >
          {activeCommunity ? (
            /* ACTIVE HUB BROADCAST & CHAT VIEW */
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="bg-white border-b border-[#D3E3F5] px-4 py-2.5 flex items-center justify-between lg:hidden shrink-0">
                <button
                  onClick={() => setMobileView("sidebar")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 p-1 rounded-lg hover:bg-slate-100"
                >
                  <ArrowLeft size={15} /> Hubs
                </button>
                <button
                  onClick={handleOpenDirectory}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Discover hubs
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <ChatWindow
                  community={activeCommunity}
                  currentUserId={currentUserId}
                  onBack={() => setMobileView("sidebar")}
                  onMemberChange={handleMemberChange}
                />
              </div>
            </div>
          ) : (
            /* DISCOVER HUBS VIEW (ClearCareer Theme + 5 Recommended Hubs) */
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
              {/* Discover Hero Header */}
              <div className="px-6 py-8 sm:py-10 text-center max-w-2xl mx-auto space-y-3">
                <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-center text-[#1E88E5] shadow-2xs">
                  <Radio size={28} className="animate-pulse text-[#1E88E5]" />
                </div>

                <div className="space-y-1.5">
                  <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#0b1a36] tracking-tight">
                    Discover hubs
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Explore tech, engineering, design, data, healthcare, business and more. Follow the career hubs that match your ambitions.
                  </p>
                </div>

                {/* Wide Search Bar */}
                <div className="pt-2 relative max-w-lg mx-auto">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search career hubs by role, track or skill..."
                    value={browseSearch}
                    onChange={(e) => setBrowseSearch(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-[#D3E3F5] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E88E5] outline-none transition shadow-2xs"
                  />
                  {browseSearch && (
                    <button
                      onClick={() => setBrowseSearch("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                          isSelected
                            ? "bg-[#0b1a36] text-white border-[#0b1a36] shadow-2xs"
                            : "bg-white text-slate-700 border-[#D3E3F5] hover:bg-[#F0F6FC]"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hub Grid Section */}
              <div className="flex-1 px-6 pb-12 max-w-6xl mx-auto w-full space-y-6">
                {/* Directory Header Bar */}
                <div className="flex items-center justify-between border-b border-[#D3E3F5] pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black text-[#0b1a36]">
                      Explore All Career Hubs
                    </h2>
                    <span className="text-[11px] font-bold text-slate-500 bg-white border border-[#D3E3F5] px-2.5 py-0.5 rounded-full">
                      {filteredCareers.length} Hubs
                    </span>
                  </div>
                </div>

                {careersLoading && <DirectoryGridSkeleton />}

                {careersError && (
                  <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 text-center max-w-md mx-auto">
                    {careersError}
                  </div>
                )}

                {!careersLoading && filteredCareers.length === 0 && (
                  <div className="rounded-3xl border border-[#D3E3F5] bg-white p-12 text-center space-y-3 max-w-md mx-auto">
                    <Compass size={36} className="mx-auto text-slate-400" />
                    <h3 className="text-base font-bold text-[#0b1a36]">No hubs found</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      No hubs matched "{browseSearch}" in {selectedCategory}.
                    </p>
                    <button
                      onClick={() => { setBrowseSearch(""); setSelectedCategory("All Tracks"); }}
                      className="px-4 py-2 bg-[#0b1a36] text-white text-xs font-bold rounded-full transition hover:bg-[#122b59]"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}

                {!careersLoading && filteredCareers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredCareers.map((career) => {
                      const isMember = career.community_id
                        ? joinedIds.has(career.community_id)
                        : false;
                      const community = myCommunities.find(
                        (c) => c.id === career.community_id
                      );
                      const cName = (career.name || "").toLowerCase();
                      let recMeta = null;
                      for (const [recKey, meta] of recommendedMap.entries()) {
                        if (cName.includes(recKey) || recKey.includes(cName)) {
                          recMeta = meta;
                          break;
                        }
                      }

                      return (
                        <CareerCard
                          key={career.id}
                          career={career}
                          isMember={isMember}
                          isRecommended={Boolean(recMeta)}
                          matchScore={recMeta?.matchScore}
                          onMemberChange={(joined) => handleMemberChange(career, joined)}
                          onClick={() => community && handleOpenCommunity(community)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

    </section>
  );
}