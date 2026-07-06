import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Loader2, Shield, Info, ChevronLeft } from "lucide-react";
import { sendOtp, verifyOtp, loginRedirect } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

export default function Login({ onBack }) {
  const navigate = useNavigate();
  const { setTokenState, setUser, setIsRegistered } = useAuth();
  const [stage, setStage] = useState("phone");
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
    if (value !== "" && index < 5) otpRefs[index + 1].current.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) otpRefs[index - 1].current.focus();
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
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
    setAuthLoading(true);
    try {
      const result = await verifyOtp(phone, otp.join(""));
      setTokenState(result.token || "");
      setUser(result.user || null);
      setIsRegistered(Boolean(result.isRegistered));
      navigate(result.isRegistered ? "/dashboard" : "/register", { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginRedirect("google");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
      <div className="relative border-b border-slate-800/50 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack} className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-bold hover:border-slate-600 hover:bg-slate-800 transition">
              <ChevronLeft size={18} />
              Back
            </motion.button>
            <div className="h-3 w-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <AnimatePresence mode="wait">
          {(stage === "phone" || stage === "otp") && (
            <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="text-center space-y-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                  <Shield className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">Secure Login</h1>
                  <p className="mt-3 text-lg text-slate-400">Choose an authentication method to access your career discovery journey.</p>
                </div>
              </div>
              {stage === "phone" && (
                <motion.form key="phone" onSubmit={handleSendOtp} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                  <div className="rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur p-6 sm:p-8 space-y-6">
                    <div className="relative flex-1">
                      <Phone size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter 10-digit mobile number" className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition" />
                    </div>
                    <button type="submit" disabled={authLoading || phone.length < 10} className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-bold text-white disabled:opacity-50">
                      {authLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Send Verification OTP"}
                    </button>
                    <button type="button" onClick={handleGoogleLogin} className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 py-4 text-base font-bold text-white">Continue with Google</button>
                  </div>
                </motion.form>
              )}
              {stage === "otp" && (
                <motion.form key="otp" onSubmit={handleVerifyOtp} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6 rounded-3xl border border-slate-700/50 bg-slate-800/30 backdrop-blur p-6 sm:p-8">
                  <div className="flex justify-between gap-2 max-w-sm mx-auto">
                    {otp.map((digit, idx) => (
                      <input key={idx} ref={otpRefs[idx]} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)} className="w-12 h-16 text-center text-2xl font-bold rounded-xl border border-slate-700 bg-slate-900/50 text-white" />
                    ))}
                  </div>
                  <button type="submit" disabled={authLoading} className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-bold text-white">
                    {authLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Verify & Continue"}
                  </button>
                </motion.form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {errorMessage && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <Info size={16} className="shrink-0 mt-0.5 text-red-400" />
              <p className="text-sm font-semibold text-red-300">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
