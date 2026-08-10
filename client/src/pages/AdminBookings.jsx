import { useEffect, useMemo, useState } from "react";
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

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        "/bookings/admin/all"
      );

      setBookings(data.bookings);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        status === "all" ||
        booking.status === status;

      const matchesSearch =
        !query ||
        booking.user?.name
          ?.toLowerCase()
          .includes(query) ||
        booking.user?.email
          ?.toLowerCase()
          .includes(query) ||
        booking.trek?.name
          ?.toLowerCase()
          .includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, status]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <DashboardLayout
      title="Manage Bookings"
      navigation={navigation}
    >
      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              BOOKING MANAGEMENT
            </p>
            <h2>All bookings</h2>
          </div>

          <button
            className="refresh-button"
            onClick={fetchBookings}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="dashboard-filters">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search user, email or trek"
          />

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <option value="all">
              All statuses
            </option>
            <option value="booked">Booked</option>
            <option value="cancelled">
              Cancelled
            </option>
            <option value="completed">
              Completed
            </option>
          </select>
        </div>

        {error && (
          <p className="form-error">{error}</p>
        )}

        {loading ? (
          <p className="empty-state">
            Loading bookings...
          </p>
        ) : filteredBookings.length === 0 ? (
          <p className="empty-state">
            No bookings found.
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
                  <th>Amount</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => (
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
                      {formatCurrency(
                        booking.totalAmount
                      )}
                    </td>
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

export default AdminBookings;