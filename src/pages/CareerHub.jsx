import { useEffect, useMemo, useState } from "react";
import { isFirebaseReady, saveDocument, addDocument, getDocuments } from "../utils/firebaseStorage";

const hubData = [
  {
    id: "software-engineering",
    name: "Software Engineering",
    description: "Live discussion for learners building software careers.",
    explorers: 1240,
    status: "Active",
  },
  {
    id: "ux-design",
    name: "UX Design",
    description: "Share design thinking, prototyping tips, and portfolio advice.",
    explorers: 892,
    status: "Growing",
  },
  {
    id: "product-management",
    name: "Product Management",
    description: "Connect with aspiring PMs and learn roadmaps, discovery, and impact.",
    explorers: 650,
    status: "Trending",
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Explore analytics, machine learning, and real-world data stories.",
    explorers: 430,
    status: "Rising",
  },
];

const discussions = [
  {
    id: 1,
    user: "Aarav",
    time: "2m ago",
    message: "Which project should I start to learn React hooks more deeply?",
  },
  {
    id: 2,
    user: "Riya",
    time: "8m ago",
    message: "Anyone here preparing for software internships in Mumbai?",
  },
  {
    id: 3,
    user: "Sam",
    time: "14m ago",
    message: "How do you manage study time with college assignments?",
  },
];

const communityTips = [
  "Ask questions openly and share the exact problem you’re solving.",
  "Post your mini project updates to get feedback from peers.",
  "Use the hub to find study buddies and review each other’s work.",
];

