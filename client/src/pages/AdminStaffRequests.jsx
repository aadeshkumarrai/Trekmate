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

function AdminStaffRequests() {
  const [staffRequests, setStaffRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStaffRequests = async (status = statusFilter) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/admin/staff?status=${status}`);
      setStaffRequests(data.staff || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load staff requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffRequests(statusFilter);
  }, [statusFilter]);

  const updateStaffStatus = async (staffId, action) => {
    setUpdatingId(staffId);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.patch(
        `/admin/staff/${staffId}/${action}`
      );

      setSuccess(data.message);

      if (statusFilter === "pending") {
        setStaffRequests((currentRequests) =>
          currentRequests.filter((request) => request._id !== staffId)
        );
      } else {
        await fetchStaffRequests(statusFilter);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          `Unable to ${action} staff request`
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getStatusBadgeClass = (status, isApproved) => {
    if (isApproved || status === "approved") return "status-badge approved";
    if (status === "rejected") return "status-badge rejected";
    return "status-badge pending";
  };

  return (
    <DashboardLayout
      navigation={navigation}
      eyebrow="STAFF MANAGEMENT"
      title="Staff Applications & Requests"
    >
      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">REVIEW & APPROVALS</p>
            <h2>Manage Applications</h2>
          </div>

          <div className="panel-actions">
            <div className="filter-tabs">
              <button
                type="button"
                className={`tab-button ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </button>
              <button
                type="button"
                className={`tab-button ${statusFilter === "approved" ? "active" : ""}`}
                onClick={() => setStatusFilter("approved")}
              >
                Approved
              </button>
              <button
                type="button"
                className={`tab-button ${statusFilter === "rejected" ? "active" : ""}`}
                onClick={() => setStatusFilter("rejected")}
              >
                Rejected
              </button>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => fetchStaffRequests(statusFilter)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading staff applications...</p>
        ) : staffRequests.length === 0 ? (
          <p className="empty-state">
            No {statusFilter} staff applications found.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Email</th>
                  <th>Submitted / Registered</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {staffRequests.map((staff) => (
                  <tr key={staff._id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-avatar-sm">
                          {staff.name?.charAt(0).toUpperCase()}
                        </span>
                        <strong>{staff.name}</strong>
                      </div>
                    </td>
                    <td>{staff.email}</td>
                    <td>
                      {staff.createdAt
                        ? new Date(staff.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(staff.approvalStatus, staff.isApproved)}>
                        {staff.isApproved
                          ? "Approved"
                          : staff.approvalStatus === "rejected"
                          ? "Rejected"
                          : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {(!staff.isApproved || staff.approvalStatus === "pending" || staff.approvalStatus === "rejected") && (
                          <button
                            type="button"
                            className="approve-button"
                            disabled={updatingId === staff._id}
                            onClick={() => updateStaffStatus(staff._id, "approve")}
                          >
                            {updatingId === staff._id ? "Processing..." : "Approve"}
                          </button>
                        )}

                        {(staff.isApproved || staff.approvalStatus === "pending" || staff.approvalStatus === "approved") && (
                          <button
                            type="button"
                            className="reject-button"
                            disabled={updatingId === staff._id}
                            onClick={() => updateStaffStatus(staff._id, "reject")}
                          >
                            {updatingId === staff._id ? "Processing..." : "Reject"}
                          </button>
                        )}
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

export default AdminStaffRequests;
