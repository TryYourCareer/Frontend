import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
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
  const { user, completeRegistration, authLoading } = useAuth();
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

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const age = calculateAge(form.dateOfBirth);
    if (!age) return setError("Please enter a valid date of birth.");
    try {
      await completeRegistration({
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        age,
        current_education: form.currentEducation,
        area_of_interest: form.areaOfInterest,
        auth_user_id: user?.id,
        is_registered: true,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to register.");
    }
  };

  return (
    <section className="min-h-screen bg-[#dbe4f2] px-4 py-7 sm:px-7">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#d4dbe8] bg-[#f7f9fc] p-7 sm:p-9">
        <p className="cc-body text-sm font-semibold tracking-[0.08em] text-[#4e68a0]">COMPLETE REGISTRATION</p>
        <h1 className="cc-display mt-3 text-4xl font-black text-[#0f1c3d]">Create your profile</h1>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" value={form.name} onChange={handleChange("name")} />
          <Field label="Email" value={form.email} onChange={handleChange("email")} />
          <Field label="Phone" value={form.phone} onChange={handleChange("phone")} />
          <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={handleChange("dateOfBirth")} />
          <Field label="Current Education" value={form.currentEducation} onChange={handleChange("currentEducation")} />
          <Field label="Area of Interest" value={form.areaOfInterest} onChange={handleChange("areaOfInterest")} />
          <Field label="Gender" value={form.gender} onChange={handleChange("gender")} />
          {error && <p className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={authLoading}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#2f66de] px-8 py-3 text-lg font-bold text-white disabled:opacity-60"
          >
            {authLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save & Continue
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-widest text-[#2f436d]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-[#cbd9f4] bg-[#f7fafe] px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
