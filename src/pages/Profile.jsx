import { useMemo, useState } from "react";
import { Loader2, Save, ArrowLeft, User, CalendarDays, BriefcaseBusiness, Sparkles } from "lucide-react";
import { updateUser } from "../services/users";

function toInputDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

export default function Profile({ profile, onRestart, onSave }) {
  const initialForm = useMemo(() => ({
    name: profile?.name || "",
    gender: profile?.gender || "",
    dateOfBirth: toInputDate(profile?.dateOfBirth),
    currentlyPursuing: profile?.currentlyPursuing || profile?.current_education || "",
    areaOfInterest: profile?.areaOfInterest || profile?.area_of_interest || "",
    profileSummary: profile?.profile_summary || "",
    superpowers: normalizeArray(profile?.superpowers).join(", "),
    subjects: normalizeArray(profile?.subjects).join(", "),
    passions: normalizeArray(profile?.passions).join(", "),
  }), [profile]);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!profile) {
    return (
      <section className="min-h-screen bg-[#dbe4f2] px-4 py-7 sm:px-7">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#d4dbe8] bg-[#f7f9fc] p-9 text-center">
          <h1 className="cc-display text-3xl font-black text-[#0f1c3d]">No profile found</h1>
          <p className="cc-body mt-4 text-lg text-[#5f7194]">Please complete onboarding to generate your profile.</p>
          <button
            onClick={onRestart}
            className="cc-display mt-7 rounded-full bg-[#0f1c3d] px-8 py-3 text-lg font-bold text-white"
          >
            Restart Onboarding
          </button>
        </div>
      </section>
    );
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const nextProfile = {
      ...profile,
      name: form.name.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      currentlyPursuing: form.currentlyPursuing.trim(),
      areaOfInterest: form.areaOfInterest,
      profile_summary: form.profileSummary.trim(),
      superpowers: normalizeArray(form.superpowers),
      subjects: normalizeArray(form.subjects),
      passions: normalizeArray(form.passions),
      grade: form.currentlyPursuing.trim() || profile.grade,
      current_education: form.currentlyPursuing.trim(),
      area_of_interest: form.areaOfInterest,
    };

    try {
      const updated = await updateUser(profile.id, {
        name: nextProfile.name,
        gender: nextProfile.gender,
        dateOfBirth: nextProfile.dateOfBirth,
        current_education: nextProfile.current_education,
        area_of_interest: nextProfile.area_of_interest,
        profile_summary: nextProfile.profile_summary,
        superpowers: nextProfile.superpowers,
        subjects: nextProfile.subjects,
        passions: nextProfile.passions,
      });

      const mergedProfile = {
        ...nextProfile,
        ...(updated || {}),
      };

      onSave?.(mergedProfile);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#dbe4f2] px-4 py-7 sm:px-7">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-[#d4dbe8] bg-[#f7f9fc] p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="cc-body text-sm font-semibold tracking-[0.08em] text-[#4e68a0]">PROFILE SETTINGS</p>
              <h1 className="cc-display mt-3 text-4xl font-black text-[#0f1c3d] sm:text-5xl">
                {profile.name}'s Career Profile
              </h1>
            </div>
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 rounded-full border border-[#d4dbe8] bg-white px-5 py-3 text-sm font-bold text-[#20365d]"
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
          </div>

          <p className="cc-body mt-5 text-lg text-[#4f6283] sm:text-xl">
            Review your onboarding details and edit them here. Changes are saved through the user service.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#d4dbe8] bg-[#f7f9fc] p-7 sm:p-9 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" icon={<User size={16} />} value={form.name} onChange={handleChange("name")} />
              <Field label="Date of Birth" icon={<CalendarDays size={16} />} type="date" value={form.dateOfBirth} onChange={handleChange("dateOfBirth")} />
              <Field label="Currently Pursuing" icon={<BriefcaseBusiness size={16} />} value={form.currentlyPursuing} onChange={handleChange("currentlyPursuing")} />
              <Field label="Gender" as="select" value={form.gender} onChange={handleChange("gender")} options={["", "Male", "Female", "Non-binary", "Prefer not to say"]} />
            </div>

            <Field label="Area of Interest" as="select" value={form.areaOfInterest} onChange={handleChange("areaOfInterest")} options={["", "Technology & Digital Infrastructure", "Healthcare, Medical & Life Sciences", "Corporate Strategy, Business & Finance", "Applied Arts, Design & Media", "Engineering, Manufacturing & Heavy Industry", "Public Service, Social Impact & Education", "Other"]} />
            <Field label="Profile Summary" as="textarea" value={form.profileSummary} onChange={handleChange("profileSummary")} />

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Superpowers" icon={<Sparkles size={16} />} value={form.superpowers} onChange={handleChange("superpowers")} helper="Comma separated" />
              <Field label="Subjects" value={form.subjects} onChange={handleChange("subjects")} helper="Comma separated" />
              <Field label="Passions" value={form.passions} onChange={handleChange("passions")} helper="Comma separated" />
            </div>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#2f66de] px-8 py-3 text-lg font-bold text-white shadow-[0_8px_24px_rgba(47,102,222,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Profile
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#d4dbe8] bg-[#f7f9fc] p-7 sm:p-9">
              <h2 className="cc-display text-3xl font-black text-[#0f1c3d]">Current Details</h2>
              <div className="mt-6 space-y-4 text-[#4f6283]">
                <Detail label="Name" value={profile.name} />
                <Detail label="DOB" value={profile.dateOfBirth || "Not set"} />
                <Detail label="Currently Pursuing" value={profile.currentlyPursuing || profile.current_education || "Not set"} />
                <Detail label="Area of Interest" value={profile.areaOfInterest || profile.area_of_interest || "Not set"} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#d4dbe8] bg-[#eef3fb] p-7">
              <h3 className="cc-display text-2xl font-black text-[#0f1c3d]">Profile Preview</h3>
              <p className="cc-body mt-3 text-[#4f6283]">{form.profileSummary || profile.profile_summary}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", as = "input", options = [], helper, icon }) {
  const baseClass = "w-full rounded-2xl border border-[#cbd9f4] bg-[#f7fafe] px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#2f436d]">
        {icon}
        {label}
      </span>
      {as === "textarea" ? (
        <textarea className={`${baseClass} min-h-28`} value={value} onChange={onChange} />
      ) : as === "select" ? (
        <select className={baseClass} value={value} onChange={onChange}>
          {options.map((option) => (
            <option key={option || "empty"} value={option}>
              {option || `Select ${label.toLowerCase()}`}
            </option>
          ))}
        </select>
      ) : (
        <input className={baseClass} type={type} value={value} onChange={onChange} />
      )}
      {helper && <span className="mt-1 block text-xs text-[#5f7194]">{helper}</span>}
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-[#dce3ef] bg-white px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-widest text-[#4e68a0]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#20365d]">{value}</p>
    </div>
  );
}
