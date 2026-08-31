import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Phone, Shield, User } from "lucide-react";
import { sendOtp, verifyOtp } from "../services/auth";
import { registerUser } from "../services/users";
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

export default function Onboarding({ onBack, onContinue }) {
  const navigate = useNavigate();
  const { user, setUser, setTokenState, setIsRegistered } = useAuth();
  const [stage, setStage] = useState("auth");
  const [phone, setPhone] = useState(user?.phone || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [currentlyPursuing, setCurrentlyPursuing] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    setPhone(user?.phone || "");
    setName(user?.email ? user?.user_metadata?.full_name || name : name);
  }, [user]);

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

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < otpRefs.length - 1) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setAuthLoading(true);
    try {
      await sendOtp(phone);
      setStage("phone-otp");
    } catch (error) {
      setErrorMessage(error.message || "Unable to send OTP.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setAuthLoading(true);
    try {
      const result = await verifyOtp(phone, otp.join(""));
      setTokenState(result.token || "");
      setUser(result.user || null);
      setIsRegistered(Boolean(result.isRegistered));
      setStage("registration");
    } catch (error) {
      setErrorMessage(error.message || "OTP verification failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const age = calculateAge(dateOfBirth);
    if (!age) {
      setErrorMessage("Please enter a valid date of birth.");
      return;
    }

    setRegistrationLoading(true);
    try {
      const saved = await registerUser({
        auth_user_id: user?.id,
        email: user?.email || null,
        phone: phone || user?.phone || null,
        name: name.trim(),
        gender,
        age,
        current_education: currentlyPursuing.trim(),
        area_of_interest: areaOfInterest,
        is_registered: true,
        dateOfBirth,
      });

      setIsRegistered(true);
      setUser({
        ...(user || {}),
        ...(saved || {}),
      });
      onContinue?.(saved);
      navigate("/profile", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-[#D3E3F5] bg-white shadow-xs">
          
          {/* Header Bar */}
          <div className="border-b border-[#D3E3F5] bg-[#F0F6FC] px-6 py-4 sm:px-8 flex items-center justify-between">
            <button
              onClick={() => {
                if (stage === "phone-otp" || stage === "registration") setStage("auth");
                else onBack?.();
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 shadow-2xs"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full transition-all ${stage !== "registration" ? "bg-[#0b1a36]" : "bg-[#D3E3F5]"}`} />
              <span className={`h-2.5 w-2.5 rounded-full transition-all ${stage === "registration" ? "bg-[#0b1a36]" : "bg-[#D3E3F5]"}`} />
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {stage === "auth" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#D3E3F5] bg-[#EAF2FA] text-[#1E88E5] shadow-xs">
                    <Shield size={26} />
                  </div>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0b1a36] sm:text-3xl">Secure Onboarding</h2>
                  <p className="text-xs sm:text-sm text-slate-600">Choose an authentication method to start your career discovery path.</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Phone Authentication</label>
                    <div className="flex gap-2">
                      <div className="flex items-center rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] px-3.5 py-3 text-slate-700 select-none shadow-2xs">
                        <span className="text-xs font-bold">+91</span>
                      </div>
                      <div className="relative flex-1">
                        <Phone size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="Enter 10-digit mobile number"
                          disabled={authLoading}
                          className="w-full rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] py-3 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-slate-400 outline-none transition shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || phone.length < 10}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0b1a36] hover:bg-[#122b59] py-3 text-xs sm:text-sm font-bold text-white transition disabled:opacity-50 shadow-xs"
                  >
                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : "Send Verification OTP"}
                  </button>
                </form>
              </div>
            )}

            {stage === "phone-otp" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-xs">
                    <Shield size={26} />
                  </div>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0b1a36] sm:text-3xl">Verify Your Number</h2>
                  <p className="text-xs sm:text-sm text-slate-600">Enter the 6-digit confirmation code sent to <strong className="text-slate-900">+91 {phone}</strong>.</p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="rounded-3xl border border-[#D3E3F5] bg-[#F0F6FC] p-6 space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Enter OTP Code</label>
                    <div className="flex justify-between gap-2 max-w-xs mx-auto">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-2xl border border-[#D3E3F5] bg-white text-slate-900 focus:border-slate-400 outline-none transition shadow-2xs"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0b1a36] hover:bg-[#122b59] py-3 text-xs sm:text-sm font-bold text-white transition disabled:opacity-50 shadow-xs"
                  >
                    {authLoading ? <Loader2 size={16} className="animate-spin" /> : "Verify & Continue"}
                  </button>
                </form>
              </div>
            )}

            {stage === "registration" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#D3E3F5] bg-[#EAF2FA] text-[#1E88E5] shadow-xs">
                    <User size={26} />
                  </div>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0b1a36] sm:text-3xl">Complete Profile</h2>
                  <p className="text-xs sm:text-sm text-slate-600">Please provide your details to personalize your discovery path.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] py-3 px-4 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] py-2.5 px-3 text-xs sm:text-sm font-semibold text-slate-800 focus:border-slate-400 outline-none transition shadow-2xs"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Currently Pursuing</label>
                      <input
                        type="text"
                        required
                        value={currentlyPursuing}
                        onChange={(e) => setCurrentlyPursuing(e.target.value)}
                        placeholder="e.g. Class 12 / B.Tech"
                        className="w-full rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] py-2.5 px-3 text-xs sm:text-sm font-semibold text-slate-800 focus:border-slate-400 outline-none transition shadow-2xs"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Gender</label>
                      <div className="relative">
                        <select
                          value={gender}
                          required
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] py-2.5 px-3 pr-8 text-xs sm:text-sm font-semibold text-slate-800 focus:border-slate-400 outline-none transition shadow-2xs appearance-none"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Area of Interest</label>
                    <div className="relative">
                      <select
                        value={areaOfInterest}
                        required
                        onChange={(e) => setAreaOfInterest(e.target.value)}
                        className="w-full rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] py-3 px-4 pr-10 text-xs sm:text-sm font-semibold text-slate-800 focus:border-slate-400 outline-none transition appearance-none shadow-2xs"
                      >
                        <option value="">Select area of interest</option>
                        {shortcuts.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registrationLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-[#0b1a36] hover:bg-[#122b59] py-3 text-xs sm:text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 shadow-xs"
                  >
                    {registrationLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span>Submit & Start Assessment</span>
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {errorMessage && (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}