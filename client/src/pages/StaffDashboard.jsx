import {
  useCallback,
  useEffect,
  useState,
} from "react";
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

function StaffDashboard() {
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

      const [trekResponse, bookingResponse] =
        await Promise.all([
          api.get("/treks/assigned/me"),
          api.get(
            "/bookings/staff/participants"
          ),
        ]);

      setTreks(trekResponse.data.treks);
      setBookings(
        bookingResponse.data.bookings
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load staff dashboard"
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
        { status }
      );

      setSuccess(data.message);
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
      total + booking.participants,
    0
  );

  return (
    <DashboardLayout
      title="Staff Dashboard"
      navigation={navigation}
    >
      {success && (
        <p className="form-success">{success}</p>
      )}

      {error && (
        <p className="form-error">{error}</p>
      )}

      <section className="stats-grid three-columns">
        <article className="stat-card">
          <span>Assigned Treks</span>
          <strong>{treks.length}</strong>
          <small>Your assigned treks</small>
        </article>

        <article className="stat-card">
          <span>Total Participants</span>
          <strong>{totalParticipants}</strong>
          <small>Across assigned treks</small>
        </article>

        <article className="stat-card">
          <span>Open Treks</span>
          <strong>{openTreks}</strong>
          <small>Currently available</small>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              TREK OPERATIONS
            </p>
            <h2>My assigned treks</h2>
          </div>

          <button
            className="refresh-button"
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
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
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
                      {new Date(
                        trek.startDate
                      ).toLocaleDateString("en-IN")}
                      {" – "}
                      {new Date(
                        trek.endDate
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      {trek.availableSlots}/
                      {trek.totalSlots}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${trek.status}`}
                      >
                        {trek.status.replace(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td>
                      {trek.status === "open" ? (
                        <button
                          className="approve-button"
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
                            ? "Starting..."
                            : "Start Trek"}
                        </button>
                      ) : trek.status ===
                        "in_progress" ? (
                        <button
                          className="approve-button"
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
                            ? "Completing..."
                            : "Complete Trek"}
                        </button>
                      ) : trek.status ===
                        "completed" ? (
                        <span
                          className="status-badge completed"
                        >
                          Completed
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              PARTICIPANTS
            </p>
            <h2>Booked trekkers</h2>
          </div>
        </div>

        {bookings.length === 0 ? (
          <p className="empty-state">
            No participants have booked your
            treks.
          </p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
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
                      {booking.user?.name || "Unknown"}
                    </td>

                    <td>
                      {booking.user?.email || "—"}
                    </td>

                    <td>
                      {booking.trek?.name ||
                        "Deleted trek"}
                    </td>

                    <td>{booking.participants}</td>

                    <td>
                      {new Date(
                        booking.bookingDate
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${booking.status}`}
                      >
                        {booking.status}
                      </span>
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

export default StaffDashboard