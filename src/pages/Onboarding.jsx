import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone,
  ChevronRight, ChevronLeft, ChevronDown, Loader2,
  Shield, Info
} from "lucide-react";
import { registerUser } from "../services/users";

function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
    return null;
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthOffset = today.getMonth() - birthDate.getMonth();

  if (
    monthOffset < 0 ||
    (monthOffset === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export default function Onboarding({ onBack, onContinue }) {
  const [stage, setStage] = useState("auth"); // auth | phone-otp | registration
  
  // Auth details
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [authLoading, setAuthLoading] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  
  // Registration details
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [currentlyPursuing, setCurrentlyPursuing] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // OTP handlers
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next field
    if (value !== "" && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Trigger Google Login Mock
  const handleGoogleLogin = () => {
    setAuthLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      setAuthLoading(false);
      setAuthEmail("demo.student@gmail.com");
      setStage("registration");
    }, 1500);
  };

  // Trigger Phone verification Mock
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    setAuthLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      setAuthLoading(false);
      setStage("phone-otp");
    }, 1200);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }
    setAuthLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      setAuthLoading(false);
      setStage("registration");
    }, 1200);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!gender) {
      setErrorMessage("Please select your gender.");
      return;
    }
    if (!dateOfBirth) {
      setErrorMessage("Please enter your date of birth.");
      return;
    }
    if (!currentlyPursuing.trim()) {
      setErrorMessage("Please enter your current education or course.");
      return;
    }
    if (!areaOfInterest) {
      setErrorMessage("Please select your area of interest.");
      return;
    }

    const age = calculateAge(dateOfBirth);

    if (age === null) {
      setErrorMessage("Please enter a valid date of birth.");
      return;
    }

    setRegistrationLoading(true);
    setErrorMessage("");

    try {
      const registrationPayload = {
        name: name.trim(),
        gender,
        age,
        current_education: currentlyPursuing.trim(),
        area_of_interest: areaOfInterest,
      };

      console.log("Register user payload:", registrationPayload);

      const user = await registerUser(registrationPayload);

      const profile = {
        ...user,
        email: authEmail || `student.${phone || user.id}@gmail.com`,
        dateOfBirth,
        currentlyPursuing: user.current_education,
        areaOfInterest: user.area_of_interest,
        grade: user.current_education,
        profile_summary: `${user.name} is exploring career tracks. Currently pursuing ${user.current_education} with interest in ${user.area_of_interest}.`,
        superpowers: ["Problem Solving", "Adaptability"],
        subjects: [user.area_of_interest],
        passions: ["Building Technology"],
        suggested_careers: [],
        source: "api-registration",
      };

      onContinue?.(profile);
    } catch (error) {
      setErrorMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0f2fe_0%,_#f1f5f9_40%,_#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_top_left,_#0f172a_0%,_#1e293b_50%,_#0f172a_100%)] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="overflow-hidden rounded-[32px] border border-[#d6e2f5] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-[0_25px_60px_rgba(15,35,80,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          
          {/* Header Progress / Context Info */}
          <div className="border-b border-[#e2edf9] dark:border-slate-800 bg-[#f8faff] dark:bg-slate-950/40 px-6 py-5 sm:px-8 flex items-center justify-between">
            <button
              onClick={() => {
                if (stage === "phone-otp") setStage("auth");
                else if (stage === "registration") setStage("auth");
                else onBack?.();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#b8cbf7] dark:border-slate-800 bg-[#edf3ff] dark:bg-slate-800 px-4 py-2 text-sm font-bold text-[#234b9f] dark:text-slate-300 transition hover:bg-[#e0ebff] dark:hover:bg-slate-700 hover:-translate-y-0.5"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${stage === "auth" || stage === "phone-otp" ? "bg-[#3b82f6]" : "bg-[#c8d8ee] dark:bg-slate-800"}`} />
              <span className={`h-2.5 w-2.5 rounded-full ${stage === "registration" ? "bg-[#3b82f6]" : "bg-[#c8d8ee] dark:bg-slate-800"}`} />
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <AnimatePresence mode="wait">
              
              {/* STAGE 1: AUTHENTICATION */}
              {stage === "auth" && (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e3ebf8] dark:bg-slate-800 text-[#2d63df] dark:text-cyan-400">
                      <Shield size={28} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-[#0f2140] dark:text-white sm:text-3xl">Secure Onboarding</h2>
                    <p className="text-sm text-[#5f7194] dark:text-slate-400">Choose an authentication method to start your career discovery path.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Phone Authentication */}
                    <form onSubmit={handleSendOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-[#2f436d] dark:text-slate-300 mb-1.5">Phone Authentication</label>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5 rounded-2xl border border-[#cbd9f4] dark:border-slate-800 bg-[#f7fafe] dark:bg-slate-950 px-3 py-3.5 text-slate-600 dark:text-slate-400 select-none">
                            <span className="text-sm font-bold">+91</span>
                          </div>
                          <div className="relative flex-1">
                            <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] dark:text-slate-500" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              placeholder="Enter 10-digit mobile number"
                              disabled={authLoading}
                              className="w-full rounded-2xl border border-[#cbd9f4] dark:border-slate-800 bg-[#f7fafe] dark:bg-slate-950 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 dark:text-white placeholder:text-[#90a2c0] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading || phone.length < 10}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-500/10 hover:shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {authLoading && !authEmail ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          "Send Verification OTP"
                        )}
                      </button>
                    </form>

                    <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400 my-2">
                      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                      <span>Or</span>
                      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>

                    {/* Google Sign In */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={authLoading}
                      className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#cbd9f4] dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-4 text-base font-bold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-[#f6f9fe] dark:hover:bg-slate-900 hover:-translate-y-0.5"
                    >
                      {authLoading && authEmail ? (
                        <Loader2 size={18} className="animate-spin text-[#3b82f6]" />
                      ) : (
                        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.16-1.18-.46-1.63-.83z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      )}
                      <span>Continue with Gmail / iOS</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: OTP VERIFICATION */}
              {stage === "phone-otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e6fffa] dark:bg-slate-800 text-[#0f766e] dark:text-teal-400">
                      <Shield size={28} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-[#0f2140] dark:text-white sm:text-3xl">Verify Your Number</h2>
                    <p className="text-sm text-[#5f7194] dark:text-slate-400">Enter the 6-digit confirmation code sent to <strong>+91 {phone}</strong>.</p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="rounded-2xl border border-[#cbd9f4] dark:border-slate-800 bg-[#f7fafe] dark:bg-slate-950/50 p-6 space-y-4">
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-[#2f436d] dark:text-slate-300">
                        Enter OTP Code
                      </label>
                      <p className="text-xs text-[#5f7194] dark:text-slate-400">We sent a 6-digit code to your phone. Please enter it below:</p>
                      
                      <div className="flex justify-between gap-2 max-w-sm mx-auto">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={otpRefs[idx]}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-[#c4d7f5] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#1e3b70] dark:text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-base font-bold text-white shadow-md hover:shadow-lg transition hover:-translate-y-0.5"
                    >
                      {authLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        "Verify & Continue"
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setOtp(["", "", "", "", "", ""]);
                          setStage("auth");
                        }}
                        className="text-xs font-bold text-blue-500 hover:underline"
                      >
                        Resend Code or Edit Number
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STAGE 3: REGISTRATION */}
              {stage === "registration" && (
                <motion.div
                  key="registration"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f5f3ff] dark:bg-slate-800 text-[#6d28d9] dark:text-violet-400">
                      <User size={28} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-[#0f2140] dark:text-white sm:text-3xl">Complete Profile</h2>
                    <p className="text-sm text-[#5f7194] dark:text-slate-400">Please provide your details to personalize your discovery path.</p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-[#2f436d] dark:text-slate-300 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] dark:text-slate-500" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full rounded-2xl border border-[#cbd9f4] dark:border-slate-800 bg-[#f7fafe] dark:bg-slate-950 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 dark:text-white placeholder:text-[#90a2c0] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                      <div className="sm:col-span-4">
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-[#2f436d] dark:text-slate-300 mb-1.5">Date of Birth</label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9bb8] dark:text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>
                          </span>
                          <input
                            type="date"
                            required
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full rounded-2xl border border-[#cbd9f4] dark:border-slate-800 bg-[#f7fafe] dark:bg-slate-950 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 dark:text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-[#2f436d] dark:text-slate-300 mb-1.5">Currently Pursuing</label>
                        <input
                          type="text"
                          required
                          value={currentlyPursuing}
                          onChange={(e) => setCurrentlyPursuing(e.target.value)}
                          placeholder="e.g. Class 12 / B.Tech"
                          className="w-full rounded-2xl border border-[#cbd9f4] dark:border-slate-800 bg-[#f7fafe] dark:bg-slate-950 py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white placeholder:text-[#90a2c0] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-[#2f436d] dark:text-slate-300 mb-1.5">Gender</label>
                        <select
                          value={gender}
                          required
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full rounded-2xl border border-[#cbd9f4] dark:border-slate-800 bg-[#f7fafe] dark:bg-slate-950 py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-[#2f436d] dark:text-slate-300 mb-2">Area of Interest</label>
                      <select
                        value={areaOfInterest}
                        required
                        onChange={(e) => setAreaOfInterest(e.target.value)}
                        className="w-full rounded-2xl border border-[#cbd9f4] dark:border-slate-800 bg-[#f7fafe] dark:bg-slate-950 py-3 px-4 pr-10 text-sm font-semibold text-slate-800 dark:text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition appearance-none"
                      >
                        <option value="">Select area of interest</option>
                        <option value="Technology & Digital Infrastructure">Technology & Digital Infrastructure</option>
                        <option value="Healthcare, Medical & Life Sciences">Healthcare, Medical & Life Sciences</option>
                        <option value="Corporate Strategy, Business & Finance">Corporate Strategy, Business & Finance</option>
                        <option value="Applied Arts, Design & Media">Applied Arts, Design & Media</option>
                        <option value="Engineering, Manufacturing & Heavy Industry">Engineering, Manufacturing & Heavy Industry</option>
                        <option value="Public Service, Social Impact & Education">Public Service, Social Impact & Education</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9bb8] dark:text-slate-500" />
                    </div>

                    <button
                      type="submit"
                      disabled={registrationLoading}
                      className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-base font-bold text-white shadow-md shadow-blue-500/15 hover:shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {registrationLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <span>Submit & Start Assessment</span>
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
                >
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
