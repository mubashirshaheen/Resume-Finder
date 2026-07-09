import { BriefcaseBusiness, LogOut, Settings, Upload, LayoutDashboard, BookmarkCheck } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const link = "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white";
  const active = "bg-white text-ink shadow-sm";

  return (
    <header className="border-b border-slate-200 bg-panel/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-ink">
          <BriefcaseBusiness className="h-6 w-6 text-accent" />
          Resume Agent
        </Link>
        {user && (
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink className={({ isActive }) => `${link} ${isActive ? active : ""}`} to="/">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink className={({ isActive }) => `${link} ${isActive ? active : ""}`} to="/upload">
              <Upload className="h-4 w-4" /> CV
            </NavLink>
            <NavLink className={({ isActive }) => `${link} ${isActive ? active : ""}`} to="/saved">
              <BookmarkCheck className="h-4 w-4" /> Saved
            </NavLink>
            <NavLink className={({ isActive }) => `${link} ${isActive ? active : ""}`} to="/settings">
              <Settings className="h-4 w-4" /> Settings
            </NavLink>
            <button
              className="btn-muted ml-2 px-3"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
