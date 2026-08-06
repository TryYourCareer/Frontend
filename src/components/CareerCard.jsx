/**
 * CareerCard — displays a career with its community stats and join/leave button.
 *
 * Props:
 *   career        CareerOut (from /api/careers)
 *   isMember      boolean
 *   onMemberChange (isMember: boolean) => void
 *   onClick       () => void   — navigate to community chat
 */
import { useNavigate } from "react-router-dom";
import JoinLeaveButton from "./JoinLeaveButton";

const STATUS_COLORS = {
  Active:   "bg-emerald-100 text-emerald-700",
  Growing:  "bg-blue-100 text-blue-700",
  Trending: "bg-orange-100 text-orange-700",
  Rising:   "bg-purple-100 text-purple-700",
  New:      "bg-slate-100 text-slate-600",
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
        group relative flex flex-col gap-2 rounded-2xl border p-4 bg-white
        transition-all duration-200
        ${isMember
          ? "border-[#0b1a36]/20 shadow-md hover:shadow-lg cursor-pointer hover:-translate-y-0.5"
          : "border-slate-200 shadow-sm"
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
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl border border-slate-200 group-hover/header:border-blue-400 group-hover/header:bg-[#eff6ff] transition-all">
            {career.icon_url}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#173b72] truncate leading-tight group-hover/header:text-blue-600 group-hover/header:underline">
              {career.name}
            </p>
            <span className={`mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${colorClass}`}>
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
      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
        {career.description}
      </p>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {(career.member_count || 0).toLocaleString()} members
        </span>
        {isMember && (
          <span className="text-[10px] font-semibold text-[#0b1a36] group-hover:underline">
            Open chat →
          </span>
        )}
      </div>
    </div>
  );
}
