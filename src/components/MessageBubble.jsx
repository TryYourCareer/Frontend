/**
 * MessageBubble — single chat message bubble.
 *
 * Props:
 *   message     MessageOut
 *   currentUserId  string
 *   onEdit      (messageId: string) => void
 *   onDelete    (messageId: string) => void
 */
import { useState } from "react";
import { MoreVertical, Edit2, Trash2, Check, CornerUpLeft, Download } from "lucide-react";

const INITIALS_COLORS = [
  "from-[#ff9a9e] to-[#fecfef]",
  "from-[#a1c4fd] to-[#c2e9fb]",
  "from-[#84fab0] to-[#8fd3f4]",
  "from-[#fda085] to-[#f6d365]",
  "from-[#a6c0fe] to-[#f68084]",
  "from-[#cfd9df] to-[#e2ebf0]",
  "from-[#e2ebf0] to-[#cfd9df]",
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

  if (message.deleted) {
    return (
      <div className={`flex items-end gap-2 max-w-[80%] ${isSelf ? "ml-auto flex-row-reverse" : ""}`}>
        <div className="rounded-2xl px-3.5 py-2 text-[11px] italic text-slate-400 bg-slate-100 border border-slate-200">
          This message was deleted.
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-end gap-2 max-w-[80%] ${isSelf ? "ml-auto flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {!isSelf && (
        <div
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br ${gradColor} text-[10px] font-bold text-slate-900 border border-white shadow-sm`}
        >
          {initials}
        </div>
      )}

      {/* Bubble */}
      <div className={`relative ${isSelf ? "ml-auto text-right" : "text-left"}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
            isSelf
              ? "bg-[#dcf8c6] border border-[#c6e2b3] text-[#173b72] rounded-br-none text-right"
              : "bg-white text-slate-800 rounded-bl-none border border-slate-200 text-left"
          }`}
        >
          {!isSelf && (
            <p className="text-[9px] font-bold text-slate-400 mb-0.5">
              {displayName}
            </p>
          )}
          {replyInfo && (
            <div className="mb-1.5 px-2 py-1 bg-black/5 rounded-lg border-l-2 border-slate-400 text-[10px] text-slate-500 max-w-full truncate">
              <span className="font-bold">@{replyInfo.user}</span>: {replyInfo.text}
            </div>
          )}
          {displayContent && (
            <p className="leading-relaxed break-words whitespace-pre-wrap">{displayContent}</p>
          )}

          {message.attachment_url && (
            <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 bg-black/5 max-w-[280px]">
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
                    className="max-h-48 object-cover w-full rounded-xl"
                  />
                </a>
              )}
              {message.attachment_type === "video" && (
                <video
                  src={message.attachment_url}
                  controls
                  className="max-h-48 w-full rounded-xl bg-black"
                />
              )}
              {(message.attachment_type === "pdf" || message.attachment_type === "file") && (
                <a
                  href={message.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 text-[11px] font-semibold text-[#173b72] hover:bg-slate-50 transition"
                >
                  <span className="text-lg">{message.attachment_type === "pdf" ? "📄" : "📁"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-slate-700">{message.attachment_name || "Download Attachment"}</p>
                    <p className="text-[9px] text-slate-400 capitalize">{message.attachment_type}</p>
                  </div>
                </a>
              )}
            </div>
          )}

          <div className="mt-1 flex items-center justify-end gap-1 text-[8px] opacity-50">
            <span>{formatTime(message.created_at)}</span>
            {message.edited_at && <span className="italic">(edited)</span>}
            {isSelf && <Check size={8} />}
          </div>
        </div>

        {/* Context menu — visible on hover for everyone */}
        <div className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-800"
            >
              <MoreVertical size={11} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-6 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 min-w-[110px]"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => { setMenuOpen(false); onReply?.(message); }}
                  className="flex items-center gap-2 px-3 py-1.5 w-full text-left text-[11px] text-slate-700 hover:bg-slate-50"
                >
                  <CornerUpLeft size={11} /> Reply
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
                    className="flex items-center gap-2 px-3 py-1.5 w-full text-left text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    <Download size={11} /> Download
                  </button>
                )}

                {isSelf && (
                  <>
                    {!message.attachment_url && (
                      <button
                        onClick={() => { setMenuOpen(false); onEdit?.(message.id); }}
                        className="flex items-center gap-2 px-3 py-1.5 w-full text-left text-[11px] text-slate-700 hover:bg-slate-50"
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); onDelete?.(message.id); }}
                      className="flex items-center gap-2 px-3 py-1.5 w-full text-left text-[11px] text-red-500 hover:bg-red-50 border-t border-slate-100"
                    >
                      <Trash2 size={11} /> Delete
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
