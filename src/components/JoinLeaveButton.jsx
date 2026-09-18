/**
 * JoinLeaveButton — optimistic follow/unfollow toggle for a WhatsApp-style channel.
 */
import { useState, useEffect } from "react";
import api from "../lib/api";
import { Check, Loader2 } from "lucide-react";

export default function JoinLeaveButton({
  communityId,
  isMember,
  onToggle,
  size = "md", // "sm" | "md"
}) {
  const [optimistic, setOptimistic] = useState(isMember);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setOptimistic(isMember);
  }, [isMember]);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    setError(null);

    // Optimistic update
    const next = !optimistic;
    setOptimistic(next);

    try {
      if (next) {
        await api.post(`/api/communities/${communityId}/join`);
      } else {
        await api.delete(`/api/communities/${communityId}/leave`);
      }
      onToggle?.(next);
    } catch (err) {
      // Revert optimistic update
      setOptimistic(!next);
      setError(err.message || "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const isSmall = size === "sm";

  return (
    <div className="relative shrink-0 select-none">
      <button
        onClick={handleClick}
        disabled={busy}
        className={`
          inline-flex items-center justify-center gap-1 font-bold rounded-full
          transition-all duration-200 select-none shrink-0 whitespace-nowrap cursor-pointer
          ${isSmall ? "px-3 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs"}
          ${optimistic
            ? "bg-[#EAF2FA] text-[#0b1a36] border border-[#D3E3F5] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 group/btn"
            : "bg-[#0b1a36] hover:bg-[#122b59] text-white shadow-2xs hover:shadow-xs active:scale-95"
          }
          ${busy ? "opacity-60 cursor-wait" : ""}
        `}
      >
        {busy ? (
          <Loader2 size={12} className="animate-spin" />
        ) : optimistic ? (
          <>
            <Check size={12} className="text-[#1E88E5] group-hover/btn:hidden" />
            <span className="group-hover/btn:hidden">Following</span>
            <span className="hidden group-hover/btn:inline">Unfollow</span>
          </>
        ) : (
          <span>Follow</span>
        )}
      </button>
      {error && (
        <p className="absolute top-full mt-1 right-0 text-[9px] font-semibold text-red-500 whitespace-nowrap z-10 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 shadow-2xs">
          {error}
        </p>
      )}
    </div>
  );
}