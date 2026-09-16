import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./AssetQR.css";

function AssetQR() {
  // ========================================
  // URL
  // ========================================

  const { id } = useParams();

  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [qrCode, setQrCode] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [asset, setAsset] = useState(null);

  // ========================================
  // UI
  // ========================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // ========================================
  // FETCH QR
  // ========================================

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/assets/${id}/qr`);

        setQrCode(response.data.qrCode || "");
        setQrUrl(response.data.qrUrl || "");
        setAsset(response.data.asset || null);
      } catch (error) {
        console.error(
          "Get Asset QR Error:",
          error.response?.data || error.message,
        );

        setError(
          error.response?.data?.message || "Failed to generate asset QR code.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQRCode();
    } else {
      setError("Asset ID is missing.");
      setLoading(false);
    }
  }, [id]);

  // ========================================
  // DOWNLOAD
  // ========================================

  const handleDownload = () => {
    if (!qrCode || !asset) return;

    try {
      setDownloading(true);

      const link = document.createElement("a");

      link.href = qrCode;

      link.download = `QR-${asset.ain || "asset"}.png`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error("Download QR Error:", error);

      setError("Failed to download QR code.");

      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setDownloading(false);
    }
  };

  // ========================================
  // PRINT
  // ========================================

  const handlePrint = () => {
    if (!qrCode || !asset) return;

    const printWindow = window.open("", "_blank", "width=700,height=800");

    if (!printWindow) {
      setError("Please allow pop-ups to print the QR code.");

      setTimeout(() => {
        setError("");
      }, 3000);

      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset QR - ${asset.ain || "Asset"}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;

              font-family: Arial, sans-serif;

              text-align: center;

              color: #17211b;
              background: #ffffff;
            }

            .container {
              max-width: 500px;
              margin: 0 auto;
            }

            h1 {
              margin-bottom: 8px;
              font-size: 26px;
            }

            .ain {
              margin-bottom: 25px;

              color: #16864f;

              font-size: 18px;
              font-weight: bold;
            }

            img {
              width: 300px;
              height: 300px;
              object-fit: contain;
            }

            .serial {
              margin-top: 18px;

              color: #59645d;

              font-size: 15px;
            }

            .url {
              margin-top: 12px;

              color: #8b958f;

              font-size: 10px;

              word-break: break-all;
            }

            .footer {
              margin-top: 30px;

              color: #9ca49f;

              font-size: 12px;
            }
          </style>
        </head>

        <body>
          <div class="container">

            <h1>Asset QR Code</h1>

            <div class="ain">
              ${asset.ain || "N/A"}
            </div>

            <img
              src="${qrCode}"
              alt="Asset QR Code"
            />

            <div class="serial">
              Serial Number:
              ${asset.serialNumber || "N/A"}
            </div>

            <div class="url">
              ${qrUrl || ""}
            </div>

            <div class="footer">
              Asset Management System
            </div>

          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="asset-qr-loading-page">
        <div className="asset-qr-spinner" />

        <span>Generating QR code...</span>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error && !qrCode) {
    return (
      <div className="asset-qr-error-page">
        <div className="asset-qr-error-icon">!</div>

        <h2>Unable to Generate QR Code</h2>

        <p>{error}</p>

        <Link to={`/assets/${id}`} className="asset-qr-back-button">
          ← Back to Asset
        </Link>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className={`asset-qr-layout ${
        sidebarOpen ? "asset-qr-sidebar-open" : "asset-qr-sidebar-closed"
      }`}
    >
      {/* SIDEBAR */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* MAIN */}

      <div className="asset-qr-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="asset-qr-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="asset-qr-content">
          {/* HEADER */}

          <section className="asset-qr-header">
            <Link to={`/assets/${id}`} className="asset-qr-back">
              ← Back to Asset Details
            </Link>

            <p className="asset-qr-eyebrow">ASSET MANAGEMENT</p>

            <h2>Asset QR Code</h2>

            <p>
              This QR code identifies the asset. Scanning it opens the latest
              asset information from the system.
            </p>
          </section>

          {/* ERROR MESSAGE */}

          {error && (
            <div className="asset-qr-message">
              <span>!</span>

              <div>
                <strong>Error</strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          {/* QR GRID */}

          <section className="asset-qr-grid">
            {/* QR CARD */}

            <div className="asset-qr-card">
              <div className="asset-qr-card-header">
                <div>
                  <h3>QR Code</h3>

                  <p>Generated from this asset.</p>
                </div>

                <span className="asset-qr-generated-badge">Ready</span>
              </div>

              {/* QR */}

              <div className="asset-qr-image-container">
                {qrCode && (
                  <img
                    src={qrCode}
                    alt={`QR Code for ${asset?.ain || "asset"}`}
                    className="asset-qr-image"
                  />
                )}
              </div>

              {/* SCAN INFO */}

              <div className="asset-qr-scan-note">
                <span className="asset-qr-scan-icon">▦</span>

                <div>
                  <strong>Scan to view asset</strong>

                  <p>
                    The QR stores the asset link. Current outlet information is
                    retrieved live from the database.
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="asset-qr-actions">
                <button
                  type="button"
                  className="asset-qr-download-button"
                  onClick={handleDownload}
                  disabled={downloading || !qrCode}
                >
                  {downloading ? "Downloading..." : "↓ Download QR"}
                </button>

                <button
                  type="button"
                  className="asset-qr-print-button"
                  onClick={handlePrint}
                  disabled={!qrCode}
                >
                  ⎙ Print
                </button>
              </div>
            </div>

            {/* INFO CARD */}

            <div className="asset-qr-info-card">
              <div className="asset-qr-info-header">
                <div>
                  <h3>Asset Information</h3>

                  <p>Information encoded/referenced by this QR code.</p>
                </div>

                <span className="asset-qr-info-icon">◈</span>
              </div>

              {/* AIN */}

              <div className="asset-qr-info-item asset-qr-main-info">
                <span>Asset Identification Number</span>

                <strong>{asset?.ain || "N/A"}</strong>
              </div>

              {/* SERIAL */}

              <div className="asset-qr-info-item">
                <span>Serial Number</span>

                <strong>{asset?.serialNumber || "N/A"}</strong>
              </div>

              {/* ASSET ID */}

              <div className="asset-qr-info-item">
                <span>Asset ID</span>

                <strong className="asset-qr-id">{asset?._id || "N/A"}</strong>
              </div>

              {/* QR URL */}

              <div className="asset-qr-info-item">
                <span>Scan URL</span>

                <strong className="asset-qr-id">{qrUrl || "N/A"}</strong>
              </div>

              {/* STATUS */}

              <div className="asset-qr-status-box">
                <span className="asset-qr-status-dot" />

                <div>
                  <strong>QR Code Ready</strong>

                  <p>
                    The QR can now be printed and attached to the physical
                    asset.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}

          <div className="asset-qr-footer">
            <Link to={`/assets/${id}`} className="asset-qr-footer-link">
              ← Return to Asset Details
            </Link>

            <Link to="/assets" className="asset-qr-footer-link">
              View All Assets
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssetQR;
