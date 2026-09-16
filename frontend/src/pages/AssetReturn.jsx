import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchableSelect from "../components/SearchableSelect";

import api from "../services/api";

import "./AssetReturn.css";

function AssetReturn() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [assets, setAssets] = useState([]);

  // ========================================
  // FORM
  // ========================================

  const [assetId, setAssetId] = useState("");
  const [remarks, setRemarks] = useState("");

  // ========================================
  // UI
  // ========================================

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // MESSAGE REFS
  // ========================================

  const successRef = useRef(null);
  const errorRef = useRef(null);

  // ========================================
  // LOAD ASSIGNED ASSETS
  // ========================================

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/assets", {
          params: {
            status: "ASSIGNED",
            page: 1,
            limit: 100,
          },
        });

        setAssets(response.data.assets || []);
      } catch (error) {
        console.error(
          "Load Return Assets Error:",
          error.response?.data || error.message,
        );

        showError(
          error.response?.data?.message || "Failed to load assigned assets.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  // ========================================
  // SHOW ERROR
  // ========================================

  const showError = (message) => {
    setSuccess("");
    setError(message);

    setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);

    setTimeout(() => {
      setError("");
    }, 4000);
  };

  // ========================================
  // SHOW SUCCESS
  // ========================================

  const showSuccess = (message) => {
    setError("");
    setSuccess(message);

    setTimeout(() => {
      successRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);

    setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  // ========================================
  // SELECTED ASSET
  // ========================================

  const selectedAsset = assets.find((asset) => asset._id === assetId);

  // ========================================
  // HANDLE RETURN
  // ========================================

  const handleReturn = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ========================================
    // VALIDATE ASSET
    // ========================================

    if (!assetId) {
      showError("Please select an assigned asset.");

      return;
    }

    try {
      setSubmitting(true);

      // ========================================
      // RETURN ASSET
      // ========================================

      const response = await api.put(`/assets/${assetId}/return`, {
        remarks: remarks.trim(),
      });

      // ========================================
      // SUCCESS
      // ========================================

      showSuccess(
        response.data.message || "Asset returned to warehouse successfully.",
      );

      // ========================================
      // REMOVE FROM ASSIGNED LIST
      // ========================================

      setAssets((currentAssets) =>
        currentAssets.filter((asset) => asset._id !== assetId),
      );

      // ========================================
      // CLEAR FORM
      // ========================================

      setAssetId("");
      setRemarks("");
    } catch (error) {
      console.error(
        "Return Asset Error:",
        error.response?.data || error.message,
      );

      showError(error.response?.data?.message || "Failed to return asset.");
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="asset-return-loading-page">
        <div className="asset-return-spinner" />

        <span>Loading assigned assets...</span>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className={`asset-return-layout ${
        sidebarOpen
          ? "asset-return-sidebar-open"
          : "asset-return-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="asset-return-main">
        <Navbar />

        {/* SHOW SIDEBAR */}

        {!sidebarOpen && (
          <button
            type="button"
            className="asset-return-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="asset-return-content">
          {/* ========================================
              HEADER
              ======================================== */}

          <section className="asset-return-header">
            <Link to="/assets" className="asset-return-back">
              ← Back to Assets
            </Link>

            <p className="asset-return-eyebrow">ASSET MANAGEMENT</p>

            <h2>Return Asset</h2>

            <p className="asset-return-subtitle">
              Return an assigned asset from its current outlet back to the
              warehouse.
            </p>
          </section>

          {/* ========================================
              SUCCESS
              ======================================== */}

          {success && (
            <div
              ref={successRef}
              className="asset-return-message asset-return-success"
              role="status"
            >
              <div className="asset-return-message-icon">✓</div>

              <div className="asset-return-message-content">
                <strong>Return Successful</strong>

                <span>{success}</span>
              </div>
            </div>
          )}

          {/* ========================================
              ERROR
              ======================================== */}

          {error && (
            <div
              ref={errorRef}
              className="asset-return-message asset-return-error"
              role="alert"
            >
              <div className="asset-return-message-icon">!</div>

              <div className="asset-return-message-content">
                <strong>Return Failed</strong>

                <span>{error}</span>
              </div>
            </div>
          )}

          {/* ========================================
              SUMMARY
              ======================================== */}

          <section className="asset-return-summary">
            <div className="asset-return-summary-card">
              <div className="asset-return-summary-icon blue">◈</div>

              <div>
                <span>Assigned Assets</span>

                <strong>{assets.length}</strong>
              </div>
            </div>

            <div className="asset-return-summary-card">
              <div className="asset-return-summary-icon green">◫</div>

              <div>
                <span>Return Destination</span>

                <strong>Warehouse</strong>
              </div>
            </div>

            <div className="asset-return-summary-card">
              <div className="asset-return-summary-icon purple">✓</div>

              <div>
                <span>Return Status</span>

                <strong>Ready</strong>
              </div>
            </div>
          </section>

          {/* ========================================
              MAIN CARD
              ======================================== */}

          <section className="asset-return-card">
            <div className="asset-return-card-header">
              <div>
                <h3>Return Asset to Warehouse</h3>

                <p>Select an assigned asset and confirm its return.</p>
              </div>

              <span className="asset-return-required">* Required</span>
            </div>

            <form className="asset-return-form" onSubmit={handleReturn}>
              {/* ========================================
                  ASSET
                  ======================================== */}

              <div className="asset-return-field">
                <label htmlFor="asset">
                  Assigned Asset
                  <span>*</span>
                </label>

                <SearchableSelect
                  id="asset"
                  value={assetId}
                  onChange={setAssetId}
                  options={assets}
                  getOptionLabel={(asset) =>
                    `${asset.ain} — SN: ${asset.serialNumber} — ${asset.capacity}L`
                  }
                  placeholder="Search assigned asset by AIN"
                  disabled={submitting}
                  required
                  noOptionsMessage="No assigned assets found."
                />

                {assets.length === 0 && (
                  <small className="asset-return-field-note">
                    There are currently no assigned assets available for return.
                  </small>
                )}
              </div>

              {/* ========================================
                  DESTINATION
                  ======================================== */}

              <div className="asset-return-destination">
                <div className="asset-return-destination-icon">◫</div>

                <div>
                  <span>Return Destination</span>

                  <strong>Warehouse</strong>

                  <small>The asset will be moved to IN_STOCK status.</small>
                </div>
              </div>

              {/* ========================================
                  SELECTED ASSET PREVIEW
                  ======================================== */}

              {selectedAsset && (
                <div className="asset-return-preview">
                  <div className="asset-return-preview-header">
                    <span>Selected Asset</span>

                    <span className="asset-return-status">ASSIGNED</span>
                  </div>

                  <div className="asset-return-preview-grid">
                    {/* AIN */}

                    <div>
                      <span>AIN</span>

                      <strong>{selectedAsset.ain}</strong>
                    </div>

                    {/* SERIAL */}

                    <div>
                      <span>Serial Number</span>

                      <strong>{selectedAsset.serialNumber}</strong>
                    </div>

                    {/* CAPACITY */}

                    <div>
                      <span>Capacity</span>

                      <strong>{selectedAsset.capacity} L</strong>
                    </div>

                    {/* CURRENT OUTLET */}

                    <div>
                      <span>Current Outlet</span>

                      <strong>
                        {selectedAsset.currentOutlet?.name || "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================
                  RETURN FLOW
                  ======================================== */}

              {selectedAsset && (
                <div className="asset-return-flow">
                  <div className="asset-return-flow-location current">
                    <div className="asset-return-flow-icon">⌖</div>

                    <div>
                      <span>Current Location</span>

                      <strong>
                        {selectedAsset.currentOutlet?.name || "Assigned Outlet"}
                      </strong>
                    </div>
                  </div>

                  <div className="asset-return-flow-arrow">→</div>

                  <div className="asset-return-flow-location warehouse">
                    <div className="asset-return-flow-icon">◫</div>

                    <div>
                      <span>Destination</span>

                      <strong>Warehouse</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================
                  REMARKS
                  ======================================== */}

              <div className="asset-return-field asset-return-field-full">
                <label htmlFor="remarks">Remarks</label>

                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add optional return remarks..."
                  rows="4"
                  disabled={submitting}
                />

                <small className="asset-return-field-note">Optional.</small>
              </div>

              {/* ========================================
                  ACTIONS
                  ======================================== */}

              <div className="asset-return-actions">
                <Link to="/assets" className="asset-return-cancel">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="asset-return-submit"
                  disabled={submitting || !assetId || assets.length === 0}
                >
                  {submitting ? "Returning..." : "Return to Warehouse"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AssetReturn;
