import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./AddUser.css";

function AddUser() {
  const navigate = useNavigate();

  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // FORM
  // ========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [regionId, setRegionId] = useState("");
  const [assignedAso, setAssignedAso] = useState("");
  const [assignedTso, setAssignedTso] = useState("");
  const [asos, setAsos] = useState([]);
  const [tsos, setTsos] = useState([]);
  const [regions, setRegions] = useState([]);

  // ========================================
  // PASSWORD VISIBILITY
  // ========================================

  const [showPassword, setShowPassword] = useState(false);

  // ========================================
  // UI STATE
  // ========================================

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const messageRef = useRef(null);

  // ========================================
  // ROLES
  // ========================================

  const roles = ["TSO", "ASO", "TSM", "TECHNICIAN"];

  useEffect(() => {
    const loadAsos = async () => {
      try {
        const response = await api.get("/users");
        const activeUsers = (response.data.users || []).filter(
          (user) => user.status === "ACTIVE",
        );
        setAsos(activeUsers.filter((user) => user.role === "ASO"));
        setTsos(activeUsers.filter((user) => user.role === "TSO"));

        const regionResponse = await api.get("/regions");
        setRegions(
          (regionResponse.data.regions || []).filter(
            (region) => region.status !== "INACTIVE",
          ),
        );
      } catch (loadError) {
        console.error(
          "Load ASOs Error:",
          loadError.response?.data || loadError.message,
        );
      }
    };

    loadAsos();
  }, []);

  // ========================================
  // ROLE DISPLAY
  // ========================================

  const formatRole = (userRole) => {
    return userRole
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim() || !role) {
      setError("Name, email, password and role are required.");
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

    if (role === "TSO") {
      setAssignedAso("");
      setAssignedTso("");
    }

    try {
      setSubmitting(true);

      const response = await api.post("/users", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        regionId: role === "TSM" ? regionId : null,
        assignedAso: ["ASO", "TSO"].includes(role) ? null : null,
        assignedTso: ["ASO", "TECHNICIAN"].includes(role) ? assignedTso : null,
      });

      setSuccess(response.data.message || "User created successfully.");

      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setRegionId("");
      setAssignedAso("");
      setAssignedTso("");

      // Reset password visibility after successful creation
      setShowPassword(false);

      setTimeout(() => {
        navigate("/users");
      }, 1200);
    } catch (error) {
      console.error(
        "Create User Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to create user.");

      setTimeout(() => {
        messageRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`add-user-layout ${
        sidebarOpen ? "add-user-sidebar-open" : "add-user-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="add-user-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="add-user-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        )}

        <main className="add-user-content">
          {/* ========================================
              BACK TO DASHBOARD
              ======================================== */}

          <Link to="/dashboard" className="add-user-back-dashboard">
            ← Back to Dashboard
          </Link>

          {/* ========================================
              HEADER
              ======================================== */}

          <section className="add-user-header">
            <div className="add-user-header-content">
              <p className="add-user-eyebrow">USER MANAGEMENT</p>

              <h2>Add New User</h2>

              <p>
                Create a new system user and assign the appropriate system role.
              </p>
            </div>

            {/* ========================================
                VIEW USERS BUTTON
                ======================================== */}

            <Link to="/users" className="add-user-view-users">
              <span>◯</span>
              View Users
            </Link>
          </section>

          {/* ========================================
              MESSAGES
              ======================================== */}

          <div ref={messageRef} className="add-user-message-container">
            {error && (
              <div className="add-user-message add-user-error">
                <span>!</span>

                <div>
                  <strong>Error</strong>

                  <p>{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="add-user-message add-user-success">
                <span>✓</span>

                <div>
                  <strong>Success</strong>

                  <p>{success}</p>
                </div>
              </div>
            )}
          </div>

          {/* ========================================
              INFORMATION
              ======================================== */}

          <section className="add-user-info-card">
            <div className="add-user-info-icon">✓</div>

            <div>
              <strong>System Admin User Creation</strong>

              <p>
                Only the System Admin can create new users. A System Admin
                account cannot be created from this page.
              </p>
            </div>
          </section>

          {/* ========================================
              FORM CARD
              ======================================== */}

          <section className="add-user-card">
            <div className="add-user-card-header">
              <div>
                <h3>User Information</h3>

                <p>Enter the new user's account information below.</p>
              </div>

              <span>* Required</span>
            </div>

            <form className="add-user-form" onSubmit={handleSubmit}>
              {/* ========================================
                  NAME
                  ======================================== */}

              <div className="add-user-field">
                <label htmlFor="name">
                  Full Name <span>*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  disabled={submitting}
                  required
                />
              </div>

              {/* ========================================
                  EMAIL
                  ======================================== */}

              <div className="add-user-field">
                <label htmlFor="email">
                  Email Address <span>*</span>
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  disabled={submitting}
                  required
                />
              </div>

              {/* ========================================
                  PASSWORD
                  ======================================== */}

              <div className="add-user-field">
                <label htmlFor="password">
                  Password <span>*</span>
                </label>

                <div className="add-user-password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter temporary password"
                    disabled={submitting}
                    required
                  />

                  <button
                    type="button"
                    className="add-user-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={submitting}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <small>
                  The password will be securely hashed before being stored.
                </small>
              </div>

              {/* ========================================
                  ROLE
                  ======================================== */}

              <div className="add-user-field">
                <label htmlFor="role">
                  User Role <span>*</span>
                </label>

                <select
                  id="role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setRegionId("");
                    setAssignedAso("");
                    setAssignedTso("");
                  }}
                  disabled={submitting}
                  required
                >
                  <option value="">Select User Role</option>

                  {roles.map((item) => (
                    <option key={item} value={item}>
                      {formatRole(item)}
                    </option>
                  ))}
                </select>

                <small>System Admin cannot be assigned from this page.</small>
              </div>

              {role === "TSM" && (
                <div className="add-user-field">
                  <label htmlFor="region">
                    Region <span>*</span>
                  </label>

                  <select
                    id="region"
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    disabled={submitting}
                    required
                  >
                    <option value="">Select Region</option>

                    {regions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name} ({region.code})
                      </option>
                    ))}
                  </select>

                  {regions.length === 0 && (
                    <small>No active regions are currently available.</small>
                  )}
                </div>
              )}

              {["ASO", "TECHNICIAN"].includes(role) && (
                <div className="add-user-field">
                  <label htmlFor="assignedTso">
                    Assigned TSO <span>*</span>
                  </label>

                  <select
                    id="assignedTso"
                    value={assignedTso}
                    onChange={(e) => setAssignedTso(e.target.value)}
                    disabled={submitting}
                    required
                  >
                    <option value="">Select TSO</option>
                    {tsos.map((tso) => (
                      <option key={tso._id} value={tso._id}>
                        {tso.name} ({tso.email})
                      </option>
                    ))}
                  </select>

                  <small>
                    {role === "ASO"
                      ? "This ASO will report to the selected TSO."
                      : "This team member will report to the selected TSO."}
                  </small>
                </div>
              )}

              {role && !["ASO", "TSO", "TSM", "TECHNICIAN"].includes(role) && (
                <div className="add-user-field">
                  <label htmlFor="assignedAso">
                    Assigned ASO <span>*</span>
                  </label>

                  <select
                    id="assignedAso"
                    value={assignedAso}
                    onChange={(e) => setAssignedAso(e.target.value)}
                    disabled={submitting}
                    required
                  >
                    <option value="">Select ASO</option>
                    {asos.map((aso) => (
                      <option key={aso._id} value={aso._id}>
                        {aso.name} ({aso.email})
                      </option>
                    ))}
                  </select>

                  <small>
                    Requests from this user will be sent to the selected ASO.
                  </small>
                </div>
              )}

              {/* ========================================
                  ROLE INFORMATION
                  ======================================== */}

              <div className="add-user-role-card">
                <strong>Available System Roles</strong>

                <div className="add-user-role-grid">
                  {roles.map((item) => (
                    <div key={item}>
                      <span>✓</span>

                      <p>{formatRole(item)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ========================================
                  ACTIONS
                  ======================================== */}

              <div className="add-user-actions">
                <Link to="/users" className="add-user-cancel">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="add-user-submit"
                  disabled={submitting}
                >
                  {submitting ? "Creating User..." : "Create User"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AddUser;
