import { useState } from "react";
import { User, Mail, Phone, GraduationCap, Zap, Heart, ChevronRight, ChevronLeft, Loader2, Check } from "lucide-react";
import careersData from "../data/clearcareers_data.json";
import Navbar from "../components/Navbar";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

const STEPS = [
  { key: "basics", label: "The Basics", icon: User },
  { key: "academics", label: "Academics", icon: GraduationCap },
  { key: "superpowers", label: "Superpowers", icon: Zap },
  { key: "passions", label: "Passions", icon: Heart },
];

const SUBJECTS = ["Math", "Science", "Literature", "History", "Art", "Computer Science", "Languages", "Music", "Business"];

const SUPERPOWERS = ["Problem Solving", "Public Speaking", "Writing", "Coding", "Design", "Leadership", "Empathy", "Data Analysis", "Debate", "Organization", "Creativity"];

const PASSIONS = [
  { title: "Building Technology", subtitle: "Software, AI, Hardware", emoji: "💻" },
  { title: "Helping People", subtitle: "Medicine, Psychology, Therapy", emoji: "🏥" },
  { title: "Creating Art/Media", subtitle: "Design, Film, Writing", emoji: "🎨" },
  { title: "Running a Business", subtitle: "Startups, Finance, Marketing", emoji: "📈" },
  { title: "Environment", subtitle: "Sustainability, Biology, Outdoors", emoji: "🌿" },
  { title: "Law & Society", subtitle: "Politics, Activism, Law", emoji: "⚖️" },
];

const STAGE_ORDER = ["basics", "academics", "superpowers", "passions"];

