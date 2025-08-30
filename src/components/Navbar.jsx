import React from "react";
import useAuthState from "../hooks/useAuthState";

export default function Navbar() {
  const { user, login, logout, loading } = useAuthState();

  return (
    <header className="flex items-center p-4 bg-darkblue text-lightgray shadow-md">
      {/* Logo & Title */}
      <div>
        <h2 className="text-xl font-bold text-blueaccent m-0">Penny Pilot</h2>
      </div>

      {/* Auth Buttons */}
      <div className="ml-auto flex items-center gap-2">
        {user ? (
          <>
            <div className="text-sm text-lightgray">{user.displayName}</div>
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
