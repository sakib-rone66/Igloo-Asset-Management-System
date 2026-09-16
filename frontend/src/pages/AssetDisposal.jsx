import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchableSelect from "../components/SearchableSelect";

import api from "../services/api";

import "./AssetDisposal.css";

function AssetDisposal() {
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

  const [reason, setReason] = useState("");

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
  // LOAD ASSETS
  // ========================================

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError("");

        // ========================================
        // GET ALL ASSETS
        // ========================================

        const response = await api.get("/assets", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        const allAssets = response.data.assets || [];

        // ========================================
        // ONLY SHOW ASSETS ELIGIBLE
        // FOR DISPOSAL
        //
        // Allowed:
        // IN_STOCK
        // ASSIGNED
        //
        // Not allowed:
        // UNDER_REPAIR
        // DISPOSED
        // ========================================

        const disposableAssets = allAssets.filter(
          (asset) => asset.status === "IN_STOCK" || asset.status === "ASSIGNED",
        );

        setAssets(disposableAssets);
      } catch (error) {
        console.error(
          "Load Disposal Assets Error:",
          error.response?.data || error.message,
        );

        showError(error.response?.data?.message || "Failed to load assets.");
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
  // HANDLE DISPOSAL
  // ========================================

  const handleDispose = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ========================================
    // VALIDATE ASSET
    // ========================================

    if (!assetId) {
      showError("Please select an asset.");

      return;
    }

    // ========================================
    // VALIDATE REASON
    // ========================================

    if (!reason.trim()) {
      showError("Disposal reason is required.");

      return;
    }

    try {
      setSubmitting(true);

      // ========================================
      // SEND DISPOSAL REQUEST
      // ========================================

      const response = await api.post("/disposals", {
        assetId,
        reason: reason.trim(),
        remarks: remarks.trim(),
      });

      // ========================================
      // SUCCESS
      // ========================================

      showSuccess(response.data.message || "Asset disposed successfully.");

      // ========================================
      // REMOVE DISPOSED ASSET
      // FROM CURRENT DROPDOWN
      // ========================================

      setAssets((currentAssets) =>
        currentAssets.filter((asset) => asset._id !== assetId),
      );

      // ========================================
      // CLEAR FORM
      // ========================================

      setAssetId("");
      setReason("");
      setRemarks("");
    } catch (error) {
      console.error(
        "Dispose Asset Error:",
        error.response?.data || error.message,
      );

      showError(error.response?.data?.message || "Failed to dispose asset.");
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="asset-disposal-loading-page">
        <div className="asset-disposal-spinner" />

        <span>Loading assets...</span>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className={`asset-disposal-layout ${
        sidebarOpen
          ? "asset-disposal-sidebar-open"
          : "asset-disposal-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="asset-disposal-main">
        <Navbar />

        {/* ========================================
            SHOW SIDEBAR BUTTON
            ======================================== */}

        {!sidebarOpen && (
          <button
            type="button"
            className="asset-disposal-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="asset-disposal-content">
          {/* ========================================
              HEADER
              ======================================== */}

          <section className="asset-disposal-header">
            <Link to="/assets" className="asset-disposal-back">
              ← Back to Assets
            </Link>

            <p className="asset-disposal-eyebrow">ASSET MANAGEMENT</p>

            <h2>Dispose Asset</h2>

            <p className="asset-disposal-subtitle">
              Permanently move an eligible asset into the disposed lifecycle
              status.
            </p>
          </section>

          {/* ========================================
              WARNING
              ======================================== */}

          <div className="asset-disposal-warning">
            <div className="asset-disposal-warning-icon">!</div>

            <div>
              <strong>Important</strong>

              <p>
                Disposal is a permanent asset lifecycle action. Confirm the
                selected asset and disposal reason before submitting.
              </p>
            </div>
          </div>

          {/* ========================================
              SUCCESS
              ======================================== */}

          {success && (
            <div
              ref={successRef}
              className="asset-disposal-message asset-disposal-success"
              role="status"
            >
              <div className="asset-disposal-message-icon">✓</div>

              <div className="asset-disposal-message-content">
                <strong>Disposal Successful</strong>

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
              className="asset-disposal-message asset-disposal-error"
              role="alert"
            >
              <div className="asset-disposal-message-icon">!</div>

              <div className="asset-disposal-message-content">
                <strong>Disposal Failed</strong>

                <span>{error}</span>
              </div>
            </div>
          )}

          {/* ========================================
              SUMMARY
              ======================================== */}

          <section className="asset-disposal-summary">
            <div className="asset-disposal-summary-card">
              <div className="asset-disposal-summary-icon red">⌫</div>

              <div>
                <span>Eligible for Disposal</span>

                <strong>{assets.length}</strong>
              </div>
            </div>

            <div className="asset-disposal-summary-card">
              <div className="asset-disposal-summary-icon orange">!</div>

              <div>
                <span>Action</span>

                <strong>Disposal</strong>
              </div>
            </div>

            <div className="asset-disposal-summary-card">
              <div className="asset-disposal-summary-icon purple">✓</div>

              <div>
                <span>Status</span>

                <strong>Ready</strong>
              </div>
            </div>
          </section>

          {/* ========================================
              MAIN CARD
              ======================================== */}

          <section className="asset-disposal-card">
            <div className="asset-disposal-card-header">
              <div>
                <h3>Asset Disposal Request</h3>

                <p>
                  Select an eligible asset and provide the reason for disposal.
                </p>
              </div>

              <span className="asset-disposal-required">* Required</span>
            </div>

            {/* ========================================
                FORM
                ======================================== */}

            <form className="asset-disposal-form" onSubmit={handleDispose}>
              {/* ========================================
                  SELECT ASSET
                  ======================================== */}

              <div className="asset-disposal-field">
                <label htmlFor="asset">
                  Select Asset
                  <span>*</span>
                </label>

                <SearchableSelect
                  id="asset"
                  value={assetId}
                  onChange={setAssetId}
                  options={assets}
                  getOptionLabel={(asset) =>
                    `${asset.ain} — SN: ${asset.serialNumber} — ${asset.capacity}L — ${asset.status}`
                  }
                  placeholder="Search asset by AIN, serial number, or capacity"
                  disabled={submitting}
                  required
                  noOptionsMessage="No eligible assets found."
                />

                {assets.length === 0 && (
                  <small className="asset-disposal-field-note">
                    No assets are currently eligible for disposal.
                  </small>
                )}
              </div>

              {/* ========================================
                  REASON
                  ======================================== */}

              <div className="asset-disposal-field">
                <label htmlFor="reason">
                  Disposal Reason
                  <span>*</span>
                </label>

                <input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Example: Beyond economical repair"
                  disabled={submitting}
                  required
                />

                <small className="asset-disposal-field-note">
                  Clearly describe why the asset is being disposed.
                </small>
              </div>

              {/* ========================================
                  SELECTED ASSET PREVIEW
                  ======================================== */}

              {selectedAsset && (
                <div className="asset-disposal-preview">
                  <div className="asset-disposal-preview-header">
                    <span>Selected Asset</span>

                    <span className="asset-disposal-status">
                      {selectedAsset.status}
                    </span>
                  </div>

                  <div className="asset-disposal-preview-grid">
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
                        {selectedAsset.currentOutlet?.name || "Warehouse"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================
                  REMARKS
                  ======================================== */}

              <div className="asset-disposal-field asset-disposal-field-full">
                <label htmlFor="remarks">Remarks</label>

                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add optional disposal remarks..."
                  rows="4"
                  disabled={submitting}
                />

                <small className="asset-disposal-field-note">Optional.</small>
              </div>

              {/* ========================================
                  FINAL CONFIRMATION
                  ======================================== */}

              {selectedAsset && reason.trim() && (
                <div className="asset-disposal-confirm">
                  <div className="asset-disposal-confirm-icon">!</div>

                  <div>
                    <strong>Ready to dispose this asset?</strong>

                    <p>
                      Asset <b>{selectedAsset.ain}</b> will be submitted for
                      disposal with the reason: <b>{reason.trim()}</b>
                    </p>
                  </div>
                </div>
              )}

              {/* ========================================
                  ACTIONS
                  ======================================== */}

              <div className="asset-disposal-actions">
                <Link to="/assets" className="asset-disposal-cancel">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="asset-disposal-submit"
                  disabled={
                    submitting ||
                    !assetId ||
                    !reason.trim() ||
                    assets.length === 0
                  }
                >
                  {submitting ? "Disposing..." : "Dispose Asset"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AssetDisposal;
