/**
 * CareerHub — Browse careers, join communities, and chat in real time.
 *
 * Three-panel layout:
 *  LEFT   — sidebar: joined communities list + search
 *  RIGHT  — top: browse all careers (join/leave)
 *         — main: chat window for the selected community
 *
 * Fully themed and responsive with support for 'list' (sidebar), 'chat' (active chat),
 * and 'browse' (careers directory) on mobile viewports.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search, Users, Compass, ArrowLeft } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import CareerCard from "../components/CareerCard";
import ChatWindow from "../components/ChatWindow";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function CareerHub() {
  const { user, token } = useAuth();
  const currentUserId = user?.auth_user_id || user?.id || "";

  // All careers (from /api/careers)
  const [careers, setCareers] = useState([]);
  const [careersLoading, setCareersLoading] = useState(true);
  const [careersError, setCareersError] = useState(null);

  // Communities user has joined
  const [myCommunities, setMyCommunities] = useState([]);
  const [myCommLoading, setMyCommLoading] = useState(true);

  // UI state: 'list' (sidebar) | 'chat' (chat window) | 'browse' (browse directory full screen on mobile)
  const [mobileView, setMobileView] = useState("list");
  const [activeCommunity, setActiveCommunity] = useState(null); // community object
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [browseSearch, setBrowseSearch] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);

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
  // Derived data
  // -----------------------------------------------------------------------
  const joinedIds = useMemo(
    () => new Set(myCommunities.map((c) => c.id)),
    [myCommunities]
  );

  const filteredMyCommunities = useMemo(() => {
    const q = sidebarSearch.toLowerCase();
    return myCommunities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.career_name || "").toLowerCase().includes(q)
    );
  }, [myCommunities, sidebarSearch]);

  const filteredCareers = useMemo(() => {
    const q = debouncedBrowse.toLowerCase();
    return careers.filter((c) => {
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (selectedCategory === "All") return true;
      const text = `${c.name} ${c.description || ""}`.toLowerCase();
      if (selectedCategory === "Tech & Engineering") {
        return text.includes("software") || text.includes("engineer") || text.includes("developer") || text.includes("cloud") || text.includes("web") || text.includes("ai");
      }
      if (selectedCategory === "Design & Creative") {
        return text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("art") || text.includes("creative");
      }
      if (selectedCategory === "Data & AI") {
        return text.includes("data") || text.includes("machine learning") || text.includes("analyst") || text.includes("intelligence");
      }
      if (selectedCategory === "Product & Business") {
        return text.includes("product") || text.includes("manager") || text.includes("business") || text.includes("marketing") || text.includes("sales");
      }
      return true;
    });
  }, [careers, debouncedBrowse, selectedCategory]);

  // -----------------------------------------------------------------------
  // Handle join / leave
  // -----------------------------------------------------------------------
  const handleMemberChange = useCallback(
    (career, isMember) => {
      if (isMember) {
        // User just joined — find the community from careers data and add it
        const newComm = {
          id: career.community_id,
          career_id: career.id,
          name: career.name + " Community",
          member_count: (career.member_count || 0) + 1,
          created_at: new Date().toISOString(),
          career_name: career.name,
          career_slug: career.slug,
          career_icon: career.icon_url,
        };
        setMyCommunities((prev) => {
          if (prev.find((c) => c.id === career.community_id)) return prev;
          return [newComm, ...prev];
        });
        // Update member_count on careers list optimistically
        setCareers((prev) =>
          prev.map((c) =>
            c.id === career.id
              ? { ...c, member_count: (c.member_count || 0) + 1 }
              : c
          )
        );
      } else {
        // User just left
        setMyCommunities((prev) => prev.filter((c) => c.id !== career.community_id));
        setCareers((prev) =>
          prev.map((c) =>
            c.id === career.id
              ? { ...c, member_count: Math.max((c.member_count || 1) - 1, 0) }
              : c
          )
        );
        // If we were viewing this community, close the chat
        if (activeCommunity?.id === career.community_id) {
          setActiveCommunity(null);
          setMobileView("list");
        }
      }
    },
    [activeCommunity]
  );

  const handleOpenCommunity = useCallback((community) => {
    setActiveCommunity(community);
    setMobileView("chat");
    setBrowseOpen(false);
  }, []);

  const handleToggleBrowse = useCallback(() => {
    setBrowseOpen((v) => {
      const next = !v;
      if (next) {
        setMobileView("browse");
      } else {
        setMobileView("list");
      }
      return next;
    });
  }, []);

  const handleCloseBrowse = useCallback(() => {
    setBrowseOpen(false);
    setMobileView("list");
  }, []);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <section className="h-[calc(100vh-80px)] bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] overflow-hidden flex flex-col font-sans">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[330px_1fr] bg-transparent overflow-hidden">

        {/* ================================================================
            LEFT — Sidebar: My Communities
        ================================================================ */}
        <aside
          className={`border-r border-[#D3E3F5] flex flex-col overflow-hidden bg-white/95 backdrop-blur-md
            ${mobileView === "list" ? "flex" : "hidden lg:flex"}
          `}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#D3E3F5] shrink-0 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-50 to-[#EAF2FA] border border-sky-200 flex items-center justify-center text-sm shadow-2xs">
                💬
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-[#0b1a36] leading-none">
                  Career Hubs
                </h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {myCommunities.length} Joined Communities
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleBrowse}
              title="Explore all career hubs"
              className="p-1.5 rounded-xl border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-sky-50 text-[#1E88E5] transition shadow-2xs cursor-pointer"
            >
              <Compass size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-[#D3E3F5] shrink-0 bg-white">
            <div className="relative">
              <Search size={13} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
              <input
                type="text"
                placeholder="Search my communities..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] text-xs text-slate-800 placeholder-slate-400 focus:border-[#1E88E5] focus:bg-white outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Joined communities list */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 bg-[#f8fafc]">
            {myCommLoading && (
              <div className="flex justify-center py-8">
                <Loader2 size={18} className="animate-spin text-[#1E88E5]" />
              </div>
            )}

            {!myCommLoading && filteredMyCommunities.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white border border-[#D3E3F5] text-[#1E88E5] shadow-2xs">
                  <Users size={22} />
                </div>
                <p className="font-serif text-xs font-bold text-[#0b1a36] mt-1">No communities yet</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px]">
                  Browse careers below and join a hub to connect with peers and mentors.
                </p>
                <button
                  onClick={handleToggleBrowse}
                  className="mt-2 px-4 py-2 bg-[#0b1a36] hover:bg-[#122b59] text-white text-[11px] font-bold rounded-full transition shadow-xs cursor-pointer"
                >
                  Explore Careers
                </button>
              </div>
            )}

            {filteredMyCommunities.map((comm) => {
              const isActive = activeCommunity?.id === comm.id;
              return (
                <button
                  key={comm.id}
                  onClick={() => handleOpenCommunity(comm)}
                  className={`w-full rounded-2xl p-3 text-left transition flex items-center gap-3 relative cursor-pointer group ${
                    isActive
                      ? "bg-[#EAF2FA] border border-[#1E88E5]/40 shadow-xs ring-1 ring-[#1E88E5]/20"
                      : "bg-white border border-[#D3E3F5]/80 hover:border-[#1E88E5]/40 hover:bg-[#F0F6FC] shadow-2xs"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-white to-[#F0F6FC] text-xl border border-[#D3E3F5] group-hover:scale-105 transition shadow-2xs">
                      {comm.career_icon || "💬"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-serif text-xs font-bold text-[#0b1a36] truncate">{comm.career_name || comm.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                        <Users size={10} className="text-[#1E88E5]" />
                        {(comm.member_count || 0).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-100">
                        Active
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#1E88E5] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Browse Careers toggle */}
          <div className="shrink-0 border-t border-[#D3E3F5] p-3 bg-white">
            <button
              onClick={handleToggleBrowse}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-[#D3E3F5] bg-[#F0F6FC] text-[#0b1a36] text-xs font-bold hover:bg-[#0b1a36] hover:text-white transition shadow-2xs cursor-pointer"
            >
              <Compass size={14} className="text-[#1E88E5]" />
              {mobileView === "browse" ? "Hide Directory" : "Browse All Career Hubs"}
            </button>
          </div>
        </aside>

        {/* ================================================================
            RIGHT — Chat window or browse panel
        ================================================================ */}
        <main
          className={`flex flex-col min-h-0 overflow-hidden bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7]
            ${mobileView !== "list" ? "flex" : "hidden lg:flex"}
          `}
        >
          {/* ---- Browse panel (slide-in when browseOpen OR mobileView === 'browse') ---- */}
          {(browseOpen || mobileView === "browse") && (
            <div className={`shrink-0 border-b border-[#D3E3F5] bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] backdrop-blur-md overflow-hidden flex flex-col shadow-xs
              ${mobileView === "browse" ? "flex-1 h-full" : "max-h-[420px]"}
            `}>
              <div className="flex items-center justify-between px-4 pt-4 pb-2 sm:px-6 bg-white border-b border-[#D3E3F5]">
                <div className="flex items-center gap-2">
                  {mobileView === "browse" && (
                    <button
                      onClick={handleCloseBrowse}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#D3E3F5] bg-white text-slate-700 hover:bg-[#F0F6FC] transition shadow-2xs cursor-pointer"
                    >
                      <ArrowLeft size={15} />
                    </button>
                  )}
                  <div>
                    <h2 className="font-serif text-sm font-bold text-[#0b1a36]">Browse Career Communities</h2>
                    <p className="text-[10px] text-slate-500">Join communities to access real-time peer chat, shared resources, and mentors.</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseBrowse}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-[#D3E3F5] rounded-full bg-white px-3 py-1 shadow-2xs hover:bg-[#F0F6FC] transition cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Browse search & Category filters */}
              <div className="px-4 pb-3 pt-3 sm:px-6 bg-white border-b border-[#D3E3F5] space-y-2.5">
                <div className="relative">
                  <Search size={13} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search careers by title, role or skills..."
                    value={browseSearch}
                    onChange={(e) => setBrowseSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-2xl border border-[#D3E3F5] bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-[#1E88E5] focus:bg-white outline-none transition shadow-2xs"
                  />
                </div>

                {/* Category filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {[
                    "All",
                    "Tech & Engineering",
                    "Design & Creative",
                    "Data & AI",
                    "Product & Business",
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-[#0b1a36] text-white shadow-2xs"
                          : "bg-[#F0F6FC] text-slate-600 border border-[#D3E3F5] hover:bg-sky-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Career cards grid */}
              <div className="px-4 py-4 sm:px-6 flex-1 overflow-y-auto min-h-0 bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7]">
                {careersLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-[#1E88E5]" />
                  </div>
                )}
                {careersError && (
                  <p className="text-xs text-red-600 text-center py-4 bg-red-50 rounded-2xl border border-red-200">{careersError}</p>
                )}
                {!careersLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredCareers.map((career) => {
                      const isMember = career.community_id
                        ? joinedIds.has(career.community_id)
                        : false;
                      const community = myCommunities.find(
                        (c) => c.id === career.community_id
                      );
                      return (
                        <CareerCard
                          key={career.id}
                          career={career}
                          isMember={isMember}
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

          {/* ---- Chat area ---- */}
          {mobileView !== "browse" && (
            <div className="flex-1 min-h-0 overflow-hidden bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7]">
              {activeCommunity ? (
                <ChatWindow
                  community={activeCommunity}
                  currentUserId={currentUserId}
                  onBack={() => {
                    setMobileView("list");
                    setActiveCommunity(null);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 max-w-2xl mx-auto">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-3xl bg-white border border-[#D3E3F5] flex items-center justify-center text-4xl shadow-xs">
                      💬
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#1E88E5] border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-xs">
                      ⚡
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#0b1a36]">
                    Welcome to Career Hubs
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
                    Collaborate with peers, ask questions to industry mentors, and access shared learning documents and trial roadmaps.
                  </p>

                  {/* 3 Premium Feature Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-6 text-left">
                    <div className="p-3.5 rounded-2xl bg-white border border-[#D3E3F5] shadow-2xs">
                      <div className="h-8 w-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#1E88E5] text-xs font-bold mb-2">
                        👥
                      </div>
                      <h4 className="text-xs font-bold text-[#0b1a36]">Active Members</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Discover learners & mentors active right now.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#D3E3F5] shadow-2xs">
                      <div className="h-8 w-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold mb-2">
                        📁
                      </div>
                      <h4 className="text-xs font-bold text-[#0b1a36]">Media & Docs</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        PDF roadmaps, code screenshots, & trial assets.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#D3E3F5] shadow-2xs">
                      <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold mb-2">
                        🔗
                      </div>
                      <h4 className="text-xs font-bold text-[#0b1a36]">Shared Links</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Curated sandboxes, GitHub repos, & articles.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleBrowse}
                    className="mt-6 px-6 py-3 bg-[#0b1a36] hover:bg-[#122b59] text-white text-xs font-bold rounded-full transition shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Compass size={15} className="text-[#1E88E5]" />
                    <span>Browse & Join Career Hubs</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}