import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, Loader2, Shield, Info, X } from "lucide-react";
import { sendOtp, verifyOtp } from "../services/auth";

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [stage, setStage] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      await sendOtp(phone); // service handles +91 prefix
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
      const result = await verifyOtp(phone, fullOtp); // service handles +91 prefix
      onAuthSuccess(result?.user ?? null);
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm"
      >
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          className="w-full max-w-md rounded-2xl border border-[#d6e2f5] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 text-slate-900 dark:text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#234b9f] dark:text-cyan-400">Secure Access</p>
              <h2 className="text-2xl font-black">Authentication</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-white/10 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {/* PHONE STAGE */}
            {stage === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5"
              >
                <div className="text-center space-y-2">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e3ebf8] dark:bg-slate-800 text-[#2d63df] dark:text-cyan-400">
                    <Shield size={24} />
                  </div>
                  <p className="text-sm text-[#5f7194] dark:text-slate-400">Enter your phone number to verify your identity.</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-[#2f436d] dark:text-slate-300 mb-1.5">Phone Number</label>
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
                    {authLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Send Verification OTP"
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* OTP STAGE */}
            {stage === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e6fffa] dark:bg-slate-800 text-[#0f766e] dark:text-teal-400">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0f2140] dark:text-white">Verify Your Number</h3>
                  <p className="text-sm text-[#5f7194] dark:text-slate-400">Enter the 6-digit code sent to <strong>+91 {phone}</strong>.</p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-[#c4d7f5] dark:border-slate-800 bg-[#f7faff] dark:bg-slate-950 text-[#1e3b70] dark:text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
                      />
                    ))}
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
                        setStage("phone");
                      }}
                      className="text-xs font-bold text-blue-500 hover:underline"
                    >
                      Edit Phone Number
                    </button>
                  </div>
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
                className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3 text-xs font-semibold text-red-700 dark:text-red-300"
              >
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
