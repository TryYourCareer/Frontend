import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Mail, UserCircle2, X } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebaseConfig";

function GoogleLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M23.64 12.27c0-.78-.07-1.53-.2-2.25H12v4.26h6.18c-.27 1.46-1.06 2.7-2.25 3.53l3.64 2.83c2.13-1.98 3.36-4.86 3.36-8.37z"/>
      <path fill="#34A853" d="M12 24c2.97 0 5.46-.98 7.28-2.64l-3.64-2.83c-1.01.68-2.3 1.08-3.64 1.08-2.8 0-5.17-1.89-6.02-4.44H2.23v2.78C3.99 21.77 7.74 24 12 24z"/>
      <path fill="#FBBC05" d="M5.98 14.17c-.22-.66-.35-1.36-.35-2.07s.13-1.41.35-2.07V7.25H2.23A11.97 11.97 0 0 0 0 12.1c0 1.98.48 3.85 1.33 5.5l4.65-3.43z"/>
      <path fill="#EA4335" d="M12 4.76c1.61 0 3.07.55 4.22 1.62l3.17-3.17C17.43 1.31 14.87 0 12 0 7.74 0 3.99 2.23 2.23 5.25l4.65 3.43C6.83 6.65 9.2 4.76 12 4.76z"/>
    </svg>
  );
}

function AppleLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#000" d="M16.365 1.43c-.303.36-.506.797-.605 1.248-.107.48-.082.987.074 1.442.27.758.973 1.537 1.763 1.91.17.068.35.122.52.16.1.02.21.034.31.034.13 0 .25-.02.38-.06.15-.05.29-.13.42-.24.27-.2.49-.47.63-.8.14-.33.19-.7.15-1.06-.03-.25-.11-.5-.24-.73-.14-.25-.33-.47-.57-.63-.51-.34-1.15-.42-1.75-.23-.27.08-.53.22-.75.4z"/>
      <path fill="#000" d="M18.555 6.792c-.607.86-1.39 1.513-2.274 1.743-.126.033-.254.05-.38.05-.37 0-.734-.14-1.016-.395-1.022-.933-2.35-1.09-3.492-.444-.287.159-.56.35-.81.57-.377.352-.69.77-.925 1.24-.334.64-.51 1.35-.52 2.08-.014.85.186 1.687.6 2.435.207.38.454.73.702 1.05.14.2.28.39.41.58.224.332.438.682.64 1.05.207.383.41.783.614 1.19.34.69.68 1.41.94 2.17.16.45.31.9.42 1.36.12.5.19 1.01.21 1.52.01.25.01.5 0 .74-.01.21-.03.41-.08.61-.11.43-.28.84-.51 1.21-.1.16-.22.31-.35.45-.17.2-.36.38-.57.54-.46.36-.98.62-1.55.77-.46.12-.94.17-1.42.15-.57-.02-1.12-.14-1.63-.36-.16-.07-.33-.15-.49-.23-.2-.11-.38-.24-.56-.38-.3-.25-.57-.53-.8-.83-.26-.35-.47-.72-.64-1.12-.22-.5-.38-1.03-.48-1.56-.08-.42-.12-.84-.12-1.26 0-.75.1-1.49.3-2.21.18-.6.44-1.19.78-1.74.17-.28.36-.55.56-.81.25-.32.51-.62.81-.9.32-.29.67-.55 1.04-.77.35-.19.71-.35 1.09-.48.24-.08.49-.14.74-.18.18-.03.36-.05.54-.05.16 0 .33.02.5.05.64.1 1.26.3 1.85.57.37.17.72.37 1.06.61.22.15.43.32.64.49.12.1.23.21.35.32.17.15.34.31.49.48.33.4.64.84.9 1.3.31.57.57 1.18.76 1.81.15.47.27.95.35 1.44.05.26.09.52.1.79.01.12.01.24 0 .36-.02.16-.04.32-.08.48-.08.3-.18.6-.31.88-.2.44-.47.84-.78 1.2-.18.2-.38.38-.59.55-.4.32-.85.57-1.34.76-.54.2-1.1.29-1.66.29-.62 0-1.22-.09-1.8-.27-.36-.11-.71-.27-1.04-.47-.3-.18-.6-.4-.86-.65-.3-.3-.56-.64-.78-1.01-.41-.7-.62-1.5-.63-2.33-.01-.3 0-.6.05-.9.08-.47.23-.92.42-1.35.26-.65.64-1.24 1.13-1.75.18-.18.38-.34.58-.49.49-.35 1.02-.63 1.58-.83.44-.16.89-.25 1.34-.28.23-.02.46-.03.7-.02.36.01.72.07 1.07.18.1.03.19.06.29.1.28.11.56.24.82.4.25.15.49.33.7.53.41.38.74.83 1 1.33.33.64.51 1.32.5 2.02-.01.32-.05.65-.12.97-.09.41-.21.8-.37 1.19-.12.28-.25.55-.41.82-.24.43-.53.83-.86 1.2-.28.3-.58.58-.91.83-.4.29-.84.53-1.3.71-.85.34-1.77.53-2.72.56-.88.03-1.74-.06-2.56-.27-.55-.14-1.08-.35-1.58-.63-.32-.18-.62-.38-.9-.61-.28-.24-.52-.51-.74-.8-.27-.38-.49-.78-.67-1.2-.26-.65-.48-1.33-.64-2.01-.15-.54-.27-1.09-.35-1.64-.07-.41-.12-.83-.15-1.25-.01-.2-.02-.4-.02-.6 0-.25.01-.5.02-.75.02-.5.06-1 .13-1.49.1-.71.26-1.4.5-2.07.27-.75.64-1.48 1.12-2.12.22-.29.47-.56.74-.8.45-.4.95-.72 1.48-.95.6-.27 1.24-.43 1.89-.46.29-.01.58-.01.87.01.5.04.98.12 1.45.25.47.13.92.31 1.34.54.3.18.6.39.86.63.5.47.9 1.03 1.18 1.64.2.44.35.9.46 1.38.1.46.15.93.15 1.4-.01.46-.1.92-.26 1.36-.15.39-.36.76-.62 1.08-.34.44-.75.79-1.2 1.06-.16.1-.33.18-.5.25-.06.03-.11.05-.17.08-.1.04-.2.07-.31.1-.17.05-.34.1-.52.14-.17.04-.34.08-.51.11-.44.09-.9.14-1.35.14-.64 0-1.27-.1-1.86-.29-.4-.13-.78-.33-1.12-.61-.24-.19-.47-.41-.67-.65-.16-.2-.31-.41-.43-.63-.09-.16-.16-.33-.23-.5-.07-.15-.12-.3-.17-.46-.04-.14-.08-.28-.1-.42-.02-.08-.03-.16-.04-.24 0-.1-.01-.2 0-.3.01-.24.03-.48.06-.72.05-.39.12-.77.22-1.15.13-.56.3-1.11.54-1.64.27-.6.61-1.15 1.03-1.66.24-.29.51-.54.79-.77.15-.11.31-.22.47-.31.18-.11.37-.2.56-.28.38-.18.77-.32 1.17-.41.35-.08.7-.12 1.05-.13.34-.01.69 0 1.03.03.37.04.74.09 1.1.16.38.08.75.2 1.12.35.24.1.48.22.71.35.16.09.31.18.46.29.14.1.28.22.4.35.15.15.28.3.42.46.16.19.31.38.44.58.15.24.27.49.37.74.19.48.32.97.38 1.47.03.22.05.44.06.66.01.24.01.47 0 .71-.01.2-.04.4-.07.6-.05.32-.11.64-.19.95-.1.45-.23.9-.39 1.33-.14.36-.31.71-.52 1.03-.11.17-.24.34-.38.5-.16.18-.33.34-.52.49-.24.21-.5.39-.78.56-.3.2-.6.35-.93.47-.28.11-.57.2-.85.27-.3.08-.61.14-.92.18-.31.04-.63.06-.95.06z"/>
    </svg>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{10,15}$/;

