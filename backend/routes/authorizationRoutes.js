const express = require("express");

const router = express.Router();

// ========================================
// CONTROLLERS
// ========================================

const {
  createAuthorization,
  createExistingAssetAuthorization,
  getAuthorizations,
  getMyAuthorizations,
  getAuthorizationById,
  updateAuthorizationDecision,
} = require("../controllers/authorizationController");

// ========================================
// MIDDLEWARE
// ========================================

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ========================================
// NEW ASSET AUTHORIZATION
//
// Permission: assetAuthorization.view
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("assets", "add"),
  createAuthorization,
);

// ========================================
// EXISTING ASSET AUTHORIZATION
//
// Permission: assets.addExisting
// ========================================

router.post(
  "/existing",
  authMiddleware,
  permissionMiddleware("assets", "addExisting"),
  createExistingAssetAuthorization,
);

// ========================================
// GET ALL AUTHORIZATIONS
//
// Permission: assetAuthorization.view
// ========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("assetAuthorization", "view"),
  getAuthorizations,
);

router.get(
  "/my",
  authMiddleware,
  permissionMiddleware("assets", "add"),
  getMyAuthorizations,
);

// ========================================
// GET ONE AUTHORIZATION
//
// Permission: assetAuthorization.view
// ========================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("assetAuthorization", "view"),
  getAuthorizationById,
);

// ========================================
// APPROVE / REJECT AUTHORIZATION
//
// Permission: assetAuthorization.approve
// ========================================

router.patch(
  "/:id/decision",
  authMiddleware,
  roleMiddleware("SYSTEM_ADMIN", "TSM", "TSO"),
  permissionMiddleware("assetAuthorization", "approve"),
  updateAuthorizationDecision,
);

// ========================================
// EXPORT
// ========================================

module.exports = router;
