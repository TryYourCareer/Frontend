import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingFooter({ isDark }) {
  const navigate = useNavigate();

  return (
    <footer
      className={`w-full transition-colors duration-300 ${
        isDark
          ? "bg-slate-950 border-t border-slate-800 text-slate-400"
          : "bg-white border-t border-[#D3E3F5] text-slate-600"
      } py-14 px-6 md:px-8`}
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Main Content Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Brand Info (Left Column) */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col items-start gap-4 text-left">
            <div
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div
                className={`relative flex items-center justify-center h-10 w-10 rounded-2xl shadow-2xs transition-transform group-hover:scale-105 ${
                  isDark
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80"
                    : "bg-gradient-to-br from-sky-50 via-white to-blue-50/60 border border-[#D3E3F5]"
                }`}
              >
                <img
                  src="/assets/logo/logo-mark.png"
                  alt="Try Your Career"
                  className="h-7 w-7 aspect-square object-contain drop-shadow-xs"
                />
              </div>
              <div className="flex flex-col text-left">
                <h3
                  className={`text-lg font-black font-sans tracking-tight leading-none ${
                    isDark ? "text-slate-100" : "text-[#0b1a36]"
                  }`}
                >
                  Try Your{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-[#1E88E5] to-indigo-600 bg-clip-text text-transparent">
                    Career
                  </span>
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                  Career Intelligence
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-md text-slate-500 dark:text-slate-400">
              Your personalized path to lasting success. We combine interactive simulator sandboxes, real market data, and validated career assessments to build your career confidence.
            </p>
          </div>

          {/* Navigation Links Columns (Right) */}
          <div className="md:col-span-6 lg:col-span-6 grid grid-cols-2 sm:grid-cols-2 gap-8 md:justify-items-end">
            {/* Column 1: Explore */}
            <div className="flex flex-col gap-3 text-left w-full md:max-w-[160px]">
              <h4
                className={`text-xs font-bold uppercase tracking-widest ${
                  isDark ? "text-slate-200" : "text-[#0b1a36]"
                }`}
              >
                Explore
              </h4>
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                <button
                  onClick={() => navigate("/assessment")}
                  className="hover:text-[#1E88E5] transition text-left cursor-pointer"
                >
                  Discovery Test
                </button>
                <button
                  onClick={() => navigate("/explore-careers")}
                  className="hover:text-[#1E88E5] transition text-left cursor-pointer"
                >
                  Explore Careers
                </button>
                <button
                  onClick={() => navigate("/career-hubs")}
                  className="hover:text-[#1E88E5] transition text-left cursor-pointer"
                >
                  Career Hubs
                </button>
              </div>
            </div>

            {/* Column 2: Support */}
            <div className="flex flex-col gap-3 text-left w-full md:max-w-[160px]">
              <h4
                className={`text-xs font-bold uppercase tracking-widest ${
                  isDark ? "text-slate-200" : "text-[#0b1a36]"
                }`}
              >
                Support
              </h4>
              <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                <button
                  onClick={() => navigate("/support/contact")}
                  className="hover:text-[#1E88E5] transition text-left cursor-pointer"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => navigate("/support/privacy")}
                  className="hover:text-[#1E88E5] transition text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate("/support/terms")}
                  className="hover:text-[#1E88E5] transition text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal bar */}
        <div
          className={`border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs ${
            isDark
              ? "border-slate-800/80 text-slate-500"
              : "border-[#D3E3F5] text-slate-500"
          }`}
        >
          <p>© 2026 Try Your Career. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/support/privacy")}
              className="hover:text-[#1E88E5] transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/support/terms")}
              className="hover:text-[#1E88E5] transition cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate("/support/contact")}
              className="hover:text-[#1E88E5] transition cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}