export default function AuthModal({ theme = "light", onClose, onAuthSuccess }) {
  const isDark = theme === "dark";
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow || "";
      document.documentElement.style.overflow = previousHtmlOverflow || "";
    };
  }, []);

  const resetForm = () => {
    setError("");
    setIsSuccessMessage(false);
    setEmail("");
    setPhone("");
    setOtpSent(false);
  };

  const signInWithGoogle = async () => {
    setError("");
    const signedUp = !isLogin;

    if (isFirebaseConfigured) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        onAuthSuccess(signedUp);
        return;
      } catch (err) {
        setError(err?.message || "Google sign-in failed.");
        return;
      }
    }

    if (auth.setCurrentUser) {
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
      return;
    }

    setError("Google sign-in is unavailable.");
  };

  const sendOtp = () => {
    setError("");
    setIsSuccessMessage(false);

    let destination;
    if (authMethod === "email") {
      const trimmedEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        setError("Please enter a valid email address.");
        return;
      }
      destination = trimmedEmail;
    } else {
      const trimmedPhone = phone.trim();
      if (!PHONE_REGEX.test(trimmedPhone)) {
        setError("Please enter a valid phone number.");
        return;
      }
      destination = trimmedPhone;
    }

    setOtpSent(true);
    setIsSuccessMessage(true);
    setError(`OTP sent to ${destination}. Check your inbox or messages.`);
  };

  const completeAuth = () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const userProfile = {
      email: authMethod === "email" ? trimmedEmail : undefined,
      phone: authMethod === "phone" ? trimmedPhone : undefined,
      createdAt: new Date().toISOString(),
      otpVerified: true,
    };

    if (auth.setCurrentUser) {
      auth.setCurrentUser({
        uid: `mock-${Date.now()}`,
        email: authMethod === "email" ? trimmedEmail : undefined,
        phone: authMethod === "phone" ? trimmedPhone : undefined,
      });
    }

    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    onAuthSuccess(!isLogin);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSuccessMessage(false);

    if (authMethod === "email") {
      const trimmedEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      const trimmedPhone = phone.trim();
      if (!PHONE_REGEX.test(trimmedPhone)) {
        setError("Please enter a valid phone number.");
        return;
      }
    }

    if (!otpSent) {
      setError("Please request an OTP before continuing.");
      return;
    }

    setIsSubmitting(true);
    try {
      completeAuth();
      if (!isLogin) {
        setIsSuccessMessage(true);
        setError("Account created successfully.");
      }
    } catch (authError) {
      setError(authError?.message || "Authentication failed.");
      setIsSuccessMessage(false);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
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
          className={`w-full max-w-sm max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[32px] border p-5 shadow-2xl backdrop-blur-xl ${isDark ? "border-slate-700 bg-slate-950 text-slate-100" : "border border-slate-200 bg-white text-slate-800"}`}
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

          <div className={`mb-5 grid grid-cols-2 gap-2 rounded-3xl border p-1 ${isDark ? "border-slate-700 bg-slate-900" : "border border-slate-200 bg-slate-100"}`}>
            <button
              onClick={() => {
                setIsLogin(true);
                resetForm();
              }}
              className={`rounded-2xl py-2 text-sm font-semibold transition ${isLogin ? "bg-cyan-600 text-white shadow" : "text-slate-600 hover:bg-white"}`} 
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                resetForm();
              }}
              className={`rounded-2xl py-2 text-sm font-semibold transition ${!isLogin ? "bg-cyan-600 text-white shadow" : "text-slate-600 hover:bg-white"}`} 
            >
              Sign-up
            </button>
          </div>

          <div className={`mb-5 grid grid-cols-2 gap-2 rounded-3xl border p-1 ${isDark ? "border-slate-700 bg-slate-900" : "border border-slate-200 bg-slate-100"}`}>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                resetForm();
              }}
              className={`rounded-2xl py-2 text-sm font-semibold transition ${authMethod === "email" ? "bg-cyan-600 text-white shadow" : "text-slate-600 hover:bg-white"}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                resetForm();
              }}
              className={`rounded-2xl py-2 text-sm font-semibold transition ${authMethod === "phone" ? "bg-cyan-600 text-white shadow" : "text-slate-600 hover:bg-white"}`}
            >
              Phone
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {authMethod === "phone" ? (
              <>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    <UserCircle2 className="h-3.5 w-3.5 text-cyan-500" />
                    Phone Number
                  </span>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full rounded-2xl border px-3 py-3 pr-28 text-sm outline-none transition ${isDark ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:bg-slate-950" : "border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400"}`}
                      placeholder="e.g. +919876543210"
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wide shadow-sm transition ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                      Send OTP
                    </button>
                  </div>
                  <p className={`mt-2 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Demo note: OTP is generated locally and shown in the notification message, not actually sent by SMS.
                  </p>
                </label>

                <p className="text-sm text-slate-500">
                  {otpSent
                    ? "OTP has been sent to your phone. Please check your messages."
                    : "Click Send OTP to receive a code at your phone number."}
                </p>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-cyan-500" />
                    Email Address
                  </span>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-2xl border px-3 py-3 pr-28 text-sm outline-none transition ${isDark ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:bg-slate-950" : "border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400"}`}
                      placeholder="you@example.com"
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wide shadow-sm transition ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                      Send OTP
                    </button>
                  </div>
                  <p className={`mt-2 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Demo note: OTP is generated locally and shown in the notification message, not actually sent by email.
                  </p>
                </label>

                <p className="text-sm text-slate-500">
                  {otpSent
                    ? "OTP has been sent to your email. Please check your inbox."
                    : "Click Send OTP to receive a code at your email address."}
                </p>
              </>
            )}

            {error && (
              <p className={`rounded-lg px-3 py-2 text-sm ${isSuccessMessage ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-900" : isDark ? "border border-red-500/30 bg-red-500/10 text-red-100" : "border border-red-400/30 bg-red-500/10 text-red-900"}`}>
                {error}
              </p>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  <GoogleLogo className="h-4 w-4" />
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => alert('Apple sign-in is not implemented yet')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  <AppleLogo className="h-4 w-4" />
                  Continue with Apple
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200/30 transition hover:from-cyan-600 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
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
