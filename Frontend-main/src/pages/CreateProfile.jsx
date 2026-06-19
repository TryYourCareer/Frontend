import { useState, useEffect } from "react";
import { Compass, Target, Newspaper, Users, Briefcase, Heart, Home, ArrowRight, Rocket, Sparkles } from "lucide-react";

const GOALS = [
  {
    id: "discover",
    label: "I have no idea what career suits me",
    icon: Compass,
    accent: "from-[#f3e8ff] to-[#ede9fe]",
  },
  {
    id: "explore",
    label: "I have a career in mind and want to understand it deeply",
    icon: Target,
    accent: "from-[#ede9f6] to-[#e0f2fe]",
  },
  {
    id: "opportunities",
    label: "I want to stay updated with career opportunities",
    icon: Newspaper,
    accent: "from-[#ffe4f6] to-[#fed7e2]",
  },
  {
    id: "network",
    label: "I want to connect with professionals",
    icon: Users,
    accent: "from-[#d8fdfd] to-[#c7f3f9]",
  },
  {
    id: "try",
    label: "I want to try the work before deciding",
    icon: Briefcase,
    accent: "from-[#ede9fe] to-[#e9d5ff]",
  },
  {
    id: "recommendation",
    label: "I want a clear recommendation",
    icon: Heart,
    accent: "from-[#fed7aa] to-[#fde68a]",
  },
  {
    id: "family",
    label: "I need help convincing my parents",
    icon: Home,
    accent: "from-[#e0f2fe] to-[#c7d2fe]",
  },
];

const PASSIONS = [
  "Building Technology",
  "Helping People",
  "Creating Art/Media",
  "Running a Business",
  "Environment",
  "Law & Society",
];

