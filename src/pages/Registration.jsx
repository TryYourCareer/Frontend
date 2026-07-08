import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  if (Number.isNaN(birthDate.getTime()) || birthDate > today) return null;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthOffset = today.getMonth() - birthDate.getMonth();
  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

export default function Registration() {
  const navigate = useNavigate();
  const { user, profile, completeRegistration, authLoading, isRegistered } = useAuth();
  const resolvedUser = profile || user;
  const [form, setForm] = useState({
    name: "",
    email: user?.email || "",
    gender: "",
    dateOfBirth: "",
    currentEducation: "",
    areaOfInterest: "",
    phone: user?.phone || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isRegistered && resolvedUser) {
      navigate("/profile", { replace: true });
    }
  }, [isRegistered, navigate, resolvedUser]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      email: profile?.email || user?.email || prev.email,
      phone: profile?.phone || user?.phone || prev.phone,
      name: profile?.name || user?.user_metadata?.full_name || prev.name,
      gender: profile?.gender || prev.gender,
      currentEducation: profile?.current_education || prev.currentEducation,
      areaOfInterest: profile?.area_of_interest || prev.areaOfInterest,
    }));
  }, [profile, user]);

  const shortcuts = useMemo(
    () => [
      "Technology & Digital Infrastructure",
      "Healthcare, Medical & Life Sciences",
      "Corporate Strategy, Business & Finance",
      "Applied Arts, Design & Media",
      "Engineering, Manufacturing & Heavy Industry",
      "Public Service, Social Impact & Education",
    ],
    []
  );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const age = calculateAge(form.dateOfBirth);
    if (!age) {
      setError("Please enter a valid date of birth.");
      return;
    }

    try {
      await completeRegistration({
        name: form.name.trim(),
        email: form.email.trim() || user?.email || null,
        phone: form.phone.trim() || user?.phone || null,
        gender: form.gender,
        age,
        dateOfBirth: form.dateOfBirth,
        current_education: form.currentEducation.trim(),
        area_of_interest: form.areaOfInterest,
        auth_user_id: user?.id,
        is_registered: true,
      });
      setSuccess("Profile saved successfully.");
      window.setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 900);
    } catch (err) {
      setError(err.message || "Unable to register.");
    }
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eef6ff_0%,_#dbe7ff_45%,_#f4f7fb_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white/90 shadow-[0_25px_70px_rgba(37,64,116,0.12)] backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-gradient-to-br from-[#0f1c3d] via-[#123a74] to-[#1e5bd8] p-8 text-white sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">Complete Registration</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Build your career profile</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-200">
              We&apos;ll use these details to personalize your assessment, save your progress, and keep the experience aligned with the backend profile record.
            </p>

            <div className="mt-8 space-y-3">
              {shortcuts.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" value={form.name} onChange={handleChange("name")} placeholder="Your name" />
              <Field label="Email" value={form.email} onChange={handleChange("email")} placeholder="you@example.com" />
              <Field label="Phone" value={form.phone} onChange={handleChange("phone")} placeholder="10-digit mobile number" />
              <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={handleChange("dateOfBirth")} />
              <Field label="Current Education" value={form.currentEducation} onChange={handleChange("currentEducation")} placeholder="Class 12, B.Tech, etc." />
              <Field label="Gender" as="select" value={form.gender} onChange={handleChange("gender")} options={["", "Male", "Female", "Non-binary", "Prefer not to say"]} />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Area of Interest</label>
              <select
                value={form.areaOfInterest}
                onChange={handleChange("areaOfInterest")}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select area of interest</option>
                {shortcuts.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>

            {error && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            {success && <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:shadow-[0_16px_35px_rgba(37,99,235,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save & Continue
            </button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <CheckCircle2 size={14} />
              Your profile is saved through the authenticated backend route.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", as = "input", options = [], placeholder = "" }) {
  const baseClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      {as === "select" ? (
        <select className={baseClass} value={value} onChange={onChange}>
          {options.map((option) => (
            <option key={option || "empty"} value={option}>
              {option || `Select ${label.toLowerCase()}`}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={baseClass} />
      )}
    </label>
  );
}
