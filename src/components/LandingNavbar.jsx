import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LandingNavbar({ isDark, onExploreCareers, onStartDiscovery }) {
  const navigate = useNavigate();
  const { user: authUser, setIsLoginOpen } = useAuth();

  return (
    <nav className={`sticky top-0 z-50 w-full transition-colors duration-300 border-b ${
      isDark 
        ? "bg-slate-900/90 border-slate-800 text-slate-100" 
        : "bg-[#FAF6EC]/90 border-slate-900/5 text-[#0b1a36]"
    } backdrop-blur-md`}>
      <div className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        {/* Logo */}
        <div 
          onClick={() => navigate("/")} 
          className="text-xl font-bold font-sans tracking-tight cursor-pointer hover:opacity-80 transition"
        >
          TryYourCareers
        </div>

        {/* Menu Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button onClick={() => navigate("/")} className="hover:opacity-80 transition">Home</button>
          <button onClick={onExploreCareers} className="hover:opacity-80 transition">Elevate Program</button>
          <button onClick={onStartDiscovery} className="hover:opacity-80 transition">About Us</button>
          <button onClick={onStartDiscovery} className="hover:opacity-80 transition">Success Stories</button>
        </div>

        {/* Action Button */}
        <div>
          {authUser ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-md bg-[#F3E3B6] hover:bg-[#ebd08b] text-slate-900 font-bold px-5 py-2.5 text-sm shadow-sm transition"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="rounded-md bg-[#F3E3B6] hover:bg-[#ebd08b] text-slate-900 font-bold px-5 py-2.5 text-sm shadow-sm transition"
            >
              Find a career
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
