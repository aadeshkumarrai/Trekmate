import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function AdminTreks() {
  const [treks, setTreks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchTreks = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/treks");
      setTreks(data.treks);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load treks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreks();
  }, []);

  const handleDelete = async (trekId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trek?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/treks/${trekId}`);

      setTreks((current) =>
        current.filter((trek) => trek._id !== trekId)
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete trek"
      );
    }
  };

  const filteredTreks = treks.filter((trek) => {
    const query = search.toLowerCase();

    return (
      trek.name.toLowerCase().includes(query) ||
      trek.location.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout
      title="Manage Treks"
      navigation={navigation}
    >
      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">TREK MANAGEMENT</p>
            <h2>All treks</h2>
          </div>

          <button
            className="primary-action"
            onClick={() => navigate("/admin/treks/new")}
          >
            + Add New Trek
          </button>
        </div>

        <div className="management-toolbar">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by trek or location"
          />

          <button
            className="refresh-button"
            onClick={fetchTreks}
          >
            Refresh
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading treks...</p>
        ) : filteredTreks.length === 0 ? (
          <p className="empty-state">
            No treks found. Add your first trek.
          </p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Trek</th>
                  <th>Location</th>
                  <th>Difficulty</th>
                  <th>Slots</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Staff</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTreks.map((trek) => (
                  <tr key={trek._id}>
                    <td>{trek.name}</td>
                    <td>{trek.location}</td>
                    <td className="capitalize">
                      {trek.difficulty}
                    </td>
                    <td>
                      {trek.availableSlots}/{trek.totalSlots}
                    </td>
                    <td>
                      ₹{Number(trek.price).toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${trek.status}`}
                      >
                        {trek.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      {trek.assignedStaff?.name ||
                        "Not assigned"}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="edit-button"
                          onClick={() =>
                            navigate(
                              `/admin/treks/${trek._id}/edit`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="reject-button"
                          onClick={() =>
                            handleDelete(trek._id)
                          }
                        >
                          Delete
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

export default AdminTreks;