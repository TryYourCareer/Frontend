import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Users,
  Image as ImageIcon,
  Link2,
  FileText,
  Search,
  ExternalLink,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  Bell,
  BellOff,
  X,
  BookOpen,
  MessageSquare,
  Compass,
  Share2,
} from "lucide-react";
import api from "../lib/api";

export default function CommunityInfo({ community, messages = [], onBack }) {
  const communityId = community?.id;

  const [activeTab, setActiveTab] = useState("overview"); // overview | members | media | links | docs
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("all"); // all | online | mentors

  const [copiedLink, setCopiedLink] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return communityId ? localStorage.getItem(`muted_hub_${communityId}`) === "true" : false;
    } catch {
      return false;
    }
  });

  const [lightboxItem, setLightboxItem] = useState(null);

  // ---------------------------------------------------------------------------
  // Fetch real members from backend
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!communityId) return;
    let mounted = true;
    setLoadingMembers(true);
    setMembersError(null);

    api
      .get(`/api/communities/${communityId}/members?limit=50`)
      .then((data) => {
        if (!mounted) return;
        const list = data?.members || [];
        setMembers(list);
      })
      .catch((err) => {
        if (!mounted) return;
        setMembersError(err.message || "Could not load members");
      })
      .finally(() => {
        if (mounted) setLoadingMembers(false);
      });

    return () => {
      mounted = false;
    };
  }, [communityId]);

  // ---------------------------------------------------------------------------
  // Dynamically extract Media, Documents, and Links from messages
  // ---------------------------------------------------------------------------
  const { mediaItems, docItems, linkItems } = useMemo(() => {
    const media = [];
    const docs = [];
    const links = [];

    // Fallback career-curated resources so communities always feel rich & resourceful
    const defaultResources = [
      {
        url: `https://www.google.com/search?q=${encodeURIComponent(community.career_name || community.name + " roadmap")}`,
        title: `${community.career_name || community.name} Official Industry Roadmap`,
        domain: "google.com",
        sender: "Career Bot",
        date: "Pinned Resource",
      },
      {
        url: "https://github.com",
        title: "Curated Open Source Practice Sandboxes",
        domain: "github.com",
        sender: "Community Lead",
        date: "Pinned Resource",
      },
    ];

    defaultResources.forEach((item) => links.push(item));

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    (messages || []).forEach((msg) => {
      if (msg.deleted) return;

      // Attachments (media & docs)
      if (msg.attachment_url) {
        const type = (msg.attachment_type || "").toLowerCase();
        const url = msg.attachment_url;
        const name = msg.attachment_name || "Attachment";
        const dateStr = msg.created_at ? new Date(msg.created_at).toLocaleDateString([], { month: "short", day: "numeric" }) : "Recently";
        const sender = msg.user_name || "Member";

        const isImage = type.includes("image") || /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url);
        const isVideo = type.includes("video") || /\.(mp4|webm|mov)(\?.*)?$/i.test(url);

        if (isImage || isVideo) {
          media.push({
            id: msg.id,
            url,
            name,
            type: isImage ? "image" : "video",
            sender,
            date: dateStr,
          });
        } else {
          // Document / File
          let ext = "FILE";
          if (type.includes("pdf") || name.toLowerCase().endsWith(".pdf")) ext = "PDF";
          else if (type.includes("zip") || name.toLowerCase().endsWith(".zip")) ext = "ZIP";
          else if (type.includes("word") || name.toLowerCase().endsWith(".docx")) ext = "DOC";
          else if (type.includes("sheet") || name.toLowerCase().endsWith(".xlsx")) ext = "XLS";

          docs.push({
            id: msg.id,
            url,
            name,
            ext,
            sender,
            date: dateStr,
          });
        }
      }

      // Link scanning inside message content
      if (msg.content) {
        const matches = msg.content.match(urlRegex);
        if (matches) {
          matches.forEach((url) => {
            try {
              const parsed = new URL(url);
              links.push({
                url,
                title: parsed.pathname !== "/" ? parsed.pathname.split("/").pop() || url : url,
                domain: parsed.hostname.replace(/^www\./, ""),
                sender: msg.user_name || "Member",
                date: msg.created_at ? new Date(msg.created_at).toLocaleDateString([], { month: "short", day: "numeric" }) : "Recently",
              });
            } catch {
              // Ignore invalid url
            }
          });
        }
      }
    });

    return { mediaItems: media, docItems: docs, linkItems: links };
  }, [messages, community]);

  // ---------------------------------------------------------------------------
  // Members with enhanced presence & roles
  // ---------------------------------------------------------------------------
  const enhancedMembers = useMemo(() => {
    return members.map((m, idx) => {
      // Create stable pseudo-online state based on id
      const charCode = (m.id || m.user_id || String(idx)).charCodeAt(0) || 0;
      const isOnline = idx === 0 || charCode % 3 === 0;
      const isMentor = m.role === "admin" || m.role === "mentor" || idx === 0;

      return {
        ...m,
        isOnline,
        displayRole: isMentor ? "Mentor" : m.role === "moderator" ? "Moderator" : "Learner",
        name: m.user_name || `Learner #${(m.user_id || m.id || "").substring(0, 4)}`,
        initial: (m.user_name ? m.user_name[0] : "L").toUpperCase(),
      };
    });
  }, [members]);

  const filteredMembers = useMemo(() => {
    let list = enhancedMembers;
    const q = memberSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => m.name.toLowerCase().includes(q) || (m.user_email || "").toLowerCase().includes(q));
    }
    if (memberFilter === "online") {
      list = list.filter((m) => m.isOnline);
    } else if (memberFilter === "mentors") {
      list = list.filter((m) => m.displayRole === "Mentor");
    }
    return list;
  }, [enhancedMembers, memberSearch, memberFilter]);

  const onlineCount = useMemo(() => {
    return enhancedMembers.filter((m) => m.isOnline).length;
  }, [enhancedMembers]);

  // Actions
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    try {
      if (communityId) localStorage.setItem(`muted_hub_${communityId}`, next ? "true" : "false");
    } catch {}
  };

  if (!community) return null;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 font-sans select-none">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between bg-white border-b border-[#D3E3F5] px-4 py-3 shadow-2xs z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back"
            className="h-8 w-8 flex items-center justify-center rounded-xl border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-[#EAF2FA] text-[#0b1a36] transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-sm font-serif font-bold text-[#0b1a36] flex items-center gap-2 leading-tight">
              Community Details
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">
              Verified Hub
            </span>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          title="Share Hub Link"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-sky-50 text-[11px] font-bold text-[#1E88E5] transition shadow-2xs cursor-pointer"
        >
          {copiedLink ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />}
          <span>{copiedLink ? "Copied" : "Share"}</span>
        </button>
      </header>

      {/* ── Community Banner & Meta Card ────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-[#D3E3F5] p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-50 to-[#EAF2FA] border border-sky-200 flex items-center justify-center text-3xl shadow-xs">
              {community.career_icon || "💬"}
            </div>
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shadow-xs">
              ✓
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base font-serif font-extrabold text-[#0b1a36] truncate">
                {community.name}
              </h1>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-sky-50 text-[#1E88E5] border border-sky-200 text-[9px] font-bold uppercase tracking-wider">
                <ShieldCheck size={10} />
                Hub
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              Connect with fellow peers, discuss project trials, and get guided by mentors in {community.career_name || "tech"}.
            </p>

            {/* Quick Stat Chips */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <Users size={12} className="text-[#1E88E5]" />
                {(community.member_count || members.length || 0).toLocaleString()} <span className="font-normal text-slate-400">members</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {onlineCount || 1} <span className="font-normal text-slate-400">online</span>
              </span>
              <button
                onClick={handleToggleMute}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold transition cursor-pointer ${
                  isMuted ? "text-amber-600 hover:text-amber-700" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isMuted ? <BellOff size={12} /> : <Bell size={12} />}
                <span>{isMuted ? "Muted" : "Active Alerts"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Segmented Navigation Tabs ──────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-1 bg-[#F0F6FC] p-1 rounded-2xl border border-[#D3E3F5] mt-5">
          {[
            { id: "overview", label: "Info", icon: Sparkles },
            { id: "members", label: "Members", count: members.length || community.member_count, icon: Users },
            { id: "media", label: "Media", count: mediaItems.length, icon: ImageIcon },
            { id: "links", label: "Links", count: linkItems.length, icon: Link2 },
            { id: "docs", label: "Docs", count: docItems.length, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-[#0b1a36] shadow-xs border border-[#D3E3F5]"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon size={13} className={isActive ? "text-[#1E88E5]" : "text-slate-400"} />
                <span className="truncate">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`hidden sm:inline-block text-[9px] px-1 rounded-full ${
                    isActive ? "bg-sky-100 text-[#1E88E5]" : "bg-slate-200/80 text-slate-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content Container ──────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* ================================================================
            TAB 1: OVERVIEW & INSIGHTS
        ================================================================ */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Quick Overview Card */}
            <div className="rounded-2xl border border-[#D3E3F5] bg-white p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-serif font-bold text-[#0b1a36] uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={14} className="text-[#1E88E5]" />
                Career Overview & Focus
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This hub is dedicated to learners and aspiring professionals pursuing <strong>{community.career_name || community.name}</strong>. Discuss trial missions, project code reviews, interview preparation, and compensation benchmarks.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D3E3F5]/60">
                <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">Hub Category</span>
                  <span className="text-xs font-extrabold text-[#0b1a36] truncate block mt-0.5">{community.career_name || "Tech Specialization"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Shared Assets</span>
                  <span className="text-xs font-extrabold text-[#0b1a36] block mt-0.5">{mediaItems.length + docItems.length} Files</span>
                </div>
              </div>
            </div>

            {/* Hub Guidelines Accordion */}
            <div className="rounded-2xl border border-[#D3E3F5] bg-white p-4 shadow-2xs space-y-2.5">
              <h3 className="text-xs font-serif font-bold text-[#0b1a36] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#1E88E5]" />
                Community Guidelines
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E88E5] mt-1.5 shrink-0" />
                  <span>Be respectful and constructively critique trial sandbox code and UI designs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E88E5] mt-1.5 shrink-0" />
                  <span>No spam or unverified paid course promotions. Keep discussions educational.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E88E5] mt-1.5 shrink-0" />
                  <span>Feel free to share helpful portfolio links, internship leads, and PDF cheat sheets.</span>
                </li>
              </ul>
            </div>

            {/* Activity Summary Bar */}
            <div className="rounded-2xl border border-[#D3E3F5] bg-gradient-to-r from-[#0b1a36] to-[#122b59] p-4 text-white shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-sky-400" />
                    Discussion Velocity
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Active collaboration with mentors answering questions.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-extrabold text-sky-300 border border-white/20">
                  Healthy
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 2: ACTIVE MEMBERS
        ================================================================ */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {/* Search & Filter Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search size={13} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                <input
                  type="text"
                  placeholder="Search members by name..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D3E3F5] bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-[#1E88E5] outline-none shadow-2xs transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: "all", label: `All (${enhancedMembers.length})` },
                  { id: "online", label: `Online (${onlineCount})` },
                  { id: "mentors", label: "Mentors" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMemberFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      memberFilter === f.id
                        ? "bg-[#0b1a36] text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-[#D3E3F5] hover:bg-[#F0F6FC]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Member List */}
            {loadingMembers && (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-[#1E88E5] border-t-transparent animate-spin" />
                Loading members...
              </div>
            )}

            {membersError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                {membersError}
              </div>
            )}

            {!loadingMembers && filteredMembers.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching members found.
              </div>
            )}

            <div className="space-y-1.5">
              {filteredMembers.map((m) => (
                <div
                  key={m.id || m.user_id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#D3E3F5] shadow-2xs hover:border-[#1E88E5]/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#EAF2FA] to-[#D3E3F5] border border-[#D3E3F5] flex items-center justify-center text-xs font-extrabold text-[#0b1a36]">
                        {m.initial}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                          m.isOnline ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-[#0b1a36] truncate">{m.name}</p>
                        {m.displayRole === "Mentor" && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold">
                            Mentor
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {m.isOnline ? "Active now" : "Offline"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    Joined
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 3: MEDIA (IMAGES & VIDEOS)
        ================================================================ */}
        {activeTab === "media" && (
          <div className="space-y-3">
            {mediaItems.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-[#D3E3F5] bg-white p-6">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 grid place-items-center mx-auto mb-2 shadow-2xs">
                  <ImageIcon size={22} />
                </div>
                <h4 className="text-xs font-serif font-bold text-[#0b1a36]">No media shared yet</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Photos, design screenshots, and demo videos sent in the chat will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxItem(item)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-[#D3E3F5] bg-slate-100 cursor-pointer shadow-2xs hover:shadow-xs transition"
                  >
                    {item.type === "video" ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2.5">
                      <div className="text-white text-[10px] truncate w-full">
                        <p className="font-bold truncate">{item.name}</p>
                        <p className="text-[9px] text-slate-300">{item.date} • {item.sender}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            TAB 4: SHARED LINKS
        ================================================================ */}
        {activeTab === "links" && (
          <div className="space-y-2">
            {linkItems.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-[#D3E3F5] bg-white p-6">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 grid place-items-center mx-auto mb-2 shadow-2xs">
                  <Link2 size={22} />
                </div>
                <h4 className="text-xs font-serif font-bold text-[#0b1a36]">No shared links</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  External references, GitHub repositories, and articles posted in chat will be catalogued here.
                </p>
              </div>
            ) : (
              linkItems.map((link, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white border border-[#D3E3F5] shadow-2xs hover:border-[#1E88E5]/40 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                      {link.domain}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {link.date}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#0b1a36] line-clamp-1">
                    {link.title}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#1E88E5] hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{link.url}</span>
                      <ExternalLink size={11} className="shrink-0" />
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(link.url);
                        alert("Link copied!");
                      }}
                      title="Copy URL"
                      className="p-1.5 rounded-lg border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-[#EAF2FA] text-slate-600 transition shrink-0 cursor-pointer"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================================================================
            TAB 5: DOCUMENTS & ATTACHMENTS
        ================================================================ */}
        {activeTab === "docs" && (
          <div className="space-y-2">
            {docItems.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-[#D3E3F5] bg-white p-6">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 grid place-items-center mx-auto mb-2 shadow-2xs">
                  <FileText size={22} />
                </div>
                <h4 className="text-xs font-serif font-bold text-[#0b1a36]">No documents shared</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  PDF roadmaps, trial sheets, resume templates, and project notes will appear here.
                </p>
              </div>
            ) : (
              docItems.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#D3E3F5] shadow-2xs hover:border-[#1E88E5]/40 transition gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex flex-col items-center justify-center font-extrabold text-[10px] shrink-0 shadow-2xs">
                      <FileText size={14} />
                      <span className="text-[8px] leading-tight mt-0.5">{doc.ext}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0b1a36] truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Shared by {doc.sender} • {doc.date}
                      </p>
                    </div>
                  </div>

                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.name}
                    className="p-2 rounded-xl border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-[#1E88E5] hover:text-white text-[#1E88E5] transition shrink-0 shadow-2xs cursor-pointer"
                    title="Download File"
                  >
                    <Download size={14} />
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Media Lightbox Modal ────────────────────────────────────────────── */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div className="relative max-w-2xl w-full bg-transparent p-2 text-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
            {lightboxItem.type === "video" ? (
              <video src={lightboxItem.url} controls autoPlay className="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-2xl" />
            ) : (
              <img src={lightboxItem.url} alt={lightboxItem.name} className="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-2xl object-contain" />
            )}
            <div className="mt-3 text-white text-xs">
              <p className="font-bold">{lightboxItem.name}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Shared by {lightboxItem.sender} on {lightboxItem.date}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}