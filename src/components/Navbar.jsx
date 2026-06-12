import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn, LogOut, Search, UserCircle2, Menu, X,
  Home, UserPlus, ClipboardList, Compass, Newspaper,
  Users, LayoutDashboard, Moon, Sun
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", icon: Home, action: "home" },
  { label: "Onboarding", icon: UserPlus, action: "onboarding" },
  { label: "Assessment", icon: ClipboardList, action: "assessment" },
  { label: "Career Reality", icon: Compass, action: "career-reality" },
  { label: "Insights Feed", icon: Newspaper, action: "insights-feed" },
  { label: "Career Hubs", icon: Users, action: "career-hubs" },
  { label: "Student Dashboard", icon: LayoutDashboard, action: "student-dashboard" },
];

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

  const handleNavAction = (action) => {
    setMobileMenuOpen(false);
    if (action === "onboarding") onStartDiscovery?.();
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
        className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-lg">
              C
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-black leading-tight tracking-tight text-white">Clear Careers</p>
              <p className="text-[10px] font-medium text-slate-400">Build your future with clarity</p>
            </div>
          </div>

          {/* Search - hidden on very small screens */}
          <div className="relative hidden w-full max-w-xs sm:block md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit?.(); }}
              placeholder="Search careers..."
              className="w-full rounded-full border border-slate-700 bg-slate-800/70 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            {hasSearchQuery && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
                {clusterResults.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto py-1">
                    {clusterResults.map((clusterName) => (
                      <li key={clusterName}>
                        <button
                          type="button"
                          onClick={() => onSelectCluster?.(clusterName)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                        >
                          <Search className="h-3 w-3 text-slate-500" />
                          {clusterName}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-400">No matching clusters found.</p>
                )}
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="hidden rounded-full border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 sm:flex"
                title="Toggle theme"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            )}

            {/* Auth */}
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 lg:flex">
                  <UserCircle2 className="h-4 w-4 text-cyan-300" />
                  <span className="max-w-24 truncate text-xs font-semibold text-slate-200">{user.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="border-t border-slate-800 px-4 py-2.5 sm:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit?.(); }}
              placeholder="Search careers..."
              className="w-full rounded-full border border-slate-700 bg-slate-800/70 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none"
            />
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
              className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white">C</div>
                  <p className="font-black text-white">Clear Careers</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {NAV_LINKS.map(({ label, icon: Icon, action }) => (
                  <button
                    key={action}
                    onClick={() => handleNavAction(action)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4 space-y-3">
                {onToggleTheme && (
                  <button
                    onClick={onToggleTheme}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                  >
                    {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </button>
                )}
                {user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3">
                      <UserCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                      <span className="truncate text-sm text-slate-200">{user.email}</span>
                    </div>
                    <button
                      onClick={() => { onLogout?.(); setMobileMenuOpen(false); }}
                      className="flex w-full items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { onOpenAuth?.(); setMobileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                  >
                    <LogIn className="h-4 w-4" />
                    Login / Sign-up
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}