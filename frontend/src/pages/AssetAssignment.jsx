import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchableSelect from "../components/SearchableSelect";

import api from "../services/api";

import "./AssetAssignment.css";

function AssetAssignment() {
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
        // GET IN-STOCK ASSETS
        // ========================================

        const assetResponse = await api.get("/assets", {
          params: {
            status: "IN_STOCK",
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
          "Load Assignment Data Error:",
          error.response?.data || error.message,
        );

        showError(
          error.response?.data?.message || "Failed to load assets and outlets.",
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
  // ASSIGN ASSET
  // ========================================

  const handleAssign = async (event) => {
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
    // VALIDATE OUTLET
    // ========================================

    if (!outletId) {
      showError("Please select an outlet.");

      return;
    }

    try {
      setSubmitting(true);

      // ========================================
      // ASSIGN ASSET
      // ========================================

      const response = await api.put(`/assets/${assetId}/assign`, {
        outletId,
        remarks: remarks.trim(),
      });

      // ========================================
      // SUCCESS
      // ========================================

      showSuccess(
        response.data.message || "Asset assigned to outlet successfully.",
      );

      // ========================================
      // REMOVE ASSIGNED ASSET FROM LIST
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
        "Assign Asset Error:",
        error.response?.data || error.message,
      );

      showError(error.response?.data?.message || "Failed to assign asset.");
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // SELECTED ASSET
  // ========================================

  const selectedAsset = assets.find((asset) => asset._id === assetId);

  // ========================================
  // SELECTED OUTLET
  // ========================================

  const selectedOutlet = outlets.find((outlet) => outlet._id === outletId);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="assignment-loading-page">
        <div className="assignment-spinner" />

        <span>Loading assignment data...</span>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className={`assignment-layout ${
        sidebarOpen ? "assignment-sidebar-open" : "assignment-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="assignment-main">
        <Navbar />

        {/* SHOW SIDEBAR */}

        {!sidebarOpen && (
          <button
            type="button"
            className="assignment-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="assignment-content">
          {/* ========================================
              HEADER
              ======================================== */}

          <section className="assignment-header">
            <div>
              <Link to="/assets" className="assignment-back">
                ← Back to Assets
              </Link>

              <p className="assignment-eyebrow">ASSET MANAGEMENT</p>

              <h2>Asset Assignment</h2>

              <p className="assignment-subtitle">
                Assign an available warehouse asset to an active outlet.
              </p>
            </div>
          </section>

          {/* ========================================
              SUCCESS MESSAGE
              ======================================== */}

          {success && (
            <div
              ref={successRef}
              className="assignment-message assignment-success"
            >
              <div className="assignment-message-icon">✓</div>

              <div className="assignment-message-content">
                <strong>Assignment Successful</strong>

                <span>{success}</span>
              </div>
            </div>
          )}

          {/* ========================================
              ERROR MESSAGE
              ======================================== */}

          {error && (
            <div ref={errorRef} className="assignment-message assignment-error">
              <div className="assignment-message-icon">!</div>

              <div className="assignment-message-content">
                <strong>Assignment Failed</strong>

                <span>{error}</span>
              </div>
            </div>
          )}

          {/* ========================================
              SUMMARY
              ======================================== */}

          <section className="assignment-summary">
            <div className="assignment-summary-card">
              <div className="assignment-summary-icon assignment-summary-green">
                ◈
              </div>

              <div>
                <span>Available Assets</span>

                <strong>{assets.length}</strong>
              </div>
            </div>

            <div className="assignment-summary-card">
              <div className="assignment-summary-icon assignment-summary-blue">
                ⌖
              </div>

              <div>
                <span>Available Outlets</span>

                <strong>{outlets.length}</strong>
              </div>
            </div>

            <div className="assignment-summary-card">
              <div className="assignment-summary-icon assignment-summary-purple">
                ✓
              </div>

              <div>
                <span>Assignment Status</span>

                <strong>Ready</strong>
              </div>
            </div>
          </section>

          {/* ========================================
              MAIN ASSIGNMENT CARD
              ======================================== */}

          <section className="assignment-card">
            <div className="assignment-card-header">
              <div>
                <h3>Assign Asset to Outlet</h3>

                <p>Select an IN STOCK asset and the destination outlet.</p>
              </div>

              <span className="assignment-required">* Required</span>
            </div>

            <form className="assignment-form" onSubmit={handleAssign}>
              {/* ========================================
                  ASSET
                  ======================================== */}

              <div className="assignment-field">
                <label htmlFor="asset">
                  Available Asset
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
                  placeholder="Search asset by AIN, serial number, or capacity"
                  disabled={submitting}
                  required
                  noOptionsMessage="No IN STOCK assets found."
                />

                {assets.length === 0 && (
                  <small className="assignment-field-note">
                    No IN STOCK assets are currently available.
                  </small>
                )}
              </div>

              {/* ========================================
                  OUTLET
                  ======================================== */}

              <div className="assignment-field">
                <label htmlFor="outlet">
                  Destination Outlet
                  <span>*</span>
                </label>

                <SearchableSelect
                  id="outlet"
                  value={outletId}
                  onChange={setOutletId}
                  options={outlets.filter(
                    (outlet) => outlet.status !== "INACTIVE",
                  )}
                  getOptionLabel={(outlet) =>
                    `${outlet.name} — ${outlet.code || outlet.outletCode || "N/A"}`
                  }
                  placeholder="Search outlet by name or code"
                  disabled={submitting}
                  required
                  noOptionsMessage="No active outlets found."
                />
              </div>

              {/* ========================================
                  SELECTED ASSET PREVIEW
                  ======================================== */}

              {selectedAsset && (
                <div className="assignment-preview">
                  <div className="assignment-preview-header">
                    <span>Selected Asset</span>

                    <span className="assignment-preview-status">IN STOCK</span>
                  </div>

                  <div className="assignment-preview-grid">
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
                  SELECTED OUTLET PREVIEW
                  ======================================== */}

              {selectedOutlet && (
                <div className="assignment-outlet-preview">
                  <div className="assignment-preview-header">
                    <span>Destination Outlet</span>

                    <span className="assignment-outlet-status">
                      {selectedOutlet.status || "ACTIVE"}
                    </span>
                  </div>

                  <div className="assignment-outlet-info">
                    <strong>{selectedOutlet.name}</strong>

                    <span>
                      Code:{" "}
                      {selectedOutlet.code ||
                        selectedOutlet.outletCode ||
                        "N/A"}
                    </span>

                    <span>
                      {selectedOutlet.address || "Address not available"}
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================
                  REMARKS
                  ======================================== */}

              <div className="assignment-field assignment-field-full">
                <label htmlFor="remarks">Remarks</label>

                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add optional assignment remarks..."
                  rows="4"
                  disabled={submitting}
                />

                <small className="assignment-field-note">Optional.</small>
              </div>

              {/* ========================================
                  ACTIONS
                  ======================================== */}

              <div className="assignment-actions">
                <Link to="/assets" className="assignment-cancel">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="assignment-submit"
                  disabled={submitting || assets.length === 0}
                >
                  {submitting ? "Assigning..." : "Assign Asset"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AssetAssignment;
