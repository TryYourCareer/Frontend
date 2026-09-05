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
    <div className="flex flex-col h-full bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7]">

      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 bg-white border-b border-[#D3E3F5] px-4 py-3 shadow-2xs">
        <button
          onClick={onBack}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-[#EAF2FA] text-[#0b1a36] transition cursor-pointer"
        >
          <ArrowLeft size={18} className="text-[#0b1a36]" />
        </button>

        <h2 className="text-base font-serif font-bold text-[#0b1a36]">
          Community Info
        </h2>
      </header>

      {/* Community information */}
      <div className="flex-1 overflow-y-auto">

        {/* Profile section */}
        <div className="bg-white px-4 py-8 flex flex-col items-center border-b border-[#D3E3F5]">

          <div className="h-24 w-24 rounded-3xl bg-[#F0F6FC] border border-[#D3E3F5] flex items-center justify-center text-4xl shadow-2xs">
            {community.career_icon || "💬"}
          </div>

          <h1 className="mt-4 text-xl font-serif font-bold text-[#0b1a36] text-center">
            {community.name}
          </h1>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            {community.member_count || 0} members
          </p>
        </div>

        {/* Members */}
        <div className="mt-3 bg-white border-y border-[#D3E3F5]">

          <button
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F0F6FC]/60 transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shadow-2xs">
              <Users size={18} className="text-[#1E88E5]" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-[#0b1a36]">
                Members
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">
                {community.member_count || 0} members
              </p>
            </div>
          </button>

        </div>

        {/* Media / Links / Docs */}
        <div className="mt-3 bg-white border-y border-[#D3E3F5]">

          <button
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F0F6FC]/60 transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center shadow-2xs">
              <Image size={18} className="text-purple-600" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-[#0b1a36]">
                Media, links and docs
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Photos, videos, files and shared content
              </p>
            </div>
          </button>

          {/* Links */}
          <button
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-[#D3E3F5]/60 hover:bg-[#F0F6FC]/60 transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-2xs">
              <Link2 size={18} className="text-emerald-600" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-[#0b1a36]">
                Links
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Shared links in this community
              </p>
            </div>
          </button>

          {/* Documents */}
          <button
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-[#D3E3F5]/60 hover:bg-[#F0F6FC]/60 transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-2xs">
              <FileText size={18} className="text-amber-600" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-[#0b1a36]">
                Documents
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Files shared by community members
              </p>
            </div>
          </button>

        </div>

        {/* Active Members */}
        <div className="mt-3 bg-white border-y border-[#D3E3F5]">

          <button
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F0F6FC]/60 transition text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shadow-2xs">
              <UserCheck size={18} className="text-[#1E88E5]" />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-[#0b1a36]">
                Active members
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Members currently active
              </p>
            </div>
          </button>

        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}