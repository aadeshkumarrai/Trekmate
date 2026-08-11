import { useEffect, useState } from "react";
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
  const [staffRequests, setStaffRequests] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [staffResponse, statsResponse] = await Promise.all([
        api.get("/admin/staff?status=pending"),
        api.get("/admin/stats"),
      ]);

      setStaffRequests(staffResponse.data.staff || []);
      setStats(statsResponse.data.stats || initialStats);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const updateStaffStatus = async (staffId, action) => {
    setUpdatingId(staffId);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.patch(
        `/admin/staff/${staffId}/${action}`
      );

      setSuccess(data.message);

      setStaffRequests((currentRequests) =>
        currentRequests.filter(
          (request) => request._id !== staffId
        )
      );

      setStats((currentStats) => ({
        ...currentStats,
        pendingStaff: Math.max(
          0,
          currentStats.pendingStaff - 1
        ),
      }));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          `Unable to ${action} staff request`
      );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <DashboardLayout
      navigation={navigation}
      eyebrow="ADMIN PANEL"
      title="Admin Dashboard"
    >
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <section className="stats-grid">
        <article className="stat-card">
          <p>Total Treks</p>
          <strong>{stats.totalTreks}</strong>
          <span>Treks available in the system</span>
        </article>

        <article className="stat-card">
          <p>Total Users</p>
          <strong>{stats.totalUsers}</strong>
          <span>Registered trekkers</span>
        </article>

        <article className="stat-card">
          <p>Pending Staff</p>
          <strong>{stats.pendingStaff}</strong>
          <span>Waiting for approval</span>
        </article>

        <article className="stat-card">
          <p>Total Bookings</p>
          <strong>{stats.totalBookings}</strong>
          <span>Bookings received</span>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">STAFF MANAGEMENT</p>
            <h2>Pending requests</h2>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading staff requests...</p>
        ) : staffRequests.length === 0 ? (
          <p className="empty-state">
            No pending staff requests.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {staffRequests.map((staff) => (
                  <tr key={staff._id}>
                    <td>{staff.name}</td>
                    <td>{staff.email}</td>
                    <td>
                      {new Date(
                        staff.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="status-badge pending">
                        Pending
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="approve-button"
                          disabled={updatingId === staff._id}
                          onClick={() =>
                            updateStaffStatus(
                              staff._id,
                              "approve"
                            )
                          }
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className="reject-button"
                          disabled={updatingId === staff._id}
                          onClick={() =>
                            updateStaffStatus(
                              staff._id,
                              "reject"
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default AdminDashboard;