import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
import api from "../services/api";

import "./VerificationMappingAdmin.css";

function VerificationMappingAdmin() {
  // ========================================
  // DATA
  // ========================================

  const [mappings, setMappings] = useState([]);

  // ========================================
  // UI
  // ========================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [processingId, setProcessingId] = useState(null);

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
  // REJECTION MODAL
  // ========================================

  const [selectedMapping, setSelectedMapping] = useState(null);

  const [rejectionRemarks, setRejectionRemarks] = useState("");

  // ========================================
  // LOAD PENDING MAPPINGS
  // ========================================

  const loadPendingMappings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/verification-mappings/pending");

      setMappings(response.data.mappings || []);
    } catch (error) {
      console.error(
        "Load Pending Mappings Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load verification mapping requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadPendingMappings();
  }, []);

  // ========================================
  // APPROVE MAPPING
  // ========================================

  const handleApprove = async (mappingId) => {
    try {
      setProcessingId(mappingId);
      setError("");

      const response = await api.patch(
        `/verification-mappings/${mappingId}/review`,
        {
          decision: "APPROVED",
        },
      );

      setSuccess(response.data.message || "Asset activated successfully.");

      window.dispatchEvent(new Event("incoming-requests-updated"));

      // Reload pending requests
      await loadPendingMappings();
    } catch (error) {
      console.error(
        "Approve Mapping Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to approve mapping.");
    } finally {
      setProcessingId(null);
    }
  };

  // ========================================
  // OPEN REJECTION MODAL
  // ========================================

  const openRejectModal = (mapping) => {
    setSelectedMapping(mapping);
    setRejectionRemarks("");
    setError("");
  };

  // ========================================
  // REJECT MAPPING
  // ========================================

  const handleReject = async () => {
    if (!selectedMapping) {
      return;
    }

    // Validate rejection remarks
    if (!rejectionRemarks.trim()) {
      setError("Please enter rejection remarks.");

      return;
    }

    try {
      setProcessingId(selectedMapping._id);

      setError("");

      await api.patch(`/verification-mappings/${selectedMapping._id}/review`, {
        decision: "REJECTED",
        rejectionRemarks: rejectionRemarks.trim(),
      });

      window.dispatchEvent(new Event("incoming-requests-updated"));

      // Close modal
      setSelectedMapping(null);

      setRejectionRemarks("");

      setSuccess("Mapping request rejected successfully.");

      // Reload pending requests
      await loadPendingMappings();
    } catch (error) {
      console.error(
        "Reject Mapping Error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to reject mapping.");
    } finally {
      setProcessingId(null);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <AppPageLayout>
        <div className="mapping-admin-loading-page">
          <div className="mapping-admin-spinner" />

          <p>Loading verification mappings...</p>
        </div>
      </AppPageLayout>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <AppPageLayout>
      <div className="mapping-admin-page">
        <main className="mapping-admin-container">
          {/* ========================================
            HEADER
            ======================================== */}

          <header className="mapping-admin-header">
            {/* ========================================
              LEFT SIDE
              ======================================== */}

            <div className="mapping-admin-header-left">
              {/* Back to dashboard */}

              <Link to="/dashboard" className="mapping-admin-back">
                ← Back to Dashboard
              </Link>

              <p className="mapping-admin-eyebrow">INCOMING REQUESTS</p>

              <h1>Verification Mapping</h1>

              <span className="mapping-admin-subtitle">
                Review pending asset-to-outlet mapping requests.
              </span>
            </div>

            {/* ========================================
              VERIFICATION HISTORY
              ======================================== */}

            <Link
              to="/verification-mappings/history"
              className="mapping-history-button"
            >
              <span className="mapping-history-button-icon">◷</span>

              <span className="mapping-history-button-content">
                <strong>Verification History</strong>

                <small>View completed decisions</small>
              </span>

              <span className="mapping-history-button-arrow">→</span>
            </Link>
          </header>

          {/* ========================================
            GLOBAL NOTIFICATIONS
            ======================================== */}

          {error && (
            <div className="mapping-admin-error" role="alert">
              <span className="mapping-admin-error-icon">!</span>

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
            <div className="mapping-toast mapping-success" role="status">
              <div className="mapping-toast-icon">✓</div>

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
            PENDING SECTION
            ======================================== */}

          <section className="mapping-admin-section">
            {/* SECTION HEADER */}

            <div className="mapping-admin-section-header">
              <div>
                <h2>Pending Requests</h2>

                <p>Mapping requests waiting for System Admin review.</p>
              </div>

              <span className="mapping-admin-count">{mappings.length}</span>
            </div>

            {/* ========================================
              EMPTY STATE
              ======================================== */}

            {mappings.length === 0 ? (
              <div className="mapping-admin-empty">
                <div className="mapping-admin-empty-icon">✓</div>

                <strong>No pending requests</strong>

                <span>
                  There are currently no verification mapping requests waiting
                  for review.
                </span>
              </div>
            ) : (
              /* ========================================
               REQUEST LIST
               ======================================== */

              <div className="mapping-admin-list">
                {mappings.map((mapping) => (
                  <article key={mapping._id} className="mapping-admin-card">
                    {/* ========================================
                        CARD HEADER
                        ======================================== */}

                    <div className="mapping-admin-card-top">
                      <div>
                        <span className="mapping-admin-pending">PENDING</span>

                        <h3>{mapping.asset?.ain || "N/A"}</h3>
                      </div>

                      <time>
                        {mapping.createdAt
                          ? new Date(mapping.createdAt).toLocaleString()
                          : "N/A"}
                      </time>
                    </div>

                    {/* ========================================
                        ASSET → OUTLET
                        ======================================== */}

                    <div className="mapping-admin-route">
                      {/* ASSET */}

                      <div className="mapping-admin-route-item">
                        <span>Asset</span>

                        <strong>{mapping.asset?.ain || "N/A"}</strong>

                        <small>
                          SN: {mapping.asset?.serialNumber || "N/A"}
                        </small>
                      </div>

                      {/* ARROW */}

                      <div className="mapping-admin-route-arrow">→</div>

                      {/* OUTLET */}

                      <div className="mapping-admin-route-item">
                        <span>Assigned Outlet</span>

                        <strong>{mapping.outlet?.name || "N/A"}</strong>

                        <small>Code: {mapping.outlet?.code || "N/A"}</small>
                      </div>
                    </div>

                    {/* ========================================
                        SUBMITTED INFORMATION
                        ======================================== */}

                    <div className="mapping-admin-submitted">
                      <div>
                        <span>Submitted By</span>

                        <strong>{mapping.submittedBy?.name || "N/A"}</strong>
                      </div>

                      <div>
                        <span>Current Asset Status</span>

                        <strong>{mapping.asset?.status || "N/A"}</strong>
                      </div>
                    </div>

                    {/* ========================================
                        USER REMARKS
                        ======================================== */}

                    {mapping.remarks && (
                      <div className="mapping-admin-remarks">
                        <span>User Remarks</span>

                        <p>{mapping.remarks}</p>
                      </div>
                    )}

                    {/* ========================================
                        ACTIONS
                        ======================================== */}

                    <div className="mapping-admin-actions">
                      {/* REJECT */}

                      <button
                        type="button"
                        className="mapping-admin-reject"
                        disabled={processingId === mapping._id}
                        onClick={() => openRejectModal(mapping)}
                      >
                        Reject
                      </button>

                      {/* APPROVE */}

                      <button
                        type="button"
                        className="mapping-admin-approve"
                        disabled={processingId === mapping._id}
                        onClick={() => handleApprove(mapping._id)}
                      >
                        {processingId === mapping._id
                          ? "Processing..."
                          : "Approve & Activate"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ========================================
            REJECTION MODAL
            ======================================== */}

          {selectedMapping && (
            <div className="mapping-admin-modal-overlay">
              <div
                className="mapping-admin-modal"
                role="dialog"
                aria-modal="true"
              >
                <div className="mapping-admin-modal-icon">!</div>

                <h2>Reject Verification Mapping</h2>

                <p>
                  Enter the rejection remarks that should be returned to the
                  user.
                </p>

                <textarea
                  value={rejectionRemarks}
                  onChange={(event) => setRejectionRemarks(event.target.value)}
                  placeholder="Enter rejection remarks..."
                  rows="5"
                />

                <div className="mapping-admin-modal-actions">
                  {/* CANCEL */}

                  <button
                    type="button"
                    className="mapping-admin-modal-cancel"
                    onClick={() => {
                      setSelectedMapping(null);
                      setRejectionRemarks("");
                      setError("");
                    }}
                    disabled={processingId === selectedMapping._id}
                  >
                    Cancel
                  </button>

                  {/* REJECT */}

                  <button
                    type="button"
                    className="mapping-admin-modal-reject"
                    disabled={processingId === selectedMapping._id}
                    onClick={handleReject}
                  >
                    {processingId === selectedMapping._id
                      ? "Rejecting..."
                      : "Reject Mapping"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AppPageLayout>
  );
}

export default VerificationMappingAdmin;
