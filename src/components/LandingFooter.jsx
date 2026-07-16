import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingFooter({ isDark }) {
  const navigate = useNavigate();

  return (
    <footer className={`w-full transition-colors duration-300 ${
      isDark 
        ? "bg-slate-950 border-t border-slate-800 text-slate-400" 
        : "bg-[#1E1B18] border-t border-stone-800 text-stone-400"
    } py-16 px-6`}>
      <div className="max-w-6xl mx-auto w-full">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <h3 className={`text-xl font-bold font-sans tracking-tight ${isDark ? "text-slate-100" : "text-stone-100"}`}>
              TryYourCareers
            </h3>
            <p className="text-sm leading-relaxed max-w-sm">
              Your personalized path to lasting success. We combine interactive simulator sandboxes, real market data, and personalized validation to build your career confidence.
            </p>
          </div>

          {/* Column 1: Simulator */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-stone-200"}`}>
              Simulator
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Discover archetypes</button>
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Explore salary bands</button>
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Experience tasks</button>
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Align pathways</button>
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-stone-200"}`}>
              Company
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">About Us</button>
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Elevate Program</button>
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Success Stories</button>
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Careers</button>
            </div>
          </div>

          {/* Column 3: Support */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-300" : "text-stone-200"}`}>
              Support
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Help Center</button>
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Contact Support</button>
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Privacy Policy</button>
              <button onClick={() => navigate("/")} className="hover:text-stone-200 transition text-left">Terms of Service</button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs ${
          isDark ? "border-slate-800" : "border-stone-800"
        }`}>
          <span>© 2026 TryYourCareers. All rights reserved.</span>
          <div className="flex gap-6">
            <button onClick={() => navigate("/")} className="hover:text-stone-200 transition">Privacy</button>
            <button onClick={() => navigate("/")} className="hover:text-stone-200 transition">Terms</button>
            <button onClick={() => navigate("/")} className="hover:text-stone-200 transition">Sitemap</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
