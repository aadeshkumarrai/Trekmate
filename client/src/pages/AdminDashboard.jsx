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
    label: "Staff Requests",
    path: "/admin/staff",
    icon: "♙",
  },
  {
    label: "AI Assistant",
    path: "/chat",
    icon: "✦",
  },
];

function AdminDashboard() {
  const [staff, setStaff] = useState([]);

  const [stats, setStats] = useState({
    totalTreks: 0,
    totalUsers: 0,
    pendingStaff: 0,
    totalBookings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [staffResponse, statsResponse] =
        await Promise.all([
          api.get("/admin/staff?status=pending"),
          api.get("/admin/stats"),
        ]);

      setStaff(staffResponse.data.staff);
      setStats(statsResponse.data.stats);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const updateStaff = async (staffId, action) => {
    try {
      setActionId(staffId);
      setError("");

      await api.patch(
        `/admin/staff/${staffId}/${action}`
      );

      await fetchDashboardData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          `Unable to ${action} staff account`
      );
    } finally {
      setActionId("");
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      navigation={navigation}
    >
      <section className="stats-grid">
        <article className="stat-card">
          <span>Total Treks</span>
          <strong>{stats.totalTreks}</strong>
          <small>Treks available in the system</small>
        </article>

        <article className="stat-card">
          <span>Total Users</span>
          <strong>{stats.totalUsers}</strong>
          <small>Registered trekkers</small>
        </article>

        <article className="stat-card">
          <span>Pending Staff</span>
          <strong>{stats.pendingStaff}</strong>
          <small>Waiting for approval</small>
        </article>

        <article className="stat-card">
          <span>Total Bookings</span>
          <strong>{stats.totalBookings}</strong>
          <small>Bookings received</small>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              STAFF MANAGEMENT
            </p>
            <h2>Pending requests</h2>
          </div>

          <button
            className="refresh-button"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <p className="form-error">{error}</p>
        )}

        {loading ? (
          <p className="empty-state">
            Loading requests...
          </p>
        ) : staff.length === 0 ? (
          <p className="empty-state">
            No pending staff requests.
          </p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {staff.map((member) => (
                  <tr key={member._id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      {new Date(
                        member.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="approve-button"
                          disabled={
                            actionId === member._id
                          }
                          onClick={() =>
                            updateStaff(
                              member._id,
                              "approve"
                            )
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="reject-button"
                          disabled={
                            actionId === member._id
                          }
                          onClick={() =>
                            updateStaff(
                              member._id,
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