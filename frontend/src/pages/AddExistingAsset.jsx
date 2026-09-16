import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./AddExistingAsset.css";

function AddExistingAsset() {
  const { outletId } = useParams();

  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // MANUFACTURERS
  // ========================================

  const [manufacturers, setManufacturers] = useState([]);

  // ========================================
  // OUTLETS
  // ========================================

  const [outlets, setOutlets] = useState([]);

  // ========================================
  // FORM
  // ========================================

  const [capacity, setCapacity] = useState("");

  const [manufacturingMonth, setManufacturingMonth] = useState("");

  const [manufacturingYear, setManufacturingYear] = useState("");

  const [manufacturer, setManufacturer] = useState("");

  const [currentOutlet, setCurrentOutlet] = useState("");

  const [outletSearch, setOutletSearch] = useState("");

  const [showOutletDropdown, setShowOutletDropdown] = useState(false);

  // ========================================
  // UI STATE
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
  // LOAD MANUFACTURERS + OUTLETS
  // ========================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        setError("");

        const [manufacturerResponse, outletResponse] = await Promise.all([
          api.get("/manufacturers"),
          api.get("/outlets"),
        ]);

        setManufacturers(manufacturerResponse.data.manufacturers || []);

        const loadedOutlets = outletResponse.data.outlets || [];

        setOutlets(loadedOutlets);

        const assignedOutlet = loadedOutlets.find(
          (outlet) => outlet._id === outletId,
        );

        if (assignedOutlet) {
          setCurrentOutlet(assignedOutlet._id);
          setOutletSearch(
            `${assignedOutlet.name}${
              assignedOutlet.code ? ` (${assignedOutlet.code})` : ""
            }`,
          );
        }
      } catch (error) {
        console.error(
          "Load Existing Asset Data Error:",
          error.response?.data || error.message,
        );

        setError(
          error.response?.data?.message ||
            "Failed to load manufacturers and outlets.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [outletId]);

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
  // SUBMIT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccess("");

    // ========================================
    // CAPACITY
    // ========================================

    if (!capacity || Number(capacity) < 1) {
      showError("Please enter a valid freezer capacity.");

      return;
    }

    // ========================================
    // MONTH
    // ========================================

    if (
      !manufacturingMonth ||
      Number(manufacturingMonth) < 1 ||
      Number(manufacturingMonth) > 12
    ) {
      showError("Please select a valid manufacturing month.");

      return;
    }

    // ========================================
    // YEAR
    // ========================================

    const currentYear = new Date().getFullYear();

    if (
      !manufacturingYear ||
      Number(manufacturingYear) < 2000 ||
      Number(manufacturingYear) > currentYear
    ) {
      showError(
        `Please enter a valid manufacturing year between 2000 and ${currentYear}.`,
      );

      return;
    }

    // ========================================
    // MANUFACTURER
    // ========================================

    if (!manufacturer) {
      showError("Please select a manufacturer.");

      return;
    }

    // ========================================
    // CURRENT OUTLET
    // ========================================

    if (!currentOutlet) {
      showError("Please select the current outlet.");

      return;
    }

    // ========================================
    // SUBMIT
    // ========================================

    try {
      setSubmitting(true);

      /*
       * EXISTING ASSET
       *
       * The freezer is already deployed.
       *
       * We do NOT send:
       * - AIN
       * - Serial Number
       * - QR Code
       * - Manufacturer Code
       *
       * We DO send:
       * - Manufacturer
       * - Capacity
       * - Manufacturing Month
       * - Manufacturing Year
       * - Current Outlet
       *
       * After approval:
       *
       * - AIN generated
       * - Serial Number generated
       * - QR generated
       * - Current Outlet retained
       * - Status = ASSIGNED
       */

      const response = await api.post("/authorizations/existing", {
        assetType: "EXISTING",

        capacity: Number(capacity),

        manufacturingMonth: Number(manufacturingMonth),

        manufacturingYear: Number(manufacturingYear),

        manufacturer,

        currentOutlet: outletId || currentOutlet,
      });

      showSuccess(
        response.data.message ||
          "Existing asset authorization request submitted successfully.",
      );

      // ========================================
      // CLEAR FORM
      // ========================================

      setCapacity("");

      setManufacturingMonth("");

      setManufacturingYear("");

      setManufacturer("");

      setCurrentOutlet("");

      setOutletSearch("");

      setShowOutletDropdown(false);
    } catch (error) {
      console.error(
        "Create Existing Asset Authorization Error:",
        error.response?.data || error.message,
      );

      showError(
        error.response?.data?.message ||
          "Failed to submit existing asset authorization request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOutlets = outlets
    .filter((item) => item.status !== "INACTIVE")
    .filter((item) => {
      const searchText = outletSearch.trim().toLowerCase();

      if (!searchText) return true;

      return (
        item.name?.toLowerCase().includes(searchText) ||
        item.code?.toLowerCase().includes(searchText)
      );
    });

  const handleSelectOutlet = (outlet) => {
    setCurrentOutlet(outlet._id);
    setOutletSearch(`${outlet.name}${outlet.code ? ` (${outlet.code})` : ""}`);
    setShowOutletDropdown(false);
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="existing-asset-page-loading">
        <div className="existing-asset-loading-spinner" />

        <span>Loading existing asset registration...</span>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className={`existing-asset-layout ${
        sidebarOpen
          ? "existing-asset-sidebar-open"
          : "existing-asset-sidebar-closed"
      }`}
    >
      {/* SIDEBAR */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* MAIN */}

      <div className="existing-asset-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="existing-asset-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="existing-asset-content">
          {/* HEADER */}

          <section className="existing-asset-header">
            <Link to="/outlets" className="existing-asset-back">
              ← Back to Outlets
            </Link>

            <p className="existing-asset-eyebrow">ASSET MANAGEMENT</p>

            <h2>Register Existing Asset</h2>

            <p className="existing-asset-subtitle">
              Register an already deployed freezer that does not currently have
              an AIN or Serial Number. The existing outlet assignment will be
              retained after approval.
            </p>
          </section>

          {/* SUCCESS */}

          {success && (
            <div
              ref={successRef}
              className="existing-asset-message existing-asset-success"
              role="status"
            >
              <div className="existing-asset-message-icon">✓</div>

              <div className="existing-asset-message-content">
                <strong>Request Submitted</strong>

                <span>{success}</span>
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              ref={errorRef}
              className="existing-asset-message existing-asset-error"
              role="alert"
            >
              <div className="existing-asset-message-icon">!</div>

              <div className="existing-asset-message-content">
                <strong>Error</strong>

                <span>{error}</span>
              </div>
            </div>
          )}

          {/* WORKFLOW */}

          <section className="existing-asset-workflow-card">
            <div className="existing-asset-workflow-icon">✓</div>

            <div className="existing-asset-workflow-content">
              <strong>How existing asset registration works</strong>

              <div className="existing-asset-workflow-steps">
                <div className="existing-asset-workflow-step">
                  <span>1</span>

                  <p>Submit deployed freezer</p>
                </div>

                <div className="existing-asset-workflow-line" />

                <div className="existing-asset-workflow-step">
                  <span>2</span>

                  <p>System Admin verifies</p>
                </div>

                <div className="existing-asset-workflow-line" />

                <div className="existing-asset-workflow-step">
                  <span>3</span>

                  <p>AIN + SN + QR generated</p>
                </div>

                <div className="existing-asset-workflow-line" />

                <div className="existing-asset-workflow-step">
                  <span>4</span>

                  <p>Asset registered as ASSIGNED</p>
                </div>
              </div>
            </div>
          </section>

          {/* INFORMATION */}

          <section className="existing-asset-info-card">
            <div className="existing-asset-info-icon">✓</div>

            <div className="existing-asset-info-content">
              <strong>Already Deployed Asset</strong>

              <p>
                This freezer is already physically deployed at an outlet. Select
                its current outlet below. The system will retain this assignment
                after authorization approval.
              </p>
            </div>
          </section>

          {/* FORM CARD */}

          <section className="existing-asset-card">
            <div className="existing-asset-card-header">
              <div>
                <h3>Freezer Information</h3>

                <p>Enter the physical freezer information below.</p>
              </div>

              <span className="existing-asset-required">* Required</span>
            </div>

            <form className="existing-asset-form" onSubmit={handleSubmit}>
              {/* MANUFACTURER */}

              <div className="existing-asset-field">
                <label htmlFor="manufacturer">
                  Manufacturer
                  <span>*</span>
                </label>

                <select
                  id="manufacturer"
                  value={manufacturer}
                  onChange={(event) => setManufacturer(event.target.value)}
                  disabled={submitting}
                  required
                >
                  <option value="">Select Manufacturer</option>

                  {manufacturers
                    .filter((item) => item.status !== "INACTIVE")
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* CAPACITY */}

              <div className="existing-asset-field">
                <label htmlFor="capacity">
                  Capacity
                  <span>*</span>
                </label>

                <div className="existing-asset-input-with-unit">
                  <input
                    id="capacity"
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(event) => setCapacity(event.target.value)}
                    placeholder="Enter capacity"
                    disabled={submitting}
                    required
                  />

                  <span>Liters</span>
                </div>
              </div>

              {/* MONTH */}

              <div className="existing-asset-field">
                <label htmlFor="manufacturingMonth">
                  Manufacturing Month
                  <span>*</span>
                </label>

                <select
                  id="manufacturingMonth"
                  value={manufacturingMonth}
                  onChange={(event) =>
                    setManufacturingMonth(event.target.value)
                  }
                  disabled={submitting}
                  required
                >
                  <option value="">Select Month</option>

                  {Array.from({ length: 12 }, (_, index) => index + 1).map(
                    (month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* YEAR */}

              <div className="existing-asset-field">
                <label htmlFor="manufacturingYear">
                  Manufacturing Year
                  <span>*</span>
                </label>

                <input
                  id="manufacturingYear"
                  type="number"
                  min="2000"
                  max={new Date().getFullYear()}
                  value={manufacturingYear}
                  onChange={(event) => setManufacturingYear(event.target.value)}
                  placeholder="Enter manufacturing year"
                  disabled={submitting}
                  required
                />
              </div>

              {/* CURRENT OUTLET */}

              <div className="existing-asset-field">
                <label htmlFor="currentOutlet">
                  Current Outlet
                  <span>*</span>
                </label>

                <div className="existing-asset-outlet-combobox">
                  <input
                    id="currentOutlet"
                    type="text"
                    value={outletSearch}
                    onChange={(event) => {
                      if (outletId) return;

                      setOutletSearch(event.target.value);
                      setCurrentOutlet("");
                      setShowOutletDropdown(true);
                    }}
                    onFocus={() => {
                      if (!outletId) setShowOutletDropdown(true);
                    }}
                    placeholder="Search outlet by name or code"
                    disabled={submitting || Boolean(outletId)}
                    autoComplete="off"
                    required={!currentOutlet}
                  />

                  {showOutletDropdown && !submitting && !outletId && (
                    <div className="existing-asset-outlet-dropdown">
                      {filteredOutlets.length === 0 ? (
                        <div className="existing-asset-outlet-empty">
                          No active outlets found.
                        </div>
                      ) : (
                        filteredOutlets.map((outlet) => (
                          <button
                            type="button"
                            key={outlet._id}
                            className="existing-asset-outlet-option"
                            onClick={() => handleSelectOutlet(outlet)}
                          >
                            <strong>{outlet.name}</strong>

                            {outlet.code && <span>{outlet.code}</span>}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {currentOutlet && (
                  <div className="existing-asset-assigned-outlet">
                    <div className="existing-asset-assigned-outlet-icon">⌖</div>

                    <div className="existing-asset-assigned-outlet-content">
                      <span>Currently Assigned Outlet</span>

                      <strong>
                        {outlets.find((item) => item._id === currentOutlet)
                          ?.name || outletSearch}
                      </strong>

                      <small>
                        Code:{" "}
                        {outlets.find((item) => item._id === currentOutlet)
                          ?.code || "N/A"}
                      </small>
                    </div>
                  </div>
                )}

                {/* Keep the field validation tied to the selected outlet ID. */}
                <input
                  type="hidden"
                  name="currentOutlet"
                  value={currentOutlet}
                  required
                />
                {/*
                <select
                  id="currentOutlet"
                  value={currentOutlet}
                  onChange={(event) => setCurrentOutlet(event.target.value)}
                  disabled={submitting}
                  required
                >
                  <option value="">Select Current Outlet</option>

                  {outlets
                    .filter((item) => item.status !== "INACTIVE")
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                        {item.code ? ` (${item.code})` : ""}
                      </option>
                    ))}
                </select>
                */}
              </div>

              {/* GENERATED INFORMATION */}

              <div className="existing-asset-generated-card">
                <div className="existing-asset-generated-header">
                  <div className="existing-asset-generated-icon">✦</div>

                  <div>
                    <strong>System Generated After Approval</strong>

                    <p>
                      The system will automatically create the AIN, Serial
                      Number and QR Code after approval. The selected outlet
                      will remain assigned to this asset.
                    </p>
                  </div>
                </div>

                <div className="existing-asset-generated-grid">
                  <div>
                    <span>AIN</span>

                    <strong>Pending approval</strong>
                  </div>

                  <div>
                    <span>Serial Number</span>

                    <strong>Pending approval</strong>
                  </div>

                  <div>
                    <span>QR Code</span>

                    <strong>Generated after approval</strong>
                  </div>

                  <div>
                    <span>Asset Status</span>

                    <strong>ASSIGNED</strong>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="existing-asset-actions">
                <Link to="/assets" className="existing-asset-cancel">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="existing-asset-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting Request..."
                    : "Submit for Authorization"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AddExistingAsset;
