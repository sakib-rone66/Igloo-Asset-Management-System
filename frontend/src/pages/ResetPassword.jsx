import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!token) {
      setError("Invalid password reset link.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
        confirmPassword,
      });

      setMessage(response.data.message);

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      {/* ========================================
          GLOBAL NOTIFICATION POPUPS
          ======================================== */}

      {message && (
        <div className="reset-success-message" role="status">
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
        <div className="reset-error-message" role="alert">
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

      <div className="reset-password-card">
        <button
          type="button"
          className="reset-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Login
        </button>

        <div className="reset-password-header">
          <h1>Reset Password</h1>

          <p>
            Password Reset Successful! Now you can Log In into your Igloo Asset
            Management account with your new password.
          </p>
        </div>

        {!message && (
          <form onSubmit={handleSubmit}>
            {/* New Password */}

            <div className="reset-form-group">
              <label htmlFor="new-password">New Password</label>

              <div className="reset-password-input-wrapper">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="reset-password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}

            <div className="reset-form-group">
              <label htmlFor="confirm-password">Confirm Password</label>

              <div className="reset-password-input-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="reset-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="reset-submit-button"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <button
            type="button"
            className="reset-login-button"
            onClick={() => navigate("/")}
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
