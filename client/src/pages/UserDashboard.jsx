import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "⌂",
    end: true,
  },
  {
    label: "Browse Treks",
    path: "/treks",
    icon: "△",
  },
  {
    label: "My Bookings",
    path: "/bookings",
    icon: "▣",
  },
  {
    label: "Trekking History",
    path: "/history",
    icon: "↻",
  },
  {
    label: "AI Assistant",
    path: "/chat",
    icon: "✦",
  },
];

function UserDashboard() {
  const [treks, setTreks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [trekResponse, bookingResponse] =
          await Promise.all([
            api.get("/treks?status=open"),
            api.get("/bookings/me"),
          ]);

        setTreks(trekResponse.data.treks);
        setBookings(
          bookingResponse.data.bookings
        );
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const activeBookings = bookings.filter(
    (booking) => booking.status === "booked"
  );

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "completed"
  );

  const cancelledBookings = bookings.filter(
    (booking) =>
      booking.status === "cancelled"
  );

  const recentBookings = bookings.slice(0, 5);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <DashboardLayout
      title="Trekker Dashboard"
      navigation={navigation}
    >
      {error && (
        <p className="form-error">{error}</p>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span>Available Treks</span>
          <strong>
            {loading ? "—" : treks.length}
          </strong>
          <small>Open for booking</small>
        </article>

        <article className="stat-card">
          <span>Active Bookings</span>
          <strong>
            {loading
              ? "—"
              : activeBookings.length}
          </strong>
          <small>Your upcoming treks</small>
        </article>

        <article className="stat-card">
          <span>Completed Treks</span>
          <strong>
            {loading
              ? "—"
              : completedBookings.length}
          </strong>
          <small>Your trekking history</small>
        </article>

        <article className="stat-card">
          <span>Cancelled</span>
          <strong>
            {loading
              ? "—"
              : cancelledBookings.length}
          </strong>
          <small>Cancelled bookings</small>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              QUICK ACTIONS
            </p>
            <h2>Plan your next adventure</h2>
          </div>

          <div className="table-actions">
            <Link
              className="primary-action"
              to="/treks"
            >
              Browse Treks
            </Link>

            <Link
              className="refresh-button"
              to="/chat"
            >
              Ask AI
            </Link>
          </div>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              RECENT ACTIVITY
            </p>
            <h2>Recent bookings</h2>
          </div>

          <Link
            className="refresh-button"
            to="/bookings"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p className="empty-state">
            Loading activity...
          </p>
        ) : recentBookings.length === 0 ? (
          <p className="empty-state">
            You have no booking activity yet.
          </p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Trek</th>
                  <th>Location</th>
                  <th>Booking Date</th>
                  <th>Participants</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      {booking.trek?.name ||
                        "Deleted trek"}
                    </td>

                    <td>
                      {booking.trek?.location ||
                        "—"}
                    </td>

                    <td>
                      {new Date(
                        booking.bookingDate
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      {booking.participants}
                    </td>

                    <td>
                      {formatCurrency(
                        booking.totalAmount
                      )}
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

export default UserDashboard;