import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { loginRedirect } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

export default function Login({ onBack }) {
  const navigate = useNavigate();
  const { setIsLoginOpen } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setAuthLoading(true);
    try {
      await loginRedirect("google");
    } catch (error) {
      setErrorMessage(error.message || "Google sign-in failed.");
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onBack} />

      {/* Modal Card */}
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all pointer-events-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onBack}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Log in</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            New user?{" "}
            <button
              onClick={() => {
                if (setIsLoginOpen) setIsLoginOpen(false);
                navigate("/register");
              }}
              className="font-medium text-blue-600 hover:underline"
            >
              Register Now
            </button>
          </p>
        </div>

        {/* Auth Buttons Stack */}
        <div className="space-y-4">
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.4 3.65 1.49 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.66-4.51z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.69 2.87c2.16-1.99 3.41-4.91 3.41-8.6z"
              />
              <path
                fill="#FBBC05"
                d="M5.34 14.45c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.49 7.56C.54 9.47 0 11.62 0 13.9c0 2.28.54 4.43 1.49 6.34l3.85-2.99c-.9-2.7-3.4-4.51-6.66-4.51z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.03.69-2.35 1.1-4.27 1.1-3.26 0-5.76-1.81-6.66-4.51L1.49 17.8C3.4 21.71 7.35 23 12 23z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Social Icons Alternative Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={authLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#1877F2] hover:bg-slate-50 transition disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </button>
            <button
              type="button"
              disabled={authLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#0A66C2] hover:bg-slate-50 transition disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </button>
            <button
              type="button"
              disabled={authLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#24292F] hover:bg-slate-50 transition disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
              </svg>
            </button>
            <button
              type="button"
              disabled={authLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#0F9D58] hover:bg-slate-50 transition disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800"
            >
              <Info size={16} className="mt-0.5 shrink-0" />
              <p className="text-xs font-medium">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-xs leading-normal text-slate-400">
          By creating this account, you agree to our{" "}
          <button type="button" className="font-semibold text-slate-600 hover:underline">
            Privacy Policy
          </button>{" "}
          &{" "}
          <button type="button" className="font-semibold text-slate-600 hover:underline">
            Cookie Policy
          </button>
          .
        </p>
      </div>
    </div>
  );
}