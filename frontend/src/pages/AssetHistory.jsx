import { useEffect, useRef, useState } from "react";

import { Link, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./AssetHistory.css";

function AssetHistory() {
  // ========================================
  // URL PARAMETER
  // ========================================

  const { id } = useParams();

  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [history, setHistory] = useState([]);

  const [asset, setAsset] = useState(null);

  // ========================================
  // UI
  // ========================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const errorRef = useRef(null);

  // ========================================
  // FETCH HISTORY
  // ========================================

  useEffect(() => {
    const loadAssetHistory = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await api.get(`/asset-history/${id}`);

        const records = response.data.history || [];

        setHistory(records);

        // Get asset information from
        // first history record
        if (records.length > 0) {
          setAsset(records[0].asset || null);
        }
      } catch (error) {
        console.error(
          "Load Asset History Error:",
          error.response?.data || error.message,
        );

        setError(
          error.response?.data?.message || "Failed to load asset history.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAssetHistory();
    } else {
      setLoading(false);

      setError("Asset ID is missing.");
    }
  }, [id]);

  // ========================================
  // SCROLL TO ERROR
  // ========================================

  useEffect(() => {
    if (!error) {
      return;
    }

    setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  }, [error]);

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ========================================
  // ACTION CLASS
  // ========================================

  const getActionClass = (action) => {
    return `asset-history-action asset-history-action-${String(action || "")
      .toLowerCase()
      .replace(/_/g, "-")}`;
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="asset-history-loading-page">
        <div className="asset-history-spinner" />

        <span>Loading asset history...</span>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className={`asset-history-layout ${
        sidebarOpen
          ? "asset-history-sidebar-open"
          : "asset-history-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="asset-history-main">
        <Navbar />

        {/* ========================================
            SHOW SIDEBAR BUTTON
            ======================================== */}

        {!sidebarOpen && (
          <button
            type="button"
            className="asset-history-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="asset-history-content">
          {/* ========================================
              HEADER
              ======================================== */}

          <section className="asset-history-header">
            <Link to={`/assets/${id}`} className="asset-history-back">
              ← Back to Asset Details
            </Link>

            <p className="asset-history-eyebrow">ASSET MANAGEMENT</p>

            <h2>Asset History</h2>

            <p className="asset-history-subtitle">
              Complete lifecycle and movement history of this asset.
            </p>
          </section>

          {/* ========================================
              ERROR
              ======================================== */}

          {error && (
            <div ref={errorRef} className="asset-history-error" role="alert">
              <div className="asset-history-error-icon">!</div>

              <div>
                <strong>Unable to Load History</strong>

                <span>{error}</span>
              </div>
            </div>
          )}

          {/* ========================================
              ASSET SUMMARY
              ======================================== */}

          {asset && (
            <section className="asset-history-asset-card">
              <div className="asset-history-asset-icon">◈</div>

              <div className="asset-history-asset-info">
                <span>Asset</span>

                <strong>{asset.ain || "Unknown AIN"}</strong>

                <small>Serial Number: {asset.serialNumber || "N/A"}</small>
              </div>

              <div className="asset-history-asset-actions">
                <Link
                  to={`/assets/${id}`}
                  className="asset-history-view-button"
                >
                  View Asset
                </Link>

                <Link
                  to={`/assets/${id}/verification-history`}
                  className="asset-history-verification-button"
                >
                  Verification History
                </Link>
              </div>
            </section>
          )}

          {/* ========================================
              SUMMARY
              ======================================== */}

          <section className="asset-history-summary">
            <div className="asset-history-summary-card">
              <div className="asset-history-summary-icon green">◷</div>

              <div>
                <span>Total Records</span>

                <strong>{history.length}</strong>
              </div>
            </div>

            <div className="asset-history-summary-card">
              <div className="asset-history-summary-icon blue">⌖</div>

              <div>
                <span>Timeline</span>

                <strong>{history.length > 0 ? "Active" : "Empty"}</strong>
              </div>
            </div>

            <div className="asset-history-summary-card">
              <div className="asset-history-summary-icon purple">↗</div>

              <div>
                <span>Latest Action</span>

                <strong>
                  {history.length > 0
                    ? history[0].action?.replace(/_/g, " ")
                    : "N/A"}
                </strong>
              </div>
            </div>
          </section>

          {/* ========================================
              HISTORY CARD
              ======================================== */}

          <section className="asset-history-card">
            <div className="asset-history-card-header">
              <div>
                <h3>Lifecycle History</h3>

                <p>
                  Every recorded movement and operational action for this asset.
                </p>
              </div>

              <span className="asset-history-count">
                {history.length} record
                {history.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* ========================================
                EMPTY
                ======================================== */}

            {history.length === 0 ? (
              <div className="asset-history-empty">
                <div className="asset-history-empty-icon">◷</div>

                <strong>No History Records</strong>

                <p>
                  No lifecycle activity has been recorded for this asset yet.
                </p>

                <Link
                  to={`/assets/${id}`}
                  className="asset-history-empty-button"
                >
                  ← Back to Asset
                </Link>
              </div>
            ) : (
              <>
                {/* ========================================
                    DESKTOP TABLE
                    ======================================== */}

                <div className="asset-history-table-wrapper">
                  <table className="asset-history-table">
                    <thead>
                      <tr>
                        <th>Action</th>

                        <th>From Outlet</th>

                        <th>To Outlet</th>

                        <th>Performed By</th>

                        <th>Remarks</th>

                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {history.map((record) => (
                        <tr key={record._id}>
                          {/* ACTION */}

                          <td>
                            <span className={getActionClass(record.action)}>
                              {record.action?.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* FROM */}

                          <td>
                            <div className="asset-history-location">
                              <strong>
                                {record.fromOutlet?.name || "Warehouse"}
                              </strong>

                              {record.fromOutlet && (
                                <span>{record.fromOutlet.outletCode}</span>
                              )}
                            </div>
                          </td>

                          {/* TO */}

                          <td>
                            <div className="asset-history-location">
                              <strong>
                                {record.toOutlet?.name || "Warehouse"}
                              </strong>

                              {record.toOutlet && (
                                <span>{record.toOutlet.outletCode}</span>
                              )}
                            </div>
                          </td>

                          {/* PERFORMED BY */}

                          <td>
                            <div className="asset-history-user">
                              <div className="asset-history-user-avatar">
                                {record.performedBy?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "?"}
                              </div>

                              <div>
                                <strong>
                                  {record.performedBy?.name || "Unknown"}
                                </strong>

                                {record.performedBy?.email && (
                                  <span>{record.performedBy.email}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* REMARKS */}

                          <td>
                            <span className="asset-history-remarks">
                              {record.remarks || "-"}
                            </span>
                          </td>

                          {/* DATE */}

                          <td>
                            <span className="asset-history-date">
                              {formatDate(record.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ========================================
                    MOBILE TIMELINE
                    ======================================== */}

                <div className="asset-history-mobile-list">
                  {history.map((record) => (
                    <div key={record._id} className="asset-history-mobile-item">
                      <div className="asset-history-mobile-dot" />

                      <div className="asset-history-mobile-content">
                        <div className="asset-history-mobile-top">
                          <span className={getActionClass(record.action)}>
                            {record.action?.replace(/_/g, " ")}
                          </span>

                          <time>{formatDate(record.createdAt)}</time>
                        </div>

                        <div className="asset-history-mobile-route">
                          <div>
                            <span>From</span>

                            <strong>
                              {record.fromOutlet?.name || "Warehouse"}
                            </strong>
                          </div>

                          <span className="asset-history-mobile-arrow">→</span>

                          <div>
                            <span>To</span>

                            <strong>
                              {record.toOutlet?.name || "Warehouse"}
                            </strong>
                          </div>
                        </div>

                        <div className="asset-history-mobile-user">
                          <strong>
                            {record.performedBy?.name || "Unknown"}
                          </strong>

                          <span>{record.remarks || "No remarks"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default AssetHistory;
