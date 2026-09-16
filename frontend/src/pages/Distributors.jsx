import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
import api from "../services/api";

import "./Distributors.css";

function Distributors() {
  const formRef = useRef(null);
  const messageRef = useRef(null);

  // ========================================
  // STATE
  // ========================================

  const [distributors, setDistributors] = useState([]);
  const [allDistributors, setAllDistributors] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formDistricts, setFormDistricts] = useState([]);
  const [regions, setRegions] = useState([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");

  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

  const fetchDistricts = async (selectedRegion = "") => {
    try {
      const response = await api.get("/districts", {
        params: {
          status: "ACTIVE",
          ...(selectedRegion ? { region: selectedRegion } : {}),
        },
      });

      const loadedDistricts = response.data.districts || [];

      setFormDistricts(loadedDistricts);

      if (!selectedRegion) {
        setDistricts(loadedDistricts);
      }
    } catch (error) {
      console.error(
        "Get Districts Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to load districts");
    }
  };

  // ========================================
  // FETCH DISTRIBUTORS
  // ========================================

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filterRegion) {
        params.region = filterRegion;
      }

      if (filterDistrict) {
        params.district = filterDistrict;
      }

      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await api.get("/distributors", {
        params,
      });

      setDistributors(response.data.distributors || []);
    } catch (error) {
      console.error(
        "Get Distributors Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to load distributors");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDistributors = async () => {
    try {
      const response = await api.get("/distributors");

      setAllDistributors(response.data.distributors || []);
    } catch (error) {
      console.error(
        "Get All Distributors Error:",
        error.response?.data || error.message,
      );
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchRegions();
    fetchDistricts();
    fetchAllDistributors();
  }, []);

  useEffect(() => {
    fetchDistributors();
  }, [filterRegion, filterDistrict, filterStatus]);

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
  // CLEAR FORM
  // ========================================

  const clearForm = () => {
    setName("");
    setCode("");
    setRegion("");
    setDistrict("");
    setAddress("");
    setContactPerson("");
    setPhone("");
    setEditingId(null);
  };

  // ========================================
  // CLEAR MESSAGES
  // ========================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ========================================
  // GENERATE CODE SUGGESTION
  // ========================================

  const getSuggestedCode = () => {
    if (!district) {
      return "Select a district first";
    }

    const selectedDistrict = districts.find((item) => item._id === district);

    if (!selectedDistrict) {
      return "Select a district first";
    }

    const districtCode = (
      selectedDistrict.code ||
      selectedDistrict.name ||
      "DHK"
    )
      .toString()
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "-");

    const escapeRegExp = (value) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const codePattern = new RegExp(
      `^${escapeRegExp(districtCode)}-DIST-(\\d+)$`,
    );

    const highestSequence = allDistributors.reduce((highest, item) => {
      if (editingId && item._id === editingId) {
        return highest;
      }

      const match = item.code?.trim().toUpperCase().match(codePattern);
      const sequence = match ? Number(match[1]) : 0;

      return Math.max(highest, sequence);
    }, 0);

    return `${districtCode}-DIST-${String(highestSequence + 1).padStart(3, "0")}`;
  };

  // ========================================
  // CREATE / UPDATE
  // ========================================

  const handleRegionChange = async (event) => {
    const selectedRegion = event.target.value;

    setRegion(selectedRegion);
    setDistrict("");
    clearMessages();

    await fetchDistricts(selectedRegion);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!name.trim() || !code.trim() || !district || !address.trim()) {
      setError("Name, code, district and address are required");
      return;
    }

    try {
      setSaving(true);

      // ========================================
      // UPDATE
      // ========================================

      if (editingId) {
        const response = await api.patch(`/distributors/${editingId}`, {
          name: name.trim(),
          code: code.trim(),
          district,
          address: address.trim(),
          contactPerson: contactPerson.trim(),
          phone: phone.trim(),
        });

        setSuccess(response.data.message || "Distributor updated successfully");
      }

      // ========================================
      // CREATE
      // ========================================
      else {
        const response = await api.post("/distributors", {
          name: name.trim(),
          code: code.trim(),
          district,
          address: address.trim(),
          contactPerson: contactPerson.trim(),
          phone: phone.trim(),
        });

        setSuccess(response.data.message || "Distributor created successfully");
      }

      clearForm();

      await fetchDistributors();
      await fetchAllDistributors();
    } catch (error) {
      console.error(
        "Save Distributor Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to save distributor");
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT DISTRIBUTOR
  // ========================================

  const handleEdit = async (distributor) => {
    clearMessages();

    setEditingId(distributor._id);
    setName(distributor.name);
    setCode(distributor.code);
    const selectedRegion =
      distributor.district?.region?._id || distributor.district?.region || "";
    setRegion(selectedRegion);
    setDistrict(distributor.district?._id || distributor.district || "");
    setAddress(distributor.address || "");
    setContactPerson(distributor.contactPerson || "");
    setPhone(distributor.phone || "");

    await fetchDistricts(selectedRegion);

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
    clearForm();
    clearMessages();
  };

  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatusChange = async (distributor) => {
    clearMessages();

    const newStatus = distributor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await api.patch(
        `/distributors/${distributor._id}/status`,
        {
          status: newStatus,
        },
      );

      setSuccess(
        response.data.message || "Distributor status updated successfully",
      );

      await fetchDistributors();
      await fetchAllDistributors();
    } catch (error) {
      console.error(
        "Update Distributor Status Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to update distributor status",
      );
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <AppPageLayout>
      <div className="distributors-page">
        {/* ========================================
          BACK TO DASHBOARD
          ======================================== */}

        <div className="distributors-top-bar">
          <Link to="/dashboard" className="distributors-back-button">
            ← Back to Dashboard
          </Link>
        </div>

        {/* ========================================
          PAGE HEADER
          ======================================== */}

        <div className="distributors-header">
          <p className="distributors-eyebrow">SYSTEM MANAGEMENT</p>

          <h2 className="distributors-title">Distributor Management</h2>

          <p className="distributors-subtitle">
            Create, edit and manage system distributors and their district
            assignments.
          </p>
        </div>

        {/* ========================================
          MESSAGES
          ======================================== */}

        {(error || success) && (
          <div
            ref={messageRef}
            className={`distributors-message ${
              error ? "distributors-error" : "distributors-success"
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
          FORM CARD
          ======================================== */}

        <section ref={formRef} className="distributors-form-card">
          <div className="distributors-card-header">
            <div>
              <h3>{editingId ? "Edit Distributor" : "Create Distributor"}</h3>

              <p>Enter the distributor information below.</p>
            </div>

            <span className="distributors-required">* Required</span>
          </div>

          <form className="distributors-form" onSubmit={handleSubmit}>
            {/* ========================================
              REGION
              ======================================== */}

            <div className="distributors-field">
              <label htmlFor="distributor-region">
                Region <span>*</span>
              </label>

              <select
                id="distributor-region"
                value={region}
                onChange={handleRegionChange}
                disabled={saving}
              >
                <option value="">Select Region</option>

                {regions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                    {item.code ? ` (${item.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* ========================================
              DISTRICT
              ======================================== */}

            <div className="distributors-field">
              <label htmlFor="district">
                District <span>*</span>
              </label>

              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={saving || !region}
              >
                <option value="">
                  {region ? "Select District" : "Select a region first"}
                </option>

                {formDistricts.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                    {item.code ? ` (${item.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* ========================================
              DISTRIBUTOR NAME
              ======================================== */}

            <div className="distributors-field">
              <label htmlFor="distributorName">
                Distributor Name <span>*</span>
              </label>

              <input
                id="distributorName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter distributor name"
                disabled={saving}
              />
            </div>

            {/* ========================================
              DISTRIBUTOR CODE
              ======================================== */}

            <div className="distributors-field">
              <label htmlFor="distributorCode">
                Distributor Code <span>*</span>
              </label>

              <input
                id="distributorCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter distributor code"
                disabled={saving}
              />

              {/* IMPORTANT:
                Suggestion is BELOW the input,
                NOT inside the input.
            */}

              <div className="distributors-code-suggestion">
                <span>Suggested:</span>

                <strong>{getSuggestedCode()}</strong>
              </div>
            </div>

            {/* ========================================
              ADDRESS
              ======================================== */}

            <div className="distributors-field distributors-field-full">
              <label htmlFor="address">
                Address <span>*</span>
              </label>

              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter distributor address"
                disabled={saving}
              />
            </div>

            {/* ========================================
              CONTACT PERSON
              ======================================== */}

            <div className="distributors-field">
              <label htmlFor="contactPerson">Contact Person</label>

              <input
                id="contactPerson"
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Enter contact person"
                disabled={saving}
              />
            </div>

            {/* ========================================
              PHONE
              ======================================== */}

            <div className="distributors-field">
              <label htmlFor="phone">Phone</label>

              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                disabled={saving}
              />
            </div>

            {/* ========================================
              ACTIONS
              ======================================== */}

            <div className="distributors-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="distributors-cancel-button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="distributors-submit-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Distributor"
                    : "Create Distributor"}
              </button>
            </div>
          </form>
        </section>

        {/* ========================================
          FILTER SECTION
          ======================================== */}

        <section className="distributors-filter-card">
          <div className="distributors-filter-header">
            <div>
              <h3>Filter Distributors</h3>

              <p>Narrow down the distributor list by district or status.</p>
            </div>
          </div>

          <div className="distributors-filter-form">
            {/* REGION FILTER */}

            <div className="distributors-field">
              <label htmlFor="filterRegion">Region</label>

              <select
                id="filterRegion"
                value={filterRegion}
                onChange={(e) => {
                  setFilterRegion(e.target.value);
                  setFilterDistrict("");
                }}
              >
                <option value="">All Regions</option>

                {regions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DISTRICT FILTER */}

            <div className="distributors-field">
              <label htmlFor="filterDistrict">District</label>

              <select
                id="filterDistrict"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
              >
                <option value="">All Districts</option>

                {districts
                  .filter((item) => {
                    if (!filterRegion) {
                      return true;
                    }

                    return (
                      item.region?._id === filterRegion ||
                      item.region === filterRegion
                    );
                  })
                  .map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* STATUS FILTER */}

            <div className="distributors-field">
              <label htmlFor="filterStatus">Status</label>

              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>

                <option value="ACTIVE">ACTIVE</option>

                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </section>

        {/* ========================================
          DISTRIBUTOR LIST
          ======================================== */}

        <section className="distributors-list-section">
          <div className="distributors-list-header">
            <div>
              <p className="distributors-eyebrow">DISTRIBUTOR DIRECTORY</p>

              <h3>All Distributors</h3>
            </div>

            <span className="distributors-count">
              {distributors.length}{" "}
              {distributors.length === 1 ? "Distributor" : "Distributors"}
            </span>
          </div>

          {/* ========================================
            LOADING
            ======================================== */}

          {loading ? (
            <div className="distributors-empty-state">
              <div className="distributors-spinner" />

              <p>Loading distributors...</p>
            </div>
          ) : distributors.length === 0 ? (
            /* ========================================
              EMPTY
              ======================================== */

            <div className="distributors-empty-state">
              <div className="distributors-empty-icon">◌</div>

              <h4>No distributors found</h4>

              <p>There are no distributors matching the selected filters.</p>
            </div>
          ) : (
            /* ========================================
              TABLE
              ======================================== */

            <div className="distributors-table-card">
              <div className="distributors-table-wrapper">
                <table className="distributors-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>District</th>
                      <th>Region</th>
                      <th>Address</th>
                      <th>Contact Person</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {distributors.map((item) => (
                      <tr key={item._id}>
                        <td className="distributor-name-cell">{item.name}</td>

                        <td className="distributor-code-cell">{item.code}</td>

                        <td>{item.district?.name || "N/A"}</td>

                        <td>{item.district?.region?.name || "N/A"}</td>

                        <td className="distributor-address-cell">
                          {item.address}
                        </td>

                        <td>{item.contactPerson || "N/A"}</td>

                        <td>{item.phone || "N/A"}</td>

                        <td>
                          <span
                            className={`distributors-status ${
                              item.status === "ACTIVE"
                                ? "distributors-status-active"
                                : "distributors-status-inactive"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td>
                          <div className="distributors-actions">
                            <button
                              type="button"
                              className="distributors-action-button distributors-edit-button"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className={`distributors-action-button ${
                                item.status === "ACTIVE"
                                  ? "distributors-deactivate-button"
                                  : "distributors-activate-button"
                              }`}
                              onClick={() => handleStatusChange(item)}
                            >
                              {item.status === "ACTIVE"
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
            </div>
          )}
        </section>
      </div>
    </AppPageLayout>
  );
}

export default Distributors;
