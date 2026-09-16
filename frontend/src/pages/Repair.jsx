import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";
import { hasPermission } from "../utils/permission";
import { getStoredUser } from "../utils/storage";

import "./Repair.css";

function Repair() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // PENDING REQUESTS
  // ========================================

  const [pendingRepairs, setPendingRepairs] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // ========================================
  // UNDER REPAIR
  // ========================================

  const [underRepairAssets, setUnderRepairAssets] = useState([]);
  const [underRepairLoading, setUnderRepairLoading] = useState(true);
  const [historyAIN, setHistoryAIN] = useState("");
  const [historyStatus, setHistoryStatus] = useState("ALL");

  // ========================================
  // SEARCH
  // ========================================

  const [searchAIN, setSearchAIN] = useState("");
  const [searching, setSearching] = useState(false);

  const [searchResult, setSearchResult] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // ========================================
  // ACTION
  // ========================================

  const [actionId, setActionId] = useState(null);

  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRepair, setSelectedRepair] = useState(null);

  // ========================================
  // MESSAGE
  // ========================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-dismiss messages after 4 seconds
  useEffect(() => {
    if (!error && !success) return;

    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error, success]);

  const user = getStoredUser();
  const canUpdateRepair = hasPermission(user, "repairs", "update");

  // ========================================
  // FETCH PENDING
  // ========================================

  const fetchPendingRepairs = async () => {
    try {
      setPendingLoading(true);

      const response = await api.get("/repairs/pending");

      setPendingRepairs(response.data.repairs || []);
    } catch (error) {
      console.error(
        "Pending Repairs Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load pending repair requests.",
      );
    } finally {
      setPendingLoading(false);
    }
  };

  // ========================================
  // FETCH REPAIR HISTORY
  // ========================================

  const fetchUnderRepair = async () => {
    try {
      setUnderRepairLoading(true);

      const response = await api.get("/repairs/under-repair");

      setUnderRepairAssets(response.data.assets || response.data.repairs || []);
    } catch (error) {
      console.error(
        "Under Repair Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to load repair history.",
      );
    } finally {
      setUnderRepairLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchPendingRepairs();
    fetchUnderRepair();
  }, []);

  // ========================================
  // APPROVE
  // ========================================

  const handleApprove = async (repair) => {
    if (!window.confirm(`Approve repair request for ${getAIN(repair)}?`)) {
      return;
    }

    try {
      setActionId(repair._id);
      setError("");
      setSuccess("");

      const response = await api.put(`/repairs/${repair._id}/approve`);

      setSuccess(
        response.data.message || "Repair request approved successfully.",
      );

      await fetchPendingRepairs();
      await fetchUnderRepair();
    } catch (error) {
      console.error(
        "Approve Repair Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to approve repair request.",
      );
    } finally {
      setActionId(null);
    }
  };

  // ========================================
  // OPEN REJECT MODAL
  // ========================================

  const openRejectModal = (repair) => {
    setSelectedRepair(repair);
    setRejectReason("");
    setRejectModal(true);
  };

  // ========================================
  // REJECT
  // ========================================

  const handleReject = async () => {
    if (!selectedRepair) {
      return;
    }

    if (!rejectReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setActionId(selectedRepair._id);
      setError("");
      setSuccess("");

      const response = await api.put(`/repairs/${selectedRepair._id}/reject`, {
        rejectionReason: rejectReason.trim(),
      });

      setSuccess(
        response.data.message || "Repair request rejected successfully.",
      );

      setRejectModal(false);
      setSelectedRepair(null);
      setRejectReason("");

      await fetchPendingRepairs();
      await fetchUnderRepair();
    } catch (error) {
      console.error(
        "Reject Repair Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to reject repair request.",
      );
    } finally {
      setActionId(null);
    }
  };

  // ========================================
  // COMPLETE REPAIR
  // ========================================

  const handleComplete = async (repair) => {
    if (
      !window.confirm(`Mark the repair for ${getAIN(repair)} as completed?`)
    ) {
      return;
    }

    try {
      setActionId(repair._id);
      setError("");
      setSuccess("");

      const response = await api.put(`/repairs/${repair._id}/status`, {
        status: "COMPLETED",
      });

      setSuccess(response.data.message || "Repair completed successfully.");
      await fetchUnderRepair();
      window.dispatchEvent(new Event("incoming-requests-updated"));
    } catch (error) {
      console.error(
        "Complete Repair Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to complete the repair.",
      );
    } finally {
      setActionId(null);
    }
  };

  // ========================================
  // SEARCH REPAIR HISTORY
  // ========================================

  const handleSearch = async () => {
    if (!searchAIN.trim()) {
      setError("Please enter an AIN.");
      return;
    }

    try {
      setSearching(true);
      setError("");
      setSuccess("");

      const assetResponse = await api.get(
        `/repairs/asset/ain/${encodeURIComponent(searchAIN.trim())}`,
      );

      const foundAsset = assetResponse.data.asset;

      setSearchResult(foundAsset);

      const historyResponse = await api.get(`/repairs/asset/${foundAsset._id}`);

      setSearchHistory(historyResponse.data.repairs || []);
    } catch (error) {
      console.error(
        "Repair Search Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to search repair records.",
      );
    } finally {
      setSearching(false);
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const getAIN = (repair) => {
    return (
      repair?.asset?.AIN ||
      repair?.asset?.ain ||
      repair?.AIN ||
      repair?.ain ||
      "N/A"
    );
  };

  const getOutlet = (repair) => {
    return (
      repair?.asset?.currentOutlet?.name ||
      repair?.asset?.outlet?.name ||
      repair?.currentOutlet?.name ||
      "N/A"
    );
  };

  const getReportedBy = (repair) => {
    return repair?.reportedBy?.name || repair?.reportedBy?.email || "N/A";
  };

  const getAssetAIN = (asset) => {
    return (
      asset?.AIN ||
      asset?.ain ||
      asset?.asset?.AIN ||
      asset?.asset?.ain ||
      "N/A"
    );
  };

  const filteredRepairHistory = underRepairAssets.filter((item) => {
    const repair = item.repair || item;
    const ain = getAssetAIN(item).toLowerCase();
    const matchesAIN = ain.includes(historyAIN.trim().toLowerCase());
    const matchesStatus =
      historyStatus === "ALL" || repair.status === historyStatus;

    return matchesAIN && matchesStatus;
  });

  const formatStatus = (status) => {
    if (!status) return "N/A";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB");
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`repair-layout ${
        sidebarOpen ? "repair-sidebar-open" : "repair-sidebar-closed"
      }`}
    >
      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      <div className="repair-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="repair-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        )}

        <main className="repair-content">
          <Link to="/dashboard" className="repair-back-dashboard">
            ← Back to Dashboard
          </Link>

          {/* ========================================
              HEADER
              ======================================== */}

          <section className="repair-header">
            <p className="repair-eyebrow">INCOMING REQUESTS</p>

            <h2>Repair</h2>

            <p>
              Review incoming repair requests, manage repair records and monitor
              assets currently under repair.
            </p>
          </section>

          {/* ========================================
              MESSAGE
              ======================================== */}

          {error && (
            <div className="repair-message repair-error" role="alert">
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
            <div className="repair-message repair-success" role="status">
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
              PENDING REQUESTS
              ======================================== */}

          <section className="repair-card">
            <div className="repair-card-header">
              <div>
                <h3>Incoming Repair Requests</h3>

                <p>Review and approve or reject technician repair requests.</p>
              </div>

              <span className="repair-count">
                {pendingRepairs.length} Pending
              </span>
            </div>

            {pendingLoading ? (
              <div className="repair-loading">
                <div className="repair-spinner" />
                <p>Loading repair requests...</p>
              </div>
            ) : pendingRepairs.length === 0 ? (
              <div className="repair-empty">
                <div>✓</div>

                <strong>No pending repair requests</strong>

                <p>
                  There are currently no repair requests waiting for approval.
                </p>
              </div>
            ) : (
              <div className="repair-table-wrapper">
                <table className="repair-table">
                  <thead>
                    <tr>
                      <th>AIN</th>
                      <th>Outlet</th>
                      <th>Problem</th>
                      <th>Reported By</th>
                      <th>Repair Cost</th>
                      <th>Reported</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingRepairs.map((repair) => (
                      <tr key={repair._id}>
                        <td className="repair-ain">{getAIN(repair)}</td>

                        <td>{getOutlet(repair)}</td>

                        <td className="repair-problem">{repair.problem}</td>

                        <td>{getReportedBy(repair)}</td>

                        <td>
                          ৳ {Number(repair.repairCost || 0).toLocaleString()}
                        </td>

                        <td>{formatDate(repair.createdAt)}</td>

                        <td>
                          <span className="repair-status repair-status-pending">
                            Pending
                          </span>
                        </td>

                        <td>
                          <div className="repair-actions">
                            <button
                              className="repair-approve-button"
                              disabled={actionId === repair._id}
                              onClick={() => handleApprove(repair)}
                            >
                              {actionId === repair._id ? "..." : "Approve"}
                            </button>

                            <button
                              className="repair-reject-button"
                              disabled={actionId === repair._id}
                              onClick={() => openRejectModal(repair)}
                            >
                              Reject
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

          {/* ========================================
              SEARCH
              ======================================== */}

          <section className="repair-card">
            <div className="repair-card-header">
              <div>
                <h3>Repair Records</h3>

                <p>Search complete repair history using an Asset AIN.</p>
              </div>
            </div>

            <div className="repair-search">
              <input
                type="text"
                value={searchAIN}
                onChange={(e) => setSearchAIN(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search by Asset AIN"
              />

              <button onClick={handleSearch} disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </div>

            {searchResult && (
              <div className="repair-search-asset">
                <div>
                  <span>AIN</span>
                  <strong>{getAssetAIN(searchResult)}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{formatStatus(searchResult.status)}</strong>
                </div>

                <div>
                  <span>Serial Number</span>
                  <strong>{searchResult.serialNumber || "N/A"}</strong>
                </div>
              </div>
            )}

            {searchResult && (
              <div className="repair-history-wrapper">
                <h4>Repair History</h4>

                {searchHistory.length === 0 ? (
                  <div className="repair-small-empty">
                    No repair records found for this asset.
                  </div>
                ) : (
                  <table className="repair-table">
                    <thead>
                      <tr>
                        <th>Problem</th>
                        <th>Reported By</th>
                        <th>Service Provider</th>
                        <th>Cost</th>
                        <th>Status</th>
                        <th>Reported</th>
                        <th>Completed</th>
                      </tr>
                    </thead>

                    <tbody>
                      {searchHistory.map((repair) => (
                        <tr key={repair._id}>
                          <td className="repair-problem">{repair.problem}</td>

                          <td>{getReportedBy(repair)}</td>

                          <td>{repair.serviceProvider || "N/A"}</td>

                          <td>
                            ৳ {Number(repair.repairCost || 0).toLocaleString()}
                          </td>

                          <td>
                            <span
                              className={`repair-status repair-status-${(
                                repair.status || ""
                              ).toLowerCase()}`}
                            >
                              {formatStatus(repair.status)}
                            </span>
                          </td>

                          <td>{formatDate(repair.createdAt)}</td>

                          <td>{formatDate(repair.completedDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>

          {/* ========================================
              UNDER REPAIR
              ======================================== */}

          <section className="repair-card">
            <div className="repair-card-header">
              <div>
                <h3>Asset Repair History</h3>

                <p>
                  All assets that have an active or completed repair record.
                </p>
              </div>

              <span className="repair-count repair-count-blue">
                {filteredRepairHistory.length} Records
              </span>
            </div>

            <div className="repair-history-filters">
              <label htmlFor="repair-history-ain">Search by AIN</label>

              <input
                id="repair-history-ain"
                type="search"
                value={historyAIN}
                onChange={(event) => setHistoryAIN(event.target.value)}
                placeholder="Enter AIN"
              />

              <label htmlFor="repair-history-status">Status</label>

              <select
                id="repair-history-status"
                value={historyStatus}
                onChange={(event) => setHistoryStatus(event.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REPAIR">Under Repair</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {underRepairLoading ? (
              <div className="repair-loading">
                <div className="repair-spinner" />

                <p>Loading assets under repair...</p>
              </div>
            ) : filteredRepairHistory.length === 0 ? (
              <div className="repair-empty">
                <strong>No repair history found</strong>

                <p>There are currently no repair records.</p>
              </div>
            ) : (
              <div className="repair-table-wrapper">
                <table className="repair-table">
                  <thead>
                    <tr>
                      <th>AIN</th>
                      <th>Outlet</th>
                      <th>Problem</th>
                      <th>Reported By</th>
                      <th>Service Provider</th>
                      <th>Repair Cost</th>
                      <th>Status</th>
                      <th>Reported</th>
                      <th>Completed</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRepairHistory.map((item, index) => {
                      const repair = item.repair || item;

                      return (
                        <tr key={item._id || index}>
                          <td className="repair-ain">{getAssetAIN(item)}</td>

                          <td>{getOutlet(repair)}</td>

                          <td className="repair-problem">
                            {repair.problem || "N/A"}
                          </td>

                          <td>{getReportedBy(repair)}</td>

                          <td>{repair.serviceProvider || "N/A"}</td>

                          <td>
                            ৳ {Number(repair.repairCost || 0).toLocaleString()}
                          </td>

                          <td>
                            <span
                              className={`repair-status repair-status-${(
                                repair.status || ""
                              ).toLowerCase()}`}
                            >
                              {formatStatus(repair.status)}
                            </span>
                          </td>

                          <td>{formatDate(repair.createdAt)}</td>

                          <td>{formatDate(repair.completedDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ========================================
          REJECT MODAL
          ======================================== */}

      {rejectModal && (
        <div className="repair-modal-overlay">
          <div className="repair-modal">
            <div className="repair-modal-header">
              <div>
                <h3>Reject Repair Request</h3>

                <p>A rejection reason is required.</p>
              </div>

              <button onClick={() => setRejectModal(false)}>×</button>
            </div>

            <div className="repair-modal-body">
              <label>
                Rejection Reason
                <span>*</span>
              </label>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejecting this repair request..."
                rows="5"
              />
            </div>

            <div className="repair-modal-actions">
              <button
                className="repair-modal-cancel"
                onClick={() => setRejectModal(false)}
              >
                Cancel
              </button>

              <button
                className="repair-modal-reject"
                disabled={actionId === selectedRepair?._id}
                onClick={handleReject}
              >
                {actionId === selectedRepair?._id
                  ? "Rejecting..."
                  : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Repair;
