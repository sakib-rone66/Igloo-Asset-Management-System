import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";

import "./AddAsset.css";

function AddAsset() {
  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // MANUFACTURERS
  // ========================================

  const [manufacturers, setManufacturers] = useState([]);

  // ========================================
  // FORM
  // ========================================

  const [capacity, setCapacity] = useState("");

  const [manufacturingMonth, setManufacturingMonth] = useState("");

  const [manufacturingYear, setManufacturingYear] = useState("");

  const [manufacturer, setManufacturer] = useState("");

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
  // LOAD MANUFACTURERS
  // ========================================

  useEffect(() => {
    const loadManufacturers = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await api.get("/manufacturers");

        setManufacturers(response.data.manufacturers || []);
      } catch (error) {
        console.error(
          "Load Manufacturers Error:",
          error.response?.data || error.message,
        );

        setError(
          error.response?.data?.message || "Failed to load manufacturers.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadManufacturers();
  }, []);

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
  // SUBMIT AUTHORIZATION REQUEST
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccess("");

    // ========================================
    // CAPACITY VALIDATION
    // ========================================

    if (!capacity || Number(capacity) < 1) {
      showError("Please enter a valid freezer capacity.");

      return;
    }

    // ========================================
    // MANUFACTURING MONTH VALIDATION
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
    // MANUFACTURING YEAR VALIDATION
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
    // MANUFACTURER VALIDATION
    // ========================================

    if (!manufacturer) {
      showError("Please select a manufacturer.");

      return;
    }

    // ========================================
    // SUBMIT
    // ========================================

    try {
      setSubmitting(true);

      // ========================================
      // CREATE AUTHORIZATION REQUEST
      //
      // IMPORTANT:
      //
      // We DO NOT send:
      // - AIN
      // - Serial Number
      // - Authorization ID
      //
      // Backend creates authorization as PENDING.
      // After approval, backend generates:
      // - Serial Number
      // - AIN
      // - Asset
      // ========================================

      const response = await api.post("/authorizations", {
        capacity: Number(capacity),

        manufacturingMonth: Number(manufacturingMonth),

        manufacturingYear: Number(manufacturingYear),

        manufacturer,
      });

      // ========================================
      // SUCCESS
      // ========================================

      showSuccess(
        response.data.message ||
          "Asset registration request submitted successfully.",
      );

      // ========================================
      // CLEAR FORM
      // ========================================

      setCapacity("");

      setManufacturingMonth("");

      setManufacturingYear("");

      setManufacturer("");
    } catch (error) {
      console.error(
        "Create Authorization Request Error:",
        error.response?.data || error.message,
      );

      showError(
        error.response?.data?.message ||
          "Failed to submit asset registration request.",
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
      <div className="add-asset-page-loading">
        <div className="add-asset-loading-spinner" />

        <span>Loading asset registration...</span>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div
      className={`add-asset-layout ${
        sidebarOpen ? "add-asset-sidebar-open" : "add-asset-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="add-asset-main">
        <Navbar />

        {/* ========================================
            SHOW SIDEBAR BUTTON
            ======================================== */}

        {!sidebarOpen && (
          <button
            type="button"
            className="add-asset-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        <main className="add-asset-content">
          {/* ========================================
              HEADER
              ======================================== */}

          <section className="add-asset-header">
            <Link to="/assets" className="add-asset-back">
              ← Back to Assets
            </Link>

            <p className="add-asset-eyebrow">ASSET MANAGEMENT</p>

            <h2>Register Asset</h2>

            <p className="add-asset-subtitle">
              Submit the freezer information for System Admin verification. AIN
              and Serial Number will be generated automatically after approval.
            </p>
          </section>

          {/* ========================================
              SUCCESS MESSAGE
              ======================================== */}

          {success && (
            <div
              ref={successRef}
              className="add-asset-message add-asset-success"
              role="status"
            >
              <div className="add-asset-message-icon">✓</div>

              <div className="add-asset-message-content">
                <strong>Request Submitted</strong>

                <span>{success}</span>
              </div>
            </div>
          )}

          {/* ========================================
              ERROR MESSAGE
              ======================================== */}

          {error && (
            <div
              ref={errorRef}
              className="add-asset-message add-asset-error"
              role="alert"
            >
              <div className="add-asset-message-icon">!</div>

              <div className="add-asset-message-content">
                <strong>Error</strong>

                <span>{error}</span>
              </div>
            </div>
          )}

          {/* ========================================
              WORKFLOW CARD
              ======================================== */}

          <section className="add-asset-workflow-card">
            <div className="add-asset-workflow-icon">✓</div>

            <div className="add-asset-workflow-content">
              <strong>How asset registration works</strong>

              <div className="add-asset-workflow-steps">
                {/* STEP 1 */}

                <div className="add-asset-workflow-step">
                  <span>1</span>

                  <p>Submit freezer information</p>
                </div>

                <div className="add-asset-workflow-line" />

                {/* STEP 2 */}

                <div className="add-asset-workflow-step">
                  <span>2</span>

                  <p>System Admin verifies request</p>
                </div>

                <div className="add-asset-workflow-line" />

                {/* STEP 3 */}

                <div className="add-asset-workflow-step">
                  <span>3</span>

                  <p>AIN + Serial Number generated</p>
                </div>

                <div className="add-asset-workflow-line" />

                {/* STEP 4 */}

                <div className="add-asset-workflow-step">
                  <span>4</span>

                  <p>Asset registered</p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================
              FORM CARD
              ======================================== */}

          <section className="add-asset-card">
            {/* CARD HEADER */}

            <div className="add-asset-card-header">
              <div>
                <h3>Freezer Information</h3>

                <p>Enter the physical freezer information below.</p>
              </div>

              <span className="add-asset-required">* Required</span>
            </div>

            {/* FORM */}

            <form className="add-asset-form" onSubmit={handleSubmit}>
              {/* ========================================
                  MANUFACTURER
                  ======================================== */}

              <div className="add-asset-field">
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

              {/* ========================================
                  CAPACITY
                  ======================================== */}

              <div className="add-asset-field">
                <label htmlFor="capacity">
                  Capacity
                  <span>*</span>
                </label>

                <div className="add-asset-input-with-unit">
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

              {/* ========================================
                  MANUFACTURING MONTH
                  ======================================== */}

              <div className="add-asset-field">
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

                  {Array.from(
                    {
                      length: 12,
                    },
                    (_, index) => index + 1,
                  ).map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* ========================================
                  MANUFACTURING YEAR
                  ======================================== */}

              <div className="add-asset-field">
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

              {/* ========================================
                  SYSTEM GENERATED INFORMATION
                  ======================================== */}

              <div className="add-asset-generated-card">
                <div className="add-asset-generated-header">
                  <div className="add-asset-generated-icon">✦</div>

                  <div>
                    <strong>System Generated After Approval</strong>

                    <p>
                      AIN and Serial Number are created automatically when the
                      System Admin approves this request.
                    </p>
                  </div>
                </div>

                <div className="add-asset-generated-grid">
                  {/* AIN */}

                  <div>
                    <span>AIN</span>

                    <strong>Pending approval</strong>
                  </div>

                  {/* SERIAL NUMBER */}

                  <div>
                    <span>Serial Number</span>

                    <strong>Pending approval</strong>
                  </div>

                  {/* STATUS */}

                  <div>
                    <span>Initial Status</span>

                    <strong>IN STOCK</strong>
                  </div>
                </div>
              </div>

              {/* ========================================
                  ACTIONS
                  ======================================== */}

              <div className="add-asset-actions">
                <Link to="/assets" className="add-asset-cancel">
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="add-asset-submit"
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

export default AddAsset;
