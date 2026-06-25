import { motion } from "framer-motion";
import { LogIn, LogOut, Search, UserCircle2 } from "lucide-react";

export default function Navbar({
  theme = "light",
  user,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  clusterResults = [],
  onSelectCluster,
  onOpenAuth,
  onLogout,
}) {
  const hasSearchQuery = Boolean(String(searchQuery || "").trim());
  const isDark = theme === "dark";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className={`sticky top-0 z-50 border-b backdrop-blur-xl shadow-sm ${isDark ? "border-slate-800/70 bg-slate-950/90" : "border-slate-200/80 bg-[radial-gradient(circle_at_top,_#eff7ff_0%,_#ffffff_55%)]"}`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 to-cyan-300 text-sm font-black text-slate-900 shadow-sm">
              C
            </div>
            <div>
              <p className="text-lg font-black leading-tight tracking-tight text-slate-900">
                Clear Careers
              </p>
            </div>
          </div>

        <div className="ml-auto flex w-full items-center justify-end gap-3 sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-400"}`} />
            <input
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearchSubmit?.();
                }
              }}
              placeholder="Search careers across clusters"
              className={`w-full rounded-full border px-4 py-2.5 text-sm transition focus:outline-none ${isDark ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:bg-slate-950" : "border-slate-200 bg-slate-100 text-slate-700 placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white"}`}
            />

            {hasSearchQuery && (
              <div className={`absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border shadow-xl ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                {clusterResults.length > 0 ? (
                  <ul className="max-h-64 overflow-y-auto py-1">
                    {clusterResults.map((clusterName) => (
                      <li key={clusterName}>
                        <button
                          type="button"
                          onClick={() => onSelectCluster?.(clusterName)}
                          className={`block w-full px-4 py-2.5 text-left text-sm transition ${isDark ? "text-slate-100 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"}`}
                        >
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

          {user ? (
            <div className="flex items-center gap-2">
              <div className={`hidden items-center gap-2 rounded-full px-3 py-2 sm:flex ${isDark ? "border border-slate-700 bg-slate-900" : "border border-slate-200 bg-slate-50"}`}>
                <UserCircle2 className="h-4 w-4 text-sky-500" />
                <span className={`max-w-28 truncate text-xs font-semibold ${isDark ? "text-slate-100" : "text-slate-700"}`}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${isDark ? "border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20" : "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"}`}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition ${isDark ? "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700" : "border border-slate-200 bg-gradient-to-r from-sky-100 to-cyan-100 text-slate-700 hover:bg-sky-100"}`}
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md">
                <UserCircle2 className="h-5 w-5 text-white" />
              </div>
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login / Sign-up
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}