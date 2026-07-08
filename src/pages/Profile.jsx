import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Loader2, Save, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function toInputDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function Profile({ profile, onRestart, onSave }) {
  const navigate = useNavigate();
  const { saveProfile, authLoading } = useAuth();
  const initialForm = useMemo(
    () => ({
      name: profile?.name || "",
      gender: profile?.gender || "",
      dateOfBirth: toInputDate(profile?.dateOfBirth),
      currentEducation: profile?.currentlyPursuing || profile?.current_education || "",
      areaOfInterest: profile?.areaOfInterest || profile?.area_of_interest || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    }),
    [profile]
  );

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  if (!profile) {
    return (
      <section className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">No profile found</h1>
          <p className="mt-3 text-slate-600">Please complete registration to load your profile.</p>
          <button
            onClick={onRestart}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to start
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
    setError("");
    setSuccess("");

    try {
      const updated = await saveProfile(profile.id, {
        name: form.name.trim(),
        gender: form.gender,
        age: profile.age ?? 0,
        dateOfBirth: form.dateOfBirth,
        current_education: form.currentEducation.trim(),
        area_of_interest: form.areaOfInterest,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        is_registered: true,
      });

      onSave?.({
        ...profile,
        ...updated,
        currentlyPursuing: updated?.current_education || form.currentEducation,
        areaOfInterest: updated?.area_of_interest || form.areaOfInterest,
      });
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    }
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eef6ff_0%,_#dbe7ff_45%,_#f4f7fb_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white/90 shadow-[0_25px_70px_rgba(37,64,116,0.12)] backdrop-blur">
        <div className="border-b border-slate-200 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">Profile Settings</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{profile.name}'s Career Profile</h1>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" icon={<User size={16} />} value={form.name} onChange={handleChange("name")} />
              <Field label="Email" value={form.email} onChange={handleChange("email")} />
              <Field label="Phone" value={form.phone} onChange={handleChange("phone")} />
              <Field label="Date of Birth" icon={<CalendarDays size={16} />} type="date" value={form.dateOfBirth} onChange={handleChange("dateOfBirth")} />
            </div>

            <Field
              label="Currently Pursuing"
              as="select"
              value={form.currentEducation}
              onChange={handleChange("currentEducation")}
              options={["10th Grade", "12th Grade", "Bachelor's Degree", "Master's Degree", "PhD", "Professional Certification"]}
            />
            <Field
              label="Gender"
              as="select"
              value={form.gender}
              onChange={handleChange("gender")}
              options={["", "Male", "Female", "Non-binary", "Prefer not to say"]}
            />
            <Field
              label="Area of Interest"
              as="select"
              value={form.areaOfInterest}
              onChange={handleChange("areaOfInterest")}
              options={["Technology & Digital Infrastructure", "Healthcare, Medical & Life Sciences", "Corporate Strategy, Business & Finance", "Applied Arts, Design & Media", "Engineering, Manufacturing & Heavy Industry", "Public Service, Social Impact & Education", "Other"]}
            />

            {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            {success && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Profile
            </button>
          </form>

          <aside className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="rounded-[24px] border border-blue-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Backend-linked profile</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your edits are saved through the authenticated backend update route, so the same data is available for assessment and dashboard screens.
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <InfoRow label="Profile ID" value={String(profile.id)} />
                <InfoRow label="Education" value={form.currentEducation || "Not set"} />
                <InfoRow label="Interest" value={form.areaOfInterest || "Not set"} />
              </div>
              <div className="mt-6 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                <CheckCircle2 className="mr-2 inline-block" size={16} />
                Changes persist immediately after save.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", as = "input", options = [], icon }) {
  const baseClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
        {icon}
        {label}
      </span>
      {as === "select" ? (
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
    </label>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}
