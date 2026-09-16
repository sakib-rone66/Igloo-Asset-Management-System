import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
import api from "../services/api";

import "./VerificationMapping.css";

function VerificationMapping() {
  // ========================================
  // FORM
  // ========================================

  const [ain, setAin] = useState("");
  const [outletId, setOutletId] = useState("");
  const [outletSearch, setOutletSearch] = useState("");
  const [remarks, setRemarks] = useState("");

  // ========================================
  // DATA
  // ========================================

  const [asset, setAsset] = useState(null);
  const [outlets, setOutlets] = useState([]);

  // ========================================
  // UI
  // ========================================

  const [loadingOutlets, setLoadingOutlets] = useState(true);

  const [searching, setSearching] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  // ========================================
  // PAGE TOP REF
  // ========================================

  const pageTopRef = useRef(null);

  // ========================================
  // LOAD OUTLETS
  // ========================================

  useEffect(() => {
    const loadOutlets = async () => {
      try {
        setLoadingOutlets(true);

        const response = await api.get("/outlets?status=ACTIVE");

        setOutlets(response.data.outlets || []);
      } catch (error) {
        console.error(
          "Load Outlets Error:",
          error.response?.data || error.message,
        );

        setError(error.response?.data?.message || "Failed to load outlets.");
      } finally {
        setLoadingOutlets(false);
      }
    };

    loadOutlets();
  }, []);

  // ========================================
  // SCROLL TO TOP
  // ========================================

  const scrollToTop = () => {
    // Browser-level scroll
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Also scroll our page container to top
    pageTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ========================================
  // SUCCESS MESSAGE
  // ========================================

  const showSuccess = (message) => {
    setError("");
    setSuccess(message);

    // Move page to top immediately
    // so the success notification is visible
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Hide after 4 seconds
    setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  // ========================================
  // ERROR MESSAGE
  // ========================================

  const showError = (message) => {
    setSuccess("");
    setError(message);

    // Move to top for error too
    requestAnimationFrame(() => {
      scrollToTop();
    });

    setTimeout(() => {
      setError("");
    }, 4000);
  };

  // ========================================
  // FIND ASSET BY AIN
  // ========================================

  const handleFindAsset = async () => {
    if (!ain.trim()) {
      showError("Please enter the AIN.");

      return;
    }

    try {
      setSearching(true);
      setError("");
      setSuccess("");
      setAsset(null);
      setOutletId("");
      setOutletSearch("");

      const response = await api.get(
        `/verification-mappings/asset/ain/${encodeURIComponent(ain.trim())}`,
      );

      setAsset(response.data.asset);
    } catch (error) {
      console.error("Find Asset Error:", error.response?.data || error.message);

      showError(error.response?.data?.message || "Asset could not be found.");
    } finally {
      setSearching(false);
    }
  };

  // ========================================
  // SELECTED OUTLET
  // ========================================

  const selectedOutlet = outlets.find((outlet) => outlet._id === outletId);

  // ========================================
  // HANDLE SUBMIT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ========================================
    // VALIDATE ASSET
    // ========================================

    if (!asset) {
      showError("Please enter and verify a valid AIN first.");

      return;
    }

    // ========================================
    // VALIDATE OUTLET
    // ========================================

    if (!outletId) {
      showError("Please select the outlet.");

      return;
    }

    // ========================================
    // FRONTEND OUTLET MATCH
    // ========================================

    if (asset.currentOutlet?._id && asset.currentOutlet._id !== outletId) {
      showError("Selected outlet does not match the asset's assigned outlet.");

      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/verification-mappings", {
        ain: ain.trim(),
        outletId,
        remarks: remarks.trim() || null,
      });

      // ========================================
      // SUCCESS
      // ========================================

      showSuccess(
        response.data.message || "Verification mapping submitted successfully.",
      );

      // ========================================
      // CLEAR FORM
      // ========================================

      setAin("");
      setAsset(null);
      setOutletId("");
      setOutletSearch("");
      setRemarks("");
    } catch (error) {
      console.error(
        "Submit Mapping Error:",
        error.response?.data || error.message,
      );

      showError(
        error.response?.data?.message ||
          "Failed to submit verification mapping.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPageLayout>
      <div className="mapping-page" ref={pageTopRef}>
        {/* ========================================
          FIXED SUCCESS TOAST
          ======================================== */}

        {success && (
          <div
            className="mapping-toast mapping-success"
            role="status"
            aria-live="polite"
          >
            <div className="mapping-toast-icon">✓</div>

            <div className="mapping-toast-content">
              <strong>Request Submitted</strong>

              <span>{success}</span>
            </div>
          </div>
        )}

        {/* ========================================
          FIXED ERROR TOAST
          ======================================== */}

        {error && (
          <div
            className="mapping-toast mapping-error"
            role="alert"
            aria-live="assertive"
          >
            <div className="mapping-toast-icon">!</div>

            <div className="mapping-toast-content">
              <strong>Action Failed</strong>

              <span>{error}</span>
            </div>
          </div>
        )}

        <main className="mapping-container">
          {/* ========================================
            HEADER
            ======================================== */}

          <header className="mapping-header">
            <Link to="/assets" className="mapping-back">
              ← Back to Assets
            </Link>

            <p className="mapping-eyebrow">ASSET MANAGEMENT</p>

            <h1>Verification Request</h1>

            <p>
              Verify that the physical asset is correctly mapped to its assigned
              outlet.
            </p>
          </header>

          {/* ========================================
            MAIN CARD
            ======================================== */}

          <section className="mapping-card">
            <div className="mapping-card-header">
              <div>
                <h2>Asset Mapping Information</h2>

                <p>Enter the AIN printed on the registered asset.</p>
              </div>

              <span className="mapping-pending">Admin Review Required</span>
            </div>

            <form onSubmit={handleSubmit} className="mapping-form">
              {/* ========================================
                AIN
                ======================================== */}

              <div className="mapping-field mapping-field-full">
                <label htmlFor="ain">
                  Asset Identification Number
                  <span>*</span>
                </label>

                <div className="mapping-ain-row">
                  <input
                    id="ain"
                    type="text"
                    value={ain}
                    onChange={(event) => {
                      setAin(event.target.value);

                      setAsset(null);
                      setOutletId("");
                      setOutletSearch("");
                      setError("");
                    }}
                    placeholder="Enter AIN"
                    disabled={searching || submitting}
                  />

                  <button
                    type="button"
                    onClick={handleFindAsset}
                    disabled={searching || submitting || !ain.trim()}
                    className="mapping-find-button"
                  >
                    {searching ? "Finding..." : "Find Asset"}
                  </button>
                </div>

                <small>
                  Enter the AIN from the QR or asset registration information.
                </small>
              </div>

              {/* ========================================
                ASSET INFORMATION
                ======================================== */}

              {asset && (
                <section className="mapping-asset-card">
                  <div className="mapping-asset-top">
                    <div>
                      <span>Asset Identification Number</span>

                      <strong>{asset.ain}</strong>
                    </div>

                    <span className="mapping-asset-status">{asset.status}</span>
                  </div>

                  <div className="mapping-asset-grid">
                    <div>
                      <span>Serial Number</span>

                      <strong>{asset.serialNumber}</strong>
                    </div>

                    <div>
                      <span>Capacity</span>

                      <strong>{asset.capacity} L</strong>
                    </div>

                    <div>
                      <span>Manufacturer</span>

                      <strong>{asset.manufacturer?.name || "N/A"}</strong>
                    </div>

                    <div>
                      <span>Activated</span>

                      <strong>{asset.isActivated ? "Yes" : "No"}</strong>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================
                OUTLET
                ======================================== */}

              <div className="mapping-field">
                <label htmlFor="outlet-search">
                  Search Outlet
                  <span>*</span>
                </label>

                <div className="mapping-outlet-search">
                  <input
                    id="outlet-search"
                    type="text"
                    value={outletSearch}
                    onChange={(event) => {
                      setOutletSearch(event.target.value);
                      setOutletId("");
                    }}
                    placeholder={
                      loadingOutlets
                        ? "Loading outlets..."
                        : !asset
                          ? "Find asset first"
                          : "Type outlet name"
                    }
                    disabled={submitting || loadingOutlets || !asset}
                    autoComplete="off"
                  />

                  {asset && outletSearch.trim() && !outletId && (
                    <div className="mapping-outlet-results">
                      {outlets.filter((outlet) =>
                        outlet.name
                          .toLowerCase()
                          .includes(outletSearch.trim().toLowerCase()),
                      ).length > 0 ? (
                        outlets
                          .filter((outlet) =>
                            outlet.name
                              .toLowerCase()
                              .includes(outletSearch.trim().toLowerCase()),
                          )
                          .map((outlet) => (
                            <button
                              type="button"
                              className="mapping-outlet-result"
                              key={outlet._id}
                              onClick={() => {
                                setOutletId(outlet._id);
                                setOutletSearch(outlet.name);
                              }}
                            >
                              <strong>{outlet.name}</strong>
                              <span>{outlet.code || "No code"}</span>
                            </button>
                          ))
                      ) : (
                        <div className="mapping-outlet-no-results">
                          No outlets found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {outletId && selectedOutlet && (
                  <small className="mapping-outlet-selected">
                    Selected: {selectedOutlet.name}
                  </small>
                )}
              </div>

              {/* ========================================
                ASSIGNED OUTLET
                ======================================== */}

              {asset && (
                <div className="mapping-assigned-outlet">
                  <div className="mapping-location-icon">⌖</div>

                  <div className="mapping-assigned-outlet-content">
                    <span>Currently Assigned Outlet</span>

                    <strong>
                      {asset.currentOutlet?.name || "No outlet assigned"}
                    </strong>

                    <small>Code: {asset.currentOutlet?.code || "N/A"}</small>
                  </div>

                  {selectedOutlet &&
                    asset.currentOutlet?._id === selectedOutlet._id && (
                      <span className="mapping-match">✓ Match</span>
                    )}
                </div>
              )}

              {/* ========================================
                REMARKS
                ======================================== */}

              <div className="mapping-field mapping-field-full">
                <label htmlFor="remarks">Remarks</label>

                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add mapping verification remarks..."
                  rows="4"
                  disabled={submitting}
                />

                <small>Optional.</small>
              </div>

              {/* ========================================
                PROCESS INFORMATION
                ======================================== */}

              <div className="mapping-info">
                <div className="mapping-info-icon">✓</div>

                <div>
                  <strong>Verification Process</strong>

                  <p>Your mapping request will be sent to the System Admin.</p>

                  <p>
                    If approved, the asset will be activated and the
                    verification process will be completed.
                  </p>

                  <p>
                    If rejected, the System Admin provides rejection remarks and
                    you can submit the mapping again.
                  </p>
                </div>
              </div>

              {/* ========================================
                ACTIONS
                ======================================== */}

              <div className="mapping-actions">
                <button
                  type="button"
                  className="mapping-clear"
                  disabled={submitting}
                  onClick={() => {
                    setAin("");
                    setAsset(null);
                    setOutletId("");
                    setOutletSearch("");
                    setRemarks("");
                    setError("");
                    setSuccess("");

                    scrollToTop();
                  }}
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="mapping-submit"
                  disabled={submitting || !asset || !outletId}
                >
                  {submitting ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </AppPageLayout>
  );
}

export default VerificationMapping;
