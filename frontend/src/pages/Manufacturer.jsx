import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./Manufacturer.css";

function Manufacturer() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [manufacturers, setManufacturers] = useState([]);

  // ========================================
  // CREATE / EDIT FORM
  // ========================================

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");

  // ========================================
  // FILTER
  // ========================================

  const [filterStatus, setFilterStatus] = useState("");

  // ========================================
  // UI STATE
  // ========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const messageRef = useRef(null);
  const formRef = useRef(null);

  // ========================================
  // FETCH MANUFACTURERS
  // ========================================

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/manufacturers");

      setManufacturers(response.data.manufacturers || []);
    } catch (error) {
      console.error(
        "Get Manufacturers Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load manufacturers.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchManufacturers();
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
  // CREATE MANUFACTURER
  // ========================================

  const handleCreate = async (event) => {
    event.preventDefault();

    clearMessages();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Manufacturer name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/manufacturers", {
        name: trimmedName,
      });

      setSuccess(
        response.data.message ||
          "Manufacturer created successfully.",
      );

      setName("");

      await fetchManufacturers();
    } catch (error) {
      console.error(
        "Create Manufacturer Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to create manufacturer.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // START EDIT
  // ========================================

  const handleEdit = (manufacturer) => {
    clearMessages();

    setEditingId(manufacturer._id);
    setName(manufacturer.name || "");

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

    clearMessages();
  };

  // ========================================
  // UPDATE MANUFACTURER
  // ========================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    clearMessages();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Manufacturer name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch(
        `/manufacturers/${editingId}`,
        {
          name: trimmedName,
        },
      );

      setSuccess(
        response.data.message ||
          "Manufacturer updated successfully.",
      );

      setEditingId(null);
      setName("");

      await fetchManufacturers();
    } catch (error) {
      console.error(
        "Update Manufacturer Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to update manufacturer.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatusChange = async (manufacturer) => {
    clearMessages();

    const newStatus =
      manufacturer.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    try {
      const response = await api.patch(
        `/manufacturers/${manufacturer._id}/status`,
        {
          status: newStatus,
        },
      );

      setSuccess(
        response.data.message ||
          "Manufacturer status updated successfully.",
      );

      await fetchManufacturers();
    } catch (error) {
      console.error(
        "Update Manufacturer Status Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to update manufacturer status.",
      );
    }
  };

  // ========================================
  // FILTER MANUFACTURERS
  // ========================================

  const filteredManufacturers = manufacturers.filter(
    (manufacturer) => {
      return (
        !filterStatus ||
        manufacturer.status === filterStatus
      );
    },
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`manufacturer-layout ${
        sidebarOpen
          ? "manufacturer-sidebar-open"
          : "manufacturer-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && (
        <Sidebar
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="manufacturer-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="manufacturer-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="manufacturer-content">
          {/* ========================================
              BACK TO DASHBOARD
              ======================================== */}

          <Link
            to="/dashboard"
            className="manufacturer-back-dashboard"
          >
            ← Back to Dashboard
          </Link>

          {/* ========================================
              HEADER
              ======================================== */}

          <section className="manufacturer-header">
            <p className="manufacturer-eyebrow">
              ASSET MANAGEMENT
            </p>

            <div className="manufacturer-title-row">
              <div>
                <h2>Manufacturer Management</h2>

                <p>
                  Create, edit and manage asset
                  manufacturers.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================
              MESSAGES
              ======================================== */}

          {(error || success) && (
            <div
              ref={messageRef}
              className={`manufacturer-message ${
                error ? "manufacturer-error" : "manufacturer-success"
              }`}
              role={error ? "alert" : "status"}
            >
              <div className="add-asset-message-icon">
                {error ? "!" : "✓"}
              </div>

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
              CREATE / EDIT CARD
              ======================================== */}

          <section
            ref={formRef}
            className="manufacturer-form-card"
          >
            <div className="manufacturer-card-header">
              <div>
                <h3>
                  {editingId
                    ? "Edit Manufacturer"
                    : "Add Manufacturer"}
                </h3>

                <p>
                  {editingId
                    ? "Update the selected manufacturer's name."
                    : "Add a new manufacturer to the system."}
                </p>
              </div>

              <span className="manufacturer-required">
                * Required
              </span>
            </div>

            <form
              className="manufacturer-form"
              onSubmit={
                editingId
                  ? handleUpdate
                  : handleCreate
              }
            >
              <div className="manufacturer-field">
                <label htmlFor="manufacturer-name">
                  Manufacturer Name <span>*</span>
                </label>

                <input
                  id="manufacturer-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter manufacturer name"
                  disabled={saving}
                  autoComplete="off"
                />
              </div>

              <div className="manufacturer-form-info">
                <span className="manufacturer-info-label">
                  Manufacturer Code
                </span>

                <span className="manufacturer-info-text">
                  Automatically generated by the system
                </span>
              </div>

              <div className="manufacturer-form-actions">
                {editingId && (
                  <button
                    type="button"
                    className="manufacturer-cancel-button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="manufacturer-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Manufacturer"
                      : "Add Manufacturer"}
                </button>
              </div>
            </form>
          </section>

          {/* ========================================
              FILTER
              ======================================== */}

          <section className="manufacturer-filter-card">
            <div className="manufacturer-card-header">
              <div>
                <h3>Filter Manufacturers</h3>

                <p>
                  Filter manufacturers by account
                  status.
                </p>
              </div>
            </div>

            <div className="manufacturer-filter-form">
              <div className="manufacturer-field">
                <label htmlFor="manufacturer-status-filter">
                  Status
                </label>

                <select
                  id="manufacturer-status-filter"
                  value={filterStatus}
                  onChange={(event) =>
                    setFilterStatus(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    All Statuses
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </div>

              <button
                type="button"
                className="manufacturer-clear-filter"
                onClick={() =>
                  setFilterStatus("")
                }
              >
                Clear Filter
              </button>
            </div>
          </section>

          {/* ========================================
              MANUFACTURER LIST
              ======================================== */}

          <section className="manufacturer-list-section">
            <div className="manufacturer-list-heading">
              <div>
                <h3>All Manufacturers</h3>

                <p>
                  Showing{" "}
                  <strong>
                    {filteredManufacturers.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {manufacturers.length}
                  </strong>{" "}
                  manufacturers
                </p>
              </div>
            </div>

            {loading ? (
              <div className="manufacturer-empty-state">
                <div className="manufacturer-loading-spinner" />

                <p>
                  Loading manufacturers...
                </p>
              </div>
            ) : filteredManufacturers.length ===
              0 ? (
              <div className="manufacturer-empty-state">
                <div className="manufacturer-empty-icon">
                  ◇
                </div>

                <strong>
                  No manufacturers found
                </strong>

                <p>
                  No manufacturers match the
                  selected filter.
                </p>
              </div>
            ) : (
              <div className="manufacturer-table-card">
                <table className="manufacturer-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Manufacturer Name</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredManufacturers.map(
                      (manufacturer) => (
                        <tr
                          key={manufacturer._id}
                        >
                          {/* CODE */}

                          <td className="manufacturer-code-cell">
                            {manufacturer.code ||
                              "N/A"}
                          </td>

                          {/* NAME */}

                          <td className="manufacturer-name-cell">
                            {manufacturer.name}
                          </td>

                          {/* STATUS */}

                          <td>
                            <span
                              className={`manufacturer-status ${
                                manufacturer.status ===
                                "ACTIVE"
                                  ? "manufacturer-status-active"
                                  : "manufacturer-status-inactive"
                              }`}
                            >
                              {manufacturer.status ||
                                "N/A"}
                            </span>
                          </td>

                          {/* CREATED */}

                          <td className="manufacturer-date-cell">
                            {manufacturer.createdAt
                              ? new Date(
                                  manufacturer.createdAt,
                                ).toLocaleDateString(
                                  "en-GB",
                                )
                              : "N/A"}
                          </td>

                          {/* ACTIONS */}

                          <td className="manufacturer-actions-cell">
                            <button
                              type="button"
                              className="manufacturer-action-button manufacturer-edit-action"
                              onClick={() =>
                                handleEdit(
                                  manufacturer,
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className={`manufacturer-action-button ${
                                manufacturer.status ===
                                "ACTIVE"
                                  ? "manufacturer-deactivate-action"
                                  : "manufacturer-activate-action"
                              }`}
                              onClick={() =>
                                handleStatusChange(
                                  manufacturer,
                                )
                              }
                            >
                              {manufacturer.status ===
                              "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
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

export default Manufacturer;
