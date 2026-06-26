import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Search, Bell, UserCircle2, ChevronLeft
} from "lucide-react";

export default function TopBar({
  onToggleMobileSidebar,
  user,
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  clusterResults = [],
  onSelectCluster,
  theme = "light",
}) {
  const isDark = theme === "dark";
  const [searchFocused, setSearchFocused] = useState(false);
  const hasSearchQuery = Boolean(String(searchQuery || "").trim());

  return (
    <header
      className={`cc-topbar h-20 sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-6 backdrop-blur-xl ${isDark
        ? "border-slate-800/80 bg-slate-950/90"
        : "border-[#e2e8f0] bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        }`}
    >
      {/* Left: Mobile hamburger + sidebar toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className={`rounded-lg p-2 transition lg:hidden ${isDark
            ? "text-slate-400 hover:bg-slate-800 hover:text-white"
            : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#334155]"
            }`}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Collapse toggle for desktop — visible as a subtle chevron */}
        <button
          type="button"
          className={`hidden lg:flex items-center justify-center rounded-lg p-1.5 transition ${isDark
            ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            : "text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#475569]"
            }`}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Center: Search bar */}
      <div className={`relative flex-1 max-w-md transition-all duration-300 ${searchFocused ? "max-w-lg" : ""
        }`}>
        <Search
          className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-[#94a3b8]"
            }`}
        />
        <input
          value={searchQuery || ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit?.(); }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search careers..."
          className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm font-medium outline-none transition ${isDark
            ? "border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/15"
            : "border-[#e2e8f0] bg-[#f8fafc] text-[#1e293b] placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:bg-white focus:ring-2 focus:ring-[#3b82f6]/10"
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
              className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border shadow-xl ${isDark
                ? "border-slate-700 bg-slate-900"
                : "border-[#e2e8f0] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.1)]"
                }`}
            >
              {clusterResults.length > 0 ? (
                <ul className="max-h-52 overflow-y-auto py-1">
                  {clusterResults.map((clusterName) => (
                    <li key={clusterName}>
                      <button
                        type="button"
                        onMouseDown={() => onSelectCluster?.(clusterName)}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold transition ${isDark
                          ? "text-slate-200 hover:bg-slate-800"
                          : "text-[#334155] hover:bg-[#f1f5f9]"
                          }`}
                      >
                        <Search className={`h-3 w-3 shrink-0 ${isDark ? "text-cyan-400" : "text-[#3b82f6]"}`} />
                        {clusterName}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`px-4 py-3 text-sm ${isDark ? "text-slate-400" : "text-[#64748b]"}`}>
                  No matching clusters found.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: User info */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification bell */}
        <button
          type="button"
          className={`relative rounded-lg p-2 transition ${isDark
            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#334155]"
            }`}
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* User avatar + name */}
        {user ? (
          <div className={`hidden sm:flex items-center gap-2.5 rounded-xl px-3 py-1.5 ${isDark ? "bg-slate-800/60" : "bg-[#f8fafc]"
            }`}>
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 hidden md:block">
              <p className={`text-sm font-semibold truncate ${isDark ? "text-slate-200" : "text-[#1e293b]"}`}>
                {user.email?.split("@")[0]}
              </p>
              <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-[#94a3b8]"}`}>Student</p>
            </div>
          </div>
        ) : (
          <div className={`hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 ${isDark ? "bg-slate-800/60" : "bg-[#f8fafc]"
            }`}>
            <UserCircle2 size={18} className={isDark ? "text-slate-500" : "text-[#94a3b8]"} />
            <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-[#64748b]"}`}>Guest</span>
          </div>
        )}
      </div>
    </header>
  );
}
