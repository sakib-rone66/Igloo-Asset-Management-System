import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./Users.css";

function Users() {
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = String(currentUser?._id || currentUser?.id || "");
  const accessRightsMode =
    location.pathname === "/users/access-rights" ||
    new URLSearchParams(location.search).get("view") === "access-rights";

  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [users, setUsers] = useState([]);
  const [regions, setRegions] = useState([]);

  // ========================================
  // EDIT FORM
  // ========================================

  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [regionId, setRegionId] = useState("");
  const [assignedAso, setAssignedAso] = useState("");
  const [assignedTso, setAssignedTso] = useState("");
  const [password, setPassword] = useState("");

  const [showEditPassword, setShowEditPassword] = useState(false);

  // ========================================
  // FILTER
  // ========================================

  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedTeams, setCollapsedTeams] = useState({});

  // ========================================
  // UI STATE
  // ========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const messageRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    setCollapsedTeams({});
  }, [filterRole, filterStatus, searchTerm]);

  // ========================================
  // AVAILABLE ROLES
  // ========================================

  const roles = ["TSO", "ASO", "TSM", "TECHNICIAN"];

  // ========================================
  // FETCH USERS
  // ========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const [response, regionResponse] = await Promise.all([
        api.get("/users"),
        api.get("/regions"),
      ]);

      setUsers(response.data.users || []);
      setRegions(
        (regionResponse.data.regions || []).filter(
          (region) => region.status !== "INACTIVE",
        ),
      );
    } catch (error) {
      console.error("Get Users Error:", error.response?.data || error.message);

      setError(error.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ========================================
  // MESSAGE SCROLL
  // ========================================

  useEffect(() => {
    if (error || success) {
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error, success]);

  // Auto-dismiss messages after 4 seconds
  useEffect(() => {
    if (!error && !success) return;

    const timer = setTimeout(() => {
      clearMessages();
    }, 4000);

    return () => clearTimeout(timer);
  }, [error, success]);

  // ========================================
  // CLEAR MESSAGES
  // ========================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ========================================
  // EDIT USER
  // ========================================

  const handleEdit = (user) => {
    clearMessages();

    setEditingId(user._id);
    setName(user.name || "");
    setEmail(user.email || "");
    setRole(user.role || "");
    setRegionId(user.region?._id || user.region || "");
    setAssignedAso(user.assignedAso?._id || user.assignedAso || "");
    setAssignedTso(user.assignedTso?._id || user.assignedTso || "");
    setPassword("");
    setShowEditPassword(false);

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  // ========================================
  // CANCEL EDIT
  // ========================================

  const handleCancelEdit = () => {
    setEditingId(null);

    setName("");
    setEmail("");
    setRole("");
    setRegionId("");
    setAssignedAso("");
    setAssignedTso("");
    setPassword("");

    setShowEditPassword(false);

    clearMessages();
  };

  // ========================================
  // UPDATE USER
  // ========================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!name.trim() || !email.trim() || !role) {
      setError("Name, email and role are required.");
      return;
    }

    if (["ASO", "TECHNICIAN"].includes(role) && !assignedTso) {
      setError("Please assign this user to a TSO.");
      return;
    }

    if (role === "TSM" && !regionId) {
      setError("Please select a region for this TSM.");
      return;
    }

    if (
      role !== "TSO" &&
      !["ASO", "TSM", "TECHNICIAN"].includes(role) &&
      !assignedAso
    ) {
      setError("Please assign this user to an ASO.");
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        name: name.trim(),
        email: email.trim(),
        role,
        regionId: role === "TSM" ? regionId : null,
        assignedAso: ["ASO", "TSO"].includes(role) ? null : assignedAso,
        assignedTso: ["ASO", "TECHNICIAN"].includes(role) ? assignedTso : null,
      };

      if (password.trim()) {
        updateData.password = password.trim();
      }

      const response = await api.patch(`/users/${editingId}`, updateData);

      setSuccess(response.data.message || "User updated successfully.");

      setEditingId(null);
      setName("");
      setEmail("");
      setRole("");
      setRegionId("");
      setAssignedAso("");
      setAssignedTso("");
      setPassword("");
      setShowEditPassword(false);

      await fetchUsers();
    } catch (error) {
      console.error(
        "Update User Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatusChange = async (user) => {
    clearMessages();

    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await api.patch(`/users/${user._id}/status`, {
        status: newStatus,
      });

      setSuccess(response.data.message || "User status updated successfully.");

      await fetchUsers();
    } catch (error) {
      console.error(
        "Update User Status Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to update user status.",
      );
    }
  };

  const canChangeUserStatus = (user) => {
    if (currentUser?.role === "TSM") {
      return ["TSO", "ASO", "TECHNICIAN"].includes(user.role);
    }

    if (currentUser?.role === "TSO") {
      return (
        ["ASO", "TECHNICIAN"].includes(user.role) &&
        String(user.assignedTso?._id || user.assignedTso || "") ===
          currentUserId
      );
    }

    return true;
  };

  // ========================================
  // FILTER USERS
  // ========================================

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchesFilters = (user) => {
    const searchMatch =
      !normalizedSearch ||
      user.name?.toLowerCase().includes(normalizedSearch) ||
      user.email?.toLowerCase().includes(normalizedSearch);
    const roleMatch = !filterRole || user.role === filterRole;

    const statusMatch = !filterStatus || user.status === filterStatus;

    return searchMatch && roleMatch && statusMatch;
  };

  const filteredUsers = users.filter(matchesFilters);

  const asoById = new Map(
    users.filter((user) => user.role === "ASO").map((user) => [user._id, user]),
  );

  const getTsoName = (user) => {
    if (user.role === "TSO") return user.name;
    if (user.role === "TSM") return "Unassigned";
    if (user.role === "ASO") return user.assignedTso?.name || "Unassigned";

    const assignedAsoUser = user.assignedAso?._id
      ? asoById.get(user.assignedAso._id)
      : null;

    return (
      user.assignedTso?.name ||
      assignedAsoUser?.assignedTso?.name ||
      "Unassigned"
    );
  };

  const getTeamKey = (user) =>
    user.role === "TSO"
      ? user._id
      : user.role === "ASO"
        ? user.assignedTso?._id || getTsoName(user)
        : user.assignedTso?._id ||
          asoById.get(user.assignedAso?._id)?.assignedTso?._id ||
          getTsoName(user);

  const matchedTsos = filteredUsers.filter((user) => user.role === "TSO");
  const tsoSearchMatches = users.filter((user) => {
    if (user.role !== "TSO") return false;

    const nameOrEmailMatches =
      !normalizedSearch ||
      user.name?.toLowerCase().includes(normalizedSearch) ||
      user.email?.toLowerCase().includes(normalizedSearch);

    return (
      nameOrEmailMatches && (!filterStatus || user.status === filterStatus)
    );
  });
  const tsoFilterMode =
    filterRole === "TSO" ||
    (normalizedSearch &&
      tsoSearchMatches.length > 0 &&
      filteredUsers.every((user) => user.role === "TSO"));
  const matchedTsoKeys = new Set(matchedTsos.map(getTeamKey));
  const displayedUsers = tsoFilterMode
    ? [
        ...matchedTsos,
        ...users.filter(
          (user) => user.role !== "TSO" && matchedTsoKeys.has(getTeamKey(user)),
        ),
      ]
    : filteredUsers;

  const sortedUsers = [...displayedUsers].sort((firstUser, secondUser) => {
    if (firstUser.role === "SYSTEM_ADMIN") return -1;
    if (secondUser.role === "SYSTEM_ADMIN") return 1;

    if (firstUser.role === "TSM" && secondUser.role !== "TSM") return -1;
    if (secondUser.role === "TSM" && firstUser.role !== "TSM") return 1;

    if (firstUser.role === "TSM" && secondUser.role === "TSM") {
      return firstUser.name.localeCompare(secondUser.name, undefined, {
        sensitivity: "base",
      });
    }

    const teamOrder = getTsoName(firstUser).localeCompare(
      getTsoName(secondUser),
    );

    if (teamOrder !== 0) return teamOrder;

    if (firstUser.role === "TSO") return -1;
    if (secondUser.role === "TSO") return 1;

    const memberRoleOrder = {
      ASO: 0,
      TSM: 1,
      TECHNICIAN: 2,
    };
    const roleOrder =
      (memberRoleOrder[firstUser.role] ?? Number.MAX_SAFE_INTEGER) -
      (memberRoleOrder[secondUser.role] ?? Number.MAX_SAFE_INTEGER);

    if (roleOrder !== 0) return roleOrder;

    return firstUser.name.localeCompare(secondUser.name, undefined, {
      sensitivity: "base",
    });
  });

  const teamColorIndexes = new Map();
  let nextTeamColorIndex = 0;

  sortedUsers.forEach((user) => {
    if (user.role === "SYSTEM_ADMIN") return;

    const teamName = getTsoName(user);

    if (!teamColorIndexes.has(teamName)) {
      teamColorIndexes.set(teamName, nextTeamColorIndex % 4);
      nextTeamColorIndex += 1;
    }
  });

  const tsoCount = filteredUsers.filter((user) => user.role === "TSO").length;
  const assignedMemberCount = filteredUsers.filter(
    (user) =>
      user.role !== "TSO" &&
      user.role !== "SYSTEM_ADMIN" &&
      getTsoName(user) !== "Unassigned",
  ).length;
  const unassignedMemberCount = filteredUsers.filter(
    (user) =>
      user.role !== "TSO" &&
      user.role !== "SYSTEM_ADMIN" &&
      getTsoName(user) === "Unassigned",
  ).length;

  const visibleUsers = sortedUsers.filter((user) => {
    if (!tsoFilterMode) return true;
    if (user.role === "TSO") return true;

    return collapsedTeams[getTeamKey(user)] === false;
  });

  const getTsmRowClass = (user, userIndex) => {
    if (user.role !== "TSM") return "";

    const tsmRowIndex = visibleUsers
      .slice(0, userIndex)
      .filter((visibleUser) => visibleUser.role === "TSM").length;

    return tsmRowIndex % 2 === 0
      ? " users-tsm-row-violet"
      : " users-tsm-row-light";
  };

  const toggleTeam = (teamKey) => {
    setCollapsedTeams((current) => ({
      ...current,
      [teamKey]: current[teamKey] === false,
    }));
  };

  // ========================================
  // ROLE DISPLAY
  // ========================================

  const formatRole = (userRole) => {
    if (!userRole) return "N/A";

    return userRole
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`users-layout ${
        sidebarOpen ? "users-sidebar-open" : "users-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="users-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="users-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="users-content">
          {/* ========================================
              BACK TO DASHBOARD
              ======================================== */}

          <Link to="/dashboard" className="users-back-dashboard">
            ← Back to Dashboard
          </Link>

          {/* ========================================
              HEADER
              ======================================== */}

          <section className="users-header">
            <p className="users-eyebrow">USER MANAGEMENT</p>

            <div className="users-title-row">
              <div>
                <h2>
                  {accessRightsMode ? "User Access Rights" : "User Management"}
                </h2>

                <p>
                  {accessRightsMode
                    ? "Select a user to manage their system access rights."
                    : "Create, edit and manage system users and their access roles."}
                </p>
              </div>

              {!accessRightsMode && (
                <Link to="/users/add" className="users-add-button">
                  + Add User
                </Link>
              )}
            </div>
          </section>

          {/* ========================================
              MESSAGES
              ======================================== */}

          {(error || success) && (
            <div
              ref={messageRef}
              className={`users-message ${
                error ? "users-error" : "users-success"
              }`}
              role={error ? "alert" : "status"}
            >
              <div className="add-asset-message-icon">{error ? "!" : "✓"}</div>

              <div className="add-asset-message-content">
                <strong>{error ? "Error" : "Success"}</strong>
                <span>{error || success}</span>
              </div>

              <button
                type="button"
                className="app-notification-close"
                onClick={clearMessages}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* ========================================
              EDIT USER
              ======================================== */}

          {editingId && (
            <section ref={formRef} className="users-edit-card">
              <div className="users-card-header">
                <div>
                  <h3>Edit User</h3>

                  <p>Update the selected user's information.</p>
                </div>

                <span className="users-required">* Required</span>
              </div>

              <form className="users-edit-form" onSubmit={handleUpdate}>
                <div className="users-field">
                  <label htmlFor="user-name">
                    Name <span>*</span>
                  </label>

                  <input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter user name"
                    disabled={saving}
                  />
                </div>

                <div className="users-field">
                  <label htmlFor="user-email">
                    Email <span>*</span>
                  </label>

                  <input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    disabled={saving}
                  />
                </div>

                <div className="users-field">
                  <label htmlFor="user-role">
                    Role <span>*</span>
                  </label>

                  <select
                    id="user-role"
                    value={role}
                    onChange={(e) => {
                      const selectedRole = e.target.value;

                      setRole(selectedRole);

                      if (selectedRole !== "TSM") {
                        setRegionId("");
                      }

                      setAssignedAso("");
                      setAssignedTso("");
                    }}
                    disabled={saving}
                  >
                    <option value="">Select Role</option>

                    {roles.map((item) => (
                      <option key={item} value={item}>
                        {formatRole(item)}
                      </option>
                    ))}
                  </select>
                </div>

                {role === "TSM" && (
                  <div className="users-field">
                    <label htmlFor="user-region">
                      Region <span>*</span>
                    </label>

                    <select
                      id="user-region"
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value)}
                      disabled={saving}
                    >
                      <option value="">Select Region</option>

                      {regions.map((region) => (
                        <option key={region._id} value={region._id}>
                          {region.name} ({region.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {role && ["ASO", "TECHNICIAN"].includes(role) && (
                  <div className="users-field">
                    <label htmlFor="user-assigned-tso">
                      Assigned TSO <span>*</span>
                    </label>

                    <select
                      id="user-assigned-tso"
                      value={assignedTso}
                      onChange={(e) => setAssignedTso(e.target.value)}
                      disabled={saving}
                    >
                      <option value="">Select TSO</option>
                      {users
                        .filter(
                          (user) =>
                            user.role === "TSO" && user.status === "ACTIVE",
                        )
                        .map((tso) => (
                          <option key={tso._id} value={tso._id}>
                            {tso.name} ({tso.email})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {role &&
                  !["ASO", "TSO", "TSM", "TECHNICIAN"].includes(role) && (
                    <div className="users-field">
                      <label htmlFor="user-assigned-aso">
                        Assigned ASO <span>*</span>
                      </label>

                      <select
                        id="user-assigned-aso"
                        value={assignedAso}
                        onChange={(e) => setAssignedAso(e.target.value)}
                        disabled={saving}
                      >
                        <option value="">Select ASO</option>
                        {users
                          .filter(
                            (user) =>
                              user.role === "ASO" && user.status === "ACTIVE",
                          )
                          .map((aso) => (
                            <option key={aso._id} value={aso._id}>
                              {aso.name} ({aso.email})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                {/* PASSWORD */}

                <div className="users-field">
                  <label htmlFor="user-password">New Password</label>

                  <div className="users-password-wrapper">
                    <input
                      id="user-password"
                      type={showEditPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      disabled={saving}
                    />

                    <button
                      type="button"
                      className="users-password-toggle"
                      onClick={() => setShowEditPassword((current) => !current)}
                      disabled={saving}
                    >
                      {showEditPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="users-edit-actions">
                  <button
                    type="button"
                    className="users-cancel-button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="users-save-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Update User"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ========================================
              FILTER
              ======================================== */}

          {!accessRightsMode && (
            <section className="users-filter-card">
              <div className="users-filter-header">
                <div>
                  <h3>Filter Users</h3>

                  <p>Filter users by role or account status.</p>
                </div>
              </div>

              <div className="users-filter-form">
                <div className="users-field users-search-field">
                  <label htmlFor="filter-search">Search</label>

                  <input
                    id="filter-search"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email"
                  />
                </div>

                <div className="users-field">
                  <label htmlFor="filter-role">Role</label>

                  <select
                    id="filter-role"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="">All Roles</option>

                    {roles.map((item) => (
                      <option key={item} value={item}>
                        {formatRole(item)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="users-field">
                  <label htmlFor="filter-status">Status</label>

                  <select
                    id="filter-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>

                    <option value="ACTIVE">Active</option>

                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="users-clear-filter"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterRole("");
                    setFilterStatus("");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </section>
          )}

          {/* ========================================
              USER LIST
              ======================================== */}

          <section className="users-list-section">
            {!accessRightsMode && !loading && users.length > 0 && (
              <div className="users-overview" aria-label="User team overview">
                <div className="users-overview-intro">
                  <strong>Who reports to whom</strong>
                  <span>
                    Every TSO and team member should belong to a TSO team.
                  </span>
                </div>

                <div className="users-overview-stat users-overview-aso">
                  <span className="users-overview-icon">TSO</span>
                  <span>
                    <strong>{tsoCount}</strong>
                    <small>TSO teams</small>
                  </span>
                </div>

                <div className="users-overview-stat users-overview-assigned">
                  <span className="users-overview-icon">✓</span>
                  <span>
                    <strong>{assignedMemberCount}</strong>
                    <small>Assigned members</small>
                  </span>
                </div>
              </div>
            )}

            <div className="users-list-heading">
              <div>
                <h3>All Users</h3>

                <p>
                  Showing <strong>{filteredUsers.length}</strong> of{" "}
                  <strong>{users.length}</strong> users
                </p>
              </div>

              {!accessRightsMode && (
                <div className="users-table-legend">
                  <span>
                    <i className="users-legend-owner" /> TSO owner
                  </span>
                  <span>
                    <i className="users-legend-member" /> Team member
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="users-empty-state">
                <div className="users-loading-spinner" />

                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="users-empty-state">
                <div className="users-empty-icon">◯</div>

                <strong>No users found</strong>

                <p>No users match the selected filters.</p>
              </div>
            ) : (
              <div className="users-table-card">
                <table
                  className={`users-table ${
                    tsoFilterMode ? "users-team-filtered" : ""
                  }`}
                >
                  <thead>
                    <tr>
                      <th className="users-name-header">Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th className="users-aso-team-header">TSO Team</th>
                      <th>Status</th>
                      {!accessRightsMode && <th>Created</th>}
                      {!accessRightsMode && <th>Actions</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {visibleUsers.map((user, userIndex) => (
                      <tr
                        key={user._id}
                        className={`${
                          user.role === "TSO"
                            ? "users-aso-row"
                            : "users-member-row"
                        } users-team-color-${teamColorIndexes.get(getTsoName(user))}${
                          user.role === "TSO" &&
                          user.name?.trim().toLowerCase() === "rahim"
                            ? " users-aso-rahim"
                            : ""
                        }${
                          user.role === "SYSTEM_ADMIN"
                            ? " users-system-admin-row"
                            : ""
                        }${
                          ["TSO", "TECHNICIAN"].includes(user.role)
                            ? " users-operational-role-row"
                            : ""
                        }${user.role === "TSM" ? ` users-tsm-row${getTsmRowClass(user, userIndex)}` : ""}
                        }${user.status !== "ACTIVE" ? " users-inactive-row" : ""}`}
                      >
                        {/* USER NAME */}

                        <td className="users-name-cell">
                          <div
                            className={`users-name-content ${
                              tsoFilterMode && user.role === "TSO"
                                ? "users-aso-name-content"
                                : ""
                            }`}
                          >
                            {tsoFilterMode && user.role === "TSO" && (
                              <button
                                type="button"
                                className={`users-team-toggle users-team-toggle-color-${teamColorIndexes.get(
                                  getTsoName(user),
                                )} ${
                                  collapsedTeams[getTeamKey(user)] !== false
                                    ? "users-team-toggle-collapsed"
                                    : ""
                                }`}
                                onClick={() => toggleTeam(getTeamKey(user))}
                                aria-label={`${
                                  collapsedTeams[getTeamKey(user)] === false
                                    ? "Collapse"
                                    : "Expand"
                                } ${user.name} team`}
                                title={`${
                                  collapsedTeams[getTeamKey(user)] === false
                                    ? "Collapse"
                                    : "Expand"
                                } team`}
                              >
                                <span aria-hidden="true" />
                              </button>
                            )}

                            <Link
                              to={
                                accessRightsMode
                                  ? `/users/${user._id}/access-rights`
                                  : `/users/${user._id}`
                              }
                              className="users-name-link"
                            >
                              {user.name}
                            </Link>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td className="users-email-cell">{user.email}</td>

                        {/* ROLE */}

                        <td>
                          <span
                            className={`users-role-badge users-role-${
                              user.role?.toLowerCase().replaceAll("_", "-") ||
                              "unknown"
                            }`}
                          >
                            {formatRole(user.role)}
                          </span>
                        </td>

                        {/* TSO TEAM */}

                        <td className="users-aso-cell">
                          {user.role === "TSO" ? (
                            <div className="users-team-owner">
                              <span className="users-team-mark">TSO</span>
                              <span>
                                <strong>{user.name}</strong>
                                <small>Team owner</small>
                              </span>
                            </div>
                          ) : user.role === "SYSTEM_ADMIN" ? (
                            <div className="users-admin-access">
                              <span
                                className="users-admin-star"
                                aria-hidden="true"
                              >
                                ★
                              </span>
                              <span>
                                <strong>All Access Control</strong>
                                <small>Full system access</small>
                              </span>
                            </div>
                          ) : user.role === "TSM" ? (
                            <div className="users-region-access">
                              <span
                                className="users-tsm-access-icon"
                                aria-hidden="true"
                              >
                                ✦
                              </span>
                              <span>
                                <strong>
                                  {user.region?.name || "Region"} Region
                                </strong>
                                <small>Regional access head</small>
                              </span>
                            </div>
                          ) : ["ASO", "TECHNICIAN"].includes(user.role) ||
                            user.assignedAso ||
                            user.assignedTso ? (
                            <div className="users-team-member">
                              <span
                                className="users-team-branch"
                                aria-hidden="true"
                              />
                              <span>
                                <strong>{getTsoName(user)}</strong>
                                <small>Reports to TSO</small>
                              </span>
                            </div>
                          ) : (
                            <span className="users-unassigned">
                              Not Assigned
                            </span>
                          )}
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`users-status ${
                              user.status === "ACTIVE"
                                ? "users-status-active"
                                : "users-status-inactive"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        {!accessRightsMode && (
                          <td className="users-date-cell">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "en-GB",
                                )
                              : "N/A"}
                          </td>
                        )}

                        {!accessRightsMode && (
                          <td className="users-actions-cell">
                            <button
                              type="button"
                              className="users-action-button users-edit-action"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </button>

                            {canChangeUserStatus(user) ? (
                              <button
                                type="button"
                                className={`users-action-button ${
                                  user.status === "ACTIVE"
                                    ? "users-deactivate-action"
                                    : "users-activate-action"
                                }`}
                                onClick={() => handleStatusChange(user)}
                              >
                                {user.status === "ACTIVE"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            ) : null}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Users;
