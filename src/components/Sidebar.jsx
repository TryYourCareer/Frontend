import { motion, AnimatePresence } from "framer-motion";
import {
  Home, ClipboardList, Compass, Newspaper,
  Users, LayoutDashboard, LogIn, LogOut,
  Moon, Sun, X
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", icon: Home, action: "landing" },
  { label: "Assessment", icon: ClipboardList, action: "assessment" },
  { label: "Career Reality", icon: Compass, action: "career-reality" },
  { label: "Insights Feed", icon: Newspaper, action: "insights-feed" },
  { label: "Career Hubs", icon: Users, action: "career-hubs" },
  { label: "Dashboard", icon: LayoutDashboard, action: "student-dashboard" },
];

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120, damping: 15 } },
};

const sidebarContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 },
  },
};

export default function Sidebar({
  activePage = "landing",
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  theme = "light",
  onToggleTheme,
  mobileOpen = false,
  onCloseMobile,
}) {
  const isDark = theme === "dark";

  const handleNav = (action) => {
    onNavigate?.(action);
    onCloseMobile?.();
  };

  const sidebarContent = (
    <div className="sidebar-inner flex h-full flex-col">
      {/* Logo / Brand */}
      <div className={`sidebar-brand flex items-center gap-3 px-5 py-5 border-b ${
        isDark ? "border-slate-800" : "border-[#1e2d4a]"
      }`}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-md">
          C
        </span>
        <div className="min-w-0">
          <p className="cc-display text-sm font-black text-white truncate">Try Your Career</p>
          <p className="text-[11px] font-medium text-slate-400">Career Discovery</p>
        </div>
      </div>

      {/* Navigation Links */}
      <motion.nav
        variants={sidebarContainerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
      >
        {NAV_LINKS.map(({ label, icon: Icon, action }) => {
          const isActive = activePage === action;
          return (
            <motion.button
              key={action}
              type="button"
              variants={sidebarItemVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleNav(action)}
              className={`sidebar-nav-item group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white shadow-[inset_0_0_0_1px_rgba(99,179,237,0.15)]"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
              }`}
            >
              {/* Active indicator bar */}
              <span className={`absolute left-0 h-7 w-[3px] rounded-r-full transition-all duration-200 ${
                isActive ? "bg-cyan-400 opacity-100" : "opacity-0"
              }`} />
              <Icon
                size={17}
                className={`shrink-0 transition-colors ${
                  isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span className="truncate">{label}</span>
            </motion.button>
          );
        })}
      </motion.nav>

      {/* Bottom Section */}
      <div className={`mt-auto border-t px-3 py-4 space-y-3 ${
        isDark ? "border-slate-800" : "border-[#1e2d4a]"
      }`}>
        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
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
                {theme === "light" ? (
                  <Moon size={17} className="text-slate-500" />
                ) : (
                  <Sun size={17} className="text-amber-400" />
                )}
                <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
              </motion.div>
            </AnimatePresence>
          </button>
        )}

        {/* User Section */}
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-3 py-2.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user.email?.split("@")[0]}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 cc-pulse-dot" />
                  <p className="text-[10px] text-slate-400">Online</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { onLogout?.(); onCloseMobile?.(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { handleNav("onboarding"); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:shadow-xl hover:shadow-blue-900/30"
          >
            <LogIn size={15} />
            Login / Sign-up
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`cc-sidebar hidden lg:flex lg:flex-col lg:w-[260px] lg:h-screen lg:fixed lg:left-0 lg:top-0 lg:z-40 ${
        isDark ? "bg-slate-950" : "bg-[#111827]"
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay + Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col lg:hidden ${
                isDark ? "bg-slate-950" : "bg-[#111827]"
              }`}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white z-10"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
