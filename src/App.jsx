import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Add from "./pages/Add";
import List from "./components/ExpenseList";
import Charts from "./components/ExpenseChart";
import Auth from "./components/Auth";
import BottomNav from "./components/BottomNav";

const TABS = ["/home", "/add", "/list", "/charts"];

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <Auth />;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = TABS.indexOf(location.pathname);
      const nextIndex = (currentIndex + 1) % TABS.length;
      navigate(TABS[nextIndex]);
    },
    onSwipedRight: () => {
      const currentIndex = TABS.indexOf(location.pathname);
      const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      navigate(TABS[prevIndex]);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div className="relative min-h-screen bg-darkblue text-lightgray flex flex-col overflow-hidden">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Swipeable content */}
      <div {...handlers} className="flex-1 mt-20 pb-16 overflow-y-auto">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/add" element={<Add />} />
          <Route path="/list" element={<List />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>

      {/* Fixed BottomNav */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
