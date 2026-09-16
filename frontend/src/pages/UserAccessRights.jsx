import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AppNotification from "../components/AppNotification";
import api from "../services/api";
import "./UserAccessRights.css";

// ========================================
// PERMISSION CONFIGURATION
// ========================================

const permissionGroups = [
  {
    key: "dashboard",
    title: "Dashboard",
    icon: "📊",
    permissions: [
      {
        key: "view",
        label: "View Dashboard",
      },
    ],
  },

  {
    key: "users",
    title: "Users",
    icon: "👥",
    permissions: [
      {
        key: "view",
        label: "View Users",
      },
      {
        key: "add",
        label: "Add User",
      },
      {
        key: "update",
        label: "Update User",
      },
      {
        key: "changeStatus",
        label: "Activate / Deactivate User",
      },
    ],
  },

  {
    key: "assets",
    title: "Assets",
    icon: "📦",
    permissions: [
      {
        key: "view",
        label: "View Assets",
      },
      {
        key: "add",
        label: "Add Asset",
      },
      {
        key: "addExisting",
        label: "Add Existing Asset",
      },
      {
        key: "update",
        label: "Update Asset",
      },
    ],
  },

  {
    key: "assetRequests",
    title: "Asset Requests",
    icon: "📝",
    permissions: [
      {
        key: "view",
        label: "View Asset Requests",
      },
      {
        key: "create",
        label: "Create Asset Request",
      },
      {
        key: "approve",
        label: "Approve / Reject Asset Request",
      },
    ],
  },

  {
    key: "assetOperations",
    title: "Asset Operations",
    icon: "🔄",
    permissions: [
      {
        key: "assignment",
        label: "Asset Assignment",
      },
      {
        key: "transfer",
        label: "Asset Transfer",
      },
      {
        key: "return",
        label: "Asset Return",
      },
      {
        key: "disposal",
        label: "Asset Disposal",
      },
    ],
  },

  {
    key: "repairs",
    title: "Repairs",
    icon: "🔧",
    permissions: [
      {
        key: "view",
        label: "View Repair Requests and History",
      },
      {
        key: "create",
        label: "Create Repair Request",
      },
      {
        key: "approve",
        label: "Approve Repair Request",
      },
      {
        key: "reject",
        label: "Reject Repair Request",
      },
      {
        key: "update",
        label: "Update Repair Status",
      },
    ],
  },

  {
    key: "assetAuthorization",
    title: "Asset Authorization",
    icon: "🛡️",
    permissions: [
      {
        key: "view",
        label: "View Authorization Requests",
      },
      {
        key: "approve",
        label: "Approve / Reject Asset",
      },
    ],
  },

  {
    key: "verificationMapping",
    title: "Verification Mapping",
    icon: "✓",
    permissions: [
      {
        key: "view",
        label: "View Verification Requests",
      },
      {
        key: "submit",
        label: "Submit Verification",
      },
      {
        key: "approve",
        label: "Approve / Reject Mapping",
      },
      {
        key: "history",
        label: "View Verification History",
      },
    ],
  },

  {
    key: "outlets",
    title: "Outlets",
    icon: "🏪",
    permissions: [
      {
        key: "view",
        label: "View Outlets",
      },
      {
        key: "add",
        label: "Add Outlet",
      },
      {
        key: "update",
        label: "Update Outlet",
      },
    ],
  },

  {
    key: "checkIns",
    title: "Check-in",
    icon: "📋",
    permissions: [
      {
        key: "checkIn",
        label: "Check-Ins",
      },
      {
        key: "history",
        label: "View Check-in History",
      },
      {
        key: "allHistory",
        label: "View All Check-in History",
      },
    ],
  },

  {
    key: "regions",
    title: "Regions",
    icon: "🌍",
    permissions: [
      {
        key: "view",
        label: "View Regions",
      },
      {
        key: "add",
        label: "Add Region",
      },
      {
        key: "update",
        label: "Update Region",
      },
    ],
  },

  {
    key: "districts",
    title: "Districts",
    icon: "🏢",
    permissions: [
      {
        key: "view",
        label: "View Districts",
      },
      {
        key: "add",
        label: "Add District",
      },
      {
        key: "update",
        label: "Update District",
      },
    ],
  },

  {
    key: "distributors",
    title: "Distributors",
    icon: "🚚",
    permissions: [
      {
        key: "view",
        label: "View Distributors",
      },
      {
        key: "add",
        label: "Add Distributor",
      },
      {
        key: "update",
        label: "Update Distributor",
      },
    ],
  },

  {
    key: "manufacturers",
    title: "Manufacturers",
    icon: "🏭",
    permissions: [
      {
        key: "view",
        label: "View Manufacturers",
      },
      {
        key: "add",
        label: "Add Manufacturer",
      },
      {
        key: "update",
        label: "Update Manufacturer",
      },
      {
        key: "changeStatus",
        label: "Activate / Deactivate Manufacturer",
      },
    ],
  },
];

// ========================================
// CREATE INITIAL PERMISSION STATE
// ========================================

