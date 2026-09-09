import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Search, Bell
} from "lucide-react";


export default function TopBar({
  onToggleMobileSidebar,
  user,
  onOpenProfile,
  onOpenAuth,
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  clusterResults = [],
  onSelectCluster,
  theme = "light",
  onToggleTheme,
}) {
  const isDark = theme === "dark";
  const [searchFocused, setSearchFocused] = useState(false);
  const hasSearchQuery = Boolean(String(searchQuery || "").trim());

  const displayName =
    user?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const initial = displayName.trim().charAt(0).toUpperCase() || "U";
  const avatarUrl = user?.avatarUrl || user?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <header
      className={`cc-topbar h-20 sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-6 backdrop-blur-xl ${isDark
        ? "border-slate-800/80 bg-slate-950/90"
        : "border-[#D3E3F5] bg-white/95"
        }`}
    >
      {/* Left: Mobile hamburger + sidebar toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className={`rounded-xl p-2 transition lg:hidden cursor-pointer ${isDark
            ? "text-slate-400 hover:bg-slate-800 hover:text-white"
            : "text-slate-650 hover:bg-[#F0F6FC] hover:text-[#0b1a36]"
            }`}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Collapse toggle for desktop — visible as a subtle chevron */}
        {/* <button
          type="button"
          className={`hidden lg:flex items-center justify-center rounded-xl p-1.5 transition ${isDark
            ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            : "text-slate-400 hover:bg-slate-900/5 hover:text-slate-800"
            }`}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={18} />
        </button> */}
      </div>

      {/* Center: Search bar */}
      <div className={`relative flex-1 max-w-md transition-all duration-300 ${searchFocused ? "max-w-lg" : ""
        }`}>
        <Search
          className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-[#1E88E5]"
            }`}
        />
        <input
          value={searchQuery || ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit?.(); }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search careers..."
          className={`w-full rounded-full border py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition shadow-2xs ${isDark
            ? "border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/15"
            : "border-[#D3E3F5] bg-[#F0F6FC] text-[#0b1a36] placeholder:text-slate-400 focus:border-[#1E88E5] focus:bg-white focus:ring-2 focus:ring-sky-100"
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
              className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border shadow-xl ${isDark
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
                        onMouseDown={() => onSelectCluster?.(clusterName)}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs sm:text-sm font-semibold transition cursor-pointer ${isDark
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

      {/* Right: User info */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Notification bell */}
        <button
          type="button"
          className={`relative rounded-xl p-2 transition cursor-pointer ${isDark
            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            : "text-slate-600 hover:bg-[#F0F6FC] hover:text-[#0b1a36]"
            }`}
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {/* User avatar + name or Login Option */}
        {user ? (
          <button
            type="button"
            onClick={onOpenProfile}
            className={`hidden sm:flex items-center gap-2.5 rounded-full p-0.5 transition hover:scale-105 cursor-pointer`}
            aria-label="Open profile"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User Profile"
                className="h-8 w-8 rounded-full object-cover border border-[#D3E3F5]"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#1E88E5] flex items-center justify-center text-xs font-bold text-white border border-[#D3E3F5] shadow-2xs shrink-0">
                {initial}
              </div>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0b1a36] hover:bg-[#122b59] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
          >
            Login / Sign-up
          </button>
        )}
      </div>
    </header>
  );
}