import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, User, Mail, Phone, Calendar, BookOpen, Briefcase, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const match = String(dateOfBirth).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    const d = new Date(dateOfBirth);
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const monthOffset = today.getMonth() - d.getMonth();
    if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < d.getDate())) age -= 1;
    return age;
  }
  const birthYear = parseInt(match[1], 10);
  const birthMonth = parseInt(match[2], 10);
  const birthDay = parseInt(match[3], 10);

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1; // 1-indexed
  const todayDay = today.getDate();

  let age = todayYear - birthYear;
  if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
    age -= 1;
  }
  return age;
}

function formatDateToYYYYMMDD(dateVal) {
  if (!dateVal) return "";
  try {
    if (dateVal instanceof Date) {
      const year = dateVal.getFullYear();
      const month = String(dateVal.getMonth() + 1).padStart(2, "0");
      const day = String(dateVal.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
  }

    if (typeof dateVal === "string") {
      const match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }

    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

const INTERESTS = [
  "Technology & Digital Infrastructure",
  "Healthcare, Medical & Life Sciences",
  "Corporate Strategy, Business & Finance",
  "Applied Arts, Design & Media",
  "Engineering, Manufacturing & Heavy Industry",
  "Public Service, Social Impact & Education",
  "Other",
];

const EDUCATION_OPTIONS = [
  "Class 9",
  "Class 10 (SSC)",
  "Class 11",
  "Class 12 (HSC / +2)",
  "Diploma / ITI",
  "Bachelor's Degree (B.A / B.Sc / B.Com)",
  "B.Tech / B.E.",
  "B.Arch / B.Des",
  "BBA / BMS",
  "MBBS / BDS / BAMS",
  "Master's Degree (M.A / M.Sc / M.Com)",
  "M.Tech / M.E.",
  "MBA / PGDM",
  "LLB / LLM",
  "PhD / Doctorate",
  "Other",
];

export default function Registration() {
  const { user, profile, completeRegistration, authLoading } = useAuth();
  const navigate = useNavigate();

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
    setForm((prev) => ({
      ...prev,
      email: profile?.email || user?.email || prev.email,
      phone: profile?.phone || user?.phone || prev.phone,
      name: profile?.name || user?.user_metadata?.full_name || prev.name,
      gender: profile?.gender || prev.gender,
      dateOfBirth: profile?.dateOfBirth ? formatDateToYYYYMMDD(profile.dateOfBirth) : prev.dateOfBirth,
      currentEducation: profile?.current_education || prev.currentEducation,
      areaOfInterest: profile?.area_of_interest || prev.areaOfInterest,
    }));
  }, [profile, user]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;
    if (field === "phone") {
      value = value.replace(/\D/g, "");
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
    }
    setForm((prev) => ({ ...prev, [field]: value }));
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

    if (!form.name.trim()) { setError("Full name is required."); return; }
    if (!form.gender) { setError("Please select your gender."); return; }
    if (!form.currentEducation.trim()) { setError("Current education is required."); return; }
    if (!form.areaOfInterest) { setError("Please select an area of interest."); return; }

    const phoneClean = form.phone.replace(/\D/g, "");
    if (phoneClean && phoneClean.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      await completeRegistration({
        name: form.name.trim(),
        email: form.email.trim() || user?.email || null,
        phone: phoneClean || user?.phone || null,
        gender: form.gender,
        age,
        dateOfBirth: form.dateOfBirth || null,
        current_education: form.currentEducation.trim(),
        area_of_interest: form.areaOfInterest,
        auth_user_id: user?.id,
        is_registered: true,
      });
      setSuccess("Profile saved! Welcome aboard 🎉");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to register.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#D3E3F5] bg-white/80 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 placeholder:text-slate-400";

  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1a36]/40 p-4 backdrop-blur-sm overflow-y-auto">

      {/* Modal Card */}
      <div className="relative w-full max-w-[640px] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-[#0b1a36]/10 pointer-events-auto my-8 border border-[#D3E3F5]">

        {/* Decorative top band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0b1a36] via-[#1E88E5] to-[#D3E3F5]" />

        <div className="p-7 sm:p-9">

          {/* Header */}
          <div className="mb-7">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#1E88E5] mb-3">
              Career Profile Setup
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b1a36] leading-tight">
              Complete Your Profile
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Tell us a bit about yourself to personalise your career discovery experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Name + Email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full Name"
                icon={<User size={14} className={iconClass} />}
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Your full name"
                className={inputClass}
                withIcon
              />
              <Field
                label="Email Address"
                type="email"
                icon={<Mail size={14} className={iconClass} />}
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                className={inputClass}
                withIcon
              />
            </div>

            {/* Row 2: Phone + Date of Birth */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Phone Number"
                icon={<Phone size={14} className={iconClass} />}
                value={form.phone}
                type="tel"
                onChange={handleChange("phone")}
                placeholder="10-digit mobile number"
                className={inputClass}
                withIcon
              />
              <Field
                label="Date of Birth"
                type="date"
                icon={<Calendar size={14} className={iconClass} />}
                value={form.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                className={inputClass}
                withIcon
              />
            </div>

            {/* Row 3: Current Education + Gender */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Current Education"
                icon={<BookOpen size={14} className={iconClass} />}
                value={form.currentEducation}
                onChange={handleChange("currentEducation")}
                className={inputClass}
                asSelect
                withIcon
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0b1a36] uppercase tracking-wider">Gender</label>
                <div className="relative">
                  <select
                    value={form.gender}
                    onChange={handleChange("gender")}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Area of Interest */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#0b1a36] uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={12} />
                Area of Interest
              </label>
              <div className="relative">
                <select
                  value={form.areaOfInterest}
                  onChange={handleChange("areaOfInterest")}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="">Select your primary area of interest</option>
                  {INTERESTS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                <p className="text-xs font-semibold">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
                <CheckCircle2 size={14} className="shrink-0" />
                <p className="text-xs font-semibold">{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-[#0b1a36] hover:bg-[#122b59] active:bg-[#071124] py-3 text-sm font-bold text-white transition shadow-md shadow-[#0b1a36]/20 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : (
                "Save & Continue →"
              )}
            </button>

            <p className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
              <CheckCircle2 size={12} className="text-slate-400 shrink-0" />
              Your profile is securely stored and never shared.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", className, icon, withIcon, asSelect }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-[#0b1a36] uppercase tracking-wider">{label}</label>
      <div className="relative">
        {withIcon && icon}
        {asSelect ? (
          <>
            <select
              value={value}
              onChange={onChange}
              className={`${className} ${withIcon ? "pl-10" : ""} appearance-none pr-9`}
            >
              <option value="">Select education level</option>
              {EDUCATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </>
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${className} ${withIcon ? "pl-10" : ""}`}
          />
        )}
      </div>
    </div>
  );
}