import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Loader2, Shield, Info, ChevronLeft
} from "lucide-react";
import { sendOtp, verifyOtp, signInWithGoogle } from "../services/auth";

export default function Login({ onBack }) {
  const [stage, setStage] = useState("phone"); // phone | otp | registration
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Registration details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    setAuthLoading(true);
    setErrorMessage("");
    try {
      await sendOtp(phone);
      setStage("otp");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }
    setAuthLoading(true);
    setErrorMessage("");
    try {
      await verifyOtp(phone, fullOtp);
      // Auth state change in App.js will handle the rest
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setErrorMessage("");
    try {
      await signInWithGoogle(); // Supabase handles the redirect automatically
    } catch (error) {
      setErrorMessage(error.message);
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }
    setAuthLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      setAuthLoading(false);
      setErrorMessage("Account created successfully!");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
      {/* HEADER */}
      <div className="relative border-b border-slate-800/50 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-bold hover:border-slate-600 hover:bg-slate-800 transition"
            >
              <ChevronLeft size={18} />
              Back
            </motion.button>
            
            <div className="h-3 w-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <AnimatePresence mode="wait">
          {/* PHONE/OTP STAGE */}
          {(stage === "phone" || stage === "otp") && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                >
                  <Shield className="h-8 w-8 text-cyan-400" />
                </motion.div>
                
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                    Secure Login
                  </h1>
                  <p className="mt-3 text-lg text-slate-400">
                    Choose an authentication method to access your career discovery journey.
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* PHONE AUTHENTICATION */}
                {stage === "phone" && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur p-6 sm:p-8 space-y-6">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-cyan-400 mb-4">
                          Phone Authentication
                        </label>
                        <div className="flex gap-3">
                          <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-4 text-slate-300 select-none font-bold">
                            +91
                          </div>
                          <div className="relative flex-1">
                            <Phone size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              placeholder="Enter 10-digit mobile number"
                              disabled={authLoading}
                              className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleSendOtp}
                        disabled={authLoading || phone.length < 10}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-xl transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {authLoading ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          "Send Verification OTP"
                        )}
                      </motion.button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-700" />
                      <span className="text-sm font-semibold text-slate-400">OR</span>
                      <div className="h-px flex-1 bg-slate-700" />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 py-4 text-base font-bold text-white transition"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <text x="2" y="18" fontSize="20" fill="currentColor">G</text>
                      </svg>
                      <span>Continue with Gmail / iOS</span>
                    </motion.button>
                  </motion.div>
                )}

                {/* OTP VERIFICATION */}
                {stage === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur p-6 sm:p-8 space-y-8"
                  >
                    <div className="text-center space-y-3">
                      <h2 className="text-2xl sm:text-3xl font-bold">Verify Your Number</h2>
                      <p className="text-slate-400">
                        Enter the 6-digit verification code sent to <span className="font-semibold text-white">+91 {phone}</span>
                      </p>
                    </div>

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
                          className="w-12 h-16 text-center text-2xl font-bold rounded-xl border border-slate-700 bg-slate-900/50 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition"
                        />
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={authLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-xl transition hover:-translate-y-0.5"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        "Verify & Continue"
                      )}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtp(["", "", "", "", "", ""]);
                        setStage("phone");
                      }}
                      className="w-full text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Edit Phone Number
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* REGISTRATION STAGE */}
          {stage === "registration" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur p-6 sm:p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black">Complete Your Profile</h2>
                <p className="text-slate-400">Just a few details to get you started</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-xl transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    "Create Account & Continue"
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4"
            >
              <Info size={16} className="shrink-0 mt-0.5 text-red-400" />
              <p className="text-sm font-semibold text-red-300">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