const createInitialPermissions = (defaultValue = false) => {
  const permissions = {};

  permissionGroups.forEach((group) => {
    permissions[group.key] = {};

    group.permissions.forEach((permission) => {
      permissions[group.key][permission.key] = defaultValue;
    });
  });

  return permissions;
};

const getProfileImageUrl = (profilePicture) => {
  if (!profilePicture) {
    return "";
  }

  if (profilePicture.startsWith("http")) {
    return profilePicture;
  }

  const baseUrl = api.defaults.baseURL?.replace("/api", "") || "";
  const normalizedPath = profilePicture.startsWith("/")
    ? profilePicture
    : `/${profilePicture}`;

  return `${baseUrl}${normalizedPath}`;
};

// ========================================
// MERGE DATABASE PERMISSIONS
// ========================================

const mergePermissions = (databasePermissions) => {
  const initialPermissions = createInitialPermissions();

  if (!databasePermissions) {
    return initialPermissions;
  }

  permissionGroups.forEach((group) => {
    group.permissions.forEach((permission) => {
      initialPermissions[group.key][permission.key] =
        databasePermissions[group.key]?.[permission.key] === true;
    });
  });

  return initialPermissions;
};

// ========================================
// USER ACCESS FRAME
// ========================================

const UserAccessFrame = ({
  sidebarOpen,
  onShowSidebar,
  onHideSidebar,
  children,
}) => (
  <div
    className={`user-access-layout ${
      sidebarOpen ? "user-access-sidebar-open" : "user-access-sidebar-closed"
    }`}
  >
    {sidebarOpen && <Sidebar onClose={onHideSidebar} />}

    <div className="user-access-content-shell">
      <Navbar />

      {!sidebarOpen && (
        <button
          type="button"
          className="user-access-sidebar-toggle"
          onClick={onShowSidebar}
          aria-label="Show sidebar"
        >
          ☰
        </button>
      )}

      {children}
    </div>
  </div>
);

// ========================================
// USER ACCESS RIGHTS COMPONENT
// ========================================

