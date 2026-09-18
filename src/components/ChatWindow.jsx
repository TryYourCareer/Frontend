/**
 * ChatWindow — real-time chat UI for a single community.
 *
 * Props:
 *   community     CommunityOut
 *   currentUserId string
 *   onBack        () => void   (mobile back button)
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Send, Paperclip, Info, LogOut } from "lucide-react";
import useCommunityMessages from "../hooks/useCommunityMessages";
import MessageBubble from "./MessageBubble";
import CommunityInfo from "./CommunityInfo";
import api from "../lib/api";

function ChatMessagesSkeleton() {
  return (
    <div className="space-y-4 p-2 animate-pulse">
      <div className="flex justify-start">
        <div className="max-w-[70%] space-y-2 bg-white border border-[#D3E3F5] rounded-3xl rounded-tl-sm p-4 shadow-2xs">
          <div className="h-3 w-24 bg-slate-200 rounded-md" />
          <div className="h-3 w-48 bg-slate-100 rounded-md" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[70%] space-y-2 bg-[#EAF2FA] border border-[#D3E3F5] rounded-3xl rounded-tr-sm p-4 shadow-2xs">
          <div className="h-3 w-36 bg-blue-200/70 rounded-md" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[70%] space-y-2 bg-white border border-[#D3E3F5] rounded-3xl rounded-tl-sm p-4 shadow-2xs">
          <div className="h-3 w-20 bg-slate-200 rounded-md" />
          <div className="h-3 w-56 bg-slate-100 rounded-md" />
          <div className="h-3 w-40 bg-slate-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ community, currentUserId, onBack, onMemberChange, onLeave }) {
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  const { messages, loading, error, hasMore, loadingMore, loadMore, deleteMessage } =
    useCommunityMessages(community?.id);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null); // { file, name, type, previewUrl }
  const [replyTo, setReplyTo] = useState(null); // message object

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up selected file object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (selectedFile?.previewUrl) {
        URL.revokeObjectURL(selectedFile.previewUrl);
      }
    };
  }, [selectedFile]);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type = "file";
    if (file.type.startsWith("image/")) {
      type = "image";
    } else if (file.type.startsWith("video/")) {
      type = "video";
    } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      type = "pdf";
    }

    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }

    setSelectedFile({
      file,
      name: file.name,
      type,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    });
  };

  const handleCancelFile = () => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // -----------------------------------------------------------------------
  // Send a new message
  // -----------------------------------------------------------------------
  const handleSend = async () => {
    const content = text.trim();
    if ((!content && !selectedFile) || sending) return;
    setSending(true);
    setSendError(null);
    setText("");

    let uploadedAttachment = null;
    const currentFile = selectedFile;
    const currentReplyTo = replyTo;

    if (currentFile) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    if (currentReplyTo) {
      setReplyTo(null);
    }

    try {
      if (currentFile) {
        const formData = new FormData();
        formData.append("file", currentFile.file);
        const uploadRes = await api.upload("/api/communities/upload", formData);
        uploadedAttachment = {
          url: uploadRes.url,
          type: uploadRes.type,
          name: uploadRes.name,
        };
      }

      let finalContent = content || "";
      if (currentReplyTo) {
        const cleanContent = currentReplyTo.content
          ? currentReplyTo.content.replace(/^↳ Replying to @[^:]+:[^\n]+\n\n/, "")
          : "";
        const replyPreview = cleanContent
          ? cleanContent.substring(0, 60).replace(/\n/g, " ")
          : (currentReplyTo.attachment_url ? `[${currentReplyTo.attachment_type || "Attachment"}]` : "");
        finalContent = `↳ Replying to @${currentReplyTo.user_name || "User"}: ${replyPreview}\n\n${finalContent}`;
      }

      await api.post(`/api/communities/${community.id}/messages`, {
        content: finalContent,
        attachment_url: uploadedAttachment?.url || null,
        attachment_type: uploadedAttachment?.type || null,
        attachment_name: uploadedAttachment?.name || null,
      });
      // Realtime will push the new message via the subscription
    } catch (err) {
      setSendError(err.message || "Failed to send message.");
      if (currentFile) {
        setSelectedFile(currentFile);
      } else {
        setText(content); // restore
      }
      if (currentReplyTo) {
        setReplyTo(currentReplyTo);
      }
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
    
    const replyRegex = /^↳ Replying to @([^:]+): ([^\n]+)\n\n([\s\S]*)$/;
    const match = msg.content?.match(replyRegex);
    setEditText(match ? match[3] : msg.content);
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;
    try {
      const msg = messages.find((m) => m.id === editingId);
      let newContent = editText.trim();
      if (msg) {
        const replyRegex = /^↳ Replying to @([^:]+): ([^\n]+)\n\n([\s\S]*)$/;
        const match = msg.content?.match(replyRegex);
        if (match) {
          newContent = `↳ Replying to @${match[1]}: ${match[2]}\n\n${newContent}`;
        }
      }
      await api.patch(`/api/messages/${editingId}`, { content: newContent });
      setEditingId(null);
      setEditText("");
    } catch (err) {
      setSendError(err.message || "Failed to edit message.");
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  // -----------------------------------------------------------------------
  // Delete a message
  // -----------------------------------------------------------------------
  const handleDelete = async (messageId, mode = "everyone") => {
    try {
      await deleteMessage(messageId, mode);
    } catch (err) {
      setSendError(err.message || "Failed to delete message.");
    }
  };

  // -----------------------------------------------------------------------
  // Leave Community
  // -----------------------------------------------------------------------
  const handleLeaveCommunity = async () => {
    if (leaving || !community?.id) return;
    setLeaving(true);
    setLeaveError(null);
    try {
      await api.delete(`/api/communities/${community.id}/leave`);
      setShowLeaveConfirm(false);
      setShowInfoPanel(false);
      if (onMemberChange) {
        onMemberChange(community, false);
      } else if (onLeave) {
        onLeave(community);
      }
    } catch (err) {
      setLeaveError(err.message || "Failed to leave hub.");
    } finally {
      setLeaving(false);
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
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-[#f7fafd] via-[#eef4fc] to-[#e4eef9]">
      {/* WhatsApp Channel Header */}
      <header className="shrink-0 z-10 flex items-center justify-between border-b border-[#D3E3F5] bg-white px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3 cursor-pointer group min-w-0 flex-1" onClick={() => setShowInfoPanel(true)}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D3E3F5] bg-white text-[#0b1a36] hover:bg-[#F0F6FC] transition cursor-pointer shrink-0"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full bg-[#F0F6FC] border border-[#D3E3F5] flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition">
              {community.career_icon || "🎓"}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-[#0b1a36] leading-tight group-hover:text-[#1E88E5] transition truncate">
              {community.career_name || community.name}
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              {(community.member_count || 0).toLocaleString()} {(community.member_count || 0) === 1 ? "follower" : "followers"}
            </p>
          </div>
        </div>

        {/* Right header actions: Hub Info */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowInfoPanel(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-sky-50 text-[#0b1a36] text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Info size={14} className="text-[#1E88E5]" />
            <span className="hidden sm:inline">Hub Info</span>
          </button>
        </div>
      </header>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="shrink-0 flex justify-center py-2 bg-[#F0F6FC]/50">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-[11px] font-semibold text-[#1E88E5] hover:underline flex items-center gap-1 cursor-pointer"
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

        {loading && <ChatMessagesSkeleton />}

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
            onReply={handleReply}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Edit mode banner */}
      {editingId && (
        <div className="shrink-0 mx-4 mb-2 p-2.5 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#1E88E5]">Editing message</p>
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
              className="px-3 py-1 bg-[#1E88E5] text-white text-[10px] font-bold rounded-full hover:bg-blue-600 cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={() => { setEditingId(null); setEditText(""); }}
              className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reply banner */}
      {replyTo && (
        <div className="shrink-0 mx-4 mb-2 p-2.5 bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl flex items-center justify-between gap-3 animate-fade-in z-10 shadow-2xs">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-500">
              Replying to <span className="text-[#1E88E5]">@{replyTo.user_name || "User"}</span>
            </p>
            <p className="text-xs text-slate-600 truncate mt-0.5">
              {replyTo.content ? replyTo.content.replace(/^↳ Replying to @[^:]+:[^\n]+\n\n/, "") : (replyTo.attachment_url ? `[${replyTo.attachment_type || "Attachment"}]` : "")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="text-xs text-red-500 hover:text-red-700 px-2.5 py-1 rounded-xl hover:bg-red-50 transition shrink-0 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Send error */}
      {sendError && (
        <p className="shrink-0 text-center text-[10px] text-red-500 px-4 pb-1">{sendError}</p>
      )}

      {/* Selected file preview */}
      {selectedFile && (
        <div className="shrink-0 mx-4 mb-2 p-2.5 bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl flex items-center justify-between gap-3 animate-fade-in z-10 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            {selectedFile.type === "image" && selectedFile.previewUrl ? (
              <img
                src={selectedFile.previewUrl}
                alt="Upload preview"
                className="h-10 w-10 object-cover rounded-xl border border-[#D3E3F5]"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl border border-[#D3E3F5] bg-white flex items-center justify-center text-lg shrink-0 shadow-2xs">
                {selectedFile.type === "video" ? "🎥" : selectedFile.type === "pdf" ? "📄" : "📁"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#0b1a36] truncate">{selectedFile.name}</p>
              <p className="text-[9px] text-slate-400 capitalize">{selectedFile.type}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelFile}
            className="text-xs text-red-500 hover:text-red-700 px-2.5 py-1 rounded-xl hover:bg-red-50 transition shrink-0 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input bar */}
      <footer className="shrink-0 z-10 bg-white border-t border-[#D3E3F5] p-3.5 flex items-center gap-2.5 shadow-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleAttachmentClick}
          disabled={sending || !!editingId}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-[#EAF2FA] text-slate-600 shadow-2xs transition disabled:opacity-40 cursor-pointer"
        >
          <Paperclip size={14} className="text-[#1E88E5]" />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Write a message..."
          value={editingId ? "" : text}
          disabled={!!editingId}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !editingId && handleSend()}
          className="flex-1 px-4 py-2.5 rounded-full border border-[#D3E3F5] bg-[#F0F6FC] text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E88E5] focus:bg-white transition disabled:opacity-40 shadow-2xs"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !!editingId || (!text.trim() && !selectedFile)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b1a36] hover:bg-[#122b59] text-white shadow-xs transition disabled:opacity-40 cursor-pointer"
        >
          {sending
            ? <Loader2 size={14} className="animate-spin" />
            : <Send size={14} />
          }
        </button>
      </footer>
      {showInfoPanel && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowInfoPanel(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <CommunityInfo
              community={community}
              messages={messages}
              onBack={() => setShowInfoPanel(false)}
              onLeave={(comm) => {
                setShowInfoPanel(false);
                if (onMemberChange) onMemberChange(comm, false);
                else if (onLeave) onLeave(comm);
              }}
            />
          </div>
        </div>
      )}

      {/* Leave Hub Confirmation Modal */}
      {showLeaveConfirm && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => !leaving && setShowLeaveConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
              <LogOut size={22} />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#0b1a36]">
                Leave {community.name}?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                You will no longer receive live chat messages or mentor updates in this hub. You can freely rejoin anytime from the Directory.
              </p>
            </div>
            {leaveError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold text-left">
                {leaveError}
              </p>
            )}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={leaving}
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={leaving}
                onClick={handleLeaveCommunity}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {leaving ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                {leaving ? "Leaving..." : "Yes, Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}