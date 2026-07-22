import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Compass, Newspaper,
  Users, LayoutDashboard, LogIn, LogOut,
  X, ChevronLeft, ChevronRight
} from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard", icon: LayoutDashboard, action: "student-dashboard" },
  { label: "Discovery Test", icon: ClipboardList, action: "assessment" },
  { label: "Career Reality", icon: Compass, action: "career-reality" },
  { label: "Insights Feed", icon: Newspaper, action: "insights-feed" },
  { label: "Career Hubs", icon: Users, action: "career-hubs" },
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
      <div className={`sidebar-brand flex h-20 items-center justify-between gap-3 px-4 border-b ${
        isDark ? "border-slate-800" : "border-slate-400"
      }`}>
        <div className="flex items-center overflow-hidden">
          {!isCollapsed ? (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              className="min-w-0"
            >
              <p className="text-xl font-bold font-sans tracking-tight text-slate-900">TryYourCareers</p>
            </motion.div>
          ) : (
            <span className="text-xl font-bold font-sans tracking-tight text-slate-900 px-2">
              T
            </span>
          )}
        </div>

        {/* Collapse Button (Desktop Only) */}
        {!mobileOpen && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden lg:grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-900/5 transition-colors shrink-0`}
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
                  ? "bg-[#FAF2DB] text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
              }`}
            >
              {/* Active indicator bar */}
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-full transition-all duration-200 ${
                isActive ? "bg-slate-900 opacity-100" : "opacity-0"
              }`} />
              <Icon
                size={17}
                className={`shrink-0 transition-colors ${
                  isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-800"
                }`}
              />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </motion.button>
          );
        })}
      </motion.nav>

      {/* Bottom Section */}
      <div className={`mt-auto border-t px-3 py-4 ${isDark ? "border-slate-800" : "border-slate-400"}`}>
        {/* User Section */}
        {user ? (
          <div className={`flex items-center gap-3 rounded-xl border border-slate-300 bg-[#FAF2DB]/60 py-2.5 shadow-sm ${isCollapsed ? "justify-center px-2" : "px-3"}`}>
            {/* Avatar — clickable for profile */}
            <button
              type="button"
              onClick={() => { onOpenProfile?.(); onCloseMobile?.(); }}
              title={isCollapsed ? displayName : undefined}
              className="shrink-0 focus:outline-none"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
                alt="User Profile"
                className="h-8 w-8 rounded-full object-cover border border-slate-300"
              />
            </button>

            {/* Name + status */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => { onOpenProfile?.(); onCloseMobile?.(); }}
                className="min-w-0 flex-1 text-left focus:outline-none"
              >
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 cc-pulse-dot" />
                  <p className="text-[10px] text-slate-500">Online</p>
                </div>
              </button>
            )}

            {/* Logout icon button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => { onLogout?.(); onCloseMobile?.(); }}
                title="Logout"
                className="shrink-0 grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut size={15} />
              </button>
            )}

            {/* Collapsed: show logout below avatar */}
            {isCollapsed && (
              <button
                type="button"
                onClick={() => { onLogout?.(); onCloseMobile?.(); }}
                title="Logout"
                className="shrink-0 grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { onOpenAuth?.(); onCloseMobile?.(); }}
            title={isCollapsed ? "Login / Sign-up" : undefined}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1a36] hover:bg-[#122b59] py-2.5 text-sm font-bold text-white shadow-sm transition ${isCollapsed ? "px-0 w-10 h-10 mx-auto" : "px-4"}`}
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
      <aside className={`cc-sidebar hidden lg:flex lg:flex-col lg:h-screen lg:fixed lg:left-0 lg:top-0 lg:z-40 border-r border-slate-400 transition-all duration-350 ease-in-out ${
        isCollapsed ? "lg:w-[80px]" : "lg:w-[260px]"
      } ${
        isDark ? "bg-slate-950" : "bg-[#FAF6EC]"
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
              className={`fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col lg:hidden border-r border-slate-400 ${
                isDark ? "bg-slate-950" : "bg-[#FAF6EC]"
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
