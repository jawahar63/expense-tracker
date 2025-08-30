import { useSwipeable } from "react-swipeable";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Add from "../pages/Add";
import List from "../components/ExpenseList";
import Charts from "../components/ExpenseChart";
import Auth from "../components/Auth";
import BottomNav from "../components/BottomNav";
import Profile from "../pages/Profile";

const TABS = ["/home", "/add", "/list", "/charts"];

// ✅ helper hook for screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // 👉 Swipe only for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isMobile) return;
      const currentIndex = TABS.indexOf(location.pathname);
      const nextIndex = (currentIndex + 1) % TABS.length;
      navigate(TABS[nextIndex]);
    },
    onSwipedRight: () => {
      if (!isMobile) return;
      const currentIndex = TABS.indexOf(location.pathname);
      const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      navigate(TABS[prevIndex]);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (!user) return <Auth />;

  return (
    <div className="relative min-h-screen bg-darkblue text-lightgray flex flex-col overflow-hidden">
      {/* Navbar always fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div {...(isMobile ? handlers : {})} className="flex-1 mt-20 pb-16 md:mt-15 md:pb-0 overflow-y-auto h-full">
        {isMobile ? (
          // ✅ MOBILE ROUTES
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/add" element={<Add />} />
            <Route path="/list" element={<List />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Home />} />
          </Routes>
        ) : (
          // ✅ WEB/TABLET ROUTES (combined layout)
          <Routes className="h-full">
            <Route
              path="/home"
              element={
                <div className="grid grid-cols-2 gap-4 p-4">
                  <Home />
                  <Add />
                </div>
              }
            />
            <Route
                path="/list"
                element={
                    <div className="grid grid-cols-3 gap-4 p-4 h-full">
                    <div className="col-span-1">
                        <List />
                    </div>
                    <div className="col-span-2 h-full">
                        <Charts />
                    </div>
                    </div>
                }
                />

            <Route path="/profile" element={<Profile />} />
            {/* block unwanted routes on web */}
            <Route path="/add" element={<Navigate to="/home" replace />} />
            <Route path="/charts" element={<Navigate to="/list" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        )}
      </div>

      {/* BottomNav only for mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      )}
    </div>
  );
}

export default AppContent;
