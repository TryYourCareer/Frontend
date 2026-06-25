export default function Profile({ profile, onRestart, theme = "light" }) {
  const isDark = theme === "dark";

  if (!profile) {
    return (
      <section className={`min-h-screen px-4 py-7 sm:px-7 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#dbe4f2] text-slate-900"}`}>
        <div className={`mx-auto max-w-4xl rounded-2xl p-9 text-center ${isDark ? "border border-slate-700 bg-slate-900" : "border border-[#d4dbe8] bg-[#f7f9fc]"}`}>
          <h1 className={`cc-display text-3xl font-black ${isDark ? "text-white" : "text-[#0f1c3d]"}`}>No profile found</h1>
          <p className={`cc-body mt-4 text-lg ${isDark ? "text-slate-300" : "text-[#5f7194]"}`}>Please complete onboarding to generate your profile.</p>
          <button
            onClick={onRestart}
            className={`cc-display mt-7 rounded-full px-8 py-3 text-lg font-bold ${isDark ? "bg-slate-700 text-slate-100" : "bg-[#0f1c3d] text-white"}`}
          >
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`min-h-screen px-4 py-7 sm:px-7 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#dbe4f2] text-slate-900"}`}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className={`rounded-2xl p-7 sm:p-9 ${isDark ? "border border-slate-700 bg-slate-900" : "border border-[#d4dbe8] bg-[#f7f9fc]"}`}>
          <p className={`cc-body text-sm font-semibold tracking-[0.08em] ${isDark ? "text-slate-400" : "text-[#4e68a0]"}`}>PROFILE GENERATED</p>
          <h1 className={`cc-display mt-3 text-4xl font-black sm:text-5xl ${isDark ? "text-white" : "text-[#0f1c3d]"}`}>
            {profile.name}'s Career Profile
          </h1>
          <p className={`cc-body mt-5 text-lg sm:text-xl ${isDark ? "text-slate-300" : "text-[#4f6283]"}`}>{profile.profile_summary}</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <InfoBlock title="Grade" values={[profile.grade]} isDark={isDark} />
            <InfoBlock title="Top Superpowers" values={profile.superpowers || []} isDark={isDark} />
            <InfoBlock title="Academic Interests" values={profile.subjects || []} isDark={isDark} />
            <InfoBlock title="Passion Areas" values={profile.passions || []} isDark={isDark} />
          </div>
        </div>

        <div className={`rounded-2xl p-7 sm:p-9 ${isDark ? "border border-slate-700 bg-slate-900" : "border border-[#d4dbe8] bg-[#f7f9fc]"}`}>
          <h2 className={`cc-display text-3xl font-black ${isDark ? "text-white" : "text-[#0f1c3d]"}`}>Recommended Career Paths</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(profile.suggested_careers || []).map((career) => (
              <article key={career.id} className={`rounded-xl p-5 ${isDark ? "border border-slate-700 bg-slate-950" : "border border-[#dce3ef] bg-[#eef3fb]"}`}>
                <p className={`cc-body text-xs font-bold tracking-[0.08em] ${isDark ? "text-slate-400" : "text-[#4e68a0]"}`}>{career.cluster}</p>
                <h3 className={`cc-display mt-2 text-2xl font-bold ${isDark ? "text-white" : "text-[#20365d]"}`}>{career.title}</h3>
                <p className={`cc-body mt-2 text-sm ${isDark ? "text-slate-300" : "text-[#5f7194]"}`}>Demand: {career.demand_level}</p>
                <p className={`cc-body text-sm ${isDark ? "text-slate-300" : "text-[#5f7194]"}`}>Entry Salary: {career.entry_salary} LPA</p>
              </article>
            ))}
          </div>

          <div className="mt-7">
            <button
              onClick={onRestart}
              className={`cc-display rounded-full px-8 py-3 text-lg font-bold shadow-[0_8px_24px_rgba(47,102,222,0.34)] ${isDark ? "bg-slate-700 text-slate-100" : "bg-[#2f66de] text-white"}`}
            >
              Create Another Profile
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ title, values }) {
  return (
    <div className="rounded-xl border border-[#dce3ef] bg-[#eef3fb] p-5">
      <p className="cc-display text-lg font-bold text-[#20365d]">{title}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className="cc-body rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#48608b]">
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
