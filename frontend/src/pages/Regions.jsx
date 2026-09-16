import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./Regions.css";

function Regions() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [regions, setRegions] = useState([]);

  // ========================================
  // FORM
  // ========================================

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // ========================================
  // EDIT MODE
  // ========================================

  const [editingRegion, setEditingRegion] = useState(null);

  // ========================================
  // UI STATE
  // ========================================

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ========================================
  // LOAD REGIONS
  // ========================================

  const loadRegions = async () => {
    try {
      setLoading(true);

      const response = await api.get("/regions");

      setRegions(response.data.regions || []);
    } catch (error) {
      console.error(
        "Load Regions Error:",
        error.response?.data || error.message,
      );

      setMessage(error.response?.data?.message || "Failed to load regions.");

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  // ========================================
  // CLEAR FORM
  // ========================================

  const clearForm = () => {
    setName("");
    setCode("");
    setEditingRegion(null);
  };

  // ========================================
  // SUBMIT REGION
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!name.trim()) {
      setMessage("Region name is required.");
      setMessageType("error");
      return;
    }

    if (!code.trim()) {
      setMessage("Region code is required.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);

      // ========================================
      // UPDATE
      // ========================================

      if (editingRegion) {
        const response = await api.patch(`/regions/${editingRegion._id}`, {
          name: name.trim(),
          code: code.trim(),
        });

        setMessage(response.data.message || "Region updated successfully.");

        setMessageType("success");
      }

      // ========================================
      // CREATE
      // ========================================
      else {
        const response = await api.post("/regions", {
          name: name.trim(),
          code: code.trim(),
        });

        setMessage(response.data.message || "Region created successfully.");

        setMessageType("success");
      }

      clearForm();

      await loadRegions();
    } catch (error) {
      console.error(
        "Region Save Error:",
        error.response?.data || error.message,
      );

      setMessage(error.response?.data?.message || "Failed to save region.");

      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // EDIT REGION
  // ========================================

  const handleEdit = (region) => {
    setEditingRegion(region);

    setName(region.name || "");
    setCode(region.code || "");

    setMessage("");
    setMessageType("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // TOGGLE STATUS
  // ========================================

  const handleToggleStatus = async (region) => {
    const action = region.status === "ACTIVE" ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} the region "${region.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.patch(`/regions/${region._id}/status`, {
        status: region.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });

      setMessage(response.data.message || `Region ${action}d successfully.`);

      setMessageType("success");

      await loadRegions();
    } catch (error) {
      console.error(
        "Toggle Region Status Error:",
        error.response?.data || error.message,
      );

      setMessage(
        error.response?.data?.message || "Failed to update region status.",
      );

      setMessageType("error");
    }
  };

  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className={`regions-layout ${
        sidebarOpen ? "regions-sidebar-open" : "regions-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN AREA
          ======================================== */}

      <div className="regions-main">
        <Navbar />

        {/* ========================================
            SHOW SIDEBAR BUTTON
            ======================================== */}

        {!sidebarOpen && (
          <button
            type="button"
            className="regions-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}

        {/* ========================================
            PAGE
            ======================================== */}

        <main className="regions-page">
          {/* ========================================
              BACK TO DASHBOARD
              ======================================== */}

          <div className="regions-back-wrapper">
            <Link to="/dashboard" className="regions-back-button">
              ← Back to Dashboard
            </Link>
          </div>

          {/* ========================================
              PAGE HEADER
              ======================================== */}

          <div className="regions-page-header">
            <p className="regions-eyebrow">LOCATION MANAGEMENT</p>

            <h2 className="regions-title">Regions</h2>

            <p className="regions-subtitle">
              Create, edit and manage system regions
            </p>
          </div>

          {/* ========================================
              MESSAGE
              ======================================== */}

          {message && (
            <div
              className={`regions-message ${
                messageType === "error"
                  ? "regions-message-error"
                  : "regions-message-success"
              }`}
            >
              <span>{messageType === "error" ? "!" : "✓"}</span>

              <p>{message}</p>
            </div>
          )}

          {/* ========================================
              FORM CARD
              ======================================== */}

          <section className="regions-form-card">
            <div className="regions-form-header">
              <div>
                <h3>{editingRegion ? "Edit Region" : "Create Region"}</h3>

                <p>
                  {editingRegion
                    ? "Update the region information."
                    : "Add a new region to the system."}
                </p>
              </div>

              <span className="regions-required">* Required</span>
            </div>

            <form className="regions-form" onSubmit={handleSubmit}>
              {/* REGION NAME */}

              <div className="regions-field">
                <label htmlFor="region-name">
                  Region Name
                  <span>*</span>
                </label>

                <input
                  id="region-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter region name"
                  disabled={submitting}
                  required
                />
              </div>

              {/* REGION CODE */}

              <div className="regions-field">
                <label htmlFor="region-code">
                  Region Code
                  <span>*</span>
                </label>

                <input
                  id="region-code"
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder={
                    editingRegion ? "Enter region code" : "Example: DHK"
                  }
                  disabled={submitting}
                  required
                />
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="regions-submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingRegion
                    ? "Update Region"
                    : "Create Region"}
              </button>

              {/* CANCEL */}

              {editingRegion && (
                <button
                  type="button"
                  className="regions-cancel-button"
                  onClick={clearForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
            </form>
          </section>

          {/* ========================================
              TABLE TITLE
              ======================================== */}

          <div className="regions-list-header">
            <div>
              <h3>All Regions</h3>

              <p>View and manage all system regions.</p>
            </div>

            <span className="regions-count">
              {regions.length} {regions.length === 1 ? "Region" : "Regions"}
            </span>
          </div>

          {/* ========================================
              TABLE CARD
              ======================================== */}

          <section className="regions-list-card">
            {loading ? (
              <div className="regions-loading">
                <div className="regions-spinner" />
                <span>Loading regions...</span>
              </div>
            ) : regions.length === 0 ? (
              <div className="regions-empty">
                <div className="regions-empty-icon">◌</div>

                <strong>No regions found</strong>

                <p>Create your first region using the form above.</p>
              </div>
            ) : (
              <div className="regions-table-wrapper">
                <table className="regions-table">
                  <thead>
                    <tr>
                      <th>Region Name</th>
                      <th>Region Code</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {regions.map((region) => (
                      <tr key={region._id}>
                        {/* NAME */}

                        <td className="regions-name-cell">{region.name}</td>

                        {/* CODE */}

                        <td className="regions-code-cell">{region.code}</td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`regions-status ${
                              region.status === "ACTIVE"
                                ? "regions-status-active"
                                : "regions-status-inactive"
                            }`}
                          >
                            {region.status}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="regions-actions">
                            <button
                              type="button"
                              className="regions-action-button regions-edit-button"
                              onClick={() => handleEdit(region)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className={`regions-action-button ${
                                region.status === "ACTIVE"
                                  ? "regions-deactivate-button"
                                  : "regions-activate-button"
                              }`}
                              onClick={() => handleToggleStatus(region)}
                            >
                              {region.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        </td>
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

export default Regions;
