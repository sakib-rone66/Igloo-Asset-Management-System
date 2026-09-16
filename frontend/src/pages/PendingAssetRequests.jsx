import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./PendingAssetRequests.css";

function PendingAssetRequests() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [pendingRequests, setPendingRequests] = useState([]);

  const [allRequests, setAllRequests] = useState([]);

  // ========================================
  // FILTERS
  // ========================================

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  // ========================================
  // UI
  // ========================================

  const [loadingPending, setLoadingPending] = useState(true);

  const [loadingAll, setLoadingAll] = useState(true);

  const [processingId, setProcessingId] = useState(null);

  // ========================================
  // REVIEW MODAL
  // ========================================

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [decision, setDecision] = useState("");

  const [remarks, setRemarks] = useState("");

  const [showReviewModal, setShowReviewModal] = useState(false);

  // ========================================
  // MESSAGES
  // ========================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const messageRef = useRef(null);

  // ========================================
  // FETCH PENDING
  // ========================================

  const fetchPendingRequests = async () => {
    try {
      setLoadingPending(true);

      const response = await api.get("/asset-requests/pending");

      setPendingRequests(response.data.assetRequests || []);
    } catch (error) {
      console.error(
        "Get Pending Asset Requests Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load pending asset requests.",
      );
    } finally {
      setLoadingPending(false);
    }
  };

  // ========================================
  // FETCH ALL
  // ========================================

  const fetchAllRequests = async () => {
    try {
      setLoadingAll(true);

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

      const response = await api.get("/asset-requests/all", {
        params,
      });

      setAllRequests(response.data.assetRequests || []);
    } catch (error) {
      console.error(
        "Get All Asset Requests Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load asset request history.",
      );
    } finally {
      setLoadingAll(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    fetchAllRequests();
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
  // OPEN REVIEW
  // ========================================

  const openReview = (request) => {
    clearMessages();

    setSelectedRequest(request);

    setDecision("");

    setRemarks("");

    setShowReviewModal(true);
  };

  // ========================================
  // CLOSE REVIEW
  // ========================================

  const closeReview = () => {
    setSelectedRequest(null);

    setDecision("");

    setRemarks("");

    setShowReviewModal(false);
  };

  // ========================================
  // SUBMIT DECISION
  // ========================================

  const handleDecision = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!selectedRequest) {
      return;
    }

    if (!decision) {
      setError("Please select Approve or Reject.");
      return;
    }

    if (decision === "REJECTED" && !remarks.trim()) {
      setError("Rejection remarks are required.");
      return;
    }

    try {
      setProcessingId(selectedRequest._id);

      const response = await api.patch(
        `/asset-requests/${selectedRequest._id}/status`,
        {
          status: decision,
          remarks: remarks.trim() || undefined,
        },
      );

      setSuccess(
        response.data.message || "Asset request updated successfully.",
      );

      closeReview();

      await Promise.all([fetchPendingRequests(), fetchAllRequests()]);

      // Let Sidebar update its pending count
      window.dispatchEvent(new Event("incoming-requests-updated"));
    } catch (error) {
      console.error(
        "Review Asset Request Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to update asset request.",
      );
    } finally {
      setProcessingId(null);
    }
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
        return "pending-asset-request-status approved";

      case "REJECTED":
        return "pending-asset-request-status rejected";

      default:
        return "pending-asset-request-status pending";
    }
  };

  // ========================================
  // DATE
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
      className={`pending-asset-request-layout ${
        sidebarOpen
          ? "pending-asset-request-sidebar-open"
          : "pending-asset-request-sidebar-closed"
      }`}
    >
      {/* SIDEBAR */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* MAIN */}

      <div className="pending-asset-request-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="pending-asset-request-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        )}

        <main className="pending-asset-request-content">
          {/* BACK */}

          <Link to="/dashboard" className="pending-asset-request-back">
            ← Back to Dashboard
          </Link>

          {/* HEADER */}

          <section className="pending-asset-request-header">
            <p className="pending-asset-request-eyebrow">INCOMING REQUESTS</p>

            <div className="pending-asset-request-title-row">
              <div>
                <h2>Pending Asset Requests</h2>

                <p>
                  Review incoming asset requests and manage request history.
                </p>
              </div>
            </div>
          </section>

          {/* MESSAGES */}

          {(error || success) && (
            <div
              ref={messageRef}
              className={`pending-asset-request-message ${
                error
                  ? "pending-asset-request-error"
                  : "pending-asset-request-success"
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
              PENDING
              ======================================== */}

          <section className="pending-asset-request-section">
            <div className="pending-asset-request-section-heading">
              <div>
                <h3>New Asset Requests</h3>

                <p>Review and approve or reject requests waiting for action.</p>
              </div>

              <span className="pending-asset-request-count">
                Pending: {pendingRequests.length}
              </span>
            </div>

            {loadingPending ? (
              <div className="pending-asset-request-empty-state">
                <div className="pending-asset-request-loading-spinner" />

                <p>Loading pending requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="pending-asset-request-empty-state">
                <div className="pending-asset-request-empty-icon">✓</div>

                <strong>No pending asset requests</strong>

                <p>There are currently no requests waiting for approval.</p>
              </div>
            ) : (
              <div className="pending-asset-request-table-card">
                <table className="pending-asset-request-table">
                  <thead>
                    <tr>
                      <th>Outlet</th>
                      <th>Requested By</th>
                      <th>Quantity</th>
                      <th>Reason</th>
                      <th>Requested</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingRequests.map((request) => (
                      <tr key={request._id}>
                        <td className="pending-asset-request-outlet-cell">
                          <strong>{request.outlet?.name}</strong>

                          <span>{request.outlet?.outletCode}</span>
                        </td>

                        <td className="pending-asset-request-user-cell">
                          <strong>{request.requestedBy?.name}</strong>

                          <span>{request.requestedBy?.email}</span>
                        </td>

                        <td>
                          <span className="pending-asset-request-quantity">
                            {request.quantity}
                          </span>
                        </td>

                        <td className="pending-asset-request-reason-cell">
                          {request.reason}
                        </td>

                        <td className="pending-asset-request-date-cell">
                          {formatDate(request.createdAt)}
                        </td>

                        <td className="pending-asset-request-actions">
                          <button
                            type="button"
                            className="pending-asset-request-review-button"
                            onClick={() => openReview(request)}
                            disabled={processingId === request._id}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ========================================
              ALL REQUESTS
              ======================================== */}

          <section className="pending-asset-request-section">
            <div className="pending-asset-request-section-heading">
              <div>
                <h3>All Asset Requests</h3>

                <p>Complete asset request history across the system.</p>
              </div>

              <span className="pending-asset-request-history-count">
                {allRequests.length} Records
              </span>
            </div>

            {/* FILTER */}

            <div className="pending-asset-request-filter-card">
              <div className="pending-asset-request-filter-header">
                <div>
                  <h3>Search & Filter</h3>

                  <p>Search requests and filter by status or date.</p>
                </div>
              </div>

              <div className="pending-asset-request-filter-form">
                <div className="pending-asset-request-field">
                  <label>Search</label>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search outlet, user or reason"
                  />
                </div>

                <div className="pending-asset-request-field">
                  <label>Status</label>

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="">All Statuses</option>

                    <option value="PENDING">Pending</option>

                    <option value="APPROVED">Approved</option>

                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="pending-asset-request-field">
                  <label>From Date</label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                </div>

                <div className="pending-asset-request-field">
                  <label>To Date</label>

                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="pending-asset-request-clear-filter"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* TABLE */}

            {loadingAll ? (
              <div className="pending-asset-request-empty-state">
                <div className="pending-asset-request-loading-spinner" />

                <p>Loading asset request history...</p>
              </div>
            ) : allRequests.length === 0 ? (
              <div className="pending-asset-request-empty-state">
                <div className="pending-asset-request-empty-icon">◯</div>

                <strong>No asset requests found</strong>

                <p>No records match the selected filters.</p>
              </div>
            ) : (
              <div className="pending-asset-request-table-card">
                <table className="pending-asset-request-table">
                  <thead>
                    <tr>
                      <th>Outlet</th>
                      <th>Requested By</th>
                      <th>Quantity</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Reviewed By</th>
                      <th>Reviewed</th>
                    </tr>
                  </thead>

                  <tbody>
                    {allRequests.map((request) => (
                      <tr key={request._id}>
                        <td className="pending-asset-request-outlet-cell">
                          <strong>{request.outlet?.name}</strong>

                          <span>{request.outlet?.outletCode}</span>
                        </td>

                        <td className="pending-asset-request-user-cell">
                          <strong>{request.requestedBy?.name}</strong>

                          <span>{request.requestedBy?.email}</span>
                        </td>

                        <td>
                          <span className="pending-asset-request-quantity">
                            {request.quantity}
                          </span>
                        </td>

                        <td className="pending-asset-request-reason-cell">
                          {request.reason}
                        </td>

                        <td>
                          <span className={getStatusClass(request.status)}>
                            {request.status}
                          </span>
                        </td>

                        <td className="pending-asset-request-date-cell">
                          {formatDate(request.createdAt)}
                        </td>

                        <td className="pending-asset-request-user-cell">
                          {request.reviewedBy ? (
                            <>
                              <strong>{request.reviewedBy.name}</strong>

                              <span>{request.reviewedBy.email}</span>
                            </>
                          ) : (
                            <span>Not reviewed</span>
                          )}
                        </td>

                        <td className="pending-asset-request-date-cell">
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

      {/* ========================================
          REVIEW MODAL
          ======================================== */}

      {showReviewModal && selectedRequest && (
        <div
          className="pending-asset-request-modal-overlay"
          onClick={closeReview}
        >
          <div
            className="pending-asset-request-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pending-asset-request-modal-header">
              <div>
                <h2>Review Asset Request</h2>

                <p>Approve or reject the incoming request.</p>
              </div>

              <button
                type="button"
                className="pending-asset-request-modal-close"
                onClick={closeReview}
              >
                ×
              </button>
            </div>

            {/* REQUEST INFO */}

            <div className="pending-asset-request-review-info">
              <div>
                <span>Outlet</span>

                <strong>{selectedRequest.outlet?.name}</strong>
              </div>

              <div>
                <span>Requested By</span>

                <strong>{selectedRequest.requestedBy?.name}</strong>
              </div>

              <div>
                <span>Quantity</span>

                <strong>{selectedRequest.quantity}</strong>
              </div>

              <div>
                <span>Reason</span>

                <strong>{selectedRequest.reason}</strong>
              </div>
            </div>

            <form
              className="pending-asset-request-review-form"
              onSubmit={handleDecision}
            >
              <div className="pending-asset-request-field">
                <label>
                  Decision <span>*</span>
                </label>

                <select
                  value={decision}
                  onChange={(event) => setDecision(event.target.value)}
                >
                  <option value="">Select decision</option>

                  <option value="APPROVED">Approve</option>

                  <option value="REJECTED">Reject</option>
                </select>
              </div>

              <div className="pending-asset-request-field">
                <label>
                  Remarks {decision === "REJECTED" && <span>*</span>}
                </label>

                <textarea
                  rows="4"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder={
                    decision === "REJECTED"
                      ? "Enter rejection reason"
                      : "Enter optional remarks"
                  }
                />
              </div>

              <div className="pending-asset-request-modal-actions">
                <button
                  type="button"
                  className="pending-asset-request-modal-cancel"
                  onClick={closeReview}
                  disabled={processingId === selectedRequest._id}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="pending-asset-request-modal-submit"
                  disabled={processingId === selectedRequest._id}
                >
                  {processingId === selectedRequest._id
                    ? "Processing..."
                    : "Submit Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingAssetRequests;
