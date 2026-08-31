/**
 * ChatWindow — real-time chat UI for a single community.
 *
 * Props:
 * community     CommunityOut
 * currentUserId string
 * onBack        () => void   (mobile back button)
 */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Send, Paperclip } from "lucide-react";
import useCommunityMessages from "../hooks/useCommunityMessages";
import MessageBubble from "./MessageBubble";
import CommunityInfo from "./CommunityInfo";
import api from "../lib/api";

export default function ChatWindow({ community, currentUserId, onBack }) {
  const [showInfoPanel, setShowInfoPanel] = useState(false);
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
    } catch (err) {
      setSendError(err.message || "Failed to send message.");
      if (currentFile) {
        setSelectedFile(currentFile);
      } else {
        setText(content);
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

  if (!community) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-400 text-xs sm:text-sm font-sans">
        Select a community to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans">
      {/* Header */}
      <header className="shrink-0 z-10 flex items-center justify-between border-b border-[#D3E3F5] bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfoPanel(true)}>
          <button
            onClick={onBack}
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#D3E3F5] bg-white text-slate-700 hover:bg-[#F0F6FC] transition shadow-2xs"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F0F6FC] text-lg border border-[#D3E3F5] shadow-2xs">
            {community.career_icon || "💬"}
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-[#0b1a36] leading-tight">
              {community.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {(community.member_count || 0).toLocaleString()} members
            </p>
          </div>
        </div>
      </header>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="shrink-0 flex justify-center py-2 bg-[#F0F6FC]/70 border-b border-[#D3E3F5]">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-[11px] font-bold text-[#1E88E5] hover:underline flex items-center gap-1"
          >
            {loadingMore ? <Loader2 size={12} className="animate-spin" /> : null}
            Load older messages
          </button>
        </div>
      )}

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-3 relative bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7]">
        {loading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 size={20} className="animate-spin text-[#1E88E5]" />
          </div>
        )}

        {error && !loading && (
          <div className="flex justify-center">
            <p className="text-xs text-red-600 bg-red-50 px-3.5 py-2 rounded-2xl border border-red-200 shadow-2xs">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-white border border-[#D3E3F5] shadow-xs text-2xl">
              💬
            </div>
            <p className="font-serif text-sm font-bold text-[#0b1a36]">No messages yet</p>
            <p className="text-xs text-slate-500">Be the first to say something in the community!</p>
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
        <div className="shrink-0 mx-4 mb-2 p-3 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1E88E5]">Editing message</p>
            <input
              className="mt-1 w-full text-xs bg-transparent outline-none text-slate-800 font-medium"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditSubmit();
                if (e.key === "Escape") { setEditingId(null); setEditText(""); }
              }}
              autoFocus
            />
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={handleEditSubmit}
              className="px-3 py-1 bg-[#0b1a36] hover:bg-[#122b59] text-white text-[10px] font-bold rounded-full transition shadow-2xs"
            >
              Save
            </button>
            <button
              onClick={() => { setEditingId(null); setEditText(""); }}
              className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-[10px] font-bold rounded-full hover:bg-slate-50 transition shadow-2xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reply banner */}
      {replyTo && (
        <div className="shrink-0 mx-4 mb-2 p-3 bg-white border border-[#D3E3F5] rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-fade-in z-10">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Replying to <span className="text-[#0b1a36]">@{replyTo.user_name || "User"}</span>
            </p>
            <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
              {replyTo.content ? replyTo.content.replace(/^↳ Replying to @[^:]+:[^\n]+\n\n/, "") : (replyTo.attachment_url ? `[${replyTo.attachment_type || "Attachment"}]` : "")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="text-xs font-bold text-red-600 hover:text-red-700 px-2.5 py-1 rounded-full hover:bg-red-50 transition shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Send error */}
      {sendError && (
        <p className="shrink-0 text-center text-[10px] font-semibold text-red-600 px-4 pb-1">{sendError}</p>
      )}

      {/* Selected file preview */}
      {selectedFile && (
        <div className="shrink-0 mx-4 mb-2 p-2.5 bg-white border border-[#D3E3F5] rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-fade-in z-10">
          <div className="flex items-center gap-3 min-w-0">
            {selectedFile.type === "image" && selectedFile.previewUrl ? (
              <img
                src={selectedFile.previewUrl}
                alt="Upload preview"
                className="h-10 w-10 object-cover rounded-xl border border-[#D3E3F5]"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl border border-[#D3E3F5] bg-[#F0F6FC] flex items-center justify-center text-lg shrink-0">
                {selectedFile.type === "video" ? "🎥" : selectedFile.type === "pdf" ? "📄" : "📁"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#0b1a36] truncate">{selectedFile.name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{selectedFile.type}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelFile}
            className="text-xs font-bold text-red-600 hover:text-red-700 px-2.5 py-1 rounded-full hover:bg-red-50 transition shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input bar */}
      <footer className="shrink-0 z-10 bg-white border-t border-[#D3E3F5] p-3 sm:px-6 flex items-center gap-2">
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
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-white text-slate-500 hover:text-slate-800 shadow-2xs transition disabled:opacity-40"
        >
          <Paperclip size={14} />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Write a message..."
          value={editingId ? "" : text}
          disabled={!!editingId}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !editingId && handleSend()}
          className="flex-1 px-4 py-2.5 rounded-full border border-[#D3E3F5] bg-[#F0F6FC] text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition disabled:opacity-40 shadow-2xs"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !!editingId || (!text.trim() && !selectedFile)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b1a36] hover:bg-[#122b59] text-white shadow-xs transition disabled:opacity-40"
        >
          {sending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </footer>

      {showInfoPanel && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs" onClick={() => setShowInfoPanel(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto border-l border-[#D3E3F5]" onClick={(e) => e.stopPropagation()}>
            <CommunityInfo community={community} onBack={() => setShowInfoPanel(false)} />
          </div>
        </div>
      )}
    </div>
  );
}