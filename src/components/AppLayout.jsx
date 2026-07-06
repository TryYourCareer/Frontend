import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout({
  activePage = "landing",
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  theme = "light",
  onToggleTheme,
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  clusterResults = [],
  onSelectCluster,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <div className={`cc-app-layout min-h-screen ${isDark ? "bg-[#0f172a]" : "bg-[#f1f5f9]"}`}>
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        theme={theme}
        onToggleTheme={onToggleTheme}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area — offset by sidebar width on desktop */}
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <TopBar
          onToggleMobileSidebar={() => setMobileMenuOpen((prev) => !prev)}
          onNavigate={onNavigate}
          onOpenAuth={onOpenAuth}
          user={user}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          clusterResults={clusterResults}
          onSelectCluster={onSelectCluster}
          theme={theme}
        />

        {/* Page Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
