import { useEffect, useRef, useState } from "react";
import {
  Clock,
  Leaf,
  Target,
  Newspaper,
  Users,
  Briefcase,
  Star,
  Heart,
  ArrowRight,
  User,
  Calendar,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

const AREA_OPTIONS = [
  { value: "technology_digital_infrastructure", label: "Technology & Digital Infrastructure" },
  { value: "healthcare_medical_life_sciences", label: "Healthcare, Medical & Life Sciences" },
  { value: "corporate_strategy_business_finance", label: "Corporate Strategy, Business & Finance" },
  { value: "applied_arts_design_media", label: "Applied Arts, Design & Media" },
  { value: "engineering_manufacturing_heavy_industry", label: "Engineering, Manufacturing & Heavy Industry" },
  { value: "public_service_social_impact_education", label: "Public Service, Social Impact & Education" },
  { value: "agriculture_food_natural_resources", label: "Agriculture, Food & Natural Resources" },
  { value: "hospitality_tourism_personal_services", label: "Hospitality, Tourism & Personal Services" },
  { value: "other", label: "Other" },
];

export default function CreateProfile({ theme = "light", onBack = () => {}, onCreate = () => {} }) {
  const isDark = theme === "dark";
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [pursuing, setPursuing] = useState("");
  const [gender, setGender] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [interestOpen, setInterestOpen] = useState(false);
  const interestRef = useRef(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (interestRef.current && !interestRef.current.contains(event.target)) {
        setInterestOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSubmit = () => {
    setError("");
    if (!name.trim()) return setError("Please enter your full name.");
    if (!dob) return setError("Please select your date of birth.");
    if (!pursuing.trim()) return setError("Please enter what you are currently pursuing.");
    if (!gender) return setError("Please select your gender.");
    if (!areaOfInterest) return setError("Please select your area of interest.");

    // Show a success message, then call onCreate after a short delay
    setIsSubmitting(true);
    setSuccess("Profile created successfully.");
    const profile = { id: `local-${Date.now()}`, name: name.trim(), dob, pursuing: pursuing.trim(), gender, areaOfInterest };
    setTimeout(() => {
      onCreate(profile);
      setIsSubmitting(false);
      // clear success after navigation trigger (optional)
      setSuccess("");
    }, 1500);
  };

  return (
    <main className={
      `min-h-screen px-4 py-10 sm:px-6 lg:px-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#FFFDF9] text-slate-900"}`
    }>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className={
          `relative rounded-[28px] p-8 sm:p-10 lg:p-12 ${isDark ? "bg-slate-900 border border-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.35)]" : "bg-white border border-[#F2E8DE] shadow-[0_20px_60px_rgba(15,23,42,0.06)]"}`
        }>
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] xl:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-[#2563eb]">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#eff6ff] border border-[#bfdbfe]">
                  <User className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.35em]">PROFILE SETUP</span>
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-[42px]">Create your career profile</h1>
              <p className={`max-w-2xl text-base leading-7 ${isDark ? "text-slate-300" : "text-[#64748B]"}`}>Tell us a little about yourself so we can tailor recommendations that match what you want to explore next.</p>
            </div>

            <div className="relative flex items-start justify-end">
              <div className="absolute right-0 top-0 inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-4 py-2 text-sm text-[#2563eb] shadow-sm">
                <Clock className="h-4 w-4" />
                5 Questions • 2 min
              </div>
              <div className="ml-auto w-full max-w-[340px] pt-4">
                <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                  <rect width="340" height="180" rx="26" fill="#EFF6FF" />
                  <path d="M28 160 C72 86, 108 112, 150 58 C190 12, 228 108, 302 160" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5" />
                  <path d="M28 160 C72 104, 108 130, 150 78 C190 40, 228 128, 302 160" fill="#DBEAFE" />
                  <path d="M34 156 C72 98, 108 120, 148 64 C180 26, 220 108, 298 156" fill="#E0F2FE" />
                  <path d="M34 156 C72 96, 108 122, 148 64 C180 24, 220 108, 298 156" stroke="#BFDBFE" strokeWidth="1.5" fill="none" />
                  <circle cx="240" cy="48" r="24" fill="url(#sunGrad)" />
                  <defs>
                    <linearGradient id="sunGrad" x1="0" x2="1">
                      <stop offset="0%" stopColor="#BFDBFE" />
                      <stop offset="100%" stopColor="#93C5FD" />
                    </linearGradient>
                  </defs>
                  <path d="M186 34 C190 28, 196 24, 204 24 C210 24, 216 28, 220 34" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M86 38 C92 32, 100 30, 108 34" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M206 22 C210 18, 218 16, 224 20" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M74 30 C78 26, 84 24, 90 28" stroke="#93C5FD" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M212 28 C216 24, 222 24, 226 28" stroke="#93C5FD" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M74 46 C84 36, 94 36, 104 46" stroke="#BFDBFE" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M230 34 C236 28, 244 28, 248 34" stroke="#BFDBFE" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M98 42 C108 34, 118 34, 128 42" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className={`rounded-[28px] p-8 sm:p-10 ${isDark ? "bg-slate-900 border border-slate-700" : "bg-white border border-[#F2E8DE]"} shadow-[0_20px_60px_rgba(15,23,42,0.06)]`}>
          <div className="grid gap-6 xl:grid-cols-4">
            <label className="space-y-2">
              <div className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>FULL NAME</div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#2563eb]"><User className="h-5 w-5" /></span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className={`w-full h-14 rounded-full border px-14 text-sm outline-none transition ${isDark ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-slate-500 focus:ring-slate-700/70" : "border border-[#bfdbfe] bg-white text-[#1E293B] focus:border-[#3b82f6] focus:ring-[#bfdbfe]/70"}`}
                />
              </div>
            </label>

            <label className="space-y-2">
              <div className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>DATE OF BIRTH</div>
              <div className="relative">
                <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-[#64748B]"}`}><Calendar className="h-5 w-5" /></span>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={`w-full h-14 rounded-full border px-14 text-sm outline-none transition ${isDark ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-slate-500 focus:ring-slate-700/70" : "border border-[#bfdbfe] bg-white text-[#64748B] focus:border-[#3b82f6] focus:ring-[#bfdbfe]/70"}`}
                />
              </div>
            </label>

            <label className="space-y-2">
              <div className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>CURRENTLY PURSUING</div>
              <div className="relative">
                <span className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-[#64748B]"}`}><GraduationCap className="h-5 w-5" /></span>
                <input
                  value={pursuing}
                  onChange={(e) => setPursuing(e.target.value)}
                  placeholder="e.g. Class 12 / B.Tech CS"
                  className={`w-full h-14 rounded-full border px-14 text-sm outline-none transition ${isDark ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-slate-500 focus:ring-slate-700/70" : "border border-[#bfdbfe] bg-white text-[#64748B] focus:border-[#3b82f6] focus:ring-[#bfdbfe]/70"}`}
                />
              </div>
            </label>

            <label className="space-y-2">
              <div className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>GENDER</div>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`w-full h-14 rounded-full border bg-white px-4 text-sm outline-none transition ${isDark ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-slate-500 focus:ring-slate-700/70" : "border border-[#bfdbfe] bg-white text-[#64748B] focus:border-[#3b82f6] focus:ring-[#bfdbfe]/70"}`}
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </label>
          </div>

          <div className="mt-10">
            <div className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-full ${isDark ? "bg-slate-800 text-slate-100" : "bg-[#eff6ff] text-[#2563eb]"}`}>
                <Leaf className="h-5 w-5" />
              </span>
              <div>
                <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-[#1E293B]"}`}>Area of Interest</p>
                <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>Select one field that best fits what you want to explore.</p>
              </div>
            </div>

            <div className="mt-6 max-w-2xl">
              <label className="space-y-2 relative" ref={interestRef}>
                <span className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>AREA OF INTEREST</span>
                <button
                  type="button"
                  onClick={() => setInterestOpen((prev) => !prev)}
                  className={`relative w-full h-14 rounded-full border bg-white px-4 text-left text-sm outline-none transition ${isDark ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-slate-500 focus:ring-slate-700/70" : "border border-[#bfdbfe] bg-white text-[#64748B] focus:border-[#3b82f6] focus:ring-[#bfdbfe]/70"}`}
                >
                  <span className="block truncate">
                    {areaOfInterest ? AREA_OPTIONS.find((option) => option.value === areaOfInterest)?.label : "Select area of interest"}
                  </span>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                </button>
                {interestOpen && (
                  <ul className="absolute left-0 right-0 z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#bfdbfe] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                    {AREA_OPTIONS.map((option) => (
                      <li key={option.value}>
                        <button
                          type="button"
                          className="w-full px-4 py-3 text-left text-sm text-[#334155] transition hover:bg-slate-100"
                          onClick={() => {
                            setAreaOfInterest(option.value);
                            setInterestOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </label>
            </div>
          </div>

          {(error || success) && (
            <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${success ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-900" : "border border-red-400/30 bg-red-500/10 text-red-900"}`}>
              {success || error}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={onBack} className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border border-[#3b82f6] bg-white text-[#2563eb] hover:bg-[#eff6ff]"}`}>
              ← Back
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_50px_rgba(37,99,235,0.18)] disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? "Please wait..." : "Create profile"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
