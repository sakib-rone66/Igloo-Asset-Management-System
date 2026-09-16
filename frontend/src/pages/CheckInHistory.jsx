// Import React hooks
import { useEffect, useState } from "react";

// Import navigation tools
import { Link } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
// Import our Axios API instance
import api from "../services/api";

// Import page styling
import "./CheckInHistory.css";

function CheckInHistory() {
  // ========================================
  // STATE
  // ========================================

  // Store check-in history
  const [history, setHistory] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error message
  const [error, setError] = useState("");

  // Auto-dismiss error after 4 seconds
  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error]);

  // Date filter
  const [selectedDate, setSelectedDate] = useState("");

  const getLocalDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const filteredHistory = selectedDate
    ? history.filter((item) => getLocalDate(item.checkInTime) === selectedDate)
    : history;

  const sortedHistory = [...filteredHistory].sort((left, right) =>
    (left.user?.name || "").localeCompare(right.user?.name || "", undefined, {
      sensitivity: "base",
    }),
  );

  // ========================================
  // LOAD CHECK-IN HISTORY
  // ========================================

  const fetchCheckInHistory = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/check-ins/history", {
        params: filters,
      });

      setHistory(response.data.history || []);
    } catch (error) {
      console.error(
        "Get Check-In History Error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message || "Failed to load check-in history",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckInHistory();
  }, []);

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    fetchCheckInHistory({
      ...(selectedDate
        ? {
            date: selectedDate,
            timezoneOffset: new Date().getTimezoneOffset(),
          }
        : {}),
    });
  };

  const handleClearFilter = () => {
    setSelectedDate("");
    fetchCheckInHistory();
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <AppPageLayout>
        <div className="checkin-history-loading">
          Loading check-in history...
        </div>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout>
      <div className="checkin-history-page">
        {/* ========================================
          PAGE HEADER
          ======================================== */}

        <div className="checkin-history-header">
          <Link to="/check-ins" className="checkin-history-back-link">
            ← Back to Check-In
          </Link>

          <h2>Check-In History</h2>

          <p>View your previous check-in records and location information.</p>

          <form
            className="checkin-history-filter"
            onSubmit={handleFilterSubmit}
          >
            <div className="checkin-history-filter-field">
              <label htmlFor="checkin-history-date">Date</label>

              <input
                id="checkin-history-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>

            <div className="checkin-history-filter-actions">
              <button type="submit" className="checkin-history-filter-button">
                Filter
              </button>

              <button
                type="button"
                className="checkin-history-clear-button"
                onClick={handleClearFilter}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* ========================================
          GLOBAL NOTIFICATION
          ======================================== */}

        {error && (
          <div className="checkin-history-error" role="alert">
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
          HISTORY CONTENT
          ======================================== */}

        {!error && (
          <>
            {/* ========================================
              SUMMARY
              ======================================== */}

            <div className="checkin-history-summary">
              <span className="checkin-history-summary-label">
                Total Check-Ins
              </span>

              <span className="checkin-history-summary-count">
                {filteredHistory.length}
              </span>
            </div>

            {/* ========================================
              HISTORY TABLE CARD
              ======================================== */}

            <div className="checkin-history-card">
              <div className="checkin-history-table-wrapper">
                <table className="checkin-history-table">
                  <thead>
                    <tr>
                      {/* User information */}
                      <th>User Name</th>

                      {/* Check-in information */}
                      <th>Type</th>
                      <th>Location</th>

                      {/* GPS information */}
                      <th>Latitude</th>
                      <th>Longitude</th>

                      {/* Time information */}
                      <th>Date &amp; Time</th>

                      {/* Additional information */}
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="checkin-history-empty">
                          No check-in history found
                        </td>
                      </tr>
                    ) : (
                      sortedHistory.map((item) => (
                        <tr key={item._id}>
                          {/* ========================================
                            USER NAME
                            ======================================== */}

                          <td className="checkin-history-user-name">
                            {item.user?.name || "Unknown User"}
                          </td>

                          {/* ========================================
                            CHECK-IN TYPE
                            ======================================== */}

                          <td>
                            <span className="checkin-history-type">
                              {item.checkInType || "N/A"}
                            </span>
                          </td>

                          {/* ========================================
                            LOCATION
                            ======================================== */}

                          <td className="checkin-history-location">
                            {item.checkInType === "OUTLET"
                              ? item.outlet?.name || "Unknown Outlet"
                              : "Office"}
                          </td>

                          {/* ========================================
                            LATITUDE
                            ======================================== */}

                          <td className="checkin-history-gps">
                            {item.latitude ?? "N/A"}
                          </td>

                          {/* ========================================
                            LONGITUDE
                            ======================================== */}

                          <td className="checkin-history-gps">
                            {item.longitude ?? "N/A"}
                          </td>

                          {/* ========================================
                            DATE AND TIME
                            ======================================== */}

                          <td className="checkin-history-datetime">
                            {item.checkInTime
                              ? new Date(item.checkInTime).toLocaleString()
                              : "N/A"}
                          </td>

                          {/* ========================================
                            REMARKS
                            ======================================== */}

                          <td className="checkin-history-remarks">
                            {item.remarks || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppPageLayout>
  );
}

// Export component
export default CheckInHistory;
