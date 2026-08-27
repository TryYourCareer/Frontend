import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { loginRedirect } from "../services/auth";

export default function Login({ onBack }) {
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

  const handleLinkedInLogin = async () => {
    setErrorMessage("");
    setAuthLoading(true);
    try {
      await loginRedirect("linkedin");
    } catch (error) {
      setErrorMessage(error.message || "LinkedIn sign-in failed.");
      setAuthLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setErrorMessage("");
    setAuthLoading(true);
    try {
      await loginRedirect("azure");
    } catch (error) {
      setErrorMessage(error.message || "Microsoft sign-in failed.");
      setAuthLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setErrorMessage("");
    setAuthLoading(true);
    try {
      await loginRedirect("apple");
    } catch (error) {
      setErrorMessage(error.message || "Apple sign-in failed.");
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
            Start your Journey
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
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

        {/* Microsoft OAuth Button */}
        <button
          type="button"
          onClick={handleMicrosoftLogin}
          disabled={authLoading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="3" y="3" width="8" height="8" fill="#F35325" />
            <rect x="13" y="3" width="8" height="8" fill="#81BC06" />
            <rect x="3" y="13" width="8" height="8" fill="#05A6F0" />
            <rect x="13" y="13" width="8" height="8" fill="#FFBA08" />
          </svg>
          Continue with Microsoft
        </button>

        {/* Apple / iOS OAuth Button */}
        <button
          type="button"
          onClick={handleAppleLogin}
          disabled={authLoading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M318.7 268.7c-.2-54.9 44.6-81.4 46.6-82.7-25.5-37.3-65.1-42.4-79-43-33.6-3.4-65.5 19.9-82.6 19.9-17 0-43.7-19.4-71.9-18.9-36.9.6-71.1 21.5-90.1 54.6C5 285.5 33.7 387.3 70.7 442.7c18 27.2 39.4 57.7 67.5 56.6 26.8-1.1 36.9-17.5 69.2-17.5 32.1 0 41.5 17.5 69.6 16.9 28.5-.6 46.6-27.7 64.3-55 20.3-30.9 28.7-60.9 29-62.4-.7-.3-55.6-21.4-55.7-84.7zM259.1 74.4c15.6-18.9 26-45.1 23.1-71.4-22.3 1.1-49.2 14.8-65.2 33.7-14.3 17.3-26.7 44.9-23.4 71.4 24.7 1.9 50-12.6 65.5-33.7z" />
          </svg>
          Continue with iOS
        </button>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-slate-200" />
          <span className="relative bg-white px-3 text-sm text-slate-400">or</span>
        </div>

        {/* Secondary Social Options */}
        <div className="flex items-center justify-center gap-4">
          {/* LinkedIn */}
          <button
            type="button"
            onClick={handleLinkedInLogin}
            disabled={authLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#0A66C2] hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.95] transition duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
          </button>
          {/* GitHub */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#24292F] hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.95] transition duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
            </svg>
          </button>
          {/* Globe/Web */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#0F9D58] hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.95] transition duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
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
