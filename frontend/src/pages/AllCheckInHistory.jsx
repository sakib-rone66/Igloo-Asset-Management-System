import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./AllCheckInHistory.css";

function AllCheckInHistory() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // DATA
  // ========================================

  const [history, setHistory] = useState([]);

  const [emailFilter, setEmailFilter] = useState("");
  const [checkInTypeFilter, setCheckInTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // ========================================
  // UI STATE
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
  // LOAD ALL CHECK-IN HISTORY
  // ========================================

  useEffect(() => {
    const fetchAllCheckInHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/check-ins/all");

        setHistory(response.data.history || []);
      } catch (error) {
        console.error(
          "Get All Check-In History Error:",
          error.response?.data || error.message,
        );

        setError(
          error.response?.data?.message ||
            "Failed to load all check-in history",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllCheckInHistory();
  }, []);

  const filteredHistory = history
    .filter((item) => {
      const email = item.user?.email?.toLowerCase() || "";
      const name = item.user?.name?.toLowerCase() || "";
      const searchValue = emailFilter.trim().toLowerCase();
      const matchesEmailOrName =
        email.includes(searchValue) || name.includes(searchValue);
      const matchesType =
        !checkInTypeFilter || item.checkInType === checkInTypeFilter;
      const checkInDate = item.checkInTime
        ? new Date(item.checkInTime).toLocaleDateString("en-CA")
        : "";
      const matchesDate = !dateFilter || checkInDate === dateFilter;

      return matchesEmailOrName && matchesType && matchesDate;
    })
    .sort((left, right) => {
      const leftTime = left.checkInTime
        ? new Date(left.checkInTime).getTime()
        : 0;
      const rightTime = right.checkInTime
        ? new Date(right.checkInTime).getTime()
        : 0;

      return rightTime - leftTime;
    });

  const clearFilters = () => {
    setEmailFilter("");
    setCheckInTypeFilter("");
    setDateFilter("");
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`all-history-layout ${
        sidebarOpen ? "all-history-sidebar-open" : "all-history-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="all-history-main">
        <Navbar />

        {/* OPEN SIDEBAR BUTTON */}

        {!sidebarOpen && (
          <button
            type="button"
            className="all-history-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}

        <main className="all-history-content">
          {/* ========================================
              BACK TO DASHBOARD
              ======================================== */}

          <Link to="/dashboard" className="all-history-back-dashboard">
            ← Back to Dashboard
          </Link>

          {/* ========================================
              PAGE HEADER
              ======================================== */}

          <section className="all-history-header">
            <p className="all-history-eyebrow">USER MANAGEMENT</p>

            <h2>All Users Check-In History</h2>

            <p>View and monitor check-in records of all system users.</p>
          </section>

          {/* ========================================
              ERROR
              ======================================== */}

          {error && (
            <div className="all-history-message all-history-error" role="alert">
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
              SUMMARY
              ======================================== */}

          {!error && !loading && (
            <section className="all-history-summary">
              <div className="all-history-summary-icon">✓</div>

              <div>
                <span>Total Check-Ins</span>

                <strong>{filteredHistory.length}</strong>
              </div>
            </section>
          )}

          {/* ========================================
              TABLE CARD
              ======================================== */}

          {!error && (
            <section className="all-history-card">
              {/* CARD HEADER */}

              <div className="all-history-card-header">
                <div>
                  <h3>Check-In Records</h3>

                  <p>Complete check-in history for all users.</p>
                </div>

                {!loading && (
                  <span className="all-history-count">
                    {filteredHistory.length} Records
                  </span>
                )}
              </div>

              <div className="all-history-filters">
                <div className="all-history-filter-field">
                  <label htmlFor="checkin-email-filter">Email or Name</label>
                  <input
                    id="checkin-email-filter"
                    type="search"
                    value={emailFilter}
                    onChange={(event) => setEmailFilter(event.target.value)}
                    placeholder="Filter by email or name"
                  />
                </div>

                <div className="all-history-filter-field">
                  <label htmlFor="checkin-type-filter">Check-In Type</label>
                  <select
                    id="checkin-type-filter"
                    value={checkInTypeFilter}
                    onChange={(event) =>
                      setCheckInTypeFilter(event.target.value)
                    }
                  >
                    <option value="">All Types</option>
                    <option value="OFFICE">Office</option>
                    <option value="OUTLET">Outlet</option>
                  </select>
                </div>

                <div className="all-history-filter-field">
                  <label htmlFor="checkin-date-filter">Check-In Date</label>
                  <input
                    id="checkin-date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                  />
                </div>

                <div className="all-history-filter-actions">
                  <button
                    type="button"
                    className="all-history-clear-filters"
                    onClick={clearFilters}
                    disabled={!emailFilter && !checkInTypeFilter && !dateFilter}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* ========================================
                  LOADING
                  ======================================== */}

              {loading ? (
                <div className="all-history-loading">
                  <div className="all-history-spinner"></div>

                  <p>Loading all users' check-in history...</p>
                </div>
              ) : (
                /* ========================================
                   TABLE WRAPPER
                   ======================================== */

                <div className="all-history-table-wrapper">
                  <table className="all-history-table">
                    <thead>
                      <tr>
                        <th className="history-user-id">User ID</th>

                        <th className="history-user-name">User Name</th>

                        <th className="history-email">Email</th>

                        <th className="history-type">Type</th>

                        <th className="history-location">Location</th>

                        <th className="history-latitude">Latitude</th>

                        <th className="history-longitude">Longitude</th>

                        <th className="history-datetime">Date & Time</th>

                        <th className="history-remarks">Remarks</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="all-history-empty">
                            No check-in records match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((item) => (
                          <tr key={item._id}>
                            {/* USER ID */}

                            <td className="history-user-id history-long-text">
                              {item.user?._id || "N/A"}
                            </td>

                            {/* USER NAME */}

                            <td className="history-user-name">
                              {item.user?.name || "Unknown User"}
                            </td>

                            {/* EMAIL */}

                            <td className="history-email history-long-text">
                              {item.user?.email || "N/A"}
                            </td>

                            {/* TYPE */}

                            <td className="history-type">
                              <span
                                className={`history-type-badge ${
                                  item.checkInType === "OUTLET"
                                    ? "history-type-outlet"
                                    : "history-type-office"
                                }`}
                              >
                                {item.checkInType || "N/A"}
                              </span>
                            </td>

                            {/* LOCATION */}

                            <td className="history-location">
                              {item.checkInType === "OUTLET"
                                ? item.outlet?.name || "Unknown Outlet"
                                : "Office"}
                            </td>

                            {/* LATITUDE */}

                            <td className="history-coordinate">
                              {item.latitude ?? "N/A"}
                            </td>

                            {/* LONGITUDE */}

                            <td className="history-coordinate">
                              {item.longitude ?? "N/A"}
                            </td>

                            {/* DATE & TIME */}

                            <td className="history-datetime">
                              {item.checkInTime
                                ? new Date(item.checkInTime).toLocaleString()
                                : "N/A"}
                            </td>

                            {/* REMARKS */}

                            <td className="history-remarks">
                              {item.remarks || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AllCheckInHistory;
