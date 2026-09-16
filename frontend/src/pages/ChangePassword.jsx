import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
import api from "../services/api";

import "./ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-dismiss messages after 4 seconds
  useEffect(() => {
    if (!successMessage && !errorMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage, errorMessage]);

  // ========================================
  // ALWAYS START PAGE FROM TOP
  // ========================================

  useEffect(() => {
    // Tell the browser not to restore the previous scroll position.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Force page to the very top when this page loads.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    // Extra calls make this reliable even when the browser
    // restores the old scroll position after the first render.
    const frameOne = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });

    const frameTwo = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });

    const timer = window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }, 50);

    return () => {
      window.cancelAnimationFrame(frameOne);
      window.cancelAnimationFrame(frameTwo);
      window.clearTimeout(timer);
    };
  }, []);

  // ========================================
  // SCROLL TO TOP HELPER
  // ========================================

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  // ========================================
  // SHOW / HIDE PASSWORD
  // ========================================

  const togglePassword = (field) => {
    setShowPasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Immediately scroll to the top when
    // Update Password is clicked.
    scrollToTop();

    setSuccessMessage("");
    setErrorMessage("");

    // ========================================
    // FRONTEND VALIDATION
    // ========================================

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setErrorMessage("Please complete all password fields.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    if (form.newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setErrorMessage(
        "Your new password must be different from your current password.",
      );
      return;
    }

    // ========================================
    // UPDATE PASSWORD
    // ========================================

    try {
      setLoading(true);

      const response = await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      setSuccessMessage(
        response.data?.message || "Password changed successfully.",
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Make sure the success notification
      // is visible at the top.
      window.setTimeout(() => {
        scrollToTop();
      }, 100);
    } catch (error) {
      console.error(
        "Change Password Error:",
        error.response?.data || error.message,
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to change your password. Please try again.",
      );

      // Make sure the error notification
      // is visible at the top.
      window.setTimeout(() => {
        scrollToTop();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // PASSWORD STRENGTH
  // ========================================

  const getPasswordStrength = () => {
    const password = form.newPassword;

    if (!password) {
      return {
        label: "Enter a new password",
        level: 0,
      };
    }

    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return {
        label: "Weak password",
        level: 1,
      };
    }

    if (score <= 3) {
      return {
        label: "Fair password",
        level: 2,
      };
    }

    if (score <= 4) {
      return {
        label: "Good password",
        level: 3,
      };
    }

    return {
      label: "Strong password",
      level: 4,
    };
  };

  const strength = getPasswordStrength();

  // ========================================
  // UI
  // ========================================

  return (
    <AppPageLayout>
      <main className="change-password-page">
        <div className="change-password-container">
          {/* ========================================
              HEADER
              ======================================== */}

          <section className="change-password-header">
            <div>
              <span className="change-password-eyebrow">ACCOUNT SECURITY</span>

              <h1>Change Password</h1>

              <p>
                Keep your account secure by using a strong password that you do
                not use anywhere else.
              </p>
            </div>

            <button
              type="button"
              className="change-password-back"
              onClick={() => navigate("/profile")}
            >
              <span>←</span>
              Back to Profile
            </button>
          </section>

          {/* ========================================
              GLOBAL NOTIFICATION POPUPS
              ======================================== */}

          {successMessage && (
            <div className="change-password-alert change-password-success" role="status">
              <div className="add-asset-message-icon">✓</div>

              <div className="add-asset-message-content">
                <strong>Password Updated</strong>
                <span>{successMessage}</span>
              </div>

              <button
                type="button"
                className="app-notification-close"
                onClick={() => setSuccessMessage("")}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="change-password-alert change-password-error" role="alert">
              <div className="add-asset-message-icon">!</div>

              <div className="add-asset-message-content">
                <strong>Error</strong>
                <span>{errorMessage}</span>
              </div>

              <button
                type="button"
                className="app-notification-close"
                onClick={() => setErrorMessage("")}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* ========================================
              CONTENT
              ======================================== */}

          <div className="change-password-grid">
            {/* ========================================
                PASSWORD FORM
                ======================================== */}

            <section className="change-password-card">
              <div className="change-password-card-header">
                <div className="change-password-card-icon">🔐</div>

                <div>
                  <h2>Password credentials</h2>

                  <p>Enter your current password and choose a new one.</p>
                </div>
              </div>

              <form className="change-password-form" onSubmit={handleSubmit}>
                {/* ========================================
                    CURRENT PASSWORD
                    ======================================== */}

                <div className="change-password-field">
                  <label htmlFor="currentPassword">Current password</label>

                  <div className="change-password-input-wrapper">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="change-password-visibility"
                      onClick={() => togglePassword("current")}
                      aria-label={
                        showPasswords.current
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      {showPasswords.current ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* ========================================
                    NEW PASSWORD
                    ======================================== */}

                <div className="change-password-field">
                  <label htmlFor="newPassword">New password</label>

                  <div className="change-password-input-wrapper">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="Create a new password"
                      autoComplete="new-password"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="change-password-visibility"
                      onClick={() => togglePassword("new")}
                      aria-label={
                        showPasswords.new
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {showPasswords.new ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* PASSWORD STRENGTH */}

                  <div className="change-password-strength">
                    <div className="change-password-strength-bars">
                      {[1, 2, 3, 4].map((bar) => (
                        <span
                          key={bar}
                          className={
                            bar <= strength.level
                              ? `strength-active strength-${strength.level}`
                              : ""
                          }
                        />
                      ))}
                    </div>

                    <span>{strength.label}</span>
                  </div>
                </div>

                {/* ========================================
                    CONFIRM PASSWORD
                    ======================================== */}

                <div className="change-password-field">
                  <label htmlFor="confirmPassword">Confirm new password</label>

                  <div className="change-password-input-wrapper">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="change-password-visibility"
                      onClick={() => togglePassword("confirm")}
                      aria-label={
                        showPasswords.confirm
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                    >
                      {showPasswords.confirm ? "Hide" : "Show"}
                    </button>
                  </div>

                  {form.confirmPassword && (
                    <div
                      className={`change-password-match ${
                        form.newPassword === form.confirmPassword
                          ? "is-matched"
                          : "is-not-matched"
                      }`}
                    >
                      {form.newPassword === form.confirmPassword
                        ? "✓ Passwords match"
                        : "Passwords do not match"}
                    </div>
                  )}
                </div>

                {/* ========================================
                    ACTIONS
                    ======================================== */}

                <div className="change-password-actions">
                  <button
                    type="button"
                    className="change-password-cancel"
                    onClick={() => navigate("/profile")}
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="change-password-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="change-password-spinner" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* ========================================
                SECURITY PANEL
                ======================================== */}

            <aside className="change-password-security">
              <div className="change-password-security-icon">🛡</div>

              <h2>Keep your account protected</h2>

              <p>
                A strong password helps protect your profile and asset
                management data.
              </p>

              <div className="change-password-rules">
                <div>
                  <span>✓</span>
                  <p>At least 8 characters</p>
                </div>

                <div>
                  <span>✓</span>
                  <p>Use uppercase and lowercase letters</p>
                </div>

                <div>
                  <span>✓</span>
                  <p>Include numbers</p>
                </div>

                <div>
                  <span>✓</span>
                  <p>Use a special character</p>
                </div>

                <div>
                  <span>✓</span>
                  <p>Avoid reusing old passwords</p>
                </div>
              </div>

              <div className="change-password-security-note">
                <strong>Security tip</strong>

                <span>
                  Never share your password with another person or store it in
                  plain text.
                </span>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </AppPageLayout>
  );
}

export default ChangePassword;
