import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // ========================================
  // FORM STATE
  // ========================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ========================================
  // UI STATE
  // ========================================

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error message only
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-dismiss error after 4 seconds
  useEffect(() => {
    if (!errorMessage) return;

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  // ========================================
  // LOGIN
  // ========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) return;

    // Clear previous error
    setErrorMessage("");

    // ========================================
    // VALIDATION
    // ========================================

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    // Start loading
    setLoading(true);

    try {
      // ========================================
      // LOGIN REQUEST
      // ========================================

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // ========================================
      // STORE AUTH DATA
      // ========================================

      const loggedInUser = {
        ...response.data.user,
        permissions: response.data.user?.permissions || {},
      };

      localStorage.setItem("token", response.data.token);

      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // ========================================
      // NAVIGATE
      // ========================================

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);

      const message =
        error.response?.data?.message ||
        "Invalid email or password. Please try again.";

      setErrorMessage(message);

      setLoading(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="login-page">
      {/* ========================================
          BACKGROUND DECORATION
          ======================================== */}

      <div className="login-background-shape login-shape-one" />
      <div className="login-background-shape login-shape-two" />

      {/* ========================================
          LOGIN CONTAINER
          ======================================== */}

      <section className="login-container">
        {/* ========================================
            BRAND PANEL
            ======================================== */}

        <div className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-brand-logo">A</div>

            <h1>
              Asset Management
              <span>System</span>
            </h1>

            <p>
              Manage assets, outlets, assignments and operations from one secure
              platform.
            </p>

            <div className="login-brand-features">
              <div>
                <span className="login-feature-icon">✓</span>

                <span>Centralized asset management</span>
              </div>

              <div>
                <span className="login-feature-icon">✓</span>

                <span>Secure role-based access</span>
              </div>

              <div>
                <span className="login-feature-icon">✓</span>

                <span>Real-time asset tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            LOGIN FORM PANEL
            ======================================== */}

        <div className="login-form-panel">
          <div className="login-form-wrapper">
            {/* Header */}

            <div className="login-header">
              <div className="login-mobile-logo">A</div>

              <h2>Welcome back</h2>

              <p>Sign in to continue to your dashboard.</p>
            </div>

            {/* ========================================
                ERROR MESSAGE
                ======================================== */}

            {errorMessage && (
              <div className="login-error" role="alert">
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
                FORM
                ======================================== */}

            <form className="login-form" onSubmit={handleLogin}>
              {/* EMAIL */}

              <div className="login-field">
                <label htmlFor="email">Email address</label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <path d="m22 6-10 7L2 6" />
                    </svg>
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="login-field">
                <div className="login-label-row">
                  <label htmlFor="password">Password</label>
                </div>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="4" y="10" width="16" height="11" rx="2" />

                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.88c5.05 0 8.63 4.12 10 7.12a12.25 12.25 0 0 1-3.06 4.03" />
                        <path d="M6.61 6.61A12.52 12.52 0 0 0 2 12c1.37 3 4.95 7.12 10 7.12 1.44 0 2.77-.27 3.95-.72" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />

                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* ========================================
                  FORGOT PASSWORD
                  ======================================== */}

              <div className="login-options">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>

              {/* ========================================
                  LOGIN BUTTON
                  ======================================== */}

              <button
                type="submit"
                className="login-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="login-submit-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* ========================================
                FOOTER
                ======================================== */}

            <div className="login-footer">
              <span>Authorized users only</span>

              <span className="login-footer-dot">•</span>

              <span>Asset Management System</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