export default function CreateProfile({ onBack, onCreate }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [pursuing, setPursuing] = useState("");
  const [goal, setGoal] = useState("");
  const [passion, setPassion] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("userProfile") || "{}");
      if (saved?.name) setName(saved.name);
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = () => {
    setError("");
    if (!name.trim()) return setError("Please enter your full name.");
    if (!dob) return setError("Please select your date of birth.");
    if (!pursuing.trim()) return setError("Please enter what you are currently pursuing.");
    if (!goal) return setError("Please select what you're hoping to figure out.");
    if (!passion) return setError("Please select a passion.");

    onCreate({
      id: `local-${Date.now()}`,
      name: name.trim(),
      dob,
      pursuing: pursuing.trim(),
      goal,
      passion,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <section className="min-h-screen bg-[#fafafc] px-4 py-8 sm:px-6 lg:px-10">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#EC4899] px-6 py-10 text-white shadow-[0_40px_120px_rgba(91,33,182,0.25)] sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(circle_at_bottom,_rgba(255,255,255,0.18),_transparent_60%)]" />
        <div className="pointer-events-none absolute right-10 top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute left-8 top-16 h-16 w-16 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute left-1/2 top-12 h-5 w-5 rounded-full bg-white/80" />
        <div className="pointer-events-none absolute left-[20%] top-28 h-3 w-3 rounded-full bg-white/70" />
        <div className="pointer-events-none absolute right-[18%] top-24 h-3 w-3 rounded-full bg-white/70" />
        <div className="pointer-events-none absolute right-24 top-40 h-4 w-4 rounded-full bg-white/60" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/90 shadow-[0_12px_30px_rgba(255,255,255,0.12)]">
              <Rocket className="h-4 w-4 text-[#ffedf5]" />
              5 Questions • 2 min
            </span>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#f5d6ff]">Create your career profile</p>
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                The premium career onboarding experience for future-ready students.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#f7efff] sm:text-lg">
                Answer a few polished questions and unlock tailored guidance, opportunity alerts, and a confident next step for your career journey.
              </p>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[320px] items-center justify-center rounded-[28px] border border-white/20 bg-white/10 px-6 py-6 shadow-[0_30px_90px_rgba(255,255,255,0.16)] backdrop-blur-xl sm:px-8 sm:py-8 lg:mx-0">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white/10 text-white shadow-[0_20px_40px_rgba(255,255,255,0.16)]">
              <Rocket className="h-16 w-16 text-[#fde2ff]" />
            </div>
            <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#ffcae9]" />
              Launching soon
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-[-3rem] w-full max-w-4xl px-4 sm:px-0">
        <div className="rounded-[24px] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,60,0.12)] ring-1 ring-white/80 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-6">
              <div className="rounded-[24px] bg-[#faf5ff] p-6 shadow-[0_12px_40px_rgba(124,58,237,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7c3aed]">Create your career profile</p>
                <h2 className="mt-4 text-3xl font-black text-[#120b35] sm:text-4xl">
                  Build a goal-driven onboarding experience that feels premium and intuitive.
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#5b4b81]">
                  This page blends polished SaaS visuals, glassmorphism, and student-friendly onboarding to deliver a high-end product impression.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-[#6b5e8c]">Full Name</span>
                  <div className="relative">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-[14px] border border-[#e7e0ff] bg-[#faf8ff] px-4 py-4 text-sm text-[#1f1b3a] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9f7aea]">👤</span>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-[#6b5e8c]">Date of Birth</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-[14px] border border-[#e7e0ff] bg-[#faf8ff] px-4 py-4 text-sm text-[#1f1b3a] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9f7aea]">📅</span>
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-[#6b5e8c]">Currently Pursuing</span>
                <div className="relative">
                  <input
                    value={pursuing}
                    onChange={(e) => setPursuing(e.target.value)}
                    placeholder="e.g. Class 12 / B.Tech Computer Science"
                    className="w-full rounded-[14px] border border-[#e7e0ff] bg-[#faf8ff] px-4 py-4 text-sm text-[#1f1b3a] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9f7aea]">🎓</span>
                </div>
              </label>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] bg-[#faf5ff] p-6 shadow-[0_12px_40px_rgba(124,58,237,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7c3aed]">What are you hoping to figure out today?</p>
                <p className="mt-3 text-sm leading-6 text-[#5b4b81]">Select the career discovery path that matches your current stage.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {GOALS.map((option) => {
                  const Icon = option.icon;
                  const active = goal === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setGoal(option.id)}
                      className={`group flex min-h-[140px] flex-col gap-4 rounded-[16px] border p-5 text-left transition duration-200 ${
                        active
                          ? "border-[#7c3aed] bg-[#f5f3ff] shadow-[0_20px_60px_rgba(124,58,237,0.14)] ring-1 ring-[#7c3aed]/30"
                          : "border-[#e6e2f8] bg-white hover:-translate-y-1 hover:border-[#c4b5fd] hover:bg-[#faf5ff]"
                      }`}
                    >
                      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${option.accent} text-[#5b21b6] shadow-sm`}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <p className="text-sm font-semibold leading-6 text-[#1f1b3a]">{option.label}</p>
                    </button>
                  );
                })}
              </div>

              <label className="block">
                <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-[#6b5e8c]">Select Passion</span>
                <select
                  value={passion}
                  onChange={(e) => setPassion(e.target.value)}
                  className="w-full rounded-[14px] border border-[#e7e0ff] bg-[#faf8ff] px-4 py-4 text-sm text-[#1f1b3a] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                >
                  <option value="">Choose a passion</option>
                  {PASSIONS.map((passionOption) => (
                    <option key={passionOption} value={passionOption}>
                      {passionOption}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-[18px] border border-[#f5d9ff] bg-[#fff0ff] px-5 py-4 text-sm text-[#6d2f92]">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center rounded-[18px] border border-[#7c3aed] bg-white px-6 py-3 text-sm font-semibold text-[#5b21b6] transition hover:bg-[#faf5ff]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(124,58,237,0.2)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(124,58,237,0.28)]"
            >
              Create profile
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
