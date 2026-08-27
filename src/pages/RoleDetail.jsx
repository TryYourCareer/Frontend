import {
  ArrowLeft,
  Clock,
  Briefcase,
  DollarSign,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

export default function RoleDetail({ role, onBack }) {
  if (!role) return null;

  const IconComponent = role.icon;

  return (
    <section className="min-h-screen bg-[#FAF6EC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowLeft size={15} />
            Back to AI Roles List
          </button>
        )}

        {/* Hero Banner Header Card */}
        <div className="space-y-6 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-slate-300 bg-[#FAF2DB] text-slate-950 shadow-sm">
                <IconComponent size={30} />
              </div>
              <div className="space-y-1">
                <span className="inline-block rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  {role.category}
                </span>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {role.title}
                </h1>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-left sm:text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Salary Range
              </p>
              <p className="text-lg font-black text-slate-950">{role.salary}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#FAF9F5] p-5">
            <p className="text-xs font-medium leading-relaxed text-slate-800 sm:text-sm">
              {role.summary}
            </p>
          </div>
        </div>

        {/* Highlighted Core Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <Briefcase size={14} className="text-slate-700" /> Experience Tier
            </p>
            <p className="text-xs font-bold text-slate-950 sm:text-sm">
              {role.experienceTier}
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <DollarSign size={14} className="text-slate-700" /> Compensation
            </p>
            <p className="text-xs font-bold text-slate-950 sm:text-sm">
              {role.salary}
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <Clock size={14} className="text-slate-700" /> Daily Focus
            </p>
            <p className="text-xs font-bold leading-relaxed text-slate-950 sm:text-sm">
              {role.dailyFocus}
            </p>
          </div>
        </div>

        {/* Responsibilities Section */}
        <div className="space-y-5 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 border-b border-slate-200 pb-3 font-serif text-base font-bold uppercase tracking-wider text-slate-950">
            <Briefcase size={18} className="text-slate-900" />
            Key Day-to-Day Responsibilities
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {role.keyTasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100/80"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                <span className="text-xs font-medium leading-relaxed text-slate-800 sm:text-sm">
                  {task}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Schedule Section (If Available) */}
        {role.schedule && (
          <div className="space-y-5 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="flex items-center gap-2 border-b border-slate-200 pb-3 font-serif text-base font-bold uppercase tracking-wider text-slate-950">
              <Clock size={18} className="text-slate-900" />
              A Day In The Life (Sample Schedule)
            </h2>
            <div className="ml-2 space-y-4 border-l-2 border-slate-300 pl-4 sm:pl-6">
              {role.schedule.map((item, idx) => (
                <div key={idx} className="relative space-y-1 pl-2">
                  <span className="inline-block rounded-md border border-slate-300 bg-[#FAF2DB] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
                    {item.time}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 sm:text-sm">
                    {item.task}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prerequisites & Education Route */}
        <div className="space-y-4 rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 border-b border-slate-200 pb-3 font-serif text-base font-bold uppercase tracking-wider text-slate-950">
            <GraduationCap size={18} className="text-slate-900" />
            Preparation & Prerequisites
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-[#FAF9F5] p-5">
            <p className="text-xs font-medium leading-relaxed text-slate-800 sm:text-sm">
              {role.preparation}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}