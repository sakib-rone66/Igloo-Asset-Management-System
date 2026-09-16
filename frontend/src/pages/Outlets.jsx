import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
import api from "../services/api";

import "./Outlets.css";

function Outlets() {
  const navigate = useNavigate();

  // ========================================
  // DATA STATE
  // ========================================

  const [outlets, setOutlets] = useState([]);
  const [allOutlets, setAllOutlets] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [distributors, setDistributors] = useState([]);

  // ========================================
  // SEARCH STATE
  // ========================================

  const [searchPhone, setSearchPhone] = useState("");
  const [searchedOutlet, setSearchedOutlet] = useState(null);
  const [verifiedAssets, setVerifiedAssets] = useState([]);

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchMessage, setSearchMessage] = useState("");

  // ========================================
  // CREATE / EDIT FORM STATE
  // ========================================

  const [showCreateForm, setShowCreateForm] = useState(false);
  const createFormRef = useRef(null);

  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [distributor, setDistributor] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Auto-dismiss messages after 4 seconds
  useEffect(() => {
    if (!error && !success) return;

    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error, success]);

  // ========================================
  // FILTER STATE
  // ========================================

  const [filterRegion, setFilterRegion] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterDistributor, setFilterDistributor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const [loading, setLoading] = useState(true);

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
      const params = {};
      if (selectedRegion) {
        params.region = selectedRegion;
      }
      const response = await api.get("/districts", { params });
      setDistricts(response.data.districts || []);
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

  const fetchDistributors = async (selectedDistrict = "") => {
    try {
      const params = {};
      if (selectedDistrict) {
        params.district = selectedDistrict;
      }
      const response = await api.get("/distributors", { params });
      setDistributors(response.data.distributors || []);
    } catch (error) {
      console.error(
        "Get Distributors Error:",
        error.response?.data || error.message,
      );
      setError(error.response?.data?.message || "Failed to load distributors");
    }
  };

  // ========================================
  // FETCH ALL OUTLETS
  // ========================================

  const fetchOutlets = async () => {
    try {
      setLoading(true);

      const params = {};
      if (filterDistrict) {
        params.district = filterDistrict;
      }
      if (filterDistributor) {
        params.distributor = filterDistributor;
      }
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (filterSearch.trim()) {
        params.search = filterSearch.trim();
      }

      const response = await api.get("/outlets", { params });
      setOutlets(response.data.outlets || []);
    } catch (error) {
      console.error(
        "Get Outlets Error:",
        error.response?.data || error.message,
      );
      setError(error.response?.data?.message || "Failed to load outlets");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOutlets = async () => {
    try {
      const response = await api.get("/outlets");
      setAllOutlets(response.data.outlets || []);
    } catch (error) {
      console.error(
        "Get All Outlets Error:",
        error.response?.data || error.message,
      );
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    fetchRegions();
    fetchDistricts();
    fetchDistributors();
    fetchOutlets();
    fetchAllOutlets();
  }, []);

  // ========================================
  // FILTER LOAD
  // ========================================

  useEffect(() => {
    fetchOutlets();
  }, [filterDistrict, filterDistributor, filterStatus, filterSearch]);

  useEffect(() => {
    if (showCreateForm) {
      createFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showCreateForm]);

  // ========================================
  // SEARCH OUTLET BY PHONE
  // ========================================

  const showOutletDetails = async (outlet) => {
    setSearchError("");
    setSearchMessage("");
    setVerifiedAssets([]);
    setSearchedOutlet(outlet);
    setShowCreateForm(false);

    try {
      setSearching(true);
      const assetResponse = await api.get(`/outlets/${outlet._id}/assets`);
      const assets = assetResponse.data.assets || [];
      const verified = assets.filter(
        (asset) => asset.verificationStatus === "VERIFIED",
      );
      setVerifiedAssets(verified);
      setSearchMessage("Outlet found successfully");
    } catch (error) {
      console.error(
        "Search Outlet Error:",
        error.response?.data || error.message,
      );
      setSearchError(
        error.response?.data?.message || "Failed to search outlet",
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSearchOutlet = async (e) => {
    e.preventDefault();

    setSearchError("");
    setSearchMessage("");
    setSearchedOutlet(null);
    setVerifiedAssets([]);

    const normalizedPhone = searchPhone.trim();

    if (!normalizedPhone) {
      setSearchError("Please enter outlet phone number");
      return;
    }

    try {
      setSearching(true);

      const response = await api.get("/outlets", {
        params: {
          phone: normalizedPhone,
        },
      });

      const foundOutlets = response.data.outlets || [];

      if (foundOutlets.length === 0) {
        setSearchMessage("Outlet Not Found");
        return;
      }

      const outlet = foundOutlets[0];
      setSearchedOutlet(outlet);

      const assetResponse = await api.get(`/outlets/${outlet._id}/assets`);
      const verified = (assetResponse.data.assets || []).filter(
        (asset) => asset.verificationStatus === "VERIFIED",
      );

      setVerifiedAssets(verified);
      setSearchMessage("Outlet found successfully");
    } catch (error) {
      console.error(
        "Search Outlet Error:",
        error.response?.data || error.message,
      );
      setSearchError(
        error.response?.data?.message || "Failed to search outlet",
      );
    } finally {
      setSearching(false);
    }
  };

  // ========================================
  // CREATE NEW OUTLET
  // ========================================

  const handleCreateNewOutlet = () => {
    setShowCreateForm(true);
    setEditingId(null);

    setName("");
    setCode("");
    setType("");
    setRegion("");
    setDistrict("");
    setDistributor("");
    setAddress("");
    setContactPerson("");
    setPhone(searchPhone.trim());

    setError("");
    setSuccess("");
    setFieldErrors({});
  };

  // ========================================
  // FORM REGION CHANGE
  // ========================================

  const handleRegionChange = async (e) => {
    const selectedRegion = e.target.value;

    setRegion(selectedRegion);
    setDistrict("");
    setDistributor("");
    setDistributors([]);

    if (selectedRegion) {
      await fetchDistricts(selectedRegion);
    } else {
      await fetchDistricts();
    }
  };

  // ========================================
  // FORM DISTRICT CHANGE
  // ========================================

  const handleDistrictChange = async (e) => {
    const selectedDistrict = e.target.value;

    setDistrict(selectedDistrict);
    setDistributor("");

    if (selectedDistrict) {
      await fetchDistributors(selectedDistrict);
    } else {
      setDistributors([]);
    }
  };

  // ========================================
  // GENERATE OUTLET CODE SUGGESTION
  // ========================================

  const getSuggestedOutletCode = () => {
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
      `^OUT-${escapeRegExp(districtCode)}-(\\d+)$`,
    );

    const highestSequence = allOutlets.reduce((highest, item) => {
      if (editingId && item._id === editingId) {
        return highest;
      }

      const match = item.code?.trim().toUpperCase().match(codePattern);
      const sequence = match ? Number(match[1]) : 0;

      return Math.max(highest, sequence);
    }, 0);

    return `OUT-${districtCode}-${String(highestSequence + 1).padStart(3, "0")}`;
  };

  // ========================================
  // CREATE / UPDATE OUTLET
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setFieldErrors({});

    if (
      !name.trim() ||
      !code.trim() ||
      !type.trim() ||
      !region ||
      !district ||
      !address.trim() ||
      !phone.trim()
    ) {
      setError(
        "Name, code, type, region, district, address and phone are required",
      );
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const response = await api.patch(`/outlets/${editingId}`, {
          name: name.trim(),
          code: code.trim(),
          type: type.trim(),
          district,
          distributor: distributor || null,
          address: address.trim(),
          contactPerson: contactPerson.trim(),
          phone: phone.trim(),
        });

        setSuccess(response.data.message || "Outlet updated successfully");
        setShowCreateForm(false);
      } else {
        const response = await api.post("/outlets", {
          name: name.trim(),
          code: code.trim(),
          type: type.trim(),
          district,
          distributor: distributor || null,
          address: address.trim(),
          contactPerson: contactPerson.trim(),
          phone: phone.trim(),
        });

        const createdOutlet = response.data.outlet;

        setSuccess(response.data.message || "Outlet created successfully");
        setShowCreateForm(false);

        if (createdOutlet) {
          setSearchedOutlet(createdOutlet);
          setSearchPhone(createdOutlet.phone || "");
          setSearchMessage("Outlet created successfully");
          setVerifiedAssets([]);
        }
      }

      clearForm();
      await fetchOutlets();
      await fetchAllOutlets();
    } catch (error) {
      console.error(
        "Save Outlet Error:",
        error.response?.data || error.message,
      );
      const responseData = error.response?.data;

      if (responseData?.field) {
        setFieldErrors({
          [responseData.field]: responseData.message,
        });
      }

      setError(responseData?.message || "Failed to save outlet");
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // CLEAR FORM
  // ========================================

  const clearForm = () => {
    setEditingId(null);

    setName("");
    setCode("");
    setType("");
    setRegion("");
    setDistrict("");
    setDistributor("");
    setAddress("");
    setContactPerson("");
    setPhone("");
    setFieldErrors({});

    fetchDistricts();
    setDistributors([]);
  };

  // ========================================
  // CANCEL CREATE / EDIT
  // ========================================

  const handleCancelForm = () => {
    clearForm();
    setShowCreateForm(false);
    setError("");
    setSuccess("");
  };

  // ========================================
  // EDIT OUTLET
  // ========================================

  const handleEdit = async (outlet) => {
    setShowCreateForm(true);
    setEditingId(outlet._id);

    setName(outlet.name || "");
    setCode(outlet.code || "");
    setType(outlet.type || "");
    setAddress(outlet.address || "");
    setContactPerson(outlet.contactPerson || "");
    setPhone(outlet.phone || "");

    const districtId = outlet.district?._id || outlet.district || "";
    const distributorId = outlet.distributor?._id || outlet.distributor || "";
    const regionId =
      outlet.district?.region?._id || outlet.district?.region || "";

    setRegion(regionId);
    setDistrict(districtId);
    setDistributor(distributorId);
    setFieldErrors({});

    if (regionId) {
      await fetchDistricts(regionId);
    }

    if (districtId) {
      await fetchDistributors(districtId);
    }
  };

  // ========================================
  // UPDATE OUTLET STATUS
  // ========================================

  const handleStatusChange = async (outlet) => {
    setError("");
    setSuccess("");

    const newStatus = outlet.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await api.patch(`/outlets/${outlet._id}/status`, {
        status: newStatus,
      });

      setSuccess(response.data.message || "Outlet status updated successfully");
      await fetchOutlets();
      await fetchAllOutlets();
    } catch (error) {
      console.error(
        "Update Outlet Status Error:",
        error.response?.data || error.message,
      );
      setError(
        error.response?.data?.message || "Failed to update outlet status",
      );
    }
  };

  // ========================================
  // ADD EXISTING ASSET
  // ========================================

  const handleAddExistingAsset = () => {
    if (!searchedOutlet?._id) {
      return;
    }
    navigate(`/outlets/${searchedOutlet._id}/add-existing-asset`);
  };

  // ========================================
  // FILTER REGION CHANGE
  // ========================================

  const handleFilterRegionChange = async (e) => {
    const selectedRegion = e.target.value;

    setFilterRegion(selectedRegion);
    setFilterDistrict("");
    setFilterDistributor("");

    if (selectedRegion) {
      await fetchDistricts(selectedRegion);
    } else {
      await fetchDistricts();
    }

    setDistributors([]);
  };

  // ========================================
  // FILTER DISTRICT CHANGE
  // ========================================

  const handleFilterDistrictChange = async (e) => {
    const selectedDistrict = e.target.value;

    setFilterDistrict(selectedDistrict);
    setFilterDistributor("");

    if (selectedDistrict) {
      await fetchDistributors(selectedDistrict);
    } else {
      setDistributors([]);
    }
  };

  // ========================================
  // BACK TO OUTLETS
  // ========================================

  const handleBackToOutlets = () => {
    setSearchedOutlet(null);
    setVerifiedAssets([]);
    setSearchError("");
    setSearchMessage("");
    navigate("/outlets");
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <AppPageLayout>
      <div className="outlet-page">
        {/* ========================================
          PAGE HEADER
          ======================================== */}

        <div className="outlet-page-header">
          <div className="outlet-header-left">
            <button
              type="button"
              className="back-dashboard-btn"
              onClick={handleBackToOutlets}
            >
              ← Back to Outlets
            </button>

            <div className="outlet-header-title">
              <p className="outlet-eyebrow">ASSET MANAGEMENT</p>
              <h1>Outlet Management</h1>
              <p>
                Search an outlet by phone number to view its verified assets.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================
          GLOBAL NOTIFICATION POPUPS
          ======================================== */}

        {error && (
          <div className="outlet-message error-message" role="alert">
            <div className="add-asset-message-icon">!</div>
            <div className="add-asset-message-content">
              <strong>Error</strong>
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="app-notification-close"
              onClick={() => setError("")}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="outlet-message success-message" role="status">
            <div className="add-asset-message-icon">✓</div>
            <div className="add-asset-message-content">
              <strong>Success</strong>
              <span>{success}</span>
            </div>
            <button
              type="button"
              className="app-notification-close"
              onClick={() => setSuccess("")}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* ========================================
          SEARCH SECTION
          ======================================== */}

        <section className="outlet-search-card">
          <div className="section-title">
            <h2>Find Outlet</h2>
            <span>Search using outlet phone number</span>
          </div>

          <form className="outlet-search-form" onSubmit={handleSearchOutlet}>
            <div className="search-input-wrapper">
              <label>Outlet Phone Number</label>
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Enter outlet phone number"
              />
            </div>

            <button
              type="submit"
              className="search-outlet-btn"
              disabled={searching}
            >
              {searching ? "Searching..." : "Search Outlet"}
            </button>
          </form>
        </section>

        {/* ========================================
          OUTLET NOT FOUND
          ======================================== */}

        {!searching && searchMessage === "Outlet Not Found" && (
          <section className="outlet-not-found-card">
            <div className="not-found-icon">!</div>
            <div>
              <h3>Outlet Not Found</h3>
              <p>
                No outlet was found with phone number{" "}
                <strong>{searchPhone}</strong>.
              </p>
              <p>You can create a new outlet using this phone number.</p>
            </div>
            <button
              className="create-new-outlet-btn"
              onClick={handleCreateNewOutlet}
            >
              + Create New Outlet
            </button>
          </section>
        )}

        {/* ========================================
          CREATE / EDIT OUTLET
          ======================================== */}

        {showCreateForm && (
          <section ref={createFormRef} className="outlet-form-card">
            <div className="form-header">
              <div>
                <h2>{editingId ? "Edit Outlet" : "Create New Outlet"}</h2>
                <p>Enter the outlet information below.</p>
              </div>

              <button
                type="button"
                className="close-form-btn"
                onClick={handleCancelForm}
              >
                ×
              </button>
            </div>

            <form className="outlet-form" onSubmit={handleSubmit}>
              {/* REGION */}
              <div className="form-group">
                <label>Region *</label>
                <select value={region} onChange={handleRegionChange}>
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

              {/* DISTRICT */}
              <div className="form-group">
                <label>District *</label>
                <select
                  value={district}
                  onChange={handleDistrictChange}
                  disabled={!region}
                >
                  <option value="">Select District</option>
                  {districts
                    .filter((item) => item.status === "ACTIVE")
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* DISTRIBUTOR */}
              <div className="form-group">
                <label>Distributor</label>
                <select
                  value={distributor}
                  onChange={(e) => setDistributor(e.target.value)}
                  disabled={!district}
                >
                  <option value="">No Distributor</option>
                  {distributors
                    .filter((item) => item.status === "ACTIVE")
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* NAME */}
              <div className="form-group">
                <label>Outlet Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter outlet name"
                />
              </div>

              {/* CODE */}
              <div className="form-group">
                <label>Outlet Code *</label>
                <input
                  type="text"
                  className={fieldErrors.code ? "field-invalid" : ""}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setFieldErrors((current) => ({ ...current, code: "" }));
                  }}
                  placeholder="Enter outlet code"
                />
                <small className="outlet-code-hint">
                  Suggested: {getSuggestedOutletCode()}
                </small>
                {fieldErrors.code && (
                  <small className="field-error-message">
                    {fieldErrors.code}
                  </small>
                )}
              </div>

              {/* TYPE */}
              <div className="form-group">
                <label>Outlet Type *</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">Select Outlet Type</option>
                  <option value="Retail">Retail</option>
                  <option value="Distributor">Distributor</option>
                </select>
              </div>

              {/* ADDRESS */}
              <div className="form-group full-width">
                <label>Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter outlet address"
                  rows="3"
                />
              </div>

              {/* CONTACT PERSON */}
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Enter contact person name"
                />
              </div>

              {/* PHONE */}
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  className={fieldErrors.phone ? "field-invalid" : ""}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setFieldErrors((current) => ({ ...current, phone: "" }));
                  }}
                  placeholder="Enter phone number"
                />
                {fieldErrors.phone && (
                  <small className="field-error-message">
                    {fieldErrors.phone}
                  </small>
                )}
              </div>

              {/* ACTIONS */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Outlet"
                      : "Create Outlet"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ========================================
          SEARCH RESULT DETAILS
          ======================================== */}

        {searchedOutlet && (
          <section className="outlet-details-card">
            <div className="details-header">
              <div>
                <span className="details-eyebrow">Outlet profile</span>
                <h2>{searchedOutlet.name}</h2>
                <span className="outlet-code-badge">
                  {searchedOutlet.code || "NO CODE"}
                </span>
              </div>
              <div className="details-header-actions">
                <button
                  type="button"
                  className="edit-outlet-btn"
                  onClick={() => handleEdit(searchedOutlet)}
                >
                  Edit Outlet
                </button>
                <button
                  type="button"
                  className="add-existing-asset-btn"
                  onClick={handleAddExistingAsset}
                >
                  + Add Existing Asset
                </button>
              </div>
            </div>

            <div className="outlet-info-grid">
              <div className="info-item">
                <label>Phone</label>
                <p>{searchedOutlet.phone || "N/A"}</p>
              </div>
              <div className="info-item">
                <label>Type</label>
                <p>{searchedOutlet.type || "N/A"}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span
                  className={`status-pill ${
                    searchedOutlet.status === "ACTIVE" ? "active" : "inactive"
                  }`}
                >
                  {searchedOutlet.status}
                </span>
              </div>
              <div className="info-item">
                <label>Contact Person</label>
                <p>{searchedOutlet.contactPerson || "N/A"}</p>
              </div>
              <div className="info-item">
                <label>Region</label>
                <p>{searchedOutlet.district?.region?.name || "N/A"}</p>
              </div>
              <div className="info-item">
                <label>District</label>
                <p>{searchedOutlet.district?.name || "N/A"}</p>
              </div>
              <div className="info-item full">
                <label>Address</label>
                <p>{searchedOutlet.address || "N/A"}</p>
              </div>
            </div>

            {/* VERIFIED ASSETS TABLE */}
            <div className="verified-assets-section">
              <div className="verified-assets-header">
                <div>
                  <span className="section-kicker">Inventory snapshot</span>
                  <h3>Verified Freezers at this Outlet</h3>
                  <p>Assets currently mapped and verified for this location.</p>
                </div>
                <span className="asset-count-badge">
                  {verifiedAssets.length}
                  <small>
                    {verifiedAssets.length === 1 ? "freezer" : "freezers"}
                  </small>
                </span>
              </div>
              {verifiedAssets.length === 0 ? (
                <div className="no-assets-message">
                  No verified assets currently assigned to this outlet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="assets-table">
                    <thead>
                      <tr>
                        <th>Serial Number</th>
                        <th>AIN</th>
                        <th>Manufacturer</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifiedAssets.map((asset) => (
                        <tr key={asset._id}>
                          <td>{asset.serialNumber || "N/A"}</td>
                          <td>{asset.ain || "N/A"}</td>
                          <td>{asset.manufacturer?.name || "N/A"}</td>
                          <td>
                            {asset.capacity ? `${asset.capacity} L` : "N/A"}
                          </td>
                          <td>
                            <span className="status-badge active">
                              {asset.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/assets/${asset._id}`}
                              className="view-asset-btn"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ========================================
          ALL OUTLETS LIST / FILTERS
          ======================================== */}

        {!searchedOutlet && (
          <section className="outlets-list-card">
            <div className="list-header">
              <div>
                <h2>All Registered Outlets</h2>
                <p>Showing {outlets.length} total outlets</p>
              </div>
              <button
                type="button"
                className="create-outlet-btn-primary"
                onClick={handleCreateNewOutlet}
              >
                + Add New Outlet
              </button>
            </div>

            {/* FILTERS */}
            <div className="list-filters">
              <div className="filter-group">
                <label>Region</label>
                <select
                  value={filterRegion}
                  onChange={handleFilterRegionChange}
                >
                  <option value="">All Regions</option>
                  {regions.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>District</label>
                <select
                  value={filterDistrict}
                  onChange={handleFilterDistrictChange}
                >
                  <option value="">All Districts</option>
                  {districts.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Distributor</label>
                <select
                  value={filterDistributor}
                  onChange={(e) => setFilterDistributor(e.target.value)}
                >
                  <option value="">All Distributors</option>
                  {distributors.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="filter-group search-group">
                <label>Search Name / Phone</label>
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Type to search..."
                />
              </div>
            </div>

            {/* TABLE */}
            {loading ? (
              <div className="outlets-loading">Loading outlets...</div>
            ) : outlets.length === 0 ? (
              <div className="no-outlets-found">
                No outlets match your filter criteria.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="outlets-table">
                  <thead>
                    <tr>
                      <th>Outlet</th>
                      <th>Code</th>
                      <th>Region</th>
                      <th>District</th>
                      <th>Distributor</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outlets.map((outlet) => (
                      <tr key={outlet._id}>
                        <td>
                          <div className="outlet-cell">
                            <button
                              type="button"
                              className="outlet-name-link"
                              onClick={() => showOutletDetails(outlet)}
                            >
                              {outlet.name}
                            </button>
                            <span>{outlet.type || "Retail"}</span>
                          </div>
                        </td>
                        <td>{outlet.code}</td>
                        <td>{outlet.district?.region?.name || "N/A"}</td>
                        <td>{outlet.district?.name || "N/A"}</td>
                        <td>{outlet.distributor?.name || "No Distributor"}</td>
                        <td>{outlet.phone || "N/A"}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              outlet.status === "ACTIVE" ? "active" : "inactive"
                            }`}
                          >
                            {outlet.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() => handleEdit(outlet)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`status-btn ${
                                outlet.status === "ACTIVE"
                                  ? "status-btn-deactivate"
                                  : "status-btn-activate"
                              }`}
                              onClick={() => handleStatusChange(outlet)}
                            >
                              {outlet.status === "ACTIVE"
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
        )}
      </div>
    </AppPageLayout>
  );
}

export default Outlets;
