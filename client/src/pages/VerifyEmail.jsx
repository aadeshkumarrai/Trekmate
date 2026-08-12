import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import BrandLogo from "../components/BrandLogo";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setVerifying(false);
        setError("Verification token is missing.");
        return;
      }

      try {
        setVerifying(true);
        await api.get(`/auth/verify-email?token=${token}`);
        setSuccess(true);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Invalid or expired verification token."
        );
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token]);

  return (
    <main className="auth-page">
      <BrandLogo />
      <section className="auth-card" style={{ textAlign: "center" }}>
        <p className="eyebrow">TREKMATE</p>

        {verifying ? (
          <>
            <h1>Verifying email...</h1>
            <p className="auth-subtitle">
              Please wait while we verify your email address.
            </p>
          </>
        ) : success ? (
          <>
            <h1 style={{ color: "var(--success)" }}>Email verified successfully</h1>
            <p className="auth-subtitle" style={{ marginBottom: "28px" }}>
              Your email address has been confirmed. You can now log in to your account.
            </p>
            <Link
              to="/login"
              className="primary-button"
              style={{ width: "100%", display: "inline-flex" }}
            >
              Proceed to Login
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ color: "var(--danger)" }}>Verification Failed</h1>
            <p className="auth-subtitle" style={{ marginBottom: "28px" }}>
              {error}
            </p>
            <Link
              to="/login"
              className="secondary-button"
              style={{ width: "100%", display: "inline-flex" }}
            >
              Back to Login
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

export default VerifyEmail;
