import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import api from "../services/api";
import { hasPermission } from "../utils/permission";

// ========================================
// PERMISSION PROTECTED ROUTE
// ========================================
//
// Protects frontend routes based on the
// permissions assigned by System Admin.
//
// System Admin:
// - Always allowed.
//
// Other users:
// - Allowed only when the required
//   permission is true.
//
// ========================================

const PermissionProtectedRoute = ({ group, permission, children }) => {
  // ========================================
  // CURRENT LOCATION
  // ========================================

  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const refreshUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");

        if (!storedUser) {
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }

          return;
        }

        try {
          const response = await api.get("/users/me");

          const freshUser = {
            ...storedUser,
            ...response.data.user,
            permissions:
              response.data.user?.permissions || storedUser.permissions || {},
          };

          localStorage.setItem("user", JSON.stringify(freshUser));

          if (isMounted) {
            setUser(freshUser);
            setLoading(false);
          }

          return;
        } catch (error) {
          console.warn(
            "Unable to refresh user permissions:",
            error.response?.data || error.message,
          );
        }

        if (isMounted) {
          setUser(storedUser);
          setLoading(false);
        }
      } catch (error) {
        console.error("Unable to read logged-in user:", error);

        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    refreshUser();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4b5563",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        Loading access...
      </div>
    );
  }

  // ========================================
  // AUTHENTICATION CHECK
  // ========================================

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ========================================
  // PERMISSION CHECK
  // ========================================

  const allowed = hasPermission(user, group, permission);

  // ========================================
  // ACCESS DENIED
  // ========================================

  if (!allowed) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            width: "100%",
            background: "#fff",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(17, 24, 39, 0.06)",
            padding: "28px 24px",
            color: "#991b1b",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "30px",
              marginBottom: "12px",
            }}
            aria-hidden="true"
          >
            ⚠️
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "28px",
              color: "#111827",
            }}
          >
            Access denied
          </h2>

          <p
            style={{
              margin: "0 0 22px",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#374151",
            }}
          >
            You do not have permission to perform this action.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              border: "1px solid #dc2626",
              background: "#dc2626",
              color: "#fff",
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // ACCESS GRANTED
  // ========================================

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default PermissionProtectedRoute;
