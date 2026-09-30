import React from "react";
import { Link } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import LandingFooter from "../components/LandingFooter";
import SEO from "../components/SEO";
import { Compass, Home, Search, ArrowRight } from "lucide-react";

export default function NotFound() {
  const isDark = false;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-[#EFF6FF] text-slate-800 font-sans selection:bg-[#00D4B8] selection:text-white">
      <SEO
        title="404 - Page Not Found | Try Your Career"
        description="The page you are looking for does not exist or has been moved. Discover career roadmaps and guided assessments on Try Your Career."
        noindex={true}
      />

      <LandingNavbar isDark={isDark} />

      <main id="main-content" className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-lg w-full text-center">
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-blue-100/80 border border-blue-200 flex items-center justify-center shadow-md shadow-blue-500/10 text-[#0066FF] animate-bounce-slight">
              <Compass className="w-12 h-12 sm:w-14 sm:h-14 stroke-[1.5]" />
            </div>
            <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#00D4B8] text-slate-900 shadow-sm">
              404
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
            Page Not Found
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mb-8 leading-relaxed max-w-md mx-auto">
            The link you followed doesn't exist, has been removed, or was moved to a new destination.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              to="/explore-careers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Explore Careers
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter isDark={isDark} />
    </div>
  );
}
