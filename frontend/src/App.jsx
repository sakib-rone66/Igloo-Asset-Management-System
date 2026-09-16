import { useEffect } from "react";

// Import React Router components
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// ========================================
// PAGES
// ========================================

// Authentication
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Dashboard / Profile
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

// ========================================
// ASSET MANAGEMENT
// ========================================

import Assets from "./pages/Assets";
import AddAsset from "./pages/AddAsset";
import AssetAuthorization from "./pages/AssetAuthorization";
import AssetDetails from "./pages/AssetDetails";
import AssetHistory from "./pages/AssetHistory";

// USER ASSET REQUEST
import AssetRequests from "./pages/AssetRequests";

// ADMIN ASSET REQUEST
import PendingAssetRequests from "./pages/PendingAssetRequests";

// ========================================
// ASSET RELATED PAGES
// ========================================

import AssetQR from "./pages/AssetQR";
import ScanAsset from "./pages/ScanAsset";
import AssetAssignment from "./pages/AssetAssignment";
import AssetTransfer from "./pages/AssetTransfer";
import AssetReturn from "./pages/AssetReturn";
import AssetDisposal from "./pages/AssetDisposal";

// ========================================
// ASSET REPAIR
// ========================================

import RepairRequest from "./pages/RepairRequest";
import Repair from "./pages/Repair";

// ========================================
// VERIFICATION MAPPING
// ========================================

import VerificationMapping from "./pages/VerificationMapping";
import VerificationMappingAdmin from "./pages/VerificationMappingAdmin";
import VerificationHistory from "./pages/VerificationHistory";

// ========================================
// CHECK-IN
// ========================================

import CheckIn from "./pages/CheckIn";
import CheckInHistory from "./pages/CheckInHistory";
import AllCheckInHistory from "./pages/AllCheckInHistory";
import OutletCheckInDetails from "./pages/OutletCheckInDetails";

// ========================================
// REGIONS / DISTRICTS / DISTRIBUTORS /
// MANUFACTURERS / OUTLETS
// ========================================

import Regions from "./pages/Regions";
import Districts from "./pages/Districts";
import Distributors from "./pages/Distributors";
import Manufacturer from "./pages/Manufacturer";
import Outlets from "./pages/Outlets";
import AddExistingAsset from "./pages/AddExistingAsset";

// ========================================
// USER MANAGEMENT
// ========================================

import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import UserAccessRights from "./pages/UserAccessRights";

// ========================================
// PERMISSION PROTECTED ROUTE
// ========================================

import PermissionProtectedRoute from "./components/PermissionProtectedRoute";

// ========================================
// SCROLL TO TOP
// ========================================

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname, search, hash]);

  return null;
}

