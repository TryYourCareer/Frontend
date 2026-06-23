import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn, LogOut, Search, UserCircle2, Menu, X,
  Home, ClipboardList, Compass, Newspaper,
  Users, LayoutDashboard, Moon, Sun
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", icon: Home, action: "home" },
  { label: "Assessment", icon: ClipboardList, action: "assessment" },
  { label: "Career Reality", icon: Compass, action: "career-reality" },
  { label: "Insights Feed", icon: Newspaper, action: "insights-feed" },
  { label: "Career Hubs", icon: Users, action: "career-hubs" },
  { label: "Dashboard", icon: LayoutDashboard, action: "student-dashboard" },
];

const drawerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const drawerItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120, damping: 15 } },
};


export default function Navbar({
  user,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  clusterResults = [],
  onSelectCluster,
  onOpenAuth,
  onLogout,
  onStartDiscovery,
  onOpenAssessment,
  onOpenCareerReality,
  onOpenInsightsFeed,
  onOpenCareerHubs,
  onOpenStudentDashboard,
  theme = "light",
  onToggleTheme,
}) {
  const hasSearchQuery = Boolean(String(searchQuery || "").trim());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const isDark = theme === "dark";

  const handleNavAction = (action) => {
    setMobileMenuOpen(false);
    if (action === "home") window.scrollTo?.({ top: 0, behavior: "smooth" });
    else if (action === "onboarding") onStartDiscovery?.();
    else if (action === "assessment") onOpenAssessment?.();
    else if (action === "career-reality") onOpenCareerReality?.();
    else if (action === "insights-feed") onOpenInsightsFeed?.();
    else if (action === "career-hubs") onOpenCareerHubs?.();
    else if (action === "student-dashboard") onOpenStudentDashboard?.();
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${
          isDark
            ? "border-slate-800/80 bg-slate-950/90 shadow-[0_12px_36px_rgba(2,6,23,0.28)]"
            : "border-[#cfd9eb] bg-[#f8fbff]/95 shadow-[0_10px_30px_rgba(39,73,132,0.08)]"
        }`}
      >
        <div className="flex w-full items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8 sm:gap-3">
          <button
            type="button"
            onClick={() => handleNavAction("home")}
            className="flex min-w-0 items-center gap-3 rounded-xl px-1 py-1 text-left"
            aria-label="Go to top"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-md">
              C
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className={`cc-display block truncate text-sm font-black leading-tight ${isDark ? "text-slate-100" : "text-[#10244b]"}`}>
                Try Your Career
              </span>
              <span className={`block truncate text-xs font-medium ${isDark ? "text-slate-400" : "text-[#64779b]"}`}>
                Career Discovery 
              </span>
            </span>
          </button>

          <div className={`relative flex-1 transition-all duration-300 ease-out sm:hidden ${
            searchFocused ? "max-w-xl" : "max-w-md"
          }`}>
            <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-[#7890b5]"}`} />
            <input
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit?.(); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search..."
              className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm font-medium outline-none transition ${
                isDark
                  ? "border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/70 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-400/15"
                  : "border-[#cad8ee] bg-white text-[#1c3158] placeholder:text-[#8498b8] focus:border-[#5e91e5] focus:ring-2 focus:ring-[#5e91e5]/15"
              }`}
            />
          </div>

          <div className={`relative hidden flex-1 transition-all duration-300 ease-out sm:block ${
            searchFocused ? "max-w-xl" : "max-w-md"
          }`}>
            <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-[#7890b5]"}`} />
            <input
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit?.(); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search careers..."
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition ${
                isDark
                  ? "border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/70 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-400/15"
                  : "border-[#cad8ee] bg-white text-[#1c3158] placeholder:text-[#8498b8] focus:border-[#5e91e5] focus:ring-2 focus:ring-[#5e91e5]/15"
              }`}
            />
            <AnimatePresence>
              {hasSearchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border shadow-xl ${
                    isDark
                      ? "border-slate-700 bg-slate-900"
                      : "border-[#d4e0f2] bg-white shadow-[0_18px_44px_rgba(40,75,136,0.16)]"
                  }`}
                >
                  {clusterResults.length > 0 ? (
                    <motion.ul 
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.03 } }
                      }}
                      className="max-h-60 overflow-y-auto py-1"
                    >
                      {clusterResults.map((clusterName) => (
                        <motion.li 
                          key={clusterName}
                          variants={{
                            hidden: { opacity: 0, x: -8 },
                            show: { opacity: 1, x: 0 }
                          }}
                        >
                          <button
                            type="button"
                            onMouseDown={() => onSelectCluster?.(clusterName)}
                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold transition ${
                              isDark
                                ? "text-slate-200 hover:bg-slate-800"
                                : "text-[#274165] hover:bg-[#f0f5ff]"
                            }`}
                          >
                            <Search className={`h-3 w-3 shrink-0 ${isDark ? "text-cyan-400" : "text-[#3d72d6]"}`} />
                            {clusterName}
                          </button>
                        </motion.li>
                      ))}
                    </motion.ul>
                  ) : (
                    <p className={`px-4 py-3 text-sm ${isDark ? "text-slate-400" : "text-[#6b7d9c]"}`}>
                      No matching clusters found.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <motion.button
                type="button"
                onClick={onToggleTheme}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.94 }}
                className={`hidden rounded-xl border p-2 transition sm:flex ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                    : "border-[#c8d6eb] bg-white text-[#4d658f] hover:bg-[#edf4ff]"
                }`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ scale: 0.6, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.6, rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            )}

            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`hidden items-center gap-2 rounded-xl border px-3 py-2 lg:flex ${
                    isDark
                      ? "border-slate-700 bg-slate-900/80"
                      : "border-[#ccd9ec] bg-white"
                  }`}
                >
                  <UserCircle2 className={`h-4 w-4 ${isDark ? "text-cyan-300" : "text-[#2f66de]"}`} />
                  <span className={`max-w-32 truncate text-xs font-semibold ${isDark ? "text-slate-200" : "text-[#304262]"}`}>
                    {user.email}
                  </span>
                </motion.div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenAuth}
                className="hidden items-center gap-1.5 rounded-xl bg-[#2f66de] px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(47,102,222,0.22)] transition hover:bg-[#285bc7] sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </motion.button>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileMenuOpen(true)}
              className={`rounded-xl border p-2 transition lg:hidden ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                  : "border-[#c8d6eb] bg-white text-[#405b87] hover:bg-[#edf4ff]"
              }`}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-slate-950/45 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 150, damping: 22 }}
              className={`fixed inset-y-0 left-0 z-[70] flex w-[min(22rem,88vw)] flex-col shadow-2xl lg:hidden ${
                isDark ? "bg-slate-950" : "bg-[#f8fbff]"
              }`}
            >
              <div className={`flex shrink-0 items-center justify-between border-b px-5 py-4 ${isDark ? "border-slate-800" : "border-[#dce5f2]"}`}>
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-md">C</div>
                  <div>
                    <p className={`cc-display text-sm font-black ${isDark ? "text-slate-100" : "text-[#10244b]"}`}>Try YourCareers</p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-[#6b7d9c]"}`}>Menu</p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl p-2 transition ${
                    isDark ? "text-slate-400 hover:bg-slate-800" : "text-[#536b93] hover:bg-[#edf4ff]"
                  }`}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <motion.nav 
                variants={drawerContainerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 space-y-1 overflow-y-auto p-4"
              >
                {NAV_LINKS.map(({ label, icon: Icon, action }) => (
                  <motion.button
                    type="button"
                    key={action}
                    variants={drawerItemVariants}
                    whileHover={{ scale: 1.02, x: 6 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavAction(action)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                      isDark
                        ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "text-[#40577d] hover:bg-[#edf4ff] hover:text-[#183c83]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isDark ? "text-cyan-400" : "text-[#2f66de]"}`} />
                    {label}
                  </motion.button>
                ))}
              </motion.nav>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`shrink-0 space-y-3 border-t p-4 ${
                  isDark ? "border-slate-800 bg-slate-950" : "border-[#dce5f2] bg-[#eef4fc]"
                }`}
              >
                {onToggleTheme && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={onToggleTheme}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                      isDark ? "text-slate-300 hover:bg-slate-800" : "text-[#40577d] hover:bg-white"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={theme}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, rotate: -45 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 45 }}
                        transition={{ duration: 0.15 }}
                      >
                        {theme === "light" ? <Moon className="h-4 w-4 text-[#2f66de]" /> : <Sun className="h-4 w-4 text-cyan-400" />}
                        <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                )}
                {user ? (
                  <>
                    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      isDark ? "border-slate-700 bg-slate-900" : "border-[#cfdbef] bg-white"
                    }`}>
                      <UserCircle2 className={`h-5 w-5 shrink-0 ${isDark ? "text-cyan-400" : "text-[#2f66de]"}`} />
                      <span className={`truncate text-sm font-semibold ${isDark ? "text-slate-200" : "text-[#304262]"}`}>{user.email}</span>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { onLogout?.(); setMobileMenuOpen(false); }}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onOpenAuth?.(); setMobileMenuOpen(false); }}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#2f66de] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(47,102,222,0.24)] transition hover:bg-[#285bc7]"
                  >
                    <LogIn className="h-4 w-4" />
                    Login / Sign-up
                  </motion.button>
                )}
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
