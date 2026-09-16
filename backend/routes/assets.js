const express = require("express");

const router = express.Router();

// ========================================
// IMPORT CONTROLLERS
// ========================================

const {
  createAsset,
  getAssets,
  getAssetById,
  getAssetByAIN,
  assignAssetToOutlet,
  transferAsset,
  returnAssetToWarehouse,
  generateAssetQRCode,
  activateAsset,
  getPublicAssetByQR,
} = require("../controllers/assetController");

// ========================================
// IMPORT MIDDLEWARE
// ========================================

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

// ========================================
// PUBLIC ASSET QR SCAN
// NO LOGIN REQUIRED
// ========================================

router.get("/public/qr/:id", getPublicAssetByQR);

// ========================================
// CREATE ASSET
// Permission: assets.add
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("assets", "add"),
  createAsset,
);

// ========================================
// GET ALL ASSETS
// Permission: assets.view
// ========================================

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("assets", "view"),
  getAssets,
);

// ========================================
// GET ONE ASSET
// Permission: assets.view
// ========================================

router.get(
  "/ain/:ain",
  authMiddleware,
  permissionMiddleware("assets", "view"),
  getAssetByAIN,
);

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("assets", "view"),
  getAssetById,
);

// ========================================
// ASSIGN ASSET TO OUTLET
// Permission: assetOperations.assignment
// ========================================

router.put(
  "/:id/assign",
  authMiddleware,
  permissionMiddleware("assetOperations", "assignment"),
  assignAssetToOutlet,
);

// ========================================
// TRANSFER ASSET
// Permission: assetOperations.transfer
// ========================================

router.put(
  "/:id/transfer",
  authMiddleware,
  permissionMiddleware("assetOperations", "transfer"),
  transferAsset,
);

// ========================================
// RETURN ASSET TO WAREHOUSE
// Permission: assetOperations.return
// ========================================

router.put(
  "/:id/return",
  authMiddleware,
  permissionMiddleware("assetOperations", "return"),
  returnAssetToWarehouse,
);

// ========================================
// GENERATE ASSET QR CODE
//
// Permission: assets.view
// ========================================

router.get(
  "/:id/qr",
  authMiddleware,
  permissionMiddleware("assets", "view"),
  generateAssetQRCode,
);

// ========================================
// ACTIVATE ASSET
//
// Permission: assetAuthorization.approve
// ========================================

router.put(
  "/:id/activate",
  authMiddleware,
  permissionMiddleware("assetAuthorization", "approve"),
  activateAsset,
);

// ========================================
// EXPORT
// ========================================

module.exports = router;
