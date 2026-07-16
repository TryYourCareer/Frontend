/**
 * ChatWindow — real-time chat UI for a single community.
 *
 * Props:
 *   community     CommunityOut
 *   currentUserId string
 *   onBack        () => void   (mobile back button)
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Info, Loader2, Send } from "lucide-react";
import useCommunityMessages from "../hooks/useCommunityMessages";
import MessageBubble from "./MessageBubble";
import api from "../lib/api";

export default function ChatWindow({ community, currentUserId, onBack }) {
  const { messages, loading, error, hasMore, loadingMore, loadMore } =
    useCommunityMessages(community?.id);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -----------------------------------------------------------------------
  // Send a new message
  // -----------------------------------------------------------------------
  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError(null);
    setText("");
    try {
      await api.post(`/api/communities/${community.id}/messages`, { content });
      // Realtime will push the new message via the subscription
    } catch (err) {
      setSendError(err.message || "Failed to send message.");
      setText(content); // restore
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // -----------------------------------------------------------------------
  // Edit a message
  // -----------------------------------------------------------------------
  const handleEdit = (messageId) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    setEditingId(messageId);
    setEditText(msg.content);
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;
    try {
      await api.patch(`/api/messages/${editingId}`, { content: editText.trim() });
      setEditingId(null);
      setEditText("");
    } catch (err) {
      setSendError(err.message || "Failed to edit message.");
    }
  };

  // -----------------------------------------------------------------------
  // Delete a message
  // -----------------------------------------------------------------------
  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/api/messages/${messageId}`);
    } catch (err) {
      setSendError(err.message || "Failed to delete message.");
    }
  };

  if (!community) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-400 text-sm">
        Select a community to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="shrink-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-lg border border-slate-200">
            {community.career_icon || "💬"}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-none">
              {community.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {(community.member_count || 0).toLocaleString()} members
            </p>
          </div>
        </div>
        <button className="p-1.5 rounded-full hover:bg-slate-50 text-slate-500 transition">
          <Info size={16} />
        </button>
      </header>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="shrink-0 flex justify-center py-2 bg-[#FAF6EC]/40">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-[11px] font-semibold text-[#0b1a36] hover:underline flex items-center gap-1"
          >
            {loadingMore ? <Loader2 size={12} className="animate-spin" /> : null}
            Load older messages
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

        {loading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        )}

        {error && !loading && (
          <div className="flex justify-center">
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="text-4xl">💬</span>
            <p className="text-sm font-semibold text-slate-500">No messages yet</p>
            <p className="text-xs text-slate-400">Be the first to say something!</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Edit mode banner */}
      {editingId && (
        <div className="shrink-0 mx-4 mb-2 p-2.5 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-blue-700">Editing message</p>
            <input
              className="mt-1 w-full text-xs bg-transparent outline-none text-slate-800"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSubmit();
                if (e.key === "Escape") { setEditingId(null); setEditText(""); }
              }}
              autoFocus
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleEditSubmit}
              className="px-2.5 py-1 bg-blue-600 text-white text-[10px] rounded-full hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => { setEditingId(null); setEditText(""); }}
              className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-full hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Send error */}
      {sendError && (
        <p className="shrink-0 text-center text-[10px] text-red-500 px-4 pb-1">{sendError}</p>
      )}

      {/* Input bar */}
      <footer className="shrink-0 z-10 bg-white border-t border-slate-200 p-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Write a message..."
          value={editingId ? "" : text}
          disabled={!!editingId}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !editingId && handleSend()}
          className="flex-1 px-3.5 py-2.5 rounded-full border border-slate-300 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition disabled:opacity-40"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !!editingId || !text.trim()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b1a36] hover:bg-[#122b59] text-white shadow-sm transition disabled:opacity-40"
        >
          {sending
            ? <Loader2 size={14} className="animate-spin" />
            : <Send size={14} />
          }
        </button>
      </footer>
    </div>
  );
}
