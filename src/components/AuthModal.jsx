import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, UserCircle2, X } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebaseConfig";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSuccessMessage(false);

    if (!isFirebaseConfigured) {
      setError("Firebase is not configured. Add REACT_APP_FIREBASE_* values in .env.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    if (isLogin) {
      try {
        await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        onAuthSuccess();
      } catch (loginError) {
        setError(loginError?.message || "Login failed.");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      onAuthSuccess();
    } catch (signUpError) {
      setError(signUpError?.message || "Sign-up failed.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsSuccessMessage(true);
    setError("Account created successfully.");
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
          className="w-full max-w-md rounded-2xl border border-white/20 bg-slate-900/90 p-6 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-cyan-200">Secure Access</p>
              <h2 className="text-2xl font-black text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-200 transition hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="relative mb-5 grid grid-cols-2 rounded-xl border border-white/15 bg-slate-950/40 p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
                setIsSuccessMessage(false);
              }}
              className={`relative z-10 rounded-lg py-2 text-sm font-semibold transition-colors duration-200 ${
                isLogin ? "text-slate-900" : "text-slate-300 hover:text-white"
              }`}
            >
              {isLogin && (
                <motion.div
                  layoutId="activeAuthTab"
                  className="absolute inset-0 rounded-lg bg-cyan-400 -z-10"
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                />
              )}
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
                setIsSuccessMessage(false);
              }}
              className={`relative z-10 rounded-lg py-2 text-sm font-semibold transition-colors duration-200 ${
                !isLogin ? "text-slate-900" : "text-slate-300 hover:text-white"
              }`}
            >
              {!isLogin && (
                <motion.div
                  layoutId="activeAuthTab"
                  className="absolute inset-0 rounded-lg bg-cyan-400 -z-10"
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                />
              )}
              Sign-up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <motion.label layout className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
                <Mail className="h-3.5 w-3.5 text-cyan-400" />
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
                placeholder="you@example.com"
                required
              />
            </motion.label>

            <motion.label layout className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
                <Lock className="h-3.5 w-3.5 text-cyan-400" />
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-white/10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.label>

            <AnimatePresence>
              {!isLogin && (
                <motion.label 
                  layout
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 180, damping: 20 }}
                  className="block overflow-hidden"
                >
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
                    <UserCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                    Confirm Password
                  </span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-slate-950/50 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
                      placeholder="Re-enter password"
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-white/10"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.label>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  layout
                  key={error}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: [0, -6, 6, -6, 6, 0] }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ 
                    x: { duration: 0.35, ease: "easeInOut" },
                    default: { type: "spring", stiffness: 200, damping: 18 }
                  }}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    isSuccessMessage
                      ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                      : "border border-red-400/30 bg-red-500/10 text-red-200"
                  }`}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              layout
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : isLogin ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
