import React from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthState from "../hooks/useAuthState";

export default function Navbar() {
  const { user, login, logout, loading } = useAuthState();
  const location = useLocation();

  const navItems = [
    { path: "/home", label: "Home" },
    { path: "/list", label: "Insights" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <header className="flex items-center p-4 bg-darkblue text-lightgray shadow-md">
      {/* Logo & Title */}
      <div>
        <h2 className="text-xl font-bold text-blueaccent m-0">Penny Pilot</h2>
      </div>

      {/* Navigation - visible only on md+ screens */}
      <nav className="ml-8 hidden md:flex gap-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`hover:text-blueaccent transition ${
              location.pathname === item.path ? "text-blueaccent font-semibold" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Auth Buttons */}
      <div className="ml-auto flex items-center gap-2">
        {user ? (
          <>
            <div className="text-sm text-lightgray hidden md:block">{user.displayName}</div>
            <button
              onClick={logout}
              className="bg-blueaccent text-darkbg px-3 py-1 rounded hover:bg-lightgray hover:text-darkblue transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={login}
            className="bg-blueaccent text-darkbg px-3 py-1 rounded hover:bg-lightgray hover:text-darkblue transition"
          >
            {loading ? "..." : "Login with Google"}
          </button>
        )}
      </div>
    </header>
  );
}
