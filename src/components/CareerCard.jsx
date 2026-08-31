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
  Active:   "bg-emerald-50 text-emerald-800 border border-emerald-300",
  Growing:  "bg-sky-50 text-[#1E88E5] border border-sky-200",
  Trending: "bg-amber-50 text-[#9c5a1a] border border-amber-200",
  Rising:   "bg-purple-50 text-[#5a2eb5] border border-purple-200",
  New:      "bg-slate-100 text-slate-700 border border-slate-200",
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
          ? "border-[#1E88E5]/40 ring-2 ring-[#1E88E5]/15 shadow-sm shadow-[#1E88E5]/10 hover:border-[#1E88E5] hover:shadow-md cursor-pointer hover:-translate-y-0.5"
          : "border-[#D3E3F5] hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div
          onClick={handleViewDetails}
          className="flex items-center gap-3 cursor-pointer group/header min-w-0"
          title="View Career Details"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#F0F6FC] text-xl border border-[#D3E3F5] group-hover/header:border-[#1E88E5] group-hover/header:bg-[#EAF2FA] shadow-xs transition-all">
            {career.icon_url}
          </div>
          <div className="min-w-0">
            <p className="font-serif text-sm font-bold text-slate-900 truncate leading-tight group-hover/header:text-[#0b1a36] transition-colors">
              {career.name}
            </p>
            <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${colorClass}`}>
              {status}
            </span>
          </div>
        </div>

        {career.community_id && (
          <div className="shrink-0">
            <JoinLeaveButton
              communityId={career.community_id}
              isMember={isMember}
              onToggle={onMemberChange}
            />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mt-1">
        {career.description}
      </p>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#edf3fb]">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
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