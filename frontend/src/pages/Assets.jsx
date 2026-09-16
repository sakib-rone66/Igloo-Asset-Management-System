import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./Assets.css";

function Assets() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // ASSETS
  // ========================================

  const [assets, setAssets] = useState([]);

  // ========================================
  // MANUFACTURERS
  // ========================================

  const [manufacturers, setManufacturers] = useState([]);

  // ========================================
  // FILTERS
  // ========================================

  const [status, setStatus] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [ainFilter, setAinFilter] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc");

  // ========================================
  // PAGINATION
  // ========================================

  const [page, setPage] = useState(1);

  const limit = 5;

  const [totalAssets, setTotalAssets] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  // ========================================
  // UI
  // ========================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Auto-dismiss error after 4 seconds
  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error]);

  // ========================================
  // FETCH MANUFACTURERS
  // ========================================

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await api.get("/manufacturers");

        setManufacturers(response.data.manufacturers || []);
      } catch (error) {
        console.error(
          "Get Manufacturers Error:",
          error.response?.data || error.message,
        );
      }
    };

    fetchManufacturers();
  }, []);

  // ========================================
  // FETCH ASSETS
  // ========================================

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit,
        };

        // Status filter
        if (status) {
          params.status = status;
        }

        // Manufacturer filter
        if (manufacturer) {
          params.manufacturer = manufacturer;
        }

        // AIN search
        if (ainFilter.trim()) {
          params.ain = ainFilter.trim();
        }

        if (sortBy === "dateAsc") {
          params.sortBy = "createdAt";
          params.sortOrder = "asc";
        } else if (sortBy === "dateDesc") {
          params.sortBy = "createdAt";
          params.sortOrder = "desc";
        }

        const response = await api.get("/assets", {
          params,
        });

        const fetchedAssets = response.data.assets || [];

        const sortedAssets = [...fetchedAssets].sort((left, right) => {
          if (sortBy === "manufacturerAsc") {
            return (left.manufacturer?.name || "").localeCompare(
              right.manufacturer?.name || "",
              undefined,
              { sensitivity: "base" },
            );
          }

          if (sortBy === "manufacturerDesc") {
            return (right.manufacturer?.name || "").localeCompare(
              left.manufacturer?.name || "",
              undefined,
              { sensitivity: "base" },
            );
          }

          if (sortBy === "ainAsc") {
            return (left.ain || "").localeCompare(right.ain || "", undefined, {
              sensitivity: "base",
            });
          }

          if (sortBy === "ainDesc") {
            return (right.ain || "").localeCompare(left.ain || "", undefined, {
              sensitivity: "base",
            });
          }

          return 0;
        });

        setAssets(sortedAssets);

        setTotalAssets(response.data.totalAssets || 0);

        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error(
          "Get Assets Error:",
          error.response?.data || error.message,
        );

        setError(error.response?.data?.message || "Failed to load assets");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [status, manufacturer, ainFilter, sortBy, page]);

  // ========================================
  // STATUS FILTER
  // ========================================

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  // ========================================
  // MANUFACTURER FILTER
  // ========================================

  const handleManufacturerChange = (event) => {
    setManufacturer(event.target.value);
    setPage(1);
  };

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const handleClearFilters = () => {
    setStatus("");
    setManufacturer("");
    setAinFilter("");
    setSortBy("dateDesc");
    setPage(1);
  };

  // ========================================
  // SORT CHANGE
  // ========================================

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  // ========================================
  // PAGINATION
  // ========================================

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // ========================================
  // VERIFICATION STATUS
  // ========================================

  const getVerificationStatus = (asset) => {
    return asset.verificationStatus || "NOT_VERIFIED";
  };

  // ========================================
  // STATUS CLASS
  // ========================================

  const getStatusClass = (statusValue) => {
    return `asset-status asset-status-${String(
      statusValue || "",
    ).toLowerCase()}`;
  };

  const getVerificationClass = (verificationStatus) => {
    return `asset-verification-status asset-verification-${String(
      verificationStatus || "",
    )
      .toLowerCase()
      .replace("_", "-")}`;
  };

  const getActivationClass = (isActivated) => {
    return `asset-activation-status ${
      isActivated
        ? "asset-activation-activated"
        : "asset-activation-not-activated"
    }`;
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`assets-layout ${
        sidebarOpen ? "assets-sidebar-open" : "assets-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="assets-main">
        <Navbar />

        {/* ========================================
            SHOW SIDEBAR BUTTON
            ======================================== */}

        {!sidebarOpen && (
          <button
            type="button"
            className="assets-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="assets-content">
          <Link to="/dashboard" className="assets-back-dashboard">
            ← Back to Dashboard
          </Link>

          {/* ========================================
              HEADER
              ======================================== */}

          <section className="assets-header">
            <div>
              <p className="assets-eyebrow">ASSET MANAGEMENT</p>

              <h2>All Assets</h2>

              <p className="assets-subtitle">
                View, filter and manage all registered assets in the system.
              </p>
            </div>

            <Link to="/assets/add" className="assets-add-button">
              <span>+</span>
              Add Asset
            </Link>
          </section>

          {/* ========================================
              QUICK ACTIONS
              ======================================== */}

          <section className="assets-action-bar">
            <Link to="/assets/assign" className="assets-action-link">
              Assign Asset
            </Link>

            <Link to="/assets/transfer" className="assets-action-link">
              Transfer
            </Link>

            <Link to="/assets/return" className="assets-action-link">
              Return
            </Link>

            <Link to="/assets/disposal" className="assets-action-link">
              Dispose
            </Link>

            <Link
              to="/assets/verification-request"
              className="assets-action-link"
            >
              Verification Request
            </Link>
          </section>

          {/* ========================================
              SUMMARY
              ======================================== */}

          <section className="assets-summary-card">
            <div className="assets-summary-icon">◈</div>

            <div>
              <span>Total Registered Assets</span>

              <strong>{loading ? "..." : totalAssets}</strong>
            </div>
          </section>

          {/* ========================================
              FILTER CARD
              ======================================== */}

          <section className="assets-filter-card">
            <div className="assets-filter-header">
              <div>
                <h3>Filters</h3>

                <p>Narrow down the asset list.</p>
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                className="assets-clear-button"
                disabled={!status && !manufacturer}
              >
                Clear Filters
              </button>
            </div>

            <div className="assets-filter-grid">
              {/* AIN SEARCH */}

              <div className="assets-filter-field">
                <label htmlFor="asset-ain-search">Search AIN</label>

                <input
                  id="asset-ain-search"
                  type="search"
                  value={ainFilter}
                  onChange={(event) => {
                    setAinFilter(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by AIN"
                  className="assets-filter-input"
                />
              </div>

              {/* STATUS */}

              <div className="assets-filter-field">
                <label htmlFor="asset-status">Asset Status</label>

                <select
                  id="asset-status"
                  value={status}
                  onChange={handleStatusChange}
                >
                  <option value="">All Statuses</option>

                  <option value="IN_STOCK">In Stock</option>

                  <option value="ASSIGNED">Assigned</option>

                  <option value="UNDER_REPAIR">Under Repair</option>

                  <option value="DISPOSED">Disposed</option>
                </select>
              </div>

              {/* MANUFACTURER */}

              <div className="assets-filter-field">
                <label htmlFor="asset-manufacturer">Manufacturer</label>

                <select
                  id="asset-manufacturer"
                  value={manufacturer}
                  onChange={handleManufacturerChange}
                >
                  <option value="">All Manufacturers</option>

                  {manufacturers.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SORT BY */}

              <div className="assets-filter-field">
                <label htmlFor="asset-sort">Sort By</label>

                <select
                  id="asset-sort"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="dateDesc">Date: Newest first</option>
                  <option value="dateAsc">Date: Oldest first</option>
                  <option value="manufacturerAsc">Manufacturer: A–Z</option>
                  <option value="manufacturerDesc">Manufacturer: Z–A</option>
                  <option value="ainAsc">AIN: A–Z</option>
                  <option value="ainDesc">AIN: Z–A</option>
                </select>
              </div>
            </div>
          </section>

          {/* ========================================
              ERROR
              ======================================== */}

          {error && (
            <div className="assets-error" role="alert">
              <div className="add-asset-message-icon">!</div>

              <div className="add-asset-message-content">
                <strong>Error</strong>
                <span>{error}</span>
              </div>

              <button
                type="button"
                className="app-notification-close"
                onClick={() => setError("")}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* ========================================
              ASSET TABLE CARD
              ======================================== */}

          <section className="assets-table-card">
            <div className="assets-table-header">
              <div>
                <h3>Asset Registry</h3>

                <p>
                  {loading
                    ? "Loading assets..."
                    : `${totalAssets} asset${
                        totalAssets !== 1 ? "s" : ""
                      } found`}
                </p>
              </div>

              <span className="assets-page-badge">
                Page {page} of {totalPages}
              </span>
            </div>

            {/* ========================================
                LOADING
                ======================================== */}

            {loading && (
              <div className="assets-loading">
                <div className="assets-spinner" />

                <span>Loading assets...</span>
              </div>
            )}

            {/* ========================================
                TABLE
                ======================================== */}

            {!loading && !error && (
              <div className="assets-table-wrapper">
                <table className="assets-table">
                  <thead>
                    <tr>
                      <th>AIN</th>

                      <th>Serial Number</th>

                      <th>Capacity</th>

                      <th>Manufacturer</th>

                      <th>Manufacturing</th>

                      <th>Outlet</th>

                      <th>Status</th>

                      <th>Verification</th>

                      <th>Activation</th>
                    </tr>
                  </thead>

                  <tbody>
                    {assets.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="assets-empty">
                          <div className="assets-empty-icon">◈</div>

                          <strong>No assets found</strong>

                          <span>Try changing your filters.</span>
                        </td>
                      </tr>
                    ) : (
                      assets.map((asset) => {
                        const verificationStatus = getVerificationStatus(asset);

                        return (
                          <tr key={asset._id}>
                            {/* AIN */}

                            <td>
                              <Link
                                to={`/assets/${asset._id}`}
                                className="asset-ain-link"
                              >
                                {asset.ain}
                              </Link>
                            </td>

                            {/* SERIAL */}

                            <td>
                              <span className="asset-serial">
                                {asset.serialNumber || "N/A"}
                              </span>
                            </td>

                            {/* CAPACITY */}

                            <td>{asset.capacity || "N/A"}</td>

                            {/* MANUFACTURER */}

                            <td>{asset.manufacturer?.name || "N/A"}</td>

                            {/* MANUFACTURING */}

                            <td>
                              <span className="asset-date">
                                {asset.manufacturingMonth || "N/A"}/
                                {asset.manufacturingYear || "N/A"}
                              </span>
                            </td>

                            {/* OUTLET */}

                            <td>
                              <span className="asset-outlet">
                                {asset.currentOutlet?.name || "Warehouse"}
                              </span>
                            </td>

                            {/* STATUS */}

                            <td>
                              <span className={getStatusClass(asset.status)}>
                                {asset.status?.replace("_", " ")}
                              </span>
                            </td>

                            {/* VERIFICATION */}

                            <td>
                              <span
                                className={getVerificationClass(
                                  verificationStatus,
                                )}
                              >
                                {verificationStatus.replace("_", " ")}
                              </span>
                            </td>

                            {/* ACTIVATION */}

                            <td>
                              <span
                                className={getActivationClass(
                                  asset.isActivated,
                                )}
                              >
                                {asset.isActivated
                                  ? "Activated"
                                  : "Not Activated"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================
                PAGINATION
                ======================================== */}

            {!loading && !error && assets.length > 0 && (
              <div className="assets-pagination">
                <div className="assets-pagination-info">
                  Showing page <strong>{page}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </div>

                <div className="assets-pagination-buttons">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="assets-pagination-button"
                  >
                    ← Previous
                  </button>

                  <span className="assets-current-page">{page}</span>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="assets-pagination-button"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Assets;