const PASSION_TO_CLUSTER = {
  "Building Technology": "Cluster 1",
  "Helping People": "Cluster 2",
  "Creating Art/Media": "Cluster 3",
  "Running a Business": "Cluster 4",
  Environment: "Cluster 5",
  "Law & Society": "Cluster 6",
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidIndianContact(contact) {
  const normalized = contact.trim().replace(/\s|-/g, "");
  return /^(?:\+91|91)?\d{10}$/.test(normalized);
}

function dedupeById(list) {
  const seen = new Set();
  return list.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function buildFallbackProfile({ name, email, contact, subjects, superpowers, passions }) {
  const preferredClusters = passions.map((passion) => PASSION_TO_CLUSTER[passion]).filter(Boolean);
  const mappedCareers = (careersData || [])
    .map((career) => ({
      id: Number(career["No."] || 0),
      title: career["Career Name"] || "",
      cluster: career.Cluster || "",
      demand_level: career["Demand Level"] || "",
      entry_salary: career["Entry Salary (LPA)"] || "",
    }))
    .filter((career) => career.id > 0 && career.title && career.cluster);

  const preferredCareerMatches = mappedCareers.filter((career) => preferredClusters.includes(career.cluster));
  const fallbackCareerMatches = mappedCareers.slice(0, 5);
  const suggested_careers = dedupeById((preferredCareerMatches.length > 0 ? preferredCareerMatches : fallbackCareerMatches).slice(0, 5));
  const primaryPassions = passions.length ? passions.join(", ") : "your interests";
  const strongestSkills = superpowers.length ? superpowers.slice(0, 2).join(" and ") : "your strengths";
  const profile_summary = `${name} is passionate about ${primaryPassions}. With strong ${strongestSkills}, this profile is aligned to career paths that combine these interests and strengths.`;
  return { id: `local-${Date.now()}`, name, email, contact, subjects, superpowers, passions, profile_summary, suggested_careers, created_at: new Date().toISOString(), source: "fallback" };
}

export default function Onboarding({ onBack, onContinue }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedSuperpowers, setSelectedSuperpowers] = useState([]);
  const [selectedPassions, setSelectedPassions] = useState([]);
  const [stage, setStage] = useState("basics");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canContinueBasics = name.trim().length > 1 && isValidEmail(email) && isValidIndianContact(contact);
  const canContinueAcademics = selectedSubjects.length > 0;
  const canContinueSuperpowers = selectedSuperpowers.length > 0;
  const canContinuePassions = selectedPassions.length > 0;
  const activeIndex = STAGE_ORDER.indexOf(stage);

  const canContinueCurrent =
    (stage === "basics" && canContinueBasics) ||
    (stage === "academics" && canContinueAcademics) ||
    (stage === "superpowers" && canContinueSuperpowers) ||
    (stage === "passions" && canContinuePassions);

  const handleContinue = async () => {
    if (stage === "basics") { if (!canContinueBasics) return; setStage("academics"); return; }
    if (stage === "academics") { if (!canContinueAcademics) return; setStage("superpowers"); return; }
    if (stage === "superpowers") { if (!canContinueSuperpowers) return; setStage("passions"); return; }
    if (!canContinuePassions || isSaving) return;
    setErrorMessage("");
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), contact: contact.trim(), subjects: selectedSubjects, superpowers: selectedSuperpowers, passions: selectedPassions }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Could not generate profile");
      }
      const profile = await response.json();
      onContinue?.(profile);
    } catch {
      const fallbackProfile = buildFallbackProfile({ name: name.trim(), email: email.trim(), contact: contact.trim(), subjects: selectedSubjects, superpowers: selectedSuperpowers, passions: selectedPassions });
      setErrorMessage("Backend is unreachable, so we generated your profile locally.");
      onContinue?.(fallbackProfile);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (stage === "passions") { setStage("superpowers"); return; }
    if (stage === "superpowers") { setStage("academics"); return; }
    if (stage === "academics") { setStage("basics"); return; }
    onBack?.();
  };

  const toggle = (setter, value) => setter((prev) => prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]);

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-[#dbe4f2] px-4 py-6 sm:px-7">
        <div className="mx-auto max-w-5xl">

          {/* Step progress */}
          <div className="mb-8 grid grid-cols-4 items-start gap-2 sm:gap-5">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === activeIndex;
              const isDone = idx < activeIndex;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2">
                  <div className="relative w-full">
                    {idx < STEPS.length - 1 && (
                      <span className={`absolute left-1/2 top-5 h-[2px] w-full transition-all duration-300 ${isDone ? "bg-[#3573ea]" : "bg-[#cfd8e8]"}`} />
                    )}
                    <div className={`relative z-10 mx-auto grid h-10 w-10 place-items-center rounded-full border-2 transition-all duration-300 ${isActive ? "border-[#2e66df] bg-[#2f66de] text-white shadow-[0_6px_20px_rgba(47,102,222,0.4)]" : isDone ? "border-[#9eb9ef] bg-[#dbe8ff] text-[#2f66de]" : "border-[#cad4e6] bg-[#dbe3f1] text-[#b2bfd6]"}`}>
                      {isDone ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                  </div>
                  <span className={`cc-body text-xs font-semibold text-center sm:text-sm ${isActive || isDone ? "text-[#2f66de]" : "text-[#7f92b5]"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#d4dbe8] bg-[#f7f9fc] shadow-[0_15px_40px_rgba(49,73,117,0.12)]">
            <div className="px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-10">

              {/* BASICS */}
              {stage === "basics" && (
                <div className="mx-auto max-w-xl cc-fadein">
                  <div className="text-center">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e3ebf8] text-[#2d63df]">
                      <User size={26} />
                    </div>
                    <h1 className="cc-display text-3xl font-black tracking-[-0.02em] text-[#0f1c3d] sm:text-4xl">Start your career discovery journey</h1>
                    <p className="cc-body mt-3 text-lg text-[#5f7194] sm:text-xl">First, what should we call you?</p>
                  </div>

                  <div className="mt-8 space-y-5">
                    <div>
                      <label className="cc-display mb-2 block text-sm font-bold text-[#21365d] sm:text-base">Your Name</label>
                      <div className="relative">
                        <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#889ab9]" />
                        <input
                          type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex"
                          className="cc-body w-full rounded-xl border border-[#d6ddeb] bg-[#f2f5fa] py-3 pl-10 pr-4 text-base text-[#2b3f66] placeholder:text-[#889ab9] outline-none focus:border-[#9cb4e5] focus:ring-2 focus:ring-[#c3d4f4]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="cc-display mb-2 block text-sm font-bold text-[#21365d] sm:text-base">Email</label>
                      <div className="relative">
                        <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#889ab9]" />
                        <input
                          type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. alex@gmail.com"
                          className="cc-body w-full rounded-xl border border-[#d6ddeb] bg-[#f2f5fa] py-3 pl-10 pr-4 text-base text-[#2b3f66] placeholder:text-[#889ab9] outline-none focus:border-[#9cb4e5] focus:ring-2 focus:ring-[#c3d4f4]"
                        />
                      </div>
                      {email && !isValidEmail(email) && <p className="cc-body mt-1.5 text-sm text-[#d64545]">Please enter a valid email format</p>}
                    </div>

                    <div>
                      <label className="cc-display mb-2 block text-sm font-bold text-[#21365d] sm:text-base">Contact</label>
                      <div className="relative">
                        <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#889ab9]" />
                        <input
                          type="tel" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g. 9876543210"
                          className="cc-body w-full rounded-xl border border-[#d6ddeb] bg-[#f2f5fa] py-3 pl-10 pr-4 text-base text-[#2b3f66] placeholder:text-[#889ab9] outline-none focus:border-[#9cb4e5] focus:ring-2 focus:ring-[#c3d4f4]"
                        />
                      </div>
                      {contact && !isValidIndianContact(contact) && <p className="cc-body mt-1.5 text-sm text-[#d64545]">Please enter a valid Indian phone number (10 digits)</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ACADEMICS */}
              {stage === "academics" && (
                <div className="mx-auto max-w-4xl cc-fadein">
                  <div className="text-center">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e3ebf8] text-[#2d63df]">
                      <GraduationCap size={26} />
                    </div>
                    <h1 className="cc-display text-3xl font-black tracking-[-0.02em] text-[#0f1c3d] sm:text-4xl">What do you enjoy learning?</h1>
                    <p className="cc-body mt-3 text-base text-[#5f7194] sm:text-lg">Select the subjects you actually look forward to.</p>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {SUBJECTS.map((subject) => {
                      const selected = selectedSubjects.includes(subject);
                      return (
                        <button key={subject} onClick={() => toggle(setSelectedSubjects, subject)}
                          className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${selected ? "border-[#8fb0f0] bg-[#e6efff] shadow-[0_4px_14px_rgba(47,102,222,0.18)]" : "border-[#dee4ef] bg-[#f7f9fc] hover:bg-[#edf2fb] hover:border-[#c0d0ea]"}`}
                        >
                          <span className={`mb-3 flex h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? "border-[#2f66de] bg-[#2f66de]" : "border-[#e2e7f1] bg-[#eef2f8]"}`}>
                            {selected && <Check size={12} className="text-white" />}
                          </span>
                          <span className="cc-display text-base font-semibold text-[#334f78] sm:text-lg">{subject}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUPERPOWERS */}
              {stage === "superpowers" && (
                <div className="mx-auto max-w-4xl cc-fadein">
                  <div className="text-center">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e3ebf8] text-[#2d63df]">
                      <Zap size={26} />
                    </div>
                    <h1 className="cc-display text-3xl font-black tracking-[-0.02em] text-[#0f1c3d] sm:text-4xl">What are your superpowers?</h1>
                    <p className="cc-body mt-3 text-base text-[#5f7194] sm:text-lg">Don't be humble. What are you naturally good at?</p>
                  </div>
                  <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3">
                    {SUPERPOWERS.map((power) => {
                      const selected = selectedSuperpowers.includes(power);
                      return (
                        <button key={power} onClick={() => toggle(setSelectedSuperpowers, power)}
                          className={`cc-display flex items-center gap-2 rounded-full border px-5 py-2.5 text-base font-semibold transition hover:-translate-y-0.5 ${selected ? "border-[#5e79ff] bg-[#edf1ff] text-[#274fce] shadow-[0_4px_14px_rgba(94,121,255,0.2)]" : "border-[#d6deeb] bg-[#f7f9fc] text-[#334f78] hover:bg-[#edf2fb]"}`}
                        >
                          {selected && <Check size={14} />}
                          {power}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PASSIONS */}
              {stage === "passions" && (
                <div className="mx-auto max-w-4xl cc-fadein">
                  <div className="text-center">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e3ebf8] text-[#2d63df]">
                      <Heart size={26} />
                    </div>
                    <h1 className="cc-display text-3xl font-black tracking-[-0.02em] text-[#0f1c3d] sm:text-4xl">What sparks your curiosity?</h1>
                    <p className="cc-body mt-3 text-base text-[#5f7194] sm:text-lg">Pick a few areas you'd love to explore in the real world.</p>
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {PASSIONS.map((passion) => {
                      const selected = selectedPassions.includes(passion.title);
                      return (
                        <button key={passion.title} onClick={() => toggle(setSelectedPassions, passion.title)}
                          className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${selected ? "border-[#5e79ff] bg-[#edf1ff] shadow-[0_4px_14px_rgba(94,121,255,0.18)]" : "border-[#dee4ef] bg-[#f7f9fc] hover:bg-[#edf2fb]"}`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-2xl">{passion.emoji}</span>
                            {selected && (
                              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#5e79ff]">
                                <Check size={13} className="text-white" />
                              </span>
                            )}
                          </div>
                          <p className="cc-display mt-3 text-lg font-bold text-[#2d4270]">{passion.title}</p>
                          <p className="cc-body mt-1.5 text-sm text-[#7b8ba7]">{passion.subtitle}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t border-[#dde3ee] bg-[#eef2f8] px-6 py-4 sm:px-10">
              <button onClick={handleBack} className="cc-display flex items-center gap-2 text-base font-bold text-[#9fb0cb] transition hover:text-[#7f93b5]">
                <ChevronLeft size={18} />
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!canContinueCurrent || isSaving}
                className={`cc-display flex items-center gap-2 rounded-full px-8 py-3 text-base font-bold text-white transition ${canContinueCurrent && !isSaving ? "bg-[#0f1c3d] shadow-[0_10px_28px_rgba(15,28,61,0.26)] hover:-translate-y-0.5" : "bg-[#93a3c2] cursor-not-allowed"}`}
              >
                {isSaving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : <>{stage === "passions" ? "Generate Profile" : "Continue"}<ChevronRight size={18} /></>}
              </button>
            </div>

            {errorMessage && <p className="cc-body px-6 pb-5 text-sm font-semibold text-[#be2f2f] sm:px-10">{errorMessage}</p>}
          </div>
        </div>
      </section>
    </>
  );
}
