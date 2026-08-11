import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
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
    icon: "◎",
  },
  {
    label: "Staff",
    path: "/admin/team",
    icon: "♙",
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

const initialForm = {
  name: "",
  location: "",
  difficulty: "easy",
  durationDays: "",
  price: "",
  totalSlots: "",
  startDate: "",
  endDate: "",
  assignedStaff: "",
  status: "open",
  description: "",
  image: "",
};

function AdminTrekForm() {
  const [formData, setFormData] = useState(initialForm);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");

        const staffRequest = api.get(
          "/admin/staff?status=approved"
        );

        const trekRequest = isEditing
          ? api.get(`/treks/${id}`)
          : Promise.resolve(null);

        const [staffResponse, trekResponse] =
          await Promise.all([
            staffRequest,
            trekRequest,
          ]);

        setStaff(staffResponse.data.staff);

        if (trekResponse) {
          const trek = trekResponse.data.trek;

          setFormData({
            name: trek.name,
            location: trek.location,
            difficulty: trek.difficulty,
            durationDays: trek.durationDays,
            price: trek.price,
            totalSlots: trek.totalSlots,
            startDate: trek.startDate.slice(0, 10),
            endDate: trek.endDate.slice(0, 10),
            assignedStaff: trek.assignedStaff?._id || "",
            status: trek.status,
            description: trek.description,
            image: trek.image || "",
          });
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load form data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        durationDays: Number(formData.durationDays),
        price: Number(formData.price),
        totalSlots: Number(formData.totalSlots),
      };

      if (isEditing) {
        await api.patch(`/treks/${id}`, payload);
      } else {
        await api.post("/treks", payload);
      }

      navigate("/admin/treks");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save trek"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title={isEditing ? "Edit Trek" : "Add New Trek"}
      navigation={navigation}
    >
      <section className="dashboard-panel">
        {loading ? (
          <p className="empty-state">Loading form...</p>
        ) : (
          <form
            className="management-form"
            onSubmit={handleSubmit}
          >
            <div className="form-grid">
              <label>
                Trek name
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Location
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Difficulty
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              <label>
                Duration (days)
                <input
                  name="durationDays"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.durationDays}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Price (₹)
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Total slots
                <input
                  name="totalSlots"
                  type="number"
                  min="1"
                  value={formData.totalSlots}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Start date
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                End date
                <input
                  name="endDate"
                  type="date"
                  min={formData.startDate}
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Assign staff
                <select
                  name="assignedStaff"
                  value={formData.assignedStaff}
                  onChange={handleChange}
                >
                  <option value="">Not assigned</option>

                  {staff.map((member) => (
                    <option
                      key={member._id}
                      value={member._id}
                    >
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="in_progress">
                    In progress
                  </option>
                  <option value="completed">
                    Completed
                  </option>
                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </label>

              <label className="full-width">
                Image URL (optional)
                <input
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>

              <label className="full-width">
                Description
                <textarea
                  name="description"
                  rows="5"
                  maxLength="2000"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => navigate("/admin/treks")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-action"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Trek"
                    : "Create Trek"}
              </button>
            </div>
          </form>
        )}
      </section>
    </DashboardLayout>
  );
}

export default AdminTrekForm;