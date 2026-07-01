import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { NavigationLoader } from "../components/navigation-loader";
import { AnnouncementBanner } from "../components/announcements/announcement-banner";
import { GlobalFab } from "../components/common/GlobalFab";
import { WhatsAppChannelModal } from "../components/common/WhatsAppChannelModal";

const MOBILE_BREAKPOINT = 768;

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const mobile = e.matches;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handleChange(mql);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex bg-[var(--bg-page)] h-screen overflow-hidden">
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
          tabIndex={-1}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 w-full min-w-0 transition-all duration-300">
        <Header onMenuClick={toggleSidebar} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 bg-[var(--bg-page)]">
          <WhatsAppChannelModal />
          <div className="mx-auto w-full max-w-[1600px]">
            <NavigationLoader delay={150}>
              <Outlet />
            </NavigationLoader>
          </div>
        </main>
      </div>

      <GlobalFab />
      <AnnouncementBanner />
    </div>
  );
};
