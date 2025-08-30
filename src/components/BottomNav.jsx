import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  PlusIcon,
  ListBulletIcon,
  ChartPieIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = [
    { path: "/home", label: "Home", icon: <HomeIcon className="w-6 h-6" /> },
    { path: "/add", label: "Add", icon: <PlusIcon className="w-6 h-6" /> },
    { path: "/list", label: "List", icon: <ListBulletIcon className="w-6 h-6" /> },
    { path: "/charts", label: "Charts", icon: <ChartPieIcon className="w-6 h-6" /> },
    { path: "/profile", label: "Profile", icon: <UserIcon className="w-6 h-6" /> },
  ];

  useEffect(() => {
    const index = tabs.findIndex((t) => location.pathname === t.path);
    if (index >= 0) setActiveIndex(index);
  }, [location.pathname]);

  return (
    <div className="relative flex justify-around p-2 rounded-t-xl bg-darkbg border-t border-blueaccent fixed bottom-0 left-0 right-0 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`flex flex-col items-center text-sm relative z-10 py-1 ${
            location.pathname === tab.path ? "text-blueaccent" : "text-lightgray"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