const UserAccessRights = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth > 1180,
  );

  const [user, setUser] = useState(null);

  const [permissions, setPermissions] = useState(createInitialPermissions());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // The sidebar is a wide-desktop layout element. Close it before the
  // remaining content area becomes narrow enough to collide with the panel.
  useEffect(() => {
    const closeSidebarOnSmallScreens = () => {
      if (window.innerWidth <= 1180) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", closeSidebarOnSmallScreens);
    closeSidebarOnSmallScreens();
    return () => window.removeEventListener("resize", closeSidebarOnSmallScreens);
  }, []);

  // Auto-dismiss messages after 4 seconds
  useEffect(() => {
    if (!error && !successMessage) return;

    const timer = setTimeout(() => {
      setError("");
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error, successMessage]);

  // ========================================
  // FETCH USER + PERMISSIONS
  // ========================================

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        setLoading(true);
        setError("");

        const permissionResponse = await api.get(
          `/users/${userId}/permissions`,
        );

        const fetchedUser = permissionResponse.data.user;

        setUser(fetchedUser);

        if (fetchedUser.role === "SYSTEM_ADMIN") {
          setPermissions(createInitialPermissions(true));
          return;
        }

        const savedPermissions = fetchedUser.permissions;

        setPermissions(mergePermissions(savedPermissions));
      } catch (error) {
        console.error("Fetch User Permissions Error:", error);

        setError(
          error.response?.data?.message || "Unable to load user access rights.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserPermissions();
    }
  }, [userId]);

  // ========================================
  // HANDLE INDIVIDUAL PERMISSION
  // ========================================

  const handlePermissionChange = (groupKey, permissionKey) => {
    setPermissions((previousPermissions) => ({
      ...previousPermissions,

      [groupKey]: {
        ...previousPermissions[groupKey],

        [permissionKey]: !previousPermissions[groupKey][permissionKey],
      },
    }));
  };

  // ========================================
  // SELECT / CLEAR ALL
  // ========================================

  const handleSelectAll = (group) => {
    const allSelected = group.permissions.every(
      (permission) => permissions[group.key][permission.key] === true,
    );

    const updatedGroupPermissions = {};

    group.permissions.forEach((permission) => {
      updatedGroupPermissions[permission.key] = !allSelected;
    });

    setPermissions((previousPermissions) => ({
      ...previousPermissions,

      [group.key]: updatedGroupPermissions,
    }));
  };

  // ========================================
  // SAVE ACCESS RIGHTS
  // ========================================

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      // ========================================
      // SYSTEM ADMIN PROTECTION
      // ========================================

      if (user?.role === "SYSTEM_ADMIN") {
        setError(
          "Access rights cannot be manually configured for the System Admin.",
        );

        return;
      }

      // ========================================
      // SEND PERMISSIONS TO BACKEND
      // ========================================

      const response = await api.patch(`/users/${userId}/permissions`, {
        permissions,
      });

      // ========================================
      // UPDATE LOCAL USER DATA
      // ========================================

      if (response.data.user) {
        setUser((previousUser) => ({
          ...previousUser,
          ...response.data.user,
        }));
      }

      // ========================================
      // SUCCESS MESSAGE
      // ========================================

      setSuccessMessage(
        response.data.message || "Access rights updated successfully.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Save Permissions Error:", error);

      setError(
        error.response?.data?.message || "Unable to update access rights.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <UserAccessFrame
        sidebarOpen={sidebarOpen}
        onShowSidebar={() => setSidebarOpen(true)}
        onHideSidebar={() => setSidebarOpen(false)}
      >
        <main className="user-access-page">
          <div className="user-access-loading">
            Loading user access rights...
          </div>
        </main>
      </UserAccessFrame>
    );
  }

  // ========================================
  // USER FETCH ERROR
  // ========================================

  if (error && !user) {
    return (
      <UserAccessFrame
        sidebarOpen={sidebarOpen}
        onShowSidebar={() => setSidebarOpen(true)}
        onHideSidebar={() => setSidebarOpen(false)}
      >
        <main className="user-access-page">
          <div className="user-access-container">
            <Link to="/users/access-rights" className="user-access-back-button">
              ← Back to User Access Rights
            </Link>

            <div className="user-access-error">{error}</div>
          </div>
        </main>
      </UserAccessFrame>
    );
  }

  // ========================================
  // SYSTEM ADMIN MESSAGE
  // ========================================

  const isSystemAdmin = user?.role === "SYSTEM_ADMIN";

  // ========================================
  // MAIN PAGE
  // ========================================

  return (
    <UserAccessFrame
      sidebarOpen={sidebarOpen}
      onShowSidebar={() => setSidebarOpen(true)}
      onHideSidebar={() => setSidebarOpen(false)}
    >
      <main className="user-access-page">
        <div className="user-access-container">
          {/* ========================================
              BACK BUTTON
          ======================================== */}

          <div className="user-access-topbar">
            <Link to="/users/access-rights" className="user-access-back-button">
              ← Back to User Access Rights
            </Link>
          </div>

          {/* ========================================
              PAGE HEADER
          ======================================== */}

          <div className="user-access-header">
            <div className="user-access-title-section">
              {user?.profilePicture ? (
                <img
                  src={getProfileImageUrl(user.profilePicture)}
                  alt={user?.name || "User"}
                  className="user-access-user-avatar"
                />
              ) : (
                <div className="user-access-title-icon">🛡️</div>
              )}

              <div>
                <h1>Configure Access Rights</h1>

                <p>
                  Set permissions for <strong>{user?.name}</strong>
                </p>
              </div>
            </div>

            <div className="user-access-user-info">
              <span className="user-access-role-label">Role</span>

              <span className="user-access-role-badge">{user?.role}</span>
            </div>
          </div>

          {/* ========================================
              SYSTEM ADMIN WARNING
          ======================================== */}

          {isSystemAdmin && (
            <div className="user-access-error">
              Access rights cannot be manually configured for the System Admin.
            </div>
          )}

          {/* ========================================
              GLOBAL NOTIFICATIONS
          ======================================== */}

          <AppNotification
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage("")}
          />

          {!isSystemAdmin && (
            <AppNotification
              type="error"
              message={user ? error : ""}
              onClose={() => setError("")}
            />
          )}

          {/* ========================================
              PERMISSION CARDS
          ======================================== */}

          <div className="user-access-grid">
            {permissionGroups.map((group) => {
              const allSelected = group.permissions.every(
                (permission) => permissions[group.key][permission.key],
              );

              return (
                <div className="permission-card" key={group.key}>
                  {/* Card Header */}

                  <div className="permission-card-header">
                    <div className="permission-card-title">
                      <div className="permission-card-icon">{group.icon}</div>

                      <h2>{group.title}</h2>
                    </div>

                    <button
                      type="button"
                      className="permission-select-all"
                      onClick={() => handleSelectAll(group)}
                      disabled={isSystemAdmin}
                    >
                      {allSelected ? "Clear All" : "Select All"}
                    </button>
                  </div>

                  {/* Permission List */}

                  <div className="permission-list">
                    {group.permissions.map((permission) => (
                      <label className="permission-item" key={permission.key}>
                        <input
                          type="checkbox"
                          checked={permissions[group.key][permission.key]}
                          onChange={() =>
                            handlePermissionChange(group.key, permission.key)
                          }
                          disabled={isSystemAdmin}
                        />

                        <span className="permission-checkbox">✓</span>

                        <span className="permission-label">
                          {permission.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================
              ACTION BUTTONS
          ======================================== */}

          <div className="user-access-actions">
            <button
              type="button"
              className="user-access-cancel-button"
              onClick={() => navigate("/users/access-rights")}
            >
              Cancel
            </button>

            <button
              type="button"
              className="user-access-save-button"
              onClick={handleSavePermissions}
              disabled={saving || isSystemAdmin}
            >
              {saving ? "Saving..." : "Save Access Rights"}
            </button>
          </div>
        </div>
      </main>
    </UserAccessFrame>
  );
};

export default UserAccessRights;
