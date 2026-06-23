import { useEffect, useMemo, useState } from "react";
import { Users, TrendingUp, Sparkles, Activity, Send, ArrowLeft, MessageSquare } from "lucide-react";
import { isFirebaseReady, saveDocument, addDocument, getDocuments } from "../utils/firebaseStorage";
const hubData = [
  { id: "software-engineering", name: "Software Engineering", description: "Live discussion for learners building software careers.", explorers: 1240, status: "Active", icon: "💻" },
  { id: "ux-design", name: "UX Design", description: "Share design thinking, prototyping tips, and portfolio advice.", explorers: 892, status: "Growing", icon: "🎨" },
  { id: "product-management", name: "Product Management", description: "Connect with aspiring PMs and learn roadmaps, discovery, and impact.", explorers: 650, status: "Trending", icon: "📋" },
  { id: "data-science", name: "Data Science", description: "Explore analytics, machine learning, and real-world data stories.", explorers: 430, status: "Rising", icon: "📊" },
];

const discussions = [
  { id: 1, user: "Aarav", time: "2m ago", message: "Which project should I start to learn React hooks more deeply?", initials: "A" },
  { id: 2, user: "Riya", time: "8m ago", message: "Anyone here preparing for software internships in Mumbai?", initials: "R" },
  { id: 3, user: "Sam", time: "14m ago", message: "How do you manage study time with college assignments?", initials: "S" },
];

const communityTips = [
  "Ask questions openly and share the exact problem you're solving.",
  "Post your mini project updates to get feedback from peers.",
  "Use the hub to find study buddies and review each other's work.",
];

const statusColors = {
  Active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Growing: "bg-blue-50 text-blue-700 border border-blue-200",
  Trending: "bg-violet-50 text-violet-700 border border-violet-200",
  Rising: "bg-amber-50 text-amber-700 border border-amber-200",
};

