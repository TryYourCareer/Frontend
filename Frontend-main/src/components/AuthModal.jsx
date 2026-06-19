import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, UserCircle2, X, Phone } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebaseConfig";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState("email"); // 'email' or 'phone'
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInWithGoogle = async () => {
    setError("");
    const signedUp = !isLogin;
    if (isFirebaseConfigured) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        onAuthSuccess(signedUp);
      } catch (err) {
        setError(err?.message || "Google sign-in failed.");
      }
      return;
    }

    // Mock Google sign-in
    const mockUser = {
      uid: `mock-google-${Date.now()}`,
      email: "google-user@example.com",
      displayName: "Google User",
    };
    auth.setCurrentUser(mockUser);
    const userProfile = {
      name: mockUser.displayName,
      email: mockUser.email,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    onAuthSuccess(signedUp);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSuccessMessage(false);

    // Validate method-specific identifier
    if (authMethod === "email") {
      if (!EMAIL_REGEX.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      const digits = String(phone || "").replace(/\D/g, "");
      if (!digits || digits.length < 8) {
        setError("Please enter a valid phone number.");
        return;
      }
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    const authIdentifier = authMethod === "email" ? email.trim().toLowerCase() : `${String(phone).replace(/\D/g, "")}@phone.local`;

    if (isLogin) {
      try {
        if (isFirebaseConfigured) {
          await signInWithEmailAndPassword(auth, authIdentifier, password);
        } else {
          const mockUser = {
            uid: `mock-${Date.now()}`,
            email: authIdentifier,
          };
          auth.setCurrentUser(mockUser);
        }
        onAuthSuccess(false);
      } catch (loginError) {
        setError(loginError?.message || "Login failed.");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      return;
    }

    try {
      if (isFirebaseConfigured) {
        await createUserWithEmailAndPassword(auth, authIdentifier, password);
      } else {
        const mockUser = {
          uid: `mock-${Date.now()}`,
          email: authIdentifier,
        };
        auth.setCurrentUser(mockUser);
      }

      const userProfile = {
        name: name.trim(),
        email: authMethod === "email" ? email.trim().toLowerCase() : null,
        phone: authMethod === "phone" ? String(phone).replace(/\D/g, "") : null,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      onAuthSuccess(true);
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
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-cyan-700">Secure Access</p>
              <h2 className="text-2xl font-black text-slate-900">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-200 transition hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-3xl border border-slate-200 bg-slate-100 p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
                setIsSuccessMessage(false);
                setEmail("");
                setPhone("");
                setPassword("");
                setName("");
                setAuthMethod("email");
              }}
              className={`rounded-2xl py-2 text-sm font-semibold transition ${
                isLogin ? "bg-cyan-600 text-white shadow" : "text-slate-600 hover:bg-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
                setIsSuccessMessage(false);
                setEmail("");
                setPhone("");
                setPassword("");
                setName("");
                setAuthMethod("email");
              }}
              className={`rounded-2xl py-2 text-sm font-semibold transition ${
                !isLogin ? "bg-cyan-600 text-white shadow" : "text-slate-600 hover:bg-white"
              }`}
            >
              Sign-up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {/* Signup-specific fields */}
            {!isLogin && (
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  Full Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. John Doe"
                />
              </label>
            )}

            {/* Method selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`rounded-2xl py-2 text-xs font-semibold transition ${authMethod === "email" ? "bg-slate-900 text-white" : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"}`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
                className={`rounded-2xl py-2 text-xs font-semibold transition ${authMethod === "phone" ? "bg-slate-900 text-white" : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"}`}
              >
                Phone
              </button>
            </div>

            {authMethod === "email" ? (
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  <Mail className="h-3.5 w-3.5 text-cyan-500" />
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                  placeholder="you@example.com"
                />
              </label>
            ) : (
              <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  <Phone className="h-3.5 w-3.5 text-cyan-500" />
                  Phone
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. +91 9876543210"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
                <Lock className="h-3.5 w-3.5" />
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {/* confirm password removed per request */}

            {error && (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  isSuccessMessage
                    ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : "border border-red-400/30 bg-red-500/10 text-red-200"
                }`}
              >
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Continue with Google
              </button>

              <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-300 px-4 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-200/45 transition hover:from-cyan-500 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Please wait..." : isLogin ? "Login" : "Create Account"}
            </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
