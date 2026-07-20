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
import { MoreVertical, Edit2, Trash2, Check } from "lucide-react";

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

export default function MessageBubble({ message, currentUserId, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isSelf = String(message.user_id) === String(currentUserId);
  const initials = (message.user_id || "?").slice(0, 2).toUpperCase();
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
      <div className="relative">
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-sm
            ${isSelf
              ? "bg-[#eff6ff] border border-[#bcd2f3] text-[#173b72] rounded-br-none"
              : "bg-white text-slate-800 rounded-bl-none border border-slate-200"
            }
          `}
        >
          {!isSelf && (
            <p className="text-[9px] font-bold text-slate-400 mb-0.5">
              {initials}
            </p>
          )}
          <p className="leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
          <div className="mt-1 flex items-center justify-end gap-1 text-[8px] opacity-50">
            <span>{formatTime(message.created_at)}</span>
            {message.edited_at && <span className="italic">(edited)</span>}
            {isSelf && <Check size={8} />}
          </div>
        </div>

        {/* Context menu — only visible on hover for the author */}
        {isSelf && (
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
                  className="absolute right-0 top-6 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 min-w-[100px]"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => { setMenuOpen(false); onEdit?.(message.id); }}
                    className="flex items-center gap-2 px-3 py-1.5 w-full text-left text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete?.(message.id); }}
                    className="flex items-center gap-2 px-3 py-1.5 w-full text-left text-[11px] text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
