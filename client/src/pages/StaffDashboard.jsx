import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

const navigation = [
  {
    label: "Dashboard",
    path: "/staff",
    icon: "⌂",
    end: true,
  },
  {
    label: "My Treks",
    path: "/staff/treks",
    icon: "△",
  },
  {
    label: "Participants",
    path: "/staff/participants",
    icon: "♙",
  },
  {
    label: "AI Assistant",
    path: "/chat",
    icon: "✦",
  },
];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN");
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
};

function StaffDashboard() {
  const { pathname } = useLocation();

  const normalizedPath =
    pathname.replace(/\/+$/, "") || "/";

  const isDashboardPage =
    normalizedPath === "/staff";

  const isTreksPage =
    normalizedPath === "/staff/treks";

  const isParticipantsPage =
    normalizedPath === "/staff/participants";

  const pageTitle = isTreksPage
    ? "My Treks"
    : isParticipantsPage
      ? "Participants"
      : "Staff Dashboard";

  const [treks, setTreks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [treksResponse, bookingsResponse] =
        await Promise.all([
          api.get("/treks/assigned/me"),
          api.get("/bookings/staff/participants"),
        ]);

      setTreks(treksResponse.data.treks || []);
      setBookings(
        bookingsResponse.data.bookings || []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load staff dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const updateTrekStatus = async (
    trekId,
    status
  ) => {
    try {
      setActionId(trekId);
      setError("");
      setSuccess("");

      const { data } = await api.patch(
        `/treks/assigned/${trekId}/status`,
        {
          status,
        }
      );

      setSuccess(
        data.message ||
          `Trek ${formatStatus(
            status
          ).toLowerCase()} successfully`
      );

      await fetchStaffData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update trek status"
      );
    } finally {
      setActionId("");
    }
  };

  const openTreks = treks.filter(
    (trek) => trek.status === "open"
  ).length;

  const totalParticipants = bookings.reduce(
    (total, booking) =>
      total + Number(booking.participants || 0),
    0
  );

  return (
    <DashboardLayout
      title={pageTitle}
      navigation={navigation}
    >
      {success && (
        <p className="status-message success">
          {success}
        </p>
      )}

      {error && (
        <p className="status-message error">
          {error}
        </p>
      )}

      {isDashboardPage && (
        <section className="stats-grid">
          <article className="stat-card">
            <p>Assigned Treks</p>
            <strong>{treks.length}</strong>
            <span>Your assigned treks</span>
          </article>

          <article className="stat-card">
            <p>Total Participants</p>
            <strong>{totalParticipants}</strong>
            <span>Across assigned treks</span>
          </article>

          <article className="stat-card">
            <p>Open Treks</p>
            <strong>{openTreks}</strong>
            <span>Currently available</span>
          </article>
        </section>
      )}

      {(isDashboardPage || isTreksPage) && (
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                TREK OPERATIONS
              </p>
              <h2>My assigned treks</h2>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={fetchStaffData}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <p className="empty-state">
              Loading treks...
            </p>
          ) : treks.length === 0 ? (
            <p className="empty-state">
              No treks have been assigned yet.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trek</th>
                    <th>Location</th>
                    <th>Dates</th>
                    <th>Slots</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {treks.map((trek) => (
                    <tr key={trek._id}>
                      <td>{trek.name}</td>
                      <td>{trek.location}</td>

                      <td>
                        {formatDate(trek.startDate)}
                        {" – "}
                        {formatDate(trek.endDate)}
                      </td>

                      <td>
                        {trek.availableSlots}/
                        {trek.totalSlots}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            trek.status
                          }`}
                        >
                          {formatStatus(trek.status)}
                        </span>
                      </td>

                      <td>
                        {trek.status === "open" && (
                          <button
                            type="button"
                            className="primary-button small"
                            disabled={
                              actionId === trek._id
                            }
                            onClick={() =>
                              updateTrekStatus(
                                trek._id,
                                "in_progress"
                              )
                            }
                          >
                            {actionId === trek._id
                              ? "Updating..."
                              : "Start Trek"}
                          </button>
                        )}

                        {trek.status ===
                          "in_progress" && (
                          <button
                            type="button"
                            className="primary-button small"
                            disabled={
                              actionId === trek._id
                            }
                            onClick={() =>
                              updateTrekStatus(
                                trek._id,
                                "completed"
                              )
                            }
                          >
                            {actionId === trek._id
                              ? "Updating..."
                              : "Complete Trek"}
                          </button>
                        )}

                        {trek.status ===
                          "completed" && (
                          <span className="status-badge completed">
                            Completed
                          </span>
                        )}

                        {trek.status === "closed" && (
                          <span className="status-badge closed">
                            Closed
                          </span>
                        )}

                        {trek.status ===
                          "cancelled" && (
                          <span className="status-badge cancelled">
                            Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {(isDashboardPage ||
        isParticipantsPage) && (
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                PARTICIPANTS
              </p>
              <h2>Booked trekkers</h2>
            </div>

            {isParticipantsPage && (
              <button
                type="button"
                className="secondary-button"
                onClick={fetchStaffData}
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : "Refresh"}
              </button>
            )}
          </div>

          {loading ? (
            <p className="empty-state">
              Loading participants...
            </p>
          ) : bookings.length === 0 ? (
            <p className="empty-state">
              No participants have booked your
              treks.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Trek</th>
                    <th>Participants</th>
                    <th>Booking Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        {booking.user?.name || "—"}
                      </td>

                      <td>
                        {booking.user?.email || "—"}
                      </td>

                      <td>
                        {booking.trek?.name || "—"}
                      </td>

                      <td>
                        {booking.participants}
                      </td>

                      <td>
                        {formatDate(
                          booking.bookingDate
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            booking.status
                          }`}
                        >
                          {formatStatus(
                            booking.status
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </DashboardLayout>
  );
}

export default StaffDashboard;