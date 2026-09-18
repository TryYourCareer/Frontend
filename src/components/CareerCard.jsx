/**
 * CareerCard — displays a career as a WhatsApp Channel card with follower count and Follow/Following button.
 */
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";
import JoinLeaveButton from "./JoinLeaveButton";

export default function CareerCard({
  career,
  isMember,
  onMemberChange,
  onClick,
  isRecommended = false,
  matchScore = null,
}) {
  const navigate = useNavigate();
  const count = career.member_count || 0;
  const followerCount = `${count.toLocaleString()} ${count === 1 ? "follower" : "followers"}`;

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/career-details/${encodeURIComponent(career.name || "")}`);
  };

  return (
    <div
      onClick={isMember ? onClick : undefined}
      className={`
        group relative flex flex-col justify-between rounded-3xl border p-5 bg-white
        transition-all duration-200 text-left
        ${isRecommended
          ? "ring-1 ring-amber-400/50 border-amber-300/80 bg-gradient-to-b from-white via-amber-50/10 to-sky-50/20 shadow-xs hover:shadow-md hover:-translate-y-0.5"
          : isMember
          ? "border-blue-300 shadow-2xs hover:shadow-md hover:border-blue-400 cursor-pointer hover:-translate-y-0.5"
          : "border-[#D3E3F5] hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
        }
      `}
    >
      <div className="space-y-3.5">
        {/* Top row: Avatar + Follow Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <div
              onClick={handleViewDetails}
              className="grid h-14 w-14 place-items-center rounded-full bg-[#F0F6FC] border border-[#D3E3F5] text-2xl group-hover:scale-105 transition shadow-2xs cursor-pointer hover:border-[#1E88E5]"
              title="View Career Details"
            >
              {career.icon_url || "🎓"}
            </div>
          </div>

          {/* Follow / Following Button */}
          {career.community_id && (
            <div className="shrink-0 pt-1">
              <JoinLeaveButton
                communityId={career.community_id}
                isMember={isMember}
                onToggle={onMemberChange}
              />
            </div>
          )}
        </div>

        {/* Hub Details */}
        <div className="space-y-1">
          <div
            onClick={handleViewDetails}
            className="flex items-center gap-1.5 cursor-pointer group/title"
          >
            <h4 className="text-sm font-bold text-[#0b1a36] leading-tight group-hover/title:text-[#1E88E5] transition line-clamp-1">
              {career.name}
            </h4>
          </div>

          <p className="text-[11px] font-semibold text-slate-500">
            {followerCount}
          </p>

          {career.description && (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-1 font-normal">
              {career.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer action link */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleViewDetails}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer"
        >
          View Guide <ArrowRight size={11} />
        </button>

        {isMember ? (
          <span
            onClick={onClick}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer bg-[#EAF2FA] px-2.5 py-1 rounded-full border border-blue-200"
          >
            <MessageSquare size={11} />
            Open Hub
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400">
            {career.cluster || "Verified Hub"}
          </span>
        )}
      </div>
    </div>
  );
}