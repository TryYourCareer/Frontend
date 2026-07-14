import { motion, AnimatePresence } from "framer-motion";
import {
  Home, ClipboardList, Compass, Newspaper,
  Users, LayoutDashboard, LogIn, LogOut,
  X, ChevronLeft, ChevronRight
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
  onOpenProfile,
  onOpenAuth,
  onLogout,
  theme = "light",
  onToggleTheme,
  mobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const isDark = theme === "dark";

  const handleNav = (action) => {
    onNavigate?.(action);
    onCloseMobile?.();
  };

  const displayName =
    user?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const sidebarContent = (
    <div className="sidebar-inner flex h-full flex-col">
      {/* Logo / Brand */}
      <div className={`sidebar-brand flex items-center justify-between gap-3 px-4 py-5 border-b ${
        isDark ? "border-slate-800" : "border-[#1e2d4a]"
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-md">
            C
          </span>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              className="min-w-0"
            >
              <p className="cc-display text-sm font-black text-white truncate">Try Your Career</p>
              <p className="text-[11px] font-medium text-slate-400">Career Discovery</p>
            </motion.div>
          )}
        </div>

        {/* Collapse Button (Desktop Only) */}
        {!mobileOpen && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden lg:grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
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
              title={isCollapsed ? label : undefined}
              className={`sidebar-nav-item group flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
                isCollapsed ? "justify-center px-0" : "px-3"
              } ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white shadow-[inset_0_0_0_1px_rgba(99,179,237,0.15)]"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
              }`}
            >
              {/* Active indicator bar */}
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-full transition-all duration-200 ${
                isActive ? "bg-cyan-400 opacity-100" : "opacity-0"
              }`} />
              <Icon
                size={17}
                className={`shrink-0 transition-colors ${
                  isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </motion.button>
          );
        })}
      </motion.nav>

      {/* Bottom Section */}
      <div className={`mt-auto border-t px-3 py-4 space-y-3 ${
        isDark ? "border-slate-800" : "border-[#1e2d4a]"
      }`}>
        {/* User Section */}
        {user ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onOpenProfile?.();
                onCloseMobile?.();
              }}
              title={isCollapsed ? displayName : undefined}
              className={`flex w-full items-center gap-3 rounded-xl bg-white/[0.05] py-2.5 text-left transition hover:bg-white/[0.08] ${
                isCollapsed ? "justify-center px-0" : "px-3"
              }`}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                {displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 cc-pulse-dot" />
                    <p className="text-[10px] text-slate-400">Online</p>
                  </div>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => { onLogout?.(); onCloseMobile?.(); }}
              title={isCollapsed ? "Logout" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 ${
                isCollapsed ? "justify-center px-0" : "px-3"
              }`}
            >
              <LogOut size={17} className="shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { onOpenAuth?.(); onCloseMobile?.(); }}
            title={isCollapsed ? "Login / Sign-up" : undefined}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:shadow-xl hover:shadow-blue-900/30 ${
              isCollapsed ? "px-0 w-10 h-10 mx-auto" : "px-4"
            }`}
          >
            <LogIn size={15} className="shrink-0" />
            {!isCollapsed && <span>Login / Sign-up</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`cc-sidebar hidden lg:flex lg:flex-col lg:h-screen lg:fixed lg:left-0 lg:top-0 lg:z-40 transition-all duration-350 ease-in-out ${
        isCollapsed ? "lg:w-[80px]" : "lg:w-[260px]"
      } ${
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
