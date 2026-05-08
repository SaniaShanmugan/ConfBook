import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth } from "../../api";
import "./Navbar.css";

function Navbar({ user, setUser }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate    = useNavigate();
  const dropdownRef = useRef(null);

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "JD";

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="app-navbar">
      <div className="nav-content">
        <div className="nav-left" onClick={() => navigate("/")}>
          <h1 className="logo-text">ConfBook</h1>
        </div>
        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-tab active" : "nav-tab"}>
            Calendar
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => isActive ? "nav-tab active" : "nav-tab"}>
            Bookings
          </NavLink>
        </nav>
        <div className="nav-user-section" ref={dropdownRef}>
          <div className="user-avatar" onClick={() => setShowDropdown((prev) => !prev)}>
            {initials}
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-btn" onClick={handleLogout}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;