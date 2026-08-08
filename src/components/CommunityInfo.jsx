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
    <div className="flex flex-col h-full bg-[#f5f7fa]">

      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <button
          onClick={onBack}
          className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
        >
          <ArrowLeft size={20} className="text-slate-700" />
        </button>

        <h2 className="text-base font-semibold text-slate-800">
          Community Info
        </h2>
      </header>

      {/* Community information */}
      <div className="flex-1 overflow-y-auto">

        {/* Profile section */}
        <div className="bg-white px-4 py-8 flex flex-col items-center border-b border-slate-200">

          <div className="h-24 w-24 rounded-full bg-[#eff6ff] border border-[#c6d9f7] flex items-center justify-center text-4xl shadow-sm">
            {community.career_icon || "💬"}
          </div>

          <h1 className="mt-4 text-xl font-bold text-[#173b72] text-center">
            {community.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {community.member_count || 0} members
          </p>
        </div>

        {/* Members */}
        <div className="mt-2 bg-white border-y border-slate-200">

          <button
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition text-left"
          >
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users size={19} className="text-blue-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Members
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                {community.member_count || 0} members
              </p>
            </div>
          </button>

        </div>

        {/* Media / Links / Docs */}
        <div className="mt-2 bg-white border-y border-slate-200">

          <button
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition text-left"
          >
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Image size={19} className="text-purple-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Media, links and docs
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                Photos, videos, files and shared content
              </p>
            </div>
          </button>

          {/* Links */}
          <button
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-slate-100 hover:bg-slate-50 transition text-left"
          >
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <Link2 size={19} className="text-green-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Links
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                Shared links in this community
              </p>
            </div>
          </button>

          {/* Documents */}
          <button
            className="w-full flex items-center gap-4 px-5 py-4 border-t border-slate-100 hover:bg-slate-50 transition text-left"
          >
            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
              <FileText size={19} className="text-orange-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Documents
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                Files shared by community members
              </p>
            </div>
          </button>

        </div>

        {/* Active Members */}
        <div className="mt-2 bg-white border-y border-slate-200">

          <button
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition text-left"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <UserCheck size={19} className="text-emerald-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Active members
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
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
