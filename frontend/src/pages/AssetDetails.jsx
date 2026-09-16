import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./AssetDetails.css";

function AssetDetails() {
  // ========================================
  // URL PARAMETER
  // ========================================

  const { id } = useParams();

  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // ASSET
  // ========================================

  const [asset, setAsset] = useState(null);

  // ========================================
  // UI
  // ========================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ========================================
  // FETCH ASSET
  // ========================================

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await api.get(`/assets/${id}`);

        setAsset(response.data.asset);
      } catch (error) {
        console.error(
          "Get Asset Error:",
          error.response?.data || error.message,
        );

        setError(error.response?.data?.message || "Failed to load asset.");
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  // ========================================
  // STATUS HELPERS
  // ========================================

  const getStatusClass = (value) => {
    return `asset-details-status asset-details-status-${String(
      value || "",
    ).toLowerCase()}`;
  };

  const getVerificationClass = (value) => {
    return `asset-details-verification asset-details-verification-${String(
      value || "",
    )
      .toLowerCase()
      .replace("_", "-")}`;
  };

  // ========================================
  // FORMAT DATE
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
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="asset-details-loading-page">
        <div className="asset-details-spinner" />

        <span>Loading asset details...</span>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="asset-details-layout">
        <div className="asset-details-error-page">
          <div className="asset-details-error-icon">!</div>

          <h2>Unable to Load Asset</h2>

          <p>{error}</p>

          <Link to="/assets" className="asset-details-back-button">
            ← Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // NOT FOUND
  // ========================================

  if (!asset) {
    return (
      <div className="asset-details-layout">
        <div className="asset-details-error-page">
          <div className="asset-details-error-icon">?</div>

          <h2>Asset Not Found</h2>

          <p>The requested asset could not be found.</p>

          <Link to="/assets" className="asset-details-back-button">
            ← Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // DATA
  // ========================================

  const verificationStatus = asset.verificationStatus || "NOT_VERIFIED";

  const lastVerifiedDate = asset.lastVerifiedAt
    ? formatDate(asset.lastVerifiedAt)
    : "Never";

  const activatedDate = asset.activatedAt
    ? formatDate(asset.activatedAt)
    : "Not activated";

  const assetCreatedDate = asset.createdAt
    ? formatDate(asset.createdAt)
    : "N/A";

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`asset-details-layout ${
        sidebarOpen
          ? "asset-details-sidebar-open"
          : "asset-details-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="asset-details-main">
        <Navbar />

        {/* ========================================
            SHOW SIDEBAR
            ======================================== */}

        {!sidebarOpen && (
          <button
            type="button"
            className="asset-details-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="asset-details-content">
          {/* ========================================
              BACK
              ======================================== */}

          <Link to="/assets" className="asset-details-back">
            ← Back to Assets
          </Link>

          {/* ========================================
              HERO
              ======================================== */}

          <section className="asset-details-hero">
            <div className="asset-details-hero-left">
              <div className="asset-details-hero-icon">◈</div>

              <div>
                <p className="asset-details-eyebrow">ASSET DETAILS</p>

                <h2>{asset.ain}</h2>

                <p className="asset-details-serial">
                  Serial Number: <strong>{asset.serialNumber}</strong>
                </p>
              </div>
            </div>

            <div className="asset-details-hero-status">
              <span className="asset-details-status-label">
                Lifecycle Status
              </span>

              <span className={getStatusClass(asset.status)}>
                {asset.status?.replace("_", " ")}
              </span>
            </div>
          </section>

          {/* ========================================
              QUICK ACTIONS
              ======================================== */}

          <section className="asset-details-actions">
            <Link
              to={`/assets/${asset._id}/history`}
              className="asset-details-action"
            >
              <span>◷</span>

              <div>
                <strong>Asset History</strong>

                <small>View lifecycle history</small>
              </div>

              <b>→</b>
            </Link>

            <Link
              to={`/assets/${asset._id}/verification-history`}
              className="asset-details-action"
            >
              <span>✓</span>

              <div>
                <strong>Verification History</strong>

                <small>View verification records</small>
              </div>

              <b>→</b>
            </Link>

            <Link
              to={`/assets/${asset._id}/qr`}
              className="asset-details-action"
            >
              <span>▦</span>

              <div>
                <strong>QR Code</strong>

                <small>View asset QR code</small>
              </div>

              <b>→</b>
            </Link>
          </section>

          {/* ========================================
              INFORMATION GRID
              ======================================== */}

          <div className="asset-details-grid">
            {/* ========================================
                BASIC INFORMATION
                ======================================== */}

            <section className="asset-details-card">
              <div className="asset-details-card-header">
                <div>
                  <h3>Basic Information</h3>

                  <p>Main identification and manufacturing details.</p>
                </div>

                <span className="asset-details-card-icon">◈</span>
              </div>

              <div className="asset-details-info-grid">
                <div className="asset-details-info-item">
                  <span>AIN</span>

                  <strong className="asset-details-highlight">
                    {asset.ain}
                  </strong>
                </div>

                <div className="asset-details-info-item">
                  <span>Serial Number</span>

                  <strong>{asset.serialNumber}</strong>
                </div>

                <div className="asset-details-info-item">
                  <span>Capacity</span>

                  <strong>{asset.capacity} L</strong>
                </div>

                <div className="asset-details-info-item">
                  <span>Manufacturing Month</span>

                  <strong>{asset.manufacturingMonth}</strong>
                </div>

                <div className="asset-details-info-item">
                  <span>Manufacturing Year</span>

                  <strong>{asset.manufacturingYear}</strong>
                </div>

                <div className="asset-details-info-item">
                  <span>Registered</span>

                  <strong>{assetCreatedDate}</strong>
                </div>
              </div>
            </section>

            {/* ========================================
                MANUFACTURER
                ======================================== */}

            <section className="asset-details-card">
              <div className="asset-details-card-header">
                <div>
                  <h3>Manufacturer</h3>

                  <p>Asset manufacturer information.</p>
                </div>

                <span className="asset-details-card-icon">◉</span>
              </div>

              <div className="asset-details-single-info">
                <div>
                  <span>Manufacturer Name</span>

                  <strong>{asset.manufacturer?.name || "N/A"}</strong>
                </div>

                <div>
                  <span>Manufacturer Code</span>

                  <strong>{asset.manufacturer?.code || "N/A"}</strong>
                </div>
              </div>
            </section>

            {/* ========================================
                CURRENT LOCATION
                ======================================== */}

            <section className="asset-details-card">
              <div className="asset-details-card-header">
                <div>
                  <h3>Current Location</h3>

                  <p>Current physical asset location.</p>
                </div>

                <span className="asset-details-card-icon">⌖</span>
              </div>

              <div className="asset-details-location">
                <div className="asset-details-location-icon">⌖</div>

                <div>
                  <span>Current Outlet</span>

                  <strong>{asset.currentOutlet?.name || "Warehouse"}</strong>

                  <small>
                    Code: {asset.currentOutlet?.outletCode || "N/A"}
                  </small>
                </div>
              </div>
            </section>

            {/* ========================================
                ASSET STATUS
                ======================================== */}

            <section className="asset-details-card">
              <div className="asset-details-card-header">
                <div>
                  <h3>Asset Status</h3>

                  <p>Current lifecycle status.</p>
                </div>

                <span className="asset-details-card-icon">●</span>
              </div>

              <div className="asset-details-status-box">
                <span>Current Status</span>

                <span className={getStatusClass(asset.status)}>
                  {asset.status?.replace("_", " ")}
                </span>
              </div>
            </section>

            {/* ========================================
                VERIFICATION
                ======================================== */}

            <section className="asset-details-card">
              <div className="asset-details-card-header">
                <div>
                  <h3>Verification</h3>

                  <p>Physical verification information.</p>
                </div>

                <span className="asset-details-card-icon">✓</span>
              </div>

              <div className="asset-details-verification-box">
                <div>
                  <span>Verification Status</span>

                  <span className={getVerificationClass(verificationStatus)}>
                    {verificationStatus.replace("_", " ")}
                  </span>
                </div>

                <div>
                  <span>Last Verified</span>

                  <strong>{lastVerifiedDate}</strong>
                </div>
              </div>
            </section>

            {/* ========================================
                ACTIVATION
                ======================================== */}

            <section className="asset-details-card">
              <div className="asset-details-card-header">
                <div>
                  <h3>Activation</h3>

                  <p>Asset activation information.</p>
                </div>

                <span className="asset-details-card-icon">⚡</span>
              </div>

              <div className="asset-details-verification-box">
                <div>
                  <span>Activation Status</span>

                  <span
                    className={
                      asset.isActivated
                        ? "asset-details-activation-active"
                        : "asset-details-activation-inactive"
                    }
                  >
                    {asset.isActivated ? "ACTIVATED" : "NOT ACTIVATED"}
                  </span>
                </div>

                <div>
                  <span>Activated At</span>

                  <strong>{activatedDate}</strong>
                </div>

                <div>
                  <span>Activated By</span>

                  <strong>{asset.activatedBy?.name || "N/A"}</strong>
                </div>
              </div>
            </section>

            {/* ========================================
                AUTHORIZATION
                ======================================== */}

            <section className="asset-details-card asset-details-wide-card">
              <div className="asset-details-card-header">
                <div>
                  <h3>Authorization</h3>

                  <p>Authorization record associated with this asset.</p>
                </div>

                <span className="asset-details-card-icon">✓</span>
              </div>

              {asset.authorization ? (
                <div className="asset-details-authorization">
                  <div>
                    <span>Authorization ID</span>

                    <strong>{asset.authorization?._id || "N/A"}</strong>
                  </div>

                  <div>
                    <span>Authorization Status</span>

                    <span className="asset-details-authorization-approved">
                      {asset.authorization?.status || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span>Decision Date</span>

                    <strong>
                      {asset.authorization?.decisionDate
                        ? formatDate(asset.authorization.decisionDate)
                        : "N/A"}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="asset-details-no-data">
                  No authorization information available.
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssetDetails;
