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

function UserHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          "/bookings/me"
        );

        const completedBookings =
          data.bookings.filter(
            (booking) =>
              booking.status === "completed"
          );

        setHistory(completedBookings);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load trekking history"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };

  return (
    <DashboardLayout
      title="Trekking History"
      navigation={navigation}
    >
      {error && (
        <p className="form-error">{error}</p>
      )}

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              COMPLETED ADVENTURES
            </p>
            <h2>My trekking history</h2>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">
            Loading trekking history...
          </p>
        ) : history.length === 0 ? (
          <p className="empty-state">
            You have not completed any trek yet.
          </p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Trek</th>
                  <th>Location</th>
                  <th>Trek Dates</th>
                  <th>Participants</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map((booking) => (
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
                      {formatDate(
                        booking.trek?.startDate
                      )}
                      {" – "}
                      {formatDate(
                        booking.trek?.endDate
                      )}
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
                      <span className="status-badge completed">
                        Completed
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

export default UserHistory;