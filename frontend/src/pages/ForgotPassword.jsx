import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Auto-dismiss messages after 4 seconds
  useEffect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [message, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(response.data.message);
      setEmail("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {/* ========================================
          GLOBAL NOTIFICATION POPUPS
          ======================================== */}

      {message && (
        <div className="forgot-success-message" role="status">
          <div className="add-asset-message-icon">✓</div>
          <div className="add-asset-message-content">
            <strong>Success</strong>
            <span>{message}</span>
          </div>
          <button
            type="button"
            className="app-notification-close"
            onClick={() => setMessage("")}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="forgot-error-message" role="alert">
          <div className="add-asset-message-icon">!</div>
          <div className="add-asset-message-content">
            <strong>Error</strong>
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="app-notification-close"
            onClick={() => setError("")}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      <div className="forgot-password-card">
        <button
          type="button"
          className="forgot-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Login
        </button>

        <div className="forgot-password-header">
          <h1>Forgot Password?</h1>

          <p>
            Enter your registered email address and we'll send you a password
            reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="forgot-form-group">
            <label htmlFor="forgot-email">Email Address</label>

            <input
              id="forgot-email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="forgot-submit-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="forgot-password-footer">
          <span>Remember your password?</span>

          <button type="button" onClick={() => navigate("/")}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
