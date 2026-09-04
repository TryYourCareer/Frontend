import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import careersData from "../data/clearcareers_data.json";

export default function LandingNavbar({ isDark }) {
  const navigate = useNavigate();
  const { user: authUser, setIsLoginOpen } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const careers = useMemo(
    () => (careersData || []).map((item) => ({ title: item["Career Name"] || "", cluster: item.Cluster || "" })).filter((career) => career.title && career.cluster),
    []
  );

  const clusterResults = useMemo(() => {
    const query = String(searchQuery || "").trim().toLowerCase();
    if (!query) return [];
    return careers
      .filter((career) => career.title.toLowerCase().includes(query))
      .map((career) => career.title)
      .slice(0, 8);
  }, [careers, searchQuery]);

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (q) {
      navigate(`/career-search?q=${encodeURIComponent(q)}`);
      setSearchQuery("");
    }
  };

  const handleSelectCluster = (careerName) => {
    navigate(`/career-search?q=${encodeURIComponent(careerName)}`);
    setSearchQuery("");
  };

  const hasSearchQuery = Boolean(String(searchQuery || "").trim());

  return (
    <nav className={`sticky top-0 z-50 w-full transition-colors duration-300 border-b ${
      isDark 
        ? "bg-slate-900/90 border-slate-800 text-slate-100" 
        : "bg-white/95 border-[#D3E3F5] text-[#0b1a36]"
    } backdrop-blur-md`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3.5 md:px-6 md:py-5 max-w-6xl mx-auto w-full gap-3 md:gap-4">
        
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between w-full md:w-auto shrink-0">
          {/* Logo */}
          <div 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-bold font-sans tracking-tight cursor-pointer hover:opacity-80 transition"
          >
            <img
              src="/favicon.ico"
              alt="Company Logo"
              className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
            />
            <span className={isDark ? "text-slate-100" : "text-[#0b1a36]"}>
              TryYourCareers
            </span>
          </div>

          {/* Action Button (Mobile only) */}
          <div className="md:hidden">
            <button
              onClick={() => authUser ? navigate("/dashboard") : setIsLoginOpen(true)}
              className="rounded-full bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold px-4 py-2 text-xs shadow-2xs transition cursor-pointer"
            >
              {authUser ? "Dashboard" : "Find career"}
            </button>
          </div>
        </div>

        {/* Search Bar centered */}
        <div className={`relative w-full md:flex-1 md:max-w-md transition-all duration-300 ${searchFocused ? "md:max-w-lg" : ""}`}>
          <Search
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
              isDark ? "text-slate-500" : "text-[#1E88E5]"
            }`}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit();
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search careers..."
            className={`w-full rounded-full border py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium outline-none transition shadow-2xs ${
              isDark
                ? "border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/15"
                : "border-[#D3E3F5] bg-white text-[#0b1a36] placeholder:text-slate-400 focus:border-[#1E88E5] focus:bg-white focus:ring-2 focus:ring-sky-100"
            }`}
          />

          {/* Search Dropdown */}
          <AnimatePresence>
            {hasSearchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border shadow-xl ${
                  isDark
                    ? "border-slate-700 bg-slate-900"
                    : "border-[#D3E3F5] bg-white shadow-[0_12px_32px_rgba(11,26,54,0.08)]"
                }`}
              >
                {clusterResults.length > 0 ? (
                  <ul className="max-h-52 overflow-y-auto py-1.5">
                    {clusterResults.map((clusterName) => (
                      <li key={clusterName}>
                        <button
                          type="button"
                          onMouseDown={() => handleSelectCluster(clusterName)}
                          className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs sm:text-sm font-semibold transition cursor-pointer ${
                            isDark
                              ? "text-slate-200 hover:bg-slate-800"
                              : "text-slate-700 hover:bg-[#F0F6FC]"
                          }`}
                        >
                          <Search className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-cyan-400" : "text-[#1E88E5]"}`} />
                          {clusterName}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`px-4 py-3 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    No matching clusters found.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button (Desktop only) */}
        <div className="hidden md:block shrink-0">
          {authUser ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-full bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold px-5 py-2.5 text-xs shadow-xs transition cursor-pointer"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="rounded-full bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold px-5 py-2.5 text-xs shadow-xs transition cursor-pointer"
            >
              Find a career
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}