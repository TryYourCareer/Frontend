/**
 * JoinLeaveButton — optimistic join/leave toggle for a community.
 *
 * Props:
 *   communityId   string
 *   isMember      boolean
 *   onToggle      (isMember: boolean) => void   called after success
 */
import { useState } from "react";
import api from "../lib/api";

export default function JoinLeaveButton({ communityId, isMember, onToggle }) {
  const [optimistic, setOptimistic] = useState(isMember);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

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
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={busy}
        className={`
          inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold
          transition-all duration-200 shadow-sm select-none
          ${optimistic
            ? "bg-[#0b1a36] text-white hover:bg-[#1a2d50] border border-transparent"
            : "bg-white text-[#0b1a36] border border-[#0b1a36] hover:bg-[#0b1a36] hover:text-white"
          }
          ${busy ? "opacity-60 cursor-wait" : "cursor-pointer"}
        `}
      >
        {busy ? (
          <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <span>{optimistic ? "✓ Joined" : "+ Join"}</span>
        )}
      </button>
      {error && (
        <p className="absolute top-full mt-1 left-0 text-[9px] text-red-500 whitespace-nowrap z-10">
          {error}
        </p>
      )}
    </div>
  );
}
