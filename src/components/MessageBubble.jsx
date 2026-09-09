/**
 * MessageBubble — single chat message bubble.
 *
 * Props:
 *  message        MessageOut
 *  currentUserId  string
 *  onEdit       (messageId: string) => void
 *  onDelete     (messageId: string) => void
 */
import { useState } from "react";
import { MoreVertical, Edit2, Trash2, Check, CornerUpLeft, Download } from "lucide-react";

const INITIALS_COLORS = [
  "from-sky-300 to-blue-400",
  "from-indigo-200 to-sky-300",
  "from-emerald-200 to-teal-300",
  "from-amber-200 to-orange-300",
  "from-purple-200 to-indigo-300",
  "from-slate-200 to-sky-200",
  "from-sky-200 to-slate-200",
];

function colorForUser(userId) {
  if (!userId) return INITIALS_COLORS[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
}

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function MessageBubble({ message, currentUserId, onEdit, onDelete, onReply }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isSelf = String(message.user_id) === String(currentUserId);
  const displayName = message.user_name || "Unknown User";

  const replyRegex = /^↳ Replying to @([^:]+): ([^\n]+)\n\n([\s\S]*)$/;
  const match = message.content?.match(replyRegex);
  const replyInfo = match ? { user: match[1], text: match[2] } : null;
  const displayContent = match ? match[3] : message.content;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
  const gradColor = colorForUser(message.user_id);

  if (message.deleted_for_me) {
    return null;
  }

  if (message.deleted) {
    return (
      <div className={`flex max-w-[80%] ${isSelf ? "ml-auto justify-end" : ""}`}>
        <div
          className={`rounded-2xl border px-3.5 py-2 text-[11px] italic text-slate-500 bg-slate-50 border-[#D3E3F5] shadow-2xs ${
            isSelf ? "text-right" : "text-left"
          }`}
        >
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-end gap-2 max-w-[80%] ${isSelf ? "ml-auto flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {!isSelf && (
        <div
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradColor} text-[10px] font-bold text-[#0b1a36] border border-white shadow-2xs`}
        >
          {initials}
        </div>
      )}

      {/* Bubble */}
      <div className={`relative ${isSelf ? "ml-auto text-right" : "text-left"}`}>
        <div
          className={`rounded-3xl px-4 py-3 text-xs shadow-2xs ${
            isSelf
              ? "bg-[#1E88E5] text-white border border-[#1E88E5] rounded-br-none text-right"
              : "bg-white text-slate-800 rounded-bl-none border border-[#D3E3F5] text-left"
          }`}
        >
          {!isSelf && (
            <p className="text-[9px] font-bold text-[#1E88E5] mb-1">
              {displayName}
            </p>
          )}
          {replyInfo && (
            <div className={`mb-2 px-2.5 py-1.5 rounded-xl border-l-2 text-[10px] max-w-full truncate ${
              isSelf ? "bg-black/10 border-white/60 text-sky-100" : "bg-[#F0F6FC] border-[#1E88E5] text-slate-600"
            }`}>
              <span className="font-bold">@{replyInfo.user}</span>: {replyInfo.text}
            </div>
          )}
          {displayContent && (
            <p className="leading-relaxed break-words whitespace-pre-wrap">{displayContent}</p>
          )}

          {message.attachment_url && (
            <div className={`mt-2.5 rounded-2xl overflow-hidden border max-w-[280px] ${
              isSelf ? "border-white/20 bg-black/10" : "border-[#D3E3F5] bg-[#F0F6FC]"
            }`}>
              {message.attachment_type === "image" && (
                <a
                  href={message.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-90 transition"
                >
                  <img
                    src={message.attachment_url}
                    alt={message.attachment_name || "Attachment"}
                    className="max-h-48 object-cover w-full rounded-2xl"
                  />
                </a>
              )}
              {message.attachment_type === "video" && (
                <video
                  src={message.attachment_url}
                  controls
                  className="max-h-48 w-full rounded-2xl bg-black"
                />
              )}
              {(message.attachment_type === "pdf" || message.attachment_type === "file") && (
                <a
                  href={message.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 p-3 text-[11px] font-semibold transition ${
                    isSelf ? "text-white hover:bg-black/10" : "text-[#0b1a36] hover:bg-[#EAF2FA]"
                  }`}
                >
                  <span className="text-lg">{message.attachment_type === "pdf" ? "📄" : "📁"}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate ${isSelf ? "text-white" : "text-slate-800"}`}>{message.attachment_name || "Download Attachment"}</p>
                    <p className={`text-[9px] capitalize ${isSelf ? "text-sky-200" : "text-slate-400"}`}>{message.attachment_type}</p>
                  </div>
                </a>
              )}
            </div>
          )}

          <div className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${
            isSelf ? "text-sky-100" : "text-slate-400"
          }`}>
            <span>{formatTime(message.created_at)}</span>
            {message.edited_at && <span className="italic">(edited)</span>}
            {isSelf && <Check size={10} className="text-sky-100" />}
          </div>
        </div>

        {/* Context menu — visible on hover for everyone */}
        <div className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-full bg-white border border-[#D3E3F5] shadow-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <MoreVertical size={12} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-7 bg-white border border-[#D3E3F5] rounded-2xl shadow-xl py-1.5 z-30 min-w-[140px]"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => { setMenuOpen(false); onReply?.(message); }}
                  className="flex items-center gap-2 px-3.5 py-2 w-full text-left text-xs font-medium text-slate-700 hover:bg-[#F0F6FC] cursor-pointer"
                >
                  <CornerUpLeft size={13} className="text-[#1E88E5]" /> Reply
                </button>

                {message.attachment_url && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      const link = document.createElement("a");
                      link.href = message.attachment_url;
                      link.download = message.attachment_name || "download";
                      link.target = "_blank";
                      link.rel = "noopener noreferrer";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 w-full text-left text-xs font-medium text-slate-700 hover:bg-[#F0F6FC] cursor-pointer"
                  >
                    <Download size={13} className="text-[#1E88E5]" /> Download
                  </button>
                )}

                {isSelf && (
                  <>
                    {!message.attachment_url && (
                      <button
                        onClick={() => { setMenuOpen(false); onEdit?.(message.id); }}
                        className="flex items-center gap-2 px-3.5 py-2 w-full text-left text-xs font-medium text-slate-700 hover:bg-[#F0F6FC] cursor-pointer"
                      >
                        <Edit2 size={13} className="text-[#1E88E5]" /> Edit
                      </button>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); onDelete?.(message.id, "me"); }}
                      className="flex items-center gap-2 px-3.5 py-2 w-full text-left text-xs font-medium text-slate-700 hover:bg-[#F0F6FC] border-t border-[#D3E3F5] cursor-pointer"
                    >
                      <Trash2 size={13} className="text-slate-500" /> Delete for me
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onDelete?.(message.id, "everyone"); }}
                      className="flex items-center gap-2 px-3.5 py-2 w-full text-left text-xs font-medium text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={13} className="text-red-500" /> Delete for everyone
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}