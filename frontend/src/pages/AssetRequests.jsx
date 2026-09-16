import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./AssetRequests.css";

function AssetRequest() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // OUTLETS
  // ========================================

  const [outlets, setOutlets] = useState([]);

  const [outletsLoading, setOutletsLoading] = useState(true);

  // ========================================
  // REQUESTS
  // ========================================

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // ========================================
  // FORM
  // ========================================

  const [outletId, setOutletId] = useState("");

  const [outletSearch, setOutletSearch] = useState("");

  const [showOutletDropdown, setShowOutletDropdown] = useState(false);

  const [quantity, setQuantity] = useState("");

  const [reason, setReason] = useState("");

  const [remarks, setRemarks] = useState("");

  // ========================================
  // FILTERS
  // ========================================

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  // ========================================
  // MESSAGES
  // ========================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const messageRef = useRef(null);

  // ========================================
  // FETCH OUTLETS
  // ========================================

  const fetchOutlets = async () => {
    try {
      setOutletsLoading(true);

      const response = await api.get("/outlets");

      setOutlets(response.data.outlets || []);
    } catch (error) {
      console.error(
        "Get Outlets Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to load outlets.");
    } finally {
      setOutletsLoading(false);
    }
  };

  // ========================================
  // FETCH MY REQUESTS
  // ========================================

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      if (fromDate) {
        params.fromDate = fromDate;
      }

      if (toDate) {
        params.toDate = toDate;
      }

      const response = await api.get("/asset-requests/my", {
        params,
      });

      setRequests(response.data.assetRequests || []);
    } catch (error) {
      console.error(
        "Get My Asset Requests Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to load your asset requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchOutlets();
  }, []);

  useEffect(() => {
    fetchMyRequests();
  }, [search, status, fromDate, toDate]);

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
  // CREATE REQUEST
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    // ========================================
    // VALIDATION
    // ========================================

    if (!outletId) {
      setError("Please select an outlet.");
      return;
    }

    if (
      !quantity ||
      Number(quantity) < 1 ||
      !Number.isInteger(Number(quantity))
    ) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    if (!reason.trim()) {
      setError("Reason is required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/asset-requests", {
        outletId,
        quantity: Number(quantity),
        reason: reason.trim(),
        remarks: remarks.trim() || null,
      });

      setSuccess(
        response.data.message || "Asset request created successfully.",
      );

      // ========================================
      // RESET FORM
      // ========================================

      setOutletId("");
      setOutletSearch("");
      setQuantity("");
      setReason("");
      setRemarks("");
      setShowOutletDropdown(false);

      // ========================================
      // REFRESH TABLE
      // ========================================

      await fetchMyRequests();
    } catch (error) {
      console.error(
        "Create Asset Request Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to create asset request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // FILTER OUTLETS
  // ========================================

  const filteredOutlets = outlets
    .filter((outlet) => outlet.status === "ACTIVE")
    .filter((outlet) => {
      const searchText = outletSearch.trim().toLowerCase();

      if (!searchText) {
        return true;
      }

      return (
        outlet.name?.toLowerCase().includes(searchText) ||
        outlet.outletCode?.toLowerCase().includes(searchText)
      );
    });

  // ========================================
  // SELECT OUTLET
  // ========================================

  const handleSelectOutlet = (outlet) => {
    setOutletId(outlet._id);

    setOutletSearch(
      `${outlet.name}${outlet.outletCode ? ` (${outlet.outletCode})` : ""}`,
    );

    setShowOutletDropdown(false);
  };

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setFromDate("");
    setToDate("");
  };

  // ========================================
  // STATUS CLASS
  // ========================================

  const getStatusClass = (requestStatus) => {
    switch (requestStatus) {
      case "APPROVED":
        return "asset-request-status approved";

      case "REJECTED":
        return "asset-request-status rejected";

      default:
        return "asset-request-status pending";
    }
  };

  // ========================================
  // DATE FORMAT
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
      className={`asset-request-layout ${
        sidebarOpen
          ? "asset-request-sidebar-open"
          : "asset-request-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="asset-request-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="asset-request-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        )}

        <main className="asset-request-content">
          {/* ========================================
              BACK
              ======================================== */}

          <Link to="/dashboard" className="asset-request-back">
            ← Back to Dashboard
          </Link>

          {/* ========================================
              HEADER
              ======================================== */}

          <section className="asset-request-header">
            <p className="asset-request-eyebrow">ASSET MANAGEMENT</p>

            <div className="asset-request-title-row">
              <div>
                <h2>Asset Request</h2>

                <p>
                  Request assets for an outlet and track your submitted
                  requests.
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
              className={`asset-request-message ${
                error ? "asset-request-error" : "asset-request-success"
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
              CREATE REQUEST
              ======================================== */}

          <section className="asset-request-card">
            <div className="asset-request-card-header">
              <div>
                <h3>Create Asset Request</h3>

                <p>Submit a request for assets required at an outlet.</p>
              </div>

              <span className="asset-request-required">* Required</span>
            </div>

            <form className="asset-request-form" onSubmit={handleSubmit}>
              {/* OUTLET */}

              <div className="asset-request-field asset-request-outlet-field">
                <label>
                  Outlet <span>*</span>
                </label>

                <div className="asset-request-combobox">
                  <input
                    type="text"
                    value={outletSearch}
                    onChange={(event) => {
                      setOutletSearch(event.target.value);

                      setOutletId("");

                      setShowOutletDropdown(true);
                    }}
                    onFocus={() => setShowOutletDropdown(true)}
                    placeholder={
                      outletsLoading
                        ? "Loading outlets..."
                        : "Search outlet by name or code"
                    }
                    disabled={outletsLoading || submitting}
                  />

                  {showOutletDropdown && !outletsLoading && (
                    <div className="asset-request-outlet-dropdown">
                      {filteredOutlets.length === 0 ? (
                        <div className="asset-request-outlet-empty">
                          No active outlets found.
                        </div>
                      ) : (
                        filteredOutlets.map((outlet) => (
                          <button
                            type="button"
                            key={outlet._id}
                            className="asset-request-outlet-option"
                            onClick={() => handleSelectOutlet(outlet)}
                          >
                            <strong>{outlet.name}</strong>

                            {outlet.outletCode && (
                              <span>{outlet.outletCode}</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {outletId && (
                  <small className="asset-request-selected-text">
                    ✓ Outlet selected
                  </small>
                )}
              </div>

              {/* QUANTITY */}

              <div className="asset-request-field">
                <label>
                  Quantity <span>*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Enter quantity"
                  disabled={submitting}
                />
              </div>

              {/* REASON */}

              <div className="asset-request-field">
                <label>
                  Reason <span>*</span>
                </label>

                <textarea
                  rows="4"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain why the assets are required"
                  disabled={submitting}
                />
              </div>

              {/* REMARKS */}

              <div className="asset-request-field">
                <label>Remarks</label>

                <textarea
                  rows="4"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Enter additional information (optional)"
                  disabled={submitting}
                />
              </div>

              {/* ACTION */}

              <div className="asset-request-form-actions">
                <button
                  type="button"
                  className="asset-request-cancel-button"
                  onClick={() => {
                    setOutletId("");
                    setOutletSearch("");
                    setQuantity("");
                    setReason("");
                    setRemarks("");
                    clearMessages();
                  }}
                  disabled={submitting}
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="asset-request-submit-button"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </section>

          {/* ========================================
              MY REQUESTS
              ======================================== */}

          <section className="asset-request-list-section">
            <div className="asset-request-list-heading">
              <div>
                <h3>My Asset Requests</h3>

                <p>View and track your submitted asset requests.</p>
              </div>

              <span className="asset-request-count">
                {requests.length} Requests
              </span>
            </div>

            {/* ========================================
                FILTER CARD
                ======================================== */}

            <div className="asset-request-filter-card">
              <div className="asset-request-filter-header">
                <div>
                  <h3>Search & Filter</h3>

                  <p>
                    Search by outlet, reason or remarks and filter by status or
                    date.
                  </p>
                </div>
              </div>

              <div className="asset-request-filter-form">
                {/* SEARCH */}

                <div className="asset-request-field">
                  <label htmlFor="asset-request-search">Search</label>

                  <input
                    id="asset-request-search"
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search requests..."
                  />
                </div>

                {/* STATUS */}

                <div className="asset-request-field">
                  <label htmlFor="asset-request-status">Status</label>

                  <select
                    id="asset-request-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="">All Statuses</option>

                    <option value="PENDING">Pending</option>

                    <option value="APPROVED">Approved</option>

                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* FROM DATE */}

                <div className="asset-request-field">
                  <label htmlFor="asset-request-from-date">From Date</label>

                  <input
                    id="asset-request-from-date"
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                </div>

                {/* TO DATE */}

                <div className="asset-request-field">
                  <label htmlFor="asset-request-to-date">To Date</label>

                  <input
                    id="asset-request-to-date"
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="asset-request-clear-filter"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* ========================================
                TABLE
                ======================================== */}

            {loading ? (
              <div className="asset-request-empty-state">
                <div className="asset-request-loading-spinner" />

                <p>Loading your requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="asset-request-empty-state">
                <div className="asset-request-empty-icon">◯</div>

                <strong>No asset requests found</strong>

                <p>
                  You have not submitted any requests matching the selected
                  filters.
                </p>
              </div>
            ) : (
              <div className="asset-request-table-card">
                <table className="asset-request-table">
                  <thead>
                    <tr>
                      <th>Outlet</th>
                      <th>Quantity</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Reviewed</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => (
                      <tr key={request._id}>
                        <td className="asset-request-outlet-cell">
                          <strong>{request.outlet?.name}</strong>

                          <span>{request.outlet?.outletCode}</span>
                        </td>

                        <td>
                          <span className="asset-request-quantity-badge">
                            {request.quantity}
                          </span>
                        </td>

                        <td className="asset-request-reason-cell">
                          {request.reason}
                        </td>

                        <td>
                          <span className={getStatusClass(request.status)}>
                            {request.status}
                          </span>
                        </td>

                        <td className="asset-request-date-cell">
                          {formatDate(request.createdAt)}
                        </td>

                        <td className="asset-request-date-cell">
                          {formatDate(request.reviewedAt)}
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

export default AssetRequest;
