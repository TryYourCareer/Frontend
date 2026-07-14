import { useEffect, useMemo, useState, useRef } from "react";
import {
  Users, Send, ArrowLeft, Paperclip, Image, Video,
  Search, Check, Smile, MoreVertical, Info, X
} from "lucide-react";

const hubData = [
  { id: "software-engineering", name: "Software Engineering", description: "Discussing compilers, React rendering, systems, and job search.", explorers: 1240, status: "Active", icon: "💻", unread: 2 },
  { id: "ux-design", name: "UX Design & Figma", description: "Design systems, usability tests, and design portfolios.", explorers: 892, status: "Growing", icon: "🎨", unread: 0 },
  { id: "product-management", name: "Product Management", description: "Roadmaps, Agile discovery, product market fit.", explorers: 650, status: "Trending", icon: "📋", unread: 5 },
  { id: "data-science", name: "Data Science & AI", description: "Machine learning datasets, pipelines, and insights.", explorers: 430, status: "Rising", icon: "📊", unread: 1 },
];

const initialMessages = {
  "software-engineering": [
    { id: 1, user: "Aarav", time: "11:42 AM", message: "Hey everyone! I just finished refactoring my React state management. What project architecture are you all using?", initials: "A", self: false, color: "from-[#ff9a9e] to-[#fecfef]" },
    { id: 2, user: "Riya", time: "11:45 AM", message: "Personally, I've been using clean architecture with context providers. Let me send a screenshot of my directory setup.", initials: "R", self: false, color: "from-[#a1c4fd] to-[#c2e9fb]" },
    { id: 3, user: "Riya", time: "11:46 AM", message: "", initials: "R", self: false, color: "from-[#a1c4fd] to-[#c2e9fb]", media: { type: "image", url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop" } },
    { id: 4, user: "You", time: "11:48 AM", message: "Nice setup! The directory nesting looks clean. I usually separate utilities from hooks.", initials: "Y", self: true, color: "from-[#f6d365] to-[#fda085]" },
  ],
  "ux-design": [
    { id: 1, user: "Neha", time: "10:15 AM", message: "Check out this quick interaction animation I made in Figma for a login page transitions!", initials: "N", self: false, color: "from-[#cfd9df] to-[#e2ebf0]" },
    { id: 2, user: "Neha", time: "10:16 AM", message: "", initials: "N", self: false, color: "from-[#cfd9df] to-[#e2ebf0]", media: { type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-a-computer-40348-large.mp4" } },
    { id: 3, user: "Sam", time: "10:30 AM", message: "The spring dynamics look incredibly smooth. What easement curve did you use?", initials: "S", self: false, color: "from-[#fda085] to-[#f6d365]" },
  ],
  "product-management": [
    { id: 1, user: "Vikram", time: "09:00 AM", message: "Does anyone have a standard PRD template they love using? Starting a new project.", initials: "V", self: false, color: "from-[#84fab0] to-[#8fd3f4]" },
    { id: 2, user: "Preeti", time: "09:12 AM", message: "We use a customized version of the Linear template. Let me share it here.", initials: "P", self: false, color: "from-[#a6c0fe] to-[#f68084]" },
  ],
  "data-science": [
    { id: 1, user: "Kabir", time: "Yesterday", message: "Evaluating PyTorch vs JAX for a new computer vision project. Any benchmarks?", initials: "K", self: false, color: "from-[#e2ebf0] to-[#cfd9df]" },
  ]
};

export default function CareerHub({ onBack }) {
  const [activeHubId, setActiveHubId] = useState(hubData[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFileType, setAttachedFileType] = useState(null); // 'image' | 'video'
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeHub = useMemo(() => hubData.find((hub) => hub.id === activeHubId) || hubData[0], [activeHubId]);

  // Filter channels based on search
  const filteredHubs = useMemo(() => {
    return hubData.filter((hub) => hub.name.toLowerCase().includes(searchQuery.toLowerCase()) || hub.description.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  // Scroll to bottom on new message or change hub
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeHubId, chatMessages]);

  const handleSendMessage = () => {
    if (!messageText.trim() && !attachedFile) return;

    const newMsg = {
      id: Date.now(),
      user: "You",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: messageText.trim(),
      self: true,
      initials: "Y",
      color: "from-[#f6d365] to-[#fda085]",
      ...(attachedFile && { media: { type: attachedFileType, url: attachedFile } })
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeHubId]: [...(prev[activeHubId] || []), newMsg]
    }));

    setMessageText("");
    setAttachedFile(null);
    setAttachedFileType(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAttachedFile(url);
    if (file.type.startsWith("image/")) {
      setAttachedFileType("image");
    } else if (file.type.startsWith("video/")) {
      setAttachedFileType("video");
    } else {
      setAttachedFileType("file");
    }
  };

  return (
    <section className="h-[calc(100vh-64px)] bg-[#eef2f6] p-4">
      <div className="mx-auto max-w-7xl h-full flex flex-col">

        {/* Header bar */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 transition shadow-sm hover:bg-slate-100"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Career Communities</h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Realtime Hub Discussions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 border border-slate-200 shadow-sm">
            <Users size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold text-slate-700">Online Community</span>
          </div>
        </div>

        {/* Telegram Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] rounded-[28px] border border-slate-250 bg-white overflow-hidden shadow-[0_20px_50px_rgba(15,35,80,0.06)] flex-1 min-h-0">

          {/* Channels Sidebar List */}
          <aside className="border-r border-slate-100 flex flex-col h-full bg-[#f8fbff]">
            {/* Sidebar Search */}
            <div className="p-4 border-b border-slate-100 space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-1">
              {filteredHubs.map((hub) => {
                const isActive = activeHubId === hub.id;
                const lastMsgArray = chatMessages[hub.id] || [];
                const lastMsg = lastMsgArray[lastMsgArray.length - 1];

                return (
                  <button
                    key={hub.id}
                    onClick={() => setActiveHubId(hub.id)}
                    className={`w-full rounded-2xl p-3 text-left transition flex items-start gap-3.5 relative ${isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                        : "bg-white hover:bg-slate-50 text-slate-800"
                      }`}
                  >
                    {/* Avatar Icon */}
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl font-bold shadow-sm ${isActive ? "bg-white/20" : "bg-[#edf2ff] text-blue-600"
                      }`}>
                      {hub.icon}
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-slate-800"}`}>{hub.name}</p>
                        <span className={`text-[10px] shrink-0 font-medium ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                          {lastMsg ? lastMsg.time : "Active"}
                        </span>
                      </div>
                      <p className={`mt-1 text-xs truncate leading-normal ${isActive ? "text-blue-50/80" : "text-slate-500"}`}>
                        {lastMsg ? (lastMsg.message || "Sent media file") : hub.description}
                      </p>
                    </div>

                    {/* Unread badge / counts */}
                    {hub.unread > 0 && !isActive && (
                      <span className="absolute bottom-3 right-3 flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white">
                        {hub.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Chat Window Frame */}
          <main className="flex flex-col h-full bg-[#f1f5f9] relative">
            {/* Telegram BG Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Chat Room Header */}
            <header className="z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-600">
                  {activeHub.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 leading-none">{activeHub.name} Chatroom</h3>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {activeHub.explorers.toLocaleString()} members online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition">
                  <Info size={18} />
                </button>
                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            {/* Messages Scroll Feed */}
            <div className="z-10 flex-1 overflow-y-auto p-6 space-y-4">
              {(chatMessages[activeHubId] || []).map((msg) => {
                return (
                  <div key={msg.id} className={`flex items-end gap-2.5 max-w-[75%] ${msg.self ? "ml-auto flex-row-reverse" : ""}`}>

                    {/* User Avatar Circle */}
                    {!msg.self && (
                      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br ${msg.color || "from-blue-500 to-indigo-600"} text-[10px] font-black text-white shadow-sm`}>
                        {msg.initials}
                      </div>
                    )}

                    {/* Bubble Content Body */}
                    <div className={`rounded-3xl px-4 py-3 text-sm shadow-sm relative group ${msg.self
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                      }`}>
                      {/* User title */}
                      {!msg.self && (
                        <p className="text-[10px] font-black text-blue-500 mb-1">{msg.user}</p>
                      )}

                      {/* Attached Media Render */}
                      {msg.media && (
                        <div className="mb-2 overflow-hidden rounded-2xl max-w-sm border border-slate-100/50 bg-slate-950">
                          {msg.media.type === "image" && (
                            <img src={msg.media.url} alt="Attached upload" className="w-full h-auto object-cover max-h-60" />
                          )}
                          {msg.media.type === "video" && (
                            <video src={msg.media.url} controls className="w-full max-h-60" />
                          )}
                        </div>
                      )}

                      {/* Text content */}
                      {msg.message && <p className="leading-relaxed break-words">{msg.message}</p>}

                      {/* Timestamp & Status tick */}
                      <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-60">
                        <span>{msg.time}</span>
                        {msg.self && <Check size={10} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached file upload preview */}
            {attachedFile && (
              <div className="z-10 mx-6 mb-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between gap-3 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    {attachedFileType === "image" ? <Image size={18} /> : <Video size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Attached local {attachedFileType}</p>
                    <p className="text-[10px] text-slate-400">Ready to upload on send</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAttachedFile(null); setAttachedFileType(null); }}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Chat Form Entry Panel */}
            <footer className="z-10 bg-white border-t border-slate-100 p-4 flex items-center gap-3 shadow-md">
              {/* Attachment Clip icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 transition"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />

              {/* Text Area input */}
              <input
                type="text"
                placeholder="Write a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-3 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
              />

              {/* Emoji mockup button */}
              <button className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 transition">
                <Smile size={20} />
              </button>

              {/* Send plane button */}
              <button
                type="button"
                onClick={handleSendMessage}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 hover:-translate-y-0.5"
              >
                <Send size={16} />
              </button>
            </footer>

          </main>
        </div>

      </div>
    </section>
  );
}
