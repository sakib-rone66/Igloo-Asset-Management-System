const express = require("express");

const router = express.Router();

// ========================================
// CONTROLLERS
// ========================================

const {
  createAssetRequest,
  getMyAssetRequests,
  getPendingAssetRequests,
  getAllAssetRequests,
  updateAssetRequestStatus,
} = require("../controllers/assetRequestController");

// ========================================
// MIDDLEWARE
// ========================================

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ========================================
// CREATE ASSET REQUEST
// USER
//
// Permission: assetRequests.create
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("assetRequests", "create"),
  createAssetRequest,
);

// ========================================
// MY ASSET REQUESTS
// USER
//
// Permission: assetRequests.view
// ========================================

router.get(
  "/my",
  authMiddleware,
  permissionMiddleware("assetRequests", "view"),
  getMyAssetRequests,
);

// ========================================
// PENDING ASSET REQUESTS
// ADMIN ONLY
//
// Permission: assetRequests.view
// Role: SYSTEM_ADMIN
// ========================================

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("assetRequests", "view"),
  getPendingAssetRequests,
);

// ========================================
// ALL ASSET REQUESTS
// ADMIN ONLY
//
// Permission: assetRequests.view
// Role: SYSTEM_ADMIN
// ========================================

router.get(
  "/all",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("assetRequests", "view"),
  getAllAssetRequests,
);

// ========================================
// APPROVE / REJECT
// ADMIN ONLY
//
// Permission: assetRequests.approve
// Role: SYSTEM_ADMIN
//
// PATCH is the main endpoint.
//
// PUT is also supported so the previous
// implementation will not break.
// ========================================

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("assetRequests", "approve"),
  updateAssetRequestStatus,
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("assetRequests", "approve"),
  updateAssetRequestStatus,
);

// ========================================
// EXPORT
// ========================================

module.exports = router;
