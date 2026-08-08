import { useEffect, useMemo, useState } from "react";
import { Save, Camera, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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

export default function Profile({ profile, onRestart, onSave }) {
  const { saveProfile, authLoading } = useAuth();

  const splitName = (fullName = "") => {
    const parts = fullName.trim().split(" ");
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
  };

  const initialForm = useMemo(() => {
    const names = splitName(profile?.name);
    return {
      firstName: names.first,
      lastName: names.last,
      email: profile?.email || "",
      phone: profile?.phone || "",
      phoneCode: "+91",
      country: profile?.country || "India",
      city: profile?.city || "",
      zipCode: profile?.zipCode || profile?.zip_code || "",
      gender: profile?.gender || "",
      dateOfBirth: formatDateToYYYYMMDD(profile?.dateOfBirth) || "",
      currentEducation: profile?.current_education || profile?.currentlyPursuing || "",
      areaOfInterest: profile?.area_of_interest || profile?.areaOfInterest || "",
    };
  }, [profile]);

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  /* ── Skeleton while profile loads ── */
  if (!profile) {
    return (
      <section className="min-h-screen bg-[#FAF6EC] px-6 py-10 text-slate-800">
        <div className="mx-auto max-w-5xl space-y-8 animate-pulse">
          <div className="flex items-center justify-between border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-full bg-[#e8dfc8]" />
              <div className="h-7 w-56 rounded-xl bg-[#e8dfc8]" />
            </div>
            <div className="h-9 w-28 rounded-full bg-[#e8dfc8]" />
          </div>
          <div className="h-24 w-24 rounded-full bg-[#e8dfc8]" />
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-2.5 w-20 rounded-full bg-[#e8dfc8]" />
                <div className="h-11 w-full rounded-xl bg-[#e8dfc8]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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

    const phoneClean = form.phone.replace(/\D/g, "");
    if (phoneClean && phoneClean.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      const combinedName = `${form.firstName} ${form.lastName}`.trim();
      const updated = await saveProfile(profile.id, {
        name: combinedName,
        gender: form.gender || profile.gender || "",
        dateOfBirth: form.dateOfBirth || null,
        current_education: form.currentEducation || profile.current_education || "",
        area_of_interest: form.areaOfInterest || profile.area_of_interest || "",
        email: form.email.trim() || null,
        phone: phoneClean || null,
        country: form.country || null,
        city: form.city || null,
        zipCode: form.zipCode || null,
        is_registered: true,
      });

      onSave?.({
        ...profile,
        ...updated,
        currentlyPursuing: updated?.current_education || profile.currentlyPursuing,
        areaOfInterest: updated?.area_of_interest || profile.areaOfInterest,
      });
      setSuccess("Changes saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save profile.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#e2d9c8] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#5B7EC9] focus:ring-2 focus:ring-[#5B7EC9]/20 placeholder:text-slate-400";

  const labelClass = "text-xs font-bold text-[#7B4A28] uppercase tracking-wider";

  return (
    <section className="min-h-screen bg-[#FAF6EC] px-6 py-10 text-slate-800 text-left">
      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-10">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e2d9c8] pb-6">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7B4A28]/60">Account</span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3D1F08]">Personal Information</h1>
            </div>
            {authLoading && (
              <span className="flex items-center gap-1.5 text-xs text-[#5B7EC9] font-semibold">
                <Loader2 size={13} className="animate-spin" />
                Saving...
              </span>
            )}
            {success && !authLoading && (
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                ✓ {success}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={authLoading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#5B7EC9] hover:bg-[#4a6db8] px-5 py-2.5 text-xs font-bold text-white transition disabled:opacity-60 shadow-md shadow-[#5B7EC9]/20"
          >
            {authLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Changes
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-start">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#e2d9c8] shadow-md">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face"
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-[#3D1F08]/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
              <Camera size={18} />
            </div>
            <div className="absolute bottom-0 right-0 bg-[#5B7EC9] text-white p-1.5 rounded-full border-2 border-[#FAF6EC] shadow-sm">
              <Camera size={11} />
            </div>
          </div>
        </div>

        {/* ── Section 1: Basic Info ── */}
        <div className="space-y-5">
          <SectionHeading title="Basic Information" />
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="First Name" className={labelClass}>
              <input
                type="text"
                value={form.firstName}
                onChange={handleChange("firstName")}
                placeholder="First name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Last Name" className={labelClass}>
              <input
                type="text"
                value={form.lastName}
                onChange={handleChange("lastName")}
                placeholder="Last name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Email Address" className={labelClass}>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                className={inputClass}
              />
            </FormField>

            <FormField label="Phone Number" className={labelClass}>
              <div className="flex rounded-xl border border-[#e2d9c8] overflow-hidden focus-within:ring-2 focus-within:ring-[#5B7EC9]/20 focus-within:border-[#5B7EC9] bg-white">
                <select
                  value={form.phoneCode}
                  onChange={handleChange("phoneCode")}
                  className="bg-transparent pl-4 pr-2 py-3 text-sm text-slate-600 outline-none border-r border-[#e2d9c8]"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+880">+880 (BD)</option>
                </select>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="Mobile number"
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
                />
              </div>
            </FormField>

            <FormField label="Gender" className={labelClass}>
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
            </FormField>

            <FormField label="Date of Birth" className={labelClass}>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                className={inputClass}
              />
            </FormField>
          </div>
        </div>

        {/* ── Section 2: Academic & Career ── */}
        <div className="space-y-5">
          <SectionHeading title="Academic & Career" />
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Current Education" className={labelClass}>
              <div className="relative">
                <select
                  value={form.currentEducation}
                  onChange={handleChange("currentEducation")}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="">Select education level</option>
                  {EDUCATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </FormField>

            <FormField label="Area of Interest" className={labelClass}>
              <div className="relative">
                <select
                  value={form.areaOfInterest}
                  onChange={handleChange("areaOfInterest")}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="">Select your area of interest</option>
                  {INTERESTS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </FormField>
          </div>
        </div>

        {/* ── Section 3: Location ── */}
        <div className="space-y-5">
          <SectionHeading title="Location" />
          <div className="grid gap-5 md:grid-cols-3">
            <FormField label="Country" className={labelClass}>
              <div className="relative">
                <select
                  value={form.country}
                  onChange={handleChange("country")}
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </FormField>

            <FormField label="City" className={labelClass}>
              <input
                type="text"
                value={form.city}
                onChange={handleChange("city")}
                placeholder="Your city"
                className={inputClass}
              />
            </FormField>

            <FormField label="ZIP / Postal Code" className={labelClass}>
              <input
                type="text"
                value={form.zipCode}
                onChange={handleChange("zipCode")}
                placeholder="e.g. 110001"
                className={inputClass}
              />
            </FormField>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-xs font-semibold">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Danger Zone ── */}
        <div className="border-t border-[#e2d9c8] pt-8 space-y-4">
          <h2 className="text-base font-serif font-bold text-[#3D1F08]">Delete Account</h2>
          <div className="flex items-start gap-3 rounded-xl bg-white p-4 border border-[#e2d9c8] text-xs text-slate-600 shadow-sm">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <p>
              After making a deletion request, you will have{" "}
              <strong className="text-slate-900">6 months</strong> to maintain this account before permanent deletion.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 text-xs font-bold transition bg-white"
          >
            Request Account Deletion
          </button>
        </div>

      </form>
    </section>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#7B4A28]/70">{title}</h2>
      <div className="flex-1 h-px bg-[#e2d9c8]" />
    </div>
  );
}

function FormField({ label, children, className }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={className || "text-xs font-bold text-[#7B4A28] uppercase tracking-wider"}>
        {label}
      </label>
      {children}
    </div>
  );
}
