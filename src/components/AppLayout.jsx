import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout({
  activePage = "landing",
  onNavigate,
  user,
  onOpenAuth,
  onOpenProfile,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDark = theme === "dark";

  return (
    <div
      className={`cc-app-layout h-screen overflow-hidden ${
        isDark
          ? "bg-[#0f172a]"
          : "bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7]"
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        user={user}
        onOpenProfile={onOpenProfile}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        theme={theme}
        onToggleTheme={onToggleTheme}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col h-screen overflow-hidden transition-all duration-350 ease-in-out ${
          sidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
        }`}
      >
        <TopBar
          onToggleMobileSidebar={() => setMobileMenuOpen((prev) => !prev)}
          user={user}
          onOpenProfile={onOpenProfile}
          onOpenAuth={onOpenAuth}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          clusterResults={clusterResults}
          onSelectCluster={onSelectCluster}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}