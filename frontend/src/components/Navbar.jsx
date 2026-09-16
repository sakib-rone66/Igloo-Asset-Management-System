import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import api from "../services/api";
import { getStoredUser } from "../utils/storage";

import "./Navbar.css";

function Navbar() {
  // ========================================
  // GET LOGGED-IN USER
  // ========================================
  const user = getStoredUser();

  // ========================================
  // USER MENU
  // ========================================
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!showUserMenu) return undefined;

    const closeOnOutsideTap = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideTap);

    return () => document.removeEventListener("pointerdown", closeOnOutsideTap);
  }, [showUserMenu]);

  // ========================================
  // LOGOUT
  // ========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // ========================================
  // USER INITIAL
  // ========================================
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  // ========================================
  // PROFILE PICTURE
  // ========================================
  const profilePicture = user?.profilePicture || "";

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    const baseUrl = api.defaults.baseURL?.replace("/api", "") || "";
    const normalizedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

    return `${baseUrl}${normalizedPath}`;
  };

  // 👇 get current path
  const location = useLocation();
  const path = location.pathname;

  // Map paths to friendly names
  const routeNames = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/profile": "My Profile",
    "/change-password": "Change Password",
    "/forgot-password": "Forgot Password",

    "/assets": "All Assets",
    "/assets/add": "Register Asset",
    "/asset-authorizations": "Asset Authorization",
    "/assets/history": "Asset History",
    "/assets/assign": "Asset Assignment",
    "/assets/transfer": "Transfer Asset",
    "/assets/return": "Return Asset",
    "/assets/disposal": "Dispose Asset",
    "/repairs": "Asset Repair",
    "/assets/verification-request": "Verification Request",
    "/verification-mappings": "Pending Verification Requests",
    "/verification-mappings/history": "Verification History",

    "/check-ins": "Check-In",
    "/check-ins/history": "Check-In History",
    "/check-ins/all": "All Users Check-In History",

    "/regions": "Region Management",
    "/districts": "District Management",
    "/distributors": "Distributor Management",
    "/manufacturers": "Manufacturer Management",
    "/outlets": "Outlet Management",
    "/add-existing-asset": "Register Existing Asset",

    "/users": "User Management",
    "/users/add": "Add New User",
  };

  // Default lookup
  let currentPage = routeNames[path];

  // Handle dynamic asset routes
  if (!currentPage) {
    if (/^\/assets\/[^/]+\/history$/.test(path)) {
      currentPage = "Asset History";
    } else if (/^\/assets\/[^/]+\/qr$/.test(path)) {
      currentPage = "Asset QR Code";
    } else if (/^\/scan\/asset\/[^/]+$/.test(path)) {
      currentPage = "Scan Asset";
    } else if (/^\/assets\/[^/]+\/verification-history$/.test(path)) {
      currentPage = "Verification History";
    } else if (/^\/assets\/[^/]+$/.test(path)) {
      currentPage = "Repair Request";
    } else if (/^\/users\/[^/]+\/access-rights$/.test(path)) {
      currentPage = "Access Rights";
    } else if (/^\/outlets\/[^/]+\/add-existing-asset$/.test(path)) {
      currentPage = "Register Existing Asset";
    }
  }

  return (
    <header className="navbar">
      {/* ========================================
          LEFT SIDE
          ======================================== */}
      <div className="navbar-left">
        <div className="navbar-title-group">
          <span className="navbar-title">Asset Management</span>
          <span className="navbar-title-divider">/</span>
          <span className="navbar-current">{currentPage || "Unknown"}</span>
        </div>
      </div>

      {/* ========================================
          RIGHT SIDE
          ======================================== */}
      <div className="navbar-right">
        {/* SYSTEM STATUS */}
        <div className="navbar-system-status">
          <span className="navbar-status-dot" />
          <span>System Online</span>
        </div>

        <div className="navbar-divider" />

        {/* USER */}
        <div ref={userMenuRef} className="navbar-user-wrapper">
          <button
            type="button"
            className="navbar-user-button"
            onClick={() => setShowUserMenu((current) => !current)}
          >
            {profilePicture ? (
              <img
                src={getProfileImageUrl(profilePicture)}
                alt={user?.name || "User"}
                className="navbar-avatar navbar-avatar-image"
              />
            ) : (
              <span className="navbar-avatar">{userInitial}</span>
            )}

            <span className="navbar-user-info">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.role || "Unknown Role"}</span>
            </span>

            <span
              className={`navbar-chevron ${
                showUserMenu ? "navbar-chevron-open" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {showUserMenu && (
            <div className="navbar-user-menu">
              <div className="navbar-menu-user">
                {profilePicture ? (
                  <img
                    src={getProfileImageUrl(profilePicture)}
                    alt={user?.name || "User"}
                    className="navbar-menu-avatar navbar-menu-avatar-image"
                  />
                ) : (
                  <span className="navbar-menu-avatar">{userInitial}</span>
                )}
                <div>
                  <strong>{user?.name || "User"}</strong>
                  <span>{user?.email || ""}</span>
                </div>
              </div>

              <div className="navbar-menu-divider" />

              <Link
                to="/profile"
                className="navbar-menu-item"
                onClick={() => setShowUserMenu(false)}
              >
                <span>◉</span>
                Profile
              </Link>

              <Link
                to="/dashboard"
                className="navbar-menu-item"
                onClick={() => setShowUserMenu(false)}
              >
                <span>▦</span>
                Dashboard
              </Link>

              <button
                type="button"
                className="navbar-menu-item navbar-logout-item"
                onClick={handleLogout}
              >
                <span>↪</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
