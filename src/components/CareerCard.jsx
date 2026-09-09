/**
 * CareerCard — displays a career with its community stats and join/leave button.
 *
 * Props:
 *  career        CareerOut (from /api/careers)
 *  isMember      boolean
 *  onMemberChange (isMember: boolean) => void
 *  onClick       () => void   — navigate to community chat
 */
import { useNavigate } from "react-router-dom";
import JoinLeaveButton from "./JoinLeaveButton";

const STATUS_COLORS = {
  Active:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Growing:  "bg-sky-50 text-[#1E88E5] border border-sky-200",
  Trending: "bg-amber-50 text-amber-800 border border-amber-200",
  Rising:   "bg-purple-50 text-purple-700 border border-purple-200",
  New:      "bg-[#F0F6FC] text-slate-600 border border-[#D3E3F5]",
};

function getStatus(count) {
  if (count > 1000) return "Active";
  if (count > 500)  return "Growing";
  if (count > 200)  return "Trending";
  if (count > 50)   return "Rising";
  return "New";
}

export default function CareerCard({ career, isMember, onMemberChange, onClick }) {
  const navigate = useNavigate();
  const status = getStatus(career.member_count);
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.New;

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/career-details/${encodeURIComponent(career.name)}`);
  };

  return (
    <div
      onClick={isMember ? onClick : undefined}
      className={`
        group relative flex flex-col gap-2 rounded-3xl border p-5 bg-white
        transition-all duration-200 shadow-xs
        ${isMember
          ? "border-[#0b1a36]/30 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5"
          : "border-[#D3E3F5] hover:border-slate-300"
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div
          onClick={handleViewDetails}
          className="flex items-center gap-3 cursor-pointer hover:opacity-85 group/header"
          title="View Career Details"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F0F6FC] text-xl border border-[#D3E3F5] group-hover/header:border-[#1E88E5] group-hover/header:bg-sky-50 transition-all shadow-2xs">
            {career.icon_url}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#0b1a36] truncate leading-tight group-hover/header:text-[#1E88E5] group-hover/header:underline">
              {career.name}
            </p>
            <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${colorClass}`}>
              {status}
            </span>
          </div>
        </div>

        {career.community_id && (
          <JoinLeaveButton
            communityId={career.community_id}
            isMember={isMember}
            onToggle={onMemberChange}
          />
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
        {career.description}
      </p>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#D3E3F5]">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {(career.member_count || 0).toLocaleString()} members
        </span>
        {isMember && (
          <span className="text-[10px] font-bold text-[#1E88E5] group-hover:underline">
            Open chat →
          </span>
        )}
      </div>
    </div>
  );
}