export default function CareerHub({ onBack }) {
  const [activeHubId, setActiveHubId] = useState(hubData[0].id);
  const [message, setMessage] = useState("");
  const [postStatus, setPostStatus] = useState("");
  const [savingMessage, setSavingMessage] = useState(false);
  const [liveMessages, setLiveMessages] = useState(discussions);

  useEffect(() => {
    if (!isFirebaseReady) return;
    const syncFirebase = async () => {
      try {
        await Promise.all(hubData.map((hub) => saveDocument("careerHubs", hub.id, { ...hub, syncedAt: new Date().toISOString() })));
        const fbMessages = await getDocuments("careerHubMessages", 50);
        if (fbMessages && fbMessages.length > 0) {
          setLiveMessages(fbMessages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
        }
      } catch { /* ignore */ }
    };
    syncFirebase();
  }, []);

  const activeHub = useMemo(() => hubData.find((hub) => hub.id === activeHubId) || hubData[0], [activeHubId]);

  return (
    <>
      <div className="min-h-screen bg-[#f3f6fb] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-[#3a5a91]" />
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#3a5a91]">Career Hubs</p>
              </div>
              <h1 className="text-2xl font-black text-[#0f2140] sm:text-3xl">Connect with learners exploring the same path</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#566d90] sm:text-base">Browse curated hubs, join live conversations, and grow with peers on your career journey.</p>
            </div>
            <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-[#d2d9ea] bg-white px-4 py-2 text-sm font-semibold text-[#3d4f71] transition hover:bg-[#eef2f9] hover:-translate-y-0.5 shrink-0">
              <ArrowLeft size={15} />
              Back to Home
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.2fr]">

            {/* Hub selector */}
            <aside className="space-y-3 rounded-[28px] border border-[#dce4f2] bg-white p-5 shadow-[0_15px_40px_rgba(58,84,136,0.08)] sm:p-6 lg:sticky lg:top-8 lg:self-start">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#5b79a4]">Choose a community</p>
                <h2 className="mt-1.5 text-lg font-bold text-[#112749]">Career Hubs</h2>
              </div>
              {hubData.map((hub) => (
                <button key={hub.id} onClick={() => setActiveHubId(hub.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5 ${activeHubId === hub.id ? "border-[#3b6de1] bg-[#eef4ff] shadow-[0_8px_24px_rgba(59,109,225,0.18)]" : "border-[#e3e9f3] bg-white hover:border-[#c7d2ea] hover:bg-[#f7f9ff]"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{hub.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-[#162a51]">{hub.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6a7b9f]">
                          <Users size={10} />
                          {hub.explorers.toLocaleString()} explorers
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${statusColors[hub.status]}`}>{hub.status}</span>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#5e728f]">{hub.description}</p>
                </button>
              ))}
            </aside>

            {/* Main hub content */}
            <main className="space-y-5">

              {/* Hub info header */}
              <div className="rounded-[28px] border border-[#dce4f2] bg-white p-6 shadow-[0_15px_40px_rgba(58,84,136,0.08)] sm:p-8">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{activeHub.icon}</span>
                      <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4b6a99]">{activeHub.name}</p>
                    </div>
                    <h2 className="text-2xl font-black text-[#0f2140]">Welcome to the {activeHub.name} hub</h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#4f658a]">Connect with peers exploring the same career path, ask questions, and share progress.</p>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl bg-[#eef4ff] px-5 py-4 sm:shrink-0">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-[#3b6de1]">
                        <Activity size={11} className="cc-pulse-dot" />
                        Live explorers
                      </p>
                      <p className="mt-1 text-3xl font-black text-[#1f3e82]">{activeHub.explorers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discussion + sidebar */}
              <div className="grid gap-5 xl:grid-cols-[1.4fr_0.85fr]">

                {/* Live discussion */}
                <section className="space-y-5 rounded-[28px] border border-[#dce4f2] bg-white p-6 shadow-[0_15px_40px_rgba(58,84,136,0.06)] sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-[#152242]">
                        <MessageSquare size={17} className="text-[#3b6de1]" />
                        Live discussion
                      </h3>
                      <p className="mt-1 text-sm text-[#5c728f]">Post updates, ask questions, and learn from peer experience.</p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 cc-pulse-dot" />
                      Active now
                    </span>
                  </div>

                  <div className="space-y-3">
                    {liveMessages.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-[#e6edf7] bg-[#f8fbff] p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                            {(item.initials || (item.user || "G").charAt(0)).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1f3e70]">{item.user || "Guest"}</p>
                            <p className="flex items-center gap-1 text-xs text-[#6c7d9d]">
                              <Clock size={10} />
                              {item.time || "Just now"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-[#455c84]">{item.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Message input */}
                  <div className="rounded-2xl border border-[#e2e8f2] bg-[#fafbff] p-4">
                    <p className="mb-3 text-sm font-semibold text-[#3f587f]">Share your thoughts</p>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write a quick update or ask a question..."
                      className="h-24 w-full resize-none rounded-xl border border-[#d7dce8] bg-white p-3.5 text-sm text-[#233253] outline-none focus:border-[#3b6de1] focus:ring-2 focus:ring-[#dbe7ff]"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      {postStatus && <p className="text-xs font-semibold text-[#3b587f]">{postStatus}</p>}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!message.trim()) { setPostStatus("Type a message before posting."); return; }
                          setSavingMessage(true);
                          setPostStatus("");
                          try {
                            const docId = await addDocument("careerHubMessages", { hubId: activeHubId, user: "Guest", time: "Just now", message: message.trim() });
                            setPostStatus(docId ? "Message saved!" : "Firebase not configured.");
                            setMessage("");
                          } catch { setPostStatus("Unable to save message."); } finally { setSavingMessage(false); }
                        }}
                        className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#3b6de1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3159bf] hover:-translate-y-0.5"
                      >
                        <Send size={14} />
                        {savingMessage ? "Posting..." : "Post to hub"}
                      </button>
                    </div>
                  </div>
                </section>

                {/* About + tips */}
                <aside className="space-y-5 rounded-[28px] border border-[#dce4f2] bg-white p-6 shadow-[0_15px_40px_rgba(58,84,136,0.06)] sm:p-7">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.32em] text-[#4b6a99]">
                      <Sparkles size={12} />
                      About this hub
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#4f658a]">A student-friendly community for aspiring professionals, peer support, and real-world career advice.</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8fbff] p-4 border border-[#e3edf9]">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#1f3e72]">
                      <TrendingUp size={14} className="text-[#3b6de1]" />
                      Community tips
                    </p>
                    <ul className="mt-3 space-y-2">
                      {communityTips.map((tip, i) => (
                        <li key={tip} className="flex items-start gap-3 rounded-xl border border-[#e7effb] bg-white px-3.5 py-3">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eef4ff] text-[10px] font-black text-[#3b6de1]">{i + 1}</span>
                          <span className="text-xs leading-relaxed text-[#4e668d]">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

function Clock({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
