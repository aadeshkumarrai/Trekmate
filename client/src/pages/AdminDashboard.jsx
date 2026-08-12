import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: "⌂",
    end: true,
  },
  {
    label: "Treks",
    path: "/admin/treks",
    icon: "△",
  },
  {
    label: "Bookings",
    path: "/admin/bookings",
    icon: "▣",
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: "♙",
  },
  {
    label: "Staff",
    path: "/admin/team",
    icon: "♟",
  },
  {
    label: "Staff Requests",
    path: "/admin/staff",
    icon: "♧",
  },
  {
    label: "AI Assistant",
    path: "/chat",
    icon: "✦",
  },
];

const initialStats = {
  totalTreks: 0,
  totalUsers: 0,
  pendingStaff: 0,
  totalBookings: 0,
};

function AdminDashboard() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError("");

    try {
      const statsResponse = await api.get("/admin/stats");
      setStats(statsResponse.data.stats || initialStats);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load admin dashboard overview"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <DashboardLayout
      navigation={navigation}
      eyebrow="ADMIN PANEL"
      title="Admin Dashboard"
    >
      {error && <p className="form-error">{error}</p>}

      {/* Prominent High-Level Stats Overview */}
      <section className="stats-grid">
        <article className="stat-card highlight">
          <p>Total Treks</p>
          <strong>{stats.totalTreks}</strong>
          <span>Treks active in system</span>
        </article>

        <article className="stat-card highlight">
          <p>Registered Trekkers</p>
          <strong>{stats.totalUsers}</strong>
          <span>Total user accounts</span>
        </article>

        <article className="stat-card highlight">
          <p>Pending Staff Requests</p>
          <strong>{stats.pendingStaff}</strong>
          <span>Applications awaiting review</span>
        </article>

        <article className="stat-card highlight">
          <p>Total Bookings</p>
          <strong>{stats.totalBookings}</strong>
          <span>Reservations processed</span>
        </article>
      </section>

      {/* Action Banner for Pending Requests if any */}
      {stats.pendingStaff > 0 && (
        <section className="notice-banner">
          <div className="notice-content">
            <span className="notice-badge">{stats.pendingStaff} Pending</span>
            <div>
              <h3>Staff Applications Requiring Approval</h3>
              <p>You have {stats.pendingStaff} staff membership application(s) waiting for admin verification.</p>
            </div>
          </div>
          <Link to="/admin/staff" className="primary-action">
            Review Applications →
          </Link>
        </section>
      )}

      {/* Quick Access Control Hub */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">SYSTEM OVERVIEW</p>
            <h2>Admin Control Hub</h2>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={fetchDashboardStats}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh Stats"}
          </button>
        </div>

        <div className="quick-nav-grid">
          <Link to="/admin/treks" className="quick-nav-card">
            <span className="quick-nav-icon">△</span>
            <div className="quick-nav-info">
              <h3>Trek Management</h3>
              <p>Create, edit, and update available trek listings and slots.</p>
            </div>
            <span className="quick-nav-arrow">→</span>
          </Link>

          <Link to="/admin/bookings" className="quick-nav-card">
            <span className="quick-nav-icon">▣</span>
            <div className="quick-nav-info">
              <h3>Bookings Center</h3>
              <p>Track all trekker reservations and booking statuses.</p>
            </div>
            <span className="quick-nav-arrow">→</span>
          </Link>

          <Link to="/admin/users" className="quick-nav-card">
            <span className="quick-nav-icon">♙</span>
            <div className="quick-nav-info">
              <h3>User Directory</h3>
              <p>Manage user accounts, view profiles, and monitor blacklists.</p>
            </div>
            <span className="quick-nav-arrow">→</span>
          </Link>

          <Link to="/admin/team" className="quick-nav-card">
            <span className="quick-nav-icon">♟</span>
            <div className="quick-nav-info">
              <h3>Staff Team Roster</h3>
              <p>View verified staff members and assigned responsibilities.</p>
            </div>
            <span className="quick-nav-arrow">→</span>
          </Link>

          <Link to="/admin/staff" className="quick-nav-card">
            <span className="quick-nav-icon">♧</span>
            <div className="quick-nav-info">
              <h3>Staff Applications</h3>
              <p>Approve or reject pending staff registrations ({stats.pendingStaff} pending).</p>
            </div>
            <span className="quick-nav-arrow">→</span>
          </Link>

          <Link to="/chat" className="quick-nav-card">
            <span className="quick-nav-icon">✦</span>
            <div className="quick-nav-info">
              <h3>TrekMate AI Assistant</h3>
              <p>Access AI travel planning and trek information assistant.</p>
            </div>
            <span className="quick-nav-arrow">→</span>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default AdminDashboard;