// ========================================
// APP
// ========================================

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* =====================================================
            AUTHENTICATION
            ===================================================== */}

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* FORGOT PASSWORD */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* RESET PASSWORD */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* =====================================================
            PROFILE
            ===================================================== */}

        {/* MY PROFILE */}
        <Route path="/profile" element={<Profile />} />

        {/* CHANGE PASSWORD */}
        <Route path="/change-password" element={<ChangePassword />} />

        {/* =====================================================
            DASHBOARD
            ===================================================== */}

        <Route
          path="/dashboard"
          element={
            <PermissionProtectedRoute group="dashboard" permission="view">
              <Dashboard />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            ASSETS
            ===================================================== */}

        {/* ALL ASSETS */}
        <Route
          path="/assets"
          element={
            <PermissionProtectedRoute group="assets" permission="view">
              <Assets />
            </PermissionProtectedRoute>
          }
        />

        {/* ADD NEW ASSET */}
        <Route
          path="/assets/add"
          element={
            <PermissionProtectedRoute group="assets" permission="add">
              <AddAsset />
            </PermissionProtectedRoute>
          }
        />

        {/* ASSET AUTHORIZATION */}
        <Route
          path="/asset-authorizations"
          element={
            <PermissionProtectedRoute
              group="assetAuthorization"
              permission="view"
            >
              <AssetAuthorization />
            </PermissionProtectedRoute>
          }
        />

        {/* ALL ASSET HISTORY */}
        <Route
          path="/assets/history"
          element={
            <PermissionProtectedRoute group="assets" permission="view">
              <AssetHistory />
            </PermissionProtectedRoute>
          }
        />

        {/* INDIVIDUAL ASSET HISTORY */}
        <Route
          path="/assets/:id/history"
          element={
            <PermissionProtectedRoute group="assets" permission="view">
              <AssetHistory />
            </PermissionProtectedRoute>
          }
        />

        {/* ASSET DETAILS */}
        <Route
          path="/assets/:id"
          element={
            <PermissionProtectedRoute group="assets" permission="view">
              <AssetDetails />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            USER ASSET REQUEST
            =====================================================

            Sidebar:
            Asset Management
                └── Asset Request

            URL:
            /asset-requests

            Purpose:
            Normal authenticated users can:
            - Create asset requests
            - View their own asset requests
        */}

        <Route
          path="/asset-requests"
          element={
            <PermissionProtectedRoute group="assetRequests" permission="view">
              <AssetRequests />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            ADMIN PENDING ASSET REQUESTS
            =====================================================

            Sidebar:
            Incoming Requests
                └── Pending Asset Requests

            URL:
            /pending-asset-requests

            Purpose:
            Admin/System Admin can:
            - See pending requests
            - Approve requests
            - Reject requests
            - See all asset request history
        */}

        <Route
          path="/pending-asset-requests"
          element={
            <PermissionProtectedRoute group="assetRequests" permission="view">
              <PendingAssetRequests />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            ASSET QR
            ===================================================== */}

        <Route
          path="/assets/:id/qr"
          element={
            <PermissionProtectedRoute group="assets" permission="view">
              <AssetQR />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            PUBLIC QR SCAN
            ===================================================== */}

        <Route path="/scan/asset/:id" element={<ScanAsset />} />

        {/* =====================================================
            ASSET OPERATIONS
            ===================================================== */}

        {/* ASSET ASSIGNMENT */}
        <Route
          path="/assets/assign"
          element={
            <PermissionProtectedRoute
              group="assetOperations"
              permission="assignment"
            >
              <AssetAssignment />
            </PermissionProtectedRoute>
          }
        />

        {/* ASSET TRANSFER */}
        <Route
          path="/assets/transfer"
          element={
            <PermissionProtectedRoute
              group="assetOperations"
              permission="transfer"
            >
              <AssetTransfer />
            </PermissionProtectedRoute>
          }
        />

        {/* ASSET RETURN */}
        <Route
          path="/assets/return"
          element={
            <PermissionProtectedRoute
              group="assetOperations"
              permission="return"
            >
              <AssetReturn />
            </PermissionProtectedRoute>
          }
        />

        {/* ASSET DISPOSAL */}
        <Route
          path="/assets/disposal"
          element={
            <PermissionProtectedRoute
              group="assetOperations"
              permission="disposal"
            >
              <AssetDisposal />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            ASSET REPAIR
            ===================================================== */}

        {/* TECHNICIAN - REPAIR REQUEST */}
        <Route
          path="/assets/repair-request"
          element={
            <PermissionProtectedRoute group="repairs" permission="create">
              <RepairRequest />
            </PermissionProtectedRoute>
          }
        />

        {/* ADMIN - REPAIR */}
        <Route
          path="/repairs"
          element={
            <PermissionProtectedRoute group="repairs" permission="view">
              <Repair />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            VERIFICATION MAPPING
            ===================================================== */}

        {/* USER VERIFICATION REQUEST */}
        <Route
          path="/assets/verification-request"
          element={
            <PermissionProtectedRoute
              group="verificationMapping"
              permission="submit"
            >
              <VerificationMapping />
            </PermissionProtectedRoute>
          }
        />

        {/* OLD / ALTERNATIVE VERIFICATION URL */}
        <Route
          path="/assets/verification"
          element={
            <PermissionProtectedRoute
              group="verificationMapping"
              permission="submit"
            >
              <VerificationMapping />
            </PermissionProtectedRoute>
          }
        />

        {/* ADMIN VERIFICATION */}
        <Route
          path="/verification-mappings"
          element={
            <PermissionProtectedRoute
              group="verificationMapping"
              permission="view"
            >
              <VerificationMappingAdmin />
            </PermissionProtectedRoute>
          }
        />

        {/* VERIFICATION HISTORY */}
        <Route
          path="/verification-mappings/history"
          element={
            <PermissionProtectedRoute
              group="verificationMapping"
              permission="history"
            >
              <VerificationHistory />
            </PermissionProtectedRoute>
          }
        />

        {/* ASSET VERIFICATION HISTORY */}
        <Route
          path="/assets/:id/verification-history"
          element={
            <PermissionProtectedRoute
              group="verificationMapping"
              permission="history"
            >
              <VerificationHistory />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            CHECK-IN
            ===================================================== */}

        {/* CREATE CHECK-IN */}
        <Route
          path="/check-ins"
          element={
            <PermissionProtectedRoute group="checkIns" permission="checkIn">
              <CheckIn />
            </PermissionProtectedRoute>
          }
        />

        {/* MY CHECK-IN HISTORY */}
        <Route
          path="/check-ins/history"
          element={
            <PermissionProtectedRoute group="checkIns" permission="history">
              <CheckInHistory />
            </PermissionProtectedRoute>
          }
        />

        {/* ALL CHECK-IN HISTORY */}
        <Route
          path="/check-ins/all"
          element={
            <PermissionProtectedRoute group="checkIns" permission="allHistory">
              <AllCheckInHistory />
            </PermissionProtectedRoute>
          }
        />

        {/* OUTLET CHECK-IN DETAILS */}
        <Route
          path="/check-ins/outlet/:outletId"
          element={
            <PermissionProtectedRoute group="checkIns" permission="checkIn">
              <OutletCheckInDetails />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            REGIONS
            ===================================================== */}

        <Route
          path="/regions"
          element={
            <PermissionProtectedRoute group="regions" permission="view">
              <Regions />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            DISTRICTS
            ===================================================== */}

        <Route
          path="/districts"
          element={
            <PermissionProtectedRoute group="districts" permission="view">
              <Districts />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            DISTRIBUTORS
            ===================================================== */}

        <Route
          path="/distributors"
          element={
            <PermissionProtectedRoute group="distributors" permission="view">
              <Distributors />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            MANUFACTURERS
            ===================================================== */}

        <Route
          path="/manufacturers"
          element={
            <PermissionProtectedRoute group="manufacturers" permission="view">
              <Manufacturer />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            OUTLETS
            ===================================================== */}

        <Route
          path="/outlets"
          element={
            <PermissionProtectedRoute group="outlets" permission="view">
              <Outlets />
            </PermissionProtectedRoute>
          }
        />

        {/* ADD EXISTING ASSET TO OUTLET */}
        <Route
          path="/outlets/:outletId/add-existing-asset"
          element={
            <PermissionProtectedRoute group="assets" permission="addExisting">
              <AddExistingAsset />
            </PermissionProtectedRoute>
          }
        />

        {/* =====================================================
            USER MANAGEMENT
            ===================================================== */}

        {/* ALL USERS */}
        <Route
          path="/users"
          element={
            <PermissionProtectedRoute group="users" permission="view">
              <Users />
            </PermissionProtectedRoute>
          }
        />

        {/* USER ACCESS RIGHTS LIST */}
        <Route
          path="/users/access-rights"
          element={
            <PermissionProtectedRoute group="users" permission="view">
              <Users />
            </PermissionProtectedRoute>
          }
        />

        {/* ADD USER */}
        <Route
          path="/users/add"
          element={
            <PermissionProtectedRoute group="users" permission="add">
              <AddUser />
            </PermissionProtectedRoute>
          }
        />

        {/* USER PROFILE */}
        <Route
          path="/users/:userId"
          element={
            <PermissionProtectedRoute group="users" permission="view">
              <Profile />
            </PermissionProtectedRoute>
          }
        />

        {/* USER ACCESS RIGHTS */}
        <Route
          path="/users/:userId/access-rights"
          element={
            <PermissionProtectedRoute group="users" permission="update">
              <UserAccessRights />
            </PermissionProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
