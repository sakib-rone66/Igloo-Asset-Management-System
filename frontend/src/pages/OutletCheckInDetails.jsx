import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import api from "../services/api";
import "./OutletCheckInDetails.css";

function OutletCheckInDetails() {
  // ========================================
  // URL PARAMETER
  // ========================================

  const { outletId } = useParams();

  const navigate = useNavigate();

  // ========================================
  // OUTLET
  // ========================================

  const [outlet, setOutlet] = useState(null);

  // ========================================
  // ASSETS
  // ========================================

  const [assets, setAssets] = useState([]);

  const [selectedAssets, setSelectedAssets] = useState([]);

  // ========================================
  // UI
  // ========================================

  const [loading, setLoading] = useState(true);

  const [assetsLoading, setAssetsLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ========================================
  // LOAD OUTLET
  // ========================================

  useEffect(() => {
    const loadOutlet = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await api.get(`/outlets/${outletId}`);

        setOutlet(response.data.outlet);
      } catch (error) {
        console.error(
          "Get Outlet Details Error:",
          error.response?.data || error.message,
        );

        setError(
          error.response?.data?.message || "Failed to load outlet details",
        );
      } finally {
        setLoading(false);
      }
    };

    if (outletId) {
      loadOutlet();
    }
  }, [outletId]);

  // ========================================
  // LOAD DEPLOYED ASSETS
  // ========================================

  useEffect(() => {
    const loadOutletAssets = async () => {
      try {
        setAssetsLoading(true);

        const response = await api.get(`/outlets/${outletId}/assets`);

        setAssets(response.data.assets || []);
      } catch (error) {
        console.error(
          "Get Outlet Assets Error:",
          error.response?.data || error.message,
        );

        setError(
          error.response?.data?.message || "Failed to load outlet assets",
        );
      } finally {
        setAssetsLoading(false);
      }
    };

    if (outletId) {
      loadOutletAssets();
    }
  }, [outletId]);

  // ========================================
  // SELECT / UNSELECT ASSET
  // ========================================

  const handleAssetSelect = (assetId) => {
    setSelectedAssets((previous) => {
      if (previous.includes(assetId)) {
        return previous.filter((id) => id !== assetId);
      }

      return [...previous, assetId];
    });
  };

  // ========================================
  // SELECT ALL
  // ========================================

  const handleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
      return;
    }

    setSelectedAssets(assets.map((asset) => asset._id));
  };

  // ========================================
  // SUBMIT FOR VERIFICATION
  // ========================================

  const handleSubmitForVerification = async () => {
    if (selectedAssets.length === 0) {
      setError("Please select at least one asset.");

      return;
    }

    try {
      setSubmitting(true);

      setError("");

      setSuccess("");

      /*
       * Verification Mapping API will be connected
       * in the next backend step.
       *
       * For now we keep the selected asset IDs ready.
       */

      console.log("Outlet:", outletId);

      console.log("Selected Existing Assets:", selectedAssets);

      /*
       * NEXT STEP:
       *
       * POST /verification-mappings
       *
       * {
       *   outlet: outletId,
       *   assets: selectedAssets,
       *   type: "EXISTING"
       * }
       */

      setSuccess(
        "Assets selected successfully. Verification request API will be connected next.",
      );
    } catch (error) {
      console.error(
        "Submit Verification Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to submit verification request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="outlet-details-loading">Loading outlet details...</div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error && !outlet) {
    return (
      <div className="outlet-details-page">
        <div className="outlet-details-error">
          <strong>Error</strong>

          <p>{error}</p>
        </div>

        <Link to="/check-ins" className="outlet-details-back-link">
          ← Back to Check-In
        </Link>
      </div>
    );
  }

  // ========================================
  // NOT FOUND
  // ========================================

  if (!outlet) {
    return (
      <div className="outlet-details-page">
        <div className="outlet-details-card">
          <h2>Outlet Not Found</h2>

          <p>The requested outlet could not be found.</p>
        </div>

        <Link to="/check-ins" className="outlet-details-back-link">
          ← Back to Check-In
        </Link>
      </div>
    );
  }

  // ========================================
  // DISTRICT
  // ========================================

  const district = typeof outlet.district === "object" ? outlet.district : null;

  // ========================================
  // REGION
  // ========================================

  const region =
    district && typeof district.region === "object" ? district.region : null;

  // ========================================
  // DISTRIBUTOR
  // ========================================

  const distributor =
    typeof outlet.distributor === "object" ? outlet.distributor : null;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="outlet-details-page">
      {/* ========================================
          HEADER
          ======================================== */}

      <div className="outlet-details-header">
        <Link to="/check-ins" className="outlet-details-back-link">
          ← Back to Check-In
        </Link>

        <h2>Outlet Details</h2>

        <p>Review outlet information and verify deployed assets.</p>
      </div>

      {/* ========================================
          SUCCESS
          ======================================== */}

      {success && (
        <div className="outlet-details-success">
          <strong>Success!</strong>

          <p>{success}</p>
        </div>
      )}

      {/* ========================================
          ERROR
          ======================================== */}

      {error && (
        <div className="outlet-details-error">
          <strong>Error</strong>

          <p>{error}</p>
        </div>
      )}

      {/* ========================================
          OUTLET CARD
          ======================================== */}

      <section className="outlet-details-card">
        <div className="outlet-details-title-row">
          <div>
            <h3>{outlet.name}</h3>

            <span className="outlet-details-code">
              {outlet.code || "No Code"}
            </span>
          </div>

          <span
            className={`outlet-details-status ${
              outlet.status === "ACTIVE"
                ? "outlet-details-status-active"
                : "outlet-details-status-inactive"
            }`}
          >
            {outlet.status}
          </span>
        </div>

        {/* ========================================
            OUTLET DETAILS
            ======================================== */}

        <div className="outlet-details-grid">
          <div className="outlet-detail-item">
            <span>Outlet Code</span>
            <strong>{outlet.code || "N/A"}</strong>
          </div>

          <div className="outlet-detail-item">
            <span>Outlet Type</span>
            <strong>{outlet.type || "N/A"}</strong>
          </div>

          <div className="outlet-detail-item">
            <span>Address</span>
            <strong>{outlet.address || "N/A"}</strong>
          </div>

          <div className="outlet-detail-item">
            <span>Region</span>
            <strong>{region?.name || "N/A"}</strong>
          </div>

          <div className="outlet-detail-item">
            <span>District</span>
            <strong>{district?.name || "N/A"}</strong>
          </div>

          <div className="outlet-detail-item">
            <span>Distributor</span>
            <strong>{distributor?.name || "No Distributor"}</strong>
          </div>

          <div className="outlet-detail-item">
            <span>Contact Person</span>
            <strong>{outlet.contactPerson || "N/A"}</strong>
          </div>

          <div className="outlet-detail-item">
            <span>Phone</span>
            <strong>{outlet.phone || "N/A"}</strong>
          </div>
        </div>
      </section>

      {/* ========================================
          EXISTING ASSETS
          ======================================== */}

      <section className="outlet-details-card">
        <div className="outlet-assets-header">
          <div>
            <h3>Existing Deployed Assets</h3>

            <p>
              Assets already deployed at this outlet. Select the assets you want
              to submit for verification.
            </p>
          </div>

          {assets.length > 0 && (
            <button
              type="button"
              className="outlet-select-all-button"
              onClick={handleSelectAll}
            >
              {selectedAssets.length === assets.length
                ? "Unselect All"
                : "Select All"}
            </button>
          )}
        </div>

        {/* ========================================
            ASSET LOADING
            ======================================== */}

        {assetsLoading && (
          <div className="outlet-assets-loading">
            Loading deployed assets...
          </div>
        )}

        {/* ========================================
            NO ASSETS
            ======================================== */}

        {!assetsLoading && assets.length === 0 && (
          <div className="outlet-assets-empty">
            <strong>No deployed assets found</strong>

            <p>There are currently no assigned assets at this outlet.</p>
          </div>
        )}

        {/* ========================================
            ASSET TABLE
            ======================================== */}

        {!assetsLoading && assets.length > 0 && (
          <div className="outlet-assets-table-wrapper">
            <table className="outlet-assets-table">
              <thead>
                <tr>
                  <th>Select</th>

                  <th>AIN</th>

                  <th>Serial Number</th>

                  <th>Manufacturer</th>

                  <th>Capacity</th>

                  <th>Manufacturing</th>
                </tr>
              </thead>

              <tbody>
                {assets.map((asset) => (
                  <tr key={asset._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset._id)}
                        onChange={() => handleAssetSelect(asset._id)}
                      />
                    </td>

                    <td>
                      <strong>{asset.ain || "N/A"}</strong>
                    </td>

                    <td>{asset.serialNumber || "N/A"}</td>

                    <td>{asset.manufacturer?.name || "N/A"}</td>

                    <td>{asset.capacity ? `${asset.capacity} L` : "N/A"}</td>

                    <td>
                      {asset.manufacturingMonth || "N/A"}/
                      {asset.manufacturingYear || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================
            SUBMIT
            ======================================== */}

        {assets.length > 0 && (
          <div className="outlet-verification-footer">
            <span>
              {selectedAssets.length} asset
              {selectedAssets.length !== 1 ? "s" : ""} selected
            </span>

            <button
              type="button"
              className="outlet-submit-verification-button"
              disabled={submitting || selectedAssets.length === 0}
              onClick={handleSubmitForVerification}
            >
              {submitting ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default OutletCheckInDetails;
