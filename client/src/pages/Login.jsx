import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import trekmateLogo from "../assets/trekmate-logo.png";
import loginBg from "../assets/login-bg.png";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await login(formData);
      const dashboardRoutes = {
        admin: "/admin",
        staff: "/staff",
        user: "/dashboard",
      };
      navigate(
        dashboardRoutes[data.user.role] || "/chat"
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to login"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-split-page">
      {/* LEFT SIDE — Scenic Image, Diagonal Divider & Prominent Branding */}
      <section
        className="login-left-banner"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="login-left-overlay" />
        <div className="login-left-content">
          <img
            src={trekmateLogo}
            alt="TrekMate Logo"
            className="login-large-logo"
          />
          <h2 className="login-tagline-hero">
            EXPLORE • TRACK • TOGETHER
          </h2>
          <p className="login-description-hero">
            Discover new trails, plan your next adventure, and make every journey unforgettable.
          </p>
        </div>
      </section>

      {/* RIGHT SIDE — Login Form & Top-Right Badge */}
      <section className="login-right-section">
        {/* TOP RIGHT PREMIUM BADGE */}
        <div className="login-top-badge">
          <span className="badge-cyan">Explore More.</span>{" "}
          <span className="badge-white">Worry Less.</span>
        </div>

        <div className="login-form-container">
          <div className="login-form-header">
            <h1>Welcome Back!</h1>
            <p className="auth-subtitle">
              Sign in to your TrekMate account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="login-submit-button"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            New to TREKMATE? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;