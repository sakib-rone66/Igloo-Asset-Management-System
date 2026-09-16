import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./UserProfile.css";

function UserProfile() {
  // ========================================
  // URL PARAMETER
  // ========================================

  const { userId } = useParams();

  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [user, setUser] = useState(null);

  // ========================================
  // UI STATE
  // ========================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH USER
  // ========================================

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/users/${userId}`);

      setUser(response.data.user);
    } catch (error) {
      console.error(
        "Get User Profile Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load user profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // ========================================
  // FORMAT ROLE
  // ========================================

  const formatRole = (userRole) => {
    if (!userRole) {
      return "N/A";
    }

    return userRole
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`user-profile-layout ${
        sidebarOpen
          ? "user-profile-sidebar-open"
          : "user-profile-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && (
        <Sidebar onClose={() => setSidebarOpen(false)} />
      )}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="user-profile-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="user-profile-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="user-profile-content">
          {/* ========================================
              BACK TO USERS
              ======================================== */}

          <Link
            to="/users"
            className="user-profile-back-link"
          >
            ← Back to Users
          </Link>

          {/* ========================================
              PAGE HEADER
              ======================================== */}

          <section className="user-profile-header">
            <p className="user-profile-eyebrow">
              USER MANAGEMENT
            </p>

            <h2>User Profile</h2>

            <p>
              View account information and access details for
              this user.
            </p>
          </section>

          {/* ========================================
              ERROR
              ======================================== */}

          {error && (
            <div className="user-profile-message user-profile-error">
              <span className="user-profile-message-icon">
                !
              </span>

              <div>
                <strong>Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* ========================================
              LOADING
              ======================================== */}

          {loading ? (
            <div className="user-profile-empty-state">
              <div className="user-profile-loading-spinner" />

              <p>Loading user profile...</p>
            </div>
          ) : error ? null : user ? (
            <>
              {/* ========================================
                  PROFILE CARD
                  ======================================== */}

              <section className="user-profile-card">
                <div className="user-profile-card-header">
                  <div className="user-profile-avatar">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>

                  <div className="user-profile-heading">
                    <h3>{user.name}</h3>

                    <p>{user.email}</p>
                  </div>

                  <span
                    className={`user-profile-status ${
                      user.status === "ACTIVE"
                        ? "user-profile-status-active"
                        : "user-profile-status-inactive"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                {/* ========================================
                    BASIC INFORMATION
                    ======================================== */}

                <div className="user-profile-section">
                  <div className="user-profile-section-heading">
                    <div>
                      <h4>Basic Information</h4>

                      <p>
                        General information about this account.
                      </p>
                    </div>
                  </div>

                  <div className="user-profile-info-grid">
                    <div className="user-profile-info-item">
                      <span className="user-profile-label">
                        Full Name
                      </span>

                      <strong>
                        {user.name || "N/A"}
                      </strong>
                    </div>

                    <div className="user-profile-info-item">
                      <span className="user-profile-label">
                        Email Address
                      </span>

                      <strong>
                        {user.email || "N/A"}
                      </strong>
                    </div>

                    <div className="user-profile-info-item">
                      <span className="user-profile-label">
                        Role
                      </span>

                      <span className="user-profile-role">
                        {formatRole(user.role)}
                      </span>
                    </div>

                    <div className="user-profile-info-item">
                      <span className="user-profile-label">
                        Account Status
                      </span>

                      <span
                        className={`user-profile-status ${
                          user.status === "ACTIVE"
                            ? "user-profile-status-active"
                            : "user-profile-status-inactive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="user-profile-info-item">
                      <span className="user-profile-label">
                        Created
                      </span>

                      <strong>
                        {formatDate(user.createdAt)}
                      </strong>
                    </div>

                    <div className="user-profile-info-item">
                      <span className="user-profile-label">
                        Last Updated
                      </span>

                      <strong>
                        {formatDate(user.updatedAt)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ========================================
                    ACCESS RIGHTS
                    ======================================== */}

                <div className="user-profile-section">
                  <div className="user-profile-section-heading">
                    <div>
                      <h4>Access Rights</h4>

                      <p>
                        Permissions currently assigned to this
                        user.
                      </p>
                    </div>

                    <Link
                      to={`/users/${user._id}/access-rights`}
                      className="user-profile-access-button"
                    >
                      Manage Access Rights
                    </Link>
                  </div>

                  {user.role === "SYSTEM_ADMIN" ? (
                    <div className="user-profile-admin-access">
                      <span className="user-profile-admin-icon">
                        ✓
                      </span>

                      <div>
                        <strong>
                          Full System Access
                        </strong>

                        <p>
                          System Admin has full system
                          authority and does not require
                          manually assigned permissions.
                        </p>
                      </div>
                    </div>
                  ) : user.permissions &&
                    Object.keys(user.permissions).length > 0 ? (
                    <div className="user-profile-permissions">
                      {Object.entries(user.permissions).map(
                        ([group, permissions]) => (
                          <div
                            className="user-profile-permission-group"
                            key={group}
                          >
                            <h5>
                              {formatRole(group)}
                            </h5>

                            <div className="user-profile-permission-list">
                              {Object.entries(
                                permissions || {},
                              ).map(
                                ([permission, allowed]) => (
                                  <span
                                    key={permission}
                                    className={`user-profile-permission ${
                                      allowed
                                        ? "user-profile-permission-allowed"
                                        : "user-profile-permission-denied"
                                    }`}
                                  >
                                    {allowed ? "✓" : "×"}{" "}
                                    {formatRole(permission)}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="user-profile-no-permissions">
                      <strong>
                        No permissions assigned
                      </strong>

                      <p>
                        This user currently does not have any
                        manually assigned access rights.
                      </p>
                    </div>
                  )}
                </div>

                {/* ========================================
                    ACTIONS
                    ======================================== */}

                <div className="user-profile-actions">
                  <Link
                    to="/users"
                    className="user-profile-secondary-button"
                  >
                    Back to Users
                  </Link>

                  <Link
                    to={`/users/${user._id}/access-rights`}
                    className="user-profile-primary-button"
                  >
                    Manage Access Rights
                  </Link>
                </div>
              </section>
            </>
          ) : (
            <div className="user-profile-empty-state">
              <div className="user-profile-empty-icon">
                ◯
              </div>

              <strong>User not found</strong>

              <p>
                The requested user could not be found.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default UserProfile;
