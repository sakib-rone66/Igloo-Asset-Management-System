import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./AssetAuthorization.css";

function AssetAuthorization() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // AUTHORIZATION REQUESTS
  // ========================================

  const [authorizations, setAuthorizations] = useState([]);

  // ========================================
  // FILTER
  // ========================================

  const [statusFilter, setStatusFilter] = useState("PENDING");

  // ========================================
  // UI STATE
  // ========================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [processingId, setProcessingId] = useState(null);

  // ========================================
  // REJECTION MODAL
  // ========================================

  const [showRejectModal, setShowRejectModal] = useState(false);

  const [selectedAuthorization, setSelectedAuthorization] = useState(null);

  const [rejectionReason, setRejectionReason] = useState("");

  // ========================================
  // FETCH AUTHORIZATIONS
  // ========================================

  useEffect(() => {
    fetchAuthorizations();
  }, []);

  const fetchAuthorizations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/authorizations");

      setAuthorizations(response.data.authorizations || []);
    } catch (error) {
      console.error(
        "Get Authorization Requests Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load authorization requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // SHOW SUCCESS
  // ========================================

  const showSuccessMessage = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  // ========================================
  // APPROVE REQUEST
  // ========================================

  const handleApprove = async (authorizationId) => {
    try {
      setProcessingId(authorizationId);
      setError("");

      const response = await api.patch(
        `/authorizations/${authorizationId}/decision`,
        {
          decision: "APPROVED",
        },
      );

      showSuccessMessage(
        response.data.message || "Authorization approved successfully.",
      );

      window.dispatchEvent(new Event("incoming-requests-updated"));

      // Refresh list
      await fetchAuthorizations();
    } catch (error) {
      console.error(
        "Approve Authorization Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to approve authorization.",
      );

      setTimeout(() => {
        setError("");
      }, 4000);
    } finally {
      setProcessingId(null);
    }
  };

  // ========================================
  // OPEN REJECT MODAL
  // ========================================

  const openRejectModal = (authorization) => {
    setSelectedAuthorization(authorization);

    setRejectionReason("");

    setShowRejectModal(true);
  };

  // ========================================
  // CLOSE REJECT MODAL
  // ========================================

  const closeRejectModal = () => {
    if (processingId) {
      return;
    }

    setShowRejectModal(false);

    setSelectedAuthorization(null);

    setRejectionReason("");
  };

  // ========================================
  // REJECT REQUEST
  // ========================================

  const handleReject = async () => {
    if (!selectedAuthorization) {
      return;
    }

    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");

      setTimeout(() => {
        setError("");
      }, 3000);

      return;
    }

    try {
      setProcessingId(selectedAuthorization._id);

      setError("");

      const response = await api.patch(
        `/authorizations/${selectedAuthorization._id}/decision`,
        {
          decision: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        },
      );

      showSuccessMessage(
        response.data.message || "Authorization rejected successfully.",
      );

      window.dispatchEvent(new Event("incoming-requests-updated"));

      closeRejectModal();

      await fetchAuthorizations();
    } catch (error) {
      console.error(
        "Reject Authorization Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to reject authorization.",
      );

      setTimeout(() => {
        setError("");
      }, 4000);
    } finally {
      setProcessingId(null);
    }
  };

  // ========================================
  // FILTER
  // ========================================

  const filteredAuthorizations = authorizations
    .filter((authorization) => {
      if (statusFilter === "ALL") {
        return true;
      }

      return authorization.status === statusFilter;
    })
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );

  // ========================================
  // COUNTS
  // ========================================

  const pendingCount = authorizations.filter(
    (item) => item.status === "PENDING",
  ).length;

  const approvedCount = authorizations.filter(
    (item) => item.status === "APPROVED",
  ).length;

  const rejectedCount = authorizations.filter(
    (item) => item.status === "REJECTED",
  ).length;

  // ========================================
  // DATE FORMAT
  // ========================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`authorization-layout ${
        sidebarOpen
          ? "authorization-sidebar-open"
          : "authorization-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="authorization-main">
        <Navbar />

        {/* SHOW SIDEBAR */}

        {!sidebarOpen && (
          <button
            type="button"
            className="authorization-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="authorization-content">
          {/* ========================================
              HEADER
              ======================================== */}

          <section className="authorization-header">
            <div>
              <Link to="/assets" className="authorization-back">
                ← Back to Assets
              </Link>

              <p className="authorization-eyebrow">INCOMING REQUESTS</p>

              <h2>Asset Authorization</h2>

              <p>
                Review asset registration requests and approve or reject them.
              </p>
            </div>
          </section>

          {/* ========================================
              SUCCESS
              ======================================== */}

          {success && (
            <div className="authorization-message authorization-success">
              <span className="authorization-message-icon">✓</span>

              <div>
                <strong>Success</strong>

                <span>{success}</span>
              </div>
            </div>
          )}

          {/* ========================================
              ERROR
              ======================================== */}

          {error && (
            <div className="authorization-message authorization-error">
              <span className="authorization-message-icon">!</span>

              <div>
                <strong>Error</strong>

                <span>{error}</span>
              </div>
            </div>
          )}

          {/* ========================================
              SUMMARY CARDS
              ======================================== */}

          <section className="authorization-summary">
            <div className="authorization-summary-card">
              <span>Pending</span>

              <strong>{pendingCount}</strong>
            </div>

            <div className="authorization-summary-card">
              <span>Approved</span>

              <strong>{approvedCount}</strong>
            </div>

            <div className="authorization-summary-card">
              <span>Rejected</span>

              <strong>{rejectedCount}</strong>
            </div>
          </section>

          {/* ========================================
              FILTER
              ======================================== */}

          <section className="authorization-filter-card">
            <div>
              <label htmlFor="authorization-status">Request Status</label>

              <select
                id="authorization-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="PENDING">Pending</option>

                <option value="APPROVED">Approved</option>

                <option value="REJECTED">Rejected</option>

                <option value="ALL">All Requests</option>
              </select>
            </div>

            <button
              type="button"
              className="authorization-refresh-button"
              onClick={fetchAuthorizations}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </section>

          {/* ========================================
              TABLE
              ======================================== */}

          <section className="authorization-table-card">
            <div className="authorization-table-header">
              <div>
                <h3>Authorization Requests</h3>

                <p>
                  {filteredAuthorizations.length} request
                  {filteredAuthorizations.length !== 1 ? "s" : ""}
                </p>
              </div>

              <span className="authorization-status-badge">{statusFilter}</span>
            </div>

            {/* LOADING */}

            {loading && (
              <div className="authorization-loading">
                <div className="authorization-spinner" />

                <span>Loading authorization requests...</span>
              </div>
            )}

            {/* TABLE */}

            {!loading && (
              <div className="authorization-table-wrapper">
                <table className="authorization-table">
                  <thead>
                    <tr>
                      <th>Requester</th>

                      <th>Manufacturer</th>

                      <th>Asset Type / Outlet</th>

                      <th>Capacity</th>

                      <th>Manufacturing</th>

                      <th>Requested</th>

                      <th>Status</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAuthorizations.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="authorization-empty">
                          <div>
                            <span>✓</span>

                            <strong>No requests found</strong>

                            <p>
                              There are no {statusFilter.toLowerCase()}{" "}
                              authorization requests.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAuthorizations.map((authorization) => (
                        <tr key={authorization._id}>
                          {/* REQUESTER */}

                          <td>
                            <div className="authorization-requester">
                              <strong>
                                {authorization.requestedBy?.name || "N/A"}
                              </strong>

                              <span>
                                {authorization.requestedBy?.email || ""}
                              </span>
                            </div>
                          </td>

                          {/* MANUFACTURER */}

                          <td>
                            <div className="authorization-manufacturer">
                              <strong>
                                {authorization.manufacturer?.name || "N/A"}
                              </strong>

                              <span>
                                {authorization.manufacturer?.code || ""}
                              </span>
                            </div>
                          </td>

                          {/* ASSET TYPE / OUTLET */}

                          <td>
                            <div className="authorization-location">
                              <strong>
                                {authorization.assetType === "EXISTING"
                                  ? "Existing Asset"
                                  : "New Asset"}
                              </strong>

                              {authorization.assetType === "EXISTING" && (
                                <span>
                                  {authorization.currentOutlet?.name ||
                                    authorization.currentOutlet?.code ||
                                    "Outlet unavailable"}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* CAPACITY */}

                          <td>
                            <strong>{authorization.capacity}</strong>

                            <span className="authorization-unit">L</span>
                          </td>

                          {/* MANUFACTURING */}

                          <td>
                            {authorization.manufacturingMonth}/
                            {authorization.manufacturingYear}
                          </td>

                          {/* REQUESTED DATE */}

                          <td>
                            <span className="authorization-date">
                              {formatDate(authorization.createdAt)}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td>
                            <span
                              className={`authorization-status authorization-status-${authorization.status.toLowerCase()}`}
                            >
                              {authorization.status}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td>
                            {authorization.status === "PENDING" && (
                              <div className="authorization-actions">
                                <button
                                  type="button"
                                  className="authorization-approve-button"
                                  onClick={() =>
                                    handleApprove(authorization._id)
                                  }
                                  disabled={processingId !== null}
                                >
                                  {processingId === authorization._id
                                    ? "Processing..."
                                    : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  className="authorization-reject-button"
                                  onClick={() => openRejectModal(authorization)}
                                  disabled={processingId !== null}
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {authorization.status === "APPROVED" && (
                              <span className="authorization-decision-text">
                                Approved
                              </span>
                            )}

                            {authorization.status === "REJECTED" && (
                              <span className="authorization-decision-text">
                                Rejected
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ========================================
          REJECTION MODAL
          ======================================== */}

      {showRejectModal && selectedAuthorization && (
        <div className="authorization-modal-overlay">
          <div className="authorization-modal">
            <div className="authorization-modal-header">
              <div>
                <h3>Reject Authorization</h3>

                <p>Please provide a reason for rejecting this request.</p>
              </div>

              <button
                type="button"
                className="authorization-modal-close"
                onClick={closeRejectModal}
                disabled={processingId !== null}
              >
                ×
              </button>
            </div>

            {/* REQUEST INFO */}

            <div className="authorization-modal-info">
              <div>
                <span>Requester</span>

                <strong>
                  {selectedAuthorization.requestedBy?.name || "N/A"}
                </strong>
              </div>

              <div>
                <span>Manufacturer</span>

                <strong>
                  {selectedAuthorization.manufacturer?.name || "N/A"}
                </strong>
              </div>
            </div>

            {/* REASON */}

            <div className="authorization-modal-field">
              <label htmlFor="rejectionReason">Rejection Reason</label>

              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Enter the reason for rejection..."
                rows="5"
                disabled={processingId !== null}
              />
            </div>

            {/* ACTIONS */}

            <div className="authorization-modal-actions">
              <button
                type="button"
                className="authorization-modal-cancel"
                onClick={closeRejectModal}
                disabled={processingId !== null}
              >
                Cancel
              </button>

              <button
                type="button"
                className="authorization-modal-reject"
                onClick={handleReject}
                disabled={processingId !== null}
              >
                {processingId ? "Rejecting..." : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetAuthorization;