export default function CareerHub({ theme = "light", onBack }) {
  const isDark = theme === "dark";
  const [activeHubId, setActiveHubId] = useState(hubData[0].id);
  const [message, setMessage] = useState("");
  const [postStatus, setPostStatus] = useState("");
  const [savingMessage, setSavingMessage] = useState(false);
  const [liveMessages, setLiveMessages] = useState(discussions);

  useEffect(() => {
    if (!isFirebaseReady) {
      return;
    }

    const syncFirebase = async () => {
      try {
        await Promise.all(
          hubData.map((hub) => saveDocument("careerHubs", hub.id, {
            ...hub,
            syncedAt: new Date().toISOString(),
          }))
        );

        const fbMessages = await getDocuments("careerHubMessages", 50);
        if (fbMessages && fbMessages.length > 0) {
          setLiveMessages(fbMessages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
        }
      } catch {
        // Ignore cloud sync failures.
      }
    };

    syncFirebase();
  }, []);

  const activeHub = useMemo(
    () => hubData.find((hub) => hub.id === activeHubId) || hubData[0],
    [activeHubId]
  );

  return (
    <div className={`min-h-screen px-4 py-8 sm:px-6 lg:px-10 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#f3f6fb] text-slate-900"}`}>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#3a5a91]">Career Hubs</p>
            <h1 className="mt-3 text-3xl font-black text-[#0f2140] sm:text-4xl">Connect with learners exploring the same path</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#566d90] sm:text-base">
              Browse curated hubs, join live conversations, and grow with peers on your career journey.
            </p>
          </div>
          <button
            onClick={onBack}
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ${isDark ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" : "border border-[#d2d9ea] bg-white text-[#3d4f71] hover:bg-[#eef2f9]"}`}
          >
            Back to Home
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.1fr] xl:grid-cols-[0.8fr_1.2fr]">
          <aside className={`space-y-6 rounded-[32px] p-5 shadow-[0_15px_40px_rgba(58,84,136,0.08)] sm:p-6 lg:sticky lg:top-8 ${isDark ? "border border-slate-700 bg-slate-900" : "border border-[#dce4f2] bg-white"}`}>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5b79a4]">Career Hubs</p>
              <h2 className="mt-2 text-xl font-bold text-[#112749]">Choose a community</h2>
            </div>
            <div className="space-y-3">
              {hubData.map((hub) => (
                <button
                  key={hub.id}
                  onClick={() => setActiveHubId(hub.id)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                    activeHubId === hub.id
                      ? "border-[#3b6de1] bg-[#eef4ff] shadow-[0_10px_30px_rgba(59,109,225,0.14)]"
                      : "border-[#e3e9f3] bg-white hover:border-[#c7d2ea] hover:bg-[#f7f9ff]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#162a51]">{hub.name}</p>
                      <p className="mt-1 text-xs text-[#6a7b9f]">{hub.explorers} explorers</p>
                    </div>
                    <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3b6de1]">
                      {hub.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#5e728f]">{hub.description}</p>
                </button>
              ))}
            </div>
          </aside>

          <main className="space-y-6">
            <div className={`rounded-[32px] p-6 shadow-[0_15px_40px_rgba(58,84,136,0.08)] sm:p-8 ${isDark ? "border border-slate-700 bg-slate-900" : "border border-[#dce4f2] bg-white"}`}>
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#4b6a99]">{activeHub.name}</p>
                  <h2 className="mt-3 text-3xl font-black text-[#0f2140]">Welcome to the {activeHub.name} hub</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4f658a]">
                    Connect with peers exploring the same career path, ask questions, and share progress.
                  </p>
                </div>
                <div className="rounded-3xl bg-[#eef4ff] px-5 py-4 text-sm text-[#1f3e82] shadow-sm">
                  <p className="text-xs uppercase tracking-[0.32em] text-[#3b6de1]">Live explorers</p>
                  <p className="mt-2 text-3xl font-black">{activeHub.explorers}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
              <section className="space-y-6 rounded-[32px] border border-[#dce4f2] bg-white p-6 shadow-[0_15px_40px_rgba(58,84,136,0.06)] sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#152242]">Live discussion</h3>
                    <p className="mt-2 text-sm text-[#5c728f]">Post updates, ask questions, and learn from peer experience.</p>
                  </div>
                  <span className="rounded-full bg-[#f0f7ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#3f67b0]">
                    Active now
                  </span>
                </div>

                <div className="space-y-4">
                  {liveMessages.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-[#e6edf7] bg-[#f8fbff] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1f3e70]">{item.user || "Guest"}</p>
                          <p className="text-xs text-[#6c7d9d]">{item.time || "Just now"}</p>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6a99]">Message</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#455c84]">{item.message}</p>
                    </div>
                  ))}
                </div>

                <div className={`rounded-[24px] p-4 ${isDark ? "border border-slate-700 bg-slate-950 text-slate-300" : "border border-[#e2e8f2] bg-[#fafbff] text-[#425672]"}`}>
                  <p className="text-sm font-semibold text-[#3f587f]">Share your thoughts</p>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write a quick update or ask a question..."
                    className="mt-3 h-28 w-full resize-none rounded-3xl border border-[#d7dce8] bg-white p-4 text-sm text-[#233253] outline-none focus:border-[#3b6de1] focus:ring-2 focus:ring-[#dbe7ff]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!message.trim()) {
                        setPostStatus("Type a message before posting.");
                        return;
                      }
                      setSavingMessage(true);
                      setPostStatus("");
                      try {
                        const docId = await addDocument("careerHubMessages", {
                          hubId: activeHubId,
                          user: "Guest",
                          time: "Just now",
                          message: message.trim(),
                        });
                        if (docId) {
                          setPostStatus("Your message was saved to Firebase.");
                        } else {
                          setPostStatus("Firebase is not configured.");
                        }
                        setMessage("");
                      } catch {
                        setPostStatus("Unable to save the message right now.");
                      } finally {
                        setSavingMessage(false);
                      }
                    }}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-[#3b6de1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3159bf]"
                  >
                    {savingMessage ? "Posting..." : "Post to hub"}
                  </button>
                <div className="mt-2 text-sm text-[#3b587f]">{postStatus}</div>
                </div>
              </section>

              <aside className="space-y-6 rounded-[32px] border border-[#dce4f2] bg-white p-6 shadow-[0_15px_40px_rgba(58,84,136,0.06)] sm:p-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#4b6a99]">About this hub</p>
                  <p className="mt-3 text-sm leading-7 text-[#4f658a]">A student-friendly community for aspiring professionals, peer support, and real-world career advice.</p>
                </div>
                <div className="rounded-[24px] bg-[#f8fbff] p-5">
                  <p className="text-sm font-semibold text-[#1f3e72]">Community tips</p>
                  <ul className="mt-4 space-y-3 text-sm text-[#4e668d]">
                    {communityTips.map((tip) => (
                      <li key={tip} className="rounded-2xl border border-[#e7effb] bg-white px-4 py-3">{tip}</li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
