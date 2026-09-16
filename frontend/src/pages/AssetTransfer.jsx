import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchableSelect from "../components/SearchableSelect";

import api from "../services/api";

import "./AssetTransfer.css";

function AssetTransfer() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [assets, setAssets] = useState([]);

  const [outlets, setOutlets] = useState([]);

  // ========================================
  // FORM
  // ========================================

  const [assetId, setAssetId] = useState("");

  const [outletId, setOutletId] = useState("");

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
  // LOAD DATA
  // ========================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // ========================================
        // GET ASSIGNED ASSETS
        // ========================================

        const assetResponse = await api.get("/assets", {
          params: {
            status: "ASSIGNED",
            page: 1,
            limit: 100,
          },
        });

        setAssets(assetResponse.data.assets || []);

        // ========================================
        // GET OUTLETS
        // ========================================

        const outletResponse = await api.get("/outlets");

        setOutlets(outletResponse.data.outlets || []);
      } catch (error) {
        console.error(
          "Load Transfer Data Error:",
          error.response?.data || error.message,
        );

        showError(
          error.response?.data?.message || "Failed to load transfer data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
  // SELECTED NEW OUTLET
  // ========================================

  const selectedOutlet = outlets.find((outlet) => outlet._id === outletId);

  // ========================================
  // CURRENT OUTLET ID
  // ========================================

  const currentOutletId =
    selectedAsset?.currentOutlet?._id || selectedAsset?.currentOutlet;

  // ========================================
  // HANDLE TRANSFER
  // ========================================

  const handleTransfer = async (event) => {
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

    // ========================================
    // VALIDATE NEW OUTLET
    // ========================================

    if (!outletId) {
      showError("Please select a new outlet.");

      return;
    }

    // ========================================
    // PREVENT SAME OUTLET
    // ========================================

    if (currentOutletId && currentOutletId.toString() === outletId) {
      showError("The new outlet must be different from the current outlet.");

      return;
    }

    try {
      setSubmitting(true);

      // ========================================
      // TRANSFER REQUEST
      // ========================================

      const response = await api.put(`/assets/${assetId}/transfer`, {
        outletId,
        remarks: remarks.trim(),
      });

      // ========================================
      // SUCCESS
      // ========================================

      showSuccess(response.data.message || "Asset transferred successfully.");

      // ========================================
      // REMOVE TRANSFERRED ASSET
      // ========================================

      setAssets((currentAssets) =>
        currentAssets.filter((asset) => asset._id !== assetId),
      );

      // ========================================
      // CLEAR FORM
      // ========================================

      setAssetId("");
      setOutletId("");
      setRemarks("");
    } catch (error) {
      console.error(
        "Transfer Asset Error:",
        error.response?.data || error.message,
      );

      showError(error.response?.data?.message || "Failed to transfer asset.");
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="asset-transfer-loading-page">
        <div className="asset-transfer-spinner" />

        <span>Loading transfer data...</span>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className={`asset-transfer-layout ${
        sidebarOpen
          ? "asset-transfer-sidebar-open"
          : "asset-transfer-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="asset-transfer-main">
        <Navbar />

        {/* SHOW SIDEBAR */}

        {!sidebarOpen && (
          <button
            type="button"
            className="asset-transfer-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="asset-transfer-content">
          {/* ========================================
              HEADER
              ======================================== */}

          <section className="asset-transfer-header">
            <Link to="/assets" className="asset-transfer-back">
              ← Back to Assets
            </Link>

            <p className="asset-transfer-eyebrow">ASSET MANAGEMENT</p>

            <h2>Transfer Asset</h2>

            <p className="asset-transfer-subtitle">
              Move an assigned asset from its current outlet to another active
              outlet.
            </p>
          </section>

          {/* ========================================
              SUCCESS
              ======================================== */}

          {success && (
            <div
              ref={successRef}
              className="asset-transfer-message asset-transfer-success"
              role="status"
            >
              <div className="asset-transfer-message-icon">✓</div>

              <div className="asset-transfer-message-content">
                <strong>Transfer Successful</strong>

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
              className="asset-transfer-message asset-transfer-error"
              role="alert"
            >
              <div className="asset-transfer-message-icon">!</div>

              <div className="asset-transfer-message-content">
                <strong>Transfer Failed</strong>

                <span>{error}</span>
              </div>
            </div>
          )}

          {/* ========================================
              SUMMARY
              ======================================== */}

          <section className="asset-transfer-summary">
            <div className="asset-transfer-summary-card">
              <div className="asset-transfer-summary-icon green">⇄</div>

              <div>
                <span>Assigned Assets</span>

                <strong>{assets.length}</strong>
              </div>
            </div>

            <div className="asset-transfer-summary-card">
              <div className="asset-transfer-summary-icon blue">⌖</div>

              <div>
                <span>Available Outlets</span>

                <strong>
                  {
                    outlets.filter((outlet) => outlet.status !== "INACTIVE")
                      .length
                  }
                </strong>
              </div>
            </div>

            <div className="asset-transfer-summary-card">
              <div className="asset-transfer-summary-icon purple">✓</div>

              <div>
                <span>Transfer Status</span>

                <strong>Ready</strong>
              </div>
            </div>
          </section>

          {/* ========================================
              TRANSFER CARD
              ======================================== */}

          <section className="asset-transfer-card">
            <div className="asset-transfer-card-header">
              <div>
                <h3>Transfer Asset</h3>

                <p>Select the asset and its new destination outlet.</p>
              </div>

              <span className="asset-transfer-required">* Required</span>
            </div>

            {/* ========================================
                FORM
                ======================================== */}

            <form className="asset-transfer-form" onSubmit={handleTransfer}>
              {/* ========================================
                  ASSET
                  ======================================== */}

              <div className="asset-transfer-field">
                <label htmlFor="asset">
                  Assigned Asset
                  <span>*</span>
                </label>

                <SearchableSelect
                  id="asset"
                  value={assetId}
                  onChange={(selectedAssetId) => {
                    setAssetId(selectedAssetId);

                    setOutletId("");
                  }}
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
                  <small className="asset-transfer-field-note">
                    No assigned assets are currently available for transfer.
                  </small>
                )}
              </div>

              {/* ========================================
                  NEW OUTLET
                  ======================================== */}

              <div className="asset-transfer-field">
                <label htmlFor="outlet">
                  New Outlet
                  <span>*</span>
                </label>

                <SearchableSelect
                  id="outlet"
                  value={outletId}
                  onChange={setOutletId}
                  options={outlets
                    .filter((outlet) => outlet.status !== "INACTIVE")
                    .filter((outlet) => outlet._id !== currentOutletId)}
                  getOptionLabel={(outlet) =>
                    `${outlet.name} — ${outlet.code || outlet.outletCode || "N/A"}`
                  }
                  placeholder="Search outlet by name or code"
                  disabled={submitting || !assetId}
                  required
                  noOptionsMessage="No other active outlets found."
                />

                {!assetId && (
                  <small className="asset-transfer-field-note">
                    Select an asset first.
                  </small>
                )}
              </div>

              {/* ========================================
                  CURRENT → NEW PREVIEW
                  ======================================== */}

              {selectedAsset && (
                <div className="asset-transfer-route">
                  <div className="asset-transfer-route-header">
                    <span>Transfer Preview</span>

                    <span className="asset-transfer-route-status">
                      ASSIGNED
                    </span>
                  </div>

                  <div className="asset-transfer-route-body">
                    {/* CURRENT */}

                    <div className="asset-transfer-location current">
                      <div className="asset-transfer-location-icon">⌖</div>

                      <div>
                        <span>Current Outlet</span>

                        <strong>
                          {selectedAsset.currentOutlet?.name || "N/A"}
                        </strong>

                        <small>
                          Code:{" "}
                          {selectedAsset.currentOutlet?.outletCode ||
                            selectedAsset.currentOutlet?.code ||
                            "N/A"}
                        </small>
                      </div>
                    </div>

                    {/* ARROW */}

                    <div className="asset-transfer-route-arrow">→</div>

                    {/* NEW */}

                    <div className="asset-transfer-location new">
                      <div className="asset-transfer-location-icon">⌖</div>

                      <div>
                        <span>New Outlet</span>

                        <strong>
                          {selectedOutlet?.name || "Select outlet"}
                        </strong>

                        <small>
                          Code:{" "}
                          {selectedOutlet?.code ||
                            selectedOutlet?.outletCode ||
                            "N/A"}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================
                  ASSET DETAILS
                  ======================================== */}

              {selectedAsset && (
                <div className="asset-transfer-asset-preview">
                  <div className="asset-transfer-preview-header">
                    <span>Asset Information</span>
                  </div>

                  <div className="asset-transfer-preview-grid">
                    <div>
                      <span>AIN</span>

                      <strong>{selectedAsset.ain}</strong>
                    </div>

                    <div>
                      <span>Serial Number</span>

                      <strong>{selectedAsset.serialNumber}</strong>
                    </div>

                    <div>
                      <span>Capacity</span>

                      <strong>{selectedAsset.capacity} L</strong>
                    </div>

                    <div>
                      <span>Manufacturer</span>

                      <strong>
                        {selectedAsset.manufacturer?.name || "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================
                  REMARKS
                  ======================================== */}

              <div className="asset-transfer-field asset-transfer-field-full">
                <label htmlFor="remarks">Remarks</label>

                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add optional transfer remarks..."
                  rows="4"
                  disabled={submitting}
                />

                <small className="asset-transfer-field-note">Optional.</small>
              </div>

              {/* ========================================
                  ACTIONS
                  ======================================== */}

              <div className="asset-transfer-actions">
                <Link to="/assets" className="asset-transfer-cancel">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="asset-transfer-submit"
                  disabled={
                    submitting || !assetId || !outletId || assets.length === 0
                  }
                >
                  {submitting ? "Transferring..." : "Transfer Asset"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AssetTransfer;
