import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import trekmateLogo from "../assets/trekmate-logo.png";

const sidebarIcons = {
  Dashboard: "⌂",
  Treks: "△",
  Bookings: "▣",
  Users: "◎",
  Staff: "♟",
  "Staff Requests": "♧",
  "AI Assistant": "✦",
  "My Treks": "△",
  Participants: "♙",
  "Browse Treks": "△",
  "My Bookings": "▣",
  "Trekking History": "↻",
};

function DashboardLayout({
  title,
  navigation,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "staff") return "/staff";
    return "/dashboard";
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 760) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <main className="dashboard-page">
      <button
        type="button"
        className={`dashboard-overlay ${
          menuOpen ? "show" : ""
        }`}
        aria-label="Close navigation menu"
        onClick={() => setMenuOpen(false)}
      />

      <aside
        className={`dashboard-sidebar ${
          menuOpen ? "open" : ""
        }`}
      >
        <div className="dashboard-brand">
          <Link
            to={getDashboardPath()}
            className="dashboard-brand-link"
            aria-label="Go to dashboard"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src={trekmateLogo}
              alt="TrekMate Logo"
              className="sidebar-logo-img"
            />

            <div>
              <strong>TREKMATE</strong>
            </div>
          </Link>

          <button
            type="button"
            className="sidebar-close-button"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="dashboard-navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <span aria-hidden="true">
                {sidebarIcons[item.label] ||
                  item.icon ||
                  "•"}
              </span>

              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-title-area">
            <button
              type="button"
              className="dashboard-menu-button"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>

            <div>
              <p className="eyebrow">
                {user?.role?.toUpperCase()} PANEL
              </p>

              <h1>{title}</h1>
            </div>
          </div>

          <div className="dashboard-user">
            <span>
              {user?.name
                ?.charAt(0)
                .toUpperCase()}
            </span>

            <div>
              <strong>
                {user?.name?.replace(
                  /trekmate/gi,
                  "TREKMATE"
                )}
              </strong>

              <small>{user?.role}</small>
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          {children}
        </div>
      </section>
    </main>
  );
}

export default DashboardLayout;