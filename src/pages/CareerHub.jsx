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
    return careers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [careers, debouncedBrowse]);

  // -----------------------------------------------------------------------
  // Handle join / leave
  // -----------------------------------------------------------------------
  const handleMemberChange = useCallback(
    (career, isMember) => {
      if (isMember) {
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
        setCareers((prev) =>
          prev.map((c) =>
            c.id === career.id
              ? { ...c, member_count: (c.member_count || 0) + 1 }
              : c
          )
        );
      } else {
        setMyCommunities((prev) => prev.filter((c) => c.id !== career.community_id));
        setCareers((prev) =>
          prev.map((c) =>
            c.id === career.id
              ? { ...c, member_count: Math.max((c.member_count || 1) - 1, 0) }
              : c
          )
        );
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
    <section className="h-[calc(100vh-80px)] bg-gradient-to-br from-[#F4F8FC] via-[#EBF3FB] to-[#DFECF8] overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr] bg-white/40 backdrop-blur-md overflow-hidden">

        {/* ================================================================
            LEFT — Sidebar: My Communities
        ================================================================ */}
        <aside
          className={`border-r border-[#D3E3F5] flex flex-col overflow-hidden bg-white/80 backdrop-blur-md
            ${mobileView === "list" ? "flex" : "hidden lg:flex"}
          `}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#D3E3F5] shrink-0">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <span className="text-lg">💬</span> Career Hubs
            </h2>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-[#D3E3F5] shrink-0">
            <div className="relative">
              <Search size={13} className="absolute inset-y-0 left-3 my-auto text-[#64748B]" />
              <input
                type="text"
                placeholder="Search my communities..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D3E3F5] bg-white text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]/20 outline-none transition"
              />
            </div>
          </div>

          {/* Joined communities list */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
            {myCommLoading && (
              <div className="flex justify-center py-8">
                <Loader2 size={18} className="animate-spin text-[#1E88E5]" />
              </div>
            )}

            {!myCommLoading && filteredMyCommunities.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
                <Users size={28} className="text-[#94A3B8]" />
                <p className="text-xs font-bold text-[#0F172A]">No communities yet</p>
                <p className="text-[11px] text-[#64748B]">
                  Browse careers below and join a community to start chatting.
                </p>
                <button
                  onClick={handleToggleBrowse}
                  className="mt-3 px-4 py-2 bg-[#1E88E5] text-white text-[11px] font-bold rounded-xl hover:bg-[#1976D2] transition shadow-sm shadow-[#1E88E5]/25"
                >
                  Browse Careers
                </button>
              </div>
            )}

            {filteredMyCommunities.map((comm) => {
              const isActive = activeCommunity?.id === comm.id;
              return (
                <button
                  key={comm.id}
                  onClick={() => handleOpenCommunity(comm)}
                  className={`w-full rounded-2xl p-2.5 text-left transition flex items-center gap-3 relative
                    ${isActive
                      ? "bg-[#EAF2FA] border border-[#1E88E5]/30 shadow-sm"
                      : "bg-white/60 border border-transparent hover:border-[#D3E3F5] hover:bg-[#F0F6FC]"
                    }
                  `}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-lg border border-[#D3E3F5] shadow-xs">
                    {comm.career_icon || "💬"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isActive ? "text-[#1E88E5]" : "text-[#0F172A]"}`}>
                      {comm.career_name || comm.name}
                    </p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">
                      {(comm.member_count || 0).toLocaleString()} members
                    </p>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Browse Careers toggle */}
          <div className="shrink-0 border-t border-[#D3E3F5] p-3 bg-white/50">
            <button
              onClick={handleToggleBrowse}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#D3E3F5] bg-white text-[#1E88E5] text-xs font-bold hover:bg-[#EAF2FA] hover:border-[#1E88E5] transition shadow-xs"
            >
              <Compass size={13} />
              {mobileView === "browse" ? "Hide Browse" : "Browse All Careers"}
            </button>
          </div>
        </aside>

        {/* ================================================================
            RIGHT — Chat window or browse panel
        ================================================================ */}
        <main
          className={`flex flex-col min-h-0 overflow-hidden bg-[#F0F6FC]/50
            ${mobileView !== "list" ? "flex" : "hidden lg:flex"}
          `}
        >
          {/* ---- Browse panel ---- */}
          {(browseOpen || mobileView === "browse") && (
            <div className={`shrink-0 border-b border-[#D3E3F5] bg-white/95 backdrop-blur overflow-hidden flex flex-col
              ${mobileView === "browse" ? "flex-1 h-full" : "max-h-[380px]"}
            `}>
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  {mobileView === "browse" && (
                    <button
                      onClick={handleCloseBrowse}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#D3E3F5] bg-white text-[#0F172A] hover:bg-[#F0F6FC] transition"
                    >
                      <ArrowLeft size={15} />
                    </button>
                  )}
                  <h2 className="text-sm font-bold text-[#0F172A]">Browse Career Communities</h2>
                </div>
                <button
                  onClick={handleCloseBrowse}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] border border-[#D3E3F5] rounded-xl bg-white px-2.5 py-1 transition hover:bg-[#F0F6FC]"
                >
                  ✕ Close
                </button>
              </div>

              {/* Browse search */}
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search size={13} className="absolute inset-y-0 left-3 my-auto text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="Search careers by name or keyword..."
                    value={browseSearch}
                    onChange={(e) => setBrowseSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D3E3F5] bg-white text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]/20 outline-none transition"
                  />
                </div>
              </div>

              {/* Career cards grid */}
              <div className="px-4 pb-4 flex-1 overflow-y-auto min-h-0">
                {careersLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-[#1E88E5]" />
                  </div>
                )}
                {careersError && (
                  <p className="text-xs text-red-500 text-center py-4">{careersError}</p>
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
            <div className="flex-1 min-h-0 overflow-hidden">
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
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8 bg-gradient-to-br from-[#F4F8FC] via-[#EBF3FB] to-[#DFECF8]">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#D3E3F5] flex items-center justify-center text-3xl shadow-sm shadow-[#1E88E5]/10">
                    💬
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Welcome to Career Hubs</h3>
                    <p className="text-xs text-[#64748B] mt-1 max-w-xs leading-relaxed">
                      Select a joined career community from the sidebar or click browse below to join new groups.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleBrowse}
                    className="px-4 py-2 bg-[#1E88E5] text-white text-xs font-bold rounded-xl hover:bg-[#1976D2] transition shadow-sm shadow-[#1E88E5]/25"
                  >
                    Browse Careers Directory →
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
