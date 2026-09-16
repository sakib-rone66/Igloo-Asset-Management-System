import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
import api from "../services/api";
import "./CheckIn.css";

function CheckIn() {
  const latestCheckInRef = useRef(null);
  // ========================================
  // CHECK-IN DATA
  // ========================================

  const [checkIn, setCheckIn] = useState(null);
  const [outlets, setOutlets] = useState([]);

  const [checkInType, setCheckInType] = useState("OFFICE");

  const [outletId, setOutletId] = useState("");
  const [outletSearch, setOutletSearch] = useState("");
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);

  // ========================================
  // LOADING STATES
  // ========================================

  const [loading, setLoading] = useState(true);
  const [loadingOutlets, setLoadingOutlets] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  // ========================================
  // MESSAGES
  // ========================================

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ========================================
  // SUCCESS MESSAGE
  // ========================================

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // ========================================
  // ERROR MESSAGE
  // ========================================

  const showError = (message) => {
    setError(message);

    setTimeout(() => {
      setError("");
    }, 3000);
  };

  // ========================================
  // LOAD LATEST CHECK-IN
  // ========================================

  useEffect(() => {
    const loadLatestCheckIn = async () => {
      try {
        setError("");

        const response = await api.get("/check-ins/latest");

        setCheckIn(response.data.checkIn);
      } catch (error) {
        console.error(
          "Get Latest Check-In Error:",
          error.response?.data || error.message,
        );

        if (error.response?.status !== 404) {
          showError(
            error.response?.data?.message ||
              "Failed to load check-in information",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadLatestCheckIn();
  }, []);

  // ========================================
  // LOAD ACTIVE OUTLETS
  // ========================================

  useEffect(() => {
    const loadOutlets = async () => {
      try {
        setError("");

        const response = await api.get("/outlets?status=ACTIVE");

        setOutlets(response.data.outlets || []);
      } catch (error) {
        console.error(
          "Get Outlets Error:",
          error.response?.data || error.message,
        );

        showError(error.response?.data?.message || "Failed to load outlets");
      } finally {
        setLoadingOutlets(false);
      }
    };

    loadOutlets();
  }, []);

  // ========================================
  // CHECK-IN TYPE CHANGE
  // ========================================

  const handleCheckInTypeChange = (e) => {
    const selectedType = e.target.value;

    setCheckInType(selectedType);
    setError("");

    if (selectedType === "OFFICE") {
      setOutletId("");
      setOutletSearch("");
      setShowOutletDropdown(false);
    }
  };

  // ========================================
  // OUTLET CHANGE
  // ========================================

  const handleOutletSelect = (outlet) => {
    setOutletId(outlet._id);
    setOutletSearch(`${outlet.name}${outlet.code ? ` (${outlet.code})` : ""}`);
    setShowOutletDropdown(false);
    setError("");
  };

  const filteredOutlets = outlets.filter((outlet) => {
    const searchText = outletSearch.trim().toLowerCase();

    if (!searchText) return true;

    return (
      outlet.name?.toLowerCase().includes(searchText) ||
      outlet.code?.toLowerCase().includes(searchText)
    );
  });

  // ========================================
  // GET CURRENT LOCATION
  // ========================================

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Location service is not supported by this browser"));

        return;
      }

      const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(
        window.location.hostname,
      );

      if (!window.isSecureContext && !isLocalhost) {
        reject(
          new Error(
            "Location requires a secure connection. Open the https:// LAN address from this computer on your Android device, then allow location access.",
          ),
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,

            longitude: position.coords.longitude,
          });
        },

        (locationError) => {
          console.error("Location Error:", locationError.message);

          const locationMessage = {
            1: "Location permission was denied. Allow location access for this site in Android browser settings, then try again.",
            2: "Your device could not determine the location. Turn on Android Location/GPS and try again.",
            3: "Location request timed out. Turn on GPS and try again.",
          }[locationError.code];

          reject(new Error(locationMessage || "Unable to get your location."));
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    });
  };

  // ========================================
  // HANDLE CHECK-IN
  // ========================================

  const handleCheckIn = async () => {
    setError("");
    setSuccess("");

    // Outlet requires outlet selection
    if (checkInType === "OUTLET" && !outletId) {
      showError("Please select an outlet");

      return;
    }

    try {
      setCheckingIn(true);

      // Automatically capture location
      const location = await getCurrentLocation();

      // Prepare request
      const checkInData = {
        checkInType,

        latitude: location.latitude,

        longitude: location.longitude,
      };

      // Add outlet only for outlet check-in
      if (checkInType === "OUTLET") {
        checkInData.outletId = outletId;
      }

      // Save check-in
      const response = await api.post("/check-ins", checkInData);

      // Store latest check-in
      setCheckIn(response.data.checkIn);

      requestAnimationFrame(() => {
        latestCheckInRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });

      // Show success
      showSuccess(response.data.message || "Check-in completed successfully");

      // Clear outlet selection
      if (checkInType === "OUTLET") {
        setOutletId("");
        setOutletSearch("");
        setShowOutletDropdown(false);
      }
    } catch (error) {
      console.error("Check-In Error:", error.response?.data || error.message);

      showError(
        error.response?.data?.message ||
          error.message ||
          "Failed to complete check-in",
      );
    } finally {
      setCheckingIn(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <AppPageLayout>
        <div className="checkin-loading">Loading check-in...</div>
      </AppPageLayout>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <AppPageLayout>
      <div className="checkin-page">
        {/* ========================================
          HEADER
          ======================================== */}

        <div className="checkin-header">
          <Link to="/dashboard" className="checkin-back-link">
            ← Back to Dashboard
          </Link>

          <h2>Check-In</h2>

          <p>Select your location and complete your check-in.</p>
        </div>

        {/* ========================================
          SUCCESS POPUP
          ======================================== */}

        {success && (
          <div className="checkin-toast checkin-toast-success" role="status">
            <div className="add-asset-message-icon">✓</div>
            <div className="add-asset-message-content">
              <strong>Success</strong>
              <span>{success}</span>
            </div>
            <button
              type="button"
              className="app-notification-close"
              onClick={() => setSuccess("")}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {/* ========================================
          ERROR POPUP
          ======================================== */}

        {error && (
          <div className="checkin-toast checkin-toast-error" role="alert">
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
          CHECK-IN CARD
          ======================================== */}

        <section className="checkin-card">
          <div className="checkin-card-header">
            <h3>Today's Check-In</h3>

            <span className="checkin-status-badge">Ready</span>
          </div>

          <div className="checkin-form">
            {/* CHECK-IN TYPE */}

            <div className="checkin-field">
              <label>Check-In Type</label>

              <select
                value={checkInType}
                onChange={handleCheckInTypeChange}
                disabled={checkingIn}
              >
                <option value="OFFICE">Office</option>

                <option value="OUTLET">Outlet</option>
              </select>
            </div>

            {/* OUTLET */}

            {checkInType === "OUTLET" && (
              <div className="checkin-field">
                <label>Select Outlet</label>

                <div className="checkin-outlet-combobox">
                  <input
                    type="text"
                    value={outletSearch}
                    onChange={(event) => {
                      setOutletSearch(event.target.value);
                      setOutletId("");
                      setShowOutletDropdown(true);
                      setError("");
                    }}
                    onFocus={() => setShowOutletDropdown(true)}
                    placeholder={
                      loadingOutlets
                        ? "Loading outlets..."
                        : "Search outlet by name or code"
                    }
                    disabled={checkingIn || loadingOutlets}
                    autoComplete="off"
                  />

                  {showOutletDropdown && !checkingIn && !loadingOutlets && (
                    <div className="checkin-outlet-dropdown">
                      {filteredOutlets.length === 0 ? (
                        <div className="checkin-outlet-empty">
                          No active outlets found.
                        </div>
                      ) : (
                        filteredOutlets.map((outlet) => (
                          <button
                            type="button"
                            key={outlet._id}
                            className="checkin-outlet-option"
                            onClick={() => handleOutletSelect(outlet)}
                          >
                            <strong>{outlet.name}</strong>

                            {outlet.code && <span>{outlet.code}</span>}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AUTOMATIC INFO */}

            <div className="checkin-info">
              <span className="checkin-info-icon">✓</span>

              <span>
                Your current location and check-in time will be saved
                automatically.
              </span>
            </div>

            {/* BUTTON */}

            <button
              type="button"
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="checkin-submit-button"
            >
              {checkingIn ? "Checking In..." : "Check In"}
            </button>
          </div>
        </section>

        {/* ========================================
          LATEST CHECK-IN
          ======================================== */}

        {checkIn && (
          <section
            ref={latestCheckInRef}
            className="checkin-card checkin-latest-card"
          >
            <h3>Latest Check-In</h3>

            <div className="checkin-details-grid">
              <div>
                <span>Type</span>

                <strong>{checkIn.checkInType || "N/A"}</strong>
              </div>

              <div>
                <span>Location</span>

                <strong>
                  {checkIn.checkInType === "OUTLET"
                    ? checkIn.outlet?.name || "Unknown Outlet"
                    : "Office"}
                </strong>
              </div>

              <div>
                <span>Latitude</span>

                <strong>{checkIn.latitude ?? "N/A"}</strong>
              </div>

              <div>
                <span>Longitude</span>

                <strong>{checkIn.longitude ?? "N/A"}</strong>
              </div>

              <div>
                <span>Checked In At</span>

                <strong>
                  {checkIn.checkInTime
                    ? new Date(checkIn.checkInTime).toLocaleString()
                    : "N/A"}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* ========================================
          HISTORY
          ======================================== */}

        <section className="checkin-card">
          <h3>Check-In History</h3>

          <p className="checkin-description">
            View your previous office and outlet check-ins.
          </p>

          <Link to="/check-ins/history" className="checkin-secondary-link">
            View Check-In History →
          </Link>
        </section>

        {/* ========================================
          OUTLET INFORMATION
          ======================================== */}

        {checkIn?.checkInType === "OUTLET" && checkIn?.outlet?._id && (
          <section className="checkin-card">
            <h3>Outlet Information</h3>

            <div className="checkin-details-grid">
              <div>
                <span>Outlet</span>

                <strong>{checkIn.outlet.name || "N/A"}</strong>
              </div>

              <div>
                <span>Code</span>

                <strong>{checkIn.outlet.code || "N/A"}</strong>
              </div>

              <div>
                <span>District</span>

                <strong>
                  {typeof checkIn.outlet.district === "object"
                    ? checkIn.outlet.district?.name || "N/A"
                    : "N/A"}
                </strong>
              </div>
            </div>

            <Link
              to={`/check-ins/outlet/${checkIn.outlet._id}`}
              className="checkin-primary-link"
            >
              View Outlet Details →
            </Link>
          </section>
        )}

        {/* ========================================
          NEXT STEP
          ======================================== */}

        <section className="checkin-next-step">
          <span>Next Step</span>

          <p>Continue to outlet and asset verification after check-in.</p>
        </section>
      </div>
    </AppPageLayout>
  );
}

export default CheckIn;
