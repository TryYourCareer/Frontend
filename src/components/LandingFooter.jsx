import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingFooter({ isDark }) {
  const navigate = useNavigate();

  return (
    <footer className={`w-full transition-colors duration-300 ${
      isDark 
        ? "bg-slate-950 border-t border-slate-800 text-slate-400" 
        : "bg-white border-t border-[#D3E3F5] text-slate-650"
    } py-16 px-6`}>
      <div className="max-w-6xl mx-auto w-full">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
              <div className={`relative flex items-center justify-center h-10 w-10 rounded-2xl shadow-2xs ${isDark
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80"
                  : "bg-gradient-to-br from-sky-50 via-white to-blue-50/60 border border-[#D3E3F5]"
                }`}>
                <img
                  src="/assets/logo/logo-mark.png"
                  alt="Try Your Career"
                  className="h-7 w-7 aspect-square object-contain drop-shadow-xs"
                />
                {/* <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" /> */}
              </div>
              <div className="flex flex-col text-left">
                <h3 className={`text-lg font-black font-sans tracking-tight leading-none ${isDark ? "text-slate-100" : "text-[#0b1a36]"}`}>
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
            <p className="text-sm leading-relaxed max-w-sm text-left">
              Your personalized path to lasting success. We combine interactive simulator sandboxes, real market data, and personalized validation to build your career confidence.
            </p>
          </div>

          {/* Column 1: Company */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-[#0b1a36]"}`}>
              Company
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <button onClick={() => navigate("/company/about")} className="hover:text-[#1E88E5] transition text-left cursor-pointer">About Us</button>
              <button onClick={() => navigate("/company/elevate")} className="hover:text-[#1E88E5] transition text-left cursor-pointer">Elevate Program</button>
              <button onClick={() => navigate("/company/stories")} className="hover:text-[#1E88E5] transition text-left cursor-pointer">Success Stories</button>
              <button onClick={() => navigate("/company/careers")} className="hover:text-[#1E88E5] transition text-left cursor-pointer">Careers</button>
            </div>
          </div>

          {/* Column 3: Support */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-[#0b1a36]"}`}>
              Support
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <button onClick={() => navigate("/support/help")} className="hover:text-[#1E88E5] transition text-left cursor-pointer">Help Center</button>
              <button onClick={() => navigate("/support/contact")} className="hover:text-[#1E88E5] transition text-left cursor-pointer">Contact Support</button>
              <button onClick={() => navigate("/support/privacy")} className="hover:text-[#1E88E5] transition text-left cursor-pointer">Privacy Policy</button>
              <button onClick={() => navigate("/support/terms")} className="hover:text-[#1E88E5] transition text-left cursor-pointer">Terms of Service</button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs ${
          isDark ? "border-slate-800" : "border-[#D3E3F5]"
        }`}>
          <span>© 2026 Try Your Career. All rights reserved.</span>
          <div className="flex gap-6">
            <button onClick={() => navigate("/support/privacy")} className="hover:text-[#1E88E5] transition cursor-pointer">Privacy</button>
            <button onClick={() => navigate("/support/terms")} className="hover:text-[#1E88E5] transition cursor-pointer">Terms</button>
            <button onClick={() => navigate("/support/help")} className="hover:text-[#1E88E5] transition cursor-pointer">Sitemap</button>
          </div>
        </div>
      </div>
    </footer>
  );
}