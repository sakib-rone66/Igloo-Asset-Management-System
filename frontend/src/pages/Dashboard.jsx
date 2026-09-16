import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import api from "../services/api";
import { getStoredUser } from "../utils/storage";

import "./Dashboard.css";

function Dashboard() {
  const location = useLocation();

  // ========================================
  // SIDEBAR
  // ========================================

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  // ========================================
  // USER
  // ========================================

  const user = getStoredUser();

  // ========================================
  // LOGIN SUCCESS MESSAGE
  // ========================================

  const [message, setMessage] = useState(location.state?.message || "");

  useEffect(() => {
    if (!location.state?.message) {
      return;
    }

    setMessage(location.state.message);

    const timer = setTimeout(() => {
      setMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [location.state]);

  // ========================================
  // ASSET COUNTS
  // ========================================

  const [assetCounts, setAssetCounts] = useState({
    total: 0,
    inStock: 0,
    assigned: 0,
    disposed: 0,
  });

  const [loadingCounts, setLoadingCounts] = useState(true);

  const [countError, setCountError] = useState("");

  // ========================================
  // LOAD ASSET COUNTS
  // ========================================

  useEffect(() => {
    const loadAssetCounts = async () => {
      try {
        setLoadingCounts(true);
        setCountError("");

        const [
          totalResponse,
          inStockResponse,
          assignedResponse,
          disposedResponse,
        ] = await Promise.all([
          // TOTAL ASSETS
          api.get("/assets", {
            params: {
              page: 1,
              limit: 1,
            },
          }),

          // IN STOCK
          api.get("/assets", {
            params: {
              page: 1,
              limit: 1,
              status: "IN_STOCK",
            },
          }),

          // ASSIGNED
          api.get("/assets", {
            params: {
              page: 1,
              limit: 1,
              status: "ASSIGNED",
            },
          }),

          // DISPOSED
          api.get("/assets", {
            params: {
              page: 1,
              limit: 1,
              status: "DISPOSED",
            },
          }),
        ]);

        setAssetCounts({
          total: totalResponse.data.totalAssets || 0,

          inStock: inStockResponse.data.totalAssets || 0,

          assigned: assignedResponse.data.totalAssets || 0,

          disposed: disposedResponse.data.totalAssets || 0,
        });
      } catch (error) {
        console.error(
          "Load Dashboard Asset Counts Error:",
          error.response?.data || error.message,
        );

        setCountError(
          error.response?.data?.message || "Failed to load asset statistics",
        );
      } finally {
        setLoadingCounts(false);
      }
    };

    loadAssetCounts();
  }, []);

  // ========================================
  // PERCENTAGE
  // ========================================

  const getPercentage = (value) => {
    if (assetCounts.total === 0) {
      return 0;
    }

    return Math.round((value / assetCounts.total) * 100);
  };

  const inStockPercentage = getPercentage(assetCounts.inStock);

  const assignedPercentage = getPercentage(assetCounts.assigned);

  const disposedPercentage = getPercentage(assetCounts.disposed);

  // ========================================
  // STAT CARDS
  // ========================================

  const stats = [
    {
      title: "Total Assets",
      value: loadingCounts ? "..." : assetCounts.total,
      icon: "▣",
      colorClass: "dashboard-stat-green",
      link: "/assets",
    },

    {
      title: "In Stock",
      value: loadingCounts ? "..." : assetCounts.inStock,
      icon: "◉",
      colorClass: "dashboard-stat-blue",
      link: "/assets",
    },

    {
      title: "Assigned",
      value: loadingCounts ? "..." : assetCounts.assigned,
      icon: "↗",
      colorClass: "dashboard-stat-purple",
      link: "/assets",
    },

    {
      title: "Disposed",
      value: loadingCounts ? "..." : assetCounts.disposed,
      icon: "⌫",
      colorClass: "dashboard-stat-red",
      link: "/assets",
    },
  ];

  // ========================================
  // QUICK ACTIONS
  // ========================================

  const quickActions = [
    {
      title: "Add Asset",
      description: "Register a new asset",
      link: "/assets/add",
      icon: "+",
    },

    {
      title: "Assign Asset",
      description: "Assign asset to outlet",
      link: "/assets/assign",
      icon: "→",
    },

    {
      title: "Check-In",
      description: "Start your work session",
      link: "/check-ins",
      icon: "✓",
    },

    {
      title: "Asset Requests",
      description: "Create or view requests",
      link: "/asset-requests",
      icon: "□",
    },
  ];

  // ========================================
  // RECENT ACTIVITY
  // ========================================

  const activities = [
    {
      title: "Asset management system is ready",
      description: "Your dashboard is connected and ready for operations.",
      time: "Today",
      icon: "✓",
    },

    {
      title: "Asset tracking",
      description: "Manage assignment, transfer, return and disposal.",
      time: "Today",
      icon: "↗",
    },

    {
      title: "Outlet management",
      description: "Manage Regions, Districts, Distributors and Outlets.",
      time: "Today",
      icon: "⌖",
    },
  ];

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className={`dashboard-layout ${
        sidebarOpen ? "dashboard-sidebar-open" : "dashboard-sidebar-closed"
      }`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      {/* ========================================
          MAIN
          ======================================== */}

      <div className="dashboard-main">
        <Navbar />

        {/* ========================================
            SHOW SIDEBAR BUTTON
            ======================================== */}

        {!sidebarOpen && (
          <button
            type="button"
            className="dashboard-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
          >
            ☰
          </button>
        )}

        {/* ========================================
            CONTENT
            ======================================== */}

        <main className="dashboard-content">
          {/* ========================================
              SUCCESS TOAST
              ======================================== */}

          {message && (
            <div className="dashboard-toast">
              <div className="dashboard-toast-icon">✓</div>

              <div className="dashboard-toast-content">
                <strong>Login Successful</strong>

                <span>{message}</span>
              </div>
            </div>
          )}

          {/* ========================================
              WELCOME
              ======================================== */}

          <section className="dashboard-welcome">
            <div>
              <p className="dashboard-eyebrow">ASSET MANAGEMENT SYSTEM</p>

              <h2>
                Welcome back
                {user?.name ? `, ${user.name}` : ""}.
              </h2>

              <p className="dashboard-subtitle">
                Here's an overview of your asset operations and management
                activities.
              </p>
            </div>

            <div className="dashboard-date-card">
              <span>Today</span>

              <strong>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </strong>
            </div>
          </section>

          {/* ========================================
              COUNT ERROR
              ======================================== */}

          {countError && (
            <div className="dashboard-count-error">{countError}</div>
          )}

          {/* ========================================
              KPI CARDS
              ======================================== */}

          <section className="dashboard-stats">
            {stats.map((stat) => (
              <Link
                key={stat.title}
                to={stat.link}
                className="dashboard-stat-card"
              >
                <div className="dashboard-stat-top">
                  <div className={`dashboard-stat-icon ${stat.colorClass}`}>
                    {stat.icon}
                  </div>

                  <span className="dashboard-stat-arrow">→</span>
                </div>

                <div className="dashboard-stat-value">{stat.value}</div>

                <div className="dashboard-stat-title">{stat.title}</div>
              </Link>
            ))}
          </section>

          {/* ========================================
              EQUAL WIDTH CARDS
              ======================================== */}

          <div className="dashboard-equal-grid">
            {/* ========================================
                ASSET OVERVIEW
                ======================================== */}

            <section className="dashboard-card dashboard-equal-card">
              <div className="dashboard-card-header">
                <div>
                  <h3>Asset Overview</h3>

                  <p>Current asset distribution.</p>
                </div>

                <Link to="/assets" className="dashboard-card-link">
                  View all →
                </Link>
              </div>

              {/* OVERVIEW */}

              <div className="dashboard-overview">
                {/* IN STOCK */}

                <div className="dashboard-overview-item">
                  <div className="dashboard-overview-label">
                    <span className="dashboard-dot dashboard-dot-blue" />
                    In Stock
                  </div>

                  <strong>{loadingCounts ? "..." : assetCounts.inStock}</strong>

                  <small>
                    {loadingCounts ? "--" : `${inStockPercentage}%`}
                  </small>
                </div>

                {/* ASSIGNED */}

                <div className="dashboard-overview-item">
                  <div className="dashboard-overview-label">
                    <span className="dashboard-dot dashboard-dot-purple" />
                    Assigned
                  </div>

                  <strong>
                    {loadingCounts ? "..." : assetCounts.assigned}
                  </strong>

                  <small>
                    {loadingCounts ? "--" : `${assignedPercentage}%`}
                  </small>
                </div>

                {/* DISPOSED */}

                <div className="dashboard-overview-item">
                  <div className="dashboard-overview-label">
                    <span className="dashboard-dot dashboard-dot-red" />
                    Disposed
                  </div>

                  <strong>
                    {loadingCounts ? "..." : assetCounts.disposed}
                  </strong>

                  <small>
                    {loadingCounts ? "--" : `${disposedPercentage}%`}
                  </small>
                </div>

                {/* TOTAL */}

                <div className="dashboard-overview-item dashboard-overview-total">
                  <div className="dashboard-overview-label">
                    <span className="dashboard-dot dashboard-dot-green" />
                    Total
                  </div>

                  <strong>{loadingCounts ? "..." : assetCounts.total}</strong>

                  <small>100%</small>
                </div>
              </div>

              {/* DISTRIBUTION */}

              <div className="dashboard-progress">
                <div className="dashboard-progress-header">
                  <span>Asset distribution</span>

                  <span>
                    {loadingCounts
                      ? "Loading..."
                      : `${assetCounts.total} total`}
                  </span>
                </div>

                <div className="dashboard-distribution-bar">
                  <div
                    className="dashboard-distribution-stock"
                    style={{
                      width: `${inStockPercentage}%`,
                    }}
                  />

                  <div
                    className="dashboard-distribution-assigned"
                    style={{
                      width: `${assignedPercentage}%`,
                    }}
                  />

                  <div
                    className="dashboard-distribution-disposed"
                    style={{
                      width: `${disposedPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* ========================================
                QUICK ACTIONS
                ======================================== */}

            <section className="dashboard-card dashboard-equal-card">
              <div className="dashboard-card-header">
                <div>
                  <h3>Quick Actions</h3>

                  <p>Common operations.</p>
                </div>
              </div>

              <div className="dashboard-quick-actions">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="dashboard-action"
                  >
                    <div className="dashboard-action-icon">{action.icon}</div>

                    <div className="dashboard-action-content">
                      <strong>{action.title}</strong>

                      <span>{action.description}</span>
                    </div>

                    <span className="dashboard-action-arrow">→</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* ========================================
              LOWER GRID
              ======================================== */}

          <div className="dashboard-grid-bottom">
            {/* RECENT ACTIVITY */}

            <section className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h3>Recent Activity</h3>

                  <p>Latest system activity.</p>
                </div>
              </div>

              <div className="dashboard-activity-list">
                {activities.map((activity, index) => (
                  <div key={index} className="dashboard-activity">
                    <div className="dashboard-activity-icon">
                      {activity.icon}
                    </div>

                    <div className="dashboard-activity-content">
                      <strong>{activity.title}</strong>

                      <span>{activity.description}</span>
                    </div>

                    <time>{activity.time}</time>
                  </div>
                ))}
              </div>
            </section>

            {/* LOCATION MANAGEMENT */}

            <section className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h3>Location Management</h3>

                  <p>Your organizational hierarchy.</p>
                </div>
              </div>

              <div className="dashboard-location">
                <Link to="/regions" className="dashboard-location-item">
                  <div>
                    <strong>Regions</strong>

                    <span>Manage regions</span>
                  </div>

                  <span>→</span>
                </Link>

                <Link to="/districts" className="dashboard-location-item">
                  <div>
                    <strong>Districts</strong>

                    <span>Manage districts</span>
                  </div>

                  <span>→</span>
                </Link>

                <Link to="/distributors" className="dashboard-location-item">
                  <div>
                    <strong>Distributors</strong>

                    <span>Manage distributors</span>
                  </div>

                  <span>→</span>
                </Link>

                <Link to="/outlets" className="dashboard-location-item">
                  <div>
                    <strong>Outlets</strong>

                    <span>Manage outlets</span>
                  </div>

                  <span>→</span>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
