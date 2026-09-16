import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";

import "./ScanAsset.css";

function ScanAsset() {
  const { id } = useParams();

  const [asset, setAsset] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/assets/public/qr/${id}`);

        setAsset(response.data.asset || null);
      } catch (error) {
        console.error(
          "Scan Asset Error:",
          error.response?.data || error.message,
        );

        setError(
          error.response?.data?.message || "Unable to load asset information.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAsset();
    } else {
      setError("Invalid QR code.");
      setLoading(false);
    }
  }, [id]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="scan-asset-loading">
        <div className="scan-asset-spinner" />

        <h2>Loading Asset</h2>

        <p>Fetching the latest asset information...</p>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="scan-asset-error-page">
        <div className="scan-asset-error-icon">!</div>

        <h2>Asset Information Unavailable</h2>

        <p>{error}</p>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="scan-asset-page">
      <main className="scan-asset-container">
        {/* BRAND */}

        <div className="scan-asset-brand">
          <div className="scan-asset-logo">A</div>

          <div>
            <strong>AMS</strong>

            <span>Asset Management System</span>
          </div>
        </div>

        {/* HEADER */}

        <section className="scan-asset-header">
          <span className="scan-asset-badge">✓ Registered Asset</span>

          <h1>Asset Information</h1>

          <p>Current information retrieved from the Asset Management System.</p>
        </section>

        {/* IDENTIFICATION */}

        <section className="scan-asset-identification">
          <div className="scan-asset-main-icon">◈</div>

          <div>
            <span>Asset Identification Number</span>

            <strong>{asset?.ain || "N/A"}</strong>

            <small>Asset ID: {asset?.id || "N/A"}</small>
          </div>
        </section>

        {/* ASSET DETAILS */}

        <section className="scan-asset-card">
          <div className="scan-asset-card-header">
            <div>
              <h2>Asset Details</h2>

              <p>Identification information</p>
            </div>
          </div>

          <div className="scan-asset-details-grid">
            <div className="scan-asset-detail">
              <span>Asset ID</span>

              <strong className="scan-asset-mono">{asset?.id || "N/A"}</strong>
            </div>

            <div className="scan-asset-detail">
              <span>Serial Number</span>

              <strong>{asset?.serialNumber || "N/A"}</strong>
            </div>

            <div className="scan-asset-detail">
              <span>AIN</span>

              <strong className="scan-asset-highlight">
                {asset?.ain || "N/A"}
              </strong>
            </div>

            <div className="scan-asset-detail">
              <span>Capacity</span>

              <strong>{asset?.capacity ? `${asset.capacity} L` : "N/A"}</strong>
            </div>

            <div className="scan-asset-detail">
              <span>Manufacturer</span>

              <strong>{asset?.manufacturer || "N/A"}</strong>
            </div>

            <div className="scan-asset-detail">
              <span>Verification Status</span>

              <strong className="scan-asset-status-value">
                {asset?.verificationStatus?.replaceAll("_", " ") || "N/A"}
              </strong>
            </div>

            <div className="scan-asset-detail">
              <span>Activation Status</span>

              <strong className="scan-asset-status-value">
                {asset?.activationStatus || "N/A"}
              </strong>
            </div>
          </div>
        </section>

        {/* CURRENT OUTLET */}

        <section className="scan-asset-card">
          <div className="scan-asset-card-header">
            <div>
              <h2>Current Outlet</h2>

              <p>Current registered location</p>
            </div>

            <span className="scan-asset-location-icon">⌖</span>
          </div>

          {asset?.currentOutlet ? (
            <div className="scan-asset-outlet">
              <div className="scan-asset-outlet-name">
                <strong>{asset.currentOutlet.name}</strong>

                <span>Code: {asset.currentOutlet.code || "N/A"}</span>
              </div>

              <div className="scan-asset-outlet-contact">
                <div>
                  <span>Contact Person</span>

                  <strong>{asset.currentOutlet.contactPerson || "N/A"}</strong>
                </div>

                <div>
                  <span>Phone</span>

                  <strong>{asset.currentOutlet.phone || "N/A"}</strong>
                </div>
              </div>

              <div className="scan-asset-outlet-status">
                <span className="scan-asset-status-dot" />

                <span>{asset.currentOutlet.status || "ACTIVE"}</span>
              </div>
            </div>
          ) : (
            <div className="scan-asset-warehouse">
              <div className="scan-asset-warehouse-icon">◫</div>

              <div>
                <strong>Warehouse</strong>

                <p>This asset is currently not assigned to an outlet.</p>
              </div>
            </div>
          )}
        </section>

        <section className="scan-asset-request-card">
          <div>
            <span className="scan-asset-request-kicker">Need an update?</span>

            <h2>Request Asset Verification</h2>

            <p>Submit this asset for a verification review.</p>
          </div>

          <Link
            to="/assets/verification-request"
            className="scan-asset-request-button"
          >
            Verification Request
          </Link>
        </section>

        {/* FOOTER */}

        <footer className="scan-asset-footer">
          <strong>Asset Management System</strong>

          <span>Information shown from the latest database record.</span>
        </footer>
      </main>
    </div>
  );
}

export default ScanAsset;
