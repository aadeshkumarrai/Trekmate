import {
  useEffect,
  useMemo,
  useState,
} from "react";
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

function UserTreks() {
  const [treks, setTreks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [difficulty, setDifficulty] =
    useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTreks = async () => {
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
          "Unable to load available treks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreks();
  }, []);

  const bookedTrekIds = useMemo(() => {
    return new Set(
      bookings
        .filter(
          (booking) =>
            booking.status === "booked" &&
            booking.trek
        )
        .map((booking) => booking.trek._id)
    );
  }, [bookings]);

  const filteredTreks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return treks.filter((trek) => {
      const matchesDifficulty =
        !difficulty ||
        trek.difficulty === difficulty;

      const matchesSearch =
        !query ||
        trek.name
          .toLowerCase()
          .includes(query) ||
        trek.location
          .toLowerCase()
          .includes(query);

      return (
        matchesDifficulty && matchesSearch
      );
    });
  }, [treks, difficulty, search]);

  const handleBooking = async (trekId) => {
    try {
      setActionId(trekId);
      setError("");
      setSuccess("");

      const { data } = await api.post(
        `/bookings/treks/${trekId}`,
        {
          participants: 1,
        }
      );

      setSuccess(data.message);
      await fetchTreks();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to book trek"
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
      title="Browse Treks"
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
            <p className="eyebrow">DISCOVER</p>
            <h2>Available treks</h2>
          </div>

          <div className="dashboard-filters">
            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value)
              }
            >
              <option value="">
                All difficulties
              </option>
              <option value="easy">Easy</option>
              <option value="moderate">
                Moderate
              </option>
              <option value="hard">Hard</option>
            </select>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search trek or location"
            />
          </div>
        </div>

        {loading ? (
          <p className="empty-state">
            Loading treks...
          </p>
        ) : filteredTreks.length === 0 ? (
          <p className="empty-state">
            No matching open treks available.
          </p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Trek</th>
                  <th>Location</th>
                  <th>Difficulty</th>
                  <th>Duration</th>
                  <th>Dates</th>
                  <th>Price</th>
                  <th>Slots</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredTreks.map((trek) => {
                  const alreadyBooked =
                    bookedTrekIds.has(trek._id);

                  return (
                    <tr key={trek._id}>
                      <td>{trek.name}</td>

                      <td>{trek.location}</td>

                      <td className="capitalize">
                        {trek.difficulty}
                      </td>

                      <td>
                        {trek.durationDays} days
                      </td>

                      <td>
                        {new Date(
                          trek.startDate
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          trek.price
                        )}
                      </td>

                      <td>
                        {trek.availableSlots}/
                        {trek.totalSlots}
                      </td>

                      <td>
                        <button
                          className="primary-action"
                          disabled={
                            alreadyBooked ||
                            trek.availableSlots < 1 ||
                            actionId === trek._id
                          }
                          onClick={() =>
                            handleBooking(trek._id)
                          }
                        >
                          {alreadyBooked
                            ? "Booked"
                            : actionId === trek._id
                              ? "Booking..."
                              : "Book Now"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default UserTreks;