const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const {
  disposeAsset,
  getDisposalByAsset,
} = require("../controllers/disposalController");

// ========================================
// DISPOSE ASSET
// Permission: assetOperations.disposal
// ========================================

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("assetOperations", "disposal"),
  disposeAsset
);

// ========================================
// GET DISPOSAL DETAILS
// Permission: assets.view
// ========================================

router.get(
  "/asset/:assetId",
  authMiddleware,
  permissionMiddleware("assets", "view"),
  getDisposalByAsset
);

// ========================================
// EXPORT
// ========================================

module.exports = router;