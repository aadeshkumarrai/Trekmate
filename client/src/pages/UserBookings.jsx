import { useEffect, useState } from "react";
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

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        "/bookings/me"
      );

      setBookings(data.bookings);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load your bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setActionId(bookingId);
      setError("");
      setSuccess("");

      const { data } = await api.patch(
        `/bookings/${bookingId}/cancel`
      );

      setSuccess(data.message);
      await fetchBookings();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to cancel booking"
      );
    } finally {
      setActionId("");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <DashboardLayout
      title="My Bookings"
      navigation={navigation}
    >
      {success && (
        <p className="form-success">{success}</p>
      )}

      {error && (
        <p className="form-error">{error}</p>
      )}

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              YOUR BOOKINGS
            </p>
            <h2>Booked treks</h2>
          </div>

          <button
            className="refresh-button"
            onClick={fetchBookings}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">
            Loading bookings...
          </p>
        ) : bookings.length === 0 ? (
          <p className="empty-state">
            You have not booked any trek yet.
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
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
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

                    <td>
                      {booking.status === "booked" ? (
                        <button
                          className="reject-button"
                          disabled={
                            actionId === booking._id
                          }
                          onClick={() =>
                            handleCancel(booking._id)
                          }
                        >
                          {actionId === booking._id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      ) : (
                        "—"
                      )}
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

export default UserBookings;