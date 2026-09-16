import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./RepairRequest.css";

function RepairRequest() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // FORM
  // ========================================

  const [assetAIN, setAssetAIN] = useState("");
  const [problem, setProblem] = useState("");
  const [serviceProvider, setServiceProvider] = useState("");
  const [remarks, setRemarks] = useState("");
  const [repairCost, setRepairCost] = useState("");

  // ========================================
  // ASSET
  // ========================================

  const [asset, setAsset] = useState(null);
  const [assetSearching, setAssetSearching] = useState(false);

  // ========================================
  // REPAIRS
  // ========================================

  const [repairs, setRepairs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ainFilter, setAinFilter] = useState("");
  const [outletFilter, setOutletFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // ========================================
  // MESSAGES
  // ========================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const messageRef = useRef(null);

  // ========================================
  // FETCH MY REPAIRS
  // ========================================

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/repairs/my");

      setRepairs(response.data.repairs || []);
    } catch (error) {
      console.error(
        "Get My Repairs Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to load repair requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
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
      setError("");
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error, success]);

  // ========================================
  // SEARCH ASSET BY AIN
  // ========================================

  const handleAINSearch = async () => {
    if (!assetAIN.trim()) {
      setError("Please enter an AIN.");
      setAsset(null);
      return;
    }

    try {
      setAssetSearching(true);
      setError("");
      setSuccess("");
      setAsset(null);

      const response = await api.get(
        `/repairs/asset/ain/${encodeURIComponent(assetAIN.trim())}`,
      );

      const foundAsset = response.data.asset;

      setAsset(foundAsset);

      if (foundAsset.status !== "ASSIGNED") {
        setError(
          `Repair request cannot be created because this asset is ${formatStatus(
            foundAsset.status,
          )}.`,
        );
      }
    } catch (error) {
      console.error(
        "Search Asset Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to find asset.");
    } finally {
      setAssetSearching(false);
    }
  };

  // ========================================
  // SUBMIT REPAIR REQUEST
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!assetAIN.trim()) {
      setError("AIN is required.");
      return;
    }

    if (!asset) {
      setError("Please search and select a valid asset first.");
      return;
    }

    if (!problem.trim()) {
      setError("Problem is required.");
      return;
    }

    if (!remarks.trim()) {
      setError("Remarks are required.");
      return;
    }

    if (repairCost !== "" && Number(repairCost) < 0) {
      setError("Repair cost cannot be negative.");
      return;
    }

    if (asset.status !== "ASSIGNED") {
      setError(
        `Repair cannot be requested because asset status is ${formatStatus(
          asset.status,
        )}.`,
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/repairs", {
        assetId: asset._id,
        problem: problem.trim(),
        serviceProvider: serviceProvider.trim(),
        remarks: remarks.trim(),
        repairCost: repairCost === "" ? 0 : Number(repairCost),
      });

      setSuccess(
        response.data.message || "Repair request submitted successfully.",
      );

      setAssetAIN("");
      setAsset(null);
      setProblem("");
      setServiceProvider("");
      setRemarks("");
      setRepairCost("");

      await fetchRepairs();
    } catch (error) {
      console.error(
        "Create Repair Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to submit repair request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // UPDATE REPAIR STATUS
  // ========================================

  const handleStatusChange = async (repair, newStatus) => {
    setError("");
    setSuccess("");

    try {
      setUpdatingId(repair._id);

      const response = await api.put(`/repairs/${repair._id}/status`, {
        status: newStatus,
      });

      setSuccess(
        response.data.message || "Repair status updated successfully.",
      );

      await fetchRepairs();
    } catch (error) {
      console.error(
        "Update Repair Status Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to update repair status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB");
  };

  const getAIN = (repair) => {
    return repair.asset?.AIN || repair.asset?.ain || "N/A";
  };

  const getOutlet = (repair) => {
    return (
      repair.asset?.currentOutlet?.name ||
      repair.asset?.outlet?.name ||
      repair.asset?.currentOutlet?.code ||
      "N/A"
    );
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getDateInputValue = (date) => {
    if (!date) return "";

    const value = new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const repairFilters = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "UNDER_REPAIR", label: "Under Repair" },
    { value: "COMPLETED", label: "Completed" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const filteredRepairs = repairs.filter((repair) => {
    const matchesAIN = getAIN(repair)
      .toLowerCase()
      .includes(ainFilter.trim().toLowerCase());
    const matchesOutlet = getOutlet(repair)
      .toLowerCase()
      .includes(outletFilter.trim().toLowerCase());
    const matchesDate =
      !dateFilter || getDateInputValue(repair.createdAt) === dateFilter;
    const matchesStatus =
      statusFilter === "ALL" || repair.status === statusFilter;

    return matchesAIN && matchesOutlet && matchesDate && matchesStatus;
  });

  const getFilterCount = (filter) =>
    filter === "ALL"
      ? repairs.length
      : repairs.filter((repair) => repair.status === filter).length;

  const clearFilters = () => {
    setAinFilter("");
    setOutletFilter("");
    setDateFilter("");
    setStatusFilter("ALL");
  };

  const hasActiveFilters =
    ainFilter || outletFilter || dateFilter || statusFilter !== "ALL";

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`repair-request-layout ${
        sidebarOpen
          ? "repair-request-sidebar-open"
          : "repair-request-sidebar-closed"
      }`}
    >
      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      <div className="repair-request-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="repair-request-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="repair-request-content">
          <Link to="/dashboard" className="repair-request-back-dashboard">
            ← Back to Dashboard
          </Link>

          {/* ========================================
              HEADER
              ======================================== */}

          <section className="repair-request-header">
            <p className="repair-request-eyebrow">ASSET MANAGEMENT</p>

            <h2>Repair Request</h2>

            <p>
              Submit a repair request for an assigned asset and track its
              progress.
            </p>
          </section>

          {/* ========================================
              MESSAGES
              ======================================== */}

          {(error || success) && (
            <div
              ref={messageRef}
              className={`repair-request-message ${
                error
                  ? "repair-request-error"
                  : "repair-request-success"
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
                onClick={() => {
                  setError("");
                  setSuccess("");
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* ========================================
              CREATE FORM
              ======================================== */}

          <section className="repair-request-card">
            <div className="repair-request-card-header">
              <div>
                <h3>Submit Repair Request</h3>

                <p>Provide the details of the asset that requires repair.</p>
              </div>

              <span className="repair-request-required">* Required</span>
            </div>

            <form className="repair-request-form" onSubmit={handleSubmit}>
              {/* AIN */}

              <div className="repair-request-field">
                <label htmlFor="repair-ain">
                  AIN <span>*</span>
                </label>

                <div className="repair-request-ain-search">
                  <input
                    id="repair-ain"
                    type="text"
                    value={assetAIN}
                    onChange={(e) => {
                      setAssetAIN(e.target.value);
                      setAsset(null);
                    }}
                    placeholder="Enter Asset AIN"
                    disabled={submitting}
                  />

                  <button
                    type="button"
                    onClick={handleAINSearch}
                    disabled={submitting || assetSearching}
                    className="repair-request-search-button"
                  >
                    {assetSearching ? "Searching..." : "Search"}
                  </button>
                </div>

                {asset && (
                  <div className="repair-request-asset-preview">
                    <div>
                      <span>AIN</span>
                      <strong>{asset.AIN || asset.ain || "N/A"}</strong>
                    </div>

                    <div>
                      <span>Status</span>
                      <strong>{formatStatus(asset.status)}</strong>
                    </div>

                    <div>
                      <span>Serial Number</span>
                      <strong>{asset.serialNumber || "N/A"}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* PROBLEM */}

              <div className="repair-request-field">
                <label htmlFor="repair-problem">
                  Problem <span>*</span>
                </label>

                <textarea
                  id="repair-problem"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe the problem"
                  disabled={submitting}
                  rows="4"
                />
              </div>

              {/* SERVICE PROVIDER */}

              <div className="repair-request-field">
                <label htmlFor="service-provider">Service Provider</label>

                <input
                  id="service-provider"
                  type="text"
                  value={serviceProvider}
                  onChange={(e) => setServiceProvider(e.target.value)}
                  placeholder="Enter service provider"
                  disabled={submitting}
                />

                <small>
                  Suggested: Authorized service center / Local technician /
                  Company service center
                </small>
              </div>

              {/* REMARKS */}

              <div className="repair-request-field">
                <label htmlFor="repair-remarks">
                  Remarks <span>*</span>
                </label>

                <textarea
                  id="repair-remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter additional information"
                  disabled={submitting}
                  rows="4"
                />
              </div>

              {/* COST */}

              <div className="repair-request-field">
                <label htmlFor="repair-cost">Repair Cost</label>

                <input
                  id="repair-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  placeholder="Enter estimated repair cost"
                  disabled={submitting}
                />
              </div>

              {/* ACTION */}

              <div className="repair-request-form-actions">
                <button
                  type="submit"
                  className="repair-request-submit-button"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Repair Request"}
                </button>
              </div>
            </form>
          </section>

          {/* ========================================
              MY REPAIR REQUESTS
              ======================================== */}

          <section className="repair-request-list-section">
            <div className="repair-request-list-heading">
              <div>
                <h3>My Repair Requests</h3>

                <p>
                  Showing <strong>{filteredRepairs.length}</strong> of{" "}
                  <strong>{repairs.length}</strong> repair requests
                </p>
              </div>
            </div>

            {!loading && repairs.length > 0 && (
              <div className="repair-request-filters">
                <div className="repair-request-filter-fields">
                  <label>
                    <span>Search by AIN</span>
                    <input
                      type="search"
                      value={ainFilter}
                      onChange={(event) => setAinFilter(event.target.value)}
                      placeholder="Enter AIN"
                    />
                  </label>

                  <label>
                    <span>Search by Outlet</span>
                    <input
                      type="search"
                      value={outletFilter}
                      onChange={(event) => setOutletFilter(event.target.value)}
                      placeholder="Enter outlet name"
                    />
                  </label>

                  <label>
                    <span>Reported date</span>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(event) => setDateFilter(event.target.value)}
                    />
                  </label>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="repair-request-clear-filters"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <div
                  className="repair-request-filter-bar"
                  aria-label="Filter repair requests by status"
                >
                  {repairFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      className={`repair-request-filter-button ${
                        statusFilter === filter.value
                          ? "repair-request-filter-button-active"
                          : ""
                      }`}
                      onClick={() => setStatusFilter(filter.value)}
                      aria-pressed={statusFilter === filter.value}
                    >
                      {filter.label}
                      <span>{getFilterCount(filter.value)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="repair-request-empty-state">
                <div className="repair-request-loading-spinner" />
                <p>Loading repair requests...</p>
              </div>
            ) : repairs.length === 0 ? (
              <div className="repair-request-empty-state">
                <div className="repair-request-empty-icon">◯</div>

                <strong>No repair requests found</strong>

                <p>You have not submitted any repair requests yet.</p>
              </div>
            ) : filteredRepairs.length === 0 ? (
              <div className="repair-request-empty-state">
                <div className="repair-request-empty-icon">⌕</div>

                <strong>No repair requests match these filters</strong>

                <p>Try changing or clearing one of the filters above.</p>
              </div>
            ) : (
              <div className="repair-request-table-card">
                <table className="repair-request-table">
                  <thead>
                    <tr>
                      <th>AIN</th>
                      <th>Outlet</th>
                      <th>Problem</th>
                      <th>Reported By</th>
                      <th>Status</th>
                      <th>Reported</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRepairs.map((repair) => (
                      <tr key={repair._id}>
                        <td className="repair-request-ain-cell">
                          {getAIN(repair)}
                        </td>

                        <td>{getOutlet(repair)}</td>

                        <td className="repair-request-problem-cell">
                          {repair.problem}
                        </td>

                        <td>{repair.reportedBy?.name || "N/A"}</td>

                        <td>
                          <span
                            className={`repair-request-status repair-request-status-${(
                              repair.status || ""
                            ).toLowerCase()}`}
                          >
                            {formatStatus(repair.status)}
                          </span>
                        </td>

                        <td className="repair-request-date-cell">
                          {formatDate(repair.createdAt)}
                        </td>

                        <td className="repair-request-actions-cell">
                          {repair.status === "UNDER_REPAIR" ? (
                            <select
                              value="UNDER_REPAIR"
                              disabled={updatingId === repair._id}
                              onChange={(e) =>
                                handleStatusChange(repair, e.target.value)
                              }
                            >
                              <option value="UNDER_REPAIR">Ongoing</option>

                              <option value="COMPLETED">Completed</option>
                            </select>
                          ) : repair.status === "COMPLETED" ? (
                            <span className="repair-request-completed-label">
                              Completed
                            </span>
                          ) : (
                            <span className="repair-request-no-action">—</span>
                          )}
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

export default RepairRequest;
