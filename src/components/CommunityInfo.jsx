import {
  ArrowLeft,
  Users,
  Image,
  Link2,
  UserCheck,
  FileText,
} from "lucide-react";

export default function CommunityInfo({ community, onBack }) {
  if (!community) return null;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] font-sans">

      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-[#D3E3F5] px-4 py-3 sm:px-6 shadow-xs">
        <button
          onClick={onBack}
          className="h-9 w-9 flex items-center justify-center rounded-full border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-white text-slate-700 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>

        <h2 className="font-serif text-base font-bold text-[#0b1a36]">
          Community Info
        </h2>
      </header>

      {/* Community information */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

        {/* Profile section */}
        <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-8 flex flex-col items-center text-center shadow-xs">
          <div className="h-24 w-24 rounded-3xl bg-[#F0F6FC] border border-[#D3E3F5] flex items-center justify-center text-4xl shadow-2xs">
            {community.career_icon || "💬"}
          </div>

          <h1 className="mt-4 font-serif text-xl sm:text-2xl font-bold text-[#0b1a36]">
            {community.name}
          </h1>

          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {(community.member_count || 0).toLocaleString()} members
          </p>
        </div>

        {/* Members */}
        <div className="rounded-3xl border border-[#D3E3F5] bg-white shadow-xs overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F0F6FC] transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#1E88E5] shadow-2xs">
              <Users size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Members
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {(community.member_count || 0).toLocaleString()} members enrolled
              </p>
            </div>
          </button>
        </div>

        {/* Media / Links / Docs */}
        <div className="rounded-3xl border border-[#D3E3F5] bg-white shadow-xs overflow-hidden divide-y divide-[#D3E3F5]">
          <button
            type="button"
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F0F6FC] transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7c3aed] shadow-2xs">
              <Image size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Media, links and docs
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Photos, videos, files and shared content
              </p>
            </div>
          </button>

          {/* Links */}
          <button
            type="button"
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F0F6FC] transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Link2 size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Links
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Shared links in this community
              </p>
            </div>
          </button>

          {/* Documents */}
          <button
            type="button"
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F0F6FC] transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
              <FileText size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Documents
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Files shared by community members
              </p>
            </div>
          </button>
        </div>

        {/* Active Members */}
        <div className="rounded-3xl border border-[#D3E3F5] bg-white shadow-xs overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F0F6FC] transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <UserCheck size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Active members
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Members currently active
              </p>
            </div>
          </button>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}