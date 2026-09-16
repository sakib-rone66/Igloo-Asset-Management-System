import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
import api from "../services/api";

import "./Districts.css";

function Districts() {
  const formRef = useRef(null);
  const messageRef = useRef(null);

  // ========================================
  // STATE
  // ========================================

  const [districts, setDistricts] = useState([]);
  const [regions, setRegions] = useState([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [region, setRegion] = useState("");

  const [filterRegion, setFilterRegion] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // FETCH REGIONS
  // ========================================

  const fetchRegions = async () => {
    try {
      const response = await api.get("/regions");

      setRegions(response.data.regions || []);
    } catch (error) {
      console.error(
        "Get Regions Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to load regions");
    }
  };

  // ========================================
  // FETCH DISTRICTS
  // ========================================

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filterRegion) {
        params.region = filterRegion;
      }

      const response = await api.get("/districts", {
        params,
      });

      setDistricts(response.data.districts || []);
    } catch (error) {
      console.error(
        "Get Districts Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to load districts");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    fetchDistricts();
  }, [filterRegion]);

  // ========================================
  // SCROLL TO MESSAGE
  // ========================================

  useEffect(() => {
    if (error || success) {
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error, success]);

  useEffect(() => {
    if (!error && !success) {
      return;
    }

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
  // CREATE / UPDATE DISTRICT
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!name.trim() || !code.trim() || !region) {
      setError("District name, code and region are required");
      return;
    }

    try {
      setSaving(true);

      // ========================================
      // UPDATE
      // ========================================

      if (editingId) {
        const response = await api.patch(`/districts/${editingId}`, {
          name: name.trim(),
          code: code.trim(),
          region,
        });

        setSuccess(response.data.message || "District updated successfully");
      }

      // ========================================
      // CREATE
      // ========================================
      else {
        const response = await api.post("/districts", {
          name: name.trim(),
          code: code.trim(),
          region,
        });

        setSuccess(response.data.message || "District created successfully");
      }

      // ========================================
      // CLEAR FORM
      // ========================================

      setName("");
      setCode("");
      setRegion("");
      setEditingId(null);

      // ========================================
      // RELOAD DISTRICTS
      // ========================================

      await fetchDistricts();
    } catch (error) {
      console.error(
        "Save District Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to save district");
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT DISTRICT
  // ========================================

  const handleEdit = (district) => {
    clearMessages();

    setEditingId(district._id);
    setName(district.name);
    setCode(district.code);
    setRegion(district.region?._id || "");

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
    setCode("");
    setRegion("");

    clearMessages();
  };

  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatusChange = async (district) => {
    clearMessages();

    const newStatus = district.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await api.patch(`/districts/${district._id}/status`, {
        status: newStatus,
      });

      setSuccess(
        response.data.message || "District status updated successfully",
      );

      await fetchDistricts();
    } catch (error) {
      console.error(
        "Update District Status Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to update district status",
      );
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <AppPageLayout>
      <div className="districts-page">
        {/* ========================================
          BACK TO DASHBOARD
          ======================================== */}

        <Link to="/dashboard" className="districts-back-button">
          ← Back to Dashboard
        </Link>

        {/* ========================================
          PAGE HEADER
          ======================================== */}

        <div className="districts-header">
          <p className="districts-eyebrow">LOCATION MANAGEMENT</p>

          <h2 className="districts-title">District Management</h2>

          <p className="districts-subtitle">
            Create, edit and manage system districts under their respective
            regions.
          </p>
        </div>

        {/* ========================================
          MESSAGES
          ======================================== */}

        {(error || success) && (
          <div
            ref={messageRef}
            className={`districts-message ${
              error ? "districts-error" : "districts-success"
            }`}
            role={error ? "alert" : "status"}
          >
            <div className="add-asset-message-icon">{error ? "!" : "✓"}</div>
            <div className="add-asset-message-content">
              <strong>{error ? "Error" : "Success"}</strong>
              <span>{error || success}</span>
            </div>
          </div>
        )}

        {/* ========================================
          DISTRICT FORM
          ======================================== */}

        <form ref={formRef} onSubmit={handleSubmit} className="districts-form">
          {/* REGION */}

          <div className="districts-field">
            <label htmlFor="district-region">Region</label>

            <select
              id="district-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={saving}
            >
              <option value="">Select Region</option>

              {regions.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                  disabled={item.status !== "ACTIVE"}
                >
                  {item.name}
                  {item.status !== "ACTIVE" ? " (INACTIVE)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* DISTRICT NAME */}

          <div className="districts-field">
            <label htmlFor="district-name">District Name</label>

            <input
              id="district-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter district name"
              disabled={saving}
            />
          </div>

          {/* DISTRICT CODE */}

          <div className="districts-field">
            <label htmlFor="district-code">District Code</label>

            <input
              id="district-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={editingId ? "Enter district code" : "Example: DHK"}
              disabled={saving}
            />
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="districts-submit-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update District"
                : "Create District"}
          </button>

          {/* CANCEL */}

          {editingId && (
            <button
              type="button"
              className="districts-cancel-button"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </form>

        {/* ========================================
          FILTER SECTION
          ======================================== */}

        <section className="districts-filter-card">
          <div className="districts-filter-content">
            <div>
              <h3>Filter Districts</h3>

              <p>View districts belonging to a specific region.</p>
            </div>

            <div className="districts-filter-field">
              <label htmlFor="filter-region">Region</label>

              <select
                id="filter-region"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
              >
                <option value="">All Regions</option>

                {regions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ========================================
          DISTRICT LIST HEADER
          ======================================== */}

        <div className="districts-list-header">
          <div>
            <h3>All Districts</h3>

            <p>Manage all districts registered in the system.</p>
          </div>

          <span className="districts-count">
            {districts.length}{" "}
            {districts.length === 1 ? "District" : "Districts"}
          </span>
        </div>

        {/* ========================================
          DISTRICT TABLE
          ======================================== */}

        {loading ? (
          <div className="districts-state-card">
            <div className="districts-spinner"></div>
            <p>Loading districts...</p>
          </div>
        ) : districts.length === 0 ? (
          <div className="districts-state-card">
            <p>No districts found.</p>
          </div>
        ) : (
          <div className="districts-list-card">
            <div className="districts-table-wrapper">
              <table className="districts-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Region</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {districts.map((district) => (
                    <tr key={district._id}>
                      {/* NAME */}

                      <td className="district-name">{district.name}</td>

                      {/* CODE */}

                      <td className="district-code">{district.code}</td>

                      {/* REGION */}

                      <td>{district.region?.name || "N/A"}</td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`districts-status ${
                            district.status === "ACTIVE"
                              ? "districts-status-active"
                              : "districts-status-inactive"
                          }`}
                        >
                          {district.status}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="districts-actions">
                        <button
                          type="button"
                          className="districts-action-button districts-edit-button"
                          onClick={() => handleEdit(district)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className={`districts-action-button ${
                            district.status === "ACTIVE"
                              ? "districts-deactivate-button"
                              : "districts-activate-button"
                          }`}
                          onClick={() => handleStatusChange(district)}
                        >
                          {district.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppPageLayout>
  );
}

export default Districts;
