import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import "./Sidebar.css";

import api from "../services/api";
import { hasPermission } from "../utils/permission";
import { getStoredUser } from "../utils/storage";

// ========================================
// SIDEBAR
// ========================================

function Sidebar({ onClose }) {
  const sidebarRef = useRef(null);
  const location = useLocation();

  // ========================================
  // PENDING REQUEST COUNTS
  // ========================================

  const [pendingCounts, setPendingCounts] = useState({
    authorizations: 0,
    verifications: 0,
    repairs: 0,
    assetRequests: 0,
  });

  // ========================================
  // GET LOGGED-IN USER
  // ========================================

  const user = getStoredUser();

  // ========================================
  // LOAD INCOMING REQUEST COUNTS
  // ========================================

  useEffect(() => {
    let isMounted = true;

    const loadPendingCounts = async () => {
      const requests = [];

      // ========================================
      // ASSET AUTHORIZATION COUNT
      // ========================================

      if (hasPermission(user, "assetAuthorization", "view")) {
        requests.push(
          api
            .get("/authorizations")
            .then(
              (response) =>
                response.data.authorizations?.filter(
                  (request) => request.status === "PENDING",
                ).length || 0,
            )
            .catch(() => 0),
        );
      } else {
        requests.push(Promise.resolve(0));
      }

      // ========================================
      // VERIFICATION COUNT
      // ========================================

      if (hasPermission(user, "verificationMapping", "view")) {
        requests.push(
          api
            .get("/verification-mappings/pending")
            .then((response) => response.data.mappings?.length || 0)
            .catch(() => 0),
        );
      } else {
        requests.push(Promise.resolve(0));
      }

      // ========================================
      // REPAIR REQUEST COUNT
      // ========================================

      if (hasPermission(user, "repairs", "view")) {
        requests.push(
          api
            .get("/repairs/pending")
            .then(
              (response) =>
                response.data.repairs?.filter(
                  (repair) => repair.status === "PENDING",
                ).length ||
                response.data.count ||
                0,
            )
            .catch(() => 0),
        );
      } else {
        requests.push(Promise.resolve(0));
      }

      // ========================================
      // ASSET REQUEST COUNT
      // ========================================

      if (hasPermission(user, "assetRequests", "view")) {
        requests.push(
          api
            .get("/asset-requests/pending")
            .then(
              (response) =>
                response.data.assetRequests?.filter(
                  (request) => request.status === "PENDING",
                ).length ||
                response.data.count ||
                0,
            )
            .catch(() => 0),
        );
      } else {
        requests.push(Promise.resolve(0));
      }

      // ========================================
      // WAIT FOR ALL COUNTS
      // ========================================

      const [authorizations, verifications, repairs, assetRequests] =
        await Promise.all(requests);

      if (isMounted) {
        setPendingCounts({
          authorizations,
          verifications,
          repairs,
          assetRequests,
        });
      }
    };

    loadPendingCounts();

    const refreshInterval = window.setInterval(loadPendingCounts, 15000);

    // ========================================
    // LISTEN FOR REQUEST UPDATES
    // ========================================

    window.addEventListener("incoming-requests-updated", loadPendingCounts);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);

      window.removeEventListener(
        "incoming-requests-updated",
        loadPendingCounts,
      );
    };
  }, [location.pathname]);

  // ========================================
  // RESTORE SIDEBAR SCROLL POSITION
  // ========================================

  useEffect(() => {
    const savedScrollTop = Number(sessionStorage.getItem("sidebarScrollTop"));

    if (!Number.isFinite(savedScrollTop)) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      sidebarRef.current?.scrollTo(0, savedScrollTop);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // On mobile, tapping outside the sidebar dismisses it like the close button.
  useEffect(() => {
    const closeOnOutsideTap = (event) => {
      const isMobile = window.matchMedia("(max-width: 900px)").matches;

      if (
        isMobile &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideTap);

    return () => document.removeEventListener("pointerdown", closeOnOutsideTap);
  }, [onClose]);

  // ========================================
  // NAVIGATION LINK CLASS
  // ========================================

  const navigationLinkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "sidebar-link-active" : ""}`;

  // ========================================
  // ACCESS RIGHTS LINK CLASS
  // ========================================

  const accessRightsLinkClass = () => {
    const isAccessRightsPage =
      location.pathname === "/users/access-rights" ||
      /^\/users\/[^/]+\/access-rights$/.test(location.pathname);

    return `sidebar-link ${isAccessRightsPage ? "sidebar-link-active" : ""}`;
  };

  // ========================================
  // SAVE SIDEBAR SCROLL POSITION
  // ========================================

  const handleNavigation = () => {
    sessionStorage.setItem(
      "sidebarScrollTop",
      String(sidebarRef.current?.scrollTop || 0),
    );

    if (window.matchMedia("(max-width: 900px)").matches) {
      onClose?.();
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <aside ref={sidebarRef} className="sidebar">
      {/* ========================================
          BRAND
          ======================================== */}

      <div className="sidebar-brand">
        <div className="sidebar-logo">A</div>

        <div className="sidebar-brand-text">
          <strong>AMS</strong>
          <span>Asset Management</span>
        </div>

        {/* CLOSE SIDEBAR */}

        {onClose && (
          <button
            type="button"
            className="sidebar-close-button"
            onClick={onClose}
            aria-label="Hide sidebar"
          >
            ×
          </button>
        )}
      </div>

      {/* ========================================
          NAVIGATION
          ======================================== */}

      <nav className="sidebar-nav" onClick={handleNavigation}>
        {/* ========================================
            OVERVIEW
            ======================================== */}

        <div className="sidebar-section">
          <span className="sidebar-section-title">Overview</span>

          {/* DASHBOARD */}

          {hasPermission(user, "dashboard", "view") && (
            <NavLink to="/dashboard" className={navigationLinkClass}>
              <span className="sidebar-link-icon">▦</span>

              <span className="sidebar-link-text">Dashboard</span>
            </NavLink>
          )}
        </div>

        {/* ========================================
            CHECK-INS
            ======================================== */}

        <div className="sidebar-section">
          <span className="sidebar-section-title">Check-Ins</span>

          {/* CHECK-IN */}

          {hasPermission(user, "checkIns", "checkIn") && (
            <NavLink to="/check-ins" className={navigationLinkClass}>
              <span className="sidebar-link-icon">⏱</span>

              <span className="sidebar-link-text">Check-In</span>
            </NavLink>
          )}

          {/* MY CHECK-IN HISTORY */}

          {hasPermission(user, "checkIns", "history") && (
            <NavLink to="/check-ins/history" className={navigationLinkClass}>
              <span className="sidebar-link-icon">◷</span>

              <span className="sidebar-link-text">My Check-In History</span>
            </NavLink>
          )}
        </div>

        {/* ========================================
            ASSET MANAGEMENT
            ======================================== */}

        <div className="sidebar-section">
          <span className="sidebar-section-title">Asset Management</span>

          {/* ADD NEW ASSET */}

          {hasPermission(user, "assets", "add") && (
            <NavLink to="/assets/add" className={navigationLinkClass}>
              <span className="sidebar-link-icon">+</span>

              <span className="sidebar-link-text">Add New Asset</span>
            </NavLink>
          )}

          {/* ALL ASSETS */}

          {hasPermission(user, "assets", "view") && (
            <NavLink to="/assets" className={navigationLinkClass}>
              <span className="sidebar-link-icon">◈</span>

              <span className="sidebar-link-text">All Assets</span>
            </NavLink>
          )}

          {/* ASSET REQUEST */}

          {hasPermission(user, "assetRequests", "view") && (
            <NavLink to="/asset-requests" className={navigationLinkClass}>
              <span className="sidebar-link-icon">⊕</span>

              <span className="sidebar-link-text">Asset Request</span>
            </NavLink>
          )}

          {/* OUTLETS */}

          {hasPermission(user, "outlets", "view") && (
            <NavLink to="/outlets" className={navigationLinkClass}>
              <span className="sidebar-link-icon">⌖</span>

              <span className="sidebar-link-text">Outlets</span>
            </NavLink>
          )}

          {/* REPAIR REQUEST */}

          {hasPermission(user, "repairs", "create") && (
            <NavLink
              to="/assets/repair-request"
              className={navigationLinkClass}
            >
              <span className="sidebar-link-icon">🔧</span>

              <span className="sidebar-link-text">Repair Request</span>
            </NavLink>
          )}

          {/* VERIFICATION REQUEST */}

          {hasPermission(user, "verificationMapping", "submit") && (
            <NavLink
              to="/assets/verification-request"
              className={navigationLinkClass}
            >
              <span className="sidebar-link-icon">✓</span>

              <span className="sidebar-link-text">Verification Request</span>
            </NavLink>
          )}
        </div>

        {/* ========================================
            INCOMING REQUESTS
            SYSTEM / ADMIN SECTION
            ======================================== */}

        <div className="sidebar-section sidebar-admin-section">
          <span className="sidebar-section-title">Incoming Requests</span>

          {/* ========================================
              ASSET AUTHORIZATIONS
              ======================================== */}

          {hasPermission(user, "assetAuthorization", "view") && (
            <NavLink to="/asset-authorizations" className={navigationLinkClass}>
              <span className="sidebar-link-icon">✓</span>

              <span className="sidebar-link-text">Asset Authorizations</span>

              <span className="sidebar-request-count">
                {pendingCounts.authorizations}
              </span>
            </NavLink>
          )}

          {hasPermission(user, "assetRequests", "view") && (
            <NavLink
              to="/pending-asset-requests"
              className={navigationLinkClass}
            >
              <span className="sidebar-link-icon">⊕</span>

              <span className="sidebar-link-text">Pending Asset Requests</span>

              <span className="sidebar-request-count">
                {pendingCounts.assetRequests}
              </span>
            </NavLink>
          )}

          {/* ========================================
              REPAIR
              ADMIN INCOMING REQUEST
              ======================================== */}

          {hasPermission(user, "repairs", "view") && (
            <NavLink to="/repairs" className={navigationLinkClass}>
              <span className="sidebar-link-icon">🔧</span>

              <span className="sidebar-link-text">Repair</span>

              <span className="sidebar-request-count">
                {pendingCounts.repairs}
              </span>
            </NavLink>
          )}

          {/* ========================================
              VERIFICATION
              ======================================== */}

          {hasPermission(user, "verificationMapping", "view") && (
            <NavLink
              to="/verification-mappings"
              className={navigationLinkClass}
            >
              <span className="sidebar-link-icon">⟳</span>

              <span className="sidebar-link-text">Verification</span>

              <span className="sidebar-request-count">
                {pendingCounts.verifications}
              </span>
            </NavLink>
          )}
        </div>

        {/* ========================================
            OPERATIONS
            SYSTEM / ADMIN SECTION
            ======================================== */}

        <div className="sidebar-section sidebar-admin-section">
          <span className="sidebar-section-title">Operations</span>

          {/* ASSET ASSIGNMENT */}

          {hasPermission(user, "assetOperations", "assignment") && (
            <NavLink to="/assets/assign" className={navigationLinkClass}>
              <span className="sidebar-link-icon">↗</span>

              <span className="sidebar-link-text">Asset Assignment</span>
            </NavLink>
          )}

          {/* ASSET DISPOSAL */}

          {hasPermission(user, "assetOperations", "disposal") && (
            <NavLink to="/assets/disposal" className={navigationLinkClass}>
              <span className="sidebar-link-icon">⌫</span>

              <span className="sidebar-link-text">Asset Disposal</span>
            </NavLink>
          )}

          {/* ASSET RETURN */}

          {hasPermission(user, "assetOperations", "return") && (
            <NavLink to="/assets/return" className={navigationLinkClass}>
              <span className="sidebar-link-icon">↩</span>

              <span className="sidebar-link-text">Asset Return</span>
            </NavLink>
          )}

          {/* ASSET TRANSFER */}

          {hasPermission(user, "assetOperations", "transfer") && (
            <NavLink to="/assets/transfer" className={navigationLinkClass}>
              <span className="sidebar-link-icon">⇄</span>

              <span className="sidebar-link-text">Asset Transfer</span>
            </NavLink>
          )}

          {/* DISTRICTS */}

          {hasPermission(user, "districts", "view") && (
            <NavLink to="/districts" className={navigationLinkClass}>
              <span className="sidebar-link-icon">◌</span>

              <span className="sidebar-link-text">Districts</span>
            </NavLink>
          )}

          {/* DISTRIBUTORS */}

          {hasPermission(user, "distributors", "view") && (
            <NavLink to="/distributors" className={navigationLinkClass}>
              <span className="sidebar-link-icon">◇</span>

              <span className="sidebar-link-text">Distributors</span>
            </NavLink>
          )}

          {/* MANUFACTURERS */}

          {hasPermission(user, "manufacturers", "view") && (
            <NavLink to="/manufacturers" className={navigationLinkClass}>
              <span className="sidebar-link-icon">◇</span>

              <span className="sidebar-link-text">Manufacturers</span>
            </NavLink>
          )}

          {/* REGIONS */}

          {hasPermission(user, "regions", "view") && (
            <NavLink to="/regions" className={navigationLinkClass}>
              <span className="sidebar-link-icon">◎</span>

              <span className="sidebar-link-text">Regions</span>
            </NavLink>
          )}
        </div>

        {/* ========================================
            USER MANAGEMENT
            SYSTEM / ADMIN SECTION
            ======================================== */}

        <div className="sidebar-section sidebar-admin-section">
          <span className="sidebar-section-title">User Management</span>

          {/* ADD USER */}

          {user?.role === "SYSTEM_ADMIN" &&
            hasPermission(user, "users", "add") && (
              <NavLink to="/users/add" className={navigationLinkClass}>
                <span className="sidebar-link-icon">+</span>

                <span className="sidebar-link-text">Add User</span>
              </NavLink>
            )}

          {/* ALL CHECK-IN HISTORY */}

          {hasPermission(user, "checkIns", "allHistory") && (
            <NavLink to="/check-ins/all" className={navigationLinkClass}>
              <span className="sidebar-link-icon">≡</span>

              <span className="sidebar-link-text">All Check-In History</span>
            </NavLink>
          )}

          {/* USER ACCESS RIGHTS */}

          {hasPermission(user, "users", "update") && (
            <NavLink
              to="/users/access-rights"
              className={accessRightsLinkClass}
            >
              <span className="sidebar-link-icon">🔐</span>

              <span className="sidebar-link-text">User Access Rights</span>
            </NavLink>
          )}

          {/* USERS */}

          {hasPermission(user, "users", "view") && (
            <NavLink to="/users" className={navigationLinkClass}>
              <span className="sidebar-link-icon">◯</span>

              <span className="sidebar-link-text">Users</span>
            </NavLink>
          )}
        </div>
      </nav>

      {/* ========================================
          SIDEBAR FOOTER
          ======================================== */}

      <div className="sidebar-footer">
        <div className="sidebar-footer-status">
          <span className="sidebar-footer-dot" />

          <div>
            <strong>System Online</strong>

            <span>All services operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
