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
            <div className="flex items-center gap-2.5">
              <img
                src="/favicon.ico"
                alt="Company Logo"
                className="h-7 w-7 shrink-0 object-contain"
              />
              <h3 className={`text-xl font-bold font-sans tracking-tight ${isDark ? "text-slate-100" : "text-[#0b1a36]"}`}>
                TryYourCareers
              </h3>
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
          <span>© 2026 TryYourCareers. All rights reserved.</span>
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