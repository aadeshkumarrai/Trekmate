import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardLayout({ title, navigation, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span>TM</span>
          <div>
            <strong>TrekMate</strong>
            <small>Management</small>
          </div>
        </div>

        <nav className="dashboard-navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">
              {user?.role?.toUpperCase()} PANEL
            </p>
            <h1>{title}</h1>
          </div>

          <div className="dashboard-user">
            <span>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.role}</small>
            </div>
          </div>
        </header>

        <div className="dashboard-body">{children}</div>
      </section>
    </main>
  );
}

export default DashboardLayout;