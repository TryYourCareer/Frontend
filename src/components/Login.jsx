import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Info, Loader2, Phone, Shield } from "lucide-react";
import { loginRedirect, sendOtp, verifyOtp } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

export default function Login({ onBack }) {
  const navigate = useNavigate();
  const { setTokenState, setUser, setIsRegistered } = useAuth();
  const [stage, setStage] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    if (value && index < otpRefs.length - 1) {
      otpRefs[index + 1].current?.focus();
    }
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
      setStage("otp");
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
      navigate(result.isRegistered ? "/profile" : "/register", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "OTP verification failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    try {
      await loginRedirect("google");
    } catch (error) {
      setErrorMessage(error.message || "Google sign-in failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 px-4 py-6 text-white backdrop-blur-md sm:px-6 sm:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22)_0%,_rgba(37,99,235,0.18)_30%,_rgba(2,6,23,0.96)_100%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center">
        <div className="w-full overflow-hidden rounded-[34px] border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <div className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
                ClearCareer
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-white/10 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent p-8 sm:p-10 lg:border-b-0 lg:border-r">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/20 bg-white/10">
                <Shield className="h-8 w-8 text-cyan-300" />
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Secure Login</h1>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
                Sign in with OTP or Google, then we&apos;ll check `public.users` by your authenticated Supabase UUID.
              </p>
              <div className="mt-8 grid gap-3 text-sm text-slate-200">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">OTP verification uses the backend Supabase auth session.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Registered users go to the dashboard automatically.</div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {stage === "phone" ? (
                  <motion.form
                    key="phone"
                    onSubmit={handleSendOtp}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.2em] text-slate-300">
                        Phone number
                      </label>
                      <div className="relative">
                        <Phone size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading || phone.length < 10}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-sm font-bold text-white transition hover:shadow-[0_12px_35px_rgba(34,211,238,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {authLoading ? <Loader2 size={18} className="animate-spin" /> : "Send OTP"}
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={authLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
                    >
                      Continue with Google
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="otp"
                    onSubmit={handleVerifyOtp}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.2em] text-slate-300">
                        Enter OTP
                      </label>
                      <div className="flex justify-between gap-2">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={otpRefs[idx]}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            maxLength={1}
                            inputMode="numeric"
                            className="h-14 w-12 rounded-2xl border border-white/10 bg-slate-950/70 text-center text-xl font-black text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                          />
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-slate-400">Code sent to +91 {phone}</p>
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-sm font-bold text-white transition hover:shadow-[0_12px_35px_rgba(34,211,238,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {authLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Continue"}
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStage("phone");
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="w-full text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
                    >
                      Edit phone number
                    </button>
                  </motion.form>
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
                    <Info size={16} className="mt-0.5 shrink-0 text-red-300" />
                    <p className="text-sm font-medium text-red-100">{errorMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
